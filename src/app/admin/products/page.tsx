
"use client";

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
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
  ExternalLink,
  Globe
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
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
  enabledLanguages?: string[];
}

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
  id_?: string;
  vi?: string;
  [key: string]: any;
}

interface ProductCategory {
  id: string;
  nameTextId: string;
}

interface LanguageSettings {
  supportedLanguages: { code: string, label: string }[];
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

  const langConfigRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'languages') : null, [firestore]);

  const { data: products, isLoading: isProdsLoading } = useCollection<Product>(productsQuery);
  const { data: categories } = useCollection<ProductCategory>(catsQuery);
  const { data: translations } = useCollection<LocalizedString>(transQuery);
  const { data: langSettings } = useDoc<LanguageSettings>(langConfigRef);

  const activeLanguages = useMemo(() => langSettings?.supportedLanguages || [
    { code: 'zh', label: '中文' }, 
    { code: 'en', label: 'English' }
  ], [langSettings]);

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

  const handleToggleLanguage = (p: Product, langCode: string, currentEnabled: string[]) => {
    if (!firestore) return;
    const newList = currentEnabled.includes(langCode) 
      ? currentEnabled.filter(c => c !== langCode)
      : [...currentEnabled, langCode];
    
    updateDocumentNonBlocking(doc(firestore, 'products', p.id), {
      enabledLanguages: newList,
      updatedAt: serverTimestamp()
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-headline font-bold text-slate-900 flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Package className="h-5 w-5" />
            </div>
            产品资源中心
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] pl-14">Management / Product Catalog</p>
        </div>
        
        <Link href="/admin/products/editor">
          <Button className="rounded-2xl h-14 px-8 font-bold uppercase tracking-widest text-xs gap-2.5 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            <Plus className="h-4 w-4" /> 发布新硬件
          </Button>
        </Link>
      </div>

      {/* 高级搜索与筛选栏 - Glassmorphism */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="按名称、型号或序列号搜索 / SEARCH PRODUCTS..." 
            className="pl-12 border-none bg-slate-500/5 focus-visible:ring-0 rounded-[1.25rem] h-12 text-xs font-medium placeholder:text-slate-400 placeholder:font-bold placeholder:uppercase placeholder:tracking-widest"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="h-12 flex items-center gap-3 px-5 bg-slate-500/5 rounded-[1.25rem] border border-transparent focus-within:border-primary/20 transition-all w-full lg:w-64 relative">
             <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
             <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="border-none bg-transparent h-full p-0 shadow-none focus:ring-0 text-xs font-bold uppercase tracking-widest text-slate-600">
                  <SelectValue placeholder="分类筛选" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                  <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest py-3">全部分类 (ALL)</SelectItem>
                  {categories?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs font-bold uppercase tracking-widest py-3">{getTranslation(cat.nameTextId)}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
          </div>
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-[1.25rem] bg-slate-500/5 hover:bg-destructive/5 text-slate-400 hover:text-destructive transition-all" onClick={() => {setSearchQuery(''); setFilterCategory('all');}}>
             <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-500/[0.03] border-b border-border/40">
            <TableRow className="hover:bg-transparent border-none h-14">
              <TableHead className="w-20 pl-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Preview</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Identity / Info</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 text-center">Business Category</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 text-center">Global Status</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 text-center">Localization Visibility</TableHead>
              <TableHead className="text-right pr-8 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isProdsLoading ? (
              <TableRow><TableCell colSpan={6} className="h-64 text-center"><div className="flex flex-col items-center justify-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">正在拉取资源库...</p></div></TableCell></TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-64 text-center"><div className="flex flex-col items-center justify-center gap-3 opacity-30"><Package className="h-10 w-10 text-slate-300" /><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">未找到符合条件的硬件资源</p></div></TableCell></TableRow>
            ) : filteredProducts.map((p) => {
              const enabledLangs = p.enabledLanguages || ['zh', 'en'];
              return (
                <TableRow key={p.id} className="group hover:bg-primary/[0.015] transition-all duration-300 border-b border-border/40 last:border-0 min-h-24">
                  <TableCell className="pl-8">
                    <div className="relative h-14 w-14 rounded-2xl border border-border/40 bg-white shadow-sm overflow-hidden group-hover:scale-110 transition-transform duration-500">
                      {p.mainImageUrl ? (
                        <Image src={p.mainImageUrl} alt="" fill className="object-contain p-2" unoptimized />
                      ) : (
                        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-slate-300"><Package className="h-6 w-6" /></div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="font-headline font-bold text-[14px] text-slate-900 group-hover:text-primary transition-colors">{getTranslation(p.nameTextId, 'zh')}</span>
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase">{p.id.slice(-6)}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest line-clamp-1">{getTranslation(p.nameTextId, 'en')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center h-7 px-3 rounded-full bg-slate-100 text-xs font-bold text-slate-600 uppercase tracking-tighter ring-1 ring-slate-200">{getCategoryName(p.productCategoryId)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-4">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        p.status === 'published' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-slate-300"
                      )} />
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-[0.15em]",
                        p.status === 'published' ? "text-emerald-600" : "text-slate-400"
                      )}>
                        {p.status === 'published' ? 'Active / 发布' : 'Draft / 草稿'}
                      </span>
                      <button className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" onClick={() => toggleStatus(p)}>
                        {p.status === 'published' ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-emerald-600" />}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-5">
                      {activeLanguages.map(lang => {
                        const isEnabled = enabledLangs.includes(lang.code);
                        return (
                          <div key={lang.code} className="flex flex-col items-center gap-2">
                            <span className={cn("text-xs font-bold uppercase transition-colors", isEnabled ? "text-primary" : "text-slate-300")}>{lang.code}</span>
                            <Switch 
                              checked={isEnabled}
                              onCheckedChange={() => handleToggleLanguage(p, lang.code, enabledLangs)}
                              className="scale-75"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Link href={`/admin/products/editor?id=${p.id}`}>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/5 transition-all" onClick={() => handleDelete(p)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* 底部信息提示 */}
        <div className="px-8 py-5 bg-slate-50/50 border-t border-border/40 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Hardware: {filteredProducts.length}</p>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Globe className="h-3 w-3" /> System: Multi-language Enabled
           </div>
        </div>
      </div>
    </div>
  );
}
