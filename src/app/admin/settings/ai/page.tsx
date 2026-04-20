
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
  LayoutGrid
} from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { testAiConnection } from '@/ai/flows/test-connection-flow';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

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
  lastDiagnosis?: DiagnosisRecord;
}

const STATIC_QUOTA_LIST = [
  { 
    id: 'googleai/gemini-2.5-flash', 
    name: 'Gemini 2.5 Flash', 
    rpm: 10, 
    rpd: 250, 
    tpm: '1M', 
    recommendation: '通用翻译 / 速度优先',
    color: 'text-blue-600'
  },
  { 
    id: 'googleai/gemini-2.5-flash-lite', 
    name: 'Gemini 2.5 Flash-Lite', 
    rpm: 15, 
    rpd: 1000, 
    tpm: '4M', 
    recommendation: '高频并发 / 批量处理',
    color: 'text-green-600'
  },
  { 
    id: 'googleai/gemini-2.5-pro', 
    name: 'Gemini 2.5 Pro', 
    rpm: 5, 
    rpd: 100, 
    tpm: '32K', 
    recommendation: '超长排版 / 深度逻辑',
    color: 'text-purple-600'
  }
];

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
  
  const [testReport, setTestResult] = useState<DiagnosisRecord>({ 
    status: 'idle', 
    message: '尚未运行自检' 
  });

  useEffect(() => {
    if (aiConfig) {
      setFormData({
        ...aiConfig,
        apiKey: aiConfig.apiKey || '',
        systemInstruction: aiConfig.systemInstruction || formData.systemInstruction
      });
      
      if (aiConfig.lastDiagnosis) {
        setTestResult(aiConfig.lastDiagnosis);
      }
    }
  }, [aiConfig]);

  const currentQuota = useMemo(() => {
    return STATIC_QUOTA_LIST.find(q => q.id === formData.model) || STATIC_QUOTA_LIST[0];
  }, [formData.model]);

  const handleSave = () => {
    if (!firestore) return;
    setIsSaving(true);
    
    setDocumentNonBlocking(doc(firestore, 'settings', 'ai'), {
      ...formData,
      lastDiagnosis: testReport,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTimeout(() => {
      setIsSaving(false);
      toast({ 
        title: "配置已同步至云端", 
        description: "AI 引擎配置及诊断状态已持久化保存。" 
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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" /> AI 智译中枢管理
          </h2>
          <p className="text-xs text-muted-foreground">配置 2026 版 Gemini 2.5 核心引擎、API 密钥及专家技能指令。</p>
        </div>
        <div className="flex items-center gap-3">
          {testReport.timestamp && (
            <span className="text-[9px] text-muted-foreground font-mono uppercase mr-2">
              上次测试: {new Date(testReport.timestamp).toLocaleString()}
            </span>
          )}
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-10 px-6 gap-2 font-bold uppercase tracking-widest text-xs shadow-md"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            部署配置并保存状态
          </Button>

          <Badge variant="outline" className={cn(
            "h-10 px-4 rounded-lg gap-2 font-bold text-[10px] uppercase",
            testReport.status === 'success' ? "bg-green-50 text-green-700 border-green-200" : 
            testReport.status === 'quota' ? "bg-orange-50 text-orange-700 border-orange-200" :
            testReport.status === 'failed' ? "bg-destructive/5 text-destructive border-destructive/10" :
            "bg-primary/5 text-primary border-primary/20"
          )}>
            {testReport.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : 
             testReport.status === 'quota' ? <Clock className="h-3 w-3" /> :
             testReport.status === 'failed' ? <AlertCircle className="h-3 w-3" /> :
             <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />}
            状态: {testReport.status === 'success' ? '已就绪' : testReport.status === 'quota' ? '配额受限' : testReport.status === 'failed' ? '诊断失败' : '待自检'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
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
                    placeholder="在此粘贴您的 API Key..."
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
                  <Label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2"><Cpu className="h-3.5 w-3.5" /> 选用模型</Label>
                  <Select 
                    value={formData.model} 
                    onValueChange={(v) => setFormData({...formData, model: v})}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/10 border-transparent font-medium">
                      <SelectValue placeholder="选择 AI 模型" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {STATIC_QUOTA_LIST.map(m => (
                        <SelectItem key={m.id} value={m.id} className="text-xs font-bold">{m.name}</SelectItem>
                      ))}
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
                  className="min-h-[140px] rounded-xl border-muted/60 bg-muted/5 focus:bg-white transition-all text-sm leading-relaxed"
                />
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <ListChecks className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">已激活的静态技能</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                   <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-primary/10 text-[10px] font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> 硬件专业术语库动态关联
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-primary/10 text-[10px] font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> HTML 长文排版无损映射
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/40 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-6 bg-muted/10 border-b">
              <div className="flex items-center gap-3">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">全系列模型配额参考看板</CardTitle>
                  <CardDescription className="text-[10px]">静态参数查询表，用于管理人员进行策略规划。</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="pl-6 text-[9px] font-bold uppercase">模型名称</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase">RPM (分钟)</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase">RPD (日限)</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase">TPM (流量)</TableHead>
                    <TableHead className="pr-6 text-[9px] font-bold uppercase">核心场景建议</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STATIC_QUOTA_LIST.map((item) => (
                    <TableRow key={item.id} className={cn(formData.model === item.id && "bg-primary/5")}>
                      <TableCell className="pl-6 font-bold text-xs">
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          {formData.model === item.id && <span className="text-[8px] text-primary uppercase font-bold tracking-tighter">当前选用</span>}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.rpm}</TableCell>
                      <TableCell className="font-mono text-xs">{item.rpd}</TableCell>
                      <TableCell className="font-mono text-xs">{item.tpm}</TableCell>
                      <TableCell className="pr-6">
                        <Badge variant="outline" className={cn("text-[9px] border-none px-0 font-medium", item.color)}>
                          {item.recommendation}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
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
                          这说明配置已鉴权成功。
                        </div>
                      )}

                      {testReport.modelUsed && (
                        <div className="mt-3 space-y-1.5">
                           <div className="flex items-center gap-1.5 font-mono text-[9px] bg-black/5 p-1 rounded">
                             <Terminal className="h-2.5 w-2.5 opacity-40" /> ID: {testReport.modelUsed}
                           </div>
                           {testReport.latency && <div className="text-[8px] font-bold opacity-40 uppercase">Latency: {testReport.latency}ms</div>}
                        </div>
                      )}
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

          <Card className="rounded-2xl border-none bg-white shadow-xl overflow-hidden">
            <CardHeader className="p-6 pb-2 border-b bg-muted/10">
              <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-primary uppercase tracking-[0.2em]">
                <Gauge className="h-4 w-4 text-blue-500" />
                当前模型调用仪表盘
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">当前选用</p>
                      <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase">{currentQuota.name.split(' ').pop()}</Badge>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">RPM 限制</p>
                      <p className="text-xl font-headline font-bold text-primary">{currentQuota.rpm}</p>
                   </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase opacity-60">
                    <span>每日额度 (RPD)</span>
                    <span>{currentQuota.rpd} / DAY</span>
                  </div>
                  <Progress value={(currentQuota.rpd / 1000) * 100} className="h-1.5" />
                </div>

                <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex gap-3">
                   <ShieldAlert className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                   <p className="text-[9px] text-orange-800 leading-relaxed italic">
                     <b>隐私提醒：</b>免费层级输入数据会被 Google 用于改进模型。
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
