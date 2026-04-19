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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  ShieldCheck,
  Zap,
  Info,
  BrainCircuit,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { testAiConnection } from '@/ai/flows/test-connection-flow';
import { cn } from '@/lib/utils';

interface AiConfig {
  isEnabled: boolean;
  model: string;
  temperature: number;
  systemInstruction?: string;
}

export default function AiSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const aiRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'ai') : null, [firestore]);
  const { data: aiConfig, isLoading: isConfigLoading } = useDoc<AiConfig>(aiRef);

  const [formData, setFormData] = useState<AiConfig>({
    isEnabled: true,
    model: 'google-genai/gemini-1.5-flash',
    temperature: 0.7,
    systemInstruction: ''
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testReport, setTestResult] = useState<{
    status: 'idle' | 'running' | 'success' | 'failed',
    message: string,
    latency?: number
  }>({ status: 'idle', message: '尚未运行检测' });

  useEffect(() => {
    if (aiConfig) {
      // 自动迁移旧前缀数据到新前缀
      const normalizedModel = aiConfig.model?.replace('googleai/', 'google-genai/') || 'google-genai/gemini-1.5-flash';
      setFormData({ ...aiConfig, model: normalizedModel });
    }
  }, [aiConfig]);

  const handleSave = () => {
    if (!firestore) return;
    setDocumentNonBlocking(doc(firestore, 'settings', 'ai'), {
      ...formData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    toast({ title: "AI 配置已同步至云端" });
  };

  const runAutoTest = async () => {
    setIsTesting(true);
    setTestResult({ status: 'running', message: '正在启动自动化连接测试...' });
    
    try {
      const result = await testAiConnection({
        model: formData.model,
        systemInstruction: formData.systemInstruction
      });

      if (result.status === 'ok') {
        setTestResult({ 
          status: 'success', 
          message: `连接正常：${result.message}`, 
          latency: result.latency 
        });
        toast({ title: "配置自检通过", description: `响应耗时: ${result.latency}ms` });
      } else {
        setTestResult({ status: 'failed', message: `检测失败：${result.message}` });
        toast({ variant: "destructive", title: "配置存在问题", description: result.message });
      }
    } catch (e: any) {
      setTestResult({ status: 'failed', message: `连接崩溃：${e.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" /> AI 智译中枢管理
          </h2>
          <p className="text-xs text-muted-foreground">控制全站自动翻译、语义去重及内容生成的底层引擎配置。</p>
        </div>
        <div className="flex gap-3">
           <Badge variant="outline" className={cn(
             "h-9 px-3 rounded-lg gap-2 font-bold text-[10px] uppercase",
             testReport.status === 'success' ? "bg-green-50 text-green-700 border-green-200" : "bg-primary/5 text-primary border-primary/20"
           )}>
            <div className={cn("h-1.5 w-1.5 rounded-full", testReport.status === 'success' ? "bg-green-500" : "bg-blue-400 animate-pulse")} />
            引擎状态: {testReport.status === 'success' ? '已就绪 (Verified)' : '待验证'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden border-none shadow-2xl">
            <div className="bg-primary p-6 text-white">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="h-6 w-6 opacity-80" />
                    <div>
                      <CardTitle className="text-lg">核心引擎参数</CardTitle>
                      <CardDescription className="text-white/60 text-xs">模型选择与生成策略设置。</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-lg border border-white/10">
                    <span className="text-[9px] font-bold uppercase tracking-widest pl-1">{formData.isEnabled ? '已启用' : '已禁用'}</span>
                    <Switch 
                      checked={formData.isEnabled} 
                      onCheckedChange={(v) => setFormData({...formData, isEnabled: v})} 
                      className="data-[state=checked]:bg-accent scale-75"
                    />
                  </div>
                </div>
              </CardHeader>
            </div>
            <CardContent className="p-8 space-y-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary opacity-60">
                    <Cpu className="h-3.5 w-3.5" />
                    <Label className="text-[10px] font-bold uppercase tracking-widest">推理模型 (Models)</Label>
                  </div>
                  <Select 
                    value={formData.model} 
                    onValueChange={(v) => setFormData({...formData, model: v})}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-muted bg-muted/10 font-medium">
                      <SelectValue placeholder="选择 AI 模型" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="google-genai/gemini-1.5-flash" className="text-xs font-bold">Gemini 1.5 Flash (极速/均衡)</SelectItem>
                      <SelectItem value="google-genai/gemini-1.5-pro" className="text-xs font-bold">Gemini 1.5 Pro (超长上下文/高精度)</SelectItem>
                      <SelectItem value="google-genai/gemini-2.0-flash-exp" className="text-xs font-bold text-accent-foreground bg-accent/10">Gemini 2.0 Flash Exp (前沿测试)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[9px] text-muted-foreground leading-relaxed italic">注：前缀已更新为 google-genai/ 以确保连接稳定性。</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary opacity-60">
                      <Zap className="h-3.5 w-3.5" />
                      <Label className="text-[10px] font-bold uppercase tracking-widest">温度权重 ({formData.temperature})</Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 py-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                      className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase px-1">
                    <span className="flex items-center gap-1"><RefreshCw className="h-2 w-2" /> 严谨 (翻译)</span>
                    <span className="flex items-center gap-1">发散 (创意) <Sparkles className="h-2 w-2" /></span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t space-y-4">
                <div className="flex items-center gap-2 text-primary opacity-60">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <Label className="text-[10px] font-bold uppercase tracking-widest">系统专家人设 (System Instructions)</Label>
                </div>
                <textarea 
                  className="w-full min-h-[160px] rounded-2xl border p-5 text-sm bg-muted/5 focus:bg-white transition-all resize-none border-muted leading-relaxed font-medium"
                  placeholder="例如：你是一位资深的工业硬件制造专家，擅长将技术术语精准翻译为地道的行业英语..."
                  value={formData.systemInstruction}
                  onChange={(e) => setFormData({...formData, systemInstruction: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-6 flex justify-end gap-3">
              <Button onClick={handleSave} className="rounded-xl h-11 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-lg">
                <Save className="h-4 w-4" /> 同步配置
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border-none bg-white shadow-xl overflow-hidden h-fit">
            <CardHeader className="p-6 pb-2 border-b">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-primary uppercase tracking-widest">
                <Activity className="h-4 w-4 text-accent" />
                自动化配置自检
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className={cn(
                "p-4 rounded-xl border transition-all",
                testReport.status === 'success' ? "bg-green-50 border-green-100" : 
                testReport.status === 'failed' ? "bg-destructive/5 border-destructive/10" : "bg-muted/30 border-border/40"
              )}>
                <div className="flex items-start gap-3">
                   {testReport.status === 'running' ? <Loader2 className="h-4 w-4 animate-spin text-primary mt-0.5" /> : 
                    testReport.status === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" /> :
                    testReport.status === 'failed' ? <AlertCircle className="h-4 w-4 text-destructive mt-0.5" /> :
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5" />}
                   <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-tight">自检状态报告</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed break-words">{testReport.message}</p>
                      {testReport.latency && <p className="text-[10px] font-mono font-bold text-primary">Latency: {testReport.latency}ms</p>}
                   </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                disabled={isTesting}
                onClick={runAutoTest}
                className="w-full rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5"
              >
                {isTesting ? '正在运行检测...' : '立即运行自检'}
              </Button>

              <div className="pt-4 space-y-4">
                 <div className="space-y-2">
                    <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">API 配置状态</p>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                       <div className={cn("h-full transition-all duration-1000", testReport.status === 'success' ? "bg-green-500 w-full" : "bg-primary w-[12%] animate-pulse")} />
                    </div>
                    <div className="flex justify-between text-[8px] text-muted-foreground font-mono">
                       <span>RPM LIMIT: AUTO</span>
                       <span>{testReport.status === 'success' ? 'CONNECTED' : 'WAITING'}</span>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
