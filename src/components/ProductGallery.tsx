
"use client";

import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ProductGallery({ locale }: { locale: Locale }) {
  const t = translations[locale].products;
  
  const products = [
    { 
      id: 'product-aio', 
      label: t.aio, 
      desc: locale === 'en' ? 'Sleek, powerful desktop integration for modern workspaces.' : '专为现代办公空间设计的强劲一体化桌面方案。' 
    },
    { 
      id: 'product-minipc', 
      label: t.minipc, 
      desc: locale === 'en' ? 'Ultra-compact performance for edge computing and business.' : '适用于边缘计算和商业应用的高性能迷你电脑。' 
    },
    { 
      id: 'product-monitor', 
      label: t.monitor, 
      desc: locale === 'en' ? 'Rugged industrial displays built for 24/7 durability.' : '专为 24/7 全天候运行设计的耐用工业级显示器。' 
    },
    { 
      id: 'product-kiosk', 
      label: t.kiosk, 
      desc: locale === 'en' ? 'Smart self-service terminals for retail and hospitality.' : '适用于零售和酒店业的高性能智能自助服务终端。' 
    },
  ];

  return (
    <section id="products" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} centered />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const imgData = PlaceHolderImages.find(img => img.id === product.id);
            return (
              <div 
                key={product.id}
                className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden animate-fade-in-up border border-border/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container with 11:9 Aspect Ratio */}
                <div className="relative aspect-[11/9] w-full overflow-hidden bg-muted/20">
                  {imgData?.imageUrl && (
                    <Image
                      src={imgData.imageUrl}
                      alt={product.label}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      data-ai-hint={imgData.imageHint}
                    />
                  )}
                </div>
                
                {/* Content Container */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="space-y-3 mb-6 flex-grow">
                    <h3 className="text-xl font-headline font-bold text-primary leading-tight">
                      {product.label}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.desc}
                    </p>
                  </div>
                  
                  <Button variant="outline" className="w-full justify-between group/btn border-primary/20 hover:bg-primary hover:text-white transition-all duration-300">
                    {t.learnMore}
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
