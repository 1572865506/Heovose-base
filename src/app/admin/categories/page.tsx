
"use client";

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
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
  X
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCategory {
  id: string;
  nameTextId: string;
  slug: string;
  thumbnailImageUrl: string;
  parentId?: string | null;
}

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
}

export default function CategoriesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  
  // 图库选择器状态
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    thumbnailImageUrl: '',
    nameEn: '',
    nameZh: '',
    parentId: 'none'
  });

  const categoriesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'productCategories') : null, [firestore]);
  const translationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'localizedStrings') : null, [firestore]);
  const assetsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'galleryAssets'), orderBy('createdAt', 'desc')) : null, [firestore]);

  const { data: categories, isLoading: isCatsLoading } = useCollection<ProductCategory>(categoriesQuery);
  const { data: translations } = useCollection<LocalizedString>(translationsQuery);
  const { data: galleryAssets } = useCollection<any>(assetsQuery);

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
    setFormData({ id: '', slug: '', thumbnailImageUrl: '', nameEn: '', nameZh: '', parentId: 'none' });
    setEditingCategory(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleStartEdit = (cat: ProductCategory) => {
    const t = translations?.find(t => t.id === cat.nameTextId);
    setFormData({
      id: cat.id,
      slug: cat.slug,
      thumbnailImageUrl: cat.thumbnailImageUrl || '',
      nameEn: t?.en || '',
      nameZh: t?.zh || '',
      parentId: cat.parentId || 'none'
    });
    setEditingCategory(cat);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!firestore || !formData.id || !formData.slug) {
      toast({ variant: "destructive", title: "请填写 ID 和 SLUG" });
      return;
    }
    
    const nameTextId = editingCategory?.nameTextId || `cat_name_${formData.id}`;
    const pId = formData.parentId === 'none' ? 'none' : formData.parentId;
    
    // 1. 保存翻译
    setDocumentNonBlocking(doc(firestore, 'localizedStrings', nameTextId), {
      id: nameTextId,
      en: formData.nameEn.trim(),
      zh: formData.nameZh.trim(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. 保存分类
    setDocumentNonBlocking(doc(firestore, 'productCategories', formData.id), {
      id: formData.id,
      slug: formData.slug,
      nameTextId: nameTextId,
      thumbnailImageUrl: formData.thumbnailImageUrl,
      parentId: pId,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setIsDialogOpen(false);
    resetForm();
    toast({ title: "分类已保存" });
  };

  const handleInitPresets = () => {
    if (!firestore) return;

    // 初始化批发产品
    if (!systemPresets.hasWholesale) {
      const id = 'WHOLESALE';
      const nameId = `cat_name_${id}`;
      setDocumentNonBlocking(doc(firestore, 'localizedStrings', nameId), { id: nameId, en: 'Wholesale Products', zh: '批发产品' }, { merge: true });
      setDocumentNonBlocking(doc(firestore, 'productCategories', id), { id, slug: 'wholesale', nameTextId: nameId, parentId: 'none', thumbnailImageUrl: '' }, { merge: true });
    }

    // 初始化项目产品
    if (!systemPresets.hasProject) {
      const id = 'PROJECT';
      const nameId = `cat_name_${id}`;
      setDocumentNonBlocking(doc(firestore, 'localizedStrings', nameId), { id: nameId, en: 'Project Products', zh: '项目产品' }, { merge: true });
      setDocumentNonBlocking(doc(firestore, 'productCategories', id), { id, slug: 'project', nameTextId: nameId, parentId: 'none', thumbnailImageUrl: '' }, { merge: true });
    }

    toast({ title: "系统预设顶级分类已初始化" });
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('确定要删除此分类吗？其子分类将失去关联。')) return;
    deleteDocumentNonBlocking(doc(firestore, 'productCategories', id));
  };

  const getT = (id: string) => {
    const t = translations?.find(tr => tr.id === id);
    return t ? t.zh : id;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2"><Layers className="h-5 w-5" /> 产品分类架构管理</h2>
          <p className="text-xs text-muted-foreground">支持无限极嵌套。顶级分类建议使用系统预设的“批发”与“项目”入口。</p>
        </div>
        
        <div className="flex gap-2">
          {(!systemPresets.hasWholesale || !systemPresets.hasProject) && (
            <Button variant="outline" onClick={handleInitPresets} className="rounded-xl h-10 px-4 font-bold uppercase text-[10px] gap-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm">
              <Zap className="h-3.5 w-3.5" /> 初始化预设顶级分类
            </Button>
          )}
          <Button onClick={handleOpenDialog} className="rounded-xl h-10 px-5 font-bold uppercase text-xs gap-1.5 shadow-md">
            <Plus className="h-4 w-4" /> 新增层级分类
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="rounded-2xl max-w-lg p-0 overflow-hidden shadow-2xl border-none">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <FolderPlus className="h-5 w-5" /> {editingCategory ? '编辑分类属性' : '创建新分类层级'}
              </DialogTitle>
              <DialogDescription className="text-white/60 text-xs">填写分类核心标识及双语名称，并指定其在架构中的位置。</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-primary tracking-wider">所属上级 (Parent)</Label>
                <Select value={formData.parentId} onValueChange={v => setFormData({...formData, parentId: v})}>
                   <SelectTrigger className="h-10 rounded-xl bg-muted/20 border-transparent text-xs">
                     <SelectValue placeholder="选择上级分类" />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl">
                      <SelectItem value="none" className="text-xs font-bold">无 (顶级分类)</SelectItem>
                      {categoryTree.filter(c => c.id !== editingCategory?.id).map(cat => (
                        <SelectItem key={cat.id} value={cat.id} className="text-xs">
                           <span style={{ paddingLeft: `${cat.depth * 0.5}rem` }} className={cn(cat.depth > 0 && "opacity-60")}>
                             {getT(cat.nameTextId)}
                           </span>
                        </SelectItem>
                      ))}
                   </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-primary tracking-wider">唯一 ID / SLUG</Label>
                <Input 
                  disabled={!!editingCategory} 
                  placeholder="如: aio_pro" 
                  value={formData.id} 
                  onChange={e => setFormData({...formData, id: e.target.value.toUpperCase().replace(/\s+/g, '_'), slug: e.target.value.toLowerCase()})} 
                  className="h-10 rounded-xl bg-muted/10 font-mono text-xs" 
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed">
              <Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-2"><Languages className="h-3.5 w-3.5" /> 双语名称配置</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-bold opacity-40 uppercase">中文显示</Label>
                   <Input placeholder="例如: 高性能一体机" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="rounded-xl h-10 text-xs" />
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-bold opacity-40 uppercase">English Display</Label>
                   <Input placeholder="e.g. High Performance AIO" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-xl h-10 text-xs border-dashed" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-dashed">
              <Label className="text-[10px] font-bold uppercase text-primary">分类缩略图 (用于前台筛选列表)</Label>
              <div 
                className="relative aspect-video rounded-xl bg-muted/20 border-2 border-dashed border-border/40 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:bg-muted/30 transition-all"
                onClick={() => setIsPickerOpen(true)}
              >
                {formData.thumbnailImageUrl ? (
                  <>
                    <Image src={formData.thumbnailImageUrl} alt="Thumbnail" fill className="object-contain p-2" unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                      <Button variant="secondary" size="sm" className="rounded-full h-8 text-[10px] font-bold uppercase tracking-wider">更换图片</Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8 rounded-full" 
                        onClick={(e) => { e.stopPropagation(); setFormData({...formData, thumbnailImageUrl: ''}); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">从素材库选择</span>
                  </div>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground italic mt-2">提示：缩略图主要用于产品列表页顶部的分类快速导航。</p>
            </div>
          </div>
          <DialogFooter className="bg-muted/10 p-6 border-t gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-11 rounded-xl flex-1 font-bold uppercase text-[10px]">放弃编辑</Button>
            <Button onClick={handleSave} className="h-11 rounded-xl flex-1 font-bold uppercase text-[10px] shadow-lg">确认保存架构</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 媒体资产库选择器 */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-5xl p-0 h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border-none">
          <div className="bg-primary p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">选择分类缩略图</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsPickerOpen(false)} className="text-white hover:bg-white/10 h-8 w-8"><X className="h-4 w-4" /></Button>
          </div>
          <div className="px-6 py-3 bg-muted/30 border-b flex gap-6 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-30" />
              <Input 
                placeholder="搜索素材标题..." 
                value={pickerSearch} 
                onChange={e => setPickerSearch(e.target.value)} 
                className="pl-9 h-9 border-none bg-white text-xs" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 bg-muted/5">
            {galleryAssets?.filter((a: any) => (a.title || '').toLowerCase().includes(pickerSearch.toLowerCase())).map((a: any) => (
              <div 
                key={a.id} 
                className={cn(
                  "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer shadow-sm bg-white", 
                  formData.thumbnailImageUrl === a.url ? "border-primary scale-95 shadow-inner" : "border-transparent hover:border-primary/20"
                )} 
                onClick={() => {
                  setFormData({ ...formData, thumbnailImageUrl: a.url });
                  setIsPickerOpen(false);
                }}
              >
                <Image src={a.url} alt={a.title} fill className="object-cover" unoptimized />
                {formData.thumbnailImageUrl === a.url && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-white text-primary rounded-full p-1 shadow-lg"><Check className="h-3.5 w-3.5" /></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="p-4 border-t flex justify-end bg-white">
            <Button variant="ghost" size="sm" onClick={() => setIsPickerOpen(false)} className="px-8 h-10 rounded-xl text-xs font-bold uppercase tracking-widest">返回编辑器</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-14 pl-6">视觉</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">分类架构与名称</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Slug / 系统 ID</TableHead>
              <TableHead className="w-32 text-right pr-6 font-bold uppercase text-[10px] tracking-widest">操作管理</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isCatsLoading ? (
              <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
            ) : categoryTree.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-40 text-center text-[10px] text-muted-foreground italic uppercase">尚未建立分类体系</TableCell></TableRow>
            ) : categoryTree.map((cat) => {
              const t = translations?.find(tr => tr.id === cat.nameTextId);
              const isTopLevel = !cat.parentId || cat.parentId === 'none';
              const isSystemPreset = cat.id === 'WHOLESALE' || cat.id === 'PROJECT';

              return (
                <TableRow key={cat.id} className="group hover:bg-muted/5 transition-colors">
                  <TableCell className="pl-6">
                    <div className="relative h-10 w-10 rounded-lg border bg-muted/10 overflow-hidden shadow-inner flex items-center justify-center">
                      {cat.thumbnailImageUrl ? (
                        <Image src={cat.thumbnailImageUrl} alt={cat.id} fill className="object-contain p-1" unoptimized />
                      ) : (
                        <LayoutGrid className="h-4 w-4 opacity-20" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        {Array.from({ length: cat.depth }).map((_, i) => (
                          <div key={i} className="w-6 h-px bg-border/40 shrink-0 ml-1" />
                        ))}
                        {cat.depth > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/40" />}
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                             <span className={cn("font-bold text-sm", isTopLevel ? "text-primary" : "text-muted-foreground")}>
                               {t?.zh || cat.id}
                             </span>
                             {isTopLevel && (
                               <Badge className={cn(
                                 "text-[8px] h-4 px-1.5 uppercase font-bold",
                                 isSystemPreset ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                               )}>
                                 Top Tier
                               </Badge>
                             )}
                           </div>
                           <span className="text-[10px] text-muted-foreground/60 uppercase tracking-tight">{t?.en || 'No English'}</span>
                        </div>
                     </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono opacity-50">{cat.slug}</span>
                      <span className="text-[8px] font-bold text-primary/40 uppercase tracking-tighter">ID: {cat.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => handleStartEdit(cat)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/5" onClick={() => handleDelete(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted/20 p-6 rounded-2xl border border-dashed flex items-start gap-4">
         <Info className="h-5 w-5 text-primary/40 shrink-0 mt-0.5" />
         <div className="space-y-1">
            <p className="text-xs font-bold text-primary">关于顶级分类逻辑：</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              系统建议将所有业务分类挂载到 <strong>“批发产品” (WHOLESALE)</strong> 或 <strong>“项目产品” (PROJECT)</strong> 之下。
              这种架构可以确保首页的英雄屏按钮能够准确引导用户进入对应的业务垂直领域。
            </p>
         </div>
      </div>
    </div>
  );
}
