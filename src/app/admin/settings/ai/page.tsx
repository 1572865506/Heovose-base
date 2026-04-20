
"use client";

import { useState, useEffect, useMemo } from 'react';
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
  BarChart3,
  Gauge
} from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { testAiConnection } from '@/ai/flows/test-connection-flow';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface AiConfig {
  isEnabled: boolean;
  model: string;
  apiKey: string;
  temperature: number;
  systemInstruction: string;
}

// 2026 免费层级配额映射表
const QUOTA_DATA: Record<string, { rpm: number, rpd: number, tpm: string, desc: string }> = {
  'googleai/gemini-2.5-flash': { rpm: 10, rpd: 250, tpm: '1M', desc: '适合常规产品信息翻译。' },
  'googleai/gemini-2.5-flash-lite': { rpm: 15, rpd: 1000, tpm: '4M', desc: '高频并发首选，配额最充裕。' },
  'googleai/gemini-2.5-pro': { rpm: 5, rpd: 100, tpm: '32K', desc: '深度排版专用，极易触发 429。' }
};

export default function AiSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const aiRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'ai') : null, [firestore]);
  const { data: aiConfig } = useDoc<AiConfig>(aiRef);

  const [formData, setFormData] = useState<AiConfig>({
    isEnabled: true,
    model: 'googleai/gemini-2.5-flash',
    apiKey: '',
    temperature: 0.7,
    systemInstruction: '你是一位专业的工业硬件制造专家，擅长将复杂的计算机硬件规格（如一体机、迷你电脑、工业显示器）翻译成地道、专业的商务语言。请保持术语的准确性，并统一单位。'
  });

  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testReport, setTestResult] = useState<{
    status: 'idle' | 'running' | 'success' | 'failed' | 'quota',
    message: string,
    latency?: number,
    modelUsed?: string,
    keySource?: string
  }>({ status: 'idle', message: '尚未运行自检' });

  useEffect(() => {
    if (aiConfig) {
      setFormData({
        ...aiConfig,
        apiKey: aiConfig.apiKey || '',
        systemInstruction: aiConfig.systemInstruction || formData.systemInstruction
      });
    }
  }, [aiConfig]);

  // 计算当前选中模型的配额
  const currentQuota = useMemo(() => {
    return QUOTA_DATA[formData.model] || QUOTA_DATA['googleai/gemini-2.5-flash'];
  }, [formData.model]);

  const handleSave = () => {
    if (!firestore) return;
    setIsSaving(true);
    
    setDocumentNonBlocking(doc(firestore, 'settings', 'ai'), {
      ...formData,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTimeout(() => {
      setIsSaving(false);
      toast({ 
        title: "配置已同步至云端", 
        description: "AI 智译引擎及其专家人设已根据新参数重新就绪。" 
      });
    }, 800);
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

      if (result.status === 'ok') {
        setTestResult({ 
          status: 'success', 
          message: result.message, 
          latency: result.latency,
          modelUsed: result.modelUsed,
          keySource: result.keySource
        });
        toast({ title: "连接自检通过" });
      } else {
        const isQuotaError = result.message.includes('429');
        setTestResult({ 
          status: isQuotaError ? 'quota' : 'failed', 
          message: result.message,
          modelUsed: result.modelUsed,
          keySource: result.keySource
        });
        
        if (isQuotaError) {
          toast({ 
            variant: "default",
            title: "验证通过，但配额受限", 
            description: "这意味着您的 Key 和模型 ID 是有效的。点击下方“部署配置”即可保存。" 
          });
        } else {
          toast({ variant: "destructive", title: "自检失败", description: "请查看诊断报告" });
        }
      }
    } catch (e: any) {
      setTestResult({ status: 'failed', message: `内部通讯异常: ${e.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" /> AI 智译中枢管理
          </h2>
          <p className="text-xs text-muted-foreground">配置 Google AI Studio API 密钥、2026 版 Gemini 2.5 模型及专家指令。</p>
        </div>
        <Badge variant="outline" className={cn(
          "h-9 px-3 rounded-lg gap-2 font-bold text-[10px] uppercase",
          testReport.status === 'success' ? "bg-green-50 text-green-700 border-green-200" : 
          testReport.status === 'quota' ? "bg-orange-50 text-orange-700 border-orange-200" :
          "bg-primary/5 text-primary border-primary/20"
        )}>
          {testReport.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : 
           testReport.status === 'quota' ? <Clock className="h-3 w-3" /> :
           <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />}
          状态: {testReport.status === 'success' ? '已就绪' : testReport.status === 'quota' ? '配额受限' : '待诊断'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Core Config Card */}
          <Card className="rounded-2xl border-none shadow-2xl overflow-hidden">
            <div className="bg-primary p-6 text-white">
              <CardHeader className="p-0 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-lg font-bold">核心引擎配置</CardTitle>
                    <CardDescription className="text-white/60 text-xs uppercase tracking-widest">Gemini 2.5 Generation</CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={formData.isEnabled} 
                  onCheckedChange={(v) => setFormData({...formData, isEnabled: v})} 
                  className="data-[state=checked]:bg-accent"
                />
              </CardHeader>
            </div>
            <CardContent className="p-8 space-y-8 bg-white">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                  <Key className="h-3.5 w-3.5" /> Google AI API 密钥 (Studio Key)
                </Label>
                <div className="relative group">
                  <Input 
                    type={showKey ? "text" : "password"}
                    placeholder="在此粘贴您的 AI Studio API Key..."
                    value={formData.apiKey}
                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                    className="h-11 rounded-xl bg-muted/5 pr-10 font-mono text-sm border-muted/40 focus:bg-white transition-all"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2"><Cpu className="h-3.5 w-3.5" /> 选用模型 (2026 最新版)</Label>
                  <Select 
                    value={formData.model} 
                    onValueChange={(v) => {
                      setFormData({...formData, model: v});
                      // 切换模型后重置诊断状态
                      setTestResult({ status: 'idle', message: '切换模型后请重新测试' });
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/10 border-transparent font-medium">
                      <SelectValue placeholder="选择 AI 模型" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="googleai/gemini-2.5-flash" className="text-xs font-bold">Gemini 2.5 Flash (综合均衡)</SelectItem>
                      <SelectItem value="googleai/gemini-2.5-flash-lite" className="text-xs font-bold">Gemini 2.5 Flash-Lite (高频并发)</SelectItem>
                      <SelectItem value="googleai/gemini-2.5-pro" className="text-xs font-bold">Gemini 2.5 Pro (深度长文排版)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2"><Zap className="h-3.5 w-3.5" /> 创造力权重 ({formData.temperature})</Label>
                  <div className="flex items-center gap-4 py-3">
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                      className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Expert Persona & Skill Card */}
          <Card className="rounded-2xl border border-border/40 shadow-xl overflow-hidden bg-white">
            <CardHeader className="p-6 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest">AI 专家人设与专业指令</CardTitle>
                    <CardDescription className="text-[10px]">定义 AI 在产品翻译任务中的专业身份与偏好。</CardDescription>
                  </div>
                </div>
                <Badge className="bg-primary/5 text-primary border-primary/10 text-[9px] uppercase h-5">Expert Skill v2.5</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase opacity-60 flex items-center gap-1.5">
                    <Hammer className="h-3 w-3" /> 系统级专家指令 (Skill Payload)
                  </Label>
                  <span className="text-[9px] font-mono opacity-40">{formData.systemInstruction.length} chars</span>
                </div>
                <Textarea 
                  value={formData.systemInstruction}
                  onChange={(e) => setFormData({...formData, systemInstruction: e.target.value})}
                  className="min-h-[160px] rounded-xl border-muted/60 bg-muted/5 focus:bg-white transition-all text-sm leading-relaxed"
                  placeholder="在此输入专家指令，例如：你是一位硬件制造专家..."
                />
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <ListChecks className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">当前挂载的静态技能 (Hardcoded Skills)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                   <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-primary/10 text-[10px] font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> 硬件专业术语动态检索 (Glossary)
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-primary/10 text-[10px] font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> HTML 长文排版无损重排 (DOM Integrity)
                   </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/5 p-6 flex justify-end border-t">
               <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="rounded-xl h-11 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-lg min-w-[160px]"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                部署配置并生效
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Diagnostic Panel & Quota Card (Right Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 3. Diagnostic Panel */}
          <Card className="rounded-2xl border-none bg-white shadow-xl overflow-hidden h-fit">
            <CardHeader className="p-6 pb-2 border-b">
              <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-primary uppercase tracking-[0.2em]">
                <Activity className="h-4 w-4 text-accent" />
                动态连通性诊断
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className={cn(
                "p-4 rounded-xl border transition-all text-xs min-h-[120px]",
                testReport.status === 'success' ? "bg-green-50 border-green-100 text-green-800" : 
                testReport.status === 'quota' ? "bg-orange-50 border-orange-100 text-orange-800" :
                testReport.status === 'failed' ? "bg-destructive/5 border-destructive/10 text-destructive" : "bg-muted/30 border-border/40 text-muted-foreground"
              )}>
                <div className="flex items-start gap-3">
                   {testReport.status === 'running' ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : 
                    testReport.status === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                    testReport.status === 'quota' ? <Clock className="h-4 w-4 text-orange-600" /> :
                    testReport.status === 'failed' ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                   <div className="space-y-1 flex-1">
                      <p className="font-bold uppercase tracking-tighter">诊断报告</p>
                      <p className="opacity-80 leading-relaxed text-[11px]">{testReport.message}</p>
                      
                      {testReport.status === 'quota' && (
                        <div className="mt-3 p-2 bg-white/50 rounded border border-orange-200 text-[10px] text-orange-900 italic">
                          <b>验证结果：</b>这说明您的 Key 和模型 ID 是有效的！只需点击“部署配置”保存即可。
                        </div>
                      )}

                      {testReport.modelUsed && (
                        <div className="mt-3 space-y-1.5">
                           <div className="flex items-center gap-1.5 font-mono text-[9px] bg-black/5 p-1 rounded">
                             <Terminal className="h-2.5 w-2.5 opacity-40" /> ID: {testReport.modelUsed}
                           </div>
                        </div>
                      )}
                      {testReport.latency && <p className="mt-2 font-mono font-bold text-primary">Latency: {testReport.latency}ms</p>}
                   </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                disabled={isTesting}
                onClick={runAutoTest}
                className="w-full rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 shadow-inner"
              >
                {isTesting ? '正在尝试握手...' : '立即测试当前配置'}
              </Button>
            </CardContent>
          </Card>

          {/* 4. Quota Board (New Visual Placement) */}
          <Card className="rounded-2xl border-none bg-white shadow-xl overflow-hidden">
            <CardHeader className="p-6 pb-2 border-b bg-muted/10">
              <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-primary uppercase tracking-[0.2em]">
                <Gauge className="h-4 w-4 text-blue-500" />
                当前模型配额看板
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">选用模型</p>
                      <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase">{formData.model.split('/').pop()}</Badge>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">RPM 限制</p>
                      <p className="text-xl font-headline font-bold text-primary">{currentQuota.rpm}</p>
                   </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase opacity-60">
                    <span>每日上限 (RPD)</span>
                    <span>{currentQuota.rpd} / DAY</span>
                  </div>
                  <Progress value={(currentQuota.rpd / 1000) * 100} className="h-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-muted/20 rounded-xl space-y-1">
                     <p className="text-[9px] font-bold opacity-40 uppercase">TPM 流量</p>
                     <p className="text-sm font-bold">{currentQuota.tpm}</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-xl space-y-1">
                     <p className="text-[9px] font-bold opacity-40 uppercase">并发建议</p>
                     <p className="text-[10px] font-bold text-green-600">{currentQuota.rpm > 10 ? '高并发' : '低频'}</p>
                  </div>
                </div>

                <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex gap-3">
                   <ShieldAlert className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                   <p className="text-[9px] text-orange-800 leading-relaxed italic">
                     <b>隐私提醒：</b>免费层级下，您的输入数据可能会被 Google 用于改进模型，请勿传输公司机密。
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. System Info */}
          <div className="p-6 bg-primary rounded-2xl text-white space-y-4 shadow-xl">
             <div className="flex items-center gap-2">
               <Info className="h-5 w-5 text-accent" />
               <h4 className="font-bold text-sm uppercase tracking-tight">API 版本说明</h4>
             </div>
             <p className="text-[10px] opacity-60 leading-relaxed">
               当前智译中枢对接 Google AI Studio (2026.04) 预览版终结点。支持 Gemini 2.5 系列原生协议。
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
