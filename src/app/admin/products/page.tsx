
"use client";

import { useState, useMemo } from 'react';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
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
  Globe,
  BarChart3
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/image-utils';

interface Product {
  id: string;
  nameTextId: string;
  descriptionTextId: string;
  mainImageUrl: string;
  categoryId: string;
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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', order: 'desc' });

  const { data: products, isLoading: isProdsLoading, mutate: mutateProducts } = useLocalCollection<Product>('products');
  const { data: categories } = useLocalCollection<ProductCategory>('productCategories');
  const { data: translations } = useLocalCollection<LocalizedString>('localizedStrings?full=true');
  const { data: langSettings } = useLocalDoc<LanguageSettings>('settings', 'languages');

  const activeLanguages = useMemo(() => langSettings?.supportedLanguages || [
    { code: 'zh', label: '中文' }, 
    { code: 'en', label: 'English' }
  ], [langSettings]);

  const getTranslation = (id: string, lang: 'zh' | 'en' = 'zh') => {
    const t = translations?.find(t => t.id === id);
    if (!t) return id;
    const content = (t.content as any) || {};
    return content[lang] || (t as any)[lang] || id;
  };

  const getCategoryName = (id: string) => {
    const cat = categories?.find(c => c.id === id);
    return cat ? getTranslation(cat.nameTextId) : id;
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = products.filter(p => {
      const nameZh = getTranslation(p.nameTextId, 'zh').toLowerCase();
      const nameEn = getTranslation(p.nameTextId, 'en').toLowerCase();
      const search = searchQuery.toLowerCase();
      
      const matchesSearch = nameZh.includes(search) || nameEn.includes(search) || p.id.toLowerCase().includes(search);
      const matchesCategory = filterCategory === 'all' || p.categoryId === filterCategory;
      
      return matchesSearch && matchesCategory;
    });

    // 排序逻辑
    result.sort((a, b) => {
      let valA: any, valB: any;
      if (sortConfig.key === 'name') {
        valA = getTranslation(a.nameTextId, 'zh');
        valB = getTranslation(b.nameTextId, 'zh');
      } else {
        valA = a[sortConfig.key as keyof Product] || '';
        valB = b[sortConfig.key as keyof Product] || '';
      }

      if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchQuery, filterCategory, sortConfig, translations]);

  const handleDelete = async (p: Product) => {
    if (!confirm('确定要删除此产品吗？')) return;
    try {
      await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
      mutateProducts();
      toast({ title: "产品已删除" });
    } catch (e) {
      toast({ variant: "destructive", title: "删除失败" });
    }
  };

  const toggleStatus = async (p: Product) => {
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("状态更新失败");
      mutateProducts();
      toast({ title: newStatus === 'published' ? "产品已发布" : "产品已下架" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "操作失败", description: e.message });
    }
  };

  const handleToggleLanguage = async (p: Product, langCode: string, currentEnabled: string[]) => {
    const newList = currentEnabled.includes(langCode) 
      ? currentEnabled.filter(c => c !== langCode)
      : [...currentEnabled, langCode];
    
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabledLanguages: newList }),
      });
      if (!res.ok) throw new Error("语言设置更新失败");
      mutateProducts();
    } catch (e: any) {
      toast({ variant: "destructive", title: "设置失败", description: e.message });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-headline font-bold text-foreground flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Package className="h-5 w-5" />
            </div>
            产品资源中心
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] pl-14">Management / Product Catalog</p>
        </div>
        
        <Link href="/admin/products/editor">
          <Button className="rounded-2xl h-14 px-8 font-bold uppercase tracking-widest text-xs gap-2.5 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            <Plus className="h-4 w-4" /> 发布新硬件
          </Button>
        </Link>
      </div>

      {/* 高级搜索与筛选栏 - Glassmorphism */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-card/40 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-border/10 shadow-2xl shadow-black/20">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-all" />
          <Input 
            placeholder="按名称、型号或序列号搜索 / SEARCH PRODUCTS..." 
            className="pl-14 border-none bg-muted/10 focus-visible:ring-0 rounded-2xl h-14 text-xs font-bold placeholder:text-muted-foreground/20 placeholder:font-bold placeholder:uppercase placeholder:tracking-[0.2em] transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* 排序选择器 */}
            <div className="h-14 flex items-center gap-3 px-6 bg-muted/10 rounded-2xl border border-transparent focus-within:border-primary/20 transition-all w-full lg:w-64 relative">
               <BarChart3 className="h-4 w-4 text-muted-foreground/40 shrink-0" />
               <Select value={`${sortConfig.key}-${sortConfig.order}`} onValueChange={(v) => {
                 const [key, order] = v.split('-');
                 setSortConfig({ key, order: order as any });
               }}>
                  <SelectTrigger className="border-none bg-transparent h-full p-0 shadow-none focus:ring-0 text-[10px] font-bold uppercase tracking-widest text-foreground/60">
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/10 bg-card/90 backdrop-blur-xl shadow-2xl">
                    <SelectItem value="updatedAt-desc" className="text-[10px] font-bold uppercase tracking-widest py-3">最近修改 (LATEST EDIT)</SelectItem>
                    <SelectItem value="updatedAt-asc" className="text-[10px] font-bold uppercase tracking-widest py-3">最早修改 (OLDEST EDIT)</SelectItem>
                    <SelectItem value="createdAt-desc" className="text-[10px] font-bold uppercase tracking-widest py-3">最近发布 (NEWEST)</SelectItem>
                    <SelectItem value="createdAt-asc" className="text-[10px] font-bold uppercase tracking-widest py-3">最早发布 (OLDEST)</SelectItem>
                    <SelectItem value="name-asc" className="text-[10px] font-bold uppercase tracking-widest py-3">名称 A-Z (NAME A-Z)</SelectItem>
                    <SelectItem value="name-desc" className="text-[10px] font-bold uppercase tracking-widest py-3">名称 Z-A (NAME Z-A)</SelectItem>
                  </SelectContent>
               </Select>
            </div>

            {/* 分类筛选器 */}
            <div className="h-14 flex items-center gap-3 px-6 bg-muted/10 rounded-2xl border border-transparent focus-within:border-primary/20 transition-all w-full lg:w-64 relative">
               <Filter className="h-4 w-4 text-muted-foreground/40 shrink-0" />
               <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="border-none bg-transparent h-full p-0 shadow-none focus:ring-0 text-[10px] font-bold uppercase tracking-widest text-foreground/60">
                    <SelectValue placeholder="分类筛选" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/10 bg-card/90 backdrop-blur-xl shadow-2xl">
                    <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest py-3">全部分类 (ALL)</SelectItem>
                    {categories?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="text-[10px] font-bold uppercase tracking-widest py-3">{getTranslation(cat.nameTextId)}</SelectItem>
                    ))}
                  </SelectContent>
               </Select>
            </div>

            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-muted/10 hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-all" onClick={() => {setSearchQuery(''); setFilterCategory('all'); setSortConfig({ key: 'updatedAt', order: 'desc' });}}>
               <X className="h-4 w-4" />
            </Button>
          </div>
      </div>

      <div className="bg-card/40 backdrop-blur-3xl rounded-[2.5rem] border border-border/10 shadow-2xl shadow-black/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30 border-b border-border/10">
            <TableRow className="hover:bg-transparent border-none h-16">
              <TableHead className="w-24 pl-10 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">预览 / PREVIEW</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">产品识别 / IDENTITY</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 text-center">业务分类 / CATEGORY</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 text-center">发布状态 / STATUS</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 text-center">语言可见性 / VISIBILITY</TableHead>
              <TableHead className="text-right pr-10 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">操作 / ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isProdsLoading ? (
              <TableRow><TableCell colSpan={6} className="h-80 text-center"><div className="flex flex-col items-center justify-center gap-4"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /><p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">正在拉取资源库...</p></div></TableCell></TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-80 text-center"><div className="flex flex-col items-center justify-center gap-6 opacity-20"><Package className="h-14 w-14 text-muted-foreground" /><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">未找到符合条件的硬件资源</p></div></TableCell></TableRow>
            ) : filteredProducts.map((p) => {
              const enabledLangs = p.enabledLanguages || ['zh', 'en'];
              return (
                <TableRow key={p.id} className="group hover:bg-primary/[0.02] transition-all duration-500 border-b border-border/10 last:border-0 relative">
                  <TableCell className="pl-10 py-6">
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 rounded-r-full" />
                    <div className="relative h-16 w-16 rounded-2xl border border-border/10 bg-background shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      {p.mainImageUrl ? (
                        <Image src={getAssetUrl(p.mainImageUrl)} alt="" fill className="object-contain p-2.5" unoptimized />
                      ) : (
                        <div className="absolute inset-0 bg-muted/5 flex items-center justify-center text-muted-foreground/10"><Package className="h-8 w-8" /></div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3">
                        <a 
                          href={`/products/${p.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-headline font-bold text-[15px] text-foreground hover:text-primary transition-colors flex items-center gap-2 group/link"
                        >
                          {getTranslation(p.nameTextId, 'zh')}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                        <span className="text-[9px] font-bold bg-primary/5 text-primary px-2 py-0.5 rounded-lg uppercase tracking-tighter">ID: {p.id.slice(-6)}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] line-clamp-1">{getTranslation(p.nameTextId, 'en')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center h-8 px-4 rounded-xl bg-muted/10 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest border border-border/5">{getCategoryName(p.categoryId)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-5">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        p.status === 'published' ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" : "bg-muted-foreground/20"
                      )} />
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.2em] w-24 text-left",
                        p.status === 'published' ? "text-emerald-500" : "text-muted-foreground/30"
                      )}>
                        {p.status === 'published' ? 'Active / 发布' : 'Draft / 草稿'}
                      </span>
                      <button className="h-9 w-9 rounded-xl hover:bg-primary/15 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" onClick={() => toggleStatus(p)}>
                        {p.status === 'published' ? <EyeOff className="h-4.5 w-4.5 text-muted-foreground/60 hover:text-primary" /> : <Eye className="h-4.5 w-4.5 text-emerald-500" />}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-6">
                      {activeLanguages.map(lang => {
                        const isEnabled = enabledLangs.includes(lang.code);
                        return (
                          <div key={lang.code} className="flex flex-col items-center gap-2">
                            <span className={cn("text-[9px] font-bold uppercase transition-colors tracking-widest", isEnabled ? "text-primary" : "text-muted-foreground/20")}>{lang.code}</span>
                            <Switch 
                              checked={isEnabled}
                              onCheckedChange={() => handleToggleLanguage(p, lang.code, enabledLangs)}
                              className="scale-[0.65] data-[state=checked]:bg-primary/40"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="pr-10 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <Link href={`/admin/products/editor?id=${p.id}`}>
                        <Button size="icon" variant="ghost" className="h-11 w-11 rounded-2xl hover:bg-primary/15 hover:text-primary transition-all">
                          <Edit2 className="h-4.5 w-4.5" />
                        </Button>
                      </Link>
                      <Button size="icon" variant="ghost" className="h-11 w-11 rounded-2xl text-destructive hover:bg-destructive/15 transition-all" onClick={() => handleDelete(p)}>
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* 底部信息提示 */}
        <div className="px-10 py-6 bg-muted/5 border-t border-border/10 flex items-center justify-between">
           <p className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-[0.3em]">Total Hardware Index: {filteredProducts.length}</p>
           <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/20 uppercase tracking-[0.3em]">
              <Globe className="h-3.5 w-3.5 opacity-50" /> System: Multi-language Node Active
           </div>
        </div>
      </div>
    </div>
  );
}
