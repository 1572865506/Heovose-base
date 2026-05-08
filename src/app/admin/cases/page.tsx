
"use client";

import { useState, useMemo } from 'react';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Star, 
  MoveUp, 
  MoveDown, 
  Loader2, 
  Sparkles, 
  Image as ImageIcon,
  Check,
  X,
  Search,
  ExternalLink
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
import { getAssetUrl } from '@/lib/image-utils';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Badge } from '@/components/ui/badge';
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';
import Image from 'next/image';

interface CaseStudy {
  id: string;
  order: number;
  tagZh: string;
  tagEn: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  imageUrl: string;
}

export default function CaseStudiesAdminPage() {
  const { toast } = useToast();
  const { data: cases, isLoading, mutate: mutateCases } = useLocalCollection<CaseStudy>('caseStudies');
  const { data: aiConfig } = useLocalDoc<any>('settings', 'ai');
  const { data: galleryAssets } = useLocalCollection<any>('galleryAssets');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [form, setForm] = useState<Partial<CaseStudy>>({
    tagZh: '',
    tagEn: '',
    titleZh: '',
    titleEn: '',
    descZh: '',
    descEn: '',
    imageUrl: ''
  });

  const handleOpenDialog = (item?: CaseStudy) => {
    if (item) {
      setEditingCase(item);
      setForm(item);
    } else {
      setEditingCase(null);
      setForm({
        tagZh: '',
        tagEn: '',
        titleZh: '',
        titleEn: '',
        descZh: '',
        descEn: '',
        imageUrl: '',
        order: (cases?.length || 0) + 1
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titleZh || !form.imageUrl) {
      toast({ variant: "destructive", title: "请填写标题并选择封面图" });
      return;
    }
    
    const id = editingCase?.id || `case_${Date.now()}`;
    
    try {
      const res = await fetch(`/api/caseStudies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) throw new Error("Failed to save");

      setIsDialogOpen(false);
      mutateCases();
      toast({ title: editingCase ? "案例已更新" : "新案例已成功添加" });
    } catch (e) {
      toast({ variant: "destructive", title: "保存失败" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要永久删除此成功案例吗？')) return;
    try {
      const res = await fetch(`/api/caseStudies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      mutateCases();
      toast({ title: "案例已删除" });
    } catch (e) {
      toast({ variant: "destructive", title: "删除失败" });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!cases) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cases.length) return;

    const current = cases[index];
    const target = cases[targetIndex];

    try {
      await Promise.all([
        fetch(`/api/caseStudies/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...current, order: target.order }),
        }),
        fetch(`/api/caseStudies/${target.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...target, order: current.order }),
        })
      ]);
      mutateCases();
      toast({ title: "排序已更新" });
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
      const results = await Promise.all([
        form.tagZh ? translateContent({ text: form.tagZh || '', targetLangs: ['en'], apiKey: aiConfig.apiKey }) : null,
        form.titleZh ? translateContent({ text: form.titleZh || '', targetLangs: ['en'], apiKey: aiConfig.apiKey }) : null,
        form.descZh ? translateContent({ text: form.descZh || '', targetLangs: ['en'], apiKey: aiConfig.apiKey }) : null
      ]);
      setForm(prev => ({
        ...prev,
        tagEn: results[0]?.en?.toUpperCase() || prev.tagEn,
        titleEn: results[1]?.en || prev.titleEn,
        descEn: results[2]?.en || prev.descEn
      }));
      toast({ title: "智译成功" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "智译失败", description: e.message });
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <Star className="h-5 w-5" /> 成功案例管理
          </h2>
          <p className="text-xs text-muted-foreground">定义全球各行业的成功交付方案，支持多语言动态展示。</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="rounded-xl h-10 px-6 gap-2 text-xs font-bold uppercase tracking-widest shadow-md">
          <Plus className="h-4 w-4" /> 新增案例
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></div>
        ) : cases?.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-muted/5">
             <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">暂无案例数据</p>
          </div>
        ) : (
          cases?.map((item, idx) => (
            <div key={item.id} className="group relative bg-white rounded-3xl border border-border/40 overflow-hidden shadow-sm hover:shadow-xl transition-all">
              <div className="relative h-48 bg-muted/20">
                {item.imageUrl ? (
                  <Image src={getAssetUrl(item.imageUrl)} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex items-center justify-center h-full opacity-20"><ImageIcon className="h-8 w-8" /></div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1">
                    {item.tagZh}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <div className="flex gap-2 bg-white/20 backdrop-blur-md p-2 rounded-full">
                     <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" disabled={idx === 0} onClick={() => handleMove(idx, 'up')}><MoveUp className="h-4 w-4" /></Button>
                     <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" disabled={idx === cases.length - 1} onClick={() => handleMove(idx, 'down')}><MoveDown className="h-4 w-4" /></Button>
                     <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleOpenDialog(item)}><Edit2 className="h-4 w-4" /></Button>
                     <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                   </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h4 className="text-lg font-bold text-primary truncate leading-tight">{item.titleZh}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.descZh}</p>
                <div className="pt-3 border-t border-dashed flex justify-between items-center">
                   <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">SORT ORDER: {item.order}</span>
                   {item.titleEn ? <Badge variant="outline" className="h-4 px-1.5 text-[8px] border-green-200 text-green-700 bg-green-50">EN READY</Badge> : <Badge variant="outline" className="h-4 px-1.5 text-[8px]">NO EN</Badge>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Star className="h-5 w-5" /> {editingCase ? '编辑案例信息' : '新增成功案例'}
              </DialogTitle>
              <DialogDescription className="text-white/60 text-xs uppercase tracking-tight font-medium">完善案例背景与交付成效，并从素材库选择精美封面。</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-40">行业标签 (ZH)</Label>
                    <Input value={form.tagZh} onChange={e => setForm({...form, tagZh: e.target.value})} className="h-10 rounded-xl" placeholder="如: 智慧零售" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-40">案例标题 (ZH)</Label>
                    <Input value={form.titleZh} onChange={e => setForm({...form, titleZh: e.target.value})} className="h-10 rounded-xl" placeholder="如: 新加坡智慧零售转型" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">核心介绍 (ZH)</Label>
                  <Textarea value={form.descZh} onChange={e => setForm({...form, descZh: e.target.value})} className="min-h-[120px] rounded-xl" placeholder="说明该方案如何解决客户痛点..." />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-dashed">
                <Label className="text-[10px] font-bold uppercase opacity-40">案例展示图封面</Label>
                <div 
                  className="relative aspect-video rounded-2xl bg-muted/20 border-2 border-dashed border-border/40 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:bg-muted/30 transition-all shadow-inner"
                  onClick={() => setIsPickerOpen(true)}
                >
                  {form.imageUrl ? (
                    <>
                      <Image src={getAssetUrl(form.imageUrl)} alt="" fill className="object-cover" unoptimized />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button variant="secondary" size="sm" className="rounded-full h-8 text-[10px] font-bold uppercase tracking-wider">更换展示图</Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <ImageIcon className="h-10 w-10" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">从云端素材库导入</span>
                    </div>
                  )}
                </div>
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
                      <span className="text-[11px] font-bold uppercase tracking-widest">AI 智译右侧信息</span>
                    </div>
                  </ShinyButton>
                )}
              </div>

              <div className="space-y-4 pt-4 border-l pl-8 border-dashed flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-40 tracking-widest">TAG (EN)</Label>
                    <Input value={form.tagEn} onChange={e => setForm({...form, tagEn: e.target.value})} className="h-10 rounded-xl border-dashed" placeholder="SMART RETAIL" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-40 tracking-widest">TITLE (EN)</Label>
                    <Input value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} className="h-10 rounded-xl border-dashed" placeholder="PROJECT TITLE" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40 tracking-widest">DESCRIPTION (EN)</Label>
                  <Textarea value={form.descEn} onChange={e => setForm({...form, descEn: e.target.value})} className="min-h-[120px] rounded-xl border-dashed" placeholder="DETAILED CASE DESCRIPTION..." />
                </div>
              </div>
              
              <div className="pt-6 border-l pl-8 border-dashed">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-40">显示排序权重</Label>
                  <Input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value)})} className="h-10 rounded-xl bg-muted/10 border-transparent font-mono" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/10 p-6 flex gap-3 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 flex-1 font-bold uppercase text-[10px]">放弃编辑</Button>
            <Button onClick={handleSave} className="rounded-xl h-11 flex-1 font-bold uppercase text-[10px]">保存并同步前台</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaLibraryDialog 
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={(assets) => {
          if (assets.length > 0) {
            setForm({ ...form, imageUrl: assets[0].url });
          }
        }}
        selectionMode="single"
        title="选择案例展示图"
        subtitle="从素材库中选择一张精美的案例封面图"
      />
    </div>
  );
}
