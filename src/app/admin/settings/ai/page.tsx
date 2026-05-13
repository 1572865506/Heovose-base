
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Sparkles, 
  Cpu, 
  Save, 
  Bot, 
  Zap, 
  BrainCircuit, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Terminal, 
  Key, 
  Eye, 
  EyeOff, 
  Clock, 
  Wand2,
  ListChecks,
  Hammer,
  ShieldAlert,
  Info,
  Gauge,
  LayoutGrid,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { testAiConnection } from '@/ai/flows/test-connection-flow';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { AI_MODELS, getModelQuota } from '@/lib/ai-models';

interface DiagnosisRecord {
  status: 'idle' | 'running' | 'success' | 'failed' | 'quota';
  message: string;
  latency?: number;
  modelUsed?: string;
  keySource?: string;
  timestamp?: any;
}

interface AiConfig {
  isEnabled: boolean;
  model: string;
  apiKey: string;
  temperature: number;
  systemInstruction: string;
  isInquiryAiEnabled: boolean;
  inquirySystemInstruction: string;
  lastDiagnosis?: DiagnosisRecord;
}

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden", className)}>
    {children}
  </div>
);

export default function AiSettingsPage() {
  const { toast } = useToast();
  const { data: aiConfig, isLoading: isConfigLoading } = useLocalDoc<AiConfig>('settings', 'ai');

  const [formData, setFormData] = useState<AiConfig>({
    isEnabled: true,
    model: 'googleai/gemini-2.0-flash',
    apiKey: '',
    temperature: 0.7,
    systemInstruction: '你是一位专业的工业硬件制造专家，擅长将复杂的计算机硬件规格（如一体机、迷你电脑、工业显示器）翻译成地道、专业的商务语言。请保持术语的准确性，并统一单位。',
    isInquiryAiEnabled: false,
    inquirySystemInstruction: '你是一位资深的商务拓展经理，负责初步回复客户的询盘。请根据用户的留言内容，表达感谢，并告知我们的专家会尽快联系。回复需专业、礼貌，且简洁。'
  });

  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [testReport, setTestResult] = useState<DiagnosisRecord>({ 
    status: 'idle', 
    message: '尚未运行自检' 
  });

  useEffect(() => {
    if (aiConfig) {
      setFormData({
        ...aiConfig,
        apiKey: aiConfig.apiKey || '',
        isEnabled: aiConfig.isEnabled ?? true,
        temperature: aiConfig.temperature ?? 0.7,
        systemInstruction: aiConfig.systemInstruction || formData.systemInstruction,
        isInquiryAiEnabled: aiConfig.isInquiryAiEnabled ?? false,
        inquirySystemInstruction: aiConfig.inquirySystemInstruction || formData.inquirySystemInstruction
      });
      
      if (aiConfig.lastDiagnosis) {
        setTestResult(aiConfig.lastDiagnosis);
      }
    }
  }, [aiConfig]);

  const currentQuota = useMemo(() => {
    return getModelQuota(formData.model);
  }, [formData.model]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await fetch('/api/settings/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lastDiagnosis: testReport,
        }),
      });

      setIsSaving(false);
      toast({ 
        title: "配置已同步至云端", 
        description: "AI 引擎配置及诊断状态已持久化保存。" 
      });
    } catch (e) {
      setIsSaving(false);
      toast({ variant: "destructive", title: "同步失败" });
    }
  };

  const runAutoTest = async () => {
    setIsTesting(true);
    setTestResult({ status: 'running', message: '正在建立动态连接进行诊断...' });
    
    try {
      const result = await testAiConnection({
        model: formData.model,
        systemInstruction: formData.systemInstruction,
        apiKey: formData.apiKey
      });

      const newReport: DiagnosisRecord = result.status === 'ok' 
        ? { 
            status: 'success', 
            message: result.message, 
            latency: result.latency,
            modelUsed: result.modelUsed,
            keySource: result.keySource,
            timestamp: new Date().toISOString()
          }
        : { 
            status: result.message.includes('429') ? 'quota' : 'failed', 
            message: result.message,
            modelUsed: result.modelUsed,
            keySource: result.keySource,
            timestamp: new Date().toISOString()
          };

      setTestResult(newReport);

      if (result.status === 'ok') {
        toast({ title: "连接自检通过" });
      } else if (newReport.status === 'quota') {
        toast({ 
          variant: "default",
          title: "验证通过，但配额受限", 
          description: "配置有效。请点击下方“部署配置”保存状态。" 
        });
      } else {
        toast({ variant: "destructive", title: "自检失败" });
      }
    } catch (e: any) {
      setTestResult({ status: 'failed', message: `内部通讯异常: ${e.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20 relative">
      {/* Background Aurora Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] bg-accent/10 blur-[100px] rounded-full -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-headline font-bold text-slate-900">AI 智译中枢</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-2xl pl-1">配置全站级 Gemini 2.5 核心引擎、专家级翻译指令及云端 API 交互链路。</p>
        </div>
        
        <div className="flex items-center gap-4">
          {testReport.timestamp && (
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mr-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              Synced: {new Date(testReport.timestamp).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-full h-12 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            签署并同步引擎配置
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <GlassCard className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
              <div className="relative z-10 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-headline font-bold">引擎核心协议</CardTitle>
                    <CardDescription className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-1 font-bold">Gemini-Pro High Performance Mode</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mr-2">服务状态</span>
                  <Switch 
                    checked={formData.isEnabled} 
                    onCheckedChange={(v) => setFormData({...formData, isEnabled: v})} 
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </div>
            <CardContent className="p-10 space-y-10">
              <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 pl-1">
                  <Key className="h-4 w-4 text-primary" /> Studio Authorization Key
                </Label>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <Input 
                    type={showKey ? "text" : "password"}
                    placeholder="在此粘贴您的 Google AI API Key..."
                    value={formData.apiKey}
                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                    className="relative h-14 rounded-2xl bg-slate-50 border-slate-100 pr-12 font-mono text-sm focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-inner"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                  >
                    {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label className="text-[11px] font-bold uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 pl-1">
                    <Cpu className="h-4 w-4 text-primary" /> 计算模型版本
                  </Label>
                  <Select 
                    value={formData.model} 
                    onValueChange={(v) => setFormData({...formData, model: v})}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 shadow-inner">
                      <SelectValue placeholder="选择计算模型" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      {AI_MODELS.map(m => (
                        <SelectItem key={m.id} value={m.id} className="rounded-xl h-10 text-xs font-bold my-1">
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-[11px] font-bold uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 pl-1">
                    <Zap className="h-4 w-4 text-primary" /> 逻辑创造力权重 (Temp: {formData.temperature})
                  </Label>
                  <div className="pt-4 px-2">
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={formData.temperature ?? 0.7}
                      onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                      <span>严格还原</span>
                      <span>平衡</span>
                      <span>发散创造</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard className="border-none shadow-xl">
            <CardHeader className="p-8 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-inner">
                    <Wand2 className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline font-bold text-slate-900">AI 翻译专家人设协议</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Global Translation System Payload</CardDescription>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider px-4 h-7 rounded-full">ACTIVE PAYLOAD</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" /> 全局系统指令 (System Payload)
                  </Label>
                  <span className="text-[10px] font-mono text-slate-300">{formData.systemInstruction.length} / 4096</span>
                </div>
                <div className="relative">
                  <div className="absolute top-4 left-4 h-full w-[2px] bg-primary/20 rounded-full" />
                  <Textarea 
                    value={formData.systemInstruction}
                    onChange={(e) => setFormData({...formData, systemInstruction: e.target.value})}
                    className="min-h-[160px] rounded-2xl border-slate-100 bg-slate-50/50 pl-10 pt-6 text-sm leading-relaxed font-medium focus-visible:ring-2 focus-visible:ring-primary/10 shadow-inner resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-green-500">
                      <ListChecks className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">术语库动态映射</span>
                      <span className="text-[10px] text-slate-400">已激活工业级硬件字典</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-500">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">语义结构保护</span>
                      <span className="text-[10px] text-slate-400">防止 HTML 标签解析冲突</span>
                    </div>
                 </div>
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard className="border-none shadow-xl">
            <CardHeader className="p-8 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline font-bold text-slate-900">询盘系统 AI 自动化</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Automated Inquiry Response Protocol</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mr-2">开启 AI 回复</span>
                  <Switch 
                    checked={formData.isInquiryAiEnabled} 
                    onCheckedChange={(v) => setFormData({...formData, isInquiryAiEnabled: v})} 
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" /> AI 回复人设准则 (System Prompt)
                  </Label>
                </div>
                <div className="relative">
                  <div className="absolute top-4 left-4 h-full w-[2px] bg-orange-500/20 rounded-full" />
                  <Textarea 
                    value={formData.inquirySystemInstruction}
                    onChange={(e) => setFormData({...formData, inquirySystemInstruction: e.target.value})}
                    placeholder="设置 AI 如何回复客户的询盘留言..."
                    className="min-h-[160px] rounded-2xl border-slate-100 bg-slate-50/50 pl-10 pt-6 text-sm leading-relaxed font-medium focus-visible:ring-2 focus-visible:ring-primary/10 shadow-inner resize-none"
                  />
                </div>
              </div>
              <div className="p-5 bg-blue-50 rounded-[1.5rem] border border-blue-100 flex gap-4">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-1" />
                <p className="text-[10px] text-blue-900/60 leading-relaxed font-medium italic">
                  启用后，系统将在接收到有效询盘后自动生成一份初步答复，作为客户跟进的第一步。
                </p>
              </div>
            </CardContent>
          </GlassCard>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <GlassCard className="border-none bg-slate-900 text-white shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-[11px] font-bold flex items-center gap-3 uppercase tracking-[0.2em] text-primary">
                <Activity className="h-5 w-5 text-accent animate-pulse" />
                连通性实时监控
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className={cn(
                "p-6 rounded-[2rem] border transition-all min-h-[160px] relative overflow-hidden flex flex-col justify-center",
                testReport.status === 'success' ? "bg-green-500/10 border-green-500/20 text-green-400" : 
                testReport.status === 'quota' ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                testReport.status === 'failed' ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/5 border-white/5 text-white/40"
              )}>
                <div className="flex items-start gap-4">
                   <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                     {testReport.status === 'running' ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : 
                      testReport.status === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-400" /> :
                      testReport.status === 'quota' ? <Clock className="h-5 w-5 text-orange-400" /> :
                      testReport.status === 'failed' ? <AlertCircle className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                   </div>
                   <div className="space-y-2 flex-1">
                      <p className="font-bold uppercase tracking-widest text-xs">诊断报告 (Report)</p>
                      <p className="opacity-80 leading-relaxed text-[11px] font-medium">{testReport.message}</p>
                      
                      {testReport.modelUsed && (
                        <div className="mt-4 flex items-center gap-3">
                           <div className="px-2 py-1 bg-black/40 rounded-lg font-mono text-[9px] border border-white/5">
                             ID: {testReport.modelUsed.split('/').pop()}
                           </div>
                           {testReport.latency && <div className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">Delay: {testReport.latency}ms</div>}
                        </div>
                      )}
                   </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                disabled={isTesting}
                onClick={runAutoTest}
                className="w-full rounded-2xl h-14 font-bold text-xs uppercase tracking-widest border-white/10 text-white bg-white/5 hover:bg-white/10 transition-all shadow-2xl"
              >
                {isTesting ? '正在尝试握手鉴权...' : '执行连通性自检'}
              </Button>
            </CardContent>
          </GlassCard>

          <GlassCard className="border-none shadow-xl">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-[11px] font-bold flex items-center gap-3 text-slate-400 uppercase tracking-[0.2em]">
                <Gauge className="h-5 w-5 text-primary" />
                模型资源负载控制
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-300 uppercase">当前计算力</p>
                      <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase h-6 px-3">{currentQuota.name.split(' ').pop()}</Badge>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-300 uppercase">RPM 峰值</p>
                      <p className="text-3xl font-headline font-bold text-slate-900">{currentQuota.rpm}</p>
                   </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400">
                    <span>每日配额消耗 (RPD)</span>
                    <span className="text-slate-900">{currentQuota.rpd} / DAY</span>
                  </div>
                  <Progress value={(currentQuota.rpd / 1000) * 100} className="h-2 bg-slate-100" />
                </div>

                <div className="p-5 bg-orange-50 rounded-[1.5rem] border border-orange-100 flex gap-4">
                   <ShieldAlert className="h-5 w-5 text-orange-600 shrink-0 mt-1" />
                   <p className="text-[10px] text-orange-900/60 leading-relaxed font-medium italic">
                     <b>安全基则：</b>由于当前处于免费层级，输入的数据将通过 Google AI 隐私隧道进行训练改进，请避免输入核心商业机密文稿。
                   </p>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
