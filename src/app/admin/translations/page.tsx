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
  Globe,
  Info,
  ShieldCheck,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  GitMerge,
  Bot,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { translateContent } from '@/ai/flows/translate-flow';

// AI 极光渐变定义组件 - 增强色距
const AiGradientDef = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="ai-aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stopColor="#22D3EE" offset="0%">
          <animate attributeName="stop-color" values="#22D3EE;#6366F1;#22D3EE" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#6366F1" offset="33%">
          <animate attributeName="stop-color" values="#6366F1;#D946EF;#6366F1" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#D946EF" offset="66%">
          <animate attributeName="stop-color" values="#D946EF;#F43F5E;#D946EF" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#F43F5E" offset="100%">
          <animate attributeName="stop-color" values="#F43F5E;#22D3EE;#F43F5E" dur="4s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
  </svg>
);

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

interface AiConfig {
  isEnabled: boolean;
  model: string;
}

export default function TranslationsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('business');
  const [isAdding, setIsAdding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Record<string, string>>({ id: '' });
  const [newLang, setNewLang] = useState({ code: '', label: '' });

  const langConfigRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'languages') : null, [firestore]);
  const aiRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'ai') : null, [firestore]);
  
  const { data: langSettings } = useDoc<LanguageSettings>(langConfigRef);
  const { data: aiConfig } = useDoc<AiConfig>(aiRef);
  
  const translationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'localizedStrings') : null, [firestore]);
  const { data: translations, isLoading } = useCollection<LocalizedString>(translationsQuery);

  const productsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const catsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'productCategories') : null, [firestore]);
  const galCatsQuery = useMemoFirebase(() => collection(firestore, 'galleryCategories'), [firestore]);
  
  const { data: products } = useCollection(productsQuery);
  const { data: categories } = useCollection(catsQuery);
  const { data: galleryCategories } = useCollection(galCatsQuery);

  const activeLanguages = useMemo(() => langSettings?.supportedLanguages || [
    { code: 'zh', label: '中文' }, 
    { code: 'en', label: 'English' }
  ], [langSettings]);

  const referenceMap = useMemo(() => {
    const map = new Map<string, { type: string, name: string, id: string }[]>();
    const addRef = (textId: string, type: string, name: string, id: string) => {
      if (!textId) return;
      if (!map.has(textId)) map.set(textId, []);
      map.get(textId)!.push({ type, name, id });
    };
    products?.forEach(p => {
      const pName = p.id;
      addRef(p.nameTextId, '产品名称', pName, p.id);
      addRef(p.descriptionTextId, '产品描述', pName, p.id);
      if (p.localizedDetails) {
        Object.keys(p.localizedDetails).forEach(k => addRef(p.localizedDetails[k], '详情内容', pName, p.id));
      }
      p.advantageTextIds?.forEach((id: string) => addRef(id, '核心优势', pName, p.id));
      p.specGroups?.forEach((g: any) => {
        addRef(g.titleId, '规格分组', pName, p.id);
        g.items?.forEach((i: any) => {
          addRef(i.labelId, '规格项名', pName, p.id);
          addRef(i.valueId, '规格内容', pName, p.id);
        });
      });
    });
    categories?.forEach(c => addRef(c.nameTextId, '产品分类', c.id, c.id));
    galleryCategories?.forEach(gc => addRef(gc.nameTextId, '图库分类', gc.id, gc.id));
    return map;
  }, [products, categories, galleryCategories]);

  const usedIds = useMemo(() => new Set(referenceMap.keys()), [referenceMap]);

  const categorizedTranslations = useMemo(() => {
    if (!translations) return { business: [], system: [] };
    
    return translations.reduce((acc, t) => {
      const isBusiness = 
        t.id.startsWith('prod_') || 
        t.id.startsWith('spec_') || 
        t.id.startsWith('cat_') || 
        t.id.startsWith('gal_') || 
        t.id.startsWith('adv_') ||
        usedIds.has(t.id);

      if (isBusiness) acc.business.push(t);
      else acc.system.push(t);
      
      return acc;
    }, { business: [] as LocalizedString[], system: [] as LocalizedString[] });
  }, [translations, usedIds]);

  const semanticDuplicates = useMemo(() => {
    const list = categorizedTranslations.business;
    const groups = new Map<string, string[]>();
    
    list.forEach(t => {
      const zh = (t.zh || '').trim().toLowerCase();
      const en = (t.en || '').trim().toLowerCase();
      
      list.forEach(other => {
        if (t.id === other.id) return;
        const oZh = (other.zh || '').trim().toLowerCase();
        const oEn = (other.en || '').trim().toLowerCase();
        
        if ((en !== '' && en === oEn) || (zh !== '' && zh === oZh)) {
          const groupKey = en !== '' && en === oEn ? `en:${en}` : `zh:${zh}`;
          if (!groups.has(groupKey)) groups.set(groupKey, [t.id]);
          if (!groups.get(groupKey)!.includes(other.id)) groups.get(groupKey)!.push(other.id);
        }
      });
    });
    return groups;
  }, [categorizedTranslations.business]);

  const duplicatableCount = useMemo(() => {
    let count = 0;
    semanticDuplicates.forEach(ids => {
      const referencedCount = ids.filter(id => usedIds.has(id)).length;
      if (ids.length > referencedCount && ids.length > 1) count++;
    });
    return count;
  }, [semanticDuplicates, usedIds]);

  const handleMergeReferences = async (masterId: string, redundantIds: string[]) => {
    if (!firestore || !products || !categories) return;
    if (!confirm(`确定要合并引用吗？这将修改全站关联位置。`)) return;
    
    setIsMerging(true);
    const redundantSet = new Set(redundantIds);
    const migrate = (id: string) => redundantSet.has(id) ? masterId : id;

    products.forEach(p => {
      let changed = false;
      const newName = migrate(p.nameTextId); if (newName !== p.nameTextId) changed = true;
      const newDesc = migrate(p.descriptionTextId); if (newDesc !== p.descriptionTextId) changed = true;
      const newAdvs = p.advantageTextIds?.map((id: string) => { const mid = migrate(id); if (mid !== id) changed = true; return mid; });
      const newSpecs = p.specGroups?.map((g: any) => {
        let gChanged = false;
        const newTitle = migrate(g.titleId); if (newTitle !== g.titleId) gChanged = true;
        const newItems = g.items?.map((item: any) => {
          const nl = migrate(item.labelId); const nv = migrate(item.valueId);
          if (nl !== item.labelId || nv !== item.valueId) gChanged = true;
          return { labelId: nl, valueId: nv };
        });
        if (gChanged) changed = true;
        return { titleId: newTitle, items: newItems };
      });

      if (changed) {
        updateDocumentNonBlocking(doc(firestore, 'products', p.id), {
          nameTextId: newName, descriptionTextId: newDesc, advantageTextIds: newAdvs, specGroups: newSpecs, updatedAt: serverTimestamp()
        });
      }
    });

    categories.forEach(c => {
      const nn = migrate(c.nameTextId);
      if (nn !== c.nameTextId) updateDocumentNonBlocking(doc(firestore, 'productCategories', c.id), { nameTextId: nn });
    });

    setTimeout(() => { setIsMerging(false); toast({ title: "合并引用完成" }); }, 1000);
  };

  const handleAutoCleanup = () => {
    if (!firestore || semanticDuplicates.size === 0) return;
    if (!confirm(`将安全移除业务库中的闲置冗余词条。`)) return;
    setIsCleaning(true);
    semanticDuplicates.forEach((ids) => {
      const referencedOnes = ids.filter(id => usedIds.has(id));
      const masterId = referencedOnes.length > 0 ? referencedOnes[0] : ids[0];
      ids.filter(id => id !== masterId && !usedIds.has(id)).forEach(id => { 
        deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', id)); 
      });
    });
    setIsCleaning(false);
    toast({ title: "清理完成" });
  };

  const handleAiTranslate = async (t: LocalizedString) => {
    if (!aiConfig?.isEnabled) { toast({ variant: "destructive", title: "AI 未启用" }); return; }
    const st = t.en || t.zh; const sc = t.en ? 'en' : 'zh';
    if (!st) return;
    const ml = activeLanguages.filter(l => !t[l.code]).map(l => l.code);
    if (ml.length === 0) return;
    setTranslatingId(t.id);
    try {
      const res = await translateContent({ text: st, sourceLang: sc, targetLangs: ml, model: aiConfig.model });
      if (res && firestore) {
        setDocumentNonBlocking(doc(firestore, 'localizedStrings', t.id), { ...t, ...res, updatedAt: serverTimestamp() }, { merge: true });
        toast({ title: "AI 智译成功" });
      }
    } catch (e) { toast({ variant: "destructive", title: "AI 翻译失败" }); }
    finally { setTranslatingId(null); }
  };

  const filteredTranslations = useMemo(() => {
    const list = activeTab === 'business' ? categorizedTranslations.business : categorizedTranslations.system;
    return list.filter(t => {
      const search = searchQuery.toLowerCase();
      const ms = t.id.toLowerCase().includes(search) || Object.values(t).some(v => typeof v === 'string' && v.toLowerCase().includes(search));
      if (showOnlyDuplicates && activeTab === 'business') {
        let hasM = false; semanticDuplicates.forEach(ids => { if (ids.includes(t.id)) hasM = true; });
        return ms && hasM;
      }
      return ms;
    });
  }, [categorizedTranslations, searchQuery, showOnlyDuplicates, semanticDuplicates, activeTab]);

  const handleSave = () => {
    if (!firestore || !formData.id) return;
    setDocumentNonBlocking(doc(firestore, 'localizedStrings', formData.id), { ...formData, updatedAt: serverTimestamp() }, { merge: true });
    setIsAdding(false); setEditingId(null); setFormData({ id: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <AiGradientDef />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2"><Languages className="h-5 w-5" /> 翻译资产管理</h2>
          <p className="text-xs text-muted-foreground">分域管理业务内容与系统文案。支持 AI 批量填充与引用冲突合并。</p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === 'business' && duplicatableCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleAutoCleanup} disabled={isCleaning || isMerging} className="rounded-lg h-9 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 gap-1.5 shadow-sm font-bold text-[10px] uppercase">
              {isCleaning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              一键清理 ({duplicatableCount})
            </Button>
          )}
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="rounded-lg h-9 gap-1.5 text-xs"><Settings2 className="h-3.5 w-3.5" /> 语种</Button></DialogTrigger>
            <DialogContent className="rounded-xl max-w-sm p-6 border-none shadow-2xl">
               <DialogHeader><DialogTitle className="text-sm font-bold uppercase tracking-widest">语种配置</DialogTitle></DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="space-y-2">
                   {activeLanguages.map(l => (
                     <div key={l.code} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border text-xs">
                       <span className="font-bold">{l.label}</span><span className="font-mono uppercase opacity-40">{l.code}</span>
                     </div>
                   ))}
                 </div>
                 <div className="pt-4 border-t space-y-3">
                   <Label className="text-[10px] font-bold uppercase text-primary">新增语种</Label>
                   <div className="grid grid-cols-2 gap-2">
                     <Input placeholder="代码" value={newLang.code} onChange={e => setNewLang({...newLang, code: e.target.value.toLowerCase()})} className="h-9 text-xs" />
                     <Input placeholder="名称" value={newLang.label} onChange={e => setNewLang({...newLang, label: e.target.value})} className="h-9 text-xs" />
                   </div>
                   <Button size="sm" onClick={() => { if(!newLang.code) return; const updated = [...activeLanguages, newLang]; setDoc(doc(firestore, 'settings', 'languages'), { supportedLanguages: updated }); setNewLang({ code: '', label: '' }); }} className="w-full h-9 rounded-lg text-xs">确认添加</Button>
                 </div>
               </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" onClick={() => { setIsAdding(true); setFormData({id:''}); }} className="rounded-lg h-9 px-4 font-bold uppercase tracking-widest text-[10px] gap-1.5 shadow-sm"><Plus className="h-3.5 w-3.5" /> 新增词条</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <TabsList className="bg-muted/40 p-1 rounded-lg h-10">
            <TabsTrigger value="business" className="rounded-md h-8 px-4 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <LayoutGrid className="h-3 w-3" /> 业务内容 <Badge variant="secondary" className="ml-1 text-[8px] h-3.5 px-1">{categorizedTranslations.business.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-md h-8 px-4 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3 w-3" /> 系统文案 <Badge variant="secondary" className="ml-1 text-[8px] h-3.5 px-1">{categorizedTranslations.system.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-border/40 shadow-sm flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="搜索 ID 或文本..." className="pl-8 border-none bg-muted/30 rounded-md h-8 text-[11px] focus-visible:ring-0" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {activeTab === 'business' && (
              <Button variant={showOnlyDuplicates ? "default" : "ghost"} size="sm" onClick={() => setShowOnlyDuplicates(!showOnlyDuplicates)} className={cn("h-8 rounded-md text-[10px] uppercase font-bold gap-1", showOnlyDuplicates && "bg-orange-600 text-white")}>
                <AlertTriangle className="h-3 w-3" /> {showOnlyDuplicates ? "显示冗余" : "查重"}
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-6 py-4 font-bold uppercase text-[9px] tracking-wider w-56">锚点 ID / 引用</TableHead>
                {activeLanguages.map(lang => (<TableHead key={lang.code} className="font-bold uppercase text-[9px] tracking-wider">{lang.label}</TableHead>))}
                <TableHead className="text-right pr-6 font-bold uppercase text-[9px] tracking-wider w-24">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="h-40 text-center"><Loader2 className="h-40 w-40 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : filteredTranslations.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="h-40 text-center text-[10px] text-muted-foreground italic uppercase">暂无数据</TableCell></TableRow>
              ) : filteredTranslations.map((t) => {
                const refs = referenceMap.get(t.id) || [];
                let semanticIds: string[] = [];
                if (activeTab === 'business') { semanticDuplicates.forEach((ids) => { if (ids.includes(t.id)) semanticIds = ids; }); }
                const isDuplicate = semanticIds.length > 1;

                return (
                  <TableRow key={t.id} className={cn("group transition-colors", isDuplicate ? "bg-orange-50/30" : "hover:bg-muted/5", refs.length > 0 ? "border-l-4 border-l-primary/20" : "border-l-4 border-l-transparent")}>
                    <TableCell className="pl-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <code className="text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded uppercase">{t.id}</code>
                          {isDuplicate && (
                            <TooltipProvider><Tooltip><TooltipTrigger asChild><Badge variant="outline" className="text-[7px] bg-orange-100 text-orange-700 border-orange-200 h-4 px-1 cursor-help">冗余</Badge></TooltipTrigger><TooltipContent className="p-3 rounded-lg max-w-xs bg-white border-orange-200 shadow-xl"><div className="space-y-3 text-[10px]"><p className="font-bold uppercase text-orange-700 border-b pb-1">语义冲突：内容完全一致</p><div className="space-y-1">{semanticIds.map(sid => (<div key={sid} className={cn("font-mono p-1 rounded", sid === t.id ? "bg-primary/5 text-primary font-bold" : "opacity-40")}>{sid}</div>))}</div><Button size="sm" disabled={isMerging} className="w-full h-7 text-[9px] font-bold bg-orange-600 hover:bg-orange-700" onClick={() => handleMergeReferences(t.id, semanticIds.filter(id => id !== t.id))}>{isMerging ? <Loader2 className="h-3 w-3 animate-spin" /> : "设为主锚点并合并所有引用"}</Button></div></TooltipContent></Tooltip></TooltipProvider>
                          )}
                        </div>
                        {refs.length > 0 ? (
                          <TooltipProvider><Tooltip><TooltipTrigger asChild><div className="flex items-center gap-1 text-green-600 cursor-help opacity-60"><ShieldCheck className="h-2.5 w-2.5" /><span className="text-[8px] font-bold uppercase tracking-tighter">引用中 ({refs.length})</span></div></TooltipTrigger><TooltipContent className="p-3 rounded-lg bg-white shadow-xl border-primary/10"><div className="space-y-2 text-[10px]"><p className="font-bold uppercase text-primary border-b pb-1">引用来源</p>{refs.map((ref, idx) => (<div key={idx} className="flex items-center justify-between gap-4"><div className="flex flex-col"><span className="text-[8px] opacity-40 font-bold uppercase">{ref.type}</span><span className="font-bold">{ref.name}</span></div><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => window.open(ref.type.includes('图库') ? '/admin/gallery' : `/admin/products/editor?id=${ref.id}`, '_blank')}><ExternalLink className="h-3 w-3" /></Button></div>))}</div></TooltipContent></Tooltip></TooltipProvider>
                        ) : (<div className="flex items-center gap-1 text-muted-foreground opacity-20"><X className="h-2.5 w-2.5" /><span className="text-[8px] font-bold uppercase tracking-tighter">闲置</span></div>)}
                      </div>
                    </TableCell>
                    {activeLanguages.map(lang => (
                      <TableCell key={lang.code}>
                        {editingId === t.id ? (
                          <Input value={formData[lang.code] || ''} onChange={e => setFormData({...formData, [lang.code]: e.target.value})} className="h-8 text-[11px] rounded-md" />
                        ) : (
                          <span className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{t[lang.code] || '-'}</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="pr-6 text-right">
                       {editingId === t.id ? (
                         <div className="flex justify-end gap-1.5">
                           <Button size="icon" variant="ghost" onClick={handleSave} className="h-7 w-7 text-green-600 bg-green-50"><Check className="h-3.5 w-3.5" /></Button>
                           <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-7 w-7"><X className="h-3.5 w-3.5" /></Button>
                         </div>
                       ) : (
                         <div className="flex justify-end items-center gap-0.5">
                           {aiConfig?.isEnabled && (
                             /* 精简版按钮样式 (Minimal) - 移除 variant 冲突 */
                             <Button 
                              size="icon" 
                              className="h-8 w-8 text-primary ai-btn-glow" 
                              onClick={() => handleAiTranslate(t)} 
                              disabled={translatingId === t.id}
                             >
                               {translatingId === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-4 w-4 ai-icon-gradient" />}
                             </Button>
                           )}
                           <Button size="icon" variant="ghost" onClick={() => { setFormData(t); setEditingId(t.id); }} className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="h-3.5 w-3.5" /></Button>
                           {refs.length === 0 && (
                             <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { if(confirm('删除此词条？')) deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', t.id)); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                           )}
                         </div>
                       )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Tabs>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="rounded-xl max-w-md p-0 overflow-hidden shadow-2xl border-none">
          <div className="bg-primary p-6 text-white"><DialogHeader><DialogTitle className="text-lg font-bold uppercase tracking-widest">创建翻译词条</DialogTitle></DialogHeader></div>
          <div className="p-6 space-y-5 bg-white">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-primary">唯一 ID</Label>
              <Input placeholder="建议前缀: ui_ 或 prod_" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-10 rounded-lg bg-muted/10 border-none font-mono text-xs" />
            </div>
            {activeLanguages.map(lang => (
              <div key={lang.code} className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-muted-foreground">{lang.label}</Label><Input value={formData[lang.code] || ''} onChange={e => setFormData({...formData, [lang.code]: e.target.value})} className="rounded-lg h-10 text-xs" /></div>
            ))}
          </div>
          <DialogFooter className="bg-muted/20 p-4 border-t gap-2"><Button variant="outline" size="sm" onClick={() => setIsAdding(false)} className="h-9 rounded-lg flex-1">取消</Button><Button size="sm" onClick={handleSave} className="h-9 rounded-lg flex-1">立即保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
