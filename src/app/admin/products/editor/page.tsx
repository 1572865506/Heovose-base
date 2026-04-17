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
  ArrowLeft, 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  Plus, 
  X,
  Languages,
  LayoutGrid,
  Info,
  RefreshCw,
  Upload,
  Link2,
  Search,
  CheckCircle2,
  Filter,
  Check,
  Trash2,
  Eye,
  EyeOff,
  PlusCircle,
  TableProperties,
  FolderPlus,
  Globe
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProductSpecEntry {
  labelEn: string;
  labelZh: string;
  valueEn: string;
  valueZh: string;
}

interface ProductSpecGroup {
  titleEn: string;
  titleZh: string;
  items: ProductSpecEntry[];
}

interface Product {
  id: string;
  nameTextId: string;
  descriptionTextId: string;
  detailsTextId?: string;
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

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
}

interface ProductCategory {
  id: string;
  nameTextId: string;
}

interface GalleryCategory {
  id: string;
  name: string;
  parentId?: string | null;
  order: number;
}

interface GalleryAsset {
  id: string;
  url: string;
  title: string;
  categoryId: string;
}

function ProductEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    detailsEn: '',
    detailsZh: '',
    advantages: [] as { zh: string, en: string }[],
    specGroups: [] as ProductSpecGroup[],
    status: 'draft' as 'published' | 'draft'
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadGalleryCatId, setUploadGalleryCatId] = useState<string>('');

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'main' | 'gallery'>('main');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCat, setPickerCat] = useState('all');
  const [selectedPickerUrls, setSelectedPickerUrls] = useState<Set<string>>(new Set());

  const prodRef = useMemoFirebase(() => productId ? doc(firestore, 'products', productId) : null, [firestore, productId]);
  const catsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'productCategories') : null, [firestore]);
  const transQuery = useMemoFirebase(() => firestore ? collection(firestore, 'localizedStrings') : null, [firestore]);
  const galleryCatsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'galleryCategories'), orderBy('order', 'asc')) : null, [firestore]);
  const assetsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'galleryAssets'), orderBy('createdAt', 'desc')) : null, [firestore]);

  const { data: product, isLoading: isProdLoading } = useDoc<Product>(prodRef);
  const { data: categories } = useCollection<ProductCategory>(catsQuery);
  const { data: translations } = useCollection<LocalizedString>(transQuery);
  const { data: galleryCategories } = useCollection<GalleryCategory>(galleryCatsQuery);
  const { data: galleryAssets } = useCollection<GalleryAsset>(assetsQuery);

  const galleryCategoryTree = useMemo(() => {
    if (!galleryCategories) return [];
    const tree: (GalleryCategory & { depth: number })[] = [];
    const build = (parentId: string | null = null, depth = 0) => {
      galleryCategories.filter(c => (c.parentId || null) === parentId).sort((a, b) => a.order - b.order).forEach(item => {
        tree.push({ ...item, depth });
        build(item.id, depth + 1);
      });
    };
    build(null);
    return tree;
  }, [galleryCategories]);

  useEffect(() => {
    if (galleryCategories?.length && !uploadGalleryCatId) {
      const defaultCat = galleryCategories.find(c => c.name.includes('产品') || c.name.includes('Product')) || galleryCategories[0];
      setUploadGalleryCatId(defaultCat.id);
    }
  }, [galleryCategories, uploadGalleryCatId]);

  useEffect(() => {
    if (isEditing && product && translations) {
      const getT = (id?: string) => translations.find(t => t.id === id) || { en: '', zh: '' };
      const advantages = (product.advantageTextIds || []).map(id => {
        const t = getT(id);
        return { zh: t.zh || '', en: t.en || '' };
      });
      const specGroups = (product.specGroups || []).map(g => {
        const titleT = getT(g.titleId);
        const items = g.items.map(item => ({
          labelEn: getT(item.labelId).en || '',
          labelZh: getT(item.labelId).zh || '',
          valueEn: getT(item.valueId).en || '',
          valueZh: getT(item.valueId).zh || ''
        }));
        return { titleEn: titleT.en || '', titleZh: titleT.zh || '', items };
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
        detailsEn: getT(product.detailsTextId).en || '',
        detailsZh: getT(product.detailsTextId).zh || '',
        advantages: advantages.length > 0 ? advantages : [{ zh: '', en: '' }],
        specGroups: specGroups.length > 0 ? specGroups : [],
        status: product.status || 'draft'
      });
    }
  }, [isEditing, product, translations]);

  const getSmartId = (en: string, zh: string, preferredId: string) => {
    const existing = translations?.find(t => t.en.trim() === en.trim() && t.zh.trim() === zh.trim());
    return existing ? existing.id : preferredId;
  };

  const handleSave = () => {
    if (!firestore || !formData.id || !formData.categoryId) return;
    
    const saveLang = (en: string, zh: string, defaultId: string) => {
      const targetId = getSmartId(en, zh, defaultId);
      setDocumentNonBlocking(doc(firestore, 'localizedStrings', targetId), { id: targetId, en, zh, updatedAt: serverTimestamp() }, { merge: true });
      return targetId;
    };

    const nameId = saveLang(formData.nameEn, formData.nameZh, `prod_name_${formData.id}`);
    const descId = saveLang(formData.descEn, formData.descZh, `prod_desc_${formData.id}`);
    const detailsId = saveLang(formData.detailsEn, formData.detailsZh, `prod_details_${formData.id}`);

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
      detailsTextId: detailsId,
      advantageTextIds: advantageIds,
      specGroups: savedSpecGroups,
      mainImageUrl: formData.mainImageUrl,
      productCategoryId: formData.categoryId,
      galleryImageUrls: formData.galleryUrls.filter(Boolean),
      status: formData.status,
      updatedAt: serverTimestamp()
    }, { merge: true });

    toast({ title: "产品已保存", description: "系统已智能处理多语言冗余项并更新发布状态。" });
    router.push('/admin/products');
  };

  const generateAutoId = (catId: string) => {
    const prefix = catId.replace('cat-', '').toUpperCase();
    const date = new Date();
    const dateStr = date.getFullYear().toString().slice(-2) + (date.getMonth() + 1).toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    setFormData(prev => ({ ...prev, id: `${prefix}-${dateStr}-${randomSuffix}` }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firestore) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const assetId = `asset_prod_${Date.now()}`;
      setDocumentNonBlocking(doc(firestore, 'galleryAssets', assetId), {
        id: assetId, url: base64, title: `Product Image: ${formData.id}`, fileName: file.name, fileSize: file.size, categoryId: uploadGalleryCatId || 'uncategorized', createdAt: serverTimestamp()
      }, { merge: true });
      setFormData(prev => ({ ...prev, mainImageUrl: base64 }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const openPicker = (target: 'main' | 'gallery') => {
    setPickerTarget(target);
    setSelectedPickerUrls(new Set());
    setIsPickerOpen(true);
  };

  const filteredAssets = useMemo(() => {
    if (!galleryAssets) return [];
    return galleryAssets.filter(a => a.title.toLowerCase().includes(pickerSearch.toLowerCase()) && (pickerCat === 'all' || a.categoryId === pickerCat));
  }, [galleryAssets, pickerSearch, pickerCat]);

  const togglePickerSelection = (url: string) => {
    const newSelected = new Set(selectedPickerUrls);
    if (pickerTarget === 'main') { newSelected.clear(); newSelected.add(url); }
    else { newSelected.has(url) ? newSelected.delete(url) : newSelected.add(url); }
    setSelectedPickerUrls(newSelected);
  };

  const handleConfirmPicker = () => {
    const urls = Array.from(selectedPickerUrls);
    if (urls.length === 0) return;
    if (pickerTarget === 'main') setFormData({ ...formData, mainImageUrl: urls[0] });
    else setFormData({ ...formData, galleryUrls: [...formData.galleryUrls, ...urls] });
    setIsPickerOpen(false);
  };

  const updateAdv = (idx: number, field: 'zh' | 'en', val: string) => {
    const newAdvs = [...formData.advantages];
    newAdvs[idx][field] = val;
    setFormData({ ...formData, advantages: newAdvs });
  };

  const updateSpecItem = (gIdx: number, iIdx: number, field: keyof ProductSpecEntry, val: string) => {
    const newGroups = [...formData.specGroups];
    newGroups[gIdx].items[iIdx][field] = val;
    setFormData({ ...formData, specGroups: newGroups });
  };

  if (isEditing && isProdLoading) return <div className="h-[60vh] flex flex-col items-center justify-center gap-4"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>;

  const getCatName = (id: string) => {
    const cat = categories?.find(c => c.id === id);
    if (!cat) return id;
    const t = translations?.find(tr => tr.id === cat.nameTextId);
    return t ? `${t.zh} (${t.en})` : id;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* 增强型吸顶页头 */}
      <div className="flex items-center justify-between sticky top-20 z-40 bg-background/90 backdrop-blur-xl py-6 border-b border-border/40 shadow-sm px-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-muted"><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary">{isEditing ? '编辑产品详情' : '发布全新产品'}</h2>
            <div className="flex items-center gap-3">
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">ID: {formData.id || 'NEW'} | 分类: {getCatName(formData.categoryId)}</p>
               <Badge variant={formData.status === 'published' ? 'default' : 'secondary'} className={cn("text-[8px] uppercase px-2 py-0.5", formData.status === 'published' ? "bg-green-600 hover:bg-green-600" : "")}>{formData.status === 'published' ? '已发布' : '草稿'}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl h-11 px-6 font-bold uppercase tracking-widest text-[10px]">放弃修改</Button>
          <Button onClick={handleSave} className="rounded-xl h-11 px-8 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20"><Save className="h-4 w-4" /> 保存并发布</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 左侧配置栏 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2"><RefreshCw className="h-3 w-3" /> 发布状态</Label>
              <Select value={formData.status} onValueChange={(v: 'published'|'draft') => setFormData({...formData, status: v})}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-transparent transition-all hover:bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="published" className="text-xs font-bold text-green-600">立即发布 (Public)</SelectItem>
                  <SelectItem value="draft" className="text-xs font-bold">保存草稿 (Draft)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 border-t pt-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-primary">产品唯一 ID</Label>
                <Input disabled={isEditing} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-12 rounded-xl bg-muted/10 border-none font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-primary">所属产品分类</Label>
                <Select value={formData.categoryId} onValueChange={v => { setFormData({...formData, categoryId: v}); if(!isEditing) generateAutoId(v); }}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-transparent hover:bg-muted/30"><SelectValue placeholder="选择产品分类..." /></SelectTrigger>
                  <SelectContent className="rounded-xl">{categories?.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{getCatName(c.id)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase text-primary flex items-center gap-2"><ImageIcon className="h-3 w-3" /> 产品主图</Label>
                <button onClick={() => openPicker('main')} className="text-[9px] font-bold text-primary uppercase hover:underline">从图库挑选</button>
              </div>
              
              <div className="space-y-4">
                <div className="relative aspect-square rounded-[2rem] bg-muted/20 border-2 border-dashed border-border/60 overflow-hidden flex items-center justify-center group transition-all hover:border-primary/40 hover:bg-muted/30 cursor-pointer" onClick={() => !formData.mainImageUrl && fileInputRef.current?.click()}>
                  {formData.mainImageUrl ? (
                    <>
                      <Image src={formData.mainImageUrl} alt="Main" fill className="object-contain p-6 group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Button variant="destructive" size="sm" className="rounded-full h-10 w-10 p-0 shadow-2xl" onClick={(e) => { e.stopPropagation(); setFormData({...formData, mainImageUrl: ''}); }}><X className="h-5 w-5" /></Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-3 opacity-40 group-hover:opacity-100 transition-opacity">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary"><Upload className="h-6 w-6" /></div>
                      <p className="text-[10px] font-bold uppercase tracking-tighter">点击上传或拖拽图片</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                <div className="space-y-2">
                   <Label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">上传到图库分类</Label>
                   <Select value={uploadGalleryCatId} onValueChange={setUploadGalleryCatId}>
                     <SelectTrigger className="h-10 rounded-xl bg-muted/10 border-transparent text-[10px]">
                       <SelectValue placeholder="选择目标分类" />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl">
                        {galleryCategoryTree.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="text-xs">
                             <span style={{ paddingLeft: `${cat.depth * 0.5}rem` }} className="flex items-center">
                               {cat.depth > 0 && <span className="mr-1.5 opacity-30">·</span>}
                               {cat.name}
                             </span>
                          </SelectItem>
                        ))}
                     </SelectContent>
                   </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧主编辑器 */}
        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-border/40 w-full justify-start gap-10 rounded-none mb-10 h-auto p-0">
              <TabsTrigger value="basic" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all">基础信息</TabsTrigger>
              <TabsTrigger value="specs" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all">技术规格</TabsTrigger>
              <TabsTrigger value="details" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all">详细介绍</TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all">更多图库</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <Label className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2"><Languages className="h-3 w-3" /> 中文内容 (ZH)</Label>
                    <Input placeholder="产品名称 (例如: Heovose H24 Pro)" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="rounded-xl h-12 bg-muted/5 border-border/40 focus:bg-white transition-all" />
                    <Textarea placeholder="产品简介：简短有力地描述产品核心定位" value={formData.descZh} onChange={e => setFormData({...formData, descZh: e.target.value})} className="rounded-xl min-h-[140px] bg-muted/5 border-border/40 focus:bg-white transition-all resize-none" />
                  </div>
                  <div className="space-y-5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2"><Globe className="h-3 w-3" /> 英文内容 (EN)</Label>
                    <Input placeholder="Product Name (e.g. Heovose H24 Pro)" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-xl h-12 bg-muted/5 border-border/40 focus:bg-white transition-all" />
                    <Textarea placeholder="Short Description: A catchy slogan or summary for global markets" value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="rounded-xl min-h-[140px] bg-muted/5 border-border/40 focus:bg-white transition-all resize-none" />
                  </div>
                </div>

                <div className="space-y-8 pt-10 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-primary flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> 核心优势</h3>
                      <p className="text-[10px] text-muted-foreground">用于详情页顶部的特点标注，支持双语录入。</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setFormData({...formData, advantages: [...formData.advantages, {zh:'', en:''}]})} className="rounded-full h-9 text-[10px] font-bold uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">+ 添加优势项</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {formData.advantages.map((adv, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-muted/10 rounded-[2rem] border border-border/20 group relative transition-all hover:bg-muted/20">
                        <div className="md:col-span-5 space-y-2">
                           <Label className="text-[8px] font-bold uppercase opacity-40">中文优势</Label>
                           <Input placeholder="例如: 24/7 工业级运行支持" value={adv.zh} onChange={e => updateAdv(idx, 'zh', e.target.value)} className="h-10 bg-white/80 border-none rounded-xl" />
                        </div>
                        <div className="md:col-span-6 space-y-2">
                           <Label className="text-[8px] font-bold uppercase opacity-40">English Advantage</Label>
                           <Input placeholder="e.g. 24/7 Industrial Stability" value={adv.en} onChange={e => updateAdv(idx, 'en', e.target.value)} className="h-10 bg-white/80 border-none rounded-xl" />
                        </div>
                        <div className="md:col-span-1 flex items-center justify-center pt-5">
                          <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, advantages: formData.advantages.filter((_,i)=>i!==idx)})} className="text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-border/40 pb-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2"><TableProperties className="h-5 w-5" /> 分类技术参数</h3>
                    <p className="text-xs text-muted-foreground">根据产品线创建不同的参数分组（如主板、屏幕、物理接口等）。</p>
                  </div>
                  <Button variant="default" size="sm" onClick={() => setFormData({...formData, specGroups: [...formData.specGroups, {titleEn:'', titleZh:'', items:[{labelEn:'', labelZh:'', valueEn:'', valueZh:''}]}]})} className="rounded-xl h-11 px-6 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/10"><PlusCircle className="h-4 w-4" /> 添加新分组</Button>
                </div>

                <div className="space-y-12">
                  {formData.specGroups.map((group, gIdx) => (
                    <div key={gIdx} className="p-8 bg-muted/10 rounded-[3rem] border border-border/40 relative group/group transition-all hover:bg-muted/20">
                      <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, specGroups: formData.specGroups.filter((_,i)=>i!==gIdx)})} className="absolute top-6 right-6 text-destructive opacity-0 group-hover/group:opacity-100 transition-opacity hover:bg-destructive/10 rounded-full"><Trash2 className="h-4 w-4" /></Button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase text-primary ml-2">分类标题 (ZH)</Label>
                           <Input placeholder="输入中文分类标题..." value={group.titleZh} onChange={e => { const g = [...formData.specGroups]; g[gIdx].titleZh = e.target.value; setFormData({...formData, specGroups: g}); }} className="h-12 bg-white rounded-xl border-none shadow-inner" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-2">Category Title (EN)</Label>
                           <Input placeholder="Enter English category title..." value={group.titleEn} onChange={e => { const g = [...formData.specGroups]; g[gIdx].titleEn = e.target.value; setFormData({...formData, specGroups: g}); }} className="h-12 bg-white rounded-xl border-none shadow-inner" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 pl-4 border-l-2 border-primary/10 ml-2">
                        {group.items.map((item, iIdx) => (
                          <div key={iIdx} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-8 bg-white rounded-[2.5rem] border border-border/20 shadow-sm relative group/item hover:shadow-md transition-all">
                            <div className="md:col-span-5 space-y-4">
                              <div className="space-y-1.5">
                                <Label className="text-[8px] font-bold uppercase opacity-30">项名称 (ZH / EN)</Label>
                                <Input placeholder="参数名称 (ZH)" value={item.labelZh} onChange={e => updateSpecItem(gIdx, iIdx, 'labelZh', e.target.value)} className="h-10 text-xs rounded-xl bg-muted/5 border-none" />
                                <Input placeholder="Item Name (EN)" value={item.labelEn} onChange={e => updateSpecItem(gIdx, iIdx, 'labelEn', e.target.value)} className="h-10 text-xs rounded-xl bg-muted/5 border-none opacity-60" />
                              </div>
                            </div>
                            <div className="md:col-span-6 space-y-4">
                              <div className="space-y-1.5">
                                <Label className="text-[8px] font-bold uppercase opacity-30">数值内容 (ZH / EN)</Label>
                                <Input placeholder="参数数值 (ZH)" value={item.valueZh} onChange={e => updateSpecItem(gIdx, iIdx, 'valueZh', e.target.value)} className="h-10 text-xs rounded-xl bg-muted/5 border-none" />
                                <Input placeholder="Value Content (EN)" value={item.valueEn} onChange={e => updateSpecItem(gIdx, iIdx, 'valueEn', e.target.value)} className="h-10 text-xs rounded-xl bg-muted/5 border-none opacity-60" />
                              </div>
                            </div>
                            <div className="md:col-span-1 flex items-center justify-center">
                              <Button variant="ghost" size="icon" onClick={() => { const g = [...formData.specGroups]; g[gIdx].items = g[gIdx].items.filter((_,i)=>i!==iIdx); setFormData({...formData, specGroups: g}); }} className="text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => { const g = [...formData.specGroups]; g[gIdx].items.push({labelEn:'', labelZh:'', valueEn:'', valueZh:''}); setFormData({...formData, specGroups: g}); }} className="w-full h-12 text-[10px] uppercase font-bold tracking-widest border-2 border-dashed rounded-[1.5rem] text-primary/40 hover:text-primary hover:bg-white transition-all">+ 添加一项规格参数</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-8">
                <div className="flex items-center gap-3 border-b border-border/40 pb-6 mb-4">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">产品详细图文介绍</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase text-primary tracking-widest">中文详细介绍 (ZH)</Label>
                    <Textarea placeholder="支持长篇幅内容录入，介绍产品的应用场景、工厂实力等..." value={formData.detailsZh} onChange={e => setFormData({...formData, detailsZh: e.target.value})} className="min-h-[500px] rounded-[2rem] p-6 bg-muted/5 border-border/40 resize-none" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">English Detailed Info (EN)</Label>
                    <Textarea placeholder="Support for long-form detailed information and descriptions..." value={formData.detailsEn} onChange={e => setFormData({...formData, detailsEn: e.target.value})} className="min-h-[500px] rounded-[2rem] p-6 bg-muted/5 border-border/40 resize-none" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-8">
                 <div className="flex justify-between items-center border-b border-border/40 pb-6 mb-6">
                   <div className="space-y-1">
                      <h3 className="text-xl font-bold text-primary flex items-center gap-2"><ImageIcon className="h-5 w-5" /> 副图库管理</h3>
                      <p className="text-xs text-muted-foreground">用于详情页相册展示的高清大图，支持批量导入。</p>
                   </div>
                   <Button variant="outline" size="sm" onClick={() => openPicker('gallery')} className="rounded-xl h-11 px-6 font-bold uppercase tracking-widest text-[10px] gap-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm"><FolderPlus className="h-4 w-4" /> 批量从图库挑选</Button>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {formData.galleryUrls.map((url, idx) => (
                     <div key={idx} className="flex gap-4 p-5 bg-muted/10 rounded-[2rem] border border-border/20 group relative transition-all hover:bg-muted/20">
                       <div className="relative h-24 w-24 border border-border/40 rounded-2xl bg-white overflow-hidden shadow-sm shrink-0">
                         <Image src={url} alt="Gallery Item" fill className="object-contain p-2" />
                       </div>
                       <div className="flex-1 flex flex-col justify-between py-1">
                         <div className="space-y-2">
                            <Label className="text-[8px] font-bold uppercase opacity-30">素材链接 URL</Label>
                            <Input value={url} onChange={e => { const g = [...formData.galleryUrls]; g[idx] = e.target.value; setFormData({...formData, galleryUrls: g}); }} className="h-9 text-[10px] bg-white rounded-lg border-none" />
                         </div>
                         <Button variant="ghost" size="sm" onClick={() => setFormData({...formData, galleryUrls: formData.galleryUrls.filter((_,i)=>i!==idx)})} className="h-7 text-destructive text-[10px] font-bold uppercase tracking-widest hover:bg-destructive/10 rounded-lg w-fit ml-auto">移除此图</Button>
                       </div>
                     </div>
                   ))}
                   {formData.galleryUrls.length === 0 && (
                     <div className="col-span-full py-20 text-center border-2 border-dashed border-border/40 rounded-[2.5rem] opacity-30">
                       <ImageIcon className="h-10 w-10 mx-auto mb-4" />
                       <p className="text-sm font-bold uppercase tracking-widest">暂无副图素材，请点击右上角批量添加</p>
                     </div>
                   )}
                 </div>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 全局素材选择器弹窗 */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-5xl p-0 rounded-[3rem] overflow-hidden flex flex-col h-[85vh] border-none shadow-2xl">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <ImageIcon className="h-8 w-8" /> 
                {pickerTarget === 'main' ? '选择产品主图' : '批量挑选副图库素材'}
              </DialogTitle>
              <DialogDescription className="text-white/60 text-sm">
                从全球素材中心直接引用高清图片，已选中的项目将自动标记。
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-8 py-6 flex flex-col md:flex-row gap-4 bg-muted/20 border-b border-border/40">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="按标题搜索素材..." 
                value={pickerSearch} 
                onChange={e => setPickerSearch(e.target.value)} 
                className="pl-10 h-12 bg-white rounded-xl border-none shadow-sm" 
              />
            </div>
            <Select value={pickerCat} onValueChange={setPickerCat}>
              <SelectTrigger className="w-full md:w-64 h-12 rounded-xl bg-white border-none shadow-sm">
                <SelectValue placeholder="所有分类" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">所有分类</SelectItem>
                {galleryCategoryTree.map(cat => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs">
                    <span style={{ paddingLeft: `${cat.depth * 0.8}rem` }}>{cat.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-6 bg-muted/5">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredAssets.map(a => (
                <div 
                  key={a.id} 
                  className={cn(
                    "group relative aspect-square bg-white rounded-2xl cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-xl",
                    selectedPickerUrls.has(a.url) ? "border-primary ring-4 ring-primary/20 scale-[0.98]" : "border-transparent hover:border-primary/20"
                  )} 
                  onClick={() => togglePickerSelection(a.url)}
                >
                  <Image src={a.url} alt={a.title} fill className="object-cover" />
                  
                  {/* 选中状态遮罩 */}
                  {selectedPickerUrls.has(a.url) && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                      <div className="bg-white rounded-full p-2 shadow-2xl">
                        <Check className="text-primary h-8 w-8 stroke-[3]" />
                      </div>
                    </div>
                  )}

                  {/* 悬停信息 */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white font-bold truncate">{a.title}</p>
                  </div>
                </div>
              ))}
            </div>
            {filteredAssets.length === 0 && (
              <div className="py-20 text-center opacity-30">
                <Search className="h-10 w-10 mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">未找到匹配的素材</p>
              </div>
            )}
          </div>

          <DialogFooter className="p-8 bg-white border-t border-border/40 flex items-center justify-between">
            <div className="text-sm font-bold text-primary">
               已选中 <span className="text-2xl">{selectedPickerUrls.size}</span> 项素材
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setIsPickerOpen(false)} className="rounded-xl h-12 px-8 font-bold uppercase tracking-widest text-[10px]">取消</Button>
              <Button onClick={handleConfirmPicker} disabled={selectedPickerUrls.size === 0} className="rounded-xl h-12 px-10 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">确认添加已选素材</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductEditorPage() {
  return <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>}><ProductEditorContent /></Suspense>;
}
