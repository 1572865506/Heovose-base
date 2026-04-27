
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
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
  SidebarTrigger
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
  Compass
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getModelQuota } from '@/lib/ai-models';
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'admins', user.uid);
  }, [firestore, user?.uid]);

  const { data: adminData, isLoading: isAdminDataLoading, error: adminError } = useDoc<any>(adminDocRef);

  const aiConfigRef = useMemoFirebase(() => {
    if (!firestore || !adminData) return null;
    return doc(firestore, 'settings', 'ai');
  }, [firestore, adminData]);

  const { data: aiConfig } = useDoc<any>(aiConfigRef);

  const isDeterminingAccess = isUserLoading || (user && isAdminDataLoading);
  const isUnauthorized = !isDeterminingAccess && user && !adminData && pathname !== '/admin/login';

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, pathname, router]);

  if (isDeterminingAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl border-2 border-primary/20 animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-0 h-12 w-12 rounded-2xl border-t-2 border-primary animate-spin" />
          </div>
          <p className="text-xs font-bold text-primary uppercase tracking-[0.25em] animate-pulse">令牌验证中 / AUTHENTICATING</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted/20 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,91,153,0.03)_0%,transparent_100%)]" />
        <Alert variant="destructive" className="max-w-xl bg-white/80 backdrop-blur-2xl border-destructive/20 shadow-[0_50px_100px_-20px_rgba(220,38,38,0.1)] rounded-[2.5rem] p-10 relative z-10">
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
                您的账号 <span className="font-bold text-primary">{user?.email}</span> 已通过 SSO 验证，但在管理员白名单中未找到对应记录。
              </p>
              {adminError && (
                <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-xl text-[10px] font-mono text-destructive flex items-center gap-3">
                   <AlertCircle className="h-4 w-4 shrink-0" />
                   <span>{adminError.message}</span>
                </div>
              )}
            </div>

            <div className="p-8 bg-primary/[0.02] rounded-3xl border border-primary/10 space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                <RefreshCw className="h-3.5 w-3.5" /> 诊断详情 (System Diagnosis)
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">您的唯一身份标识 (UID)</span>
                  <div className="flex items-center justify-between bg-white/60 border border-primary/10 p-3 rounded-xl group hover:border-primary/40 transition-all">
                    <code className="text-[11px] font-mono text-primary font-bold tracking-tight">{user?.uid}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary" 
                      onClick={() => {
                        navigator.clipboard.writeText(user?.uid || '');
                        toast({ title: "UID 已复制", description: "请确保 Firestore /admins/ 集合中存在此文档。" });
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
              <Button className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20" onClick={() => auth.signOut()}><LogOut className="mr-2 h-4 w-4" /> 退出当前账号</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (pathname === '/admin/login') return <>{children}</>;
  if (!user || !adminData) return null;

  const isSuperAdmin = adminData.role === 'superadmin';

  const menuGroups = [
    {
      label: "Overview",
      items: [
        { title: "控制面板", icon: LayoutDashboard, href: "/admin" },
      ]
    },
    {
      label: "Products",
      items: [
        { title: "产品管理", icon: Package, href: "/admin/products" },
        { title: "分类管理", icon: Layers, href: "/admin/categories" },
        { title: "素材中心", icon: ImageIcon, href: "/admin/gallery" },
      ]
    },
    {
      label: "Content",
      items: [
        { title: "首页配置", icon: Home, href: "/admin/home" },
        { title: "全球地图", icon: MapPin, href: "/admin/map" },
        { title: "成功案例", icon: Star, href: "/admin/cases" },
        { title: "制造流程", icon: ClipboardList, href: "/admin/steps" },
        { title: "导航设置", icon: Compass, href: "/admin/navigation" },
      ]
    },
    {
      label: "System",
      items: [
        { title: "多语言智译", icon: Globe, href: "/admin/translations" },
        { title: "AI 中枢", icon: Bot, href: "/admin/settings/ai" },
        ...(isSuperAdmin ? [{ title: "成员权限", icon: Users, href: "/admin/users" }] : []),
        { title: "设计规范", icon: ScrollText, href: "/admin/manifest" },
        { title: "通用设置", icon: Settings, href: "/admin/settings" },
      ]
    }
  ];

  const activeModel = aiConfig?.model ? getModelQuota(aiConfig.model) : null;
  const aiStatus = aiConfig?.lastDiagnosis?.status;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden selection:bg-primary/10">
        {/* 背景装饰 */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] brightness-100 contrast-150" />
        </div>

        <Sidebar collapsible="icon" className="border-r border-border/40 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.03)] bg-white/80 backdrop-blur-xl shrink-0 z-40">
          <SidebarHeader className="h-16 flex items-center px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center border-b border-border/40">
            <Link href="/admin" className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <Image src="/image/Heovose-color.svg" alt="" width={24} height={24} className="h-5 w-5 brightness-0 invert" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-headline font-bold text-primary tracking-widest uppercase">ELEVATE</span>
                <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 rounded-sm uppercase tracking-tighter w-fit">ADMIN v1.2</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="py-6 overflow-y-auto scrollbar-minimal">
            {menuGroups.map((group) => (
              <SidebarGroup key={group.label} className="mb-4 group-data-[collapsible=icon]:px-0">
                <SidebarGroupLabel className="px-6 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/40 mb-2 group-data-[collapsible=icon]:hidden">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="px-3 group-data-[collapsible=icon]:px-2 space-y-1">
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}>
                          <Link href={item.href} className={cn(
                            "flex items-center gap-3 px-4 py-2.5 transition-all duration-500 rounded-xl relative group/item overflow-hidden",
                            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:gap-0",
                            (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))
                              ? "!bg-primary !text-white shadow-xl shadow-primary/30 font-bold translate-x-1 group-data-[collapsible=icon]:translate-x-0" 
                              : "text-slate-600 hover:bg-primary/5 hover:text-primary hover:translate-x-1 group-data-[collapsible=icon]:hover:translate-x-0"
                          )}>
                            {/* Left Indicator bar for active state */}
                            {(pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) && (
                              <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-full shadow-[0_0_10px_rgba(252,220,0,0.8)]" />
                            )}
                            
                            <item.icon className={cn("h-4 w-4 shrink-0 transition-all duration-500 group-hover/item:scale-110", (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) ? "!text-white drop-shadow-sm" : "text-slate-400 group-hover/item:text-primary")} />
                            <span className="text-sm font-medium tracking-tight group-data-[collapsible=icon]:hidden">{item.title}</span>
                            
                            {(pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) && (
                              <div className="absolute right-3 h-1 w-1 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(252,220,0,0.6)] group-data-[collapsible=icon]:hidden" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="p-6 border-t border-border/40">
            <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
               <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Heovose Systems</p>
               <p className="text-[8px] font-medium text-muted-foreground/30 uppercase">© 2026 ELEVATE OS</p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 w-full h-screen overflow-hidden relative z-10">
          <header className="h-16 border-b border-border/40 bg-white/60 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-50">
            <div className="flex items-center gap-5">
              <SidebarTrigger className="h-10 w-10 rounded-xl hover:bg-primary/5 text-primary transition-colors" />
              <div className="h-6 w-px bg-border/60" />
              <h1 className="font-headline font-bold text-sm text-primary uppercase tracking-[0.25em]">
                {menuGroups.flatMap(g => g.items).find(i => i.href === pathname)?.title || 'WORKSPACE'}
              </h1>
            </div>

            <div className="flex items-center gap-6">
              {/* AI Status Pill - Aurora Style */}
              <Link href="/admin/settings/ai">
                <Button variant="ghost" size="sm" className={cn(
                  "rounded-full h-10 px-5 flex items-center gap-3 border transition-all duration-500 group/ai",
                  aiStatus === 'success' ? "bg-green-50/50 border-green-200/50 text-green-700 hover:bg-green-100/50 shadow-sm" : 
                  aiStatus === 'quota' ? "bg-orange-50/50 border-orange-200/50 text-orange-700 hover:bg-orange-100/50" : 
                  aiStatus === 'failed' ? "bg-destructive/5 border-destructive/10 text-destructive" : 
                  "bg-white/50 border-border/40 text-muted-foreground hover:bg-white hover:shadow-md"
                )}>
                  {aiStatus === 'success' ? (
                    <div className="relative">
                      <Zap className="h-3.5 w-3.5 text-green-600 animate-pulse" />
                      <div className="absolute inset-0 bg-green-400 blur-md opacity-40 animate-pulse" />
                    </div>
                  ) : <Bot className="h-3.5 w-3.5 group-hover/ai:rotate-12 transition-transform" />}
                  
                  <span className="text-xs font-bold tracking-[0.1em] uppercase flex items-center gap-2">
                    {aiStatus === 'success' && activeModel ? (
                      <><span className="opacity-40">{activeModel.shortName}</span><span className="w-[2px] h-[2px] rounded-full bg-current opacity-30" /><span>{activeModel.rpm} RPM</span></>
                    ) : aiStatus === 'quota' ? 'Quota Full' : aiStatus === 'failed' ? 'AI Error' : 'Offline'}
                  </span>
                </Button>
              </Link>

              <div className="h-6 w-px bg-border/60 hidden md:block" />

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-4 hover:opacity-80 transition-all outline-none group pl-2">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-[12px] font-bold text-primary group-hover:text-primary/70 transition-colors">{adminData.displayName || user.email?.split('@')[0]}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-bold opacity-40">{adminData.role === 'superadmin' ? 'SuperAdmin' : 'Editor'}</span>
                    </div>
                    <div className="relative">
                      <Avatar className="h-10 w-10 rounded-2xl shadow-lg border border-border/40 ring-0 group-data-[state=open]:ring-4 group-data-[state=open]:ring-primary/10 transition-all overflow-hidden bg-white">
                        {adminData.avatarUrl ? <AvatarImage src={adminData.avatarUrl} className="object-cover" /> : null}
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                          {(adminData.displayName || user.email)?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={16} className="w-64 p-2 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border-border/40 bg-white/90 backdrop-blur-2xl ring-1 ring-black/5">
                  <DropdownMenuLabel className="px-4 py-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-[12px] font-bold text-primary">{adminData.displayName || 'Administrator'}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate opacity-60">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2 bg-border/40" />
                  <DropdownMenuItem asChild className="rounded-xl px-4 py-3 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
                    <Link href="/admin/profile" className="flex items-center gap-4">
                      <UserCircle className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">个人资料</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-4 py-3 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
                    <Link href="/admin/settings" className="flex items-center gap-4">
                      <Settings className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">系统设置</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-2 bg-border/40" />
                  <DropdownMenuItem className="rounded-xl px-4 py-3 cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive transition-colors" onClick={() => auth.signOut()}>
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
    </SidebarProvider>
  );
}
