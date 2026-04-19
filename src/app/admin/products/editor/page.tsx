"use client";

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Globe,
  Sparkles,
  AlertCircle,
  LayoutTemplate,
  History,
  Film,
  ChevronLeft,
  ChevronRight,
  Plus,
  Cpu
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { translateContent } from '@/ai/flows/translate-flow';
import { Progress } from '@/components/ui/progress';
import { TooltipProvider } from '@/components/ui/tooltip';
import RichTextEditor from '@/components/RichTextEditor';

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
  
  // 富文本编辑器引用
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
  const [idConflict, setIdConflict] = useState(false);

  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [saveTemplateMode, setSaveTemplateMode] = useState<'create' | 'update'>('create');
  const [targetTemplateId, setTargetTemplateId] = useState<string>('');
  const [newTemplateName, setNewTemplateName] = useState('');

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

  const translationMetrics = useMemo(() => {
    const fields = [formData.nameZh, formData.nameEn, formData.descZh, formData.descEn, formData.localizedDetails.zh, formData.localizedDetails.en];
    const filled = fields.filter(f => f && f.trim().length > 0).length;
    return (filled / fields.length) * 100;
  }, [formData]);

  const handleSave = () => {
    if (!firestore || !formData.id || !formData.categoryId) {
      toast({ variant: "destructive", title: "请填写完整产品 ID 和分类" });
      return;
    }

    if (idConflict) {
      toast({ variant: "destructive", title: "ID 已被占用", description: "请更换唯一的 ID 后再尝试保存。" });
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

  const handleApplyTemplate = (tpl: SpecTemplate) => {
    const newGroups: ProductSpecGroup[] = tpl.specGroups.map((g, gIdx) => ({
      uid: `tpl_g_${gIdx}_${Date.now()}`,
      titleEn: g.titleEn || '',
      titleZh: g.titleZh || '',
      items: g.items.map((i: any, iIdx: number) => ({
        uid: `tpl_i_${gIdx}_${iIdx}_${Date.now()}`,
        labelEn: i.labelEn || '',
        labelZh: i.labelZh || '',
        valueEn: i.valueEn || '',
        valueZh: i.valueZh || ''
      }))
    }));

    setFormData({ ...formData, specGroups: newGroups });
    toast({ title: "模板已应用" });
  };

  const handleSaveTemplate = () => {
    if (!firestore) return;
    if (saveTemplateMode === 'create' && !newTemplateName) {
      toast({ variant: "destructive", title: "请输入模板名称" });
      return;
    }
    if (saveTemplateMode === 'update' && !targetTemplateId) {
      toast({ variant: "destructive", title: "请选择要覆盖的模板" });
      return;
    }

    const tplName = saveTemplateMode === 'create' ? newTemplateName : specTemplates?.find(t => t.id === targetTemplateId)?.name || '未命名模板';
    const tplId = saveTemplateMode === 'create' ? `tpl_${Date.now()}` : targetTemplateId;

    const tplData = {
      id: tplId,
      name: tplName,
      specGroups: formData.specGroups.map(g => ({
        titleZh: g.titleZh,
        titleEn: g.titleEn,
        items: g.items.map(i => ({
          labelZh: i.labelZh,
          labelEn: i.labelEn,
          valueZh: i.valueZh,
          valueEn: i.valueEn
        }))
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    setDocumentNonBlocking(doc(firestore, 'specTemplates', tplId), tplData, { merge: true });
    setIsSaveTemplateDialogOpen(false);
    setNewTemplateName('');
    toast({ title: `模板 "${tplName}" 已保存` });
  };

  const handleDeleteTemplate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!firestore || !confirm('确定要删除此模板吗？')) return;
    deleteDocumentNonBlocking(doc(firestore, 'specTemplates', id));
    toast({ title: "模板已删除" });
  };

  const handleAiTranslateBasicInfo = async () => {
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 翻译未启用", description: "请先在 AI 设置页面开启引擎。" });
      return;
    }
    setIsAiProcessing(true);
    try {
      const tasks = [];
      if (formData.nameZh.trim()) {
        tasks.push(translateContent({ text: formData.nameZh, sourceLang: 'zh', targetLangs: ['en'], model: aiConfig.model }).then(res => ({ field: 'nameEn', text: res.en })));
      }
      if (formData.descZh.trim()) {
        tasks.push(translateContent({ text: formData.descZh, sourceLang: 'zh', targetLangs: ['en'], model: aiConfig.model }).then(res => ({ field: 'descEn', text: res.en })));
      }
      const results = await Promise.all(tasks);
      const updates: any = {};
      results.forEach(r => { if (r.text) updates[r.field] = r.text; });
      setFormData(prev => ({ ...prev, ...updates }));
      toast({ title: "基础信息智译成功" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "AI 翻译失败", description: e.message || "请求超时或模型异常。" });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiTranslateDetails = async () => {
    const sourceHtml = formData.localizedDetails.zh;
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 智译未就绪", description: "请前往系统设置启用 AI 引擎。" });
      return;
    }
    if (!sourceHtml || sourceHtml.replace(/<[^>]*>?/gm, '').trim().length === 0) {
      toast({ variant: "destructive", title: "内容为空", description: "请先录入中文详情后再进行翻译。" });
      return;
    }
    
    setIsAiProcessing(true);
    try {
      const result = await translateContent({
        text: sourceHtml,
        sourceLang: 'zh',
        targetLangs: [targetDetailsLang],
        model: aiConfig.model
      });
      
      const translatedHtml = result[targetDetailsLang];
      if (translatedHtml) {
        setFormData(prev => ({ 
          ...prev, 
          localizedDetails: {
            ...prev.localizedDetails,
            [targetDetailsLang]: translatedHtml
          }
        }));
        toast({ title: `详情介绍 (${targetDetailsLang.toUpperCase()}) 智译成功` });
      } else {
        toast({ variant: "destructive", title: "翻译返回异常", description: "AI 未返回有效译文，请重试。" });
      }
    } catch (e: any) {
      console.error("Detail Translation Error:", e);
      toast({ variant: "destructive", title: "AI 智译中断", description: e.message || "长文内容可能超限，请尝试分段处理。" });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiTranslateSpec = async (gIdx: number, iIdx: number, text: string, type: 'label' | 'value') => {
    if (!aiConfig?.isEnabled || !text.trim()) return;
    setIsAiProcessing(true);
    try {
      const result = await translateContent({ text, sourceLang: 'zh', targetLangs: ['en'], model: aiConfig.model });
      if (result.en) {
        const newGroups = [...formData.specGroups];
        if (type === 'label') newGroups[gIdx].items[iIdx].labelEn = result.en;
        else newGroups[gIdx].items[iIdx].valueEn = result.en;
        setFormData(prev => ({...prev, specGroups: newGroups}));
      }
    } catch (e) {
      toast({ variant: "destructive", title: "AI 翻译失败" });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firestore) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setFormData(prev => ({ ...prev, mainImageUrl: base64 }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const openPicker = (target: 'main' | 'gallery' | 'richtext-zh' | 'richtext-target') => {
    setPickerTarget(target);
    setSelectedPickerUrls(new Set());
    setIsPickerOpen(true);
  };

  const togglePickerSelection = (url: string) => {
    const newSelected = new Set(selectedPickerUrls);
    if (pickerTarget === 'main' || pickerTarget.startsWith('richtext')) { newSelected.clear(); newSelected.add(url); }
    else { newSelected.has(url) ? newSelected.delete(url) : newSelected.add(url); }
    setSelectedPickerUrls(newSelected);
  };

  const handleConfirmPicker = () => {
    const urls = Array.from(selectedPickerUrls);
    if (urls.length === 0) return;
    
    if (pickerTarget === 'main') {
      setFormData({ ...formData, mainImageUrl: urls[0] });
    } else if (pickerTarget === 'gallery') {
      setFormData({ ...formData, galleryUrls: [...formData.galleryUrls, ...urls] });
    } else if (pickerTarget === 'richtext-zh') {
      zhEditorRef.current?.editor?.commands.setImage({ src: urls[0] });
    } else if (pickerTarget === 'richtext-target') {
      targetEditorRef.current?.editor?.commands.setImage({ src: urls[0] });
    }
    
    setIsPickerOpen(false);
  };

  const moveGalleryImage = (index: number, direction: 'left' | 'right') => {
    const newUrls = [...formData.galleryUrls];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newUrls.length) return;
    [newUrls[index], newUrls[targetIndex]] = [newUrls[targetIndex], newUrls[index]];
    setFormData({ ...formData, galleryUrls: newUrls });
  };

  if (isEditing && isProdLoading) return <div className="h-[60vh] flex flex-col items-center justify-center gap-4"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex items-center justify-between sticky top-16 z-40 bg-background/95 backdrop-blur-md py-3 border-b border-border/40 px-4 shadow-sm">
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
            <h2 className="text-lg font-headline font-bold text-primary whitespace-nowrap">{isEditing ? '编辑产品' : '发布产品'}</h2>
          </div>
          <div className="h-6 w-px bg-border/60 mx-1 hidden md:block" />
          <div className="flex items-center gap-3 flex-1 max-w-4xl">
             <div className="flex-1 max-w-[200px]">
                <Select 
                  value={formData.categoryId} 
                  onValueChange={v => {
                    setFormData(prev => {
                      const updates: any = { categoryId: v };
                      if (!isEditing) {
                        const catName = v.toUpperCase().replace(/\s+/g, '_');
                        const date = new Date();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        const rc = Math.random().toString(36).substring(2, 6).toUpperCase();
                        updates.id = `PROD_${catName}_${mm}${dd}_${rc}`;
                      }
                      return { ...prev, ...updates };
                    });
                  }}
                >
                  <SelectTrigger className="h-9 rounded-lg bg-muted/20 border-transparent text-xs">
                    <SelectValue placeholder="选择产品分类..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories?.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.id}</SelectItem>)}
                  </SelectContent>
                </Select>
             </div>
             <div className="flex-[1.5] max-w-[300px] relative group">
                <input 
                  type="text"
                  disabled={isEditing} 
                  value={formData.id} 
                  onChange={e => setFormData({...formData, id: e.target.value})} 
                  className={cn(
                    "flex h-9 w-full rounded-lg bg-muted/10 border border-transparent px-3 py-2 text-xs font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 pr-8 transition-all",
                    idConflict && "text-destructive border-destructive/30 bg-destructive/5"
                  )} 
                  placeholder="产品 ID..."
                />
                {idConflict && (
                  <TooltipProvider>
                    <Popover>
                      <PopoverTrigger asChild>
                        <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive cursor-help animate-pulse" />
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3 text-[10px] bg-destructive text-white border-none rounded-xl">
                        此 ID 已被占用，请修改。
                      </PopoverContent>
                    </Popover>
                  </TooltipProvider>
                )}
             </div>
             <div className="flex-1 max-w-[140px]">
                <Select value={formData.status} onValueChange={(v: 'published'|'draft') => setFormData({...formData, status: v})}>
                  <SelectTrigger className={cn("h-9 rounded-lg border-transparent text-[10px] font-bold uppercase tracking-wider", formData.status === 'published' ? "bg-green-50 text-green-700" : "bg-muted/30 text-muted-foreground")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="published" className="text-xs font-bold text-green-600">已发布</SelectItem>
                    <SelectItem value="draft" className="text-xs font-bold">草稿</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col items-end gap-1 min-w-[100px]">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">翻译完成度 {Math.round(translationMetrics)}%</span>
            <Progress value={translationMetrics} className="h-1 w-full bg-muted" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-lg h-9 px-4 font-bold uppercase tracking-widest text-[10px]">取消</Button>
            <Button size="sm" onClick={handleSave} className="rounded-lg h-9 px-5 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-sm bg-primary hover:bg-primary/90"><Save className="h-3.5 w-3.5" /> 保存变更</Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4">
        <div className="bg-white p-6 rounded-2xl border border-border/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3 h-8">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-primary flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> 产品视觉素材管理
              </h3>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">锁定 11:9 比例展示 (基于 240px 总高校准)</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openPicker('gallery')} className="h-7 rounded-lg text-[9px] font-bold uppercase gap-1.5 border-primary/20 text-primary">
                <FolderPlus className="h-3 w-3" /> 素材库批量导入
              </Button>
            </div>
          </div>

          <div className="flex gap-6 items-start h-[240px]">
            <div className="flex flex-col h-full w-[264px] shrink-0">
              <div className="flex items-center justify-between mb-1.5 h-6">
                <Label className="text-[10px] font-bold uppercase text-primary tracking-widest">主图预览</Label>
                <button onClick={() => openPicker('main')} className="text-[9px] font-bold text-primary hover:underline">库选取</button>
              </div>
              <div className="relative flex-1 rounded-xl bg-muted/20 border border-dashed border-border/60 overflow-hidden flex items-center justify-center group cursor-pointer" onClick={() => !formData.mainImageUrl && fileInputRef.current?.click()}>
                {formData.mainImageUrl ? (
                  <>
                    <Image src={formData.mainImageUrl} alt="Main" fill className="object-contain p-2" unoptimized />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="sm" className="rounded-full h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setFormData({...formData, mainImageUrl: ''}); }}><X className="h-4 w-4" /></Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center opacity-40">
                    {isUploading ? <Loader2 className="h-6 w-6 mx-auto animate-spin" /> : <Upload className="h-6 w-6 mx-auto mb-1" />}
                    <p className="text-[9px] font-bold uppercase">上传主图</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="flex flex-col h-full flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-1.5 h-6">
                <Label className="text-[10px] font-bold uppercase text-primary tracking-widest">详情幻灯片 ({formData.galleryUrls.length})</Label>
                <div className="w-10 h-1" />
              </div>
              <div className="flex flex-nowrap gap-4 p-3 bg-muted/10 rounded-xl border border-border/40 overflow-x-auto h-full items-center">
                {formData.galleryUrls.map((url, idx) => (
                  <div key={`gal-top-${idx}`} className="group relative shrink-0 w-[235px] h-full bg-white rounded-lg border border-border/20 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <Image src={url} alt="Gallery" fill className="object-contain p-2" unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <div className="flex gap-1.5">
                        <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full" disabled={idx === 0} onClick={() => moveGalleryImage(idx, 'left')}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full" disabled={idx === formData.galleryUrls.length - 1} onClick={() => moveGalleryImage(idx, 'right')}><ChevronRight className="h-4 w-4" /></Button>
                      </div>
                      <Button variant="destructive" size="icon" className="h-7 w-7 rounded-full" onClick={() => setFormData({...formData, galleryUrls: formData.galleryUrls.filter((_,i)=>i!==idx)})}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/50 px-1.5 rounded text-[8px] text-white font-mono z-10">{idx + 1}</div>
                  </div>
                ))}
                {formData.galleryUrls.length === 0 && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">暂无详情图</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-muted/30 w-full justify-start gap-1 rounded-xl p-1 mb-4 h-11">
              <TabsTrigger value="basic" className="rounded-lg px-6 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"><Info className="h-3.5 w-3.5" /> 基础信息</TabsTrigger>
              <TabsTrigger value="specs" className="rounded-lg px-6 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"><TableProperties className="h-3.5 w-3.5" /> 技术规格</TabsTrigger>
              <TabsTrigger value="details" className="rounded-lg px-6 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"><Film className="h-3.5 w-3.5" /> 详细介绍</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-border/40 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 mb-2 h-8">
                      <Label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-1.5"><Languages className="h-3 w-3" /> 中文内容</Label>
                      <Button variant="ghost" size="sm" className="h-6 text-[9px] gap-1 px-2 font-bold text-accent" onClick={handleAiTranslateBasicInfo} disabled={isAiProcessing || !aiConfig?.isEnabled}>
                        {isAiProcessing ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Sparkles className="h-2.5 w-2.5" />} AI 智译
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <Input placeholder="产品名称" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="rounded-lg h-10 bg-muted/5" />
                      <textarea placeholder="产品简介..." value={formData.descZh} onChange={e => setFormData({...formData, descZh: e.target.value})} className="flex min-h-[120px] w-full rounded-lg border border-input bg-muted/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 mb-2 h-8">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-1.5"><Globe className="h-3 w-3" /> 英文内容</Label>
                      <div className="w-10 h-1" />
                    </div>
                    <div className="space-y-4">
                      <Input placeholder="Product Name" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-lg h-10 bg-muted/5" />
                      <textarea placeholder="Short Description..." value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="flex min-h-[120px] w-full rounded-lg border border-input bg-muted/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-border/40 shadow-sm space-y-6">
                <div className="flex items-center justify-between h-9">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-primary flex items-center gap-2"><TableProperties className="h-4 w-4" /> 技术规格配置</h3>
                    <p className="text-[10px] text-muted-foreground">采用分栏布局，支持换行录入，AI 翻译自动对齐结构。</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-lg h-9 px-4 font-bold uppercase tracking-widest text-[10px] gap-1.5"><LayoutTemplate className="h-3.5 w-3.5" /> 加载模板</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-0 rounded-xl shadow-2xl border-border/40 overflow-hidden">
                        <div className="bg-primary p-3 text-white text-[10px] font-bold uppercase tracking-widest flex justify-between items-center">
                          <span>云端规格库</span>
                          <History className="h-3 w-3 opacity-60" />
                        </div>
                        <div className="max-h-72 overflow-y-auto bg-white">
                          {specTemplates?.length === 0 && <div className="p-8 text-center text-[10px] text-muted-foreground italic uppercase">暂无模板数据</div>}
                          {specTemplates?.map(tpl => (
                            <div key={tpl.id} className="flex items-center group border-b last:border-b-0 hover:bg-muted/30">
                              <button onClick={() => handleApplyTemplate(tpl)} className="flex-1 text-left p-3 text-[11px] font-bold text-primary truncate">{tpl.name}</button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={(e) => handleDeleteTemplate(e, tpl.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="sm" onClick={() => { setSaveTemplateMode('create'); setIsSaveTemplateDialogOpen(true); }} className="rounded-lg h-9 px-4 font-bold uppercase tracking-widest text-[10px] gap-1.5 border-primary/20 text-primary hover:bg-primary/5"><Save className="h-3.5 w-3.5" /> 存为模板</Button>
                    <Button variant="default" size="sm" onClick={() => setFormData({...formData, specGroups: [...formData.specGroups, {uid: `group_${Date.now()}`, titleEn:'', titleZh:'', items:[{uid: `item_${Date.now()}`, labelEn:'', labelZh:'', valueEn:'', valueZh:''}]}]})} className="rounded-lg h-9 px-4 font-bold uppercase tracking-widest text-[10px] gap-1.5 shadow-sm"><PlusCircle className="h-3.5 w-3.5" /> 新增分组</Button>
                  </div>
                </div>

                <div className="space-y-8">
                  {formData.specGroups.map((group, gIdx) => (
                    <div key={group.uid} className="bg-white rounded-xl border border-border/40 overflow-hidden shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center justify-between bg-muted/20 px-5 py-3.5 border-b border-border/40">
                        <div className="grid grid-cols-2 gap-4 flex-1 max-w-3xl">
                           <div className="space-y-1">
                             <Label className="text-[8px] font-bold uppercase text-primary/40">分组标题 (ZH)</Label>
                             <Input placeholder="例如: 核心配置" value={group.titleZh} onChange={e => { const g = [...formData.specGroups]; g[gIdx].titleZh = e.target.value; setFormData({...formData, specGroups: g}); }} className="h-9 text-xs bg-white border-transparent focus:border-primary/20 shadow-inner" />
                           </div>
                           <div className="space-y-1">
                             <Label className="text-[8px] font-bold uppercase text-primary/40">Group Title (EN)</Label>
                             <Input placeholder="e.g. Core System" value={group.titleEn} onChange={e => { const g = [...formData.specGroups]; g[gIdx].titleEn = e.target.value; setFormData({...formData, specGroups: g}); }} className="h-9 text-xs bg-white border-transparent focus:border-primary/20 opacity-80 shadow-inner" />
                           </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, specGroups: formData.specGroups.filter((_,i)=>i!==gIdx)})} className="h-8 w-8 text-destructive hover:bg-destructive/5 rounded-full ml-4"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                      <div className="p-0">
                        {group.items.map((item, iIdx) => (
                          <div key={item.uid} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_48px] gap-8 px-8 py-5 border-b last:border-b-0 border-border/20 group/row hover:bg-muted/5 transition-colors">
                            <div className="space-y-3">
                              <Input placeholder="参数名 (ZH)" value={item.labelZh} onChange={e => { const g = [...formData.specGroups]; g[gIdx].items[iIdx].labelZh = e.target.value; setFormData({...formData, specGroups: g}); }} className="h-8 text-[11px] font-bold rounded-md bg-white border-muted/40" />
                              <textarea placeholder="数值内容 (ZH) - 支持换行" value={item.valueZh} onChange={e => { const g = [...formData.specGroups]; g[gIdx].items[iIdx].valueZh = e.target.value; setFormData({...formData, specGroups: g}); }} className="flex min-h-[44px] w-full rounded-md border border-input bg-white px-3 py-2 text-[11px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none leading-relaxed" />
                            </div>
                            <div className="space-y-3">
                              <div className="relative group/field">
                                <Input placeholder="Label (EN)" value={item.labelEn} onChange={e => { const g = [...formData.specGroups]; g[gIdx].items[iIdx].labelEn = e.target.value; setFormData({...formData, specGroups: g}); }} className="h-8 text-[11px] rounded-md bg-white/60 pr-8 border-muted/40" />
                                <button onClick={() => handleAiTranslateSpec(gIdx, iIdx, item.labelZh, 'label')} className="absolute right-2 top-1.5 text-accent opacity-0 group-hover/field:opacity-100 transition-opacity"><Sparkles className="h-3 w-3" /></button>
                              </div>
                              <div className="relative group/field">
                                <textarea placeholder="Value (EN) - Preserve line breaks" value={item.valueEn} onChange={e => { const g = [...formData.specGroups]; g[gIdx].items[iIdx].valueEn = e.target.value; setFormData({...formData, specGroups: g}); }} className="flex min-h-[44px] w-full rounded-md border border-input bg-white/60 px-3 py-2 text-[11px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none pr-8 border-muted/40 leading-relaxed" />
                                <button onClick={() => handleAiTranslateSpec(gIdx, iIdx, item.valueZh, 'value')} className="absolute right-2 top-1.5 text-accent opacity-0 group-hover/field:opacity-100 transition-opacity"><Sparkles className="h-3 w-3" /></button>
                              </div>
                            </div>
                            <div className="pt-10 flex justify-center"><Button variant="ghost" size="icon" onClick={() => { const g = [...formData.specGroups]; g[gIdx].items = g[gIdx].items.filter((_,i)=>i!==iIdx); setFormData({...formData, specGroups: g}); }} className="h-8 w-8 text-destructive/20 hover:text-destructive hover:bg-destructive/5 rounded-full"><X className="h-4 w-4" /></Button></div>
                          </div>
                        ))}
                        <button onClick={() => { const g = [...formData.specGroups]; g[gIdx].items.push({uid: `item_${Date.now()}`, labelEn:'', labelZh:'', valueEn:'', valueZh:''}); setFormData({...formData, specGroups: g}); }} className="w-full h-11 text-[10px] uppercase font-bold text-primary/40 hover:text-primary transition-all bg-muted/5 hover:bg-muted/10 border-t border-border/20 flex items-center justify-center gap-2"><Plus className="h-3 w-3" /> 添加规格项</button>
                      </div>
                    </div>
                  ))}
                  {formData.specGroups.length === 0 && (
                    <div className="py-24 text-center border-2 border-dashed rounded-[2rem] border-border/40 bg-muted/5">
                       <TableProperties className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                       <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">点击上方按钮开始配置技术规格</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-border/40 shadow-sm space-y-4 h-[calc(100vh-280px)] min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between border-b pb-3 mb-2 shrink-0 h-8">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm">详情介绍工作区 (Decentralized)</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-muted/30 p-1 rounded-lg">
                      <span className="text-[9px] font-bold uppercase text-primary/40 px-2">目标语种</span>
                      <Select value={targetDetailsLang} onValueChange={setTargetDetailsLang}>
                        <SelectTrigger className="h-7 border-none bg-white rounded-md text-[10px] font-bold w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {supportedLangs.filter(l => l.code !== 'zh').map(l => (
                            <SelectItem key={l.code} value={l.code} className="text-xs uppercase">{l.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1.5 px-3 font-bold text-accent bg-accent/5 hover:bg-accent/10 border border-accent/10" onClick={handleAiTranslateDetails} disabled={isAiProcessing || !aiConfig?.isEnabled}>
                      {isAiProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} AI 智译至 {targetDetailsLang.toUpperCase()}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                  <Label className="text-[10px] font-bold uppercase text-primary/40 flex items-center gap-1.5"><Languages className="h-3 w-3" /> 中文源文 (ZH)</Label>
                  <Label className="text-[10px] font-bold uppercase text-primary/40 flex items-center gap-1.5"><Globe className="h-3 w-3" /> 目标译文 ({targetDetailsLang.toUpperCase()})</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
                  <RichTextEditor 
                    ref={zhEditorRef}
                    content={formData.localizedDetails.zh || ''} 
                    onChange={val => setFormData({
                      ...formData, 
                      localizedDetails: { ...formData.localizedDetails, zh: val }
                    })} 
                    onImageClick={() => openPicker('richtext-zh')}
                    className="flex-1"
                    placeholder="在此输入或粘贴中文排版内容..."
                  />
                  <div className="flex flex-col flex-1 overflow-hidden group relative">
                    <RichTextEditor 
                      ref={targetEditorRef}
                      content={formData.localizedDetails[targetDetailsLang] || ''} 
                      onChange={val => setFormData({
                        ...formData, 
                        localizedDetails: { ...formData.localizedDetails, [targetDetailsLang]: val }
                      })} 
                      onImageClick={() => openPicker('richtext-target')}
                      className="flex-1 border-primary/20"
                      placeholder={`在此编辑 ${targetDetailsLang.toUpperCase()} 版本的排版...`}
                    />
                    {isAiProcessing && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                        <div className="relative">
                          <Cpu className="h-12 w-12 text-primary animate-pulse" />
                          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-accent animate-bounce" />
                        </div>
                        <p className="text-[11px] font-bold text-primary uppercase tracking-widest">AI 正在深度重组长文排版...</p>
                        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-1/2 rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
        <DialogContent className="rounded-2xl max-w-md p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2"><Save className="h-5 w-5" /> 存为技术规格模板</DialogTitle>
              <p className="text-white/60 text-xs">保存后可在其他产品发布时一键回填此套规格。</p>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-6 bg-white">
            <Tabs value={saveTemplateMode} onValueChange={(v:any) => setSaveTemplateMode(v)} className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="create" className="text-xs font-bold uppercase">新建模板</TabsTrigger>
                <TabsTrigger value="update" className="text-xs font-bold uppercase">覆盖已有</TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-60">模板显示名称</Label>
                  <Input value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="如: 标准一体机规格 v1" className="rounded-xl h-11" />
                </div>
              </TabsContent>
              
              <TabsContent value="update" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-60">目标模板</Label>
                  <Select value={targetTemplateId} onValueChange={setTargetTemplateId}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="选择要覆盖的模板..." /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {specTemplates?.map(tpl => <SelectItem key={tpl.id} value={tpl.id} className="text-xs">{tpl.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter className="bg-muted/10 p-4 border-t gap-2">
            <Button variant="outline" onClick={() => setIsSaveTemplateDialogOpen(false)} className="h-10 rounded-xl flex-1 text-xs">取消</Button>
            <Button onClick={handleSaveTemplate} className="rounded-xl h-10 flex-1 text-xs">立即保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-5xl p-0 rounded-2xl overflow-hidden flex flex-col h-[85vh] border-none shadow-2xl">
          <div className="bg-primary p-6 text-white flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            <DialogTitle className="text-xl font-bold">素材中心</DialogTitle>
          </div>
          <div className="px-6 py-4 flex gap-3 bg-muted/20 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="搜索素材标题..." value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-white pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {galleryAssets?.filter(a => a.title.toLowerCase().includes(pickerSearch.toLowerCase())).map(a => (
                <div key={a.id} className={cn("group relative aspect-square bg-white rounded-lg cursor-pointer overflow-hidden border-2 transition-all", selectedPickerUrls.has(a.url) ? "border-primary shadow-lg" : "border-transparent")} onClick={() => togglePickerSelection(a.url)}>
                  <Image src={a.url} alt={a.title} fill className="object-cover" unoptimized />
                  {selectedPickerUrls.has(a.url) && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><Check className="text-primary h-6 w-6 bg-white rounded-full p-1 shadow-lg" /></div>}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="p-6 bg-white border-t flex items-center justify-between">
            <div className="text-xs font-bold text-primary">已选中 {selectedPickerUrls.size} 项</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPickerOpen(false)} className="rounded-lg h-9 px-5">取消</Button>
              <Button onClick={handleConfirmPicker} disabled={selectedPickerUrls.size === 0} className="rounded-lg h-9 px-6">确认添加</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductEditorPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>}>
      <ProductEditorContent />
    </Suspense>
  );
}
