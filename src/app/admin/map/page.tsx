"use client";

import { useState, useEffect } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Save, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon, 
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Globe,
  Building2,
  Microscope,
  Factory,
  Search,
  Check,
  X
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { translateContent } from '@/ai/flows/translate-flow';
import { cn } from '@/lib/utils';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getAssetUrl } from '@/lib/image-utils';
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

export default function GlobalMapAdminPage() {
  const { toast } = useToast();
  const { data: homeData, mutate: mutateHome } = useLocalDoc<any>('homepageContent', 'map');
  const { data: locations, isLoading: isLoadingLocs, mutate: mutateLocs } = useLocalCollection<any>('mapLocations');
  const { data: aiConfig } = useLocalDoc<any>('settings', 'ai');

  const [sectionForm, setSectionForm] = useState<any>({
    mapTitleZh: '',
    mapTitleEn: '',
    mapSubtitleZh: '',
    mapSubtitleEn: ''
  });

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  
  // 图库选择器状态
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [locationForm, setLocationForm] = useState<any>({
    id: '',
    type: 'Factory',
    titleZh: '',
    titleEn: '',
    addressZh: '',
    addressEn: '',
    descZh: '',
    descEn: '',
    imageUrl: '',
    posTop: '50%',
    posLeft: '50%'
  });

  useEffect(() => {
    if (homeData) {
      setSectionForm({
        mapTitleZh: homeData.mapTitleZh || '',
        mapTitleEn: homeData.mapTitleEn || '',
        mapSubtitleZh: homeData.mapSubtitleZh || '',
        mapSubtitleEn: homeData.mapSubtitleEn || ''
      });
    }
  }, [homeData]);

  const handleSaveSectionConfig = async () => {
    setIsSavingConfig(true);
    try {
      await upsertLocalizedString('MAP_TITLE', { zh: sectionForm.mapTitleZh, en: sectionForm.mapTitleEn });
      await upsertLocalizedString('MAP_SUBTITLE', { zh: sectionForm.mapSubtitleZh, en: sectionForm.mapSubtitleEn });
      await upsertLocalizedString('MAP_NETWORK_LABEL', { zh: '全球网点布局', en: 'Heovose Global Network' });

      const res = await fetch('/api/homepageContent/map', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sectionForm,
          mapTitleTextId: 'MAP_TITLE',
          mapSubtitleTextId: 'MAP_SUBTITLE'
        }),
      });

      if (!res.ok) throw new Error('保存配置失败');
      
      mutateHome();
      toast({ title: "板块标题配置已同步" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "保存失败", description: e.message });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const upsertLocalizedString = async (id: string, content: { zh?: string, en?: string }) => {
    if (!id) return;
    try {
      await fetch(`/api/localizedStrings/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content })
      });
    } catch (e) {
      console.error(`Failed to sync translation for ${id}`, e);
    }
  };

  const handleLocationSubmit = async () => {
    if (!locationForm.titleZh) {
      toast({ variant: "destructive", title: "请填写网点名称" });
      return;
    }

    const locId = editingLocation ? editingLocation.id : `loc_${Date.now()}`;
    const titleTextId = `MAP_LOC_${locId.toUpperCase()}_TITLE`;
    const addressTextId = `MAP_LOC_${locId.toUpperCase()}_ADDR`;
    const descTextId = `MAP_LOC_${locId.toUpperCase()}_DESC`;

    const processedData = {
      ...locationForm,
      id: locId,
      titleTextId,
      addressTextId,
      descTextId
    };

    try {
      await Promise.all([
        upsertLocalizedString(titleTextId, { zh: locationForm.titleZh, en: locationForm.titleEn }),
        upsertLocalizedString(addressTextId, { zh: locationForm.addressZh, en: locationForm.addressEn }),
        upsertLocalizedString(descTextId, { zh: locationForm.descZh, en: locationForm.descEn })
      ]);

      const url = editingLocation ? `/api/mapLocations/${locId}` : '/api/mapLocations';
      const method = editingLocation ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });

      if (!res.ok) throw new Error('保存网点失败');

      mutateLocs();
      setIsLocationDialogOpen(false);
      setEditingLocation(null);
      toast({ title: editingLocation ? "网点信息已更新" : "新网点已添加" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "操作失败", description: e.message });
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('确定要删除该网点吗？')) return;
    try {
      const res = await fetch(`/api/mapLocations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('删除失败');
      mutateLocs();
      toast({ title: "网点已删除" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "操作失败", description: e.message });
    }
  };

  const handleTranslateFields = async (fields: { source: string, targetKey: string }[], localData: any) => {
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 智译未启用" });
      return null;
    }

    setIsAiProcessing(true);
    try {
      const updates: any = {};
      for (const field of fields) {
        if (!localData[field.source]) continue;
        const res = await translateContent({
          text: localData[field.source] || '',
          targetLangs: ['en'],
          apiKey: aiConfig.apiKey
        });
        if (res.en) updates[field.targetKey] = res.en;
      }
      return updates;
    } catch (error: any) {
      toast({ variant: "destructive", title: "智译失败", description: error.message });
      return null;
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleTranslateLocation = async () => {
    const updates = await handleTranslateFields([
      { source: 'titleZh', targetKey: 'titleEn' },
      { source: 'addressZh', targetKey: 'addressEn' },
      { source: 'descZh', targetKey: 'descEn' }
    ], locationForm);
    if (updates) {
      setLocationForm({ ...locationForm, ...updates });
      toast({ title: "网点信息智译完成" });
    }
  };

  const handleTranslateSection = async () => {
    const updates = await handleTranslateFields([
      { source: 'mapTitleZh', targetKey: 'mapTitleEn' },
      { source: 'mapSubtitleZh', targetKey: 'mapSubtitleEn' }
    ], sectionForm);
    if (updates) {
      setSectionForm({ ...sectionForm, ...updates });
      toast({ title: "板块标题智译完成" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <AiGradientDef />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-[-24px] z-50 bg-background/95 backdrop-blur-md py-4 border-b -mx-6 px-6 mb-6">
        <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
          <MapPin className="h-5 w-5" /> 全球地图配置中心
        </h2>
      </div>

      <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-headline font-bold text-primary flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> 全球地图与网点管理
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase font-medium">前台地图板块顶部的标题与描述。</p>
          </div>
          <div className="flex gap-3">
             {aiConfig?.isEnabled && (
              <ShinyButton 
                onClick={handleTranslateSection}
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
            <Button 
              onClick={handleSaveSectionConfig} 
              disabled={isSavingConfig}
              className="rounded-xl h-9 px-6 gap-2 text-[10px] font-bold uppercase tracking-widest shadow-md"
            >
              {isSavingConfig ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              保存标题配置
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-40">板块标题 (ZH)</Label>
              <Input value={sectionForm.mapTitleZh} onChange={e => setSectionForm({...sectionForm, mapTitleZh: e.target.value})} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-40">板块副标题 (ZH)</Label>
              <Textarea value={sectionForm.mapSubtitleZh} onChange={e => setSectionForm({...sectionForm, mapSubtitleZh: e.target.value})} className="min-h-[80px] rounded-xl" />
            </div>
          </div>
          <div className="space-y-4 border-l pl-10 border-dashed">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-40">SECTION TITLE (EN)</Label>
              <Input value={sectionForm.mapTitleEn} onChange={e => setSectionForm({...sectionForm, mapTitleEn: e.target.value})} className="h-11 rounded-xl border-dashed" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-40">SECTION SUBTITLE (EN)</Label>
              <Textarea value={sectionForm.mapSubtitleEn} onChange={e => setSectionForm({...sectionForm, mapSubtitleEn: e.target.value})} className="min-h-[80px] rounded-xl border-dashed" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <MapPin className="h-4 w-4" /> 网点标注点管理
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase font-medium">配置地图上显示的交互式 Pins。</p>
          </div>
          <Button onClick={() => {
            setLocationForm({ id: '', type: 'Factory', titleZh: '', titleEn: '', addressZh: '', addressEn: '', descZh: '', descEn: '', imageUrl: '', posTop: '50%', posLeft: '50%' });
            setEditingLocation(null);
            setIsLocationDialogOpen(true);
          }} className="rounded-xl h-10 px-6 gap-2 text-xs font-bold uppercase tracking-widest shadow-md">
            <Plus className="h-4 w-4" /> 新增网点
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingLocs ? (
            <div className="col-span-full py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></div>
          ) : (locations || []).length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-muted/5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">暂无网点数据，请点击上方按钮添加</p>
            </div>
          ) : (
            (locations || []).map((loc: any) => (
              <Card key={loc.id} className="rounded-2xl border-border/40 overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
                <div className="relative h-32 bg-muted/20">
                  {loc.imageUrl && <img src={getAssetUrl(loc.imageUrl)} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-primary text-white text-[8px] uppercase">{loc.type}</Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => { setEditingLocation(loc); setLocationForm(loc); setIsLocationDialogOpen(true); }}><Edit2 className="h-3.5 w-3.5" /></Button>
                     <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDeleteLocation(loc.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h4 className="text-xs font-bold text-primary truncate">{loc.titleZh}</h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{loc.addressZh}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed">
                    <span className="text-[8px] font-mono opacity-40">POS: L:{loc.posLeft}, T:{loc.posTop}</span>
                    <div className="flex items-center gap-1">
                      {loc.titleEn ? <Badge variant="secondary" className="h-3 px-1 text-[6px] bg-green-50 text-green-600">EN OK</Badge> : <Badge variant="secondary" className="h-3 px-1 text-[6px]">NO EN</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Location Editor Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="max-w-5xl p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-white flex items-center justify-between">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5" /> {editingLocation ? '编辑网点' : '新增全球网点'}
              </DialogTitle>
              <DialogDescription className="text-white/60 text-xs">填写网点详细信息，并从素材库选择展示图片。</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 bg-white space-y-8 max-h-[80vh] overflow-y-auto">
            {/* 第一排：类型选择与预览 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">网点类型</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'HQ', label: '总部 (HQ)', icon: Building2 },
                      { id: 'R&D', label: '研发 (R&D)', icon: Microscope },
                      { id: 'Factory', label: '工厂 (Factory)', icon: Factory },
                      { id: 'Global', label: '分支 (Global)', icon: Globe },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setLocationForm({ ...locationForm, type: t.id })}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-left",
                          locationForm.type === t.id 
                            ? "bg-primary/5 border-primary text-primary shadow-sm" 
                            : "bg-muted/5 border-transparent hover:border-border text-muted-foreground"
                        )}
                      >
                        <t.icon className={cn("h-4 w-4", locationForm.type === t.id ? "text-primary" : "opacity-40")} />
                        <span className="text-[10px] font-bold whitespace-nowrap">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-end justify-end">
                {aiConfig?.isEnabled && (
                  <ShinyButton 
                    onClick={handleTranslateLocation} 
                    disabled={isAiProcessing}
                    className="h-10 px-5"
                    shape="capsule"
                  >
                    <div className="flex items-center gap-2">
                      {isAiProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span className="text-[11px] font-bold uppercase tracking-widest">AI 智译右侧信息</span>
                    </div>
                  </ShinyButton>
                )}
              </div>
            </div>

            {/* 内容对齐区域 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              {/* 名称行 */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">网点名称 (ZH)</Label>
                <Input value={locationForm.titleZh} onChange={e => setLocationForm({...locationForm, titleZh: e.target.value})} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">NAME (EN)</Label>
                <Input value={locationForm.titleEn} onChange={e => setLocationForm({...locationForm, titleEn: e.target.value})} className="h-10 rounded-xl border-dashed" />
              </div>

              {/* 地址行 */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">详细地址 (ZH)</Label>
                <Input value={locationForm.addressZh} onChange={e => setLocationForm({...locationForm, addressZh: e.target.value})} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">ADDRESS (EN)</Label>
                <Input value={locationForm.addressEn} onChange={e => setLocationForm({...locationForm, addressEn: e.target.value})} className="h-10 rounded-xl border-dashed" />
              </div>

              {/* 介绍行 */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">详细介绍 (ZH)</Label>
                <Textarea value={locationForm.descZh} onChange={e => setLocationForm({...locationForm, descZh: e.target.value})} className="min-h-[100px] rounded-xl resize-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">DESCRIPTION (EN)</Label>
                <Textarea value={locationForm.descEn} onChange={e => setLocationForm({...locationForm, descEn: e.target.value})} className="min-h-[100px] rounded-xl border-dashed resize-none" />
              </div>
            </div>

            {/* 图片与坐标区域 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-dashed">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">展示图预览</Label>
                <div 
                  className="relative aspect-video rounded-xl bg-muted/20 border-2 border-dashed border-border/40 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:bg-muted/30 transition-all"
                  onClick={() => setIsPickerOpen(true)}
                >
                  {locationForm.imageUrl ? (
                    <>
                      <img src={getAssetUrl(locationForm.imageUrl)} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button variant="secondary" size="sm" className="rounded-full h-8 text-[10px] font-bold uppercase tracking-wider">更换图片</Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">从素材库选择</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-40">地图坐标 Left (%)</Label>
                    <Input value={locationForm.posLeft} onChange={e => setLocationForm({...locationForm, posLeft: e.target.value})} placeholder="如: 75%" className="h-10 rounded-xl font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-40">地图坐标 Top (%)</Label>
                    <Input value={locationForm.posTop} onChange={e => setLocationForm({...locationForm, posTop: e.target.value})} placeholder="如: 40%" className="h-10 rounded-xl font-mono" />
                  </div>
                </div>
                <div className="p-4 bg-muted/5 rounded-2xl border border-dashed">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-bold text-primary uppercase block mb-1">坐标说明：</span>
                    请填入百分比数值。Left 代表从地图左边缘起算的距离，Top 代表从顶边缘起算的距离。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/10 p-6 flex gap-3 border-t">
            <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)} className="rounded-xl h-11 flex-1 font-bold uppercase text-[10px]">取消编辑</Button>
            <Button onClick={handleLocationSubmit} className="rounded-xl h-11 flex-1 font-bold uppercase text-[10px]">确认并保存</Button>
          </DialogFooter>

          <MediaLibraryDialog 
            open={isPickerOpen}
            onOpenChange={setIsPickerOpen}
            onSelect={(assets) => {
              if (assets.length > 0) {
                setLocationForm({ ...locationForm, imageUrl: assets[0].url });
              }
            }}
            selectionMode="single"
            title="选择网点展示图片"
            subtitle="从素材库中选择一张高质量的工厂或办事处照片"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
