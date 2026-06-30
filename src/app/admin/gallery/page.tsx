"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
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
  Play,
  FileText,
  Archive,
  File as FileIcon,
  FolderOpen,
  Database,
  Wallet
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
import { getAssetUrl } from '@/lib/image-utils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CascaderSelect } from '@/components/ui/cascader-select';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

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
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  thumbnailUrl?: string;
  duration?: number;
  categoryId: string;
  fileName: string;
  fileSize?: number;
  width?: number;
  height?: number;
  createdAt?: any;
}

const DOCUMENT_EXTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
const ARCHIVE_EXTS = ['zip', 'rar', '7z', 'tar', 'gz'];

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
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(new Set());

  const toggleCollapse = React.useCallback((id: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // 递归生成带缩进的平铺列表
  const renderFlatItems = (parentId: string | null = null, depth = 0): React.ReactNode[] => {
    const levelCats = categories.filter(c => {
      return (parentId === null)
        ? !categories.some(other => other.id === c.parentId)
        : c.parentId === parentId;
    });

    return levelCats.flatMap(cat => {
      const children = categories.filter(c => c.parentId === cat.id);
      const hasChildren = children.length > 0;
      const isCollapsed = collapsedIds.has(cat.id);
      return [
        <DropdownMenuItem
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "rounded-xl py-2 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between group",
            depth === 0 ? "text-foreground" : "text-muted-foreground",
            "hover:bg-primary/5 focus:bg-primary/5 focus:text-primary"
          )}
          style={{ paddingLeft: `${depth * 16 + 12}px`, paddingRight: '12px' }}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleCollapse(cat.id);
                }}
                className="h-5 w-5 rounded-md hover:bg-muted-foreground/10 flex items-center justify-center shrink-0 text-muted-foreground/60 hover:text-foreground transition-all"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            ) : (
              <div className="w-5 shrink-0" />
            )}
            <span className="truncate">{getDisplayName(cat)}</span>
          </div>
        </DropdownMenuItem>,
        ...(isCollapsed ? [] : renderFlatItems(cat.id, depth + 1))
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
    <span className="text-[9px] font-black text-primary/70 uppercase tracking-widest shrink-0">
      {dim.w}×{dim.h}
    </span>
  );
};

const compressImageFile = (file: File, quality: number): Promise<File> => {
  return new Promise((resolve) => {
    // 只有有损图像格式（JPEG/WebP）才支持重绘压缩
    const isImage = file.type.startsWith('image/');
    const isLossy = ['image/jpeg', 'image/jpg', 'image/webp'].includes(file.type);
    if (!isImage || !isLossy || quality >= 95) {
      resolve(file);
      return;
    }
    
    const canvasQuality = quality / 100;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new (window as any).Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' });
        if (!ctx) {
          resolve(file);
          return;
        }

        // 2. 核心细节修复：JPEG 格式不支持透明通道（Alpha）。如果在 Canvas 里直接 drawImage，
        // 任何半透明的像素边缘或者抗锯齿区域都会被默认叠加为黑色背景，导致边缘细节出现高斯模糊状的脏斑和色偏。
        // 我们必须在绘制前预先将 Canvas 背景平铺填充为纯白色的实体背景，然后再原样叠加原图。
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // 1:1 无缩放绘制
        ctx.drawImage(img, 0, 0);

        const outputFormat = file.type;
        const extension = file.type === 'image/webp' ? '.webp' : '.jpg';

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + extension, {
                type: outputFormat,
                lastModified: Date.now(),
              });

              // 仅当体积优化 5% 以上才采用压缩版
              if (compressedFile.size < file.size * 0.95) {
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            } else {
              resolve(file);
            }
          },
          outputFormat,
          Math.max(canvasQuality, 0.92) // 将 JPEG 有损压缩防线提高到 0.92，保留极限逼真度
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const getFormatColorClass = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'].includes(ext)) {
    return 'text-emerald-500 dark:text-emerald-400 font-extrabold';
  }
  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) {
    return 'text-amber-500 dark:text-amber-400 font-extrabold';
  }
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar', '7z'].includes(ext)) {
    return 'text-sky-500 dark:text-sky-400 font-extrabold';
  }
  return 'text-muted-foreground/40 font-bold';
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
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all');
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
  const [openUploadCategory, setOpenUploadCategory] = useState(false);
  const [openUploadStrategy, setOpenUploadStrategy] = useState(false);

  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [isTasksPanelOpen, setIsTasksPanelOpen] = useState(false);
  const [isTasksPanelMinimized, setIsTasksPanelMinimized] = useState(false);

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [enableCompression, setEnableCompression] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(85);

  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPageVal, setJumpPageVal] = useState('1');
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setJumpPageVal(currentPage.toString());
  }, [currentPage]);


  useEffect(() => {
    setSelectedIds(new Set());
    setCurrentPage(1); // 筛选条件改变时重置页码
  }, [filterCategory, searchQuery, filterType]);

  useEffect(() => {
    if (isUploadDialogOpen) {
      setEnableCompression(false);
      setCompressionQuality(85);
    }
  }, [isUploadDialogOpen]);

  const { data: session } = useSession();
  const isAdmin = useMemo(() => {
    return (session?.user as any)?.role === 'superadmin';
  }, [session]);

  const { data: categories, mutate: mutateCats } = useLocalCollection<GalleryCategory>('galleryCategories');
  const { data: assets, isLoading, mutate: mutateAssets } = useLocalCollection<GalleryAsset>('galleryAssets');

  const [quotaGB, setQuotaGB] = useState<number>(50);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [inputQuota, setInputQuota] = useState('50');

  const totalUsedSize = useMemo(() => {
    if (!assets) return 0;
    return assets.reduce((acc, asset) => acc + (asset.fileSize || 0), 0);
  }, [assets]);

  const usedPercentage = useMemo(() => {
    const totalQuotaBytes = quotaGB * 1024 * 1024 * 1024;
    if (totalQuotaBytes === 0) return 0;
    return (totalUsedSize / totalQuotaBytes) * 100;
  }, [totalUsedSize, quotaGB]);

  const formatSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  useEffect(() => {
    const storedQuota = localStorage.getItem('heovose_gallery_quota');
    if (storedQuota) {
      setQuotaGB(parseFloat(storedQuota) || 50);
      setInputQuota(storedQuota);
    }
  }, []);

  const handleSaveConfig = () => {
    const q = parseFloat(inputQuota);
    if (isNaN(q) || q <= 0) {
      toast({ variant: "destructive", title: "无效的容量大小" });
      return;
    }
    setQuotaGB(q);
    localStorage.setItem('heovose_gallery_quota', q.toString());
    setIsConfigDialogOpen(false);
    toast({
      title: "配置已更新",
      description: "存储容量信息已成功同步。"
    });
  };

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

  // Handle default selection based on filterCategory (if not 'all')
  useEffect(() => {
    if (categoryTree.length > 0) {
      if (filterCategory && filterCategory !== 'all') {
        setTargetUploadCategoryId(filterCategory);
      } else {
        setTargetUploadCategoryId('');
      }
    }
  }, [filterCategory, categoryTree]);

  const activeCategoryIds = useMemo(() => {
    if (!filterCategory || filterCategory === 'all' || !categories) return new Set<string>();
    const ids = new Set<string>([filterCategory]);
    const getChildren = (parentId: string) => {
      categories.forEach(c => {
        if (c.parentId === parentId && !ids.has(c.id)) {
          ids.add(c.id);
          getChildren(c.id);
        }
      });
    };
    getChildren(filterCategory);
    return ids;
  }, [filterCategory, categories]);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === 'all' || 
        (a.categoryId && activeCategoryIds.has(a.categoryId)) ||
        a.categoryId === filterCategory;

      const fileExt = a.fileName?.toLowerCase().split('.').pop() || '';
      const isVideoFile = ['mp4', 'webm', 'ogg', 'mov'].includes(fileExt);
      const isDocFile = DOCUMENT_EXTS.includes(fileExt) || ARCHIVE_EXTS.includes(fileExt);

      let actualType = a.type || 'IMAGE';
      if (isVideoFile) actualType = 'VIDEO';
      if (isDocFile) actualType = 'DOCUMENT';

      const matchType = filterType === 'all' ||
        (filterType === 'image' && actualType === 'IMAGE') ||
        (filterType === 'video' && actualType === 'VIDEO') ||
        (filterType === 'document' && actualType === 'DOCUMENT');

      return matchSearch && matchCategory && matchType;
    });
  }, [assets, searchQuery, filterCategory, filterType, activeCategoryIds]);

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);

  const paginationRange = useMemo(() => {
    const range = [];
    const delta = 1;
    range.push(1);
    if (currentPage > delta + 2) {
      range.push('...');
    }
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage < totalPages - delta - 1) {
      range.push('...');
    }
    if (totalPages > 1) {
      range.push(totalPages);
    }
    return range;
  }, [currentPage, totalPages]);
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssets.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAssets, currentPage]);

  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const main = target.closest('main');
      const header = target.closest('header');
      if (!main || header) return;

      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('label') ||
        target.closest('[role="combobox"]') ||
        target.closest('[role="listbox"]') ||
        target.closest('[role="dialog"]') ||
        target.closest('[role="menu"]') ||
        target.closest('[role="menuitem"]') ||
        target.closest('[data-radix-popper-content-wrapper]')
      ) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
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
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!selectionBox) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
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

      paginatedAssets.forEach(asset => {
        const el = itemRefs.current.get(asset.id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

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
    };

    const handleGlobalMouseUp = () => {
      setSelectionBox(null);
    };

    window.addEventListener('mousedown', handleGlobalMouseDown);
    if (selectionBox) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousedown', handleGlobalMouseDown);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [selectionBox, selectedIds, paginatedAssets]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);

    // 校验文件大小
    const oversized = fileArray.filter(f => {
      const limit = 20 * 1024 * 1024; // 统一 20MB
      return f.size > limit;
    });

    if (oversized.length > 0) {
      toast({
        variant: "destructive",
        title: "文件过大",
        description: `${oversized.length} 个文件超过了 20MB 的系统限制。`
      });
      return;
    }

    setPendingFiles(prev => [...prev, ...fileArray]);
  };

  const startUpload = async () => {
    if (pendingFiles.length === 0) return;
    if (!targetUploadCategoryId) {
      toast({ variant: "destructive", title: "操作受阻", description: "请先选择归属分类。" });
      return;
    }
    if (!categories || categories.length === 0) {
      toast({ variant: "destructive", title: "操作受阻", description: "请先添加至少一个分类。" });
      return;
    }

    setIsUploading(true);
    const categoryId = targetUploadCategoryId;
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
        let uploadFile = file;
        if (enableCompression) {
          uploadFile = await compressImageFile(file, compressionQuality);
        }

        const formData = new FormData();
        formData.append('file', uploadFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");
        const { url, fileName } = await uploadRes.json();

        const isVideo = uploadFile.type.startsWith('video/');
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

        const title = uploadFile.name.split('.')[0];
        const categoryId = targetUploadCategoryId;

        if (!categoryId) {
          throw new Error("请先选择一个素材分类再上传。");
        }

        // 使用更安全的 ID 生成方式
        const randomString = Math.random().toString(36).substring(2, 7);
        let assetId = `asset_${Date.now()}_${randomString}_${i}`;

        // --- Duplicate Handling Strategy ---
        if (duplicateStrategy === 'overwrite' && assets) {
          const existing = assets.find(a => a.title === title && a.categoryId === categoryId);
          if (existing) {
            assetId = existing.id;
          }
        }

        const assetData = {
          id: assetId,
          url,
          type: isVideo ? 'VIDEO' : 'IMAGE',
          duration: isVideo ? duration : undefined,
          title: title,
          fileName: fileName,
          fileSize: uploadFile.size,
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
        updateTask(taskId, { status: 'error', progress: 0, error: e.message });
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

  const handleSelectCurrentPage = () => {
    const isAllSelected = paginatedAssets.every(asset => selectedIds.has(asset.id));
    const newSelected = new Set(selectedIds);
    if (isAllSelected) {
      paginatedAssets.forEach(asset => newSelected.delete(asset.id));
    } else {
      paginatedAssets.forEach(asset => newSelected.add(asset.id));
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAllFiltered = () => {
    const isAllSelected = filteredAssets.every(asset => selectedIds.has(asset.id));
    const newSelected = new Set(selectedIds);
    if (isAllSelected) {
      filteredAssets.forEach(asset => newSelected.delete(asset.id));
    } else {
      filteredAssets.forEach(asset => newSelected.add(asset.id));
    }
    setSelectedIds(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`永久移除选中的 ${selectedIds.size} 项素材？`)) return;
    try {
      const ids = Array.from(selectedIds);
      const errors: string[] = [];
      
      for (const id of ids) {
        const res = await fetch(`/api/galleryAssets/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const asset = assets?.find(a => a.id === id);
          errors.push(`「${asset?.title || id}」: ${errData.message || '删除失败'}`);
        }
      }
      
      mutateAssets();
      setSelectedIds(new Set());
      
      if (errors.length > 0) {
        toast({
          variant: "destructive",
          title: "部分素材删除失败",
          description: errors.join('\n')
        });
      } else {
        toast({ title: `已成功删除 ${ids.length} 项素材` });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "批量删除失败" });
    }
  };

  const handleDeleteAsset = async (asset: any) => {
    if (!confirm(`永久移除素材 "${asset.title}"？`)) return;
    try {
      const res = await fetch(`/api/galleryAssets/${asset.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "删除失败");
      }
      mutateAssets();
      const newSelected = new Set(selectedIds);
      newSelected.delete(asset.id);
      setSelectedIds(newSelected);
      toast({ title: "已成功删除素材" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "删除失败", description: e.message });
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
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileUpload(e.dataTransfer.files);
          setIsUploadDialogOpen(true);
        }
      }}
      ref={containerRef}
    >
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] brightness-100 contrast-150" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 flex-1">
          <AdminPageHeader
            title="资源管理中心"
            subtitle="Management / Digital Assets / Resources"
            icon={FolderOpen}
          />

          <div
            onClick={() => {
              if (!isAdmin) return;
              setInputQuota(quotaGB.toString());
              setIsConfigDialogOpen(true);
            }}
            className={cn(
              "flex items-center gap-4 border backdrop-blur-xl p-3 px-5 rounded-2xl shadow-sm shrink-0 select-none",
              usedPercentage >= 90
                ? "bg-gradient-to-br from-red-500/[0.03] to-rose-500/[0.01] dark:from-red-500/[0.02] dark:to-transparent border-red-500/20"
                : "bg-gradient-to-br from-emerald-500/[0.03] to-teal-500/[0.01] dark:from-emerald-500/[0.02] dark:to-transparent border-emerald-500/10",
              isAdmin
                ? (usedPercentage >= 90
                  ? "hover:from-red-500/[0.06] hover:to-rose-500/[0.03] hover:border-red-500/40 cursor-pointer transition-all duration-500 group"
                  : "hover:from-emerald-500/[0.06] hover:to-teal-500/[0.03] hover:border-emerald-500/20 cursor-pointer transition-all duration-500 group")
                : "cursor-default opacity-85"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-105",
                usedPercentage >= 90
                  ? "bg-red-500/10 dark:bg-red-500/20 text-red-500 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]"
                  : "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
              )}>
                <Database className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider",
                    usedPercentage >= 90 ? "text-red-500/80" : "text-emerald-500/80"
                  )}>存储桶状态</span>
                  {usedPercentage >= 90 ? (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 font-bold scale-90 origin-left animate-pulse">容量紧张</span>
                  ) : isAdmin && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold scale-90 origin-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">配置</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-foreground">
                    {formatSize(totalUsedSize)}
                  </span>
                  <span className="text-muted-foreground/30 text-xs">/</span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {quotaGB} GB
                  </span>
                </div>
                <div className={cn(
                  "w-28 h-1.5 rounded-full mt-1.5 overflow-hidden",
                  usedPercentage >= 90 ? "bg-red-500/10" : "bg-emerald-500/10"
                )}>
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      usedPercentage >= 90
                        ? "bg-gradient-to-r from-red-500 to-rose-400"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400"
                    )}
                    style={{ width: `${Math.min(100, usedPercentage)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Dialog open={isCategoryDialogOpen} onOpenChange={(o) => { setIsCategoryDialogOpen(o); if (!o) resetCatForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-2xl h-14 px-8 gap-3 text-xs font-bold uppercase tracking-widest border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/70 text-foreground/80 hover:text-primary hover:border-primary/20 transition-all shadow-sm">
                <Settings2 className="h-4 w-4" /> 素材分类
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-2xl p-0 overflow-hidden border border-border/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-background">
              <div className="p-10 space-y-8">
                <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-headline font-bold text-foreground tracking-tight">树状分类管理</DialogTitle>
                    <DialogDescription className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Digital Asset Hierarchy Configuration</DialogDescription>
                  </div>
                </DialogHeader>
                <div className={cn("space-y-4 p-8 rounded-[2.5rem] border transition-all duration-700", editingCatId ? "bg-primary/5 border-primary/20 shadow-[0_0_50px_-12px_rgba(var(--primary),0.1)]" : "bg-muted/10 border-border/10")}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-[0.2em] pl-1">架构节点名称 (Title)</Label>
                      <Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="rounded-2xl h-12 bg-muted/10 border-transparent focus:bg-muted/20 text-sm font-bold shadow-inner" placeholder="例如：产品实拍 / 宣发素材" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-[0.2em] pl-1">逻辑上级 (Parent)</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full h-12 rounded-2xl bg-muted/10 border-transparent text-sm justify-between px-5 font-bold transition-all group shadow-inner">
                            <span className="truncate">
                              {catForm.parentId === 'none' ? '无 (顶级分类 ROOT)' : getDisplayName(categories?.find(c => c.id === catForm.parentId))}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-all" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" sideOffset={8} className="min-w-[14rem] p-2 rounded-3xl shadow-2xl border border-white/5 bg-card/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 z-[1100]">
                          <DropdownMenuLabel className="text-[10px] uppercase font-black opacity-20 px-4 py-3 tracking-[0.2em]">Hierarchy Select</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border/10 my-1" />
                          <DropdownMenuItem
                            onClick={() => setCatForm({ ...catForm, parentId: 'none' })}
                            className="rounded-2xl px-4 py-3 text-xs font-bold hover:bg-primary/10 focus:bg-primary/10 focus:text-primary transition-all cursor-pointer mb-1"
                          >
                            无 (顶级分类 ROOT)
                          </DropdownMenuItem>
                          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <CategoryMenu
                              categories={categoryTree}
                              onSelect={(id: string) => setCatForm({ ...catForm, parentId: id })}
                              getDisplayName={getDisplayName}
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    {editingCatId && (
                      <Button variant="ghost" onClick={resetCatForm} className="flex-1 rounded-2xl h-12 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/40 hover:text-foreground">
                        放弃当前操作
                      </Button>
                    )}
                    <Button onClick={handleSaveCategory} className="flex-[2] rounded-2xl h-12 font-bold uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-primary/20">
                      {editingCatId ? '同步架构变更' : '确认注入分类节点'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between px-4">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground/30 tracking-[0.3em]">分类层级设置</Label>
                    <Badge variant="outline" className="text-[9px] border-border/10 text-muted-foreground/60 rounded-full px-3 h-5 font-black">{categories?.length || 0} NODES</Badge>
                  </div>
                  <div className="max-h-[380px] overflow-y-auto pr-3 custom-scrollbar space-y-2.5">
                    {categoryTree.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-border/5 rounded-[3rem]">
                        <Layers className="h-10 w-10 text-muted-foreground/10 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.4em] italic">暂无分类</p>
                      </div>
                    ) : (
                      categoryTree.map((cat, idx) => {
                        const sameLevel = categoryTree.filter(c => c.parentId === cat.parentId);
                        const isFirst = sameLevel[0]?.id === cat.id;
                        const isLast = sameLevel[sameLevel.length - 1]?.id === cat.id;

                        return (
                          <div key={cat.id} className="group flex items-center justify-between p-3.5 px-6 bg-muted/5 hover:bg-muted/10 rounded-[1.25rem] transition-all duration-500 border border-transparent hover:border-border/5">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Button size="icon" variant="ghost" disabled={isFirst} onClick={() => handleMoveCategory(cat, 'up')} className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary disabled:opacity-5">
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" disabled={isLast} onClick={() => handleMoveCategory(cat, 'down')} className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary disabled:opacity-5">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                  <div style={{ width: `${cat.depth * 1.5}rem` }} className="h-[2px] bg-primary/20 shrink-0 rounded-full" />
                                  <span className={cn("text-[13px] font-bold tracking-tight transition-colors", cat.depth === 0 ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                                    {cat.name}
                                  </span>
                                </div>
                                {cat.parentId && (
                                  <span className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.2em] mt-0.5" style={{ marginLeft: `${cat.depth * 1.5 + 0.8}rem` }}>
                                    Parent: {categories?.find(c => c.id === cat.parentId)?.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <Button size="icon" variant="ghost" onClick={() => { setEditingCatId(cat.id); setCatForm({ name: cat.name, parentId: cat.parentId || 'none' }); }} className="h-9 w-9 rounded-xl hover:bg-primary/15 hover:text-primary transition-all">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteCategory(cat.id)} className="h-9 w-9 rounded-xl hover:bg-destructive/15 hover:text-destructive transition-all">
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
              <Button className="rounded-2xl h-14 px-8 font-black uppercase tracking-[0.25em] gap-4 text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all">
                <CloudUpload className="h-5 w-5" /> 批量上传
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[3rem] max-w-5xl p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] admin-interface-dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200/50 admin-interface-dark:border-white/5 bg-card">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 admin-interface-dark:from-slate-950 admin-interface-dark:to-slate-900 p-10 text-slate-900 admin-interface-dark:text-white relative overflow-hidden border-b border-slate-200/80 admin-interface-dark:border-white/5">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <CloudUpload className="h-32 w-32" />
                </div>
                <DialogHeader className="relative z-10 space-y-2">
                  <DialogTitle className="text-2xl font-headline font-black flex items-center gap-4 text-slate-900 admin-interface-dark:text-white">
                    <div className="h-12 w-12 rounded-2xl bg-slate-200/50 admin-interface-dark:bg-white/10 flex items-center justify-center border border-slate-300/50 admin-interface-dark:border-white/5 text-slate-700 admin-interface-dark:text-white">
                      <CloudUpload className="h-6 w-6" />
                    </div>
                    素材上传
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-bold text-slate-500/50 admin-interface-dark:text-white/30 uppercase tracking-[0.3em]">Advanced Digital Asset Ingestion Interface</DialogDescription>
                </DialogHeader>
                <div className="absolute top-1/2 -translate-y-1/2 right-10 z-20">
                  <Button
                    variant="outline"
                    onClick={handleDeepCleanup}
                    disabled={isCleaning}
                    className="h-12 rounded-xl px-6 border-slate-200 admin-interface-dark:border-white/10 bg-slate-200/30 admin-interface-dark:bg-white/5 hover:bg-slate-200/50 admin-interface-dark:hover:bg-white/10 text-slate-700 admin-interface-dark:text-white transition-all group shrink-0"
                  >
                    {isCleaning ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-700 admin-interface-dark:text-white" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Eraser className="h-4 w-4 text-slate-500 admin-interface-dark:text-white/40 group-hover:text-slate-700 admin-interface-dark:group-hover:text-white transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-wider">深度净化</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 bg-card">
                <div className="md:col-span-7">
                  <div
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => { e.preventDefault(); e.stopPropagation(); handleFileUpload(e.dataTransfer.files); }}
                    className={cn(
                      "h-[400px] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden bg-muted/5 shadow-inner",
                      pendingFiles.length > 0 ? "border-primary/40 bg-primary/[0.02]" : "border-slate-200 admin-interface-dark:border-white/10 hover:bg-primary/[0.02] hover:border-primary/40"
                    )}
                    onClick={(e) => {
                      if (pendingFiles.length === 0) fileInputRef.current?.click();
                    }}
                  >
                    {pendingFiles.length === 0 ? (
                      <>
                        <div className="h-20 w-20 rounded-2xl bg-background shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                          <Upload className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-base font-bold text-foreground tracking-tight">点击或拖放素材到这</p>
                        <p className="text-[9px] text-muted-foreground/40 mt-2 uppercase font-black tracking-[0.2em]">SECURE ASSET DROP ZONE</p>
                        <div className="mt-8 px-6 py-3.5 bg-primary/5 rounded-2xl flex flex-col items-center gap-3 border border-primary/10">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <CloudUpload className="h-3.5 w-3.5 text-primary/60" />
                              <span className="text-[9px] font-bold text-primary/80 uppercase tracking-wider">图片 &lt; 700KB</span>
                            </div>
                            <div className="h-3 w-px bg-primary/20" />
                            <div className="flex items-center gap-2">
                              <Archive className="h-3.5 w-3.5 text-primary/60" />
                              <span className="text-[9px] font-bold text-primary/80 uppercase tracking-wider">视频 &lt; 20MB</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-primary text-white border-none h-6 px-3 rounded-full font-bold text-xs">{pendingFiles.length}</Badge>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">待处理队列 / QUEUED</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-xl px-4 text-[10px] font-bold uppercase tracking-wider border-slate-200 admin-interface-dark:border-white/10 bg-muted/10 hover:bg-muted/20"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            继续追加
                          </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 custom-scrollbar">
                          {pendingFiles.map((file, i) => (
                            <div key={`${file.name}-${i}`} className="flex items-center justify-between p-3 bg-muted/10 rounded-xl group/item border border-transparent hover:border-slate-200 admin-interface-dark:hover:border-white/5 transition-all">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shrink-0 border border-slate-200/50 admin-interface-dark:border-white/5 shadow-sm">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground/20" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-xs font-bold text-foreground truncate">{file.name}</span>
                                  <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-wider">{(file.size / 1024).toFixed(0)} KB / RAW DATA</span>
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/item:opacity-100 transition-all"
                                onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z" className="hidden" onChange={e => handleFileUpload(e.target.files)} />
                  </div>
                </div>
                <div className="md:col-span-5 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pr-1">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-[0.2em] pl-1">上传分类</Label>
                        <Button 
                          variant="link" 
                          onClick={() => setIsCategoryDialogOpen(true)} 
                          className="h-auto p-0 text-[10px] font-bold text-primary uppercase tracking-widest hover:opacity-80"
                        >
                          + 管理分类
                        </Button>
                      </div>
                      <DropdownMenu open={openUploadCategory} onOpenChange={(o) => {
                        setOpenUploadCategory(o);
                        if (o) setOpenUploadStrategy(false);
                      }}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full h-14 rounded-2xl bg-muted/10 border-transparent focus:ring-4 focus:ring-primary/5 justify-between px-5 font-bold transition-all group shadow-inner">
                            <span className="text-sm tracking-tight truncate">
                              {targetUploadCategoryId ? getDisplayName(categories?.find(c => c.id === targetUploadCategoryId)) : '请选择上传分类'}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-all" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" sideOffset={8} className="min-w-[16rem] p-2 rounded-2xl shadow-2xl border border-slate-200/50 admin-interface-dark:border-white/5 bg-card/95 backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-300 z-[1100]">
                          <DropdownMenuLabel className="text-[10px] uppercase font-black opacity-20 px-4 py-3 tracking-[0.2em]">Taxonomy Architecture</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border/10 my-1" />
                          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <CategoryMenu
                              categories={categoryTree}
                              onSelect={(id) => {
                                setTargetUploadCategoryId(id);
                                setOpenUploadCategory(false);
                              }}
                              getDisplayName={getDisplayName}
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-[0.2em] pl-1">冲突处理协议</Label>
                      <DropdownMenu open={openUploadStrategy} onOpenChange={(o) => {
                        setOpenUploadStrategy(o);
                        if (o) setOpenUploadCategory(false);
                      }}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full h-14 rounded-2xl bg-muted/10 border-transparent focus:ring-4 focus:ring-primary/5 justify-between px-5 font-bold transition-all group text-left shadow-inner">
                            <span className={cn("text-sm tracking-tight truncate", duplicateStrategy === 'overwrite' && "text-amber-500 font-bold")}>
                              {duplicateStrategy === 'rename' ? '自动重命名 (生成独立副本)' : '覆盖现有资源 (全站映射同步)'}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-all" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" sideOffset={8} className="min-w-[16rem] p-2 rounded-2xl shadow-2xl border border-slate-200/50 admin-interface-dark:border-white/5 bg-card/95 backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-300 z-[1200]">
                          <DropdownMenuItem
                            onClick={() => {
                              setDuplicateStrategy('rename');
                              setOpenUploadStrategy(false);
                            }}
                            className="rounded-xl text-xs py-3 px-4 font-bold focus:bg-primary/10 transition-all cursor-pointer mb-1"
                          >
                            自动重命名 (生成独立副本)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setDuplicateStrategy('overwrite');
                              setOpenUploadStrategy(false);
                            }}
                            className="rounded-xl text-xs py-3 px-4 text-amber-500 font-bold focus:bg-amber-500/10 transition-all cursor-pointer"
                          >
                            覆盖现有资源 (全站映射同步)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 mt-4">
                        <p className="text-[10px] text-amber-500/80 leading-relaxed font-bold tracking-tight">
                          <AlertTriangle className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                          注意：覆盖策略会立即同步更新所有引用该素材的前台页面，请谨慎操作。
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4 p-4 bg-muted/10 border border-border/20 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-foreground">图片智能压缩</Label>
                          <p className="text-[9px] text-muted-foreground leading-none">Smart Image Compression</p>
                        </div>
                        <Switch
                          checked={enableCompression}
                          onCheckedChange={setEnableCompression}
                        />
                      </div>

                      {enableCompression && (
                        <div className="space-y-3 pt-3 border-t border-dashed border-border/40 animate-in fade-in duration-300">
                          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                            <span>压缩质量 (Quality)</span>
                            <span className="text-primary">{compressionQuality}%</span>
                          </div>
                          <Slider
                            value={[compressionQuality]}
                            onValueChange={(val) => setCompressionQuality(val[0])}
                            min={10}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                          <p className="text-[8px] text-muted-foreground leading-normal pl-1 italic">
                            保持原始分辨率，在不改变图片宽度/高度的情况下以最佳算法编码压缩。
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-muted/10 admin-interface-dark:bg-muted/5 p-8 border-t border-border/40 admin-interface-dark:border-border/5 gap-4">
                <Button variant="ghost" onClick={() => { setIsUploadDialogOpen(false); setPendingFiles([]); }} className="h-14 rounded-2xl flex-1 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/60 admin-interface-dark:text-muted-foreground/40 hover:text-foreground">取消</Button>
                <Button
                  onClick={startUpload}
                  disabled={pendingFiles.length === 0 || isUploading || !targetUploadCategoryId}
                  className="h-14 rounded-2xl flex-1 font-bold uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-primary/20"
                >
                  {isUploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> 处理中...</>
                  ) : (
                    <><CloudUpload className="h-4 w-4 mr-2" /> {!targetUploadCategoryId ? '请选择分类' : `立即上传 (${pendingFiles.length})`}</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-card/40 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-border/10 shadow-2xl relative z-10 shadow-black/5">
        {/* 资源类型筛选按钮组 */}
        <div className="flex items-center bg-muted/10 rounded-[1.5rem] p-1.5 gap-1.5 shadow-inner w-full md:w-auto h-14 shrink-0 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: '全部', icon: Layers },
            { id: 'image', label: '图片', icon: ImageIcon },
            { id: 'video', label: '视频', icon: Play },
            { id: 'document', label: '文档', icon: FileText }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <Button
                key={t.id}
                variant="ghost"
                onClick={() => setFilterType(t.id as any)}
                className={cn(
                  "h-11 rounded-[1.1rem] px-5 text-[11px] font-black uppercase tracking-wider transition-all duration-300 gap-2 flex items-center",
                  filterType === t.id
                    ? "bg-white admin-interface-dark:bg-slate-800 text-primary shadow-md scale-100"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", filterType === t.id ? "text-primary" : "text-muted-foreground/45")} />
                {t.label}
              </Button>
            );
          })}
        </div>

        <div className="relative flex-1 w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20 group-focus-within:text-primary transition-all duration-500" />
          <Input
            placeholder="搜索素材标识或标题 / SEARCH ASSETS INDEX..."
            className="pl-14 border-none bg-muted/10 focus-visible:ring-0 rounded-[1.5rem] h-14 text-sm font-bold placeholder:text-muted-foreground/20 placeholder:font-black placeholder:uppercase tracking-tight shadow-inner"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 px-6 bg-muted/10 rounded-[1.5rem] border border-transparent focus-within:border-primary/20 transition-all w-full md:w-80 h-14 shadow-inner">
          <Layers className="h-5 w-5 text-primary/40 shrink-0" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex-1 border-none bg-transparent h-full px-2 shadow-none focus:ring-0 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center justify-between group hover:bg-primary/5 rounded-xl transition-all"
              >
                <span className="truncate max-w-[160px]">
                  {filterCategory === 'all' ? '全部分类 (ALL)' : getDisplayName(categories?.find(c => c.id === filterCategory))}
                </span>
                <ChevronDown className="h-4 w-4 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="min-w-[16rem] p-3 rounded-[2rem] shadow-2xl border border-white/5 bg-card/95 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200 z-[1001]"
            >
              <DropdownMenuLabel className="text-[10px] uppercase font-black opacity-20 px-4 py-3 tracking-[0.3em]">Asset Tree Index</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/10 my-1" />
              <DropdownMenuItem
                onClick={() => setFilterCategory('all')}
                className="rounded-2xl px-4 py-3 text-xs font-bold hover:bg-primary/10 focus:bg-primary/10 focus:text-primary transition-all cursor-pointer mb-1"
              >
                全部分类架构 (ALL)
              </DropdownMenuItem>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                <CategoryMenu
                  categories={categoryTree}
                  onSelect={setFilterCategory}
                  getDisplayName={getDisplayName}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 资产网格展示 */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-minimal px-2">
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-8">
            {paginatedAssets.map((asset) => {
              const isSelected = selectedIds.has(asset.id);
              const fileExt = asset.fileName?.toLowerCase().split('.').pop() || '';
              const isVideoFile = ['mp4', 'webm', 'ogg', 'mov'].includes(fileExt);
              const isDocFile = DOCUMENT_EXTS.includes(fileExt) || ARCHIVE_EXTS.includes(fileExt);
              const isArchive = ARCHIVE_EXTS.includes(fileExt);
              let actualType = asset.type || 'IMAGE';
              if (isVideoFile) actualType = 'VIDEO';
              if (isDocFile) actualType = 'DOCUMENT';

              return (
                <div
                  key={asset.id}
                  ref={el => { if (el) itemRefs.current.set(asset.id, el); else itemRefs.current.delete(asset.id); }}
                  className={cn(
                    "group relative bg-card/20 backdrop-blur-3xl rounded-[2.25rem] border transition-all duration-700 overflow-hidden",
                    isSelected
                      ? "border-primary/40 ring-4 ring-primary/10 shadow-[0_0_60px_-15px_rgba(var(--primary),0.3)] scale-[0.98]"
                      : "border-border/5 hover:border-primary/20 hover:bg-card/40"
                  )}
                  onClick={() => toggleSelectAsset(asset.id)}
                >
                  <div className="absolute top-5 left-5 z-20">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(e) => {
                        toggleSelectAsset(asset.id);
                      }}
                      className={cn(
                        "h-6 w-6 rounded-lg bg-background/40 backdrop-blur-2xl border-white/10 shadow-2xl transition-all duration-500",
                        isSelected ? "opacity-100 scale-110 bg-primary border-primary shadow-primary/40" : "opacity-0 group-hover:opacity-100"
                      )}
                    />
                  </div>

                  <div className="relative aspect-square bg-muted/5 overflow-hidden flex items-center justify-center m-2.5 rounded-[1.75rem] border border-white/5">
                    <div className="absolute inset-0 bg-[url('/checkerboard.png')] bg-repeat opacity-[0.03] pointer-events-none" />

                    {actualType === 'VIDEO' ? (
                      <div className="w-full h-full flex items-center justify-center bg-black/40 overflow-hidden">
                        <video
                          src={getAssetUrl(asset.url)}
                          className="max-w-full max-h-full object-contain opacity-60 transition-transform duration-1000 group-hover:scale-110"
                          muted
                          playsInline
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center backdrop-blur-[1px] z-10" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-14 w-14 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 shadow-2xl transition-all group-hover:scale-110 duration-700 group-hover:bg-primary/20">
                            <Play className="h-6 w-6 fill-white ml-1" />
                          </div>
                        </div>
                        {asset.duration && (
                          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 text-[9px] font-black font-mono text-white/80 uppercase tracking-tighter">
                            {Math.floor(asset.duration / 60)}:{(asset.duration % 60).toFixed(0).padStart(2, '0')}
                          </div>
                        )}
                      </div>
                    ) : actualType === 'DOCUMENT' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20">
                        {isArchive ? <Archive className="h-16 w-16 mb-4 opacity-40 transition-transform group-hover:scale-110" /> : <FileText className="h-16 w-16 mb-4 opacity-40 transition-transform group-hover:scale-110" />}
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-primary transition-colors">{fileExt.toUpperCase()}</span>
                      </div>
                    ) : (
                      <Image
                        src={getAssetUrl(asset.url)}
                        alt={asset.title}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-1000 ease-out"
                        unoptimized
                      />
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-700 backdrop-blur-[4px]">
                      {/* 中间全屏按钮 */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-12 w-12 rounded-2xl shadow-2xl bg-white/10 hover:bg-primary border border-white/10 group/btn transition-all scale-75 group-hover:scale-100 duration-500 text-white hover:text-black"
                          onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset); setPreviewZoom('fit'); }}
                          title="查看大图"
                        >
                          <Maximize className="h-5 w-5 transition-all" />
                        </Button>
                      </div>

                      {/* 右下角操作按钮组 */}
                      <div className="absolute bottom-3 right-3 flex gap-2 z-20 scale-90 origin-bottom-right transition-all group-hover:scale-100 duration-500">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-xl shadow-2xl bg-white/10 hover:bg-primary border border-white/10 group/btn text-white hover:text-black"
                          onClick={(e) => { e.stopPropagation(); handleCopy(asset.url); }}
                          title="复制链接"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-xl shadow-2xl bg-white/10 hover:bg-amber-500 border border-white/10 group/btn text-white"
                          onClick={(e) => { e.stopPropagation(); setEditingAsset(asset); }}
                          title="元数据修正"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-xl shadow-2xl bg-white/10 hover:bg-destructive border border-white/10 group/btn text-white"
                          onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset); }}
                          title="永久删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    </div>

                  <div className="p-5 pt-2 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-foreground truncate tracking-tight uppercase group-hover:text-primary transition-colors">{asset.title}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                          <span>{((asset.fileSize || 0) / 1024).toFixed(0)} KB</span>
                          <span>•</span>
                          <span className={cn("transition-colors", getFormatColorClass(asset.fileName))}>{asset.fileName.split('.').pop()?.toUpperCase()}</span>
                        </p>
                        <div className="h-3 w-px bg-border/10" />
                        <span className="text-[9px] font-black text-primary/70 uppercase tracking-widest truncate max-w-[80px]" title={getDisplayName(categories?.find(c => c.id === asset.categoryId))}>
                          {getDisplayName(categories?.find(c => c.id === asset.categoryId))}
                        </span>
                        {actualType === 'IMAGE' && (
                          <div className="h-3 w-px bg-border/10" />
                        )}
                        {actualType === 'IMAGE' && <AssetResolution id={asset.id} initialW={asset.width} initialH={asset.height} />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 空状态处理可以放在这里，或者保持原样 */
          null
        )}
      </div>

      {/* 资产统计与高密度分页控制 / ASSETS STATISTICS & HD PAGINATION CONTROL */}
      <div className="flex flex-col items-center gap-4 relative z-10 pt-8 pb-4">
        {filteredAssets.length > 0 && (
          <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-card/40 backdrop-blur-3xl px-4 py-2.5 rounded-2xl border border-border/10 shadow-2xl">
            当前分类及筛选条件下共有 <span className="text-primary font-black">{filteredAssets.length}</span> 个素材
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="rounded-2xl h-12 w-12 border-border/10 bg-card/40 backdrop-blur-3xl hover:bg-primary/10 hover:text-primary transition-all shadow-2xl"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 bg-card/40 backdrop-blur-3xl p-2 rounded-2xl border border-border/10 shadow-2xl">
              {paginationRange.map((page, idx) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs font-black text-muted-foreground/30 select-none">
                      ...
                    </span>
                  );
                }
                const pageNum = page as number;
                return (
                  <Button
                    key={`page-${pageNum}`}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={cn(
                      "h-10 min-w-[2.5rem] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                      currentPage === pageNum
                        ? "shadow-[0_10px_25px_-5px_rgba(var(--primary),0.4)] scale-110"
                        : "text-muted-foreground/40 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="rounded-2xl h-12 w-12 border-border/10 bg-card/40 backdrop-blur-3xl hover:bg-primary/10 hover:text-primary transition-all shadow-2xl"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 bg-card/40 backdrop-blur-3xl p-1.5 rounded-2xl border border-border/10 shadow-2xl">
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pl-2">跳转至</span>
              <Input
                type="text"
                value={jumpPageVal}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d+$/.test(val)) {
                    setJumpPageVal(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const p = parseInt(jumpPageVal);
                    if (!isNaN(p) && p >= 1 && p <= totalPages) {
                      setCurrentPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setJumpPageVal(currentPage.toString());
                    }
                  }
                }}
                className="w-12 h-9 rounded-xl bg-muted/10 border-transparent text-center text-xs font-bold focus:bg-muted/20 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                placeholder="页"
              />
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pr-2">/ {totalPages} 页</span>
            </div>
          </div>
        )}
      </div>

      {/* 高级批量操作栏 / PREMIUM BATCH ACTIONS BAR */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-700">
          <div className="bg-primary/[0.08] backdrop-blur-3xl border border-primary/20 p-2.5 px-3 rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(var(--primary),0.3)] flex items-center gap-2.5">
            <div className="px-5 h-11 flex items-center bg-primary rounded-full shadow-[0_0_30px_-5px_rgba(var(--primary),0.5)]">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-background">
                已选中 {selectedIds.size} 项资产
              </span>
            </div>

            <div className="h-10 w-px bg-primary/10 mx-1" />

            <Button
              variant="ghost"
              className="h-11 rounded-full px-5 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-primary/10 hover:text-primary transition-all"
              onClick={handleSelectCurrentPage}
            >
              {paginatedAssets.every(asset => selectedIds.has(asset.id))
                ? "取消本页"
                : "全选本页"}
            </Button>

            <Button
              variant="ghost"
              className="h-11 rounded-full px-5 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-primary/10 hover:text-primary transition-all"
              onClick={handleSelectAllFiltered}
            >
              {filteredAssets.every(asset => selectedIds.has(asset.id))
                ? "取消所有"
                : "全选所有"}
            </Button>

            <div className="h-10 w-px bg-primary/10 mx-1" />

            <Dialog open={isBatchCategoryDialogOpen} onOpenChange={setIsBatchCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="h-11 rounded-full px-6 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-primary/10 hover:text-primary transition-all gap-2">
                  <Layers className="h-4 w-4" /> 修改分类
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-3xl border-border/10 rounded-[2.5rem] max-w-md shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-4">
                  <DialogTitle className="text-xl font-black uppercase tracking-tighter text-primary">批量修改分类</DialogTitle>
                  <DialogDescription className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">正在将选中的资产重定向至新的逻辑分类节点</DialogDescription>
                </DialogHeader>
                <div className="px-8 py-6 space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pl-1">目标节点 / TARGET NODE</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full h-14 rounded-2xl bg-muted/10 border-border/5 hover:border-primary/20 justify-between px-5 font-black transition-all group">
                        <span className="text-xs uppercase tracking-tight truncate">
                          {batchTargetCategoryId ? getDisplayName(categories?.find(c => c.id === batchTargetCategoryId)) : '请选择目标分类...'}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={12} className="min-w-[18rem] p-2 rounded-[2rem] shadow-2xl border border-border/5 bg-card/95 backdrop-blur-3xl z-[1100]">
                      <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 px-4 py-3">可用节点目录</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border/10 my-1.5" />
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        <CategoryMenu
                          categories={categoryTree}
                          onSelect={setBatchTargetCategoryId}
                          getDisplayName={getDisplayName}
                        />
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <DialogFooter className="p-8 pt-4 bg-muted/5 flex gap-3">
                  <Button variant="ghost" onClick={() => setIsBatchCategoryDialogOpen(false)} className="rounded-2xl h-12 flex-1 text-[10px] font-black uppercase tracking-widest hover:bg-muted/10">取消操作</Button>
                  <Button onClick={handleBatchUpdateCategory} disabled={!batchTargetCategoryId} className="rounded-2xl h-12 flex-1 text-[10px] font-black uppercase tracking-widest bg-primary text-background shadow-lg shadow-primary/20">确认迁移</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" className="h-11 rounded-full px-6 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all gap-2" onClick={handleBatchDelete}>
              <Trash2 className="h-4 w-4" /> 批量粉碎
            </Button>

            <div className="h-10 w-px bg-primary/10 mx-1" />

            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full hover:bg-foreground/5 text-muted-foreground/40 hover:text-foreground transition-all" onClick={() => setSelectedIds(new Set())}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* 极光任务中心 / AURORA TASK HUB */}
      {isTasksPanelOpen && (
        <div className={cn(
          "fixed bottom-10 right-10 z-[1000] w-96 bg-card/60 backdrop-blur-3xl border border-border/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden transition-all duration-700 ease-in-out",
          isTasksPanelMinimized ? "h-16" : "h-[480px]"
        )}>
          <div className="bg-primary px-7 h-16 flex items-center justify-between text-background shadow-lg">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-background animate-pulse shadow-[0_0_10px_rgba(255,255,255,1)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">任务队列中心 / TASK HUB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-background/10 transition-all" onClick={() => setIsTasksPanelMinimized(!isTasksPanelMinimized)}>
                {isTasksPanelMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-background/10 transition-all" onClick={() => { setIsTasksPanelOpen(false); setUploadTasks([]); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!isTasksPanelMinimized && (
            <div className="flex flex-col h-[calc(480px-64px)] p-8 space-y-6 overflow-y-auto custom-scrollbar bg-muted/5">
              {uploadTasks.map(task => (
                <div key={task.id} className="group space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1 max-w-[70%]">
                      <p className="text-[11px] font-black text-foreground truncate uppercase tracking-tight group-hover:text-primary transition-colors">{task.fileName}</p>
                      <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        {task.status === 'completed' ? '处理完成' : task.status === 'error' ? '任务失败' : task.isUpdate ? '同步更新中' : '资产上传中'}
                      </p>
                    </div>
                    {task.status === 'completed' ? (
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shadow-primary" />
                      </div>
                    ) : task.status === 'error' ? (
                      <span className="text-[9px] font-black text-destructive uppercase tracking-tighter bg-destructive/5 px-2 py-1 rounded-md">{task.error}</span>
                    ) : (
                      <div className="h-6 w-6 flex items-center justify-center">
                        <Loader2 className="h-3.5 w-3.5 text-primary/40 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="relative h-1.5 w-full bg-muted/10 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 transition-all duration-700 ease-out rounded-full",
                        task.status === 'error' ? "bg-destructive shadow-[0_0_10px_rgba(var(--destructive),0.5)]" : "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                      )}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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

      <Dialog open={!!editingAsset} onOpenChange={o => !o && setEditingAsset(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-3xl border-border/10 rounded-[2.5rem] max-w-md shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4 bg-primary/[0.03] border-b border-white/5">
            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-primary flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              属性元数据修正
            </DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest mt-1">正在对核心资产的逻辑属性进行非破坏性修正</DialogDescription>
          </DialogHeader>
          {editingAsset && (
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pl-1">显示名称 / DISPLAY TITLE</Label>
                <Input
                  value={editingAsset.title}
                  onChange={e => setEditingAsset({ ...editingAsset, title: e.target.value })}
                  className="h-14 rounded-2xl bg-muted/10 border-border/5 focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-black uppercase tracking-tight"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pl-1">逻辑节点 / LOGICAL CATEGORY</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full h-14 rounded-2xl bg-muted/10 border-border/5 hover:border-primary/20 justify-between px-5 font-black transition-all group text-foreground">
                      <span className="text-xs uppercase tracking-tight truncate">
                        {editingAsset.categoryId ? getDisplayName(categories?.find(c => c.id === editingAsset.categoryId)) : '未分配节点'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" sideOffset={12} className="min-w-[18rem] p-2 rounded-[2rem] shadow-2xl border border-border/5 bg-card/95 backdrop-blur-3xl z-[1100]">
                    <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 px-4 py-3">节点树目录</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/10 my-1.5" />
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      <CategoryMenu
                        categories={categoryTree}
                        onSelect={(id: string) => setEditingAsset({ ...editingAsset, categoryId: id })}
                        getDisplayName={getDisplayName}
                      />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
          <DialogFooter className="p-8 pt-4 bg-muted/5 flex gap-3 border-t border-white/5">
            <Button variant="ghost" onClick={() => setEditingAsset(null)} className="rounded-2xl h-12 flex-1 text-[10px] font-black uppercase tracking-widest hover:bg-muted/10">放弃变更</Button>
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
                  toast({ title: "元数据同步成功" });
                } catch (e) {
                  toast({ variant: "destructive", title: "同步失败" });
                }
              }
            }} className="rounded-2xl h-12 flex-1 text-[10px] font-black uppercase tracking-widest bg-primary text-background shadow-lg shadow-primary/20">保存资产状态</Button>
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
        <DialogContent className="max-w-[98vw] w-full h-[95vh] p-0 overflow-hidden bg-black/95 backdrop-blur-3xl border-none shadow-[0_0_150px_rgba(0,0,0,0.8)] rounded-[3rem] flex flex-col [&>button:last-child]:hidden outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>极光预览: {previewAsset?.title}</DialogTitle>
            <DialogDescription>高保真高清素材全景预览</DialogDescription>
          </DialogHeader>

          {/* 悬浮工具栏 / FLOATING TOOLBAR */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-950/95 backdrop-blur-3xl p-2 px-3 rounded-full border border-white/10 shadow-2xl">
            <div className="flex bg-white/[0.03] rounded-full p-1 border border-white/5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewZoom('fit')}
                className={cn(
                  "h-10 rounded-full px-5 gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  previewZoom === 'fit' ? "bg-white text-black shadow-xl" : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <FitIcon className="h-4 w-4" /> 适应窗口
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewZoom('1:1')}
                className={cn(
                  "h-10 rounded-full px-5 gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  previewZoom === '1:1' ? "bg-white text-black shadow-xl" : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <ZoomIn className="h-4 w-4" /> 原始比例
              </Button>
            </div>

            <div className="h-8 w-px bg-white/10 mx-1" />

            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/5 hover:bg-primary hover:text-background text-white border-white/5 backdrop-blur-md transition-all duration-500"
              onClick={() => { window.open(previewAsset?.url, '_blank'); }}
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/5 hover:bg-destructive hover:text-white text-white border-white/5 backdrop-blur-md transition-all duration-500"
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
              "relative flex-1 overflow-auto flex items-center justify-center custom-scrollbar p-0",
              previewZoom === '1:1' ? "cursor-move" : "p-24"
            )}
          >
            {previewAsset && (
              <div className={cn("relative transition-all duration-700 ease-out", previewZoom === '1:1' ? "w-auto h-auto" : "w-full h-full flex items-center justify-center")}>
                <div className="absolute inset-0 bg-[url('/checkerboard.png')] bg-repeat opacity-[0.05] pointer-events-none rounded-xl" />

                {previewAsset.type === 'VIDEO' ? (
                  <video
                    src={getAssetUrl(previewAsset.url)}
                    controls
                    autoPlay
                    className={cn(
                      "shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 rounded-2xl transition-all duration-700",
                      previewZoom === 'fit' ? "max-w-full max-h-full" : "max-w-none w-auto h-auto"
                    )}
                    onLoadedMetadata={(e) => {
                      const vid = e.currentTarget;
                      setPreviewDimensions({ width: vid.videoWidth, height: vid.videoHeight });
                    }}
                  />
                ) : (
                  <img
                    src={getAssetUrl(previewAsset.url)}
                    alt={previewAsset.title}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      setPreviewDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                    }}
                    style={{ imageRendering: 'high-quality' }}
                    className={cn(
                      "shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 rounded-2xl transition-all duration-700",
                      previewZoom === 'fit' ? "max-w-full max-h-full" : "max-w-none w-auto h-auto"
                    )}
                  />
                )}
              </div>
            )}
          </div>

          {/* 底部信息面板 / BOTTOM INFO BAR */}
          <div className="bg-white/5 backdrop-blur-3xl p-8 px-10 border-t border-white/5 flex items-center justify-between text-white shrink-0">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/20 text-primary border-primary/20 h-6 px-3 text-[9px] font-black uppercase tracking-widest">
                  {previewAsset?.type || 'ASSET'}
                </Badge>
                <h4 className="font-black text-lg uppercase tracking-tight">{previewAsset?.title}</h4>
              </div>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">
                {previewAsset?.fileName} <span className="mx-2">•</span>
                {((previewAsset?.fileSize || 0) / 1024).toFixed(1)} KB <span className="mx-2">•</span>
                {previewDimensions ? `${previewDimensions.width} × ${previewDimensions.height} PX` : 'CALCULATING...'}
              </p>
            </div>
            <div className="flex items-center gap-6">
              {previewZoom === '1:1' && (
                <span className="flex items-center gap-2.5 text-[10px] font-black text-primary animate-pulse uppercase tracking-[0.2em]">
                  <Move className="h-4 w-4" /> 自由拖动预览细节
                </span>
              )}
              <Button
                variant="outline"
                className="rounded-2xl h-14 px-10 border-white/10 text-white bg-white/5 hover:bg-white/10 hover:border-primary/40 text-[11px] uppercase font-black tracking-widest transition-all"
                onClick={() => handleCopy(previewAsset?.url || '')}
              >
                复制原始引用地址
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-md p-0 overflow-hidden border border-border/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-background">
          <div className="p-10 space-y-8">
            <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold text-foreground tracking-tight">存储配额与余额配置</DialogTitle>
                <DialogDescription className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Bucket Quota & Balance Configuration</DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-[0.2em] pl-1">存储配额大小 (GB)</Label>
                <Input
                  type="number"
                  value={inputQuota}
                  onChange={e => setInputQuota(e.target.value)}
                  className="rounded-2xl h-12 bg-muted/10 border-transparent focus:bg-muted/20 text-sm font-bold shadow-inner"
                  placeholder="例如: 50"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-4 pt-4 border-t border-border/10">
              <Button variant="ghost" onClick={() => setIsConfigDialogOpen(false)} className="flex-1 rounded-2xl h-12 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/40 hover:text-foreground">
                取消
              </Button>
              <Button onClick={handleSaveConfig} className="flex-[2] rounded-2xl h-12 font-bold uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-white">
                保存配置
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}