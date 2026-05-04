"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Play
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CascaderSelect } from '@/components/ui/cascader-select';

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
  type: 'IMAGE' | 'VIDEO';
  thumbnailUrl?: string;
  duration?: number;
  categoryId: string;
  fileName: string;
  fileSize?: number;
  width?: number;
  height?: number;
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

// 提取出独立的、记忆化的菜单组件，确保递归渲染时的标识稳定，防止闪烁
const CategoryMenu = React.memo(({
  categories,
  onSelect,
  getDisplayName
}: {
  categories: GalleryCategory[];
  onSelect: (id: string) => void;
  getDisplayName: (cat?: GalleryCategory) => string;
}) => {
  // 递归生成带缩进的平铺列表
  const renderFlatItems = (parentId: string | null = null, depth = 0): React.ReactNode[] => {
    const levelCats = categories.filter(c => {
      return (parentId === null)
        ? !categories.some(other => other.id === c.parentId)
        : c.parentId === parentId;
    });

    return levelCats.flatMap(cat => {
      const children = categories.filter(c => c.parentId === cat.id);
      const indent = depth > 0 ? '　'.repeat(depth) + '└ ' : '';
      
      return [
        <DropdownMenuItem
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer",
            depth === 0 ? "text-slate-900" : "text-slate-500",
            "hover:bg-primary/5 focus:bg-primary/5 focus:text-primary"
          )}
        >
          <span className="truncate">
            <span className="opacity-30 mr-1">{indent}</span>
            {getDisplayName(cat)}
          </span>
        </DropdownMenuItem>,
        ...renderFlatItems(cat.id, depth + 1)
      ];
    });
  };

  return <>{renderFlatItems()}</>;
});

CategoryMenu.displayName = 'CategoryMenu';

// 辅助组件：用于在列表卡片中实时显示分辨率
const AssetResolution = ({ id, initialW, initialH }: { id: string, initialW?: number, initialH?: number }) => {
  const [dim, setDim] = useState<{ w?: number, h?: number }>({ w: initialW, h: initialH });

  useEffect(() => {
    if (initialW && initialH) return;
    const handler = (e: any) => {
      if (e.detail.id === id) {
        setDim({ w: e.detail.w, h: e.detail.h });
      }
    };
    window.addEventListener('asset-loaded', handler);
    return () => window.removeEventListener('asset-loaded', handler);
  }, [id, initialW, initialH]);

  if (!dim.w || !dim.h) return null;
  return (
    <>
      <span>•</span>
      <span className="text-primary/70">{dim.w}×{dim.h}</span>
    </>
  );
};

export default function GalleryPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 通用安全复制函数
  const handleCopy = useCallback((text: string) => {
    if (!text) return;
    
    const fallbackCopy = (content: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast({ title: "链接已复制", description: "已成功复制到剪贴板" });
      } catch (err) {
        toast({ title: "复制失败", variant: "destructive" });
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => toast({ title: "链接已复制", description: "已成功复制到剪贴板" }))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }, [toast]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingAsset, setEditingAsset] = useState<GalleryAsset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<GalleryAsset | null>(null);
  const [previewZoom, setPreviewZoom] = useState<'fit' | '1:1'>('fit');
  const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number } | null>(null);
  const previewScrollContainerRef = useRef<HTMLDivElement>(null);

  // 预览拖拽查看细节
  const handlePreviewMouseDown = (e: React.MouseEvent) => {
    if (previewZoom !== '1:1' || !previewScrollContainerRef.current) return;
    
    const container = previewScrollContainerRef.current;
    const startX = e.pageX - container.offsetLeft;
    const startY = e.pageY - container.offsetTop;
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.pageX - container.offsetLeft;
      const y = e.pageY - container.offsetTop;
      const walkX = (x - startX) * 1.5;
      const walkY = (y - startY) * 1.5;
      container.scrollLeft = scrollLeft - walkX;
      container.scrollTop = scrollTop - walkY;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
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

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 18;

  useEffect(() => {
    setSelectedIds(new Set());
    setCurrentPage(1); // 筛选条件改变时重置页码
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

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssets.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAssets, currentPage]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 如果点击的是交互元素，或者是弹窗/下拉菜单内部，则不触发框选
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('label') ||
      target.closest('[role="combobox"]') ||
      target.closest('[role="listbox"]') ||
      target.closest('[role="dialog"]') ||
      target.closest('[role="menu"]') ||
      target.closest('[role="menuitem"]') ||
      target.closest('[data-radix-popper-content-wrapper]') ||
      target.closest('.group')
    ) return;

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

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);

    // 校验文件大小
    const oversized = fileArray.filter(f => {
      const isVideo = f.type.startsWith('video/');
      const limit = isVideo ? 20 * 1024 * 1024 : 700 * 1024; // 视频 20MB, 图片 700KB
      return f.size > limit;
    });
    
    if (oversized.length > 0) {
      toast({
        variant: "destructive",
        title: "文件过大",
        description: `${oversized.length} 个文件超过了限制（图片 700KB / 视频 20MB）。`
      });
      return;
    }

    setPendingFiles(prev => [...prev, ...fileArray]);
  };

  const startUpload = async () => {
    if (pendingFiles.length === 0) return;
    if (!categories || categories.length === 0) {
      toast({ variant: "destructive", title: "操作受阻", description: "请先添加至少一个分类。" });
      return;
    }

    setIsUploading(true);
    const categoryId = targetUploadCategoryId || categoryTree[0]?.id;
    setIsTasksPanelOpen(true);
    setIsTasksPanelMinimized(false);

    const currentFiles = [...pendingFiles];
    setPendingFiles([]); // 清空待上传列表

    const newTasks: UploadTask[] = currentFiles.map((file, i) => ({
      id: `task_${Date.now()}_${i}`,
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));

    setUploadTasks(prev => [...prev, ...newTasks]);

    // 开始上传后立即关闭对话框，让用户看到背景的任务进度
    setIsUploadDialogOpen(false);

    for (let i = 0; i < currentFiles.length; i++) {
      const file = currentFiles[i];
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

        const isVideo = file.type.startsWith('video/');
        let w = 0;
        let h = 0;
        let duration = 0;

        if (!isVideo) {
          // 在保存到数据库前获取图片分辨率
          const getImageDimensions = (url: string): Promise<{ w: number, h: number }> => {
            return new Promise((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
              img.onerror = () => resolve({ w: 0, h: 0 });
              img.src = url;
            });
          };
          const dims = await getImageDimensions(url);
          w = dims.w;
          h = dims.h;
        } else {
          // 获取视频元数据
          const getVideoMetadata = (url: string): Promise<{ w: number, h: number, d: number }> => {
            return new Promise((resolve) => {
              const video = document.createElement('video');
              video.preload = 'metadata';
              video.onloadedmetadata = () => {
                resolve({ w: video.videoWidth, h: video.videoHeight, d: video.duration });
              };
              video.onerror = () => resolve({ w: 0, h: 0, d: 0 });
              video.src = url;
            });
          };
          const meta = await getVideoMetadata(url);
          w = meta.w;
          h = meta.h;
          duration = meta.d;
        }
        
        updateTask(taskId, { progress: 70 });

        const categoryId = targetUploadCategoryId || categoryTree[0]?.id;
        
        if (!categoryId) {
          throw new Error("请先选择一个素材分类再上传。");
        }

        // 使用更安全的 ID 生成方式
        const randomString = Math.random().toString(36).substring(2, 7);
        const assetId = `asset_${Date.now()}_${randomString}_${i}`;
        
        const assetData = {
          id: assetId,
          url,
          type: isVideo ? 'VIDEO' : 'IMAGE',
          duration: isVideo ? duration : undefined,
          title: file.name.split('.')[0],
          fileName: fileName,
          fileSize: file.size,
          categoryId: categoryId,
          width: w,
          height: h
        };

        console.log('[Gallery] Saving asset record:', assetData);

        const saveRes = await fetch(`/api/galleryAssets/${assetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetData),
        });

        if (!saveRes.ok) {
          const errorData = await saveRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to save asset record");
        }

        updateTask(taskId, { status: 'completed', progress: 100 });
      } catch (e: any) {
        console.error('Upload task error:', e);
        updateTask(taskId, { status: 'error', error: e.message });
        toast({ 
          variant: "destructive", 
          title: "上传中断", 
          description: `${file.name}: ${e.message}` 
        });
      }
    }

    // 整个队列完成后统一刷新数据
    mutateAssets();
    setIsUploading(false);
  };

  const updateTask = (id: string, updates: Partial<UploadTask>) => {
    setUploadTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeepCleanup = async () => {
    if (!confirm("此操作将清理无效资产（数据库中未记录但存在于存储桶中的文件），确定执行？")) return;
    setIsCleaning(true);
    try {
      const res = await fetch('/api/admin/gallery/cleanup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "清理失败");
      mutateAssets();
      toast({ title: "存储库清理完成", description: data.message });
    } catch (e: any) {
      toast({ variant: "destructive", title: "清理失败", description: e.message });
    } finally {
      setIsCleaning(false);
    }
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
    const oldOrder = cat.order;
    const newOrder = targetCat.order;

    try {
      // 如果 order 相同，手动偏移以产生差异
      const finalOrder = oldOrder === newOrder ? (direction === 'up' ? newOrder - 1 : newOrder + 1) : newOrder;

      const res1 = await fetch(`/api/galleryCategories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.id,
          name: cat.name,
          parentId: cat.parentId,
          order: finalOrder
        })
      });
      const res2 = await fetch(`/api/galleryCategories/${targetCat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetCat.id,
          name: targetCat.name,
          parentId: targetCat.parentId,
          order: oldOrder
        })
      });

      if (!res1.ok || !res2.ok) throw new Error('同步数据库失败');

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
          order: editingCatId ? undefined : (categories?.filter(c => c.parentId === pId).length || 0) + 1
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
            <DialogContent className="rounded-[2.5rem] max-w-2xl p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-white">
              <div className="p-10 space-y-8">
                <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-headline font-bold text-slate-900 tracking-tight">树状分类管理</DialogTitle>
                    <DialogDescription className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digital Asset Hierarchy Configuration</DialogDescription>
                  </div>
                </DialogHeader>
                <div className={cn("space-y-4 p-6 rounded-[1.5rem] border transition-all duration-500", editingCatId ? "bg-primary/[0.02] border-primary/20" : "bg-slate-500/[0.03] border-slate-200")}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest pl-1">分类名称</Label>
                      <Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="rounded-xl h-10 bg-white border-slate-200 text-xs font-medium" placeholder="例如：产品外观" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest pl-1">上级分类</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full h-10 rounded-xl bg-white border-slate-200 text-xs justify-between px-4 font-medium transition-all group">
                            <span className="truncate">
                              {catForm.parentId === 'none' ? '无 (顶级分类)' : getDisplayName(categories?.find(c => c.id === catForm.parentId))}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" sideOffset={4} className="min-w-[12rem] p-1.5 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-[1100]">
                          <DropdownMenuLabel className="text-[10px] uppercase font-bold opacity-40 px-3 py-2">父级节点选择</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-100/50 my-1" />
                          <DropdownMenuItem
                            onClick={() => setCatForm({ ...catForm, parentId: 'none' })}
                            className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-primary/5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
                          >
                            无 (顶级分类)
                          </DropdownMenuItem>
                          <CategoryMenu
                            categories={categoryTree}
                            onSelect={(id: string) => setCatForm({ ...catForm, parentId: id })}
                            getDisplayName={getDisplayName}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {editingCatId && (
                      <Button variant="outline" onClick={resetCatForm} className="flex-1 rounded-xl h-11 font-bold uppercase text-[10px] tracking-widest border-slate-200">
                        取消
                      </Button>
                    )}
                    <Button onClick={handleSaveCategory} className="flex-[2] rounded-xl h-11 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/5">
                      {editingCatId ? '保存变更' : '确认添加分类'}
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
                          <div key={cat.id} className="group flex items-center justify-between p-2.5 px-4 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" disabled={isFirst} onClick={() => handleMoveCategory(cat, 'up')} className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary disabled:opacity-10">
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="ghost" disabled={isLast} onClick={() => handleMoveCategory(cat, 'down')} className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary disabled:opacity-10">
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <div style={{ width: `${cat.depth * 1.2}rem` }} className="h-px bg-slate-200 flex-shrink-0" />
                                  <span className={cn("text-xs font-bold tracking-tight", cat.depth === 0 ? "text-slate-900" : "text-slate-500")}>
                                    {cat.name}
                                  </span>
                                </div>
                                {cat.parentId && (
                                  <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest" style={{ marginLeft: `${cat.depth * 1.2 + 0.5}rem` }}>
                                    {categories?.find(c => c.id === cat.parentId)?.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <Button size="icon" variant="ghost" onClick={() => { setEditingCatId(cat.id); setCatForm({ name: cat.name, parentId: cat.parentId || 'none' }); }} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteCategory(cat.id)} className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
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
                <div className="absolute top-10 right-10">
                  <Button
                    variant="outline"
                    onClick={handleDeepCleanup}
                    disabled={isCleaning}
                    className="h-14 rounded-2xl px-6 border-slate-700 bg-white/5 hover:border-primary/40 hover:bg-primary/10 transition-all group shrink-0"
                  >
                    {isCleaning ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2">
                          <Eraser className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                          <span className="text-xs font-bold text-white">深度清理</span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">PURGE ORPHANS</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
              <div className="p-10 grid grid-cols-1 md:grid-cols-12 gap-10 bg-white/90 backdrop-blur-2xl">
                <div className="md:col-span-7">
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
                    className={cn(
                      "h-80 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden bg-white",
                      pendingFiles.length > 0 ? "border-primary/40" : "border-slate-200 hover:bg-primary/[0.02] hover:border-primary/40"
                    )}
                    onClick={(e) => {
                      if (pendingFiles.length === 0) fileInputRef.current?.click();
                    }}
                  >
                    {pendingFiles.length === 0 ? (
                      <>
                        <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                          <Upload className="h-7 w-7 text-slate-400 group-hover:text-primary" />
                        </div>
                        <p className="text-sm font-bold text-slate-900">点击或拖拽素材至此处</p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">DRAG & DROP IMAGE OR VIDEO FILES</p>
                        <div className="mt-6 px-4 py-2 bg-primary/5 rounded-full flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-3 w-3 text-primary" />
                            <span className="text-[9px] font-bold text-primary uppercase">图片限 700KB</span>
                            <span className="text-[9px] font-bold text-slate-300">|</span>
                            <PanelTop className="h-3 w-3 text-primary" />
                            <span className="text-[9px] font-bold text-primary uppercase">视频限 20MB</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary text-white border-none">{pendingFiles.length}</Badge>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">待上传队列</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            继续添加
                          </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                          {pendingFiles.map((file, i) => (
                            <div key={`${file.name}-${i}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group/item">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-100">
                                  <ImageIcon className="h-4 w-4 text-slate-400" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-[11px] font-bold text-slate-700 truncate">{file.name}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">{(file.size / 1024).toFixed(0)}KB</span>
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-lg text-slate-300 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/item:opacity-100 transition-all"
                                onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} multiple accept="image/*,video/*" className="hidden" onChange={e => handleFileUpload(e.target.files)} />
                  </div>
                </div>
                <div className="md:col-span-5 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">上传目标分类</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full h-12 rounded-xl bg-slate-500/5 border-transparent focus:ring-4 focus:ring-primary/5 justify-between px-4 font-medium transition-all group">
                            <span className="text-sm truncate">
                              {targetUploadCategoryId ? getDisplayName(categories?.find(c => c.id === targetUploadCategoryId)) : '请选择目标分类'}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" sideOffset={8} className="min-w-[12rem] p-1.5 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 z-[1100]">
                          <DropdownMenuLabel className="text-[10px] uppercase font-bold opacity-40 px-3 py-2">可用分类架构</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-100/50 my-1" />
                          <CategoryMenu
                            categories={categoryTree}
                            onSelect={setTargetUploadCategoryId}
                            getDisplayName={getDisplayName}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">重名冲突处理策略</Label>
                      <Select value={duplicateStrategy} onValueChange={(v: DuplicateStrategy) => setDuplicateStrategy(v)}>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-500/5 border-transparent text-sm font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none bg-white/95 backdrop-blur-xl shadow-2xl p-2 animate-in zoom-in-95 duration-200">
                          <SelectItem value="rename" className="rounded-xl text-xs py-3 px-4 font-medium focus:bg-primary/5">自动重命名 (生成副本)</SelectItem>
                          <SelectItem value="overwrite" className="rounded-xl text-xs py-3 px-4 text-orange-600 font-bold focus:bg-orange-50">覆盖现有文件 (全站同步)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[9px] text-slate-400 leading-relaxed mt-4 italic font-medium">
                        重要提示：由于云端存储限制，系统会严格校验图片 Base64 体积。建议在上传前进行必要的压缩。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6 border-t border-slate-200 flex items-center justify-between gap-4">
                <Button variant="ghost" onClick={() => { setIsUploadDialogOpen(false); setPendingFiles([]); }} className="rounded-xl h-12 px-8 text-xs font-bold uppercase tracking-widest text-slate-400">放弃并关闭</Button>
                <Button
                  onClick={startUpload}
                  disabled={pendingFiles.length === 0 || isUploading}
                  className="rounded-xl h-12 px-12 text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20 flex-1 md:flex-none"
                >
                  {isUploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> 正在上传...</>
                  ) : (
                    <><CloudUpload className="h-4 w-4 mr-2" /> 立即开始上传 ({pendingFiles.length})</>
                  )}
                </Button>
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
        <div className="flex items-center gap-3 px-4 bg-slate-500/5 rounded-[1.25rem] border border-transparent focus-within:border-primary/20 transition-all w-full md:w-72 h-12">
          <Layers className="h-4 w-4 text-primary/40 shrink-0" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex-1 border-none bg-transparent h-full px-2 shadow-none focus:ring-0 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600 flex items-center justify-between group hover:bg-primary/5 rounded-xl transition-all"
              >
                <span className="truncate max-w-[160px]">
                  {filterCategory === 'all' ? '全部分类 (ALL)' : getDisplayName(categories?.find(c => c.id === filterCategory))}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="min-w-[12rem] p-1.5 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-[1001]"
            >
              <DropdownMenuLabel className="text-[10px] uppercase font-bold opacity-40 px-3 py-2">资产目录架构</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100/50 my-1" />
              <DropdownMenuItem
                onClick={() => setFilterCategory('all')}
                className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-primary/5 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
              >
                全部分类 (ALL)
              </DropdownMenuItem>
              <CategoryMenu
                categories={categoryTree}
                onSelect={setFilterCategory}
                getDisplayName={getDisplayName}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center relative z-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20 mx-auto mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">正在同步云端媒体库 / Syncing Repository...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 relative z-10">
          {paginatedAssets.map((asset) => (
            <div
              key={asset.id}
              ref={el => { if (el) itemRefs.current.set(asset.id, el); else itemRefs.current.delete(asset.id); }}
              className={cn(
                "group relative bg-white/60 backdrop-blur-md rounded-[2rem] border transition-all duration-500 overflow-hidden",
                selectedIds.has(asset.id)
                  ? "border-primary ring-4 ring-primary/10 shadow-[0_20px_40px_-15px_rgba(0,91,153,0.2)]"
                  : "border-white/40 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1) ] hover:-translate-y-1 hover:bg-white"
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
                {asset.type === 'VIDEO' ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden">
                    <video 
                      src={asset.url} 
                      className="max-w-full max-h-full object-contain opacity-60"
                      muted
                      playsInline
                    />
                    {/* 选中状态 */}
                    {selectedIds.has(asset.id) && (
                      <div className="absolute inset-0 bg-primary/5 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in duration-300 z-10 rounded-2xl">
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-2xl transition-transform group-hover:scale-110 duration-500">
                        <Play className="h-6 w-6 fill-white ml-1" />
                      </div>
                    </div>
                    {asset.duration && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-mono text-white">
                        {Math.floor(asset.duration / 60)}:{(asset.duration % 60).toFixed(0).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                ) : (
                  <Image
                    src={asset.url}
                    alt={asset.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    unoptimized
                    onLoad={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (img.naturalWidth && !asset.width) {
                        window.dispatchEvent(new CustomEvent('asset-loaded', { 
                          detail: { id: asset.id, w: img.naturalWidth, h: img.naturalHeight } 
                        }));
                      }
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3 backdrop-blur-[2px] rounded-[1.5rem]">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-11 w-11 rounded-2xl shadow-2xl bg-white hover:bg-primary group/btn transition-all scale-75 group-hover:scale-100 duration-500"
                    onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset); setPreviewZoom('fit'); }}
                  >
                    <Maximize className="h-5 w-5 text-primary group-hover/btn:text-white transition-colors" />
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
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span>{((asset.fileSize || 0) / 1024).toFixed(0)}KB</span>
                    <span>•</span>
                    <span>{asset.fileName.split('.').pop()?.toUpperCase()}</span>
                    <AssetResolution id={asset.id} initialW={asset.width} initialH={asset.height} />
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5"
                      onClick={(e) => { e.stopPropagation(); handleCopy(asset.url); }}
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

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 relative z-10 pt-10">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="rounded-xl h-10 w-10 border-white/40 bg-white/60 backdrop-blur-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md p-1 rounded-xl border border-white/40">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={cn(
                  "h-8 w-8 rounded-lg text-[10px] font-bold",
                  currentPage === page ? "shadow-lg shadow-primary/20" : "text-slate-400 hover:text-primary"
                )}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="rounded-xl h-10 w-10 border-white/40 bg-white/60 backdrop-blur-md"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
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
              checked={paginatedAssets.length > 0 && paginatedAssets.every(a => selectedIds.has(a.id))}
              onCheckedChange={(v) => {
                const next = new Set(selectedIds);
                if (v) {
                  paginatedAssets.forEach(a => next.add(a.id));
                } else {
                  paginatedAssets.forEach(a => next.delete(a.id));
                }
                setSelectedIds(next);
              }}
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
                  <Label className="text-[10px] font-bold uppercase opacity-60 pl-1">目标分类</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-11 rounded-xl bg-muted/20 border-transparent focus:ring-4 focus:ring-primary/5 justify-between px-4 font-bold transition-all group">
                        <span className="text-xs truncate">
                          {batchTargetCategoryId ? getDisplayName(categories?.find(c => c.id === batchTargetCategoryId)) : '请选择目标分类...'}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-all" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={4} className="min-w-[12rem] p-1.5 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-[1100]">
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold opacity-40 px-3 py-2">所有分类</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-100/50 my-1" />
                      <CategoryMenu
                        categories={categoryTree}
                        onSelect={setBatchTargetCategoryId}
                        getDisplayName={getDisplayName}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        <div className={cn("fixed bottom-6 right-6 z-[1000] w-80 bg-white border border-border/60 shadow-2xl rounded-2xl overflow-hidden transition-all duration-500", isTasksPanelMinimized ? "h-14" : "h-[400px]")}>
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
          {editingAsset && (
            <div className="p-6 space-y-5 bg-white">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-60 pl-1">素材标题</Label>
                <Input value={editingAsset.title} onChange={e => setEditingAsset({ ...editingAsset, title: e.target.value })} className="rounded-xl h-11 border-slate-200 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase opacity-60 pl-1">归属分类</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full h-11 rounded-xl bg-muted/20 border-transparent focus:ring-4 focus:ring-primary/5 justify-between px-4 font-bold transition-all group">
                      <span className="text-xs truncate">
                        {editingAsset.categoryId ? getDisplayName(categories?.find(c => c.id === editingAsset.categoryId)) : '未设置分类'}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-all" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" sideOffset={8} className="min-w-[12rem] p-1.5 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 z-[1100]">
                    <DropdownMenuLabel className="text-[10px] uppercase font-bold opacity-40 px-3 py-2">分类目录</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-100/50 my-1" />
                    <CategoryMenu
                      categories={categoryTree}
                      onSelect={(id: string) => setEditingAsset({ ...editingAsset, categoryId: id })}
                      getDisplayName={getDisplayName}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
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

      <Dialog open={!!previewAsset} onOpenChange={o => {
        if (!o) {
          setPreviewAsset(null);
          setPreviewDimensions(null);
          setPreviewZoom('fit');
        }
      }}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden bg-black/95 border-none shadow-2xl rounded-2xl flex flex-col z-50 [&>button:last-child]:hidden">
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

            <Button 
              variant="secondary" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md" 
              onClick={() => { window.open(previewAsset?.url, '_blank'); }} 
              title="下载原图"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md" 
              onClick={() => {
                setPreviewAsset(null);
                setPreviewDimensions(null);
                setPreviewZoom('fit');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div 
            ref={previewScrollContainerRef}
            onMouseDown={handlePreviewMouseDown}
            className={cn(
              "relative flex-1 overflow-auto flex items-center justify-center p-4", 
              previewZoom === '1:1' ? "cursor-move" : "p-12"
            )}
          >
            {previewAsset && (
              <div className={cn("relative transition-all duration-500", previewZoom === '1:1' ? "w-auto h-auto" : "w-full h-full flex items-center justify-center")}>
                {previewAsset.type === 'VIDEO' ? (
                  <video
                    src={previewAsset.url}
                    controls
                    autoPlay
                    className={cn(
                      "shadow-2xl rounded-sm transition-all duration-300",
                      previewZoom === 'fit' ? "max-w-full max-h-full" : "max-w-none w-auto h-auto"
                    )}
                    onLoadedMetadata={(e) => {
                      const vid = e.currentTarget;
                      setPreviewDimensions({ width: vid.videoWidth, height: vid.videoHeight });
                    }}
                  />
                ) : (
                  <img
                    src={previewAsset.url}
                    alt={previewAsset.title}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      setPreviewDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                    }}
                    className={cn(
                      "shadow-2xl rounded-sm transition-all duration-300",
                      previewZoom === 'fit' ? "max-w-full max-h-full object-contain" : "max-w-none w-auto h-auto"
                    )}
                  />
                )}
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 border-t border-white/10 flex items-center justify-between text-white shrink-0">
            <div className="space-y-1">
              <h4 className="font-bold text-sm">{previewAsset?.title}</h4>
              <p className="text-[10px] opacity-60 uppercase tracking-widest">
                {previewAsset?.fileName} • {((previewAsset?.fileSize || 0) / 1024).toFixed(1)} KB 
                {previewDimensions && ` • ${previewDimensions.width} × ${previewDimensions.height} PX`}
              </p>
            </div>
            <div className="flex gap-3">
              {previewZoom === '1:1' && <span className="flex items-center gap-2 text-[10px] font-bold text-accent animate-pulse uppercase tracking-widest"><Move className="h-3 w-3" /> 拖动或滚动以查看细节</span>}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 text-[10px] uppercase font-bold px-5" 
                onClick={() => handleCopy(previewAsset?.url || '')}
              >
                复制图片地址
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}