import { translateContent } from '@/ai/flows/translate-flow';

interface TranslateInput {
  text: string;
  sourceLang?: string;
  targetLangs: string[];
  taskType?: 'spec' | 'rich-text' | 'text' | 'json-map';
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

  let nodeErrors: string[] = [];
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
        
        const isMultiLineText = taskType === 'text' && textContent.includes('\n');
        if ((isComplexJson || isMultiLineText) && isLocalModel) {
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
      const friendly = getFriendlyErrorMessage(e);
      nodeErrors.push(`【${provider.name}】${friendly}`);
      console.warn(`⚠️ [SmartTranslate] 节点 ${provider.name} 失败:`, e.message);
    }
  }
  throw new Error(`智译失败，已尝试所有节点：\n${nodeErrors.join('\n')}`);
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
  let isPlainLines = false;
  
  try { 
    json = JSON.parse(input.text); 
  } catch (e) {
    // 如果不是 JSON 但包含换行，则按行拆分
    if (input.text.includes('\n')) {
      const lines = input.text.split('\n');
      json = {};
      lines.forEach((line, i) => { json[i] = line; });
      isPlainLines = true;
    } else {
      return await handleOriginalTranslate(input, provider, 'text', aiConfig);
    }
  }
  
  const textNodes: { parent: any, key: string, value: string }[] = [];
  
  if (isPlainLines) {
    // 纯文本行模式：直接把每行作为待译节点
    Object.keys(json).forEach(key => {
      textNodes.push({ parent: json, key, value: json[key] });
    });
  } else {
    // JSON 模式：深度遍历
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
  }

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

    const isLocal = provider.type === 'browser-local' || provider.type === 'local';
    let translatedMap: Record<number, string> = {};

    if (isLocal) {
      // 本地模型容易在生成 JSON 时出错，拆分成单独的普通文本翻译
      await Promise.all(
        Object.keys(map).map(async (keyStr) => {
          const idx = Number(keyStr);
          const rawVal = map[idx];
          try {
            const singleRes = await handleOriginalTranslate({
              text: rawVal,
              targetLangs: input.targetLangs,
              taskType: 'text'
            }, provider, 'text', aiConfig);
            translatedMap[idx] = singleRes[lang] || rawVal;
          } catch (err) {
            console.error(`[SmartTranslate] Local translation failed for item: ${rawVal}`, err);
            translatedMap[idx] = rawVal;
          }
        })
      );
    } else {
      // 远程高级模型，继续使用批量打包翻译以节省 API token 消耗和提高速度
      try {
        const res = await smartTranslate({ 
          text: JSON.stringify(map), 
          targetLangs: input.targetLangs,
          taskType: 'json-map' 
        });
        
        const translatedRaw = res[lang];
        try {
          translatedMap = JSON.parse(translatedRaw);
        } catch (e) {
          const match = translatedRaw.match(/\{[\s\S]*\}/);
          if (match) translatedMap = JSON.parse(match[0]);
        }
      } catch (e) {
        console.warn("[SmartTranslate] Batch JSON translation failed, falling back to individual translation:", e);
      }
    }

    if (translatedMap && Object.keys(translatedMap).length > 0) {
      textNodes.forEach((node, i) => {
        if (translatedMap[i]) node.parent[node.key] = translatedMap[i];
      });
      
      if (isPlainLines) {
        // 如果是纯文本行模式，重新拼接成多行字符串
        const result = Object.values(json).join('\n');
        return { [lang]: result };
      }
      return { [lang]: JSON.stringify(json) };
    }
  }
  
  // 无法解析 JSON 或无文本节点，回退
  return await handleOriginalTranslate(input, provider, 'text', aiConfig);
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
    'es': 'Spanish',
    'id': 'Indonesian',
    'th': 'Thai',
    'vi': 'Vietnamese'
  };
  const targetLangName = langMap[lang.toLowerCase()] || lang.toUpperCase();
  const finalSystem = `You are a professional translator.
Rules:
1. Translate to ${targetLangName}. 
2. NO explanation, NO markdown, NO prefix. 
3. Preserve all \\n and format EXACTLY. 
4. Keep the same number of lines as the source text.
5. Return ONLY the translation, do NOT repeat the original text.${(taskType === 'spec' || taskType === 'rich-text') ? '\n6. If JSON, keep keys, translate values only.' : ''}`;

  if (provider.type === 'browser-local') {
    const userContent = (taskType === 'spec' || taskType === 'rich-text') 
      ? `SOURCE_JSON:\n${input.text}\n\nTRANSLATED_JSON_IN_${targetLangName.toUpperCase()}:`
      : `SOURCE_TEXT:\n${input.text}\n\nTRANSLATION_IN_${targetLangName.toUpperCase()}_ONLY:`;

    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: finalSystem },
          { role: 'user', content: userContent }
        ],
        temperature: 0.1
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    const finalVal = robustExtract(rawContent, input.text, lang);

    // 如果是 JSON 任务（如规格表、富文本、内部 Map），或者提取到了对象，则整体回传
    const isJsonTask = taskType === 'spec' || taskType === 'rich-text' || taskType === 'json-map' || (typeof finalVal === 'object' && finalVal !== null);
    if (typeof finalVal === 'object' && finalVal !== null) {
      if (isJsonTask) {
        return { [lang]: JSON.stringify(finalVal) };
      }
      // 否则尝试寻找语种 Key
      const val = finalVal[lang] || 
                  finalVal[lang.toLowerCase()] || 
                  finalVal[targetLangName] || 
                  finalVal[targetLangName.toLowerCase()] ||
                  finalVal['translation'] ||
                  Object.values(finalVal)[0];
      return { [lang]: String(val) };
    }
    
    return { [lang]: String(finalVal) };
  } else {
    return await translateContent({
      ...input,
      taskType: taskType as any,
      providerId: provider.id
    });
  }
}

/**
 * 鲁棒性提取：支持提取 JSON 对象或清洗纯文本
 */
function robustExtract(raw: string, sourceText?: string, targetLang?: string) {
  // 1. 尝试提取 JSON
  const matches = raw.match(/\{[\s\S]*\}/g);
  if (matches) {
    const longest = matches.reduce((a, b) => a.length > b.length ? a : b);
    try {
      return JSON.parse(longest);
    } catch (e) {}
  }

  // 2. 清洗普通文本：移除 Markdown 加粗、常见前缀
  let cleaned = raw
    .replace(/\*\*/g, '')
    .replace(/^(Translation|Result|Translated|Output|Response|译文|结果)[:：]\s*/i, '')
    .replace(/^Here is the translation[:：]?\s*/i, '')
    .replace(/^This is translated to [\w\s]+[:：]?\s*/i, '')
    .trim();

  // 3. 防御性机制：若原文没有括号，但翻译结果末尾被 LLM 强行附加了括号包裹的英文/原文，进行自动剥离
  const hasParenthesesInSource = sourceText && (sourceText.includes('(') || sourceText.includes('\uff08'));
  if (targetLang && targetLang.toLowerCase() !== 'en' && !hasParenthesesInSource) {
    cleaned = cleaned.replace(/\s*[\(\uff08]\s*[a-zA-Z0-9\s\-_.,;:!?'"&/]+\s*[\)\uff09]\s*$/g, '');
  }

  return cleaned;
}

/**
 * 转换技术错误为用户友好的中文提示
 */
function getFriendlyErrorMessage(error: any): string {
  if (!error) return '未知错误';
  const msg = error.message || String(error);

  if (msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('high demand')) {
    return 'AI 服务器目前压力过大，请稍后再试或切换到本地模型节点。';
  }
  if (msg.includes('429') || msg.includes('Too Many Requests')) {
    return '触发频率限制，请稍等片刻再试。';
  }
  if (msg.includes('401') || msg.includes('403') || msg.includes('invalid_api_key')) {
    return 'AI 节点认证失败，请检查 API Key 配置是否正确。';
  }
  if (msg.includes('ECONNREFUSED') || msg.includes('Failed to fetch')) {
    return '无法连接到 AI 服务，请检查本地模型服务是否已启动或网络是否通畅。';
  }
  if (msg.includes('timeout')) {
    return 'AI 响应超时，可能是网络连接不稳定或模型推理过慢。';
  }
  if (msg.includes('m.content.find') || msg.includes('format error')) {
    return '模型输出格式异常，请尝试更换其他 AI 模型节点。';
  }

  return msg; // 兜底返回原始消息
}
