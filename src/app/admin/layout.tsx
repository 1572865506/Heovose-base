
"use client";


import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Home, 
  BarChart3, 
  Settings, 
  Globe, 
  LogOut, 
  MapPin,
  ClipboardList,
  AlertCircle,
  Image as ImageIcon,
  Bot,
  ScrollText,
  Clock,
  Zap,
  Users,
  UserCircle,
  ShieldCheck,
  RefreshCw,
  Key,
  Star,
  Compass,
  MessageSquare,
  FolderOpen,
  User,
  Bell,
  Search,
  Landmark
} from 'lucide-react';
import { ThemeToggle } from '@/components/admin/ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getModelQuota } from '@/lib/ai-models';
import { getAssetUrl } from '@/lib/image-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { WelcomeBackBanner } from '@/components/admin/WelcomeBackBanner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const { data: adminData, isLoading: isAdminDataLoading } = useLocalDoc<any>('profile', '');
  const { data: aiConfig } = useLocalDoc<any>('settings', 'ai');
  const { data: siteConfig } = useLocalDoc<any>('settings', 'site');

  const isDeterminingAccess = status === 'loading' || (session && isAdminDataLoading);

  const isSuperAdmin = adminData?.role === 'superadmin';
  const userPermissions = Array.isArray(adminData?.permissions) ? adminData.permissions : [];

  const menuGroups = [
    {
      label: "Overview",
      items: [
        { title: "控制面板", icon: LayoutDashboard, href: "/admin" },
        { title: "数据洞察", icon: BarChart3, href: "/admin/analytics", permission: 'analytics_view' },
      ]
    },
    {
      label: "Products",
      items: [
        { title: "产品管理", icon: Package, href: "/admin/products", permission: 'products_view' },
        { title: "分类管理", icon: Layers, href: "/admin/categories", permission: 'categories_manage' },
        { title: "资源管理", icon: FolderOpen, href: "/admin/gallery", permission: 'gallery_manage' },
      ]
    },
    {
      label: "Content",
      items: [
        { title: "首页配置", icon: Home, href: "/admin/home", permission: 'home_config' },
        { title: "导航设置", icon: Compass, href: "/admin/navigation", permission: 'nav_manage' },
        { title: "制造流程", icon: ClipboardList, href: "/admin/steps", permission: 'steps_manage' },
        { title: "成功案例", icon: Star, href: "/admin/cases", permission: 'cases_manage' },
        { title: "全球网点", icon: MapPin, href: "/admin/map", permission: 'map_manage' },
        { title: "服务中心", icon: Landmark, href: "/admin/service-centers", permission: 'settings_manage' },
        { title: "询盘管理", icon: MessageSquare, href: "/admin/inquiries", permission: 'inquiries_view' },
      ]
    },
    {
      label: "System",
      items: [
        { title: "多语言智译", icon: Globe, href: "/admin/translations", permission: 'translations_manage' },
        { title: "AI 中枢", icon: Bot, href: "/admin/settings/ai", permission: 'ai_config' },
        ...(isSuperAdmin ? [{ title: "成员权限", icon: Users, href: "/admin/users" }] : []),
        { title: "设计规范", icon: ScrollText, href: "/admin/manifest" },
        { title: "站点与品牌", icon: Star, href: "/admin/settings/site", permission: 'settings_manage' },
        { title: "系统运维", icon: Settings, href: "/admin/settings", permission: 'settings_manage' },
      ]
    }
  ];

  // Filter groups and items based on permissions
  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (isSuperAdmin) return true;
      if (!item.permission) return true;
      return userPermissions.includes(item.permission);
    })
  })).filter(group => group.items.length > 0);

  // Check if current page is allowed
  const allItems = menuGroups.flatMap(g => g.items);
  const currentItem = allItems.find(i => 
    pathname === i.href || (i.href !== '/admin' && pathname.startsWith(i.href + '/'))
  );
  
  const hasPermission = !currentItem || !currentItem.permission || isSuperAdmin || userPermissions.includes(currentItem.permission);
  
  const isUnauthorized = (!isDeterminingAccess && session && !adminData && pathname !== '/admin/login') || (session && adminData && !hasPermission);

  useEffect(() => {
    if (status !== 'loading' && !session && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [session, status, pathname, router]);

  if (isDeterminingAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* 极光背景 */}
        <div className="absolute top-[-30%] right-[-10%] w-[700px] h-[700px] rounded-full bg-primary/[0.04] blur-[160px] animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-[140px] animate-[pulse_6s_ease-in-out_infinite_1s]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.012] brightness-100 contrast-150" />

        <div className="flex flex-col items-center gap-10 relative z-10">
          {/* 7个渐变圆点流光加载动画 */}
          <div className="flex items-center justify-center gap-3.5 h-12">
            {[
              { color: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.6)' }, // 蓝
              { color: '#6366f1', shadow: 'rgba(99, 102, 241, 0.6)' }, // 蓝紫
              { color: '#8b5cf6', shadow: 'rgba(139, 92, 246, 0.6)' }, // 紫
              { color: '#ec4899', shadow: 'rgba(236, 72, 153, 0.6)' }, // 粉
              { color: '#ef4444', shadow: 'rgba(239, 68, 68, 0.6)' },  // 红
              { color: '#f97316', shadow: 'rgba(249, 115, 22, 0.6)' },  // 橙
              { color: '#eab308', shadow: 'rgba(234, 179, 8, 0.6)' },  // 黄
            ].map((dot, idx) => (
              <div
                key={idx}
                className="admin-dot-loader-item rounded-full"
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: dot.color,
                  '--dot-shadow': dot.shadow,
                  animationDelay: `${idx * 0.15}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* 文字 */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black text-primary/70 uppercase tracking-[0.4em]">令牌验证中</p>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">Authenticating Session</p>
          </div>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden admin-interface-dark">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,91,153,0.03)_0%,transparent_100%)]" />
        <Alert variant="destructive" className="max-w-xl bg-card/80 backdrop-blur-2xl border-destructive/20 shadow-[0_50px_100px_-20px_rgba(220,38,38,0.1)] rounded-[2.5rem] p-10 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <AlertTitle className="text-2xl font-headline font-bold m-0 uppercase tracking-tight text-destructive">未授权访问</AlertTitle>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Access Denied: Security Check Failed</p>
            </div>
          </div>
          <AlertDescription className="space-y-8">
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm leading-relaxed">
                您的账号 <span className="font-bold text-primary">{user?.email}</span> 已通过 SSO 验证，但在管理员白名单中未找到对应记录或权限不足。
              </p>
            </div>

            <div className="p-8 bg-primary/[0.02] rounded-3xl border border-primary/10 space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                <RefreshCw className="h-3.5 w-3.5" /> 诊断详情 (System Diagnosis)
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">您的唯一身份标识 (ID)</span>
                  <div className="flex items-center justify-between bg-muted/20 border border-primary/10 p-3 rounded-xl group hover:border-primary/40 transition-all">
                    <code className="text-[11px] font-mono text-primary font-bold tracking-tight">{user?.id}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary" 
                      onClick={() => {
                        navigator.clipboard.writeText(user?.id || '');
                        toast({ title: "ID 已复制", description: "请确保数据库中存在此用户记录。" });
                      }}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] border-border/60 hover:bg-muted/10" onClick={() => window.location.reload()}><RefreshCw className="mr-2 h-4 w-4" /> 重新同步权限</Button>
              <Button className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20" onClick={() => signOut({ redirectTo: '/auth/login' })}><LogOut className="mr-2 h-4 w-4" /> 退出当前账号</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (pathname === '/admin/login') return <>{children}</>;
  if (!session || !adminData) return null;

  const primaryProvider = aiConfig?.providers?.find((p: any) => p.isPrimary && p.isActive) || 
                          aiConfig?.providers?.find((p: any) => p.isActive);
  const activeModel = primaryProvider?.model ? (getModelQuota(primaryProvider.model).id === primaryProvider.model ? getModelQuota(primaryProvider.model) : null) : null;
  const aiStatus = !aiConfig?.isEnabled 
    ? 'offline'
    : primaryProvider
      ? (primaryProvider.lastTest?.status || 'success')
      : 'offline';

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/10">
        {/* 背景装饰 */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] brightness-100 contrast-150" />
        </div>

        <Sidebar collapsible="icon" className="border-r border-border/40 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.03)] bg-background/80 backdrop-blur-xl shrink-0 z-40">
          <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/40">
            <Link href="/admin" className="flex items-center justify-center w-full px-4 overflow-hidden group-data-[collapsible=icon]:px-1">
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-auto group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0.5">
                {siteConfig?.logoStandard ? (
                  <Image 
                    src={getAssetUrl(siteConfig.logoStandard)} 
                    alt="Logo" 
                    width={80} 
                    height={32} 
                    className="h-full w-auto object-contain max-h-8" 
                  />
                ) : (
                  <Image src="/image/Heovose-color.svg" alt="Heovose" width={80} height={32} className="h-full w-auto max-h-7" />
                )}
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="py-6 overflow-y-auto scrollbar-minimal">
            {filteredMenuGroups.map((group) => (
              <SidebarGroup key={group.label} className="mb-4 group-data-[collapsible=icon]:px-0">
                <SidebarGroupLabel className="px-6 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/40 mb-2 group-data-[collapsible=icon]:hidden">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="px-3 group-data-[collapsible=icon]:px-2 space-y-1">
                    {group.items.map((item) => {
                      const isExact = pathname === item.href;
                      const isSubPath = item.href !== '/admin' && pathname.startsWith(item.href + '/');
                      const hasBetterMatch = group.items.some(other => 
                        other.href !== item.href && 
                        other.href.startsWith(item.href) && 
                        pathname.startsWith(other.href)
                      );
                      const isActive = isExact || (isSubPath && !hasBetterMatch);

                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                            <Link href={item.href} className={cn(
                              "flex items-center gap-3 px-4 py-2.5 transition-all duration-500 rounded-xl relative group/item overflow-hidden",
                              "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:gap-0",
                               isActive
                                ? "!bg-primary !text-white shadow-xl shadow-primary/30 font-bold translate-x-1 group-data-[collapsible=icon]:translate-x-0" 
                                : "text-foreground/70 hover:bg-primary/5 hover:text-primary hover:translate-x-1 group-data-[collapsible=icon]:hover:translate-x-0"
                            )}>
                              {isActive && (
                                <div className="absolute left-0 top-2 bottom-2 w-1 bg-orange-400/90 rounded-r-full shadow-[0_0_6px_rgba(251,146,60,0.4)]" />
                              )}
                              <item.icon className={cn("h-4 w-4 shrink-0 transition-all duration-500 group-hover/item:scale-110", isActive ? "!text-white drop-shadow-sm" : "text-muted-foreground group-hover/item:text-primary")} />
                              <span className="text-sm font-medium tracking-tight group-data-[collapsible=icon]:hidden">{item.title}</span>
                              {isActive && (
                                <div className="absolute right-3 h-1 w-1 rounded-full bg-orange-400/80 animate-pulse shadow-[0_0_5px_rgba(251,146,60,0.3)] group-data-[collapsible=icon]:hidden" />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="p-6 group-data-[collapsible=icon]:p-2 border-t border-border/40 flex flex-row items-center justify-between group-data-[collapsible=icon]:justify-center">
            <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
               <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Heovose Systems</p>
               <p className="text-[8px] font-medium text-muted-foreground/30 uppercase">© 2026 ELEVATE OS</p>
            </div>
            <SidebarTrigger className="h-10 w-10 rounded-xl hover:bg-primary/5 text-primary transition-colors shrink-0" />
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 w-full h-screen overflow-hidden relative z-10">
          <header className="h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-50">
            <div className="flex items-center gap-5">
              <h1 className="font-headline font-bold text-sm text-primary uppercase tracking-[0.25em]">
                {allItems.find(i => pathname === i.href || (i.href !== '/admin' && pathname.startsWith(i.href + '/')))?.title || 'WORKSPACE'}
              </h1>
            </div>

            <div className="flex items-center gap-6">
              {/* AI Status Pill - Aurora Style */}
              <Link href="/admin/settings/ai">
                <Button variant="ghost" size="sm" className={cn(
                  "rounded-full h-10 px-5 flex items-center gap-3 border transition-all duration-500 group/ai",
                  aiStatus === 'success' ? "bg-green-50/50 border-green-200/50 text-green-700 hover:bg-green-100/50 shadow-sm dark:bg-emerald-950/30 dark:border-emerald-800/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50" : 
                  aiStatus === 'quota' ? "bg-orange-50/50 border-orange-200/50 text-orange-700 hover:bg-orange-100/50 dark:bg-orange-950/30 dark:border-orange-800/30 dark:text-orange-400 dark:hover:bg-orange-950/50" : 
                  aiStatus === 'failed' ? "bg-destructive/5 border-destructive/10 text-destructive dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/50" : 
                  "bg-background/50 border-border/40 text-muted-foreground hover:bg-background hover:shadow-md dark:bg-muted/10 dark:border-white/5 dark:text-muted-foreground/60 dark:hover:bg-muted/20"
                )}>
                  {aiStatus === 'success' ? (
                    <div className="relative">
                      <Zap className="h-3.5 w-3.5 text-green-600 dark:text-emerald-400 animate-pulse" />
                      <div className="absolute inset-0 bg-green-400 dark:bg-emerald-400 blur-md opacity-40 animate-pulse" />
                    </div>
                  ) : <Bot className="h-3.5 w-3.5 group-hover/ai:rotate-12 transition-transform" />}
                  
                  <span className="text-xs font-bold tracking-[0.1em] uppercase flex items-center gap-2">
                    {aiStatus === 'success' && primaryProvider ? (
                      <span className="opacity-70">
                        {activeModel ? activeModel.name : primaryProvider.model}
                      </span>
                    ) : aiStatus === 'quota' ? 'Quota Full' : aiStatus === 'failed' ? 'AI Error' : 'Offline'}
                  </span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-border/60 hidden md:block" />
              
              <ThemeToggle />
              
              <div className="h-6 w-px bg-border/60 hidden md:block" />

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-4 hover:opacity-80 transition-all outline-none group pl-2">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-[12px] font-bold text-primary group-hover:text-primary/70 transition-colors">{adminData.name || user?.email?.split('@')[0]}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-bold opacity-40">{(adminData as any).role === 'superadmin' ? 'SuperAdmin' : 'Editor'}</span>
                    </div>
                    <div className="relative">
                      <Avatar className="h-10 w-10 rounded-2xl shadow-lg border border-border/40 ring-0 group-data-[state=open]:ring-4 group-data-[state=open]:ring-primary/10 transition-all overflow-hidden bg-background">
                        {adminData.image ? <AvatarImage src={getAssetUrl(adminData.image)} className="object-cover" /> : null}
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                          {(adminData.name || user?.email)?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full shadow-sm" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={16} className="w-64 p-2 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border-border/40 bg-background/90 backdrop-blur-2xl ring-1 ring-black/5">
                  <DropdownMenuLabel className="px-4 py-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-[12px] font-bold text-primary">{adminData.name || 'Administrator'}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate opacity-60">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2 bg-border/40" />
                  <DropdownMenuItem asChild className="rounded-xl px-4 py-3 cursor-pointer transition-colors">
                    <Link href="/admin/profile" className="flex items-center gap-4">
                      <UserCircle className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">个人资料</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-4 py-3 cursor-pointer transition-colors">
                    <Link href="/admin/settings" className="flex items-center gap-4">
                      <Settings className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">系统运维</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-2 bg-border/40" />
                  <DropdownMenuItem className="rounded-xl px-4 py-3 cursor-pointer text-destructive focus:bg-destructive/15 data-[highlighted]:bg-destructive/15 focus:text-destructive data-[highlighted]:text-destructive transition-colors" onClick={() => signOut({ redirectTo: '/auth/login' })}>
                    <div className="flex items-center gap-4">
                      <LogOut className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">注销登录</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-10 min-w-0">
            <div className="max-w-7xl w-full mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
      <WelcomeBackBanner />
    </SidebarProvider>
  );
}
