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
  BrainCircuit,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal
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
  const { data: aiConfig } = useDoc<AiConfig>(aiRef);

  const [formData, setFormData] = useState<AiConfig>({
    isEnabled: true,
    model: 'googleai/gemini-1.5-flash',
    temperature: 0.7,
    systemInstruction: ''
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testReport, setTestResult] = useState<{
    status: 'idle' | 'running' | 'success' | 'failed',
    message: string,
    latency?: number,
    modelUsed?: string
  }>({ status: 'idle', message: '尚未运行自检' });

  useEffect(() => {
    if (aiConfig) {
      setFormData(aiConfig);
    }
  }, [aiConfig]);

  const handleSave = () => {
    if (!firestore) return;
    setDocumentNonBlocking(doc(firestore, 'settings', 'ai'), {
      ...formData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    toast({ title: "配置已保存" });
  };

  const runAutoTest = async () => {
    setIsTesting(true);
    setTestResult({ status: 'running', message: '正在启动模型连接测试...' });
    
    try {
      const result = await testAiConnection({
        model: formData.model,
        systemInstruction: formData.systemInstruction
      });

      if (result.status === 'ok') {
        setTestResult({ 
          status: 'success', 
          message: '连接成功：模型已识别并正确响应指令。', 
          latency: result.latency,
          modelUsed: result.modelUsed
        });
      } else {
        setTestResult({ 
          status: 'failed', 
          message: result.message,
          modelUsed: result.modelUsed
        });
      }
    } catch (e: any) {
      setTestResult({ status: 'failed', message: `检测异常: ${e.message}` });
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
          <p className="text-xs text-muted-foreground">控制全站自动翻译与内容生成的底层 AI 模型配置。</p>
        </div>
        <Badge variant="outline" className={cn(
          "h-9 px-3 rounded-lg gap-2 font-bold text-[10px] uppercase",
          testReport.status === 'success' ? "bg-green-50 text-green-700 border-green-200" : "bg-primary/5 text-primary border-primary/20"
        )}>
          {testReport.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />}
          状态: {testReport.status === 'success' ? '已就绪' : '待自检'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-2xl border-none shadow-2xl overflow-hidden">
            <div className="bg-primary p-6 text-white">
              <CardHeader className="p-0 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-lg font-bold">核心引擎配置</CardTitle>
                    <CardDescription className="text-white/60 text-xs uppercase tracking-widest">Model & Intelligence Settings</CardDescription>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2"><Cpu className="h-3.5 w-3.5" /> 选用模型 (Standard IDs)</Label>
                  <Select 
                    value={formData.model} 
                    onValueChange={(v) => setFormData({...formData, model: v})}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/10 border-transparent font-medium">
                      <SelectValue placeholder="选择 AI 模型" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="googleai/gemini-1.5-flash" className="text-xs font-bold">Gemini 1.5 Flash (速度平衡)</SelectItem>
                      <SelectItem value="googleai/gemini-1.5-pro" className="text-xs font-bold">Gemini 1.5 Pro (超长上下文)</SelectItem>
                      <SelectItem value="googleai/gemini-2.0-flash" className="text-xs font-bold">Gemini 2.0 Flash (最新架构)</SelectItem>
                      <SelectItem value="googleai/gemini-pro" className="text-xs font-bold opacity-40 text-muted-foreground">Gemini 1.0 Pro (备用方案)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[9px] text-muted-foreground italic">注：若遇到 404，请确认 API Key 是否属于受支持的地区。</p>
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
                  <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase">
                    <span>严格 (适合翻译)</span>
                    <span>发散 (适合文案)</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t space-y-4">
                <Label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> 系统级人设 (System Context)</Label>
                <textarea 
                  className="w-full min-h-[160px] rounded-2xl border p-5 text-sm bg-muted/5 focus:bg-white transition-all resize-none leading-relaxed font-medium"
                  placeholder="例如：你是一位资深的工业电脑专家，擅长将技术参数精准地翻译为地道的行业术语..."
                  value={formData.systemInstruction}
                  onChange={(e) => setFormData({...formData, systemInstruction: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-6 flex justify-end">
              <Button onClick={handleSave} className="rounded-xl h-11 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-lg">
                <Save className="h-4 w-4" /> 签署并同步配置
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border-none bg-white shadow-xl overflow-hidden h-fit">
            <CardHeader className="p-6 pb-2 border-b">
              <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-primary uppercase tracking-[0.2em]">
                <Activity className="h-4 w-4 text-accent" />
                自动化连通性自检
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className={cn(
                "p-4 rounded-xl border transition-all text-xs",
                testReport.status === 'success' ? "bg-green-50 border-green-100 text-green-800" : 
                testReport.status === 'failed' ? "bg-destructive/5 border-destructive/10 text-destructive" : "bg-muted/30 border-border/40 text-muted-foreground"
              )}>
                <div className="flex items-start gap-3">
                   {testReport.status === 'running' ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : 
                    testReport.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> :
                    testReport.status === 'failed' ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                   <div className="space-y-1 flex-1">
                      <p className="font-bold uppercase tracking-tighter">自检报告</p>
                      <p className="opacity-80 leading-relaxed">{testReport.message}</p>
                      {testReport.modelUsed && (
                        <div className="mt-3 flex items-center gap-1.5 font-mono text-[9px] bg-black/5 p-1 rounded">
                          <Terminal className="h-2.5 w-2.5 opacity-40" /> {testReport.modelUsed}
                        </div>
                      )}
                      {testReport.latency && <p className="mt-1 font-mono font-bold text-primary">Latency: {testReport.latency}ms</p>}
                   </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                disabled={isTesting}
                onClick={runAutoTest}
                className="w-full rounded-xl h-10 font-bold text-[10px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 shadow-inner"
              >
                {isTesting ? '自检运行中...' : '立即开始自动化测试'}
              </Button>

              <div className="space-y-4 pt-2">
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-primary/40">
                       <span>API 路由检测</span>
                       <span>{testReport.status === 'success' ? 'VALID' : 'PENDING'}</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                       <div className={cn("h-full transition-all duration-1000", testReport.status === 'success' ? "bg-green-500 w-full" : "bg-primary w-[10%] animate-pulse")} />
                    </div>
                 </div>
                 <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                   提示：所有连接均通过 Firebase 生产终结点路由。自检失败通常由于 Key 额度用尽或地区限制。
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
