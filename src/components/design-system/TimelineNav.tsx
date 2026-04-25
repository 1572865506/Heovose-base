
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  ShoppingBag,
  Type,
  Layers,
  Zap,
  MousePointer2,
  Terminal,
  TableProperties,
  Tag,
  Workflow,
  LayoutGrid,
  Layout,
  GalleryHorizontal,
  Sparkles,
  Activity,
  Loader2,
  Monitor,
  Building2,
  Cpu,
  Gauge,
  Filter,
  Settings,
  AlertCircle,
  Ghost,
  Bell,
  ChevronRight,
  Smartphone,
  LineChart,
  Moon,
  Wand2,
  Eye
} from 'lucide-react';

export const TimelineNav = ({ activeSystem }: { activeSystem: string }) => {
  const [activeSection, setActiveSection] = useState(activeSystem === 'frontend' ? 'section-00' : 'admin-01');

  const frontendSections = [
    { id: 'section-00', title: '00. 核心色彩', icon: ShoppingBag },
    { id: 'section-01', title: '01. 字体系统', icon: Type },
    { id: 'section-02', title: '02. 几何投影', icon: Layers },
    { id: 'section-03', title: '03. 按钮系统', icon: Zap },
    { id: 'section-04', title: '04. 交互组件', icon: MousePointer2 },
    { id: 'section-05', title: '05. 输入系统', icon: Terminal },
    { id: 'section-06', title: '06. 表格系统', icon: TableProperties },
    { id: 'section-07', title: '07. 标签徽章', icon: Tag },
    { id: 'section-08', title: '08. 树形结构', icon: Workflow },
    { id: 'section-09', title: '09. 分页系统', icon: LayoutGrid },
    { id: 'section-10', title: '10. 选项卡系统', icon: Layout },
    { id: 'section-11', title: '11. 轮播组件', icon: GalleryHorizontal },
    { id: 'section-12', title: '12. 毛玻璃效果', icon: Sparkles },
    { id: 'section-13', title: '13. 动力学系统', icon: Activity },
    { id: 'frontend-14', title: '14. AI 智算交互', icon: Wand2 },
    { id: 'section-15', title: '15. 反馈与加载', icon: Loader2 },
    { id: 'section-16', title: '16. 导航与展示', icon: Monitor },
    { id: 'section-17', title: '17. 文字可读性规范', icon: Eye },
  ];

  const adminSections = [
    { id: 'admin-01', title: '01. 视觉语言', icon: Building2 },
    { id: 'admin-02', title: '02. 字体表单', icon: Type },
    { id: 'admin-03', title: '03. 控件状态', icon: MousePointer2 },
    { id: 'admin-04', title: '04. AI 交互', icon: Sparkles },
    { id: 'admin-05', title: '05. 业务逻辑', icon: Cpu },
    { id: 'admin-06', title: '06. 看板度量', icon: Gauge },
    { id: 'admin-07', title: '07. 高级过滤', icon: Filter },
    { id: 'admin-08', title: '08. 详情面板', icon: Layout },
    { id: 'admin-09', title: '09. 权限审计', icon: Settings },
    { id: 'admin-10', title: '10. 异常与撤销', icon: AlertCircle },
    { id: 'admin-11', title: '11. 缺省与加载', icon: Ghost },
    { id: 'admin-12', title: '12. 通知与对话', icon: Bell },
    { id: 'admin-13', title: '13. 路径与导航', icon: ChevronRight },
    { id: 'admin-14', title: '14. 响应式降级', icon: Smartphone },
    { id: 'admin-15', title: '15. 深度检查层', icon: LineChart },
    { id: 'admin-16', title: '16. 暗色模式预研', icon: Moon },
  ];

  const sections = activeSystem === 'frontend' ? frontendSections : adminSections;

  useEffect(() => {
    setActiveSection(activeSystem === 'frontend' ? 'section-00' : 'admin-01');
  }, [activeSystem]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-20% 0px -60% 0px'
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // 考虑到顶部导航或间距
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] hidden 2xl:flex flex-col items-center py-6 px-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/20 shadow-2xl space-y-3 animate-in fade-in slide-in-from-right-10 duration-1000">
      <div className="absolute inset-y-10 right-1/2 translate-x-1/2 w-px bg-primary/5 -z-10" />
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="group relative flex items-center justify-center h-6 w-6"
          >
            {/* Active Section Label (Persistent for Active) */}
            {isActive && (
              <div className="absolute right-full mr-3 animate-in fade-in slide-in-from-right-2 duration-500 pointer-events-none">
                <div className="bg-primary/90 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                  {section.title}
                </div>
              </div>
            )}

            {/* Tooltip (On Hover for Inactive) */}
            {!isActive && (
              <div className="absolute right-full mr-3 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md text-primary text-[8px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded-md border border-primary/10 shadow-sm whitespace-nowrap">
                  {section.title}
                </div>
              </div>
            )}

            {/* Dot/Icon container */}
            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center transition-all duration-500 border relative overflow-hidden",
              isActive
                ? "border-primary bg-primary text-white scale-110 shadow-lg shadow-primary/20"
                : "border-border/20 bg-white/60 text-muted-foreground hover:border-primary/40 hover:text-primary hover:scale-105"
            )}>
              <Icon className={cn(
                "h-2.5 w-2.5 transition-transform duration-500",
                isActive ? "scale-100" : "group-hover:scale-110"
              )} />
            </div>

            {/* Active Indicator Pulse */}
            {isActive && (
              <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-primary animate-ping" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
