
"use client";

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useAuth, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
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
    const tplId = saveTemplateMode === 'create' ? `tpl_${Date.now()}` : targetTemplateId;
    const tplName = saveTemplateMode === 'create' ? newTemplateName : specTemplates?.find(t => t.id === targetTemplateId)?.name || '未命名';

    setDocumentNonBlocking(doc(firestore, 'specTemplates', tplId), {
      id: tplId,
      name: tplName,
      specGroups: formData.specGroups.map(g => ({
        titleZh: g.titleZh, titleEn: g.titleEn,
        items: g.items.map(i => ({ labelZh: i.labelZh, labelEn: i.labelEn, valueZh: i.valueZh, valueEn: i.valueEn }))
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    setIsSaveTemplateDialogOpen(false);
    toast({ title: "模板已保存" });
  };

  const handleDeleteTemplate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!firestore || !confirm('确定删除？')) return;
    setDocumentNonBlocking(doc(firestore, 'specTemplates', id), {}, { merge: false });
    toast({ title: "模板已删除" });
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

  const handleAiTranslateSpec = async (gIdx: number, iIdx: number, text: string, type: 'label' | 'value') => {
    if (!aiConfig?.isEnabled || !text.trim()) return;
    setIsAiProcessing(true);
    try {
      const result = await translateContent({ text, targetLangs: ['en'], apiKey: aiConfig.apiKey });
      if (result.en) {
        const newGroups = [...formData.specGroups];
        if (type === 'label') newGroups[gIdx].items[iIdx].labelEn = result.en;
        else newGroups[gIdx].items[iIdx].valueEn = result.en;
        setFormData(prev => ({...prev, specGroups: newGroups}));
      }
    } catch (e) { toast({ variant: "destructive", title: "翻译失败" }); }
    finally { setIsAiProcessing(false); }
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
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between sticky top-16 z-40 bg-background/95 backdrop-blur-md py-3 border-b px-4 shadow-sm">
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
            <h2 className="text-lg font-headline font-bold text-primary">{isEditing ? '编辑产品' : '发布产品'}</h2>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-4xl">
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
               <SelectTrigger className="h-9 rounded-lg bg-muted/20 border-transparent text-xs w-[180px]"><SelectValue placeholder="选择分类..." /></SelectTrigger>
               <SelectContent>{categories?.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.id}</SelectItem>)}</SelectContent>
             </Select>
             <div className="relative flex-1 max-w-[280px]">
                <Input disabled={isEditing} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className={cn("h-9 rounded-lg font-mono text-xs", idConflict && "border-destructive")} placeholder="产品 ID..." />
                {idConflict && <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-destructive" />}
             </div>
             <Select value={formData.status} onValueChange={(v:any) => setFormData({...formData, status: v})}>
               <SelectTrigger className={cn("h-9 rounded-lg border-transparent text-[10px] font-bold uppercase", formData.status === 'published' ? "bg-green-50 text-green-700" : "bg-muted/30")}><SelectValue /></SelectTrigger>
               <SelectContent><SelectItem value="published" className="text-xs font-bold text-green-600">已发布</SelectItem><SelectItem value="draft" className="text-xs">草稿</SelectItem></SelectContent>
             </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-lg h-9 text-[10px] font-bold uppercase">取消</Button>
          <Button size="sm" onClick={handleSave} className="rounded-lg h-9 px-5 text-[10px] font-bold uppercase gap-2"><Save className="h-3.5 w-3.5" /> 保存变更</Button>
        </div>
      </div>

      <div className="space-y-6 px-4">
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-xs font-bold text-primary flex items-center gap-2"><ImageIcon className="h-4 w-4" /> 视觉素材</h3>
            <Button variant="outline" size="sm" onClick={() => openPicker('gallery')} className="h-7 text-[9px] font-bold uppercase gap-1.5"><FolderPlus className="h-3 w-3" /> 素材库导入</Button>
          </div>
          <div className="flex gap-6 h-[240px]">
            <div className="w-[264px] flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase text-primary/40">主图预览</Label>
              <div className="relative flex-1 rounded-xl bg-muted/10 border border-dashed border-border/40 overflow-hidden flex items-center justify-center group cursor-pointer" onClick={() => !formData.mainImageUrl && fileInputRef.current?.click()}>
                {formData.mainImageUrl ? (
                  <><Image src={formData.mainImageUrl} alt="M" fill className="object-contain p-2" unoptimized /><Button variant="destructive" size="sm" className="absolute opacity-0 group-hover:opacity-100 h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); setFormData({...formData, mainImageUrl:''}); }}><X className="h-4 w-4" /></Button></>
                ) : <div className="text-center opacity-30">{isUploading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : <Upload className="h-5 w-5 mx-auto" />}<p className="text-[9px] mt-1 font-bold">上传</p></div>}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
              <Label className="text-[10px] font-bold uppercase text-primary/40">详情幻灯片 ({formData.galleryUrls.length})</Label>
              <div className="flex-1 flex gap-4 p-3 bg-muted/5 rounded-xl border border-border/20 overflow-x-auto items-center">
                {formData.galleryUrls.map((url, idx) => (
                  <div key={idx} className="group relative shrink-0 w-[220px] h-full bg-white rounded-lg border border-border/10 overflow-hidden shadow-sm">
                    <Image src={url} alt="G" fill className="object-contain p-2" unoptimized />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => setFormData({...formData, galleryUrls: formData.galleryUrls.filter((_,i)=>i!==idx)})}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/30 p-1 rounded-xl mb-4 h-11">
            <TabsTrigger value="basic" className="rounded-lg px-6 text-[11px] font-bold uppercase gap-2"><Info className="h-3.5 w-3.5" /> 基础信息</TabsTrigger>
            <TabsTrigger value="specs" className="rounded-lg px-6 text-[11px] font-bold uppercase gap-2"><TableProperties className="h-3.5 w-3.5" /> 技术规格</TabsTrigger>
            <TabsTrigger value="details" className="rounded-lg px-6 text-[11px] font-bold uppercase gap-2"><Film className="h-3.5 w-3.5" /> 详细介绍</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border shadow-sm grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2"><Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-1.5"><Languages className="h-3 w-3" /> 中文 (ZH)</Label><Button variant="ghost" size="sm" className="h-6 text-[9px] gap-1 font-bold text-accent" onClick={handleAiTranslateBasicInfo} disabled={isAiProcessing}><Sparkles className="h-2.5 w-2.5" /> AI 智译</Button></div>
                <Input placeholder="产品名称" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="h-10 bg-muted/5" />
                <textarea placeholder="简介..." value={formData.descZh} onChange={e => setFormData({...formData, descZh: e.target.value})} className="w-full min-h-[100px] rounded-lg border bg-muted/5 p-3 text-sm resize-none" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2"><Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5"><Globe className="h-3 w-3" /> 英文 (EN)</Label></div>
                <Input placeholder="Product Name" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="h-10 bg-muted/5" />
                <textarea placeholder="Description..." value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="w-full min-h-[100px] rounded-lg border bg-muted/5 p-3 text-sm resize-none" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2"><TableProperties className="h-4 w-4" /> 规格配置</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsSaveTemplateDialogOpen(true)} className="h-9 text-[10px] font-bold uppercase">存为模板</Button>
                  <Button size="sm" onClick={() => setFormData({...formData, specGroups: [...formData.specGroups, {uid:`g_${Date.now()}`,titleEn:'',titleZh:'',items:[{uid:`i_${Date.now()}`,labelEn:'',labelZh:'',valueEn:'',valueZh:''}]}]})} className="h-9 text-[10px] font-bold uppercase"><PlusCircle className="h-3.5 w-3.5 mr-1" /> 新增分组</Button>
                </div>
              </div>
              <div className="space-y-6">
                {formData.specGroups.map((group, gIdx) => (
                  <div key={group.uid} className="rounded-xl border border-border/40 overflow-hidden group/g">
                    <div className="bg-muted/20 px-5 py-3 flex items-center justify-between border-b">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <Input placeholder="标题 (ZH)" value={group.titleZh} onChange={e => { const g=[...formData.specGroups]; g[gIdx].titleZh=e.target.value; setFormData({...formData, specGroups:g}); }} className="h-8 text-xs" />
                        <Input placeholder="Title (EN)" value={group.titleEn} onChange={e => { const g=[...formData.specGroups]; g[gIdx].titleEn=e.target.value; setFormData({...formData, specGroups:g}); }} className="h-8 text-xs" />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, specGroups: formData.specGroups.filter((_,i)=>i!==gIdx)})} className="ml-4 h-8 w-8 text-destructive/20 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="p-0">
                      {group.items.map((item, iIdx) => (
                        <div key={item.uid} className="grid grid-cols-[1fr_1fr_40px] gap-6 px-6 py-4 border-b last:border-b-0 hover:bg-muted/5">
                          <div className="space-y-2">
                            <Input placeholder="参数名" value={item.labelZh} onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].labelZh=e.target.value; setFormData({...formData, specGroups:g}); }} className="h-8 text-[11px] font-bold" />
                            <textarea placeholder="内容..." value={item.valueZh} onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].valueZh=e.target.value; setFormData({...formData, specGroups:g}); }} className="w-full min-h-[40px] border rounded p-2 text-[11px] resize-none" />
                          </div>
                          <div className="space-y-2">
                            <div className="relative"><Input placeholder="Label" value={item.labelEn} onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].labelEn=e.target.value; setFormData({...formData, specGroups:g}); }} className="h-8 text-[11px] pr-8" /><Sparkles className="absolute right-2 top-2 h-3 w-3 text-accent cursor-pointer" onClick={() => handleAiTranslateSpec(gIdx, iIdx, item.labelZh, 'label')} /></div>
                            <div className="relative"><textarea placeholder="Value" value={item.valueEn} onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].valueEn=e.target.value; setFormData({...formData, specGroups:g}); }} className="w-full min-h-[40px] border rounded p-2 text-[11px] resize-none pr-8" /><Sparkles className="absolute right-2 top-2 h-3 w-3 text-accent cursor-pointer" onClick={() => handleAiTranslateSpec(gIdx, iIdx, item.valueZh, 'value')} /></div>
                          </div>
                          <div className="flex items-center"><Button variant="ghost" size="icon" onClick={() => { const g=[...formData.specGroups]; g[gIdx].items=g[gIdx].items.filter((_,i)=>i!==iIdx); setFormData({...formData, specGroups:g}); }} className="h-8 w-8 text-destructive/20 hover:text-destructive"><X className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                      <button onClick={() => { const g=[...formData.specGroups]; g[gIdx].items.push({uid:`i_${Date.now()}`,labelEn:'',labelZh:'',valueEn:'',valueZh:''}); setFormData({...formData, specGroups:g}); }} className="w-full py-2 text-[9px] font-bold uppercase opacity-30 hover:opacity-100 transition-opacity bg-muted/10">+ 添加规格</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border shadow-sm h-[calc(100vh-280px)] min-h-[600px] flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2"><Film className="h-4 w-4" /><h3 className="font-bold text-sm">详情编辑器</h3></div>
                <div className="flex items-center gap-3">
                  <Select value={targetDetailsLang} onValueChange={setTargetDetailsLang}><SelectTrigger className="h-7 w-24 text-[10px] font-bold uppercase"><SelectValue /></SelectTrigger><SelectContent>{supportedLangs.filter(l=>l.code!=='zh').map(l=><SelectItem key={l.code} value={l.code} className="text-xs uppercase">{l.label}</SelectItem>)}</SelectContent></Select>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-accent bg-accent/5" onClick={handleAiTranslateDetails} disabled={isAiProcessing}><Sparkles className="h-3 w-3 mr-1" /> AI 智译 ({targetDetailsLang.toUpperCase()})</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
                <RichTextEditor ref={zhEditorRef} content={formData.localizedDetails.zh || ''} onChange={v => setFormData({...formData, localizedDetails: {...formData.localizedDetails, zh: v}})} onImageClick={() => openPicker('richtext-zh')} placeholder="录入中文..." />
                <div className="relative flex flex-col">
                  <RichTextEditor ref={targetEditorRef} content={formData.localizedDetails[targetDetailsLang] || ''} onChange={v => setFormData({...formData, localizedDetails: {...formData.localizedDetails, [targetDetailsLang]: v}})} onImageClick={() => openPicker('richtext-target')} placeholder="目标译文..." />
                  {isAiProcessing && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300"><Cpu className="h-10 w-10 text-primary animate-pulse" /><p className="text-[10px] font-bold uppercase tracking-widest">AI 正在深度重排长文...</p></div>}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl"><div className="bg-primary p-6 text-white"><DialogTitle className="text-lg font-bold">保存规格模板</DialogTitle></div><div className="p-6 space-y-4"><Label className="text-[10px] font-bold uppercase opacity-50">模板名称</Label><Input value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="输入模板名称..." className="h-11 rounded-xl" /></div><DialogFooter className="p-4 bg-muted/20 border-t gap-2"><Button variant="outline" onClick={()=>setIsSaveTemplateDialogOpen(false)} className="flex-1">取消</Button><Button onClick={handleSaveTemplate} className="flex-1">立即保存</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden flex flex-col h-[85vh] rounded-2xl shadow-2xl border-none"><div className="bg-primary p-6 text-white flex items-center gap-2"><ImageIcon className="h-6 w-6" /><DialogTitle className="text-xl font-bold">素材库</DialogTitle></div><div className="px-6 py-3 bg-muted/20 border-b flex gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" /><Input placeholder="搜索素材..." value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} className="pl-9 h-10 border-none bg-white" /></div></div><div className="flex-1 overflow-y-auto p-6 grid grid-cols-6 gap-4 bg-muted/5">{galleryAssets?.filter(a=>a.title.toLowerCase().includes(pickerSearch.toLowerCase())).map(a=>(<div key={a.id} className={cn("relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all", selectedPickerUrls.has(a.url) ? "border-primary scale-95 shadow-inner" : "border-transparent")} onClick={()=>{const n=new Set(selectedPickerUrls); if(pickerTarget.includes('main')||pickerTarget.includes('richtext')){n.clear();n.add(a.url)}else{n.has(a.url)?n.delete(a.url):n.add(a.url)} setSelectedPickerUrls(n); }}><Image src={a.url} alt={a.title} fill className="object-cover" unoptimized />{selectedPickerUrls.has(a.url) && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><Check className="bg-white text-primary rounded-full p-1 h-6 w-6" /></div>}</div>))}</div><DialogFooter className="p-6 border-t flex items-center justify-between"><div>已选中 {selectedPickerUrls.size} 项</div><div className="flex gap-2"><Button variant="outline" onClick={()=>setIsPickerOpen(false)}>取消</Button><Button onClick={handleConfirmPicker} disabled={selectedPickerUrls.size===0}>确认插入</Button></div></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductEditorPage() { return <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20" /></div>}><ProductEditorContent /></Suspense>; }
