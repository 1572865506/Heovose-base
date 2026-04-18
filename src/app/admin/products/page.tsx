
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
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Package,
  Eye,
  EyeOff,
  Search,
  Filter,
  X,
  ExternalLink
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

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

  const { data: products, isLoading: isProdsLoading } = useCollection<Product>(productsQuery);
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

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
      const nameZh = getTranslation(p.nameTextId, 'zh').toLowerCase();
      const nameEn = getTranslation(p.nameTextId, 'en').toLowerCase();
      const search = searchQuery.toLowerCase();
      
      const matchesSearch = nameZh.includes(search) || nameEn.includes(search) || p.id.toLowerCase().includes(search);
      const matchesCategory = filterCategory === 'all' || p.productCategoryId === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategory, translations]);

  const handleDelete = (p: Product) => {
    if (!firestore || !confirm('确定要删除此产品吗？')) return;
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
      title: newStatus === 'published' ? "产品已发布" : "产品已下架",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            产品列表
          </h2>
          <p className="text-xs text-muted-foreground">管理全站展示的硬件产品及多语言详情。</p>
        </div>
        
        <Link href="/admin/products/editor">
          <Button className="rounded-lg h-10 px-4 font-bold uppercase tracking-widest text-xs gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" /> 发布产品
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-border/40 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="按名称或 ID 搜索..." 
            className="pl-9 border-none bg-muted/30 focus-visible:ring-0 rounded-lg h-9 text-xs"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-48 rounded-lg h-9 border-none bg-muted/30 text-xs">
              <SelectValue placeholder="分类筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">全部分类</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs">{getCategoryName(cat.id)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-14 pl-5">预览</TableHead>
              <TableHead className="font-bold uppercase text-[9px] tracking-wider">名称 / 英文</TableHead>
              <TableHead className="font-bold uppercase text-[9px] tracking-wider">分类</TableHead>
              <TableHead className="font-bold uppercase text-[9px] tracking-wider">状态</TableHead>
              <TableHead className="font-bold uppercase text-[9px] tracking-wider">产品 ID</TableHead>
              <TableHead className="w-32 text-right pr-5 font-bold uppercase text-[9px] tracking-wider">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isProdsLoading ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-[10px] text-muted-foreground italic uppercase">暂无数据</TableCell></TableRow>
            ) : filteredProducts.map((p) => (
              <TableRow key={p.id} className="group hover:bg-muted/5 transition-colors">
                <TableCell className="pl-5">
                  <div className="relative h-10 w-10 rounded-md border bg-muted/10 overflow-hidden">
                    {p.mainImageUrl && <Image src={p.mainImageUrl} alt={p.id} fill className="object-contain p-1" />}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-primary">{getTranslation(p.nameTextId, 'zh')}</span>
                    <span className="text-[9px] text-muted-foreground line-clamp-1">{getTranslation(p.nameTextId, 'en')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-md font-medium text-muted-foreground">{getCategoryName(p.productCategoryId)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={p.status === 'published' ? 'default' : 'secondary'} className={cn("text-[8px] uppercase h-4 px-1.5", p.status === 'published' ? "bg-green-600/90" : "bg-muted-foreground/20 text-muted-foreground")}>{p.status === 'published' ? '已发' : '草稿'}</Badge>
                    <button className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100" onClick={() => toggleStatus(p)}>
                      {p.status === 'published' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3 text-green-600" />}
                    </button>
                  </div>
                </TableCell>
                <TableCell className="text-[9px] font-mono opacity-40">{p.id}</TableCell>
                <TableCell className="pr-5 text-right space-x-0.5">
                  <Link href={`/admin/products/editor?id=${p.id}`}>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary"><Edit2 className="h-3.5 w-3.5" /></Button>
                  </Link>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/5" onClick={() => handleDelete(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
