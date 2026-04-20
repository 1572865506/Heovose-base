import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // 使用 -latest 后缀以提高 API 路由的稳定性
  model: 'googleai/gemini-1.5-flash-latest',
});
