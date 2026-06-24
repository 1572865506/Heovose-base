"use client";

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  Package,
  Image as ImageIcon,
  AlertTriangle,
  Search,
  Calendar,
  Loader2,
  Database,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { GlassCard } from '@/components/admin/GlassCard';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { getAssetUrl } from '@/lib/image-utils';

interface DeletedProduct {
  id: string;
  status: string;
  nameTextId: string;
  categoryId: string | null;
  mainImageUrl: string | null;
  createdAt: string;
  deletedAt: string;
  deletedBy?: string | null;
  nameText?: {
    content?: any;
    zh?: string;
    en?: string;
  };
  category?: {
    id: string;
    slug: string;
  };
}

interface DeletedAsset {
  id: string;
  title: string;
  url: string;
  fileName: string;
  fileSize: number | null;
  type: string;
  deletedAt: string;
  deletedBy?: string | null;
}

export default function RecycleBinPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'products' | 'assets'>('products');
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<DeletedProduct[]>([]);
  const [assets, setAssets] = useState<DeletedAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 多选项目
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 确认对话框状态
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'restore' | 'delete'>('restore');
  const [targetItem, setTargetItem] = useState<{ type: 'product' | 'asset'; id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取数据
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/recycle-bin');
      if (!res.ok) throw new Error('加载数据失败');
      const data = await res.json();
      setProducts(data.products || []);
      setAssets(data.assets || []);
      setSelectedIds([]); // 清空勾选
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: '错误',
        description: '未能成功获取回收站数据'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 监听 Tab 切换，清空搜索和勾选
  const handleTabChange = (tab: 'products' | 'assets') => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedIds([]);
  };

  // 格式化文件大小
  const formatBytes = (bytes: number | null) => {
    if (bytes === null || bytes === undefined) return '-';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 获取格式化后的短日期 (如 06/24 14:52)
  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const full = formatDate(dateStr);
    return full.substring(5, 16);
  };

  // 截取用户邮箱前缀用于小 Badge 展示
  const getShortUser = (email: string | null | undefined) => {
    if (!email) return '未知';
    return email.split('@')[0];
  };

  // 获取产品本地化标题
  const getProductTitle = (product: DeletedProduct) => {
    const content = product.nameText?.content;
    if (content) {
      if (typeof content === 'object') {
        return content.zh || content.en || product.id;
      }
      try {
        const parsed = JSON.parse(content);
        return parsed.zh || parsed.en || product.id;
      } catch (_) {}
    }
    return product.nameText?.zh || product.nameText?.en || product.id;
  };

  // 过滤后的列表
  const filteredProducts = products.filter(p => {
    const title = getProductTitle(p).toLowerCase();
    const id = p.id.toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || id.includes(query);
  });

  const filteredAssets = assets.filter(a => {
    const title = a.title.toLowerCase();
    const fileName = a.fileName.toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || fileName.includes(query);
  });

  // 获取当前活跃列表数据
  const activeItems = activeTab === 'products' ? filteredProducts : filteredAssets;
  const isAllSelected = activeItems.length > 0 && activeItems.every(item => selectedIds.includes(item.id));

  // 单选勾选切换
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 全选/取消全选切换
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // 如果已全选，则把当前过滤列表中的项全部取消勾选
      const itemIds = activeItems.map(item => item.id);
      setSelectedIds(prev => prev.filter(id => !itemIds.includes(id)));
    } else {
      // 勾选当前过滤列表里的全部项
      const itemIds = activeItems.map(item => item.id);
      setSelectedIds(prev => {
        const merged = [...prev, ...itemIds];
        return Array.from(new Set(merged));
      });
    }
  };

  // 执行恢复/彻底删除操作
  const handleAction = async () => {
    if (!targetItem) return;
    setIsSubmitting(true);
    
    // 如果是 batch 模式，我们把勾选的数组发过去；否则只发单个 id
    const isBatch = targetItem.id === 'batch';
    const payload = {
      type: targetItem.type,
      id: isBatch ? undefined : targetItem.id,
      ids: isBatch ? selectedIds : undefined
    };

    try {
      if (actionType === 'restore') {
        const res = await fetch('/api/admin/recycle-bin/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('恢复失败');
        toast({
          title: '恢复成功',
          description: isBatch 
            ? `已成功将选中的 ${selectedIds.length} 项恢复至草稿/资产列表`
            : `已成功将「${targetItem.name}」恢复至草稿/资产列表`
        });
      } else {
        const res = await fetch('/api/admin/recycle-bin/permanently', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('彻底删除失败');
        toast({
          title: '物理清空成功',
          description: isBatch 
            ? `已将选中的 ${selectedIds.length} 项资源彻底销毁`
            : `已将「${targetItem.name}」及其关联资源彻底销毁`
        });
      }
      setConfirmOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: '操作失败',
        description: '处理您的请求时遇到了内部错误'
      });
    } finally {
      setIsSubmitting(false);
      setTargetItem(null);
    }
  };

  const openConfirm = (type: 'restore' | 'delete', resourceType: 'product' | 'asset', item: any) => {
    const isBatch = item === 'batch';
    const name = isBatch 
      ? `选中的 ${selectedIds.length} 项资源`
      : (resourceType === 'product' ? getProductTitle(item) : item.title || item.fileName);
      
    setActionType(type);
    setTargetItem({ type: resourceType, id: isBatch ? 'batch' : item.id, name });
    setConfirmOpen(true);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-28 relative">
      <AdminPageHeader
        title="回收站"
        subtitle="Recycle Bin / Safety Management"
        icon={Trash2}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Selector */}
        <div className="inline-flex p-1 rounded-2xl bg-card border border-border/20 backdrop-blur-md self-start">
          <button
            onClick={() => handleTabChange('products')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'products'
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
            }`}
          >
            <Package className="h-4 w-4" />
            已删除产品 ({products.length})
          </button>
          <button
            onClick={() => handleTabChange('assets')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'assets'
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            已删除素材 ({assets.length})
          </button>
        </div>

        {/* Search Input and Bulk Checkbox Toggle */}
        <div className="flex flex-wrap items-center gap-4">
          {activeItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleToggleSelectAll}
              className="h-11 rounded-xl text-xs font-bold px-4 border-border/20 bg-card hover:bg-muted/10 flex items-center gap-2 text-foreground"
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span>取消全选</span>
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 text-muted-foreground" />
                  <span>全选本页</span>
                </>
              )}
            </Button>
          )}

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={activeTab === 'products' ? "搜索已删产品标题..." : "搜索素材名称或文件名..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIds([]); // 搜索条件变化时重置勾选以避免误删看不到的项目
              }}
              className="w-full h-11 pl-11 pr-4 rounded-xl text-xs bg-card border border-border/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground font-bold tracking-wider">正在加载已删除项...</span>
        </div>
      ) : activeTab === 'products' ? (
        /* 产品回收站 */
        filteredProducts.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center py-20 text-center border-none">
            <Database className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-sm font-bold text-foreground mb-1">产品回收站空空如也</h3>
            <p className="text-xs text-muted-foreground">目前没有任何被软删除的产品记录。</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              return (
                <GlassCard 
                  key={product.id} 
                  className={`border-none rounded-[1.5rem] flex flex-col justify-between overflow-hidden group transition-all duration-300 relative ${
                    isSelected ? 'ring-2 ring-primary bg-card/65' : ''
                  }`}
                >
                  {/* Checkbox Hook (右上角绝对定位) */}
                  <div className="absolute top-4 right-4 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSelect(product.id)}
                      className="rounded-md h-5 w-5 border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>

                  <div className="p-6 space-y-4 cursor-pointer" onClick={() => handleToggleSelect(product.id)}>
                    {/* Item Image and Title */}
                    <div className="flex gap-4 pr-6">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/10">
                        {product.mainImageUrl ? (
                          <img
                            src={getAssetUrl(product.mainImageUrl)}
                            alt={getProductTitle(product)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted/40">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-foreground truncate">{getProductTitle(product)}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">ID: {product.id}</p>
                        {product.category && (
                          <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground uppercase">
                            {product.category.slug}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-4 py-2.5 bg-muted/30 border-t border-border/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold truncate" title={`${formatDate(product.deletedAt)} 删除者: ${product.deletedBy || '未知'}`}>
                      <Calendar className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                      <span>{formatShortDate(product.deletedAt)}</span>
                      {product.deletedBy && (
                        <span className="ml-1 px-1 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-bold scale-90 origin-left">
                          {getShortUser(product.deletedBy)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); openConfirm('restore', 'product', product); }}
                        className="h-7 px-2 rounded-lg text-[9px] font-bold text-primary hover:bg-primary/10 transition-all flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" /> 恢复
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); openConfirm('delete', 'product', product); }}
                        className="h-7 px-2 rounded-lg text-[9px] font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> 删除
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )
      ) : (
        /* 素材回收站 */
        filteredAssets.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center py-20 text-center border-none">
            <Database className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-sm font-bold text-foreground mb-1">素材回收站空空如也</h3>
            <p className="text-xs text-muted-foreground">目前没有任何被软删除的图片/视频素材。</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => {
              const isSelected = selectedIds.includes(asset.id);
              return (
                <GlassCard 
                  key={asset.id} 
                  className={`border-none rounded-[1.5rem] flex flex-col justify-between overflow-hidden group transition-all duration-300 relative ${
                    isSelected ? 'ring-2 ring-primary bg-card/65' : ''
                  }`}
                >
                  {/* Checkbox Hook (右上角绝对定位) */}
                  <div className="absolute top-4 right-4 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSelect(asset.id)}
                      className="rounded-md h-5 w-5 border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>

                  <div className="p-6 space-y-4 cursor-pointer" onClick={() => handleToggleSelect(asset.id)}>
                    {/* File Metadata Info */}
                    <div className="flex gap-4 pr-6">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/10">
                        {asset.type === 'IMAGE' && asset.url ? (
                          <img
                            src={getAssetUrl(asset.url)}
                            alt={asset.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted/40">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-foreground truncate">{asset.title}</h4>
                        <p className="text-[10px] text-muted-foreground truncate font-mono">{asset.fileName}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            {formatBytes(asset.fileSize)}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
                            {asset.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-4 py-2.5 bg-muted/30 border-t border-border/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold truncate" title={`${formatDate(asset.deletedAt)} 删除者: ${asset.deletedBy || '未知'}`}>
                      <Calendar className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                      <span>{formatShortDate(asset.deletedAt)}</span>
                      {asset.deletedBy && (
                        <span className="ml-1 px-1 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-bold scale-90 origin-left">
                          {getShortUser(asset.deletedBy)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); openConfirm('restore', 'asset', asset); }}
                        className="h-7 px-2 rounded-lg text-[9px] font-bold text-primary hover:bg-primary/10 transition-all flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" /> 恢复
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); openConfirm('delete', 'asset', asset); }}
                        className="h-7 px-2 rounded-lg text-[9px] font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> 删除
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )
      )}

      {/* 确认操作 Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md p-8 rounded-3xl border border-border/20 bg-card/90 backdrop-blur-xl shadow-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <AlertTriangle className={`h-5 w-5 ${actionType === 'delete' ? 'text-red-500' : 'text-primary'}`} />
              {actionType === 'restore' ? '确认恢复选中的数据？' : '确认彻底物理删除选中的数据？'}
            </DialogTitle>
            <DialogDescription asChild className="text-xs text-muted-foreground leading-relaxed pt-2">
              <div>
                {actionType === 'restore' ? (
                  <>您即将批量恢复：<span className="font-bold text-foreground">「{targetItem?.name}」</span>。这些项目将成功重回管理面板，且它们的状态将自动默认被置为「草稿（Draft）」以供审核。</>
                ) : (
                  <>
                    警告：您正在物理清空：<span className="font-bold text-foreground">「{targetItem?.name}」</span>。<br />
                    <span className="text-red-500 font-bold">该操作不可逆，将永久删除：</span>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>数据库中的核心产品/素材数据元记录</li>
                      {targetItem?.type === 'product' && <li>关联的所有多语言本地化翻译词条（自动垃圾回收）</li>}
                      {targetItem?.type === 'asset' && <li>存放在 MinIO 云端对象存储上的原始物理文件和缩略图</li>}
                    </ul>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-8 flex gap-3 sm:justify-end">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setConfirmOpen(false)}
              className="h-11 px-5 rounded-xl text-xs font-bold border-border/40 hover:bg-muted/10 text-foreground"
            >
              取消
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={handleAction}
              className={`h-11 px-5 rounded-xl text-xs font-bold text-white transition-all ${
                actionType === 'delete'
                  ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/20'
                  : 'bg-primary hover:bg-primary/90 hover:shadow-primary/20'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : actionType === 'restore' ? (
                '确认恢复'
              ) : (
                '彻底删除'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 底部浮动批量操作条 (Bulk Actions Floating Bar) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-background/85 border border-border/40 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-8 animate-in slide-in-from-bottom-5 duration-300 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-foreground">
              已选择 {selectedIds.length} 个项目
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openConfirm('restore', activeTab === 'products' ? 'product' : 'asset', 'batch')}
              className="h-9 px-4 rounded-xl text-[10px] font-bold text-primary border-primary/20 hover:bg-primary/10 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> 批量恢复
            </Button>
            <Button
              size="sm"
              onClick={() => openConfirm('delete', activeTab === 'products' ? 'product' : 'asset', 'batch')}
              className="h-9 px-4 rounded-xl text-[10px] font-bold bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> 批量彻底删除
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
