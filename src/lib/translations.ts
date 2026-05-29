
export type Locale = 'en' | 'zh' | 'id' | 'vi' | 'vn';

export function getLocalizedLink(href: string, locale: Locale): string {
  if (!href) return '';
  if (!href.startsWith('/')) return href;
  if (href.startsWith('/api') || href.startsWith('/admin') || href.startsWith('/storage') || href.includes('.')) {
    return href;
  }
  const cleanHref = href === '/' ? '' : href;
  return `/${locale}${cleanHref}`;
}

/**
 * @deprecated All translations have been migrated to the database.
 * Use the `useTranslations` hook instead of importing this object directly.
 * The database is now the single source of truth.
 */
export const translations = {} as any;
