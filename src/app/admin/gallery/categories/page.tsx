
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Plus, Trash2, Layers, MoveUp, MoveDown, ArrowLeft } from 'lucide-react';
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
  name: string;
  order: number;
}

export default function GalleryCategoriesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [newName, setNewName] = useState('');

  const categoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'galleryCategories'), orderBy('order', 'asc'));
  }, [firestore]);

  const { data: categories, isLoading } = useCollection<GalleryCategory>(categoriesQuery);

  const handleAdd = () => {
    if (!firestore || !newName.trim()) return;
    const id = `cat_${Date.now()}`;
    const order = (categories?.length || 0) + 1;
    
    setDocumentNonBlocking(doc(firestore, 'galleryCategories', id), {
      id,
      name: newName,
      order
    }, { merge: true });

    setNewName('');
    toast({ title: "分类已添加" });
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('删除分类不会删除图片，但会将相关图片设为“未分类”。确定吗？')) return;
    deleteDocumentNonBlocking(doc(firestore, 'galleryCategories', id));
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/gallery">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <Layers className="h-6 w-6" />
            图库分类管理
          </h2>
          <p className="text-sm text-muted-foreground">自由定义图库素材的分类标签。</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-border/40 shadow-sm space-y-4">
        <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">新增自定义分类</Label>
        <div className="flex gap-4">
          <Input 
            placeholder="例如: 24英寸外壳、产品样机、展会实拍..." 
            value={newName} 
            onChange={e => setNewName(e.target.value)}
            className="rounded-xl h-12"
          />
          <Button onClick={handleAdd} className="rounded-xl h-12 px-8 font-bold uppercase tracking-widest gap-2">
            <Plus className="h-4 w-4" /> 添加
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border/40 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-16 pl-6">排序</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">分类名称</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">ID</TableHead>
              <TableHead className="w-[120px] text-right pr-6 font-bold uppercase text-[10px] tracking-widest">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((cat, idx) => (
              <TableRow key={cat.id} className="group">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 disabled:opacity-20" 
                      disabled={idx === 0}
                      onClick={() => updateOrder(cat, 'up')}
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 disabled:opacity-20" 
                      disabled={idx === (categories?.length || 0) - 1}
                      onClick={() => updateOrder(cat, 'down')}
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-primary">{cat.name}</TableCell>
                <TableCell className="text-xs font-mono opacity-50">{cat.id}</TableCell>
                <TableCell className="pr-6 text-right">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {categories?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic">暂无分类数据</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
