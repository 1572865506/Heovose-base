
'use server';
/**
 * @fileOverview AI 连接自检流 (增强版)
 * 
 * 用于验证 AI 中枢配置（模型、API、系统指令）的有效性。
 * 支持传入临时 API Key 进行连接测试，以排除环境密钥问题。
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const TestInputSchema = z.object({
  model: z.string().describe('模型标识符，如 googleai/gemini-1.5-flash'),
  systemInstruction: z.string().optional(),
  apiKey: z.string().optional().describe('可选的手动 API 密钥'),
});

const TestOutputSchema = z.object({
  status: z.enum(['ok', 'error']),
  latency: z.number().describe('响应耗时(ms)'),
  message: z.string(),
  modelUsed: z.string(),
  keySource: z.string(),
});

/**
 * 执行 AI 连接自检
 */
export async function testAiConnection(input: z.infer<typeof TestInputSchema>) {
  const startTime = Date.now();
  
  // 1. 模型标识符标准化：强制使用 googleai/ 前缀且全小写
  let modelId = input.model.trim().toLowerCase();
  if (modelId.includes('/')) {
    modelId = modelId.split('/').pop() || modelId;
  }
  const finalModel = `googleai/${modelId}`;

  // 2. 动态实例化 AI (如果提供了 apiKey)
  // 这能确保测试的是用户当前输入的密钥，而不是服务器环境变量中的旧密钥
  const testAi = genkit({
    plugins: [
      googleAI(input.apiKey ? { apiKey: input.apiKey } : undefined)
    ],
  });

  try {
    // 3. 执行极简生成测试
    const { output } = await testAi.generate({
      model: finalModel as any,
      system: input.systemInstruction || "You are a connectivity tester.",
      prompt: "Respond with the word 'PONG'.",
      config: {
        temperature: 0.1, 
      }
    });

    const endTime = Date.now();
    
    // 4. 验证响应
    if (output?.text?.toUpperCase().includes('PONG')) {
      return {
        status: 'ok',
        latency: endTime - startTime,
        message: '连接成功：模型响应正常，鉴权通过。',
        modelUsed: finalModel,
        keySource: input.apiKey ? '手动输入 (Manual)' : '系统默认 (Environment)'
      } as z.infer<typeof TestOutputSchema>;
    }
    
    throw new Error('模型响应格式不符合预期');
  } catch (error: any) {
    console.error('AI Connection Test Error:', error);
    
    let userMessage = error.message || '未知连接错误';
    
    // 细化错误分析
    if (userMessage.includes('404')) {
      userMessage = `模型未找到 (404)。请确保模型 ID 正确（例如 gemini-1.5-flash）。`;
    } else if (userMessage.includes('401') || userMessage.includes('API_KEY_INVALID')) {
      userMessage = `API 密钥无效 (401)。请检查输入的密钥是否完整且正确。`;
    } else if (userMessage.includes('403') || userMessage.includes('LOCATION_NOT_SUPPORTED')) {
      userMessage = `地区限制 (403)。该 API Key 所属地区当前不支持此模型。`;
    } else if (userMessage.includes('429')) {
      userMessage = `配额超限 (429)。请稍后再试或切换 API Key。`;
    }

    return {
      status: 'error',
      latency: Date.now() - startTime,
      message: userMessage,
      modelUsed: finalModel,
      keySource: input.apiKey ? '手动输入 (Manual)' : '系统默认 (Environment)'
    } as z.infer<typeof TestOutputSchema>;
  }
}
