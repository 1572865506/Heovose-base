
"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
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
  Info
} from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  nameTextId: string;
  descriptionTextId: string;
  specsTextId?: string;
  detailsTextId?: string;
  mainImageUrl: string;
  productCategoryId: string;
  galleryImageUrls: string[];
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

function ProductEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { toast } = useToast();
  
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
    specsEn: '',
    specsZh: '',
    detailsEn: '',
    detailsZh: ''
  });

  const [activeTab, setActiveTab] = useState('basic');

  const prodRef = useMemoFirebase(() => productId ? doc(firestore, 'products', productId) : null, [firestore, productId]);
  const catsQuery = useMemoFirebase(() => collection(firestore, 'productCategories'), [firestore]);
  const transQuery = useMemoFirebase(() => collection(firestore, 'localizedStrings'), [firestore]);

  const { data: product, isLoading: isProdLoading } = useDoc<Product>(prodRef);
  const { data: categories } = useCollection<ProductCategory>(catsQuery);
  const { data: translations } = useCollection<LocalizedString>(transQuery);

  useEffect(() => {
    if (isEditing && product && translations) {
      const getT = (id?: string) => translations.find(t => t.id === id) || { en: '', zh: '' };
      
      const nameT = getT(product.nameTextId);
      const descT = getT(product.descriptionTextId);
      const specsT = getT(product.specsTextId);
      const detailsT = getT(product.detailsTextId);

      setFormData({
        id: product.id,
        categoryId: product.productCategoryId,
        mainImageUrl: product.mainImageUrl,
        galleryUrls: product.galleryImageUrls || [],
        nameEn: nameT.en || '',
        nameZh: nameT.zh || '',
        descEn: descT.en || '',
        descZh: descT.zh || '',
        specsEn: specsT.en || '',
        specsZh: specsT.zh || '',
        detailsEn: detailsT.en || '',
        detailsZh: detailsT.zh || ''
      });
    }
  }, [isEditing, product, translations]);

  const handleSave = () => {
    if (!firestore || !formData.id || !formData.categoryId) {
      toast({ variant: "destructive", title: "保存失败", description: "请确保 ID 和分类已填写。" });
      return;
    }
    
    const nameId = isEditing ? product?.nameTextId : `prod_name_${formData.id}`;
    const descId = isEditing ? product?.descriptionTextId : `prod_desc_${formData.id}`;
    const specsId = isEditing && product?.specsTextId ? product.specsTextId : `prod_specs_${formData.id}`;
    const detailsId = isEditing && product?.detailsTextId ? product.detailsTextId : `prod_details_${formData.id}`;

    const saveLang = (id: string, en: string, zh: string) => {
      setDocumentNonBlocking(doc(firestore, 'localizedStrings', id), {
        id, en, zh, updatedAt: serverTimestamp()
      }, { merge: true });
    };

    saveLang(nameId!, formData.nameEn, formData.nameZh);
    saveLang(descId!, formData.descEn, formData.descZh);
    saveLang(specsId, formData.specsEn, formData.specsZh);
    saveLang(detailsId, formData.detailsEn, formData.detailsZh);

    setDocumentNonBlocking(doc(firestore, 'products', formData.id), {
      id: formData.id,
      nameTextId: nameId,
      descriptionTextId: descId,
      specsTextId: specsId,
      detailsTextId: detailsId,
      mainImageUrl: formData.mainImageUrl,
      productCategoryId: formData.categoryId,
      galleryImageUrls: formData.galleryUrls.filter(Boolean),
      updatedAt: serverTimestamp()
    }, { merge: true });

    toast({ title: "产品已保存", description: "内容已同步至云端。" });
    router.push('/admin/products');
  };

  const addGalleryItem = () => setFormData({ ...formData, galleryUrls: [...formData.galleryUrls, ''] });
  const updateGalleryItem = (idx: number, val: string) => {
    const newUrls = [...formData.galleryUrls];
    newUrls[idx] = val;
    setFormData({ ...formData, galleryUrls: newUrls });
  };
  const removeGalleryItem = (idx: number) => {
    setFormData({ ...formData, galleryUrls: formData.galleryUrls.filter((_, i) => i !== idx) });
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between sticky top-20 z-40 bg-background/80 backdrop-blur-md py-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
              {isEditing ? '编辑产品详情' : '发布全新产品'}
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              ID: {formData.id || 'NEW'} | 分类: {getCatName(formData.categoryId) || '未设定'}
            </p>
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
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">产品唯一 ID</Label>
              <Input 
                disabled={isEditing} 
                placeholder="例如: H-101" 
                value={formData.id} 
                onChange={e => setFormData({...formData, id: e.target.value})}
                className="h-12 rounded-xl bg-muted/20 border-transparent focus-visible:ring-primary"
              />
              <p className="text-[9px] text-muted-foreground italic px-2">发布后 ID 将锁定不可修改。</p>
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

            <div className="space-y-2 pt-4 border-t border-border/40">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">产品主图 (Main Image)</Label>
              <div className="relative aspect-square rounded-2xl bg-muted/30 border border-dashed border-border overflow-hidden flex items-center justify-center group">
                {formData.mainImageUrl ? (
                  <Image src={formData.mainImageUrl} alt="Main" fill className="object-contain p-4" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground opacity-20" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <Input 
                    placeholder="输入主图 URL..." 
                    value={formData.mainImageUrl} 
                    onChange={e => setFormData({...formData, mainImageUrl: e.target.value})}
                    className="bg-white text-xs h-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 border-b border-border/40 w-full justify-start gap-8 rounded-none mb-8">
              <TabsTrigger value="basic" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                <LayoutGrid className="h-3 w-3 mr-2" /> 基础信息
              </TabsTrigger>
              <TabsTrigger value="content" className="rounded-none px-0 pb-4 text-xs font-bold uppercase tracking-widest data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all">
                <ClipboardList className="h-3 w-3 mr-2" /> 规格与详情
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
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm space-y-10">
                <section className="space-y-6">
                  <div className="flex items-center gap-3 text-primary border-b border-border/20 pb-4">
                    <ClipboardList className="h-5 w-5" />
                    <h3 className="font-bold">技术规格 (Specifications)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <Textarea placeholder="技术参数详情 (中文)..." value={formData.specsZh} onChange={e => setFormData({...formData, specsZh: e.target.value})} className="rounded-xl min-h-[200px]" />
                    <Textarea placeholder="Technical Specs Details (English)..." value={formData.specsEn} onChange={e => setFormData({...formData, specsEn: e.target.value})} className="rounded-xl min-h-[200px]" />
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3 text-primary border-b border-border/20 pb-4">
                    <Info className="h-5 w-5" />
                    <h3 className="font-bold">详细介绍 (Details)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <Textarea placeholder="产品详细描述 (中文)..." value={formData.detailsZh} onChange={e => setFormData({...formData, detailsZh: e.target.value})} className="rounded-xl min-h-[250px]" />
                    <Textarea placeholder="Long Product Details (English)..." value={formData.detailsEn} onChange={e => setFormData({...formData, detailsEn: e.target.value})} className="rounded-xl min-h-[250px]" />
                  </div>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-border/20 pb-4">
                  <div className="flex items-center gap-3 text-primary">
                    <ImageIcon className="h-5 w-5" />
                    <h3 className="font-bold">副图库管理</h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={addGalleryItem} className="rounded-full gap-2">
                    <Plus className="h-4 w-4" /> 添加图片
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
                        <Button variant="ghost" size="sm" onClick={() => removeGalleryItem(idx)} className="h-6 text-[10px] text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                          移除此图
                        </Button>
                      </div>
                    </div>
                  ))}
                  {formData.galleryUrls.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground italic border-2 border-dashed rounded-[2rem]">
                      暂无副图，点击右上方按钮添加。
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
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
