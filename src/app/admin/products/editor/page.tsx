
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
  ClipboardList,
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

  // 素材选择器状态
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'main' | 'gallery'>('main');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCat, setPickerCat] = useState('all');
  const [selectedPickerUrls, setSelectedPickerUrls] = useState<Set<string>>(new Set());

  const prodRef = useMemoFirebase(() => productId ? doc(firestore, 'products', productId) : null, [firestore, productId]);
  const catsQuery = useMemoFirebase(() => collection(firestore, 'productCategories'), [firestore]);
  const transQuery = useMemoFirebase(() => collection(firestore, 'localizedStrings'), [firestore]);
  const galleryCatsQuery = useMemoFirebase(() => query(collection(firestore, 'galleryCategories'), orderBy('order', 'asc')), [firestore]);
  const assetsQuery = useMemoFirebase(() => query(collection(firestore, 'galleryAssets'), orderBy('createdAt', 'desc')), [firestore]);

  const { data: product, isLoading: isProdLoading } = useDoc<Product>(prodRef);
  const { data: categories } = useCollection<ProductCategory>(catsQuery);
  const { data: translations } = useCollection<LocalizedString>(transQuery);
  const { data: galleryCategories } = useCollection<GalleryCategory>(galleryCatsQuery);
  const { data: galleryAssets } = useCollection<GalleryAsset>(assetsQuery);

  const galleryCategoryTree = useMemo(() => {
    if (!galleryCategories) return [];
    const tree: (GalleryCategory & { depth: number })[] = [];
    const build = (parentId: string | null = null, depth = 0) => {
      galleryCategories
        .filter(c => (c.parentId || null) === parentId)
        .sort((a, b) => a.order - b.order)
        .forEach(item => {
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
      
      const nameT = getT(product.nameTextId);
      const descT = getT(product.descriptionTextId);
      const detailsT = getT(product.detailsTextId);
      
      const advantages = (product.advantageTextIds || []).map(id => {
        const t = getT(id);
        return { zh: t.zh || '', en: t.en || '' };
      });

      const specGroups = (product.specGroups || []).map(g => {
        const titleT = getT(g.titleId);
        const items = g.items.map(item => {
          const lblT = getT(item.labelId);
          const valT = getT(item.valueId);
          return {
            labelEn: lblT.en || '',
            labelZh: lblT.zh || '',
            valueEn: valT.en || '',
            valueZh: valT.zh || ''
          };
        });
        return {
          titleEn: titleT.en || '',
          titleZh: titleT.zh || '',
          items: items
        };
      });

      setFormData({
        id: product.id,
        categoryId: product.productCategoryId,
        mainImageUrl: product.mainImageUrl,
        galleryUrls: product.galleryImageUrls || [],
        nameEn: nameT.en || '',
        nameZh: nameT.zh || '',
        descEn: descT.en || '',
        descZh: descT.zh || '',
        detailsEn: detailsT.en || '',
        detailsZh: detailsT.zh || '',
        advantages: advantages.length > 0 ? advantages : [{ zh: '', en: '' }],
        specGroups: specGroups.length > 0 ? specGroups : [],
        status: product.status || 'draft'
      });
    } else if (!isEditing) {
      setFormData(prev => ({
        ...prev,
        advantages: [{ zh: '', en: '' }],
        specGroups: []
      }));
    }
  }, [isEditing, product, translations]);

  useEffect(() => {
    if (!isEditing && formData.categoryId && !formData.id) {
      generateAutoId(formData.categoryId);
    }
  }, [formData.categoryId, isEditing]);

  const generateAutoId = (catId: string) => {
    const prefix = catId.replace('cat-', '').toUpperCase();
    const date = new Date();
    const dateStr = date.getFullYear().toString().slice(-2) + 
                    (date.getMonth() + 1).toString().padStart(2, '0') + 
                    date.getDate().toString().padStart(2, '0');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newId = `${prefix}-${dateStr}-${randomSuffix}`;
    setFormData(prev => ({ ...prev, id: newId }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firestore) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "文件类型错误", description: "请选择有效的图片文件。" });
      return;
    }

    if (file.size > 800000) {
      toast({ variant: "destructive", title: "文件过大", description: "图片大小不能超过 800KB。" });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const assetId = `asset_prod_${Date.now()}`;
      const assetTitle = `Product Image: ${formData.id || 'Untitled'}`;
      const targetGalleryCatId = uploadGalleryCatId || galleryCategories?.[0]?.id || 'uncategorized';

      setDocumentNonBlocking(doc(firestore, 'galleryAssets', assetId), {
        id: assetId,
        url: base64,
        title: assetTitle,
        fileName: file.name,
        fileSize: file.size,
        categoryId: targetGalleryCatId,
        createdAt: serverTimestamp()
      }, { merge: true });

      setFormData(prev => ({ ...prev, mainImageUrl: base64 }));
      setIsUploading(false);
      toast({ title: "图片已上传并同步至图库" });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast({ variant: "destructive", title: "上传失败", description: "读取图片文件时发生错误。" });
    };

    reader.readAsDataURL(file);
  };

  const filteredAssets = useMemo(() => {
    if (!galleryAssets) return [];
    return galleryAssets.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(pickerSearch.toLowerCase());
      const matchesCat = pickerCat === 'all' || a.categoryId === pickerCat;
      return matchesSearch && matchesCat;
    });
  }, [galleryAssets, pickerSearch, pickerCat]);

  const togglePickerSelection = (url: string) => {
    const newSelected = new Set(selectedPickerUrls);
    if (pickerTarget === 'main') {
      newSelected.clear();
      newSelected.add(url);
    } else {
      if (newSelected.has(url)) {
        newSelected.delete(url);
      } else {
        newSelected.add(url);
      }
    }
    setSelectedPickerUrls(newSelected);
  };

  const handleConfirmPicker = () => {
    const urls = Array.from(selectedPickerUrls);
    if (urls.length === 0) {
      setIsPickerOpen(false);
      return;
    }

    if (pickerTarget === 'main') {
      setFormData({ ...formData, mainImageUrl: urls[0] });
    } else {
      setFormData({ 
        ...formData, 
        galleryUrls: [...formData.galleryUrls, ...urls] 
      });
    }
    setIsPickerOpen(false);
    toast({ title: `已成功添加 ${urls.length} 项素材` });
  };

  const handleSave = () => {
    if (!firestore || !formData.id || !formData.categoryId) {
      toast({ variant: "destructive", title: "保存失败", description: "请确保 ID 和分类已填写。" });
      return;
    }
    
    const nameId = isEditing ? product?.nameTextId : `prod_name_${formData.id}`;
    const descId = isEditing ? product?.descriptionTextId : `prod_desc_${formData.id}`;
    const detailsId = isEditing && product?.detailsTextId ? product.detailsTextId : `prod_details_${formData.id}`;

    const saveLang = (id: string, en: string, zh: string) => {
      setDocumentNonBlocking(doc(firestore, 'localizedStrings', id), {
        id, en, zh, updatedAt: serverTimestamp()
      }, { merge: true });
    };

    saveLang(nameId!, formData.nameEn, formData.nameZh);
    saveLang(descId!, formData.descEn, formData.descZh);
    saveLang(detailsId, formData.detailsEn, formData.detailsZh);

    // 处理核心优势
    const advantageIds: string[] = [];
    formData.advantages.forEach((adv, index) => {
      if (adv.zh || adv.en) {
        const advId = `prod_adv_${formData.id}_${index}`;
        saveLang(advId, adv.en, adv.zh);
        advantageIds.push(advId);
      }
    });

    // 处理分组技术规格
    const savedSpecGroups = formData.specGroups.map((group, gIdx) => {
      const titleId = `prod_spec_group_${formData.id}_${gIdx}`;
      saveLang(titleId, group.titleEn, group.titleZh);

      const items = group.items.map((item, iIdx) => {
        const lblId = `prod_spec_lbl_${formData.id}_${gIdx}_${iIdx}`;
        const valId = `prod_spec_val_${formData.id}_${gIdx}_${iIdx}`;
        saveLang(lblId, item.labelEn, item.labelZh);
        saveLang(valId, item.valueEn, item.valueZh);
        return { labelId: lblId, valueId: valId };
      });

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

    toast({ title: "产品已保存", description: "内容已同步至云端。" });
    router.push('/admin/products');
  };

  const openPicker = (target: 'main' | 'gallery') => {
    setPickerTarget(target);
    setSelectedPickerUrls(new Set());
    setIsPickerOpen(true);
  };

  const updateGalleryItem = (idx: number, val: string) => {
    const newUrls = [...formData.galleryUrls];
    newUrls[idx] = val;
    setFormData({ ...formData, galleryUrls: newUrls });
  };
  const removeGalleryItem = (idx: number) => {
    setFormData({ ...formData, galleryUrls: formData.galleryUrls.filter((_, i) => i !== idx) });
  };

  const updateAdv = (idx: number, field: 'zh' | 'en', val: string) => {
    const newAdvs = [...formData.advantages];
    newAdvs[idx][field] = val;
    setFormData({ ...formData, advantages: newAdvs });
  };
  const addAdv = () => {
    setFormData({ ...formData, advantages: [...formData.advantages, { zh: '', en: '' }] });
  };
  const removeAdv = (idx: number) => {
    setFormData({ ...formData, advantages: formData.advantages.filter((_, i) => i !== idx) });
  };

  // 规格分组管理函数
  const addSpecGroup = () => {
    setFormData({
      ...formData,
      specGroups: [...formData.specGroups, { titleEn: '', titleZh: '', items: [{ labelEn: '', labelZh: '', valueEn: '', valueZh: '' }] }]
    });
  };
  const removeSpecGroup = (gIdx: number) => {
    setFormData({ ...formData, specGroups: formData.specGroups.filter((_, i) => i !== gIdx) });
  };
  const updateGroupTitle = (gIdx: number, field: 'titleEn' | 'titleZh', val: string) => {
    const newGroups = [...formData.specGroups];
    newGroups[gIdx][field] = val;
    setFormData({ ...formData, specGroups: newGroups });
  };
  const addSpecToGroup = (gIdx: number) => {
    const newGroups = [...formData.specGroups];
    newGroups[gIdx].items.push({ labelEn: '', labelZh: '', valueEn: '', valueZh: '' });
    setFormData({ ...formData, specGroups: newGroups });
  };
  const removeSpecFromGroup = (gIdx: number, iIdx: number) => {
    const newGroups = [...formData.specGroups];
    newGroups[gIdx].items = newGroups[gIdx].items.filter((_, i) => i !== iIdx);
    setFormData({ ...formData, specGroups: newGroups });
  };
  const updateSpecItem = (gIdx: number, iIdx: number, field: keyof ProductSpecEntry, val: string) => {
    const newGroups = [...formData.specGroups];
    newGroups[gIdx].items[iIdx][field] = val;
    setFormData({ ...formData, specGroups: newGroups });
  };

  if (isEditing && isProdLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-xs font-bold uppercase tracking-widest text-primary/50">正在拉取产品档案...</p>
      </div>
    );
  }

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
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
              {isEditing ? '编辑产品详情' : '发布全新产品'}
            </h2>
            <div className="flex items-center gap-3">
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                ID: {formData.id || 'NEW'} | 分类: {getCatName(formData.categoryId) || '未设定'}
              </p>
              <Badge variant={formData.status === 'published' ? 'default' : 'secondary'} className={cn(
                "text-[8px] uppercase px-2 py-0 h-4",
                formData.status === 'published' ? "bg-green-600" : ""
              )}>
                {formData.status === 'published' ? '已发布' : '草稿'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl h-11 px-6">取消</Button>
          <Button onClick={handleSave} className="rounded-xl h-11 px-8 font-bold uppercase tracking-widest gap-2 shadow-lg">
            <Save className="h-4 w-4" /> 保存发布
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-border/40 shadow-sm space-y-6">
            
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                {formData.status === 'published' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                产品发布状态
              </Label>
              <Select value={formData.status} onValueChange={(v: 'published'|'draft') => setFormData({...formData, status: v})}>
                <SelectTrigger className={cn(
                  "h-12 rounded-xl border-transparent transition-colors",
                  formData.status === 'published' ? "bg-green-50 text-green-700" : "bg-muted/30"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3" /> 立即发布 (公开可见)
                    </div>
                  </SelectItem>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-3 w-3" /> 保存为草稿 (下架)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 border-t pt-6">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">产品唯一 ID</Label>
                {!isEditing && formData.categoryId && (
                  <button 
                    onClick={() => generateAutoId(formData.categoryId)}
                    className="text-[9px] flex items-center gap-1 font-bold text-muted-foreground hover:text-primary transition-colors uppercase"
                  >
                    <RefreshCw className="h-2 w-2" /> 重新生成
                  </button>
                )}
              </div>
              <Input 
                disabled={isEditing} 
                placeholder="选择分类后将自动填充" 
                value={formData.id} 
                onChange={e => setFormData({...formData, id: e.target.value})}
                className="h-12 rounded-xl bg-muted/20 border-transparent focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">所属分类</Label>
              <Select value={formData.categoryId} onValueChange={v => setFormData({...formData, categoryId: v})}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-transparent">
                  <SelectValue placeholder="选择产品分类..." />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{getCatName(c.id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">产品主图 (Main Image)</Label>
                <div className="flex gap-2">
                   <button 
                    onClick={() => openPicker('main')}
                    className="text-[9px] flex items-center gap-1 font-bold text-primary hover:underline transition-colors uppercase"
                  >
                    <LayoutGrid className="h-2 w-2" /> 从图库选择
                  </button>
                  <button 
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[9px] flex items-center gap-1 font-bold text-muted-foreground hover:text-primary transition-colors uppercase"
                  >
                    <Link2 className="h-2 w-2" /> {showUrlInput ? '切换到上传' : '手动输入 URL'}
                  </button>
                </div>
              </div>

              {!showUrlInput && (
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-muted-foreground">图库上传目标分类</Label>
                  <Select value={uploadGalleryCatId} onValueChange={setUploadGalleryCatId}>
                    <SelectTrigger className="h-8 text-[10px] rounded-lg bg-muted/20 border-transparent">
                      <SelectValue placeholder="选择图库分类" />
                    </SelectTrigger>
                    <SelectContent>
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
              )}

              <div 
                className={cn(
                  "relative aspect-square rounded-2xl bg-muted/30 border border-dashed border-border overflow-hidden flex flex-col items-center justify-center group transition-all",
                  (!showUrlInput && !formData.mainImageUrl) && "cursor-pointer hover:bg-muted/50 hover:border-primary/50"
                )}
                onClick={() => (!showUrlInput && !formData.mainImageUrl) && fileInputRef.current?.click()}
              >
                {formData.mainImageUrl ? (
                  <>
                    <Image src={formData.mainImageUrl} alt="Main" fill className="object-contain p-4" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <div className="flex gap-2">
                        {!showUrlInput && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="rounded-xl h-10 px-4 font-bold uppercase text-[10px]"
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          >
                            <Upload className="h-3 w-3 mr-2" /> 更换
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="rounded-xl h-10 px-4 font-bold uppercase text-[10px]"
                          onClick={(e) => { e.stopPropagation(); setFormData({...formData, mainImageUrl: ''}); }}
                        >
                          <X className="h-3 w-3 mr-2" /> 移除
                        </Button>
                      </div>
                    </div>
                  </>
                ) : isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-40" />
                    <p className="text-[10px] font-bold text-primary/40 uppercase">同步中...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary/40">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">点击上传主图</p>
                      <p className="text-[10px] text-muted-foreground mt-1">或通过右上方按钮从图库选取</p>
                    </div>
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              {showUrlInput && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Input 
                    placeholder="输入外部图片 URL..." 
                    value={formData.mainImageUrl} 
                    onChange={e => setFormData({...formData, mainImageUrl: e.target.value})}
                    className="h-10 text-xs rounded-xl bg-muted/20 border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 border-b border-border/40 w-full justify-start gap-8 rounded-none mb-8">
              <TabsTrigger value="basic" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                <LayoutGrid className="h-3 w-3 mr-2" /> 基础信息
              </TabsTrigger>
              <TabsTrigger value="specs" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                <TableProperties className="h-3 w-3 mr-2" /> 技术规格
              </TabsTrigger>
              <TabsTrigger value="details" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                <Info className="h-3 w-3 mr-2" /> 详细介绍
              </TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                <ImageIcon className="h-3 w-3 mr-2" /> 更多图库
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm space-y-8">
                <div className="flex items-center gap-3 text-primary border-b border-border/20 pb-4">
                  <Languages className="h-5 w-5" />
                  <h3 className="font-bold">多语言名称与简介</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full" /> 中文内容 (ZH)
                    </Label>
                    <Input placeholder="产品名称 (中文)" value={formData.nameZh} onChange={e => setFormData({...formData, nameZh: e.target.value})} className="rounded-xl h-11" />
                    <Textarea placeholder="产品短简介 (中文)" value={formData.descZh} onChange={e => setFormData({...formData, descZh: e.target.value})} className="rounded-xl min-h-[120px]" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full" /> 英文内容 (EN)
                    </Label>
                    <Input placeholder="Product Name (English)" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="rounded-xl h-11" />
                    <Textarea placeholder="Short Description (English)" value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} className="rounded-xl min-h-[120px]" />
                  </div>
                </div>

                <div className="space-y-6 pt-8 border-t border-border/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                      <h3 className="font-bold">核心优势 (Core Advantages)</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={addAdv} className="text-primary font-bold text-[10px] uppercase gap-1">
                      <PlusCircle className="h-3 w-3" /> 添加条目
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.advantages.map((adv, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-4 bg-muted/20 rounded-2xl relative group">
                        <div className="md:col-span-5 space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-muted-foreground">优势 #{idx + 1} (ZH)</Label>
                          <Input 
                            placeholder="例如：工业级稳定性..." 
                            value={adv.zh} 
                            onChange={e => updateAdv(idx, 'zh', e.target.value)}
                            className="h-10 text-sm rounded-xl"
                          />
                        </div>
                        <div className="md:col-span-6 space-y-2">
                          <Label className="text-[9px] font-bold uppercase text-muted-foreground">优势 #{idx + 1} (EN)</Label>
                          <Input 
                            placeholder="e.g. Industrial-grade stability..." 
                            value={adv.en} 
                            onChange={e => updateAdv(idx, 'en', e.target.value)}
                            className="h-10 text-sm rounded-xl"
                          />
                        </div>
                        <div className="md:col-span-1 pt-6 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeAdv(idx)}
                            className="h-10 w-10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-border/20 pb-4">
                  <div className="flex items-center gap-3 text-primary">
                    <TableProperties className="h-5 w-5" />
                    <h3 className="font-bold">分层技术参数管理</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={addSpecGroup} className="text-primary font-bold text-[10px] uppercase gap-1">
                    <FolderPlus className="h-3 w-3" /> 添加参数分类
                  </Button>
                </div>

                <div className="space-y-12">
                  {formData.specGroups.map((group, gIdx) => (
                    <div key={gIdx} className="p-8 bg-muted/10 rounded-[3rem] border border-border/10 relative group/group">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeSpecGroup(gIdx)}
                        className="absolute top-4 right-4 h-8 w-8 text-destructive opacity-0 group-hover/group:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase text-primary">分类标题 (ZH)</Label>
                              <Input 
                                placeholder="例如: PC (X86) 参数" 
                                value={group.titleZh} 
                                onChange={e => updateGroupTitle(gIdx, 'titleZh', e.target.value)}
                                className="h-11 rounded-xl bg-white"
                              />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-bold uppercase text-primary">分类标题 (EN)</Label>
                              <Input 
                                placeholder="e.g. PC (X86) Parameters" 
                                value={group.titleEn} 
                                onChange={e => updateGroupTitle(gIdx, 'titleEn', e.target.value)}
                                className="h-11 rounded-xl bg-white"
                              />
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div className="flex items-center justify-between px-2">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">分类下属规格项</span>
                              <Button variant="ghost" size="sm" onClick={() => addSpecToGroup(gIdx)} className="h-7 text-primary text-[9px] font-bold uppercase gap-1">
                                <PlusCircle className="h-3 w-3" /> 添加规格项
                              </Button>
                           </div>

                           <div className="grid grid-cols-1 gap-6">
                              {group.items.map((item, iIdx) => (
                                <div key={iIdx} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start p-6 bg-white rounded-[2rem] relative group/item border border-border/10 shadow-sm">
                                   <div className="md:col-span-5 space-y-3">
                                      <div className="space-y-2">
                                        <Label className="text-[9px] font-bold uppercase text-primary/40 ml-1">规格参数名称</Label>
                                        <div className="space-y-2">
                                          <Input placeholder="中文名称 (如: 处理器)" value={item.labelZh} onChange={e => updateSpecItem(gIdx, iIdx, 'labelZh', e.target.value)} className="h-10 text-xs rounded-xl bg-muted/20 border-none" />
                                          <Input placeholder="English Name (e.g. CPU)" value={item.labelEn} onChange={e => updateSpecItem(gIdx, iIdx, 'labelEn', e.target.value)} className="h-10 text-xs rounded-xl bg-muted/5 border-none opacity-70" />
                                        </div>
                                      </div>
                                   </div>
                                   <div className="md:col-span-6 space-y-3">
                                      <div className="space-y-2">
                                        <Label className="text-[9px] font-bold uppercase text-primary/40 ml-1">具体规格数值</Label>
                                        <div className="space-y-2">
                                          <Input placeholder="中文数值 (如: 英特尔 i7)" value={item.valueZh} onChange={e => updateSpecItem(gIdx, iIdx, 'valueZh', e.target.value)} className="h-10 text-xs rounded-xl bg-muted/20 border-none" />
                                          <Input placeholder="English Value (e.g. Intel i7)" value={item.valueEn} onChange={e => updateSpecItem(gIdx, iIdx, 'valueEn', e.target.value)} className="h-10 text-xs rounded-xl bg-muted/5 border-none opacity-70" />
                                        </div>
                                      </div>
                                   </div>
                                   <div className="md:col-span-1 flex justify-end pt-8">
                                      <Button variant="ghost" size="icon" onClick={() => removeSpecFromGroup(gIdx, iIdx)} className="h-10 w-10 text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.specGroups.length === 0 && (
                    <div className="py-24 text-center border-2 border-dashed rounded-[3rem] text-muted-foreground flex flex-col items-center gap-4">
                      <FolderPlus className="h-10 w-10 opacity-20" />
                      <p className="italic">点击右上角“添加参数分类”开始录入硬件数据。</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm space-y-6">
                <div className="flex items-center gap-3 text-primary border-b border-border/20 pb-4">
                  <Info className="h-5 w-5" />
                  <h3 className="font-bold">产品详细介绍 (Rich Content)</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">中文详细内容 (ZH)</Label>
                    <Textarea placeholder="产品详细描述 (中文)..." value={formData.detailsZh} onChange={e => setFormData({...formData, detailsZh: e.target.value})} className="rounded-2xl min-h-[400px] bg-muted/10 border-transparent focus:bg-white transition-colors" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">英文详细内容 (EN)</Label>
                    <Textarea placeholder="Long Product Details (English)..." value={formData.detailsEn} onChange={e => setFormData({...formData, detailsEn: e.target.value})} className="rounded-2xl min-h-[400px] bg-muted/10 border-transparent focus:bg-white transition-colors" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-border/20 pb-4">
                  <div className="flex items-center gap-3 text-primary">
                    <ImageIcon className="h-5 w-5" />
                    <h3 className="font-bold">副图库管理</h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openPicker('gallery')} className="rounded-full gap-2 text-xs font-bold uppercase">
                    <Plus className="h-4 w-4" /> 批量从图库挑选
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.galleryUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-2 items-start bg-muted/10 p-3 rounded-2xl border border-border/20 group">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border bg-white shrink-0">
                        {url ? <Image src={url} alt={`Gallery ${idx}`} fill className="object-contain" /> : <ImageIcon className="h-4 w-4 m-auto opacity-20" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <Input 
                          placeholder="图片 URL..." 
                          value={url} 
                          onChange={e => updateGalleryItem(idx, e.target.value)}
                          className="h-8 text-[10px] rounded-lg border-transparent bg-white/50"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-muted-foreground uppercase font-mono">IMG #{idx + 1}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeGalleryItem(idx)} className="h-6 text-[10px] text-destructive hover:bg-destructive/10">
                            移除此图
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.galleryUrls.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground italic border-2 border-dashed rounded-[2rem]">
                      暂无副图，点击右上方按钮从图库中挑选素材。
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 素材选择器弹窗 */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-[2.5rem]">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              挑选图库素材
            </DialogTitle>
            <DialogDescription>
              {pickerTarget === 'main' 
                ? '请选择一张图库素材作为产品主图。' 
                : '支持批量选择，选中的素材将按顺序添加到产品副图库中。'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="px-8 pb-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="搜索素材标题..." 
                className="pl-10 rounded-xl h-10 bg-muted/40 border-none"
                value={pickerSearch}
                onChange={e => setPickerSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={pickerCat} onValueChange={setPickerCat}>
                <SelectTrigger className="w-48 rounded-xl h-10">
                  <SelectValue placeholder="全部分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {galleryCategoryTree.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
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

          <div className="flex-1 overflow-y-auto p-8 pt-0 min-h-[300px]">
            {filteredAssets.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredAssets.map((asset) => (
                  <div 
                    key={asset.id}
                    className={cn(
                      "group relative aspect-square rounded-2xl border transition-all bg-white cursor-pointer overflow-hidden",
                      selectedPickerUrls.has(asset.url) 
                        ? "border-primary ring-2 ring-primary/20 shadow-lg" 
                        : "border-border/40 hover:shadow-xl hover:border-primary"
                    )}
                    onClick={() => togglePickerSelection(asset.url)}
                  >
                    <Image src={asset.url} alt={asset.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    
                    {/* 选中状态指示器 */}
                    {selectedPickerUrls.has(asset.url) && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-white rounded-full p-1.5 shadow-xl scale-110 animate-in zoom-in duration-200">
                          <Check className="h-5 w-5 stroke-[3]" />
                        </div>
                      </div>
                    )}
                    
                    {/* 悬浮标题 */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-[9px] text-white font-bold truncate">{asset.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20 border-2 border-dashed rounded-3xl">
                <ImageIcon className="h-10 w-10 opacity-20 mb-4" />
                <p className="text-sm font-bold">未找到匹配素材</p>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-muted/30 flex items-center justify-between gap-4">
            <div className="text-xs font-bold text-primary uppercase tracking-widest">
              {selectedPickerUrls.size > 0 ? `已选中 ${selectedPickerUrls.size} 项` : '未选中任何素材'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPickerOpen(false)} className="rounded-xl h-10 px-6">取消</Button>
              <Button 
                onClick={handleConfirmPicker} 
                disabled={selectedPickerUrls.size === 0}
                className="rounded-xl h-10 px-8 font-bold uppercase tracking-widest gap-2"
              >
                <CheckCircle2 className="h-4 w-4" /> 确认选择
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductEditorPage() {
  return (
    <Suspense fallback={<div className="h-[80vh] flex items-center justify-center">Loading Editor...</div>}>
      <ProductEditorContent />
    </Suspense>
  );
}
