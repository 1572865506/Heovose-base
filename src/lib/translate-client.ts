import { translateContent } from '@/ai/flows/translate-flow';

interface TranslateInput {
  text: string;
  sourceLang?: string;
  targetLangs: string[];
}

/**
 * 客户端翻译调度器 (Client-Side Translation Dispatcher)
 * 方案 B：浏览器分布式异步翻译实现
 */
export async function smartTranslate(input: TranslateInput) {
  try {
    // 1. 获取 AI 配置
    const aiConfigRes = await fetch('/api/settings/ai');
    if (!aiConfigRes.ok) throw new Error('无法加载 AI 配置');
    const aiConfig = await aiConfigRes.json();

    if (!aiConfig.isEnabled) throw new Error('AI 功能未启用');

    // 2. 寻找当前激活的 Browser-Local 节点
    const browserProvider = aiConfig.providers?.find(
      (p: any) => p.isActive && p.isPrimary && p.type === 'browser-local'
    ) || aiConfig.providers?.find(
      (p: any) => p.isActive && p.type === 'browser-local'
    );

    // 3. 尝试浏览器直连模式 (如果配置了)
    if (browserProvider) {
      try {
        console.log('🚀 [SmartTranslate] 正在尝试浏览器直连模式...');
        
        const systemPrompt = aiConfig.systemInstruction || 'Translate the text.';
        const res = await fetch(`${browserProvider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${browserProvider.apiKey || 'not-needed'}`
          },
          body: JSON.stringify({
            model: browserProvider.model,
            messages: [
              { 
                role: 'system', 
                content: `${systemPrompt}\n\nYou are a translation engine. You must output ONLY JSON. 
Example Input: "你好" to ["en"]
Example Output: {"en": "Hello"}
` 
              },
              { 
                role: 'user', 
                content: `Translate "${input.text}" from ${input.sourceLang || 'zh'} to ${JSON.stringify(input.targetLangs)}. Return ONLY the JSON object.` 
              }
            ],
            temperature: 0.1
          })
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('Empty response from local LLM');

        const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleaned);

      } catch (e) {
        console.warn('⚠️ [SmartTranslate] 浏览器直连失败，正在触发自动降级逻辑...', e);
        // 如果失败且策略不是 'local-only'，则继续向下执行进入服务器模式
        if (aiConfig.fallbackStrategy === 'local-only') {
          throw new Error('浏览器直连失败，且当前策略设置为“仅限本地”，已中断。');
        }
      }
    }

    // 4. 服务器代理模式 (作为后备或默认模式)
    console.log('☁️ [SmartTranslate] 使用服务器代理模式');
    return await translateContent({
      text: input.text,
      sourceLang: input.sourceLang,
      targetLangs: input.targetLangs
    });

  } catch (error: any) {
    console.error('[SmartTranslate Error]:', error);
    throw error;
  }
}
