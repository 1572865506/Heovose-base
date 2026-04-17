
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
  AlertCircle
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

  // 1. Create a memoized reference to the admin document in Firestore
  const adminDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'admins', user.uid);
  }, [firestore, user?.uid]);

  // 2. Listen to the admin document
  const { data: adminData, isLoading: isAdminDataLoading } = useDoc(adminDocRef);

  useEffect(() => {
    // Redirect if not logged in
    if (!isUserLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, pathname, router]);

  // Handle Loading States
  if (isUserLoading || (user && isAdminDataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-xs font-bold text-primary uppercase tracking-widest animate-pulse">Checking Credentials...</p>
        </div>
      </div>
    );
  }

  // Handle Non-Admin Users (Logged in but not in /admins/{uid})
  if (user && !adminData && !isAdminDataLoading && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-6">
        <Alert variant="destructive" className="max-w-md bg-white border-destructive shadow-2xl rounded-2xl p-8">
          <AlertCircle className="h-8 w-8 mb-4" />
          <AlertTitle className="text-xl font-headline font-bold mb-4">Unauthorized Access</AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-muted-foreground">
              Your account <strong>{user.email}</strong> is authenticated but does not have administrative privileges.
            </p>
            <div className="p-4 bg-muted/50 rounded-xl text-xs space-y-2">
              <p className="font-bold uppercase tracking-tight">How to fix this:</p>
              <ol className="list-decimal list-inside space-y-1 opacity-70">
                <li>Go to Firebase Console</li>
                <li>In Firestore, create a collection named <code>admins</code></li>
                <li>Create a document with ID: <code>{user.uid}</code></li>
              </ol>
            </div>
            <Button 
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest"
              onClick={() => auth.signOut()}
            >
              Back to Login
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
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                  {adminData?.role || 'Administrator'}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner uppercase">
                {user.email?.[0]}
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
