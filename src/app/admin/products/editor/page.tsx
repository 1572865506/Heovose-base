
"use client";

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
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
  FolderPlus
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
  const [showUrlInput, setShowUrlInput] = useState(false);
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

  // 灵光一闪：智能 ID 分配。如果内容已存在，则复用已有 ID，不产生冗余。
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

    toast({ title: "产品已保存", description: "系统已智能处理多语言冗余项。" });
    router.push('/admin/products');
  };

  // ... (其余辅助函数保持不变，仅修改了 handleSave 中的翻译处理逻辑)
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
      <div className="flex items-center justify-between sticky top-20 z-40 bg-background/80 backdrop-blur-md py-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary">{isEditing ? '编辑产品详情' : '发布全新产品'}</h2>
            <div className="flex items-center gap-3">
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">ID: {formData.id || 'NEW'} | 分类: {getCatName(formData.categoryId)}</p>
               <Badge variant={formData.status === 'published' ? 'default' : 'secondary'} className={cn("text-[8px] uppercase", formData.status === 'published' ? "bg-green-600" : "")}>{formData.status === 'published' ? '已发布' : '草稿'}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl h-11 px-6">取消</Button>
          <Button onClick={handleSave} className="rounded-xl h-11 px-8 font-bold uppercase tracking-widest gap-2 shadow-lg"><Save className="h-4 w-4" /> 保存发布</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-border/40 shadow-sm space-y-6">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">发布状态</Label>
              <Select value={formData.status} onValueChange={(v: 'published'|'draft') => setFormData({...formData, status: v})}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-transparent"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="published">立即发布</SelectItem><SelectItem value="draft">保存草稿</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2 border-t pt-6">
              <Label className="text-[10px] font-bold uppercase text-primary">产品唯一 ID</Label>
              <Input disabled={isEditing} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-primary">所属分类</Label>
              <Select value={formData.categoryId} onValueChange={v => { setFormData({...formData, categoryId: v}); if(!isEditing) generateAutoId(v); }}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/20"><SelectValue placeholder="选择产品分类..." /></SelectTrigger>
                <SelectContent>{categories?.map(c => <SelectItem key={c.id} value={c.id}>{getCatName(c.id)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between"><Label className="text-[10px] font-bold uppercase text-primary">产品主图</Label><button onClick={() => openPicker('main')} className="text-[9px] font-bold text-primary uppercase">从图库选择</button></div>
              <div className="relative aspect-square rounded-2xl bg-muted/30 border border-dashed border-border overflow-hidden flex items-center justify-center group" onClick={() => !formData.mainImageUrl && fileInputRef.current?.click()}>
                {formData.mainImageUrl ? (
                  <>
                    <Image src={formData.mainImageUrl} alt="Main" fill className="object-contain p-4" />
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2 rounded-full h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setFormData({...formData, mainImageUrl: ''}); }}><X className="h-4 w-4" /></Button>
                  </>
                ) : <div className="text-center"><ImageIcon className="h-8 w-8 mx-auto opacity-20" /><p className="text-[10px] font-bold mt-2">点击上传</p></div>}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b w-full justify-start gap-8 rounded-none mb-8">
              <TabsTrigger value="basic" className="rounded-none px-0 pb-4 text-xs font-bold uppercase">基础信息</TabsTrigger>
              <TabsTrigger value="specs" className="rounded-none px-0 pb-4 text-xs font-bold uppercase">技术规格</TabsTrigger>
              <TabsTrigger value="details" className="rounded-none px-0 pb-4 text-xs font-bold uppercase">详细介绍</TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-none px-0 pb-4 text-xs font-bold uppercase">更多图库</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">中文内容 (ZH)</Label>
                    <Input placeholder="产品名称" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="rounded-xl h-11" />
                    <Textarea placeholder="产品简介" value={formData.descZh} onChange={e => setFormData({...formData, descZh: e.target.value})} className="rounded-xl min-h-[120px]" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">英文内容 (EN)</Label>
                    <Input placeholder="Product Name" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-xl h-11" />
                    <Textarea placeholder="Short Description" value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="rounded-xl min-h-[120px]" />
                  </div>
                </div>
                <div className="space-y-6 pt-8 border-t">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-primary">核心优势</h3><Button variant="ghost" size="sm" onClick={() => setFormData({...formData, advantages: [...formData.advantages, {zh:'', en:''}]})} className="text-[10px] font-bold uppercase">+ 添加条目</Button></div>
                  <div className="space-y-4">
                    {formData.advantages.map((adv, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-muted/20 rounded-2xl group relative">
                        <div className="md:col-span-5"><Input placeholder="中文优势" value={adv.zh} onChange={e => updateAdv(idx, 'zh', e.target.value)} /></div>
                        <div className="md:col-span-6"><Input placeholder="英文优势" value={adv.en} onChange={e => updateAdv(idx, 'en', e.target.value)} /></div>
                        <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, advantages: formData.advantages.filter((_,i)=>i!==idx)})} className="md:col-span-1 opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
                <div className="flex items-center justify-between"><h3 className="font-bold text-primary">分层技术参数</h3><Button variant="ghost" size="sm" onClick={() => setFormData({...formData, specGroups: [...formData.specGroups, {titleEn:'', titleZh:'', items:[{labelEn:'', labelZh:'', valueEn:'', valueZh:''}]}]})} className="text-[10px] font-bold uppercase">+ 添加分类</Button></div>
                {formData.specGroups.map((group, gIdx) => (
                  <div key={gIdx} className="p-8 bg-muted/10 rounded-[3rem] border relative group/group">
                    <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, specGroups: formData.specGroups.filter((_,i)=>i!==gIdx)})} className="absolute top-4 right-4 text-destructive opacity-0 group-hover/group:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <Input placeholder="分类标题 (ZH)" value={group.titleZh} onChange={e => { const g = [...formData.specGroups]; g[gIdx].titleZh = e.target.value; setFormData({...formData, specGroups: g}); }} />
                      <Input placeholder="分类标题 (EN)" value={group.titleEn} onChange={e => { const g = [...formData.specGroups]; g[gIdx].titleEn = e.target.value; setFormData({...formData, specGroups: g}); }} />
                    </div>
                    <div className="space-y-4">
                      {group.items.map((item, iIdx) => (
                        <div key={iIdx} className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-white rounded-[2rem] border shadow-sm relative group/item">
                          <div className="md:col-span-5 space-y-2">
                            <Input placeholder="名称 (ZH)" value={item.labelZh} onChange={e => updateSpecItem(gIdx, iIdx, 'labelZh', e.target.value)} className="h-9 text-xs" />
                            <Input placeholder="Name (EN)" value={item.labelEn} onChange={e => updateSpecItem(gIdx, iIdx, 'labelEn', e.target.value)} className="h-9 text-xs opacity-60" />
                          </div>
                          <div className="md:col-span-6 space-y-2">
                            <Input placeholder="数值 (ZH)" value={item.valueZh} onChange={e => updateSpecItem(gIdx, iIdx, 'valueZh', e.target.value)} className="h-9 text-xs" />
                            <Input placeholder="Value (EN)" value={item.valueEn} onChange={e => updateSpecItem(gIdx, iIdx, 'valueEn', e.target.value)} className="h-9 text-xs opacity-60" />
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => { const g = [...formData.specGroups]; g[gIdx].items = g[gIdx].items.filter((_,i)=>i!==iIdx); setFormData({...formData, specGroups: g}); }} className="md:col-span-1 opacity-0 group-hover/item:opacity-100 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => { const g = [...formData.specGroups]; g[gIdx].items.push({labelEn:'', labelZh:'', valueEn:'', valueZh:''}); setFormData({...formData, specGroups: g}); }} className="w-full text-[9px] uppercase">+ 添加规格项</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm grid grid-cols-2 gap-8">
                <Textarea placeholder="中文详细介绍" value={formData.detailsZh} onChange={e => setFormData({...formData, detailsZh: e.target.value})} className="min-h-[400px]" />
                <Textarea placeholder="英文详细介绍" value={formData.detailsEn} onChange={e => setFormData({...formData, detailsEn: e.target.value})} className="min-h-[400px]" />
              </div>
            </TabsContent>

            <TabsContent value="gallery">
               <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                 <div className="flex justify-between items-center"><h3>副图库</h3><Button variant="outline" size="sm" onClick={() => openPicker('gallery')}>批量挑选</Button></div>
                 <div className="grid grid-cols-2 gap-4">
                   {formData.galleryUrls.map((url, idx) => (
                     <div key={idx} className="flex gap-2 p-3 bg-muted/10 rounded-2xl border group">
                       <div className="relative h-16 w-16 border rounded bg-white overflow-hidden"><Image src={url} alt="Gal" fill className="object-contain" /></div>
                       <div className="flex-1 flex flex-col justify-between"><Input value={url} onChange={e => { const g = [...formData.galleryUrls]; g[idx] = e.target.value; setFormData({...formData, galleryUrls: g}); }} className="h-7 text-[10px]" /><Button variant="ghost" size="sm" onClick={() => setFormData({...formData, galleryUrls: formData.galleryUrls.filter((_,i)=>i!==idx)})} className="h-5 text-destructive text-[9px]">移除</Button></div>
                     </div>
                   ))}
                 </div>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-4xl p-0 rounded-[2.5rem] overflow-hidden flex flex-col h-[85vh]">
          <DialogHeader className="p-8 pb-4"><DialogTitle>挑选图库素材</DialogTitle></DialogHeader>
          <div className="px-8 pb-4 flex gap-4"><Input placeholder="搜索素材..." value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} className="flex-1" /></div>
          <div className="flex-1 overflow-y-auto p-8 pt-0">
            <div className="grid grid-cols-4 gap-4">
              {filteredAssets.map(a => (
                <div key={a.id} className={cn("relative aspect-square border rounded-2xl cursor-pointer overflow-hidden", selectedPickerUrls.has(a.url) ? "border-primary ring-2 ring-primary/20" : "")} onClick={() => togglePickerSelection(a.url)}>
                  <Image src={a.url} alt={a.title} fill className="object-cover" />
                  {selectedPickerUrls.has(a.url) && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><Check className="text-white h-8 w-8" /></div>}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted/30"><Button variant="outline" onClick={() => setIsPickerOpen(false)}>取消</Button><Button onClick={handleConfirmPicker} disabled={selectedPickerUrls.size === 0}>确认选择 ({selectedPickerUrls.size})</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductEditorPage() {
  return <Suspense fallback={<div>Loading Editor...</div>}><ProductEditorContent /></Suspense>;
}
