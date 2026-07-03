
"use client";

import { useState, useEffect } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminTabs, AdminTabsList, AdminTabsTrigger, AdminTabsContent } from '@/components/admin/AdminTabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import {
  Home,
  Save,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Film,
  Video,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  LayoutGrid,
  Edit3,
  Info,
  GripVertical,
  RectangleHorizontal,
  RectangleVertical,
  Square
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '@/hooks/use-toast';
import { smartTranslate } from '@/lib/translate-client';
import { cn } from '@/lib/utils';
import { ShinyButton } from '@/components/ui/shiny-button';
import { AdminFormSection } from '@/components/admin/AdminFormSection';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';
import { getAssetUrl } from '@/lib/image-utils';
import Image from 'next/image';

const isVideoUrl = (url: string | undefined | null) => {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
  return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
};

// AI 极光渐变定义组件
const AiGradientDef = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="ai-aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stopColor="#06B6D4" offset="0%">
          <animate attributeName="stop-color" values="#06B6D4;#4F46E5;#06B6D4" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#4F46E5" offset="33%">
          <animate attributeName="stop-color" values="#4F46E5;#D946EF;#4F46E5" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#D946EF" offset="66%">
          <animate attributeName="stop-color" values="#D946EF;#F43F5E;#D946EF" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#F43F5E" offset="100%">
          <animate attributeName="stop-color" values="#F43F5E;#06B6D4;#F43F5E" dur="4s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
  </svg>
);

// Sortable Item Component for Bento Grid
function SortableBentoItem({ item, onEdit, onDelete }: { item: any, onEdit: () => void, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-card/70 backdrop-blur-md rounded-[2rem] border border-border/60 p-3 hover:border-primary/40 hover:bg-card transition-all duration-500 shadow-sm",
        isDragging && "shadow-2xl ring-2 ring-primary/20 scale-105"
      )}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-inner bg-muted/20">
        {item.imageUrl ? (
          <Image src={getAssetUrl(item.imageUrl)} alt={item.titleZh} fill className="object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
            <ImageIcon className="h-8 w-8 opacity-20" />
          </div>
        )}

        {/* Drag Handle Overlay */}
        <div
          {...attributes}
          {...listeners}
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing z-20"
        >
          <div className="bg-card/90 p-2 rounded-full shadow-lg border border-border transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>
        </div>

        {/* Order Badge */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-card/95 backdrop-blur-md border border-border flex items-center justify-center text-[9px] font-bold text-primary shadow-sm z-10">
          {item.order}
        </div>

        {/* Size Badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur-sm text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg z-10 flex items-center gap-1.5 border border-white/10 uppercase tracking-tighter">
          {item.gridSize === 'wide' ? (
            <><RectangleHorizontal className="h-2.5 w-2.5 text-primary-foreground/70" /> 2×1</>
          ) : item.gridSize === 'tall' ? (
            <><RectangleVertical className="h-2.5 w-2.5 text-primary-foreground/70" /> 1×2</>
          ) : item.gridSize === 'large' ? (
            <><Square className="h-2.5 w-2.5 text-primary-foreground/70" /> 2×2</>
          ) : (
            <><Square className="h-2 w-2 text-primary-foreground/70 opacity-60" /> 1×1</>
          )}
        </div>
      </div>

      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest truncate flex-1">{item.tagZh || '无标签'}</p>
          <div className="flex gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <h4 className="text-xs font-bold text-foreground line-clamp-1">{item.titleZh}</h4>
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  const { toast } = useToast();
  const { data: heroData, isLoading: isHeroLoading, mutate: mutateHero } = useLocalDoc<any>('homepageContent', 'hero');
  const { data: videoData, isLoading: isVideoLoading, mutate: mutateVideo } = useLocalDoc<any>('homepageContent', 'video');
  const { data: bentoData, isLoading: isBentoLoading, mutate: mutateBento } = useLocalDoc<any>('homepageContent', 'bento');
  const { data: galleryData, isLoading: isGalleryLoading, mutate: mutateGallery } = useLocalDoc<any>('homepageContent', 'gallery');
  const { data: bentoItems, mutate: mutateBentoItems } = useLocalCollection<any>('bentoItems');
  const { data: aiConfig, isLoading: isAiLoading } = useLocalDoc<any>('settings', 'ai');
  const { data: categories, isLoading: isCatLoading } = useLocalCollection<any>('productCategories');
  const { data: translations, isLoading: isTransLoading, mutate: mutateTrans } = useLocalCollection<any>('localizedStrings?full=true');

  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [pickerConfig, setPickerConfig] = useState<{ open: boolean, type: 'slide' | 'video' | 'wholesale' | 'project' | 'bento' | 'gallery', slideIndex: number | null, bentoId?: string }>({ open: false, type: 'slide', slideIndex: null });

  // DnD Sensors for Grid Sorting

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (!bentoItems) return;
    const oldIndex = bentoItems.findIndex((item: any) => item.id === active.id);
    const newIndex = bentoItems.findIndex((item: any) => item.id === over.id);

    const newOrder = arrayMove(bentoItems, oldIndex, newIndex);

    // Sync with backend using the new batch reorder API
    try {
      const res = await fetch('/api/bentoItems/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: newOrder.map((item: any) => item.id)
        })
      });
      if (!res.ok) throw new Error('Sync failed');
      mutateBentoItems();
      toast({ title: "排序同步成功" });
    } catch (error) {
      toast({ variant: "destructive", title: "排序同步失败", description: "由于网络原因，排序可能未保存" });
      mutateBentoItems(); // Revert to server state
    }
  };

  // 统一加载状态管理，避免过度闪烁
  const isCoreLoading = isHeroLoading || isVideoLoading || isBentoLoading || isGalleryLoading;
  const isSecondaryLoading = isTransLoading || isCatLoading || isAiLoading;
  const isLoading = isCoreLoading && !isInitialized; // 仅在初始未同步前显示全屏加载

  const [formData, setFormData] = useState<any>({

    heroHeadlineZh: '',
    heroHeadlineEn: '',
    heroSubheadlineZh: '',
    heroSubheadlineEn: '',
    heroWholesaleButtonZh: '',
    heroWholesaleButtonEn: '',
    heroWholesaleDescriptionZh: '',
    heroWholesaleDescriptionEn: '',
    heroProjectButtonZh: '',
    heroProjectButtonEn: '',
    heroProjectDescriptionZh: '',
    heroProjectDescriptionEn: '',
    heroWholesaleCategoryId: '',
    heroProjectCategoryId: '',
    heroWholesaleBg: '',
    heroProjectBg: '',
    heroWholesaleLinkType: 'category',
    heroWholesaleLinkUrl: '',
    heroProjectLinkType: 'category',
    heroProjectLinkUrl: '',
    heroSlides: [],
    isVideoEnabled: true,
    videoTitleZh: '',
    videoTitleEn: '',
    videoSubtitleZh: '',
    videoSubtitleEn: '',
    videoUrl: '',
    bentoTitleZh: '',
    bentoTitleEn: '',
    bentoSubtitleZh: '',
    bentoSubtitleEn: '',
    galleryTitleZh: '',
    galleryTitleEn: '',
    gallerySubtitleZh: '',
    gallerySubtitleEn: '',
    galleryItems: []
  });

  const { data: allProducts } = useLocalCollection<any>('products');



  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [bentoDialog, setBentoDialog] = useState<{ open: boolean, item: any | null }>({ open: false, item: null });

  // 核心数据同步逻辑 - 增加稳定性保护
  useEffect(() => {
    if (!translations || isInitialized) return;

    // 只有当所有核心数据都尝试加载过（无论成功与否）才开始同步
    const coreDataLoaded = (heroData !== null || isHeroLoading === false) &&
      (videoData !== null || isVideoLoading === false) &&
      (bentoData !== null || isBentoLoading === false) &&
      (galleryData !== null || isGalleryLoading === false);

    if (!coreDataLoaded) return;

    const getTrans = (id: string, lang: string) => {
      if (!Array.isArray(translations)) return '';
      const entry = translations.find((t: any) => t.id === id);
      const content = (entry?.content as any) || {};
      return content[lang] || entry?.[lang] || '';
    };

    setFormData((prev: any) => {
      const updates = { ...prev };

      // 1. Hero Sync
      if (heroData) {
        updates.heroHeadlineZh = getTrans('hero_slide_default_headline', 'zh') || heroData.heroHeadlineZh || '';
        updates.heroHeadlineEn = getTrans('hero_slide_default_headline', 'en') || heroData.heroHeadlineEn || '';
        updates.heroSubheadlineZh = getTrans('hero_slide_default_subheadline', 'zh') || heroData.heroSubheadlineZh || '';
        updates.heroSubheadlineEn = getTrans('hero_slide_default_subheadline', 'en') || heroData.heroSubheadlineEn || '';
        updates.heroWholesaleButtonZh = getTrans('hero_wholesale_title', 'zh') || heroData.heroWholesaleButtonZh || '';
        updates.heroWholesaleButtonEn = getTrans('hero_wholesale_title', 'en') || heroData.heroWholesaleButtonEn || '';
        updates.heroWholesaleDescriptionZh = getTrans('hero_wholesale_desc', 'zh') || heroData.heroWholesaleDescriptionZh || '';
        updates.heroWholesaleDescriptionEn = getTrans('hero_wholesale_desc', 'en') || heroData.heroWholesaleDescriptionEn || '';
        updates.heroProjectButtonZh = getTrans('hero_project_title', 'zh') || heroData.heroProjectButtonZh || '';
        updates.heroProjectButtonEn = getTrans('hero_project_title', 'en') || heroData.heroProjectButtonEn || '';
        updates.heroProjectDescriptionZh = getTrans('hero_project_desc', 'zh') || heroData.heroProjectDescriptionZh || '';
        updates.heroProjectDescriptionEn = getTrans('hero_project_desc', 'en') || heroData.heroProjectDescriptionEn || '';
        updates.heroWholesaleCategoryId = heroData.heroWholesaleCategoryId || '';
        updates.heroProjectCategoryId = heroData.heroProjectCategoryId || '';
        updates.heroWholesaleBg = heroData.heroWholesaleBg || '';
        updates.heroProjectBg = heroData.heroProjectBg || '';
        updates.heroWholesaleLinkType = heroData.heroWholesaleLinkType || 'category';
        updates.heroWholesaleLinkUrl = heroData.heroWholesaleLinkUrl || '';
        updates.heroProjectLinkType = heroData.heroProjectLinkType || 'category';
        updates.heroProjectLinkUrl = heroData.heroProjectLinkUrl || '';

        if (Array.isArray(heroData.heroSlides)) {
          const sortedSlides = [...heroData.heroSlides].sort((a, b) => (a.priority || 0) - (b.priority || 0));
          updates.heroSlides = sortedSlides.map((slide: any) => {
            const sId = slide.id.replace(/^slide_/, '');
            return {
              ...slide,
              headlineZh: getTrans(`hero_slide_${sId}_headline`, 'zh') || slide.headlineZh,
              headlineEn: getTrans(`hero_slide_${sId}_headline`, 'en') || slide.headlineEn,
              subheadlineZh: getTrans(`hero_slide_${sId}_subheadline`, 'zh') || slide.subheadlineZh,
              subheadlineEn: getTrans(`hero_slide_${sId}_subheadline`, 'en') || slide.subheadlineEn,
            };
          });
        }
      }

      // 2. Video Sync
      if (videoData) {
        updates.isVideoEnabled = videoData.isVideoEnabled ?? true;
        updates.videoUrl = videoData.videoUrl || '';
        updates.videoTitleZh = getTrans('VIDEO_TITLE_1', 'zh') || videoData.videoTitleZh || '';
        updates.videoTitleEn = getTrans('VIDEO_TITLE_1', 'en') || videoData.videoTitleEn || '';
        updates.videoSubtitleZh = getTrans('VIDEO_TITLE_2', 'zh') || videoData.videoSubtitleZh || '';
        updates.videoSubtitleEn = getTrans('VIDEO_TITLE_2', 'en') || videoData.videoSubtitleEn || '';
      }

      // 3. Bento Sync
      if (bentoData) {
        updates.bentoTitleZh = getTrans('BENTO_TITLE', 'zh') || bentoData.bentoTitleZh || '';
        updates.bentoTitleEn = getTrans('BENTO_TITLE', 'en') || bentoData.bentoTitleEn || '';
        updates.bentoSubtitleZh = getTrans('BENTO_SUBTITLE', 'zh') || bentoData.bentoSubtitleZh || '';
        updates.bentoSubtitleEn = getTrans('BENTO_SUBTITLE', 'en') || bentoData.bentoSubtitleEn || '';
      }

      // 4. Gallery Sync
      if (galleryData) {
        updates.galleryTitleZh = getTrans('GALLERY_TITLE', 'zh') || galleryData.galleryTitleZh || '';
        updates.galleryTitleEn = getTrans('GALLERY_TITLE', 'en') || galleryData.galleryTitleEn || '';
        updates.gallerySubtitleZh = getTrans('GALLERY_SUBTITLE', 'zh') || galleryData.gallerySubtitleZh || '';
        updates.gallerySubtitleEn = getTrans('GALLERY_SUBTITLE', 'en') || galleryData.gallerySubtitleEn || '';
        updates.galleryItems = galleryData.galleryItems || [];
      }

      return updates;
    });

    setIsInitialized(true);
  }, [heroData, videoData, bentoData, galleryData, translations, isInitialized, isHeroLoading, isVideoLoading, isBentoLoading, isGalleryLoading]);


  const handleSave = async () => {
    setIsSaving(true);

    try {
      // 1. Prepare sequential save requests
      const heroRes = await fetch('/api/homepageContent/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroHeadlineZh: formData.heroHeadlineZh,
          heroHeadlineEn: formData.heroHeadlineEn,
          heroSubheadlineZh: formData.heroSubheadlineZh,
          heroSubheadlineEn: formData.heroSubheadlineEn,
          heroWholesaleCategoryId: formData.heroWholesaleCategoryId,
          heroProjectCategoryId: formData.heroProjectCategoryId,
          heroWholesaleBg: formData.heroWholesaleBg,
          heroProjectBg: formData.heroProjectBg,
          heroWholesaleLinkType: formData.heroWholesaleLinkType,
          heroWholesaleLinkUrl: formData.heroWholesaleLinkUrl,
          heroProjectLinkType: formData.heroProjectLinkType,
          heroProjectLinkUrl: formData.heroProjectLinkUrl,
          heroSlides: formData.heroSlides
        }),
      });

      const videoRes = await fetch('/api/homepageContent/video', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isVideoEnabled: formData.isVideoEnabled,
          videoTitleZh: formData.videoTitleZh,
          videoTitleEn: formData.videoTitleEn,
          videoSubtitleZh: formData.videoSubtitleZh,
          videoSubtitleEn: formData.videoSubtitleEn,
          videoUrl: formData.videoUrl,
        }),
      });

      const bentoRes = await fetch('/api/homepageContent/bento', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bentoTitleZh: formData.bentoTitleZh,
          bentoTitleEn: formData.bentoTitleEn,
          bentoSubtitleZh: formData.bentoSubtitleZh,
          bentoSubtitleEn: formData.bentoSubtitleEn,
        }),
      });

      const galleryRes = await fetch('/api/homepageContent/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryTitleZh: formData.galleryTitleZh,
          galleryTitleEn: formData.galleryTitleEn,
          gallerySubtitleZh: formData.gallerySubtitleZh,
          gallerySubtitleEn: formData.gallerySubtitleEn,
          galleryItems: formData.galleryItems
        }),
      });

      // 2. Prepare translation asset updates
      // 2. Prepare translation asset updates
      const translationUpdates = [
        { id: 'hero_wholesale_title', content: { zh: formData.heroWholesaleButtonZh, en: formData.heroWholesaleButtonEn } },
        { id: 'hero_wholesale_desc', content: { zh: formData.heroWholesaleDescriptionZh, en: formData.heroWholesaleDescriptionEn } },
        { id: 'hero_project_title', content: { zh: formData.heroProjectButtonZh, en: formData.heroProjectButtonEn } },
        { id: 'hero_project_desc', content: { zh: formData.heroProjectDescriptionZh, en: formData.heroProjectDescriptionEn } },
        { id: 'PRODUCTS_TITLE', content: { zh: formData.bentoTitleZh, en: formData.bentoTitleEn } },
        { id: 'PRODUCTS_SUBTITLE', content: { zh: formData.bentoSubtitleZh, en: formData.bentoSubtitleEn } },
        { id: 'GALLERY_TITLE', content: { zh: formData.galleryTitleZh, en: formData.galleryTitleEn } },
        { id: 'GALLERY_SUBTITLE', content: { zh: formData.gallerySubtitleZh, en: formData.gallerySubtitleEn } },
        ...formData.heroSlides.map((slide: any) => {
          const sId = slide.id.replace(/^slide_/, '');
          return [
            { id: `hero_slide_${sId}_headline`, content: { zh: slide.headlineZh, en: slide.headlineEn } },
            { id: `hero_slide_${sId}_subheadline`, content: { zh: slide.subheadlineZh, en: slide.subheadlineEn } }
          ];
        }).flat()
      ];

      const transResults = await Promise.all(
        translationUpdates.map(update =>
          fetch(`/api/localizedStrings/${encodeURIComponent(update.id)}`, {
            method: 'PUT', // The API handles upsert internally, but let's be safe
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: update.content }),
          }).then(r => ({ id: update.id, ok: r.ok }))
        )
      );

      const transFailed = transResults.filter(r => !r.ok);

      // Check core results
      if (!heroRes.ok) {
        const err = await heroRes.json().catch(() => ({}));
        throw new Error(`英雄视觉 (Hero) 保存失败: ${err.details || err.error || heroRes.statusText}`);
      }
      if (!videoRes.ok) {
        const err = await videoRes.json().catch(() => ({}));
        throw new Error(`视频模块保存失败: ${err.details || err.error || videoRes.statusText}`);
      }
      if (!bentoRes.ok) {
        const err = await bentoRes.json().catch(() => ({}));
        throw new Error(`Bento 布局文案保存失败: ${err.details || err.error || bentoRes.statusText}`);
      }
      if (!galleryRes.ok) {
        const err = await galleryRes.json().catch(() => ({}));
        throw new Error(`轮播板块配置保存失败: ${err.details || err.error || galleryRes.statusText}`);
      }

      mutateHero();
      mutateVideo();
      mutateBento();
      mutateGallery();
      mutateTrans();

      if (transFailed.length > 0) {
        toast({
          title: "配置已发布",
          description: `核心配置已更新，但有 ${transFailed.length} 个翻译词条未能同步`,
          className: "bg-amber-50 border-amber-200 text-amber-800 rounded-2xl"
        });
      } else {
        toast({
          title: "发布成功",
          description: "首页配置与翻译资产已全量同步",
          className: "bg-green-50 border-green-200 text-green-800 rounded-2xl"
        });
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "发布失败",
        description: error.message || "无法连接到服务器",
        className: "rounded-2xl"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTranslate = async (fields: { source: string, targetKey: string }[], localFormData = formData) => {
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 智译未启用" });
      return;
    }

    setIsAiProcessing(true);
    try {
      const updates: any = { ...localFormData };

      for (const field of fields) {
        // 如果中文为空，或者英文已有内容且不是占位符，则跳过
        if (!localFormData[field.source]) continue;
        if (localFormData[field.targetKey] && localFormData[field.targetKey].trim() !== '') continue;

        const res = await smartTranslate({
          text: localFormData[field.source] || '',
          targetLangs: ['en'],
          taskType: 'text'
        });
        if (res.en) updates[field.targetKey] = res.en;
      }

      // 翻译轮播图标题
      const translatedSlides = await Promise.all(localFormData.heroSlides.map(async (slide: any) => {
        const headlineNeeds = slide.headlineZh && (!slide.headlineEn || slide.headlineEn === 'New Headline');
        const subheadlineNeeds = slide.subheadlineZh && (!slide.subheadlineEn || slide.subheadlineEn === 'New Subheadline');

        let headlineEn = slide.headlineEn;
        let subheadlineEn = slide.subheadlineEn;

        if (headlineNeeds) {
          const res = await smartTranslate({ text: slide.headlineZh, targetLangs: ['en'], taskType: 'text' });
          if (res.en) headlineEn = res.en;
        }
        if (subheadlineNeeds) {
          const res = await smartTranslate({ text: slide.subheadlineZh, targetLangs: ['en'], taskType: 'text' });
          if (res.en) subheadlineEn = res.en;
        }

        return { ...slide, headlineEn, subheadlineEn };
      }));

      updates.heroSlides = translatedSlides;
      return updates;
    } catch (error: any) {
      toast({ variant: "destructive", title: "智译失败", description: error.message });
      return null;
    } finally {
      setIsAiProcessing(false);
    }
  };

  const addSlide = () => {
    const newSlide = {
      id: `slide_${Date.now()}`,
      headlineZh: '新标题',
      headlineEn: 'New Headline',
      subheadlineZh: '新副标题',
      subheadlineEn: 'New Subheadline',
      bgImage: "/image/hero-bg.png",
      mobileBgImage: "",
      linkType: 'custom',
      categoryId: null,
      linkUrl: '',
      priority: formData.heroSlides.length
    };
    setFormData({ ...formData, heroSlides: [...formData.heroSlides, newSlide] });
  };

  const removeSlide = (index: number) => {
    const newSlides = formData.heroSlides.filter((_: any, i: number) => i !== index);
    const updatedSlides = newSlides.map((slide: any, idx: number) => ({
      ...slide,
      priority: idx
    }));
    setFormData({ ...formData, heroSlides: updatedSlides });
  };

  const updateSlide = (index: number, updates: any) => {
    const newSlides = [...formData.heroSlides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setFormData({ ...formData, heroSlides: newSlides });
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...formData.heroSlides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    const updatedSlides = newSlides.map((slide: any, idx: number) => ({
      ...slide,
      priority: idx
    }));

    setFormData({ ...formData, heroSlides: updatedSlides });
  };

  const getCategoryName = (id: string) => {
    const cat = categories?.find((c: any) => c.id === id);
    if (!cat) return id;
    const trans = translations?.find((t: any) => t.id === cat.nameTextId);
    if (!trans) return id;
    const content = (trans.content as any) || {};
    return content.zh || (trans as any).zh || id;
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">载入配置中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <AiGradientDef />

      <AdminPageHeader
        title="首页视觉配置"
        subtitle="Management / Content / Home Visuals"
        icon={Home}
        actions={
          <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl h-12 px-8 gap-2.5 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            发布配置变更
          </Button>
        }
      />

      <AdminTabs defaultValue="hero" className="w-full">
        <AdminTabsList className="mb-8">
          <AdminTabsTrigger value="hero">
            <ImageIcon className="h-4 w-4" /> 英雄视觉 (Hero)
          </AdminTabsTrigger>
          <AdminTabsTrigger value="video">
            <Film className="h-4 w-4" /> 品牌故事 (Video)
          </AdminTabsTrigger>
          <AdminTabsTrigger value="bento">
            <LayoutGrid className="h-4 w-4" /> 产品布局 (Bento)
          </AdminTabsTrigger>
          <AdminTabsTrigger value="gallery">
            <Layers className="h-4 w-4" /> 产品轮播 (Gallery)
          </AdminTabsTrigger>
        </AdminTabsList>

        <AdminTabsContent value="hero" className="space-y-6">
          <AdminFormSection
            title="底部入口卡片配置"
            icon={Layers}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="p-5 rounded-2xl bg-muted/5 border border-dashed space-y-4">
                <span className="text-[10px] font-bold uppercase text-primary">批发入口按钮及描述 (ZH / EN)</span>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formData.heroWholesaleButtonZh} onChange={e => setFormData({ ...formData, heroWholesaleButtonZh: e.target.value })} placeholder="按钮中文" className="h-10 rounded-xl" />
                  <Input value={formData.heroWholesaleButtonEn} onChange={e => setFormData({ ...formData, heroWholesaleButtonEn: e.target.value })} placeholder="Button English" className="h-10 rounded-xl border-dashed" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formData.heroWholesaleDescriptionZh} onChange={e => setFormData({ ...formData, heroWholesaleDescriptionZh: e.target.value })} placeholder="描述中文" className="h-10 rounded-xl" />
                  <Input value={formData.heroWholesaleDescriptionEn} onChange={e => setFormData({ ...formData, heroWholesaleDescriptionEn: e.target.value })} placeholder="Desc English" className="h-10 rounded-xl border-dashed" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-3">
                    <Select
                      value={formData.heroWholesaleLinkType || 'category'}
                      onValueChange={v => {
                        if (v === 'category') {
                          setFormData({ ...formData, heroWholesaleLinkType: v, heroWholesaleLinkUrl: '' });
                        } else {
                          setFormData({ ...formData, heroWholesaleLinkType: v, heroWholesaleCategoryId: 'none' });
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 rounded-lg text-[10px]">
                        <SelectValue placeholder="链接类型" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="category" className="text-[10px]">跳转产品分类</SelectItem>
                        <SelectItem value="custom" className="text-[10px]">自定义链接</SelectItem>
                      </SelectContent>
                    </Select>

                    {formData.heroWholesaleLinkType === 'custom' ? (
                      <Input
                        value={formData.heroWholesaleLinkUrl || ''}
                        onChange={e => setFormData({ ...formData, heroWholesaleLinkUrl: e.target.value })}
                        placeholder="自定义链接 (如 /about)"
                        className="h-9 rounded-xl text-xs font-mono"
                      />
                    ) : (
                      <Select value={formData.heroWholesaleCategoryId} onValueChange={v => setFormData({ ...formData, heroWholesaleCategoryId: v })}>
                        <SelectTrigger className="h-9 rounded-xl"><SelectValue placeholder="选择跳转分类" /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="none">全部分类</SelectItem>
                          {categories?.map((cat: any) => <SelectItem key={cat.id} value={cat.id} className="text-xs">{getCategoryName(cat.id)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}

                    <Input
                      value={formData.heroWholesaleBg}
                      onChange={e => setFormData({ ...formData, heroWholesaleBg: e.target.value })}
                      placeholder="背景图 URL"
                      className="h-9 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div
                    className="w-24 h-24 rounded-xl bg-muted/20 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-primary/5 hover:border-primary transition-all overflow-hidden relative group/btn"
                    onClick={() => setPickerConfig({ open: true, type: 'wholesale', slideIndex: null })}
                  >
                    {formData.heroWholesaleBg ? (
                      <Image src={getAssetUrl(formData.heroWholesaleBg)} alt="W" fill className="object-cover" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 text-primary" />
                        <span className="text-[8px] font-bold text-primary">设置背景</span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center transition-opacity">
                      <ImageIcon className="text-white h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-muted/5 border border-dashed space-y-4">
                <span className="text-[10px] font-bold uppercase text-primary">项目入口按钮及描述 (ZH / EN)</span>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formData.heroProjectButtonZh} onChange={e => setFormData({ ...formData, heroProjectButtonZh: e.target.value })} placeholder="按钮中文" className="h-10 rounded-xl" />
                  <Input value={formData.heroProjectButtonEn} onChange={e => setFormData({ ...formData, heroProjectButtonEn: e.target.value })} placeholder="Button English" className="h-10 rounded-xl border-dashed" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={formData.heroProjectDescriptionZh} onChange={e => setFormData({ ...formData, heroProjectDescriptionZh: e.target.value })} placeholder="描述中文" className="h-10 rounded-xl" />
                  <Input value={formData.heroProjectDescriptionEn} onChange={e => setFormData({ ...formData, heroProjectDescriptionEn: e.target.value })} placeholder="Desc English" className="h-10 rounded-xl border-dashed" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-3">
                    <Select
                      value={formData.heroProjectLinkType || 'category'}
                      onValueChange={v => {
                        if (v === 'category') {
                          setFormData({ ...formData, heroProjectLinkType: v, heroProjectLinkUrl: '' });
                        } else {
                          setFormData({ ...formData, heroProjectLinkType: v, heroProjectCategoryId: 'none' });
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 rounded-lg text-[10px]">
                        <SelectValue placeholder="链接类型" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="category" className="text-[10px]">跳转产品分类</SelectItem>
                        <SelectItem value="custom" className="text-[10px]">自定义链接</SelectItem>
                      </SelectContent>
                    </Select>

                    {formData.heroProjectLinkType === 'custom' ? (
                      <Input
                        value={formData.heroProjectLinkUrl || ''}
                        onChange={e => setFormData({ ...formData, heroProjectLinkUrl: e.target.value })}
                        placeholder="自定义链接 (如 /about)"
                        className="h-9 rounded-xl text-xs font-mono"
                      />
                    ) : (
                      <Select value={formData.heroProjectCategoryId} onValueChange={v => setFormData({ ...formData, heroProjectCategoryId: v })}>
                        <SelectTrigger className="h-9 rounded-xl"><SelectValue placeholder="选择跳转分类" /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="none">全部分类</SelectItem>
                          {categories?.map((cat: any) => <SelectItem key={cat.id} value={cat.id} className="text-xs">{getCategoryName(cat.id)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}

                    <Input
                      value={formData.heroProjectBg}
                      onChange={e => setFormData({ ...formData, heroProjectBg: e.target.value })}
                      placeholder="背景图 URL"
                      className="h-9 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div
                    className="w-24 h-24 rounded-xl bg-muted/20 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-primary/5 hover:border-primary transition-all overflow-hidden relative group/btn"
                    onClick={() => setPickerConfig({ open: true, type: 'project', slideIndex: null })}
                  >
                    {formData.heroProjectBg ? (
                      <Image src={getAssetUrl(formData.heroProjectBg)} alt="P" fill className="object-cover" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 text-primary" />
                        <span className="text-[8px] font-bold text-primary">设置背景</span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center transition-opacity">
                      <ImageIcon className="text-white h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection
            title="英雄屏视觉卡片管理"
            subtitle="设置一张或多张背景卡片。多张卡片将自动启用轮播效果。"
            icon={ImageIcon}
            actions={
              <div className="flex gap-3">
                {aiConfig?.isEnabled && (
                  <ShinyButton
                    onClick={async () => {
                      const updates = await handleTranslate([
                        { source: 'heroWholesaleButtonZh', targetKey: 'heroWholesaleButtonEn' },
                        { source: 'heroWholesaleDescriptionZh', targetKey: 'heroWholesaleDescriptionEn' },
                        { source: 'heroProjectButtonZh', targetKey: 'heroProjectButtonEn' },
                        { source: 'heroProjectDescriptionZh', targetKey: 'heroProjectDescriptionEn' }
                      ]);
                      if (updates) setFormData({ ...formData, ...updates });
                    }}
                    disabled={isAiProcessing}
                    className="h-9 px-4"
                    shape="capsule"
                  >
                    <div className="flex items-center gap-2">
                      {isAiProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest">AI 智译</span>
                    </div>
                  </ShinyButton>
                )}
                <Button onClick={addSlide} size="sm" className="rounded-xl h-9 px-4 gap-2 text-[10px] font-bold uppercase tracking-wider shadow-md">
                  <Plus className="h-3.5 w-3.5" /> 添加新内容卡片
                </Button>
              </div>
            }
          >
            <div className="space-y-6">
              {formData.heroSlides.map((slide: any, index: number) => (
                <div key={slide.id} className="group relative bg-muted/10 border border-border/60 hover:bg-muted/20 hover:border-primary/30 rounded-3xl p-6 transition-all duration-500 shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase opacity-40 font-semibold">PC端海报 (16:9)</Label>
                        <div
                          className="relative aspect-[16/9] rounded-xl overflow-hidden cursor-pointer group/img border-2 border-transparent hover:border-primary transition-all shadow-md bg-muted/20"
                          onClick={() => setPickerConfig({ open: true, type: 'slide', slideIndex: index, field: 'bgImage' } as any)}
                        >
                          {slide.bgImage ? (
                            isVideoUrl(slide.bgImage) ? (
                              <video src={getAssetUrl(slide.bgImage)} className="object-cover w-full h-full" muted playsInline />
                            ) : (
                              <Image src={getAssetUrl(slide.bgImage)} alt="Preview" fill className="object-cover" unoptimized />
                            )
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30"><ImageIcon className="h-6 w-6" /></div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <ImageIcon className="text-white h-5 w-5" />
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-lg h-7 text-[8px] font-bold"
                          onClick={() => setPickerConfig({ open: true, type: 'slide', slideIndex: index, field: 'bgImage' } as any)}
                        >
                          更改PC端背景
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase opacity-40 font-semibold">移动端海报 (可选)</Label>
                        <div
                          className="relative aspect-[16/9] rounded-xl overflow-hidden cursor-pointer group/img border-2 border-transparent hover:border-primary transition-all shadow-md bg-muted/20"
                          onClick={() => setPickerConfig({ open: true, type: 'slide', slideIndex: index, field: 'mobileBgImage' } as any)}
                        >
                          {slide.mobileBgImage ? (
                            isVideoUrl(slide.mobileBgImage) ? (
                              <video src={getAssetUrl(slide.mobileBgImage)} className="object-cover w-full h-full" muted playsInline />
                            ) : (
                              <Image src={getAssetUrl(slide.mobileBgImage)} alt="Preview" fill className="object-cover" unoptimized />
                            )
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground/30 text-[8px] bg-muted/5">
                              <ImageIcon className="h-4 w-4" />
                              <span>默认展示PC海报</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <ImageIcon className="text-white h-5 w-5" />
                          </div>
                        </div>
                        {slide.mobileBgImage ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 rounded-lg h-7 text-[8px] font-bold"
                              onClick={() => setPickerConfig({ open: true, type: 'slide', slideIndex: index, field: 'mobileBgImage' } as any)}
                            >
                              更改背景
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-lg h-7 px-3 text-[8px] font-bold"
                              onClick={() => updateSlide(index, { mobileBgImage: '' })}
                            >
                              移除
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full rounded-lg h-7 text-[8px] font-bold"
                            onClick={() => setPickerConfig({ open: true, type: 'slide', slideIndex: index, field: 'mobileBgImage' } as any)}
                          >
                            更改移动端背景
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-7 grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase opacity-40">主标题 (ZH)</Label>
                          <Input
                            value={slide.headlineZh}
                            onChange={e => updateSlide(index, { headlineZh: e.target.value })}
                            className="rounded-xl h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase opacity-40">HEADLINE (EN)</Label>
                          <Input
                            value={slide.headlineEn}
                            onChange={e => updateSlide(index, { headlineEn: e.target.value })}
                            className="rounded-xl border-dashed h-9"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase opacity-40">副标题 (ZH)</Label>
                          <Input
                            value={slide.subheadlineZh}
                            onChange={e => updateSlide(index, { subheadlineZh: e.target.value })}
                            className="rounded-xl h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase opacity-40">SUBHEADLINE (EN)</Label>
                          <Input
                            value={slide.subheadlineEn}
                            onChange={e => updateSlide(index, { subheadlineEn: e.target.value })}
                            className="rounded-xl border-dashed h-9"
                          />
                        </div>
                      </div>

                      {/* 跳转链接配置 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-dashed border-border/60">
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold uppercase opacity-40">链接类型</Label>
                          <Select
                            value={slide.linkType || 'custom'}
                            onValueChange={v => {
                              if (v === 'category') {
                                updateSlide(index, { linkType: v, linkUrl: '' });
                              } else {
                                updateSlide(index, { linkType: v, categoryId: null });
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 rounded-lg text-[10px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="custom" className="text-[10px]">自定义链接</SelectItem>
                              <SelectItem value="category" className="text-[10px]">跳转产品分类</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(slide.linkType === 'category') ? (
                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-[9px] font-bold uppercase opacity-40">关联产品分类</Label>
                            <Select
                              value={slide.categoryId || undefined}
                              onValueChange={v => {
                                const cat = categories?.find((c: any) => c.id === v);
                                if (cat) {
                                  updateSlide(index, {
                                    categoryId: v,
                                    linkUrl: `products?category=${encodeURIComponent(cat.slug || cat.id)}`
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 rounded-lg text-[10px]">
                                <SelectValue placeholder="关联一个产品分类" />
                              </SelectTrigger>
                              <SelectContent className="rounded-lg">
                                {categories?.map((cat: any) => {
                                  const trans = translations?.find((t: any) => t.id === cat.nameTextId);
                                  const name = trans?.content?.zh || trans?.zh || cat.id;
                                  return <SelectItem key={cat.id} value={cat.id} className="text-xs">{name}</SelectItem>;
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-[9px] font-bold uppercase opacity-40">自定义链接</Label>
                            <Input
                              value={slide.linkUrl || ''}
                              onChange={e => updateSlide(index, { linkUrl: e.target.value })}
                              placeholder="如：/about, products?line=wholesale 等"
                              className="h-8 rounded-lg text-[10px] font-mono"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-1 flex flex-row lg:flex-col items-center justify-center gap-2 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-4 border-dashed">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === formData.heroSlides.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-destructive/40 hover:text-destructive hover:bg-destructive/5"
                        onClick={() => removeSlide(index)}
                        disabled={formData.heroSlides.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.heroSlides.length === 0 && (
              <div className="py-20 text-center bg-muted/5 border-2 border-dashed rounded-[2.5rem]">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">暂无内容卡片，请点击右上角添加</p>
              </div>
            )}
          </AdminFormSection>
        </AdminTabsContent>

        <AdminTabsContent value="video" className="space-y-6">
          <AdminFormSection
            title="视频/品牌故事模块配置"
            subtitle="开启或关闭全屏视频品牌故事模块，并配置文案与资源。"
            icon={Video}
            actions={
              <Switch
                checked={formData.isVideoEnabled}
                onCheckedChange={v => setFormData((prev: any) => ({ ...prev, isVideoEnabled: v }))}
              />
            }
          >
            {formData.isVideoEnabled && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Film className="h-4 w-4" /> 品牌故事滚动文案配置
                  </h3>
                  {aiConfig?.isEnabled && (
                    <ShinyButton
                      onClick={async () => {
                        const res = await smartTranslate({
                          text: formData.videoTitleZh,
                          targetLangs: ['en'],
                          taskType: 'text'
                        });
                        if (res.en) setFormData((prev: any) => ({ ...prev, videoTitleEn: res.en }));

                        const res2 = await smartTranslate({
                          text: formData.videoSubtitleZh,
                          targetLangs: ['en'],
                          taskType: 'text'
                        });
                        if (res2.en) setFormData((prev: any) => ({ ...prev, videoSubtitleEn: res2.en }));

                        toast({ title: "视频文案智译完成" });
                      }}
                      disabled={isAiProcessing}
                      className="h-9 px-4"
                      shape="capsule"
                    >
                      <div className="flex items-center gap-2">
                        {isAiProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">AI 智译</span>
                      </div>
                    </ShinyButton>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase opacity-40">滚动第一段 (ZH)</Label>
                    <Input value={formData.videoTitleZh} onChange={e => setFormData({ ...formData, videoTitleZh: e.target.value })} className="h-11 rounded-xl" />
                    <Label className="text-[10px] font-bold uppercase opacity-40">滚动第二段 (ZH)</Label>
                    <Input value={formData.videoSubtitleZh} onChange={e => setFormData({ ...formData, videoSubtitleZh: e.target.value })} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-4 border-l pl-10 border-dashed">
                    <Label className="text-[10px] font-bold uppercase opacity-40">FIRST SEGMENT (EN)</Label>
                    <Input value={formData.videoTitleEn} onChange={e => setFormData({ ...formData, videoTitleEn: e.target.value })} className="h-11 rounded-xl border-dashed" />
                    <Label className="text-[10px] font-bold uppercase opacity-40">SECOND SEGMENT (EN)</Label>
                    <Input value={formData.videoSubtitleEn} onChange={e => setFormData({ ...formData, videoSubtitleEn: e.target.value })} className="h-11 rounded-xl border-dashed" />
                  </div>
                </div>

                <div className="pt-8 border-t border-dashed space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase opacity-40">视频资源地址 (Video Source URL)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-xl text-[10px] font-bold uppercase text-primary hover:bg-primary/5"
                      onClick={() => setPickerConfig({ open: true, type: 'video', slideIndex: null })}
                    >
                      <ImageIcon className="h-3.5 w-3.5 mr-2" /> 从素材库选择
                    </Button>
                  </div>
                  <div className="flex gap-4">
                    <Input
                      value={formData.videoUrl}
                      onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://... 或 /video/..."
                      className="h-11 rounded-xl font-mono text-xs"
                    />
                    <div className="w-20 h-11 rounded-xl bg-black flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-lg">
                      <Video className="h-4 w-4 text-white/20" />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">支持 MP4 直接链接或本地路径。建议使用 H.264 编码以获得最佳兼容性。</p>
                </div>
              </div>
            )}

            {!formData.isVideoEnabled && (
              <div className="py-12 text-center bg-muted/5 border-2 border-dashed rounded-2xl">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">视频模块已禁用，保存后前台将不再显示</p>
              </div>
            )}
          </AdminFormSection>
        </AdminTabsContent>
        <AdminTabsContent value="bento" className="space-y-6">
          <AdminFormSection
            title="产品推荐板块配置"
            subtitle="配置首页产品中心 Bento 网格的标题、副标题与格位卡片"
            icon={LayoutGrid}
            actions={
              <Button
                onClick={() => setBentoDialog({ open: true, item: { titleZh: '', titleEn: '', tagZh: '', tagEn: '', imageUrl: '', linkUrl: '', gridSize: 'small', order: (bentoItems?.length || 0) + 1 } })}
                size="sm"
                className="rounded-xl h-9 px-4 gap-2 text-[10px] font-bold uppercase tracking-wider shadow-md"
              >
                <Plus className="h-3.5 w-3.5" /> 添加新格位
              </Button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">板块主标题 (Main Title)</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      value={formData.bentoTitleZh}
                      onChange={e => setFormData({ ...formData, bentoTitleZh: e.target.value })}
                      placeholder="例如：产品中心"
                      className="h-12 rounded-2xl bg-muted/20 border-border focus:bg-background transition-all"
                    />
                    <div className="relative group/input">
                      <Input
                        value={formData.bentoTitleEn}
                        onChange={e => setFormData({ ...formData, bentoTitleEn: e.target.value })}
                        placeholder="e.g. OUR PORTFOLIO"
                        className="h-12 rounded-2xl border-dashed bg-muted/10 border-border/80 pr-12 focus:bg-background/50 transition-all"
                      />
                      {aiConfig?.isEnabled && (
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                          <ShinyButton
                            onClick={async () => {
                              const res = await smartTranslate({
                                text: formData.bentoTitleZh,
                                targetLangs: ['en'],
                                taskType: 'text'
                              });
                              if (res.en) setFormData((prev: any) => ({ ...prev, bentoTitleEn: res.en }));

                              const res2 = await smartTranslate({
                                text: formData.bentoSubtitleZh,
                                targetLangs: ['en'],
                                taskType: 'text'
                              });
                              if (res2.en) setFormData((prev: any) => ({ ...prev, bentoSubtitleEn: res2.en }));

                              toast({ title: "Bento 文案智译完成" });
                            }}
                            disabled={isAiProcessing}
                            className="w-9 h-9 p-0 flex items-center justify-center shadow-lg shadow-primary/5"
                            shape="capsule"
                          >
                            {isAiProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4.5 w-4.5" />
                            )}
                          </ShinyButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">板块副标题 (Subtitle)</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      value={formData.bentoSubtitleZh}
                      onChange={e => setFormData({ ...formData, bentoSubtitleZh: e.target.value })}
                      placeholder="例如：为性能与可靠性而生"
                      className="h-12 rounded-2xl bg-muted/20 border-border focus:bg-background transition-all"
                    />
                    <div className="relative group/input">
                      <Input
                        value={formData.bentoSubtitleEn}
                        onChange={e => setFormData({ ...formData, bentoSubtitleEn: e.target.value })}
                        placeholder="e.g. Engineered for Performance"
                        className="h-12 rounded-2xl border-dashed bg-muted/10 border-border/80 pr-12 focus:bg-background/50 transition-all"
                      />
                      {aiConfig?.isEnabled && (
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                          <ShinyButton
                            onClick={async () => {
                              const res = await smartTranslate({
                                text: formData.bentoSubtitleZh,
                                targetLangs: ['en'],
                                taskType: 'text'
                              });
                              if (res.en) setFormData({ ...formData, bentoSubtitleEn: res.en });
                            }}
                            disabled={isAiProcessing}
                            className="w-9 h-9 p-0 flex items-center justify-center shadow-lg shadow-primary/5"
                            shape="capsule"
                          >
                            {isAiProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4.5 w-4.5" />
                            )}
                          </ShinyButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/10 pt-6 space-y-6">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> 首页格位内容管理 (Grid Items)
              </h4>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={bentoItems?.map((i: any) => i.id) || []}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {bentoItems?.map((item: any) => (
                      <SortableBentoItem
                        key={item.id}
                        item={item}
                        onEdit={() => setBentoDialog({ open: true, item })}
                        onDelete={async () => {
                          if (confirm('确定删除此格位吗？')) {
                            await fetch(`/api/bentoItems/${item.id}`, { method: 'DELETE' });
                            mutateBentoItems();
                            toast({ title: "已删除格位" });
                          }
                        }}
                      />
                    ))}

                    {(!bentoItems || bentoItems.length === 0) && (
                      <div className="col-span-full py-20 text-center bg-muted/5 border-2 border-dashed rounded-[2.5rem]">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">暂无独立格位，请点击右上方添加</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
              <div className="p-6 rounded-[2.5rem] bg-amber-50/50 border border-amber-100/50 flex gap-4 items-start">
                <Info className="h-5 w-5 text-amber-600 mt-1" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-tight">提示</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Bento 布局现已切换为独立管理模式。您在这里添加的格位将直接决定首页“产品中心”板块的展示内容。建议保持 6-11 个格位以获得最佳视觉效果。
                  </p>
                </div>
              </div>
            </div>
          </AdminFormSection>
        </AdminTabsContent>

        <AdminTabsContent value="gallery" className="space-y-6">
          <AdminFormSection
            title="产品轮播板块配置"
            subtitle="配置首页精选产品轮播板块的标题、副标题与产品列表"
            icon={Layers}
            actions={
              <Button
                onClick={() => setProductPickerOpen(true)}
                size="sm"
                className="rounded-xl h-9 px-4 gap-2 text-[10px] font-bold uppercase tracking-wider shadow-md"
              >
                <Plus className="h-3.5 w-3.5" /> 添加产品到轮播
              </Button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">板块主标题 (Main Title)</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      value={formData.galleryTitleZh}
                      onChange={e => setFormData({ ...formData, galleryTitleZh: e.target.value })}
                      placeholder="例如：精选产品"
                      className="h-12 rounded-2xl bg-muted/20 border-border focus:bg-background transition-all"
                    />
                    <div className="relative group/input">
                      <Input
                        value={formData.galleryTitleEn}
                        onChange={e => setFormData({ ...formData, galleryTitleEn: e.target.value })}
                        placeholder="e.g. FEATURED PRODUCTS"
                        className="h-12 rounded-2xl border-dashed bg-muted/10 border-border/80 pr-12 focus:bg-background/50 transition-all"
                      />
                      {aiConfig?.isEnabled && (
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                          <ShinyButton
                            onClick={async () => {
                              const res = await smartTranslate({
                                text: formData.galleryTitleZh,
                                targetLangs: ['en'],
                                taskType: 'text'
                              });
                              if (res.en) setFormData({ ...formData, galleryTitleEn: res.en });
                            }}
                            disabled={isAiProcessing}
                            className="w-9 h-9 p-0 flex items-center justify-center shadow-lg shadow-primary/5"
                            shape="capsule"
                          >
                            {isAiProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4.5 w-4.5" />
                            )}
                          </ShinyButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">板块副标题 (Subtitle)</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      value={formData.gallerySubtitleZh}
                      onChange={e => setFormData({ ...formData, gallerySubtitleZh: e.target.value })}
                      placeholder="例如：于细节处见创新与精密"
                      className="h-12 rounded-2xl bg-muted/20 border-border focus:bg-background transition-all"
                    />
                    <div className="relative group/input">
                      <Input
                        value={formData.gallerySubtitleEn}
                        onChange={e => setFormData({ ...formData, gallerySubtitleEn: e.target.value })}
                        placeholder="e.g. Innovation in every detail"
                        className="h-12 rounded-2xl border-dashed bg-muted/10 border-border/80 pr-12 focus:bg-background/50 transition-all"
                      />
                      {aiConfig?.isEnabled && (
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                          <ShinyButton
                            onClick={async () => {
                              const res = await smartTranslate({
                                text: formData.gallerySubtitleZh,
                                targetLangs: ['en'],
                                taskType: 'text'
                              });
                              if (res.en) setFormData({ ...formData, gallerySubtitleEn: res.en });
                            }}
                            disabled={isAiProcessing}
                            className="w-9 h-9 p-0 flex items-center justify-center shadow-lg shadow-primary/5"
                            shape="capsule"
                          >
                            {isAiProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4.5 w-4.5" />
                            )}
                          </ShinyButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/10 pt-6 space-y-6">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> 轮播内容管理
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {formData.galleryItems.map((item: any, idx: number) => {
                  const product = allProducts?.find((p: any) => p.id === item.productId);
                  if (!product) return null;

                  const productName = translations?.find((t: any) => t.id === product.nameTextId)?.content?.zh || product.id;

                  return (
                    <div key={`${item.productId}-${idx}`} className="group relative bg-card/70 backdrop-blur-md rounded-[2rem] border border-border/60 p-4 hover:border-primary/40 hover:bg-card transition-all duration-500 shadow-sm">
                      <div className="relative aspect-[11/9] rounded-2xl overflow-hidden mb-3 shadow-inner bg-muted/20">
                        {product.mainImageUrl ? (
                          <Image src={getAssetUrl(product.mainImageUrl)} alt="P" fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                            <ImageIcon className="h-8 w-8 opacity-20" />
                          </div>
                        )}

                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7 rounded-full shadow-lg"
                            onClick={() => {
                              const newItems = [...formData.galleryItems];
                              newItems.splice(idx, 1);
                              setFormData({ ...formData, galleryItems: newItems });
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {item.badge && (
                          <div className="absolute top-2 left-2">
                            <span className={cn(
                              "inline-block px-2 py-0.5 text-[8px] font-black uppercase rounded-full text-white shadow-sm",
                              item.badge === 'NEW' ? "bg-blue-500" : "bg-red-500"
                            )}>
                              {item.badge === 'NEW' ? '新品' : '热销'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-foreground line-clamp-1">{productName}</h4>
                        <div className="space-y-1.5 pt-2 border-t border-dashed border-border/60">
                          <Label className="text-[9px] font-bold uppercase opacity-40">设置标签 (Badge)</Label>
                          <Select
                            value={item.badge || 'none'}
                            onValueChange={(v) => {
                              const newItems = [...formData.galleryItems];
                              newItems[idx] = { ...newItems[idx], badge: v === 'none' ? null : v };
                              setFormData({ ...formData, galleryItems: newItems });
                            }}
                          >
                            <SelectTrigger className="h-8 rounded-lg text-[10px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="none" className="text-[10px]">无标签</SelectItem>
                              <SelectItem value="NEW" className="text-[10px] font-bold text-blue-600">新品 (NEW)</SelectItem>
                              <SelectItem value="HOT" className="text-[10px] font-bold text-red-600">热销 (HOT)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                            disabled={idx === 0}
                            onClick={() => {
                              const newItems = [...formData.galleryItems];
                              [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
                              setFormData({ ...formData, galleryItems: newItems });
                            }}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                            disabled={idx === formData.galleryItems.length - 1}
                            onClick={() => {
                              const newItems = [...formData.galleryItems];
                              [newItems[idx + 1], newItems[idx]] = [newItems[idx], newItems[idx + 1]];
                              setFormData({ ...formData, galleryItems: newItems });
                            }}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {formData.galleryItems.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-muted/5 border-2 border-dashed rounded-[2.5rem]">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">尚未手动添加产品。前台将默认拉取最新 8 个产品。</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 rounded-xl px-6"
                      onClick={() => setProductPickerOpen(true)}
                    >
                      开始添加产品
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100/50 flex gap-4 items-start">
                <Info className="h-5 w-5 text-indigo-600 mt-1" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-tight">配置说明</p>
                  <p className="text-[11px] text-indigo-700 leading-relaxed">
                    您可以手动挑选需要展示在首页轮播中的产品。如果列表为空，系统将自动回退到“最新发布”模式。手动模式下，您可以为每个产品单独设置“新品”或“热销”标签。
                  </p>
                </div>
              </div>
            </div>
          </AdminFormSection>
        </AdminTabsContent>
      </AdminTabs>

      <MediaLibraryDialog
        open={pickerConfig.open}
        onOpenChange={(open) => setPickerConfig({ ...pickerConfig, open })}
        onSelect={(assets) => {
          if (assets.length > 0) {
            const asset = assets[0] as any;
            const url = asset.url;
            if (pickerConfig.type === 'video') {
              setFormData({ ...formData, videoUrl: url });
            } else if (pickerConfig.type === 'wholesale') {
              setFormData({ ...formData, heroWholesaleBg: url });
            } else if (pickerConfig.type === 'project') {
              setFormData({ ...formData, heroProjectBg: url });
            } else if (pickerConfig.type === 'slide' && pickerConfig.slideIndex !== null) {
              const fieldName = (pickerConfig as any).field || 'bgImage';
              updateSlide(pickerConfig.slideIndex, {
                [fieldName]: url,
                brightness: asset.brightness !== undefined ? asset.brightness : null
              });
            } else if (pickerConfig.type === 'bento' && bentoDialog.open) {
              setBentoDialog({
                ...bentoDialog,
                item: {
                  ...bentoDialog.item,
                  imageUrl: url,
                  brightness: asset.brightness !== undefined ? asset.brightness : null
                }
              });
            }
          }
        }}
        selectionMode="single"
        title="选择首页媒体素材"
        subtitle="选择一张高质量图片或一段精彩视频作为首页展示"
      />

      <ProductPicker
        open={productPickerOpen}
        onOpenChange={setProductPickerOpen}
        products={allProducts || []}
        translations={translations || []}
        categories={categories || []}
        onSelect={(productId) => {
          if (formData.galleryItems.some((i: any) => i.productId === productId)) {
            toast({ variant: "destructive", title: "产品已存在于轮播中" });
            return;
          }
          setFormData({
            ...formData,
            galleryItems: [...formData.galleryItems, { productId, badge: null }]
          });
          setProductPickerOpen(false);
          toast({ title: "已添加产品" });
        }}
      />

      <BentoItemDialog
        open={bentoDialog.open}
        onOpenChange={(open) => setBentoDialog({ ...bentoDialog, open })}
        item={bentoDialog.item}
        onSave={async (item) => {
          const method = item.id ? 'PUT' : 'POST';
          const url = item.id ? `/api/bentoItems/${item.id}` : '/api/bentoItems';
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });
          if (res.ok) {
            mutateBentoItems();
            setBentoDialog({ open: false, item: null });
            toast({ title: "格位已保存" });
          } else {
            const err = await res.json().catch(() => ({}));
            toast({
              variant: "destructive",
              title: "保存失败",
              description: err.error || "网络或系统内部错误，请稍后再试"
            });
          }
        }}
        onTranslate={async (text) => {
          const res = await smartTranslate({
            text,
            targetLangs: ['en'],
            taskType: 'text'
          });
          return res.en || '';
        }}
        onImageSelect={() => setPickerConfig({ open: true, type: 'bento', slideIndex: null })}
        categories={categories || []}
        translations={translations || []}
      />
    </div>
  );
}

function ProductPicker({ open, onOpenChange, products, translations, categories, onSelect }: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  products: any[],
  translations: any[],
  categories: any[],
  onSelect: (id: string) => void
}) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
    const nameEntry = translations.find(t => t.id === p.nameTextId);
    const name = nameEntry?.content?.zh || p.id;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[3rem] max-w-4xl h-[80vh] p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] admin-interface-dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200/50 admin-interface-dark:border-white/5 bg-card flex flex-col">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 admin-interface-dark:from-slate-950 admin-interface-dark:to-slate-900 p-8 text-slate-900 admin-interface-dark:text-white relative overflow-hidden border-b border-slate-200/80 admin-interface-dark:border-white/5 shrink-0">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <LayoutGrid className="h-24 w-24" />
          </div>
          <DialogHeader className="relative z-10 space-y-2">
            <DialogTitle className="text-xl font-headline font-black flex items-center gap-4 text-slate-900 admin-interface-dark:text-white">
              <div className="h-10 w-10 rounded-xl bg-slate-200/50 admin-interface-dark:bg-white/10 flex items-center justify-center border border-slate-300/50 admin-interface-dark:border-white/5 text-slate-700 admin-interface-dark:text-white">
                <LayoutGrid className="h-5 w-5" />
              </div>
              产品库浏览选择
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Categories */}
          <div className="w-48 bg-muted/20 border-r border-border/60 p-4 space-y-1 overflow-y-auto shrink-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3">产品分类</p>
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all",
                activeCategory === 'all' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              全部产品
            </button>
            {categories.map(cat => {
              const name = translations.find(t => t.id === cat.nameTextId)?.content?.zh || cat.slug || cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all truncate",
                    activeCategory === cat.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {/* Main Area - Product List */}
          <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
            <div className="relative group">
              <Input
                placeholder="在当前分类中筛选..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-11 pl-10 rounded-xl bg-muted/20 border-border focus:bg-background transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                <Plus className="h-4 w-4 rotate-45" />
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {filtered.map(p => {
                const name = translations.find(t => t.id === p.nameTextId)?.content?.zh || p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    className="group flex items-center gap-4 bg-card border border-border/60 p-3 rounded-2xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm transition-all duration-300"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted/20 shrink-0 border border-border/40 shadow-sm">
                      {p.mainImageUrl && <Image src={getAssetUrl(p.mainImageUrl)} alt={p.id} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{name}</p>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider font-mono truncate">{p.id}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="sm" className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all">
                        选择
                      </Button>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-20 text-center bg-muted/5 rounded-2xl border border-dashed border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">该分类下暂无产品</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

function BentoItemDialog({ open, onOpenChange, item, onSave, onTranslate, onImageSelect, categories, translations }: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  item: any,
  onSave: (item: any) => void,
  onTranslate: (text: string) => Promise<string>,
  onImageSelect: () => void,
  categories: any[],
  translations: any[]
}) {
  const [localItem, setLocalItem] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (item) setLocalItem(item);
  }, [item]);

  if (!localItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[3rem] max-w-2xl p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] admin-interface-dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200/50 admin-interface-dark:border-white/5 bg-card flex flex-col">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 admin-interface-dark:from-slate-950 admin-interface-dark:to-slate-900 p-8 text-slate-900 admin-interface-dark:text-white relative overflow-hidden border-b border-slate-200/80 admin-interface-dark:border-white/5 shrink-0">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <LayoutGrid className="h-24 w-24" />
          </div>
          <DialogHeader className="relative z-10 space-y-2">
            <DialogTitle className="text-xl font-headline font-black flex items-center gap-4 text-slate-900 admin-interface-dark:text-white">
              <div className="h-10 w-10 rounded-xl bg-slate-200/50 admin-interface-dark:bg-white/10 flex items-center justify-center border border-slate-300/50 admin-interface-dark:border-white/5 text-slate-700 admin-interface-dark:text-white">
                <LayoutGrid className="h-5 w-5" />
              </div>
              {localItem.id ? '编辑格位' : '新增格位'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto text-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">背景图片</Label>
              <div
                className="relative aspect-video rounded-3xl overflow-hidden cursor-pointer group border-2 border-dashed border-border hover:border-primary transition-all bg-muted/20"
                onClick={onImageSelect}
              >
                {localItem.imageUrl ? (
                  <Image src={getAssetUrl(localItem.imageUrl)} alt="P" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-[10px] font-bold uppercase">点击上传图片</span>
                  </div>
                )}
              </div>
              <Input
                value={localItem.imageUrl}
                onChange={e => setLocalItem({ ...localItem, imageUrl: e.target.value })}
                placeholder="图片 URL"
                className="h-10 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">格位尺寸 (Grid Size)</Label>
                <Select value={localItem.gridSize} onValueChange={v => setLocalItem({ ...localItem, gridSize: v })}>
                  <SelectTrigger className="h-12 rounded-2xl border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="small">
                      <div className="flex items-center gap-2">
                        <Square className="h-3.5 w-3.5 opacity-40" />
                        <span>标准 (1×1)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="wide">
                      <div className="flex items-center gap-2">
                        <RectangleHorizontal className="h-3.5 w-3.5 text-primary" />
                        <span>横向 (2×1)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tall">
                      <div className="flex items-center gap-2">
                        <RectangleVertical className="h-3.5 w-3.5 text-primary" />
                        <span>纵向 (1×2)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="large">
                      <div className="flex items-center gap-2">
                        <Square className="h-4 w-4 text-primary" />
                        <span className="font-bold">大方块 (2×2)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">显示顺序</Label>
                <Input
                  type="number"
                  value={localItem.order}
                  onChange={e => setLocalItem({ ...localItem, order: parseInt(e.target.value) })}
                  className="h-12 rounded-2xl border-border"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/60 pt-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">中文内容 (ZH)</Label>
              <Input value={localItem.titleZh} onChange={e => setLocalItem({ ...localItem, titleZh: e.target.value })} placeholder="主标题" className="h-11 rounded-xl border-border" />
              <Input value={localItem.tagZh} onChange={e => setLocalItem({ ...localItem, tagZh: e.target.value })} placeholder="小标签 (如：批发业务)" className="h-11 rounded-xl border-border" />

              <div className="pt-4 border-t border-dashed border-border/60 space-y-3">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">跳转逻辑 (Navigation)</Label>
                <Select
                  onValueChange={v => {
                    if (v === 'custom') return;
                    const cat = categories.find(c => c.id === v);
                    if (cat) {
                      setLocalItem({ ...localItem, linkUrl: `products?category=${encodeURIComponent(cat.slug || cat.id)}` });
                    }
                  }}
                >
                  <SelectTrigger className="h-10 rounded-xl border-border text-xs">
                    <SelectValue placeholder="快速关联产品分类" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="custom" className="text-xs font-bold text-primary">手动输入自定义链接</SelectItem>
                    {categories?.map((cat: any) => {
                      const trans = translations?.find((t: any) => t.id === cat.nameTextId);
                      const name = trans?.content?.zh || trans?.zh || cat.id;
                      return <SelectItem key={cat.id} value={cat.id} className="text-xs">{name}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <Input value={localItem.linkUrl} onChange={e => setLocalItem({ ...localItem, linkUrl: e.target.value })} placeholder="跳转链接 (如：products?category=...)" className="h-11 rounded-xl border-border font-mono text-[11px]" />
              </div>
            </div>

            <div className="space-y-4 border-l pl-8 border-dashed border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ENGLISH CONTENT (EN)</Label>
              </div>
              <div className="relative group/input">
                <Input
                  value={localItem.titleEn}
                  onChange={e => setLocalItem({ ...localItem, titleEn: e.target.value })}
                  placeholder="Main Title"
                  className="h-11 rounded-xl border-dashed border-border pr-12"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <ShinyButton
                    onClick={async () => {
                      setIsTranslating(true);
                      try {
                        const t = await onTranslate(localItem.titleZh);
                        setLocalItem({ ...localItem, titleEn: t });
                      } finally {
                        setIsTranslating(false);
                      }
                    }}
                    disabled={isTranslating}
                    className="w-8 h-8 p-0 flex items-center justify-center shadow-lg shadow-primary/5"
                    shape="capsule"
                  >
                    {isTranslating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                  </ShinyButton>
                </div>
              </div>

              <div className="relative group/input">
                <Input
                  value={localItem.tagEn}
                  onChange={e => setLocalItem({ ...localItem, tagEn: e.target.value })}
                  placeholder="Small Tag (e.g. Wholesale)"
                  className="h-11 rounded-xl border-dashed border-border pr-12"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <ShinyButton
                    onClick={async () => {
                      setIsTranslating(true);
                      try {
                        const t = await onTranslate(localItem.tagZh || '');
                        setLocalItem({ ...localItem, tagEn: t });
                      } finally {
                        setIsTranslating(false);
                      }
                    }}
                    disabled={isTranslating}
                    className="w-8 h-8 p-0 flex items-center justify-center shadow-lg shadow-primary/5"
                    shape="capsule"
                  >
                    {isTranslating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                  </ShinyButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-muted/30 p-6 flex justify-end gap-3 border-t border-border/60">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">取消</Button>
          <Button onClick={() => onSave(localItem)} className="rounded-xl px-8 shadow-lg shadow-primary/20 bg-primary text-white hover:bg-primary/90">保存格位</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
