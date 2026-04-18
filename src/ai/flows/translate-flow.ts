
'use server';
/**
 * @fileOverview AI Translation Flow for Heovose Admin.
 * 
 * Handles multi-language translation for hardware specifications and marketing content.
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
    const prompt = ai.definePrompt({
      name: 'translatePrompt',
      input: { schema: TranslateInputSchema },
      output: { schema: TranslateOutputSchema },
      prompt: `You are a professional industrial hardware manufacturing translator specializing in computer equipment (AIO, Mini PC, Monitors). 
      Translate the provided text from {{{sourceLang}}} to these languages: {{#each targetLangs}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
      
      Requirements:
      1. Use professional industry terminology. 
         - AIO should remain "AIO" or "All-in-One PC".
         - Barebone should be translated as technical semi-finished products.
         - Ensure units like "inch", "GB", "Hz" are handled correctly per target locale.
      2. Maintain the tone of a high-end technology brand.
      3. Return a JSON object mapping language codes to their translations.
      
      Text to translate: {{{text}}}`
    });

    const { output } = await prompt(input);
    return output!;
  }
);
