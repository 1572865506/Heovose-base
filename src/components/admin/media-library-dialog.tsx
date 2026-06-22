"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  Image as ImageIcon,
  X,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  LayoutGrid,
  Play,
  CloudUpload,
  FileText,
  Archive,
  Upload,
  File as FileIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getAssetUrl } from '@/lib/image-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export interface GalleryAsset {
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

export interface GalleryCategory {
  id: string;
  name: string;
  parentId: string | null;
}

interface MediaLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (assets: GalleryAsset[]) => void;
  selectionMode?: 'single' | 'multiple';
  maxSelection?: number;
  title?: string;
  subtitle?: string;
}

interface UploadTask {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const ITEMS_PER_PAGE = 18;

const DOCUMENT_EXTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
const ARCHIVE_EXTS = ['zip', 'rar', '7z', 'tar', 'gz'];

const compressImageFile = (file: File, quality: number): Promise<File> => {
  return new Promise((resolve) => {
    const isImg = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!isImg) {
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
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        let ctx: CanvasRenderingContext2D | null = null;
        try {
          ctx = canvas.getContext('2d', { colorSpace: 'display-p3' }) as CanvasRenderingContext2D;
        } catch (e) {
          ctx = canvas.getContext('2d');
        }

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
        
        const outputFormat = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
        const extension = file.type === 'image/jpeg' ? '.jpg' : '.webp';

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + extension, {
                type: outputFormat,
                lastModified: Date.now(),
              });
              
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
          canvasQuality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export function MediaLibraryDialog({
  open,
  onOpenChange,
  onSelect,
  selectionMode = 'single',
  maxSelection,
  title = "资源管理中心",
  subtitle = "GLOBAL ASSET RESOURCE MANAGEMENT"
}: MediaLibraryDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all');
  
  // Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [enableCompression, setEnableCompression] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(85);
  const [targetUploadCategoryId, setTargetUploadCategoryId] = useState<string>('');
  const [duplicateStrategy, setDuplicateStrategy] = useState<'rename' | 'overwrite'>('rename');

  const { data: assets, isLoading: isLoadingAssets, mutate: mutateAssets } = useLocalCollection<GalleryAsset>('galleryAssets');
  const { data: categories, isLoading: isLoadingCategories } = useLocalCollection<GalleryCategory>('galleryCategories');

  // Handle default selection based on currentCategoryId (if not 'all')
  useEffect(() => {
    if (categories && categories.length > 0) {
      if (currentCategoryId && currentCategoryId !== 'all') {
        setTargetUploadCategoryId(currentCategoryId);
      } else {
        setTargetUploadCategoryId('');
      }
    }
  }, [categories, currentCategoryId]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Filter Logic
  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = currentCategoryId === 'all' || a.categoryId === currentCategoryId;
      
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
  }, [assets, searchQuery, currentCategoryId, filterType]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssets.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAssets, currentPage]);

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setSearchQuery('');
      setCurrentPage(1);
      setActiveTab('library');
      setPendingFiles([]);
      setUploadTasks([]);
      setEnableCompression(false);
      setCompressionQuality(85);
    }
  }, [open]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategoryId, searchQuery, filterType]);

  const toggleSelectAsset = (asset: GalleryAsset) => {
    const newSelected = new Set(selectedIds);
    if (selectionMode === 'single') {
      newSelected.clear();
      newSelected.add(asset.id);
    } else {
      if (newSelected.has(asset.id)) {
        newSelected.delete(asset.id);
      } else {
        if (maxSelection && newSelected.size >= maxSelection) {
          toast({ variant: "destructive", title: "选择上限", description: `最多只能选择 ${maxSelection} 项素材` });
          return;
        }
        newSelected.add(asset.id);
      }
    }
    setSelectedIds(newSelected);
  };

  // --- Upload Logic ---
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    
    // Check file size (20MB limit)
    const oversized = fileArray.filter(f => f.size > 20 * 1024 * 1024);
    if (oversized.length > 0) {
      toast({
        variant: "destructive",
        title: "文件过大",
        description: `${oversized.length} 个文件超过了 20MB 限制。`
      });
      return;
    }
    setPendingFiles(prev => [...prev, ...fileArray]);
  };

  const startUpload = async () => {
    if (pendingFiles.length === 0 || !targetUploadCategoryId) return;
    setIsUploading(true);
    
    try {
      const currentFiles = [...pendingFiles];
      setPendingFiles([]);
      
      const newTasks: UploadTask[] = currentFiles.map((file, i) => ({
        id: `task_${Date.now()}_${i}`,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }));
      setUploadTasks(prev => [...prev, ...newTasks]);

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

          if (!uploadRes.ok) throw new Error("上传请求失败");
          const { url, fileName } = await uploadRes.json();

          const fileExt = uploadFile.name.toLowerCase().split('.').pop() || '';
          const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(fileExt);
          const isDoc = DOCUMENT_EXTS.includes(fileExt) || ARCHIVE_EXTS.includes(fileExt);
          
          let w = 0, h = 0, duration = 0;
          
          // Metadata extraction
          if (isVideo) {
            const getVideoMetadata = (url: string): Promise<{w:number,h:number,d:number}> => {
               return new Promise((resolve) => {
                 const video = document.createElement('video');
                 video.preload = 'metadata';
                 video.onloadedmetadata = () => resolve({w:video.videoWidth, h:video.videoHeight, d:video.duration});
                 video.onerror = () => resolve({w:0, h:0, d:0});
                 video.src = url;
               });
            };
            const meta = await getVideoMetadata(url);
            w = meta.w; h = meta.h; duration = meta.d;
          } else if (!isDoc) {
            const getImageDimensions = (url: string): Promise<{w:number,h:number}> => {
              return new Promise((resolve) => {
                const img = new (window as any).Image();
                img.onload = () => resolve({w:img.naturalWidth, h:img.naturalHeight});
                img.onerror = () => resolve({w:0, h:0});
                img.src = url;
              });
            };
            const dims = await getImageDimensions(url);
            w = dims.w; h = dims.h;
          }

          const title = uploadFile.name.split('.')[0];
          let assetId = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          
          // --- Duplicate Handling Strategy ---
          if (duplicateStrategy === 'overwrite' && assets) {
            const existing = assets.find(a => a.title === title && a.categoryId === targetUploadCategoryId);
            if (existing) {
              assetId = existing.id;
            }
          }

          const assetData = {
            id: assetId,
            url,
            type: isVideo ? 'VIDEO' : (isDoc ? 'DOCUMENT' : 'IMAGE'),
            title: title,
            fileName: fileName,
            fileSize: uploadFile.size,
            categoryId: targetUploadCategoryId,
            width: w > 0 ? w : undefined,
            height: h > 0 ? h : undefined,
            duration: duration > 0 ? duration : undefined
          };

          const saveRes = await fetch(`/api/galleryAssets/${assetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assetData),
          });

          if (!saveRes.ok) throw new Error("无法保存资产记录");

          setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t));
        } catch (e: any) {
          setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error', error: e.message } : t));
        }
      }
      
      mutateAssets();
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = () => {
    if (!onSelect || !assets) return;
    const selectedAssets = assets.filter(a => selectedIds.has(a.id));
    onSelect(selectedAssets);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedIds(new Set());
    onOpenChange(false);
  };

  const AssetIcon = ({ type, fileName }: { type: string, fileName: string }) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (type === 'VIDEO') return <Play className="h-8 w-8 text-white/40" />;
    if (ARCHIVE_EXTS.includes(ext)) return <Archive className="h-10 w-10 text-slate-300" />;
    if (DOCUMENT_EXTS.includes(ext)) return <FileText className="h-10 w-10 text-slate-300" />;
    return <ImageIcon className="h-10 w-10 text-slate-300" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1400px] p-0 h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-100 admin-interface-dark:border-border/60 bg-background z-[10002]">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white flex items-center justify-between relative overflow-hidden shrink-0">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <CloudUpload className="h-24 w-24" />
           </div>
           <div className="flex items-center gap-6 relative z-10">
             <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
               {activeTab === 'library' ? <ImageIcon className="h-6 w-6" /> : <CloudUpload className="h-6 w-6 text-primary" />}
             </div>
             <div>
               <DialogTitle className="text-2xl font-headline font-bold tracking-tight">{title}</DialogTitle>
               <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{subtitle}</DialogDescription>
             </div>
           </div>
           
           <div className="flex items-center gap-8 relative z-10 mr-12">
             <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="bg-white/5 p-1 rounded-xl border border-white/10">
               <TabsList className="bg-transparent h-10 gap-1">
                 <TabsTrigger value="library" className="rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900">素材库预览</TabsTrigger>
                 <TabsTrigger value="upload" className="rounded-lg px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">本地上传</TabsTrigger>
               </TabsList>
             </Tabs>
             <Button variant="ghost" size="icon" onClick={handleCancel} className="text-white hover:bg-white/10 h-10 w-10 rounded-full">
               <X className="h-5 w-5" />
             </Button>
           </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {activeTab === 'library' ? (
            <>
              {/* Library Sidebar */}
              <div className="w-64 border-r border-slate-100 admin-interface-dark:border-border/60 flex flex-col bg-slate-50/10 admin-interface-dark:bg-muted/10 shrink-0">
                 <div className="p-6 pb-2">
                    <p className="text-[10px] font-bold text-slate-400 admin-interface-dark:text-muted-foreground uppercase tracking-[0.2em] mb-4 pl-2">资源目录树</p>
                    <Button 
                      variant="ghost"
                      className={cn(
                        "group w-full justify-start gap-3 rounded-xl h-11 text-[11px] font-bold uppercase tracking-wider transition-all",
                        currentCategoryId === 'all' 
                          ? "bg-slate-900 admin-interface-dark:bg-slate-800 text-white shadow-lg shadow-slate-200/5" 
                          : "text-slate-600 admin-interface-dark:text-muted-foreground/80 hover:bg-slate-100 admin-interface-dark:hover:bg-muted/40 hover:text-slate-900 admin-interface-dark:hover:text-foreground"
                      )}
                      onClick={() => setCurrentCategoryId('all')}
                    >
                      <LayoutGrid className={cn("h-4 w-4 transition-colors", currentCategoryId === 'all' ? "text-white" : "text-slate-400 admin-interface-dark:text-muted-foreground/60 group-hover:text-slate-900 admin-interface-dark:group-hover:text-foreground")} />
                      全部资源
                    </Button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-3 pt-0 space-y-0.5 custom-scrollbar">
                    {isLoadingCategories ? (
                      <div className="flex justify-center p-8 opacity-20"><Loader2 className="h-5 w-5 animate-spin" /></div>
                    ) : (() => {
                      const buildTree = (items: GalleryCategory[], parentId: string | null = null, level = 0): React.ReactNode[] => {
                        return items
                          .filter(item => (item.parentId || null) === parentId)
                          .map(cat => {
                            const isActive = currentCategoryId === cat.id;
                            const hasChildren = items.some(child => child.parentId === cat.id);
                            const isExpanded = expandedIds.has(cat.id);

                            return (
                              <React.Fragment key={cat.id}>
                                <div 
                                  className={cn(
                                    "group flex items-center rounded-lg transition-all mb-0.5 relative",
                                    isActive ? "bg-primary/5" : "hover:bg-slate-100/50 admin-interface-dark:hover:bg-muted/30"
                                  )}
                                  style={{ paddingLeft: `${level * 0.75 + 0.25}rem` }}
                                >
                                   {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary rounded-full" />}
                                   <div 
                                     className="w-6 h-6 flex items-center justify-center cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                                     onClick={(e) => toggleExpand(cat.id, e)}
                                   >
                                     {hasChildren && <ChevronRight className={cn("h-3 w-3 transition-transform duration-300", isExpanded && "rotate-90", isActive ? "text-primary" : "text-slate-400 admin-interface-dark:text-muted-foreground/60")} />}
                                   </div>
                                   <Button 
                                     variant="ghost"
                                     className={cn(
                                       "flex-1 justify-start gap-2 h-9 text-[11px] font-semibold transition-all px-0 hover:bg-transparent",
                                       isActive ? "text-primary font-bold" : "text-slate-600 admin-interface-dark:text-muted-foreground/80 group-hover:text-slate-900 admin-interface-dark:group-hover:text-foreground"
                                     )}
                                     onClick={() => setCurrentCategoryId(cat.id)}
                                   >
                                      <FolderOpen className={cn("h-3.5 w-3.5 shrink-0 transition-colors", isActive ? "text-primary" : "text-slate-400 admin-interface-dark:text-muted-foreground/50 group-hover:text-slate-900 admin-interface-dark:group-hover:text-foreground")} />
                                      <span className="truncate">{cat.name}</span>
                                   </Button>
                                </div>
                                {hasChildren && isExpanded && buildTree(items, cat.id, level + 1)}
                              </React.Fragment>
                            );
                          });
                      };
                      return categories ? buildTree(categories) : null;
                    })()}
                 </div>
              </div>

              {/* Library Main Area */}
              <div className="flex-1 flex flex-col overflow-hidden bg-background">
                <div className="px-8 py-4 border-b border-slate-100 admin-interface-dark:border-border/60 flex gap-6 items-center shrink-0 bg-background">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input placeholder="搜索素材标题或文件名..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-11 h-12 border-none bg-slate-50 admin-interface-dark:bg-muted/40 font-medium rounded-xl text-foreground placeholder:text-slate-400 admin-interface-dark:placeholder:text-muted-foreground/50" />
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex bg-slate-100 admin-interface-dark:bg-muted/30 p-1 rounded-xl shrink-0">
                        {['all', 'image', 'video', 'document'].map((t) => (
                          <Button 
                            key={t}
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setFilterType(t as any)}
                            className={cn("h-8 rounded-lg px-4 text-[10px] font-bold uppercase transition-all", filterType === t ? "bg-white admin-interface-dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400 admin-interface-dark:text-muted-foreground hover:text-slate-900 admin-interface-dark:hover:text-foreground hover:bg-slate-200/50 admin-interface-dark:hover:bg-muted/20")}
                          >
                            {t === 'all' ? '全部' : t === 'image' ? '图片' : t === 'video' ? '视频' : '文档'}
                          </Button>
                        ))}
                     </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 admin-interface-dark:bg-muted/5 p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {isLoadingAssets ? (
                      <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 opacity-40">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">正在接入素材库数据...</p>
                      </div>
                    ) : paginatedAssets.length === 0 ? (
                      <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 opacity-20">
                         <ImageIcon className="h-20 w-20" />
                         <p className="text-[10px] font-bold uppercase tracking-widest">该分类下暂无匹配素材</p>
                      </div>
                    ) : (
                      paginatedAssets.map(asset => {
                        const fileExt = asset.fileName?.split('.').pop()?.toLowerCase() || '';
                        const isVideo = asset.type === 'VIDEO';
                        const isDoc = asset.type === 'DOCUMENT';

                        return (
                          <div 
                            key={asset.id} 
                            className={cn(
                              "group relative aspect-square bg-white admin-interface-dark:bg-card rounded-2xl border-2 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden transform-gpu", 
                              selectedIds.has(asset.id) 
                                ? "border-primary ring-4 ring-primary/10" 
                                : "border-transparent hover:border-slate-200 admin-interface-dark:hover:border-border/60"
                            )} 
                            onClick={() => toggleSelectAsset(asset)}
                          >
                            {isVideo ? (
                              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                 <video src={getAssetUrl(asset.url)} className="max-w-full max-h-full object-contain opacity-60" muted playsInline />
                                 <div className="absolute inset-0 flex items-center justify-center">
                                   <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30"><Play className="h-4 w-4 fill-white ml-0.5" /></div>
                                 </div>
                              </div>
                            ) : isDoc ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 admin-interface-dark:bg-muted/30 gap-3">
                                 <AssetIcon type={asset.type} fileName={asset.fileName} />
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fileExt}</span>
                              </div>
                            ) : (
                              <Image src={getAssetUrl(asset.url)} alt={asset.title} fill className="object-contain p-4 transition-transform duration-700 group-hover:scale-110" unoptimized />
                            )}
                            
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-white/95 admin-interface-dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 admin-interface-dark:border-border/40 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-300">
                               <p className="text-[10px] font-bold text-foreground truncate">{asset.title}</p>
                               <p className="text-[8px] text-slate-400 admin-interface-dark:text-muted-foreground/60 font-mono">{( (asset.fileSize || 0) / 1024).toFixed(0)}KB</p>
                            </div>

                            {selectedIds.has(asset.id) && (
                              <div className="absolute inset-0 bg-primary/10 admin-interface-dark:bg-primary/20 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in duration-300 z-10">
                                <div className="bg-white admin-interface-dark:bg-slate-900 text-primary rounded-full p-2 shadow-2xl scale-110"><Check className="h-4 w-4 stroke-[4px]" /></div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                
                {totalPages > 1 && (
                  <div className="px-8 py-3 border-t border-slate-100 admin-interface-dark:border-border/60 flex items-center justify-center gap-4 bg-background shrink-0">
                     <Button variant="ghost" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="h-8 w-8 rounded-full"><ChevronLeft className="h-4 w-4" /></Button>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 admin-interface-dark:text-muted-foreground">第 {currentPage} 页 / 共 {totalPages} 页</p>
                     <Button variant="ghost" size="icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="h-8 w-8 rounded-full"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Upload Tab Content */
            <div className="flex-1 flex flex-col p-12 bg-slate-50/50 admin-interface-dark:bg-muted/5 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-7xl mx-auto w-full">
                  <div className="md:col-span-7 space-y-8">
                     <div 
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
                        onClick={() => pendingFiles.length === 0 && fileInputRef.current?.click()}
                        className={cn(
                           "h-[450px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group bg-white admin-interface-dark:bg-card shadow-sm",
                           pendingFiles.length > 0 ? "border-primary/40" : "border-slate-200 admin-interface-dark:border-border/60 hover:border-primary/40 hover:bg-primary/[0.01] admin-interface-dark:hover:bg-primary/[0.03]"
                        )}
                     >
                        <input type="file" ref={fileInputRef} multiple className="hidden" onChange={e => handleFileUpload(e.target.files)} />
                        {pendingFiles.length === 0 ? (
                           <div className="text-center space-y-4">
                              <div className="h-20 w-20 rounded-3xl bg-slate-50 admin-interface-dark:bg-muted/40 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                                 <CloudUpload className="h-10 w-10 text-slate-300 group-hover:text-primary" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-lg font-bold text-slate-900 admin-interface-dark:text-foreground tracking-tight">拖放本地文件至此处</p>
                                 <p className="text-[10px] font-bold text-slate-400 admin-interface-dark:text-muted-foreground uppercase tracking-widest">支持图片、视频、PDF 及压缩包 (最大 20MB)</p>
                              </div>
                              <Button variant="outline" className="rounded-xl h-12 px-8 border-slate-200 admin-interface-dark:border-border/60 text-xs font-bold uppercase tracking-widest mt-4 text-foreground hover:bg-slate-100 admin-interface-dark:hover:bg-muted/40">浏览文件库</Button>
                           </div>
                        ) : (
                           <div className="w-full h-full flex flex-col p-8" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-between mb-6">
                                 <Badge className="bg-primary text-white border-none py-1.5 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest">待上传队列 ({pendingFiles.length})</Badge>
                                 <Button variant="ghost" onClick={() => setPendingFiles([])} className="text-[10px] font-bold text-destructive uppercase tracking-widest hover:bg-destructive/5">全部移除</Button>
                              </div>
                              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                 {pendingFiles.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 admin-interface-dark:bg-muted/20 rounded-2xl border border-slate-100 admin-interface-dark:border-border/40 group/item">
                                       <div className="flex items-center gap-4 overflow-hidden">
                                          <div className="h-10 w-10 rounded-xl bg-white admin-interface-dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                                             <FileIcon className="h-5 w-5 text-slate-400" />
                                          </div>
                                          <div className="flex flex-col overflow-hidden">
                                             <span className="text-xs font-bold text-slate-700 admin-interface-dark:text-foreground truncate">{file.name}</span>
                                             <span className="text-[9px] font-bold text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                          </div>
                                       </div>
                                       <Button size="icon" variant="ghost" onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))} className="h-8 w-8 text-slate-300 hover:text-destructive"><X className="h-4 w-4" /></Button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
                  
                  <div className="md:col-span-5 space-y-10">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 admin-interface-dark:text-muted-foreground tracking-[0.2em] pl-1">保存归属分类</Label>
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full h-14 rounded-2xl bg-white admin-interface-dark:bg-card border-slate-200 admin-interface-dark:border-border/60 shadow-sm justify-between px-6 font-bold text-xs text-foreground hover:bg-slate-50 admin-interface-dark:hover:bg-muted/30 group">
                                 <span className="truncate">
                                    {targetUploadCategoryId ? (categories?.find(c => c.id === targetUploadCategoryId)?.name || '未知分类') : '选择目标目录'}
                                 </span>
                                 <ChevronDown className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
                              </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="start" className="w-[300px] rounded-2xl p-2 border border-slate-100 admin-interface-dark:border-border bg-white admin-interface-dark:bg-popover text-slate-900 admin-interface-dark:text-popover-foreground shadow-2xl animate-in zoom-in-95 duration-200 z-[11000]">
                              <DropdownMenuLabel className="text-[10px] uppercase font-bold opacity-40 px-3 py-2">可用分类列表</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-100 admin-interface-dark:bg-muted my-1" />
                              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                 {categories?.map(cat => (
                                    <DropdownMenuItem 
                                       key={cat.id} 
                                       onClick={() => setTargetUploadCategoryId(cat.id)}
                                       className="rounded-xl py-3 px-4 text-xs font-bold transition-all focus:bg-primary/5 admin-interface-dark:focus:bg-muted/50 text-slate-700 admin-interface-dark:text-popover-foreground cursor-pointer"
                                    >
                                       {cat.name}
                                    </DropdownMenuItem>
                                 ))}
                              </div>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     </div>

                     <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 admin-interface-dark:text-muted-foreground tracking-[0.2em] pl-1">重复文件冲突策略</Label>
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full h-14 rounded-2xl bg-white admin-interface-dark:bg-card border-slate-200 admin-interface-dark:border-border/60 shadow-sm justify-between px-6 font-bold text-xs text-foreground hover:bg-slate-50 admin-interface-dark:hover:bg-muted/30 group">
                                 <span className={cn("truncate", duplicateStrategy === 'overwrite' && "text-orange-600")}>
                                    {duplicateStrategy === 'rename' ? '自动重命名 (生成副本)' : '覆盖现有文件 (全站同步)'}
                                 </span>
                                 <ChevronDown className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
                              </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="start" className="w-[300px] rounded-2xl p-2 border border-slate-100 admin-interface-dark:border-border bg-white admin-interface-dark:bg-popover text-slate-900 admin-interface-dark:text-popover-foreground shadow-2xl animate-in zoom-in-95 duration-200 z-[11000]">
                              <DropdownMenuItem 
                                 onClick={() => setDuplicateStrategy('rename')}
                                 className="rounded-xl py-3 px-4 text-xs font-bold transition-all focus:bg-primary/5 admin-interface-dark:focus:bg-muted/50 text-slate-700 admin-interface-dark:text-popover-foreground cursor-pointer"
                              >
                                 自动重命名 (生成副本)
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                 onClick={() => setDuplicateStrategy('overwrite')}
                                 className="rounded-xl py-3 px-4 text-xs font-bold text-orange-600 transition-all focus:bg-orange-50 admin-interface-dark:focus:bg-orange-950/20 cursor-pointer"
                              >
                                 覆盖现有文件 (全站同步)
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
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
 
                      <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><CloudUpload className="h-4 w-4 text-primary" /></div>
                           <p className="text-[11px] font-bold text-primary uppercase tracking-widest">智能上传协议</p>
                        </div>
                        <p className="text-[10px] text-primary/60 leading-relaxed italic font-medium">
                           系统将自动识别文件指纹。重复文件将自动重命名并版本化存储。所有上传均经过 SSL 加密同步至云端资源池。
                        </p>
                     </div>

                     {uploadTasks.length > 0 && (
                        <div className="space-y-4 animate-in fade-in duration-500">
                           <Label className="text-[10px] font-bold uppercase text-slate-400 admin-interface-dark:text-muted-foreground tracking-widest pl-1">正在处理任务 ({uploadTasks.filter(t => t.status === 'completed').length}/{uploadTasks.length})</Label>
                           <div className="max-h-[200px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                              {uploadTasks.map(task => (
                                 <div key={task.id} className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight">
                                       <span className="truncate max-w-[200px] text-slate-600 admin-interface-dark:text-muted-foreground">{task.fileName}</span>
                                       {task.status === 'completed' ? <span className="text-green-600">已完成</span> : task.status === 'error' ? <span className="text-destructive">{task.error}</span> : <span className="animate-pulse text-primary">上传中...</span>}
                                    </div>
                                    <Progress value={task.progress} className="h-1 rounded-full bg-slate-100 admin-interface-dark:bg-muted [&>div]:bg-primary" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                     
                     <Button 
                        onClick={startUpload} 
                        disabled={pendingFiles.length === 0 || isUploading || !targetUploadCategoryId}
                        className="w-full h-16 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 gap-3"
                     >
                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CloudUpload className="h-5 w-5" />}
                        {!targetUploadCategoryId ? '请先选择归属分类' : '立即同步至云端素材库'}
                     </Button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-6 border-t border-slate-100 admin-interface-dark:border-border/60 flex items-center justify-between bg-background shrink-0">
          <div className="flex items-center gap-4">
            {selectedIds.size > 0 && (
              <Badge className="bg-primary/10 text-primary border-none py-1.5 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest animate-in slide-in-from-left duration-300">
                已选中 {selectedIds.size} 项资源
              </Badge>
            )}
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={handleCancel} className="px-8 h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 admin-interface-dark:text-muted-foreground/60 hover:text-slate-800 admin-interface-dark:hover:text-foreground hover:bg-slate-50 admin-interface-dark:hover:bg-muted/40">放弃更改</Button>
            <Button 
              onClick={handleConfirm} 
              disabled={selectedIds.size === 0 || activeTab === 'upload'}
              className="px-12 h-12 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              确认插入所选资产
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
