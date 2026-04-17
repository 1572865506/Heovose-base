
"use client";

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
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
  ShieldCheck,
  Copy
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

  // 1. 获取基础语种配置
  const langConfigRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'languages') : null, [firestore]);
  const { data: langSettings, isLoading: isLangLoading } = useDoc<LanguageSettings>(langConfigRef);
  
  // 2. 获取所有翻译项
  const translationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'localizedStrings') : null, [firestore]);
  const { data: translations, isLoading } = useCollection<LocalizedString>(translationsQuery);

  // 3. 获取所有业务实体（用于计算引用依赖）
  const productsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const catsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'productCategories') : null, [firestore]);
  const galCatsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'galleryCategories') : null, [firestore]);
  
  const { data: products } = useCollection(productsQuery);
  const { data: categories } = useCollection(catsQuery);
  const { data: galleryCategories } = useCollection(galCatsQuery);

  const activeLanguages = useMemo(() => langSettings?.supportedLanguages || [
    { code: 'zh', label: '中文' }, 
    { code: 'en', label: 'English' }
  ], [langSettings]);

  // 4. 建立引用索引：查出哪些 ID 正在被系统使用（核心理据）
  const usedIds = useMemo(() => {
    const ids = new Set<string>();
    
    // 检查产品数据中的引用
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

    // 检查分类数据中的引用
    categories?.forEach(c => c.nameTextId && ids.add(c.nameTextId));
    galleryCategories?.forEach(gc => gc.nameTextId && ids.add(gc.nameTextId));
    
    return ids;
  }, [products, categories, galleryCategories]);

  // 5. 重复项深度扫描：支持全语种穿透比对
  const duplicateGroups = useMemo(() => {
    if (!translations) return new Map<string, string[]>();
    const groups = new Map<string, string[]>();

    translations.forEach(t => {
      // 生成跨语种内容指纹
      const fingerprint = activeLanguages
        .map(lang => (t[lang.code] || '').trim().toLowerCase())
        .join('::');
      
      // 忽略全空项
      if (fingerprint.replace(/::/g, '').length === 0) return;

      if (!groups.has(fingerprint)) groups.set(fingerprint, []);
      groups.get(fingerprint)!.push(t.id);
    });

    // 仅保留存在重复（超过1个 ID）的组
    const redundants = new Map<string, string[]>();
    groups.forEach((ids, key) => {
      if (ids.length > 1) redundants.set(key, ids);
    });
    return redundants;
  }, [translations, activeLanguages]);

  // 6. 列表过滤逻辑
  const filteredTranslations = useMemo(() => {
    if (!translations) return [];
    return translations.filter(t => {
      const search = searchQuery.toLowerCase();
      const matchesSearch = t.id.toLowerCase().includes(search) || 
        Object.values(t).some(v => typeof v === 'string' && v.toLowerCase().includes(search));
      
      if (showOnlyDuplicates) {
        const fingerprint = activeLanguages.map(l => (t[l.code] || '').trim().toLowerCase()).join('::');
        return matchesSearch && duplicateGroups.has(fingerprint);
      }
      return matchesSearch;
    });
  }, [translations, searchQuery, showOnlyDuplicates, duplicateGroups, activeLanguages]);

  // 7. 智能清理函数（理据充分，引用安全）
  const handleAutoCleanup = () => {
    if (!firestore || duplicateGroups.size === 0) return;
    
    let deleteCount = 0;
    let keepCount = 0;

    duplicateGroups.forEach((ids) => {
      // 优先级策略：
      // 1. 保留其中一个被系统引用的 ID（Master ID）
      // 2. 如果都没有被引用，则保留第一个 ID
      const referencedOnes = ids.filter(id => usedIds.has(id));
      const masterId = referencedOnes.length > 0 ? referencedOnes[0] : ids[0];
      
      // 筛选出：内容重复、且没有被任何地方引用的“僵尸词条”
      const removableIds = ids.filter(id => id !== masterId && !usedIds.has(id));
      
      removableIds.forEach(id => {
        deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', id));
        deleteCount++;
      });

      // 统计那些虽然内容重复但因“正在使用”而不得不保留的条目（建议管理员手动合并产品端引用）
      const conflicts = ids.filter(id => id !== masterId && usedIds.has(id));
      keepCount += conflicts.length;
    });

    toast({ 
      title: "清理作业完成", 
      description: `已安全移除 ${deleteCount} 个未使用的冗余项。检测到 ${keepCount} 个重复项仍被产品引用，已自动跳过以保护前端显示。` 
    });
  };

  const handleSave = () => {
    if (!firestore || !formData.id) return;
    setDocumentNonBlocking(doc(firestore, 'localizedStrings', formData.id), { 
      ...formData, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
    setIsAdding(false);
    setEditingId(null);
    setFormData({ id: '' });
    toast({ title: "翻译已保存" });
  };

  const handleAddLanguage = () => {
    if (!firestore || !newLang.code || !newLang.label) return;
    if (activeLanguages.some(l => l.code === newLang.code)) return;
    const updated = [...activeLanguages, newLang];
    setDoc(doc(firestore, 'settings', 'languages'), { supportedLanguages: updated });
    setNewLang({ code: '', label: '' });
    toast({ title: `语种 ${newLang.label} 已开启` });
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
          <p className="text-sm text-muted-foreground">集中管理全站翻译锚点。系统已启用<b>引用感知 (Reference-Aware)</b> 保护机制。</p>
        </div>
        
        <div className="flex gap-2">
          {duplicateGroups.size > 0 && (
            <Button 
              variant="outline" 
              onClick={handleAutoCleanup} 
              className="rounded-xl h-12 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 gap-2 shadow-sm animate-pulse"
            >
              <Zap className="h-4 w-4 fill-current" /> 安全清理冗余 ({duplicateGroups.size} 组)
            </Button>
          )}

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl h-12 gap-2">
                <Settings2 className="h-4 w-4" /> 语种设置
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] max-w-md p-8">
               <DialogHeader>
                 <DialogTitle>多语种扩展配置</DialogTitle>
                 <DialogDescription>添加新语种后，翻译列表将自动增加对应的录入列。</DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="grid grid-cols-2 gap-3 mb-2">
                   <Label className="text-[10px] font-bold uppercase opacity-40">已启用语种</Label>
                 </div>
                 {activeLanguages.map(l => (
                   <div key={l.code} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/10">
                     <div className="flex flex-col">
                        <span className="text-sm font-bold">{l.label}</span>
                        <span className="text-[10px] font-mono opacity-50 uppercase">{l.code}</span>
                     </div>
                     {['zh', 'en'].includes(l.code) && <Badge variant="secondary" className="text-[8px]">系统基准</Badge>}
                   </div>
                 ))}
                 <div className="pt-6 border-t space-y-4">
                   <Label className="text-[10px] font-bold uppercase text-primary">新增业务语种</Label>
                   <div className="grid grid-cols-2 gap-2">
                     <Input placeholder="代码 (如: vi)" value={newLang.code} onChange={e => setNewLang({...newLang, code: e.target.value.toLowerCase()})} className="rounded-xl h-12" />
                     <Input placeholder="名称 (如: 越南语)" value={newLang.label} onChange={e => setNewLang({...newLang, label: e.target.value})} className="rounded-xl h-12" />
                   </div>
                   <Button onClick={handleAddLanguage} className="w-full h-12 rounded-xl" disabled={!newLang.code || !newLang.label}>开启此语种</Button>
                 </div>
               </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2 shadow-lg">
                <Plus className="h-4 w-4" /> 新增词条
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden shadow-2xl border-none">
              <div className="bg-primary p-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <Globe2 className="h-6 w-6" /> 创建全球语言锚点
                  </DialogTitle>
                  <DialogDescription className="text-white/60">此 ID 将被产品详情或分类引用，支持全动态扩展。</DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-8 space-y-6 bg-white max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-primary tracking-widest">唯一标识符 (Translation ID)</Label>
                  <Input placeholder="例如: spec_vga_output" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-12 rounded-xl bg-muted/10 border-none font-mono" />
                </div>
                <div className="h-px bg-border/40 my-4" />
                {activeLanguages.map(lang => (
                  <div key={lang.code} className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">{lang.label} ({lang.code.toUpperCase()})</Label>
                    <Input 
                      value={formData[lang.code] || ''} 
                      onChange={e => setFormData({...formData, [lang.code]: e.target.value})} 
                      className="rounded-xl h-12 bg-muted/5 border-border/40 focus:bg-white transition-all" 
                    />
                  </div>
                ))}
              </div>
              <DialogFooter className="bg-muted/30 p-6 flex gap-2">
                <Button variant="outline" onClick={() => { setIsAdding(false); setFormData({id:''}); }} className="rounded-xl h-12 flex-1">取消</Button>
                <Button onClick={handleSave} className="rounded-xl h-12 flex-1 shadow-lg">保存翻译</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="搜索 ID、翻译内容或已用锚点..." 
            className="pl-10 border-none bg-muted/40 rounded-xl h-11 focus-visible:ring-0" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>
        <Button 
          variant={showOnlyDuplicates ? "default" : "ghost"} 
          size="sm" 
          onClick={() => setShowOnlyDuplicates(!showOnlyDuplicates)} 
          className={cn(
            "rounded-xl h-11 gap-2 transition-all", 
            showOnlyDuplicates && "bg-orange-600 hover:bg-orange-700 text-white"
          )}
        >
          <AlertTriangle className={cn("h-3.5 w-3.5", showOnlyDuplicates ? "animate-bounce" : "")} /> 
          {showOnlyDuplicates ? "正在查看冗余项" : "仅看重复内容"}
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border border-border/40 shadow-xl overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="pl-8 py-6 font-bold uppercase text-[10px] tracking-widest">锚点 ID / 引用状态</TableHead>
              {activeLanguages.map(lang => (
                <TableHead key={lang.code} className="font-bold uppercase text-[10px] tracking-widest">{lang.label}</TableHead>
              ))}
              <TableHead className="text-right pr-8 font-bold uppercase text-[10px] tracking-widest">管理操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={10} className="h-60 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
            ) : filteredTranslations.map((t) => {
              const fingerprint = activeLanguages.map(l => (t[l.code] || '').trim().toLowerCase()).join('::');
              const isDuplicate = duplicateGroups.has(fingerprint);
              
              return (
                <TableRow key={t.id} className={cn(
                  "group transition-colors",
                  isDuplicate ? "bg-orange-50/50 hover:bg-orange-50" : "hover:bg-muted/5",
                  usedIds.has(t.id) ? "border-l-4 border-l-primary/30" : "border-l-4 border-l-transparent"
                )}>
                  <TableCell className="pl-8">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-sm">{t.id}</code>
                        {isDuplicate && (
                          <Badge variant="outline" className="text-[8px] bg-orange-100 text-orange-700 border-orange-200">内容冗余</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {usedIds.has(t.id) ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <ShieldCheck className="h-3 w-3" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">生产环境引用中</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground opacity-30">
                            <X className="h-3 w-3" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">闲置 ID</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  {activeLanguages.map(lang => (
                    <TableCell key={lang.code}>
                      {editingId === t.id ? (
                        <Input 
                          value={formData[lang.code] || ''} 
                          onChange={e => setFormData({...formData, [lang.code]: e.target.value})} 
                          className="h-9 text-xs rounded-lg" 
                        />
                      ) : (
                        <div className="max-w-[200px] overflow-hidden">
                          <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{t[lang.code] || '-'}</span>
                        </div>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="pr-8 text-right">
                     {editingId === t.id ? (
                       <div className="flex justify-end gap-2">
                         <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8 text-green-600 bg-green-50"><Check className="h-4 w-4" /></Button>
                         <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8"><X className="h-4 w-4" /></Button>
                       </div>
                     ) : (
                       <div className="flex justify-end gap-1">
                         <Button size="icon" variant="ghost" onClick={() => startEdit(t)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="h-3.5 w-3.5" /></Button>
                         {!usedIds.has(t.id) && (
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" 
                             onClick={() => { if(confirm('删除闲置词条？')) deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', t.id)); }}
                           >
                             <Trash2 className="h-3.5 w-3.5" />
                           </Button>
                         )}
                       </div>
                     )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredTranslations.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-40 text-center text-muted-foreground italic">
                  未找到任何匹配的翻译词条
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
