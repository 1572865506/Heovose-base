
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Layers, Globe, ArrowUpRight, TrendingUp, Factory, Home } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const quickStats = [
    { label: "Active Products", value: "24", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Product Categories", value: "8", icon: Layers, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Localization Strings", value: "156", icon: Globe, color: "text-green-600", bg: "bg-green-50" },
    { label: "Factory Locations", value: "4", icon: Factory, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, i) => (
          <Card key={i} className="border-border/40 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-headline font-bold text-primary">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-border/40 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-headline font-bold text-primary">Recent Operations</CardTitle>
            <CardDescription>System logs and recent content updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Product Updated: Heovose H24 Pro</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">2 hours ago by admin@heovose.com</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold text-primary">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-border/40 shadow-sm rounded-2xl bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-xl font-headline font-bold text-white">Quick Actions</CardTitle>
            <CardDescription className="text-white/60">Frequently used management tools.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/products" className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl group">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5" />
                <span className="text-sm font-bold">Add New Product</span>
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
            </Link>
            <Link href="/admin/translations" className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl group">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-bold">Manage Translations</span>
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
            </Link>
            <Link href="/admin/home" className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition-colors rounded-xl group">
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5" />
                <span className="text-sm font-bold">Edit Homepage</span>
              </div>
              <ArrowUpRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
