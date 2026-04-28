
"use client";

import { useState, useMemo } from 'react';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { 
  Search, 
  Image as ImageIcon, 
  Loader2, 
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GalleryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  currentValue?: string;
}

export function GalleryPicker({ open, onOpenChange, onSelect, currentValue }: GalleryPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentValue || null);

  const { data: categories } = useLocalCollection<any>('galleryCategories');
  const { data: assets, isLoading } = useLocalCollection<any>('galleryAssets');

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(a => {
      const ms = a.title.toLowerCase().includes(searchQuery.toLowerCase());
      const mc = filterCategory === 'all' || a.categoryId === filterCategory;
      return ms && mc;
    });
  }, [assets, searchQuery, filterCategory]);

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 bg-primary text-white shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="h-6 w-6" /> 选择素材图库
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 bg-muted/30 border-b flex flex-col md:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="按标题搜索素材..." 
              className="pl-10 h-10 rounded-xl bg-white border-none shadow-sm text-sm" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-48 h-10 rounded-xl bg-white border-none shadow-sm text-sm">
              <SelectValue placeholder="所有分类" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">所有分类</SelectItem>
              {categories?.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">同步图库中...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 opacity-40">
              <ImageIcon className="h-12 w-12" />
              <p className="text-sm font-bold">没有找到匹配的素材</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAssets.map((asset) => (
                <div 
                  key={asset.id}
                  onClick={() => setSelectedUrl(asset.url)}
                  className={cn(
                    "group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all",
                    selectedUrl === asset.url ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/40"
                  )}
                >
                  <Image 
                    src={asset.url} 
                    alt={asset.title} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                  {selectedUrl === asset.url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                        <Check className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white font-bold truncate">{asset.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-muted/10 border-t flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-10 px-6 text-xs font-bold uppercase">
            取消
          </Button>
          <Button 
            disabled={!selectedUrl} 
            onClick={handleConfirm}
            className="rounded-xl h-10 px-8 text-xs font-bold uppercase tracking-widest bg-primary"
          >
            确认选择
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
