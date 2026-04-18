
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

  // 1. 获取配置
  const langConfigRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'languages') : null, [firestore]);
  const aiRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'ai') : null, [firestore]);
  
  const { data: langSettings } = useDoc<LanguageSettings>(langConfigRef);
  const { data: aiConfig } = useDoc<AiConfig>(aiRef);
  
  const translationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'localizedStrings') : null, [firestore]);
  const { data: translations, isLoading } = useCollection<LocalizedString>(translationsQuery);

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

  // 2. 引用分析：识别哪些词条正在被“业务实体”使用
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
      if (p.detailsTextId) addRef(p.detailsTextId, '详细内容', pName, p.id);
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

  // 3. 词条分类逻辑：区分 业务(Business) 与 系统(System/UI)
  const categorizedTranslations = useMemo(() => {
    if (!translations) return { business: [], system: [] };
    
    return translations.reduce((acc, t) => {
      // 业务词条特征：有明确的产品前缀，或者正在被产品引用
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

  // 4. 语义去重逻辑：仅针对“业务内容”进行语义探测
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
        
        // 只有中英双向内容完全一致（忽略大小写）才视为冗余
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

  // 核心合并引擎：跨集合引用重定向
  const handleMergeReferences = async (masterId: string, redundantIds: string[]) => {
    if (!firestore || !products || !categories || !galleryCategories) return;
    const count = redundantIds.reduce((acc, rid) => acc + (referenceMap.get(rid)?.length || 0), 0);
    if (count === 0) {
      toast({ title: "无需迁移", description: "这些冗余项目前没有被任何产品引用。" });
      return;
    }
    if (!confirm(`确定合并 ${redundantIds.length} 个词条到 ${masterId} 吗？\n将一键迁移全站 ${count} 处引用位置。`)) return;
    
    setIsMerging(true);
    let updatedCount = 0;
    const redundantSet = new Set(redundantIds);
    const migrate = (id: string) => redundantSet.has(id) ? masterId : id;

    // 穿透扫描产品文档
    products.forEach(p => {
      let changed = false;
      const newName = migrate(p.nameTextId); if (newName !== p.nameTextId) changed = true;
      const newDesc = migrate(p.descriptionTextId); if (newDesc !== p.descriptionTextId) changed = true;
      const newDetails = p.detailsTextId ? migrate(p.detailsTextId) : undefined; if (newDetails !== p.detailsTextId) changed = true;
      const newAdvs = p.advantageTextIds?.map((id: string) => { const mid = migrate(id); if (mid !== id) changed = true; return mid; });
      const newSpecs = p.specGroups?.map((g: any) => {
        let gChanged = false;
        const newTitle = migrate(g.titleId); if (newTitle !== g.titleId) gChanged = true;
        const newItems = g.items?.map((item: any) => {
          const newLabel = migrate(item.labelId);
          const newValue = migrate(item.valueId);
          if (newLabel !== item.labelId || newValue !== item.valueId) gChanged = true;
          return { labelId: newLabel, valueId: newValue };
        });
        if (gChanged) changed = true;
        return { titleId: newTitle, items: newItems };
      });

      if (changed) {
        updateDocumentNonBlocking(doc(firestore, 'products', p.id), {
          nameTextId: newName, descriptionTextId: newDesc, detailsTextId: newDetails, advantageTextIds: newAdvs, specGroups: newSpecs, updatedAt: serverTimestamp()
        });
        updatedCount++;
      }
    });

    // 扫描分类文档
    categories.forEach(c => {
      const newName = migrate(c.nameTextId);
      if (newName !== c.nameTextId) { updateDocumentNonBlocking(doc(firestore, 'productCategories', c.id), { nameTextId: newName }); updatedCount++; }
    });

    setTimeout(() => { 
      setIsMerging(false); 
      toast({ title: "智能合并完成", description: `已将 ${updatedCount} 个实体的引用重定向至新锚点。` }); 
    }, 1000);
  };

  const handleAutoCleanup = () => {
    if (!firestore || semanticDuplicates.size === 0) return;
    if (!confirm(`将安全移除业务库中 ${duplicatableCount} 组闲置的重复词条。系统文案将受保护不受影响。`)) return;
    setIsCleaning(true);
    let deleteCount = 0;
    semanticDuplicates.forEach((ids) => {
      const referencedOnes = ids.filter(id => usedIds.has(id));
      const masterId = referencedOnes.length > 0 ? referencedOnes[0] : ids[0];
      const removableIds = ids.filter(id => id !== masterId && !usedIds.has(id));
      removableIds.forEach(id => { deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', id)); deleteCount++; });
    });
    setIsCleaning(false);
    toast({ title: "清理完成", description: `已成功释放 ${deleteCount} 个业务冗余词条。` });
  };

  const handleAiTranslate = async (t: LocalizedString) => {
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 未启用", description: "请先在系统设置中开启 AI 功能。" });
      return;
    }
    const sourceText = t.en || t.zh;
    const sourceCode = t.en ? 'en' : 'zh';
    if (!sourceText) {
      toast({ variant: "destructive", title: "内容缺失", description: "该项没有可供翻译的内容。" });
      return;
    }
    const missingLangs = activeLanguages.filter(l => !t[l.code]).map(l => l.code);
    if (missingLangs.length === 0) {
      toast({ title: "无需翻译", description: "所有语种内容已齐全。" });
      return;
    }
    setTranslatingId(t.id);
    try {
      const results = await translateContent({ text: sourceText, sourceLang: sourceCode, targetLangs: missingLangs, model: aiConfig.model });
      if (results && firestore) {
        setDocumentNonBlocking(doc(firestore, 'localizedStrings', t.id), { ...t, ...results, updatedAt: serverTimestamp() }, { merge: true });
        toast({ title: "AI 智译成功" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "AI 翻译失败" });
    } finally {
      setTranslatingId(null);
    }
  };

  const filteredTranslations = useMemo(() => {
    const list = activeTab === 'business' ? categorizedTranslations.business : categorizedTranslations.system;
    return list.filter(t => {
      const search = searchQuery.toLowerCase();
      const matchesSearch = t.id.toLowerCase().includes(search) || 
        Object.values(t).some(v => typeof v === 'string' && v.toLowerCase().includes(search));
      if (showOnlyDuplicates && activeTab === 'business') {
        let hasSemanticMatch = false;
        semanticDuplicates.forEach(ids => { if (ids.includes(t.id)) hasSemanticMatch = true; });
        return matchesSearch && hasSemanticMatch;
      }
      return matchesSearch;
    });
  }, [categorizedTranslations, searchQuery, showOnlyDuplicates, semanticDuplicates, activeTab]);

  const handleSave = () => {
    if (!firestore || !formData.id) return;
    setDocumentNonBlocking(doc(firestore, 'localizedStrings', formData.id), { ...formData, updatedAt: serverTimestamp() }, { merge: true });
    setIsAdding(false); setEditingId(null); setFormData({ id: '' });
    toast({ title: "保存成功" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <Languages className="h-6 w-6" /> 全球多语言资产
          </h2>
          <p className="text-sm text-muted-foreground">支持“业务数据”与“系统文案”分区管理，杜绝翻译锚点冲突。</p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === 'business' && duplicatableCount > 0 && (
            <Button variant="outline" onClick={handleAutoCleanup} disabled={isCleaning || isMerging} className="rounded-xl h-12 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 gap-2 shadow-sm">
              {isCleaning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-current" />}
              安全清理业务冗余 ({duplicatableCount})
            </Button>
          )}
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild><Button variant="outline" className="rounded-xl h-12 gap-2"><Settings2 className="h-4 w-4" /> 语种设置</Button></DialogTrigger>
            <DialogContent className="rounded-[2rem] max-w-md p-8">
               <DialogHeader><DialogTitle>扩展语种配置</DialogTitle></DialogHeader>
               <div className="space-y-4 py-4">
                 {activeLanguages.map(l => (
                   <div key={l.code} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border">
                     <div className="flex flex-col"><span className="text-sm font-bold">{l.label}</span><span className="text-[10px] font-mono opacity-50">{l.code}</span></div>
                   </div>
                 ))}
                 <div className="pt-6 border-t space-y-4">
                   <Label className="text-[10px] font-bold uppercase text-primary">新增支持语种</Label>
                   <div className="grid grid-cols-2 gap-2">
                     <Input placeholder="代码 (vi)" value={newLang.code} onChange={e => setNewLang({...newLang, code: e.target.value.toLowerCase()})} className="rounded-xl h-12" />
                     <Input placeholder="名称 (越南语)" value={newLang.label} onChange={e => setNewLang({...newLang, label: e.target.value})} className="rounded-xl h-12" />
                   </div>
                   <Button onClick={() => { if(!newLang.code) return; const updated = [...activeLanguages, newLang]; setDoc(doc(firestore, 'settings', 'languages'), { supportedLanguages: updated }); setNewLang({ code: '', label: '' }); }} className="w-full h-12 rounded-xl">开启新语种</Button>
                 </div>
               </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => { setIsAdding(true); setFormData({id:''}); }} className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2 shadow-lg"><Plus className="h-4 w-4" /> 新增词条</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-muted/40 p-1 rounded-xl h-12">
            <TabsTrigger value="business" className="rounded-lg h-10 px-6 font-bold text-[11px] uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5" /> 动态业务内容
              <Badge variant="secondary" className="ml-1.5 text-[8px] h-4 px-1">{categorizedTranslations.business.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg h-10 px-6 font-bold text-[11px] uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> 核心系统文案
              <Badge variant="secondary" className="ml-1.5 text-[8px] h-4 px-1">{categorizedTranslations.system.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-border/40 shadow-sm flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索 ID 或翻译内容..." className="pl-10 border-none bg-muted/20 rounded-lg h-10 focus-visible:ring-0" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {activeTab === 'business' && (
              <Button variant={showOnlyDuplicates ? "default" : "ghost"} size="sm" onClick={() => setShowOnlyDuplicates(!showOnlyDuplicates)} className={cn("rounded-lg h-10 gap-2", showOnlyDuplicates && "bg-orange-600 text-white")}>
                <AlertTriangle className="h-3.5 w-3.5" /> {showOnlyDuplicates ? "查看冗余项" : "查重"}
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border shadow-xl overflow-x-auto min-h-[500px]">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-8 py-6 font-bold uppercase text-[10px] tracking-widest">锚点 ID / 引用详情</TableHead>
                {activeLanguages.map(lang => (<TableHead key={lang.code} className="font-bold uppercase text-[10px] tracking-widest">{lang.label}</TableHead>))}
                <TableHead className="text-right pr-8 font-bold uppercase text-[10px] tracking-widest">管理操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="h-60 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : filteredTranslations.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="h-60 text-center text-muted-foreground italic">暂无符合条件的词条</TableCell></TableRow>
              ) : filteredTranslations.map((t) => {
                const refs = referenceMap.get(t.id) || [];
                let semanticIds: string[] = [];
                if (activeTab === 'business') {
                   semanticDuplicates.forEach((ids) => { if (ids.includes(t.id)) semanticIds = ids; });
                }
                const isDuplicate = semanticIds.length > 1;

                return (
                  <TableRow key={t.id} className={cn("group transition-colors", isDuplicate ? "bg-orange-50/50" : "hover:bg-muted/5", refs.length > 0 ? "border-l-4 border-l-primary/30" : "border-l-4 border-l-transparent")}>
                    <TableCell className="pl-8">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-sm">{t.id}</code>
                          {isDuplicate && (
                            <TooltipProvider><Tooltip><TooltipTrigger asChild><Badge variant="outline" className="text-[8px] bg-orange-100 text-orange-700 border-orange-200 cursor-help">语义重叠</Badge></TooltipTrigger><TooltipContent className="p-4 rounded-xl max-w-xs bg-white border-orange-200 shadow-2xl"><div className="space-y-4"><div className="space-y-1"><p className="text-[10px] font-bold uppercase text-orange-700 border-b border-orange-100 pb-1 flex items-center justify-between">检测到语义冲突<GitMerge className="h-3 w-3" /></p><div className="space-y-2 pt-2">{semanticIds.map(sid => (<div key={sid} className="flex flex-col gap-0.5 border-l-2 border-orange-100 pl-2"><div className="flex items-center justify-between"><span className={cn("text-[10px] font-mono", sid === t.id ? "font-bold text-primary" : "opacity-40")}>{sid}</span></div></div>))}</div></div><div className="pt-2 border-t border-orange-100"><Button size="sm" disabled={isMerging} className="w-full h-8 text-[9px] font-bold bg-orange-600 hover:bg-orange-700 rounded-lg gap-1.5" onClick={() => handleMergeReferences(t.id, semanticIds.filter(id => id !== t.id))}>{isMerging ? <Loader2 className="h-3 w-3 animate-spin" /> : <GitMerge className="h-3 w-3" />}设为主锚点并合并引用</Button></div></div></TooltipContent></Tooltip></TooltipProvider>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 items-center">
                          {refs.length > 0 ? (
                            <TooltipProvider><Tooltip><TooltipTrigger asChild><div className="flex items-center gap-1 text-green-600 cursor-help"><ShieldCheck className="h-3 w-3" /><span className="text-[9px] font-bold uppercase tracking-tighter">业务引用 ({refs.length})</span></div></TooltipTrigger><TooltipContent className="p-4 rounded-xl max-w-xs bg-white border-primary/20 shadow-2xl"><div className="space-y-2"><p className="text-[10px] font-bold uppercase text-primary border-b pb-1 mb-2">引用位置</p>{refs.map((ref, idx) => (<div key={idx} className="flex items-center justify-between gap-4 group/ref"><div className="flex flex-col"><span className="text-[9px] opacity-40 font-bold uppercase">{ref.type}</span><span className="text-[11px] font-bold truncate max-w-[120px]">{ref.name}</span></div><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(ref.type.includes('图库') ? '/admin/gallery' : `/admin/products/editor?id=${ref.id}`, '_blank')}><ExternalLink className="h-3 w-3" /></Button></div>))}</div></TooltipContent></Tooltip></TooltipProvider>
                          ) : (<div className="flex items-center gap-1 text-muted-foreground opacity-30"><X className="h-3 w-3" /><span className="text-[9px] font-bold uppercase tracking-tighter">闲置词条</span></div>)}
                        </div>
                      </div>
                    </TableCell>
                    {activeLanguages.map(lang => (
                      <TableCell key={lang.code}>
                        {editingId === t.id ? (
                          <Input value={formData[lang.code] || ''} onChange={e => setFormData({...formData, [lang.code]: e.target.value})} className="h-9 text-xs rounded-lg" />
                        ) : (
                          <span className="text-xs text-muted-foreground line-clamp-2">{t[lang.code] || '-'}</span>
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
                         <div className="flex justify-end items-center gap-1">
                           {aiConfig?.isEnabled && (
                             <Button size="icon" variant="ghost" className="h-8 w-8 text-accent hover:bg-accent/10" onClick={() => handleAiTranslate(t)} disabled={translatingId === t.id}>
                               {translatingId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                             </Button>
                           )}
                           <Button size="icon" variant="ghost" onClick={() => { setFormData(t); setEditingId(t.id); }} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="h-3.5 w-3.5" /></Button>
                           {refs.length === 0 && (
                             <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { if(confirm('删除此词条？')) deleteDocumentNonBlocking(doc(firestore, 'localizedStrings', t.id)); }}><Trash2 className="h-3.5 w-3.5" /></Button>
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
        <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden shadow-2xl border-none">
          <div className="bg-primary p-8 text-white"><DialogHeader><DialogTitle className="text-2xl font-bold">创建翻译锚点</DialogTitle></DialogHeader></div>
          <div className="p-8 space-y-6 bg-white max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-primary">唯一 ID</Label>
              <Input placeholder="建议前缀: ui_ 或 business_" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-12 rounded-xl bg-muted/10 border-none font-mono" />
              <p className="text-[10px] text-muted-foreground italic">系统文案建议以 ui_ 开头，业务内容建议以 prod_ 或 spec_ 开头。</p>
            </div>
            {activeLanguages.map(lang => (
              <div key={lang.code} className="space-y-2"><Label className="text-[10px] font-bold uppercase text-muted-foreground">{lang.label}</Label><Input value={formData[lang.code] || ''} onChange={e => setFormData({...formData, [lang.code]: e.target.value})} className="rounded-xl h-12 bg-muted/5" /></div>
            ))}
          </div>
          <DialogFooter className="bg-muted/30 p-6 flex gap-2"><Button variant="outline" onClick={() => setIsAdding(false)} className="rounded-xl h-12 flex-1">取消</Button><Button onClick={handleSave} className="rounded-xl h-12 flex-1 shadow-lg">立即保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
