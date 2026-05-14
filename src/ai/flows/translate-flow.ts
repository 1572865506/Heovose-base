'use server';
/**
 * @fileOverview AI 多语言翻译流 (Gemini 2.5 增强版)
 * 
 * 专门针对工业 hardware 规格和超长富文本排版优化的智译引擎。
 * 支持动态加载管理员配置的 API Key 和 Gemini 2.5 系列模型。
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from 'genkitx-openai';
import db from '@/lib/db';

const TranslateInputSchema = z.object({
  text: z.string().describe('待翻译的源文本或 HTML。'),
  sourceLang: z.string().optional(),
  targetLangs: z.array(z.string()),
  model: z.string().optional().describe('覆盖默认模型设置。'),
  apiKey: z.string().optional().describe('手动指定的 API 密钥。'),
  provider: z.enum(['google', 'openai', 'local']).optional(),
  baseUrl: z.string().optional().describe('用于本地模型的自定义 Base URL。'),
});

const TranslateOutputSchema = z.record(z.string(), z.string()).describe('语种代码到译文的映射。');

export type TranslateInput = z.infer<typeof TranslateInputSchema>;
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

/**
 * 翻译逻辑核心
 */
export async function translateContent(input: TranslateInput): Promise<TranslateOutput> {
  const aiSettingsDoc = await db.setting.findUnique({ where: { id: 'ai' } });
  if (!aiSettingsDoc) throw new Error('AI 配置未初始化');
  
  const config = JSON.parse(aiSettingsDoc.value as string);
  const systemPrompt = config.systemInstruction || "You are a professional industrial hardware manufacturing translator.";
  
  // 1. 获取所有可用的服务器端节点 (排除禁用和浏览器直连模式)
  const activeProviders = (config.providers || [])
    .filter((p: any) => p.isActive && p.type !== 'browser-local')
    .sort((a: any, b: any) => (a.isPrimary ? -1 : 1));

  if (activeProviders.length === 0) {
    throw new Error('没有可用的服务器端 AI 节点，请检查后台配置。');
  }

  let lastError: any = null;

  // 2. 迭代尝试每个可用节点 (降级逻辑)
  for (const providerInfo of activeProviders) {
    try {
      console.log(`☁️ [TranslateEngine] 正在尝试节点: ${providerInfo.name} (${providerInfo.model})`);
      
      const plugins = [];
      if (providerInfo.type === 'google') {
        plugins.push(googleAI({ apiKey: providerInfo.apiKey }));
      } else {
        plugins.push(openAI({ 
          apiKey: providerInfo.apiKey || 'no-key',
          baseURL: providerInfo.baseUrl,
          models: [{ 
            name: providerInfo.model, 
            info: { label: providerInfo.model, supports: { systemRole: true } },
            configSchema: z.object({
              temperature: z.number().optional(),
              topP: z.number().optional(),
              maxTokens: z.number().optional(),
              stop: z.array(z.string()).optional(),
            })
          }]
        }));
      }

      const activeAi = genkit({ plugins });
      const finalModel = providerInfo.type === 'google' 
        ? `googleai/${providerInfo.model.split('/').pop() || providerInfo.model}`
        : `openai/${providerInfo.model}`;

      const isLocal = providerInfo.type !== 'google' && providerInfo.type !== 'openai';
      
      const response = await activeAi.generate({
        model: finalModel as any,
        config: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        },
        messages: isLocal ? [
          { role: 'user', content: [{ text: 'Task: Translate to JSON. Example: "Apple" -> {"en": "Apple"}' }] },
          { role: 'model', content: [{ text: '{"en": "Apple"}' }] },
          { role: 'user', content: [{ text: `Translate "${input.text}" to ${JSON.stringify(input.targetLangs)}` }] }
        ] : [
          { role: 'user', content: [{ text: `${systemPrompt}\n\nTranslate "${input.text}" to ${input.targetLangs.join(', ')}. Return ONLY a JSON object.` }] }
        ]
      });

      // 获取原始文本
      const fullText = response.text || (response.message?.content?.[0] as any)?.text || (response.custom as any)?.choices?.[0]?.message?.content || '';
      
      if (!fullText) throw new Error('AI Node returned no content');

      // 鲁棒性 JSON 提取逻辑 (针对 Qwen, Hunyuan 等健谈模型)
      try {
        const text = fullText.trim();
        
        // 1. 尝试直接解析
        if (text.startsWith('{') && text.endsWith('}')) {
          try { return JSON.parse(text); } catch(e) {}
        }

        // 2. 尝试清洗 Markdown 标签后解析
        const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
        if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
          try { return JSON.parse(cleaned); } catch(e) {}
        }

        // 3. 正则提取：寻找内容中最长的一个 JSON 块
        const matches = fullText.match(/\{[\s\S]*\}/g);
        if (matches) {
          // 如果有多个匹配，取最长的一个（通常是我们要的完整 JSON）
          const longest = matches.reduce((a: string, b: string) => a.length > b.length ? a : b);
          try { return JSON.parse(longest); } catch(e) {}
        }
        
        throw new Error('No valid JSON found in response');
      } catch (e) {
        console.error('Final Extraction Failed. Response:', fullText);
        throw new Error('AI 返回的内容包含过多无关干扰，无法提取有效数据。');
      }

    } catch (error: any) {
      console.warn(`⚠️ [TranslateEngine] 节点 ${providerInfo.name} 失败:`, error.message);
      lastError = error;
      // 继续循环尝试下一个节点
    }
  }

  // 3. 全部失败后的错误处理
  const msg = lastError?.message || '';
  if (msg.includes('429')) throw new Error('所有可用 AI 节点的配额均已耗尽，请稍后再试。');
  if (msg.includes('503')) throw new Error('AI 服务集群当前负载过高，请稍后重试。');
  
  throw new Error(`智译失败：已尝试所有可用节点，最后一次错误为: ${msg}`);
}
