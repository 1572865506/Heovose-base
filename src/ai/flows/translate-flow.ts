'use server';
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from 'genkitx-openai';
import db from '@/lib/db';

const TranslateInputSchema = z.object({
  text: z.string(),
  targetLangs: z.array(z.string()),
  taskType: z.enum(['spec', 'rich-text', 'text']).optional().default('text'),
  providerId: z.string().optional(),
});

export type TranslateInput = z.infer<typeof TranslateInputSchema>;

export async function translateContent(input: TranslateInput): Promise<any> {
  const aiSettingsDoc = await db.setting.findUnique({ where: { id: 'ai' } });
  if (!aiSettingsDoc) throw new Error('AI 配置未初始化');
  const config = JSON.parse(aiSettingsDoc.value as string);

  // 1. 强化版人设融合与格式指令
  const basePersona = config.systemInstruction || "You are a professional translator.";

  const finalSystemPrompt = `
${basePersona}

### 🚨 CRITICAL RULES FOR TRANSLATION (MUST FOLLOW):
1. **PRESERVE FORMATTING**: You MUST keep all original line breaks (\n), double newlines, and paragraph spacing EXACTLY as they appear in the source. DO NOT merge lines.
2. **NO EXPLANATIONS**: Return ONLY the translated text. Do not say "Here is the translation" or anything else.
3. **STRUCTURAL INTEGRITY**: If the input is JSON or contains IDs like g_0, l_1, DO NOT translate those keys.
4. **STYLE**: Maintain a technical, professional tone suitable for high-end industrial hardware.

### EXAMPLE (Preserving Format):
Input:
"Industrial PC
Model: HV-100"
Output:
"工业个人电脑
型号：HV-100"
  `.trim();

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

  let lastError: any = null;
  for (const providerInfo of targetProviders) {
    try {
      console.log(`🤖 [AI-Flow] 使用节点: ${providerInfo.name}, 任务: ${input.taskType}`);
      
      // --- 关键优化：针对自定义 OpenAI 兼容节点，直接使用 HTTP 代理以绕过 Genkit 的严苛校验 ---
      if (providerInfo.type !== 'google') {
        const langMap: Record<string, string> = {
          'en': 'English', 'zh': 'Chinese (Simplified)', 'jp': 'Japanese',
          'kr': 'Korean', 'ru': 'Russian', 'de': 'German', 'fr': 'French', 
          'es': 'Spanish', 'id': 'Indonesian', 'th': 'Thai', 'vi': 'Vietnamese'
        };
        const targetLang = input.targetLangs[0].toLowerCase();
        const targetLangName = langMap[targetLang] || targetLang.toUpperCase();
        const isJsonTask = input.taskType === 'spec' || input.taskType === 'rich-text';

        const systemPrompt = `You are a professional translator. 
Rules:
1. Translate to ${targetLangName}. 
2. NO explanation, NO markdown, NO prefix. 
3. Preserve all \\n and format exactly.
4. Return ONLY the translation, do NOT repeat the original text.${isJsonTask ? '\n5. If JSON, keep keys, translate values only.' : ''}`;

        const userPrompt = isJsonTask 
          ? `SOURCE_JSON:\n${input.text}\n\nTRANSLATED_JSON_IN_${targetLangName.toUpperCase()}:`
          : `SOURCE_TEXT:\n${input.text}\n\nTRANSLATION_IN_${targetLangName.toUpperCase()}_ONLY:`;

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
            temperature: 0.1
          })
        });

        if (!proxyRes.ok) throw new Error(`Model Node Error: ${proxyRes.status}`);
        const data = await proxyRes.json();
        const fullText = data.choices?.[0]?.message?.content || '';
        const finalVal = robustExtract(fullText);
        return { [targetLang]: typeof finalVal === 'object' ? JSON.stringify(finalVal) : String(finalVal) };
      }

      // --- 针对 Google AI 等标准节点，继续使用 Genkit 框架 ---
      const activeAi = genkit({
        plugins: [googleAI({ apiKey: providerInfo.apiKey })]
      });

      const targetLang = input.targetLangs[0].toLowerCase();
      const finalModel = `googleai/${providerInfo.model.split('/').pop() || providerInfo.model}`;

      const response = await activeAi.generate({
        model: finalModel as any,
        config: { temperature: 0.1, maxOutputTokens: 4096 },
        messages: [
          { role: 'system', content: `You are a professional translator. Rules: 1. Translate to ${targetLang}. 2. NO explanation.` }, 
          { role: 'user', content: `Task: Translate to ${targetLang}:\n\n${input.text}` }
        ]
      });

      const fullText = response.text || '';
      const finalVal = robustExtract(fullText);
      return { [targetLang]: typeof finalVal === 'object' ? JSON.stringify(finalVal) : String(finalVal) };
    } catch (error: any) {
      lastError = error;
      console.warn(`[Node-Error] ${providerInfo.name}:`, error.message);
    }
  }
  throw lastError;
}

function robustExtract(raw: string) {
  // 1. 尝试提取 JSON
  const matches = raw.match(/\{[\s\S]*\}/g);
  if (matches) {
    const longest = matches.reduce((a, b) => a.length > b.length ? a : b);
    try {
      return JSON.parse(longest);
    } catch (e) {}
  }

  // 2. 清洗普通文本：移除 Markdown 加粗、常见前缀
  let cleaned = raw
    .replace(/\*\*/g, '')
    .replace(/^(Translation|Result|Translated|Output|Response|译文|结果)[:：]\s*/i, '')
    .replace(/^Here is the translation[:：]?\s*/i, '')
    .replace(/^This is translated to [\w\s]+[:：]?\s*/i, '')
    .trim();

  return cleaned;
}
