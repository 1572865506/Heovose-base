import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from 'genkitx-openai';

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { provider, model, apiKey, baseUrl } = await request.json();

    const plugins = [];
    if (provider === 'google') {
      plugins.push(googleAI({ apiKey: apiKey || 'no-key' }));
    } else {
      plugins.push(openAI({ 
        apiKey: apiKey || 'no-key',
        baseURL: baseUrl,
        models: model ? [{ 
          name: model, 
          info: { label: model, supports: { systemRole: true } },
          configSchema: z.object({
            temperature: z.number().optional(),
            topP: z.number().optional(),
            maxTokens: z.number().optional(),
            stop: z.array(z.string()).optional(),
          })
        }] : undefined
      }));
    }

    const ai = genkit({ plugins });
    const modelId = provider === 'google' ? `googleai/${model}` : `openai/${model}`;

    const startTime = Date.now();
    
    const response = await ai.generate({
      model: modelId as any,
      prompt: 'Hello',
      config: {
        maxOutputTokens: 10,
        temperature: 0.1
      }
    });

    const latency = Date.now() - startTime;
    
    // 关键兼容性提取逻辑
    const responseText = response.text || 
                        (response.message?.content?.[0] as any)?.text || 
                        (response.custom as any)?.choices?.[0]?.message?.content || 
                        '';

    if (responseText) {
      return NextResponse.json({ success: true, latency });
    } else {
      throw new Error('AI returned an empty response.');
    }
  } catch (error: any) {
    console.error('AI Test Failure:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Connection failed.' 
    }, { status: 500 });
  }
}
