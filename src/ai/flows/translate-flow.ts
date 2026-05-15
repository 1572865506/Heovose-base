'use server';
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from 'genkitx-openai';
import db from '@/lib/db';

const TranslateInputSchema = z.object({
  text: z.string(),
  targetLangs: z.array(z.string()),
  taskType: z.enum(['spec', 'rich-text', 'text']).optional().default('text'),
  providerId: z.string().optional(),
});

export type TranslateInput = z.infer<typeof TranslateInputSchema>;

export async function translateContent(input: TranslateInput): Promise<any> {
  const aiSettingsDoc = await db.setting.findUnique({ where: { id: 'ai' } });
  if (!aiSettingsDoc) throw new Error('AI 配置未初始化');
  const config = JSON.parse(aiSettingsDoc.value as string);

  // 1. 强化版人设融合与格式指令
  const basePersona = config.systemInstruction || "You are a professional translator.";

  const finalSystemPrompt = `
${basePersona}

### 🚨 CRITICAL RULES FOR TRANSLATION (MUST FOLLOW):
1. **PRESERVE FORMATTING**: You MUST keep all original line breaks (\n), double newlines, and paragraph spacing EXACTLY as they appear in the source. DO NOT merge lines.
2. **NO EXPLANATIONS**: Return ONLY the translated text. Do not say "Here is the translation" or anything else.
3. **STRUCTURAL INTEGRITY**: If the input is JSON or contains IDs like g_0, l_1, DO NOT translate those keys.
4. **STYLE**: Maintain a technical, professional tone suitable for high-end industrial hardware.

### EXAMPLE (Preserving Format):
Input:
"Industrial PC
Model: HV-100"
Output:
"工业个人电脑
型号：HV-100"
  `.trim();

  const allProviders = config.providers || [];
  let targetProviders = [];
  
  if (input.providerId) {
    const p = allProviders.find((p: any) => p.id === input.providerId && p.isActive);
    if (!p) throw new Error(`节点 ${input.providerId} 不可用`);
    targetProviders = [p];
  } else {
    targetProviders = allProviders
      .filter((p: any) => p.isActive && p.type !== 'browser-local')
      .sort((a: any, b: any) => (a.isPrimary ? -1 : 1));
  }

  if (targetProviders.length === 0) throw new Error('无可用节点');

  let lastError: any = null;
  for (const providerInfo of targetProviders) {
    try {
      console.log(`🤖 [AI-Flow] 使用节点: ${providerInfo.name}, 任务: ${input.taskType}`);
      
      const plugins = [];
      if (providerInfo.type === 'google') {
        plugins.push(googleAI({ apiKey: providerInfo.apiKey }));
      } else {
        plugins.push(openAI({
          apiKey: providerInfo.apiKey || 'no-key',
          baseURL: providerInfo.baseUrl,
          models: [{ name: providerInfo.model, info: { label: providerInfo.model, supports: { systemRole: true } } }]
        }));
      }

      const activeAi = genkit({ plugins });
      const finalModel = providerInfo.type === 'google'
        ? `googleai/${providerInfo.model.split('/').pop() || providerInfo.model}`
        : `openai/${providerInfo.model}`;

      const response = await activeAi.generate({
        model: finalModel as any,
        config: { temperature: 0.1, maxOutputTokens: 4096 },
        messages: [
          { role: 'system', content: finalSystemPrompt }, 
          { role: 'user', content: `TRANSLATE THIS TEXT TO ${input.targetLangs[0].toUpperCase()}. 
KEEP ALL NEWLINES AND FORMATTING EXACTLY:

${input.text}` }
        ]
      });

      const fullText = response.text || '';
      return robustExtract(fullText);
    } catch (error: any) {
      lastError = error;
      console.warn(`[Node-Error] ${providerInfo.name}:`, error.message);
    }
  }
  throw lastError;
}

function robustExtract(raw: string) {
  let clean = raw.trim().replace(/```json\n?|\n?```/g, '').trim();
  const tryParse = (str: string) => {
    try {
      const fixed = str.replace(/\n/g, (match, offset, full) => {
        const q = full.substring(0, offset).split('"').length - 1;
        const eq = full.substring(0, offset).split('\\"').length - 1;
        return ((q - eq) % 2 === 1) ? '\\n' : match;
      });
      return JSON.parse(fixed);
    } catch { return null; }
  };
  let result = tryParse(clean);
  if (result) return result;
  const matches = raw.match(/\{[\s\S]*\}/g);
  if (matches) {
    const longest = matches.reduce((a, b) => a.length > b.length ? a : b);
    result = tryParse(longest);
    if (result) return result;
  }
  return raw;
}
