
"use client";

import { useState, useEffect } from 'react';
import { getManifest, saveManifest } from './actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  FileText, 
  Loader2, 
  History, 
  ShieldAlert, 
  CheckCircle2,
  AlertTriangle,
  Activity,
  ExternalLink,
  Eye,
  Edit3,
  Terminal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-card/70 backdrop-blur-xl border border-border/20 shadow-2xl rounded-3xl overflow-hidden", className)}>
    {children}
  </div>
);

export default function ManifestPage() {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    loadManifest();
  }, []);

  const loadManifest = async () => {
    setIsLoading(true);
    const res = await getManifest();
    if (res.success) {
      setContent(res.content);
    } else {
      toast({ variant: "destructive", title: "加载失败", description: res.error });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveManifest(content);
    if (res.success) {
      toast({ title: "白皮书已更新", description: "系统规范已同步至项目源码。" });
    } else {
      toast({ variant: "destructive", title: "保存失败", description: res.error });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">正在检索系统宪法...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative max-w-7xl mx-auto">
      {/* Background Aurora Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] bg-accent/10 blur-[100px] rounded-full -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-xl shadow-primary/5">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-headline font-bold text-foreground">设计与架构白皮书</h2>
          </div>
          <p className="text-sm text-muted-foreground font-medium max-w-2xl pl-1">治理全站设计语言、业务逻辑约束及跨模块交互协议的元数据中心。</p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mr-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Version 2.0 Premium
          </span>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-full h-12 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            签署并同步白皮书
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <div className="flex items-center justify-between bg-card/50 backdrop-blur-md p-1.5 rounded-2xl border border-border/20 shadow-sm w-fit">
              <TabsList className="bg-transparent h-10 gap-1">
                <TabsTrigger value="edit" className="rounded-xl px-6 text-[11px] font-bold uppercase tracking-wider gap-2 data-[state=active]:bg-primary data-[state=active]:text-white shadow-none transition-all">
                  <Edit3 className="h-3.5 w-3.5" /> 核心协议编辑
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-xl px-6 text-[11px] font-bold uppercase tracking-wider gap-2 data-[state=active]:bg-primary data-[state=active]:text-white shadow-none transition-all">
                  <Eye className="h-3.5 w-3.5" /> 实时视图预览
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="m-0 focus-visible:ring-0">
              <GlassCard className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)]">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <Terminal className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Markdown Payload Editor</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/30">{content.length} characters</span>
                  </div>
                </div>
                <CardContent className="p-0">
                  <Textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[600px] w-full border-none bg-muted/20 p-10 text-sm leading-relaxed font-mono focus-visible:ring-0 shadow-inner resize-none transition-all placeholder:text-muted-foreground/30 text-foreground"
                    placeholder="# 在此录入系统架构规格..."
                  />
                </CardContent>
              </GlassCard>
            </TabsContent>

            <TabsContent value="preview" className="m-0 focus-visible:ring-0">
              <GlassCard className="p-12 border-none shadow-xl bg-card prose prose-slate dark:prose-invert max-w-none prose-headings:font-headline prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground min-h-[700px] overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <GlassCard className="border-none bg-orange-600 text-white shadow-2xl">
            <CardHeader className="p-8 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-headline font-bold">治理准则与效力</CardTitle>
                  <CardDescription className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Governance Efficiency</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <p className="text-[11px] leading-relaxed opacity-70 font-medium">
                本文件作为 <b>Heovose Elevate</b> 的“数字宪法”，直接指导 AI Agent 的开发行为。
              </p>
              <div className="space-y-4">
                {[
                  "修改内容必须手动同步至云端。","定义规则后需重启 Agent 认知。","ID 生成规则具有最高优先级。"
                ].map((text, i) => (
                  <div key={i} className="flex gap-3 text-[10px] font-bold uppercase tracking-wider">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0 animate-pulse" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard className="border-none shadow-xl">
             <CardHeader className="p-8 border-b border-border/10">
                <CardTitle className="text-[11px] font-bold flex items-center gap-3 text-muted-foreground uppercase tracking-[0.2em]">
                  <Activity className="h-5 w-5 text-primary" />
                  元数据信息 (Manifest Info)
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                   <div className="flex justify-between items-center pb-3 border-b border-border/10">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Version</span>
                      <span className="text-xs font-bold text-foreground">v2.1.5-final</span>
                   </div>
                   <div className="flex justify-between items-center pb-3 border-b border-border/10">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Status</span>
                      <Badge className="bg-green-500 text-white border-none h-6 px-3 text-[9px] font-bold uppercase">Active</Badge>
                   </div>
                   <Button variant="ghost" size="sm" className="w-full h-12 rounded-2xl text-[10px] font-bold uppercase gap-2 text-muted-foreground hover:bg-muted/10" onClick={loadManifest}>
                     <History className="h-4 w-4" /> 刷新核心缓存
                   </Button>
                </div>
             </CardContent>
          </GlassCard>

          <GlassCard className="border-none bg-slate-950 p-8 text-white space-y-4 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-16 -translate-y-16" />
             <div className="relative z-10 flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-primary" />
                <h4 className="font-bold text-sm uppercase tracking-tight">外部资源链接</h4>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed font-medium">
               查阅项目 UI 组件库文档以确保全站设计原子的一致性。
             </p>
             <Button variant="outline" size="sm" className="w-full rounded-2xl h-12 bg-white/5 border-white/10 text-white text-[10px] uppercase font-bold gap-2 hover:bg-white/10 transition-all">
               ShadCN UI Documentation
             </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
