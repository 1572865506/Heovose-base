import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // 修正模型前缀为 google-genai/ 以适配最新插件注册表
  model: 'google-genai/gemini-1.5-flash',
});
