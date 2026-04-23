
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Plus, Trash2, Layers, MoveUp, MoveDown, ArrowLeft, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface GalleryCategory {
  id: string;
  nameTextId: string;
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

export default function GalleryCategoriesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    zh: '',
    en: ''
  });

  const categoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'galleryCategories'), orderBy('order', 'asc'));
  }, [firestore]);

  const transQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'localizedStrings');
  }, [firestore]);

  const { data: categories, isLoading } = useCollection<GalleryCategory>(categoriesQuery);
  const { data: translations } = useCollection<LocalizedString>(transQuery);

  const handleAdd = () => {
    if (!firestore || !formData.zh.trim()) {
      toast({ variant: "destructive", title: "名称不能为空" });
      return;
    }
    
    const id = `gal_cat_${Date.now()}`;
    const nameTextId = `gal_cat_name_${id}`;
    const order = (categories?.length || 0) + 1;
    
    // 1. 保存翻译
    setDocumentNonBlocking(doc(firestore, 'localizedStrings', nameTextId), {
      id: nameTextId,
      en: formData.en || formData.zh,
      zh: formData.zh,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. 保存分类
    setDocumentNonBlocking(doc(firestore, 'galleryCategories', id), {
      id,
      nameTextId,
      order
    }, { merge: true });

    setFormData({ zh: '', en: '' });
    toast({ title: "分类已添加（双语）" });
  };

  const handleDelete = (cat: GalleryCategory) => {
    if (!firestore || !confirm('删除分类不会删除图片，但会将相关图片设为“未分类”。确定吗？')) return;
    deleteDocumentNonBlocking(doc(firestore, 'galleryCategories', cat.id));
    deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', cat.nameTextId));
  };

  const updateOrder = (cat: GalleryCategory, direction: 'up' | 'down') => {
    if (!firestore || !categories) return;
    const idx = categories.indexOf(cat);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const targetCat = categories[targetIdx];
    
    setDocumentNonBlocking(doc(firestore, 'galleryCategories', cat.id), { ...cat, order: targetCat.order }, { merge: true });
    setDocumentNonBlocking(doc(firestore, 'galleryCategories', targetCat.id), { ...targetCat, order: cat.order }, { merge: true });
  };

  const getT = (id: string) => {
    const t = translations?.find(tr => tr.id === id);
    return t ? `${t.zh} (${t.en})` : id;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/gallery">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <Layers className="h-5 w-5" />
            图库分类管理
          </h2>
          <p className="text-xs text-muted-foreground">定义素材的层级分类，支持多语言自动切换。</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-border/40 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <Languages className="h-4 w-4" />
          <Label className="text-[10px] font-bold uppercase tracking-widest">新增多语言分类</Label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            placeholder="中文分类名称 (例如: 产品样机)" 
            value={formData.zh} 
            onChange={e => setFormData({...formData, zh: e.target.value})}
            className="rounded-lg h-10 text-sm"
          />
          <Input 
            placeholder="English Category Name (e.g. Mockups)" 
            value={formData.en} 
            onChange={e => setFormData({...formData, en: e.target.value})}
            className="rounded-lg h-10 text-sm"
          />
        </div>
        <Button onClick={handleAdd} className="w-full rounded-lg h-10 font-bold uppercase tracking-widest gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> 添加分类
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-16 pl-6 text-[10px] font-bold uppercase tracking-widest">排序</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">分类显示名称 (中/英)</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">翻译键 ID</TableHead>
              <TableHead className="w-[120px] text-right pr-6 font-bold uppercase text-[10px] tracking-widest">管理操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((cat, idx) => (
              <TableRow key={cat.id} className="group hover:bg-muted/5 transition-colors">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 disabled:opacity-20" 
                      disabled={idx === 0}
                      onClick={() => updateOrder(cat, 'up')}
                    >
                      <MoveUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 disabled:opacity-20" 
                      disabled={idx === (categories?.length || 0) - 1}
                      onClick={() => updateOrder(cat, 'down')}
                    >
                      <MoveDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-primary text-sm">{getT(cat.nameTextId)}</TableCell>
                <TableCell className="text-[10px] font-mono opacity-50">{cat.nameTextId}</TableCell>
                <TableCell className="pr-6 text-right">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-md"
                    onClick={() => handleDelete(cat)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {categories?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic text-xs">暂无分类数据</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
