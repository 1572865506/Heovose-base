
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
import { Input } from '@/components/ui/input';
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
  Terminal,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { testAiConnection } from '@/ai/flows/test-connection-flow';
import { cn } from '@/lib/utils';

interface AiConfig {
  isEnabled: boolean;
  model: string;
  apiKey: string;
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
    apiKey: '',
    temperature: 0.7,
    systemInstruction: ''
  });

  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testReport, setTestResult] = useState<{
    status: 'idle' | 'running' | 'success' | 'failed',
    message: string,
    latency?: number,
    modelUsed?: string,
    keySource?: string
  }>({ status: 'idle', message: '尚未运行自检' });

  useEffect(() => {
    if (aiConfig) {
      setFormData({
        ...aiConfig,
        apiKey: aiConfig.apiKey || ''
      });
    }
  }, [aiConfig]);

  const handleSave = () => {
    if (!firestore) return;
    setDocumentNonBlocking(doc(firestore, 'settings', 'ai'), {
      ...formData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    toast({ title: "配置已同步至云端" });
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
        setTestResult({ 
          status: 'failed', 
          message: result.message,
          modelUsed: result.modelUsed,
          keySource: result.keySource
        });
        toast({ variant: "destructive", title: "自检失败", description: "请查看诊断报告" });
      }
    } catch (e: any) {
      setTestResult({ status: 'failed', message: `内部通讯异常: ${e.message}` });
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
          <p className="text-xs text-muted-foreground">配置 Google AI Studio API 密钥及多版本模型变体。</p>
        </div>
        <Badge variant="outline" className={cn(
          "h-9 px-3 rounded-lg gap-2 font-bold text-[10px] uppercase",
          testReport.status === 'success' ? "bg-green-50 text-green-700 border-green-200" : "bg-primary/5 text-primary border-primary/20"
        )}>
          {testReport.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />}
          状态: {testReport.status === 'success' ? '已就绪' : '待诊断'}
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
                    <CardDescription className="text-white/60 text-xs uppercase tracking-widest">Model & API Key Settings</CardDescription>
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
                  <Label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2"><Cpu className="h-3.5 w-3.5" /> 选用模型 (多变体支持)</Label>
                  <Select 
                    value={formData.model} 
                    onValueChange={(v) => setFormData({...formData, model: v})}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/10 border-transparent font-medium">
                      <SelectValue placeholder="选择 AI 模型" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="googleai/gemini-1.5-flash" className="text-xs font-bold">Gemini 1.5 Flash (标准版)</SelectItem>
                      <SelectItem value="googleai/gemini-1.5-flash-latest" className="text-xs font-bold">Gemini 1.5 Flash (最新稳定版)</SelectItem>
                      <SelectItem value="googleai/gemini-1.5-flash-002" className="text-xs font-bold">Gemini 1.5 Flash (002 稳定版)</SelectItem>
                      <SelectItem value="googleai/gemini-1.5-pro" className="text-xs font-bold">Gemini 1.5 Pro (排版精准)</SelectItem>
                      <SelectItem value="googleai/gemini-2.0-flash" className="text-xs font-bold">Gemini 2.0 Flash (最新架构)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[9px] text-muted-foreground italic">提示：若报 404，请优先尝试选择带有 "latest" 或 "002" 后缀的模型变体。</p>
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
            <CardFooter className="bg-muted/10 p-6 flex justify-end">
              <Button onClick={handleSave} className="rounded-xl h-11 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-lg">
                <Save className="h-4 w-4" /> 部署配置并生效
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
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
                testReport.status === 'failed' ? "bg-destructive/5 border-destructive/10 text-destructive" : "bg-muted/30 border-border/40 text-muted-foreground"
              )}>
                <div className="flex items-start gap-3">
                   {testReport.status === 'running' ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : 
                    testReport.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> :
                    testReport.status === 'failed' ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                   <div className="space-y-1 flex-1">
                      <p className="font-bold uppercase tracking-tighter">诊断报告</p>
                      <p className="opacity-80 leading-relaxed text-[11px]">{testReport.message}</p>
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
                {isTesting ? '正在尝试握手...' : '立即诊断当前配置'}
              </Button>

              <div className="space-y-4 pt-2">
                 <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                   注意：手动输入的密钥和模型在点击“诊断”时会实时模拟请求。若显示成功，请点击“部署配置”保存到生产环境。
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
