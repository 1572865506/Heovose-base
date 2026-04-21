
"use client";

import { useState, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, 
  Save, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon, 
  Film, 
  BarChart3, 
  MapPin,
  ArrowRight,
  Info
} from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { translateContent } from '@/ai/flows/translate-flow';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// AI 极光渐变定义组件
const AiGradientDef = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="ai-aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stopColor="#06B6D4" offset="0%">
          <animate attributeName="stop-color" values="#06B6D4;#4F46E5;#06B6D4" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#4F46E5" offset="33%">
          <animate attributeName="stop-color" values="#4F46E5;#D946EF;#4F46E5" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#D946EF" offset="66%">
          <animate attributeName="stop-color" values="#D946EF;#F43F5E;#D946EF" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#F43F5E" offset="100%">
          <animate attributeName="stop-color" values="#F43F5E;#06B6D4;#F43F5E" dur="4s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
  </svg>
);

export default function AdminHomePage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const homeRef = useMemoFirebase(() => firestore ? doc(firestore, 'homepageContent', 'main') : null, [firestore]);
  const aiRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'ai') : null, [firestore]);
  
  const { data: homeData, isLoading } = useDoc<any>(homeRef);
  const { data: aiConfig } = useDoc<any>(aiRef);

  const [formData, setFormData] = useState<any>({
    heroHeadlineZh: '',
    heroHeadlineEn: '',
    heroSubheadlineZh: '',
    heroSubheadlineEn: '',
    videoTitleZh: '',
    videoTitleEn: '',
    videoSubtitleZh: '',
    videoSubtitleEn: '',
    stats: [
      { value: '3', labelZh: '全球工厂', labelEn: 'Global Factories', subZh: '中国 / 印尼', subEn: 'CN / ID' },
      { value: '30+', labelZh: 'AIO 系列', labelEn: 'AIO Series', subZh: '机型', subEn: 'Models' },
      { value: '500+', labelZh: '合作伙伴', labelEn: 'Happy Clients', subZh: '全球客户', subEn: 'Global' },
      { value: '15+', labelZh: '行业经验', labelEn: 'Years Excellence', subZh: '年行业积淀', subEn: 'Years' }
    ],
    mapTitleZh: '',
    mapTitleEn: '',
    mapSubtitleZh: '',
    mapSubtitleEn: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  useEffect(() => {
    if (homeData) {
      setFormData({ ...formData, ...homeData });
    }
  }, [homeData]);

  const handleSave = () => {
    if (!firestore) return;
    setIsSaving(true);
    
    setDocumentNonBlocking(homeRef!, {
      ...formData,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "首页配置已保存", description: "更改将实时同步到官网展示。" });
    }, 800);
  };

  const handleTranslate = async (fields: { source: string, targetKey: string }[]) => {
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 智译未启用", description: "请先在系统设置中配置 AI 引擎。" });
      return;
    }

    setIsAiProcessing(true);
    try {
      const updates: any = {};
      for (const field of fields) {
        if (!formData[field.source]) continue;
        const res = await translateContent({
          text: formData[field.source],
          targetLangs: ['en'],
          apiKey: aiConfig.apiKey
        });
        if (res.en) updates[field.targetKey] = res.en;
      }
      setFormData({ ...formData, ...updates });
      toast({ title: "智译完成", description: "已根据中文内容自动生成英文译文。" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "智译失败", description: error.message });
    } finally {
      setIsAiProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">正在载入展示模型...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <AiGradientDef />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-[-24px] z-50 bg-background/95 backdrop-blur-md py-4 border-b -mx-6 px-6">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <Home className="h-5 w-5" /> 首页配置管理
          </h2>
          <p className="text-xs text-muted-foreground">管理全站首屏视觉、全球化战略及核心品牌数据。</p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl h-12 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-xl">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          签署并发布配置
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="bg-muted/30 p-1 rounded-2xl mb-8 h-14 w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-none">
          <TabsTrigger value="hero" className="rounded-xl px-8 text-xs font-bold uppercase tracking-wider gap-2">
            <ImageIcon className="h-4 w-4" /> 英雄视觉 (Hero)
          </TabsTrigger>
          <TabsTrigger value="video" className="rounded-xl px-8 text-xs font-bold uppercase tracking-wider gap-2">
            <Film className="h-4 w-4" /> 品牌故事 (Video)
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-xl px-8 text-xs font-bold uppercase tracking-wider gap-2">
            <BarChart3 className="h-4 w-4" /> 数据看板 (Stats)
          </TabsTrigger>
          <TabsTrigger value="map" className="rounded-xl px-8 text-xs font-bold uppercase tracking-wider gap-2">
            <MapPin className="h-4 w-4" /> 全球足迹 (Map)
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> 英雄屏核心文案
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">配置首页顶部的冲击力标题。</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ai-btn-glow h-9 px-4 text-[10px] gap-2 font-bold"
                onClick={() => handleTranslate([{source: 'heroHeadlineZh', targetKey: 'heroHeadlineEn'}, {source: 'heroSubheadlineZh', targetKey: 'heroSubheadlineEn'}])}
                disabled={isAiProcessing}
              >
                <Sparkles className="h-3.5 w-3.5 ai-icon-gradient" /> AI 智译本页
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">主标题 (中文)</Label>
                  <Input 
                    value={formData.heroHeadlineZh} 
                    onChange={e => setFormData({...formData, heroHeadlineZh: e.target.value})}
                    placeholder="如：一体机电脑"
                    className="h-11 rounded-xl text-xs bg-muted/10 border-border/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">副标题 (中文)</Label>
                  <Input 
                    value={formData.heroSubheadlineZh} 
                    onChange={e => setFormData({...formData, heroSubheadlineZh: e.target.value})}
                    placeholder="如：专业制造商"
                    className="h-11 rounded-xl text-xs bg-muted/10 border-border/60"
                  />
                </div>
              </div>

              <div className="space-y-6 border-l pl-10 border-dashed">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">MAIN HEADLINE (EN)</Label>
                  <Input 
                    value={formData.heroHeadlineEn} 
                    onChange={e => setFormData({...formData, heroHeadlineEn: e.target.value})}
                    placeholder="ALL IN ONE COMPUTER"
                    className="h-11 rounded-xl text-xs bg-white border-dashed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">SUBHEADLINE (EN)</Label>
                  <Input 
                    value={formData.heroSubheadlineEn} 
                    onChange={e => setFormData({...formData, heroSubheadlineEn: e.target.value})}
                    placeholder="PROFESSIONAL MANUFACTURER"
                    className="h-11 rounded-xl text-xs bg-white border-dashed"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Video Section */}
        <TabsContent value="video" className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <Film className="h-4 w-4" /> 视频交互区配置
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">配置滚动视频背景上的浮动文案。</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ai-btn-glow h-9 px-4 text-[10px] gap-2 font-bold"
                onClick={() => handleTranslate([{source: 'videoTitleZh', targetKey: 'videoTitleEn'}, {source: 'videoSubtitleZh', targetKey: 'videoSubtitleEn'}])}
                disabled={isAiProcessing}
              >
                <Sparkles className="h-3.5 w-3.5 ai-icon-gradient" /> AI 智译本页
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">滚动文案一 (中文)</Label>
                  <Input 
                    value={formData.videoTitleZh} 
                    onChange={e => setFormData({...formData, videoTitleZh: e.target.value})}
                    placeholder="如：全球智能制造"
                    className="h-11 rounded-xl text-xs bg-muted/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">滚动文案二 (中文)</Label>
                  <Input 
                    value={formData.videoSubtitleZh} 
                    onChange={e => setFormData({...formData, videoSubtitleZh: e.target.value})}
                    placeholder="如：重塑桌面与显示之美"
                    className="h-11 rounded-xl text-xs bg-muted/10"
                  />
                </div>
              </div>
              <div className="space-y-6 border-l pl-10 border-dashed">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">SCROLL TEXT 1 (EN)</Label>
                  <Input 
                    value={formData.videoTitleEn} 
                    onChange={e => setFormData({...formData, videoTitleEn: e.target.value})}
                    placeholder="GLOBAL INTELLIGENT MANUFACTURING"
                    className="h-11 rounded-xl text-xs border-dashed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">SCROLL TEXT 2 (EN)</Label>
                  <Input 
                    value={formData.videoSubtitleEn} 
                    onChange={e => setFormData({...formData, videoSubtitleEn: e.target.value})}
                    placeholder="REDEFINING DESKTOP EXCELLENCE"
                    className="h-11 rounded-xl text-xs border-dashed"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Stats Section */}
        <TabsContent value="stats" className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> 核心统计看板
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">配置官网展示的 4 项关键经营数据。</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {formData.stats.map((stat: any, idx: number) => (
                <div key={idx} className="p-6 rounded-2xl border bg-muted/5 space-y-4 group hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter border-primary/20 text-primary">指标 {idx + 1}</Badge>
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary/20 group-hover:text-primary transition-colors">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase opacity-40 tracking-tighter">数值</Label>
                      <Input value={stat.value} onChange={e => {
                        const newStats = [...formData.stats];
                        newStats[idx].value = e.target.value;
                        setFormData({...formData, stats: newStats});
                      }} className="h-10 rounded-lg text-xs font-bold text-primary" />
                    </div>
                    <div className="md:col-span-4 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase opacity-40 tracking-tighter">中文标签</Label>
                      <Input value={stat.labelZh} onChange={e => {
                        const newStats = [...formData.stats];
                        newStats[idx].labelZh = e.target.value;
                        setFormData({...formData, stats: newStats});
                      }} className="h-10 rounded-lg text-xs" />
                    </div>
                    <div className="md:col-span-5 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase opacity-40 tracking-tighter">LABEL (EN)</Label>
                      <Input value={stat.labelEn} onChange={e => {
                        const newStats = [...formData.stats];
                        newStats[idx].labelEn = e.target.value;
                        setFormData({...formData, stats: newStats});
                      }} className="h-10 rounded-lg text-xs border-dashed" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Global Map Section */}
        <TabsContent value="map" className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> 全球布局文案
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">配置地图板块的标题和描述。</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ai-btn-glow h-9 px-4 text-[10px] gap-2 font-bold"
                onClick={() => handleTranslate([{source: 'mapTitleZh', targetKey: 'mapTitleEn'}, {source: 'mapSubtitleZh', targetKey: 'mapSubtitleEn'}])}
                disabled={isAiProcessing}
              >
                <Sparkles className="h-3.5 w-3.5 ai-icon-gradient" /> AI 智译本页
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">标题 (中文)</Label>
                  <Input 
                    value={formData.mapTitleZh} 
                    onChange={e => setFormData({...formData, mapTitleZh: e.target.value})}
                    placeholder="如：全球布局"
                    className="h-11 rounded-xl text-xs bg-muted/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">副标题 (中文)</Label>
                  <Textarea 
                    value={formData.mapSubtitleZh} 
                    onChange={e => setFormData({...formData, mapSubtitleZh: e.target.value})}
                    placeholder="如：战略布局，服务全球品牌。"
                    className="min-h-[100px] rounded-xl text-xs bg-muted/10"
                  />
                </div>
              </div>
              <div className="space-y-6 border-l pl-10 border-dashed">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">MAP TITLE (EN)</Label>
                  <Input 
                    value={formData.mapTitleEn} 
                    onChange={e => setFormData({...formData, mapTitleEn: e.target.value})}
                    placeholder="GLOBAL FOOTPRINT"
                    className="h-11 rounded-xl text-xs border-dashed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">SUBTITLE (EN)</Label>
                  <Textarea 
                    value={formData.mapSubtitleEn} 
                    onChange={e => setFormData({...formData, mapSubtitleEn: e.target.value})}
                    placeholder="STRATEGICALLY LOCATED TO SERVE GLOBAL BRANDS."
                    className="min-h-[100px] rounded-xl text-xs border-dashed"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
