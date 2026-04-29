"use client";

import React, { useState, useEffect, useMemo, Suspense, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
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
  BarChart3,
  HelpCircle
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
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { translateContent } from '@/ai/flows/translate-flow';
import { ShinyButton } from '@/components/ui/shiny-button';
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
  id_?: string;
  vi?: string;
  [key: string]: any;
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

/**
 * 稳健的 JSON 解析工具，处理 AI 返回的常见格式错误
 */
function robustJsonParse(rawStr: string) {
  let jsonStr = (String(rawStr) || '').trim();
  
  // 1. 移除 Markdown 代码块包装
  if (jsonStr.includes('```')) {
    jsonStr = jsonStr.replace(/```json\n?|```/g, '').trim();
  }
  
  try {
    return JSON.parse(jsonStr);
  } catch (initialError) {
    // 2. 容错：处理非法控制字符（如真实换行符）
    const sanitized = jsonStr.replace(/[\u0000-\u001F]+/g, (match) => {
      if (match === '\n') return '\\n';
      if (match === '\r') return '\\r';
      if (match === '\t') return '\\t';
      return '';
    });
    
    try {
      return JSON.parse(sanitized);
    } catch (secondError) {
      console.error('Final JSON Parse Error:', secondError, 'Original String:', jsonStr);
      throw new Error(`AI 返回的 JSON 格式异常，无法解析。请重试或精简内容。`);
    }
  }
}

function ProductEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user;
  const { toast } = useToast();
  const productId = searchParams.get('id');
  const zhEditorRef = useRef<any>(null);
  const targetEditorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // 误删保护状态
  const [isDeleteGroupConfirmOpen, setIsDeleteGroupConfirmOpen] = useState(false);
  const [groupIndexToDelete, setGroupIndexToDelete] = useState<number | null>(null);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'main' | 'gallery' | 'richtext-zh' | 'richtext-target'>('main');
  const [pickerSearch, setPickerSearch] = useState('');
  const [selectedPickerUrls, setSelectedPickerUrls] = useState<Set<string>>(new Set());

  const { data: product, isLoading: isProdLoading } = useLocalDoc<Product>('products', productId || 'new');
  const { data: categories } = useLocalCollection<ProductCategory>('productCategories');
  const { data: translations } = useLocalCollection<LocalizedString>('localizedStrings');
  const { data: galleryAssets } = useLocalCollection<GalleryAsset>('galleryAssets');
  const { data: allProducts } = useLocalCollection<Product>('products');
  const { data: aiConfig } = useLocalDoc<AiConfig>('settings', 'ai');
  const { data: langConfig } = useLocalDoc<AppConfig>('settings', 'languages');
  const { data: specTemplates, mutate: mutateTemplates } = useLocalCollection<SpecTemplate>('specTemplates');

  const supportedLangs = useMemo(() => langConfig?.supportedLanguages || [{ code: 'zh', label: '中文' }, { code: 'en', label: 'English' }], [langConfig]);

  const translationCoverage = useMemo(() => {
    let totalFields = 0;
    let translatedFields = 0;

    // 1. Basic Info
    let basicTotal = 0;
    let basicTranslated = 0;
    
    const nameZh = String(formData.nameZh || '').trim();
    if (nameZh) {
      basicTotal++;
      if (String(formData.nameEn || '').trim()) basicTranslated++;
    }
    
    const descZh = String(formData.descZh || '').trim();
    if (descZh) {
      basicTotal++;
      if (String(formData.descEn || '').trim()) basicTranslated++;
    }
    
    totalFields += basicTotal;
    translatedFields += basicTranslated;

    // 2. Technical Specs
    let specTotal = 0;
    let specTranslated = 0;
    
    formData.specGroups.forEach(group => {
      const gTitleZh = String(group.titleZh || '').trim();
      if (gTitleZh) {
        specTotal++;
        if (String(group.titleEn || '').trim()) specTranslated++;
      }
      
      group.items.forEach(item => {
        const iLabelZh = String(item.labelZh || '').trim();
        if (iLabelZh) {
          specTotal++;
          if (String(item.labelEn || '').trim()) specTranslated++;
        }
        
        const iValueZh = String(item.valueZh || '').trim();
        if (iValueZh) {
          specTotal++;
          if (String(item.valueEn || '').trim()) specTranslated++;
        }
      });
    });
    
    totalFields += specTotal;
    translatedFields += specTranslated;

    // 3. Details (Long-form)
    let detailTotal = 0;
    let detailTranslated = 0;
    
    const zhClean = String(formData.localizedDetails.zh || '').replace(/<[^>]*>/g, '').trim();
    if (zhClean) {
      detailTotal++;
      const enClean = String(formData.localizedDetails.en || '').replace(/<[^>]*>/g, '').trim();
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
      const getT = (id?: string) => translations?.find(t => t.id === id) || { en: '', zh: '' };
      
      const advantages = (product.advantageTextIds || []).map((id, idx) => {
        const t = getT(id);
        return { uid: `adv_${idx}_${Date.now()}`, zh: String(t.zh || ''), en: String(t.en || '') };
      });

      const specGroups = (product.specGroups || []).map((g, gIdx) => {
        const titleT = getT(g.titleId);
        const items = g.items.map((item, iIdx) => ({
          uid: `spec_item_${gIdx}_${iIdx}_${Date.now()}`,
          labelEn: String(getT(item.labelId).en || ''),
          labelZh: String(getT(item.labelId).zh || ''),
          valueEn: String(getT(item.valueId).en || ''),
          valueZh: String(getT(item.valueId).zh || '')
        }));
        return { uid: `spec_group_${gIdx}_${Date.now()}`, titleEn: String(titleT.en || ''), titleZh: String(titleT.zh || ''), items };
      });

      setFormData({
        id: product.id,
        categoryId: product.productCategoryId,
        mainImageUrl: product.mainImageUrl,
        galleryUrls: product.galleryImageUrls || [],
        nameEn: String(getT(product.nameTextId).en || ''),
        nameZh: String(getT(product.nameTextId).zh || ''),
        descEn: String(getT(product.descriptionTextId).en || ''),
        descZh: String(getT(product.descriptionTextId).zh || ''),
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

  const handleSave = async () => {
    if (!formData.id || !formData.categoryId) {
      toast({ variant: "destructive", title: "请填写完整产品 ID 和分类" });
      return;
    }
    if (idConflict) {
      toast({ variant: "destructive", title: "ID 已被占用" });
      return;
    }

    try {
      const saveLang = async (en: any, zh: any, defaultId: string) => {
        const res = await fetch(`/api/localizedStrings/${defaultId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: defaultId, en: String(en || '').trim(), zh: String(zh || '').trim() }),
        });
        if (!res.ok) throw new Error(`翻译词条 ${defaultId} 保存失败`);
        return defaultId;
      };

      const nameId = await saveLang(formData.nameEn, formData.nameZh, `prod_name_${formData.id}`);
      const descId = await saveLang(formData.descEn, formData.descZh, `prod_desc_${formData.id}`);
      
      const advantageIds = await Promise.all(
        formData.advantages.filter(a => a.zh || a.en).map((adv, idx) => 
          saveLang(adv.en, adv.zh, `prod_adv_${formData.id}_${idx}`)
        )
      );

      const savedSpecGroups = await Promise.all(
        formData.specGroups.map(async (group, gIdx) => {
          const titleId = await saveLang(group.titleEn, group.titleZh, `prod_spec_group_${formData.id}_${gIdx}`);
          const items = await Promise.all(
            group.items.map(async (item, iIdx) => ({
              labelId: await saveLang(item.labelEn, item.labelZh, `prod_spec_lbl_${formData.id}_${gIdx}_${iIdx}`),
              valueId: await saveLang(item.valueEn, item.valueZh, `prod_spec_val_${formData.id}_${gIdx}_${iIdx}`)
            }))
          );
          return { titleId, items };
        })
      );

      const resProd = await fetch(`/api/products/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id, 
          nameTextId: nameId, 
          descriptionTextId: descId, 
          localizedDetails: formData.localizedDetails,
          advantageTextIds: advantageIds, 
          specGroups: savedSpecGroups, 
          mainImageUrl: formData.mainImageUrl, 
          categoryId: formData.categoryId, 
          galleryImageUrls: formData.galleryUrls.filter(Boolean), 
          status: formData.status, 
        }),
      });

      if (!resProd.ok) {
        const errorData = await resProd.json();
        throw new Error(errorData.error || '核心产品数据保存失败');
      }

      toast({ title: "产品已保存" });
      router.push('/admin/products');
    } catch (e: any) {
      console.error('Product save error:', e);
      toast({ 
        variant: "destructive", 
        title: "保存失败", 
        description: e.message || "无法完成同步，请检查网络或配置"
      });
    }
  };

  const handleSaveTemplate = async () => {
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

    try {
      const res = await fetch(`/api/specTemplates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: templateId,
          name: templateName,
          specGroups: cleanSpecGroups,
        }),
      });

      if (!res.ok) throw new Error('规格模板同步至服务器失败');

      setIsSaveTemplateDialogOpen(false);
      setNewTemplateName('');
      setSelectedTemplateId('');
      mutateTemplates();
      toast({ title: saveMode === 'create' ? "规格模板已存入云端库" : "模板内容已更新成功" });
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "模板保存失败",
        description: e.message
      });
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`确定要从云端规格库中永久删除模板“${name}”吗？`)) return;
    try {
      await fetch(`/api/specTemplates/${id}`, { method: 'DELETE' });
      mutateTemplates();
      toast({ title: "模板已移除" });
    } catch (e) {
      toast({ variant: "destructive", title: "删除模板失败" });
    }
  };

  const handleApplyTemplate = (template: SpecTemplate) => {
    const mappedGroups = template.specGroups.map((group: any, gIdx: number) => ({
      uid: `tpl_g_${gIdx}_${Date.now()}`,
      titleEn: String(group.titleEn || ''),
      titleZh: String(group.titleZh || ''),
      items: (group.items || []).map((item: any, iIdx: number) => ({
        uid: `tpl_i_${gIdx}_${iIdx}_${Date.now()}`,
        labelEn: String(item.labelEn || ''),
        labelZh: String(item.labelZh || ''),
        valueEn: String(item.valueEn || ''),
        valueZh: String(item.valueZh || '')
      }))
    }));
    setFormData(prev => ({ ...prev, specGroups: [...prev.specGroups, ...mappedGroups] }));
    toast({ title: "已从模板导入规格" });
  };

  const handleDeleteGroup = () => {
    if (groupIndexToDelete !== null) {
      const g = [...formData.specGroups];
      g.splice(groupIndexToDelete, 1);
      setFormData({ ...formData, specGroups: g });
    }
    setIsDeleteGroupConfirmOpen(false);
    setGroupIndexToDelete(null);
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
        String(formData.nameZh || '').trim() ? translateContent({ text: formData.nameZh || '', targetLangs: ['en'], apiKey: aiConfig.apiKey }) : null,
        String(formData.descZh || '').trim() ? translateContent({ text: formData.descZh || '', targetLangs: ['en'], apiKey: aiConfig.apiKey }) : null
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
        text: formData.localizedDetails.zh || '',
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

    const taskMap: Record<string, string> = {};
    const allIds = new Set<string>();

    formData.specGroups.forEach((group, gIdx) => {
      if (String(group.titleZh || '').trim() && !String(group.titleEn || '').trim()) {
        taskMap[`g_${gIdx}`] = group.titleZh;
        allIds.add(`g_${gIdx}_title`);
      }
      group.items.forEach((item, iIdx) => {
        if (String(item.labelZh || '').trim() && !String(item.labelEn || '').trim()) {
          taskMap[`l_${gIdx}_${iIdx}`] = item.labelZh;
          allIds.add(`i_${gIdx}_${iIdx}_label`);
        }
        if (String(item.valueZh || '').trim() && !String(item.labelEn || '').trim()) {
          taskMap[`v_${gIdx}_${iIdx}`] = item.valueZh;
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
      const res = await translateContent({
        text: `Translate these hardware spec items to professional industrial English. 
        Input: ${JSON.stringify(taskMap)}
        Return ONLY valid JSON with same keys. NO markdown.`,
        targetLangs: ['en'],
        model: aiConfig.model,
        apiKey: aiConfig.apiKey
      });

      if (res?.en) {
        const results = robustJsonParse(res.en);
        const newSpecGroups = [...formData.specGroups];

        Object.keys(results).forEach(key => {
          const val = String(results[key] || '');
          if (key.startsWith('g_')) {
            const gIdx = parseInt(key.split('_')[1]);
            if (newSpecGroups[gIdx]) newSpecGroups[gIdx].titleEn = val;
          } else if (key.startsWith('l_')) {
            const parts = key.split('_');
            const gIdx = parseInt(parts[1]);
            const iIdx = parseInt(parts[2]);
            if (newSpecGroups[gIdx]?.items[iIdx]) newSpecGroups[gIdx].items[iIdx].labelEn = val;
          } else if (key.startsWith('v_')) {
            const parts = key.split('_');
            const gIdx = parseInt(parts[1]);
            const iIdx = parseInt(parts[2]);
            if (newSpecGroups[gIdx]?.items[iIdx]) newSpecGroups[gIdx].items[iIdx].valueEn = val;
          }
        });

        setFormData(prev => ({ ...prev, specGroups: newSpecGroups }));
        toast({ title: "全表智译成功" });
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
    if (!String(item.labelZh || '').trim() && !String(item.valueZh || '').trim()) return;
    
    const labelKey = `i_${gIdx}_${iIdx}_label`;
    const valueKey = `i_${gIdx}_${iIdx}_value`;
    setProcessingItems(prev => { const n = new Set(prev); n.add(labelKey); n.add(valueKey); return n; });

    try {
      const payload = { label: String(item.labelZh || ''), value: String(item.valueZh || '') };
      const res = await translateContent({ 
        text: `Translate hardware spec (JSON ONLY): ${JSON.stringify(payload)}. Format: {"label": "...", "value": "..."}`, 
        targetLangs: ['en'], 
        apiKey: aiConfig.apiKey 
      });

      if (res?.en) {
        const parsed = robustJsonParse(res.en);
        const newSpecGroups = [...formData.specGroups];
        newSpecGroups[gIdx].items[iIdx].labelEn = String(parsed.label || '');
        newSpecGroups[gIdx].items[iIdx].valueEn = String(parsed.value || '');
        setFormData({ ...formData, specGroups: newSpecGroups });
        toast({ title: "单条规格智译成功" });
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

  if (isEditing && isProdLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin opacity-20 text-primary" /></div>;

  return (
    <div className="max-w-full w-full mx-auto space-y-10 pb-32 animate-in fade-in duration-700 relative min-h-screen">
      <AiGradientDef />
      
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.01] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/[0.015] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.012] brightness-100 contrast-150" />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between sticky top-[0px] z-50 bg-white/80 backdrop-blur-xl py-4 border-b border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.02)] -mx-8 px-8 relative">
        <div className="flex items-center gap-8 flex-1 min-w-0">
          <div className="flex items-center gap-4 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-12 w-12 hover:bg-slate-500/5 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-0.5">
              <h2 className="text-xl font-headline font-bold text-slate-900 whitespace-nowrap tracking-tight flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Settings className="h-4 w-4" />
                </div>
                {isEditing ? '配置核心资产' : '创建新全息资产'}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pl-11">Management / Resource / Editor</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 min-w-0 max-w-4xl">
             <div className="space-y-1 w-[200px] shrink-0">
               <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">资源归属分类</Label>
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
                 <SelectTrigger className="h-12 rounded-xl bg-slate-500/5 border-transparent text-xs font-bold uppercase tracking-widest text-slate-600 focus:ring-primary/20">
                   <SelectValue placeholder="选择所属分类..." />
                 </SelectTrigger>
                                   <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                    {categories?.map(c => {
                      const trans = translations?.find(t => t.id === c.nameTextId);
                      const name = trans ? (trans.zh || trans.en || c.id) : c.id;
                      return (
                        <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase py-3">
                          {name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
               </Select>
             </div>
             <div className="space-y-1 flex-1 min-w-0">
                <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">资产唯一标识 (ID)</Label>
                <div className="relative group">
                  <Input disabled={isEditing} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className={cn("h-12 rounded-xl bg-slate-500/5 border-transparent font-mono text-xs font-bold w-full focus-visible:ring-primary/20", idConflict && "border-destructive")} placeholder="GLOBAL_RESOURCE_ID" />
                  {idConflict && <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />}
                </div>
             </div>

             <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mt-5 flex items-center gap-2 cursor-help h-12 px-4 bg-slate-500/5 rounded-xl border border-transparent hover:border-primary/20 transition-all">
                      <BarChart3 className="h-4 w-4 text-primary opacity-60" />
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] font-bold h-5 px-2 border-none uppercase tracking-widest",
                          translationCoverage.global === 100 ? "text-green-600 bg-green-50" : 
                          translationCoverage.global > 70 ? "text-orange-600 bg-orange-50" : "text-muted-foreground bg-muted/20"
                        )}
                      >
                        HEALTH {translationCoverage.global}%
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end" sideOffset={12} className="w-64 p-6 rounded-[2rem] shadow-2xl border-white/40 bg-white/95 backdrop-blur-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">智译健康度诊断</span>
                        <Badge variant="secondary" className="text-[9px] font-bold bg-primary/10 text-primary border-none">{translationCoverage.global}%</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-slate-400">基础信息配置</span>
                          <span className={cn(translationCoverage.basic === 100 ? "text-green-600" : "text-orange-600")}>{translationCoverage.basic}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-slate-400">技术规格矩阵</span>
                          <span className={cn(translationCoverage.specs === 100 ? "text-green-600" : "text-orange-600")}>{translationCoverage.specs}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-slate-400">产品详细介绍</span>
                          <span className={cn(translationCoverage.details === 100 ? "text-green-600" : "text-orange-600")}>{translationCoverage.details}%</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 pt-2 italic leading-relaxed border-t border-slate-100 mt-2 font-medium">提示：资产多语言完整度直接影响全球分销渠道的同步质量与 SEO 表现。</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
             </TooltipProvider>

             <div className="space-y-1 w-[120px] shrink-0">
               <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">发布状态</Label>
               <Select value={formData.status} onValueChange={(v:any) => setFormData({...formData, status: v})}>
                 <SelectTrigger className={cn("h-12 rounded-xl border-transparent text-[10px] font-bold uppercase tracking-widest focus:ring-0", formData.status === 'published' ? "bg-green-50 text-green-700 shadow-[0_4px_15px_rgba(34,197,94,0.15)]" : "bg-slate-500/10 text-slate-600")}><SelectValue /></SelectTrigger>
                 <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                   <SelectItem value="published" className="text-[10px] font-bold uppercase py-3 text-green-600">正式发布 (Live)</SelectItem>
                   <SelectItem value="draft" className="text-[10px] font-bold uppercase py-3">草稿备份 (Draft)</SelectItem>
                 </SelectContent>
               </Select>
             </div>
          </div>
        </div>
        <div className="flex gap-3 ml-6 shrink-0 relative z-10">
          <Button variant="outline" size="lg" onClick={() => router.back()} className="rounded-2xl h-14 px-8 text-[10px] font-bold uppercase tracking-widest border-slate-200 hover:bg-slate-50 transition-all">取消编辑</Button>
          <Button onClick={handleSave} className="rounded-2xl h-14 px-10 text-xs font-bold uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Save className="h-5 w-5" /> 同步至云端
          </Button>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex justify-center">
            <TabsList className="bg-white/60 backdrop-blur-md p-1.5 h-16 rounded-[1.5rem] border border-white/40 shadow-sm inline-flex items-center gap-1">
              <TabsTrigger value="basic" className="rounded-2xl h-12 px-8 text-[11px] font-bold uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all duration-500">
                <Settings className="h-4 w-4 mr-2" /> 基础配置
              </TabsTrigger>
              <TabsTrigger value="media" className="rounded-2xl h-12 px-8 text-[11px] font-bold uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all duration-500">
                <ImageIcon className="h-4 w-4 mr-2" /> 媒体矩阵
              </TabsTrigger>
              <TabsTrigger value="specs" className="rounded-2xl h-12 px-8 text-[11px] font-bold uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all duration-500">
                <TableProperties className="h-4 w-4 mr-2" /> 规格参数
              </TabsTrigger>
              <TabsTrigger value="details" className="rounded-2xl h-12 px-8 text-[11px] font-bold uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all duration-500">
                <Library className="h-4 w-4 mr-2" /> 详细介绍
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="basic" className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-10">
                <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/40 p-10 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group overflow-hidden">
                   <div className="absolute top-0 left-0 w-2 h-full bg-primary/40 opacity-0 group-focus-within:opacity-100 transition-all" />
                   <div className="space-y-1 border-b border-slate-100 pb-6 relative z-10">
                      <h3 className="text-xl font-headline font-bold text-slate-900 flex items-center gap-3">
                        核心名称与叙述
                        <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-primary/20 text-primary bg-primary/5">CRITICAL</Badge>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nomenclature & Core Narrative</p>
                   </div>

                   <div className="space-y-10 relative z-10">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pl-1">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">产品型号/名称 (中)</Label>
                          {aiConfig?.isEnabled && (
                            <ShinyButton 
                              onClick={handleAiTranslateBasicInfo} 
                              disabled={isAiProcessing} 
                              className="h-7 px-3"
                              shape="capsule"
                            >
                              <div className="flex items-center gap-2">
                                {isAiProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                <span className="text-[9px] font-bold uppercase tracking-widest">极光智译</span>
                              </div>
                            </ShinyButton>
                          )}
                        </div>
                        <Input 
                          value={formData.nameZh} 
                          onChange={e => setFormData({...formData, nameZh: e.target.value})} 
                          className="h-16 rounded-2xl bg-white border-slate-200 text-lg font-bold tracking-tight px-6 focus-visible:ring-primary/20 placeholder:font-normal placeholder:text-slate-300" 
                          placeholder="例如: Heovose Elevate 全能商用一体机" 
                        />
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 pl-1">Product Model / Name (English)</Label>
                          <Input 
                            value={formData.nameEn} 
                            onChange={e => setFormData({...formData, nameEn: e.target.value})} 
                            className="h-14 rounded-2xl bg-slate-500/5 border-dashed border-slate-200 text-sm font-bold tracking-tight px-6 focus-visible:ring-primary/20 placeholder:font-normal placeholder:text-slate-300" 
                            placeholder="e.g. Heovose Elevate Pro AIO Series" 
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 pl-1">产品核心卖点描述 (中/英)</Label>
                        <div className="space-y-4">
                          <div className="relative group/area">
                            <Textarea 
                              value={formData.descZh} 
                              onChange={e => setFormData({...formData, descZh: e.target.value})} 
                              className="min-h-[120px] rounded-[2rem] bg-white border-slate-200 text-sm font-medium leading-relaxed px-6 py-5 focus-visible:ring-primary/20 placeholder:text-slate-300" 
                              placeholder="输入产品的核心优势或市场定位叙述..." 
                            />
                            <div className="absolute top-5 right-6 pointer-events-none opacity-10">
                              <Languages className="h-8 w-8" />
                            </div>
                          </div>
                          <div className="relative group/area">
                            <Textarea 
                              value={formData.descEn} 
                              onChange={e => setFormData({...formData, descEn: e.target.value})} 
                              className="min-h-[120px] rounded-[2rem] bg-slate-500/5 border-dashed border-slate-200 text-sm font-medium leading-relaxed px-6 py-5 focus-visible:ring-primary/20 placeholder:text-slate-300" 
                              placeholder="Product USP Narrative in English..." 
                            />
                          </div>
                        </div>
                      </div>
                   </div>
                </section>
              </div>

              <div className="lg:col-span-5 space-y-10">
                <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/40 p-10 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group overflow-hidden h-full">
                  <div className="space-y-1 border-b border-slate-100 pb-6">
                    <h3 className="text-xl font-headline font-bold text-slate-900 flex items-center gap-3">
                      产品视觉头图
                      <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-slate-200 text-slate-400 bg-slate-50">REQUIRED</Badge>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Visual Asset</p>
                  </div>

                  <div className="space-y-8">
                    <div 
                      className="relative aspect-[4/3] rounded-[2rem] bg-slate-500/5 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:bg-primary/[0.02] hover:border-primary/40 transition-all duration-700"
                      onClick={() => openPicker('main')}
                    >
                      {formData.mainImageUrl ? (
                        <>
                          <Image src={formData.mainImageUrl} alt="Main" fill className="object-contain p-8 transition-transform duration-1000 group-hover:scale-110" unoptimized />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md border border-white/20 scale-50 group-hover:scale-100 transition-transform duration-700">
                              <RotateCcw className="h-6 w-6" />
                            </div>
                            <p className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">更换主视觉资产</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-6 text-slate-400 group-hover:text-primary transition-all duration-500">
                          <div className="h-20 w-20 rounded-[1.75rem] bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <Upload className="h-8 w-8" />
                          </div>
                          <div className="text-center space-y-2">
                             <p className="text-sm font-bold text-slate-900">点击进入资产库选择</p>
                             <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Master Hero Image Selection</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-slate-500/5 p-6 rounded-2xl border border-white/40 space-y-3">
                       <div className="flex items-center gap-3 text-slate-400">
                          <Info className="h-4 w-4 shrink-0" />
                          <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">头图建议规格 (Recommended Specs):</p>
                       </div>
                       <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-7">
                          <li>• PNG/WebP 透明底</li>
                          <li>• 尺寸 1000x1000+</li>
                          <li>• 居中构图</li>
                          <li>• 体积 {'<'} 700KB</li>
                       </ul>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10 focus-visible:outline-none">
            <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/40 p-10 space-y-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group overflow-hidden">
               <div className="space-y-1 border-b border-slate-100 pb-6">
                  <h3 className="text-xl font-headline font-bold text-slate-900 flex items-center gap-3">
                    资产多维矩阵
                    <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-slate-200 text-slate-400 bg-slate-50">GALLERY</Badge>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Multi-dimensional Asset Repository</p>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                  {formData.galleryUrls.map((url, idx) => (
                    <div key={idx} className="group/card relative aspect-square rounded-[2rem] bg-white border border-slate-100 shadow-sm overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                      <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover transition-transform duration-1000 group-hover/card:scale-110" unoptimized />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/card:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                         <div className="flex gap-2">
                           <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg-white/20 border border-white/20 text-white hover:bg-white hover:text-slate-900 transition-all" onClick={() => handleMoveGalleryImage(idx, 'left')} disabled={idx === 0}>
                             <ChevronLeft className="h-4 w-4" />
                           </Button>
                           <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg-white/20 border border-white/20 text-white hover:bg-white hover:text-slate-900 transition-all" onClick={() => handleMoveGalleryImage(idx, 'right')} disabled={idx === formData.galleryUrls.length - 1}>
                             <ChevronRight className="h-4 w-4" />
                           </Button>
                         </div>
                         <Button variant="destructive" size="sm" className="rounded-xl h-8 px-4 text-[9px] font-bold uppercase tracking-widest shadow-2xl" onClick={() => setFormData(prev => ({ ...prev, galleryUrls: prev.galleryUrls.filter((_, i) => i !== idx) }))}>
                           <Trash2 className="h-3 w-3 mr-2" /> 移除资产
                         </Button>
                      </div>
                      <div className="absolute top-3 left-3">
                         <Badge className="bg-black/40 backdrop-blur-md border-none text-[8px] font-bold h-5 px-2">#{idx + 1}</Badge>
                      </div>
                    </div>
                  ))}
                  <div 
                    className="aspect-square rounded-[2rem] bg-slate-500/5 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/[0.02] hover:border-primary/40 transition-all duration-500 group/add"
                    onClick={() => openPicker('gallery')}
                  >
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover/add:scale-110 group-hover/add:bg-primary group-hover/add:text-white transition-all duration-500">
                      <PlusCircle className="h-7 w-7" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">添加矩阵资产</p>
                  </div>
               </div>
            </section>
          </TabsContent>

          <TabsContent value="specs" className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10 focus-visible:outline-none">
            <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-white/40 shadow-sm">
               <div className="space-y-1">
                  <h3 className="text-xl font-headline font-bold text-slate-900 flex items-center gap-3">
                    规格参数矩阵
                    <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-slate-200 text-slate-400 bg-slate-50">TECHNICAL</Badge>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hardware Configuration & Specification Matrix</p>
               </div>
               <div className="flex gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                       <Button variant="outline" className="rounded-2xl h-12 px-6 text-[10px] font-bold uppercase tracking-widest border-slate-200 gap-2 hover:bg-slate-50">
                         <Library className="h-4 w-4" /> 导入行业模板
                       </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 rounded-[2rem] border-slate-200 shadow-2xl overflow-hidden" align="end">
                       <div className="bg-slate-900 p-5 text-white">
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">SPEC TEMPLATES LIBRARY</p>
                       </div>
                       <div className="p-4 max-h-[300px] overflow-y-auto space-y-1">
                          {specTemplates?.map(tpl => (
                            <div key={tpl.id} className="flex items-center justify-between group p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer" onClick={() => handleApplyTemplate(tpl)}>
                               <span className="text-xs font-bold text-slate-700">{tpl.name}</span>
                               <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive/40 hover:text-destructive hover:bg-destructive/5" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id, tpl.name); }}>
                                 <Trash2 className="h-3.5 w-3.5" />
                               </Button>
                            </div>
                          ))}
                       </div>
                    </PopoverContent>
                  </Popover>

                  {aiConfig?.isEnabled && (
                    <ShinyButton 
                      onClick={handleAiTranslateAllSpecs} 
                      disabled={isAiProcessing} 
                      className="h-12 px-6"
                      shape="capsule"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">矩阵全智译</span>
                      </div>
                    </ShinyButton>
                  )}
                  
                  <Button className="rounded-2xl h-12 px-8 text-[10px] font-bold uppercase tracking-widest gap-2" onClick={() => setFormData({ ...formData, specGroups: [...formData.specGroups, { uid: `g_${Date.now()}`, titleEn: '', titleZh: '', items: [] }] })}>
                    <PlusCircle className="h-4 w-4" /> 新增规格分组
                  </Button>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
              {formData.specGroups.map((group, gIdx) => (
                <section key={group.uid} className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group/group relative">
                  <div className="bg-slate-500/[0.03] p-8 border-b border-white/40 flex items-center justify-between">
                    <div className="flex-1 max-w-2xl grid grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                         <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">分组标题 (中)</Label>
                         <Input value={group.titleZh} onChange={e => { const g = [...formData.specGroups]; g[gIdx].titleZh = e.target.value; setFormData({ ...formData, specGroups: g }); }} className="h-11 rounded-xl bg-white border-slate-200 text-sm font-bold tracking-tight focus-visible:ring-primary/20" placeholder="例如: 处理器性能" />
                       </div>
                       <div className="space-y-1.5">
                         <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">Group Title (English)</Label>
                         <Input value={group.titleEn} onChange={e => { const g = [...formData.specGroups]; g[gIdx].titleEn = e.target.value; setFormData({ ...formData, specGroups: g }); }} className="h-11 rounded-xl bg-slate-500/5 border-dashed border-slate-200 text-sm font-bold tracking-tight focus-visible:ring-primary/20" placeholder="e.g. CPU Performance" />
                       </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover/group:opacity-100 transition-all translate-x-4 group-hover/group:translate-x-0">
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/5" onClick={() => { setGroupIndexToDelete(gIdx); setIsDeleteGroupConfirmOpen(true); }}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-4">
                    {group.items.map((item, iIdx) => (
                      <div key={item.uid} className="grid grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="col-span-3 space-y-1.5">
                           {iIdx === 0 && <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">参数名 (中/英)</Label>}
                           <div className="space-y-2">
                             <Input value={item.labelZh} onChange={e => { const g = [...formData.specGroups]; g[gIdx].items[iIdx].labelZh = e.target.value; setFormData({ ...formData, specGroups: g }); }} className="h-11 rounded-xl bg-white border-slate-200 text-xs font-bold" placeholder="标签 (中)" />
                             <Input value={item.labelEn} onChange={e => { const g = [...formData.specGroups]; g[gIdx].items[iIdx].labelEn = e.target.value; setFormData({ ...formData, specGroups: g }); }} className="h-9 rounded-lg bg-slate-500/5 border-dashed border-slate-200 text-[10px] font-bold" placeholder="Label (En)" />
                           </div>
                        </div>
                        <div className="col-span-8 space-y-1.5">
                           {iIdx === 0 && <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">参数值 (中/英)</Label>}
                           <div className="flex gap-4">
                              <div className="flex-1 space-y-2">
                                <Input value={item.valueZh} onChange={e => { const g = [...formData.specGroups]; g[gIdx].items[iIdx].valueZh = e.target.value; setFormData({ ...formData, specGroups: g }); }} className="h-11 rounded-xl bg-white border-slate-200 text-xs font-medium" placeholder="数值内容 (中)" />
                                <Input value={item.valueEn} onChange={e => { const g = [...formData.specGroups]; g[gIdx].items[iIdx].valueEn = e.target.value; setFormData({ ...formData, specGroups: g }); }} className="h-9 rounded-lg bg-slate-500/5 border-dashed border-slate-200 text-[10px] font-medium" placeholder="Value Content (En)" />
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                {aiConfig?.isEnabled && (
                                  <ShinyButton 
                                    onClick={() => handleAiTranslateSpecItem(gIdx, iIdx)} 
                                    disabled={isAiProcessing}
                                    className="w-11 h-11 !p-0 flex items-center justify-center"
                                    shape="rounded"
                                  >
                                    <Sparkles className={cn("h-4 w-4", processingItems.has(`i_${gIdx}_${iIdx}_label`) && "animate-spin")} />
                                  </ShinyButton>
                                )}
                              </div>
                           </div>
                        </div>
                        <div className="col-span-1 pb-1">
                           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/5" onClick={() => { const g = [...formData.specGroups]; g[gIdx].items.splice(iIdx, 1); setFormData({ ...formData, specGroups: g }); }}>
                             <X className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all mt-4" onClick={() => { const g = [...formData.specGroups]; g[gIdx].items.push({ uid: `i_${Date.now()}`, labelEn: '', labelZh: '', valueEn: '', valueZh: '' }); setFormData({ ...formData, specGroups: g }); }}>
                      <PlusCircle className="h-4 w-4 mr-2" /> 添加参数项 (ADD ENTRY)
                    </Button>
                  </div>
                </section>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10 focus-visible:outline-none">
            <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/40 p-10 space-y-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group overflow-hidden">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                  <div className="space-y-1">
                    <h3 className="text-xl font-headline font-bold text-slate-900 flex items-center gap-3">
                      全息图文叙述
                      <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-slate-200 text-slate-400 bg-slate-50">STORYTELLING</Badge>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Product Story & Narrative Construction</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-500/5 p-2 rounded-2xl border border-white/40">
                     <Select value={targetDetailsLang} onValueChange={setTargetDetailsLang}>
                        <SelectTrigger className="h-10 rounded-xl bg-white border-transparent text-[10px] font-bold uppercase tracking-widest w-[140px] shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                           {supportedLangs.filter(l => l.code !== 'zh').map(l => (
                             <SelectItem key={l.code} value={l.code} className="text-[10px] font-bold uppercase py-3">{l.label}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     {aiConfig?.isEnabled && (
                        <ShinyButton 
                          onClick={handleAiTranslateDetails} 
                          disabled={isAiProcessing} 
                          className="h-10 px-6"
                          shape="capsule"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">深度智译同步</span>
                          </div>
                        </ShinyButton>
                     )}
                  </div>
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 pl-1">源语言叙述 (ZH-CN)</Label>
                    <div className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <RichTextEditor 
                        ref={zhEditorRef}
                        content={formData.localizedDetails.zh} 
                        onChange={c => setFormData({ ...formData, localizedDetails: { ...formData.localizedDetails, zh: c } })} 
                        placeholder="在此编排产品的视觉故事与核心卖点..."
                        onImageClick={() => openPicker('richtext-zh')}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 pl-1">智译同步目标 (GLOBAL)</Label>
                    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-500/5 overflow-hidden focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <RichTextEditor 
                        ref={targetEditorRef}
                        content={formData.localizedDetails[targetDetailsLang] || ''} 
                        onChange={c => setFormData({ ...formData, localizedDetails: { ...formData.localizedDetails, [targetDetailsLang]: c } })} 
                        placeholder="Waiting for AI orchestration or manual input..."
                        onImageClick={() => openPicker('richtext-target')}
                      />
                    </div>
                  </div>
               </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* 极简安全确认: 删除规格组 */}
      <Dialog open={isDeleteGroupConfirmOpen} onOpenChange={setIsDeleteGroupConfirmOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-sm p-8 border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] bg-white/95 backdrop-blur-2xl">
          <div className="space-y-6 text-center">
             <div className="h-20 w-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto scale-110">
                <Trash2 className="h-10 w-10" />
             </div>
             <div className="space-y-2">
                <h4 className="text-xl font-headline font-bold text-slate-900">移除该参数矩阵？</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">此操作将永久清空该分组下的所有规格映射。建议在云端已存有备份时进行该操作。</p>
             </div>
             <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsDeleteGroupConfirmOpen(false)} className="flex-1 rounded-2xl h-12 font-bold uppercase text-[10px] tracking-widest border-slate-200">撤回</Button>
                <Button variant="destructive" onClick={handleDeleteGroup} className="flex-1 rounded-2xl h-12 font-bold uppercase text-[10px] tracking-widest shadow-xl shadow-destructive/20">确认移除</Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 存为模板 Dialog */}
      <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-md p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Library className="h-20 w-20" />
             </div>
             <DialogHeader className="relative z-10 space-y-1">
                <DialogTitle className="text-xl font-headline font-bold flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Library className="h-5 w-5" />
                  </div>
                  同步至云端规格库
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Technical Template Repository</DialogDescription>
             </DialogHeader>
          </div>
          <div className="p-8 space-y-8 bg-white/90 backdrop-blur-2xl">
             <div className="grid grid-cols-2 p-1 bg-slate-500/5 rounded-2xl border border-slate-100">
                <Button variant={saveMode === 'create' ? 'secondary' : 'ghost'} onClick={() => setSaveMode('create')} className="rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest">另存为新模板</Button>
                <Button variant={saveMode === 'overwrite' ? 'secondary' : 'ghost'} onClick={() => setSaveMode('overwrite')} className="rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest">覆盖现有模板</Button>
             </div>
             
             {saveMode === 'create' ? (
                <div className="space-y-2.5">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">新模板命名</Label>
                   <Input value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} className="h-12 rounded-xl bg-slate-500/5 border-transparent text-sm font-bold placeholder:font-normal" placeholder="例如：高端一体机标准规格" />
                </div>
             ) : (
                <div className="space-y-2.5">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">选择目标模板</Label>
                   <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-500/5 border-transparent text-sm font-bold uppercase tracking-widest">
                         <SelectValue placeholder="选择模板..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                         {specTemplates?.map(tpl => (
                           <SelectItem key={tpl.id} value={tpl.id} className="text-[10px] font-bold uppercase py-3">{tpl.name}</SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                </div>
             )}
          </div>
          <DialogFooter className="bg-slate-50 p-8 border-t border-slate-200 gap-3">
             <Button variant="outline" onClick={() => setIsSaveTemplateDialogOpen(false)} className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs tracking-widest border-slate-200">返回</Button>
             <Button onClick={handleSaveTemplate} className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs tracking-widest shadow-xl shadow-primary/20">确认同步模板</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 媒体资产库选择器 */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-6xl p-0 h-[85vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-none bg-white/95 backdrop-blur-3xl">
          <div className="bg-slate-900 p-8 text-white flex items-center justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <ImageIcon className="h-24 w-24" />
             </div>
             <div className="flex items-center gap-4 relative z-10">
               <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                 <ImageIcon className="h-5 w-5" />
               </div>
               <div>
                 <DialogTitle className="text-xl font-headline font-bold tracking-tight">选择资产缩略图</DialogTitle>
                 <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Asset Library Selector</DialogDescription>
               </div>
             </div>
             <Button variant="ghost" size="icon" onClick={() => setIsPickerOpen(false)} className="text-white hover:bg-white/10 h-10 w-10 relative z-10"><X className="h-5 w-5" /></Button>
          </div>
          
          <div className="px-8 py-5 bg-slate-500/5 border-b border-slate-200 flex gap-6 items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="搜索素材标题 / SEARCH ASSETS..." 
                value={pickerSearch} 
                onChange={e => setPickerSearch(e.target.value)} 
                className="pl-11 h-12 border-none bg-white text-xs font-medium rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-primary/10" 
              />
            </div>
            {pickerTarget === 'gallery' && (
              <Button onClick={handleConfirmPicker} className="rounded-xl h-12 px-8 text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20">确认添加已选项</Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 bg-slate-50/50">
            {galleryAssets?.filter((a: any) => (a.title || '').toLowerCase().includes(pickerSearch.toLowerCase())).map((a: any) => (
              <div 
                key={a.id} 
                className={cn(
                  "group relative aspect-square rounded-[1.25rem] overflow-hidden border-2 transition-all duration-500 cursor-pointer shadow-sm bg-white", 
                  selectedPickerUrls.has(a.url) 
                    ? "border-primary scale-95 ring-4 ring-primary/10" 
                    : "border-transparent hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl"
                )} 
                onClick={() => {
                  if (pickerTarget === 'gallery') {
                    const next = new Set(selectedPickerUrls);
                    if (next.has(a.url)) next.delete(a.url);
                    else next.add(a.url);
                    setSelectedPickerUrls(next);
                  } else {
                    if (pickerTarget === 'main') setFormData({ ...formData, mainImageUrl: a.url });
                    else if (pickerTarget === 'richtext-zh') zhEditorRef.current?.editor?.commands.setImage({ src: a.url });
                    else if (pickerTarget === 'richtext-target') targetEditorRef.current?.editor?.commands.setImage({ src: a.url });
                    setIsPickerOpen(false);
                  }
                }}
              >
                <Image src={a.url} alt={a.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                {selectedPickerUrls.has(a.url) && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in duration-300">
                    <div className="bg-white text-primary rounded-full p-1.5 shadow-2xl scale-125"><Check className="h-4 w-4 stroke-[3px]" /></div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[8px] font-bold text-white uppercase truncate tracking-widest">{a.title}</p>
                </div>
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

export default function ProductEditorPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20 text-primary" /></div>}>
      <ProductEditorContent />
    </Suspense>
  );
}
