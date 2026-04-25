
"use client";

import { useState, useEffect } from 'react';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
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
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { translateContent } from '@/ai/flows/translate-flow';
import { cn } from '@/lib/utils';
import { GalleryPicker } from '@/components/admin/GalleryPicker';
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
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const homeRef = useMemoFirebase(() => firestore ? doc(firestore, 'homepageContent', 'main') : null, [firestore]);
  const aiRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'ai') : null, [firestore]);
  const catsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'productCategories') : null, [firestore]);
  const transQuery = useMemoFirebase(() => firestore ? collection(firestore, 'localizedStrings') : null, [firestore]);
  
  const { data: homeData, isLoading } = useDoc<any>(homeRef);
  const { data: aiConfig } = useDoc<any>(aiRef);
  const { data: categories } = useCollection<any>(catsQuery);
  const { data: translations } = useCollection<any>(transQuery);

  const [formData, setFormData] = useState<any>({
    heroHeadlineZh: '',
    heroHeadlineEn: '',
    heroSubheadlineZh: '',
    heroSubheadlineEn: '',
    heroWholesaleButtonZh: '',
    heroWholesaleButtonEn: '',
    heroProjectButtonZh: '',
    heroProjectButtonEn: '',
    heroWholesaleCategoryId: '',
    heroProjectCategoryId: '',
    heroSlides: [],
    isVideoEnabled: true,
    videoTitleZh: '',
    videoTitleEn: '',
    videoSubtitleZh: '',
    videoSubtitleEn: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [pickerConfig, setPickerConfig] = useState<{ open: boolean, slideIndex: number | null }>({ open: false, slideIndex: null });

  useEffect(() => {
    if (homeData) {
      const existingSlides = homeData.heroSlides || [];
      const initialSlides = existingSlides.length > 0 
        ? existingSlides 
        : [{
            id: 'legacy-default',
            headlineZh: homeData.heroHeadlineZh || '',
            headlineEn: homeData.heroHeadlineEn || '',
            subheadlineZh: homeData.heroSubheadlineZh || '',
            subheadlineEn: homeData.heroSubheadlineEn || '',
            bgImage: "/image/hero-bg.png",
            priority: 0
          }];

      setFormData({ 
        ...formData, 
        heroHeadlineZh: homeData.heroHeadlineZh || '',
        heroHeadlineEn: homeData.heroHeadlineEn || '',
        heroSubheadlineZh: homeData.heroSubheadlineZh || '',
        heroSubheadlineEn: homeData.heroSubheadlineEn || '',
        heroWholesaleButtonZh: homeData.heroWholesaleButtonZh || '',
        heroWholesaleButtonEn: homeData.heroWholesaleButtonEn || '',
        heroProjectButtonZh: homeData.heroProjectButtonZh || '',
        heroProjectButtonEn: homeData.heroProjectButtonEn || '',
        heroWholesaleCategoryId: homeData.heroWholesaleCategoryId || '',
        heroProjectCategoryId: homeData.heroProjectCategoryId || '',
        heroSlides: initialSlides,
        isVideoEnabled: homeData.isVideoEnabled ?? true,
        videoTitleZh: homeData.videoTitleZh || '',
        videoTitleEn: homeData.videoTitleEn || '',
        videoSubtitleZh: homeData.videoSubtitleZh || '',
        videoSubtitleEn: homeData.videoSubtitleEn || ''
      });
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
      toast({ title: "首页配置已保存" });
    }, 800);
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
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-[-24px] z-50 bg-background/95 backdrop-blur-md py-4 border-b -mx-6 px-6">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <Home className="h-5 w-5" /> 首页视觉配置
          </h2>
          <p className="text-xs text-muted-foreground">管理英雄屏及品牌故事文案。全球网点请前往“全球地图”模块管理。</p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl h-12 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-xl">
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
                <span className="text-[10px] font-bold uppercase text-primary">批发入口按钮 (ZH / EN)</span>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formData.heroWholesaleButtonZh} onChange={e => setFormData({...formData, heroWholesaleButtonZh: e.target.value})} placeholder="中文" className="h-10 rounded-xl" />
                  <Input value={formData.heroWholesaleButtonEn} onChange={e => setFormData({...formData, heroWholesaleButtonEn: e.target.value})} placeholder="English" className="h-10 rounded-xl border-dashed" />
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
                <span className="text-[10px] font-bold uppercase text-primary">项目入口按钮 (ZH / EN)</span>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formData.heroProjectButtonZh} onChange={e => setFormData({...formData, heroProjectButtonZh: e.target.value})} placeholder="中文" className="h-10 rounded-xl" />
                  <Input value={formData.heroProjectButtonEn} onChange={e => setFormData({...formData, heroProjectButtonEn: e.target.value})} placeholder="English" className="h-10 rounded-xl border-dashed" />
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ai-btn-glow h-9 px-4 text-[10px] gap-2 font-bold"
                  onClick={async () => {
                    const updates = await handleTranslate([
                      {source: 'heroWholesaleButtonZh', targetKey: 'heroWholesaleButtonEn'},
                      {source: 'heroProjectButtonZh', targetKey: 'heroProjectButtonEn'}
                    ]);
                    if(updates) setFormData({...formData, ...updates});
                  }}
                  disabled={isAiProcessing}
                >
                  <Sparkles className="h-3.5 w-3.5 ai-icon-gradient" /> AI 智译全部内容
                </Button>
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
                  <Button 
                    variant="ghost" size="sm" className="ai-btn-glow h-9 px-4 text-[10px] font-bold"
                    onClick={async () => {
                      const updates = await handleTranslate([
                        {source: 'videoTitleZh', targetKey: 'videoTitleEn'},
                        {source: 'videoSubtitleZh', targetKey: 'videoSubtitleEn'}
                      ]);
                      if(updates) setFormData({...formData, ...updates});
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 ai-icon-gradient" /> AI 智译
                  </Button>
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

      <GalleryPicker 
        open={pickerConfig.open}
        onOpenChange={(open) => setPickerConfig({ ...pickerConfig, open })}
        onSelect={(url) => {
          if (pickerConfig.slideIndex !== null) {
            updateSlide(pickerConfig.slideIndex, { bgImage: url });
          }
        }}
        currentValue={pickerConfig.slideIndex !== null ? formData.heroSlides[pickerConfig.slideIndex]?.bgImage : undefined}
      />
    </div>
  );
}
