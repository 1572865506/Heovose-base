
"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Locale, translations } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, Filter, ArrowRight, FileText, ChevronRight, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// 本地模拟数据 - 分类
const MOCK_CATEGORIES = [
  { id: 'cat-aio', nameEn: 'All-in-One PC', nameZh: '一体机电脑' },
  { id: 'cat-minipc', nameEn: 'Mini PC', nameZh: '迷你主机' },
  { id: 'cat-monitor', nameEn: 'Industrial Monitor', nameZh: '工业显示器' },
  { id: 'cat-kiosk', nameEn: 'Self-service Kiosk', nameZh: '自助终端' },
];

// 类别对应的动态标签定义
const CATEGORY_TAGS: Record<string, { en: string; zh: string }[]> = {
  'cat-aio': [
    { en: '19 inch', zh: '19 英寸' },
    { en: '21.5 inch', zh: '21.5 英寸' },
    { en: '23.8 inch', zh: '23.8 英寸' },
    { en: '27 inch', zh: '27 英寸' },
    { en: 'Office', zh: '办公' },
    { en: 'Creative', zh: '创意设计' },
    { en: 'Touch Screen', zh: '触摸屏' },
  ],
  'cat-minipc': [
    { en: 'Fanless', zh: '无风扇' },
    { en: 'Gaming', zh: '游戏' },
    { en: 'Office', zh: '办公' },
    { en: 'Industrial Edge', zh: '工业边缘' },
    { en: '4K Display', zh: '4K 显示' },
  ],
  'cat-monitor': [
    { en: 'Touch', zh: '触摸' },
    { en: 'IP65 Waterproof', zh: 'IP65 防水' },
    { en: 'High Brightness', zh: '高亮度' },
    { en: 'Embedded', zh: '嵌入式' },
    { en: 'Panel Mount', zh: '面板式' },
  ],
  'cat-kiosk': [
    { en: 'Payment', zh: '支付' },
    { en: 'Information', zh: '信息查询' },
    { en: 'Ticketing', zh: '票务' },
    { en: 'Outdoor', zh: '户外' },
    { en: 'Healthcare', zh: '医疗' },
  ],
};

// 本地模拟数据 - 产品 (增加了 tags 属性)
const MOCK_PRODUCTS = [
  {
    id: 'p1',
    productCategoryId: 'cat-aio',
    nameEn: 'Heovose H24 Pro AIO',
    nameZh: 'Heovose H24 Pro 一体机',
    taglineEn: 'Ultimate Integration',
    descriptionEn: 'High-performance 23.8-inch All-in-One PC with borderless display and powerful processing.',
    descriptionZh: '高性能 23.8 英寸一体机，采用无边框显示屏和强劲处理器。',
    primaryImageUrl: 'https://picsum.photos/seed/aio1/600/450',
    keyFeaturesEn: ['Intel i7', '16GB RAM', '512GB SSD'],
    keyFeaturesZh: ['英特尔 i7', '16GB 内存', '512GB 硬盘'],
    tags: ['23.8 inch', 'Office'],
    status: 'active'
  },
  {
    id: 'p2',
    productCategoryId: 'cat-minipc',
    nameEn: 'Ultra-Compact M1 Mini',
    nameZh: '超紧凑 M1 迷你主机',
    taglineEn: 'Tiny but Mighty',
    descriptionEn: 'Space-saving computing solution for office and industrial edge applications.',
    descriptionZh: '适用于办公和工业边缘应用的节省空间的计算解决方案。',
    primaryImageUrl: 'https://picsum.photos/seed/mini1/600/450',
    keyFeaturesEn: ['4K Output', 'Fanless Design', 'Low Power'],
    keyFeaturesZh: ['4K 输出', '无风扇设计', '低功耗'],
    tags: ['Fanless', 'Industrial Edge'],
    status: 'active'
  },
  {
    id: 'p3',
    productCategoryId: 'cat-monitor',
    nameEn: 'IP65 Industrial Touch',
    nameZh: 'IP65 工业级触摸屏',
    taglineEn: 'Rugged Durability',
    descriptionEn: 'Fully sealed industrial display designed for harsh manufacturing environments.',
    descriptionZh: '专为恶劣制造环境设计的全密封工业显示器。',
    primaryImageUrl: 'https://picsum.photos/seed/mon1/600/450',
    keyFeaturesEn: ['Waterproof', 'Sunlight Readable', 'Capacitive Touch'],
    keyFeaturesZh: ['防水', '阳光下可视', '电容触摸'],
    tags: ['Touch', 'IP65 Waterproof', 'High Brightness'],
    status: 'active'
  },
  {
    id: 'p4',
    productCategoryId: 'cat-kiosk',
    nameEn: 'Smart Retail Terminal',
    nameZh: '智能零售终端',
    taglineEn: 'Interactive Experience',
    descriptionEn: 'Versatile self-service kiosk for check-out, ticketing, and information lookup.',
    descriptionZh: '多功能自助终端，适用于结账、票务和信息查询。',
    primaryImageUrl: 'https://picsum.photos/seed/kiosk1/600/450',
    keyFeaturesEn: ['QR Scanner', 'Thermal Printer', 'Customizable'],
    keyFeaturesZh: ['扫码器', '热敏打印机', '可定制'],
    tags: ['Payment', 'Information'],
    status: 'active'
  },
  {
    id: 'p5',
    productCategoryId: 'cat-aio',
    nameEn: 'Business Elite A27',
    nameZh: '商务精英 A27',
    taglineEn: 'Professional Workspace',
    descriptionEn: '27-inch 4K All-in-One PC tailored for creative professionals and high-end offices.',
    descriptionZh: '专为创意专业人士和高端办公室定制的 27 英寸 4K 一体机。',
    primaryImageUrl: 'https://picsum.photos/seed/aio2/600/450',
    keyFeaturesEn: ['4K IPS', 'NVIDIA GPU', 'Ergonomic Stand'],
    keyFeaturesZh: ['4K IPS', '英伟达显卡', '人体工学支架'],
    tags: ['27 inch', 'Creative'],
    status: 'active'
  },
  {
    id: 'p6',
    productCategoryId: 'cat-aio',
    nameEn: 'Compact H19 Office',
    nameZh: '紧凑型 H19 办公系列',
    taglineEn: 'Space Saver',
    descriptionEn: '19-inch entry-level All-in-One PC for administrative tasks and reception.',
    descriptionZh: '19 英寸入门级一体机，适用于行政任务和前台接待。',
    primaryImageUrl: 'https://picsum.photos/seed/aio3/600/450',
    keyFeaturesEn: ['19 inch Panel', 'Energy Efficient', 'Compact Base'],
    keyFeaturesZh: ['19 英寸面板', '低功耗设计', '紧凑型底座'],
    tags: ['19 inch', 'Office'],
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

  // 获取当前类别下的可用标签
  const currentCategoryTags = useMemo(() => {
    if (!selectedCategoryId) return [];
    return CATEGORY_TAGS[selectedCategoryId] || [];
  }, [selectedCategoryId]);

  // 客户端过滤逻辑
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(product => {
      const matchesCategory = !selectedCategoryId || product.productCategoryId === selectedCategoryId;
      const matchesTag = !selectedTag || product.tags.includes(selectedTag);
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
      
      {/* Header Section */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://picsum.photos/seed/list-bg/1920/600"
            alt="Product List Background"
            fill
            className="object-cover"
            data-ai-hint="electronic hardware"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
              {t.listTitle}
            </h1>
            <p className="text-xl opacity-80 font-light">
              {t.listSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-10">
            {/* Search */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  className="pl-10 rounded-xl border-border/40 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</h3>
                {selectedCategoryId && (
                  <button 
                    onClick={() => setSelectedCategoryId(null)}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium",
                    !selectedCategoryId ? "bg-primary text-white shadow-lg" : "hover:bg-muted"
                  )}
                >
                  <span>{t.allCategories}</span>
                  {!selectedCategoryId && <ChevronRight className="h-4 w-4" />}
                </button>
                {MOCK_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium text-left",
                      selectedCategoryId === category.id ? "bg-primary text-white shadow-lg" : "hover:bg-muted"
                    )}
                  >
                    <span>{locale === 'zh' ? category.nameZh : category.nameEn}</span>
                    {selectedCategoryId === category.id && <ChevronRight className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Upper Selection Area: Dynamic Tags */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                    {filteredProducts.length} Results
                  </Badge>
                  <span className="text-sm text-muted-foreground italic">
                    in {activeCategoryName}
                  </span>
                </div>
              </div>

              {/* Dynamic Tag Bar (Only visible when a category is selected) */}
              {selectedCategoryId && currentCategoryTags.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Filter className="h-3 w-3" /> Quick Filters
                    </h4>
                    {selectedTag && (
                      <button 
                        onClick={() => setSelectedTag(null)}
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <X className="h-2 w-2" /> Clear Tag
                      </button>
                    )}
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
                                ? "bg-accent text-accent-foreground border-accent shadow-md scale-105" 
                                : "bg-white border-border/60 text-muted-foreground hover:border-primary hover:text-primary"
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
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] bg-muted/20 overflow-hidden">
                      <Image
                        src={product.primaryImageUrl}
                        alt={locale === 'zh' ? product.nameZh : product.nameEn}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 backdrop-blur-md text-primary border-none shadow-sm text-[10px] font-bold">
                          {product.taglineEn}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 space-y-4 flex-grow flex flex-col">
                      <div className="space-y-1">
                        <h3 className="text-xl font-headline font-bold text-primary leading-tight">
                          {locale === 'zh' ? product.nameZh : product.nameEn}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                          {locale === 'zh' ? product.descriptionZh : product.descriptionEn}
                        </p>
                      </div>

                      {/* Product Tags (Displayed as badges) */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {product.tags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="text-[9px] px-2 py-0.5 bg-muted/40 text-muted-foreground rounded-full border border-border/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Key Features */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/20">
                        {(locale === 'zh' ? product.keyFeaturesZh : product.keyFeaturesEn).map((feature, idx) => (
                          <span key={idx} className="text-[9px] font-bold text-primary/60 uppercase tracking-tighter">
                            • {feature}
                          </span>
                        ))}
                      </div>

                      <div className="pt-6 mt-auto flex items-center justify-between gap-4">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs font-bold tracking-tighter group/btn">
                          {t.viewDetails} <ArrowRight className="ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-xl h-9 w-9 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all">
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
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-primary">
                    {t.noResults}
                  </h4>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    {locale === 'zh' ? "请尝试调整您的搜索或筛选条件。" : "Try adjusting your search or filters."}
                  </p>
                </div>
                <Button onClick={() => { setSearchQuery(''); setSelectedCategoryId(null); setSelectedTag(null); }} variant="link" className="text-primary font-bold">
                  Clear all filters
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
