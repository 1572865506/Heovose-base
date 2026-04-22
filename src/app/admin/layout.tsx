
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
  Star
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
      <div className="h-screen flex items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">验证安全令牌中...</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted/20 p-6">
        <Alert variant="destructive" className="max-w-xl bg-white border-destructive/50 shadow-2xl rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-8 w-8 text-destructive" />
            <AlertTitle className="text-xl font-headline font-bold m-0 uppercase tracking-tight">未授权访问：权限校验失败</AlertTitle>
          </div>
          <AlertDescription className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm leading-relaxed">
                您的账号 <strong>{user?.email}</strong> 已通过身份验证，但在管理白名单中未找到匹配的文档。
              </p>
              {adminError && (
                <div className="p-3 bg-destructive/5 border border-destructive/10 rounded-lg text-[10px] font-mono text-destructive">
                  错误详情: {adminError.message}
                </div>
              )}
            </div>
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <RefreshCw className="h-3 w-3" /> 诊断与修正指南
              </h4>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-medium">1. 检查 Firestore 路径与 ID</span>
                  <div className="flex items-center justify-between bg-white border p-2.5 rounded-xl">
                    <code className="text-[11px] font-mono text-primary font-bold">/admins/{user?.uid}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => {
                        navigator.clipboard.writeText(user?.uid || '');
                        alert('UID 已复制，请确保 Firestore 中的文档 ID 与之完全一致。');
                      }}
                    >
                      <Key className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-muted-foreground font-medium">2. 检查关键字段</span>
                  <p className="text-[9px] leading-relaxed">确保文档包含 <code>email</code> 和 <code>role</code> (值为 <code>superadmin</code> 或 <code>editor</code>) 字段。</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={() => window.location.reload()}><RefreshCw className="mr-2 h-4 w-4" /> 重新检测权限</Button>
              <Button className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={() => auth.signOut()}><LogOut className="mr-2 h-4 w-4" /> 返回登录</Button>
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
      label: "核心概览",
      items: [
        { title: "控制面板", icon: LayoutDashboard, href: "/admin" },
      ]
    },
    {
      label: "产品管理",
      items: [
        { title: "产品列表", icon: Package, href: "/admin/products" },
        { title: "分类管理", icon: Layers, href: "/admin/categories" },
        { title: "图库素材", icon: ImageIcon, href: "/admin/gallery" },
      ]
    },
    {
      label: "内容管理",
      items: [
        { title: "首页配置", icon: Home, href: "/admin/home" },
        { title: "成功案例", icon: Star, href: "/admin/cases" },
        { title: "生产流程", icon: ClipboardList, href: "/admin/steps" },
        { title: "全球地图", icon: MapPin, href: "/admin/map" },
      ]
    },
    {
      label: "系统配置",
      items: [
        { title: "多语言翻译", icon: Globe, href: "/admin/translations" },
        { title: "AI 智译中枢", icon: Bot, href: "/admin/settings/ai" },
        ...(isSuperAdmin ? [{ title: "管理员管理", icon: Users, href: "/admin/users" }] : []),
        { title: "规范白皮书", icon: ScrollText, href: "/admin/manifest" },
        { title: "通用设置", icon: Settings, href: "/admin/settings" },
      ]
    }
  ];

  const activeModel = aiConfig?.model ? getModelQuota(aiConfig.model) : null;
  const aiStatus = aiConfig?.lastDiagnosis?.status;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/20 overflow-hidden">
        <Sidebar className="border-r border-border/40 shadow-xl bg-white shrink-0">
          <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/40">
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/image/Heovose-color.svg" alt="Heovose Admin" width={120} height={24} className="h-6 w-auto" />
              <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center justify-center">管理中心</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="py-4">
            {menuGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="px-5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-1">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.href}>
                          <Link href={item.href} className={cn(
                            "flex items-center gap-3 px-5 py-2.5 transition-all rounded-none border-l-4",
                            pathname === item.href 
                              ? "bg-primary/5 border-primary text-primary font-bold" 
                              : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-primary"
                          )}>
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/40">
            <div className="px-5 py-2"><p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Heovose Admin v1.2</p></div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0 w-full h-screen overflow-hidden bg-background">
          <header className="h-16 border-b border-border/40 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
            <div className="flex items-center gap-4"><SidebarTrigger /><div className="h-5 w-px bg-border/60 mx-1" /><h1 className="font-headline font-bold text-sm text-primary uppercase tracking-widest">{menuGroups.flatMap(g => g.items).find(i => i.href === pathname)?.title || '管理后台'}</h1></div>
            <div className="flex items-center gap-4">
              <Link href="/admin/settings/ai">
                <Button variant="ghost" size="sm" className={cn("rounded-full h-9 px-4 flex items-center gap-2 border transition-all shrink-0", aiStatus === 'success' ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" : aiStatus === 'quota' ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100" : aiStatus === 'failed' ? "bg-destructive/5 border-destructive/10 text-destructive hover:bg-destructive/10" : "bg-muted/30 border-border/20 text-muted-foreground hover:bg-muted/50")}>
                  {aiStatus === 'success' ? <Zap className="h-3.5 w-3.5 text-green-600" /> : <Bot className="h-3.5 w-3.5" />}
                  <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">{aiStatus === 'success' && activeModel ? (<><span className="opacity-60">{activeModel.shortName}</span><span className="w-px h-2 bg-current opacity-20" /><span>{activeModel.rpm} RPM</span></>) : aiStatus === 'quota' ? (<span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Quota Limit</span>) : aiStatus === 'failed' ? 'API Error' : 'Setup AI'}</span>
                </Button>
              </Link>
              <div className="h-5 w-px bg-border/60 mx-1 hidden md:block" />
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-80 transition-opacity outline-none group">
                    <div className="hidden md:flex flex-col items-end"><span className="text-[11px] font-bold text-primary">{adminData.displayName || user.email}</span><span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium text-right block">{adminData.role === 'superadmin' ? '超级管理员' : '编辑员'}</span></div>
                    <Avatar className="h-9 w-9 rounded-full shadow-inner border border-border/40 group-data-[state=open]:ring-4 group-data-[state=open]:ring-primary/10 transition-all">{adminData.avatarUrl ? <AvatarImage src={adminData.avatarUrl} className="object-cover" /> : null}<AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">{(adminData.displayName || user.email)?.[0]}</AvatarFallback></Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={12} className="w-60 p-1.5 rounded-2xl shadow-2xl border-border/40 bg-white/95 backdrop-blur-xl">
                  <DropdownMenuLabel className="px-3 py-2.5"><div className="flex flex-col space-y-1"><p className="text-xs font-bold text-primary line-clamp-1">{adminData.displayName || '管理员'}</p><p className="text-[10px] text-muted-foreground font-medium truncate opacity-60">{user.email}</p></div></DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary"><Link href="/admin/profile" className="flex items-center gap-3"><UserCircle className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">个人资料设置</span></Link></DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary"><Link href="/admin/settings" className="flex items-center gap-3"><Settings className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">系统偏好设置</span></Link></DropdownMenuItem>
                  {isSuperAdmin && (<DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-primary/5 focus:text-primary"><Link href="/admin/users" className="flex items-center gap-3"><ShieldCheck className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">成员权限管理</span></Link></DropdownMenuItem>)}
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem className="rounded-xl px-3 py-2.5 cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive" onClick={() => auth.signOut()}><div className="flex items-center gap-3"><LogOut className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">退出管理系统</span></div></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6 min-w-0"><div className="max-w-7xl w-full mx-auto">{children}</div></div>
        </main>
      </div>
    </SidebarProvider>
  );
}
