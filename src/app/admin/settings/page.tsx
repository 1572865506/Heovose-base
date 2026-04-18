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

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
          <Settings2 className="h-6 w-6" /> 通用系统设置
        </h2>
        <p className="text-sm text-muted-foreground">管理全站基础配置与全局开关。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="rounded-[2.5rem] border-border/40 shadow-xl overflow-hidden">
            <div className="bg-primary p-8 text-white">
              <CardHeader className="p-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">网站全局参数</CardTitle>
                    <CardDescription className="text-white/60">设置站点基本信息与默认行为。</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </div>
            <CardContent className="p-8 space-y-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">站点默认语言</Label>
                  <div className="p-4 bg-muted/20 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                    默认语言目前由 URL 参数控制，支持：ZH / EN / ID / VI
                  </div>
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">系统维护模式</Label>
                   <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                      <span className="text-xs font-bold">关闭中</span>
                      <Badge variant="secondary">OFF</Badge>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <Label className="text-[10px] font-bold uppercase tracking-widest">安全与权限策略</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  系统采用 Firebase Auth 严格的规则验证。当前已启用 <b>管理员角色白名单</b> 机制。
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-6 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="rounded-xl h-11 px-8 gap-2 font-bold uppercase tracking-widest">
                <Save className="h-4 w-4" /> {isSaving ? '正在保存...' : '保存更改'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <div className="p-8 bg-white rounded-[2.5rem] border border-border/40 shadow-sm space-y-6">
             <h4 className="text-sm font-bold text-primary uppercase tracking-widest">系统信息</h4>
             <div className="space-y-4 text-xs">
                <div className="flex justify-between border-b pb-2">
                   <span className="text-muted-foreground">版本号</span>
                   <span className="font-mono">v1.2.0-stable</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                   <span className="text-muted-foreground">核心框架</span>
                   <span className="font-mono">Next.js 15</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-muted-foreground">数据中心</span>
                   <Badge className="bg-orange-100 text-orange-700 border-none h-5">Firestore</Badge>
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
