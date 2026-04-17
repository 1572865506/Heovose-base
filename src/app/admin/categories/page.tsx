
"use client";

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
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
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Layers,
  Image as ImageIcon,
  Languages
} from 'lucide-react';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

interface ProductCategory {
  id: string;
  nameTextId: string;
  slug: string;
  thumbnailImageUrl: string;
}

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
}

export default function CategoriesPage() {
  const firestore = useFirestore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    thumbnailImageUrl: '',
    nameEn: '',
    nameZh: ''
  });

  const categoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'productCategories');
  }, [firestore]);

  const translationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'localizedStrings');
  }, [firestore]);

  const { data: categories, isLoading: isCatsLoading } = useCollection<ProductCategory>(categoriesQuery);
  const { data: translations } = useCollection<LocalizedString>(translationsQuery);

  const getTranslation = (id: string) => {
    const t = translations?.find(t => t.id === id);
    return t ? `${t.zh} (${t.en})` : id;
  };

  const handleSave = () => {
    if (!firestore || !formData.id || !formData.slug) return;
    
    const nameTextId = editingCategory?.nameTextId || `cat_name_${formData.id}`;
    
    // 1. 保存翻译项
    const langRef = doc(firestore, 'localizedStrings', nameTextId);
    setDocumentNonBlocking(langRef, {
      id: nameTextId,
      en: formData.nameEn,
      zh: formData.nameZh,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. 保存分类项
    const catRef = doc(firestore, 'productCategories', formData.id);
    setDocumentNonBlocking(catRef, {
      id: formData.id,
      slug: formData.slug,
      nameTextId: nameTextId,
      thumbnailImageUrl: formData.thumbnailImageUrl,
      updatedAt: serverTimestamp()
    }, { merge: true });

    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingCategory(null);
    setFormData({ id: '', slug: '', thumbnailImageUrl: '', nameEn: '', nameZh: '' });
  };

  const startEdit = (cat: ProductCategory) => {
    const t = translations?.find(t => t.id === cat.nameTextId);
    setFormData({
      id: cat.id,
      slug: cat.slug,
      thumbnailImageUrl: cat.thumbnailImageUrl,
      nameEn: t?.en || '',
      nameZh: t?.zh || ''
    });
    setEditingCategory(cat);
    setIsAdding(true);
  };

  const handleDelete = (id: string, nameTextId: string) => {
    if (!firestore || !confirm('确定要删除此分类吗？关联的翻译项也将被清理。')) return;
    deleteDocumentNonBlocking(doc(firestore, 'productCategories', id));
    deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', nameTextId));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <Layers className="h-6 w-6" />
            产品分类管理
          </h2>
          <p className="text-sm text-muted-foreground">定义产品的所属大类、多语言名称及展示缩略图。</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> 新增分类
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem] max-w-lg p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-primary p-8 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <Layers className="h-6 w-6" /> {editingCategory ? '编辑分类' : '添加新分类'}
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  分类名称将支持全站多语言自动切换。
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-[10px] font-bold uppercase tracking-widest text-primary">分类唯一 ID</Label>
                  <Input 
                    id="id" 
                    disabled={!!editingCategory}
                    placeholder="e.g. cat-aio" 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value})}
                    className="h-12 rounded-xl bg-muted/20 border-transparent focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-[10px] font-bold uppercase tracking-widest text-primary">URL 标识 (Slug)</Label>
                  <Input 
                    id="slug" 
                    placeholder="e.g. all-in-one" 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    className="h-12 rounded-xl bg-muted/20 border-transparent focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/40">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Languages className="h-3 w-3" /> 分类多语言名称
                </Label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground ml-1">中文名称 (ZH)</span>
                    <Input placeholder="输入中文分类名..." value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground ml-1">英文名称 (EN)</span>
                    <Input placeholder="Enter English category name..." value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-xl h-11" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/40">
                <Label htmlFor="thumb" className="text-[10px] font-bold uppercase tracking-widest text-primary">缩略图链接</Label>
                <Input 
                  id="thumb" 
                  placeholder="https://..." 
                  value={formData.thumbnailImageUrl} 
                  onChange={e => setFormData({...formData, thumbnailImageUrl: e.target.value})}
                  className="rounded-xl h-11 bg-muted/20 border-transparent"
                />
              </div>
            </div>

            <DialogFooter className="bg-muted/30 p-6">
              <Button variant="outline" onClick={resetForm} className="rounded-xl h-11 px-8">取消</Button>
              <Button onClick={handleSave} className="rounded-xl h-11 px-8 font-bold uppercase tracking-widest">保存变更</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-[2rem] border border-border/40 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-16 pl-6 text-[10px] font-bold uppercase tracking-widest">缩略图</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">分类名称 (中/英)</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Slug</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">ID</TableHead>
              <TableHead className="w-[120px] text-right pr-6 font-bold uppercase text-[10px] tracking-widest">管理操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isCatsLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto opacity-20" />
                </TableCell>
              </TableRow>
            ) : categories?.map((cat) => (
              <TableRow key={cat.id} className="group hover:bg-muted/5 transition-colors">
                <TableCell className="pl-6">
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden border bg-muted/20 shadow-inner">
                    {cat.thumbnailImageUrl ? (
                      <Image src={cat.thumbnailImageUrl} alt={cat.id} fill className="object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 m-auto text-muted-foreground opacity-30" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex flex-col">
                      <span className="font-bold text-primary">{translations?.find(t => t.id === cat.nameTextId)?.zh || cat.id}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{translations?.find(t => t.id === cat.nameTextId)?.en || 'No Translation'}</span>
                   </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground italic font-medium">{cat.slug}</TableCell>
                <TableCell className="text-xs font-mono opacity-50">{cat.id}</TableCell>
                <TableCell className="pr-6 text-right space-x-2">
                  <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-primary/5 hover:text-primary rounded-full transition-all" onClick={() => startEdit(cat)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/5 rounded-full transition-all" onClick={() => handleDelete(cat.id, cat.nameTextId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isCatsLoading && categories?.length === 0 && (
               <TableRow>
                 <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">暂无分类数据，请点击右上角添加。</TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
