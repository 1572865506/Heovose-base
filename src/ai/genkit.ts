import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // 使用标准模型名称，不带 -latest 后缀，以确保在 v1beta 终结点下的最大兼容性
  model: 'googleai/gemini-1.5-flash',
});
