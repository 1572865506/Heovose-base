/**
 * @fileOverview AI 模型配额静态定义
 * 用于在全站同步各模型的限制参数
 */

export interface AiModelQuota {
  id: string;
  shortName: string;
  name: string;
  rpm: number; // Requests Per Minute
  rpd: number; // Requests Per Day
  tpm: string; // Tokens Per Minute
  color: string;
}

export const AI_MODELS: AiModelQuota[] = [
  { 
    id: 'googleai/gemini-2.5-flash', 
    shortName: 'Flash',
    name: 'Gemini 2.5 Flash', 
    rpm: 10, 
    rpd: 250, 
    tpm: '1M',
    color: 'text-blue-600'
  },
  { 
    id: 'googleai/gemini-2.5-flash-lite', 
    shortName: 'Lite',
    name: 'Gemini 2.5 Flash-Lite', 
    rpm: 15, 
    rpd: 1000, 
    tpm: '4M',
    color: 'text-green-600'
  },
  { 
    id: 'googleai/gemini-2.5-pro', 
    shortName: 'Pro',
    name: 'Gemini 2.5 Pro', 
    rpm: 5, 
    rpd: 100, 
    tpm: '32K',
    color: 'text-purple-600'
  }
];

export const getModelQuota = (modelId: string) => {
  return AI_MODELS.find(m => m.id === modelId) || AI_MODELS[0];
};
