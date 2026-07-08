import crypto from 'crypto';

/**
 * 获取翻译词条的源语言文本
 */
export function getSourceText(content: any): string {
  if (!content) return '';
  // 默认中文为源，英文为次选
  const raw = content.zh !== undefined && content.zh !== null ? content.zh : (content.en || '');
  if (typeof raw === 'object' && raw !== null) {
    return JSON.stringify(raw);
  }
  return String(raw);
}

/**
 * 计算文本的 MD5 签名值
 */
export function calculateHash(text: string): string {
  const cleanText = text.trim();
  return crypto.createHash('md5').update(cleanText).digest('hex');
}

/**
 * 判断指定语种的翻译是否已过期（源文发生过变更，但翻译尚未更新）
 */
export function isTranslationStale(entry: any, lang: string): boolean {
  // 源文主语言（中文/英文）本身不可能过期
  if (lang === 'zh') return false;

  const content = (entry?.content as Record<string, any>) || {};
  const targetText = content[lang];

  // 1. 如果该语种尚未翻译，则属于“未翻译”，不属于“过期/待更新”
  if (!targetText || !String(targetText).trim()) {
    return false;
  }

  // 2. 兼容历史老数据：如果数据库中当前条目还没有记录 sourceHash，默认视为“未过期”避免大面积报警
  if (!entry.sourceHash) {
    return false;
  }

  const translatedHashes = (entry.translatedHashes as Record<string, string>) || {};
  const targetLangHash = translatedHashes[lang];

  // 3. 当翻译哈希存在，且不等于当前的 sourceHash 时，判定为过期待同步
  return targetLangHash !== entry.sourceHash;
}
