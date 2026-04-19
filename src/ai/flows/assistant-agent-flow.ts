'use server';
/**
 * @fileOverview 智能硬件专家 Agent
 * 
 * - hardwareExpertFlow - 主代理流
 * - getTechnicalGlossary - 硬件术语检索 Skill
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. 定义技能 (Skill / Tool)
// 模拟一个检索工业硬件标准术语的工具
const getTechnicalGlossary = ai.defineTool(
  {
    name: 'getTechnicalGlossary',
    description: '检索计算机硬件（一体机、显示器、工控机）的专业术语标准描述和单位。',
    inputSchema: z.object({
      term: z.string().describe('需要检索的术语名称'),
    }),
    outputSchema: z.object({
      standardEn: z.string(),
      description: z.string(),
      commonUnit: z.string().optional(),
    }),
  },
  async (input) => {
    // 实际应用中这里可以查询数据库或外部知识库
    const dictionary: Record<string, any> = {
      '屏幕亮度': { standardEn: 'Brightness', description: 'Cd/m² (Nits), 工业级标准通常需 300+ nits', commonUnit: 'nits' },
      '防尘等级': { standardEn: 'IP Rating', description: 'Ingress Protection, 如 IP65', commonUnit: 'level' },
      '准系统': { standardEn: 'Barebone', description: '半成品电脑系统，不含内存和硬盘', commonUnit: 'set' },
    };
    return dictionary[input.term] || { standardEn: input.term, description: '通用术语' };
  }
);

const AssistantInputSchema = z.object({
  content: z.string().describe('需要优化或咨询的原始文案'),
});

const AssistantOutputSchema = z.object({
  analysis: z.string().describe('Agent 的推理分析'),
  optimizedContent: z.string().describe('优化后的专业文案'),
});

// 2. 定义代理 (Agent)
// 代理会自动决定是否调用 getTechnicalGlossary 工具
const expertPrompt = ai.definePrompt({
  name: 'hardwareExpertPrompt',
  tools: [getTechnicalGlossary],
  input: { schema: AssistantInputSchema },
  output: { schema: AssistantOutputSchema },
  prompt: `你是一位资深的工业电脑制造专家。
  
  用户提供了一些文案：{{{content}}}
  
  任务要求：
  1. 如果文案中包含模糊的硬件术语，请使用 getTechnicalGlossary 工具获取专业表达。
  2. 修正不专业的术语，并统一单位。
  3. 返回包含你的推理过程 (analysis) 和最终优化内容 (optimizedContent) 的 JSON。`
});

// 3. 定义执行流 (Flow)
export async function hardwareExpertAssistant(input: z.infer<typeof AssistantInputSchema>) {
  return hardwareExpertFlow(input);
}

const hardwareExpertFlow = ai.defineFlow(
  {
    name: 'hardwareExpertFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input) => {
    const { output } = await expertPrompt(input);
    return output!;
  }
);
