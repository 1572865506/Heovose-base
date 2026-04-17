
"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
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
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle2,
  AlertCircle,
  PanelTop,
  Minimize2,
  Maximize2,
  Maximize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
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
import { Progress } from '@/components/ui/progress';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  fileName: string;
  fileSize?: number;
  createdAt?: any;
}

interface UploadTask {
  id: string;
  fileName: string;
  progress: number;
  status: 'reading' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function GalleryPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingAsset, setEditingAsset] = useState<GalleryAsset | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ name: '', parentId: 'none' });

  // 预览状态
  const [previewImage, setPreviewImage] = useState<GalleryAsset | null>(null);

  // 上传任务管理
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [isTasksPanelOpen, setIsTasksPanelOpen] = useState(false);
  const [isTasksPanelMinimized, setIsTasksPanelMinimized] = useState(false);

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

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

  const categoryTree = useMemo(() => {
    if (!categories) return [];
    const getFullPath = (cat: GalleryCategory): string => {
      const parent = categories.find(c => c.id === cat.parentId);
      return parent ? `${getFullPath(parent)} > ${cat.name}` : cat.name;
    };
    const getDepth = (cat: GalleryCategory): number => {
      const parent = categories.find(c => c.id === cat.parentId);
      return parent ? getDepth(parent) + 1 : 0;
    };
    const hasChildren = (id: string): boolean => {
      return categories.some(c => c.parentId === id);
    };
    const tree: (GalleryCategory & { fullPath: string, depth: number, hasChildren: boolean })[] = [];
    const build = (parentId: string | null = null) => {
      const levelItems = categories
        .filter(c => (c.parentId || null) === parentId)
        .sort((a, b) => a.order - b.order);
      levelItems.forEach(item => {
        tree.push({
          ...item,
          fullPath: getFullPath(item),
          depth: getDepth(item),
          hasChildren: hasChildren(item.id)
        });
        build(item.id);
      });
    };
    build(null);
    return tree;
  }, [categories]);

  const visibleCategories = useMemo(() => {
    return categoryTree.filter(cat => {
      let currentParentId = cat.parentId;
      while (currentParentId) {
        if (collapsedIds.has(currentParentId)) return false;
        const parent = categories?.find(c => c.id === currentParentId);
        currentParentId = parent?.parentId || null;
      }
      return true;
    });
  }, [categoryTree, collapsedIds, categories]);

  const toggleCollapse = (id: string) => {
    const newCollapsed = new Set(collapsedIds);
    if (newCollapsed.has(id)) {
      newCollapsed.delete(id);
    } else {
      newCollapsed.add(id);
    }
    setCollapsedIds(newCollapsed);
  };

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
      toast({ variant: "destructive", title: "操作受阻", description: "请先通过“分类设置”添加至少一个分类。" });
      return;
    }

    const defaultCategoryId = categoryTree[0]?.id;
    setIsTasksPanelOpen(true);
    setIsTasksPanelMinimized(false);

    const newTasks: UploadTask[] = Array.from(files).map((file, i) => ({
      id: `task_${Date.now()}_${i}`,
      fileName: file.name,
      progress: 0,
      status: 'reading'
    }));

    setUploadTasks(prev => [...prev, ...newTasks]);

    Array.from(files).forEach((file, index) => {
      const taskId = newTasks[index].id;
      
      if (!file.type.startsWith('image/')) {
        updateTask(taskId, { status: 'error', error: '文件类型不符', progress: 0 });
        return;
      }
      
      if (file.size > 800000) {
        updateTask(taskId, { status: 'error', error: '超过 800KB', progress: 0 });
        return;
      }

      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const p = Math.round((e.loaded / e.total) * 50);
          updateTask(taskId, { progress: p });
        }
      };

      reader.onload = (e) => {
        updateTask(taskId, { status: 'uploading', progress: 60 });
        const base64 = e.target?.result as string;
        const assetId = `asset_${Date.now()}_${index}`;
        const assetRef = doc(firestore, 'galleryAssets', assetId);

        setDocumentNonBlocking(assetRef, {
          id: assetId,
          url: base64,
          title: file.name.split('.')[0],
          fileName: file.name,
          fileSize: file.size,
          categoryId: defaultCategoryId,
          createdAt: serverTimestamp()
        }, { merge: true });

        // 模拟同步进度
        setTimeout(() => updateTask(taskId, { progress: 85 }), 300);
        setTimeout(() => updateTask(taskId, { status: 'completed', progress: 100 }), 800);
      };

      reader.onerror = () => {
        updateTask(taskId, { status: 'error', error: '读取失败', progress: 0 });
      };

      reader.readAsDataURL(file);
    });
  };

  const updateTask = (id: string, updates: Partial<UploadTask>) => {
    setUploadTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const clearCompletedTasks = () => {
    setUploadTasks(prev => prev.filter(t => t.status !== 'completed' && t.status !== 'error'));
    if (uploadTasks.filter(t => t.status !== 'completed' && t.status !== 'error').length === 0) {
      setIsTasksPanelOpen(false);
    }
  };

  const handleUpdateAsset = () => {
    if (!firestore || !editingAsset) return;
    updateDocumentNonBlocking(doc(firestore, 'galleryAssets', editingAsset.id), editingAsset);
    setEditingAsset(null);
    toast({ title: "修改已保存" });
  };

  const handleDeleteAsset = (id: string) => {
    if (!firestore || !confirm('确定要永久移除此图片吗？')) return;
    deleteDocumentNonBlocking(doc(firestore, 'galleryAssets', id));
  };

  const handleSaveCategory = () => {
    if (!firestore || !catForm.name.trim()) return;
    const parentId = catForm.parentId === 'none' ? null : catForm.parentId;
    if (editingCatId) {
      if (catForm.parentId === editingCatId) {
        toast({ variant: "destructive", title: "无效操作", description: "不能将分类的上级设为自己。" });
        return;
      }
      const catRef = doc(firestore, 'galleryCategories', editingCatId);
      updateDocumentNonBlocking(catRef, { name: catForm.name, parentId: parentId });
      toast({ title: "分类已更新" });
    } else {
      const id = `cat_${Date.now()}`;
      const siblings = categories?.filter(c => (c.parentId || null) === parentId) || [];
      const order = siblings.length + 1;
      setDocumentNonBlocking(doc(firestore, 'galleryCategories', id), { 
        id, name: catForm.name, parentId: parentId, order 
      }, { merge: true });
      toast({ title: "分类已添加" });
    }
    resetCatForm();
  };

  const resetCatForm = () => {
    setEditingCatId(null);
    setCatForm({ name: '', parentId: 'none' });
  };

  const startEditCategory = (cat: GalleryCategory) => {
    setEditingCatId(cat.id);
    setCatForm({ name: cat.name, parentId: cat.parentId || 'none' });
  };

  const handleDeleteCategory = (id: string) => {
    if (!firestore || !confirm('确定要删除此分类吗？关联的素材将变为“未分类”。')) return;
    deleteDocumentNonBlocking(doc(firestore, 'galleryCategories', id));
    if (editingCatId === id) resetCatForm();
  };

  const handleMoveCategory = (id: string, direction: 'up' | 'down') => {
    if (!firestore || !categories) return;
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const siblings = categories
      .filter(c => (c.parentId || null) === (cat.parentId || null))
      .sort((a, b) => a.order - b.order);
    const index = siblings.findIndex(s => s.id === id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    const target = siblings[targetIndex];
    updateDocumentNonBlocking(doc(firestore, 'galleryCategories', cat.id), { order: target.order });
    updateDocumentNonBlocking(doc(firestore, 'galleryCategories', target.id), { order: cat.order });
  };

  const isFirstInLevel = (id: string, parentId?: string | null) => {
    if (!categories) return true;
    const siblings = categories.filter(c => (c.parentId || null) === (parentId || null));
    return siblings.sort((a, b) => a.order - b.order)[0]?.id === id;
  };

  const isLastInLevel = (id: string, parentId?: string | null) => {
    if (!categories) return true;
    const siblings = categories.filter(c => (c.parentId || null) === (parentId || null));
    const sorted = siblings.sort((a, b) => a.order - b.order);
    return sorted[sorted.length - 1]?.id === id;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-[80vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            全球图库中心
          </h2>
          <p className="text-sm text-muted-foreground">支持多级分类管理与本地素材批量上传。</p>
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
                  <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Layers className="h-5 w-5" /> 分类与层级设置
                  </DialogTitle>
                </DialogHeader>
                
                <div className={cn(
                  "space-y-4 p-6 rounded-2xl border transition-colors",
                  editingCatId ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/40"
                )}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      {editingCatId ? '编辑分类属性' : '创建新层级分类'}
                    </p>
                    {editingCatId && (
                      <Button variant="ghost" size="sm" onClick={resetCatForm} className="h-6 text-[10px] uppercase font-bold text-muted-foreground">
                        <X className="h-3 w-3 mr-1" /> 取消
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold">分类名称</Label>
                      <Input 
                        placeholder="输入名称..." 
                        value={catForm.name}
                        onChange={e => setCatForm({...catForm, name: e.target.value})}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold">所属父级</Label>
                      <Select value={catForm.parentId} onValueChange={v => setCatForm({...catForm, parentId: v})}>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">无 (设为一级分类)</SelectItem>
                          {categoryTree.filter(c => c.id !== editingCatId).map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <span 
                                style={{ paddingLeft: `${cat.depth * 1}rem` }} 
                                className={cn("flex items-center", cat.depth > 0 && "text-muted-foreground")}
                              >
                                {cat.depth > 0 && <span className="mr-2 opacity-30">·</span>}
                                {cat.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleSaveCategory} className="w-full rounded-xl h-12 font-bold uppercase tracking-widest">
                    {editingCatId ? '保存层级变更' : '确认添加'}
                  </Button>
                </div>

                <div className="max-h-[40vh] overflow-y-auto rounded-2xl border bg-white">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="pl-4">分类层级结构</TableHead>
                        <TableHead className="w-48 text-right pr-4">管理操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleCategories.map((cat) => (
                        <TableRow key={cat.id} className={cn(
                          "hover:bg-muted/10 transition-colors group",
                          editingCatId === cat.id ? "bg-primary/5" : ""
                        )}>
                          <TableCell className="pl-4">
                            <div 
                              className="flex items-center gap-2"
                              style={{ paddingLeft: `${cat.depth * 1.5}rem` }}
                            >
                              <div className="flex items-center gap-1">
                                {cat.hasChildren ? (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 p-0 hover:bg-transparent"
                                    onClick={() => toggleCollapse(cat.id)}
                                  >
                                    {collapsedIds.has(cat.id) ? (
                                      <ChevronRight className="h-3 w-3 text-primary" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3 text-primary" />
                                    )}
                                  </Button>
                                ) : (
                                  <div className="w-5 h-5" />
                                )}
                                <span className={cn(
                                  "text-sm", 
                                  !cat.parentId ? "font-bold text-primary" : "text-muted-foreground"
                                )}>
                                  {cat.name}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="pr-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7" 
                                disabled={isFirstInLevel(cat.id, cat.parentId)}
                                onClick={() => handleMoveCategory(cat.id, 'up')}
                                title="同级上移"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7" 
                                disabled={isLastInLevel(cat.id, cat.parentId)}
                                onClick={() => handleMoveCategory(cat.id, 'down')}
                                title="同级下移"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              <div className="w-px h-4 bg-border mx-1" />
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className={cn("h-7 w-7", editingCatId === cat.id ? "text-primary" : "")}
                                onClick={() => startEditCategory(cat)}
                                title="编辑属性"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 text-destructive" 
                                onClick={() => handleDeleteCategory(cat.id)}
                                title="删除分类"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
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
        className="group relative h-32 border-2 border-dashed border-primary/20 rounded-[2rem] flex flex-col items-center justify-center bg-white hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-bold text-primary">点击或拖拽上传本地图片</p>
            <p className="text-xs text-muted-foreground">支持多文件批量上传，自动提取文件名为标题</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="按标题搜索素材..." 
            className="pl-10 border-none bg-muted/40 focus-visible:ring-0 rounded-xl"
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
                <SelectItem key={cat.id} value={cat.id}>
                  <span 
                    style={{ paddingLeft: `${cat.depth * 1}rem` }} 
                    className={cn("flex items-center", cat.depth > 0 && "text-muted-foreground")}
                  >
                    {cat.depth > 0 && <span className="mr-2 opacity-30">·</span>}
                    {cat.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20 mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-primary/50">同步素材库中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="group relative bg-white rounded-2xl border border-border/40 overflow-hidden hover:shadow-2xl transition-all">
              <div 
                className="relative aspect-square bg-muted/10 cursor-zoom-in overflow-hidden"
                onClick={() => setPreviewImage(asset)}
              >
                <Image src={asset.url} alt={asset.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2">
                  <Badge className="text-[7px] bg-black/70 border-none uppercase px-2 py-0.5 rounded-sm max-w-[120px] truncate">
                    {categoryTree.find(c => c.id === asset.categoryId)?.fullPath || '未分类'}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize className="text-white h-6 w-6" />
                </div>
              </div>
              <div className="p-3 space-y-2">
                <p className="text-[11px] font-bold truncate text-primary">{asset.title}</p>
                <div className="flex items-center justify-between border-t pt-2">
                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-primary" onClick={() => { navigator.clipboard.writeText(asset.url); toast({ title: "素材链接已复制" }); }}><Copy className="h-3 w-3" /></Button>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingAsset(asset)}><Edit3 className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAsset(asset.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传任务管理面板 */}
      {isTasksPanelOpen && (
        <div className={cn(
          "fixed bottom-6 right-6 z-[200] w-80 bg-white border border-border/40 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 transform",
          isTasksPanelMinimized ? "h-14" : "h-96"
        )}>
          <div className="bg-primary p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <PanelTop className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">上传任务管理器</span>
              <Badge variant="outline" className="text-[10px] bg-white/10 border-white/20 text-white ml-2">
                {uploadTasks.filter(t => t.status === 'completed').length} / {uploadTasks.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 hover:bg-white/10"
                onClick={() => setIsTasksPanelMinimized(!isTasksPanelMinimized)}
              >
                {isTasksPanelMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 hover:bg-white/10"
                onClick={() => { setIsTasksPanelOpen(false); setUploadTasks([]); }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isTasksPanelMinimized && (
            <div className="flex flex-col h-[calc(100%-56px)]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {uploadTasks.map(task => (
                  <div key={task.id} className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-medium">
                      <span className="truncate max-w-[180px] text-primary font-bold">{task.fileName}</span>
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : task.status === 'error' ? (
                        <span className="text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {task.error}</span>
                      ) : (
                        <span className="text-muted-foreground animate-pulse">
                          {task.status === 'reading' ? '读取中...' : '同步中...'}
                        </span>
                      )}
                    </div>
                    <Progress value={task.progress} className="h-1" />
                  </div>
                ))}
              </div>
              <div className="p-4 border-t bg-muted/20 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-[10px] font-bold h-8 rounded-xl"
                  onClick={clearCompletedTasks}
                  disabled={uploadTasks.every(t => t.status !== 'completed' && t.status !== 'error')}
                >
                  清理已完成
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 资产编辑弹窗 */}
      <Dialog open={!!editingAsset} onOpenChange={(o) => !o && setEditingAsset(null)}>
        <DialogContent className="rounded-3xl max-w-sm p-8">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">编辑素材信息</DialogTitle>
          </DialogHeader>
          {editingAsset && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">素材标题</Label>
                <Input value={editingAsset.title} onChange={e => setEditingAsset({...editingAsset, title: e.target.value})} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">所属分类</Label>
                <Select value={editingAsset.categoryId} onValueChange={v => setEditingAsset({...editingAsset, categoryId: v})}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTree.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span 
                          style={{ paddingLeft: `${cat.depth * 1}rem` }} 
                          className={cn("flex items-center", cat.depth > 0 && "text-muted-foreground")}
                        >
                          {cat.depth > 0 && <span className="mr-2 opacity-30">·</span>}
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingAsset(null)} className="rounded-xl h-12 flex-1">取消</Button>
            <Button onClick={handleUpdateAsset} className="rounded-xl h-12 flex-1">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 大图预览弹窗 */}
      <Dialog open={!!previewImage} onOpenChange={(o) => !o && setPreviewImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden border-none bg-black/90 shadow-none flex flex-col items-center justify-center">
          <DialogHeader className="sr-only">
            <DialogTitle>{previewImage?.title || '图片预览'}</DialogTitle>
            <DialogDescription>查看素材的高清预览图</DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {previewImage && (
              <div className="relative w-full h-full flex flex-col items-center gap-4">
                <div className="relative w-full flex-1 min-h-0">
                  <Image 
                    src={previewImage.url} 
                    alt={previewImage.title} 
                    fill 
                    className="object-contain" 
                    priority
                  />
                </div>
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">{previewImage.title}</span>
                    <span className="text-white/60 text-[10px] uppercase tracking-widest">
                      {categoryTree.find(c => c.id === previewImage.categoryId)?.fullPath || '未分类'}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20 rounded-xl"
                    onClick={() => { navigator.clipboard.writeText(previewImage.url); toast({ title: "链接已复制" }); }}
                  >
                    <Copy className="h-4 w-4 mr-2" /> 复制链接
                  </Button>
                </div>
              </div>
            )}
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-[210] p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
