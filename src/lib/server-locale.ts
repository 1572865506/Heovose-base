import { cookies, headers } from 'next/headers';
import { Locale } from '@/lib/translations';
import db from '@/lib/db';

export async function getServerLocale(searchParamsLang?: string | null): Promise<Locale> {
  // 1. URL 参数强优先
  if (searchParamsLang && ['en', 'zh', 'id', 'vi'].includes(searchParamsLang)) {
    return searchParamsLang as Locale;
  }

  // 2. Cookie 优先
  try {
    const cookieStore = await cookies();
    const savedLocale = cookieStore.get('NEXT_LOCALE')?.value as Locale;
    if (savedLocale && ['en', 'zh', 'id', 'vi'].includes(savedLocale)) {
      return savedLocale;
    }
  } catch (_) {
    // Ignore static rendering or cookies() environment limitations
  }

  // 3. Detect browser首选语言 from Accept-Language header
  try {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';
    const parsedLanguage = acceptLanguage.toLowerCase();
    
    if (parsedLanguage.includes('zh')) {
      return 'zh';
    }
    if (parsedLanguage.includes('id')) {
      return 'id';
    }
    if (parsedLanguage.includes('vi')) {
      return 'vi';
    }
  } catch (_) {
    // Ignore header environment limitations
  }

  // 4. Fallback to Database defaultLanguage setting
  try {
    const langSetting = await db.setting.findUnique({ where: { id: 'languages' } });
    if (langSetting && langSetting.value) {
      const parsed = JSON.parse(langSetting.value);
      if (parsed.defaultLanguage && ['en', 'zh', 'id', 'vi'].includes(parsed.defaultLanguage)) {
        return parsed.defaultLanguage as Locale;
      }
    }
  } catch (_) {
    // Ignore db limitations
  }

  return 'en'; // Ultimate fallback
}
