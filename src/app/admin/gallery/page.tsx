
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
  Loader2, 
  Upload, 
  Settings2, 
  Edit3, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  X, 
  CheckCircle2, 
  PanelTop, 
  Minimize2, 
  Maximize2, 
  CloudUpload, 
  Check,
  Maximize,
  Download,
  MoreVertical
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingAsset, setEditingAsset] = useState<GalleryAsset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<GalleryAsset | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ name: '', parentId: 'none' });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchCategoryDialogOpen, setIsBatchCategoryDialogOpen] = useState(false);
  const [batchTargetCategoryId, setBatchTargetCategoryId] = useState<string>('');

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
      if (file.size > 2 * 1024 * 1024) { updateTask(taskId, { status: 'error', error: '超过 2MB' }); return; }

      const reader = new FileReader();
      reader.onload = (e) => {
        updateTask(taskId, { status: 'uploading', progress: 50 });
        const base64 = e.target?.result as string;
        
        const existingAsset = assets?.find(a => a.fileName === file.name);
        let finalAssetId = `asset_${Date.now()}_${index}`;
        let finalTitle = file.name.split('.')[0];
        let isUpdate = false;

        if (existingAsset) {
          if (duplicateStrategy === 'overwrite') {
            finalAssetId = existingAsset.id;
            finalTitle = existingAsset.title;
            isUpdate = true;
          } else {
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
      {/* 批量管理悬浮条 - 恢复并优化层级 */}
      {selectedIds.size > 0 && (
        <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[200] bg-white border border-primary/20 shadow-2xl rounded-full px-5 py-2 flex items-center gap-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <Checkbox 
              checked={selectedIds.size === filteredAssets.length} 
              onCheckedChange={(v) => v ? setSelectedIds(new Set(filteredAssets.map(a => a.id))) : setSelectedIds(new Set())} 
              className="rounded" 
            />
            <span className="text-xs font-bold text-primary whitespace-nowrap">已选中 {selectedIds.size} 项</span>
          </div>
          <div className="h-6 w-px bg-border/60" />
          <div className="flex items-center gap-2">
            <Dialog open={isBatchCategoryDialogOpen} onOpenChange={setIsBatchCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full h-8 px-4 gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <Layers className="h-3 w-3" /> 修改分类
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl max-w-sm">
                <DialogHeader><DialogTitle className="text-base font-bold">批量移动至分类</DialogTitle></DialogHeader>
                <div className="py-4 space-y-3">
                  <Label className="text-[10px] font-bold uppercase opacity-60">目标分类</Label>
                  <Select value={batchTargetCategoryId} onValueChange={setBatchTargetCategoryId}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="请选择..." /></SelectTrigger>
                    <SelectContent className="rounded-xl">{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id}><span style={{ paddingLeft: `${cat.depth * 0.8}rem` }} className={cn("text-xs", cat.depth > 0 && "text-muted-foreground")}>{cat.name}</span></SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsBatchCategoryDialogOpen(false)} className="rounded-xl h-10 flex-1 text-xs">取消</Button>
                  <Button onClick={handleBatchUpdateCategory} disabled={!batchTargetCategoryId} className="rounded-xl h-10 flex-1 text-xs">确认移动</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm" className="rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-wider" onClick={handleBatchDelete}>
              <Trash2 className="h-3 w-3 mr-1.5" /> 批量删除
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted" onClick={() => setSelectedIds(new Set())}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2"><ImageIcon className="h-5 w-5" /> 全球素材图库</h2>
          <p className="text-xs text-muted-foreground">多级分类管理、同名冲突校验及高效批量处理。</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={(o) => { setIsCategoryDialogOpen(o); if (!o) resetCatForm(); }}>
            <DialogTrigger asChild><Button variant="outline" className="rounded-xl h-10 gap-2 text-xs font-bold uppercase tracking-wider shadow-sm"><Settings2 className="h-4 w-4" /> 架构设置</Button></DialogTrigger>
            <DialogContent className="rounded-2xl max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="p-6 space-y-6">
                <DialogHeader><DialogTitle className="text-lg font-bold flex items-center gap-2 text-primary"><Layers className="h-5 w-5" /> 树状分类管理</DialogTitle></DialogHeader>
                <div className={cn("space-y-4 p-5 rounded-2xl border", editingCatId ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/40")}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">分类名称</Label><Input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="rounded-xl h-10 bg-white" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">上级分类</Label><Select value={catForm.parentId} onValueChange={v => setCatForm({...catForm, parentId: v})}><SelectTrigger className="h-10 rounded-xl bg-white"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="none">无 (顶级分类)</SelectItem>{categoryTree.filter(c => c.id !== editingCatId).map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.8}rem` }}>{cat.name}</span></SelectItem>))}</SelectContent></Select></div>
                  </div>
                  <Button onClick={handleSaveCategory} className="w-full rounded-xl h-10 font-bold uppercase text-xs tracking-widest">{editingCatId ? '保存架构变更' : '确认添加分类'}</Button>
                </div>
                <div className="max-h-[35vh] overflow-y-auto rounded-2xl border border-border/40 bg-white overflow-hidden shadow-inner"><Table><TableHeader className="bg-muted/50 sticky top-0"><TableRow><TableHead className="pl-6 h-10 text-[10px] font-bold uppercase tracking-widest">组织结构</TableHead><TableHead className="w-32 text-right pr-6 h-10 text-[10px] font-bold uppercase tracking-widest">操作</TableHead></TableRow></TableHeader><TableBody>{visibleCategories.map(cat => (<TableRow key={cat.id} className={cn(editingCatId === cat.id && "bg-primary/5")}><TableCell className="pl-6 py-2"><div className="flex items-center gap-1" style={{ paddingLeft: `${cat.depth * 1.5}rem` }}>{cat.hasChildren ? (<Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleCollapse(cat.id)}>{collapsedIds.has(cat.id) ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</Button>) : <div className="w-6 h-6" />}<span className={cn("text-xs", !cat.parentId ? "font-bold text-primary" : "text-muted-foreground")}>{cat.name}</span></div></TableCell><TableCell className="pr-6 text-right"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => setEditingCatId(cat.id) || setCatForm({ name: cat.name, parentId: cat.parentId || 'none' })}><Edit3 className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/5" onClick={() => confirm('确定删除该分类及其所有子分类映射吗？') && deleteDocumentNonBlocking(doc(firestore, 'galleryCategories', cat.id))}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell></TableRow>))}</TableBody></Table></div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild><Button className="rounded-xl h-10 px-5 font-bold uppercase tracking-widest gap-2 text-xs shadow-md"><CloudUpload className="h-4 w-4" /> 批量上传</Button></DialogTrigger>
            <DialogContent className="rounded-2xl max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-primary p-6 text-white"><DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3"><CloudUpload className="h-6 w-6" /> 上传资产中心</DialogTitle></DialogHeader></div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 bg-white">
                <div className="md:col-span-7"><div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }} className="h-64 border-2 border-dashed border-muted rounded-2xl flex flex-col items-center justify-center hover:bg-muted/10 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}><Upload className="h-12 w-12 text-muted-foreground/40 mb-3 group-hover:text-primary transition-colors" /><p className="text-sm font-bold opacity-60">点击或拖拽图片至此处</p><p className="text-[10px] opacity-40 mt-1 uppercase tracking-widest">支持 JPG, PNG, WEBP (MAX 2MB)</p><input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={e => handleFileUpload(e.target.files)} /></div></div>
                <div className="md:col-span-5 space-y-6"><div className="space-y-5"><div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">上传目标分类</Label><Select value={targetUploadCategoryId} onValueChange={setTargetUploadCategoryId}><SelectTrigger className="h-11 rounded-xl bg-muted/20 border-transparent"><SelectValue placeholder="选择目标分类" /></SelectTrigger><SelectContent className="rounded-xl">{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.6}rem` }}>{cat.name}</span></SelectItem>))}</SelectContent></Select></div><div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">重名冲突处理策略</Label><Select value={duplicateStrategy} onValueChange={(v: DuplicateStrategy) => setDuplicateStrategy(v)}><SelectTrigger className="h-11 rounded-xl bg-muted/20 border-transparent"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="rename" className="text-xs">自动重命名 (生成副本)</SelectItem><SelectItem value="overwrite" className="text-xs text-orange-600 font-bold">覆盖现有文件 (全站同步更新)</SelectItem></SelectContent></Select><p className="text-[9px] text-muted-foreground leading-relaxed mt-2 italic">提示：选择“覆盖”将直接替换所有引用该文件名的前端展示内容。</p></div></div></div>
              </div>
              <DialogFooter className="bg-muted/10 p-4"><Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} className="rounded-xl h-10 px-8 text-xs font-bold uppercase tracking-widest">关闭上传器</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1 w-full"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="按标题搜索云端素材..." className="pl-10 border-none bg-muted/30 h-10 text-xs rounded-xl focus-visible:ring-0" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
        <Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger className="w-full md:w-56 rounded-xl h-10 text-xs border-none bg-muted/30"><SelectValue placeholder="全部分类" /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="all" className="text-xs">全部分类</SelectItem>{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.8}rem` }}>{cat.name}</span></SelectItem>))}</SelectContent></Select>
      </div>

      {isLoading ? (
        <div className="py-24 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-10 mx-auto mb-3" /><p className="text-[10px] font-bold uppercase tracking-widest opacity-40">正在同步云端媒体库...</p></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className={cn("group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden", selectedIds.has(asset.id) ? "border-primary ring-2 ring-primary/10 shadow-xl" : "border-border/40 hover:shadow-2xl")}>
              <div className="absolute top-2 left-2 z-20 transition-opacity"><Checkbox checked={selectedIds.has(asset.id)} onCheckedChange={() => toggleSelectAsset(asset.id)} className={cn("rounded-md bg-white/60 backdrop-blur-md border-white/60 shadow-sm", selectedIds.has(asset.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100")} /></div>
              
              {/* 图片预览区域 */}
              <div className="relative aspect-square bg-muted/10 overflow-hidden flex items-center justify-center">
                <Image src={asset.url} alt={asset.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                
                {/* 悬浮预览按钮 - 恢复大图功能 */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-2xl" onClick={() => setPreviewAsset(asset)}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>

                <div className="absolute bottom-2 left-2 pointer-events-none"><Badge className="text-[8px] bg-black/50 border-none px-2 h-4 max-w-[100px] truncate">{categoryTree.find(c => c.id === asset.categoryId)?.name || '未分类'}</Badge></div>
              </div>

              <div className="p-3 space-y-2 border-t border-border/40">
                <p className="text-[10px] font-bold truncate text-primary/80">{asset.title}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => { navigator.clipboard.writeText(asset.url); toast({ title: "链接已复制" }); }} title="复制地址"><Copy className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setEditingAsset(asset)} title="编辑属性"><Edit3 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive/40 hover:text-destructive hover:bg-destructive/5" onClick={() => confirm('永久移除该图片？') && deleteDocumentNonBlocking(doc(firestore, 'galleryAssets', asset.id))} title="删除素材"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
          {filteredAssets.length === 0 && (
            <div className="col-span-full py-32 border-2 border-dashed rounded-3xl text-center opacity-30 italic text-sm">在该分类下暂无素材记录</div>
          )}
        </div>
      )}

      {/* 任务管理器面板 */}
      {isTasksPanelOpen && (
        <div className={cn("fixed bottom-6 right-6 z-[200] w-80 bg-white border border-border/60 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500", isTasksPanelMinimized ? "h-14" : "h-[400px]")}>
          <div className="bg-primary px-5 h-14 flex items-center justify-between text-white"><div className="flex items-center gap-3"><PanelTop className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">任务队列</span></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setIsTasksPanelMinimized(!isTasksPanelMinimized)}>{isTasksPanelMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}</Button><Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => { setIsTasksPanelOpen(false); setUploadTasks([]); }}><X className="h-4 w-4" /></Button></div></div>
          {!isTasksPanelMinimized && (<div className="flex flex-col h-[calc(400px-56px)] p-5 space-y-5 overflow-y-auto bg-white/50 backdrop-blur-sm">{uploadTasks.map(task => (<div key={task.id} className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span className="truncate max-w-[180px]">{task.fileName}</span>{task.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : task.status === 'error' ? <span className="text-destructive font-mono">{task.error}</span> : <span className="opacity-40 animate-pulse">{task.isUpdate ? '同步更新中' : '上传入库中'}</span>}</div><Progress value={task.progress} className={cn("h-1.5 rounded-full bg-muted/40", task.isUpdate ? "[&>div]:bg-orange-500" : "[&>div]:bg-primary")} /></div>))}</div>)}
        </div>
      )}

      {/* 资源编辑弹窗 */}
      <Dialog open={!!editingAsset} onOpenChange={o => !o && setEditingAsset(null)}>
        <DialogContent className="rounded-2xl max-w-sm p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-muted/10 p-6 border-b border-border/40"><DialogHeader><DialogTitle className="text-lg font-bold flex items-center gap-2 text-primary">编辑素材属性</DialogTitle></DialogHeader></div>
          {editingAsset && (<div className="p-6 space-y-5 bg-white"><div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">素材标题</Label><Input value={editingAsset.title} onChange={e => setEditingAsset({...editingAsset, title: e.target.value})} className="rounded-xl h-11" /></div><div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">归属分类</Label><Select value={editingAsset.categoryId} onValueChange={v => setEditingAsset({...editingAsset, categoryId: v})}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.6}rem` }}>{cat.name}</span></SelectItem>))}</SelectContent></Select></div></div>)}
          <DialogFooter className="p-6 bg-muted/5 flex gap-2 border-t border-border/40"><Button variant="outline" onClick={() => setEditingAsset(null)} className="rounded-xl h-11 flex-1 text-xs">放弃修改</Button><Button onClick={() => { if(firestore && editingAsset) { updateDocumentNonBlocking(doc(firestore, 'galleryAssets', editingAsset.id), editingAsset); setEditingAsset(null); toast({ title: "属性已同步至云端" }); } }} className="rounded-xl h-11 flex-1 text-xs">保存变更</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 大图预览弹窗 - 恢复功能 */}
      <Dialog open={!!previewAsset} onOpenChange={o => !o && setPreviewAsset(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-4xl p-0 overflow-hidden bg-black/95 border-none shadow-2xl rounded-2xl flex flex-col">
          <div className="absolute top-4 right-4 z-50 flex gap-2">
             <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-white/10" onClick={() => { window.open(previewAsset?.url, '_blank'); }}>
                <Download className="h-4 w-4" />
             </Button>
             <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-white/10" onClick={() => setPreviewAsset(null)}>
                <X className="h-4 w-4" />
             </Button>
          </div>
          <div className="relative flex-1 min-h-[60vh] flex items-center justify-center p-8">
            {previewAsset && (
              <Image 
                src={previewAsset.url} 
                alt={previewAsset.title} 
                width={1200} 
                height={800} 
                className="object-contain max-h-[80vh] w-auto shadow-2xl rounded-lg"
              />
            )}
          </div>
          <div className="bg-white/10 backdrop-blur-md p-5 border-t border-white/10 flex items-center justify-between text-white">
            <div className="space-y-1">
              <h4 className="font-bold text-sm">{previewAsset?.title}</h4>
              <p className="text-[10px] opacity-60 uppercase tracking-widest">{previewAsset?.fileName} • {( (previewAsset?.fileSize || 0) / 1024).toFixed(1)} KB</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 text-[10px] uppercase font-bold" onClick={() => { navigator.clipboard.writeText(previewAsset?.url || ''); toast({ title: "链接已复制" }); }}>复制地址</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
