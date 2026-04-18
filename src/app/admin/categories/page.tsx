
"use client";

import { useState } from 'react';
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

  const categoriesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'productCategories') : null, [firestore]);
  const translationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'localizedStrings') : null, [firestore]);

  const { data: categories, isLoading: isCatsLoading } = useCollection<ProductCategory>(categoriesQuery);
  const { data: translations } = useCollection<LocalizedString>(translationsQuery);

  const getSmartId = (en: string, zh: string, preferredId: string) => {
    if (!translations) return preferredId;
    const existing = translations.find(t => 
      t.en.trim().toLowerCase() === en.trim().toLowerCase() || 
      t.zh.trim().toLowerCase() === zh.trim().toLowerCase()
    );
    return existing ? existing.id : preferredId;
  };

  const handleSave = () => {
    if (!firestore || !formData.id || !formData.slug) return;
    
    const defaultId = editingCategory?.nameTextId || `cat_name_${formData.id}`;
    const nameTextId = getSmartId(formData.nameEn, formData.nameZh, defaultId);
    
    const langRef = doc(firestore, 'localizedStrings', nameTextId);
    setDocumentNonBlocking(langRef, {
      id: nameTextId,
      en: formData.nameEn.trim(),
      zh: formData.nameZh.trim(),
      updatedAt: serverTimestamp()
    }, { merge: true });

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

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('确定要删除此分类吗？')) return;
    deleteDocumentNonBlocking(doc(firestore, 'productCategories', id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2"><Layers className="h-5 w-5" /> 产品分类管理</h2>
          <p className="text-xs text-muted-foreground">定义产品层级。系统会自动识别多语言语义冲突并建议复用。</p>
        </div>
        
        <Dialog 
          open={isAdding} 
          onOpenChange={(open) => {
            if (!open) resetForm();
            else setIsAdding(true);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="rounded-lg h-10 px-5 font-bold uppercase text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> 新增分类
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-md p-0 overflow-hidden shadow-2xl border-none">
            <div className="bg-primary p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Layers className="h-5 w-5" /> {editingCategory ? '编辑分类' : '添加分类'}
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 space-y-5 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-primary tracking-wider">唯一 ID</Label>
                  <Input disabled={!!editingCategory} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-10 rounded-lg bg-muted/5 font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-primary tracking-wider">SLUG</Label>
                  <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="h-10 rounded-lg bg-muted/5 text-xs" />
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-border/40">
                <Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-2"><Languages className="h-3 w-3" /> 双语名称</Label>
                <Input placeholder="中文名称" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="rounded-lg h-10 text-xs" />
                <Input placeholder="English Name" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-lg h-10 text-xs" />
              </div>
              <div className="space-y-1.5 pt-4 border-t border-border/40">
                <Label className="text-[10px] font-bold uppercase text-primary">缩略图 URL</Label>
                <Input value={formData.thumbnailImageUrl} onChange={e => setFormData({...formData, thumbnailImageUrl: e.target.value})} className="h-10 rounded-lg text-xs" />
              </div>
            </div>
            <DialogFooter className="bg-muted/20 p-4 border-t gap-2">
              <Button variant="outline" size="sm" onClick={resetForm} className="h-9 rounded-lg flex-1">取消</Button>
              <Button size="sm" onClick={handleSave} className="h-9 rounded-lg flex-1">确认保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-14 pl-5">图标</TableHead>
              <TableHead className="font-bold uppercase text-[9px] tracking-wider">名称 (中/英)</TableHead>
              <TableHead className="font-bold uppercase text-[9px] tracking-wider">Slug</TableHead>
              <TableHead className="w-24 text-right pr-5 font-bold uppercase text-[9px] tracking-wider">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isCatsLoading ? (
              <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
            ) : categories?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-32 text-center text-[10px] text-muted-foreground italic uppercase">暂无数据</TableCell></TableRow>
            ) : categories?.map((cat) => (
              <TableRow key={cat.id} className="group hover:bg-muted/5 transition-colors">
                <TableCell className="pl-5">
                  <div className="relative h-10 w-10 rounded-md border bg-muted/10 overflow-hidden shadow-inner">
                    {cat.thumbnailImageUrl && <Image src={cat.thumbnailImageUrl} alt={cat.id} fill className="object-cover" />}
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex flex-col">
                      <span className="font-bold text-xs text-primary">{translations?.find(t => t.id === cat.nameTextId)?.zh || cat.id}</span>
                      <span className="text-[9px] text-muted-foreground uppercase opacity-70">{translations?.find(t => t.id === cat.nameTextId)?.en || 'No English'}</span>
                   </div>
                </TableCell>
                <TableCell className="text-[10px] font-mono opacity-50">{cat.slug}</TableCell>
                <TableCell className="pr-5 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(cat)}><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/5" onClick={() => handleDelete(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
