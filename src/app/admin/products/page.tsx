
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Package,
  ExternalLink
} from 'lucide-react';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

interface Product {
  id: string;
  nameTextId: string;
  descriptionTextId: string;
  mainImageUrl: string;
  productCategoryId: string;
  galleryImageUrls: string[];
}

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
}

interface ProductCategory {
  id: string;
  nameTextId: string;
}

export default function AdminProductsPage() {
  const firestore = useFirestore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    categoryId: '',
    mainImageUrl: '',
    galleryUrls: '', // 逗号分隔
    nameEn: '',
    nameZh: '',
    descEn: '',
    descZh: ''
  });

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);

  const catsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'productCategories');
  }, [firestore]);

  const transQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'localizedStrings');
  }, [firestore]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);
  const { data: categories } = useCollection<ProductCategory>(catsQuery);
  const { data: translations } = useCollection<LocalizedString>(transQuery);

  const getTranslation = (id: string, lang: 'zh' | 'en' = 'zh') => {
    const t = translations?.find(t => t.id === id);
    return t ? t[lang] : id;
  };

  const getCategoryName = (id: string) => {
    const cat = categories?.find(c => c.id === id);
    return cat ? getTranslation(cat.nameTextId) : id;
  };

  const handleSave = () => {
    if (!firestore || !formData.id || !formData.categoryId) return;
    
    const nameId = `prod_name_${formData.id}`;
    const descId = `prod_desc_${formData.id}`;

    // 1. 保存名称翻译
    setDocumentNonBlocking(doc(firestore, 'localizedStrings', nameId), {
      id: nameId, en: formData.nameEn, zh: formData.nameZh, updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. 保存描述翻译
    setDocumentNonBlocking(doc(firestore, 'localizedStrings', descId), {
      id: descId, en: formData.descEn, zh: formData.descZh, updatedAt: serverTimestamp()
    }, { merge: true });

    // 3. 保存产品数据
    setDocumentNonBlocking(doc(firestore, 'products', formData.id), {
      id: formData.id,
      nameTextId: nameId,
      descriptionTextId: descId,
      mainImageUrl: formData.mainImageUrl,
      productCategoryId: formData.categoryId,
      galleryImageUrls: formData.galleryUrls.split(',').map(s => s.trim()).filter(Boolean),
      updatedAt: serverTimestamp()
    }, { merge: true });

    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingProduct(null);
    setFormData({ id: '', categoryId: '', mainImageUrl: '', galleryUrls: '', nameEn: '', nameZh: '', descEn: '', descZh: '' });
  };

  const startEdit = (p: Product) => {
    const nameT = translations?.find(t => t.id === p.nameTextId);
    const descT = translations?.find(t => t.id === p.descriptionTextId);
    setFormData({
      id: p.id,
      categoryId: p.productCategoryId,
      mainImageUrl: p.mainImageUrl,
      galleryUrls: p.galleryImageUrls.join(', '),
      nameEn: nameT?.en || '',
      nameZh: nameT?.zh || '',
      descEn: descT?.en || '',
      descZh: descT?.zh || ''
    });
    setEditingProduct(p);
    setIsAdding(true);
  };

  const handleDelete = (p: Product) => {
    if (!firestore || !confirm('确定要删除此产品吗？')) return;
    deleteDocumentNonBlocking(doc(firestore, 'products', p.id));
    deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', p.nameTextId));
    deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', p.descriptionTextId));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <Package className="h-6 w-6" />
            产品列表管理
          </h2>
          <p className="text-sm text-muted-foreground">管理全站展示的硬件产品详情及其多语言内容。</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> 发布新产品
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? '编辑产品信息' : '发布全新产品'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">产品唯一 ID</Label>
                  <Input disabled={!!editingProduct} placeholder="p101" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">所属分类</Label>
                  <Select value={formData.categoryId} onValueChange={v => setFormData({...formData, categoryId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => (
                        <SelectItem key={c.id} value={c.id}>{getTranslation(c.nameTextId)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="text-[10px] font-bold uppercase text-primary">多语言名称</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="英文名称" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} />
                  <Input placeholder="中文名称" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase text-primary">产品简介 (多语言)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Textarea placeholder="英文简介" value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} />
                  <Textarea placeholder="中文简介" value={formData.descZh} onChange={e => setFormData({...formData, descZh: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <Label className="text-[10px] font-bold uppercase">图片资产</Label>
                <Input placeholder="主图 URL" value={formData.mainImageUrl} onChange={e => setFormData({...formData, mainImageUrl: e.target.value})} />
                <Textarea placeholder="图库 URL (逗号分隔多个链接)" value={formData.galleryUrls} onChange={e => setFormData({...formData, galleryUrls: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>取消</Button>
              <Button onClick={handleSave}>确认发布</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl border border-border/40 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-16 pl-6">外观</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">产品名称</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">所属分类</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">ID</TableHead>
              <TableHead className="w-[100px] text-right pr-6 font-bold uppercase text-[10px] tracking-widest">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto opacity-20" /></TableCell>
              </TableRow>
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">暂无产品数据</TableCell>
              </TableRow>
            ) : products?.map((p) => (
              <TableRow key={p.id} className="group">
                <TableCell className="pl-6">
                  <div className="relative h-12 w-12 rounded-lg border bg-muted/10 overflow-hidden">
                    {p.mainImageUrl && <Image src={p.mainImageUrl} alt={p.id} fill className="object-contain" />}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-primary">{getTranslation(p.nameTextId, 'zh')}</span>
                    <span className="text-[10px] text-muted-foreground">{getTranslation(p.nameTextId, 'en')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">{getCategoryName(p.productCategoryId)}</span>
                </TableCell>
                <TableCell className="text-[10px] font-mono opacity-50">{p.id}</TableCell>
                <TableCell className="pr-6 text-right space-x-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(p)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p)}>
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
