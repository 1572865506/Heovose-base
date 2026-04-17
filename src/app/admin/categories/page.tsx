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

  /**
   * 智能 ID 分配：执行不区分大小写的匹配，防止冗余
   */
  const getSmartId = (en: string, zh: string, preferredId: string) => {
    if (!translations) return preferredId;
    const existing = translations.find(t => 
      t.en.trim().toLowerCase() === en.trim().toLowerCase() && 
      t.zh.trim().toLowerCase() === zh.trim().toLowerCase()
    );
    return existing ? existing.id : preferredId;
  };

  const handleSave = () => {
    if (!firestore || !formData.id || !formData.slug) return;
    
    // 1. 获取 ID（不区分大小写匹配已有项）
    const defaultId = editingCategory?.nameTextId || `cat_name_${formData.id}`;
    const nameTextId = getSmartId(formData.nameEn, formData.nameZh, defaultId);
    
    // 2. 保存翻译项（更新内容但复用 ID）
    const langRef = doc(firestore, 'localizedStrings', nameTextId);
    setDocumentNonBlocking(langRef, {
      id: nameTextId,
      en: formData.nameEn.trim(),
      zh: formData.nameZh.trim(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 3. 保存分类项
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
    if (!firestore || !confirm('确定要删除此分类吗？')) return;
    deleteDocumentNonBlocking(doc(firestore, 'productCategories', id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2"><Layers className="h-6 w-6" /> 产品分类管理</h2>
          <p className="text-sm text-muted-foreground">定义产品的所属大类。系统已启用智能翻译复用机制（不区分大小写）。</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild><Button className="rounded-xl h-12 px-6 font-bold uppercase gap-2"><Plus className="h-4 w-4" /> 新增分类</Button></DialogTrigger>
          <DialogContent className="rounded-[2rem] max-w-lg p-0 overflow-hidden shadow-2xl">
            <div className="bg-primary p-8 text-white"><DialogHeader><DialogTitle className="text-2xl font-bold flex items-center gap-3"><Layers className="h-6 w-6" /> {editingCategory ? '编辑分类' : '添加分类'}</DialogTitle></DialogHeader></div>
            <div className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-primary">分类唯一 ID</Label><Input disabled={!!editingCategory} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-primary">Slug</Label><Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="h-12 rounded-xl" /></div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-2"><Languages className="h-3 w-3" /> 分类多语言名称</Label>
                <Input placeholder="中文名称" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="rounded-xl" />
                <Input placeholder="English Name" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2 pt-4 border-t"><Label className="text-[10px] font-bold uppercase text-primary">缩略图链接</Label><Input value={formData.thumbnailImageUrl} onChange={e => setFormData({...formData, thumbnailImageUrl: e.target.value})} className="rounded-xl" /></div>
            </div>
            <DialogFooter className="bg-muted/30 p-6"><Button variant="outline" onClick={resetForm} className="flex-1">取消</Button><Button onClick={handleSave} className="flex-1">保存</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-[2rem] border shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="pl-6">缩略图</TableHead>
              <TableHead>分类名称 (中/英)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right pr-6">管理操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isCatsLoading ? <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> : categories?.map((cat) => (
              <TableRow key={cat.id} className="group hover:bg-muted/5">
                <TableCell className="pl-6"><div className="relative h-12 w-12 rounded-xl border bg-muted/20 overflow-hidden">{cat.thumbnailImageUrl && <Image src={cat.thumbnailImageUrl} alt={cat.id} fill className="object-cover" />}</div></TableCell>
                <TableCell>
                   <div className="flex flex-col">
                      <span className="font-bold text-primary">{translations?.find(t => t.id === cat.nameTextId)?.zh || cat.id}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{translations?.find(t => t.id === cat.nameTextId)?.en || 'No Translation'}</span>
                   </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{cat.slug}</TableCell>
                <TableCell className="pr-6 text-right"><Button size="icon" variant="ghost" onClick={() => startEdit(cat)}><Edit2 className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(cat.id, cat.nameTextId)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}