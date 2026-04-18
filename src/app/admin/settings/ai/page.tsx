
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
  BrainCircuit
} from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
  const { data: aiConfig, isLoading } = useDoc<AiConfig>(aiRef);

  const [formData, setFormData] = useState<AiConfig>({
    isEnabled: true,
    model: 'googleai/gemini-1.5-flash',
    temperature: 0.7,
    systemInstruction: ''
  });

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
    toast({ title: "AI 配置已更新" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" /> AI 智译中枢管理
          </h2>
          <p className="text-xs text-muted-foreground">控制全站自动翻译、语义去重及内容生成的底层引擎配置。</p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-9 px-3 rounded-lg gap-2 font-bold text-[10px]">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          引擎状态: 就绪
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
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
            <CardContent className="p-6 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary opacity-60">
                    <Cpu className="h-3.5 w-3.5" />
                    <Label className="text-[10px] font-bold uppercase tracking-widest">推理模型 (Models)</Label>
                  </div>
                  <Select 
                    value={formData.model} 
                    onValueChange={(v) => setFormData({...formData, model: v})}
                  >
                    <SelectTrigger className="h-10 rounded-lg border-muted bg-muted/10">
                      <SelectValue placeholder="选择 AI 模型" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="googleai/gemini-1.5-flash" className="text-xs">Gemini 1.5 Flash (极速/均衡)</SelectItem>
                      <SelectItem value="googleai/gemini-1.5-pro" className="text-xs">Gemini 1.5 Pro (高精准度)</SelectItem>
                      <SelectItem value="googleai/gemini-2.0-flash-exp" className="text-xs">Gemini 2.0 Flash Exp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary opacity-60">
                    <Zap className="h-3.5 w-3.5" />
                    <Label className="text-[10px] font-bold uppercase tracking-widest">温度权重 ({formData.temperature})</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                      className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase px-1">
                    <span>严谨 (翻译)</span>
                    <span>发散 (创意)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t space-y-3">
                <div className="flex items-center gap-2 text-primary opacity-60">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <Label className="text-[10px] font-bold uppercase tracking-widest">系统专家人设 (System Instructions)</Label>
                </div>
                <textarea 
                  className="w-full min-h-[140px] rounded-xl border p-4 text-xs bg-muted/5 focus:bg-white transition-all resize-none border-muted"
                  placeholder="例如：你是一位资深的工业硬件制造专家..."
                  value={formData.systemInstruction}
                  onChange={(e) => setFormData({...formData, systemInstruction: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-4 flex justify-end">
              <Button onClick={handleSave} className="rounded-lg h-10 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-sm">
                <Save className="h-4 w-4" /> 保存中枢配置
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="rounded-2xl border-border/40 bg-accent/5 overflow-hidden border shadow-sm h-full">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4 text-accent" />
                智译引擎说明
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0">1</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed"><b>全站集成</b>：开启后，翻译管理器中将出现“AI 智译”图标。</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0">2</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed"><b>语义一致性</b>：AI 会识别相似含义的文本，辅助减少冗余条目。</p>
                </div>
              </div>
              <div className="pt-4 border-t border-accent/10">
                 <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest mb-3">API 配额状态</p>
                 <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary w-[15%] rounded-full" /></div>
                 <p className="text-[8px] mt-2 text-muted-foreground italic">Gemini 免费层级：每分钟约 15 次请求</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
