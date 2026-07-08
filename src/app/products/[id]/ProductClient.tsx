'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  ArrowRight,
  Star,
  ShieldCheck,
  Download,
  Mail,
  ChevronRight,
  ChevronLeft,
  Globe,
  Zap,
  Phone,
  Loader2,
  Play,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/image-utils';
import { useTranslations } from '@/hooks/use-translations';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useInquiry } from '@/components/providers/InquiryProvider';
import { HoverVideoPlayer } from '@/components/HoverVideoPlayer';
import { injectTranslations } from '@/lib/translation-injector';

const isVideoUrl = (url: string) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);
};

const SYSTEM_FALLBACKS: Record<string, Record<string, string>> = {
  nav_home: { zh: '首页', en: 'Home', id: 'Beranda', vi: 'Trang chủ' },
  nav_products: { zh: '产品中心', en: 'Products', id: 'Produk', vi: 'Sản phẩm' },
  core_advantages: { zh: '核心优势', en: 'Core Advantages', id: 'Keunggulan Utama', vi: 'Ưu thế cốt lõi' },
  product_contact_now: { zh: '立即咨询', en: 'Contact Now', id: 'Hubungi Sekarang', vi: 'Liên hệ ngay' },
  product_spec_sheet: { zh: '下载规格表', en: 'Download Spec Sheet', id: 'Unduh Lembar Spek', vi: 'Tải thông số' },
  nav_contact: { zh: '联系我们', en: 'Contact Us', id: 'Hubungi Kami', vi: 'Liên hệ chúng tôi' },
  product_tab_desc: { zh: '产品详情', en: 'Description', id: 'Deskripsi', vi: 'Chi tiết sản phẩm' },
  product_tab_specs: { zh: '技术参数', en: 'Specifications', id: 'Spesifikasi', vi: 'Thông số kỹ thuật' },
  related_products_title: { zh: '相关产品', en: 'Related Products', id: 'Produk Terkait', vi: 'Sản phẩm liên quan' },
  explore_more_tech: { zh: '探索更多高端科技', en: 'Explore more high-end technology', id: 'Jelajahi lebih banyak teknologi kelas atas', vi: 'Khám phá thêm công nghệ cao cấp' },
  view_all: { zh: '查看全部', en: 'View All', id: 'Lihat Semua', vi: 'Xem tất cả' }
};

export default function ProductClient({ product, initialLocale }: { product: any, initialLocale: Locale }) {
  const searchParams = useSearchParams();
  const { openInquiry } = useInquiry();

  // Synchronous detectLocale to avoid secondary rendering pass and prevent Hydration Mismatch
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const [mounted, setMounted] = useState(false);
  const [productUrl, setProductUrl] = useState('');
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: 'image' | 'video' }>(() => {
    return {
      url: product?.mainImageUrl || '',
      type: isVideoUrl(product?.mainImageUrl || '') ? 'video' : 'image'
    };
  });
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [sanitizedDetails, setSanitizedDetails] = useState('');

  useEffect(() => {
    setMounted(true);
    setProductUrl(window.location.href);

    // 挂载后再把匹配成功的语种存入 local storage 和 Cookie
    if (typeof window !== 'undefined') {
      localStorage.setItem('heovose-locale', locale);
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; // 1 year
    }
  }, [locale]);

  useEffect(() => {
    if (product?.mainImageUrl) {
      setActiveMedia({
        url: product.mainImageUrl,
        type: isVideoUrl(product.mainImageUrl) ? 'video' : 'image'
      });
    }
  }, [product?.mainImageUrl]);

  const { data: categories } = useLocalCollection<any>('productCategories');
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  const { data: siteConfig } = useLocalDoc<any>('settings', 'site');
  const { t: tr } = useTranslations(locale);

  // 校验解析出的翻译内容是否是系统级翻译 Key 或是无有效内容的英文 Key。
  // 如果是 Key 模式（如大写且含下划线，或含有前缀等），直接判定为未翻译，返回空。
  const isTranslationKey = (val: any, textId?: string): boolean => {
    if (typeof val !== 'string' || !val) return false;
    const clean = val.trim();
    if (textId && clean === textId) return true;
    
    // 如果是系统正式翻译ID（以 biz_tr_ 或 spec_ 开头），它不是硬编码的系统语言Key占位符，而是待匹配的多语言文本，不应该判定为Key
    if (/^(biz_tr_|spec_)/i.test(clean)) return false;
    if (textId && /^(biz_tr_|spec_)/i.test(textId)) return false;
    
    // 匹配系统预设规则：大写字母+下划线，或者特定前缀
    if (/^[A-Z0-9_]{3,}$/.test(clean)) return true;
    if (/^(PROD|SPEC|CAT|MAP|ABOUT|NAV|SYS|SERVICE|PROCESS|CASES|ADV)_/i.test(clean)) return true;
    return false;
  };

  const sanitizeVal = (val: any, textId?: string) => {
    if (isTranslationKey(val, textId)) return '';
    return val || '';
  };

  // 本地翻译兜底逻辑，服务于 SSR 和首次渲染，防止没有接口数据时显示空白
  const getProductText = (textId: string, textObj: any) => {
    if (!textId) return '';

    if (textObj) {
      let content = textObj.content || textObj;
      if (typeof content === 'string') {
        try { content = JSON.parse(content); } catch { content = {}; }
      }
      if (content && typeof content === 'object') {
        if (content.content && typeof content.content === 'object' && !Array.isArray(content.content)) {
          content = content.content;
        }
        if (content[locale] !== undefined && content[locale] !== null && content[locale] !== '') {
          return sanitizeVal(content[locale], textId);
        }
        if (locale === 'vi' && content['vn'] !== undefined && content['vn'] !== null && content['vn'] !== '') {
          return sanitizeVal(content['vn'], textId);
        }
        if (locale === 'vn' && content['vi'] !== undefined && content['vi'] !== null && content['vi'] !== '') {
          return sanitizeVal(content['vi'], textId);
        }
      }
      if (textObj[locale] !== undefined && textObj[locale] !== null && textObj[locale] !== '') {
        return sanitizeVal(textObj[locale], textId);
      }
      if (locale === 'vi' && textObj['vn'] !== undefined && textObj['vn'] !== null && textObj['vn'] !== '') {
        return sanitizeVal(textObj['vn'], textId);
      }
      if (locale === 'vn' && textObj['vi'] !== undefined && textObj['vi'] !== null && textObj['vi'] !== '') {
        return sanitizeVal(textObj['vi'], textId);
      }
      const fallbackVal = textObj.en || textObj.zh || '';
      return sanitizeVal(fallbackVal, textId);
    }
    const fromGlobal = tr(textId);
    if (fromGlobal && !isTranslationKey(fromGlobal)) return fromGlobal;
    return '';
  };

  const specTranslationMap = useMemo(() => {
    const map = new Map<string, any>();
    if (product?.specTranslations && Array.isArray(product.specTranslations)) {
      product.specTranslations.forEach((t: any) => {
        if (t && t.id) {
          map.set(t.id, t);
        }
      });
    }
    return map;
  }, [product]);

  const getSpecText = (textId: string) => {
    if (!textId) return '';
    const translationObj = specTranslationMap.get(textId);
    if (translationObj) {
      return getProductText(textId, translationObj);
    }
    const fromGlobal = tr(textId);
    if (fromGlobal && fromGlobal !== textId && !isTranslationKey(fromGlobal)) return fromGlobal;
    
    // 如果是类似 spec_ / biz_tr_ 等 ID 格式，但前台未能成功关联对应的多语言词条对象：
    // 我们也尽力将这个文本作为 ID 进行原样或全局缓存返回，不直接过滤丢弃
    return textId;
  };

  const getSystemText = (key: string) => {
    const fromDb = tr(key);
    if (fromDb) return fromDb;
    const fallback = SYSTEM_FALLBACKS[key];
    if (fallback) {
      return fallback[locale] || fallback['en'] || '';
    }
    return key;
  };

  const companyEmail = tr('COMPANY_EMAIL') || 'sales@heovose.com';
  const companyPhone = tr('COMPANY_PHONE') || '+86 0755 1234';

  // 动态将该产品及其分类和规格的翻译按需注入全局缓存
  useEffect(() => {
    if (product) {
      const translations = [
        product.nameText,
        product.descriptionText,
        product.category?.nameText,
        product.category?.descriptionText,
        ...(product.specTranslations || [])
      ].filter(Boolean);
      injectTranslations(locale, translations);
    }
  }, [product, locale]);

  const productDetails = useMemo(() => {
    if (!product?.localizedDetails) return '';
    let details = product.localizedDetails;
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch (e) {
        console.error('Failed to parse localizedDetails JSON:', e);
        return '';
      }
    }
    const content = details?.[locale] || details?.['en'] || details?.['zh'] || '';
    const plainText = content.replace(/<[^>]*>?/gm, '').trim();
    if (!plainText) return '';

    // Process all img tags inside the rich-text details using getAssetUrl
    // to dynamically resolve local/private storage hosts into correct asset URLs
    const processedHtml = content.replace(/<img\s+([^>]*?)src="([^"]*?)"([^>]*?)>/gi, (match: string, before: string, src: string, after: string) => {
      return `<img ${before}src="${getAssetUrl(src)}"${after}>`;
    });

    return processedHtml;
  }, [product, locale]);

  useEffect(() => {
    if (productDetails) {
      import('dompurify').then((DOMPurifyModule) => {
        const DOMPurify = DOMPurifyModule.default || DOMPurifyModule;
        setSanitizedDetails(DOMPurify.sanitize(productDetails));
      }).catch((err) => {
        console.error('Failed to load DOMPurify', err);
        setSanitizedDetails('');
      });
    } else {
      setSanitizedDetails('');
    }
  }, [productDetails]);

  const categoryName = useMemo(() => {
    if (!product) return '';
    // 优先采用产品自带的分类多语言实体，满足 SSR 阶段渲染
    const cat = product.category;
    if (cat) {
      return getProductText(cat.nameTextId, cat.nameText);
    }
    const found = categories?.find((c: any) => c.id === product.categoryId);
    return found ? getProductText(found.nameTextId, found.nameText) : '';
  }, [product, categories, locale, tr]);

  const advantages = useMemo(() => {
    const desc = getProductText(product?.descriptionTextId, product?.descriptionText);
    if (!desc) return [];
    return desc.split(/\r?\n/).map((line: string) => line.trim()).filter((line: string) => line.length > 0);
  }, [product, locale, tr]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [product.mainImageUrl, ...(product.galleryImageUrls || [])].filter(Boolean) as string[];
  }, [product]);

  const zoomImages = useMemo(() => {
    return galleryImages.filter(img => !isVideoUrl(img));
  }, [galleryImages]);

  const currentZoomIndex = useMemo(() => {
    return zoomImages.indexOf(activeMedia.url);
  }, [zoomImages, activeMedia.url]);

  useEffect(() => {
    if (!isZoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomOpen(false);
        setZoomScale(1);
      } else if (e.key === 'ArrowLeft' && currentZoomIndex > 0) {
        setActiveMedia({ url: zoomImages[currentZoomIndex - 1], type: 'image' });
        setZoomScale(1);
      } else if (e.key === 'ArrowRight' && currentZoomIndex < zoomImages.length - 1) {
        setActiveMedia({ url: zoomImages[currentZoomIndex + 1], type: 'image' });
        setZoomScale(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen, currentZoomIndex, zoomImages]);

  const { data: relatedProducts } = useLocalCollection<any>(product?.id ? `products/${product.id}/related` : null);

  // 注入推荐产品的翻译数据
  useEffect(() => {
    if (relatedProducts && Array.isArray(relatedProducts)) {
      const trans = relatedProducts.flatMap((p: any) => [p.nameText, p.descriptionText].filter(Boolean));
      injectTranslations(locale, trans);
    }
  }, [relatedProducts, locale]);

  const displayRelatedProducts = useMemo(() => {
    return relatedProducts || [];
  }, [relatedProducts]);

  const parsedSpecs = useMemo(() => {
    if (!product?.specGroups) return { groups: [], orderedFootnotes: [], unorderedFootnotes: [] };
    let specGroupsArray = product.specGroups;
    if (typeof specGroupsArray === 'string') {
      try {
        specGroupsArray = JSON.parse(specGroupsArray);
      } catch (e) {
        console.error('Failed to parse specGroups JSON:', e);
        return { groups: [], orderedFootnotes: [], unorderedFootnotes: [] };
      }
    }
    if (!Array.isArray(specGroupsArray)) return { groups: [], orderedFootnotes: [], unorderedFootnotes: [] };

    const orderedList: string[] = [];
    const unorderedList: string[] = [];

    const getOrderedIndex = (content: string) => {
      const idx = orderedList.indexOf(content);
      if (idx !== -1) return idx + 1;
      orderedList.push(content);
      return orderedList.length;
    };

    const getUnorderedAsterisks = (content: string) => {
      let idx = unorderedList.indexOf(content);
      if (idx === -1) {
        unorderedList.push(content);
        idx = unorderedList.length - 1;
      }
      return '*'.repeat(idx + 1);
    };

    const processText = (text: string) => {
      if (!text) return '';
      
      // 1. Process Ordered Footnotes [[content]]
      let result = text.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
        const footnoteContent = (p1 || '').trim();
        if (!footnoteContent) return '';
        const num = getOrderedIndex(footnoteContent);
        return `<sup class="text-amber-500 font-bold ml-0.5 select-none">[${num}]</sup>`;
      });

      // 2. Process Unordered Footnotes {{content}}
      result = result.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
        const footnoteContent = (p1 || '').trim();
        if (!footnoteContent) return '';
        const asterisks = getUnorderedAsterisks(footnoteContent);
        return `<sup class="text-amber-500 font-black ml-0.5 select-none">${asterisks}</sup>`;
      });

      return result;
    };

    const groups = specGroupsArray.map((group: any) => ({
      title: processText(getSpecText(group.titleId) || ''),
      footnote: getSpecText(group.footnoteId),
      items: (group.items || []).map((item: any) => {
        const label = processText(getSpecText(item.labelId) || '');
        const value = processText(getSpecText(item.valueId) || '');
        return { label, value };
      }).filter((i: any) => (i.label && i.label.trim() !== '') || (i.value && i.value.trim() !== ''))
    })).filter((g: any) => g.title && g.items.length > 0);

    return { groups, orderedFootnotes: orderedList, unorderedFootnotes: unorderedList };
  }, [product, locale, tr, specTranslationMap]);

  const groupedSpecs = parsedSpecs.groups;

  const jsonLd = useMemo(() => {
    if (!product) return null;
    const productName = getProductText(product.nameTextId, product.nameText);
    const productDesc = product.descriptionTextId ? getProductText(product.descriptionTextId, product.descriptionText) : '';

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": productName,
      "image": product.mainImageUrl ? [getAssetUrl(product.mainImageUrl)] : [],
      "description": productDesc,
      "sku": product.id,
      "mpn": product.id,
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "0",
        "highPrice": "0",
        "offerCount": "1",
        "price": "0",
        "url": productUrl,
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Heovose Elevate"
        }
      }
    };
  }, [product, locale, productUrl]);

  return (
    <main className="min-h-screen bg-background">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Navbar locale={locale} setLocale={setLocale} />

      <div className="pt-32 pb-20 no-print">
        <div className="container mx-auto px-6">
          {/* Print Only Header */}
          <div className="print-header hidden print:flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
            <span className="text-xl font-bold tracking-widest text-primary">HEOVOSE ELEVATE</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Product Specification</span>
          </div>
          <nav className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest mb-12 no-print">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300">
              <Globe className="h-3 w-3" />
              {getSystemText('nav_home')}
            </Link>
            <ChevronRight className="h-3 w-3 text-primary/20" />
            <Link href="/products" className="text-muted-foreground hover:text-primary transition-all duration-300">
              {getSystemText('nav_products')}
            </Link>
            <ChevronRight className="h-3 w-3 text-primary/20" />
            <span className="text-primary truncate max-w-[120px] sm:max-w-[200px] md:max-w-[350px] inline-block align-bottom" title={getProductText(product.nameTextId, product.nameText)}>
              {getProductText(product.nameTextId, product.nameText)}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-[11/9] bg-muted/20 rounded-[2.5rem] overflow-hidden border border-border/40 shadow-inner group flex items-center justify-center">
                {activeMedia.type === 'video' ? (
                  <video
                    src={getAssetUrl(activeMedia.url)}
                    controls
                    autoPlay
                    playsInline
                    muted
                    onEnded={() => {
                      if (product?.mainImageUrl) {
                        setActiveMedia({
                          url: product.mainImageUrl,
                          type: isVideoUrl(product.mainImageUrl) ? 'video' : 'image'
                        });
                      }
                    }}
                    className="w-full h-full object-cover rounded-[2.5rem]"
                  />
                ) : (
                  <Image
                    src={getAssetUrl(activeMedia.url || product.mainImageUrl || '/image/product-placeholder.png')}
                    alt={getProductText(product.nameTextId, product.nameText)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                    className="object-cover premium-zoom-image cursor-zoom-in"
                    onClick={() => setIsZoomOpen(true)}
                  />
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 no-print">
                {[product.mainImageUrl, ...(product.galleryImageUrls || [])].filter(Boolean).map((img, idx) => {
                  const isVid = isVideoUrl(img);
                  const isActive = activeMedia.url === img;

                  return (
                    <button
                      key={`img-${idx}`}
                      onClick={() => setActiveMedia({ url: img, type: isVid ? 'video' : 'image' })}
                      className={cn(
                        "relative aspect-[11/9] rounded-2xl overflow-hidden border-2 bg-muted/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center group/media-thumb",
                        isActive ? "border-primary" : "border-transparent hover:border-primary/40"
                      )}
                    >
                      {isVid ? (
                        <>
                          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            <Image src={getAssetUrl(product.mainImageUrl || '/image/product-placeholder.png')} alt="Video Thumbnail" fill sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw" className="object-cover opacity-60" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover/media-thumb:scale-110 transition-transform duration-300">
                              <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <Image src={getAssetUrl(img || '/image/product-placeholder.png')} alt="Thumbnail" fill sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw" className="object-cover" />
                      )}
                    </button>
                  );
                })}

                {product.videoUrl && ![product.mainImageUrl, ...(product.galleryImageUrls || [])].filter(Boolean).includes(product.videoUrl) && (
                  <button
                    onClick={() => setActiveMedia({ url: product.videoUrl, type: 'video' })}
                    className={cn(
                      "relative aspect-[11/9] rounded-2xl overflow-hidden border-2 bg-muted/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center group/vid-thumb",
                      activeMedia.type === 'video' && activeMedia.url === product.videoUrl ? "border-primary" : "border-transparent hover:border-primary/40"
                    )}
                  >
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                      <Image src={getAssetUrl(product.mainImageUrl || '/image/product-placeholder.png')} alt="Video Thumbnail" fill sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw" className="object-cover opacity-60 animate-fade-in" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover/vid-thumb:scale-110 transition-transform duration-300">
                        <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Print Only Gallery Grid (Images only) */}
              {galleryImages.filter(img => !isVideoUrl(img)).length > 0 && (
                <div className="hidden print:grid grid-cols-3 gap-4 mt-4">
                  {galleryImages.filter(img => !isVideoUrl(img)).map((img, idx) => (
                    <div key={idx} className="relative aspect-[11/9] border border-slate-200 rounded-2xl overflow-hidden bg-muted/5">
                      <Image src={getAssetUrl(img)} alt="Product Gallery" fill sizes="(max-width: 768px) 33vw, 25vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

            </div>


            <div className="lg:col-span-5 flex flex-col space-y-10">
              <div className="space-y-4">
                {categoryName && (
                  <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                    {categoryName}
                  </Badge>
                )}
                <h1 className="text-4xl font-headline font-bold leading-tight text-primary">{getProductText(product.nameTextId, product.nameText)}</h1>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">{getSystemText('core_advantages')}</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {advantages.map((adv: string, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-3 bg-muted/20 rounded-2xl border border-border/20">
                      <Star className="h-5 w-5 mt-0.5 shrink-0 text-primary fill-primary/10" />
                      <span className="text-sm text-muted-foreground font-medium whitespace-pre-wrap">{adv}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 no-print">
                <Button
                  onClick={() => openInquiry({
                    productId: product.id,
                    productName: getProductText(product.nameTextId, product.nameText)
                  })}
                  className="h-16 min-h-16 px-10 rounded-2xl text-base font-bold flex-1 shadow-xl"
                >
                  {getSystemText('product_contact_now')} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button onClick={() => window.print()} variant="outline" className="h-16 min-h-16 px-8 rounded-2xl"><Download className="mr-2 h-5 w-5" />{getSystemText('product_spec_sheet')}</Button>
              </div>

              <div className="pt-8 border-t border-border/40 no-print">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{getSystemText('nav_contact')}</span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    <a href={`mailto:${companyEmail}`} className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                      <Mail className="h-4 w-4 opacity-40" /> {companyEmail}
                    </a>
                    <a href={`tel:${companyPhone}`} className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                      <Phone className="h-4 w-4 opacity-40" /> {companyPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-slate-100 no-print">
        <div className="container mx-auto px-6 py-24 max-w-[1200px]">
          <Tabs defaultValue={productDetails ? "desc" : "specs"} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 border-b border-slate-100 w-full justify-start gap-12 rounded-none mb-16 no-print">
              {productDetails && <TabsTrigger value="desc" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-6 text-sm font-bold text-slate-400 data-[state=active]:text-primary transition-all tracking-widest">{getSystemText('product_tab_desc')}</TabsTrigger>}
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-6 text-sm font-bold text-slate-400 data-[state=active]:text-primary transition-all tracking-widest">{getSystemText('product_tab_specs')}</TabsTrigger>
            </TabsList>

            {productDetails && (
              <TabsContent value="desc" forceMount className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 data-[state=inactive]:hidden print:data-[state=inactive]:block">
                <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedDetails }} />
              </TabsContent>
            )}
            <TabsContent value="specs" forceMount className="animate-in fade-in slide-in-from-bottom-4 duration-700 data-[state=inactive]:hidden print:data-[state=inactive]:block">
              <div className="space-y-16">
                {groupedSpecs.map((group: any, gIdx: number) => (
                  <div key={gIdx} className="space-y-8">
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-headline font-bold text-primary shrink-0" dangerouslySetInnerHTML={{ __html: group.title }} />
                      <div className="h-px bg-border flex-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.items.map((item: any, iIdx: number) => (
                        <div key={iIdx} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col gap-3 group/spec">
                          <span className="text-xs font-bold tracking-[0.1em] text-slate-400 group-hover/spec:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: item.label }} />
                          <span className="text-sm font-normal text-slate-900 font-['JetBrains_Mono'] leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: item.value }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {(parsedSpecs.orderedFootnotes.length > 0 || parsedSpecs.unorderedFootnotes.length > 0) && (
                  <div className="mt-16 pt-8 border-t border-slate-100 space-y-3 no-print">
                    <div className="space-y-3">
                      {parsedSpecs.unorderedFootnotes.map((fn, idx) => (
                        <p key={idx} className="text-xs text-slate-400/90 font-mono flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-500 font-bold shrink-0 select-none">{'*'.repeat(idx + 1)}</span>
                          <span>{fn}</span>
                        </p>
                      ))}
                      {parsedSpecs.orderedFootnotes.map((fn, idx) => (
                        <p key={idx} className="text-xs text-slate-400/90 font-mono flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-500 font-bold shrink-0 select-none">[{idx + 1}]</span>
                          <span>{fn}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {displayRelatedProducts.length > 0 && (
            <div className="mt-40 space-y-12 no-print">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-headline font-bold text-primary uppercase tracking-tight">{getSystemText('related_products_title')}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{getSystemText('explore_more_tech')}</p>
                </div>
                <div className="h-px bg-slate-100 flex-1 mx-12 hidden md:block" />
                <Link href="/products" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-all">
                  {getSystemText('view_all')}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {displayRelatedProducts.map((p: any) => {
                  const cat = categories?.find((c: any) => c.id === p.categoryId);
                  return (
                    <Link key={p.id} href={`/products/${p.id}?lang=${locale}`} className="group space-y-4">
                      <div className="relative aspect-[11/9] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10">
                        <HoverVideoPlayer
                          productId={p.id}
                          videoUrl={p.videoUrl}
                          mainImageUrl={p.mainImageUrl}
                          alt={getProductText(p.nameTextId, p.nameText)}
                        />
                      </div>
                      <div className="space-y-1 px-1">
                        <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest truncate">
                          {cat ? getProductText(cat.nameTextId, cat.nameText) : ''}
                        </p>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{getProductText(p.nameTextId, p.nameText)}</h4>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer locale={locale} />
      {/* High-quality Zoom overlay modal */}
      {isZoomOpen && activeMedia.type === 'image' && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => { setIsZoomOpen(false); setZoomScale(1); }}
        >
          {/* Bottom controls: Prev, Current/Total, Next */}
          <div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-6 bg-white/10 border border-white/10 px-3 py-3 rounded-full backdrop-blur-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Left Button */}
            <button
              disabled={currentZoomIndex === 0}
              onClick={() => {
                if (currentZoomIndex > 0) {
                  setActiveMedia({ url: zoomImages[currentZoomIndex - 1], type: 'image' });
                  setZoomScale(1);
                }
              }}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 text-white active:scale-90 cursor-pointer",
                currentZoomIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10"
              )}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Index Display */}
            <span className="text-white/80 font-mono text-xs font-bold tracking-widest select-none">
              {currentZoomIndex + 1} <span className="text-white/30 mx-1">/</span> {zoomImages.length}
            </span>

            {/* Right Button */}
            <button
              disabled={currentZoomIndex === zoomImages.length - 1}
              onClick={() => {
                if (currentZoomIndex < zoomImages.length - 1) {
                  setActiveMedia({ url: zoomImages[currentZoomIndex + 1], type: 'image' });
                  setZoomScale(1);
                }
              }}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 text-white active:scale-90 cursor-pointer",
                currentZoomIndex === zoomImages.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10"
              )}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="absolute top-6 right-6 flex items-center gap-4" onClick={e => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
              onClick={() => setZoomScale(s => Math.min(3, s + 0.25))}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
              onClick={() => setZoomScale(s => Math.max(0.5, s - 0.25))}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
              onClick={() => { setIsZoomOpen(false); setZoomScale(1); }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative w-[90vw] h-[80vh] flex items-center justify-center overflow-auto pointer-events-none">
            <div
              className="relative transition-transform duration-300 ease-out pointer-events-auto"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <img
                src={getAssetUrl(activeMedia.url || product.mainImageUrl || '/image/product-placeholder.png')}
                alt="Product Zoom"
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Print-only layout */}
      <div className="hidden print:block print-layout">
        {/* Page 1 */}
        <div className="print-page page-1 flex flex-col justify-between">
          <div>
            {/* Print Header */}
            <div className="print-header flex items-center justify-between border-b-2 border-primary pb-3 mb-6">
              {siteConfig?.logoStandard ? (
                <img src={getAssetUrl(siteConfig.logoStandard)} alt="Logo" className="h-8 object-contain" />
              ) : (
                <span className="text-lg font-bold tracking-widest text-primary">HEOVOSE ELEVATE</span>
              )}
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{getProductText(product.nameTextId, product.nameText)}</span>
            </div>

            {/* Product Title on print */}
            <div className="mb-6">
              {categoryName && (
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{categoryName}</span>
              )}
              <h1 className="text-2xl font-bold text-slate-900 mt-1">{getProductText(product.nameTextId, product.nameText)}</h1>
            </div>

            {/* Main Image */}
            <div className="relative aspect-[16/10] max-w-[580px] mx-auto overflow-hidden mb-4">
              <img src={getAssetUrl(product.mainImageUrl || '/image/product-placeholder.png')} alt="Product Main" className="w-full h-full object-cover rounded-xl" />
            </div>

            {/* Gallery Images (other than mainImage, max 2 rows, max 12 images) */}
            {product.galleryImageUrls && product.galleryImageUrls.filter((img: string) => img !== product.mainImageUrl && !isVideoUrl(img)).length > 0 && (
              <div className="grid grid-cols-6 gap-2 mb-4">
                {product.galleryImageUrls
                  .filter((img: string) => img !== product.mainImageUrl && !isVideoUrl(img))
                  .slice(0, 12) // Limit to 12 images (2 rows of 6)
                  .map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-[11/9] overflow-hidden rounded-lg">
                      <img src={getAssetUrl(img)} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
              </div>
            )}

            {/* Core Advantages */}
            {advantages.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">{getSystemText('core_advantages')}</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {advantages.map((adv: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 py-1.5">
                      <Star className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary fill-primary/10" />
                      <span className="text-xs text-slate-600 font-medium whitespace-pre-wrap">{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page 2: Specifications */}
        <div className="print-page page-2 page-break-before-always">
          {/* Print Header */}
          <div className="print-header flex items-center justify-between border-b-2 border-primary pb-3 mb-6">
            {siteConfig?.logoStandard ? (
              <img src={getAssetUrl(siteConfig.logoStandard)} alt="Logo" className="h-8 object-contain" />
            ) : (
              <span className="text-lg font-bold tracking-widest text-primary">HEOVOSE ELEVATE</span>
            )}
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{getProductText(product.nameTextId, product.nameText)}</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              {getSystemText('product_tab_specs')}
            </h2>
            <div className="space-y-6">
              {groupedSpecs.map((group: any, gIdx: number) => (
                <div key={gIdx} className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 border-l-4 border-primary pl-2" dangerouslySetInnerHTML={{ __html: group.title }} />
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 mx-[50px]">
                    {group.items.map((item: any, iIdx: number) => (
                      <div key={iIdx} className="flex justify-between p-3 bg-white text-xs gap-6">
                        <span className="font-medium text-slate-500 shrink-0" dangerouslySetInnerHTML={{ __html: item.label }} />
                        <span className="font-bold text-slate-900 text-right pl-6 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: item.value }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {(parsedSpecs.orderedFootnotes.length > 0 || parsedSpecs.unorderedFootnotes.length > 0) && (
              <div className="mt-8 pt-6 border-t border-slate-200 space-y-1.5 mx-[50px]">
                <div className="space-y-1.5">
                  {parsedSpecs.unorderedFootnotes.map((fn, idx) => (
                    <p key={idx} className="text-[10px] text-slate-400 font-mono flex items-start gap-1.5 leading-relaxed">
                      <span className="text-amber-500 font-bold shrink-0 select-none">{'*'.repeat(idx + 1)}</span>
                      <span>{fn}</span>
                    </p>
                  ))}
                  {parsedSpecs.orderedFootnotes.map((fn, idx) => (
                    <p key={idx} className="text-[10px] text-slate-400 font-mono flex items-start gap-1.5 leading-relaxed">
                      <span className="text-amber-500 font-bold shrink-0 select-none">[{idx + 1}]</span>
                      <span>{fn}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
