
"use client";

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Check, 
  X,
  Languages,
  Copy,
  AlertTriangle,
  Zap,
  Filter,
  ArrowRightLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
}

export default function TranslationsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);
  
  const [formData, setFormData] = useState({ id: '', en: '', zh: '' });

  const translationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'localizedStrings');
  }, [firestore]);

  const { data: translations, isLoading } = useCollection<LocalizedString>(translationsQuery);

  // 灵光一闪：检测重复内容逻辑
  const duplicateGroups = useMemo(() => {
    if (!translations) return new Map<string, string[]>();
    const groups = new Map<string, string[]>();
    translations.forEach(t => {
      const contentKey = `${t.zh.trim()}|${t.en.trim()}`.toLowerCase();
      if (!groups.has(contentKey)) groups.set(contentKey, []);
      groups.get(contentKey)!.push(t.id);
    });
    // 只保留有重复的组
    const onlyDuplicates = new Map<string, string[]>();
    groups.forEach((ids, key) => {
      if (ids.length > 1) onlyDuplicates.set(key, ids);
    });
    return onlyDuplicates;
  }, [translations]);

  const filteredTranslations = useMemo(() => {
    if (!translations) return [];
    return translations.filter(t => {
      const matchesSearch = 
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.zh.includes(searchQuery);
      
      if (showOnlyDuplicates) {
        const contentKey = `${t.zh.trim()}|${t.en.trim()}`.toLowerCase();
        return matchesSearch && duplicateGroups.has(contentKey);
      }
      
      return matchesSearch;
    });
  }, [translations, searchQuery, showOnlyDuplicates, duplicateGroups]);

  const handleSave = () => {
    if (!firestore || !formData.id) return;
    
    const docRef = doc(firestore, 'localizedStrings', formData.id);
    setDocumentNonBlocking(docRef, {
      id: formData.id,
      en: formData.en,
      zh: formData.zh,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setIsAdding(false);
    setEditingId(null);
    setFormData({ id: '', en: '', zh: '' });
    toast({ title: "翻译已更新" });
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('确定要删除此翻译项吗？这可能会导致引用的内容显示不正常。')) return;
    deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', id));
  };

  const handleAutoCleanup = () => {
    if (!firestore || duplicateGroups.size === 0) return;
    if (!confirm(`检测到 ${duplicateGroups.size} 组内容完全重复的翻译。清理将保留每组中的第一个 ID 并删除其余项。警告：如果其他产品引用了被删除的 ID，可能会导致显示为空。确定继续吗？`)) return;
    
    let count = 0;
    duplicateGroups.forEach((ids) => {
      // 保留第一个，删除后面的
      const toDelete = ids.slice(1);
      toDelete.forEach(id => {
        deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', id));
        count++;
      });
    });
    
    toast({ title: "自动清理完成", description: `已移除 ${count} 个冗余翻译项。` });
  };

  const startEdit = (t: LocalizedString) => {
    setFormData(t);
    setEditingId(t.id);
  };

  const isDuplicate = (t: LocalizedString) => {
    const key = `${t.zh.trim()}|${t.en.trim()}`.toLowerCase();
    return duplicateGroups.has(key);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <Languages className="h-6 w-6" />
            全球语言资产管理
          </h2>
          <p className="text-sm text-muted-foreground">管理全站翻译键值对，支持内容去重与冗余清理。</p>
        </div>
        
        <div className="flex gap-2">
          {duplicateGroups.size > 0 && (
            <Button 
              variant="outline" 
              onClick={handleAutoCleanup}
              className="rounded-xl h-12 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 gap-2"
            >
              <Zap className="h-4 w-4" /> 自动清理冗余 ({duplicateGroups.size}组)
            </Button>
          )}

          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2">
                <Plus className="h-4 w-4" /> 新增翻译
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md p-8">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">创建新语言锚点</DialogTitle>
                <DialogDescription>
                  建议使用业务前缀命名 ID，如 <code>prod_spec_</code> 或 <code>ui_label_</code>。
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-[10px] font-bold uppercase tracking-widest text-primary">唯一标识符 (ID)</Label>
                  <Input 
                    id="id" 
                    placeholder="例如: global_footer_slogan" 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value})}
                    className="rounded-xl h-12 bg-muted/20 border-transparent focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zh" className="text-[10px] font-bold uppercase tracking-widest text-primary">中文内容 (ZH)</Label>
                  <Input 
                    id="zh" 
                    value={formData.zh} 
                    onChange={e => setFormData({...formData, zh: e.target.value})}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="en" className="text-[10px] font-bold uppercase tracking-widest text-primary">英文内容 (EN)</Label>
                  <Input 
                    id="en" 
                    value={formData.en} 
                    onChange={e => setFormData({...formData, en: e.target.value})}
                    className="rounded-xl h-12"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsAdding(false)} className="rounded-xl h-12 flex-1">取消</Button>
                <Button onClick={handleSave} className="rounded-xl h-12 flex-1 font-bold uppercase tracking-widest">保存资产</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="搜索 ID 或翻译内容..." 
            className="pl-10 border-none bg-muted/40 focus-visible:ring-0 rounded-xl h-11"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant={showOnlyDuplicates ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowOnlyDuplicates(!showOnlyDuplicates)}
            className={cn(
              "rounded-xl h-11 px-4 gap-2 font-bold text-xs uppercase tracking-tight",
              showOnlyDuplicates ? "bg-orange-600 hover:bg-orange-700" : "text-muted-foreground"
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5" /> 仅看重复项
          </Button>
          <div className="h-6 w-px bg-border mx-2" />
          <Badge variant="secondary" className="rounded-lg px-3 py-1.5 font-mono text-[10px]">
            {filteredTranslations.length} ITEMS
          </Badge>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border/40 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[30%] font-bold uppercase text-[10px] tracking-[0.2em] pl-8">翻译锚点 (ID)</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[0.2em]">中文 (ZH)</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[0.2em]">英文 (EN)</TableHead>
              <TableHead className="w-[120px] text-right pr-8 font-bold uppercase text-[10px] tracking-[0.2em]">管理</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-60 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">正在同步云端语言包...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTranslations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-60 text-center text-muted-foreground italic">
                  未发现匹配的语言资产。
                </TableCell>
              </TableRow>
            ) : (
              filteredTranslations.map((t) => {
                const hasDuplicate = isDuplicate(t);
                return (
                  <TableRow 
                    key={t.id} 
                    className={cn(
                      "group transition-all",
                      hasDuplicate ? "bg-orange-50/30 hover:bg-orange-50/50" : "hover:bg-muted/5"
                    )}
                  >
                    <TableCell className="pl-8">
                      <div className="flex flex-col gap-1">
                        <code className={cn(
                          "text-[11px] font-bold px-2 py-0.5 rounded w-fit",
                          hasDuplicate ? "bg-orange-100 text-orange-700" : "bg-primary/5 text-primary"
                        )}>
                          {t.id}
                        </code>
                        {hasDuplicate && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">内容有冗余</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingId === t.id ? (
                        <Input 
                          value={formData.zh} 
                          onChange={e => setFormData({...formData, zh: e.target.value})}
                          className="h-10 text-sm rounded-xl border-primary/20"
                        />
                      ) : (
                        <span className="text-sm font-medium">{t.zh}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === t.id ? (
                        <Input 
                          value={formData.en} 
                          onChange={e => setFormData({...formData, en: e.target.value})}
                          className="h-10 text-sm rounded-xl border-primary/20"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground italic">{t.en}</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-8">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === t.id ? (
                          <>
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-green-600 hover:bg-green-50" onClick={handleSave}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:bg-destructive/5" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/5 hover:text-primary" 
                              onClick={() => startEdit(t)}
                              title="编辑内容"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/5" 
                              onClick={() => handleDelete(t.id)}
                              title="永久删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

