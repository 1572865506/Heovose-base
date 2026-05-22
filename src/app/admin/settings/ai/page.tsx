"use client";

import { useState, useEffect, useMemo } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Cpu, 
  Zap, 
  Settings2, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  LayoutGrid,
  Sparkles,
  Server,
  Cloud,
  Key,
  Database,
  Save,
  Loader2,
  Wand2,
  Terminal,
  ListChecks,
  ShieldAlert,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface AIProvider {
  id: string;
  name: string;
  type: 'google' | 'openai' | 'local' | 'browser-local';
  apiKey: string;
  model: string;
  baseUrl?: string;
  isActive: boolean;
  isPrimary: boolean;
  rpm?: number;
  lastTest?: {
    status: 'success' | 'failed';
    latency?: number;
    timestamp: string;
  };
}

interface AIConfig {
  isEnabled: boolean;
  providers: AIProvider[];
  fallbackStrategy: 'none' | 'next-available' | 'local-only';
  systemInstruction: string; // Global persona
  lastDiagnosis?: {
    status: 'success' | 'failed' | 'quota';
    timestamp: string;
    message?: string;
  };
  _version?: number;
}

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn(
    "bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-300",
    "admin-interface-dark:bg-slate-900/40 admin-interface-dark:border-slate-850 admin-interface-dark:shadow-none",
    className
  )}>
    {children}
  </div>
);

export default function AiManagementPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: aiConfig, isLoading, mutate } = useLocalDoc<AIConfig>('settings', 'ai');
  
  const [formData, setFormData] = useState<AIConfig>({
    isEnabled: true,
    providers: [],
    fallbackStrategy: 'next-available',
    systemInstruction: '你是一位专业的工业硬件制造专家，擅长将复杂的计算机硬件规格（如一体机、迷你电脑、工业显示器）翻译成地道、专业的商务语言。请保持术语的准确性，并统一单位。'
  });

  const [editingProvider, setEditingProvider] = useState<Partial<AIProvider> | null>(null);

  useEffect(() => {
    if (aiConfig) {
      setFormData({
        isEnabled: aiConfig.isEnabled ?? true,
        providers: aiConfig.providers || [],
        fallbackStrategy: aiConfig.fallbackStrategy || 'next-available',
        systemInstruction: aiConfig.systemInstruction || formData.systemInstruction,
        _version: (aiConfig as any)._version
      });
    }
  }, [aiConfig]);

  const handleSave = async (updatedData: any = formData) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        if (res.status === 409) {
          const errData = await res.json();
          throw new Error(errData.message || "配置已被他人修改，请刷新页面加载最新配置后再重试。");
        }
        throw new Error("保存失败，请检查网络或重试。");
      }

      const savedData = await res.json();
      setFormData(savedData);
      mutate();
      toast({ title: "AI 配置已同步", description: "新的调度策略已生效。" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "保存失败", description: e.message || "无法持久化 AI 设置。" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOrUpdateProvider = () => {
    if (!editingProvider?.name || !editingProvider?.model) return;

    const newProviders = [...formData.providers];
    const providerToSave = {
      ...editingProvider,
      id: editingProvider.id || `prov_${Date.now()}`,
      isActive: editingProvider.isActive ?? true,
      isPrimary: editingProvider.isPrimary ?? (newProviders.length === 0),
    } as AIProvider;

    if (providerToSave.isPrimary) {
      newProviders.forEach(p => p.isPrimary = false);
    }

    const index = newProviders.findIndex(p => p.id === providerToSave.id);
    if (index >= 0) {
      newProviders[index] = providerToSave;
    } else {
      newProviders.push(providerToSave);
    }

    const updated = { ...formData, providers: newProviders };
    setFormData(updated);
    handleSave(updated);
    setIsDialogOpen(false);
    setEditingProvider(null);
  };

  const handleDeleteProvider = (id: string) => {
    if (!confirm("确定要移除此 AI 节点吗？这将影响自动调度逻辑。")) return;
    const newProviders = formData.providers.filter(p => p.id !== id);
    if (newProviders.length > 0 && !newProviders.some(p => p.isPrimary)) {
      newProviders[0].isPrimary = true;
    }
    const updated = { ...formData, providers: newProviders };
    setFormData(updated);
    handleSave(updated);
  };

  const toggleProviderActive = (id: string, active: boolean) => {
    const newProviders = formData.providers.map(p => 
      p.id === id ? { ...p, isActive: active } : p
    );
    const updated = { ...formData, providers: newProviders };
    setFormData(updated);
    handleSave(updated);
  };

  const setPrimaryProvider = (id: string) => {
    const newProviders = formData.providers.map(p => ({
      ...p,
      isPrimary: p.id === id,
      isActive: p.id === id ? true : p.isActive
    }));
    const updated = { ...formData, providers: newProviders };
    setFormData(updated);
    handleSave(updated);
  };

  const testProvider = async (provider: AIProvider) => {
    setIsTesting(provider.id);
    try {
      let data;
      const startTime = Date.now();

      if (provider.type === 'browser-local') {
        // 方案：浏览器直连模式 (Browser-to-Local Direct)
        console.log(`[Browser LLM] Direct testing to ${provider.baseUrl}`);
        const res = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey || 'not-needed'}`
          },
          body: JSON.stringify({ 
            model: provider.model,
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 5
          })
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`浏览器无法连接本地端点 (${res.status}): ${errorText || '请检查 CORS 设置'}`);
        }
        
        const rawData = await res.json();
        data = {
          success: true,
          latency: Date.now() - startTime,
          responseText: rawData.choices?.[0]?.message?.content
        };
      } else {
        // 传统模式：服务器代理模式 (Server Proxy)
        const res = await fetch('/api/admin/ai/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            provider: provider.type,
            model: provider.model,
            apiKey: provider.apiKey,
            baseUrl: provider.baseUrl
          })
        });
        data = await res.json();
      }
      
      const testResult: AIProvider['lastTest'] = {
        status: data.success ? 'success' : 'failed',
        latency: data.latency,
        timestamp: new Date().toISOString()
      };

      const nextProviders = formData.providers.map(p => 
        p.id === provider.id ? { ...p, lastTest: testResult } : p
      );
      const updated = { ...formData, providers: nextProviders };
      setFormData(updated);
      handleSave(updated);

      if (data.success) {
        toast({ title: `${provider.name} 连接成功`, description: `延迟: ${data.latency}ms | 响应已验证。` });
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: `${provider.name} 连接失败`, description: e.message });
    } finally {
      setIsTesting(null);
    }
  };

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin opacity-20 text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 relative">
      {/* Aurora Backgrounds */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-[-5%] w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-200 group admin-interface-dark:bg-slate-800 admin-interface-dark:shadow-none">
              <Bot className={cn("h-7 w-7 transition-transform duration-500", formData.isEnabled ? "group-hover:rotate-12" : "opacity-40")} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-headline font-bold text-slate-900 tracking-tight admin-interface-dark:text-white">AI 智译中枢</h2>
                <Switch 
                  checked={formData.isEnabled} 
                  onCheckedChange={v => {
                    const updated = { ...formData, isEnabled: v };
                    setFormData(updated);
                    handleSave(updated);
                  }}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn(
                  "border-primary/20 text-[10px] font-bold uppercase tracking-widest px-3 py-0.5",
                  formData.isEnabled ? "bg-primary/5 text-primary" : "bg-slate-100 text-slate-400 admin-interface-dark:bg-slate-900 admin-interface-dark:text-slate-600 admin-interface-dark:border-slate-850"
                )}>
                  {formData.isEnabled ? 'Active Gateway' : 'Gateway Offline'}
                </Badge>
                <div className="h-1 w-1 rounded-full bg-slate-300 admin-interface-dark:bg-slate-800" />
                <span className="text-xs text-slate-400 font-medium italic admin-interface-dark:text-slate-500">管理全站算力分发与自动容灾</span>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingProvider({ type: 'google', isActive: true, isPrimary: formData.providers.length === 0 })}
              className="rounded-2xl h-14 px-8 gap-3 font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all bg-slate-900 text-white admin-interface-dark:bg-white admin-interface-dark:text-slate-900 admin-interface-dark:hover:bg-slate-100 admin-interface-dark:shadow-none"
            >
              <Plus className="h-4 w-4" /> 新增算力节点
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-[3rem] p-0 border-none bg-slate-50 overflow-hidden max-h-[90vh] flex flex-col admin-interface-dark:bg-slate-950 admin-interface-dark:border admin-interface-dark:border-slate-850">
            {/* 固定头部：标题 + 供应商选择 */}
            <div className="p-12 pb-8 bg-white border-b border-slate-100 shadow-sm z-10 admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-850 admin-interface-dark:shadow-none">
              <DialogHeader className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 admin-interface-dark:shadow-none">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <DialogTitle className="text-3xl font-headline font-bold text-slate-900 tracking-tight admin-interface-dark:text-white">
                    {editingProvider?.id ? '编辑算力节点' : '新增 AI 算力节点'}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm text-slate-500 leading-relaxed max-w-md font-medium admin-interface-dark:text-slate-400">
                  配置 AI 服务商信息。您可以接入主流云端大模型，或通过 OpenAI 兼容协议接入本地私有化部署的模型。
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1 admin-interface-dark:text-slate-500">供应商类型 (Provider Type)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'google', label: 'Gemini', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { id: 'openai', label: 'OpenAI', icon: Sparkles, color: 'text-green-500', bg: 'bg-green-50' },
                    { id: 'local', label: 'Local', icon: Server, color: 'text-slate-500', bg: 'bg-slate-50' },
                    { id: 'browser-local', label: 'Browser', icon: Monitor, color: 'text-purple-500', bg: 'bg-purple-50' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEditingProvider(prev => ({
                        ...prev, 
                        type: t.id as any, 
                        model: t.id === 'google' ? 'gemini-1.5-flash' : (t.id === 'openai' ? 'gpt-4o' : 'hy-mt1.5-1.8b')
                      }))}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl border transition-all duration-300",
                        editingProvider?.type === t.id 
                          ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm admin-interface-dark:bg-blue-950/30 admin-interface-dark:text-blue-400 admin-interface-dark:border-blue-800" 
                          : "border-slate-100 bg-white hover:border-slate-200 text-slate-600 admin-interface-dark:border-slate-800 admin-interface-dark:bg-slate-900 admin-interface-dark:text-slate-400 admin-interface-dark:hover:bg-slate-800/50"
                      )}
                    >
                      <t.icon className={cn("h-3.5 w-3.5 shrink-0", editingProvider?.type === t.id ? "text-blue-500" : "text-slate-400 admin-interface-dark:text-slate-500")} />
                      <span className="text-[10px] font-bold truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 滚动主体：具体参数配置 */}
            <div className="overflow-y-auto p-12 pt-8 scrollbar-none flex-1 space-y-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1 admin-interface-dark:text-slate-500">节点名称</Label>
                  <Input 
                    value={editingProvider?.name || ''} 
                    onChange={e => setEditingProvider(prev => ({...prev, name: e.target.value}))}
                    placeholder="例如: 生产力集群-A" 
                    className="rounded-xl h-12 bg-white border-slate-100 font-bold admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-800 admin-interface-dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1 admin-interface-dark:text-slate-500">模型标识 (Model ID)</Label>
                  <Input 
                    value={editingProvider?.model || ''} 
                    onChange={e => setEditingProvider(prev => ({...prev, model: e.target.value}))}
                    placeholder={editingProvider?.type === 'google' ? 'gemini-1.5-flash' : 'gpt-4o'} 
                    className="rounded-xl h-12 bg-white border-slate-100 font-mono text-xs font-bold admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-800 admin-interface-dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1 admin-interface-dark:text-slate-500">API 密钥 (Auth Token)</Label>
                <div className="relative">
                  <Input 
                    type="password"
                    value={editingProvider?.apiKey || ''} 
                    onChange={e => setEditingProvider(prev => ({...prev!, apiKey: e.target.value}))}
                    placeholder={editingProvider?.type === 'local' ? 'not-needed' : 'sk-****************'} 
                    className="rounded-xl h-12 bg-white border-slate-100 font-mono text-xs font-bold pl-10 admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-800 admin-interface-dark:text-white"
                  />
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 admin-interface-dark:text-slate-650" />
                </div>
              </div>

              {(editingProvider?.type === 'local' || editingProvider?.type === 'browser-local') && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1 admin-interface-dark:text-slate-500">
                    {editingProvider?.type === 'browser-local' ? '浏览器直连端点 (Direct URL)' : '服务器代理端点 (Proxy URL)'}
                  </Label>
                  <Input 
                    value={editingProvider?.baseUrl || ''} 
                    onChange={e => setEditingProvider(prev => ({...prev!, baseUrl: e.target.value}))}
                    placeholder={editingProvider?.type === 'browser-local' ? 'http://localhost:1234/v1' : 'http://172.x.x.x:1234/v1'} 
                    className="rounded-xl h-12 bg-white border-slate-100 font-mono text-xs font-bold admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-800 admin-interface-dark:text-white"
                  />
                  <p className="text-[9px] text-slate-400 italic px-1 mt-1 admin-interface-dark:text-slate-550">
                    {editingProvider?.type === 'browser-local' 
                      ? "基于浏览器直连模式。访问者将直接请求其本机的 127.0.0.1，请确保模型开启了 CORS。" 
                      : "基于服务器中转模式。翻译请求将由 WSL 服务器发起，需填写宿主机内网 IP。"}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-850">
                 <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-900 block admin-interface-dark:text-white">设为首选节点 (Primary)</span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-tight admin-interface-dark:text-slate-505">所有任务将优先通过此节点下发。</span>
                 </div>
                 <Switch 
                  checked={editingProvider?.isPrimary || false} 
                  onCheckedChange={checked => setEditingProvider(prev => ({...prev!, isPrimary: checked}))}
                 />
              </div>
            </div>

            {/* 固定底部：操作按钮 */}
            <DialogFooter className="p-8 bg-white border-t border-slate-100 sm:justify-between items-center admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-850">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 px-6 font-bold uppercase text-[10px] tracking-widest text-slate-400 admin-interface-dark:text-slate-500 admin-interface-dark:hover:bg-slate-800/50">取消</Button>
              <Button onClick={handleAddOrUpdateProvider} className="rounded-xl h-12 px-10 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 admin-interface-dark:bg-white admin-interface-dark:text-slate-900 admin-interface-dark:hover:bg-slate-100 admin-interface-dark:shadow-none">签署并同步</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Provider List (Left) */}
        <div className="lg:col-span-8 space-y-8">
          {formData.providers.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center gap-6 bg-white/40 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-300 admin-interface-dark:bg-slate-900/40 admin-interface-dark:border-slate-850 admin-interface-dark:shadow-none">
               <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 admin-interface-dark:bg-slate-800 admin-interface-dark:text-slate-700">
                  <Server className="h-10 w-10" />
               </div>
               <div className="text-center space-y-2">
                  <p className="font-bold text-slate-400 uppercase tracking-widest text-sm admin-interface-dark:text-slate-500">暂未配置任何算力节点</p>
                  <p className="text-xs text-slate-400 italic admin-interface-dark:text-slate-550">请添加一个 AI 供应商以启用智译功能。</p>
               </div>
               <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="rounded-xl px-8 border-primary/20 text-primary admin-interface-dark:border-slate-800 admin-interface-dark:text-slate-300 admin-interface-dark:hover:bg-slate-800">立即添加</Button>
            </div>
          ) : (
            <div className="space-y-6">
               {formData.providers.sort((a, b) => (a.isPrimary ? -1 : 1)).map((provider, index) => (
                <GlassCard key={provider.id} className={cn(
                  "border-none transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group",
                  provider.isPrimary && "ring-2 ring-primary ring-offset-4 admin-interface-dark:ring-offset-slate-950"
                )}>
                  <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden",
                        provider.type === 'google' ? "bg-blue-50 text-blue-600 admin-interface-dark:bg-blue-950/30 admin-interface-dark:text-blue-400" : 
                        provider.type === 'openai' ? "bg-green-50 text-green-600 admin-interface-dark:bg-green-950/30 admin-interface-dark:text-green-400" : 
                        "bg-slate-100 text-slate-600 admin-interface-dark:bg-slate-800 admin-interface-dark:text-slate-400"
                      )}>
                        {provider.type === 'google' ? <Zap className="h-8 w-8" /> : 
                         provider.type === 'openai' ? <Sparkles className="h-8 w-8" /> : 
                         <Server className="h-8 w-8" />}
                        {provider.isPrimary && (
                          <div className="absolute top-0 right-0 p-1">
                             <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(252,220,0,1)]" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400 border border-slate-200 admin-interface-dark:bg-slate-800 admin-interface-dark:border-slate-750 admin-interface-dark:text-slate-500">
                            #{index + 1}
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors admin-interface-dark:text-white admin-interface-dark:group-hover:text-blue-400">
                            {provider.name}
                          </h3>
                          {provider.isPrimary && (
                            <Badge className="bg-blue-600/10 text-blue-600 border-blue-200 hover:bg-blue-600/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider admin-interface-dark:bg-blue-950/50 admin-interface-dark:text-blue-400 admin-interface-dark:border-blue-900/30">
                              Primary Node
                            </Badge>
                          )}
                          {provider.lastTest && (
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              provider.lastTest.status === 'success' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 admin-interface-dark:bg-emerald-950/30 admin-interface-dark:text-emerald-400 admin-interface-dark:border-emerald-900/30' 
                                : 'bg-rose-50 text-rose-600 border-rose-200 admin-interface-dark:bg-rose-950/30 admin-interface-dark:text-rose-400 admin-interface-dark:border-rose-900/30'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                provider.lastTest.status === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                              }`} />
                              {provider.lastTest.status === 'success' ? `Online (${provider.lastTest.latency}ms)` : 'Offline'}
                            </div>
                          )}
                          {!provider.isActive && <Badge variant="outline" className="text-[8px] font-bold uppercase opacity-40 admin-interface-dark:border-slate-800 admin-interface-dark:text-slate-600">Disabled</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-400 admin-interface-dark:text-slate-500">
                          <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> {provider.model}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200 admin-interface-dark:bg-slate-800" />
                          <span className="flex items-center gap-1.5 capitalize"><Cloud className="h-3.5 w-3.5" /> {provider.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => testProvider(provider)}
                        disabled={isTesting === provider.id || !provider.isActive}
                        className={cn(
                          "rounded-xl h-11 px-6 font-bold uppercase text-[9px] tracking-widest gap-2 transition-all",
                          "bg-slate-50 text-slate-500 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 admin-interface-dark:bg-slate-800/50 admin-interface-dark:text-slate-400 admin-interface-dark:hover:bg-primary/20 admin-interface-dark:hover:text-primary"
                        )}
                      >
                        {isTesting === provider.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        {isTesting === provider.id ? '正在诊断' : '连接测试'}
                      </Button>
                      
                      <div className="flex items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100 admin-interface-dark:bg-slate-800/40 admin-interface-dark:border-slate-800">
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => { setEditingProvider(provider); setIsDialogOpen(true); }}
                          className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-primary transition-all admin-interface-dark:hover:bg-slate-800"
                         >
                            <Settings2 className="h-4 w-4" />
                         </Button>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteProvider(provider.id)}
                          className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-destructive transition-all admin-interface-dark:hover:bg-slate-800"
                         >
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>

                      <Switch 
                        checked={provider.isActive} 
                        onCheckedChange={(checked) => toggleProviderActive(provider.id, checked)}
                      />
                    </div>
                  </div>

                  {provider.baseUrl && (
                    <div className="px-8 pb-6">
                       <div className="bg-slate-900/5 rounded-2xl p-4 flex items-center justify-between border border-slate-900/5 admin-interface-dark:bg-slate-950/50 admin-interface-dark:border-slate-850">
                          <div className="flex items-center gap-3">
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400 admin-interface-dark:text-slate-550" />
                            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-tight admin-interface-dark:text-slate-400">Endpoint: {provider.baseUrl}</span>
                          </div>
                          <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 text-[8px] font-bold admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-800 admin-interface-dark:text-slate-500">LOCAL PROXY ACTIVE</Badge>
                       </div>
                    </div>
                  )}

                  {!provider.isPrimary && provider.isActive && (
                    <div className="px-8 pb-6 pt-0 opacity-0 group-hover:opacity-100 transition-all">
                       <Button 
                        onClick={() => setPrimaryProvider(provider.id)}
                        className="w-full rounded-xl h-10 border-dashed border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all text-[9px] font-bold uppercase tracking-widest admin-interface-dark:bg-primary/10 admin-interface-dark:text-primary admin-interface-dark:hover:bg-primary admin-interface-dark:hover:text-white"
                       >
                         提升为此集群的主节点 (Set as Primary)
                       </Button>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          )}

          {/* AI 人设模块 (完美修复版) */}
          <div className="bg-white/60 backdrop-blur-md border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/20 group/persona admin-interface-dark:bg-slate-900/40 admin-interface-dark:border-slate-850 admin-interface-dark:shadow-none">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between admin-interface-dark:border-slate-850">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shadow-inner admin-interface-dark:bg-primary/10">
                  <Wand2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-slate-900 admin-interface-dark:text-white">AI 专家人设与执行准则</h3>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1 admin-interface-dark:text-slate-500">Expert System Prompt Injection</p>
                </div>
              </div>
              <Button 
                onClick={() => handleSave(formData)}
                disabled={isSaving}
                className="rounded-full px-6 bg-slate-900 hover:bg-primary text-white transition-all shadow-lg hover:shadow-primary/20 group admin-interface-dark:bg-white admin-interface-dark:text-slate-900 admin-interface-dark:hover:bg-slate-100 admin-interface-dark:shadow-none"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />}
                <span className="text-xs font-bold">保存人设</span>
              </Button>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 admin-interface-dark:text-slate-500">
                    <Terminal className="h-4 w-4 text-primary" /> 全局系统指令 (System Prompt)
                  </Label>
                  <span className="text-[10px] font-mono text-slate-300 admin-interface-dark:text-slate-600">{formData.systemInstruction?.length || 0} / 4096</span>
                </div>
                
                <div className="relative">
                  <Textarea 
                    value={formData.systemInstruction}
                    onChange={(e) => setFormData({ ...formData, systemInstruction: e.target.value })}
                    placeholder="输入 AI 的全局系统提示词..."
                    className="min-h-[220px] rounded-[2.5rem] bg-white border-slate-200 focus:border-primary transition-all p-8 text-slate-700 leading-relaxed text-sm shadow-inner resize-none admin-interface-dark:bg-slate-950/60 admin-interface-dark:border-slate-800 admin-interface-dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center gap-4 admin-interface-dark:bg-slate-900/40 admin-interface-dark:border-slate-850 admin-interface-dark:shadow-none">
                  <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500 admin-interface-dark:bg-green-950/30 admin-interface-dark:text-green-400">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 admin-interface-dark:text-slate-200">术语库动态映射</p>
                    <p className="text-[9px] text-slate-400 font-medium admin-interface-dark:text-slate-500">已激活工业级硬件字典</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm flex items-center gap-4 admin-interface-dark:bg-slate-900/40 admin-interface-dark:border-slate-850 admin-interface-dark:shadow-none">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 admin-interface-dark:bg-blue-950/30 admin-interface-dark:text-blue-400">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 admin-interface-dark:text-slate-200">语义结构保护</p>
                    <p className="text-[9px] text-slate-400 font-medium admin-interface-dark:text-slate-500">防止 HTML 标签解析冲突</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Configuration (Right) */}
        <div className="lg:col-span-4 space-y-8">
           <GlassCard className="border-none bg-slate-900 text-white p-8 space-y-10 shadow-2xl admin-interface-dark:bg-slate-950 admin-interface-dark:border admin-interface-dark:border-slate-850/50 admin-interface-dark:shadow-none">
              <div className="space-y-2">
                 <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">全局调度协议</h4>
                 <p className="text-xs text-white/40 font-medium">配置当主节点出现异常或额度耗尽时的自动处理逻辑。</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30 pl-1">容灾策略 (Fallback)</Label>
                    <Select 
                      value={formData.fallbackStrategy} 
                      onValueChange={(v: any) => {
                        const updated = { ...formData, fallbackStrategy: v };
                        setFormData(updated);
                        handleSave(updated);
                      }}
                    >
                      <SelectTrigger className="rounded-xl h-12 bg-white/5 border-white/10 font-bold text-white shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-slate-900 text-white border-white/10 admin-interface-dark:bg-slate-950 admin-interface-dark:border-slate-850">
                        <SelectItem value="next-available">按优先级顺延</SelectItem>
                        <SelectItem value="local-only">仅回退至本地节点</SelectItem>
                        <SelectItem value="none">禁止回退 (直接报错)</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>

                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                       <Zap className="h-4 w-4 text-primary" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">当前集群健康度</span>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] text-white/30 font-medium">可用节点</span>
                          <span className="text-xs font-bold font-mono">
                            {formData.providers.filter(p => p.isActive && (p.lastTest?.status === 'success' || !p.lastTest)).length} / {formData.providers.length}
                          </span>
                       </div>
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000" 
                            style={{ 
                              width: `${formData.providers.length > 0 
                                ? (formData.providers.filter(p => p.isActive && (p.lastTest?.status === 'success' || !p.lastTest)).length / formData.providers.length) * 100 
                                : 0}%` 
                            }} 
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-primary/40" />
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">System Engine v2.5</span>
                 </div>
                 <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
              </div>
           </GlassCard>

           <GlassCard className="border-none p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <Sparkles className="h-5 w-5 text-primary" />
                 <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 admin-interface-dark:text-white">使用建议</h4>
              </div>
              <ul className="space-y-4">
                 {[
                   "建议将 Gemini 1.5 Flash 作为主节点，其处理速度最快且带有较大的免费配额。",
                   "如果涉及极其复杂的排版逻辑，建议备选一个 GPT-4o 节点作为高质量兜底。",
                   "内网部署环境请优先启用 Local 节点，将 Base URL 指向 Ollama 服务以降低延迟。",
                   "定期执行连接测试，确保 API 密钥尚未失效。"
                 ].map((tip, i) => (
                   <li key={i} className="flex gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium admin-interface-dark:text-slate-400">{tip}</p>
                   </li>
                 ))}
              </ul>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
