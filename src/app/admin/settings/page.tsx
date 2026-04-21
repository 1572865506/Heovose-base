
"use client";

import { useState, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Settings2, Save, Globe, ShieldCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

interface LanguageOption {
  code: string;
  label: string;
}

interface AppConfig {
  supportedLanguages: LanguageOption[];
  defaultLanguage?: string;
}

export default function AdminSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const langConfigRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'languages') : null, 
    [firestore]
  );
  
  const { data: langSettings, isLoading: isLangLoading } = useDoc<AppConfig>(langConfigRef);
  
  const [formData, setFormData] = useState<AppConfig>({
    supportedLanguages: [],
    defaultLanguage: 'zh'
  });

  useEffect(() => {
    if (langSettings) {
      setFormData({
        supportedLanguages: langSettings.supportedLanguages || [],
        defaultLanguage: langSettings.defaultLanguage || 'zh'
      });
    }
  }, [langSettings]);

  const handleSave = () => {
    if (!firestore) return;
    setIsSaving(true);
    
    setDocumentNonBlocking(doc(firestore, 'settings', 'languages'), {
      ...formData,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "系统配置已保存" });
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <Settings2 className="h-5 w-5" /> 通用系统设置
          </h2>
          <p className="text-xs text-muted-foreground">管理全站基础配置与全局开关。</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isLangLoading} className="rounded-lg h-10 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-md">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? '正在部署' : '保存全局配置'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden bg-white">
            <div className="bg-primary p-6 text-white">
              <CardHeader className="p-0">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 opacity-80" />
                  <div>
                    <CardTitle className="text-lg">网站全局参数</CardTitle>
                    <CardDescription className="text-white/60 text-xs uppercase tracking-widest">Global Site Localization</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Globe className="h-3 w-3" /> 站点默认语言 (Fallback)
                  </Label>
                  <Select 
                    value={formData.defaultLanguage} 
                    onValueChange={(v) => setFormData({...formData, defaultLanguage: v})}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/20 border-transparent text-xs font-bold">
                      <SelectValue placeholder="选择默认语种" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {formData.supportedLanguages.length > 0 ? (
                        formData.supportedLanguages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code} className="text-xs">
                            {lang.label} ({lang.code.toUpperCase()})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="zh" disabled className="text-xs italic">请先在“语种设置”中添加语言</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[9px] text-muted-foreground italic leading-relaxed">提示：此语种将作为 URL 未指定或内容缺失时的最终降级方案。</p>
                </div>
                
                <div className="space-y-3">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                     <ShieldCheck className="h-3 w-3" /> 系统维护模式
                   </Label>
                   <div className="flex items-center justify-between p-3 bg-muted/10 rounded-xl border border-dashed border-border/60">
                      <span className="text-xs font-bold text-muted-foreground">已开启生产环境拦截</span>
                      <Badge variant="secondary" className="text-[9px] font-bold uppercase bg-green-50 text-green-700 border-green-100">Live</Badge>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border/40 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <Label className="text-[10px] font-bold uppercase tracking-widest">安全与权限策略架构</Label>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    系统当前采用 Firebase Auth 严格的规则验证。所有写操作均通过管理员角色白名单机制进行隔离，确保全球站点的数据资产安全。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-border/40 shadow-sm space-y-5">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">系统内核信息</h4>
             </div>
             <div className="space-y-4 text-[10px]">
                <div className="flex justify-between border-b border-border/10 pb-2">
                   <span className="text-muted-foreground uppercase font-medium">Core Version</span>
                   <span className="font-mono font-bold text-primary">v1.2.5-enterprise</span>
                </div>
                <div className="flex justify-between border-b border-border/10 pb-2">
                   <span className="text-muted-foreground uppercase font-medium">Last Deployment</span>
                   <span className="font-mono font-bold">2024.06.05</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-muted-foreground uppercase font-medium">DB Connection</span>
                   <Badge className="bg-orange-50 text-orange-600 border-orange-100 h-5 px-2 text-[8px] font-bold uppercase">Firestore Active</Badge>
                </div>
             </div>
          </div>

          <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-border/60 text-center space-y-3">
             <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-tight">
               若需修改支持的语种列表，请前往 <br />
               <a href="/admin/translations" className="text-primary font-bold hover:underline">翻译资产管理页面</a>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={cn("block", className)}>{children}</label>;
}
