
"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  Maximize,
  CopyCheck,
  FileWarning,
  CloudUpload,
  CheckSquare,
  Square,
  MoreHorizontal
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
import { Checkbox } from '@/components/ui/checkbox';
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

type DuplicateStrategy = 'rename' | 'overwrite';

export default function GalleryPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingAsset, setEditingAsset] = useState<GalleryAsset | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ name: '', parentId: 'none' });

  // 批量操作状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchCategoryDialogOpen, setIsBatchCategoryDialogOpen] = useState(false);
  const [batchTargetCategoryId, setBatchTargetCategoryId] = useState<string>('');

  // 框选状态
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    active: boolean;
  }>({ startX: 0, startY: 0, currentX: 0, currentY: 0, active: false });

  // 上传配置
  const [targetUploadCategoryId, setTargetUploadCategoryId] = useState<string>('');
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>('rename');

  // 预览状态
  const [previewImage, setPreviewImage] = useState<GalleryAsset | null>(null);
  const [previewScaleMode, setPreviewScaleMode] = useState<'fit' | 'original'>('fit');

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

  // 设置默认上传分类
  useEffect(() => {
    if (categoryTree.length > 0 && !targetUploadCategoryId) {
      setTargetUploadCategoryId(categoryTree[0].id);
    }
  }, [categoryTree, targetUploadCategoryId]);

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

  const toggleSelectAsset = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map(a => a.id)));
    }
  };

  // 框选逻辑实现
  const handleMouseDown = (e: React.MouseEvent) => {
    // 如果点击的是按钮、复选框或输入框，不启动框选
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('label') || target.closest('[role="checkbox"]')) {
      return;
    }

    if (!gridContainerRef.current) return;

    const rect = gridContainerRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left + gridContainerRef.current.scrollLeft;
    const startY = e.clientY - rect.top + gridContainerRef.current.scrollTop;

    setSelectionRect({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      active: true
    });

    // 如果没按 Shift 键且当前没在批量模式下，清空之前的选择
    if (!e.shiftKey && selectedIds.size === 0) {
      setSelectedIds(new Set());
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!selectionRect.active || !gridContainerRef.current) return;

    const rect = gridContainerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left + gridContainerRef.current.scrollLeft;
    const currentY = e.clientY - rect.top + gridContainerRef.current.scrollTop;

    setSelectionRect(prev => ({ ...prev, currentX, currentY }));

    // 计算框选区域
    const left = Math.min(selectionRect.startX, currentX);
    const top = Math.min(selectionRect.startY, currentY);
    const right = Math.max(selectionRect.startX, currentX);
    const bottom = Math.max(selectionRect.startY, currentY);

    // 检测网格项碰撞
    const items = gridContainerRef.current.querySelectorAll('.gallery-item');
    const newSelected = new Set(e.shiftKey ? selectedIds : []);

    items.forEach((item) => {
      const itemEl = item as HTMLElement;
      const itemId = itemEl.dataset.id;
      if (!itemId) return;

      const itemRect = {
        left: itemEl.offsetLeft,
        top: itemEl.offsetTop,
        right: itemEl.offsetLeft + itemEl.offsetWidth,
        bottom: itemEl.offsetTop + itemEl.offsetHeight
      };

      // 矩形碰撞检测
      const isOverlapping = !(
        itemRect.left > right ||
        itemRect.right < left ||
        itemRect.top > bottom ||
        itemRect.bottom < top
      );

      if (isOverlapping) {
        newSelected.add(itemId);
      }
    });

    setSelectedIds(newSelected);
  }, [selectionRect, selectedIds]);

  const handleMouseUp = useCallback(() => {
    if (selectionRect.active) {
      setSelectionRect(prev => ({ ...prev, active: false }));
    }
  }, [selectionRect.active]);

  useEffect(() => {
    if (selectionRect.active) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectionRect.active, handleMouseMove, handleMouseUp]);

  const handleBatchDelete = () => {
    if (!firestore || selectedIds.size === 0) return;
    if (!confirm(`确定要永久移除选中的 ${selectedIds.size} 项素材吗？`)) return;
    
    selectedIds.forEach(id => {
      deleteDocumentNonBlocking(doc(firestore, 'galleryAssets', id));
    });
    
    setSelectedIds(new Set());
    toast({ title: "批量删除已启动" });
  };

  const handleBatchUpdateCategory = () => {
    if (!firestore || selectedIds.size === 0 || !batchTargetCategoryId) return;
    
    selectedIds.forEach(id => {
      updateDocumentNonBlocking(doc(firestore, 'galleryAssets', id), {
        categoryId: batchTargetCategoryId
      });
    });
    
    setSelectedIds(new Set());
    setIsBatchCategoryDialogOpen(false);
    toast({ title: `已将 ${selectedIds.size} 项素材移动到新分类` });
  };

  const generateUniqueTitle = (baseTitle: string, existingAssets: GalleryAsset[]): string => {
    let title = baseTitle;
    let counter = 1;
    while (existingAssets.some(a => a.title === title)) {
      title = `${baseTitle} (${counter})`;
      counter++;
    }
    return title;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !firestore) return;
    if (!categories || categories.length === 0) {
      toast({ variant: "destructive", title: "操作受阻", description: "请先通过“分类设置”添加至少一个分类。" });
      return;
    }

    const categoryId = targetUploadCategoryId || categoryTree[0]?.id;
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
        
        const originalTitle = file.name.split('.')[0];
        let finalTitle = originalTitle;
        let assetId = `asset_${Date.now()}_${index}`;

        // 冲突处理逻辑
        const existingAsset = assets?.find(a => a.title === originalTitle && a.fileName === file.name);
        
        if (existingAsset && duplicateStrategy === 'overwrite') {
          assetId = existingAsset.id;
          finalTitle = existingAsset.title;
        } else if (duplicateStrategy === 'rename') {
          finalTitle = generateUniqueTitle(originalTitle, assets || []);
        }

        const assetRef = doc(firestore, 'galleryAssets', assetId);

        setDocumentNonBlocking(assetRef, {
          id: assetId,
          url: base64,
          title: finalTitle,
          fileName: file.name,
          fileSize: file.size,
          categoryId: categoryId,
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
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-[80vh] select-none">
      {/* 批量操作悬浮条 - z-index 设为 30 以便在大图预览下层 */}
      {selectedIds.size > 0 && !previewImage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[30] bg-white border border-primary/20 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={selectedIds.size === filteredAssets.length}
              onCheckedChange={toggleSelectAll}
              className="rounded-md"
            />
            <span className="text-sm font-bold text-primary whitespace-nowrap">
              已选中 {selectedIds.size} 项
            </span>
          </div>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-2">
            <Dialog open={isBatchCategoryDialogOpen} onOpenChange={setIsBatchCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full h-10 px-6 gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                  <Layers className="h-4 w-4" /> 修改分类
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-w-sm">
                <DialogHeader>
                  <DialogTitle>批量移动分类</DialogTitle>
                  <DialogDescription>将选中的 {selectedIds.size} 项素材移动到指定层级。</DialogDescription>
                </DialogHeader>
                <div className="py-6 space-y-4">
                  <Label className="text-[10px] font-bold uppercase">目标分类</Label>
                  <Select value={batchTargetCategoryId} onValueChange={setBatchTargetCategoryId}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="选择新分类" />
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
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsBatchCategoryDialogOpen(false)} className="rounded-xl h-12 flex-1">取消</Button>
                  <Button onClick={handleBatchUpdateCategory} disabled={!batchTargetCategoryId} className="rounded-xl h-12 flex-1">确认移动</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              variant="destructive" 
              size="sm" 
              className="rounded-full h-10 px-6 gap-2 shadow-lg shadow-destructive/10"
              onClick={handleBatchDelete}
            >
              <Trash2 className="h-4 w-4" /> 批量删除
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-10 w-10 hover:bg-muted"
              onClick={() => setSelectedIds(new Set())}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            全球图库中心
          </h2>
          <p className="text-sm text-muted-foreground">支持多级分类管理、素材批量上传及框选批量编辑。</p>
        </div>
        
        <div className="flex gap-2">
          {/* 分类设置弹窗 */}
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

          {/* 统一的上传弹窗 */}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2">
                <CloudUpload className="h-4 w-4" /> 上传素材
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-primary p-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <CloudUpload className="h-8 w-8" /> 批量上传素材
                  </DialogTitle>
                  <DialogDescription className="text-white/60 text-sm">
                    支持多文件批量上传，请预先配置好分类与冲突策略。
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 bg-white">
                <div className="md:col-span-7 space-y-4">
                  <div 
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    className="group relative h-64 border-2 border-dashed border-primary/20 rounded-[2rem] flex flex-col items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer bg-muted/10"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Upload className="h-8 w-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary">点击或拖拽上传图片</p>
                        <p className="text-xs text-muted-foreground mt-1">支持 JPG, PNG, WEBP (建议不超过 800KB)</p>
                      </div>
                    </div>
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

                <div className="md:col-span-5 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <Layers className="h-3 w-3" /> 目标上传分类
                      </Label>
                      <Select value={targetUploadCategoryId} onValueChange={setTargetUploadCategoryId}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-transparent hover:bg-muted/30 transition-colors">
                          <SelectValue placeholder="选择目标分类" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryTree.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <span 
                                style={{ paddingLeft: `${cat.depth * 0.8}rem` }} 
                                className={cn("flex items-center text-xs", cat.depth > 0 && "text-muted-foreground")}
                              >
                                {cat.depth > 0 && <span className="mr-1.5 opacity-30">·</span>}
                                {cat.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <CopyCheck className="h-3 w-3" /> 同名文件处理
                      </Label>
                      <Select value={duplicateStrategy} onValueChange={(v: DuplicateStrategy) => setDuplicateStrategy(v)}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-transparent hover:bg-muted/30 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rename" className="text-xs">
                            <div className="flex items-center gap-2">
                              <CopyCheck className="h-3 w-3" /> 自动重命名 (保留副本)
                            </div>
                          </SelectItem>
                          <SelectItem value="overwrite" className="text-xs">
                            <div className="flex items-center gap-2">
                              <FileWarning className="h-3 w-3" /> 覆盖现有文件
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] leading-relaxed text-primary/70 italic">
                      提示：您可以直接在此时拖入文件。上传开始后，右下角的任务管理器将同步展示进度。
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-muted/30 p-4">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} className="rounded-xl h-10 px-8">关闭</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
        <div 
          ref={gridContainerRef}
          onMouseDown={handleMouseDown}
          className="relative grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 min-h-[400px] items-start"
        >
          {/* 框选矩形视图 */}
          {selectionRect.active && (
            <div 
              className="absolute z-[50] border border-primary bg-primary/10 pointer-events-none transition-none"
              style={{
                left: Math.min(selectionRect.startX, selectionRect.currentX),
                top: Math.min(selectionRect.startY, selectionRect.currentY),
                width: Math.abs(selectionRect.currentX - selectionRect.startX),
                height: Math.abs(selectionRect.currentY - selectionRect.startY),
              }}
            />
          )}

          {filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              data-id={asset.id}
              className={cn(
                "gallery-item group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                selectedIds.has(asset.id) ? "border-primary ring-2 ring-primary/20 shadow-xl" : "border-border/40 hover:shadow-2xl"
              )}
            >
              {/* 多选框 */}
              <div className="absolute top-2 left-2 z-20">
                <Checkbox 
                  checked={selectedIds.has(asset.id)}
                  onCheckedChange={() => toggleSelectAsset(asset.id)}
                  className={cn(
                    "rounded-md border-white/50 bg-black/20 backdrop-blur-sm",
                    selectedIds.has(asset.id) && "bg-primary border-primary"
                  )}
                />
              </div>

              <div 
                className="relative aspect-square bg-muted/10 cursor-zoom-in overflow-hidden"
                onClick={(e) => { 
                  // 如果按下 Shift 键或当前已经处于批量选择模式，点击图片变为“选择”操作，防止误触预览
                  if (e.shiftKey || selectedIds.size > 0) {
                    toggleSelectAsset(asset.id);
                  } else {
                    setPreviewScaleMode('fit'); 
                    setPreviewImage(asset); 
                  }
                }}
              >
                <Image src={asset.url} alt={asset.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-2 left-2">
                  <Badge className="text-[7px] bg-black/70 border-none uppercase px-2 py-0.5 rounded-sm max-w-[120px] truncate">
                    {categoryTree.find(c => c.id === asset.categoryId)?.fullPath || '未分类'}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize className="text-white h-6 w-6" />
                </div>
              </div>
              <div className="p-3 pb-2.5 space-y-1.5">
                <p className="text-[11px] font-bold truncate text-primary leading-tight">{asset.title}</p>
                <div className="flex items-center justify-between border-t pt-2 mt-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-primary" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(asset.url); toast({ title: "素材链接已复制" }); }}><Copy className="h-3.5 w-3.5" /></Button>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingAsset(asset); }}><Edit3 className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/5" onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传任务管理面板 - z-index 设为 30 */}
      {isTasksPanelOpen && !previewImage && (
        <div className={cn(
          "fixed bottom-6 right-6 z-[30] w-80 bg-white border border-border/40 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 transform",
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

      {/* 大图预览弹窗 - 具有系统级 z-index，将覆盖所有浮动控件 */}
      <Dialog open={!!previewImage} onOpenChange={(o) => !o && setPreviewImage(null)}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0 overflow-hidden border-none bg-black/95 shadow-none flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>{previewImage?.title || '图片预览'}</DialogTitle>
            <DialogDescription>查看素材的高清预览图</DialogDescription>
          </DialogHeader>
          
          <div className={cn(
            "relative flex-1 w-full flex flex-col items-center p-4 transition-all duration-300",
            previewScaleMode === 'fit' ? "justify-center" : "overflow-auto justify-start"
          )}>
            {previewImage && (
              <>
                <div className={cn(
                  "relative transition-all duration-300",
                  previewScaleMode === 'fit' ? "w-full h-full" : "min-w-max min-h-max"
                )}>
                  {previewScaleMode === 'fit' ? (
                    <Image 
                      src={previewImage.url} 
                      alt={previewImage.title} 
                      fill 
                      className="object-contain" 
                      priority
                    />
                  ) : (
                    <img 
                      src={previewImage.url} 
                      alt={previewImage.title} 
                      className="max-w-none shadow-2xl"
                    />
                  )}
                </div>
                
                {/* 底部信息条 */}
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[210] bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">{previewImage.title}</span>
                    <span className="text-white/60 text-[10px] uppercase tracking-widest">
                      {categoryTree.find(c => c.id === previewImage.categoryId)?.fullPath || '未分类'}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "text-white hover:bg-white/20 rounded-xl transition-all",
                        previewScaleMode === 'fit' ? "bg-white/20" : ""
                      )}
                      onClick={() => setPreviewScaleMode('fit')}
                    >
                      <Minimize2 className="h-4 w-4 mr-2" /> 适合屏幕
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "text-white hover:bg-white/20 rounded-xl transition-all",
                        previewScaleMode === 'original' ? "bg-white/20" : ""
                      )}
                      onClick={() => setPreviewScaleMode('original')}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" /> 原始大小
                    </Button>
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
              </>
            )}
            
            <button 
              onClick={() => setPreviewImage(null)}
              className="fixed top-4 right-4 z-[210] p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
