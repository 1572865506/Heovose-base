
"use client";

import { useEffect } from 'react';
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
  ScrollText
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

  const { data: adminData, isLoading: isAdminDataLoading } = useDoc(adminDocRef);

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, pathname, router]);

  if (isUserLoading || (user && isAdminDataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">正在验证权限...</p>
        </div>
      </div>
    );
  }

  if (user && !adminData && !isAdminDataLoading && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-6">
        <Alert variant="destructive" className="max-w-md bg-white border-destructive shadow-2xl rounded-2xl p-8">
          <AlertCircle className="h-8 w-8 mb-4" />
          <AlertTitle className="text-xl font-headline font-bold mb-4">未授权访问</AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-muted-foreground">
              您的账号 <strong>{user.email}</strong> 已通过身份验证，但尚未获得管理权限。
            </p>
            <div className="p-4 bg-muted/50 rounded-xl text-xs space-y-2">
              <p className="font-bold uppercase tracking-tight">如何修复：</p>
              <ol className="list-decimal list-inside space-y-1 opacity-70">
                <li>进入 Firebase 控制台</li>
                <li>在 Firestore 中创建名为 <code>admins</code> 的集合</li>
                <li>创建一个文档，文档 ID 为： <code>{user.uid}</code></li>
              </ol>
            </div>
            <Button 
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest"
              onClick={() => auth.signOut()}
            >
              返回登录
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
      label: "系统设置",
      items: [
        { title: "多语言翻译", icon: Globe, href: "/admin/translations" },
        { title: "AI 智译中枢", icon: Bot, href: "/admin/settings/ai" },
        { title: "规范白皮书", icon: ScrollText, href: "/admin/manifest" },
        { title: "通用设置", icon: Settings, href: "/admin/settings" },
      ]
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20 overflow-hidden">
        <Sidebar className="border-r border-border/40 shadow-xl bg-white">
          <SidebarHeader className="h-16 flex items-center px-5 border-b border-border/40">
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/image/Heovose-color.svg" alt="Heovose Admin" width={120} height={24} className="h-6 w-auto" />
              <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-tighter">管理后台</span>
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
        
        {/* 主布局加固：min-w-0 防止侧边栏宽度样式 (--sidebar-width) 导致的横向溢出问题 */}
        <main className="flex-1 flex flex-col min-w-0 w-full overflow-hidden relative">
          <header className="h-16 border-b border-border/40 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-5 w-px bg-border/60 mx-1" />
              <h1 className="font-headline font-bold text-sm text-primary uppercase tracking-widest">
                {menuGroups.flatMap(g => g.items).find(i => i.href === pathname)?.title || '管理中心'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-col items-end">
                <span className="text-[11px] font-bold text-primary">{user.email}</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium text-right block">
                  {adminData?.role === 'superadmin' ? '超级管理员' : '编辑员'}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shadow-inner uppercase">
                {user.email?.[0]}
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto min-w-0">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
