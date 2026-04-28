"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocalCollection } from '@/hooks/use-local-collection';
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
  X, 
  CheckCircle2, 
  PanelTop, 
  Minimize2, 
  Maximize2, 
  CloudUpload, 
  Check,
  Maximize,
  Download,
  Maximize2 as FitIcon,
  ZoomIn,
  Move,
  AlertTriangle,
  ChevronUp,
  ChevronDown
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingAsset, setEditingAsset] = useState<GalleryAsset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<GalleryAsset | null>(null);
  const [previewZoom, setPreviewZoom] = useState<'fit' | '1:1'>('fit');
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

  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filterCategory, searchQuery]);

  const { data: categories, mutate: mutateCats } = useLocalCollection<GalleryCategory>('galleryCategories');
  const { data: assets, isLoading, mutate: mutateAssets } = useLocalCollection<GalleryAsset>('galleryAssets');

  const getDisplayName = useCallback((cat?: GalleryCategory) => {
    if (!cat) return '未分类';
    return cat.name;
  }, []);

  const categoryTree = useMemo(() => {
    if (!categories) return [];
    const getFullPath = (cat: GalleryCategory): string => {
      const parent = categories.find(c => c.id === cat.parentId);
      const name = getDisplayName(cat);
      return parent ? `${getFullPath(parent)} > ${name}` : name;
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
  }, [categories, getDisplayName]);

  useEffect(() => {
    if (categoryTree.length > 0 && !targetUploadCategoryId) setTargetUploadCategoryId(categoryTree[0].id);
  }, [categoryTree, targetUploadCategoryId]);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(a => {
      const ms = a.title.toLowerCase().includes(searchQuery.toLowerCase());
      const mc = filterCategory === 'all' || a.categoryId === filterCategory;
      return ms && mc;
    });
  }, [assets, searchQuery, filterCategory]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('label') || target.closest('.group')) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionBox({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y
    });

    if (!e.shiftKey) {
      setSelectedIds(new Set());
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!selectionBox) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const nextX = e.clientX - rect.left;
    const nextY = e.clientY - rect.top;

    const nextBox = {
      ...selectionBox,
      currentX: nextX,
      currentY: nextY
    };
    setSelectionBox(nextBox);

    const boxX = Math.min(nextBox.startX, nextBox.currentX);
    const boxY = Math.min(nextBox.startY, nextBox.currentY);
    const boxWidth = Math.abs(nextBox.startX - nextBox.currentX);
    const boxHeight = Math.abs(nextBox.startY - nextBox.currentY);

    const newSelected = new Set(e.shiftKey ? selectedIds : []);
    
    filteredAssets.forEach(asset => {
      const el = itemRefs.current.get(asset.id);
      if (!el) return;
      
      const rect = el.getBoundingClientRect();
      const containerRect = e.currentTarget.getBoundingClientRect();
      
      const elRect = {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        right: rect.right - containerRect.left,
        bottom: rect.bottom - containerRect.top
      };

      const intersects = !(
        elRect.left > boxX + boxWidth ||
        elRect.right < boxX ||
        elRect.top > boxY + boxHeight ||
        elRect.bottom < boxY
      );

      if (intersects) newSelected.add(asset.id);
    });
    setSelectedIds(newSelected);
  }, [selectionBox, selectedIds, filteredAssets]);

  const handleMouseUp = useCallback(() => {
    setSelectionBox(null);
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
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
      status: 'uploading'
    }));
    
    setUploadTasks(prev => [...prev, ...newTasks]);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const taskId = newTasks[i].id;

      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");
        const { url, fileName } = await uploadRes.json();

        updateTask(taskId, { progress: 70 });

        const assetId = `asset_${Date.now()}_${i}`;
        const assetData = {
          id: assetId,
          url,
          title: file.name.split('.')[0],
          fileName: fileName,
          fileSize: file.size,
          categoryId: categoryId,
        };

        await fetch(`/api/galleryAssets/${assetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetData),
        });

         mutateAssets();
        updateTask(taskId, { status: 'completed', progress: 100 });
      } catch (e: any) {
        updateTask(taskId, { status: 'error', error: e.message });
      }
    }
  };

  const updateTask = (id: string, updates: Partial<UploadTask>) => {
    setUploadTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const toggleSelectAsset = (id: string) => {
    const newSelected = new Set(selectedIds);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`永久移除选中的 ${selectedIds.size} 项素材？`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => fetch(`/api/galleryAssets/${id}`, { method: 'DELETE' })));
      mutateAssets();
      setSelectedIds(new Set());
      toast({ title: `已删除 ${selectedIds.size} 项素材` });
    } catch (e) {
      toast({ variant: "destructive", title: "批量删除失败" });
    }
  };

  const handleBatchUpdateCategory = async () => {
    if (selectedIds.size === 0 || !batchTargetCategoryId) return;
    try {
      await Promise.all(Array.from(selectedIds).map(async id => {
        const asset = assets?.find(a => a.id === id);
        if (!asset) return;
        return fetch(`/api/galleryAssets/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...asset, categoryId: batchTargetCategoryId }),
        });
      }));
      mutateAssets();
      setSelectedIds(new Set());
      setIsBatchCategoryDialogOpen(false);
      toast({ title: `已移动 ${selectedIds.size} 项素材` });
    } catch (e) {
      toast({ variant: "destructive", title: "批量移动失败" });
    }
  };

  const resetCatForm = () => { 
    setEditingCatId(null); 
    setCatForm({ name: '', parentId: 'none' }); 
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除此分类吗？关联的素材将变为“未分类”。')) return;
    try {
      const res = await fetch(`/api/galleryCategories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      mutateCats();
      toast({ title: "分类已删除" });
    } catch (e) {
      toast({ variant: "destructive", title: "删除失败" });
    }
  };

  const handleMoveCategory = async (cat: GalleryCategory, direction: 'up' | 'down') => {
    if (!categories) return;
    const sameLevel = categories.filter(c => c.parentId === cat.parentId).sort((a, b) => a.order - b.order);
    const idx = sameLevel.findIndex(c => c.id === cat.id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sameLevel.length) return;

    const targetCat = sameLevel[targetIdx];
    try {
      await Promise.all([
        fetch(`/api/galleryCategories/${cat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...cat, order: targetCat.order })
        }),
        fetch(`/api/galleryCategories/${targetCat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...targetCat, order: cat.order })
        })
      ]);
      mutateCats();
    } catch (e) {
      toast({ variant: "destructive", title: "排序失败" });
    }
  };

  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return;
    const pId = catForm.parentId === 'none' ? null : catForm.parentId;
    const id = editingCatId || `cat_${Date.now()}`;
    
    try {
      await fetch(`/api/galleryCategories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: catForm.name,
          parentId: pId,
          order: editingCatId ? undefined : (categories?.length || 0) + 1
        }),
      });
      resetCatForm();
      mutateCats();
      toast({ title: "分类已保存" });
    } catch (e) {
      toast({ variant: "destructive", title: "分类保存失败" });
    }
  };

  return (
    <div 
      className="space-y-10 animate-in fade-in duration-700 relative min-h-[80vh] select-none pb-20" 
      onMouseUp={handleMouseUp} 
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      ref={containerRef}
    >
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] brightness-100 contrast-150" />
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-headline font-bold text-slate-900 flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <ImageIcon className="h-5 w-5" />
            </div>
            全球素材图库
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pl-14">Management / Digital Assets / Gallery</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isCategoryDialogOpen} onOpenChange={(o) => { setIsCategoryDialogOpen(o); if (!o) resetCatForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-2xl h-14 px-8 gap-3 text-xs font-bold uppercase tracking-widest border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white transition-all shadow-sm">
                <Settings2 className="h-4 w-4" /> 架构管理
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-2xl p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">
              <div className="p-10 space-y-8 bg-white/90 backdrop-blur-2xl">
                <DialogHeader className="space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Layers className="h-6 w-6" />
                  </div>
                  <DialogTitle className="text-2xl font-headline font-bold text-slate-900 tracking-tight">树状分类管理</DialogTitle>
                  <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Asset Hierarchy Configuration</DialogDescription>
                </DialogHeader>
                <div className={cn("space-y-6 p-8 rounded-[2rem] border transition-all duration-500", editingCatId ? "bg-primary/[0.02] border-primary/20" : "bg-slate-500/[0.03] border-slate-200")}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">分类名称</Label>
                      <Input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="rounded-xl h-12 bg-white border-slate-200 text-sm font-medium" placeholder="例如：产品外观" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">上级分类</Label>
                      <Select value={catForm.parentId} onValueChange={v => setCatForm({...catForm, parentId: v})}>
                        <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                          <SelectItem value="none" className="text-xs font-bold uppercase tracking-widest py-3">无 (顶级分类)</SelectItem>
                          {categoryTree.filter(c => c.id !== editingCatId).map(cat => (
                            <SelectItem key={cat.id} value={cat.id} className="text-xs py-3">
                              <span style={{ paddingLeft: `${cat.depth * 0.8}rem` }} className={cn(cat.depth > 0 && "opacity-60")}>{cat.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {editingCatId && (
                      <Button variant="outline" onClick={resetCatForm} className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs tracking-widest border-slate-200">
                        取消编辑
                      </Button>
                    )}
                    <Button onClick={handleSaveCategory} className="flex-[2] rounded-2xl h-14 font-bold uppercase text-xs tracking-widest shadow-xl shadow-primary/10">
                      {editingCatId ? '保存架构变更' : '确认添加分类'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em]">当前架构概览</Label>
                    <Badge variant="outline" className="text-[9px] border-slate-200 text-slate-400 rounded-full">{categories?.length || 0} 个分类</Badge>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                    {categoryTree.length === 0 ? (
                      <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                        <Layers className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">暂无分类架构 / Empty Hierarchy</p>
                      </div>
                    ) : (
                      categoryTree.map((cat, idx) => {
                        const sameLevel = categoryTree.filter(c => c.parentId === cat.parentId);
                        const isFirst = sameLevel[0]?.id === cat.id;
                        const isLast = sameLevel[sameLevel.length - 1]?.id === cat.id;
                        
                        return (
                          <div key={cat.id} className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 rounded-2xl transition-all duration-300 border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" disabled={isFirst} onClick={() => handleMoveCategory(cat, 'up')} className="h-6 w-6 rounded-lg hover:bg-primary/10 hover:text-primary disabled:opacity-10">
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" disabled={isLast} onClick={() => handleMoveCategory(cat, 'down')} className="h-6 w-6 rounded-lg hover:bg-primary/10 hover:text-primary disabled:opacity-10">
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <div style={{ width: `${cat.depth * 1.5}rem` }} className="h-px bg-slate-200 flex-shrink-0" />
                                  <span className={cn("text-sm font-bold tracking-tight", cat.depth === 0 ? "text-slate-900" : "text-slate-500")}>
                                    {cat.name}
                                  </span>
                                </div>
                                {cat.parentId && (
                                  <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest pl-[1.5rem]" style={{ marginLeft: `${cat.depth * 1.5}rem` }}>
                                    Sub-category of {categories?.find(c => c.id === cat.parentId)?.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <Button size="icon" variant="ghost" onClick={() => { setEditingCatId(cat.id); setCatForm({ name: cat.name, parentId: cat.parentId || 'none' }); }} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteCategory(cat.id)} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 px-8 font-bold uppercase tracking-widest gap-3 text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                <CloudUpload className="h-4 w-4" /> 批量上传
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-4xl p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">
              <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <CloudUpload className="h-32 w-32" />
                </div>
                <DialogHeader className="relative z-10 space-y-2">
                  <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <CloudUpload className="h-5 w-5" />
                    </div>
                    上传资产中心
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Asset Ingestion Hub</DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-10 grid grid-cols-1 md:grid-cols-12 gap-10 bg-white/90 backdrop-blur-2xl">
                <div className="md:col-span-7">
                  <div 
                    onDragOver={e => e.preventDefault()} 
                    onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }} 
                    className="h-80 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center hover:bg-primary/[0.02] hover:border-primary/40 transition-all cursor-pointer group" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                      <Upload className="h-7 w-7 text-slate-400 group-hover:text-primary" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">点击或拖拽图片至此处</p>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">DRAG & DROP MEDIA FILES</p>
                    <div className="mt-6 px-4 py-2 bg-destructive/5 rounded-full flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                      <span className="text-[9px] font-bold text-destructive uppercase">单个文件限制 700KB 以内</span>
                    </div>
                    <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={e => handleFileUpload(e.target.files)} />
                  </div>
                </div>
                <div className="md:col-span-5 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">上传目标分类</Label>
                      <Select value={targetUploadCategoryId} onValueChange={setTargetUploadCategoryId}>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-500/5 border-transparent text-sm font-medium">
                          <SelectValue placeholder="选择目标分类" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                          {categoryTree.map(cat => (
                            <SelectItem key={cat.id} value={cat.id} className="text-xs py-3">
                              <span style={{ paddingLeft: `${cat.depth * 0.6}rem` }}>{getDisplayName(cat)}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">重名冲突处理策略</Label>
                      <Select value={duplicateStrategy} onValueChange={(v: DuplicateStrategy) => setDuplicateStrategy(v)}>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-500/5 border-transparent text-sm font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                          <SelectItem value="rename" className="text-xs py-3 font-medium">自动重命名 (生成副本)</SelectItem>
                          <SelectItem value="overwrite" className="text-xs py-3 text-orange-600 font-bold">覆盖现有文件 (全站同步)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[9px] text-slate-400 leading-relaxed mt-4 italic font-medium">
                        重要提示：由于云端存储限制，系统会严格校验图片 Base64 体积。建议在上传前进行必要的压缩。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6 border-t border-slate-200">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} className="rounded-xl h-12 px-8 text-xs font-bold uppercase tracking-widest border-slate-200">完成并关闭</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="搜索素材标题 / SEARCH ASSETS..." 
            className="pl-12 border-none bg-slate-500/5 focus-visible:ring-0 rounded-[1.25rem] h-12 text-xs font-medium placeholder:text-slate-400 placeholder:font-bold placeholder:uppercase" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>
        <div className="h-12 flex items-center gap-3 px-5 bg-slate-500/5 rounded-[1.25rem] border border-transparent focus-within:border-primary/20 transition-all w-full md:w-64">
          <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="border-none bg-transparent h-full p-0 shadow-none focus:ring-0 text-xs font-bold uppercase tracking-widest text-slate-600">
              <SelectValue placeholder="全部分类" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
              <SelectItem value="all" className="text-[10px] font-bold uppercase py-3">全部分类 (ALL)</SelectItem>
              {categoryTree.map(cat => (
                <SelectItem key={cat.id} value={cat.id} className="text-[10px] font-bold uppercase py-3">
                  <span style={{ paddingLeft: `${cat.depth * 0.8}rem` }}>{getDisplayName(cat)}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center relative z-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20 mx-auto mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">正在同步云端媒体库 / Syncing Repository...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 relative z-10">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              ref={el => { if(el) itemRefs.current.set(asset.id, el); else itemRefs.current.delete(asset.id); }}
              className={cn(
                "group relative bg-white/60 backdrop-blur-md rounded-[2rem] border transition-all duration-500 overflow-hidden", 
                selectedIds.has(asset.id) 
                  ? "border-primary ring-4 ring-primary/10 shadow-[0_20px_40px_-15px_rgba(0,91,153,0.2)]" 
                  : "border-white/40 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:bg-white"
              )}
            >
              <div className="absolute top-4 left-4 z-20">
                <Checkbox 
                  checked={selectedIds.has(asset.id)} 
                  onCheckedChange={() => toggleSelectAsset(asset.id)} 
                  className={cn(
                    "h-5 w-5 rounded-lg bg-white/80 backdrop-blur-md border-slate-200 shadow-sm transition-all duration-300", 
                    selectedIds.has(asset.id) ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100"
                  )} 
                />
              </div>
              
              <div className="relative aspect-square bg-slate-500/5 overflow-hidden flex items-center justify-center m-2 rounded-[1.5rem]">
                <Image 
                  src={asset.url} 
                  alt={asset.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
                  unoptimized 
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-11 w-11 rounded-2xl shadow-2xl bg-white hover:bg-primary hover:text-white transition-all scale-75 group-hover:scale-100 duration-500" 
                    onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset); setPreviewZoom('fit'); }}
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
                <div className="absolute bottom-3 left-3 pointer-events-none">
                  <Badge className="text-[8px] bg-black/40 backdrop-blur-md border-none px-2.5 py-0.5 h-5 font-bold uppercase tracking-widest text-white/90">
                    {getDisplayName(categories?.find(c => c.id === asset.categoryId))}
                  </Badge>
                </div>
              </div>
 
              <div className="p-4 pt-1 space-y-3">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-slate-900 truncate tracking-tight">{asset.title}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    {( (asset.fileSize || 0) / 1024).toFixed(0)}KB • {asset.fileName.split('.').pop()?.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5" 
                      onClick={() => { navigator.clipboard.writeText(asset.url); toast({ title: "链接已复制" }); }} 
                      title="复制地址"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5" 
                      onClick={() => setEditingAsset(asset)} 
                      title="编辑属性"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/5" 
                      onClick={async () => {
                        if (confirm('永久移除该图片？')) {
                          try {
                            await fetch(`/api/galleryAssets/${asset.id}`, { method: 'DELETE' });
                            mutateAssets();
                            toast({ title: "素材已删除" });
                          } catch (e) {
                            toast({ variant: "destructive", title: "删除失败" });
                          }
                        }
                      }} 
                      title="删除素材"
                    >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {selectionBox && (
        <div 
          className="absolute z-[300] bg-primary/20 border border-primary pointer-events-none !m-0"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.startX - selectionBox.currentX),
            height: Math.abs(selectionBox.startY - selectionBox.currentY)
          }}
        />
      )}

      {selectedIds.size > 0 && (
        <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[200] bg-white border border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-full px-5 py-2 flex items-center gap-5 animate-in slide-in-from-top-4 duration-300">
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
                <DialogHeader>
                  <DialogTitle className="text-base font-bold">批量移动至分类</DialogTitle>
                  <DialogDescription>将选中的素材移动到指定的架构分类下。</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                  <Label className="text-[10px] font-bold uppercase opacity-60">目标分类</Label>
                  <Select value={batchTargetCategoryId} onValueChange={setBatchTargetCategoryId}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="请选择..." /></SelectTrigger>
                    <SelectContent className="rounded-xl">{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id}><span style={{ paddingLeft: `${cat.depth * 0.8}rem` }} className={cn("text-xs", cat.depth > 0 && "text-muted-foreground")}>{getDisplayName(cat)}</span></SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsBatchCategoryDialogOpen(false)} className="rounded-xl h-10 flex-1 text-xs">取消</Button>
                  <Button onClick={handleBatchUpdateCategory} disabled={!batchTargetCategoryId} className="rounded-xl h-10 flex-1 text-xs">确认移动</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm" className="rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-wider" onClick={handleBatchDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> 批量删除
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted" onClick={() => setSelectedIds(new Set())}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isTasksPanelOpen && (
        <div className={cn("fixed bottom-6 right-6 z-[400] w-80 bg-white border border-border/60 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500", isTasksPanelMinimized ? "h-14" : "h-[400px]")}>
          <div className="bg-primary px-5 h-14 flex items-center justify-between text-white"><div className="flex items-center gap-3"><PanelTop className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.2em]">任务队列</span></div><div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setIsTasksPanelMinimized(!isTasksPanelMinimized)}>{isTasksPanelMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}</Button><Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => { setIsTasksPanelOpen(false); setUploadTasks([]); }}><X className="h-4 w-4" /></Button></div></div>
          {!isTasksPanelMinimized && (<div className="flex flex-col h-[calc(400px-56px)] p-5 space-y-5 overflow-y-auto bg-white/50 backdrop-blur-sm">{uploadTasks.map(task => (<div key={task.id} className="space-y-2"><div className="flex justify-between text-[10px] font-bold"><span className="truncate max-w-[180px]">{task.fileName}</span>{task.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : task.status === 'error' ? <span className="text-destructive font-mono">{task.error}</span> : <span className="opacity-40 animate-pulse">{task.isUpdate ? '同步更新中' : '上传入库中'}</span>}</div><Progress value={task.progress} className={cn("h-1.5 rounded-full bg-muted/40", task.isUpdate ? "[&>div]:bg-orange-500" : "[&>div]:bg-primary")} /></div>))}</div>)}
        </div>
      )}

      <Dialog open={!!editingAsset} onOpenChange={o => !o && setEditingAsset(null)}>
        <DialogContent className="rounded-2xl max-w-sm p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-muted/10 border-b border-border/40">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-primary">编辑素材属性</DialogTitle>
            <DialogDescription>修改素材的显示标题或归属分类。</DialogDescription>
          </DialogHeader>
          {editingAsset && (<div className="p-6 space-y-5 bg-white"><div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">素材标题</Label><Input value={editingAsset.title} onChange={e => setEditingAsset({...editingAsset, title: e.target.value})} className="rounded-xl h-11" /></div><div className="space-y-2"><Label className="text-[10px] font-bold uppercase opacity-60">归属分类</Label><Select value={editingAsset.categoryId} onValueChange={v => setEditingAsset({...editingAsset, categoryId: v})}><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">{categoryTree.map(cat => (<SelectItem key={cat.id} value={cat.id} className="text-xs"><span style={{ paddingLeft: `${cat.depth * 0.6}rem` }}>{getDisplayName(cat)}</span></SelectItem>))}</SelectContent></Select></div></div>)}
          <DialogFooter className="p-6 bg-muted/5 flex gap-2 border-t border-border/40">
            <Button variant="outline" onClick={() => setEditingAsset(null)} className="rounded-xl h-11 flex-1 text-xs">放弃修改</Button>
            <Button onClick={async () => {
              if (editingAsset) {
                try {
                  await fetch(`/api/galleryAssets/${editingAsset.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editingAsset),
                  });
                  mutateAssets();
                  setEditingAsset(null);
                  toast({ title: "属性已保存" });
                } catch (e) {
                  toast({ variant: "destructive", title: "保存失败" });
                }
              }
            }} className="rounded-xl h-11 flex-1 text-xs">保存变更</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewAsset} onOpenChange={o => !o && setPreviewAsset(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden bg-black/95 border-none shadow-2xl rounded-2xl flex flex-col z-[500]">
          <DialogHeader className="sr-only">
            <DialogTitle>图片预览: {previewAsset?.title}</DialogTitle>
            <DialogDescription>查看全屏高清素材详情。</DialogDescription>
          </DialogHeader>
          
          <div className="absolute top-4 right-4 z-50 flex gap-2">
             <div className="flex bg-white/10 backdrop-blur-md rounded-full border border-white/10 overflow-hidden p-1 mr-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPreviewZoom('fit')}
                  className={cn("h-8 rounded-full px-3 gap-2 text-[10px] font-bold uppercase transition-all", previewZoom === 'fit' ? "bg-white text-black" : "text-white hover:bg-white/10")}
                >
                  <FitIcon className="h-3 w-3" /> 适合窗口
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPreviewZoom('1:1')}
                  className={cn("h-8 rounded-full px-3 gap-2 text-[10px] font-bold uppercase transition-all", previewZoom === '1:1' ? "bg-white text-black" : "text-white hover:bg-white/10")}
                >
                  <ZoomIn className="h-3 w-3" /> 1:1 像素
                </Button>
             </div>
             
             <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-white/10" onClick={() => { window.open(previewAsset?.url, '_blank'); }} title="下载原图">
                <Download className="h-4 w-4" />
             </Button>
             <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-white/10" onClick={() => setPreviewAsset(null)}>
                <X className="h-4 w-4" />
             </Button>
          </div>

          <div className={cn("relative flex-1 overflow-auto flex items-center justify-center p-4", previewZoom === '1:1' ? "cursor-move" : "p-12")}>
            {previewAsset && (
              <div className={cn("relative transition-all duration-500", previewZoom === '1:1' ? "w-auto h-auto" : "w-full h-full flex items-center justify-center")}>
                <img 
                  src={previewAsset.url} 
                  alt={previewAsset.title} 
                  className={cn(
                    "shadow-2xl rounded-sm transition-all duration-300", 
                    previewZoom === 'fit' ? "max-w-full max-h-full object-contain" : "max-w-none w-auto h-auto"
                  )}
                />
              </div>
            )}
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-5 border-t border-white/10 flex items-center justify-between text-white shrink-0">
            <div className="space-y-1">
              <h4 className="font-bold text-sm">{previewAsset?.title}</h4>
              <p className="text-[10px] opacity-60 uppercase tracking-widest">{previewAsset?.fileName} • {( (previewAsset?.fileSize || 0) / 1024).toFixed(1)} KB</p>
            </div>
            <div className="flex gap-3">
              {previewZoom === '1:1' && <span className="flex items-center gap-2 text-[10px] font-bold text-accent animate-pulse uppercase tracking-widest"><Move className="h-3 w-3" /> 拖动或滚动以查看细节</span>}
              <Button variant="outline" size="sm" className="rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 text-[10px] uppercase font-bold px-5" onClick={() => { navigator.clipboard.writeText(previewAsset?.url || ''); toast({ title: "链接已复制" }); }}>复制图片地址</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}