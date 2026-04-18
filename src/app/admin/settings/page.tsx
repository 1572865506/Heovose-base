
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
  Settings2, 
  Save, 
  Bot, 
  ShieldCheck,
  Zap,
  Info
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

export default function AdminSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const aiRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'ai') : null, [firestore]);
  const { data: aiConfig, isLoading } = useDoc<AiConfig>(aiRef);

  const [formData, setFormData] = useState<AiConfig>({
    isEnabled: true,
    model: 'googleai/gemini-1.5-flash',
    temperature: 0.7
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
    toast({ title: "设置已更新", description: "AI 功能配置已成功保存到云端。" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
          <Settings2 className="h-6 w-6" /> 通用系统设置
        </h2>
        <p className="text-sm text-muted-foreground">管理全站底层配置，包括 AI 助手行为与模型选择。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[2.5rem] border-border/40 shadow-xl overflow-hidden">
            <div className="bg-primary p-8 text-white">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">AI 智译中枢配置</CardTitle>
                      <CardDescription className="text-white/60">控制全站自动翻译与内容生成的底层引擎。</CardDescription>
                    </div>
                  </div>
                  <Switch 
                    checked={formData.isEnabled} 
                    onCheckedChange={(v) => setFormData({...formData, isEnabled: v})} 
                    className="data-[state=checked]:bg-accent"
                  />
                </div>
              </CardHeader>
            </div>
            <CardContent className="p-8 space-y-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Cpu className="h-4 w-4" />
                    <Label className="text-[10px] font-bold uppercase tracking-widest">基础翻译模型</Label>
                  </div>
                  <Select 
                    value={formData.model} 
                    onValueChange={(v) => setFormData({...formData, model: v})}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="选择 AI 模型" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="googleai/gemini-1.5-flash">Gemini 1.5 Flash (快速/经济)</SelectItem>
                      <SelectItem value="googleai/gemini-1.5-pro">Gemini 1.5 Pro (精准/深度)</SelectItem>
                      <SelectItem value="googleai/gemini-2.0-flash-exp">Gemini 2.0 Flash Exp (极速体验)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 px-1">
                    <Info className="h-3 w-3" /> 推荐使用 Flash 模型以获得秒级翻译响应。
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Zap className="h-4 w-4" />
                    <Label className="text-[10px] font-bold uppercase tracking-widest">创造力权重 (Temperature)</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                      className="h-2 p-0 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <Badge variant="outline" className="font-mono">{formData.temperature}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">数值越低翻译越严谨，越适用于参数规格。</p>
                </div>
              </div>

              <div className="pt-8 border-t space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <Label className="text-[10px] font-bold uppercase tracking-widest">AI 角色设定与约束 (Prompt)</Label>
                </div>
                <textarea 
                  className="w-full min-h-[120px] rounded-2xl border p-4 text-sm bg-muted/20 focus:bg-white transition-all resize-none"
                  placeholder="例如：你是一位资深的电脑制造专家..."
                  value={formData.systemInstruction}
                  onChange={(e) => setFormData({...formData, systemInstruction: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-6 flex justify-end">
              <Button onClick={handleSave} className="rounded-xl h-11 px-8 gap-2 font-bold uppercase tracking-widest">
                <Save className="h-4 w-4" /> 保存全局配置
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[2rem] border-border/40 bg-accent/5 overflow-hidden">
            <CardHeader className="p-6 pb-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4 text-accent" />
                当前节点健康度
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">模型状态</span>
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                  已就绪
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">最后同步</span>
                <span>刚才</span>
              </div>
              <div className="p-4 bg-white/50 rounded-xl text-[10px] italic text-primary/60 border border-primary/10">
                "智译系统已启用，现在可以在翻译管理页面或产品编辑器中使用 AI 自动填充功能。"
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
