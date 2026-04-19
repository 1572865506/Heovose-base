import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // 修正模型前缀为 googleai/ 以匹配插件注册表
  model: 'googleai/gemini-1.5-flash',
});
