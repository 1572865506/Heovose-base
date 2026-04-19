
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
  ExternalLink,
  Eye,
  Edit3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            系统设计与功能规范白皮书
          </h2>
          <p className="text-xs text-muted-foreground">本项目治理的最高准则。任何重大业务逻辑修改均需在此备案。</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-9 px-3 bg-green-50 text-green-700 border-green-200 gap-1.5 font-bold text-[10px] uppercase">
            <CheckCircle2 className="h-3 w-3" /> 契约生效中
          </Badge>
          <Button onClick={handleSave} disabled={isSaving} className="rounded-lg h-10 px-6 gap-2 font-bold uppercase tracking-widest text-xs shadow-md">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            签署并保存变更
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-muted/30 p-1 rounded-xl mb-4 h-11">
              <TabsTrigger value="edit" className="rounded-lg px-6 text-[11px] font-bold uppercase tracking-wider gap-2">
                <Edit3 className="h-3.5 w-3.5" /> 编辑模式
              </TabsTrigger>
              <TabsTrigger value="preview" className="rounded-lg px-6 text-[11px] font-bold uppercase tracking-wider gap-2">
                <Eye className="h-3.5 w-3.5" /> 预览模式
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="m-0 focus-visible:ring-0">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <Textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="relative min-h-[calc(100vh-320px)] rounded-2xl p-8 bg-white border-border/40 shadow-2xl font-mono text-[13px] leading-relaxed resize-none focus-visible:ring-primary/20"
                  placeholder="# 在此输入系统规范内容..."
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="m-0">
              <div className="bg-white rounded-2xl p-10 border border-border/40 shadow-xl min-h-[calc(100vh-320px)] prose prose-sm max-w-none prose-slate prose-headings:font-headline prose-headings:text-primary">
                {/* 简单的 Markdown 预览模拟 */}
                <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-slate-700">
                  {content}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border-orange-200 bg-orange-50/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-orange-700 uppercase tracking-widest">
                <AlertTriangle className="h-4 w-4" /> 授权与准则
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-orange-800/80 leading-relaxed font-medium">
                本文件是 <b>AI Agent (App Prototyper)</b> 执行开发的底层逻辑依据。
              </p>
              <ul className="space-y-3 text-[10px] text-orange-900/60">
                <li className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1 shrink-0" />
                  <span>修改本白皮书条款后，必须点击右上方“保存”按钮才能生效。</span>
                </li>
                <li className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1 shrink-0" />
                  <span>AI Agent 在后续开发中会优先比对本文档中的逻辑（如 ID 生成规则）。</span>
                </li>
                <li className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1 shrink-0" />
                  <span>如果您在此文档中定义了新规则，请在对话中明确告知 AI 重新同步。</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/40 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-widest">文档信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-[10px] border-b border-dashed pb-2">
                <span className="text-muted-foreground uppercase">文件位置</span>
                <code className="bg-muted px-1.5 py-0.5 rounded text-primary">/docs/manifest.md</code>
              </div>
              <div className="flex justify-between items-center text-[10px] border-b border-dashed pb-2">
                <span className="text-muted-foreground uppercase">当前版本</span>
                <span className="font-bold">v1.0.2-governance</span>
              </div>
              <div className="pt-2">
                 <Button variant="ghost" size="sm" className="w-full text-[9px] font-bold uppercase gap-2 text-primary/60" onClick={loadManifest}>
                   <History className="h-3 w-3" /> 强制刷新本地缓存
                 </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-primary rounded-2xl text-white space-y-4 shadow-xl">
             <div className="flex items-center gap-2">
               <FileText className="h-5 w-5 text-accent" />
               <h4 className="font-bold text-sm uppercase tracking-tight">外部资源</h4>
             </div>
             <p className="text-[10px] opacity-60 leading-relaxed">
               查阅项目 UI 组件库文档以确保开发一致性。
             </p>
             <Button variant="outline" size="sm" className="w-full rounded-xl bg-white/10 border-white/20 text-white text-[10px] uppercase font-bold gap-2">
               ShadCN UI 规范 <ExternalLink className="h-3 w-3" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
