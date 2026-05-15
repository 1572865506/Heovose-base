import { translateContent } from '@/ai/flows/translate-flow';

interface TranslateInput {
  text: string;
  sourceLang?: string;
  targetLangs: string[];
  taskType?: 'spec' | 'rich-text' | 'text';
}

/**
 * 客户端智译中心 (Unified Translation Center)
 */
export async function smartTranslate(input: TranslateInput) {
  const aiConfigRes = await fetch('/api/settings/ai');
  const aiConfig = aiConfigRes.ok ? await aiConfigRes.json() : null;
  if (!aiConfig?.isEnabled) throw new Error('AI 智译已关闭');

  const providers = (aiConfig.providers || [])
    .filter((p: any) => p.isActive)
    .sort((a: any, b: any) => (a.isPrimary ? -1 : 1));

  if (providers.length === 0) throw new Error('未配置可用的 AI 节点');

  let lastError: any = null;
  for (const provider of providers) {
    try {
      const rawText = input.text || '';
      const textContent = rawText.trim();
      if (!textContent) return { [input.targetLangs[0]]: '' };

      const taskType = input.taskType || (
        (textContent.startsWith('{') && textContent.includes('"type"')) ? 'rich-text' :
        (textContent.startsWith('{') && (textContent.includes('g_0') || textContent.includes('l_0'))) ? 'spec' : 'text'
      );

      const isLocalModel = provider.type === 'browser-local' || provider.type === 'local';
      const isComplexJson = taskType === 'rich-text' || taskType === 'spec';
      const results: Record<string, string> = {};
      
      for (const targetLang of input.targetLangs) {
        const singleInput = { ...input, targetLangs: [targetLang] };
        let translation = '';
        
        if (isComplexJson && isLocalModel) {
          const res = await handleShelllessTranslate(singleInput, provider, aiConfig);
          translation = res[targetLang] || '';
        } else {
          const res = await handleOriginalTranslate(singleInput, provider, taskType, aiConfig);
          translation = res[targetLang] || '';
        }
        
        if (translation) results[targetLang] = translation;
      }
      
      return results;
    } catch (e: any) {
      lastError = e;
      console.warn(`⚠️ [SmartTranslate] 节点 ${provider.name} 失败:`, e.message);
    }
  }
  throw new Error(`智译失败：${lastError?.message}`);
}

/**
 * 辅助方法：探测文本是否已经属于目标语种 (简单启发式)
 */
function isAlreadyTargetLanguage(text: string, targetLang: string): boolean {
  // 遵循用户建议：不再通过复杂的正则判定语种，仅做基础的非空校验
  // 如果调用方已经决定要翻译，网关层不再做二次拦截（除非原文确实为空）
  return !text || !text.trim();
}

/**
 * 【本地优化模式】通用脱壳翻译
 */
async function handleShelllessTranslate(input: TranslateInput, provider: any, aiConfig: any) {
  const lang = input.targetLangs[0];
  let json: any;
  try { json = JSON.parse(input.text); } catch (e) {
    return await handleOriginalTranslate(input, provider, 'text', aiConfig);
  }
  
  const textNodes: { parent: any, key: string, value: string }[] = [];
  const traverse = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
      const val = obj[key];
      if (key === 'text' && typeof val === 'string' && val.trim() && obj.type === 'text') {
        textNodes.push({ parent: obj, key, value: val });
      } else if (typeof val === 'string' && val.trim() && !obj.type) {
        textNodes.push({ parent: obj, key, value: val });
      } else if (typeof val === 'object') {
        traverse(val);
      }
    }
  };
  traverse(json);

  if (textNodes.length > 0) {
    const map: Record<number, string> = {};
    let workCount = 0;
    
    textNodes.forEach((node, i) => {
      // --- 核心逻辑：已译排除 ---
      if (isAlreadyTargetLanguage(node.value, lang)) {
        console.log(`⏩ [SmartTranslate] 跳过已翻译片段: "${node.value.substring(0, 10)}..."`);
        return;
      }
      map[i] = node.value;
      workCount++;
    });

    if (workCount === 0) {
      console.log('✅ [SmartTranslate] 所有片段均已翻译，无需请求 AI');
      return { [lang]: JSON.stringify(json) };
    }

    const res = await smartTranslate({ 
      text: JSON.stringify(map), 
      targetLangs: input.targetLangs,
      taskType: 'text' 
    });
    
    const translatedRaw = res[lang];
    let translatedMap: any;
    try {
      translatedMap = JSON.parse(translatedRaw);
    } catch (e) {
      const match = translatedRaw.match(/\{[\s\S]*\}/);
      if (match) translatedMap = JSON.parse(match[0]);
    }

    if (translatedMap) {
      textNodes.forEach((node, i) => {
        if (translatedMap[i]) node.parent[node.key] = translatedMap[i];
      });
      return { [lang]: JSON.stringify(json) };
    }
  }
  return { [lang]: input.text };
}

/**
 * 【原始模式】标准翻译逻辑
 */
async function handleOriginalTranslate(input: TranslateInput, provider: any, taskType: string, aiConfig: any) {
  const lang = input.targetLangs[0];
  const langMap: Record<string, string> = {
    'en': 'English',
    'zh': 'Chinese (Simplified)',
    'jp': 'Japanese',
    'kr': 'Korean',
    'ru': 'Russian',
    'de': 'German',
    'fr': 'French',
    'es': 'Spanish'
  };
  const targetLangName = langMap[lang.toLowerCase()] || lang.toUpperCase();
  const finalSystem = `You are a professional translator. 
Rules:
1. Translate to ${targetLangName}. 
2. NO explanation. 
3. Preserve all \\n and format. 
4. If JSON, translate values only.`;

  if (provider.type === 'browser-local') {
    const isJsonTask = taskType === 'spec' || taskType === 'rich-text' || input.text.trim().startsWith('{');
    const userPrompt = isJsonTask 
      ? `Task: Translate JSON values to ${targetLangName}. Keep keys. Return JSON only:\n\n${input.text}\n\nTARGET_LANGUAGE: ${targetLangName}`
      : `Task: Translate to ${targetLangName}. Keep format:\n\n${input.text}\n\nTARGET_LANGUAGE: ${targetLangName}`;

    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: finalSystem },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    let parsed: any = null;
    const tryParse = (str: string) => {
      try {
        // 修复本地模型可能输出的原始换行符在 JSON 字符串中的问题
        const fixed = str.replace(/\n/g, (match, offset, full) => {
          const q = full.substring(0, offset).split('"').length - 1;
          const eq = full.substring(0, offset).split('\\"').length - 1;
          return ((q - eq) % 2 === 1) ? '\\n' : match;
        });
        return JSON.parse(fixed);
      } catch { return null; }
    };

    parsed = tryParse(content);
    if (!parsed) {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) parsed = tryParse(m[0]);
    }

    if (parsed) {
      // 尝试多种可能的 Key 提取方式
      const val = parsed[lang] || 
                  parsed[lang.toLowerCase()] || 
                  parsed[lang.toUpperCase()] || 
                  parsed[targetLangName] || 
                  parsed[targetLangName.toLowerCase()] || 
                  parsed;
      
      // 如果提取出来的还是那个对象且不是我们想要的 map 结构，则序列化
      return { [lang]: typeof val === 'object' ? JSON.stringify(val) : String(val) };
    }

    // 清理 markdown 标记，但保留内部换行
    const cleaned = content.replace(/```(json|text|markdown)?\n?|\n?```/g, '').trim();
    return { [lang]: cleaned };
  } else {
    return await translateContent({
      ...input,
      taskType: taskType as any,
      providerId: provider.id
    });
  }
}
