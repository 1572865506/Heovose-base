
"use client";

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  Check, 
  Filter,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
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
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface GalleryAsset {
  id: string;
  url: string;
  title: string;
  category: 'Product' | 'Diagram' | 'Banner' | 'Other';
  createdAt?: any;
}

export default function GalleryPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'Product' as const
  });

  const assetsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'galleryAssets'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: assets, isLoading } = useCollection<GalleryAsset>(assetsQuery);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || a.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [assets, searchQuery, filterCategory]);

  const handleSave = () => {
    if (!firestore || !formData.url || !formData.title) return;
    
    const id = `asset_${Date.now()}`;
    const assetRef = doc(firestore, 'galleryAssets', id);
    
    setDocumentNonBlocking(assetRef, {
      id,
      ...formData,
      createdAt: serverTimestamp()
    }, { merge: true });

    setIsAdding(false);
    setFormData({ title: '', url: '', category: 'Product' });
    toast({ title: "素材已保存", description: "图片已成功添加到图库。" });
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('确定要从图库中移除此图片吗？')) return;
    deleteDocumentNonBlocking(doc(firestore, 'galleryAssets', id));
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({ title: "链接已复制", description: "您可以直接在产品管理中粘贴使用。" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    { label: '全部', value: 'all' },
    { label: '产品图', value: 'Product' },
    { label: '结构图', value: 'Diagram' },
    { label: '宣传素材', value: 'Banner' },
    { label: '其他', value: 'Other' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            全球图库与素材管理
          </h2>
          <p className="text-sm text-muted-foreground">管理全站的产品实拍、技术图纸及营销素材。</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> 新增素材
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle>添加新媒体素材</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase">素材名称/描述</Label>
                <Input 
                  placeholder="例如: H24Pro 正面高清图" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase">图片 URL 地址</Label>
                <Input 
                  placeholder="https://..." 
                  value={formData.url} 
                  onChange={e => setFormData({...formData, url: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase">素材分类</Label>
                <Select value={formData.category} onValueChange={(v: any) => setFormData({...formData, category: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product">产品图</SelectItem>
                    <SelectItem value="Diagram">结构图</SelectItem>
                    <SelectItem value="Banner">宣传素材</SelectItem>
                    <SelectItem value="Other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
              <Button onClick={handleSave}>存入图库</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-6 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="按名称搜索素材..." 
            className="pl-10 border-none bg-muted/30 focus-visible:ring-0 rounded-xl"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden md:block" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-40 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              className="group relative bg-white rounded-2xl border border-border/40 overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative aspect-square bg-muted/10">
                <Image src={asset.url} alt={asset.title} fill className="object-cover" />
                <div className="absolute top-2 left-2">
                  <Badge className="text-[8px] px-1.5 h-4 bg-black/60 backdrop-blur-md border-none">
                    {categories.find(c => c.value === asset.category)?.label}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                <p className="text-xs font-bold truncate text-primary">{asset.title}</p>
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => copyToClipboard(asset.url, asset.id)}
                    >
                      {copiedId === asset.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <a href={asset.url} target="_blank" rel="noreferrer">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(asset.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filteredAssets.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground italic border-2 border-dashed rounded-3xl opacity-40">
              未找到匹配的素材。
            </div>
          )}
        </div>
      )}
    </div>
  );
}
