
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
  PanelTop, 
  Minimize2, 
  Maximize2, 
  CloudUpload, 
  Check,
  CheckSquare,
  Square
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  isUpdate?: boolean;
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

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchCategoryDialogOpen, setIsBatchCategoryDialogOpen] = useState(false);
  const [batchTargetCategoryId, setBatchTargetCategoryId] = useState<string>('');

  const [selectionRect, setSelectionRect] = useState({ startX: 0, startY: 0, currentX: 0, currentY: 0, active: false });
  const [targetUploadCategoryId, setTargetUploadCategoryId] = useState<string>('');
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>('rename');

  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [isTasksPanelOpen, setIsTasksPanelOpen] = useState(false);
  const [isTasksPanelMinimized, setIsTasksPanelMinimized] = useState(false);

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const categoriesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'galleryCategories'), orderBy('order', 'asc')) : null, [firestore]);
  const assetsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'galleryAssets'), orderBy('createdAt', 'desc')) : null, [firestore]);

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
    const hasChildren = (id: string): boolean => categories.some(c => c.parentId === id);
    const tree: (GalleryCategory & { fullPath: string, depth: number, hasChildren: boolean })[] = [];
    const build = (parentId: string | null = null) => {
      categories.filter(c => (c.parentId || null) === parentId).sort((a, b) => a.order - b.order).forEach(item => {
        tree.push({ ...item, fullPath: getFullPath(item), depth: getDepth(item), hasChildren: hasChildren(item.id) });
        build(item.id);
      });
    };
    build(null);
    return tree;
  }, [categories]);

  useEffect(() => {
    if (categoryTree.length > 0 && !targetUploadCategoryId) setTargetUploadCategoryId(categoryTree[0].id);
  }, [categoryTree, targetUploadCategoryId]);

  const visibleCategories = useMemo(() => categoryTree.filter(cat => {
    let currentParentId = cat.parentId;
    while (currentParentId) {
      if (collapsedIds.has(currentParentId)) return false;
      const parent = categories?.find(c => c.id === currentParentId);
      currentParentId = parent?.parentId || null;
    }
    return true;
  }), [categoryTree, collapsedIds, categories]);

  const toggleCollapse = (id: string) => {
    const newCollapsed = new Set(collapsedIds);
    newCollapsed.has(id) ? newCollapsed.delete(id) : newCollapsed.add(id);
    setCollapsedIds(newCollapsed);
  };

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(a => {
      const ms = a.title.toLowerCase().includes(searchQuery.toLowerCase());
      const mc = filterCategory === 'all' || a.categoryId === filterCategory;
      return ms && mc;
    });
  }, [assets, searchQuery, filterCategory]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !firestore) return;
    if (!categories || categories.length === 0) {
      toast({ variant: "destructive", title: "操作受阻", description: "请先添加至少一个分类。" });
      return;
    }
    const categoryId = targetUploadCategoryId || categoryTree[0]?.id;
    setIsTasksPanelOpen(true);
    setIsTasksPanelMinimized(false);

    const fileArray = Array.from(files);
    const newTasks: UploadTask[] = fileArray.map((file, i) => ({
      id: `task_${Date.now()}_${i}`,
      fileName: file.name,
      progress: 0,
      status: 'reading'
    }));
    
    setUploadTasks(prev => [...prev, ...newTasks]);

    fileArray.forEach((file, index) => {
      const taskId = newTasks[index].id;
      if (!file.type.startsWith('image/')) { updateTask(taskId, { status: 'error', error: '类型不符' }); return; }
      if (file.size > 1024 * 1024) { updateTask(taskId, { status: 'error', error: '超过 1MB' }); return; }

      const reader = new FileReader();
      reader.onload = (e) => {
        updateTask(taskId, { status: 'uploading', progress: 50 });
        const base64 = e.target?.result as string;
        
        // --- 冲突处理核心逻辑 ---
        const existingAsset = assets?.find(a => a.fileName === file.name);
        let finalAssetId = `asset_${Date.now()}_${index}`;
        let finalTitle = file.name.split('.')[0];
        let isUpdate = false;

        if (existingAsset) {
          if (duplicateStrategy === 'overwrite') {
            finalAssetId = existingAsset.id;
            finalTitle = existingAsset.title; // 保持原有标题
            isUpdate = true;
          } else {
            // Rename strategy: 添加微秒级后缀
            finalTitle = `${finalTitle}_${Date.now().toString().slice(-4)}`;
          }
        }

        updateTask(taskId, { isUpdate, progress: 70 });

        const assetRef = doc(firestore, 'galleryAssets', finalAssetId);
        setDocumentNonBlocking(assetRef, {
          id: finalAssetId,
          url: base64,
          title: finalTitle,
          fileName: file.name,
          fileSize: file.size,
          categoryId: categoryId,
          createdAt: isUpdate ? (existingAsset?.createdAt || serverTimestamp()) : serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        setTimeout(() => updateTask(taskId, { status: 'completed', progress: 100 }), 500);
      };
      reader.readAsDataURL(file);
    });
  };

  const updateTask = (id: string, updates: Partial<UploadTask>) => {
    setUploadTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const toggleSelectAsset = (id: string) => {
    const newSelected = new Set(selectedIds);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleBatchDelete = () => {
    if (!firestore || selectedIds.size === 0) return;
    if (!confirm(`永久移除选中的 ${selectedIds.size} 项素材？`)) return;
    selectedIds.forEach(id => deleteDocumentNonBlocking(doc(firestore, 'galleryAssets', id)));
    setSelectedIds(new Set());
    toast({ title: "批量删除已启动" });
  };

  const handleBatchUpdateCategory = () => {
    if (!firestore || selectedIds.size === 0 || !batchTargetCategoryId) return;
    selectedIds.forEach(id => updateDocumentNonBlocking(doc(firestore, 'galleryAssets', id), { categoryId: batchTargetCategoryId }));
    setSelectedIds(new Set());
    setIsBatchCategoryDialogOpen(false);
    toast({ title: `已移动 ${selectedIds.size} 项素材` });
  };

  const resetCatForm = () => { setEditingCatId(null); setCatForm({ name: '', parentId: 'none' }); };
  const handleSaveCategory = () => {
    if (!firestore || !catForm.name.trim()) return;
    const pId = catForm.parentId === 'none' ? null : catForm.parentId;
    if (editingCatId) {
      updateDocumentNonBlocking(doc(firestore, 'galleryCategories', editingCatId), { name: catForm.name, parentId: pId });
    } else {
      const id = `cat_${Date.now()}`;
      setDocumentNonBlocking(doc(firestore, 'galleryCategories', id), { id, name: catForm.name, parentId: pId, order: (categories?.length || 0) + 1 }, { merge: true });
    }
    resetCatForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative min-h-[80vh] select-none">
      {selectedIds.size > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-white border border-primary/20 shadow-2xl rounded-full px-5 py-2.5 flex items-center gap-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <Checkbox checked={selectedIds.size === filteredAssets.length} onCheckedChange={(v) => v ? setSelectedIds(new Set(filteredAssets.map(a => a.id))) : setSelectedIds(new Set())} className="rounded" />
            <span className="text-xs font-bold text-primary">已选中 {selectedIds.size} 项</span>
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
                    <SelectContent>{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id}><span style={{ paddingLeft: `${cat.depth * 0.8}rem` }} className={cn("text-xs", cat.depth > 0 && "text-muted-foreground")}>{cat.name}</span></SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <DialogFooter className="flex gap-2"><Button variant="outline" onClick={() => setIsBatchCategoryDialogOpen(false)} className="rounded-lg h-10 flex-1">取消</Button><Button onClick={handleBatchUpdateCategory} disabled={!batchTargetCategoryId} className="rounded-lg h-10 flex-1">确认移动</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm" className="rounded-full h-9 px-5 text-xs" onClick={handleBatchDelete}>批量删除</Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => setSelectedIds(new Set())}><X className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2"><ImageIcon className="h-5 w-5" /> 全球图库中心</h2>
          <p className="text-xs text-muted-foreground">多级分类、冲突校验及批量上传。</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={(o) => { setIsCategoryDialogOpen(o); if (!o) resetCatForm(); }}>
            <DialogTrigger asChild><Button variant="outline" className="rounded-lg h-10 gap-2 text-xs"><Settings2 className="h-4 w-4" /> 分类设置</Button></DialogTrigger>
            <DialogContent className="rounded-2xl max-w-2xl p-0 overflow-hidden">
              <div className="p-6 space-y-6">
                <DialogHeader><DialogTitle className="text-lg font-bold flex items-center gap-2 text-primary"><Layers className="h-5 w-5" /> 分层管理</DialogTitle></DialogHeader>
                <div className={cn("space-y-4 p-5 rounded-xl border", editingCatId ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/40")}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">名称</Label><Input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="rounded-lg h-10" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">父级</Label><Select value={catForm.parentId} onValueChange={v => setCatForm({...catForm, parentId: v})}><SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">无 (顶级)</SelectItem>{categoryTree.filter(c => c.id !== editingCatId).map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.8}rem` }}>{cat.name}</span></SelectItem>))}</SelectContent></Select></div>
                  </div>
                  <Button onClick={handleSaveCategory} className="w-full rounded-lg h-10 font-bold uppercase text-xs">{editingCatId ? '保存变更' : '确认添加'}</Button>
                </div>
                <div className="max-h-[35vh] overflow-y-auto rounded-xl border bg-white"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead className="pl-4 h-10 text-[10px] font-bold">结构</TableHead><TableHead className="w-32 text-right pr-4 h-10 text-[10px] font-bold">操作</TableHead></TableRow></TableHeader><TableBody>{visibleCategories.map(cat => (<TableRow key={cat.id} className={cn(editingCatId === cat.id && "bg-primary/5")}><TableCell className="pl-4 py-2"><div className="flex items-center gap-1" style={{ paddingLeft: `${cat.depth * 1.2}rem` }}>{cat.hasChildren ? (<Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleCollapse(cat.id)}>{collapsedIds.has(cat.id) ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</Button>) : <div className="w-6 h-6" />}<span className={cn("text-xs", !cat.parentId ? "font-bold text-primary" : "text-muted-foreground")}>{cat.name}</span></div></TableCell><TableCell className="pr-4 text-right"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingCatId(cat.id) || setCatForm({ name: cat.name, parentId: cat.parentId || 'none' })}><Edit3 className="h-3 w-3" /></Button><Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => confirm('删除分类？') && deleteDocumentNonBlocking(doc(firestore, 'galleryCategories', cat.id))}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>))}</TableBody></Table></div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild><Button className="rounded-lg h-10 px-5 font-bold uppercase tracking-widest gap-2 text-xs"><CloudUpload className="h-4 w-4" /> 上传素材</Button></DialogTrigger>
            <DialogContent className="rounded-2xl max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-primary p-6 text-white"><DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3"><CloudUpload className="h-6 w-6" /> 批量上传素材</DialogTitle></DialogHeader></div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white">
                <div className="md:col-span-7"><div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }} className="h-64 border-2 border-dashed border-muted rounded-xl flex flex-col items-center justify-center hover:bg-muted/10 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}><Upload className="h-10 w-10 text-muted-foreground mb-3" /><p className="text-sm font-bold opacity-60">点击或拖拽图片</p><p className="text-[10px] opacity-40 mt-1">支持 JPG, PNG, WEBP (建议 &lt; 1MB)</p><input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={e => handleFileUpload(e.target.files)} /></div></div>
                <div className="md:col-span-5 space-y-5"><div className="space-y-4"><div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">目标分类</Label><Select value={targetUploadCategoryId} onValueChange={setTargetUploadCategoryId}><SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="选择目标分类" /></SelectTrigger><SelectContent>{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.6}rem` }}>{cat.name}</span></SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">同名冲突处理</Label><Select value={duplicateStrategy} onValueChange={(v: DuplicateStrategy) => setDuplicateStrategy(v)}><SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rename" className="text-xs">自动重命名 (推荐)</SelectItem><SelectItem value="overwrite" className="text-xs text-orange-600 font-bold">覆盖现有文件</SelectItem></SelectContent></Select><p className="text-[9px] text-muted-foreground leading-relaxed mt-1">选择“覆盖”将同步更新全站引用该文件的图片内容。</p></div></div></div>
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
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20 mx-auto mb-3" /><p className="text-[10px] font-bold uppercase tracking-widest opacity-40">同步库中...</p></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className={cn("group relative bg-white rounded-xl border transition-all duration-300 overflow-hidden", selectedIds.has(asset.id) ? "border-primary ring-2 ring-primary/10 shadow-lg" : "border-border/40 hover:shadow-xl")}>
              <div className="absolute top-1.5 left-1.5 z-20"><Checkbox checked={selectedIds.has(asset.id)} onCheckedChange={() => toggleSelectAsset(asset.id)} className="rounded bg-white/40 backdrop-blur-md border-white/60" /></div>
              <div className="relative aspect-square bg-muted/10 overflow-hidden">
                <Image src={asset.url} alt={asset.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute bottom-1.5 left-1.5"><Badge className="text-[8px] bg-black/60 border-none px-1.5 h-4 max-w-[100px] truncate">{categoryTree.find(c => c.id === asset.categoryId)?.name || '未分类'}</Badge></div>
              </div>
              <div className="p-2.5 space-y-1.5 border-t">
                <p className="text-[10px] font-bold truncate text-primary">{asset.title}</p>
                <div className="flex items-center justify-between"><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(asset.url); toast({ title: "链接已复制" }); }}><Copy className="h-3 w-3" /></Button><div className="flex gap-0.5"><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingAsset(asset)}><Edit3 className="h-3 w-3" /></Button><Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/5" onClick={() => confirm('删除图片？') && deleteDocumentNonBlocking(doc(firestore, 'galleryAssets', asset.id))}><Trash2 className="h-3 w-3" /></Button></div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isTasksPanelOpen && (
        <div className={cn("fixed bottom-5 right-5 z-[200] w-72 bg-white border border-border shadow-2xl rounded-2xl overflow-hidden transition-all duration-300", isTasksPanelMinimized ? "h-12" : "h-80")}>
          <div className="bg-primary px-4 h-12 flex items-center justify-between text-white"><div className="flex items-center gap-2"><PanelTop className="h-3.5 w-3.5" /><span className="text-[10px] font-bold uppercase tracking-widest">任务管理器</span></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsTasksPanelMinimized(!isTasksPanelMinimized)}>{isTasksPanelMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}</Button><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setIsTasksPanelOpen(false); setUploadTasks([]); }}><X className="h-3 w-3" /></Button></div></div>
          {!isTasksPanelMinimized && (<div className="flex flex-col h-[calc(100%-48px)] p-4 space-y-4 overflow-y-auto">{uploadTasks.map(task => (<div key={task.id} className="space-y-1.5"><div className="flex justify-between text-[9px] font-bold"><span className="truncate max-w-[150px]">{task.fileName}</span>{task.status === 'completed' ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <span className="opacity-40 animate-pulse">{task.isUpdate ? '更新中' : '上传中'}</span>}</div><Progress value={task.progress} className={cn("h-1", task.isUpdate && "[&>div]:bg-orange-500")} /></div>))}</div>)}
        </div>
      )}

      <Dialog open={!!editingAsset} onOpenChange={o => !o && setEditingAsset(null)}>
        <DialogContent className="rounded-2xl max-w-sm p-6"><DialogHeader><DialogTitle className="text-base font-bold">编辑素材</DialogTitle></DialogHeader>
          {editingAsset && (<div className="space-y-4 py-4"><div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase opacity-60">标题</Label><Input value={editingAsset.title} onChange={e => setEditingAsset({...editingAsset, title: e.target.value})} className="rounded-lg h-10" /></div><div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase opacity-60">分类</Label><Select value={editingAsset.categoryId} onValueChange={v => setEditingAsset({...editingAsset, categoryId: v})}><SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger><SelectContent>{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.6}rem` }}>{cat.name}</span></SelectItem>))}</SelectContent></Select></div></div>)}
          <DialogFooter className="flex gap-2"><Button variant="outline" onClick={() => setEditingAsset(null)} className="rounded-lg h-10 flex-1">取消</Button><Button onClick={() => { if(firestore && editingAsset) { updateDocumentNonBlocking(doc(firestore, 'galleryAssets', editingAsset.id), editingAsset); setEditingAsset(null); toast({ title: "已保存" }); } }} className="rounded-lg h-10 flex-1">保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
