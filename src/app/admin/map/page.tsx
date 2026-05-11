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
  const { data: homeData, isLoading, mutate: mutateMap } = useLocalDoc<any>('homepageContent', 'map');
  const { data: aiConfig } = useLocalDoc<any>('settings', 'ai');
  const { data: galleryAssets } = useLocalCollection<any>('galleryAssets');

  const [formData, setFormData] = useState<any>({
    mapTitleZh: '',
    mapTitleEn: '',
    mapTitleTextId: '',
    mapSubtitleZh: '',
    mapSubtitleEn: '',
    mapSubtitleTextId: '',
    locations: []
  });

  const [isSaving, setIsSaving] = useState(false);
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
    titleTextId: '',
    addressZh: '',
    addressEn: '',
    addressTextId: '',
    descZh: '',
    descEn: '',
    descTextId: '',
    imageUrl: '',
    posTop: '50%',
    posLeft: '50%'
  });

  useEffect(() => {
    if (homeData) {
      setFormData({
        mapTitleZh: homeData.mapTitleZh || '',
        mapTitleEn: homeData.mapTitleEn || '',
        mapTitleTextId: homeData.mapTitleTextId || '',
        mapSubtitleZh: homeData.mapSubtitleZh || '',
        mapSubtitleEn: homeData.mapSubtitleEn || '',
        mapSubtitleTextId: homeData.mapSubtitleTextId || '',
        locations: homeData.locations || []
      });
    }
  }, [homeData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const finalData = {
        ...formData,
        mapTitleTextId: formData.mapTitleTextId || 'MAP_TITLE',
        mapSubtitleTextId: formData.mapSubtitleTextId || 'MAP_SUBTITLE'
      };

      // 1. 自动同步核心板块翻译
      await upsertLocalizedString(finalData.mapTitleTextId, { zh: formData.mapTitleZh, en: formData.mapTitleEn });
      await upsertLocalizedString(finalData.mapSubtitleTextId, { zh: formData.mapSubtitleZh, en: formData.mapSubtitleEn });
      await upsertLocalizedString('MAP_NETWORK_LABEL', { zh: '全球网点布局', en: 'Heovose Global Network' });

      // 2. 自动同步所有网点翻译
      for (const loc of formData.locations) {
        if (loc.titleTextId) await upsertLocalizedString(loc.titleTextId, { zh: loc.titleZh, en: loc.titleEn });
        if (loc.addressTextId) await upsertLocalizedString(loc.addressTextId, { zh: loc.addressZh, en: loc.addressEn });
        if (loc.descTextId) await upsertLocalizedString(loc.descTextId, { zh: loc.descZh, en: loc.descEn });
      }

      const res = await fetch('/api/homepageContent/map', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || '同步到数据库失败');
      }

      mutateMap();
      setIsSaving(false);
      toast({ title: "地图配置及翻译库已同步" });
    } catch (e: any) {
      setIsSaving(false);
      toast({ 
        variant: "destructive", 
        title: "保存失败", 
        description: e.message || "未知错误"
      });
    }
  };

  const upsertLocalizedString = async (id: string, content: { zh?: string, en?: string }) => {
    if (!id) return;
    try {
      await fetch(`/api/localizedStrings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
    } catch (e) {
      console.error(`Failed to sync translation for ${id}`, e);
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

  const handleLocationSubmit = () => {
    const newLocations = [...(formData.locations || [])];
    const locId = editingLocation ? editingLocation.id : `loc_${Date.now()}`;
    
    // 自动生成并锁定翻译 ID
    const processedForm = {
      ...locationForm,
      id: locId,
      titleTextId: `MAP_LOC_${locId.toUpperCase()}_TITLE`,
      addressTextId: `MAP_LOC_${locId.toUpperCase()}_ADDR`,
      descTextId: `MAP_LOC_${locId.toUpperCase()}_DESC`
    };

    if (editingLocation) {
      const idx = newLocations.findIndex(l => l.id === editingLocation.id);
      newLocations[idx] = processedForm;
    } else {
      newLocations.push(processedForm);
    }
    setFormData({ ...formData, locations: newLocations });
    setIsLocationDialogOpen(false);
    setEditingLocation(null);
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

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">载入全球地图配置...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <AiGradientDef />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-[-24px] z-50 bg-background/95 backdrop-blur-md py-4 border-b -mx-6 px-6">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <MapPin className="h-5 w-5" /> 全球地图与网点管理
          </h2>
          <p className="text-xs text-muted-foreground">管理世界地图上展示的 HQ、研发中心及全球工厂坐标与详细信息。</p>
        </div>
        
        <Button onClick={handleSave} disabled={isSaving} className="rounded-xl h-12 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-xl">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          同步地图变更
        </Button>
      </div>

      <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <Globe className="h-4 w-4" /> 板块核心文案
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase font-medium">前台地图板块顶部的标题与描述。</p>
          </div>
           {aiConfig?.isEnabled && (
            <ShinyButton 
              onClick={async () => {
                const updates = await handleTranslateFields([
                  { source: 'mapTitleZh', targetKey: 'mapTitleEn' },
                  { source: 'mapSubtitleZh', targetKey: 'mapSubtitleEn' }
                ], formData);
                if (updates) setFormData({ ...formData, ...updates });
              }}
              disabled={isAiProcessing}
              className="h-9 px-4"
              shape="capsule"
            >
              <div className="flex items-center gap-2">
                {isAiProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span className="text-[10px] font-bold uppercase tracking-widest">AI 智译标题</span>
              </div>
            </ShinyButton>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-40">板块标题 (ZH)</Label>
              <Input value={formData.mapTitleZh} onChange={e => setFormData({...formData, mapTitleZh: e.target.value})} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-40">板块副标题 (ZH)</Label>
              <Textarea value={formData.mapSubtitleZh} onChange={e => setFormData({...formData, mapSubtitleZh: e.target.value})} className="min-h-[80px] rounded-xl" />
            </div>
          </div>
          <div className="space-y-4 border-l pl-10 border-dashed">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-40">SECTION TITLE (EN)</Label>
              <Input value={formData.mapTitleEn} onChange={e => setFormData({...formData, mapTitleEn: e.target.value})} className="h-11 rounded-xl border-dashed" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-40">SECTION SUBTITLE (EN)</Label>
              <Textarea value={formData.mapSubtitleEn} onChange={e => setFormData({...formData, mapSubtitleEn: e.target.value})} className="min-h-[80px] rounded-xl border-dashed" />
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
          {(formData.locations || []).map((loc: any) => (
            <Card key={loc.id} className="rounded-2xl border-border/40 overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
              <div className="relative h-32 bg-muted/20">
                {loc.imageUrl && <img src={getAssetUrl(loc.imageUrl)} alt="" className="w-full h-full object-cover" />}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-primary text-white text-[8px] uppercase">{loc.type}</Badge>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => { setEditingLocation(loc); setLocationForm(loc); setIsLocationDialogOpen(true); }}><Edit2 className="h-3.5 w-3.5" /></Button>
                   <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => {
                     const newList = formData.locations.filter((l:any) => l.id !== loc.id);
                     setFormData({...formData, locations: newList});
                   }}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          ))}
          {(!formData.locations || formData.locations.length === 0) && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-muted/5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">暂无网点数据，请点击上方按钮添加</p>
            </div>
          )}
        </div>
      </div>

      {/* Location Editor Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="max-w-4xl p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-white flex items-center justify-between">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5" /> {editingLocation ? '编辑网点' : '新增全球网点'}
              </DialogTitle>
              <DialogDescription className="text-white/60 text-xs">填写网点详细信息，并从素材库选择展示图片。</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">网点类型</Label>
                  <Select value={locationForm.type} onValueChange={v => setLocationForm({...locationForm, type: v})}>
                    <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="HQ">总部 (HQ)</SelectItem>
                      <SelectItem value="R&D">研发中心 (R&D)</SelectItem>
                      <SelectItem value="Factory">制造工厂 (Factory)</SelectItem>
                      <SelectItem value="Global">全球分支 (Global)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">地图图标预览</Label>
                  <div className="h-10 flex items-center gap-3 px-4 bg-muted/10 rounded-xl">
                    {locationForm.type === 'HQ' && <Building2 className="h-5 w-5 text-primary" />}
                    {locationForm.type === 'R&D' && <Microscope className="h-5 w-5 text-primary" />}
                    {locationForm.type === 'Factory' && <Factory className="h-5 w-5 text-primary" />}
                    {locationForm.type === 'Global' && <Globe className="h-5 w-5 text-primary" />}
                    <span className="text-[10px] font-bold">{locationForm.type}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">网点名称 (ZH)</Label>
                  <Input value={locationForm.titleZh} onChange={e => setLocationForm({...locationForm, titleZh: e.target.value})} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">详细地址 (ZH)</Label>
                  <Input value={locationForm.addressZh} onChange={e => setLocationForm({...locationForm, addressZh: e.target.value})} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">详细介绍 (ZH)</Label>
                  <Textarea value={locationForm.descZh} onChange={e => setLocationForm({...locationForm, descZh: e.target.value})} className="min-h-[80px] rounded-xl" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-dashed">
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
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-end border-l pl-8">
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

              <div className="space-y-4 pt-4 border-l pl-8 border-dashed">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">NAME (EN)</Label>
                  <Input value={locationForm.titleEn} onChange={e => setLocationForm({...locationForm, titleEn: e.target.value})} className="h-10 rounded-xl border-dashed" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">ADDRESS (EN)</Label>
                  <Input value={locationForm.addressEn} onChange={e => setLocationForm({...locationForm, addressEn: e.target.value})} className="h-10 rounded-xl border-dashed" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">DESCRIPTION (EN)</Label>
                  <Textarea value={locationForm.descEn} onChange={e => setLocationForm({...locationForm, descEn: e.target.value})} className="min-h-[80px] rounded-xl border-dashed" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-l pl-8 border-dashed border-t">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">地图坐标 Left (%)</Label>
                  <Input value={locationForm.posLeft} onChange={e => setLocationForm({...locationForm, posLeft: e.target.value})} placeholder="如: 75%" className="h-10 rounded-xl font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">地图坐标 Top (%)</Label>
                  <Input value={locationForm.posTop} onChange={e => setLocationForm({...locationForm, posTop: e.target.value})} placeholder="如: 40%" className="h-10 rounded-xl font-mono" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/10 p-6 flex gap-3 border-t">
            <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)} className="rounded-xl h-11 flex-1 font-bold uppercase text-[10px]">取消编辑</Button>
            <Button onClick={handleLocationSubmit} className="rounded-xl h-11 flex-1 font-bold uppercase text-[10px]">确认网点配置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
