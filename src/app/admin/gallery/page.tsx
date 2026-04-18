
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

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('label') || target.closest('[role="checkbox"]')) {
      return;
    }
    if (!gridContainerRef.current) return;
    const rect = gridContainerRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left + gridContainerRef.current.scrollLeft;
    const startY = e.clientY - rect.top + gridContainerRef.current.scrollTop;
    setSelectionRect({ startX, startY, currentX: startX, currentY: startY, active: true });
    if (!e.shiftKey && selectedIds.size === 0) setSelectedIds(new Set());
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!selectionRect.active || !gridContainerRef.current) return;
    const rect = gridContainerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left + gridContainerRef.current.scrollLeft;
    const currentY = e.clientY - rect.top + gridContainerRef.current.scrollTop;
    setSelectionRect(prev => ({ ...prev, currentX, currentY }));
    const left = Math.min(selectionRect.startX, currentX);
    const top = Math.min(selectionRect.startY, currentY);
    const right = Math.max(selectionRect.startX, currentX);
    const bottom = Math.max(selectionRect.startY, currentY);
    const items = gridContainerRef.current.querySelectorAll('.gallery-item');
    const newSelected = new Set(e.shiftKey ? selectedIds : []);
    items.forEach((item) => {
      const itemEl = item as HTMLElement;
      const itemId = itemEl.dataset.id;
      if (!itemId) return;
      const itemRect = { left: itemEl.offsetLeft, top: itemEl.offsetTop, right: itemEl.offsetLeft + itemEl.offsetWidth, bottom: itemEl.offsetTop + itemEl.offsetHeight };
      const isOverlapping = !(itemRect.left > right || itemRect.right < left || itemRect.top > bottom || itemRect.bottom < top);
      if (isOverlapping) newSelected.add(itemId);
    });
    setSelectedIds(newSelected);
  }, [selectionRect, selectedIds]);

  const handleMouseUp = useCallback(() => {
    if (selectionRect.active) setSelectionRect(prev => ({ ...prev, active: false }));
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
    selectedIds.forEach(id => deleteDocumentNonBlocking(doc(firestore, 'galleryAssets', id)));
    setSelectedIds(new Set());
    toast({ title: "批量删除已启动" });
  };

  const handleBatchUpdateCategory = () => {
    if (!firestore || selectedIds.size === 0 || !batchTargetCategoryId) return;
    selectedIds.forEach(id => updateDocumentNonBlocking(doc(firestore, 'galleryAssets', id), { categoryId: batchTargetCategoryId }));
    setSelectedIds(new Set());
    setIsBatchCategoryDialogOpen(false);
    toast({ title: `已将 ${selectedIds.size} 项素材移动到新分类` });
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
    const newTasks: UploadTask[] = Array.from(files).map((file, i) => ({ id: `task_${Date.now()}_${i}`, fileName: file.name, progress: 0, status: 'reading' }));
    setUploadTasks(prev => [...prev, ...newTasks]);
    Array.from(files).forEach((file, index) => {
      const taskId = newTasks[index].id;
      if (!file.type.startsWith('image/')) { updateTask(taskId, { status: 'error', error: '文件类型不符', progress: 0 }); return; }
      if (file.size > 800000) { updateTask(taskId, { status: 'error', error: '超过 800KB', progress: 0 }); return; }
      const reader = new FileReader();
      reader.onprogress = (e) => { if (e.lengthComputable) { const p = Math.round((e.loaded / e.total) * 50); updateTask(taskId, { progress: p }); } };
      reader.onload = (e) => {
        updateTask(taskId, { status: 'uploading', progress: 60 });
        const base64 = e.target?.result as string;
        const originalTitle = file.name.split('.')[0];
        let assetId = `asset_${Date.now()}_${index}`;
        const assetRef = doc(firestore, 'galleryAssets', assetId);
        setDocumentNonBlocking(assetRef, { id: assetId, url: base64, title: originalTitle, fileName: file.name, fileSize: file.size, categoryId: categoryId, createdAt: serverTimestamp() }, { merge: true });
        setTimeout(() => updateTask(taskId, { progress: 85 }), 300);
        setTimeout(() => updateTask(taskId, { status: 'completed', progress: 100 }), 800);
      };
      reader.readAsDataURL(file);
    });
  };

  const updateTask = (id: string, updates: Partial<UploadTask>) => {
    setUploadTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const clearCompletedTasks = () => {
    setUploadTasks(prev => prev.filter(t => t.status !== 'completed' && t.status !== 'error'));
    if (uploadTasks.filter(t => t.status !== 'completed' && t.status !== 'error').length === 0) setIsTasksPanelOpen(false);
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
      if (catForm.parentId === editingCatId) { toast({ variant: "destructive", title: "无效操作", description: "不能将分类的上级设为自己。" }); return; }
      updateDocumentNonBlocking(doc(firestore, 'galleryCategories', editingCatId), { name: catForm.name, parentId: parentId });
      toast({ title: "分类已更新" });
    } else {
      const id = `cat_${Date.now()}`;
      const siblings = categories?.filter(c => (c.parentId || null) === parentId) || [];
      const order = siblings.length + 1;
      setDocumentNonBlocking(doc(firestore, 'galleryCategories', id), { id, name: catForm.name, parentId: parentId, order }, { merge: true });
      toast({ title: "分类已添加" });
    }
    resetCatForm();
  };

  const resetCatForm = () => { setEditingCatId(null); setCatForm({ name: '', parentId: 'none' }); };
  const startEditCategory = (cat: GalleryCategory) => { setEditingCatId(cat.id); setCatForm({ name: cat.name, parentId: cat.parentId || 'none' }); };
  const handleDeleteCategory = (id: string) => { if (!firestore || !confirm('确定要删除此分类吗？关联的素材将变为“未分类”。')) return; deleteDocumentNonBlocking(doc(firestore, 'galleryCategories', id)); if (editingCatId === id) resetCatForm(); };
  const handleMoveCategory = (id: string, direction: 'up' | 'down') => {
    if (!firestore || !categories) return;
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const siblings = categories.filter(c => (c.parentId || null) === (cat.parentId || null)).sort((a, b) => a.order - b.order);
    const index = siblings.findIndex(s => s.id === id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    const target = siblings[targetIndex];
    updateDocumentNonBlocking(doc(firestore, 'galleryCategories', cat.id), { order: target.order });
    updateDocumentNonBlocking(doc(firestore, 'galleryCategories', target.id), { order: cat.order });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-[80vh] select-none">
      {/* 批量操作悬浮条 */}
      {selectedIds.size > 0 && !previewImage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[30] bg-white border border-primary/20 shadow-2xl rounded-full px-5 py-2.5 flex items-center gap-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <Checkbox checked={selectedIds.size === filteredAssets.length} onCheckedChange={toggleSelectAll} className="rounded" />
            <span className="text-xs font-bold text-primary whitespace-nowrap">已选中 {selectedIds.size} 项</span>
          </div>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Dialog open={isBatchCategoryDialogOpen} onOpenChange={setIsBatchCategoryDialogOpen}>
              <DialogTrigger asChild><Button variant="outline" size="sm" className="rounded-full h-9 px-5 gap-2 text-xs">修改分类</Button></DialogTrigger>
              <DialogContent className="rounded-2xl max-w-sm">
                <DialogHeader><DialogTitle className="text-base">批量移动分类</DialogTitle></DialogHeader>
                <div className="py-4 space-y-3">
                  <Label className="text-[10px] font-bold uppercase opacity-60">目标分类</Label>
                  <Select value={batchTargetCategoryId} onValueChange={setBatchTargetCategoryId}>
                    <SelectTrigger className="rounded-lg h-10"><SelectValue placeholder="选择新分类" /></SelectTrigger>
                    <SelectContent>{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id}><span style={{ paddingLeft: `${cat.depth * 0.8}rem` }} className={cn("flex items-center text-xs", cat.depth > 0 && "text-muted-foreground")}>{cat.name}</span></SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <DialogFooter className="flex gap-2"><Button variant="outline" onClick={() => setIsBatchCategoryDialogOpen(false)} className="rounded-lg h-10 flex-1">取消</Button><Button onClick={handleBatchUpdateCategory} disabled={!batchTargetCategoryId} className="rounded-lg h-10 flex-1">确认移动</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm" className="rounded-full h-9 px-5 gap-2 text-xs" onClick={handleBatchDelete}>批量删除</Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => setSelectedIds(new Set())}><X className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2"><ImageIcon className="h-5 w-5" /> 全球图库中心</h2>
          <p className="text-xs text-muted-foreground">多级分类、批量上传及框选编辑。</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => { setIsCategoryDialogOpen(open); if (!open) resetCatForm(); }}>
            <DialogTrigger asChild><Button variant="outline" className="rounded-lg h-10 gap-2 text-xs"><Settings2 className="h-4 w-4" /> 分类设置</Button></DialogTrigger>
            <DialogContent className="rounded-2xl max-w-2xl p-0 overflow-hidden">
              <div className="p-6 space-y-6">
                <DialogHeader><DialogTitle className="text-lg font-bold flex items-center gap-2 text-primary"><Layers className="h-5 w-5" /> 分类与层级设置</DialogTitle></DialogHeader>
                <div className={cn("space-y-4 p-5 rounded-xl border transition-colors", editingCatId ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/40")}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">分类名称</Label><Input placeholder="输入名称..." value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="rounded-lg h-10" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">所属父级</Label><Select value={catForm.parentId} onValueChange={v => setCatForm({...catForm, parentId: v})}><SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">无 (设为一级分类)</SelectItem>{categoryTree.filter(c => c.id !== editingCatId).map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.8}rem` }}>{cat.name}</span></SelectItem>))}</SelectContent></Select></div>
                  </div>
                  <Button onClick={handleSaveCategory} className="w-full rounded-lg h-10 font-bold uppercase tracking-widest text-xs">{editingCatId ? '保存层级变更' : '确认添加'}</Button>
                </div>
                <div className="max-h-[40vh] overflow-y-auto rounded-xl border bg-white"><Table><TableHeader className="bg-muted/50 sticky top-0 z-10"><TableRow><TableHead className="pl-4 h-10 text-[10px] font-bold uppercase">分类结构</TableHead><TableHead className="w-40 text-right pr-4 h-10 text-[10px] font-bold uppercase">操作</TableHead></TableRow></TableHeader><TableBody>{visibleCategories.map((cat) => (<TableRow key={cat.id} className={cn("hover:bg-muted/5", editingCatId === cat.id ? "bg-primary/5" : "")}><TableCell className="pl-4 py-2"><div className="flex items-center gap-1" style={{ paddingLeft: `${cat.depth * 1.2}rem` }}>{cat.hasChildren ? (<Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => toggleCollapse(cat.id)}>{collapsedIds.has(cat.id) ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</Button>) : <div className="w-6 h-6" />}<span className={cn("text-xs", !cat.parentId ? "font-bold text-primary" : "text-muted-foreground")}>{cat.name}</span></div></TableCell><TableCell className="pr-4 py-2 text-right"><div className="flex items-center justify-end gap-0.5"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleMoveCategory(cat.id, 'up')}><ArrowUp className="h-3 w-3" /></Button><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleMoveCategory(cat.id, 'down')}><ArrowDown className="h-3 w-3" /></Button><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEditCategory(cat)}><Edit3 className="h-3 w-3" /></Button><Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCategory(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>))}</TableBody></Table></div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild><Button className="rounded-lg h-10 px-5 font-bold uppercase tracking-widest gap-2 text-xs"><CloudUpload className="h-4 w-4" /> 上传素材</Button></DialogTrigger>
            <DialogContent className="rounded-2xl max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-primary p-6 text-white"><DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3"><CloudUpload className="h-6 w-6" /> 批量上传素材</DialogTitle></DialogHeader></div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white">
                <div className="md:col-span-7"><div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }} className="h-64 border-2 border-dashed border-muted rounded-xl flex flex-col items-center justify-center hover:bg-muted/10 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}><Upload className="h-10 w-10 text-muted-foreground mb-3" /><p className="text-sm font-bold opacity-60">点击或拖拽图片</p><p className="text-[10px] opacity-40 mt-1">支持 JPG, PNG, WEBP (建议 &lt; 800KB)</p><input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={e => handleFileUpload(e.target.files)} /></div></div>
                <div className="md:col-span-5 space-y-5"><div className="space-y-4"><div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">目标分类</Label><Select value={targetUploadCategoryId} onValueChange={setTargetUploadCategoryId}><SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="选择目标分类" /></SelectTrigger><SelectContent>{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.6}rem` }}>{cat.name}</span></SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">冲突策略</Label><Select value={duplicateStrategy} onValueChange={(v: DuplicateStrategy) => setDuplicateStrategy(v)}><SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rename" className="text-xs">自动重命名</SelectItem><SelectItem value="overwrite" className="text-xs">覆盖现有文件</SelectItem></SelectContent></Select></div></div></div>
              </div>
              <DialogFooter className="bg-muted/20 p-4"><Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} className="rounded-lg h-9 px-6 text-xs">关闭</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-border/40 shadow-sm">
        <div className="relative flex-1 w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" /><Input placeholder="按标题搜索素材..." className="pl-9 border-none bg-muted/40 h-9 text-xs rounded-lg focus-visible:ring-0" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
        <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-full md:w-56 rounded-lg h-9 text-xs border-none bg-muted/40"><SelectValue placeholder="全部分类" /></SelectTrigger><SelectContent><SelectItem value="all" className="text-xs">全部分类</SelectItem>{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.8}rem` }}>{cat.name}</span></SelectItem>))}</SelectContent></Select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20 mx-auto mb-3" /><p className="text-[10px] font-bold uppercase tracking-widest opacity-40">同步素材库中...</p></div>
      ) : (
        <div ref={gridContainerRef} onMouseDown={handleMouseDown} className="relative grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 min-h-[400px]">
          {selectionRect.active && (<div className="absolute z-[50] border border-primary bg-primary/10 pointer-events-none" style={{ left: Math.min(selectionRect.startX, selectionRect.currentX), top: Math.min(selectionRect.startY, selectionRect.currentY), width: Math.abs(selectionRect.currentX - selectionRect.startX), height: Math.abs(selectionRect.currentY - selectionRect.startY) }} />)}
          {filteredAssets.map((asset) => (
            <div key={asset.id} data-id={asset.id} className={cn("gallery-item group relative bg-white rounded-xl border transition-all duration-300 overflow-hidden", selectedIds.has(asset.id) ? "border-primary ring-2 ring-primary/10 shadow-lg" : "border-border/40 hover:shadow-xl")}>
              <div className="absolute top-1.5 left-1.5 z-20"><Checkbox checked={selectedIds.has(asset.id)} onCheckedChange={() => toggleSelectAsset(asset.id)} className="rounded bg-white/20 backdrop-blur-md border-white/40" /></div>
              <div className="relative aspect-square bg-muted/10 cursor-zoom-in overflow-hidden" onClick={e => { if (e.shiftKey || selectedIds.size > 0) toggleSelectAsset(asset.id); else { setPreviewScaleMode('fit'); setPreviewImage(asset); } }}>
                <Image src={asset.url} alt={asset.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-1.5 left-1.5"><Badge className="text-[8px] bg-black/60 border-none uppercase px-1.5 h-4 max-w-[100px] truncate">{categoryTree.find(c => c.id === asset.categoryId)?.name || '未分类'}</Badge></div>
              </div>
              <div className="p-2.5 space-y-1.5 border-t">
                <p className="text-[10px] font-bold truncate text-primary leading-tight">{asset.title}</p>
                <div className="flex items-center justify-between"><Button size="icon" variant="ghost" className="h-6 w-6" onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(asset.url); toast({ title: "链接已复制" }); }}><Copy className="h-3 w-3" /></Button><div className="flex gap-0.5"><Button size="icon" variant="ghost" className="h-6 w-6" onClick={e => { e.stopPropagation(); setEditingAsset(asset); }}><Edit3 className="h-3 w-3" /></Button><Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/5" onClick={e => { e.stopPropagation(); handleDeleteAsset(asset.id); }}><Trash2 className="h-3 w-3" /></Button></div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isTasksPanelOpen && !previewImage && (
        <div className={cn("fixed bottom-5 right-5 z-[30] w-72 bg-white border border-border shadow-2xl rounded-2xl overflow-hidden transition-all duration-300", isTasksPanelMinimized ? "h-12" : "h-80")}>
          <div className="bg-primary px-4 h-12 flex items-center justify-between text-white"><div className="flex items-center gap-2"><PanelTop className="h-3.5 w-3.5" /><span className="text-[10px] font-bold uppercase">任务管理器</span></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsTasksPanelMinimized(!isTasksPanelMinimized)}>{isTasksPanelMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}</Button><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setIsTasksPanelOpen(false); setUploadTasks([]); }}><X className="h-3 w-3" /></Button></div></div>
          {!isTasksPanelMinimized && (<div className="flex flex-col h-[calc(100%-48px)] p-4 space-y-4 overflow-y-auto">{uploadTasks.map(task => (<div key={task.id} className="space-y-1.5"><div className="flex justify-between text-[9px] font-bold"><span className="truncate max-w-[150px]">{task.fileName}</span>{task.status === 'completed' ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <span className="opacity-40 animate-pulse">{task.status === 'reading' ? '读取' : '上传'}</span>}</div><Progress value={task.progress} className="h-1" /></div>))}</div>)}
        </div>
      )}

      <Dialog open={!!editingAsset} onOpenChange={o => !o && setEditingAsset(null)}>
        <DialogContent className="rounded-2xl max-w-sm p-6"><DialogHeader><DialogTitle className="text-base font-bold">编辑素材信息</DialogTitle></DialogHeader>
          {editingAsset && (<div className="space-y-4 py-4"><div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase opacity-60">素材标题</Label><Input value={editingAsset.title} onChange={e => setEditingAsset({...editingAsset, title: e.target.value})} className="rounded-lg h-10" /></div><div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase opacity-60">所属分类</Label><Select value={editingAsset.categoryId} onValueChange={v => setEditingAsset({...editingAsset, categoryId: v})}><SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger><SelectContent>{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.6}rem` }}>{cat.name}</span></SelectItem>))}</SelectContent></Select></div></div>)}
          <DialogFooter className="flex gap-2"><Button variant="outline" onClick={() => setEditingAsset(null)} className="rounded-lg h-10 flex-1">取消</Button><Button onClick={handleUpdateAsset} className="rounded-lg h-10 flex-1">保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
