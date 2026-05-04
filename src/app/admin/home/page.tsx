
"use client";

import { useState, useEffect } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { 
  Home, 
  Save, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon, 
  Film,
  Video,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { translateContent } from '@/ai/flows/translate-flow';
import { cn } from '@/lib/utils';
import { ShinyButton } from '@/components/ui/shiny-button';
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';
import Image from 'next/image';

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
  const { toast } = useToast();
  const { data: heroData, isLoading: isHeroLoading, mutate: mutateHero } = useLocalDoc<any>('homepageContent', 'hero');
  const { data: videoData, isLoading: isVideoLoading, mutate: mutateVideo } = useLocalDoc<any>('homepageContent', 'video');
  const { data: aiConfig } = useLocalDoc<any>('settings', 'ai');
  const { data: categories } = useLocalCollection<any>('productCategories');
  const { data: translations } = useLocalCollection<any>('localizedStrings');

  const isLoading = isHeroLoading || isVideoLoading;

  const [formData, setFormData] = useState<any>({
    heroHeadlineZh: '',
    heroHeadlineEn: '',
    heroSubheadlineZh: '',
    heroSubheadlineEn: '',
    heroWholesaleButtonZh: '',
    heroWholesaleButtonEn: '',
    heroWholesaleDescriptionZh: '',
    heroWholesaleDescriptionEn: '',
    heroProjectButtonZh: '',
    heroProjectButtonEn: '',
    heroProjectDescriptionZh: '',
    heroProjectDescriptionEn: '',
    heroWholesaleCategoryId: '',
    heroProjectCategoryId: '',
    heroSlides: [],
    isVideoEnabled: true,
    videoTitleZh: '',
    videoTitleEn: '',
    videoSubtitleZh: '',
    videoSubtitleEn: '',
    videoUrl: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [pickerConfig, setPickerConfig] = useState<{ open: boolean, slideIndex: number | null }>({ open: false, slideIndex: null });

  useEffect(() => {
    if (heroData || videoData) {
      const existingSlides = heroData?.heroSlides || [];
      const initialSlides = existingSlides.length > 0 
        ? existingSlides 
        : [{
            id: 'legacy-default',
            headlineZh: heroData?.heroHeadlineZh || '',
            headlineEn: heroData?.heroHeadlineEn || '',
            subheadlineZh: heroData?.heroSubheadlineZh || '',
            subheadlineEn: heroData?.heroSubheadlineEn || '',
            bgImage: "/image/hero-bg.png",
            priority: 0
          }];

      setFormData({ 
        ...formData, 
        heroHeadlineZh: heroData?.heroHeadlineZh || '',
        heroHeadlineEn: heroData?.heroHeadlineEn || '',
        heroSubheadlineZh: heroData?.heroSubheadlineZh || '',
        heroSubheadlineEn: heroData?.heroSubheadlineEn || '',
        heroWholesaleButtonZh: heroData?.heroWholesaleButtonZh || '',
        heroWholesaleButtonEn: heroData?.heroWholesaleButtonEn || '',
        heroWholesaleDescriptionZh: heroData?.heroWholesaleDescriptionZh || '',
        heroWholesaleDescriptionEn: heroData?.heroWholesaleDescriptionEn || '',
        heroProjectButtonZh: heroData?.heroProjectButtonZh || '',
        heroProjectButtonEn: heroData?.heroProjectButtonEn || '',
        heroProjectDescriptionZh: heroData?.heroProjectDescriptionZh || '',
        heroProjectDescriptionEn: heroData?.heroProjectDescriptionEn || '',
        heroWholesaleCategoryId: heroData?.heroWholesaleCategoryId || '',
        heroProjectCategoryId: heroData?.heroProjectCategoryId || '',
        heroSlides: initialSlides,
        isVideoEnabled: videoData?.isVideoEnabled ?? true,
        videoTitleZh: videoData?.videoTitleZh || '',
        videoTitleEn: videoData?.videoTitleEn || '',
        videoSubtitleZh: videoData?.videoSubtitleZh || '',
        videoSubtitleEn: videoData?.videoSubtitleEn || '',
        videoUrl: videoData?.videoUrl || '/video/alibaba2023_x264.mp4'
      });
    }
  }, [heroData, videoData]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Split the data back into hero and video documents
      const heroPayload = {
        heroSlides: formData.heroSlides,
        heroHeadlineZh: formData.heroHeadlineZh,
        heroHeadlineEn: formData.heroHeadlineEn,
        heroSubheadlineZh: formData.heroSubheadlineZh,
        heroSubheadlineEn: formData.heroSubheadlineEn,
        heroWholesaleButtonZh: formData.heroWholesaleButtonZh,
        heroWholesaleButtonEn: formData.heroWholesaleButtonEn,
        heroWholesaleDescriptionZh: formData.heroWholesaleDescriptionZh,
        heroWholesaleDescriptionEn: formData.heroWholesaleDescriptionEn,
        heroProjectButtonZh: formData.heroProjectButtonZh,
        heroProjectButtonEn: formData.heroProjectButtonEn,
        heroProjectDescriptionZh: formData.heroProjectDescriptionZh,
        heroProjectDescriptionEn: formData.heroProjectDescriptionEn,
        heroWholesaleCategoryId: formData.heroWholesaleCategoryId,
        heroProjectCategoryId: formData.heroProjectCategoryId,
      };

      const videoPayload = {
        isVideoEnabled: formData.isVideoEnabled,
        videoTitleZh: formData.videoTitleZh,
        videoTitleEn: formData.videoTitleEn,
        videoSubtitleZh: formData.videoSubtitleZh,
        videoSubtitleEn: formData.videoSubtitleEn,
        videoUrl: formData.videoUrl,
      };

      await Promise.all([
        fetch('/api/homepageContent/hero', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(heroPayload),
        }),
        fetch('/api/homepageContent/video', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(videoPayload),
        })
      ]);

      mutateHero();
      mutateVideo();
      setIsSaving(false);
      toast({ title: "首页配置已保存" });
    } catch (e) {
      setIsSaving(false);
      toast({ variant: "destructive", title: "保存失败" });
    }
  };

  const handleTranslate = async (fields: { source: string, targetKey: string }[], localFormData = formData) => {
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 智译未启用" });
      return;
    }

    setIsAiProcessing(true);
    try {
      const updates: any = { ...localFormData };
      
      for (const field of fields) {
        if (!localFormData[field.source]) continue;
        const res = await translateContent({
          text: localFormData[field.source] || '',
          targetLangs: ['en'],
          apiKey: aiConfig.apiKey
        });
        if (res.en) updates[field.targetKey] = res.en;
      }

      const translatedSlides = await Promise.all(localFormData.heroSlides.map(async (slide: any) => {
        const headlineRes = await translateContent({
          text: slide.headlineZh || '',
          targetLangs: ['en'],
          apiKey: aiConfig.apiKey
        });
        const subheadlineRes = await translateContent({
          text: slide.subheadlineZh || '',
          targetLangs: ['en'],
          apiKey: aiConfig.apiKey
        });
        return {
          ...slide,
          headlineEn: headlineRes.en || slide.headlineEn,
          subheadlineEn: subheadlineRes.en || slide.subheadlineEn
        };
      }));

      updates.heroSlides = translatedSlides;
      return updates;
    } catch (error: any) {
      toast({ variant: "destructive", title: "智译失败", description: error.message });
      return null;
    } finally {
      setIsAiProcessing(false);
    }
  };

  const addSlide = () => {
    const newSlide = {
      id: `slide_${Date.now()}`,
      headlineZh: '新标题',
      headlineEn: 'New Headline',
      subheadlineZh: '新副标题',
      subheadlineEn: 'New Subheadline',
      bgImage: "/image/hero-bg.png",
      priority: formData.heroSlides.length
    };
    setFormData({ ...formData, heroSlides: [...formData.heroSlides, newSlide] });
  };

  const removeSlide = (index: number) => {
    const newSlides = formData.heroSlides.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, heroSlides: newSlides });
  };

  const updateSlide = (index: number, updates: any) => {
    const newSlides = [...formData.heroSlides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setFormData({ ...formData, heroSlides: newSlides });
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...formData.heroSlides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;
    
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;
    
    setFormData({ ...formData, heroSlides: newSlides });
  };

  const getCategoryName = (id: string) => {
    const cat = categories?.find((c: any) => c.id === id);
    if (!cat) return id;
    const trans = translations?.find((t: any) => t.id === cat.nameTextId);
    return trans?.zh || id;
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">载入配置中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <AiGradientDef />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-[-24px] z-50 bg-white/80 backdrop-blur-xl py-5 border-b border-white/40 -mx-6 px-10 shadow-sm transition-all duration-300">
        <div className="space-y-1">
          <h2 className="text-xl font-headline font-bold text-slate-900 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Home className="h-4.5 w-4.5" />
            </div>
            首页视觉配置
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pl-12">Management / Content / Home Visuals</p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl h-14 px-10 gap-3 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          发布配置变更
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="bg-muted/30 p-1 rounded-2xl mb-8 h-14">
          <TabsTrigger value="hero" className="rounded-xl px-8 text-xs font-bold uppercase tracking-wider gap-2">
            <ImageIcon className="h-4 w-4" /> 英雄视觉 (Hero)
          </TabsTrigger>
          <TabsTrigger value="video" className="rounded-xl px-8 text-xs font-bold uppercase tracking-wider gap-2">
            <Film className="h-4 w-4" /> 品牌故事 (Video)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2 border-b pb-4">
              <Layers className="h-4 w-4" /> 底部入口卡片配置
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="p-5 rounded-2xl bg-muted/5 border border-dashed space-y-4">
                <span className="text-[10px] font-bold uppercase text-primary">批发入口按钮及描述 (ZH / EN)</span>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formData.heroWholesaleButtonZh} onChange={e => setFormData({...formData, heroWholesaleButtonZh: e.target.value})} placeholder="按钮中文" className="h-10 rounded-xl" />
                  <Input value={formData.heroWholesaleButtonEn} onChange={e => setFormData({...formData, heroWholesaleButtonEn: e.target.value})} placeholder="Button English" className="h-10 rounded-xl border-dashed" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formData.heroWholesaleDescriptionZh} onChange={e => setFormData({...formData, heroWholesaleDescriptionZh: e.target.value})} placeholder="描述中文" className="h-10 rounded-xl" />
                  <Input value={formData.heroWholesaleDescriptionEn} onChange={e => setFormData({...formData, heroWholesaleDescriptionEn: e.target.value})} placeholder="Desc English" className="h-10 rounded-xl border-dashed" />
                </div>
                <Select value={formData.heroWholesaleCategoryId} onValueChange={v => setFormData({...formData, heroWholesaleCategoryId: v})}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="选择跳转分类" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">全部分类</SelectItem>
                    {categories?.map((cat: any) => <SelectItem key={cat.id} value={cat.id} className="text-xs">{getCategoryName(cat.id)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-5 rounded-2xl bg-muted/5 border border-dashed space-y-4">
                <span className="text-[10px] font-bold uppercase text-primary">项目入口按钮及描述 (ZH / EN)</span>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formData.heroProjectButtonZh} onChange={e => setFormData({...formData, heroProjectButtonZh: e.target.value})} placeholder="按钮中文" className="h-10 rounded-xl" />
                  <Input value={formData.heroProjectButtonEn} onChange={e => setFormData({...formData, heroProjectButtonEn: e.target.value})} placeholder="Button English" className="h-10 rounded-xl border-dashed" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formData.heroProjectDescriptionZh} onChange={e => setFormData({...formData, heroProjectDescriptionZh: e.target.value})} placeholder="描述中文" className="h-10 rounded-xl" />
                  <Input value={formData.heroProjectDescriptionEn} onChange={e => setFormData({...formData, heroProjectDescriptionEn: e.target.value})} placeholder="Desc English" className="h-10 rounded-xl border-dashed" />
                </div>
                <Select value={formData.heroProjectCategoryId} onValueChange={v => setFormData({...formData, heroProjectCategoryId: v})}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="选择跳转分类" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories?.map((cat: any) => <SelectItem key={cat.id} value={cat.id} className="text-xs">{getCategoryName(cat.id)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> 英雄屏视觉卡片管理
                </h3>
                <p className="text-[10px] text-muted-foreground">设置一张或多张背景卡片。多张卡片将自动启用轮播效果。</p>
              </div>
               <div className="flex gap-3">
                {aiConfig?.isEnabled && (
                  <ShinyButton 
                    onClick={async () => {
                      const updates = await handleTranslate([
                        {source: 'heroWholesaleButtonZh', targetKey: 'heroWholesaleButtonEn'},
                        {source: 'heroWholesaleDescriptionZh', targetKey: 'heroWholesaleDescriptionEn'},
                        {source: 'heroProjectButtonZh', targetKey: 'heroProjectButtonEn'},
                        {source: 'heroProjectDescriptionZh', targetKey: 'heroProjectDescriptionEn'}
                      ]);
                      if(updates) setFormData({...formData, ...updates});
                    }}
                    disabled={isAiProcessing}
                    className="h-9 px-4"
                    shape="capsule"
                  >
                    <div className="flex items-center gap-2">
                      {isAiProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest">AI 智译全部内容</span>
                    </div>
                  </ShinyButton>
                )}
                <Button onClick={addSlide} size="sm" className="rounded-xl h-9 px-4 gap-2 text-[10px] font-bold uppercase tracking-wider shadow-md">
                  <Plus className="h-3.5 w-3.5" /> 添加新内容卡片
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {formData.heroSlides.map((slide: any, index: number) => (
                <div key={slide.id} className="group relative bg-muted/5 rounded-3xl border border-dashed p-6 hover:border-primary/40 hover:bg-muted/10 transition-all duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3 space-y-3">
                      <Label className="text-[10px] font-bold uppercase opacity-40">背景图片</Label>
                      <div 
                        className="relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group/img border-2 border-transparent hover:border-primary transition-all shadow-lg"
                        onClick={() => setPickerConfig({ open: true, slideIndex: index })}
                      >
                        <Image src={slide.bgImage} alt="Preview" fill className="object-cover" unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                          <ImageIcon className="text-white h-8 w-8" />
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full rounded-xl h-9 text-[10px] font-bold"
                        onClick={() => setPickerConfig({ open: true, slideIndex: index })}
                      >
                        更改背景
                      </Button>
                    </div>

                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase opacity-40">主标题 (ZH)</Label>
                          <Input 
                            value={slide.headlineZh} 
                            onChange={e => updateSlide(index, { headlineZh: e.target.value })} 
                            className="h-10 rounded-xl bg-white" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase opacity-40">副标题 (ZH)</Label>
                          <Input 
                            value={slide.subheadlineZh} 
                            onChange={e => updateSlide(index, { subheadlineZh: e.target.value })} 
                            className="h-10 rounded-xl bg-white" 
                          />
                        </div>
                      </div>
                      <div className="space-y-4 md:border-l md:pl-6 border-dashed">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase opacity-40">HEADLINE (EN)</Label>
                          <Input 
                            value={slide.headlineEn} 
                            onChange={e => updateSlide(index, { headlineEn: e.target.value })} 
                            className="h-10 rounded-xl bg-white border-dashed" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase opacity-40">SUBHEADLINE (EN)</Label>
                          <Input 
                            value={slide.subheadlineEn} 
                            onChange={e => updateSlide(index, { subheadlineEn: e.target.value })} 
                            className="h-10 rounded-xl bg-white border-dashed" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-1 flex flex-row lg:flex-col items-center justify-center gap-2 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-4 border-dashed">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === formData.heroSlides.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-destructive/40 hover:text-destructive hover:bg-destructive/5"
                        onClick={() => removeSlide(index)}
                        disabled={formData.heroSlides.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.heroSlides.length === 0 && (
              <div className="py-20 text-center bg-muted/5 border-2 border-dashed rounded-[2.5rem]">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">暂无内容卡片，请点击右上角添加</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-xl transition-colors", formData.isVideoEnabled ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                  <Video className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest">视频/品牌故事模块开关</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">开启后前台将显示全屏视频品牌板块。</p>
                </div>
              </div>
              <Switch 
                checked={formData.isVideoEnabled} 
                onCheckedChange={v => setFormData({...formData, isVideoEnabled: v})} 
              />
            </div>

            {formData.isVideoEnabled && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Film className="h-4 w-4" /> 品牌故事滚动文案配置
                  </h3>
                   {aiConfig?.isEnabled && (
                    <ShinyButton 
                      onClick={async () => {
                        const updates = await handleTranslate([
                          {source: 'videoTitleZh', targetKey: 'videoTitleEn'},
                          {source: 'videoSubtitleZh', targetKey: 'videoSubtitleEn'}
                        ]);
                        if(updates) setFormData({...formData, ...updates});
                      }}
                      disabled={isAiProcessing}
                      className="h-9 px-4"
                      shape="capsule"
                    >
                      <div className="flex items-center gap-2">
                        {isAiProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">AI 智译</span>
                      </div>
                    </ShinyButton>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase opacity-40">滚动第一段 (ZH)</Label>
                    <Input value={formData.videoTitleZh} onChange={e => setFormData({...formData, videoTitleZh: e.target.value})} className="h-11 rounded-xl" />
                    <Label className="text-[10px] font-bold uppercase opacity-40">滚动第二段 (ZH)</Label>
                    <Input value={formData.videoSubtitleZh} onChange={e => setFormData({...formData, videoSubtitleZh: e.target.value})} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-4 border-l pl-10 border-dashed">
                    <Label className="text-[10px] font-bold uppercase opacity-40">FIRST SEGMENT (EN)</Label>
                    <Input value={formData.videoTitleEn} onChange={e => setFormData({...formData, videoTitleEn: e.target.value})} className="h-11 rounded-xl border-dashed" />
                    <Label className="text-[10px] font-bold uppercase opacity-40">SECOND SEGMENT (EN)</Label>
                    <Input value={formData.videoSubtitleEn} onChange={e => setFormData({...formData, videoSubtitleEn: e.target.value})} className="h-11 rounded-xl border-dashed" />
                  </div>
                </div>

                <div className="pt-8 border-t border-dashed space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase opacity-40">视频资源地址 (Video Source URL)</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 rounded-xl text-[10px] font-bold uppercase text-primary hover:bg-primary/5"
                      onClick={() => setPickerConfig({ open: true, slideIndex: -1 })}
                    >
                      <ImageIcon className="h-3.5 w-3.5 mr-2" /> 从素材库选择
                    </Button>
                  </div>
                  <div className="flex gap-4">
                    <Input 
                      value={formData.videoUrl} 
                      onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                      placeholder="https://... 或 /video/..." 
                      className="h-11 rounded-xl font-mono text-xs" 
                    />
                    <div className="w-20 h-11 rounded-xl bg-black flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-lg">
                      <Video className="h-4 w-4 text-white/20" />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">支持 MP4 直接链接或本地路径。建议使用 H.264 编码以获得最佳兼容性。</p>
                </div>
              </div>
            )}

            {!formData.isVideoEnabled && (
              <div className="py-12 text-center bg-muted/5 border-2 border-dashed rounded-2xl">
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">视频模块已禁用，保存后前台将不再显示</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <MediaLibraryDialog 
        open={pickerConfig.open}
        onOpenChange={(open) => setPickerConfig({ ...pickerConfig, open })}
        onSelect={(assets) => {
          if (assets.length > 0) {
            const url = assets[0].url;
            if (pickerConfig.slideIndex === -1) {
              setFormData({ ...formData, videoUrl: url });
            } else if (pickerConfig.slideIndex !== null) {
              updateSlide(pickerConfig.slideIndex, { bgImage: url });
            }
          }
        }}
        selectionMode="single"
        title="选择首页媒体素材"
        subtitle="选择一张高质量图片或一段精彩视频作为首页展示"
      />
    </div>
  );
}
