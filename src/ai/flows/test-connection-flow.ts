'use server';
/**
 * @fileOverview AI 连接自检流
 * 
 * 用于验证 AI 中枢配置（模型、API、系统指令）的有效性。
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TestInputSchema = z.object({
  model: z.string(),
  systemInstruction: z.string().optional(),
});

const TestOutputSchema = z.object({
  status: z.enum(['ok', 'error']),
  latency: z.number().describe('响应耗时(ms)'),
  message: z.string(),
  modelUsed: z.string(),
});

export async function testAiConnection(input: z.infer<typeof TestInputSchema>) {
  const startTime = Date.now();
  try {
    // 确保使用正确的前缀，如果用户手动输入且漏掉了前缀，在此处尝试补全
    const finalModel = input.model.includes('/') ? input.model : `google-genai/${input.model}`;
    
    const { output } = await ai.generate({
      model: finalModel,
      system: input.systemInstruction || "You are a helpful assistant.",
      prompt: "Respond with exactly the word 'SUCCESS' in JSON format under the key 'result'.",
      output: {
        schema: z.object({ result: z.string() })
      }
    });

    const endTime = Date.now();
    
    if (output?.result === 'SUCCESS') {
      return {
        status: 'ok',
        latency: endTime - startTime,
        message: '连接成功，模型响应正常。',
        modelUsed: finalModel
      } as z.infer<typeof TestOutputSchema>;
    }
    
    throw new Error('模型响应格式不符合预期');
  } catch (error: any) {
    console.error('AI Connection Test Error:', error);
    return {
      status: 'error',
      latency: Date.now() - startTime,
      message: error.message || '连接失败，请检查 API 配置。',
      modelUsed: input.model
    } as z.infer<typeof TestOutputSchema>;
  }
}
