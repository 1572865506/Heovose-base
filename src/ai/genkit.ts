import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit 全局初始化配置
 * 使用 googleAI 插件连接 Google AI Studio (Generative Language API)。
 */
export const ai = genkit({
  plugins: [googleAI()],
  // 移除全局默认模型设置，改由各 Flow 显式指定，以增强多模型切换的稳定性
});
