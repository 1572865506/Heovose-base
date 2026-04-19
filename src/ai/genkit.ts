import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // 修正为标准的 1.5-flash 模型，避免因模型不存在导致的 Server Action 崩溃
  model: 'googleai/gemini-1.5-flash',
});
