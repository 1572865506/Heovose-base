
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Trash2,
  Edit2,
  ClipboardList,
  MoveUp,
  MoveDown,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Check,
  X,
  Search,
  ChevronRight,
  ChevronLeft
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
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';
import Image from 'next/image';
import { getAssetUrl } from '@/lib/image-utils';

interface ProductionStep {
  id: string;
  order: number;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  imageUrls: string[];
}

export default function ProductionStepsAdminPage() {
  const { toast } = useToast();

  const { data: steps, isLoading, mutate: mutateSteps } = useLocalCollection<ProductionStep>('productionSteps');
  const { data: aiConfig } = useLocalDoc<any>('settings', 'ai');
  const { data: galleryAssets } = useLocalCollection<any>('galleryAssets');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: homeContent, mutate: mutateHome } = useLocalDoc<any>('homepageContent', 'hero');
  const { data: translations, mutate: mutateTranslations } = useLocalCollection<any>('localizedStrings');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [editingStep, setEditingStep] = useState<ProductionStep | null>(null);

  const [sectionForm, setSectionForm] = useState({
    processTitleZh: '',
    processTitleEn: '',
    processSubtitleZh: '',
    processSubtitleEn: ''
  });

  // 同步初始化板块标题 (资产库优先 + Nullish Coalescing)
  useMemo(() => {
    if (translations) {
      const titleAsset = translations.find((t: any) => t.id === 'PROCESS_TITLE');
      const subtitleAsset = translations.find((t: any) => t.id === 'PROCESS_SUBTITLE');

      setSectionForm({
        processTitleZh: titleAsset?.content?.zh ?? homeContent?.processTitleZh ?? '',
        processTitleEn: titleAsset?.content?.en ?? homeContent?.processTitleEn ?? '',
        processSubtitleZh: subtitleAsset?.content?.zh ?? homeContent?.processSubtitleZh ?? '',
        processSubtitleEn: subtitleAsset?.content?.en ?? homeContent?.processSubtitleEn ?? ''
      });
    }
  }, [translations, homeContent]);

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [form, setForm] = useState<Partial<ProductionStep>>({
    titleZh: '',
    titleEn: '',
    descZh: '',
    descEn: '',
    imageUrls: []
  });

  const handleOpenDialog = (step?: ProductionStep) => {
    if (step) {
      setEditingStep(step);
      setForm(step);
    } else {
      setEditingStep(null);
      setForm({
        titleZh: '',
        titleEn: '',
        descZh: '',
        descEn: '',
        imageUrls: [],
        order: (steps?.length || 0) + 1
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titleZh) return;

    const id = editingStep?.id || `step_${Date.now()}`;
    const titleTextId = `process_step_${id}_title`;
    const descTextId = `process_step_${id}_desc`;

    const stepData = {
      ...form,
      id,
      titleTextId,
      descriptionTextId: descTextId
    };

    try {
      // 1. 同步到生产步骤集合
      await fetch(`/api/productionSteps/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepData),
      });

      // 2. 同步到翻译资产库
      await Promise.all([
        fetch(`/api/localizedStrings/${encodeURIComponent(titleTextId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: titleTextId, content: { zh: form.titleZh, en: form.titleEn } })
        }),
        fetch(`/api/localizedStrings/${encodeURIComponent(descTextId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: descTextId, content: { zh: form.descZh, en: form.descEn } })
        })
      ]);

      mutateSteps();
      setIsDialogOpen(false);
      toast({ title: editingStep ? "步骤已更新并同步翻译" : "新步骤已添加并同步翻译" });
    } catch (e) {
      console.error('Save Step Error:', e);
      toast({ variant: "destructive", title: "保存失败" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要永久删除此生产环节吗？')) return;
    try {
      await fetch(`/api/productionSteps/${id}`, { method: 'DELETE' });
      mutateSteps();
      toast({ title: "步骤已删除" });
    } catch (e) {
      toast({ variant: "destructive", title: "删除失败" });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!steps) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const currentStep = steps[index];
    const targetStep = steps[targetIndex];

    try {
      await Promise.all([
        fetch(`/api/productionSteps/${currentStep.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentStep, order: targetStep.order }),
        }),
        fetch(`/api/productionSteps/${targetStep.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...targetStep, order: currentStep.order }),
        })
      ]);
      mutateSteps();
    } catch (e) {
      toast({ variant: "destructive", title: "排序更新失败" });
    }
  };

  const handleTranslate = async () => {
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 未启用" });
      return;
    }
    setIsAiProcessing(true);
    try {
      const needsTitle = form.titleZh && (!form.titleEn || form.titleEn.trim() === '');
      const needsDesc = form.descZh && (!form.descEn || form.descEn.trim() === '');

      if (needsTitle) {
        const res = await smartTranslate({ text: form.titleZh || '', targetLangs: ['en'], taskType: 'text' });
        if (res.en) setForm(prev => ({ ...prev, titleEn: res.en }));
      }

      if (needsDesc) {
        const res = await smartTranslate({ text: form.descZh || '', targetLangs: ['en'], taskType: 'text' });
        if (res.en) setForm(prev => ({ ...prev, descEn: res.en }));
      }

      toast({ title: "智译成功" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "智译失败", description: e.message });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleTranslateSection = async () => {
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 未启用" });
      return;
    }
    setIsAiProcessing(true);
    try {
      const needsTitle = sectionForm.processTitleZh && (!sectionForm.processTitleEn || sectionForm.processTitleEn.trim() === '');
      const needsSubtitle = sectionForm.processSubtitleZh && (!sectionForm.processSubtitleEn || sectionForm.processSubtitleEn.trim() === '');

      if (needsTitle) {
        const res = await smartTranslate({ text: sectionForm.processTitleZh, targetLangs: ['en'], taskType: 'text' });
        if (res.en) setSectionForm(prev => ({ ...prev, processTitleEn: res.en }));
      }

      if (needsSubtitle) {
        const res = await smartTranslate({ text: sectionForm.processSubtitleZh, targetLangs: ['en'], taskType: 'text' });
        if (res.en) setSectionForm(prev => ({ ...prev, processSubtitleEn: res.en }));
      }

      toast({ title: "板块标题智译成功" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "智译失败", description: e.message });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSaveSectionConfig = async () => {
    setIsSavingConfig(true);
    try {
      // 1. 同步到主内容配置 (0 硬编码：仅同步 TextId 引用)
      const res = await fetch('/api/homepageContent/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processTitleTextId: 'PROCESS_TITLE',
          processSubtitleTextId: 'PROCESS_SUBTITLE'
        }),
      });
      if (!res.ok) throw new Error('Save to homepageContent failed');

      // 2. 同步到翻译资产库 (Zero-Hardcoding 体系)
      await Promise.all([
        fetch(`/api/localizedStrings/${encodeURIComponent('PROCESS_TITLE')}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: 'PROCESS_TITLE', content: { zh: sectionForm.processTitleZh, en: sectionForm.processTitleEn } })
        }),
        fetch(`/api/localizedStrings/${encodeURIComponent('PROCESS_SUBTITLE')}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: 'PROCESS_SUBTITLE', content: { zh: sectionForm.processSubtitleZh, en: sectionForm.processSubtitleEn } })
        })
      ]);

      mutateHome();
      mutateTranslations();
      toast({ title: "板块标题配置已保存并同步至资产库" });
    } catch (e) {
      console.error('Save Section Config Error:', e);
      toast({ variant: "destructive", title: "保存失败" });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const moveImage = (idx: number, dir: 'left' | 'right') => {
    const urls = [...(form.imageUrls || [])];
    const targetIdx = dir === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= urls.length) return;
    [urls[idx], urls[targetIdx]] = [urls[targetIdx], urls[idx]];
    setForm({ ...form, imageUrls: urls });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-headline font-bold text-foreground flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
            制造流程管理
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] pl-14">Management / Content / Steps</p>
        </div>

        <Button onClick={() => handleOpenDialog()} className="rounded-2xl h-12 px-6 font-bold uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> 新增生产环节
        </Button>
      </div>

      <div className="bg-card p-8 rounded-3xl border border-border/40 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> 制造板块视觉文案配置
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">Section Heading & Localization Settings</p>
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
              保存配置
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 p-5 bg-muted/5 rounded-2xl border border-dashed">
            <span className="text-[10px] font-bold uppercase text-primary/60 tracking-widest">中文配置 (ZH)</span>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">主标题</Label>
                <Input
                  value={sectionForm.processTitleZh}
                  onChange={e => setSectionForm({ ...sectionForm, processTitleZh: e.target.value })}
                  placeholder="例如：精密制造"
                  className="h-10 rounded-xl bg-card border-border/40 text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">副标题</Label>
                <Input
                  value={sectionForm.processSubtitleZh}
                  onChange={e => setSectionForm({ ...sectionForm, processSubtitleZh: e.target.value })}
                  placeholder="例如：11步卓越生产流程"
                  className="h-10 rounded-xl bg-card border-border/40 text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 bg-muted/5 rounded-2xl border border-dashed">
            <span className="text-[10px] font-bold uppercase text-primary/60 tracking-widest">英文配置 (EN)</span>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Main Title</Label>
                <Input
                  value={sectionForm.processTitleEn}
                  onChange={e => setSectionForm({ ...sectionForm, processTitleEn: e.target.value })}
                  placeholder="e.g. Precision Manufacturing"
                  className="h-10 rounded-xl bg-card border-border/40 border-dashed text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase opacity-40">Subtitle</Label>
                <Input
                  value={sectionForm.processSubtitleEn}
                  onChange={e => setSectionForm({ ...sectionForm, processSubtitleEn: e.target.value })}
                  placeholder="e.g. 11 Steps of Excellence"
                  className="h-10 rounded-xl bg-card border-border/40 border-dashed text-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden">
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></div>
          ) : steps?.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-muted/5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic opacity-40">暂无生产步骤数据 / NO DATA</p>
            </div>
          ) : (
            <div className="space-y-3">
              {steps?.map((step, idx) => (
                <div key={step.id} className="group flex items-center gap-6 p-4 bg-muted/5 hover:bg-muted/10 rounded-2xl border border-transparent hover:border-border/60 transition-all">
                  <div className="w-10 h-10 shrink-0 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
                    {idx + 1}
                  </div>

                  <div className="relative w-20 h-14 shrink-0 bg-card rounded-lg border border-border/40 overflow-hidden shadow-inner">
                    {step.imageUrls?.[0] ? (
                      <Image src={getAssetUrl(step.imageUrls[0])} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex items-center justify-center h-full opacity-20"><ImageIcon className="h-5 w-5" /></div>
                    )}
                    {step.imageUrls && step.imageUrls.length > 1 && (
                      <Badge className="absolute bottom-1.5 right-1.5 h-4 px-1.5 text-[9px] bg-black/60 border-none font-bold">+{step.imageUrls.length - 1}</Badge>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-bold text-primary">{step.titleZh}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 italic uppercase tracking-wider font-medium">{step.titleEn || 'No English Translation'}</p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={idx === 0} onClick={() => handleMove(idx, 'up')}><MoveUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={idx === steps.length - 1} onClick={() => handleMove(idx, 'down')}><MoveDown className="h-4 w-4" /></Button>
                    <div className="w-px h-4 bg-border mx-2" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenDialog(step)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(step.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[3rem] max-w-5xl p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] admin-interface-dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200/50 admin-interface-dark:border-white/5 bg-card flex flex-col">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 admin-interface-dark:from-slate-950 admin-interface-dark:to-slate-900 p-8 text-slate-900 admin-interface-dark:text-white relative overflow-hidden border-b border-slate-200/80 admin-interface-dark:border-white/5 shrink-0">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ClipboardList className="h-24 w-24" />
            </div>
            <DialogHeader className="relative z-10 space-y-2">
              <DialogTitle className="text-xl font-headline font-black flex items-center gap-4 text-slate-900 admin-interface-dark:text-white">
                <div className="h-10 w-10 rounded-xl bg-slate-200/50 admin-interface-dark:bg-white/10 flex items-center justify-center border border-slate-300/50 admin-interface-dark:border-white/5 text-slate-700 admin-interface-dark:text-white">
                  <ClipboardList className="h-5 w-5" />
                </div>
                {editingStep ? '编辑生产步骤' : '新增生产环节'}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-500/50 admin-interface-dark:text-white/30 uppercase tracking-[0.3em]">配置制造流水线中的关键视觉与参数</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 bg-card grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">步骤标题 (ZH)</Label>
                  <Input value={form.titleZh} onChange={e => setForm({ ...form, titleZh: e.target.value })} className="h-11 rounded-xl bg-muted/5 border border-slate-200 admin-interface-dark:border-white/10 text-sm font-bold shadow-inner" placeholder="例如: PMC 生产计划" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">核心描述 (ZH)</Label>
                  <Textarea value={form.descZh} onChange={e => setForm({ ...form, descZh: e.target.value })} className="min-h-[120px] rounded-xl bg-muted/5 border border-slate-200 admin-interface-dark:border-white/10 text-sm font-bold shadow-inner" placeholder="详细说明此环节的操作逻辑与质量标准..." />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-dashed">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">步骤关联素材 ({form.imageUrls?.length || 0})</Label>
                  <Button variant="outline" size="sm" onClick={() => setIsPickerOpen(true)} className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2">
                    <Plus className="h-3 w-3" /> 批量导入素材
                  </Button>
                </div>
                <div className="flex gap-4 p-4 bg-muted/5 rounded-xl border border-slate-200 admin-interface-dark:border-white/10 overflow-x-auto min-h-[120px] items-center">
                  {form.imageUrls?.map((url, i) => (
                    <div key={i} className="group relative w-32 aspect-square shrink-0 rounded-lg border border-border/40 overflow-hidden bg-card shadow-sm transition-all hover:scale-105">
                      <Image src={getAssetUrl(url)} alt="" fill className="object-cover" unoptimized />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <Button size="icon" variant="secondary" className="h-6 w-6 rounded-full" disabled={i === 0} onClick={() => moveImage(i, 'left')}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="secondary" className="h-6 w-6 rounded-full" disabled={i === (form.imageUrls?.length || 0) - 1} onClick={() => moveImage(i, 'right')}><ChevronRight className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="destructive" className="h-6 w-6 rounded-full" onClick={() => setForm({ ...form, imageUrls: form.imageUrls?.filter((_, idx) => idx !== i) })}><X className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                  {(!form.imageUrls || form.imageUrls.length === 0) && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-30">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs font-bold uppercase tracking-widest">请选择至少一张图片</span>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-muted-foreground italic font-medium">提示：支持上传多张图片。若配置多张，前台该步骤将自动启用「进度条式」轮播切换展示。</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-end border-l pl-8">
                {aiConfig?.isEnabled && (
                  <ShinyButton
                    onClick={handleTranslate}
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

              <div className="space-y-4 pt-4 border-l pl-8 border-dashed flex-1">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">Title (EN)</Label>
                  <Input value={form.titleEn} onChange={e => setForm({ ...form, titleEn: e.target.value })} className="h-11 rounded-xl border-dashed border-primary/20 focus:border-primary/40 bg-muted/5 text-sm font-bold shadow-inner" placeholder="STEP TITLE IN ENGLISH" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">Description (EN)</Label>
                  <Textarea value={form.descEn} onChange={e => setForm({ ...form, descEn: e.target.value })} className="min-h-[120px] rounded-xl border-dashed border-primary/20 focus:border-primary/40 bg-muted/5 text-sm font-bold shadow-inner" placeholder="DETAILED ENGLISH DESCRIPTION..." />
                </div>
              </div>

              <div className="pt-6 border-l pl-8 border-dashed">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">步骤排序权重</Label>
                  <Input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) })} className="h-10 rounded-xl bg-muted/5 border border-slate-200 admin-interface-dark:border-white/10 font-mono text-sm font-bold shadow-inner" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/10 admin-interface-dark:bg-muted/5 p-8 border-t border-border/40 admin-interface-dark:border-border/5 gap-4">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-14 rounded-2xl flex-1 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/60 admin-interface-dark:text-muted-foreground/40 hover:text-foreground">取消编辑</Button>
            <Button onClick={handleSave} className="h-14 rounded-2xl flex-1 font-bold uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-primary/20">确认步骤配置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaLibraryDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={(assets) => {
          const newUrls = assets.map(a => a.url);
          setForm(prev => {
            const currentUrls = prev.imageUrls || [];
            // 过滤掉已经存在的 URL，实现增量添加
            const uniqueNewUrls = newUrls.filter(url => !currentUrls.includes(url));
            return {
              ...prev,
              imageUrls: [...currentUrls, ...uniqueNewUrls]
            };
          });
          toast({ title: `成功导入 ${newUrls.length} 张图片` });
        }}
        selectionMode="multiple"
        title="选择生产步骤素材"
        subtitle="你可以选择多张图片，这些图片将按顺序在该步骤中循环播放"
      />
    </div>
  );
}
