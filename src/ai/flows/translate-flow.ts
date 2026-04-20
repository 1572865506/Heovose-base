
'use server';
/**
 * @fileOverview AI 多语言翻译流 (增强版)
 * 
 * 专门针对工业硬件规格和超长富文本排版优化的智译引擎。
 * 支持动态加载管理员配置的 API Key。
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const TranslateInputSchema = z.object({
  text: z.string().describe('待翻译的源文本或 HTML。'),
  sourceLang: z.string().default('zh'),
  targetLangs: z.array(z.string()),
  model: z.string().optional().describe('覆盖默认模型设置。'),
  apiKey: z.string().optional().describe('手动指定的 API 密钥。'),
});

const TranslateOutputSchema = z.record(z.string(), z.string()).describe('语种代码到译文的映射。');

export type TranslateInput = z.infer<typeof TranslateInputSchema>;
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

/**
 * 翻译逻辑核心
 */
export async function translateContent(input: TranslateInput): Promise<TranslateOutput> {
  // 1. 动态实例化 AI 以支持手动 Key
  const activeAi = genkit({
    plugins: [
      googleAI(input.apiKey ? { apiKey: input.apiKey } : undefined)
    ],
  });

  // 2. 模型标识符标准化
  let modelId = input.model || 'gemini-1.5-flash';
  modelId = modelId.toLowerCase();
  if (modelId.includes('/')) {
    modelId = modelId.split('/').pop() || modelId;
  }
  const finalModel = `googleai/${modelId}`;

  // 3. 执行翻译
  const { output } = await activeAi.generate({
    model: finalModel as any,
    input: {
      schema: TranslateInputSchema,
      data: input,
    },
    output: {
      schema: TranslateOutputSchema
    },
    prompt: `You are a professional industrial hardware manufacturing translator. 
    Translate the provided text from ${input.sourceLang} to these languages: ${input.targetLangs.join(', ')}.
    
    CRITICAL INSTRUCTIONS:
    1. For HTML content: Preserve ALL tags (especially <img>, <table>, <div>).
    2. NEVER modify attributes like "src", "class", or "style".
    3. Ensure the output is a valid JSON object where keys are language codes.
    4. If the content contains technical specs, maintain professional terminology.
    
    Source: ${input.text}`
  });
  
  if (!output) throw new Error('AI Translation returned empty results.');
  return output;
}
