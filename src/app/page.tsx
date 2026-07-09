import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { cookies, headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  // 1. 从数据库读取管理员设置的默认语种以及当前所有被支持启用的语言列表
  let defaultLang = 'en';
  let supportedCodes: string[] = ['en', 'zh', 'id', 'vi', 'vn'];
  try {
    const langSetting = await db.setting.findUnique({
      where: { id: 'languages' },
    });
    if (langSetting?.value) {
      const parsed = JSON.parse(langSetting.value);
      defaultLang = parsed.defaultLanguage || 'en';
      if (Array.isArray(parsed.supportedLanguages)) {
        supportedCodes = parsed.supportedLanguages.map((l: any) => l.code);
      }
    }
  } catch (e) {
    console.error('[RootPage] Failed to fetch dynamic languages from DB:', e);
  }

  // 2. 检查浏览器 Cookie (NEXT_LOCALE) 是否已有语言偏好记录
  let cookieLocale: string | undefined = undefined;
  try {
    const cookieStore = await cookies();
    cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  } catch (err) {
    console.error('[RootPage Debug] Cookie check failed:', err);
  }

  if (cookieLocale && supportedCodes.includes(cookieLocale)) {
    return redirect(`/${cookieLocale}`);
  }

  // 3. 检查浏览器首选语言 Accept-Language
  let acceptLang: string | undefined = undefined;
  try {
    const headersList = await headers();
    const rawAccept = headersList.get('accept-language');
    // 兼容中划线和下划线语言格式（如 zh-CN 和 zh_CN）
    acceptLang = rawAccept?.split(',')[0].split(/[-_]/)[0].toLowerCase();
  } catch (err) {
    console.error('[RootPage Debug] Accept-Language check failed:', err);
  }

  if (acceptLang && supportedCodes.includes(acceptLang)) {
    return redirect(`/${acceptLang}`);
  }

  // 4. 以上均不匹配时，自动重定向至数据库设置的默认语种页面
  return redirect(`/${defaultLang}`);
}
