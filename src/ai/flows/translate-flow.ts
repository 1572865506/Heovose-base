'use server';
/**
 * @fileOverview AI 多语言翻译流
 * 
 * 专门针对工业硬件规格和超长富文本排版优化的智译引擎。
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateInputSchema = z.object({
  text: z.string().describe('待翻译的源文本或 HTML。'),
  sourceLang: z.string().default('zh'),
  targetLangs: z.array(z.string()),
  model: z.string().optional().describe('覆盖默认模型设置。'),
});

const TranslateOutputSchema = z.record(z.string(), z.string()).describe('语种代码到译文的映射。');

export type TranslateInput = z.infer<typeof TranslateInputSchema>;
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: { schema: TranslateInputSchema },
  output: { schema: TranslateOutputSchema },
  prompt: `You are a professional industrial hardware manufacturing translator. 
  Translate the provided text from {{{sourceLang}}} to these languages: {{#each targetLangs}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  
  CRITICAL INSTRUCTIONS:
  1. For HTML content: Preserve ALL tags (尤其是 <img>, <table>, <div>)。
  2. NEVER modify attributes like "src", "class", or "style"。
  3. Ensure the output is a valid JSON object where keys are language codes.
  
  Source: {{{text}}}`
});

export async function translateContent(input: TranslateInput): Promise<TranslateOutput> {
  return translateFlow(input);
}

const translateFlow = ai.defineFlow(
  {
    name: 'translateFlow',
    inputSchema: TranslateInputSchema,
    outputSchema: TranslateOutputSchema,
  },
  async (input) => {
    // 处理模型标识符
    let modelId = input.model || 'googleai/gemini-1.5-flash';
    if (!modelId.startsWith('googleai/')) {
      const core = modelId.includes('/') ? modelId.split('/').pop() : modelId;
      modelId = `googleai/${core}`;
    }

    const { output } = await translatePrompt(input, {
      config: { model: modelId as any }
    });
    
    if (!output) throw new Error('AI Translation returned empty results.');
    return output;
  }
);
