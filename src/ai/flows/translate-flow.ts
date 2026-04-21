'use server';
/**
 * @fileOverview AI 多语言翻译流 (Gemini 2.5 增强版)
 * 
 * 专门针对工业 hardware 规格和超长富文本排版优化的智译引擎。
 * 支持动态加载管理员配置的 API Key 和 Gemini 2.5 系列模型。
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

  // 2. 模型标识符标准化 (Gemini 2.5 规范)
  let rawModel = input.model || 'googleai/gemini-2.5-flash';
  if (rawModel.includes('/')) {
    rawModel = rawModel.split('/').pop() || rawModel;
  }
  const finalModel = `googleai/${rawModel.toLowerCase()}`;

  try {
    // 3. 执行翻译
    const { output } = await activeAi.generate({
      model: finalModel as any,
      output: {
        schema: TranslateOutputSchema
      },
      prompt: `You are a professional industrial hardware manufacturing translator. 
      Translate the provided text from ${input.sourceLang} to these languages: ${input.targetLangs.join(', ')}.
      
      CRITICAL INSTRUCTIONS:
      1. For HTML content: YOU MUST PRESERVE ALL HTML TAGS (especially <img>, <table>, <div>, <span>, <br>). 
      2. DO NOT strip or replace any image tags. If an <img> tag exists in the source, it MUST exist in the translated output with identical attributes.
      3. NEVER modify attributes like "src", "class", or "style".
      4. Ensure the output is a valid JSON object where keys are language codes.
      5. If the content contains technical specs, maintain professional terminology.
      6. FORMAT: Return ONLY the structured JSON output. 
      7. JSON SAFETY: Escape all special characters and newlines (\\n) within string values to ensure valid JSON parsing. 
      8. NO MARKDOWN: Do not include backticks (\`\`\`) or "json" labels in your output.
      
      Source Content: ${input.text}`
    });
    
    if (!output) throw new Error('AI 智译未返回有效结果。请检查模型配额或内容长度。');
    return output;
  } catch (error: any) {
    const msg = error.message || '';
    if (msg.includes('429')) {
      throw new Error('API 配额已耗尽（免费层级限制），请等候一分钟后再试。');
    }
    if (msg.includes('404')) {
      throw new Error(`模型 ${finalModel} 在当前区域或 Key 下不可用，请前往设置切换至 Gemini 2.5 系列。`);
    }
    if (msg.includes('503')) {
      throw new Error('AI 服务当前负载过高（503），建议精简内容或稍后重试。');
    }
    throw error;
  }
}
