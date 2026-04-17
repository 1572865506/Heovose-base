
"use client";

import { useState, useMemo, useCallback, useRef } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  Check, 
  Filter,
  Loader2,
  Upload,
  X,
  Settings2,
  Edit3,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface GalleryCategory {
  id: string;
  name: string;
}

interface GalleryAsset {
  id: string;
  url: string;
  title: string;
  categoryId: string;
  fileName: string;
  fileSize?: number;
  createdAt?: any;
}

export default function GalleryPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingAsset, setEditingAsset] = useState<GalleryAsset | null>(null);

  // Firestore Data
  const categoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'galleryCategories'), orderBy('order', 'asc'));
  }, [firestore]);

  const assetsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'galleryAssets'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: categories } = useCollection<GalleryCategory>(categoriesQuery);
  const { data: assets, isLoading } = useCollection<GalleryAsset>(assetsQuery);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || a.categoryId === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [assets, searchQuery, filterCategory]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !firestore) return;
    if (!categories || categories.length === 0) {
      toast({ variant: "destructive", title: "错误", description: "请先设置图片分类。" });
      return;
    }

    setIsUploading(true);
    const defaultCategoryId = categories[0].id;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      // 限制文件大小以适应 Firestore (1MB limit for Base64)
      if (file.size > 800000) {
        toast({ 
          variant: "destructive", 
          title: "文件过大", 
          description: `${file.name} 超过 800KB，建议使用外部存储或压缩。` 
        });
        continue;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const id = `asset_${Date.now()}_${i}`;
        const assetRef = doc(firestore, 'galleryAssets', id);

        setDocumentNonBlocking(assetRef, {
          id,
          url: base64,
          title: file.name,
          fileName: file.name,
          fileSize: file.size,
          categoryId: defaultCategoryId,
          createdAt: serverTimestamp()
        }, { merge: true });
      };
      reader.readAsDataURL(file);
    }
    
    setIsUploading(false);
    toast({ title: "上传成功", description: "图片已开始在后台同步。" });
  };

  const handleUpdateAsset = () => {
    if (!firestore || !editingAsset) return;
    const assetRef = doc(firestore, 'galleryAssets', editingAsset.id);
    setDocumentNonBlocking(assetRef, editingAsset, { merge: true });
    setEditingAsset(null);
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('确定要移除此图片吗？')) return;
    deleteDocumentNonBlocking(doc(firestore, 'galleryAssets', id));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            全球图库中心
          </h2>
          <p className="text-sm text-muted-foreground">支持批量上传、拖拽管理以及自定义分类。</p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/gallery/categories">
            <Button variant="outline" className="rounded-xl h-12 gap-2">
              <Settings2 className="h-4 w-4" /> 分类设置
            </Button>
          </Link>
          <Button 
            className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="h-4 w-4" /> 批量上传
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Upload Dropzone */}
      <div 
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="group relative h-32 border-2 border-dashed border-muted-foreground/20 rounded-3xl flex flex-col items-center justify-center bg-white hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-primary">拖拽图片到此处上传</p>
            <p className="text-[10px] text-muted-foreground">支持批量选择，单张图片限制 800KB 以内</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="按文件名或标题搜索..." 
            className="pl-10 border-none bg-muted/30 focus-visible:ring-0 rounded-xl"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden md:block" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-48 rounded-xl">
              <SelectValue placeholder="全部分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories?.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground italic flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin opacity-20" />
          <span className="text-xs uppercase tracking-widest font-bold">正在同步云端图库...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              className="group relative bg-white rounded-2xl border border-border/40 overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative aspect-square bg-muted/10">
                <Image src={asset.url} alt={asset.title} fill className="object-cover" />
                <div className="absolute top-2 left-2">
                  <Badge className="text-[8px] px-2 h-5 bg-black/60 backdrop-blur-md border-none uppercase">
                    {categories?.find(c => c.id === asset.categoryId)?.name || '未分类'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] font-bold truncate text-primary flex-1" title={asset.title}>
                    {asset.title}
                  </p>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditingAsset(asset)}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between border-t border-border/10 pt-2">
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(asset.url);
                        toast({ title: "链接已复制" });
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(asset.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filteredAssets.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground italic border-2 border-dashed rounded-[2rem] opacity-30">
              这里空空如也，尝试上传一些图片吧。
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingAsset} onOpenChange={(o) => !o && setEditingAsset(null)}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle>编辑素材信息</DialogTitle>
          </DialogHeader>
          {editingAsset && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase">素材标题 / 文件名</Label>
                <Input 
                  value={editingAsset.title} 
                  onChange={e => setEditingAsset({...editingAsset, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase">移动至分类</Label>
                <Select 
                  value={editingAsset.categoryId} 
                  onValueChange={v => setEditingAsset({...editingAsset, categoryId: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-muted/20 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
                  <FileText className="h-3 w-3" /> 素材详情
                </div>
                <p className="text-[10px] text-muted-foreground">
                  原始名称: {editingAsset.fileName}<br />
                  文件大小: {(editingAsset.fileSize || 0 / 1024).toFixed(1)} KB<br />
                  ID: {editingAsset.id}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAsset(null)}>取消</Button>
            <Button onClick={handleUpdateAsset}>确认修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
