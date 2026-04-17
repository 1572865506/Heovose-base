
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
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
  ChevronRight,
  MapPin,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const menuGroups = [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
      ]
    },
    {
      label: "Product Management",
      items: [
        { title: "Products", icon: Package, href: "/admin/products" },
        { title: "Categories", icon: Layers, href: "/admin/categories" },
      ]
    },
    {
      label: "Content Management",
      items: [
        { title: "Home Sections", icon: Home, href: "/admin/home" },
        { title: "Corporate Info", icon: BarChart3, href: "/admin/corporate" },
        { title: "Production Steps", icon: ClipboardList, href: "/admin/steps" },
        { title: "Factory Map", icon: MapPin, href: "/admin/map" },
      ]
    },
    {
      label: "System",
      items: [
        { title: "Translations", icon: Globe, href: "/admin/translations" },
        { title: "Settings", icon: Settings, href: "/admin/settings" },
      ]
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <Sidebar className="border-r border-border/40 shadow-xl bg-white">
          <SidebarHeader className="h-20 flex items-center px-6 border-b border-border/40">
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/image/Heovose-color.svg" alt="Heovose Admin" width={140} height={30} className="h-7 w-auto" />
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">Admin</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="py-6">
            {menuGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.href}>
                          <Link href={item.href} className={cn(
                            "flex items-center gap-3 px-6 py-3 transition-all rounded-none border-l-4",
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
          <SidebarFooter className="p-6 border-t border-border/40">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl h-12"
              onClick={() => auth.signOut()}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-bold uppercase tracking-widest">Sign Out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col">
          <header className="h-20 border-b border-border/40 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-6 w-px bg-border/60 mx-2" />
              <h1 className="font-headline font-bold text-lg text-primary uppercase tracking-widest">
                {menuGroups.flatMap(g => g.items).find(i => i.href === pathname)?.title || 'Admin Center'}
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-primary">{user.email}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Administrator</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
                {user.email?.[0].toUpperCase()}
              </div>
            </div>
          </header>
          
          <div className="p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
