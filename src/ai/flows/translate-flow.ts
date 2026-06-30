'use server';
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from 'genkitx-openai';
import db from '@/lib/db';

const TranslateInputSchema = z.object({
  text: z.string(),
  targetLangs: z.array(z.string()),
  taskType: z.enum(['spec', 'rich-text', 'text', 'json-map']).optional().default('text'),
  providerId: z.string().optional(),
});

export type TranslateInput = z.infer<typeof TranslateInputSchema>;

interface Footnote {
  id: string;
  type: 'ordered' | 'unordered';
  raw: string;
  translated?: string;
}

export async function translateContent(input: TranslateInput): Promise<any> {
  const isJsonInput = input.taskType === 'spec' || input.taskType === 'rich-text' || input.taskType === 'json-map' || (input.text.trim().startsWith('{') && input.text.trim().endsWith('}'));

  // 1. 抽取脚注，使用标准学术占位符 [fn0] 等
  const footnotes: Footnote[] = [];
  const processedText = extractFootnotes(input.text, isJsonInput, footnotes);
  const hasFootnotes = footnotes.length > 0;

  const aiSettingsDoc = await db.setting.findUnique({ where: { id: 'ai' } });
  if (!aiSettingsDoc) throw new Error('AI 配置未初始化');
  const config = JSON.parse(aiSettingsDoc.value as string);

  const basePersona = config.systemInstruction || "You are a professional translator.";

  const allProviders = config.providers || [];
  let targetProviders = [];

  if (input.providerId) {
    const p = allProviders.find((p: any) => p.id === input.providerId && p.isActive);
    if (!p) throw new Error(`节点 ${input.providerId} 不可用`);
    targetProviders = [p];
  } else {
    targetProviders = allProviders
      .filter((p: any) => p.isActive && p.type !== 'browser-local')
      .sort((a: any, b: any) => (a.isPrimary ? -1 : 1));
  }

  if (targetProviders.length === 0) throw new Error('无可用节点');

  const langMap: Record<string, string> = {
    'en': 'English', 'zh': 'Chinese (Simplified)', 'jp': 'Japanese',
    'kr': 'Korean', 'ru': 'Russian', 'de': 'German', 'fr': 'French', 
    'es': 'Spanish', 'id': 'Indonesian', 'th': 'Thai', 'vi': 'Vietnamese'
  };
  const targetLang = input.targetLangs[0].toLowerCase();
  const targetLangName = langMap[targetLang] || targetLang.toUpperCase();
  const isJsonTask = input.taskType === 'spec' || input.taskType === 'rich-text' || input.taskType === 'json-map';

  let lastError: any = null;
  for (const providerInfo of targetProviders) {
    try {
      console.log(`🤖 [AI-Flow] 使用节点: ${providerInfo.name}, 包含脚注数: ${footnotes.length}`);

      // 独立翻译提取出来的所有脚注
      if (hasFootnotes) {
        await Promise.all(
          footnotes.map(async (fn) => {
            fn.translated = await translateSingleString(fn.raw, targetLangName, providerInfo);
          })
        );
      }

      let translatedText = '';

      // --- 分支一：针对自定义 OpenAI 兼容节点 (Local)，直接使用 HTTP 代理 ---
      if (providerInfo.type !== 'google') {
        const systemPrompt = `You are a professional translator. 
Rules:
1. Translate to ${targetLangName}. 
2. NO explanation, NO markdown, NO prefix. 
3. Preserve all \\n and format EXACTLY. 
4. Keep the same number of lines as the source text.
5. Return ONLY the translation, do NOT repeat the original text.
6. Do NOT translate or modify placeholder tags like [fn0], [fn1], [fn2] etc. Keep them exactly as they are.${isJsonTask ? '\n7. If JSON, keep keys, translate values only.' : ''}`;

        const userPrompt = isJsonTask 
          ? `SOURCE_JSON:\n${processedText}\n\nTRANSLATED_JSON_IN_${targetLangName.toUpperCase()}:`
          : `SOURCE_TEXT:\n${processedText}\n\nTRANSLATION_IN_${targetLangName.toUpperCase()}_ONLY:`;

        const proxyRes = await fetch(`${providerInfo.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${providerInfo.apiKey || 'no-key'}`
          },
          body: JSON.stringify({
            model: providerInfo.model,
            messages: [
              { role: 'system', content: systemPrompt }, 
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.1,
            ...(isJsonTask ? { response_format: { type: "json_object" } } : {})
          })
        });

        if (!proxyRes.ok) throw new Error(`Model Node Error: ${proxyRes.status}`);
        const data = await proxyRes.json();
        const fullText = data.choices?.[0]?.message?.content || '';
        translatedText = robustExtract(fullText, processedText, targetLang);
      } else {
        // --- 分支二：针对 Google AI 标准节点 (Cloud)，使用 Genkit 框架 ---
        const activeAi = genkit({
          plugins: [googleAI({ apiKey: providerInfo.apiKey })]
        });

        const finalModel = `googleai/${providerInfo.model.split('/').pop() || providerInfo.model}`;

        const systemPrompt = `You are a professional translator. 
        Rules:
        1. Translate to ${targetLangName}. 
        2. NO explanation, NO markdown, NO prefix. 
        3. Preserve all \\n and format exactly.
        4. Return ONLY the translation, do NOT repeat the original text.
        5. Do NOT translate or modify placeholder tags like [fn0], [fn1], [fn2] etc. Keep them exactly as they are.${isJsonTask ? '\n6. If JSON, keep keys, translate values only.' : ''}`;

        const userPrompt = isJsonTask 
          ? `SOURCE_JSON:\n${processedText}\n\nTRANSLATED_JSON_IN_${targetLangName.toUpperCase()}:`
          : `SOURCE_TEXT:\n${processedText}\n\nTRANSLATION_IN_${targetLangName.toUpperCase()}_ONLY:`;

        const response = await activeAi.generate({
          model: finalModel as any,
          config: { temperature: 0.1, maxOutputTokens: 4096 },
          messages: [
            { role: 'system', content: [{ text: systemPrompt }] }, 
            { role: 'user', content: [{ text: userPrompt }] }
          ],
          output: isJsonTask ? { schema: z.record(z.string()) } : undefined
        });

        let finalVal = response.output;
        if (!finalVal) {
          translatedText = response.text || '';
        } else {
          translatedText = typeof finalVal === 'object' ? JSON.stringify(finalVal) : String(finalVal);
        }
      }

      // 还原脚注到主译文中
      let finalVal = translatedText;
      if (hasFootnotes) {
        finalVal = restoreFootnotes(translatedText, isJsonInput, footnotes);
      }

      return { [targetLang]: finalVal };
    } catch (error: any) {
      lastError = error;
      console.warn(`[Node-Error] ${providerInfo.name}:`, error.message);
    }
  }
  throw lastError;
}

// 辅助方法：翻译单个脚注字符串
async function translateSingleString(text: string, targetLangName: string, providerInfo: any): Promise<string> {
  try {
    const systemPrompt = `You are a professional translator. Translate to ${targetLangName}. Return ONLY the translation. NO markdown, NO explanation.`;
    const userPrompt = `Translate this string:\n${text}`;
    
    if (providerInfo.type !== 'google') {
      const res = await fetch(`${providerInfo.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerInfo.apiKey || 'no-key'}`
        },
        body: JSON.stringify({
          model: providerInfo.model,
          messages: [
            { role: 'system', content: systemPrompt }, 
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1
        })
      });
      if (!res.ok) return text;
      const data = await res.json();
      return (data.choices?.[0]?.message?.content || text).trim();
    } else {
      const activeAi = genkit({
        plugins: [googleAI({ apiKey: providerInfo.apiKey })]
      });
      const finalModel = `googleai/${providerInfo.model.split('/').pop() || providerInfo.model}`;
      const response = await activeAi.generate({
        model: finalModel as any,
        config: { temperature: 0.1 },
        messages: [
          { role: 'system', content: [{ text: systemPrompt }] }, 
          { role: 'user', content: [{ text: userPrompt }] }
        ]
      });
      return (response.text || text).trim();
    }
  } catch (e) {
    console.warn('[AI-Flow] Translate footnote failed, fallback to original:', e);
    return text;
  }
}

// 提取 Payload 中的所有脚注
function extractFootnotes(text: string, isJson: boolean, footnotes: Footnote[]): string {
  let counter = 0;

  const extractFromStr = (str: string): string => {
    if (!str) return '';
    
    // 匹配 [[...]]
    let res = str.replace(/\[\[([\s\S]*?)\]\]/g, (match, content) => {
      const id = `[fn${counter++}]`;
      footnotes.push({ id, type: 'ordered', raw: content.trim() });
      return id;
    });

    // 匹配 {{...}}
    res = res.replace(/\{\{([\s\S]*?)\}\}/g, (match, content) => {
      const id = `[fn${counter++}]`;
      footnotes.push({ id, type: 'unordered', raw: content.trim() });
      return id;
    });

    return res;
  };

  if (isJson) {
    try {
      const data = JSON.parse(text);
      const traverse = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return obj;
        const processed = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            (processed as any)[key] = extractFromStr(obj[key]);
          } else {
            (processed as any)[key] = traverse(obj[key]);
          }
        }
        return processed;
      };
      return JSON.stringify(traverse(data));
    } catch (e) {
      return extractFromStr(text);
    }
  }

  return extractFromStr(text);
}

// 还原 Payload 中的所有脚注
function restoreFootnotes(text: string, isJson: boolean, footnotes: Footnote[]): string {
  const restoreToStr = (str: string): string => {
    if (!str) return '';
    let res = str;
    
    // 容忍大模型在还原时可能输出 [ fn0 ] 或 [Fn0] 或 [fn 0] 等微小排版差异
    for (const fn of footnotes) {
      const num = fn.id.replace(/\D/g, '');
      const regexPattern = `\\[\\s*[fF][nN]\\s*${num}\\s*\\]`;
      const regex = new RegExp(regexPattern, 'g');
      
      const tag = fn.type === 'ordered' 
        ? `[[${fn.translated || fn.raw}]]` 
        : `{{${fn.translated || fn.raw}}}`;
        
      res = res.replace(regex, tag);
    }

    // 清理一下括号前后排版多出的空格
    return res
      .replace(/\s*\[\[\s*/g, ' [[')
      .replace(/\s*\]\]\s*/g, ']] ')
      .replace(/\s*\{\{\s*/g, ' {{')
      .replace(/\s*\}\}\s*/g, '}} ')
      .trim();
  };

  if (isJson) {
    try {
      const data = JSON.parse(text);
      const traverse = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return obj;
        const processed = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            (processed as any)[key] = restoreToStr(obj[key]);
          } else {
            (processed as any)[key] = traverse(obj[key]);
          }
        }
        return processed;
      };
      return JSON.stringify(traverse(data));
    } catch (e) {
      return restoreToStr(text);
    }
  }

  return restoreToStr(text);
}

function robustExtract(raw: string, sourceText?: string, targetLang?: string) {
  const matches = raw.match(/\{[\s\S]*\}/g);
  if (matches) {
    const longest = matches.reduce((a, b) => a.length > b.length ? a : b);
    try {
      return JSON.parse(longest);
    } catch (e) { }
  }

  let cleaned = raw
    .replace(/\*\*/g, '')
    .replace(/^(Translation|Result|Translated|Output|Response|译文|结果)[:：]\s*/i, '')
    .replace(/^Here is the translation[:：]?\s*/i, '')
    .replace(/^This is translated to [\w\s]+[:：]?\s*/i, '')
    .trim();

  const hasParenthesesInSource = sourceText && (sourceText.includes('(') || sourceText.includes('\uff08'));
  if (targetLang && targetLang.toLowerCase() !== 'en' && !hasParenthesesInSource) {
    cleaned = cleaned.replace(/\s*[\(\uff08]\s*[a-zA-Z0-9\s\-_.,;:!?'"&/]+\s*[\)\uff09]\s*$/g, '');
  }

  return cleaned;
}
