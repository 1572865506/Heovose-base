
"use client";

import { useState, useMemo } from 'react';
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
  Info,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LocalizedString {
  id: string;
  [key: string]: string;
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

  // 获取配置与翻译项
  const langConfigRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'languages') : null, [firestore]);
  const { data: langSettings, isLoading: isLangLoading } = useDoc<LanguageSettings>(langConfigRef);
  const translationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'localizedStrings') : null, [firestore]);
  const { data: translations, isLoading } = useCollection<LocalizedString>(translationsQuery);

  // 获取产品与分类（用于引用检查）
  const productsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const catsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'productCategories') : null, [firestore]);
  const galCatsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'galleryCategories') : null, [firestore]);
  const { data: products } = useCollection(productsQuery);
  const { data: categories } = useCollection(catsQuery);
  const { data: galleryCategories } = useCollection(galCatsQuery);

  const activeLanguages = useMemo(() => langSettings?.supportedLanguages || [{ code: 'zh', label: '中文' }, { code: 'en', label: 'English' }], [langSettings]);

  // 1. 建立引用索引：查出哪些 ID 正在被使用
  const usedIds = useMemo(() => {
    const ids = new Set<string>();
    products?.forEach(p => {
      if (p.nameTextId) ids.add(p.nameTextId);
      if (p.descriptionTextId) ids.add(p.descriptionTextId);
      if (p.detailsTextId) ids.add(p.detailsTextId);
      p.advantageTextIds?.forEach((id: string) => ids.add(id));
      p.specGroups?.forEach((g: any) => {
        if (g.titleId) ids.add(g.titleId);
        g.items?.forEach((i: any) => {
          if (i.labelId) ids.add(i.labelId);
          if (i.valueId) ids.add(i.valueId);
        });
      });
    });
    categories?.forEach(c => c.nameTextId && ids.add(c.nameTextId));
    galleryCategories?.forEach(gc => gc.nameTextId && ids.add(gc.nameTextId));
    return ids;
  }, [products, categories, galleryCategories]);

  // 2. 重复项扫描：区分“可安全删除”和“存在引用冲突”
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
      const matchesSearch = t.id.toLowerCase().includes(search) || Object.values(t).some(v => typeof v === 'string' && v.toLowerCase().includes(search));
      if (showOnlyDuplicates) return matchesSearch && duplicateGroups.has(`${(t.zh || '').trim()}|${(t.en || '').trim()}`.toLowerCase());
      return matchesSearch;
    });
  }, [translations, searchQuery, showOnlyDuplicates, duplicateGroups]);

  const handleSave = () => {
    if (!firestore || !formData.id) return;
    setDocumentNonBlocking(doc(firestore, 'localizedStrings', formData.id), { ...formData, updatedAt: serverTimestamp() }, { merge: true });
    setIsAdding(false);
    setEditingId(null);
    setFormData({ id: '' });
    toast({ title: "翻译已更新" });
  };

  const handleAutoCleanup = () => {
    if (!firestore || duplicateGroups.size === 0) return;
    
    let deleteCount = 0;
    let conflictCount = 0;

    duplicateGroups.forEach((ids) => {
      // 策略：保留其中一个被引用的 ID，如果没有被引用的，则保留第一个
      const referencedIds = ids.filter(id => usedIds.has(id));
      const masterId = referencedIds.length > 0 ? referencedIds[0] : ids[0];
      
      const toDelete = ids.filter(id => id !== masterId && !usedIds.has(id));
      const conflicts = ids.filter(id => id !== masterId && usedIds.has(id));

      toDelete.forEach(id => {
        deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', id));
        deleteCount++;
      });
      conflictCount += conflicts.length;
    });

    toast({ 
      title: "清理完成", 
      description: `已安全移除 ${deleteCount} 个未使用的冗余项。${conflictCount > 0 ? `检测到 ${conflictCount} 个项目仍被引用，已保留以防内容丢失。` : ''}` 
    });
  };

  const handleAddLanguage = () => {
    if (!firestore || !newLang.code || !newLang.label) return;
    if (activeLanguages.some(l => l.code === newLang.code)) return;
    const updated = [...activeLanguages, newLang];
    setDoc(doc(firestore, 'settings', 'languages'), { supportedLanguages: updated });
    setNewLang({ code: '', label: '' });
  };

  const startEdit = (t: LocalizedString) => {
    setFormData(t);
    setEditingId(t.id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <Languages className="h-6 w-6" /> 全球语言资产管理
          </h2>
          <p className="text-sm text-muted-foreground">管理全站多语种锚点。系统已启用<b>引用保护</b>，清理冗余时不会破坏产品数据。</p>
        </div>
        
        <div className="flex gap-2">
          {duplicateGroups.size > 0 && (
            <Button variant="outline" onClick={handleAutoCleanup} className="rounded-xl h-12 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 gap-2">
              <Zap className="h-4 w-4" /> 安全清理冗余 ({duplicateGroups.size}组)
            </Button>
          )}

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild><Button variant="outline" className="rounded-xl h-12 gap-2"><Settings2 className="h-4 w-4" /> 语种设置</Button></DialogTrigger>
            <DialogContent className="rounded-[2rem] max-w-md p-8">
               <DialogHeader><DialogTitle>支持语种</DialogTitle></DialogHeader>
               <div className="space-y-4 py-4">
                 {activeLanguages.map(l => (
                   <div key={l.code} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                     <span className="text-sm font-bold">{l.label} ({l.code})</span>
                   </div>
                 ))}
                 <div className="pt-4 border-t space-y-3">
                   <div className="grid grid-cols-2 gap-2">
                     <Input placeholder="vi" value={newLang.code} onChange={e => setNewLang({...newLang, code: e.target.value})} />
                     <Input placeholder="越南语" value={newLang.label} onChange={e => setNewLang({...newLang, label: e.target.value})} />
                   </div>
                   <Button onClick={handleAddLanguage} className="w-full">添加语种</Button>
                 </div>
               </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild><Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2"><Plus className="h-4 w-4" /> 新增翻译</Button></DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden shadow-2xl">
              <div className="bg-primary p-8 text-white"><DialogHeader><DialogTitle className="text-2xl font-bold flex items-center gap-3"><Globe2 className="h-6 w-6" /> 创建语言锚点</DialogTitle></DialogHeader></div>
              <div className="p-8 space-y-6 bg-white">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary">唯一标识符 (ID)</Label>
                  <Input placeholder="e.g. global_footer_slogan" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-12 rounded-xl" />
                </div>
                {activeLanguages.map(lang => (
                  <div key={lang.code} className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">{lang.label} ({lang.code})</Label>
                    <Input value={formData[lang.code] || ''} onChange={e => setFormData({...formData, [lang.code]: e.target.value})} className="rounded-xl" />
                  </div>
                ))}
              </div>
              <DialogFooter className="bg-muted/30 p-6 flex gap-2"><Button variant="outline" onClick={() => setIsAdding(false)} className="flex-1">取消</Button><Button onClick={handleSave} className="flex-1">保存</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索 ID 或翻译内容..." className="pl-10 border-none bg-muted/40 rounded-xl h-11" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Button variant={showOnlyDuplicates ? "default" : "ghost"} size="sm" onClick={() => setShowOnlyDuplicates(!showOnlyDuplicates)} className={cn("rounded-xl h-11 gap-2", showOnlyDuplicates && "bg-orange-600 hover:bg-orange-700")}>
          <AlertTriangle className="h-3.5 w-3.5" /> 仅看重复项
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border shadow-xl overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="pl-8">ID / 引用状态</TableHead>
              {activeLanguages.map(lang => <TableHead key={lang.code}>{lang.label}</TableHead>)}
              <TableHead className="text-right pr-8">管理</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={10} className="h-40 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow> : filteredTranslations.map((t) => (
              <TableRow key={t.id} className={cn("group", usedIds.has(t.id) ? "bg-primary/[0.02]" : "bg-transparent")}>
                <TableCell className="pl-8">
                  <div className="flex flex-col gap-1">
                    <code className="text-[10px] font-bold text-primary">{t.id}</code>
                    {usedIds.has(t.id) ? (
                      <div className="flex items-center gap-1 text-green-600"><ShieldCheck className="h-2.5 w-2.5" /><span className="text-[8px] font-bold uppercase">正在使用</span></div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground opacity-40"><X className="h-2.5 w-2.5" /><span className="text-[8px] font-bold uppercase">无引用</span></div>
                    )}
                  </div>
                </TableCell>
                {activeLanguages.map(lang => (
                  <TableCell key={lang.code}>
                    {editingId === t.id ? (
                      <Input value={formData[lang.code] || ''} onChange={e => setFormData({...formData, [lang.code]: e.target.value})} className="h-8 text-xs" />
                    ) : (
                      <span className="text-xs line-clamp-1">{t[lang.code] || '-'}</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="pr-8 text-right">
                   {editingId === t.id ? (
                     <div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={handleSave}><Check className="h-4 w-4" /></Button></div>
                   ) : (
                     <Button size="icon" variant="ghost" onClick={() => startEdit(t)} className="opacity-0 group-hover:opacity-100"><Edit2 className="h-3.5 w-3.5" /></Button>
                   )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
