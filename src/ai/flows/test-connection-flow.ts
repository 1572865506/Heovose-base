
'use server';
/**
 * @fileOverview AI 连接自检流 (深度诊断版)
 * 
 * 用于验证 AI 中枢配置的有效性。
 * 支持详细的错误码解析，帮助用户定位 404、401、403 等连接问题。
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const TestInputSchema = z.object({
  model: z.string().describe('模型标识符'),
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
  
  // 1. 模型 ID 标准化逻辑
  // 移除可能存在的冗余前缀，统一使用 googleai/ 前缀
  let rawId = input.model.trim();
  if (rawId.includes('/')) {
    rawId = rawId.split('/').pop() || rawId;
  }
  const finalModel = `googleai/${rawId}`;

  // 2. 动态实例化 AI
  const testAi = genkit({
    plugins: [
      googleAI(input.apiKey ? { apiKey: input.apiKey } : undefined)
    ],
  });

  try {
    // 3. 执行极简生成测试
    const response = await testAi.generate({
      model: finalModel as any,
      system: input.systemInstruction || "You are a connectivity tester.",
      prompt: "Respond only with the word 'PONG'.",
      config: {
        temperature: 0.1, 
      }
    });

    const endTime = Date.now();
    const responseText = response.text || '';
    
    // 4. 验证响应
    if (responseText.toUpperCase().includes('PONG')) {
      return {
        status: 'ok',
        latency: endTime - startTime,
        message: '连接成功：模型响应正常，鉴权通过。',
        modelUsed: finalModel,
        keySource: input.apiKey ? '手动输入 (Manual)' : '系统默认 (Environment)'
      } as z.infer<typeof TestOutputSchema>;
    }
    
    throw new Error(`模型响应异常: ${responseText.substring(0, 50)}`);
  } catch (error: any) {
    console.error('AI Connection Test Error:', error);
    
    let userMessage = error.message || '未知连接错误';
    
    // 5. 针对性错误诊断
    if (userMessage.includes('404') || userMessage.includes('not found')) {
      userMessage = `模型未找到 (404)。请尝试切换模型变体（如 gemini-1.5-flash-latest 或 gemini-1.5-flash-002）。这通常是由于该 API Key 在当前区域下对特定基础模型 ID 的访问限制。`;
    } else if (userMessage.includes('401') || userMessage.includes('API_KEY_INVALID')) {
      userMessage = `API 密钥无效 (401)。请检查输入的密钥是否完整。`;
    } else if (userMessage.includes('403') || userMessage.includes('LOCATION_NOT_SUPPORTED')) {
      userMessage = `权限/地区受限 (403)。您的 IP 或 API Key 所属项目可能不支持此模型，请尝试更换 API Key 或开启代理。`;
    } else if (userMessage.includes('429')) {
      userMessage = `配额超限 (429)。免费层级请求过快，请稍后重试。`;
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
