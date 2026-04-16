
"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Locale, translations } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, Filter, ArrowRight, FileText, ChevronRight, X, Package, LayoutGrid, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

type ProductLine = 'wholesale' | 'project';

interface Category {
  id: string;
  line: ProductLine;
  nameEn: string;
  nameZh: string;
  parentId?: string;
}

// 模拟数据 - 分类 (支持层级)
const MOCK_CATEGORIES: Category[] = [
  // Wholesale Line
  { id: 'cat-aio', line: 'wholesale', nameEn: 'All-in-One PC', nameZh: '一体机电脑' },
  { id: 'cat-minipc', line: 'wholesale', nameEn: 'Mini PC', nameZh: '迷你主机' },
  { id: 'cat-monitor', line: 'wholesale', nameEn: 'Industrial Monitor', nameZh: '工业显示器' },
  { id: 'cat-laptop', line: 'wholesale', nameEn: 'Laptops', nameZh: '笔记本电脑' },
  // PC Components & Sub-categories
  { id: 'cat-components', line: 'wholesale', nameEn: 'PC Components', nameZh: '电脑配件' },
  { id: 'cat-mb', line: 'wholesale', nameEn: 'Motherboards', nameZh: '主板', parentId: 'cat-components' },
  { id: 'cat-gpu', line: 'wholesale', nameEn: 'GPUs', nameZh: '显卡', parentId: 'cat-components' },
  { id: 'cat-ram', line: 'wholesale', nameEn: 'RAM', nameZh: '内存', parentId: 'cat-components' },
  { id: 'cat-hdd', line: 'wholesale', nameEn: 'Storage (SSD/HDD)', nameZh: '硬盘/存储', parentId: 'cat-components' },
  { id: 'cat-cpu', line: 'wholesale', nameEn: 'CPUs', nameZh: '中央处理器', parentId: 'cat-components' },
  
  // Project Line
  { id: 'cat-kiosk', line: 'project', nameEn: 'Self-service Kiosk', nameZh: '自助终端' },
  { id: 'cat-conference', line: 'project', nameEn: 'Conference Tablet', nameZh: '会议平板' },
  { id: 'cat-industrial', line: 'project', nameEn: 'Industrial PC', nameZh: '工业控制机' },
  { id: 'cat-led', line: 'project', nameEn: 'LED Screen Project', nameZh: 'LED 工程' },
];

const CATEGORY_TAGS: Record<string, { en: string; zh: string }[]> = {
  'cat-aio': [
    { en: '19 inch', zh: '19 英寸' }, { en: '23.8 inch', zh: '23.8 英寸' }, { en: '27 inch', zh: '27 英寸' }, { en: 'Office', zh: '办公' }
  ],
  'cat-minipc': [
    { en: 'Fanless', zh: '无风扇' }, { en: 'Gaming', zh: '游戏' }, { en: 'Edge Computing', zh: '边缘计算' }
  ],
  'cat-gpu': [
    { en: 'NVIDIA', zh: '英伟达' }, { en: 'AMD', zh: '超威' }, { en: 'Gaming', zh: '游戏' }, { en: 'Workstation', zh: '工作站' }
  ],
};

const MOCK_PRODUCTS = [
  {
    id: 'p1',
    productCategoryId: 'cat-aio',
    line: 'wholesale',
    nameEn: 'Heovose H24 Pro AIO',
    nameZh: 'Heovose H24 Pro 一体机',
    taglineEn: 'Ultimate Integration',
    descriptionEn: 'High-performance 23.8-inch All-in-One PC with borderless display.',
    descriptionZh: '高性能 23.8 英寸一体机，采用无边框显示屏。',
    primaryImageUrl: 'https://picsum.photos/seed/aio1/600/450',
    tags: ['23.8 inch', 'Office'],
    status: 'active'
  },
  {
    id: 'p2',
    productCategoryId: 'cat-kiosk',
    line: 'project',
    nameEn: 'Smart Retail Kiosk',
    nameZh: '智能零售终端',
    taglineEn: 'Future of Retail',
    descriptionEn: 'Versatile self-service kiosk for check-out and ticketing.',
    descriptionZh: '多功能自助终端，适用于结账和票务。',
    primaryImageUrl: 'https://picsum.photos/seed/kiosk1/600/450',
    tags: ['Payment'],
    status: 'active'
  },
  {
    id: 'p5',
    productCategoryId: 'cat-gpu',
    line: 'wholesale',
    nameEn: 'GeForce RTX 4070 Ti',
    nameZh: 'GeForce RTX 4070 Ti 显卡',
    taglineEn: 'Power for Professionals',
    descriptionEn: 'High-end graphics card for gaming and industrial rendering.',
    descriptionZh: '适用于游戏和工业渲染的高端显卡。',
    primaryImageUrl: 'https://picsum.photos/seed/gpu1/600/450',
    tags: ['NVIDIA', 'Gaming'],
    status: 'active'
  },
  {
    id: 'p6',
    productCategoryId: 'cat-ram',
    line: 'wholesale',
    nameEn: 'Heovose DDR5 32GB RAM',
    nameZh: 'Heovose DDR5 32GB 内存条',
    taglineEn: 'Extreme Speed',
    descriptionEn: 'Low-latency high-speed memory modules.',
    descriptionZh: '低延迟高速内存模组。',
    primaryImageUrl: 'https://picsum.photos/seed/ram1/600/450',
    tags: ['DDR5', '32GB'],
    status: 'active'
  }
];

function ProductListContent() {
  const [locale, setLocale] = useState<Locale>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const t = translations[locale].products;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (categoryParam) {
      const found = MOCK_CATEGORIES.find(c => 
        c.id === categoryParam || 
        c.nameEn.toLowerCase().includes(categoryParam.toLowerCase()) ||
        c.nameZh.includes(categoryParam)
      );
      if (found) setSelectedCategoryId(found.id);
    }
  }, [categoryParam]);

  useEffect(() => {
    setSelectedTag(null);
  }, [selectedCategoryId]);

  const activeLine: ProductLine = useMemo(() => {
    if (!selectedCategoryId) return 'wholesale';
    const cat = MOCK_CATEGORIES.find(c => c.id === selectedCategoryId);
    return (cat?.line as ProductLine) || 'wholesale';
  }, [selectedCategoryId]);

  const getLineStyles = (line: ProductLine) => {
    return line === 'wholesale' 
      ? { 
          bg: 'bg-primary', 
          text: 'text-primary', 
          border: 'border-primary', 
          hover: 'hover:bg-primary/10',
          button: 'bg-primary hover:bg-primary/90',
        } 
      : { 
          bg: 'bg-[#F97316]', 
          text: 'text-[#F97316]', 
          border: 'border-[#F97316]', 
          hover: 'hover:bg-[#F97316]/10',
          button: 'bg-[#F97316] hover:bg-[#F97316]/90',
        };
  };

  const lineStyles = getLineStyles(activeLine);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(product => {
      // 如果选中了父类，显示所有子类的产品
      const category = MOCK_CATEGORIES.find(c => c.id === selectedCategoryId);
      const isChild = category?.parentId === selectedCategoryId;
      const subCategoryIds = MOCK_CATEGORIES.filter(c => c.parentId === selectedCategoryId).map(c => c.id);
      
      const matchesCategory = !selectedCategoryId || 
                             product.productCategoryId === selectedCategoryId || 
                             subCategoryIds.includes(product.productCategoryId);
                             
      const matchesTag = !selectedTag || (product.tags || []).includes(selectedTag);
      const name = locale === 'zh' ? product.nameZh : product.nameEn;
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [selectedCategoryId, selectedTag, searchQuery, locale]);

  const activeCategoryName = useMemo(() => {
    if (!selectedCategoryId) return t.allCategories;
    const cat = MOCK_CATEGORIES.find(c => c.id === selectedCategoryId);
    return locale === 'zh' ? cat?.nameZh : cat?.nameEn;
  }, [selectedCategoryId, locale, t.allCategories]);

  // 分类层级渲染逻辑
  const parentCategories = MOCK_CATEGORIES.filter(c => !c.parentId && c.line === activeLine);
  
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar locale={locale} setLocale={setLocale} />
      
      <section className={cn("pt-32 pb-16 text-white relative transition-colors duration-700", lineStyles.bg)}>
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://picsum.photos/seed/list-bg/1920/600"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
              {activeLine === 'project' && locale === 'zh' ? '项目定制化方案' : t.listTitle}
            </h1>
            <p className="text-xl opacity-80 font-light max-w-xl">
              {activeLine === 'project' 
                ? (locale === 'zh' ? '针对大型工程、智能会议及工业场景的专业定制化硬件方案。' : 'Professional solutions.')
                : t.listSubtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <aside className="lg:col-span-3 space-y-10">
            {/* 产品线切换 */}
            <div className="p-1 bg-muted rounded-2xl flex gap-1">
               <button 
                onClick={() => setSelectedCategoryId('cat-aio')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
                  activeLine === 'wholesale' ? "bg-white shadow-md text-primary" : "text-muted-foreground hover:text-primary"
                )}
               >
                 <Package className="h-4 w-4" /> {locale === 'zh' ? '批发' : 'Wholesale'}
               </button>
               <button 
                onClick={() => setSelectedCategoryId('cat-kiosk')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
                  activeLine === 'project' ? "bg-white shadow-md text-orange-500" : "text-muted-foreground hover:text-orange-500"
                )}
               >
                 <LayoutGrid className="h-4 w-4" /> {locale === 'zh' ? '项目' : 'Project'}
               </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  className="pl-10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* 层级分类菜单 */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Categories</h3>
              <Accordion type="single" collapsible className="w-full space-y-1">
                {parentCategories.map((category) => {
                  const subCategories = MOCK_CATEGORIES.filter(c => c.parentId === category.id);
                  const hasSubs = subCategories.length > 0;
                  const isSelected = selectedCategoryId === category.id;

                  if (hasSubs) {
                    return (
                      <AccordionItem key={category.id} value={category.id} className="border-none">
                        <AccordionTrigger 
                          className={cn(
                            "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all hover:no-underline",
                            isSelected ? `${lineStyles.bg} text-white` : "hover:bg-muted text-muted-foreground"
                          )}
                          onClick={() => setSelectedCategoryId(category.id)}
                        >
                          <span>{locale === 'zh' ? category.nameZh : category.nameEn}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-2 pl-4 space-y-1">
                          {subCategories.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => setSelectedCategoryId(sub.id)}
                              className={cn(
                                "w-full text-left px-4 py-2 rounded-lg text-xs font-medium transition-all",
                                selectedCategoryId === sub.id 
                                  ? `${lineStyles.text} font-bold bg-muted` 
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {locale === 'zh' ? sub.nameZh : sub.nameEn}
                            </button>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium text-left",
                        isSelected ? `${lineStyles.bg} text-white` : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <span>{locale === 'zh' ? category.nameZh : category.nameEn}</span>
                      <ChevronRight className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    </button>
                  );
                })}
              </Accordion>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-8">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-bold uppercase">
                {filteredProducts.length} {locale === 'zh' ? '件产品' : 'Items'}
              </Badge>
              <span className={cn("text-sm italic font-medium", lineStyles.text)}>
                {activeCategoryName}
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <Link 
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="group bg-white rounded-3xl border border-border/40 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-muted/20">
                      <Image
                        src={product.primaryImageUrl}
                        alt={product.nameEn}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6 space-y-4 flex-grow flex flex-col">
                      <h3 className={cn("text-xl font-headline font-bold", lineStyles.text)}>
                        {locale === 'zh' ? product.nameZh : product.nameEn}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {locale === 'zh' ? product.descriptionZh : product.descriptionEn}
                      </p>
                      <div className="mt-auto pt-6 flex items-center justify-between">
                        <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                          {t.viewDetails} <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center text-muted-foreground border-2 border-dashed rounded-[3rem]">
                <p>{t.noResults}</p>
                <Button onClick={() => setSelectedCategoryId(null)} variant="link" className={lineStyles.text}>Reset</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}

export default function ProductListPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProductListContent />
    </Suspense>
  );
}
