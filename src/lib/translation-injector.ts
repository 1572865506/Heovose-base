import { globalCache, notifyCacheUpdate } from '@/hooks/use-local-collection';

export interface LocalizedStringPayload {
  id: string;
  content: any; // 可以是字符串 JSON，也可以是对象
}

/**
 * 将业务翻译词条（如产品、分类翻译）动态注入到全局 localizedStrings?lang=${locale} 的缓存中。
 * 注入后，前台子组件在调用 useTranslations 时就能实时开箱即用地翻译，无需拉取全量字典。
 */
export function injectTranslations(locale: string, translations: Array<LocalizedStringPayload | null | undefined>) {
  if (typeof window === 'undefined') return; // 仅在客户端执行
  
  const cacheKey = `localizedStrings?lang=${locale}`;
  const cached = globalCache.get(cacheKey);
  const currentData = cached?.data || [];
  
  // 使用 Map 辅助去重和合并
  const dataMap = new Map<string, any>();
  currentData.forEach((item: any) => {
    if (item && item.id) {
      dataMap.set(item.id, item);
    }
  });
  
  translations.forEach((item) => {
    if (!item || !item.id) return;
    
    // 解析 content
    let parsedContent = item.content;
    if (typeof parsedContent === 'string') {
      try {
        parsedContent = JSON.parse(parsedContent);
      } catch (e) {
        parsedContent = {};
      }
    }
    
    // 防御性地还原嵌套 content.content
    if (parsedContent && typeof parsedContent === 'object' && 'content' in parsedContent && typeof parsedContent.content === 'object' && !Array.isArray(parsedContent.content)) {
      parsedContent = parsedContent.content;
    }

    const value = parsedContent?.[locale] || '';
    
    // 构造缓存里的翻译条目格式，仅保留该特定语言的值，符合 `/api/localizedStrings` GET 裁剪响应的结构
    dataMap.set(item.id, {
      id: item.id,
      content: {
        [locale]: value
      }
    });
  });
  
  // 更新全局缓存并延长生命周期
  const mergedData = Array.from(dataMap.values());
  globalCache.set(cacheKey, {
    data: mergedData,
    timestamp: Date.now()
  });
  notifyCacheUpdate(cacheKey, mergedData);
}
