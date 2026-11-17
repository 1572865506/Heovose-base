'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';

/**
 * LanguageIntelligence Component
 * 
 * Automatically detects browser language and suggests a switch if it matches 
 * a supported locale and differs from the current language path.
 * 
 * Reuses existing 'languages' settings and dynamic localized strings from database.
 * No hardcoded translations are used.
 */
export function LanguageIntelligence() {
  const pathname = usePathname();
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  const [hasPrompted, setHasPrompted] = useState(false);

  // 1. 严格以 URL pathname 为唯一事实源判定当前所处的语言
  const currentLocale = useMemo(() => {
    if (!pathname) return '';
    const match = pathname.match(/^\/([a-z]{2,3})(\/|$)/i);
    const code = match ? match[1].toLowerCase() : '';
    return code === 'vn' ? 'vi' : code;
  }, [pathname]);

  // 2. 检测浏览器首选系统语言（规范化为 ISO 639-1 二位码）
  const browserLang = useMemo(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return '';
    const raw = (navigator.languages && navigator.languages.length > 0)
      ? navigator.languages[0]
      : navigator.language;
    if (!raw) return '';
    const clean = raw.split(/[-_]/)[0].toLowerCase();
    return clean === 'vn' ? 'vi' : clean;
  }, []);

  // 3. 动态拉取国际化词条（彻底杜绝硬编码）
  const { data: targetTranslations } = useLocalCollection<any>(
    browserLang ? `localizedStrings?lang=${browserLang}` : null
  );

  useEffect(() => {
    // 排除管理后台、登录授权页面
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname.includes('/login')) {
      return;
    }

    // 基础参数与配置需已就绪
    if (!langSettings || !currentLocale || !browserLang || hasPrompted) {
      return;
    }

    const supportedLocales: Array<{ code: string; label: string; name?: string }> = langSettings?.supportedLanguages || [];
    const supportedCodes = supportedLocales.map((l) => (l.code.toLowerCase() === 'vn' ? 'vi' : l.code.toLowerCase()));

    // 校验浏览器语言是否在系统支持的语言列表中
    const isSupported = supportedCodes.includes(browserLang);

    // 调试日志输出（帮助开发与排查）
    if (process.env.NODE_ENV !== 'production') {
      console.log('[LanguageIntelligence Debug]', {
        pathname,
        currentLocale,
        browserLang,
        supportedCodes,
        isSupported,
        isSameLang: browserLang === currentLocale,
        hasPrompted,
        translationsCount: Array.isArray(targetTranslations) ? targetTranslations.length : 0,
      });
    }

    if (!isSupported) return;

    // 若浏览器语言与当前页面所在语言一致，无需提示
    if (browserLang === currentLocale) return;

    // 检查本地忽略冷却记录（24小时内不重复弹窗提示）
    const dismissalKey = `dismiss_lang_prompt_${browserLang}`;
    const dismissedVal = localStorage.getItem(dismissalKey);
    if (dismissedVal) {
      const timestamp = parseInt(dismissedVal, 10);
      if (!isNaN(timestamp)) {
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return;
        }
      } else {
        // 清理旧版本的非时间戳历史记录
        localStorage.removeItem(dismissalKey);
      }
    }

    // 确保翻译词条已加载完成，避免空内容或硬编码
    if (!Array.isArray(targetTranslations) || targetTranslations.length === 0) {
      return;
    }

    // 获取目标语言对应的展示标签
    const targetObj = supportedLocales.find((l) => {
      const code = l.code.toLowerCase() === 'vn' ? 'vi' : l.code.toLowerCase();
      return code === browserLang;
    });
    const targetLabel = targetObj?.label || targetObj?.name || browserLang.toUpperCase();

    // 从数据库拉取的 targetTranslations 中读取词条，杜绝代码内硬编码
    const getTargetText = (key: string): string => {
      const item = targetTranslations.find((t: any) => (t.id || '').toUpperCase() === key.toUpperCase());
      if (item && item.content) {
        return item.content[browserLang] || item.content['en'] || item.content['zh'] || '';
      }
      return '';
    };

    const title = getTargetText('LANG_DETECT_TITLE');
    const rawDesc = getTargetText('LANG_DETECT_DESC');
    const actionText = getTargetText('LANG_DETECT_ACTION');

    if (!title || !rawDesc || !actionText) {
      return;
    }

    const description = rawDesc.replace(/\{lang\}/g, targetLabel);

    // 延迟 600ms 平滑弹出，提升页面加载体验
    const timer = setTimeout(() => {
      toast({
        title,
        description,
        action: (
          <Button 
            size="sm" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-8 px-3 rounded-lg shadow-sm"
            onClick={() => {
              // 规范替换路径前缀（例如 /zh/products -> /en/products）并保留 query 与 hash
              localStorage.setItem('heovose-locale', browserLang);
              document.cookie = `NEXT_LOCALE=${browserLang}; path=/; max-age=31536000`;
              
              const newPathname = pathname.replace(/^\/[a-z]{2,3}(\/|$)/i, `/${browserLang}$1`);
              const search = window.location.search || '';
              const hash = window.location.hash || '';
              window.location.href = `${newPathname}${search}${hash}`;
            }}
          >
            {actionText}
          </Button>
        ),
        onOpenChange: (open) => {
          if (!open) {
            // 用户关闭或提示自动淡出时，记录冷却时间
            localStorage.setItem(dismissalKey, Date.now().toString());
          }
        },
        duration: 9000,
      });

      setHasPrompted(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [langSettings, currentLocale, browserLang, hasPrompted, targetTranslations, pathname]);

  return null;
}
