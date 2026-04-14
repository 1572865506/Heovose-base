
"use client";

import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { Card, CardContent } from "@/components/ui/card";

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
        <SectionHeading title={t.title} subtitle={t.subtitle} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const imgData = PlaceHolderImages.find(img => img.id === product.id);
            return (
              <Card 
                key={product.id}
                className="group overflow-hidden border-none bg-white/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 rounded-3xl animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {imgData?.imageUrl && (
                    <Image
                      src={imgData.imageUrl}
                      alt={product.label}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      data-ai-hint={imgData.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <p className="text-white/80 text-sm">{product.desc}</p>
                  </div>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-headline font-bold text-primary group-hover:text-accent transition-colors">
                    {product.label}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
