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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Globe, 
  MapPin, 
  Building2, 
  Factory, 
  Microscope, 
  Trash2, 
  Edit2, 
  Plus, 
  Check, 
  Save,
  Loader2, 
  Sparkles, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Search,
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
import { smartTranslate } from '@/lib/translate-client';
import { cn } from '@/lib/utils';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getAssetUrl } from '@/lib/image-utils';
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';
import Image from 'next/image';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminFormSection } from '@/components/admin/AdminFormSection';

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
  
  // 删除确认对话框状态
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMoveLocation = async (id: string, direction: 'left' | 'right') => {
    if (!locations || locations.length < 2) return;
    
    // 获取当前数组副本
    const items = [...locations];
    const currentIndex = items.findIndex((l: any) => l.id === id);
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= items.length) return;
    
    try {
      // 核心修复：如果发现排序值重复（如初始全为0），则先进行全量重排
      const hasDuplicateOrders = new Set(items.map(i => i.order)).size !== items.length;
      
      if (hasDuplicateOrders) {
        console.log('[Admin] Duplicate orders detected, normalizing...');
        // 按照当前索引全量更新排序值
        await Promise.all(items.map((item, idx) => 
          fetch(`/api/mapLocations/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: idx })
          })
        ));
        // 重新获取数据后再次尝试交换，或者直接基于新分配的 order 交换
        // 为了简便，这里直接计算交换后的结果
        const currentId = items[currentIndex].id;
        const targetId = items[targetIndex].id;
        await Promise.all([
          fetch(`/api/mapLocations/${currentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: targetIndex })
          }),
          fetch(`/api/mapLocations/${targetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: currentIndex })
          })
        ]);
      } else {
        // 正常交换逻辑
        const current = items[currentIndex];
        const target = items[targetIndex];
        await Promise.all([
          fetch(`/api/mapLocations/${current.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: target.order })
          }),
          fetch(`/api/mapLocations/${target.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: current.order })
          })
        ]);
      }
      
      mutateLocs();
      toast({ title: "排序已更新" });
    } catch (e) {
      console.error('[Admin] Sort Error:', e);
      toast({ variant: "destructive", title: "排序更新失败" });
    }
  };

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
    countryCode: 'cn',
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

  const handleDeleteLocation = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/mapLocations/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '删除失败');
      }
      mutateLocs();
      toast({ title: "网点已删除" });
      setDeletingId(null);
    } catch (e: any) {
      console.error('[Admin] Delete Error:', e);
      toast({ variant: "destructive", title: "操作失败", description: e.message });
    } finally {
      setIsDeleting(false);
    }
  };


  const handleTranslateLocation = async () => {
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 智译未启用" });
      return;
    }
    setIsAiProcessing(true);
    try {
      const needsTitle = locationForm.titleZh && (!locationForm.titleEn || locationForm.titleEn.trim() === '');
      const needsAddress = locationForm.addressZh && (!locationForm.addressEn || locationForm.addressEn.trim() === '');
      const needsDesc = locationForm.descZh && (!locationForm.descEn || locationForm.descEn.trim() === '');

      if (needsTitle) {
        const res = await smartTranslate({ text: locationForm.titleZh, targetLangs: ['en'], taskType: 'text' });
        if (res.en) setLocationForm((prev: any) => ({ ...prev, titleEn: res.en }));
      }
      if (needsAddress) {
        const res = await smartTranslate({ text: locationForm.addressZh, targetLangs: ['en'], taskType: 'text' });
        if (res.en) setLocationForm((prev: any) => ({ ...prev, addressEn: res.en }));
      }
      if (needsDesc) {
        const res = await smartTranslate({ text: locationForm.descZh, targetLangs: ['en'], taskType: 'text' });
        if (res.en) setLocationForm((prev: any) => ({ ...prev, descEn: res.en }));
      }
      toast({ title: "网点信息智译完成" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "智译失败", description: e.message });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleTranslateSection = async () => {
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 智译未启用" });
      return;
    }
    setIsAiProcessing(true);
    try {
      const needsTitle = sectionForm.mapTitleZh && (!sectionForm.mapTitleEn || sectionForm.mapTitleEn.trim() === '');
      const needsSubtitle = sectionForm.mapSubtitleZh && (!sectionForm.mapSubtitleEn || sectionForm.mapSubtitleEn.trim() === '');

      if (needsTitle) {
        const res = await smartTranslate({ text: sectionForm.mapTitleZh, targetLangs: ['en'], taskType: 'text' });
        if (res.en) setSectionForm((prev: any) => ({ ...prev, mapTitleEn: res.en }));
      }
      if (needsSubtitle) {
        const res = await smartTranslate({ text: sectionForm.mapSubtitleZh, targetLangs: ['en'], taskType: 'text' });
        if (res.en) setSectionForm((prev: any) => ({ ...prev, mapSubtitleEn: res.en }));
      }
      toast({ title: "板块标题智译完成" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "智译失败", description: e.message });
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 relative z-10">
      <AiGradientDef />
      
      <AdminPageHeader
        title="全球网点管理"
        subtitle="Management / Content / Map"
        icon={Globe}
        actions={
          <Button 
            onClick={handleSaveSectionConfig} 
            disabled={isSavingConfig}
            className="rounded-2xl h-12 px-8 gap-2.5 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            {isSavingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存标题配置
          </Button>
        }
      />

      <AdminFormSection
        title="全球地图与网点管理"
        subtitle="前台地图板块顶部的标题与描述。"
        icon={Globe}
        actions={
           aiConfig?.isEnabled && (
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
          )
        }
      >
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
          <div className="space-y-4 border-l pl-10 border-dashed border-border/20">
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
      </AdminFormSection>

      <AdminFormSection
        title="网点标注点管理"
        subtitle="配置地图上显示的交互式 Pins。"
        icon={MapPin}
        actions={
          <Button 
            onClick={() => {
              setLocationForm({ id: '', type: 'Factory', titleZh: '', titleEn: '', addressZh: '', addressEn: '', descZh: '', descEn: '', imageUrl: '', countryCode: 'cn', posTop: '50%', posLeft: '50%' });
              setEditingLocation(null);
              setIsLocationDialogOpen(true);
            }} 
            className="rounded-xl h-9 px-4 font-bold uppercase text-[10px] tracking-widest gap-2 shadow-md hover:scale-105 transition-all"
          >
            <Plus className="h-4 w-4" /> 新增网点
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingLocs && (
            <div className="col-span-full py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></div>
          )}
          
          {!isLoadingLocs && (locations || []).length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-muted/5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">暂无网点数据，请点击新增网点添加</p>
            </div>
          )}

          {!isLoadingLocs && (locations || []).map((loc: any) => (
            <Card key={loc.id} className="rounded-2xl border-border/40 overflow-hidden group hover:border-primary/40 transition-all shadow-sm">
              <div className="relative h-32 bg-muted/20">
                {loc.imageUrl && <img src={getAssetUrl(loc.imageUrl)} alt="" className="w-full h-full object-cover" />}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <Badge className="bg-primary text-white text-[8px] uppercase">{loc.type}</Badge>
                  <Badge variant="outline" className="bg-card/90 backdrop-blur-sm border-transparent text-[8px] flex items-center gap-1 px-1.5 py-0.5">
                    <img 
                      src={`https://flagcdn.com/w20/${(loc.countryCode || 'cn').toLowerCase()}.png`} 
                      alt="" 
                      className="w-3 h-2 object-cover rounded-[1px]" 
                    />
                    <span className="font-bold opacity-70">{(loc.countryCode || 'CN').toUpperCase()}</span>
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <Button 
                     variant="secondary" 
                     size="icon" 
                     className="h-8 w-8 rounded-full z-20" 
                     disabled={(locations || []).indexOf(loc) === 0}
                     onClick={(e) => { e.stopPropagation(); handleMoveLocation(loc.id, 'left'); }}
                   >
                     <ChevronLeft className="h-3.5 w-3.5" />
                   </Button>

                   <Button 
                     variant="secondary" 
                     size="icon" 
                     className="h-8 w-8 rounded-full z-20" 
                     onClick={(e) => { 
                       e.stopPropagation();
                       setEditingLocation(loc); 
                       setLocationForm({ ...loc, countryCode: loc.countryCode || 'cn' }); 
                       setIsLocationDialogOpen(true); 
                     }}
                   >
                     <Edit2 className="h-3.5 w-3.5" />
                   </Button>

                   <button 
                     type="button"
                     className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer relative z-30"
                     onClick={(e) => {
                       e.stopPropagation();
                       e.preventDefault();
                       setDeletingId(loc.id);
                     }}
                     title="删除网点"
                   >
                     <Trash2 className="h-3.5 w-3.5" />
                   </button>

                   <Button 
                     variant="secondary" 
                     size="icon" 
                     className="h-8 w-8 rounded-full z-20" 
                     disabled={(locations || []).indexOf(loc) === (locations || []).length - 1}
                     onClick={(e) => { e.stopPropagation(); handleMoveLocation(loc.id, 'right'); }}
                   >
                     <ChevronRight className="h-3.5 w-3.5" />
                   </Button>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <h4 className="text-xs font-bold text-primary truncate">{loc.titleZh}</h4>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{loc.addressZh}</p>
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-border/20">
                  <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">Country: {loc.countryCode || 'cn'}</span>
                  <div className="flex items-center gap-1">
                    {loc.titleEn ? <Badge variant="secondary" className="h-3 px-1 text-[6px] bg-green-50 text-green-600">EN OK</Badge> : <Badge variant="secondary" className="h-3 px-1 text-[6px]">NO EN</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AdminFormSection>

      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="rounded-[3rem] max-w-5xl h-[90vh] p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] admin-interface-dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200/50 admin-interface-dark:border-white/5 bg-card flex flex-col">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 admin-interface-dark:from-slate-950 admin-interface-dark:to-slate-900 p-8 text-slate-900 admin-interface-dark:text-white relative overflow-hidden border-b border-slate-200/80 admin-interface-dark:border-white/5 shrink-0">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <MapPin className="h-24 w-24" />
            </div>
            <DialogHeader className="relative z-10 space-y-2">
              <DialogTitle className="text-xl font-headline font-black flex items-center gap-4 text-slate-900 admin-interface-dark:text-white">
                <div className="h-10 w-10 rounded-xl bg-slate-200/50 admin-interface-dark:bg-white/10 flex items-center justify-center border border-slate-300/50 admin-interface-dark:border-white/5 text-slate-700 admin-interface-dark:text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                {editingLocation ? '编辑网点' : '新增全球网点'}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-500/50 admin-interface-dark:text-white/30 uppercase tracking-[0.3em]">填写网点详细信息，并从素材库选择展示图片</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 bg-card space-y-8 flex-1 overflow-y-auto">
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
                            ? "bg-primary/10 border-primary text-primary shadow-sm" 
                            : "bg-muted/5 border-slate-200 admin-interface-dark:border-white/10 hover:border-border/20 text-muted-foreground"
                        )}
                      >
                        <t.icon className={cn("h-4 w-4", locationForm.type === t.id ? "text-primary" : "opacity-40")} />
                        <span className="text-[10px] font-bold whitespace-nowrap">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">所属国家</Label>
                  <Select 
                    value={locationForm.countryCode || "cn"} 
                    onValueChange={(val) => setLocationForm({ ...locationForm, countryCode: val })}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-muted/5 border border-slate-200 admin-interface-dark:border-white/10 flex items-center justify-between w-full text-xs font-bold shadow-inner">
                      <SelectValue placeholder="请选择网点所属国家" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>亚洲 (Asia)</SelectLabel>
                        <SelectItem value="cn">中国 (China)</SelectItem>
                        <SelectItem value="hk">中国香港 (Hong Kong)</SelectItem>
                        <SelectItem value="tw">中国台湾 (Taiwan)</SelectItem>
                        <SelectItem value="id">印尼 (Indonesia)</SelectItem>
                        <SelectItem value="my">马来西亚 (Malaysia)</SelectItem>
                        <SelectItem value="sg">新加坡 (Singapore)</SelectItem>
                        <SelectItem value="th">泰国 (Thailand)</SelectItem>
                        <SelectItem value="vn">越南 (Vietnam)</SelectItem>
                        <SelectItem value="jp">日本 (Japan)</SelectItem>
                        <SelectItem value="kr">韩国 (South Korea)</SelectItem>
                        <SelectItem value="in">印度 (India)</SelectItem>
                        <SelectItem value="ph">菲律宾 (Philippines)</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>欧洲 (Europe)</SelectLabel>
                        <SelectItem value="de">德国 (Germany)</SelectItem>
                        <SelectItem value="fr">法国 (France)</SelectItem>
                        <SelectItem value="gb">英国 (UK)</SelectItem>
                        <SelectItem value="it">意大利 (Italy)</SelectItem>
                        <SelectItem value="es">西班牙 (Spain)</SelectItem>
                        <SelectItem value="nl">荷兰 (Netherlands)</SelectItem>
                        <SelectItem value="ru">俄罗斯 (Russia)</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>北美洲 (North America)</SelectLabel>
                        <SelectItem value="us">美国 (USA)</SelectItem>
                        <SelectItem value="ca">加拿大 (Canada)</SelectItem>
                        <SelectItem value="mx">墨西哥 (Mexico)</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>其他 (Others)</SelectLabel>
                        <SelectItem value="au">澳大利亚 (Australia)</SelectItem>
                        <SelectItem value="br">巴西 (Brazil)</SelectItem>
                        <SelectItem value="ae">阿联酋 (UAE)</SelectItem>
                        <SelectItem value="sa">沙特 (Saudi Arabia)</SelectItem>
                        <SelectItem value="za">南非 (South Africa)</SelectItem>
                        <SelectItem value="tr">土耳其 (Turkey)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
                      <span className="text-[11px] font-bold uppercase tracking-widest">AI 智译</span>
                    </div>
                  </ShinyButton>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">网点名称 (ZH)</Label>
                <Input value={locationForm.titleZh} onChange={e => setLocationForm({...locationForm, titleZh: e.target.value})} className="h-10 rounded-xl bg-muted/5 border border-slate-200 admin-interface-dark:border-white/10 text-xs font-bold shadow-inner" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">NAME (EN)</Label>
                <Input value={locationForm.titleEn} onChange={e => setLocationForm({...locationForm, titleEn: e.target.value})} className="h-10 rounded-xl bg-muted/5 border border-dashed border-primary/20 focus:border-primary/40 text-xs font-bold shadow-inner" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">详细地址 (ZH)</Label>
                <Input value={locationForm.addressZh} onChange={e => setLocationForm({...locationForm, addressZh: e.target.value})} className="h-10 rounded-xl bg-muted/5 border border-slate-200 admin-interface-dark:border-white/10 text-xs font-bold shadow-inner" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">ADDRESS (EN)</Label>
                <Input value={locationForm.addressEn} onChange={e => setLocationForm({...locationForm, addressEn: e.target.value})} className="h-10 rounded-xl bg-muted/5 border border-dashed border-primary/20 focus:border-primary/40 text-xs font-bold shadow-inner" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">详细介绍 (ZH)</Label>
                <Textarea value={locationForm.descZh} onChange={e => setLocationForm({...locationForm, descZh: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/5 border border-slate-200 admin-interface-dark:border-white/10 text-xs font-bold shadow-inner resize-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">DESCRIPTION (EN)</Label>
                <Textarea value={locationForm.descEn} onChange={e => setLocationForm({...locationForm, descEn: e.target.value})} className="min-h-[100px] rounded-xl bg-muted/5 border border-dashed border-primary/20 focus:border-primary/40 text-xs font-bold shadow-inner resize-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 pt-6 border-t border-dashed border-border/20">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-40">展示图预览</Label>
                <div 
                  className="relative aspect-video rounded-xl bg-muted/5 border-2 border-dashed border-slate-200 admin-interface-dark:border-white/10 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:bg-primary/[0.02] hover:border-primary/40 transition-all shadow-inner"
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

          <DialogFooter className="bg-muted/10 admin-interface-dark:bg-muted/5 p-8 border-t border-border/40 admin-interface-dark:border-border/5 gap-4 flex-shrink-0">
            <Button variant="ghost" onClick={() => setIsLocationDialogOpen(false)} className="h-14 rounded-2xl flex-1 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/60 admin-interface-dark:text-muted-foreground/40 hover:text-foreground">取消编辑</Button>
            <Button onClick={handleLocationSubmit} className="h-14 rounded-2xl flex-1 font-bold uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-primary/20">确认并保存</Button>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] overflow-hidden border border-slate-200/50 admin-interface-dark:border-white/5 bg-card p-0 shadow-2xl">
          <div className="bg-destructive p-6 text-white flex items-center gap-3">
            <Trash2 className="h-6 w-6" />
            <DialogHeader>
              <DialogTitle className="text-white">确认删除</DialogTitle>
              <DialogDescription className="text-white/60">此操作无法撤销。</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 bg-card space-y-4">
            <p className="text-sm text-muted-foreground">您确定要永久删除该全球网点标注吗？这会立即从前台地图中移除。</p>
          </div>
          <DialogFooter className="bg-muted/10 p-6 flex gap-3 border-t border-border/10">
            <Button variant="outline" onClick={() => setDeletingId(null)} className="rounded-xl flex-1 font-bold uppercase text-[10px]">取消</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteLocation} 
              disabled={isDeleting}
              className="rounded-xl flex-1 font-bold uppercase text-[10px]"
            >
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 mr-2" />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
