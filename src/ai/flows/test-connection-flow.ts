'use server';
/**
 * @fileOverview AI 连接自检流
 * 
 * 用于验证 AI 中枢配置（模型、API、系统指令）的有效性。
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TestInputSchema = z.object({
  model: z.string().describe('模型标识符，如 googleai/gemini-1.5-flash'),
  systemInstruction: z.string().optional(),
});

const TestOutputSchema = z.object({
  status: z.enum(['ok', 'error']),
  latency: z.number().describe('响应耗时(ms)'),
  message: z.string(),
  modelUsed: z.string(),
});

/**
 * 执行 AI 连接自检
 * 采用极简 Token 消耗模式验证 API 通路。
 */
export async function testAiConnection(input: z.infer<typeof TestInputSchema>) {
  const startTime = Date.now();
  
  // 核心逻辑：标准化模型标识符
  // 确保标识符始终以 googleai/ 开头，且不包含重复前缀
  let modelId = input.model.trim();
  if (modelId.includes('/')) {
    modelId = modelId.split('/').pop() || modelId;
  }
  const finalModel = `googleai/${modelId}`;

  try {
    // 执行生成测试
    const { output } = await ai.generate({
      model: finalModel as any,
      system: input.systemInstruction || "You are a helpful assistant.",
      prompt: "Respond with exactly the word 'SUCCESS'.",
      output: {
        schema: z.object({ result: z.string() })
      },
      config: {
        temperature: 0.1, 
      }
    });

    const endTime = Date.now();
    
    // 验证响应内容
    if (output?.result?.toUpperCase().includes('SUCCESS')) {
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
    
    // 解析常见的 404 错误并提供更友好的建议
    let userMessage = error.message || '未知连接错误';
    if (userMessage.includes('404')) {
      userMessage = `模型路径未找到 (404)。请尝试切换其他模型变体（如 1.5-flash 或 2.0-flash）。`;
    }

    return {
      status: 'error',
      latency: Date.now() - startTime,
      message: userMessage,
      modelUsed: finalModel
    } as z.infer<typeof TestOutputSchema>;
  }
}
