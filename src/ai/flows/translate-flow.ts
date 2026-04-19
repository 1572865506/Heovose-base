'use server';
/**
 * @fileOverview AI Translation Flow for Heovose Admin.
 * 
 * Handles multi-language translation for hardware specifications and marketing content.
 * Optimized for long HTML rich-text processing with image preservation logic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateInputSchema = z.object({
  text: z.string().describe('The source text to translate.'),
  sourceLang: z.string().default('zh').describe('The source language code.'),
  targetLangs: z.array(z.string()).describe('List of target language codes.'),
  model: z.string().optional().describe('Optional model override.'),
});

export type TranslateInput = z.infer<typeof TranslateInputSchema>;

const TranslateOutputSchema = z.record(z.string(), z.string()).describe('A map of language codes to translated text.');
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

// 1. 在顶层定义 Prompt
const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  input: { schema: TranslateInputSchema },
  output: { schema: TranslateOutputSchema },
  prompt: `You are a professional industrial hardware manufacturing translator and HTML structure expert. 
  Translate the provided text from {{{sourceLang}}} to these languages: {{#each targetLangs}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  
  CRITICAL INSTRUCTIONS FOR RICH TEXT (HTML):
  1. You MUST preserve EVERY HTML tag from the source. This is mandatory.
  2. NEVER delete or omit <img> tags. Even if they have no accompanying text, they MUST stay in their exact relative positions.
  3. Do NOT modify any attributes like "src", "class", "style", "alt", or "width/height". These must be copied verbatim.
  4. ONLY translate the visible text content within the tags (e.g., inside <p>, <h3>, <li>, <td>).
  5. Maintain the EXACT structure: for every <p> in the source, there must be a <p> in the target.
  6. If you see technical terms like "AIO", "Mini PC", "Barebone", "IP65", keep them as they are or use standard technical translations.
  
  OUTPUT FORMAT:
  Return a valid JSON object ONLY. The keys MUST be the language codes (e.g., "en", "id", "vi") and the values MUST be the translated HTML strings.
  Do NOT include Markdown formatting or "json" code blocks in your response.
  
  Text to translate: {{{text}}}`
});

// 2. 在顶层定义 Flow
const translateFlow = ai.defineFlow(
  {
    name: 'translateFlow',
    inputSchema: TranslateInputSchema,
    outputSchema: TranslateOutputSchema,
  },
  async (input) => {
    try {
      // 使用传入的模型配置进行调用，如果未指定则使用 ai 实例默认值
      const { output } = await translatePrompt(input, {
        config: {
          model: input.model || undefined,
        }
      });
      
      if (!output) {
        throw new Error('AI Translation returned empty output.');
      }
      return output;
    } catch (error: any) {
      console.error('Translation Flow Error:', error);
      throw new Error(`Translation failed: ${error.message || 'Unknown error'}`);
    }
  }
);

/**
 * 包装函数，用于从客户端调用服务器端的 Flow
 */
export async function translateContent(input: TranslateInput): Promise<TranslateOutput> {
  return translateFlow(input);
}
