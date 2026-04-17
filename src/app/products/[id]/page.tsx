
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
  ChevronRight,
  Maximize2,
  Box,
  Settings,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

// 扩展后的多分组规格模型
interface SpecField {
  labelEn: string;
  labelZh: string;
  value: string;
}

interface SpecGroup {
  categoryEn: string;
  categoryZh: string;
  fields: SpecField[];
}

const MOCK_PRODUCTS = [
  {
    id: 'p1',
    line: 'wholesale',
    nameEn: 'Heovose H24 Pro AIO',
    nameZh: 'Heovose H24 Pro 一体机',
    taglineEn: 'The Ultimate Workspace Integration',
    taglineZh: '终极办公空间集成方案',
    descriptionEn: 'The Heovose H24 Pro is a masterpiece of modern engineering, combining powerful Intel Core processing with a stunning 23.8-inch borderless display.',
    descriptionZh: 'Heovose H24 Pro 是现代工程的杰作，将强大的英特尔酷睿处理器与令人惊叹的 23.8 英寸无边框显示屏相结合。',
    primaryImageUrl: 'https://picsum.photos/seed/aio1/1200/900',
    galleryImageUrls: [
      'https://picsum.photos/seed/aio-side/1200/900',
      'https://picsum.photos/seed/aio-back/1200/900',
      'https://picsum.photos/seed/aio-desk/1200/900',
    ],
    keyFeaturesEn: [
      'Intel Core i7 12th Gen Processor',
      '23.8" Full HD IPS Borderless Display',
      'Dual Storage Support',
      'High-Speed Wi-Fi 6'
    ],
    keyFeaturesZh: [
      '第12代英特尔酷睿 i7 处理器',
      '23.8英寸全高清 IPS 无边框显示屏',
      '支持双硬盘存储',
      '高速 Wi-Fi 6'
    ],
    specGroups: [
      {
        categoryEn: 'PC (X86) Parameters',
        categoryZh: 'PC (X86) 参数',
        fields: [
          { labelEn: 'CPU', labelZh: '中央处理器', value: 'Intel Celeron / Core i3 / i5 / i7' },
          { labelEn: 'RAM', labelZh: '内存', value: 'DDR4/DDR5 (Up to 64GB)' },
          { labelEn: 'Hard disk', labelZh: '硬盘', value: 'SSD / HDD Options' },
          { labelEn: 'Graphics card', labelZh: '显卡', value: 'Integrated / Dedicated GPU' },
          { labelEn: 'Extendable', labelZh: '扩展接口', value: 'TDP+M-KEY' },
          { labelEn: 'System', labelZh: '操作系统', value: 'Win7 / Win10 / Win11 / Linux' },
        ]
      },
      {
        categoryEn: 'Display Parameters',
        categoryZh: '显示参数',
        fields: [
          { labelEn: 'Screen type', labelZh: '屏幕类型', value: 'LED LCD Screen (Class A)' },
          { labelEn: 'Size', labelZh: '尺寸', value: '23.8 inch (16:9)' },
          { labelEn: 'Resolution', labelZh: '分辨率', value: '1920x1080 (HD)' },
          { labelEn: 'Brightness', labelZh: '亮度', value: '≥ 250 cd/m²' },
          { labelEn: 'Contrast', labelZh: '对比度', value: '1000:1' },
          { labelEn: 'Refresh rate', labelZh: '刷新率', value: '60Hz / 144Hz' },
          { labelEn: 'Viewing angle', labelZh: '可视角度', value: 'Horizontal 178°, Vertical 178°' },
          { labelEn: 'Service life', labelZh: '使用寿命', value: '> 50000 Hours' },
        ]
      },
      {
        categoryEn: 'Working environment',
        categoryZh: '工作环境',
        fields: [
          { labelEn: 'Operating temperature', labelZh: '工作温度', value: '0°C ~ 50°C' },
          { labelEn: 'Working humidity', labelZh: '工作湿度', value: '10% ~ 90%' },
          { labelEn: 'Storage temperature', labelZh: '存储温度', value: '-10°C ~ 60°C' },
        ]
      },
      {
        categoryEn: 'Physical Parameters',
        categoryZh: '物理参数',
        fields: [
          { labelEn: 'Screen size', labelZh: '显示区域', value: '527.0 mm (H) x 296.4 mm (V)' },
          { labelEn: 'Overall size', labelZh: '整体尺寸', value: '540 mm (W) x 320 mm (H) x 45 mm (D)' },
          { labelEn: 'Weight', labelZh: '重量', value: '4.5 kg' },
        ]
      }
    ],
    structureDiagrams: [
      'https://picsum.photos/seed/diagram1/1000/600',
      'https://picsum.photos/seed/diagram2/1000/600',
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
    descriptionEn: 'A versatile, rugged self-service kiosk platform built for 24/7 high-traffic environments.',
    descriptionZh: '一个多功能、耐用的自助服务终端平台，专为 24/7 高流量环境构建。',
    primaryImageUrl: 'https://picsum.photos/seed/kiosk1/1200/900',
    galleryImageUrls: [
      'https://picsum.photos/seed/kiosk-module/1200/900',
      'https://picsum.photos/seed/kiosk-payment/1200/900',
    ],
    keyFeaturesEn: [
      'Modular POS Integration',
      'Industrial Thermal Printer',
      'High-Sensitivity IR Touch',
      'Reinforced Security'
    ],
    keyFeaturesZh: [
      '模块化 POS 集成',
      '工业级热敏打印机',
      '高灵敏度红外触摸',
      '加强型安全锁'
    ],
    specGroups: [
      {
        categoryEn: 'Touch Screen Parameters',
        categoryZh: '触摸屏参数',
        fields: [
          { labelEn: 'Touch screen type', labelZh: '触摸屏类型', value: 'Projected Capacitive Technology' },
          { labelEn: 'Response time', labelZh: '响应时间', value: '< 8ms' },
          { labelEn: 'Touch points', labelZh: '触摸点数', value: 'Standard 10-point touch' },
          { labelEn: 'Surface hardness', labelZh: '表面硬度', value: 'Physical tempered Mohr 7 explosion-proof glass' },
          { labelEn: 'OS Compatibility', labelZh: '系统兼容', value: 'Windows / Linux / Android' },
        ]
      },
      {
        categoryEn: 'Power Parameters',
        categoryZh: '电源参数',
        fields: [
          { labelEn: 'Input power', labelZh: '输入电压', value: '110-240V ~ 50/60Hz' },
          { labelEn: 'Machine consumption', labelZh: '整机功耗', value: '≤ 60W' },
          { labelEn: 'Standby consumption', labelZh: '待机功耗', value: '≤ 1W' },
        ]
      }
    ],
    structureDiagrams: [
      'https://picsum.photos/seed/diagram-kiosk/1000/800',
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
    ? { bg: 'bg-primary', text: 'text-primary', border: 'border-primary', badge: 'bg-primary/10 text-primary', light: 'bg-primary/5' }
    : { bg: 'bg-[#F97316]', text: 'text-[#F97316]', border: 'border-[#F97316]', badge: 'bg-[#F97316]/10 text-[#F97316]', light: 'bg-[#F97316]/5' };

  const isZh = locale === 'zh';

  return (
    <main className="min-h-screen bg-background">
      <Navbar locale={locale} setLocale={setLocale} />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-12">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            <ChevronRight className="h-3 w-3" />
            <span className={lineTheme.text}>{isZh ? product.nameZh : product.nameEn}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left: Media Gallery */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-[4/3] bg-muted/20 rounded-[2.5rem] overflow-hidden border border-border/40 shadow-inner group">
                <Image
                  src={activeImage || product.primaryImageUrl}
                  alt="Product Image"
                  fill
                  className="object-contain p-8 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-8 left-8">
                   <Badge className={cn("px-5 py-1.5 rounded-full uppercase text-[10px] font-bold border-none", isWholesale ? "bg-primary text-white" : "bg-[#F97316] text-white")}>
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
                      "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-muted/10",
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
                <div className="pt-4 flex items-center gap-4">
                   <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-muted/50 overflow-hidden relative">
                         <Image src={`https://picsum.photos/seed/user${i}/80/80`} alt="User" fill className="object-cover" />
                       </div>
                     ))}
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm font-bold">50+ Global Implementations</span>
                     <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Trusted by Industry Leaders</span>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                   <ShieldCheck className={cn("h-5 w-5", lineTheme.text)} />
                   <span className="text-xs font-bold uppercase tracking-[0.2em]">Core Advantages</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {(isZh ? product.keyFeaturesZh : product.keyFeaturesEn).map((feat, idx) => (
                     <div key={idx} className="flex items-start gap-4 p-5 bg-muted/20 rounded-2xl border border-border/20 group hover:bg-muted/40 transition-colors">
                       <CheckCircle2 className={cn("h-5 w-5 mt-0.5 shrink-0 transition-transform group-hover:scale-125", lineTheme.text)} />
                       <span className="text-sm text-muted-foreground font-medium">{feat}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                 <Button className={cn("h-16 px-10 rounded-2xl text-base font-bold flex-1 transition-all hover:scale-[1.02] shadow-xl", lineTheme.bg)}>
                   {isZh ? '立即咨询' : 'Inquiry Now'} <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
                 <Button variant="outline" className="h-16 px-8 rounded-2xl border-border/60 hover:bg-muted/50 group">
                   <Download className="mr-2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                   {isZh ? '技术规格书' : 'Datasheet'}
                 </Button>
              </div>

              <div className="pt-8 border-t border-border/40">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Support</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-primary">
                        <Mail className="h-4 w-4 opacity-40" /> sales@heovose.com
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Business Line</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-primary">
                        <Zap className="h-4 w-4 opacity-40" /> +86 0755 1234
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Bottom Content: Detailed Specs Grid */}
          <div className="mt-32">
            <Tabs defaultValue="specs" className="w-full">
              <TabsList className="bg-transparent h-auto p-0 border-b border-border/40 w-full justify-start gap-12 rounded-none mb-16 overflow-x-auto no-scrollbar">
                <TabsTrigger 
                  value="specs" 
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-6 text-sm font-bold tracking-[0.2em] uppercase transition-all"
                >
                  Technical Specifications
                </TabsTrigger>
                <TabsTrigger 
                  value="desc" 
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-6 text-sm font-bold tracking-[0.2em] uppercase transition-all"
                >
                  Detailed Description
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="specs" className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {product.specGroups?.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-8">
                    {/* 分组标题 */}
                    <div className="flex items-center gap-6">
                      <h3 className={cn("text-xl md:text-2xl font-headline font-bold whitespace-nowrap", lineTheme.text)}>
                        {isZh ? group.categoryZh : group.categoryEn}
                      </h3>
                      <div className="h-px bg-border/60 flex-1" />
                    </div>

                    {/* 参数网格 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                      {group.fields.map((field, fIdx) => (
                        <div key={fIdx} className="group space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 group-hover:text-primary transition-colors block">
                            {isZh ? field.labelZh : field.labelEn}
                          </span>
                          <div className={cn("p-4 rounded-xl border border-border/30 group-hover:shadow-md transition-all", lineTheme.light)}>
                             <span className="text-base font-bold text-foreground">
                               {field.value}
                             </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* 产品结构图区域 */}
                {product.structureDiagrams && product.structureDiagrams.length > 0 && (
                  <div className="space-y-10 pt-10 border-t border-border/40">
                    <div className="flex items-center gap-6">
                      <h3 className={cn("text-xl md:text-2xl font-headline font-bold whitespace-nowrap", lineTheme.text)}>
                        {isZh ? '产品结构图' : 'Machine Structure Diagrams'}
                      </h3>
                      <div className="h-px bg-border/60 flex-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {product.structureDiagrams.map((diagram, idx) => (
                        <div key={idx} className="relative aspect-video bg-white border border-border/40 rounded-[2rem] overflow-hidden group">
                           <Image 
                            src={diagram} 
                            alt="Structure Diagram" 
                            fill 
                            className="object-contain p-8 group-hover:scale-105 transition-transform duration-700" 
                           />
                           <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                               <Maximize2 className="h-4 w-4" />
                             </Button>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="desc" className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="prose prose-slate max-w-none space-y-12">
                  <p className="text-xl text-muted-foreground leading-relaxed font-light italic border-l-4 border-accent pl-8">
                    {isZh ? product.descriptionZh : product.descriptionEn}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg">
                          <Image src="https://picsum.photos/seed/tech-detail-1/800/600" alt="Tech" fill className="object-cover" />
                        </div>
                        <h4 className="text-lg font-bold">Industrial Grade Reliability</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Engineered for 24/7 continuous operation in challenging environments, featuring advanced thermal management and robust electronic components.
                        </p>
                     </div>
                     <div className="space-y-6">
                        <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg">
                          <Image src="https://picsum.photos/seed/tech-detail-2/800/600" alt="Tech" fill className="object-cover" />
                        </div>
                        <h4 className="text-lg font-bold">Cutting-edge Integration</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Seamlessly integrates into your existing infrastructure with modular interfaces and standardized mounting solutions.
                        </p>
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
