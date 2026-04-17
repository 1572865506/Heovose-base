
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
  Image as ImageIcon
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
    
    const nameTextId = `cat_name_${formData.id}`;
    
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <Layers className="h-6 w-6" />
            产品分类管理
          </h2>
          <p className="text-sm text-muted-foreground">定义产品的所属大类及展示缩略图。</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> 新增分类
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCategory ? '编辑分类' : '添加新分类'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-[10px] font-bold uppercase">分类 ID (不可更改)</Label>
                  <Input 
                    id="id" 
                    disabled={!!editingCategory}
                    placeholder="cat-aio" 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-[10px] font-bold uppercase">URL 标识 (Slug)</Label>
                  <Input 
                    id="slug" 
                    placeholder="aio-pc" 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase">分类名称</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="英文名 (EN)" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} />
                  <Input placeholder="中文名 (ZH)" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumb" className="text-[10px] font-bold uppercase">缩略图 URL</Label>
                <Input 
                  id="thumb" 
                  placeholder="https://..." 
                  value={formData.thumbnailImageUrl} 
                  onChange={e => setFormData({...formData, thumbnailImageUrl: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>取消</Button>
              <Button onClick={handleSave}>保存分类</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl border border-border/40 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-16 pl-6">缩略图</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">分类名称 (中/英)</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Slug</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">ID</TableHead>
              <TableHead className="w-[100px] text-right pr-6 font-bold uppercase text-[10px] tracking-widest">操作</TableHead>
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
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden border bg-muted/20">
                    {cat.thumbnailImageUrl ? (
                      <Image src={cat.thumbnailImageUrl} alt={cat.id} fill className="object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4 m-auto text-muted-foreground opacity-30" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{getTranslation(cat.nameTextId)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{cat.slug}</TableCell>
                <TableCell className="text-xs font-mono">{cat.id}</TableCell>
                <TableCell className="pr-6 text-right space-x-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(cat)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id, cat.nameTextId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
