
"use client";

import { useState, useMemo } from 'react';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Layers,
  Languages,
  ChevronRight,
  FolderPlus,
  Zap,
  Info,
  LayoutGrid,
  Image as ImageIcon,
  Search,
  Check,
  X,
  Sparkles,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { translateContent } from '@/ai/flows/translate-flow';
import { ShinyButton } from '@/components/ui/shiny-button';
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';

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

interface ProductCategory {
  id: string;
  slug: string;
  thumbnailImageUrl?: string;
  nameTextId: string;
  descriptionTextId?: string;
  parentId?: string | null;
  order: number;
}

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
  id_?: string;
  vi?: string;
  [key: string]: any;
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  
  // 图库选择器状态
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleAutoTranslate = async () => {
    if (!formData.nameZh && !formData.descZh) {
      toast({ variant: "destructive", title: "请先输入中文名称或简述" });
      return;
    }

    setIsTranslating(true);
    try {
      const results = await Promise.all([
        formData.nameZh ? translateContent({ text: formData.nameZh, targetLangs: ['en'] }) : null,
        formData.descZh ? translateContent({ text: formData.descZh, targetLangs: ['en'] }) : null
      ]);

      setFormData(prev => ({
        ...prev,
        nameEn: results[0]?.en || prev.nameEn,
        descEn: results[1]?.en || prev.descEn
      }));
      toast({ title: "全项智译成功" });
    } catch (error: any) {
      toast({ variant: "destructive", title: error.message || "智译失败" });
    } finally {
      setIsTranslating(false);
    }
  };

  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    thumbnailImageUrl: '',
    nameEn: '',
    nameZh: '',
    descEn: '',
    descZh: '',
    parentId: 'none'
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const { data: categories, isLoading: isCatsLoading, mutate: mutateCats } = useLocalCollection<ProductCategory>('productCategories');
  const { data: translations, mutate: mutateTrans } = useLocalCollection<LocalizedString>('localizedStrings?full=true');
  const { data: galleryAssets } = useLocalCollection<any>('galleryAssets');

  // 计算树状结构用于展示和选择
  const categoryTree = useMemo(() => {
    if (!categories) return [];
    const tree: (ProductCategory & { depth: number })[] = [];
    
    const build = (parentId: string | null = null, depth = 0) => {
      categories
        .filter(c => (c.parentId || 'none') === (parentId || 'none'))
        .forEach(cat => {
          tree.push({ ...cat, depth });
          build(cat.id, depth + 1);
        });
    };

    build('none', 0);
    return tree;
  }, [categories]);

  // 检测预设分类是否存在
  const systemPresets = useMemo(() => {
    const hasWholesale = categories?.some(c => c.id === 'WHOLESALE');
    const hasProject = categories?.some(c => c.id === 'PROJECT');
    return { hasWholesale, hasProject };
  }, [categories]);

  const resetForm = () => {
    setFormData({ id: '', slug: '', thumbnailImageUrl: '', nameEn: '', nameZh: '', descEn: '', descZh: '', parentId: 'none' });
    setEditingCategory(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleStartEdit = (cat: ProductCategory) => {
    const nt = translations?.find(t => t.id === cat.nameTextId);
    const dt = translations?.find(t => t.id === cat.descriptionTextId);
    
    const ntContent = (nt?.content as any) || {};
    const dtContent = (dt?.content as any) || {};

    setFormData({
      id: cat.id,
      slug: cat.slug,
      thumbnailImageUrl: cat.thumbnailImageUrl || '',
      nameEn: ntContent.en || (nt as any)?.en || '',
      nameZh: ntContent.zh || (nt as any)?.zh || '',
      descEn: dtContent.en || (dt as any)?.en || '',
      descZh: dtContent.zh || (dt as any)?.zh || '',
      parentId: cat.parentId || 'none'
    });
    setEditingCategory(cat);
    setIsDialogOpen(true);
  };

  const handleMove = async (cat: ProductCategory, direction: 'up' | 'down') => {
    if (!categories) return;
    
    // 找出同一层级的邻居
    const siblings = categories
      .filter(c => (c.parentId || 'none') === (cat.parentId || 'none'))
      .sort((a, b) => a.order - b.order);
      
    const idx = siblings.findIndex(s => s.id === cat.id);
    const neighborIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    if (neighborIdx < 0 || neighborIdx >= siblings.length) return;
    
    const neighbor = siblings[neighborIdx];
    
    // 交换 order
    const oldOrder = cat.order;
    const newOrder = neighbor.order;
    
    try {
      // 如果 order 相同（初始化时），手动拉开间距
      const finalOrder = oldOrder === newOrder ? (direction === 'up' ? newOrder - 1 : newOrder + 1) : newOrder;
      
      const res1 = await fetch(`/api/productCategories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: cat.id, 
          slug: cat.slug, 
          nameTextId: cat.nameTextId, 
          descriptionTextId: cat.descriptionTextId, 
          thumbnailImageUrl: cat.thumbnailImageUrl, 
          parentId: cat.parentId, 
          order: finalOrder 
        }),
      });
      
      const res2 = await fetch(`/api/productCategories/${neighbor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: neighbor.id, 
          slug: neighbor.slug, 
          nameTextId: neighbor.nameTextId, 
          descriptionTextId: neighbor.descriptionTextId, 
          thumbnailImageUrl: neighbor.thumbnailImageUrl, 
          parentId: neighbor.parentId, 
          order: oldOrder 
        }),
      });
      
      if (!res1.ok || !res2.ok) throw new Error('同步排序数据失败');
      
      mutateCats();
      toast({ title: "排序已更新" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "排序失败", description: error.message });
    }
  };

  const handleSave = async () => {
    if (!formData.id || !formData.slug) {
      toast({ variant: "destructive", title: "请填写 ID 和 SLUG" });
      return;
    }
    
    const nameTextId = editingCategory?.nameTextId || `cat_name_${formData.id}`;
    const descriptionTextId = editingCategory?.descriptionTextId || `cat_desc_${formData.id}`;
    const pId = formData.parentId === 'none' ? 'none' : formData.parentId;
    
    try {
      // 1. 保存名称翻译
      const resName = await fetch(`/api/localizedStrings/${nameTextId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nameTextId, en: formData.nameEn.trim(), zh: formData.nameZh.trim() }),
      });
      if (!resName.ok) throw new Error('保存名称翻译失败');

      // 2. 保存描述翻译
      const resDesc = await fetch(`/api/localizedStrings/${descriptionTextId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: descriptionTextId, en: formData.descEn.trim(), zh: formData.descZh.trim() }),
      });
      if (!resDesc.ok) throw new Error('保存描述翻译失败');

      // 3. 保存分类
      const resCat = await fetch(`/api/productCategories/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id,
          slug: formData.slug,
          nameTextId: nameTextId,
          descriptionTextId: descriptionTextId,
          thumbnailImageUrl: formData.thumbnailImageUrl,
          parentId: pId === 'none' ? null : pId,
          order: editingCategory?.order || 0,
        }),
      });
      if (!resCat.ok) {
        const errorData = await resCat.json();
        throw new Error(errorData.error || '保存分类数据失败');
      }

      setIsDialogOpen(false);
      resetForm();
      mutateCats();
      mutateTrans();
      toast({ title: "分类已保存" });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({ 
        variant: "destructive", 
        title: "保存失败", 
        description: error.message || "无法连接到服务器，请检查网络或重试。" 
      });
    }
  };

  const handleInitPresets = async () => {
    // This could be an API call or just client-side loops calling PUT
    const presets = [];
    if (!systemPresets.hasWholesale) {
      presets.push({ id: 'WHOLESALE', slug: 'wholesale', name: { en: 'Wholesale Products', zh: '批发产品' } });
    }
    if (!systemPresets.hasProject) {
      presets.push({ id: 'PROJECT', slug: 'project', name: { en: 'Project Products', zh: '项目产品' } });
    }

    try {
      for (const p of presets) {
        const nameId = `cat_name_${p.id}`;
        await fetch(`/api/localizedStrings/${nameId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: nameId, ...p.name }),
        });
        await fetch(`/api/productCategories/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id, slug: p.slug, nameTextId: nameId, parentId: null, thumbnailImageUrl: '' }),
        });
      }
      mutateCats();
      mutateTrans();
      toast({ title: "系统预设顶级分类已初始化" });
    } catch (e) {
      toast({ variant: "destructive", title: "初始化失败" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此分类吗？其子分类将失去关联。')) return;
    try {
      const res = await fetch(`/api/productCategories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      mutateCats();
      toast({ title: "分类已删除" });
    } catch (e) {
      toast({ variant: "destructive", title: "删除失败" });
    }
  };

  const getT = (id: string) => {
    const t = translations?.find(tr => tr.id === id);
    if (!t) return id;
    const content = (t.content as any) || {};
    return content.zh || (t as any).zh || id;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative min-h-[80vh] pb-20">
      <AiGradientDef />
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] brightness-100 contrast-150" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-headline font-bold text-slate-900 flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            产品分类架构管理
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] pl-14">Management / Structure / Taxonomy</p>
        </div>
        
        <div className="flex gap-3">
          {(!systemPresets.hasWholesale || !systemPresets.hasProject) && (
            <Button 
              variant="outline" 
              onClick={handleInitPresets} 
              className="rounded-2xl h-14 px-6 font-bold uppercase text-xs gap-2 border-orange-200 bg-orange-50/50 backdrop-blur-sm text-orange-700 hover:bg-orange-100 transition-all shadow-sm"
            >
              <Zap className="h-3.5 w-3.5" /> 初始化预设顶级分类
            </Button>
          )}
          <Button 
            onClick={handleOpenDialog} 
            className="rounded-2xl h-14 px-8 font-bold uppercase text-xs gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="h-5 w-5" /> 新增层级分类
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-none bg-white/90 backdrop-blur-2xl">
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FolderPlus className="h-24 w-24" />
            </div>
            <DialogHeader className="relative z-10 space-y-2">
              <DialogTitle className="text-xl font-headline font-bold flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <FolderPlus className="h-5 w-5" />
                </div>
                {editingCategory ? '编辑分类属性' : '创建新分类层级'}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-white/40 uppercase tracking-widest">Taxonomy Structural Configuration</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-xs font-bold uppercase text-slate-400 tracking-widest pl-1">所属上级 (Parent)</Label>
                <Select value={formData.parentId} onValueChange={v => setFormData({...formData, parentId: v})}>
                   <SelectTrigger className="h-12 rounded-xl bg-slate-500/5 border-transparent text-sm font-medium">
                     <SelectValue placeholder="选择上级分类" />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                      <SelectItem value="none" className="text-xs font-bold uppercase tracking-widest py-3">无 (顶级分类)</SelectItem>
                      {categoryTree.filter(c => c.id !== editingCategory?.id).map(cat => (
                        <SelectItem key={cat.id} value={cat.id} className="text-xs py-3">
                           <span style={{ paddingLeft: `${cat.depth * 0.5}rem` }} className={cn(cat.depth > 0 && "opacity-60")}>
                             {getT(cat.nameTextId)}
                           </span>
                        </SelectItem>
                      ))}
                   </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-xs font-bold uppercase text-slate-400 tracking-widest pl-1">唯一 ID / SLUG</Label>
                <Input 
                  disabled={!!editingCategory} 
                  placeholder="如: aio_pro" 
                  value={formData.id} 
                  onChange={e => setFormData({...formData, id: e.target.value.toUpperCase().replace(/\s+/g, '_'), slug: e.target.value.toLowerCase()})} 
                  className="h-12 rounded-xl bg-slate-500/5 border-transparent font-mono text-sm font-bold placeholder:font-normal" 
                />
              </div>
            </div>

            <div className="space-y-5 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2"><Languages className="h-3.5 w-3.5" /> 双语名称与描述配置</Label>
                <ShinyButton 
                  onClick={handleAutoTranslate} 
                  disabled={isTranslating} 
                  className="h-7 px-4"
                  shape="capsule"
                >
                  {isTranslating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  <span className="text-[9px] font-bold uppercase tracking-widest">极光智译</span>
                </ShinyButton>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                   <div className="space-y-2">
                     <Label className="text-[9px] font-bold opacity-40 uppercase pl-1">中文名称</Label>
                     <Input placeholder="高性能一体机" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="rounded-xl h-11 text-sm font-medium" />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[9px] font-bold opacity-40 uppercase pl-1">中文简述</Label>
                     <Input placeholder="极致性能，为专业办公而生" value={formData.descZh} onChange={e => setFormData({...formData, descZh: e.target.value})} className="rounded-xl h-11 text-[11px] font-medium" />
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="space-y-2">
                     <Label className="text-[9px] font-bold opacity-40 uppercase pl-1">English Name</Label>
                     <Input placeholder="High Performance AIO" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-xl h-11 text-sm font-medium border-dashed" />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[9px] font-bold opacity-40 uppercase pl-1">English Desc</Label>
                     <Input placeholder="Professional performance for modern workspace" value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="rounded-xl h-11 text-[11px] font-medium border-dashed" />
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">分类缩略图</Label>
              <div 
                className="relative aspect-[6/1] rounded-[0.75rem] bg-slate-500/5 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:bg-primary/[0.02] hover:border-primary/40 transition-all"
                onClick={() => setIsPickerOpen(true)}
              >
                {formData.thumbnailImageUrl ? (
                  <>
                    <Image src={formData.thumbnailImageUrl} alt="Thumbnail" fill className="object-contain p-4 transition-transform duration-500 group-hover:scale-105" unoptimized />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 gap-3 backdrop-blur-[2px]">
                      <Button variant="secondary" size="sm" className="rounded-full h-9 px-6 text-[10px] font-bold uppercase tracking-wider shadow-2xl">更换图片</Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-9 w-9 rounded-full shadow-2xl" 
                        onClick={(e) => { e.stopPropagation(); setFormData({...formData, thumbnailImageUrl: ''}); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-slate-400 group-hover:text-primary transition-colors">
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                      <ImageIcon className="h-7 w-7" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">从素材库选择媒体</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="bg-slate-50 p-6 border-t border-slate-200 gap-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-2xl flex-1 font-bold uppercase text-xs tracking-widest border-slate-200">放弃编辑</Button>
            <Button onClick={handleSave} className="h-12 rounded-2xl flex-1 font-bold uppercase text-xs tracking-widest shadow-xl shadow-primary/20">确认保存架构</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 引用统一媒体资产库选择器 */}
      <MediaLibraryDialog 
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        selectionMode="single"
        title="选择分类缩略图"
        onSelect={(assets) => {
          if (assets.length > 0) {
            setFormData({ ...formData, thumbnailImageUrl: assets[0].url });
          }
        }}
      />

      {/* Main Content Area */}
      <div className="relative z-10 space-y-4">
        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-500/5 border-b border-white/40">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-24 pl-8 font-bold uppercase text-xs tracking-[0.2em] text-slate-400 h-16">视觉标识</TableHead>
                <TableHead className="font-bold uppercase text-xs tracking-[0.2em] text-slate-400 h-16">分类层级与全称</TableHead>
                <TableHead className="font-bold uppercase text-xs tracking-[0.2em] text-slate-400 h-16">系统标识码 / SLUG</TableHead>
                <TableHead className="w-40 text-right pr-8 font-bold uppercase text-xs tracking-[0.2em] text-slate-400 h-16">操作中心</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isCatsLoading ? (
                <TableRow><TableCell colSpan={4} className="h-64 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" /></TableCell></TableRow>
              ) : categoryTree.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-64 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">尚未建立分类体系 / NO DATA</TableCell></TableRow>
              ) : categoryTree.map((cat) => {
                const t = translations?.find(tr => tr.id === cat.nameTextId);
                const isTopLevel = !cat.parentId || cat.parentId === 'none';
                const isSystemPreset = cat.id === 'WHOLESALE' || cat.id === 'PROJECT';

                return (
                  <TableRow key={cat.id} className="group hover:bg-white/80 transition-all duration-300 border-white/20">
                    <TableCell className="pl-8 py-6">
                      <div className="relative h-12 w-12 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        {cat.thumbnailImageUrl ? (
                          <Image src={cat.thumbnailImageUrl} alt={cat.id} fill className="object-contain p-2" unoptimized />
                        ) : (
                          <LayoutGrid className="h-5 w-5 opacity-20 text-slate-400" />
                        )}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          {Array.from({ length: cat.depth }).map((_, i) => (
                            <div key={i} className="w-8 h-px bg-slate-200 shrink-0 ml-1" />
                          ))}
                          {cat.depth > 0 && (
                            <div className="h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center mr-2">
                              <ChevronRight className="h-3 w-3 text-slate-400" />
                            </div>
                          )}
                          <div className="flex flex-col space-y-0.5">
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "font-headline font-bold text-sm tracking-tight transition-colors", 
                                isTopLevel ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900"
                              )}>
                                {(t?.content as any)?.zh || (t as any)?.zh || cat.id}
                              </span>
                              {isTopLevel && (
                                <Badge className={cn(
                                  "text-[8px] h-4 px-2 uppercase font-bold tracking-widest border-none",
                                  isSystemPreset ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-500"
                                )}>
                                  {isSystemPreset ? 'CORE PRESET' : 'TOP TIER'}
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                              {(t?.content as any)?.en || (t as any)?.en || 'UNTRANSLATED'}
                            </span>
                          </div>
                        </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <code className="text-[11px] font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md w-fit">{cat.slug}</code>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter pl-1 opacity-40">REF: {cat.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 mr-2">
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-white" 
                             onClick={() => handleMove(cat, 'up')}
                           >
                             <ArrowUp className="h-3.5 w-3.5" />
                           </Button>
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-white" 
                             onClick={() => handleMove(cat, 'down')}
                           >
                             <ArrowDown className="h-3.5 w-3.5" />
                           </Button>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5" 
                          onClick={() => handleStartEdit(cat)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-10 w-10 rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/5" 
                          onClick={() => handleDelete(cat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-white/40 shadow-sm flex items-start gap-6 relative z-10">
         <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
           <Info className="h-6 w-6" />
         </div>
         <div className="space-y-2">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">系统架构说明 (Architecture Guide)</p>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              为了实现最优的用户导向，建议将所有业务子类挂载到 <strong className="text-primary">“批发产品” (WHOLESALE)</strong> 或 <strong className="text-primary">“项目产品” (PROJECT)</strong> 之下。
              这种“垂直双轨制”架构能够直接与首页的英雄屏按钮联动，确保全球客户能第一时间精准进入其对应的业务板块。
            </p>
         </div>
      </div>
    </div>
  );
}
