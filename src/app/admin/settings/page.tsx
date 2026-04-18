
"use client";

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings2, Save, Globe, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
          <Settings2 className="h-5 w-5" /> 通用系统设置
        </h2>
        <p className="text-xs text-muted-foreground">管理全站基础配置与全局开关。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <div className="bg-primary p-6 text-white">
              <CardHeader className="p-0">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 opacity-80" />
                  <div>
                    <CardTitle className="text-lg">网站全局参数</CardTitle>
                    <CardDescription className="text-white/60 text-xs">设置站点基本信息与默认行为。</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </div>
            <CardContent className="p-6 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-60">站点默认语言</Label>
                  <div className="p-3 bg-muted/20 rounded-lg border border-dashed border-border text-[11px] text-muted-foreground">
                    由 URL 控制，支持：ZH / EN / ID / VI
                  </div>
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-60">系统维护模式</Label>
                   <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-xs font-bold">已关闭</span>
                      <Badge variant="secondary" className="text-[9px]">OFF</Badge>
                   </div>
                </div>
              </div>

              <div className="pt-6 border-t space-y-3">
                <div className="flex items-center gap-2 text-primary opacity-60">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <Label className="text-[10px] font-bold uppercase tracking-widest">安全与权限策略</Label>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  系统采用 Firebase Auth 严格的规则验证。当前已启用 <b>管理员角色白名单</b> 机制。
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-4 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="rounded-lg h-10 px-8 gap-2 font-bold uppercase tracking-widest text-xs">
                <Save className="h-4 w-4" /> {isSaving ? '正在保存...' : '保存更改'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <div className="p-6 bg-white rounded-2xl border border-border/40 shadow-sm space-y-5">
             <h4 className="text-xs font-bold text-primary uppercase tracking-widest opacity-60">系统信息</h4>
             <div className="space-y-4 text-[10px]">
                <div className="flex justify-between border-b border-border/40 pb-2">
                   <span className="text-muted-foreground uppercase">Version</span>
                   <span className="font-mono font-bold text-primary">v1.2.0-stable</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                   <span className="text-muted-foreground uppercase">Framework</span>
                   <span className="font-mono font-bold text-primary">Next.js 15</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-muted-foreground uppercase">Database</span>
                   <Badge className="bg-orange-50 text-orange-600 border-orange-100 h-4 px-1.5 text-[8px] uppercase">Firestore</Badge>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={cn("block", className)}>{children}</label>;
}
