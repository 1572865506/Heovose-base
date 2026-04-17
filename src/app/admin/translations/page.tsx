
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
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
  Zap,
  AlertTriangle,
  Settings2,
  Globe2,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LocalizedString {
  id: string;
  [key: string]: string; // Support dynamic language codes
}

interface LanguageOption {
  code: string;
  label: string;
}

interface LanguageSettings {
  supportedLanguages: LanguageOption[];
}

export default function TranslationsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);
  
  const [formData, setFormData] = useState<Record<string, string>>({ id: '' });
  const [newLang, setNewLang] = useState({ code: '', label: '' });

  // 1. 获取全局语种配置
  const langConfigRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'languages');
  }, [firestore]);

  const { data: langSettings, isLoading: isLangLoading } = useDoc<LanguageSettings>(langConfigRef);

  // 默认语种
  const activeLanguages = useMemo(() => {
    return langSettings?.supportedLanguages || [
      { code: 'zh', label: '中文' },
      { code: 'en', label: 'English' }
    ];
  }, [langSettings]);

  // 2. 获取翻译项
  const translationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'localizedStrings');
  }, [firestore]);

  const { data: translations, isLoading } = useCollection<LocalizedString>(translationsQuery);

  // 灵光一闪：检测重复内容逻辑 (基于基准语种 zh/en)
  const duplicateGroups = useMemo(() => {
    if (!translations) return new Map<string, string[]>();
    const groups = new Map<string, string[]>();
    translations.forEach(t => {
      const contentKey = `${(t.zh || '').trim()}|${(t.en || '').trim()}`.toLowerCase();
      if (!groups.has(contentKey)) groups.set(contentKey, []);
      groups.get(contentKey)!.push(t.id);
    });
    const onlyDuplicates = new Map<string, string[]>();
    groups.forEach((ids, key) => {
      if (ids.length > 1) onlyDuplicates.set(key, ids);
    });
    return onlyDuplicates;
  }, [translations]);

  const filteredTranslations = useMemo(() => {
    if (!translations) return [];
    return translations.filter(t => {
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        t.id.toLowerCase().includes(search) ||
        Object.values(t).some(v => typeof v === 'string' && v.toLowerCase().includes(search));
      
      if (showOnlyDuplicates) {
        const contentKey = `${(t.zh || '').trim()}|${(t.en || '').trim()}`.toLowerCase();
        return matchesSearch && duplicateGroups.has(contentKey);
      }
      
      return matchesSearch;
    });
  }, [translations, searchQuery, showOnlyDuplicates, duplicateGroups]);

  const handleSave = () => {
    if (!firestore || !formData.id) return;
    
    const docRef = doc(firestore, 'localizedStrings', formData.id);
    setDocumentNonBlocking(docRef, {
      ...formData,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setIsAdding(false);
    setEditingId(null);
    setFormData({ id: '' });
    toast({ title: "翻译已更新" });
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('确定要删除此翻译项吗？这可能会导致引用的内容显示不正常。')) return;
    deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', id));
  };

  const handleAutoCleanup = () => {
    if (!firestore || duplicateGroups.size === 0) return;
    if (!confirm(`检测到 ${duplicateGroups.size} 组内容完全重复的翻译。清理将保留每组中的第一个 ID 并删除其余项。确定继续吗？`)) return;
    
    let count = 0;
    duplicateGroups.forEach((ids) => {
      const toDelete = ids.slice(1);
      toDelete.forEach(id => {
        deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', id));
        count++;
      });
    });
    
    toast({ title: "自动清理完成", description: `已移除 ${count} 个冗余翻译项。` });
  };

  const handleAddLanguage = () => {
    if (!firestore || !newLang.code || !newLang.label) return;
    const exists = activeLanguages.some(l => l.code === newLang.code);
    if (exists) {
      toast({ variant: "destructive", title: "语种已存在" });
      return;
    }

    const updated = [...activeLanguages, newLang];
    setDoc(doc(firestore, 'settings', 'languages'), { supportedLanguages: updated });
    setNewLang({ code: '', label: '' });
    toast({ title: "新语种已添加" });
  };

  const handleRemoveLanguage = (code: string) => {
    if (code === 'zh' || code === 'en') {
      toast({ variant: "destructive", title: "基准语种不可删除" });
      return;
    }
    if (!confirm(`确定要移除 ${code} 语种支持吗？翻译数据将保留但不再显示在管理视图中。`)) return;
    const updated = activeLanguages.filter(l => l.code !== code);
    setDoc(doc(firestore, 'settings', 'languages'), { supportedLanguages: updated });
  };

  const startEdit = (t: LocalizedString) => {
    setFormData(t);
    setEditingId(t.id);
  };

  const isDuplicate = (t: LocalizedString) => {
    const key = `${(t.zh || '').trim()}|${(t.en || '').trim()}`.toLowerCase();
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
          <p className="text-sm text-muted-foreground">管理全站多语种锚点，支持动态扩展语种与冗余清理。</p>
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

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl h-12 gap-2 border-primary/20 hover:bg-primary/5">
                <Settings2 className="h-4 w-4" /> 语种设置
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] max-w-md p-8">
              <DialogHeader>
                <DialogTitle>管理支持的语种</DialogTitle>
                <DialogDescription>基准语种 (ZH/EN) 为系统核心，不可移除。</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  {activeLanguages.map((lang) => (
                    <div key={lang.code} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/40">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary/10 text-primary font-mono">{lang.code.toUpperCase()}</Badge>
                        <span className="text-sm font-bold">{lang.label}</span>
                      </div>
                      {lang.code !== 'zh' && lang.code !== 'en' && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleRemoveLanguage(lang.code)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">添加新语种</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="代码 (如: vi)" value={newLang.code} onChange={e => setNewLang({...newLang, code: e.target.value.toLowerCase()})} className="rounded-xl" />
                    <Input placeholder="名称 (如: 越南语)" value={newLang.label} onChange={e => setNewLang({...newLang, label: e.target.value})} className="rounded-xl" />
                  </div>
                  <Button onClick={handleAddLanguage} className="w-full rounded-xl h-11" disabled={!newLang.code || !newLang.label}>
                    <Plus className="h-4 w-4 mr-2" /> 确认添加
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2">
                <Plus className="h-4 w-4" /> 新增翻译
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-primary p-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <Globe2 className="h-6 w-6" /> 创建新语言锚点
                  </DialogTitle>
                  <DialogDescription className="text-white/60">
                    ID 将作为全站调用的唯一键，建议使用下划线分隔。
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto bg-white">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">唯一标识符 (ID)</Label>
                  <Input 
                    placeholder="例如: global_footer_slogan" 
                    value={formData.id} 
                    onChange={e => setFormData({...formData, id: e.target.value})}
                    className="rounded-xl h-12 bg-muted/20 border-transparent focus:ring-primary"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-5 pt-4 border-t">
                  {activeLanguages.map((lang) => (
                    <div key={lang.code} className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {lang.label} ({lang.code.toUpperCase()})
                      </Label>
                      <Input 
                        value={formData[lang.code] || ''} 
                        onChange={e => setFormData({...formData, [lang.code]: e.target.value})}
                        className="rounded-xl h-11"
                        placeholder={`输入${lang.label}翻译...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter className="bg-muted/30 p-6 flex gap-2">
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
            placeholder="搜索 ID 或任意语言翻译内容..." 
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

      <div className="bg-white rounded-[2rem] border border-border/40 shadow-xl overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="min-w-[200px] font-bold uppercase text-[10px] tracking-[0.2em] pl-8">翻译锚点 (ID)</TableHead>
              {activeLanguages.map(lang => (
                <TableHead key={lang.code} className="min-w-[150px] font-bold uppercase text-[10px] tracking-[0.2em]">
                  {lang.label}
                </TableHead>
              ))}
              <TableHead className="w-[120px] text-right pr-8 font-bold uppercase text-[10px] tracking-[0.2em]">管理</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isLangLoading ? (
              <TableRow>
                <TableCell colSpan={activeLanguages.length + 2} className="h-60 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">正在同步语言包...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTranslations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={activeLanguages.length + 2} className="h-60 text-center text-muted-foreground italic">
                  未发现匹配的语言资产。
                </TableCell>
              </TableRow>
            ) : (
              filteredTranslations.map((t) => {
                const hasDuplicate = isDuplicate(t);
                const isEditing = editingId === t.id;
                
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
                          "text-[10px] font-bold px-2 py-0.5 rounded w-fit break-all",
                          hasDuplicate ? "bg-orange-100 text-orange-700" : "bg-primary/5 text-primary"
                        )}>
                          {t.id}
                        </code>
                        {hasDuplicate && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">内容冗余</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    {activeLanguages.map(lang => (
                      <TableCell key={lang.code}>
                        {isEditing ? (
                          <Input 
                            value={formData[lang.code] || ''} 
                            onChange={e => setFormData({...formData, [lang.code]: e.target.value})}
                            className="h-9 text-xs rounded-xl border-primary/20"
                          />
                        ) : (
                          <span className={cn(
                            "text-xs font-medium line-clamp-2",
                            lang.code !== 'zh' && "text-muted-foreground italic"
                          )}>
                            {t[lang.code] || '-'}
                          </span>
                        )}
                      </TableCell>
                    ))}

                    <TableCell className="pr-8">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
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
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/5 hover:text-primary" 
                              onClick={() => startEdit(t)}
                              title="编辑内容"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/5" 
                              onClick={() => handleDelete(t.id)}
                              title="永久删除"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
      
      <div className="flex items-center gap-2 p-4 bg-muted/20 rounded-2xl border border-border/40">
        <Info className="h-4 w-4 text-primary/40" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <b>提示：</b> 冗余清理目前仅对比 <b>ZH</b> 和 <b>EN</b>。如果您手动修改了 ID 并在产品中引用，请务必同步更新产品配置以防内容丢失。
        </p>
      </div>
    </div>
  );
}
