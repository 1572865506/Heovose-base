
"use client";

import { useState, useMemo, useRef } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  Filter,
  Loader2,
  Upload,
  Settings2,
  Edit3,
  Layers,
  MoveUp,
  MoveDown,
  ChevronRight
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface GalleryCategory {
  id: string;
  name: string;
  parentId?: string;
  order: number;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingAsset, setEditingAsset] = useState<GalleryAsset | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParentId, setNewCatParentId] = useState<string>('none');

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

  // 层级处理逻辑
  const categoryTree = useMemo(() => {
    if (!categories) return [];
    
    const getFullPath = (cat: GalleryCategory): string => {
      if (!cat.parentId || cat.parentId === 'none') return cat.name;
      const parent = categories.find(c => c.id === cat.parentId);
      return parent ? `${getFullPath(parent)} > ${cat.name}` : cat.name;
    };

    return categories.map(cat => ({
      ...cat,
      fullPath: getFullPath(cat)
    })).sort((a, b) => a.fullPath.localeCompare(b.fullPath));
  }, [categories]);

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
      toast({ variant: "destructive", title: "错误", description: "请先通过“分类设置”添加分类。" });
      return;
    }

    setIsUploading(true);
    const defaultCategoryId = categoryTree[0]?.id;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      if (file.size > 800000) {
        toast({ 
          variant: "destructive", 
          title: "文件过大", 
          description: `${file.name} 超过 800KB，建议压缩后上传。` 
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
          title: file.name.split('.')[0],
          fileName: file.name,
          fileSize: file.size,
          categoryId: defaultCategoryId,
          createdAt: serverTimestamp()
        }, { merge: true });
      };
      reader.readAsDataURL(file);
    }
    
    setIsUploading(false);
    toast({ title: "上传已启动", description: "图片正在后台同步。" });
  };

  const handleUpdateAsset = () => {
    if (!firestore || !editingAsset) return;
    const assetRef = doc(firestore, 'galleryAssets', editingAsset.id);
    setDocumentNonBlocking(assetRef, editingAsset, { merge: true });
    setEditingAsset(null);
  };

  const handleDeleteAsset = (id: string) => {
    if (!firestore || !confirm('确定要移除此图片吗？')) return;
    deleteDocumentNonBlocking(doc(firestore, 'galleryAssets', id));
  };

  const handleAddCategory = () => {
    if (!firestore || !newCatName.trim()) return;
    const id = `cat_${Date.now()}`;
    const order = (categories?.length || 0) + 1;
    setDocumentNonBlocking(doc(firestore, 'galleryCategories', id), { 
      id, 
      name: newCatName, 
      parentId: newCatParentId === 'none' ? null : newCatParentId,
      order 
    }, { merge: true });
    setNewCatName('');
    setNewCatParentId('none');
  };

  const handleDeleteCategory = (id: string) => {
    if (!firestore || !confirm('删除分类将使相关图片变为“未分类”。确定吗？')) return;
    deleteDocumentNonBlocking(doc(firestore, 'galleryCategories', id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            全球图库中心
          </h2>
          <p className="text-sm text-muted-foreground">批量管理图片资产，支持多级分类与拖拽上传。</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl h-12 gap-2">
                <Settings2 className="h-4 w-4" /> 分类设置
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-2xl overflow-hidden p-0">
              <div className="p-8 space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Layers className="h-5 w-5" /> 多级分类设置
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-border/40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">新增分类</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold">分类名称</Label>
                      <Input 
                        placeholder="如: 展会实拍" 
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold">所属上级</Label>
                      <Select value={newCatParentId} onValueChange={setNewCatParentId}>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">无 (作为一级分类)</SelectItem>
                          {categoryTree.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.fullPath}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAddCategory} className="w-full rounded-xl h-12">
                    <Plus className="h-4 w-4 mr-2" /> 添加分类
                  </Button>
                </div>

                <div className="max-h-[40vh] overflow-y-auto rounded-2xl border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="pl-4">层级路径</TableHead>
                        <TableHead className="w-24 text-right pr-4">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryTree.map((cat) => (
                        <TableRow key={cat.id}>
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-2">
                              {cat.parentId && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                              <span className={cn(cat.parentId ? "text-sm" : "font-bold text-primary")}>
                                {cat.fullPath}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="pr-4 text-right">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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

      <div 
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFileUpload(e.dataTransfer.files); }}
        className="group relative h-28 border-2 border-dashed border-muted-foreground/20 rounded-3xl flex flex-col items-center justify-center bg-white hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Upload className="h-5 w-5" /></div>
          <div>
            <p className="text-sm font-bold text-primary">拖拽图片到此处上传</p>
            <p className="text-[10px] text-muted-foreground">单张图片限制 800KB 以内</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="按标题搜索素材..." 
            className="pl-10 border-none bg-muted/30 focus-visible:ring-0 rounded-xl"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-64 rounded-xl">
              <SelectValue placeholder="全部分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categoryTree.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.fullPath}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin opacity-20 text-primary" />
          <span className="text-xs uppercase tracking-widest font-bold">同步中...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="group relative bg-white rounded-2xl border border-border/40 overflow-hidden hover:shadow-xl transition-all">
              <div className="relative aspect-square bg-muted/10">
                <Image src={asset.url} alt={asset.title} fill className="object-cover" />
                <div className="absolute top-2 left-2">
                  <Badge className="text-[7px] bg-black/70 border-none uppercase max-w-[100px] truncate">
                    {categoryTree.find(c => c.id === asset.categoryId)?.fullPath || '未分类'}
                  </Badge>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <p className="text-[11px] font-bold truncate text-primary">{asset.title}</p>
                <div className="flex items-center justify-between border-t pt-2">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(asset.url); toast({ title: "链接已复制" }); }}><Copy className="h-3 w-3" /></Button>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingAsset(asset)}><Edit3 className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteAsset(asset.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredAssets.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground italic border-2 border-dashed rounded-[2rem] opacity-30">暂无图片素材</div>
          )}
        </div>
      )}

      {/* Asset Edit Dialog */}
      <Dialog open={!!editingAsset} onOpenChange={(o) => !o && setEditingAsset(null)}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader><DialogTitle>编辑素材信息</DialogTitle></DialogHeader>
          {editingAsset && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase">素材标题</Label>
                <Input value={editingAsset.title} onChange={e => setEditingAsset({...editingAsset, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase">调整分类</Label>
                <Select value={editingAsset.categoryId} onValueChange={v => setEditingAsset({...editingAsset, categoryId: v})}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTree.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.fullPath}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-muted/20 rounded-xl space-y-1">
                <p className="text-[10px] text-muted-foreground">文件名: {editingAsset.fileName}</p>
                <p className="text-[10px] text-muted-foreground">大小: {(editingAsset.fileSize ? editingAsset.fileSize / 1024 : 0).toFixed(1)} KB</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAsset(null)} className="rounded-xl h-12">取消</Button>
            <Button onClick={handleUpdateAsset} className="rounded-xl h-12">确认修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
