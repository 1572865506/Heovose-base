import { ai } from '../genkit';
import { z } from 'genkit';

export const inquiryReplyFlow = ai.defineFlow(
  {
    name: 'inquiryReplyFlow',
    inputSchema: z.object({
      name: z.string(),
      message: z.string(),
      systemInstruction: z.string(),
      model: z.string().optional(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // Use model ID string for stability
    const modelId = input.model || 'googleai/gemini-2.0-flash';
    
    const { text } = await ai.generate({
      model: modelId,
      system: input.systemInstruction,
      prompt: `客户姓名: ${input.name}\n客户留言: ${input.message}\n\n请生成一份专业的回复：`,
    });

    return text;
  }
);
