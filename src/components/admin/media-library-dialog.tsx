"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLocalCollection } from '@/hooks/use-local-collection';
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
} from '@/components/ui/dialog';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface GalleryAsset {
  id: string;
  url: string;
  title: string;
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

const ITEMS_PER_PAGE = 18;

export function MediaLibraryDialog({
  open,
  onOpenChange,
  onSelect,
  selectionMode = 'single',
  maxSelection,
  title = "选择资产缩略图 .",
  subtitle = "GLOBAL ASSET LIBRARY SELECTOR"
}: MediaLibraryDialogProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
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
  
  const { data: assets, isLoading: isLoadingAssets } = useLocalCollection<GalleryAsset>('galleryAssets');
  const { data: categories, isLoading: isLoadingCategories } = useLocalCollection<GalleryCategory>('galleryCategories');

  // 过滤逻辑
  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = currentCategoryId === 'all' || a.categoryId === currentCategoryId;
      return matchSearch && matchCategory;
    });
  }, [assets, searchQuery, currentCategoryId]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssets.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAssets, currentPage]);

  // 重置分页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, currentCategoryId]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1400px] p-0 h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-none bg-white/95 backdrop-blur-3xl z-[1000]">
        {/* 深色头部 */}
        <div className="bg-slate-900 p-8 text-white flex items-center justify-between relative overflow-hidden shrink-0">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <ImageIcon className="h-24 w-24" />
           </div>
           <div className="flex items-center gap-4 relative z-10">
             <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
               <ImageIcon className="h-5 w-5" />
             </div>
             <div>
               <DialogTitle className="text-xl font-headline font-bold tracking-tight">{title}</DialogTitle>
               <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{subtitle}</DialogDescription>
             </div>
           </div>
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={handleCancel} 
             className="text-white hover:bg-white/10 h-10 w-10 relative z-10 rounded-full"
           >
             <X className="h-5 w-5" />
           </Button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧分类侧边栏 - 遵循 08. 树形结构菜单规范 8.1 基础层级形态 */}
          <div className="w-64 border-r border-slate-100 flex flex-col bg-slate-50/10 shrink-0">
             <div className="p-6 pb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 pl-2">资产目录架构</p>
                <Button 
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 rounded-lg h-10 text-[11px] font-bold uppercase tracking-wider transition-all",
                    currentCategoryId === 'all' 
                      ? "bg-slate-100 text-primary shadow-sm" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                  onClick={() => setCurrentCategoryId('all')}
                >
                  <LayoutGrid className={cn("h-4 w-4", currentCategoryId === 'all' ? "text-primary" : "text-slate-400")} />
                  全部素材库
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
                                isActive ? "bg-primary/5" : "hover:bg-slate-50/80"
                              )}
                              style={{ paddingLeft: `${level * 0.75 + 0.25}rem` }}
                            >
                               {/* 激活条 */}
                               {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary rounded-full" />}
                               
                               {/* 折叠箭头 */}
                               <div 
                                 className="w-6 h-6 flex items-center justify-center cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                                 onClick={(e) => toggleExpand(cat.id, e)}
                               >
                                 {hasChildren && (
                                   <ChevronRight className={cn("h-3 w-3 transition-transform duration-300", isExpanded && "rotate-90")} />
                                 )}
                               </div>

                               <Button 
                                 variant="ghost"
                                 className={cn(
                                   "flex-1 justify-start gap-2 h-9 text-[11px] font-semibold transition-all px-0 hover:bg-transparent",
                                   isActive ? "text-primary" : "text-slate-600"
                                 )}
                                 onClick={() => setCurrentCategoryId(cat.id)}
                               >
                                  <FolderOpen className={cn(
                                    "h-3.5 w-3.5 shrink-0", 
                                    isActive ? "text-primary" : "text-slate-400"
                                  )} />
                                  <span className="truncate">{cat.name}</span>
                               </Button>
                            </div>
                            {/* 递归且仅在展开时显示子级 */}
                            {hasChildren && isExpanded && buildTree(items, cat.id, level + 1)}
                          </React.Fragment>
                        );
                      });
                  };
                  return categories ? buildTree(categories) : null;
                })()}
             </div>
          </div>

          {/* 右侧主内容区 */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* 搜索栏 */}
            <div className="px-8 py-3 border-b border-slate-100 flex gap-6 items-center shrink-0 bg-white">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="搜索素材标题或文件名 / SEARCH ASSETS..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="pl-11 h-11 border-none bg-slate-50/50 text-xs font-medium rounded-xl focus-visible:ring-2 focus-visible:ring-primary/10" 
                />
              </div>
              <div className="flex items-center gap-4">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   共找到 {filteredAssets.length} 项
                 </p>
              </div>
            </div>

            {/* 资源内容区 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
              <div className="p-5 pb-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
                    const fileExt = asset.fileName?.split('.').pop()?.toUpperCase() || 'IMG';
                    return (
                      <div 
                        key={asset.id} 
                        className={cn(
                          "group relative aspect-square bg-white rounded-2xl border-2 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden transform-gpu", 
                          selectedIds.has(asset.id) 
                            ? "border-primary ring-4 ring-primary/10" 
                            : "border-transparent"
                        )} 
                        onClick={() => toggleSelectAsset(asset)}
                      >
                        {/* 图片主体 */}
                        <Image 
                          src={asset.url} 
                          alt={asset.title} 
                          fill 
                          className="object-contain p-4 transition-transform duration-700 group-hover:scale-110" 
                          unoptimized 
                        />
                        
                        {/* 底部动态毛玻璃信息浮层 - 仅悬停可见 */}
                        <div className="absolute left-[1px] right-[1px] bottom-[1px] py-2.5 px-4 bg-white/70 backdrop-blur-xl border-t border-slate-200/50 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20 rounded-b-2xl">
                           <div className="flex flex-col gap-1">
                              <p className="text-xs font-bold text-slate-800 truncate tracking-tight">
                                {asset.title}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-tighter">
                                  {fileExt}
                                </span>
                                {asset.width && asset.height && (
                                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                                    {asset.width} × {asset.height}
                                  </span>
                                )}
                              </div>
                           </div>
                        </div>

                        {/* 选中状态 */}
                        {selectedIds.has(asset.id) && (
                          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in duration-300 z-10 rounded-2xl">
                            <div className="bg-white text-primary rounded-full p-2 shadow-2xl scale-110">
                              <Check className="h-4 w-4 stroke-[4px]" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 分页控制栏 - 紧凑化 */}
            {totalPages > 1 && (
              <div className="px-8 py-3 border-t border-slate-100 flex items-center justify-center gap-4 bg-white shrink-0">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   disabled={currentPage === 1}
                   onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                   className="h-8 w-8 rounded-full"
                 >
                   <ChevronLeft className="h-4 w-4" />
                 </Button>
                 
                 <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, i, arr) => (
                        <React.Fragment key={p}>
                          {i > 0 && arr[i-1] !== p - 1 && <span className="text-slate-300 text-xs">...</span>}
                          <Button 
                            variant={currentPage === p ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(p)}
                            className={cn(
                              "h-8 w-8 rounded-lg text-[10px] font-bold",
                              currentPage === p ? "shadow-md shadow-primary/20" : "text-slate-500"
                            )}
                          >
                            {p}
                          </Button>
                        </React.Fragment>
                    ))}
                 </div>

                 <Button 
                   variant="ghost" 
                   size="icon" 
                   disabled={currentPage === totalPages}
                   onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                   className="h-8 w-8 rounded-full"
                 >
                   <ChevronRight className="h-4 w-4" />
                 </Button>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作 */}
        <DialogFooter className="p-6 border-t flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-4 animate-in slide-in-from-left duration-300">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-none py-1 px-3 text-[10px] font-bold uppercase tracking-widest">
                  已选择 {selectedIds.size} 项
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedIds(new Set())} 
                  className="text-[10px] font-bold text-destructive uppercase tracking-wider hover:bg-destructive/5"
                >
                  清除
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={handleCancel} 
              className="px-6 h-11 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100"
            >
              取消
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={selectedIds.size === 0}
              className="px-10 h-11 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              确认插入素材
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
