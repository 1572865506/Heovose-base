interface TranslateInput {
  text: string;
  sourceLang?: string;
  targetLangs: string[];
  taskType?: 'spec' | 'rich-text' | 'text' | 'json-map';
}

interface Footnote {
  id: string;
  type: 'ordered' | 'unordered';
  raw: string;
  translated?: string;
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
    Object.keys(json).forEach(key => {
      textNodes.push({ parent: json, key, value: json[key] });
    });
  } else {
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
        const result = Object.values(json).join('\n');
        return { [lang]: result };
      }
      return { [lang]: JSON.stringify(json) };
    }
  }
  
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

  const isJsonInput = taskType === 'spec' || taskType === 'rich-text' || taskType === 'json-map' || (input.text.trim().startsWith('{') && input.text.trim().endsWith('}'));

  // 1. 客户端定界符屏蔽处理：分离脚注与正文，使用学术占位符 [fn0]
  const footnotes: Footnote[] = [];
  let processedText = input.text;
  const hasFootnotes = input.text.includes('[[') || input.text.includes('{{');
  
  if (hasFootnotes && provider.type === 'browser-local') {
    processedText = extractFootnotes(input.text, isJsonInput, footnotes);
  }

  const isJsonTask = taskType === 'spec' || taskType === 'rich-text' || taskType === 'json-map';

  const finalSystem = `You are a professional translator.
Rules:
1. Translate to ${targetLangName}. 
2. NO explanation, NO markdown, NO prefix. 
3. Preserve all \\n and format EXACTLY. 
4. Keep the same number of lines as the source text.
5. Return ONLY the translation, do NOT repeat the original text.
6. Do NOT translate or modify placeholder tags like [fn0], [fn1], [fn2] etc. Keep them exactly as they are.${isJsonTask ? '\n7. If JSON, keep keys, translate values only.' : ''}`;

  if (provider.type === 'browser-local') {
    // 并行翻译提取出的每个脚注
    if (footnotes.length > 0) {
      await Promise.all(
        footnotes.map(async (fn) => {
          fn.translated = await translateFootnoteLocal(fn.raw, targetLangName, provider);
        })
      );
    }

    const userContent = isJsonTask 
      ? `SOURCE_JSON:\n${processedText}\n\nTRANSLATED_JSON_IN_${targetLangName.toUpperCase()}:`
      : `SOURCE_TEXT:\n${processedText}\n\nTRANSLATION_IN_${targetLangName.toUpperCase()}_ONLY:`;

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
    const finalVal = robustExtract(rawContent, processedText, lang);

    let processedVal: any = finalVal;
    if (footnotes.length > 0) {
      const rawString = typeof finalVal === 'object' ? JSON.stringify(finalVal) : String(finalVal);
      const restoredString = restoreFootnotes(rawString, isJsonInput, footnotes);
      try {
        processedVal = isJsonInput ? JSON.parse(restoredString) : restoredString;
      } catch (e) {
        processedVal = restoredString;
      }
    }

    const isJsonOutput = taskType === 'spec' || taskType === 'rich-text' || taskType === 'json-map' || (typeof processedVal === 'object' && processedVal !== null);
    if (typeof processedVal === 'object' && processedVal !== null) {
      if (isJsonOutput) {
        return { [lang]: JSON.stringify(processedVal) };
      }
      const val = processedVal[lang] || 
                  processedVal[lang.toLowerCase()] || 
                  processedVal[targetLangName] || 
                  processedVal[targetLangName.toLowerCase()] ||
                  processedVal['translation'] ||
                  Object.values(processedVal)[0];
      return { [lang]: String(val) };
    }
    
    return { [lang]: String(processedVal) };
  } else {
    // 远程云端调用 API，直接传递原文，由服务端完成抽取与翻译
    const apiRes = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        taskType: taskType as any,
        providerId: provider.id
      })
    });
    if (!apiRes.ok) {
      const errData = await apiRes.json().catch(() => ({}));
      throw new Error(errData.error || `Translation API error: ${apiRes.status}`);
    }
    return await apiRes.json();
  }
}

// 辅助方法：本地大模型翻译单个脚注字串
async function translateFootnoteLocal(text: string, targetLangName: string, provider: any): Promise<string> {
  try {
    const systemPrompt = `You are a professional translator. Translate to ${targetLangName}. Return ONLY the translation. NO explanation.`;
    const userPrompt = `Translate this:\n${text}`;
    
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1
      })
    });
    if (!res.ok) return text;
    const data = await res.json();
    return (data.choices?.[0]?.message?.content || text).trim();
  } catch (e) {
    console.warn('[SmartTranslate] Local footnote translation failed:', e);
    return text;
  }
}

// 提取 Payload 中的所有脚注为 [fn0]
function extractFootnotes(text: string, isJson: boolean, footnotes: Footnote[]): string {
  let counter = 0;

  const extractFromStr = (str: string): string => {
    if (!str) return '';
    
    // 匹配 [[...]]
    let res = str.replace(/\[\[([\s\S]*?)\]\]/g, (match, content) => {
      const id = `[fn${counter++}]`;
      footnotes.push({ id, type: 'ordered', raw: content.trim() });
      return id;
    });

    // 匹配 {{...}}
    res = res.replace(/\{\{([\s\S]*?)\}\}/g, (match, content) => {
      const id = `[fn${counter++}]`;
      footnotes.push({ id, type: 'unordered', raw: content.trim() });
      return id;
    });

    return res;
  };

  if (isJson) {
    try {
      const data = JSON.parse(text);
      const traverse = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return obj;
        const processed = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            (processed as any)[key] = extractFromStr(obj[key]);
          } else {
            (processed as any)[key] = traverse(obj[key]);
          }
        }
        return processed;
      };
      return JSON.stringify(traverse(data));
    } catch (e) {
      return extractFromStr(text);
    }
  }

  return extractFromStr(text);
}

// 还原 Payload 中的所有脚注占位符为真正的译文
function restoreFootnotes(text: string, isJson: boolean, footnotes: Footnote[]): string {
  const restoreToStr = (str: string): string => {
    if (!str) return '';
    let res = str;
    
    for (const fn of footnotes) {
      const num = fn.id.replace(/\D/g, '');
      const regexPattern = `\\[\\s*[fF][nN]\\s*${num}\\s*\\]`;
      const regex = new RegExp(regexPattern, 'g');
      
      const tag = fn.type === 'ordered' 
        ? `[[${fn.translated || fn.raw}]]` 
        : `{{${fn.translated || fn.raw}}}`;
        
      res = res.replace(regex, tag);
    }

    return res
      .replace(/\s*\[\[\s*/g, ' [[')
      .replace(/\s*\]\]\s*/g, ']] ')
      .replace(/\s*\{\{\s*/g, ' {{')
      .replace(/\s*\}\}\s*/g, '}} ')
      .trim();
  };

  if (isJson) {
    try {
      const data = JSON.parse(text);
      const traverse = (obj: any): any => {
        if (!obj || typeof obj !== 'object') return obj;
        const processed = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            (processed as any)[key] = restoreToStr(obj[key]);
          } else {
            (processed as any)[key] = traverse(obj[key]);
          }
        }
        return processed;
      };
      return JSON.stringify(traverse(data));
    } catch (e) {
      return restoreToStr(text);
    }
  }

  return restoreToStr(text);
}

/**
 * 鲁棒性提取：支持提取 JSON 对象或清洗纯文本
 */
function robustExtract(raw: string, sourceText?: string, targetLang?: string) {
  const matches = raw.match(/\{[\s\S]*\}/g);
  if (matches) {
    const longest = matches.reduce((a, b) => a.length > b.length ? a : b);
    try {
      return JSON.parse(longest);
    } catch (e) {}
  }

  let cleaned = raw
    .replace(/\*\*/g, '')
    .replace(/^(Translation|Result|Translated|Output|Response|译文|结果)[:：]\s*/i, '')
    .replace(/^Here is the translation[:：]?\s*/i, '')
    .replace(/^This is translated to [\w\s]+[:：]?\s*/i, '')
    .trim();

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
    return '无法连接 to AI 服务，请检查本地模型服务是否已启动或网络是否通畅。';
  }
  if (msg.includes('timeout')) {
    return 'AI 响应超时，可能是网络连接不稳定或模型推理过慢。';
  }
  if (msg.includes('m.content.find') || msg.includes('format error')) {
    return '模型输出格式异常，请尝试更换其他 AI 模型节点。';
  }

  return msg;
}
