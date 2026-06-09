
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

interface AdminThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

const ADMIN_DARK_CLASS = 'admin-interface-dark';

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // 严格限定后台路径
  const isAdminPath = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');

  const [theme, setTheme] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // 监听系统偏好并在客户端挂载后初始化主题
  useEffect(() => {
    if (!isAdminPath) return;

    // 1. 初始化读取本地存储的主题设置
    const saved = localStorage.getItem('admin-ui-theme') as Theme;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setTheme(saved);
    }

    // 2. 监听及更新系统色彩偏好
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemTheme(media.matches ? 'dark' : 'light');
    
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [isAdminPath]);

  // 持久化用户选择
  useEffect(() => {
    if (isAdminPath && theme) {
      localStorage.setItem('admin-ui-theme', theme);
    }
  }, [theme, isAdminPath]);

  // 解析最终生效的主题
  const resolvedTheme = useMemo(() => {
    // 如果不是后台路径，强制返回 light
    if (!isAdminPath) return 'light';
    if (theme === 'system') return systemTheme;
    return theme;
  }, [theme, systemTheme, isAdminPath]);

  // 应用到 DOM 的副作用
  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (!isAdminPath) {
      // 绝对隔离：非后台路径强制移除所有深色标记和内联样式
      root.classList.remove(ADMIN_DARK_CLASS, 'dark');
      body.classList.remove(ADMIN_DARK_CLASS, 'dark');
      root.style.colorScheme = 'light';
      body.style.backgroundColor = '';
      return;
    }

    if (resolvedTheme === 'dark') {
      root.classList.add(ADMIN_DARK_CLASS, 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove(ADMIN_DARK_CLASS, 'dark');
      root.style.colorScheme = 'light';
    }
  }, [resolvedTheme, isAdminPath]);

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {/* 使用 div 包裹一层，确保 bg-background 等 Tailwind 类名能正确映射到变量 */}
      <div className={cn(
        "min-h-screen",
        isAdminPath && "bg-background text-foreground transition-colors duration-300"
      )}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) throw new Error('useAdminTheme must be used within AdminThemeProvider');
  return context;
};
