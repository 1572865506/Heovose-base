"use client";

import { useState, useEffect } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
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
import { Settings2, Save, Globe, ShieldCheck, Loader2, Cloud, Database, Cpu, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LanguageOption {
  code: string;
  label: string;
}

interface AppConfig {
  supportedLanguages: LanguageOption[];
  defaultLanguage?: string;
}

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden", className)}>
    {children}
  </div>
);

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { data: langSettings, isLoading: isLangLoading, mutate: mutateLangs } = useLocalDoc<AppConfig>('settings', 'languages');
  
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/settings/languages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      mutateLangs();
      setIsSaving(false);
      toast({ title: "系统配置已保存" });
    } catch (e) {
      setIsSaving(false);
      toast({ variant: "destructive", title: "保存失败" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative">
      {/* Background Aurora Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] bg-accent/10 blur-[100px] rounded-full -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <Settings2 className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-headline font-bold text-slate-900">核心系统设定</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-2xl pl-1">配置全站基础参数、语言降级策略以及底层基础设施连接状态。</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isLangLoading} 
          className="rounded-full h-12 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? '部署配置中' : '签署并同步配置'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <GlassCard className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)]">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
               <div className="relative z-10 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-headline font-bold">全局本地化引擎</CardTitle>
                    <CardDescription className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-1 font-bold">Site Connectivity & Fallback</CardDescription>
                  </div>
               </div>
            </div>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                    <Globe className="h-4 w-4 text-primary" /> 站点默认语种 (Fallback)
                  </Label>
                  <Select 
                    value={formData.defaultLanguage} 
                    onValueChange={(v) => setFormData({...formData, defaultLanguage: v})}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 shadow-inner">
                      <SelectValue placeholder="选择默认语种" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      {formData.supportedLanguages.length > 0 ? (
                        formData.supportedLanguages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code} className="rounded-xl h-10 text-xs font-bold my-1">
                            {lang.label} ({lang.code.toUpperCase()})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="zh" disabled className="text-xs italic p-4">请先在“翻译管理”中激活语言</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed px-1">
                    若 URL 未指定语种或特定内容缺失翻译，系统将强制回退至此锚点。
                  </p>
                </div>
                
                <div className="space-y-4">
                   <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                     <ShieldCheck className="h-4 w-4 text-primary" /> 访问控制协议
                   </Label>
                   <div className="h-14 flex items-center justify-between px-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                      <span className="text-xs font-bold text-slate-900">生产环境流量拦截</span>
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">LIVE</span>
                      </div>
                   </div>
                   <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed px-1">
                    当前正在监听外部公共请求。权限由 <b>Auth.js</b> 与后端路由守卫共同保障。
                  </p>
                </div>
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard className="border-none shadow-xl">
            <CardHeader className="p-8 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-inner">
                  <Cloud className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-headline font-bold text-slate-900">基础设施架构 (Cloud Infra)</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">System Core Technical Stack</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary">
                    <Database className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em]">云端数据网关</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase">Database</span>
                      <code className="text-sm font-mono font-bold text-slate-900">PostgreSQL (Prisma)</code>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase">Object Storage</span>
                      <span className="text-sm font-mono font-bold text-slate-900">MinIO (S3-Compatible)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Auth Provider</span>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase border-primary/20 text-primary bg-primary/5 h-6 rounded-full px-3">Auth.js v5</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary">
                    <Cpu className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em]">软件执行环境</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase">Runtime</span>
                      <span className="text-sm font-bold text-slate-900">Next.js 15.x</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase">Core Engine</span>
                      <span className="text-sm font-bold text-slate-900">Genkit 1.28 + Gemini</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Visual Layer</span>
                      <span className="text-sm font-bold text-slate-900">ShadCN + Tailwind</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <GlassCard className="border-none bg-slate-900 text-white shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">系统内核状态监控</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Version</span>
                     <span className="font-mono font-bold text-primary">v2.1.0-gold</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Stability</span>
                     <span className="font-bold text-xs uppercase text-green-400">99.9% Uptime</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">DB Cluster</span>
                     <Badge className="bg-primary text-white border-none h-6 px-3 text-[9px] font-bold uppercase shadow-lg shadow-primary/20">POSTGRESQL CONNECTED</Badge>
                  </div>
               </div>

               <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex gap-4">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-white/40 leading-relaxed font-medium italic">
                    <b>节点提示：</b>此面板展示当前容器的硬件拓扑与连接池状态。若出现离线报警，请检查 GCP 密钥存续期。
                  </p>
               </div>
            </CardContent>
          </GlassCard>

          <GlassCard className="border-none shadow-sm opacity-60 hover:opacity-100 transition-opacity">
            <div className="p-8 text-center space-y-4">
               <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-[0.1em]">
                 需要增减支持的本地化语言？
               </p>
               <Button variant="outline" className="w-full h-14 rounded-2xl border-primary/20 text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5" asChild>
                 <a href="/admin/translations">进入翻译资产治理</a>
               </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={cn("block", className)}>{children}</label>;
}