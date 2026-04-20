"use client";

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Film,
  Cpu,
  Library,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog';
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
import RichTextEditor from '@/components/RichTextEditor';
import { Badge } from '@/components/ui/badge';

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
    if (!firestore || !newTemplateName.trim()) {
      toast({ variant: "destructive", title: "请输入模板名称" });
      return;
    }
    const templateId = `tpl_${Date.now()}`;
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
      name: newTemplateName.trim(),
      specGroups: cleanSpecGroups,
      createdAt: serverTimestamp()
    }, { merge: true });
    setIsSaveTemplateDialogOpen(false);
    setNewTemplateName('');
    toast({ title: "规格模板已存入云端库" });
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
      <div className="flex items-center justify-between sticky top-16 z-40 bg-background/95 backdrop-blur-md py-3 border-b px-6 shadow-sm">
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
            <h2 className="text-sm font-headline font-bold text-primary whitespace-nowrap uppercase tracking-wider">{isEditing ? '编辑产品' : '发布新产品'}</h2>
          </div>
          <div className="flex items-center gap-3 flex-1">
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
               <SelectTrigger className="h-10 rounded-lg bg-muted/20 border-transparent text-xs w-[160px] shrink-0 font-medium"><SelectValue placeholder="选择分类..." /></SelectTrigger>
               <SelectContent className="rounded-lg">{categories?.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.id}</SelectItem>)}</SelectContent>
             </Select>
             <div className="relative flex-1 max-w-none">
                <Input disabled={isEditing} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className={cn("h-10 rounded-lg font-mono text-xs border-muted/40 bg-muted/5", idConflict && "border-destructive")} placeholder="产品 ID (按规范生成)" />
                {idConflict && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-destructive" />}
             </div>
             <Select value={formData.status} onValueChange={(v:any) => setFormData({...formData, status: v})}>
               <SelectTrigger className={cn("h-10 rounded-lg border-transparent text-xs font-bold uppercase w-[100px] shrink-0", formData.status === 'published' ? "bg-green-50 text-green-700" : "bg-muted/30")}><SelectValue /></SelectTrigger>
               <SelectContent className="rounded-lg"><SelectItem value="published" className="text-xs font-bold text-green-600">已发布</SelectItem><SelectItem value="draft" className="text-xs">草稿</SelectItem></SelectContent>
             </Select>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-lg h-10 px-5 text-xs font-bold uppercase tracking-wider">取消</Button>
          <Button size="sm" onClick={handleSave} className="rounded-lg h-10 px-6 text-xs font-bold uppercase tracking-wider gap-2 shadow-md"><Save className="h-4 w-4" /> 保存变更</Button>
        </div>
      </div>

      <div className="space-y-6 px-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4 mb-2">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                <ImageIcon className="h-4 w-4" /> 视觉素材中心
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">配置产品主图及细节轮播图，支持从素材库直接拾取。</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => openPicker('gallery')} className="h-10 text-[11px] font-bold uppercase tracking-wider gap-1.5 rounded-lg border-muted-foreground/20">
              <FolderPlus className="h-3.5 w-3.5" /> 批量导入细节图
            </Button>
          </div>
          <div className="flex gap-6 h-[240px]">
            <div className="w-[264px] flex flex-col gap-2 shrink-0">
              <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">产品主图 (Main Image)</Label>
              <div className="relative flex-1 rounded-xl bg-muted/10 border border-dashed border-border/40 overflow-hidden flex items-center justify-center group cursor-pointer transition-colors hover:bg-muted/20">
                {formData.mainImageUrl ? (
                  <><Image src={formData.mainImageUrl} alt="M" fill className="object-contain p-2" unoptimized /><Button variant="destructive" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-8 w-8 rounded-full shadow-lg" onClick={(e) => { e.stopPropagation(); setFormData({...formData, mainImageUrl:''}); }}><X className="h-4 w-4" /></Button></>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="flex justify-center gap-4">
                       <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="flex flex-col h-auto p-3 hover:bg-primary/5 transition-all rounded-xl">
                          <Upload className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                          <span className="text-[10px] font-bold uppercase opacity-60">本地上传</span>
                       </Button>
                       <Button variant="ghost" size="sm" onClick={() => openPicker('main')} className="flex flex-col h-auto p-3 hover:bg-primary/5 transition-all rounded-xl">
                          <Library className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                          <span className="text-[10px] font-bold uppercase opacity-60">素材库</span>
                       </Button>
                    </div>
                  </div>
                )}
                
                {formData.mainImageUrl && (
                  <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-all bg-gradient-to-t from-black/60 to-transparent">
                    <Button variant="secondary" size="sm" onClick={() => openPicker('main')} className="w-full h-8 rounded-lg text-[10px] font-bold uppercase gap-1.5 shadow-sm">
                      <Library className="h-3.5 w-3.5" /> 从库更换主图
                    </Button>
                  </div>
                )}
                
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
              <Label className="text-[10px] font-bold uppercase text-primary/40 tracking-wider">细节轮播图 ({formData.galleryUrls.length})</Label>
              <div className="flex-1 flex gap-4 p-3 bg-muted/5 rounded-xl border border-border/20 overflow-x-auto items-center scrollbar-thin scrollbar-thumb-muted-foreground/20">
                {formData.galleryUrls.map((url, idx) => (
                  <div key={idx} className="group relative shrink-0 w-[220px] h-full bg-white rounded-lg border border-border/10 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <Image src={url} alt="G" fill className="object-contain p-2" unoptimized />
                    
                    <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="destructive" size="icon" className="h-7 w-7 shadow-lg" onClick={() => setFormData({...formData, galleryUrls: formData.galleryUrls.filter((_,i)=>i!==idx)})}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>

                    <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm shadow-sm disabled:opacity-30" 
                        disabled={idx === 0}
                        onClick={() => handleMoveGalleryImage(idx, 'left')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm shadow-sm disabled:opacity-30" 
                        disabled={idx === formData.galleryUrls.length - 1}
                        onClick={() => handleMoveGalleryImage(idx, 'right')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {formData.galleryUrls.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground/30 text-[10px] font-bold uppercase tracking-[0.2em] italic">
                    尚未导入细节图
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/30 p-1 rounded-xl mb-6 h-12 shadow-inner">
            <TabsTrigger value="basic" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider gap-2"><Info className="h-4 w-4" /> 基础信息配置</TabsTrigger>
            <TabsTrigger value="specs" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider gap-2"><TableProperties className="h-4 w-4" /> 技术规格矩阵</TabsTrigger>
            <TabsTrigger value="details" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider gap-2"><Film className="h-4 w-4" /> 产品详细介绍</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
              <div className="border-b pb-4 mb-6">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                  <Info className="h-4 w-4" /> 基础信息配置
                </h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">定义产品的双语标题和简短描述，支持一键 AI 智译。</p>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center h-10 border-b pb-2">
                    <Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-2 tracking-widest"><Languages className="h-3.5 w-3.5" /> 源文: 中文 (ZH)</Label>
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">产品标题</Label><Input placeholder="输入中文产品名称" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="h-10 bg-muted/5 text-xs rounded-lg border-muted/40" /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">简短描述</Label><Textarea placeholder="输入中文简介，建议 100 字以内" value={formData.descZh} onChange={e => setFormData({...formData, descZh: e.target.value})} className="w-full min-h-[120px] rounded-lg border border-muted/40 bg-muted/5 p-4 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/20" /></div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between h-10 border-b pb-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2 tracking-widest"><Globe className="h-3.5 w-3.5" /> 目标: 英文 (EN)</Label>
                    <Button variant="ghost" size="sm" className="h-8 px-4 text-[10px] gap-1.5 font-bold text-accent bg-accent/5 hover:bg-accent/10 rounded-full transition-all border border-accent/10" onClick={handleAiTranslateBasicInfo} disabled={isAiProcessing}>
                      <Sparkles className="h-3 w-3" /> AI 智译一键同步
                    </Button>
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PRODUCT TITLE</Label><Input placeholder="Product Name in English" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="h-10 bg-muted/5 text-xs rounded-lg border-muted/40" /></div>
                     <div className="space-y-2"><Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SHORT DESCRIPTION</Label><Textarea placeholder="English description for international markets" value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="w-full min-h-[120px] rounded-lg border border-muted/40 bg-muted/5 p-4 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/20" /></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                    <TableProperties className="h-4 w-4" /> 硬件规格矩阵
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">定义产品的技术参数，支持一键存取云端模板。</p>
                </div>
                <div className="flex gap-3">
                  {specTemplates && specTemplates.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-lg border-muted-foreground/20 gap-2">
                          <Library className="h-4 w-4" /> 模板导入
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-xl w-56">
                        {specTemplates.map(tpl => (
                          <DropdownMenuItem key={tpl.id} onClick={() => handleApplyTemplate(tpl)} className="text-xs">
                            {tpl.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setIsSaveTemplateDialogOpen(true)} className="h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-lg border-muted-foreground/20">保存当前为模板</Button>
                  <Button size="sm" onClick={() => setFormData({...formData, specGroups: [...formData.specGroups, {uid:`g_${Date.now()}`,titleEn:'',titleZh:'',items:[{uid:`i_${Date.now()}`,labelEn:'',labelZh:'',valueEn:'',valueZh:''}]}]})} className="h-10 px-6 text-xs font-bold uppercase tracking-wider gap-2 rounded-lg shadow-md"><PlusCircle className="h-4 w-4" /> 新增规格分组</Button>
                </div>
              </div>
              <div className="space-y-8">
                {formData.specGroups.map((group, gIdx) => (
                  <div key={group.uid} className="rounded-xl border border-border/40 overflow-hidden shadow-sm group/g transition-shadow hover:shadow-md">
                    <div className="bg-muted/10 px-6 py-4 flex items-center justify-between border-b border-border/40">
                      <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="space-y-1"><Label className="text-[10px] font-bold opacity-40 uppercase">分组标题 (ZH)</Label><Input placeholder="如：核心配置" value={group.titleZh} onChange={e => { const g=[...formData.specGroups]; g[gIdx].titleZh=e.target.value; setFormData({...formData, specGroups:g}); }} className="h-10 text-xs font-medium rounded-lg border-none bg-white/50" /></div>
                        <div className="space-y-1"><Label className="text-[10px] font-bold opacity-40 uppercase">GROUP TITLE (EN)</Label><Input placeholder="e.g. Core Hardware" value={group.titleEn} onChange={e => { const g=[...formData.specGroups]; g[gIdx].titleEn=e.target.value; setFormData({...formData, specGroups:g}); }} className="h-10 text-xs font-medium rounded-lg border-none bg-white/50" /></div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, specGroups: formData.specGroups.filter((_,i)=>i!==gIdx)})} className="ml-6 h-10 w-10 text-destructive/40 hover:text-destructive hover:bg-destructive/5 rounded-lg"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="p-0 bg-white">
                      {group.items.map((item, iIdx) => (
                        <div key={item.uid} className="grid grid-cols-[1fr_1fr_48px] gap-8 px-8 py-5 border-b last:border-b-0 hover:bg-muted/5 transition-colors">
                          <div className="space-y-3">
                            <Input placeholder="参数名称 (如: 处理器)" value={item.labelZh} onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].labelZh=e.target.value; setFormData({...formData, specGroups:g}); }} className="h-10 text-xs font-medium border-none bg-muted/10 rounded-lg" />
                            <Textarea placeholder="参数值 (如: 第12代英特尔酷睿)" value={item.valueZh} onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].valueZh=e.target.value; setFormData({...formData, specGroups:g}); }} className="w-full min-h-[50px] border-none bg-muted/10 rounded-lg p-3 text-xs resize-none focus:outline-none" />
                          </div>
                          <div className="space-y-3">
                            <div className="relative"><Input placeholder="Label (e.g. CPU)" value={item.labelEn} onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].labelEn=e.target.value; setFormData({...formData, specGroups:g}); }} className="h-10 text-xs rounded-lg border-muted/30 pr-10 font-medium" /><Sparkles className="absolute right-2.5 top-2.5 h-4 w-4 text-accent/40 cursor-pointer hover:text-accent transition-colors" onClick={() => handleAiTranslateSpec(gIdx, iIdx, item.labelZh, 'label')} /></div>
                            <div className="relative"><Textarea placeholder="Value (e.g. 12th Gen Intel Core)" value={item.valueEn} onChange={e => { const g=[...formData.specGroups]; g[gIdx].items[iIdx].valueEn=e.target.value; setFormData({...formData, specGroups:g}); }} className="w-full min-h-[50px] border border-muted/30 rounded-lg p-3 text-xs resize-none pr-10 focus:outline-none" /><Sparkles className="absolute right-2.5 top-3 h-4 w-4 text-accent/40 cursor-pointer hover:text-accent transition-colors" onClick={() => handleAiTranslateSpec(gIdx, iIdx, item.valueZh, 'value')} /></div>
                          </div>
                          <div className="flex items-center justify-center"><Button variant="ghost" size="icon" onClick={() => { const g=[...formData.specGroups]; g[gIdx].items=g[gIdx].items.filter((_,i)=>i!==iIdx); setFormData({...formData, specGroups:g}); }} className="h-10 w-10 text-destructive/20 hover:text-destructive hover:bg-destructive/5 rounded-lg"><X className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                      <button onClick={() => { const g=[...formData.specGroups]; g[gIdx].items.push({uid:`i_${Date.now()}`,labelEn:'',labelZh:'',valueEn:'',valueZh:''}); setFormData({...formData, specGroups:g}); }} className="w-full py-3 text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-all bg-muted/5 hover:bg-muted/10 border-t border-border/40">+ 点击追加规格条目</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white p-8 rounded-2xl border shadow-sm min-h-[800px] flex flex-col space-y-6">
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                    <Film className="h-4 w-4" /> 多语言详情编辑器
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">支持 Tiptap 渲染引擎，可直接从素材库插入带阴影圆角的媒体资产。</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] font-bold uppercase opacity-40">目标语言:</Label>
                    <Select value={targetDetailsLang} onValueChange={setTargetDetailsLang}>
                      <SelectTrigger className="h-10 w-28 text-xs font-bold uppercase rounded-lg border-muted/40"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl">{supportedLangs.filter(l=>l.code!=='zh').map(l=><SelectItem key={l.code} value={l.code} className="text-xs uppercase">{l.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" className="h-10 px-6 text-xs font-bold text-accent border-accent/20 bg-accent/5 hover:bg-accent/10 rounded-lg gap-2" onClick={handleAiTranslateDetails} disabled={isAiProcessing}>
                    <Sparkles className="h-4 w-4" /> AI 智译 ({targetDetailsLang.toUpperCase()})
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 flex-1">
                <RichTextEditor ref={zhEditorRef} content={formData.localizedDetails.zh || ''} onChange={v => setFormData({...formData, localizedDetails: {...formData.localizedDetails, zh: v}})} onImageClick={() => openPicker('richtext-zh')} placeholder="录入中文详情内容..." className="rounded-xl border-muted/40" />
                <div className="relative flex flex-col">
                  <RichTextEditor ref={targetEditorRef} content={formData.localizedDetails[targetDetailsLang] || ''} onChange={v => setFormData({...formData, localizedDetails: {...formData.localizedDetails, [targetDetailsLang]: v}})} onImageClick={() => openPicker('richtext-target')} placeholder="待同步的目标语言译文..." className="rounded-xl border-muted/40" />
                  {isAiProcessing && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                      <div className="relative">
                        <Cpu className="h-12 w-12 text-primary animate-pulse" />
                        <div className="absolute inset-0 h-12 w-12 border-2 border-primary/20 rounded-full animate-ping" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">AI 正在进行深度语义重排...</p>
                        <p className="text-[9px] font-medium opacity-40 uppercase">正在保留所有 HTML 标签及多媒体资产属性</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl shadow-2xl border-none">
          <div className="bg-primary p-6 text-white"><DialogTitle className="text-lg font-bold flex items-center gap-2"><Save className="h-5 w-5" /> 保存为规格模板</DialogTitle></div>
          <div className="p-8 space-y-5 bg-white">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-50 tracking-wider">模板显示名称</Label>
              <Input value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="如: 标配 AIO 规格模板" className="h-10 rounded-lg text-xs" />
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted/20 border-t gap-3">
            <Button variant="outline" onClick={()=>setIsSaveTemplateDialogOpen(false)} className="flex-1 h-10 rounded-lg text-xs font-bold uppercase">放弃</Button>
            <Button onClick={handleSaveTemplate} className="flex-1 h-10 rounded-lg text-xs font-bold uppercase shadow-lg">立即存入云端库</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden flex flex-col h-[85vh] rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-none">
          <div className="bg-primary p-8 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-7 w-7 text-accent" />
              <div>
                <DialogTitle className="text-xl font-bold uppercase tracking-widest">云端媒体资产库</DialogTitle>
                <p className="text-[10px] text-white/50 uppercase tracking-tight mt-1">拾取资产将自动关联至当前产品。支持多选批量导入至轮播图。</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={()=>setIsPickerOpen(false)} className="rounded-full hover:bg-white/10 text-white"><X className="h-6 w-6" /></Button>
          </div>
          <div className="px-8 py-4 bg-muted/30 border-b border-border/40 flex gap-6 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
              <Input placeholder="搜索云端资产..." value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} className="pl-10 h-10 border-none bg-white rounded-lg shadow-inner text-xs" />
            </div>
            <div className="h-8 w-px bg-border/60" />
            <Badge variant="secondary" className="h-10 px-6 rounded-lg text-xs font-bold uppercase tracking-widest bg-white border-border/40 text-primary shadow-sm">已选中 {selectedPickerUrls.size} 项素材</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-6 bg-muted/5">
            {galleryAssets?.filter(a=>a.title.toLowerCase().includes(pickerSearch.toLowerCase())).map(a=>(
              <div 
                key={a.id} 
                className={cn(
                  "group relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300", 
                  selectedPickerUrls.has(a.url) ? "border-primary scale-95 shadow-xl" : "border-transparent bg-white hover:border-primary/20 hover:shadow-lg"
                )} 
                onClick={()=>{
                  const n=new Set(selectedPickerUrls); 
                  if(pickerTarget.includes('main')||pickerTarget.includes('richtext')){
                    n.clear();
                    n.add(a.url);
                  } else {
                    n.has(a.url) ? n.delete(a.url) : n.add(a.url);
                  } 
                  setSelectedPickerUrls(n); 
                }}
              >
                <Image src={a.url} alt={a.title} fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                <div className={cn(
                  "absolute inset-0 bg-primary/20 flex items-center justify-center transition-opacity",
                  selectedPickerUrls.has(a.url) ? "opacity-100" : "opacity-0"
                )}>
                  <div className="bg-white text-primary rounded-full p-1.5 shadow-2xl animate-in zoom-in-50 duration-300">
                    <Check className="h-5 w-5 stroke-[3px]" />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                   <p className="text-[8px] font-bold text-white truncate text-center uppercase tracking-tighter">{a.title}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="p-8 border-t border-border/40 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              {selectedPickerUrls.size > 0 && <Button variant="ghost" size="sm" onClick={()=>setSelectedPickerUrls(new Set())} className="text-[10px] font-bold text-destructive uppercase tracking-widest px-4 h-9 hover:bg-destructive/5 rounded-lg border border-destructive/10">清除所有选择</Button>}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={()=>setIsPickerOpen(false)} className="rounded-lg h-10 px-10 text-xs font-bold uppercase tracking-widest border-muted-foreground/20">取消退出</Button>
              <Button onClick={handleConfirmPicker} disabled={selectedPickerUrls.size===0} className="rounded-lg h-10 px-12 text-xs font-bold uppercase tracking-widest shadow-xl">确认插入 {selectedPickerUrls.size} 项素材</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductEditorPage() { return <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20" /></div>}><ProductEditorContent /></Suspense>; }