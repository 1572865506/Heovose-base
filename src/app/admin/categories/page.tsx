
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
import { getAssetUrl } from '@/lib/image-utils';
import { smartTranslate } from '@/lib/translate-client';
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

    const nameNeeds = formData.nameZh && !formData.nameEn;
    const descNeeds = formData.descZh && !formData.descEn;

    if (!nameNeeds && !descNeeds) {
      toast({ title: "无需翻译", description: "英文内容已存在" });
      return;
    }

    setIsTranslating(true);
    try {
      const [nameRes, descRes] = await Promise.all([
        nameNeeds ? smartTranslate({ text: formData.nameZh, targetLangs: ['en'], taskType: 'text' }) : null,
        descNeeds ? smartTranslate({ text: formData.descZh, targetLangs: ['en'], taskType: 'text' }) : null
      ]);

      setFormData(prev => ({
        ...prev,
        nameEn: nameRes?.en || prev.nameEn,
        descEn: descRes?.en || prev.descEn
      }));
      toast({ title: "智译匹配完成" });
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
    <>
      <div className="space-y-10 animate-in fade-in duration-700 relative min-h-[80vh] pb-20">
        <AiGradientDef />
        {/* 背景装饰 */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] brightness-100 contrast-150" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-headline font-bold text-foreground flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <Layers className="h-5 w-5" />
              </div>
              产品分类架构管理
            </h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] pl-14">Management / Structure / Taxonomy</p>
          </div>
          
          <div className="flex gap-3 relative z-10">
            {(!systemPresets.hasWholesale || !systemPresets.hasProject) && (
              <Button 
                variant="outline" 
                onClick={handleInitPresets} 
                className="rounded-2xl h-14 px-6 font-bold uppercase text-[10px] tracking-widest gap-2 border-amber-500/20 bg-amber-500/5 text-amber-500 hover:bg-amber-500/10 transition-all shadow-2xl shadow-amber-900/10"
              >
                <Zap className="h-3.5 w-3.5 animate-pulse" /> 初始化预设顶级分类
              </Button>
            )}
            <Button 
              onClick={handleOpenDialog} 
              className="rounded-2xl h-14 px-8 font-bold uppercase text-[10px] tracking-[0.2em] gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="h-5 w-5" /> 新增层级分类
            </Button>
          </div>
        </div>

        {/* 表格主内容区 */}
        <div className="relative z-10 space-y-4">
          <div className="bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-border/10 shadow-2xl shadow-black/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30 border-b border-border/10">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-28 pl-10 font-bold uppercase text-[10px] tracking-[0.25em] text-muted-foreground/60 h-16">视觉 / VISUAL</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-[0.25em] text-muted-foreground/60 h-16">分类层级与命名 / HIERARCHY</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-[0.25em] text-muted-foreground/60 h-16">系统标识 / SLUG</TableHead>
                  <TableHead className="w-48 text-right pr-10 font-bold uppercase text-[10px] tracking-[0.25em] text-muted-foreground/60 h-16">操作中心 / ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isCatsLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-80 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary opacity-10" /></TableCell></TableRow>
                ) : categoryTree.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-80 text-center text-[11px] text-muted-foreground/20 font-bold uppercase tracking-[0.4em] italic">尚未建立分类体系 / EMPTY ARCHITECTURE</TableCell></TableRow>
                ) : categoryTree.map((cat) => {
                  const t = translations?.find(tr => tr.id === cat.nameTextId);
                  const isTopLevel = !cat.parentId || cat.parentId === 'none';
                  const isSystemPreset = cat.id === 'WHOLESALE' || cat.id === 'PROJECT';

                  return (
                    <TableRow key={cat.id} className="group hover:bg-primary/[0.02] transition-all duration-500 border-b border-border/5 last:border-0 relative">
                      <TableCell className="pl-10 py-7">
                        <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 rounded-r-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                        <div className="relative h-14 w-14 rounded-2xl border border-border/10 bg-background shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                          {cat.thumbnailImageUrl ? (
                            <Image src={getAssetUrl(cat.thumbnailImageUrl)} alt={cat.id} fill className="object-contain p-2.5" unoptimized />
                          ) : (
                            <LayoutGrid className="h-6 w-6 opacity-10 text-muted-foreground" />
                          )}
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-3">
                            {Array.from({ length: cat.depth }).map((_, i) => (
                              <div key={i} className="w-10 h-[2px] bg-primary/10 shrink-0 ml-1 rounded-full" />
                            ))}
                            {cat.depth > 0 && (
                              <div className="h-8 w-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mr-2 shadow-inner">
                                <ChevronRight className="h-4 w-4 text-primary/40" />
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "font-headline font-bold text-[15px] tracking-tight transition-colors", 
                                  isTopLevel ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                  {(t?.content as any)?.zh || (t as any)?.zh || cat.id}
                                </span>
                                {isTopLevel && (
                                  <Badge className={cn(
                                    "text-[8px] h-5 px-3 uppercase font-bold tracking-[0.2em] border-none shadow-2xl",
                                    isSystemPreset ? "bg-primary text-white shadow-primary/20" : "bg-muted text-muted-foreground/60"
                                  )}>
                                    {isSystemPreset ? 'CORE PRESET' : 'TOP LEVEL'}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">
                                {(t?.content as any)?.en || (t as any)?.en || 'UNTRANSLATED'}
                              </span>
                            </div>
                          </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <code className="text-[11px] font-mono font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg w-fit tracking-tighter uppercase">{cat.slug}</code>
                          <span className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest pl-1">ID: {cat.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-10 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <div className="flex items-center bg-muted/10 rounded-2xl p-1.5 border border-border/5 shadow-inner">
                             <Button 
                               size="icon" 
                               variant="ghost" 
                               className="h-9 w-9 rounded-xl text-muted-foreground/60 hover:text-primary hover:bg-primary/15 shadow-sm" 
                               onClick={() => handleMove(cat, 'up')}
                             >
                               <ArrowUp className="h-4 w-4" />
                             </Button>
                             <Button 
                               size="icon" 
                               variant="ghost" 
                               className="h-9 w-9 rounded-xl text-muted-foreground/60 hover:text-primary hover:bg-primary/15 shadow-sm" 
                               onClick={() => handleMove(cat, 'down')}
                             >
                               <ArrowDown className="h-4 w-4" />
                             </Button>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-12 w-12 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/15 transition-all" 
                            onClick={() => handleStartEdit(cat)}
                          >
                            <Edit2 className="h-5 w-5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-12 w-12 rounded-2xl text-destructive/20 hover:text-destructive hover:bg-destructive/10 transition-all" 
                            onClick={() => handleDelete(cat.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Advisory Section moved inside Main Content Area */}
          <div className="mt-12 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <Zap className="h-24 w-24 text-primary" />
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground/70 font-medium relative z-10">
              为了实现最优的用户导向，建议将所有业务子类挂载到 <strong className="text-primary font-black">“批发产品” (WHOLESALE)</strong> 或 <strong className="text-primary font-black">“项目产品” (PROJECT)</strong> 之下。
              这种“垂直双轨制”架构能够直接与首页的英雄屏按钮联动，确保全球客户能第一时间精准进入其对应的业务板块。
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="rounded-[3rem] max-w-2xl p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] admin-interface-dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200/50 admin-interface-dark:border-white/5 bg-card">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 admin-interface-dark:from-slate-950 admin-interface-dark:to-slate-900 p-10 text-slate-900 admin-interface-dark:text-white relative overflow-hidden border-b border-slate-200/80 admin-interface-dark:border-white/5">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <FolderPlus className="h-32 w-32" />
            </div>
            <DialogHeader className="relative z-10 space-y-2">
              <DialogTitle className="text-2xl font-headline font-black flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-200/50 admin-interface-dark:bg-white/10 flex items-center justify-center border border-slate-300/50 admin-interface-dark:border-white/5">
                  <FolderPlus className="h-6 w-6 text-slate-700 admin-interface-dark:text-white" />
                </div>
                {editingCategory ? '编辑分类属性' : '创建新分类层级'}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-500/50 admin-interface-dark:text-white/30 uppercase tracking-[0.3em]">Taxonomy Structural Configuration</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-[0.2em] pl-1">所属上级 (Parent Node)</Label>
                <Select value={formData.parentId} onValueChange={v => setFormData({...formData, parentId: v})}>
                   <SelectTrigger className="h-14 rounded-2xl bg-muted/20 admin-interface-dark:bg-muted/10 border-transparent text-sm font-bold shadow-inner">
                     <SelectValue placeholder="选择上级分类" />
                   </SelectTrigger>
                   <SelectContent className="rounded-[1.5rem] border-border/50 admin-interface-dark:border-border/10 bg-card/95 backdrop-blur-2xl shadow-2xl">
                      <SelectItem value="none" className="text-[10px] font-bold uppercase tracking-widest py-4">无 (顶级分类 ROOT)</SelectItem>
                      {categoryTree.filter(c => c.id !== editingCategory?.id).map(cat => (
                         <SelectItem key={cat.id} value={cat.id} className="text-[11px] py-4 font-bold uppercase tracking-tight">
                            <span style={{ paddingLeft: `${cat.depth * 1}rem` }} className={cn(cat.depth > 0 && "opacity-40")}>
                              {cat.depth > 0 && "↳ "}{getT(cat.nameTextId)}
                            </span>
                         </SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-[0.2em] pl-1">唯一标识 (SLUG / ID)</Label>
                <Input 
                  disabled={!!editingCategory} 
                  placeholder="如: AIO_PRO" 
                  value={formData.id} 
                  onChange={e => setFormData({...formData, id: e.target.value.toUpperCase().replace(/\s+/g, '_'), slug: e.target.value.toLowerCase()})} 
                  className="h-14 rounded-2xl bg-muted/20 admin-interface-dark:bg-muted/10 border-transparent font-mono text-sm font-black tracking-tighter placeholder:font-bold placeholder:opacity-20 shadow-inner" 
                />
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-border/40 admin-interface-dark:border-border/5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-[0.2em] flex items-center gap-3"><Languages className="h-4 w-4 text-primary" /> 多语言元数据配置</Label>
                <ShinyButton 
                  onClick={handleAutoTranslate} 
                  disabled={isTranslating} 
                  className="h-9 px-6"
                  shape="capsule"
                >
                  {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">智译全息同步</span>
                </ShinyButton>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="space-y-2.5">
                     <Label className="text-[9px] font-bold text-muted-foreground/30 uppercase pl-1 tracking-widest">中文名称 (ZH)</Label>
                     <Input placeholder="高性能一体机" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="rounded-2xl h-12 text-sm font-bold bg-muted/15 admin-interface-dark:bg-muted/5 border-transparent shadow-inner" />
                   </div>
                   <div className="space-y-2.5">
                     <Label className="text-[9px] font-bold text-muted-foreground/30 uppercase pl-1 tracking-widest">中文简述 (ZH-DESC)</Label>
                     <Input placeholder="极致性能，为专业办公而生" value={formData.descZh} onChange={e => setFormData({...formData, descZh: e.target.value})} className="rounded-2xl h-12 text-[11px] font-bold bg-muted/15 admin-interface-dark:bg-muted/5 border-transparent shadow-inner" />
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2.5">
                     <Label className="text-[9px] font-bold text-muted-foreground/30 uppercase pl-1 tracking-widest">English Name (EN)</Label>
                     <Input placeholder="High Performance AIO" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-2xl h-12 text-sm font-bold bg-muted/15 admin-interface-dark:bg-muted/5 border-dashed border-primary/30 admin-interface-dark:border-primary/20 shadow-inner" />
                   </div>
                   <div className="space-y-2.5">
                     <Label className="text-[9px] font-bold text-muted-foreground/30 uppercase pl-1 tracking-widest">English Desc (EN-DESC)</Label>
                     <Input placeholder="Professional performance for modern workspace" value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="rounded-2xl h-12 text-[11px] font-bold bg-muted/15 admin-interface-dark:bg-muted/5 border-dashed border-primary/30 admin-interface-dark:border-primary/20 shadow-inner" />
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-border/40 admin-interface-dark:border-border/5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-[0.2em] pl-1">视觉缩略图 (Identity Visual)</Label>
              <div 
                className="relative aspect-[8/1.5] rounded-2xl bg-muted/15 admin-interface-dark:bg-muted/5 border-2 border-dashed border-border/40 admin-interface-dark:border-border/10 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:bg-primary/[0.02] hover:border-primary/40 transition-all shadow-inner"
                onClick={() => setIsPickerOpen(true)}
              >
                {formData.thumbnailImageUrl ? (
                   <>
                     <Image src={getAssetUrl(formData.thumbnailImageUrl)} alt="Thumbnail" fill className="object-contain p-5 transition-transform duration-700 group-hover:scale-105" unoptimized />
                     <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 gap-4 backdrop-blur-[4px]">
                       <Button variant="secondary" size="sm" className="rounded-xl h-10 px-6 text-[10px] font-bold uppercase tracking-wider shadow-2xl bg-background text-foreground border-none">更换视觉资源</Button>
                       <Button 
                         variant="destructive" 
                         size="icon" 
                         className="h-10 w-10 rounded-xl shadow-2xl" 
                         onClick={(e) => { e.stopPropagation(); setFormData({...formData, thumbnailImageUrl: ''}); }}
                       >
                         <X className="h-4 w-4" />
                       </Button>
                     </div>
                   </>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-muted-foreground/40 admin-interface-dark:text-muted-foreground/20 group-hover:text-primary transition-colors">
                    <div className="h-14 w-14 rounded-2xl bg-card/50 admin-interface-dark:bg-card/20 shadow-inner flex items-center justify-center border border-border/30 admin-interface-dark:border-border/5">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">从素材库选择媒体资源 / ATTACH MEDIA</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="bg-muted/10 admin-interface-dark:bg-muted/5 p-8 border-t border-border/40 admin-interface-dark:border-border/5 gap-4">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-14 rounded-2xl flex-1 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/60 admin-interface-dark:text-muted-foreground/40 hover:text-foreground">放弃当前编辑</Button>
            <Button onClick={handleSave} className="h-14 rounded-2xl flex-1 font-bold uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-primary/20">确认保存分类架构</Button>
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

    </>
  );
}
