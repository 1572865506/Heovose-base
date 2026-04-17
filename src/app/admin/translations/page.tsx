
"use client";

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
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
  Languages
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
}

export default function TranslationsPage() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ id: '', en: '', zh: '' });

  const translationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'localizedStrings');
  }, [firestore]);

  const { data: translations, isLoading } = useCollection<LocalizedString>(translationsQuery);

  const filteredTranslations = useMemo(() => {
    if (!translations) return [];
    return translations.filter(t => 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.zh.includes(searchQuery)
    );
  }, [translations, searchQuery]);

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
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('确定要删除此翻译项吗？这可能会导致引用的内容显示不正常。')) return;
    const docRef = doc(firestore, 'localizedStrings', id);
    deleteDocumentNonBlocking(docRef);
  };

  const startEdit = (t: LocalizedString) => {
    setFormData(t);
    setEditingId(t.id);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <Languages className="h-6 w-6" />
            多语言翻译管理
          </h2>
          <p className="text-sm text-muted-foreground">管理全站使用的翻译文本键值对。</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> 新增翻译
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle>添加新翻译项</DialogTitle>
              <DialogDescription>
                创建一个唯一的 ID，用于在其他内容中引用此文本。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="id" className="text-[10px] font-bold uppercase">翻译键 ID (唯一标识)</Label>
                <Input 
                  id="id" 
                  placeholder="例如: hero_headline" 
                  value={formData.id} 
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="en" className="text-[10px] font-bold uppercase">英文内容 (EN)</Label>
                <Input 
                  id="en" 
                  value={formData.en} 
                  onChange={e => setFormData({...formData, en: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zh" className="text-[10px] font-bold uppercase">中文内容 (ZH)</Label>
                <Input 
                  id="zh" 
                  value={formData.zh} 
                  onChange={e => setFormData({...formData, zh: e.target.value})}
                  className="rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdding(false)} className="rounded-xl">取消</Button>
              <Button onClick={handleSave} className="rounded-xl">保存翻译</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="按 ID 或内容搜索..." 
            className="pl-10 border-none bg-transparent focus-visible:ring-0 text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Badge variant="secondary" className="rounded-lg px-3 py-1 font-bold">
          {filteredTranslations.length} 个条目
        </Badge>
      </div>

      <div className="bg-white rounded-2xl border border-border/40 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[30%] font-bold uppercase text-[10px] tracking-widest pl-6">翻译键 ID</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">英文 (EN)</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">中文 (ZH)</TableHead>
              <TableHead className="w-[100px] text-right pr-6 font-bold uppercase text-[10px] tracking-widest">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-tighter">同步云端数据中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTranslations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic">
                  未找到任何翻译。
                </TableCell>
              </TableRow>
            ) : (
              filteredTranslations.map((t) => (
                <TableRow key={t.id} className="group hover:bg-muted/5 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-primary pl-6">
                    {t.id}
                  </TableCell>
                  <TableCell>
                    {editingId === t.id ? (
                      <Input 
                        value={formData.en} 
                        onChange={e => setFormData({...formData, en: e.target.value})}
                        className="h-8 text-sm rounded-lg"
                      />
                    ) : (
                      <span className="text-sm">{t.en}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === t.id ? (
                      <Input 
                        value={formData.zh} 
                        onChange={e => setFormData({...formData, zh: e.target.value})}
                        className="h-8 text-sm rounded-lg"
                      />
                    ) : (
                      <span className="text-sm font-medium">{t.zh}</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === t.id ? (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={handleSave}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/5" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => startEdit(t)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/5" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
