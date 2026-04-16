
"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Locale, translations } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Monitor, 
  Zap, 
  ShieldCheck, 
  Download, 
  Mail, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

// 本地模拟数据 - 扩展版
const MOCK_PRODUCTS = [
  {
    id: 'p1',
    line: 'wholesale',
    nameEn: 'Heovose H24 Pro AIO',
    nameZh: 'Heovose H24 Pro 一体机',
    taglineEn: 'The Ultimate Workspace Integration',
    taglineZh: '终极办公空间集成方案',
    descriptionEn: 'The Heovose H24 Pro is a masterpiece of modern engineering, combining powerful Intel Core processing with a stunning 23.8-inch borderless display. Designed for enterprise environments where aesthetics and performance meet.',
    descriptionZh: 'Heovose H24 Pro 是现代工程的杰作，将强大的英特尔酷睿处理器与令人惊叹的 23.8 英寸无边框显示屏相结合。专为追求美学与性能并存的企业环境而设计。',
    primaryImageUrl: 'https://picsum.photos/seed/aio1/1200/900',
    galleryImageUrls: [
      'https://picsum.photos/seed/aio-side/1200/900',
      'https://picsum.photos/seed/aio-back/1200/900',
      'https://picsum.photos/seed/aio-desk/1200/900',
    ],
    keyFeaturesEn: [
      'Intel Core i7 12th Gen Processor',
      '23.8" Full HD IPS Borderless Display',
      'Dual Storage (SSD + HDD) Support',
      'High-Speed Wi-Fi 6 & Bluetooth 5.2'
    ],
    keyFeaturesZh: [
      '第12代英特尔酷睿 i7 处理器',
      '23.8英寸全高清 IPS 无边框显示屏',
      '支持双硬盘存储 (SSD + HDD)',
      '高速 Wi-Fi 6 和蓝牙 5.2'
    ],
    specifications: [
      { labelEn: 'CPU', labelZh: '处理器', value: 'Intel Core i7-12700' },
      { labelEn: 'RAM', labelZh: '内存', value: '16GB DDR4 (Up to 64GB)' },
      { labelEn: 'Storage', labelZh: '存储', value: '512GB NVMe SSD' },
      { labelEn: 'Display', labelZh: '显示屏', value: '23.8" 1920x1080 IPS' },
      { labelEn: 'Graphics', labelZh: '显卡', value: 'Intel UHD Graphics 770' },
      { labelEn: 'OS', labelZh: '操作系统', value: 'Windows 11 Pro' },
    ],
    status: 'active'
  },
  {
    id: 'p2',
    line: 'project',
    nameEn: 'Smart Retail Kiosk MK-II',
    nameZh: '智能零售终端 MK-II',
    taglineEn: 'Revolutionizing Self-Service Customer Experience',
    taglineZh: '重塑自助服务客户体验',
    descriptionEn: 'A versatile, rugged self-service kiosk platform built for 24/7 high-traffic environments. Featuring integrated payment modules, industrial-grade thermal printing, and a modular design for easy maintenance.',
    descriptionZh: '一个多功能、耐用的自助服务终端平台，专为 24/7 高流量环境构建。具有集成支付模块、工业级热敏打印以及易于维护的模块化设计。',
    primaryImageUrl: 'https://picsum.photos/seed/kiosk1/1200/900',
    galleryImageUrls: [
      'https://picsum.photos/seed/kiosk-module/1200/900',
      'https://picsum.photos/seed/kiosk-payment/1200/900',
      'https://picsum.photos/seed/kiosk-indoor/1200/900',
    ],
    keyFeaturesEn: [
      'Modular POS Integration',
      'Industrial Thermal Receipt Printer',
      'High-Sensitivity IR Touch Screen',
      'Reinforced Security Lock System'
    ],
    keyFeaturesZh: [
      '模块化 POS 集成',
      '工业级热敏票据打印机',
      '高灵敏度红外触摸屏',
      '加强型安全锁系统'
    ],
    specifications: [
      { labelEn: 'Touch Panel', labelZh: '触摸面板', value: '21.5" Capacitive Touch' },
      { labelEn: 'Printer', labelZh: '打印机', value: '80mm Thermal w/ Auto-cutter' },
      { labelEn: 'Reader', labelZh: '读卡器', value: 'EMV & NFC Certified' },
      { labelEn: 'Processor', labelZh: '处理器', value: 'Industrial J6412 Quad Core' },
      { labelEn: 'Casing', labelZh: '外壳', value: 'Cold-rolled Steel' },
    ],
    status: 'active'
  }
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const [locale, setLocale] = useState<Locale>('en');
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const product = useMemo(() => {
    return MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  }, [id]);

  useEffect(() => {
    if (product) setActiveImage(product.primaryImageUrl);
  }, [product]);

  const t = translations[locale];
  const isWholesale = product.line === 'wholesale';
  const lineTheme = isWholesale 
    ? { bg: 'bg-primary', text: 'text-primary', border: 'border-primary', badge: 'bg-primary/10 text-primary' }
    : { bg: 'bg-[#F97316]', text: 'text-[#F97316]', border: 'border-[#F97316]', badge: 'bg-[#F97316]/10 text-[#F97316]' };

  const isZh = locale === 'zh';

  return (
    <main className="min-h-screen bg-background">
      <Navbar locale={locale} setLocale={setLocale} />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-12">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            <ChevronRight className="h-3 w-3" />
            <span className={lineTheme.text}>{isZh ? product.nameZh : product.nameEn}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left: Media Gallery */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-[4/3] bg-muted/20 rounded-[2rem] overflow-hidden border border-border/40 shadow-inner group">
                <Image
                  src={activeImage || product.primaryImageUrl}
                  alt="Product Image"
                  fill
                  className="object-contain p-8 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6">
                   <Badge className={cn("px-4 py-1 rounded-full uppercase text-[10px] font-bold", isWholesale ? "bg-primary text-white" : "bg-[#F97316] text-white")}>
                      {isWholesale ? (isZh ? '批发产品线' : 'Wholesale') : (isZh ? '定制项目线' : 'Project Solution')}
                   </Badge>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[product.primaryImageUrl, ...product.galleryImageUrls].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all",
                      activeImage === img ? lineTheme.border : "border-transparent hover:border-muted"
                    )}
                  >
                    <Image src={img} alt="Thumb" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="lg:col-span-5 flex flex-col space-y-10">
              <div className="space-y-4">
                <h1 className={cn("text-4xl md:text-5xl font-headline font-bold leading-tight", lineTheme.text)}>
                  {isZh ? product.nameZh : product.nameEn}
                </h1>
                <p className="text-xl text-muted-foreground font-light italic">
                  {isZh ? product.taglineZh : product.taglineEn}
                </p>
                <div className="pt-4 flex items-center gap-3">
                   <div className="flex -space-x-2">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-muted animate-pulse" />
                     ))}
                   </div>
                   <span className="text-xs text-muted-foreground font-medium">50+ Projects Implemented</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                   <ShieldCheck className={cn("h-5 w-5", lineTheme.text)} />
                   <span className="text-sm font-bold uppercase tracking-tighter">Key Highights</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {(isZh ? product.keyFeaturesZh : product.keyFeaturesEn).map((feat, idx) => (
                     <div key={idx} className="flex items-start gap-3 p-4 bg-muted/30 rounded-2xl border border-border/20">
                       <CheckCircle2 className={cn("h-5 w-5 mt-0.5", lineTheme.text)} />
                       <span className="text-sm text-muted-foreground font-medium">{feat}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                 <Button className={cn("h-14 px-10 rounded-2xl text-base font-bold flex-1", lineTheme.bg)}>
                   {isZh ? '立即咨询' : 'Inquiry Now'} <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
                 <Button variant="outline" className="h-14 px-8 rounded-2xl border-border/60 hover:bg-muted/50 group">
                   <Download className="mr-2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                   {isZh ? '下载规格书' : 'Datasheet'}
                 </Button>
              </div>

              <div className="pt-8 border-t border-border/40">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Support</span>
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Mail className="h-4 w-4 opacity-40" /> sales@heovose.com
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Direct Line</span>
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Zap className="h-4 w-4 opacity-40" /> +86 0755 1234
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Bottom Content: Specs & Description */}
          <div className="mt-32">
            <Tabs defaultValue="specs" className="w-full">
              <TabsList className="bg-transparent h-auto p-0 border-b border-border/40 w-full justify-start gap-8 rounded-none mb-12">
                <TabsTrigger 
                  value="specs" 
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-4 text-sm font-bold tracking-widest uppercase transition-all"
                >
                  Technical Specifications
                </TabsTrigger>
                <TabsTrigger 
                  value="desc" 
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-4 text-sm font-bold tracking-widest uppercase transition-all"
                >
                  Detailed Description
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="specs">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="flex flex-col p-6 bg-white border border-border/40 rounded-3xl hover:shadow-lg transition-shadow">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        {isZh ? spec.labelZh : spec.labelEn}
                      </span>
                      <span className="text-lg font-headline font-bold text-primary">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="desc" className="max-w-4xl">
                <div className="prose prose-slate max-w-none space-y-6">
                  <p className="text-xl text-muted-foreground leading-relaxed font-light">
                    {isZh ? product.descriptionZh : product.descriptionEn}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                     <div className="relative aspect-video rounded-3xl overflow-hidden bg-muted/20">
                       <Image src="https://picsum.photos/seed/tech1/800/600" alt="Tech" fill className="object-cover" />
                     </div>
                     <div className="relative aspect-video rounded-3xl overflow-hidden bg-muted/20">
                       <Image src="https://picsum.photos/seed/tech2/800/600" alt="Tech" fill className="object-cover" />
                     </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer locale={locale} />
    </main>
  );
}
