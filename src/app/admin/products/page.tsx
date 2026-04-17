
"use client";

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
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Package,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  nameTextId: string;
  descriptionTextId: string;
  mainImageUrl: string;
  productCategoryId: string;
  galleryImageUrls: string[];
  status?: 'published' | 'draft';
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
  const { toast } = useToast();

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

  const handleDelete = (p: Product) => {
    if (!firestore || !confirm('确定要删除此产品吗？相关翻译项不会被自动删除以防引用冲突。')) return;
    deleteDocumentNonBlocking(doc(firestore, 'products', p.id));
  };

  const toggleStatus = (p: Product) => {
    if (!firestore) return;
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    updateDocumentNonBlocking(doc(firestore, 'products', p.id), {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    toast({
      title: newStatus === 'published' ? "产品已发布" : "产品已转为草稿",
      description: `${getTranslation(p.nameTextId, 'zh')} 的可见性已更新。`
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <Package className="h-6 w-6" />
            产品中心管理
          </h2>
          <p className="text-sm text-muted-foreground">管理全球展示的硬件产品详情及其多语言内容。</p>
        </div>
        
        <Link href="/admin/products/editor">
          <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2">
            <Plus className="h-4 w-4" /> 发布新产品
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-border/40 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-16 pl-6">外观</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">产品名称</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">所属分类</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">状态</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">ID</TableHead>
              <TableHead className="w-[150px] text-right pr-6 font-bold uppercase text-[10px] tracking-widest">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto opacity-20" /></TableCell>
              </TableRow>
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground italic">暂无产品数据</TableCell>
              </TableRow>
            ) : products?.map((p) => (
              <TableRow key={p.id} className="group hover:bg-muted/5 transition-colors">
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
                  <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium">{getCategoryName(p.productCategoryId)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={p.status === 'published' ? 'default' : 'secondary'}
                      className={cn(
                        "text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm",
                        p.status === 'published' ? "bg-green-600 hover:bg-green-600" : "bg-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {p.status === 'published' ? '已发布' : '草稿'}
                    </Badge>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => toggleStatus(p)}
                      title={p.status === 'published' ? '下架产品' : '发布产品'}
                    >
                      {p.status === 'published' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3 text-green-600" />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-[10px] font-mono opacity-50">{p.id}</TableCell>
                <TableCell className="pr-6 text-right space-x-1">
                  <Link href={`/admin/products/editor?id=${p.id}`}>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/5" onClick={() => handleDelete(p)}>
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

