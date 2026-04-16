
"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Locale, translations } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, Filter, ArrowRight, FileText, ChevronRight, X, Package, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type ProductLine = 'wholesale' | 'project';

// 本地模拟数据 - 分类 (新增 line 属性)
const MOCK_CATEGORIES = [
  // Wholesale Line
  { id: 'cat-aio', line: 'wholesale', nameEn: 'All-in-One PC', nameZh: '一体机电脑' },
  { id: 'cat-minipc', line: 'wholesale', nameEn: 'Mini PC', nameZh: '迷你主机' },
  { id: 'cat-monitor', line: 'wholesale', nameEn: 'Industrial Monitor', nameZh: '工业显示器' },
  { id: 'cat-laptop', line: 'wholesale', nameEn: 'Laptops', nameZh: '笔记本电脑' },
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
  'cat-monitor': [
    { en: 'IP65', zh: 'IP65 防水' }, { en: 'High Brightness', zh: '高亮度' }, { en: 'Touch', zh: '触摸' }
  ],
  'cat-kiosk': [
    { en: 'Payment', zh: '支付' }, { en: 'Medical', zh: '医疗' }, { en: 'Outdoor', zh: '户外' }
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
    keyFeaturesEn: ['Intel i7', '16GB RAM'],
    keyFeaturesZh: ['英特尔 i7', '16GB 内存'],
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
    keyFeaturesEn: ['QR Scanner', 'Thermal Printer'],
    keyFeaturesZh: ['扫码器', '热敏打印机'],
    tags: ['Payment'],
    status: 'active'
  },
  {
    id: 'p3',
    productCategoryId: 'cat-monitor',
    line: 'wholesale',
    nameEn: 'Industrial Touch Display',
    nameZh: '工业级触摸屏',
    taglineEn: 'Rugged Quality',
    descriptionEn: 'Fully sealed industrial display for harsh environments.',
    descriptionZh: '专为恶劣环境设计的全密封工业显示器。',
    primaryImageUrl: 'https://picsum.photos/seed/mon1/600/450',
    keyFeaturesEn: ['IP65 Waterproof', '1000 nits'],
    keyFeaturesZh: ['IP65 防水', '1000 尼特'],
    tags: ['IP65', 'High Brightness'],
    status: 'active'
  },
  {
    id: 'p4',
    productCategoryId: 'cat-conference',
    line: 'project',
    nameEn: '86" Smart Conference Hub',
    nameZh: '86寸智能会议平板',
    taglineEn: 'Collaboration Redefined',
    descriptionEn: 'Large format interactive display for modern conference rooms.',
    descriptionZh: '适用于现代会议室的大尺寸交互式显示屏。',
    primaryImageUrl: 'https://picsum.photos/seed/conf1/600/450',
    keyFeaturesEn: ['4K UHD', '20-point Touch'],
    keyFeaturesZh: ['4K 超清', '20点触控'],
    tags: ['Touch'],
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
  const router = useRouter();
  const categoryParam = searchParams.get('category');
  const t = translations[locale].products;

  // 模拟初始加载效果
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // 根据 URL 参数初始化分类过滤
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

  // 当切换类别时，清空已选标签
  useEffect(() => {
    setSelectedTag(null);
  }, [selectedCategoryId]);

  // 判断当前选中的产品线
  const activeLine: ProductLine = useMemo(() => {
    if (!selectedCategoryId) return 'wholesale';
    const cat = MOCK_CATEGORIES.find(c => c.id === selectedCategoryId);
    return (cat?.line as ProductLine) || 'wholesale';
  }, [selectedCategoryId]);

  // 主色调工具函数
  const getLineStyles = (line: ProductLine) => {
    return line === 'wholesale' 
      ? { 
          bg: 'bg-primary', 
          text: 'text-primary', 
          border: 'border-primary', 
          hover: 'hover:bg-primary/10',
          shadow: 'shadow-primary/20',
          button: 'bg-primary hover:bg-primary/90',
          gradient: 'from-primary/20 via-transparent'
        } 
      : { 
          bg: 'bg-[#F97316]', 
          text: 'text-[#F97316]', 
          border: 'border-[#F97316]', 
          hover: 'hover:bg-[#F97316]/10',
          shadow: 'shadow-orange-500/20',
          button: 'bg-[#F97316] hover:bg-[#F97316]/90',
          gradient: 'from-[#F97316]/20 via-transparent'
        };
  };

  const lineStyles = getLineStyles(activeLine);

  // 获取当前类别下的可用标签
  const currentCategoryTags = useMemo(() => {
    if (!selectedCategoryId) return [];
    return CATEGORY_TAGS[selectedCategoryId] || [];
  }, [selectedCategoryId]);

  // 客户端过滤逻辑
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(product => {
      const matchesCategory = !selectedCategoryId || product.productCategoryId === selectedCategoryId;
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

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar locale={locale} setLocale={setLocale} />
      
      {/* Dynamic Header Section */}
      <section className={cn("pt-32 pb-16 text-white relative transition-colors duration-700", lineStyles.bg)}>
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://picsum.photos/seed/list-bg/1920/600"
            alt="Product List Background"
            fill
            className="object-cover"
            data-ai-hint="high tech hardware"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-4">
               <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                  {activeLine === 'wholesale' ? (locale === 'zh' ? '批发产品线' : 'Wholesale Line') : (locale === 'zh' ? '项目产品线' : 'Project Line')}
               </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
              {activeLine === 'project' && locale === 'zh' ? '项目定制化方案' : t.listTitle}
            </h1>
            <p className="text-xl opacity-80 font-light max-w-xl">
              {activeLine === 'project' 
                ? (locale === 'zh' ? '针对大型工程、智能会议及工业场景的专业定制化硬件方案。' : 'Professional hardware solutions tailored for large projects, smart meetings, and industrial scenes.')
                : t.listSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-10">
            {/* Product Line Selector */}
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

            {/* Search */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  className="pl-10 rounded-xl border-border/40 focus:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {activeLine === 'wholesale' ? (locale === 'zh' ? '分销类别' : 'Wholesale Types') : (locale === 'zh' ? '项目分类' : 'Project Types')}
              </h3>
              <div className="flex flex-col gap-1">
                {MOCK_CATEGORIES.filter(c => c.line === activeLine).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium text-left group",
                      selectedCategoryId === category.id 
                        ? `${lineStyles.bg} text-white shadow-xl` 
                        : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <span>{locale === 'zh' ? category.nameZh : category.nameEn}</span>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      selectedCategoryId === category.id ? "translate-x-1" : "opacity-0 group-hover:opacity-40"
                    )} />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Upper Info Area */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                    {filteredProducts.length} {locale === 'zh' ? '件产品' : 'Items'}
                  </Badge>
                  <span className={cn("text-sm italic font-medium", lineStyles.text)}>
                    {activeCategoryName}
                  </span>
                </div>
              </div>

              {/* Dynamic Tag Bar */}
              {selectedCategoryId && currentCategoryTags.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Filter className="h-3 w-3" /> Specification Filters
                    </h4>
                  </div>
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex gap-2 pb-4">
                      {currentCategoryTags.map((tag, idx) => {
                        const isSelected = selectedTag === tag.en;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedTag(isSelected ? null : tag.en)}
                            className={cn(
                              "px-4 py-2 rounded-full text-xs font-medium border transition-all duration-300",
                              isSelected 
                                ? `${lineStyles.bg} text-white border-transparent shadow-lg scale-105` 
                                : `bg-white border-border/60 text-muted-foreground ${lineStyles.hover}`
                            )}
                          >
                            {locale === 'zh' ? tag.zh : tag.en}
                          </button>
                        );
                      })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[400px] rounded-[2rem] bg-muted/20 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="group bg-white rounded-3xl border border-border/40 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-muted/20 overflow-hidden">
                      <Image
                        src={product.primaryImageUrl}
                        alt={locale === 'zh' ? product.nameZh : product.nameEn}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={cn("bg-white/90 backdrop-blur-md border-none shadow-sm text-[10px] font-bold", lineStyles.text)}>
                          {product.taglineEn}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6 space-y-4 flex-grow flex flex-col">
                      <div className="space-y-1">
                        <h3 className={cn("text-xl font-headline font-bold leading-tight", lineStyles.text)}>
                          {locale === 'zh' ? product.nameZh : product.nameEn}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                          {locale === 'zh' ? product.descriptionZh : product.descriptionEn}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(product.tags || []).map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="text-[9px] px-2 py-0.5 bg-muted/40 text-muted-foreground rounded-full border border-border/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="pt-6 mt-auto flex items-center justify-between gap-4">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs font-bold tracking-tighter group/btn">
                          {t.viewDetails} <ArrowRight className={cn("ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-transform", lineStyles.text)} />
                        </Button>
                        <Button size="icon" className={cn("rounded-xl h-9 w-9 transition-all text-white", lineStyles.bg)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center space-y-6 bg-muted/10 rounded-[3rem] border-2 border-dashed border-border/40">
                <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <Filter className="h-10 w-10 opacity-20" />
                </div>
                <h4 className="text-xl font-bold text-muted-foreground">{t.noResults}</h4>
                <Button onClick={() => { setSearchQuery(''); setSelectedCategoryId(null); }} variant="link" className={lineStyles.text}>
                  Reset filters
                </Button>
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
