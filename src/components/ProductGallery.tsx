
"use client";

import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";

export function ProductGallery({ locale }: { locale: Locale }) {
  const t = translations[locale].products;
  
  const products = [
    { id: 'product-aio', label: t.aio, desc: locale === 'en' ? 'Desktop integration redefined.' : '重新定义桌面集成。' },
    { id: 'product-minipc', label: t.minipc, desc: locale === 'en' ? 'Power in tiny form factor.' : '极致尺寸，强劲动力。' },
    { id: 'product-monitor', label: t.monitor, desc: locale === 'en' ? 'Industrial grade visual clarity.' : '工业级视觉清晰度。' },
    { id: 'product-kiosk', label: t.kiosk, desc: locale === 'en' ? 'Empowering self-service.' : '赋能自助服务领域。' },
  ];

  return (
    <section id="products" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} centered />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const imgData = PlaceHolderImages.find(img => img.id === product.id);
            return (
              <div 
                key={product.id}
                className="group flex flex-col bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden animate-fade-in-up border border-border/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container with 11:9 Aspect Ratio */}
                <div className="relative aspect-[11/9] w-full overflow-hidden">
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
                <div className="p-8 flex flex-col items-center justify-center flex-grow">
                  <h3 className="text-xl md:text-2xl font-headline font-bold text-primary text-center leading-tight">
                    {product.label}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
