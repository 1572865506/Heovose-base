"use client";

import React, { useState, useEffect, useMemo, Suspense, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  X,
  Languages,
  Info,
  Upload,
  Search,
  Check,
  Trash2,
  PlusCircle,
  TableProperties,
  FolderPlus,
  Sparkles,
  AlertCircle,
  Film,
  Cpu,
  Library,
  ChevronRight,
  ChevronLeft,
  Settings,
  RotateCcw,
  BarChart3
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { translateContent } from '@/ai/flows/translate-flow';
import RichTextEditor from '@/components/RichTextEditor';

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

interface ProductSpecEntry {
  uid: string;
  labelEn: string;
  labelZh: string;
  valueEn: string;
  valueZh: string;
}

interface ProductSpecGroup {
  uid: string;
  titleEn: string;
  titleZh: string;
  items: ProductSpecEntry[];
}

interface Product {
  id: string;
  nameTextId: string;
  descriptionTextId: string;
  localizedDetails?: Record<string, string>;
  advantageTextIds?: string[];
  specGroups?: { 
    titleId: string, 
    items: { labelId: string, valueId: string }[] 
  }[];
  mainImageUrl: string;
  productCategoryId: string;
  galleryImageUrls: string[];
  status?: 'published' | 'draft';
}

interface SpecTemplate {
  id: string;
  name: string;
  specGroups: any[];
  createdAt: any;
}

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
}

interface ProductCategory {
  id: string;
  nameTextId: string;
}

interface GalleryAsset {
  id: string;
  url: string;
  title: string;
  categoryId: string;
}

interface AiConfig {
  isEnabled: boolean;
  model: string;
  apiKey?: string;
}

interface AppConfig {
  supportedLanguages: { code: string, label: string }[];
}

function ProductEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const zhEditorRef = useRef<any>(null);
  const targetEditorRef = useRef<any>(null);
  
  const productId = searchParams.get('id');
  const isEditing = !!productId;

  const [formData, setFormData] = useState({
    id: '',
    categoryId: '',
    mainImageUrl: '',
    galleryUrls: [] as string[],
    nameEn: '',
    nameZh: '',
    descEn: '',
    descZh: '',
    localizedDetails: { zh: '', en: '' } as Record<string, string>,
    advantages: [] as { uid: string, zh: string, en: string }[],
    specGroups: [] as ProductSpecGroup[],
    status: 'draft' as 'published' | 'draft'
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [targetDetailsLang, setTargetDetailsLang] = useState('en');
  const [isUploading, setIsUploading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  const [idConflict, setIdConflict] = useState(false);

  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [saveMode, setSaveMode] = useState<'create' | 'overwrite'>('create');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'main' | 'gallery' | 'richtext-zh' | 'richtext-target'>('main');
  const [pickerSearch, setPickerSearch] = useState('');
  const [selectedPickerUrls, setSelectedPickerUrls] = useState<Set<string>>(new Set());

  const prodRef = useMemoFirebase(() => (firestore && productId) ? doc(firestore, 'products', productId) : null, [firestore, productId]);
  const catsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'productCategories') : null, [firestore]);
  const transQuery = useMemoFirebase(() => firestore ? collection(firestore, 'localizedStrings') : null, [firestore]);
  const assetsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'galleryAssets'), orderBy('createdAt', 'desc')) : null, [firestore]);
  const allProdsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const aiRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'ai') : null, [firestore]);
  const langRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'languages') : null, [firestore]);
  const templatesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'specTemplates'), orderBy('createdAt', 'desc')) : null, [firestore]);

  const { data: product, isLoading: isProdLoading } = useDoc<Product>(prodRef);
  const { data: categories } = useCollection<ProductCategory>(catsQuery);
  const { data: translations } = useCollection<LocalizedString>(transQuery);
  const { data: galleryAssets } = useCollection<GalleryAsset>(assetsQuery);
  const { data: allProducts } = useCollection<Product>(allProdsQuery);
  const { data: aiConfig } = useDoc<AiConfig>(aiRef);
  const { data: langConfig } = useDoc<AppConfig>(langRef);
  const { data: specTemplates } = useCollection<SpecTemplate>(templatesQuery);

  const supportedLangs = useMemo(() => langConfig?.supportedLanguages || [{ code: 'zh', label: '中文' }, { code: 'en', label: 'English' }], [langConfig]);

  /**
   * 智译覆盖率计算引擎
   * 评估产品多语言内容的完成程度
   */
  const translationCoverage = useMemo(() => {
    let totalFields = 0;
    let translatedFields = 0;

    // 1. 评估基础信息 (权重: 2)
    let basicTotal = 0;
    let basicTranslated = 0;
    if (formData.nameZh.trim()) {
      basicTotal++;
      if (formData.nameEn.trim()) basicTranslated++;
    }
    if (formData.descZh.trim()) {
      basicTotal++;
      if (formData.descEn.trim()) basicTranslated++;
    }
    totalFields += basicTotal;
    translatedFields += basicTranslated;

    // 2. 评估技术规格 (权重: 按节点数动态计算)
    let specTotal = 0;
    let specTranslated = 0;
    formData.specGroups.forEach(group => {
      if (group.titleZh.trim()) {
        specTotal++;
        if (group.titleEn.trim()) specTranslated++;
      }
      group.items.forEach(item => {
        if (item.labelZh.trim()) {
          specTotal++;
          if (item.labelEn.trim()) specTranslated++;
        }
        if (item.valueZh.trim()) {
          specTotal++;
          if (item.valueEn.trim()) specTranslated++;
        }
      });
    });
    totalFields += specTotal;
    translatedFields += specTranslated;

    // 3. 评估详细介绍 (权重: 1)
    let detailTotal = 0;
    let detailTranslated = 0;
    const zhClean = formData.localizedDetails.zh?.replace(/<[^>]*>/g, '').trim();
    if (zhClean) {
      detailTotal++;
      const enClean = formData.localizedDetails.en?.replace(/<[^>]*>/g, '').trim();
      if (enClean) detailTranslated++;
    }
    totalFields += detailTotal;
    translatedFields += detailTranslated;

    const globalScore = totalFields > 0 ? Math.round((translatedFields / totalFields) * 100) : 0;
    
    return {
      global: globalScore,
      basic: basicTotal > 0 ? Math.round((basicTranslated / basicTotal) * 100) : 100,
      specs: specTotal > 0 ? Math.round((specTranslated / specTotal) * 100) : 100,
      details: detailTotal > 0 ? Math.round((detailTranslated / detailTotal) * 100) : 100,
    };
  }, [formData]);

  useEffect(() => {
    if (isEditing && product && translations) {
      const getT = (id?: string) => translations.find(t => t.id === id) || { en: '', zh: '' };
      
      const advantages = (product.advantageTextIds || []).map((id, idx) => {
        const t = getT(id);
        return { uid: `adv_${idx}_${Date.now()}`, zh: t.zh || '', en: t.en || '' };
      });

      const specGroups = (product.specGroups || []).map((g, gIdx) => {
        const titleT = getT(g.titleId);
        const items = g.items.map((item, iIdx) => ({
          uid: `spec_item_${gIdx}_${iIdx}_${Date.now()}`,
          labelEn: getT(item.labelId).en || '',
          labelZh: getT(item.labelId).zh || '',
          valueEn: getT(item.valueId).en || '',
          valueZh: getT(item.valueId).zh || ''
        }));
        return { uid: `spec_group_${gIdx}_${Date.now()}`, titleEn: titleT.en || '', titleZh: titleT.zh || '', items };
      });

      setFormData({
        id: product.id,
        categoryId: product.productCategoryId,
        mainImageUrl: product.mainImageUrl,
        galleryUrls: product.galleryImageUrls || [],
        nameEn: getT(product.nameTextId).en || '',
        nameZh: getT(product.nameTextId).zh || '',
        descEn: getT(product.descriptionTextId).en || '',
        descZh: getT(product.descriptionTextId).zh || '',
        localizedDetails: product.localizedDetails || { zh: '', en: '' },
        advantages: advantages.length > 0 ? advantages : [{ uid: 'initial', zh: '', en: '' }],
        specGroups: specGroups.length > 0 ? specGroups : [],
        status: product.status || 'draft'
      });
    }
  }, [isEditing, product, translations]);

  useEffect(() => {
    if (!isEditing && formData.id && allProducts) {
      const exists = allProducts.some(p => p.id === formData.id);
      setIdConflict(exists);
    } else {
      setIdConflict(false);
    }
  }, [formData.id, allProducts, isEditing]);

  const handleSave = () => {
    if (!firestore || !formData.id || !formData.categoryId) {
      toast({ variant: "destructive", title: "请填写完整产品 ID 和分类" });
      return;
    }
    if (idConflict) {
      toast({ variant: "destructive", title: "ID 已被占用" });
      return;
    }
    const saveLang = (en: string, zh: string, defaultId: string) => {
      setDocumentNonBlocking(doc(firestore, 'localizedStrings', defaultId), { 
        id: defaultId, en: en.trim(), zh: zh.trim(), updatedAt: serverTimestamp() 
      }, { merge: true });
      return defaultId;
    };
    const nameId = saveLang(formData.nameEn, formData.nameZh, `prod_name_${formData.id}`);
    const descId = saveLang(formData.descEn, formData.descZh, `prod_desc_${formData.id}`);
    const advantageIds = formData.advantages.filter(a => a.zh || a.en).map((adv, idx) => 
      saveLang(adv.en, adv.zh, `prod_adv_${formData.id}_${idx}`)
    );
    const savedSpecGroups = formData.specGroups.map((group, gIdx) => {
      const titleId = saveLang(group.titleEn, group.titleZh, `prod_spec_group_${formData.id}_${gIdx}`);
      const items = group.items.map((item, iIdx) => ({
        labelId: saveLang(item.labelEn, item.labelZh, `prod_spec_lbl_${formData.id}_${gIdx}_${iIdx}`),
        valueId: saveLang(item.valueEn, item.valueZh, `prod_spec_val_${formData.id}_${gIdx}_${iIdx}`)
      }));
      return { titleId, items };
    });
    setDocumentNonBlocking(doc(firestore, 'products', formData.id), {
      id: formData.id, 
      nameTextId: nameId, 
      descriptionTextId: descId, 
      localizedDetails: formData.localizedDetails,
      advantageTextIds: advantageIds, 
      specGroups: savedSpecGroups, 
      mainImageUrl: formData.mainImageUrl, 
      productCategoryId: formData.categoryId, 
      galleryImageUrls: formData.galleryUrls.filter(Boolean), 
      status: formData.status, 
      updatedAt: serverTimestamp()
    }, { merge: true });
    toast({ title: "产品已保存" });
    router.push('/admin/products');
  };

  const handleSaveTemplate = () => {
    if (!firestore) return;
    
    let templateId = '';
    let templateName = '';

    if (saveMode === 'create') {
      if (!newTemplateName.trim()) {
        toast({ variant: "destructive", title: "请输入模板名称" });
        return;
      }
      templateId = `tpl_${Date.now()}`;
      templateName = newTemplateName.trim();
    } else {
      if (!selectedTemplateId) {
        toast({ variant: "destructive", title: "请选择要覆盖的模板" });
        return;
      }
      templateId = selectedTemplateId;
      templateName = specTemplates?.find(t => t.id === selectedTemplateId)?.name || '';
    }

    const cleanSpecGroups = formData.specGroups.map(group => ({
      titleEn: group.titleEn,
      titleZh: group.titleZh,
      items: group.items.map(item => ({
        labelEn: item.labelEn,
        labelZh: item.labelZh,
        valueEn: item.valueEn,
        valueZh: item.valueZh
      }))
    }));

    setDocumentNonBlocking(doc(firestore, 'specTemplates', templateId), {
      id: templateId,
      name: templateName,
      specGroups: cleanSpecGroups,
      createdAt: saveMode === 'create' ? serverTimestamp() : (specTemplates?.find(t => t.id === templateId)?.createdAt || serverTimestamp()),
      updatedAt: serverTimestamp()
    }, { merge: true });

    setIsSaveTemplateDialogOpen(false);
    setNewTemplateName('');
    setSelectedTemplateId('');
    toast({ title: saveMode === 'create' ? "规格模板已存入云端库" : "模板内容已更新成功" });
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (!firestore || !confirm(`确定要从云端规格库中永久删除模板“${name}”吗？`)) return;
    deleteDocumentNonBlocking(doc(firestore, 'specTemplates', id));
    toast({ title: "模板已移除" });
  };

  const handleApplyTemplate = (template: SpecTemplate) => {
    const mappedGroups = template.specGroups.map((group: any, gIdx: number) => ({
      uid: `tpl_g_${gIdx}_${Date.now()}`,
      titleEn: group.titleEn || '',
      titleZh: group.titleZh || '',
      items: (group.items || []).map((item: any, iIdx: number) => ({
        uid: `tpl_i_${gIdx}_${iIdx}_${Date.now()}`,
        labelEn: item.labelEn || '',
        labelZh: item.labelZh || '',
        valueEn: item.valueEn || '',
        valueZh: item.valueZh || ''
      }))
    }));
    setFormData(prev => ({ ...prev, specGroups: [...prev.specGroups, ...mappedGroups] }));
    toast({ title: "已从模板导入规格" });
  };

  const handleMoveGalleryImage = (idx: number, direction: 'left' | 'right') => {
    const newUrls = [...formData.galleryUrls];
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newUrls.length) return;
    [newUrls[idx], newUrls[targetIdx]] = [newUrls[targetIdx], newUrls[idx]];
    setFormData({ ...formData, galleryUrls: newUrls });
  };

  const handleAiTranslateBasicInfo = async () => {
    if (!aiConfig?.isEnabled) return;
    setIsAiProcessing(true);
    try {
      const results = await Promise.all([
        formData.nameZh.trim() ? translateContent({ text: formData.nameZh, targetLangs: ['en'], apiKey: aiConfig.apiKey }) : null,
        formData.descZh.trim() ? translateContent({ text: formData.descZh, targetLangs: ['en'], apiKey: aiConfig.apiKey }) : null
      ]);
      setFormData(prev => ({
        ...prev,
        nameEn: results[0]?.en || prev.nameEn,
        descEn: results[1]?.en || prev.descEn
      }));
      toast({ title: "智译成功" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "翻译失败", description: e.message });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiTranslateDetails = async () => {
    if (!aiConfig?.isEnabled || !formData.localizedDetails.zh) return;
    setIsAiProcessing(true);
    try {
      const res = await translateContent({
        text: formData.localizedDetails.zh,
        sourceLang: 'zh',
        targetLangs: [targetDetailsLang],
        model: aiConfig.model,
        apiKey: aiConfig.apiKey
      });
      if (res[targetDetailsLang]) {
        setFormData(prev => ({
          ...prev,
          localizedDetails: { ...prev.localizedDetails, [targetDetailsLang]: res[targetDetailsLang] }
        }));
        toast({ title: "详情智译成功" });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "智译中断", description: e.message });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiTranslateAllSpecs = async () => {
    if (!aiConfig?.isEnabled || formData.specGroups.length === 0) return;

    const taskMap: Record<string, { type: 'title' | 'label' | 'value', text: string }> = {};
    const allIds = new Set<string>();

    formData.specGroups.forEach((group, gIdx) => {
      if (group.titleZh && !group.titleEn) {
        taskMap[`g_${gIdx}_title`] = { type: 'title', text: group.titleZh };
        allIds.add(`g_${gIdx}_title`);
      }
      group.items.forEach((item, iIdx) => {
        if (item.labelZh && !item.labelEn) {
          taskMap[`i_${gIdx}_${iIdx}_label`] = { type: 'label', text: item.labelZh };
          allIds.add(`i_${gIdx}_${iIdx}_label`);
        }
        if (item.valueZh && !item.valueEn) {
          taskMap[`i_${gIdx}_${iIdx}_value`] = { type: 'value', text: item.valueZh };
          allIds.add(`i_${gIdx}_${iIdx}_value`);
        }
      });
    });

    if (Object.keys(taskMap).length === 0) {
      toast({ title: "规格矩阵已是最新状态", description: "没有发现需要增量翻译的内容。" });
      return;
    }

    setIsAiProcessing(true);
    setProcessingItems(allIds);

    try {
      const payload = JSON.stringify(taskMap);
      const res = await translateContent({
        text: `You are a hardware expert. Translate this structure into professional industrial English. RETURN RAW JSON ONLY matching keys: ${payload}`,
        targetLangs: ['en'],
        model: aiConfig.model,
        apiKey: aiConfig.apiKey
      });

      if (res?.en) {
        const results = JSON.parse(res.en);
        const newSpecGroups = [...formData.specGroups];

        Object.keys(results).forEach(key => {
          const val = results[key];
          if (key.startsWith('g_')) {
            const gIdx = parseInt(key.split('_')[1]);
            newSpecGroups[gIdx].titleEn = val;
          } else if (key.startsWith('i_')) {
            const parts = key.split('_');
            const gIdx = parseInt(parts[1]);
            const iIdx = parseInt(parts[2]);
            const type = parts[3];
            if (type === 'label') newSpecGroups[gIdx].items[iIdx].labelEn = val;
            else if (type === 'value') newSpecGroups[gIdx].items[iIdx].valueEn = val;
          }
        });

        setFormData(prev => ({ ...prev, specGroups: newSpecGroups }));
        toast({ title: "全表智译成功", description: `已同步更新 ${Object.keys(results).length} 个技术节点。` });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "批量智译中断", description: e.message });
    } finally {
      setIsAiProcessing(false);
      setProcessingItems(new Set());
    }
  };

  const handleAiTranslateSpecItem = async (gIdx: number, iIdx: number) => {
    if (!aiConfig?.isEnabled) return;
    const item = formData.specGroups[gIdx].items[iIdx];
    if (!item.labelZh && !item.valueZh) return;
    
    const labelKey = `i_${gIdx}_${iIdx}_label`;
    const valueKey = `i_${gIdx}_${iIdx}_value`;
    setProcessingItems(prev => { const n = new Set(prev); n.add(labelKey); n.add(valueKey); return n; });

    try {
      const combinedPayload = JSON.stringify({ label: item.labelZh, value: item.valueZh });
      const res = await translateContent({ 
        text: `Translate this hardware spec entry (return JSON only): ${combinedPayload}`, 
        targetLangs: ['en'], 
        apiKey: aiConfig.apiKey 
      });

      if (res?.en) {
        try {
          const parsed = JSON.parse(res.en);
          const newSpecGroups = [...formData.specGroups];
          newSpecGroups[gIdx].items[iIdx].labelEn = parsed.label || '';
          newSpecGroups[gIdx].items[iIdx].valueEn = parsed.value || '';
          setFormData({ ...formData, specGroups: newSpecGroups });
          toast({ title: "单条规格智译成功" });
        } catch {
          toast({ variant: "destructive", title: "智译解析失败" });
        }
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "智译失败", description: e.message });
    } finally {
      setProcessingItems(prev => {
        const next = new Set(prev);
        next.delete(labelKey);
        next.delete(valueKey);
        return next;
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => { setFormData(prev => ({ ...prev, mainImageUrl: ev.target?.result as string })); setIsUploading(false); };
    reader.readAsDataURL(file);
  };

  const openPicker = (target: any) => { setPickerTarget(target); setSelectedPickerUrls(new Set()); setIsPickerOpen(true); };

  const handleConfirmPicker = () => {
    const urls = Array.from(selectedPickerUrls);
    if (urls.length === 0) return;
    if (pickerTarget === 'main') setFormData({ ...formData, mainImageUrl: urls[0] });
    else if (pickerTarget === 'gallery') setFormData({ ...formData, galleryUrls: [...formData.galleryUrls, ...urls] });
    else if (pickerTarget === 'richtext-zh') zhEditorRef.current?.editor?.commands.setImage({ src: urls[0] });
    else if (pickerTarget === 'richtext-target') targetEditorRef.current?.editor?.commands.setImage({ src: urls[0] });
    setIsPickerOpen(false);
  };

  if (isEditing && isProdLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin opacity-20" /></div>;

  return (
    <div className="max-w-full w-full mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <AiGradientDef />
      <div className="flex items-center justify-between sticky top-[-24px] z-40 bg-background/95 backdrop-blur-md py-3 border-b shadow-sm -mx-6 px-6">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
            <h2 className="text-sm font-headline font-bold text-primary whitespace-nowrap uppercase tracking-widest">{isEditing ? '编辑产品' : '发布新产品'}</h2>
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-0">
             <Select value={formData.categoryId} onValueChange={v => {
               setFormData(prev => {
                 const up: any = { categoryId: v };
                 if (!isEditing) {
                   const date = new Date();
                   const mm = String(date.getMonth() + 1).padStart(2, '0');
                   const dd = String(date.getDate()).padStart(2, '0');
                   const rc = Math.random().toString(36).substring(2, 6).toUpperCase();
                   up.id = `PROD_${v.toUpperCase().replace(/\s+/g, '_')}_${mm}${dd}_${rc}`;
                 }
                 return { ...prev, ...up };
               });
             }}>
               <SelectTrigger className="h-10 rounded-lg border-transparent text-xs w-[160px] shrink-0 font-medium"><SelectValue placeholder="分类..." /></SelectTrigger>
               <SelectContent className="rounded-lg">{categories?.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.id}</SelectItem>)}</SelectContent>
             </Select>
             <div className="relative flex-1 min-w-0">
                <Input disabled={isEditing} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className={cn("h-10 rounded-lg font-mono text-xs w-full", idConflict && "border-destructive")} placeholder="产品 ID" />
                {idConflict && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-destructive" />}
             </div>

             {/* 智译覆盖率指示器 */}
             <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 cursor-help px-3 py-1.5 bg-muted/10 rounded-lg border border-border/40 hover:bg-muted/20 transition-all">
                      <BarChart3 className="h-3.5 w-3.5 text-primary opacity-60" />
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] font-bold h-4 px-1 border-none",
                          translationCoverage.global === 100 ? "text-green-600 bg-green-50" : 
                          translationCoverage.global > 70 ? "text-orange-600 bg-orange-50" : "text-muted-foreground bg-muted/20"
                        )}
                      >
                        翻译覆盖率 {translationCoverage.global}%
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end" sideOffset={8} className="w-56 p-4 rounded-xl shadow-2xl border-border/40 bg-white/95 backdrop-blur-xl">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">智译健康度诊断</span>
                        <Badge variant="secondary" className="text-[8px]">{translationCoverage.global}%</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="opacity-60 font-medium">基础信息配置</span>
                          <span className={cn("font-bold", translationCoverage.basic === 100 ? "text-green-600" : "text-orange-600")}>{translationCoverage.basic}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="opacity-60 font-medium">技术规格矩阵</span>
                          <span className={cn("font-bold", translationCoverage.specs === 100 ? "text-green-600" : "text-orange-600")}>{translationCoverage.specs}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="opacity-60 font-medium">产品详细介绍</span>
                          <span className={cn("font-bold", translationCoverage.details === 100 ? "text-green-600" : "text-orange-600")}>{translationCoverage.details}%</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground pt-1 italic leading-relaxed border-t border-dashed mt-2">提示：英文字段缺失会影响全球站点的 SEO 权重与展示完整度。</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
             </TooltipProvider>

             <Select value={formData.status} onValueChange={(v:any) => setFormData({...formData, status: v})}>
               <SelectTrigger className={cn("h-10 rounded-lg border-transparent text-xs font-bold uppercase w-[110px] shrink-0", formData.status === 'published' ? "bg-green-50 text-green-700" : "bg-muted/30")}><SelectValue /></SelectTrigger>
               <SelectContent className="rounded-lg"><SelectItem value="published" className="text-xs font-bold text-green-600">已发布</SelectItem><SelectItem value="draft" className="text-xs">草稿</SelectItem></SelectContent>
             </Select>
          </div>
        </div>
        <div className="flex gap-2 ml-4 shrink-0">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-lg h-10 px-5 text-xs font-bold uppercase tracking-wider">取消</Button>
          <Button size="sm" onClick={handleSave} className="rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-wider gap-2 shadow-md"><Save className="h-4 w-4" /> 保存</Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4 mb-2">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                <ImageIcon className="h-4 w-4" /> 视觉素材中心
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">主图及细节轮播图配置。</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => openPicker('gallery')} className="h-10 text-xs font-bold uppercase tracking-wider gap-1.5 rounded-lg border-muted-foreground/20">
              <FolderPlus className="h-3.5 w-3.5" /> 批量导入细节图
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 min-w-0">
            <div className="w-full md:w-[264px] flex flex-col gap-2 shrink-0">
              <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">产品主图</Label>
              <div className="relative aspect-square rounded-xl bg-muted/20 border border-dashed border-border/40 overflow-hidden flex items-center justify-center group cursor-pointer transition-colors hover:bg-muted/30">
                {formData.mainImageUrl ? (
                  <>
                    <Image src={formData.mainImageUrl} alt="M" fill className="object-contain p-2" unoptimized />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1.5">
                       <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => openPicker('main')}><Settings className="h-4 w-4" /></Button>
                       <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); setFormData({...formData, mainImageUrl:''}); }}><X className="h-4 w-4" /></Button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center gap-4">
                     <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="flex flex-col h-auto p-3 hover:bg-primary/5 rounded-xl">
                        <Upload className="h-5 w-5 mx-auto mb-1 opacity-40" />
                        <span className="text-[10px] font-bold uppercase opacity-60">上传</span>
                     </Button>
                     <Button variant="ghost" size="sm" onClick={() => openPicker('main')} className="flex flex-col h-auto p-3 hover:bg-primary/5 rounded-xl">
                        <Library className="h-5 w-5 mx-auto mb-1 opacity-40" />
                        <span className="text-[10px] font-bold uppercase opacity-60">素材库</span>
                     </Button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">细节轮播图 ({formData.galleryUrls.length})</Label>
              <div className="flex-1 flex gap-4 p-3 bg-muted/5 rounded-xl border border-border/20 overflow-x-auto items-center min-w-0 scrollbar-thin">
                {formData.galleryUrls.map((url, idx) => (
                  <div key={idx} className="group relative shrink-0 w-[180px] aspect-square bg-white rounded-lg border border-border/10 overflow-hidden shadow-sm transition-all">
                    <Image src={url} alt="G" fill className="object-contain p-2" unoptimized />
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 flex gap-1">
                      <Button variant="destructive" size="icon" className="h-7 w-7 shadow-lg" onClick={() => setFormData({...formData, galleryUrls: formData.galleryUrls.filter((_,i)=>i!==idx)})}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                    <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                      <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm shadow-sm" disabled={idx === 0} onClick={() => handleMoveGalleryImage(idx, 'left')}><ChevronLeft className="h-4 w-4" /></Button>
                      <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm shadow-sm" disabled={idx === formData.galleryUrls.length - 1} onClick={() => handleMoveGalleryImage(idx, 'right')}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {formData.galleryUrls.length === 0 && <div className="flex-1 text-center text-muted-foreground/30 text-[10px] font-bold uppercase tracking-widest italic">尚未导入细节图</div>}
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/30 p-1 rounded-xl mb-6 h-12">
            <TabsTrigger value="basic" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider gap-2"><Info className="h-4 w-4" /> 基础信息配置</TabsTrigger>
            <TabsTrigger value="specs" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider gap-2"><TableProperties className="h-4 w-4" /> 技术规格矩阵</TabsTrigger>
            <TabsTrigger value="details" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider gap-2"><Film className="h-4 w-4" /> 产品详细介绍</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
              <div className="border-b pb-4 mb-6 h-12 flex items-center">
                <div className="space-y-0.5">
                   <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest"><Info className="h-4 w-4" /> 基础信息配置</h3>
                   <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">产品双语标题及简介。</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase text-primary tracking-widest">源文: 中文 (ZH)</Label>
                  <div className="space-y-4">
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">产品标题</Label><Input placeholder="输入中文产品名称" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="h-10 text-xs rounded-lg" /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">简短描述</Label><Textarea placeholder="输入中文简介，建议 100 字以内" value={formData.descZh} onChange={e => setFormData({...formData, descZh: e.target.value})} className="w-full min-h-[120px] rounded-lg p-4 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/20" /></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">目标: 英文 (EN)</Label>
                    <Button 
                      variant="ghost"
                      size="sm" 
                      className="h-8 px-3 text-[10px] gap-1 font-bold text-primary rounded-full ai-btn-glow" 
                      onClick={handleAiTranslateBasicInfo} 
                      disabled={isAiProcessing}
                    >
                      <Sparkles className="h-3.5 w-3.5 ai-icon-gradient" /> 智译
                    </Button>
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PRODUCT TITLE</Label><Input placeholder="ENGLISH PRODUCT NAME" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="h-10 text-xs rounded-lg border-dashed" /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SHORT DESCRIPTION</Label><Textarea placeholder="ENGLISH DESCRIPTION" value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="w-full min-h-[120px] rounded-lg p-4 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 border-dashed" /></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="space-y-4">
            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b pb-4 mb-6 h-12">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest"><TableProperties className="h-4 w-4" /> 硬件规格矩阵</h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">技术参数多语言对照管理。</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost"
                    size="sm" 
                    className="h-10 px-4 text-xs font-bold text-primary rounded-lg ai-btn-glow" 
                    onClick={handleAiTranslateAllSpecs} 
                    disabled={isAiProcessing || formData.specGroups.length === 0}
                  >
                    {isAiProcessing ? <Loader2 className="h-4 w-4 animate-spin ai-icon-gradient" /> : <Sparkles className="h-4 w-4 ai-icon-gradient" />}
                    AI 智译全表
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-10 text-xs font-bold uppercase gap-2 rounded-lg shadow-sm transition-all data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:border-transparent"
                      >
                        <Library className="h-4 w-4" /> 加载模板
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="end">
                      <div className="bg-primary p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Library className="h-4 w-4" />
                          <h4 className="text-[11px] font-bold uppercase tracking-widest">云端规格库</h4>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10" onClick={() => router.refresh()}>
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto bg-white p-1">
                        {specTemplates?.length === 0 ? (
                          <div className="p-8 text-center text-[10px] text-muted-foreground italic uppercase">暂无模板数据</div>
                        ) : specTemplates?.map(tpl => (
                          <div key={tpl.id} className="group flex items-center justify-between p-3 hover:bg-muted/10 transition-colors rounded-xl cursor-pointer" onClick={() => handleApplyTemplate(tpl)}>
                            <span className="text-xs font-medium text-primary line-clamp-1">{tpl.name}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id, tpl.name); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button variant="outline" size="sm" onClick={() => setIsSaveTemplateDialogOpen(true)} className="h-10 text-xs font-bold uppercase gap-2 rounded-lg">
                    <Save className="h-4 w-4" /> 存为模板
                  </Button>
                  <Button size="sm" onClick={() => setFormData({...formData, specGroups: [...formData.specGroups, {uid:`g_${Date.now()}`,titleEn:'',titleZh:'',items:[{uid:`i_${Date.now()}`,labelEn:'',labelZh:'',valueEn:'',valueZh:''}]}]})} className="h-10 text-xs font-bold uppercase gap-2 rounded-lg"><PlusCircle className="h-4 w-4" /> 新增分组</Button>
                </div>
              </div>
              <div className="space-y-6">
                {formData.specGroups.map((group, gIdx) => (
                  <div key={group.uid} className="rounded-xl border overflow-hidden shadow-sm bg-white">
                    <div className="bg-muted/10 px-6 py-3 flex items-center justify-between border-b">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <Input placeholder="分组标题 (ZH)" value={group.titleZh} onChange={e => { const g=[...formData.specGroups]; g[gIdx].titleZh=e.target.value; setFormData({...formData, specGroups:g}); }} className="h-9 text-xs border-none bg-transparent focus:bg-white" />
                        <Input 
                          placeholder="GROUP TITLE (EN)" 
                          value={group.titleEn} 
                          onChange={e => { const g=[...formData.specGroups]; g[gIdx].titleEn=e.target.value; setFormData({...formData, specGroups:g}); }} 
                          className={cn(
                            "h-9 text-xs border-none bg-transparent focus:bg-white border-dashed",
                            processingItems.has(`g_${gIdx}_title`) && "animate-pulse ring-2 ring-primary/20"
                          )} 
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, specGroups: formData.specGroups.filter((_,i)=>i!==gIdx)})} className="ml-4 h-9 w-9 text-destructive/40 hover:text-destructive hover:bg-destructive/5"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    {group.items.map((item, iIdx) => {
                      const labelKey = `i_${gIdx}_${iIdx}_label`;
                      const valueKey = `i_${gIdx}_${iIdx}_value`;
                      const isLabelProcessing = processingItems.has(labelKey);
                      const isValueProcessing = processingItems.has(valueKey);
                      
                      return (
                        <div key={item.uid} className="grid grid-cols-[1fr_1fr_80px] gap-6 px-6 py-4 border-b last:border-b-0 hover:bg-muted/5 transition-colors">
                          <div className="space-y-3">
                             <Input placeholder="参数名称 (ZH)" value={item.labelZh} onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].labelZh=e.target.value; setFormData({...formData, specGroups:g}); }} className="h-10 text-xs" />
                             <Input 
                                placeholder="LABEL (EN)" 
                                value={item.labelEn} 
                                onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].labelEn=e.target.value; setFormData({...formData, specGroups:g}); }} 
                                className={cn(
                                  "h-10 text-xs border-dashed bg-muted/10",
                                  isLabelProcessing && "animate-pulse ring-2 ring-primary/20 bg-accent/5"
                                )} 
                             />
                          </div>
                          <div className="space-y-3">
                             <Input placeholder="参数值 (ZH)" value={item.valueZh} onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].valueZh=e.target.value; setFormData({...formData, specGroups:g}); }} className="h-10 text-xs font-medium" />
                             <Input 
                                placeholder="VALUE (EN)" 
                                value={item.valueEn} 
                                onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].valueEn=e.target.value; setFormData({...formData, specGroups:g}); }} 
                                className={cn(
                                  "h-10 text-xs border-dashed bg-muted/10 font-medium",
                                  isValueProcessing && "animate-pulse ring-2 ring-primary/20 bg-accent/5"
                                )} 
                             />
                          </div>
                          <div className="flex flex-col gap-2 justify-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={cn("h-8 w-8 ai-btn-glow", (isLabelProcessing || isValueProcessing) && "bg-accent")} 
                              onClick={(e) => { e.stopPropagation(); handleAiTranslateSpecItem(gIdx, iIdx); }}
                              disabled={isLabelProcessing || isValueProcessing}
                              title="AI 智译此行"
                            >
                              {(isLabelProcessing || isValueProcessing) ? <Loader2 className="h-4 w-4 animate-spin text-accent-foreground" /> : <Sparkles className="h-4 w-4 ai-icon-gradient" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => { const g=[...formData.specGroups]; g[gIdx].items=g[gIdx].items.filter((_,i)=>i!==iIdx); setFormData({...formData, specGroups:g}); }} 
                              className="h-8 w-8 text-destructive/20 hover:text-destructive hover:bg-destructive/5"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    <button onClick={() => { const g=[...formData.specGroups]; g[gIdx].items.push({uid:`i_${Date.now()}`,labelEn:'',labelZh:'',valueEn:'',valueZh:''}); setFormData({...formData, specGroups:g}); }} className="w-full py-2.5 text-[10px] font-bold uppercase text-primary/40 hover:text-primary hover:bg-muted/10 transition-all border-t">+ 追加规格条目</button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="bg-white p-8 rounded-2xl border shadow-sm min-h-[800px] flex flex-col space-y-6">
              <div className="flex items-center justify-between border-b pb-4 mb-6 h-12">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest"><Film className="h-4 w-4" /> 多语言详情编辑器</h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">支持 HTML 无损存储与 AI 语义排版映射。</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={targetDetailsLang} onValueChange={setTargetDetailsLang}>
                    <SelectTrigger className="h-10 w-28 text-xs font-bold uppercase"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-lg">{supportedLangs.filter(l=>l.code!=='zh').map(l=><SelectItem key={l.code} value={l.code} className="text-xs uppercase">{l.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button 
                    variant="ghost"
                    size="sm" 
                    className="h-10 px-5 text-xs font-bold text-primary rounded-lg ai-btn-glow" 
                    onClick={handleAiTranslateDetails} 
                    disabled={isAiProcessing}
                  >
                    <Sparkles className="h-4 w-4 ai-icon-gradient" /> AI 智译 ({targetDetailsLang.toUpperCase()})
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 flex-1">
                <RichTextEditor ref={zhEditorRef} content={formData.localizedDetails.zh || ''} onChange={v => setFormData({...formData, localizedDetails: {...formData.localizedDetails, zh: v}})} onImageClick={() => openPicker('richtext-zh')} className="min-h-[500px]" />
                <div className="relative flex flex-col min-w-0">
                  <RichTextEditor ref={targetEditorRef} content={formData.localizedDetails[targetDetailsLang] || ''} onChange={v => setFormData({...formData, localizedDetails: {...formData.localizedDetails, [targetDetailsLang]: v}})} onImageClick={() => openPicker('richtext-target')} className="min-h-[500px]" />
                  {isAiProcessing && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
                      <Cpu className="h-10 w-10 text-primary animate-pulse" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">AI 语义排版映射中...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
        <DialogContent className="max-w-md p-0 rounded-2xl overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <div className="flex items-center gap-2">
                 <Save className="h-4 w-4" />
                 <DialogTitle className="text-sm font-bold uppercase tracking-widest">存为技术规格模板</DialogTitle>
              </div>
              <DialogDescription className="text-white/60 text-[10px] uppercase tracking-tight mt-1 font-medium">
                保存后可在其他产品发布时一键回填此套规格。
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 bg-white">
            <div className="bg-muted/20 p-1 rounded-lg flex items-center h-10">
              <button 
                onClick={() => setSaveMode('create')}
                className={cn(
                  "flex-1 h-8 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                  saveMode === 'create' ? "bg-white shadow-sm text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"
                )}
              >
                新建模板
              </button>
              <button 
                onClick={() => setSaveMode('overwrite')}
                className={cn(
                  "flex-1 h-8 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                  saveMode === 'overwrite' ? "bg-white shadow-sm text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"
                )}
              >
                覆盖已有
              </button>
            </div>

            <div className="space-y-4">
              {saveMode === 'create' ? (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-primary uppercase tracking-widest">模板显示名称</Label>
                  <Input 
                    value={newTemplateName} 
                    onChange={e => setNewTemplateName(e.target.value)} 
                    placeholder="如：标准一体机规格 v1" 
                    className="h-10 rounded-lg text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-primary uppercase tracking-widest">选择目标模板</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger className="h-10 rounded-lg text-xs">
                      <SelectValue placeholder="请选择要覆盖的模板..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {specTemplates?.map(tpl => (
                        <SelectItem key={tpl.id} value={tpl.id} className="text-xs">{tpl.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 bg-muted/10 border-t flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsSaveTemplateDialogOpen(false)} 
              className="flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-widest"
            >
              取消
            </Button>
            <Button 
              onClick={handleSaveTemplate} 
              className="flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-widest"
            >
              立即保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-5xl p-0 h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border-none">
          <div className="bg-primary p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">媒体资产库</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={()=>setIsPickerOpen(false)} className="text-white hover:bg-white/10 h-8 w-8"><X className="h-4 w-4" /></Button>
          </div>
          <div className="px-6 py-3 bg-muted/30 border-b flex gap-6 items-center">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-30" /><Input placeholder="搜索素材..." value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} className="pl-9 h-9 border-none bg-white text-xs" /></div>
            <Badge variant="secondary" className="h-9 px-4 text-[10px] font-bold uppercase bg-white text-primary border-none">已选中 {selectedPickerUrls.size} 项</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 bg-muted/5">
            {galleryAssets?.filter(a=>a.title.toLowerCase().includes(pickerSearch.toLowerCase())).map(a=>(
              <div key={a.id} className={cn("group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer shadow-sm", selectedPickerUrls.has(a.url) ? "border-primary scale-95" : "border-transparent bg-white hover:border-primary/20")} onClick={()=>{
                const n=new Set(selectedPickerUrls); 
                if(pickerTarget.includes('main')||pickerTarget.includes('richtext')){ n.clear(); n.add(a.url); } else { n.has(a.url) ? n.delete(a.url) : n.add(a.url); } 
                setSelectedPickerUrls(n); 
              }}>
                <Image src={a.url} alt={a.title} fill className="object-cover" unoptimized />
                {selectedPickerUrls.has(a.url) && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><div className="bg-white text-primary rounded-full p-1 shadow-lg"><Check className="h-3.5 w-3.5" /></div></div>}
              </div>
            ))}
          </div>
          <DialogFooter className="p-4 border-t flex items-center justify-between bg-white">
            <Button variant="ghost" size="sm" onClick={()=>setSelectedPickerUrls(new Set())} className="text-[10px] font-bold text-destructive uppercase tracking-wider">清除选中</Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={()=>setIsPickerOpen(false)} className="px-6 h-10 rounded-lg text-xs font-bold uppercase tracking-widest">取消</Button>
              <Button size="sm" onClick={handleConfirmPicker} disabled={selectedPickerUrls.size===0} className="px-8 h-10 rounded-lg text-xs font-bold uppercase tracking-widest">确认插入</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductEditorPage({ params, searchParams }: { params: Promise<any>, searchParams: Promise<any> }) { 
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20" /></div>}>
      <ProductEditorContent />
    </Suspense>
  ); 
}
