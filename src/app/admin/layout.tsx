
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
  UserCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getModelQuota } from '@/lib/ai-models';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  const aiConfigRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'ai');
  }, [firestore]);

  const { data: adminData, isLoading: isAdminDataLoading } = useDoc<any>(adminDocRef);
  const { data: aiConfig } = useDoc<any>(aiConfigRef);

  // 增强版加载判定：仅在两者都确定没有时才显示未授权
  const isDeterminingAccess = isUserLoading || (user && isAdminDataLoading);
  const isUnauthorized = user && !adminData && !isAdminDataLoading && pathname !== '/admin/login';

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

  if (isUnauthorized && pathname !== '/admin/login') {
    return (
      <div className="h-screen flex items-center justify-center bg-muted/20 p-6">
        <Alert variant="destructive" className="max-w-md bg-white border-destructive shadow-2xl rounded-2xl p-8">
          <AlertCircle className="h-8 w-8 mb-4" />
          <AlertTitle className="text-xl font-headline font-bold mb-4">未授权访问</AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-muted-foreground text-sm">
              您的账号 <strong>{user?.email}</strong> 已通过身份验证，但尚未获得管理权限。
            </p>
            <div className="p-4 bg-muted/50 rounded-xl text-xs space-y-2">
              <p className="font-bold uppercase tracking-tight text-primary">权限激活指南：</p>
              <ol className="list-decimal list-inside space-y-1 opacity-70">
                <li>联系超级管理员为您分配角色</li>
                <li>在 Firestore <code>admins</code> 集合中创建文档</li>
                <li>文档 ID 必须为： <code>{user?.uid}</code></li>
              </ol>
            </div>
            <Button 
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest"
              onClick={() => auth.signOut()}
            >
              返回登录界面
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

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
        { title: "统计数据", icon: BarChart3, href: "/admin/corporate" },
        { title: "生产流程", icon: ClipboardList, href: "/admin/steps" },
        { title: "全球地图", icon: MapPin, href: "/admin/map" },
      ]
    },
    {
      label: "系统配置",
      items: [
        { title: "多语言翻译", icon: Globe, href: "/admin/translations" },
        { title: "AI 智译中枢", icon: Bot, href: "/admin/settings/ai" },
        { title: "我的个人资料", icon: UserCircle, href: "/admin/profile" },
        ...(isSuperAdmin ? [{ title: "管理员管理", icon: Users, href: "/admin/users" }] : []),
        { title: "规范白皮书", icon: ScrollText, href: "/admin/manifest" },
        { title: "通用设置", icon: Settings, href: "/admin/settings" },
      ]
    }
  ];

  // 计算 AI 模型配额信息
  const activeModel = aiConfig?.model ? getModelQuota(aiConfig.model) : null;
  const aiStatus = aiConfig?.lastDiagnosis?.status;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/20 overflow-hidden">
        <Sidebar className="border-r border-border/40 shadow-xl bg-white shrink-0">
          <SidebarHeader className="h-16 flex items-center px-5 border-b border-border/40">
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/image/Heovose-color.svg" alt="Heovose Admin" width={120} height={24} className="h-6 w-auto" />
              <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-tighter">管理中心</span>
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
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg h-10"
              onClick={() => auth.signOut()}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">退出登录</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-w-0 w-full h-screen overflow-hidden bg-background">
          <header className="h-16 border-b border-border/40 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-5 w-px bg-border/60 mx-1" />
              <h1 className="font-headline font-bold text-sm text-primary uppercase tracking-widest">
                {menuGroups.flatMap(g => g.items).find(i => i.href === pathname)?.title || '管理后台'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* AI Quota Dashboard Shortcut */}
              <Link href="/admin/settings/ai">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "rounded-full h-9 px-4 flex items-center gap-2 border transition-all shrink-0",
                    aiStatus === 'success' 
                      ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" 
                      : aiStatus === 'quota'
                        ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                        : aiStatus === 'failed'
                          ? "bg-destructive/5 border-destructive/10 text-destructive hover:bg-destructive/10"
                          : "bg-muted/30 border-border/20 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {aiStatus === 'success' ? <Zap className="h-3.5 w-3.5 text-green-600" /> : <Bot className="h-3.5 w-3.5" />}
                  <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
                    {aiStatus === 'success' && activeModel ? (
                      <>
                        <span className="opacity-60">{activeModel.shortName}</span>
                        <span className="w-px h-2 bg-current opacity-20" />
                        <span>{activeModel.rpm} RPM</span>
                      </>
                    ) : aiStatus === 'quota' ? (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Quota Limit</span>
                    ) : aiStatus === 'failed' ? (
                      'API Error'
                    ) : (
                      'Setup AI'
                    )}
                  </span>
                </Button>
              </Link>

              <div className="h-5 w-px bg-border/60 mx-1 hidden md:block" />
              
              <Link href="/admin/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[11px] font-bold text-primary">{adminData.displayName || user.email}</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium text-right block">
                    {adminData.role === 'superadmin' ? '超级管理员' : '编辑员'}
                  </span>
                </div>
                <Avatar className="h-9 w-9 rounded-full shadow-inner border border-border/40">
                  {adminData.avatarUrl ? <AvatarImage src={adminData.avatarUrl} className="object-cover" /> : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                    {(adminData.displayName || user.email)?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-6 min-w-0">
            <div className="max-w-7xl w-full mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
