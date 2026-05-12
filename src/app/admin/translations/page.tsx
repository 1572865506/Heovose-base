"use client";

import { useState, useMemo } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
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
import { Textarea } from '@/components/ui/textarea';
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
  BookOpen,
  ShieldCheck,
  Layers,
  FileText,
  Copy,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  GitMerge,
  Bot,
  LayoutGrid,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { ShinyButton } from '@/components/ui/shiny-button';
import { translateContent } from '@/ai/flows/translate-flow';
import { translations as localLibrary } from '@/lib/translations';

// AI 极光渐变定义组件 - 增强色距与饱和度
const AiGradientDef = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="ai-aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stopColor="#06B6D4" offset="0%">
          <animate attributeName="stop-color" values="#06B6D4;#4F46E5;#06B6D4" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#4F46E5" offset="33%">
          <animate attributeName="stop-color" values="#4F46E5;#D946EF;#4F46E5" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#D946EF" offset="66%">
          <animate attributeName="stop-color" values="#D946EF;#F43F5E;#D946EF" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop stopColor="#F43F5E" offset="100%">
          <animate attributeName="stop-color" values="#F43F5E;#06B6D4;#F43F5E" dur="4s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
  </svg>
);

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden", className)}>
    {children}
  </div>
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
  apiKey: string;
}

export default function TranslationsPage() {
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
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  interface TranslationForm {
    id: string;
    translations: Record<string, string>;
  }
  
  const [formData, setFormData] = useState<TranslationForm>({ 
    id: '', 
    translations: {} 
  });
  const [newLang, setNewLang] = useState({ code: '', label: '' });

  // 删除状态
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: langSettings, mutate: mutateLangs } = useLocalDoc<LanguageSettings>('settings', 'languages');
  const { data: aiConfig } = useLocalDoc<AiConfig>('settings', 'ai');
  const { data: translations, isLoading, mutate: mutateTrans } = useLocalCollection<LocalizedString>('localizedStrings?full=true');
  const { data: products, mutate: mutateProducts } = useLocalCollection<any>('products');
  const { data: categories, mutate: mutateCategories } = useLocalCollection<any>('productCategories');
  const { data: galleryCategories, mutate: mutateGalleryCats } = useLocalCollection<any>('galleryCategories');

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'updatedAt', direction: 'desc' });

  const activeLanguages = useMemo(() => langSettings?.supportedLanguages || [
    { code: 'zh', label: '中文' }, 
    { code: 'en', label: 'English' }
  ], [langSettings]);

  const referenceMap = useMemo(() => {
    const map = new Map<string, { type: string, name: string, id: string, linkable: boolean }[]>();
    const getT = (id: string, field: string = 'en', isDesc: boolean = false) => {
      if (!id) return "";
      const entry = translations?.find((item: any) => item.id === id);
      if (!entry) return isDesc ? "" : id;
      const content = (entry.content as any) || {};
      const val = content[field] || entry[field] || content['en'] || entry['en'] || content['zh'] || entry['zh'];
      return val || (isDesc ? "" : id);
    };
    const addRef = (textId: string, type: string, name: string, id: string, linkable: boolean = true) => {
      if (!textId) return;
      if (!map.has(textId)) map.set(textId, []);
      map.get(textId)!.push({ type, name, id, linkable });
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
    categories?.forEach(c => {
      addRef(c.nameTextId, '产品分类', c.id, c.id, false);
      addRef(c.descriptionTextId, '分类简介', c.id, c.id, false);
    });
    galleryCategories?.forEach(gc => {
      addRef(gc.nameTextId, '图库分类', gc.id, gc.id, false);
      addRef(gc.descriptionTextId, '图库简介', gc.id, gc.id, false);
    });
    return map;
  }, [products, categories, galleryCategories]);

  const usedIds = useMemo(() => new Set(referenceMap.keys()), [referenceMap]);

  const categorizedTranslations = useMemo(() => {
    if (!translations) return { business: [], system: [] };
    
    return translations.reduce((acc, t) => {
      let category = 'system';
      const isBusiness = 
        t.id.startsWith('prod_') || 
        t.id.startsWith('spec_') || 
        t.id.startsWith('adv_') ||
        t.id.startsWith('psl_') ||
        t.id.startsWith('psv_') ||
        t.id.startsWith('psg_');

      if (isBusiness) {
        acc.business.push(t);
      } else {
        acc.system.push(t);
      }
      
      return acc;
    }, { business: [] as LocalizedString[], system: [] as LocalizedString[] });
  }, [translations, usedIds]);

  const getResourceCategory = (id: string) => {
    if (id.startsWith('prod_')) return { label: '产品内容', color: 'bg-blue-100 text-blue-700' };
    if (id.startsWith('psl_') || id.startsWith('psv_') || id.startsWith('psg_') || id.startsWith('spec_')) return { label: '技术规格', color: 'bg-purple-100 text-purple-700' };
    if (id.startsWith('cat_')) return { label: '类目名称', color: 'bg-emerald-100 text-emerald-700' };
    if (id.startsWith('gal_')) return { label: '媒体资产', color: 'bg-pink-100 text-pink-700' };
    if (id.startsWith('adv_')) return { label: '卖点优势', color: 'bg-amber-100 text-amber-700' };
    if (usedIds.has(id)) return { label: '动态关联', color: 'bg-slate-100 text-slate-700' };
    return { label: '系统文案', color: 'bg-rose-50 text-rose-600 border-rose-100' };
  };

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
      const referencedOnes = ids.filter(id => usedIds.has(id));
      const masterId = referencedOnes.length > 0 ? referencedOnes[0] : ids[0];
      count += ids.filter(id => id !== masterId && !usedIds.has(id)).length;
    });
    return count;
  }, [semanticDuplicates, usedIds]);

  const handleMergeReferences = async (masterId: string, redundantIds: string[]) => {
    if (!products || !categories) return;
    if (!confirm(`确定要合并引用吗？这将修改全站关联位置。`)) return;
    
    setIsMerging(true);
    const redundantSet = new Set(redundantIds);
    const migrate = (id: string) => redundantSet.has(id) ? masterId : id;

    try {
      await Promise.all(products.map(async (p: any) => {
        let changed = false;
        const newName = migrate(p.nameTextId); if (newName !== p.nameTextId) changed = true;
        const newDesc = migrate(p.descriptionTextId); if (newDesc !== p.descriptionTextId) changed = true;
        
        if (changed) {
          return fetch(`/api/products/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...p, nameTextId: newName, descriptionTextId: newDesc }),
          });
        }
      }));

      await Promise.all(categories.map(async (c: any) => {
        const nn = migrate(c.nameTextId);
        if (nn !== c.nameTextId) {
          return fetch(`/api/productCategories/${c.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...c, nameTextId: nn }),
          });
        }
      }));

      setIsMerging(false);
      mutateProducts();
      mutateCategories();
      mutateGalleryCats();
      toast({ title: "合并引用完成" });
    } catch (e) {
      setIsMerging(false);
      toast({ variant: "destructive", title: "合并失败" });
    }
  };

  const handleAutoCleanup = async () => {
    if (semanticDuplicates.size === 0) return;
    if (!confirm(`将安全移除业务库中的闲置冗余词条。`)) return;
    setIsCleaning(true);
    try {
      const deletePromises: Promise<any>[] = [];
      semanticDuplicates.forEach((ids) => {
        const referencedOnes = ids.filter(id => usedIds.has(id));
        const masterId = referencedOnes.length > 0 ? referencedOnes[0] : ids[0];
        ids.filter(id => id !== masterId && !usedIds.has(id)).forEach(id => { 
          deletePromises.push(fetch(`/api/localizedStrings/${id}`, { method: 'DELETE' }));
        });
      });
      await Promise.all(deletePromises);
      setIsCleaning(false);
      mutateTrans();
      toast({ title: "清理完成" });
    } catch (e) {
      setIsCleaning(false);
      toast({ variant: "destructive", title: "清理失败" });
    }
  };

  const handleAiTranslate = async (t: LocalizedString) => {
    if (!aiConfig?.isEnabled) { toast({ variant: "destructive", title: "AI 未启用" }); return; }
    const content = (t.content as any) || {};
    const st = content.en || t.en || content.zh || t.zh; 
    const sc = (content.en || t.en) ? 'en' : 'zh';
    if (!st) return;
    
    // 过滤出当前条目缺失的语种 (排除源语言，且识别空白或占位符)
    const ml = activeLanguages
      .filter(l => l.code !== sc)
      .filter(l => {
        const val = content[l.code] || (t as any)[l.code];
        return !val || val === t.id;
      }).map(l => l.code);
    if (ml.length === 0) {
      toast({ title: "无需翻译", description: "该条目已拥有所有激活语种的内容" });
      return;
    }
    
    setTranslatingId(t.id);
    try {
      console.log('--- AI Translation Debug ---');
      console.log('Source Text:', st);
      console.log('Source Lang:', sc);
      console.log('Target Langs:', ml);

      const res = await translateContent({ text: st, sourceLang: sc, targetLangs: ml, model: aiConfig.model, apiKey: aiConfig.apiKey });
      
      console.log('AI Response:', res);

      if (res) {
        const existingContent = (t.content as any) || {};
        const newContent = { ...existingContent, ...res };
        
        console.log('Merging Content...', newContent);

        const putRes = await fetch(`/api/localizedStrings/${encodeURIComponent(t.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: t.id, 
            content: newContent 
          }),
        });

        if (!putRes.ok) {
          const err = await putRes.json();
          console.error('Save failed:', err);
          throw new Error('Save to database failed');
        }

        mutateTrans();
        toast({ title: "AI 智译成功" });
      }
    } catch (e: any) { 
      console.error('AI Translation Full Error:', e);
      toast({ variant: "destructive", title: "AI 翻译失败", description: e.message }); 
    } finally { setTranslatingId(null); }
  };

  const handleSyncFromLocal = async () => {
    setIsSyncingLocal(true);
    setShowSyncConfirm(false);
    
    try {
      const flatten = (obj: any, prefix = '') => {
        let result: any = {};
        for (let key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(result, flatten(obj[key], `${prefix}${key}_`));
          } else {
            result[`${prefix}${key}`] = obj[key];
          }
        }
        return result;
      };

      const locales = Object.keys(localLibrary);
      const allKeys = new Set<string>();
      const flattenedByLocale: any = {};

      locales.forEach(l => {
        flattenedByLocale[l] = flatten((localLibrary as any)[l]);
        Object.keys(flattenedByLocale[l]).forEach(k => allKeys.add(k));
      });

      const keysArray = Array.from(allKeys);
      console.log(`Found ${keysArray.length} keys to sync.`);
      
      await Promise.all(keysArray.map(async key => {
        const payload: any = { id: key };
        locales.forEach(l => {
          if (flattenedByLocale[l][key]) payload[l] = flattenedByLocale[l][key];
        });

        const res = await fetch(`/api/localizedStrings/${encodeURIComponent(key)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error(`Failed to sync key ${key}:`, errData);
          throw new Error(`Failed to sync key ${key}: ${errData.error || 'Unknown error'}`);
        }
      }));

      toast({
        title: "同步成功",
        description: `已成功同步 ${keysArray.length} 条本地文案至数据库`,
        className: "bg-green-50 border-green-200 text-green-800 rounded-2xl"
      });
      mutateTrans();
    } catch (error: any) {
      console.error('Sync failed:', error);
      toast({
        title: "同步失败",
        description: error.message || "同步过程中发生未知错误",
        variant: "destructive",
        className: "rounded-2xl"
      });
    } finally {
      setIsSyncingLocal(false);
      setShowSyncConfirm(false);
    }
  };

  const filteredTranslations = useMemo(() => {
    const list = activeTab === 'business' ? categorizedTranslations.business : categorizedTranslations.system;
    
    // 1. 过滤
    const filtered = list.filter(t => {
      const search = searchQuery.toLowerCase();
      const contentValues = Object.values((t.content as any) || {});
      const ms = t.id.toLowerCase().includes(search) || 
                 Object.values(t).some(v => typeof v === 'string' && v.toLowerCase().includes(search)) ||
                 contentValues.some(v => typeof v === 'string' && v.toLowerCase().includes(search));
      if (showOnlyDuplicates && activeTab === 'business') {
        let hasM = false; semanticDuplicates.forEach(ids => { if (ids.includes(t.id)) hasM = true; });
        return ms && hasM;
      }
      return ms;
    });

    // 2. 排序
    return [...filtered].sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = (a as any)[key] || '';
      let valB: any = (b as any)[key] || '';

      if (key === 'updatedAt' || key === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [categorizedTranslations, searchQuery, showOnlyDuplicates, semanticDuplicates, activeTab, sortConfig]);

  const paginatedTranslations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTranslations.slice(start, start + itemsPerPage);
  }, [filteredTranslations, currentPage]);

  const totalPages = Math.ceil(filteredTranslations.length / itemsPerPage);

  const handleSave = async () => {
    const entryId = editingId || formData.id;
    if (!entryId) return;
    
    try {
      await fetch(`/api/localizedStrings/${encodeURIComponent(entryId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entryId, content: formData.translations }),
      });
      setIsAdding(false); 
      setEditingId(null); 
      setFormData({ id: '', translations: {} });
      mutateTrans();
      toast({ title: "词条已保存" });
    } catch (e) {
      toast({ variant: "destructive", title: "保存失败" });
    }
  };

  const handleDeleteEntry = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/localizedStrings/${encodeURIComponent(deletingId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('删除失败');
      mutateTrans();
      toast({ title: "词条资产已移除" });
      setDeletingId(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "操作失败", description: e.message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative">
      <AiGradientDef />
      
      {/* Background Aurora Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] bg-accent/10 blur-[100px] rounded-full -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Languages className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-headline font-bold text-slate-900">翻译资产管理</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-2xl pl-1">分域管理业务内容与系统文案。支持 AI 智能批量填充、引用冲突合并及全站一致性诊断。</p>
        </div>
        
        <div className="flex items-center gap-3">
          {activeTab === 'business' && duplicatableCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleAutoCleanup} 
              disabled={isCleaning || isMerging} 
              className="rounded-full h-12 px-6 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 gap-2 shadow-sm font-bold text-xs uppercase tracking-wider"
            >
              {isCleaning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              一键清理冗余 ({duplicatableCount})
            </Button>
          )}
          
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-full h-12 px-6 gap-2 text-xs font-bold uppercase tracking-wider border-slate-200 bg-white hover:bg-slate-50">
                <Settings2 className="h-4 w-4" /> 语种配置
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] max-w-sm p-8 border-none shadow-2xl bg-white/90 backdrop-blur-2xl">
               <DialogHeader>
                 <DialogTitle className="text-lg font-headline font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" /> 语种配置中心
                 </DialogTitle>
                 <DialogDescription className="text-slate-400 text-xs">定义全站支持的多语言维度。</DialogDescription>
               </DialogHeader>
               <div className="space-y-6 py-6">
                 <div className="space-y-3">
                   {activeLanguages.map(l => (
                     <div key={l.code} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-primary/20">
                       <div className="flex flex-col">
                         <span className="font-bold text-slate-900">{l.label}</span>
                         <span className="text-[10px] text-slate-400 font-mono uppercase">System Code: {l.code}</span>
                       </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 border-emerald-500/20 font-bold px-3 py-1 rounded-full text-[10px] tracking-widest shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] transition-all">
                            <span className="relative flex h-1.5 w-1.5 mr-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            ACTIVE
                          </Badge>
                          {l.code !== 'zh' && l.code !== 'en' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={async () => {
                                if (!confirm(`确定要移除 ${l.label} 吗？\n移除后全站将不再显示该语种，但已有的翻译数据会保留在数据库中。`)) return;
                                const updated = activeLanguages.filter(lang => lang.code !== l.code);
                                try {
                                  const res = await fetch('/api/settings/languages', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ supportedLanguages: updated }),
                                  });
                                  if (!res.ok) throw new Error();
                                  mutateLangs();
                                  toast({ title: "语种已移除" });
                                } catch (e) {
                                  toast({ variant: "destructive", title: "移除失败" });
                                }
                              }}
                              className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                     </div>
                   ))}
                 </div>
                 <div className="pt-6 border-t border-dashed space-y-4">
                   <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">新增目标语种</Label>
                   <div className="grid grid-cols-2 gap-3">
                     <Input placeholder="代码 (如: jp)" value={newLang.code} onChange={e => setNewLang({...newLang, code: e.target.value.toLowerCase()})} className="h-12 rounded-xl text-xs bg-slate-50 border-none" />
                     <Input placeholder="名称 (如: 日语)" value={newLang.label} onChange={e => setNewLang({...newLang, label: e.target.value})} className="h-12 rounded-xl text-xs bg-slate-50 border-none" />
                   </div>
                    <Button onClick={async () => { 
                      if(!newLang.code || !newLang.label) {
                        toast({ variant: "destructive", title: "请填写完整信息" });
                        return;
                      }
                      
                      if (activeLanguages.some(l => l.code === newLang.code)) {
                        toast({ variant: "destructive", title: "该语种已存在" });
                        return;
                      }

                      const updated = [...activeLanguages, newLang]; 
                      try {
                        const res = await fetch('/api/settings/languages', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ supportedLanguages: updated }),
                        });
                        
                        if (!res.ok) throw new Error('API request failed');
                        
                        mutateLangs();
                        setNewLang({ code: '', label: '' });
                        toast({ 
                          title: "语种已激活", 
                          description: `成功添加 ${newLang.label}，请刷新页面以确保全站同步。`,
                        });
                      } catch (e) {
                        console.error('Add Language Error:', e);
                        toast({ variant: "destructive", title: "添加失败", description: "无法连接到设置服务器" });
                      }
                    }} className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg">确认添加新语种</Button>
                 </div>
               </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSyncConfirm} onOpenChange={setShowSyncConfirm}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                disabled={isSyncingLocal}
                className="rounded-full h-12 px-6 gap-2 text-xs font-bold uppercase tracking-wider border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
              >
                {isSyncingLocal ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitMerge className="h-4 w-4" />}
                本地库签署并同步
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] max-w-md p-0 overflow-hidden shadow-2xl border-none bg-white">
              <div className="bg-orange-500 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-16 -translate-y-16" />
                <DialogHeader className="relative z-10">
                  <DialogTitle className="text-xl font-headline font-bold uppercase tracking-wider flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6" /> 关键同步确认
                  </DialogTitle>
                  <DialogDescription className="text-orange-100 text-xs font-medium uppercase tracking-widest mt-2">
                    System Asset Synchronization Notice
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-sm text-slate-600 leading-relaxed">
                  您即将启动从 <span className="font-bold text-slate-900">本地硬编码库 (lib/translations.ts)</span> 同步内容至 <span className="font-bold text-primary">云端资产库 (PostgreSQL)</span> 的操作。
                </p>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-4">
                  <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-orange-800 uppercase">重要提示</p>
                    <p className="text-[10px] text-orange-700/70 leading-relaxed">此操作将覆盖数据库中已存在的同名系统词条（如导航栏、页脚等）。建议在同步前确保本地库代码已包含最新修订。</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-slate-50 p-6 border-t border-slate-100 gap-3">
                <Button variant="ghost" onClick={() => setShowSyncConfirm(false)} className="h-12 rounded-xl flex-1 font-bold uppercase tracking-widest text-[10px] text-slate-400">取消</Button>
                <Button onClick={handleSyncFromLocal} disabled={isSyncingLocal} className="h-12 rounded-xl flex-1 font-bold uppercase tracking-widest text-[10px] bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-100">
                  {isSyncingLocal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  确认签署并同步
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={() => { setIsAdding(true); setFormData({ id: '', translations: {} }); }} className="rounded-full h-12 px-8 font-bold uppercase tracking-widest text-xs gap-2 shadow-xl shadow-primary/20">
            <Plus className="h-5 w-5" /> 新增词条
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-slate-100/50 p-1.5 rounded-2xl h-14 w-fit border border-slate-200/50 backdrop-blur-sm">
            <TabsList className="bg-transparent border-none p-0 gap-1">
              <TabsTrigger value="business" className="rounded-xl h-11 px-8 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">
                <LayoutGrid className="h-4 w-4 mr-2" /> 业务库 
                <span className="ml-2 py-0.5 px-2 bg-slate-200 rounded-full text-[10px]">{categorizedTranslations.business.length}</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="rounded-xl h-11 px-8 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">
                <FileText className="h-4 w-4 mr-2" /> 系统库 
                <span className="ml-2 py-0.5 px-2 bg-slate-200 rounded-full text-[10px]">{categorizedTranslations.system.length}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-2 rounded-2xl border border-white/40 shadow-xl flex-1 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="键入 ID、中文或英文关键词实时检索..." 
                className="pl-12 border-none bg-slate-50/50 rounded-xl h-12 text-sm focus-visible:ring-0 placeholder:text-slate-400 placeholder:font-medium" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
            {activeTab === 'business' && (
              <Button 
                variant={showOnlyDuplicates ? "default" : "ghost"} 
                onClick={() => setShowOnlyDuplicates(!showOnlyDuplicates)} 
                className={cn(
                  "h-12 rounded-xl px-5 text-xs uppercase font-bold gap-2 transition-all", 
                  showOnlyDuplicates ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <AlertTriangle className={cn("h-4 w-4", showOnlyDuplicates ? "text-white" : "text-orange-500")} /> 
                冲突查重
              </Button>
            )}
          </div>
        </div>

        <GlassCard className="p-0 overflow-hidden border-none shadow-2xl">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <Table className="min-w-[1200px] border-collapse">
              <TableHeader className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead 
                    className="pl-6 py-4 font-bold uppercase text-[9px] tracking-[0.2em] text-slate-400 w-80 cursor-pointer hover:text-primary transition-colors select-none sticky left-0 z-50 bg-slate-50/95 backdrop-blur-sm border-r border-slate-100/50 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]"
                    onClick={() => setSortConfig({
                      key: 'id',
                      direction: sortConfig.key === 'id' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                    })}
                  >
                    Resource Identifier {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  {activeLanguages.map(lang => (
                    <TableHead key={lang.code} className="font-bold uppercase text-[9px] tracking-[0.2em] text-slate-400 px-6 min-w-[300px]">{lang.label}</TableHead>
                  ))}
                  <TableHead 
                    className="text-right pr-6 font-bold uppercase text-[9px] tracking-[0.2em] text-slate-400 w-48 cursor-pointer hover:text-primary transition-colors select-none sticky right-0 z-50 bg-slate-50/95 backdrop-blur-sm border-l border-slate-100/50 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)]"
                    onClick={() => setSortConfig({
                      key: 'updatedAt',
                      direction: sortConfig.key === 'updatedAt' && sortConfig.direction === 'desc' ? 'asc' : 'desc'
                    })}
                  >
                    Actions / Updated {sortConfig.key === 'updatedAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="h-40 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : paginatedTranslations.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="h-40 text-center text-[10px] text-muted-foreground italic uppercase">暂无数据</TableCell></TableRow>
              ) : paginatedTranslations.map((t) => {
                const refs = referenceMap.get(t.id) || [];
                let semanticIds: string[] = [];
                if (activeTab === 'business') { semanticDuplicates.forEach((ids) => { if (ids.includes(t.id)) semanticIds = ids; }); }
                const isDuplicate = semanticIds.length > 1;

                return (
                  <TableRow key={t.id} className={cn("group transition-all duration-300 border-slate-100", isDuplicate ? "bg-orange-50/40" : "hover:bg-slate-50/80")}>
                    <TableCell className="pl-6 py-3 sticky left-0 z-30 bg-white group-hover:bg-slate-50 transition-colors border-r border-slate-100/50 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                      {refs.length > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-primary shadow-[2px_0_10px_rgba(37,99,235,0.2)]" />
                      )}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-[11px] font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg uppercase tracking-tight shadow-sm shrink-0">{t.id}</code>
                          <Badge variant="outline" className={cn("text-[8px] h-5 px-2 font-bold uppercase border-transparent whitespace-nowrap shrink-0", getResourceCategory(t.id).color)}>
                            {getResourceCategory(t.id).label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          {refs.length > 0 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2 text-primary cursor-help group/ref transition-opacity">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight border-b border-primary/20 group-hover/ref:border-primary">生效中 ({refs.length} 处应用)</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="p-4 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border-primary/10">
                                  <div className="space-y-4 text-xs">
                                    <p className="font-bold uppercase text-primary border-b border-slate-100 pb-2 flex items-center gap-2">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> 数据链路引用轨迹
                                    </p>
                                    <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2">
                                      {refs.map((ref: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between gap-6 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                          <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">{ref.type}</span>
                                            <span className="font-bold text-slate-700">{ref.name}</span>
                                          </div>
                                          {ref.linkable && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => window.open(`/admin/products/editor?id=${ref.id}`, '_blank')}>
                                              <ExternalLink className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-300">
                              <X className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-tight">未检测到外部引用</span>
                            </div>
                          )}

                          {isDuplicate && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-[8px] bg-orange-100 text-orange-700 border-orange-200 h-5 px-2 cursor-help font-bold uppercase shrink-0">语义冲突</Badge>
                                </TooltipTrigger>
                                <TooltipContent className="p-4 rounded-2xl max-w-xs bg-white/95 backdrop-blur-xl border-orange-200 shadow-2xl">
                                  <div className="space-y-4 text-xs">
                                    <p className="font-bold uppercase text-orange-700 border-b border-orange-100 pb-2 flex items-center gap-2">
                                      <AlertTriangle className="h-3.5 w-3.5" /> 内容重复诊断
                                    </p>
                                    <div className="space-y-1.5">
                                      {semanticIds.map(sid => (
                                        <div key={sid} className={cn("font-mono p-2 rounded-xl text-[10px] transition-all", sid === t.id ? "bg-primary text-white font-bold shadow-md" : "bg-slate-50 text-slate-400")}>
                                          {sid}
                                        </div>
                                      ))}
                                    </div>
                                    <Button disabled={isMerging} className="w-full h-10 rounded-xl text-[10px] font-bold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200" onClick={() => handleMergeReferences(t.id, semanticIds.filter(id => id !== t.id))}>
                                      {isMerging ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitMerge className="h-4 w-4 mr-2" />}
                                      一键合并引用至主锚点
                                    </Button>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {activeLanguages.map(lang => (
                      <TableCell key={lang.code} className="py-3">
                        {editingId === t.id ? (
                          <Textarea 
                            value={formData.translations?.[lang.code] || ''} 
                            onChange={e => setFormData({
                              ...formData, 
                              translations: { ...formData.translations, [lang.code]: e.target.value }
                            })} 
                            className="min-h-[40px] text-xs rounded-lg bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 py-2" 
                          />
                        ) : (
                          <span className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">
                            {((t.content as any)?.[lang.code] || (['zh', 'en', 'idn', 'vi'].includes(lang.code) ? (t as any)[lang.code] : null)) || <span className="opacity-20 italic">Empty Payload</span>}
                          </span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="pr-6 text-right py-3 sticky right-0 z-30 bg-white group-hover:bg-slate-50 transition-colors border-l border-slate-100/50 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                       {editingId === t.id ? (
                         <div className="flex justify-end gap-2">
                           <Button onClick={handleSave} className="h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100">
                             <Check className="h-4 w-4" />
                           </Button>
                           <Button variant="outline" onClick={() => setEditingId(null)} className="h-10 px-4 rounded-xl border-slate-200">
                             <X className="h-4 w-4" />
                           </Button>
                         </div>
                       ) : (
                         <div className="flex justify-end items-center gap-1">
                           {aiConfig?.isEnabled && (
                             <ShinyButton 
                              onClick={() => handleAiTranslate(t)} 
                              disabled={translatingId === t.id}
                              className="w-10 h-10 !p-0 flex items-center justify-center shadow-xl shadow-primary/10"
                              shape="rounded"
                             >
                               {translatingId === t.id ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Sparkles className="h-4 w-4 text-white" />}
                             </ShinyButton>
                           )}
                           <Button variant="ghost" size="icon" onClick={() => { 
                              const initialTranslations: any = {};
                              activeLanguages.forEach(l => {
                                initialTranslations[l.code] = (t.content as any)?.[l.code] || (["zh", "en", "idn", "vi"].includes(l.code) ? (t as any)[l.code] : "");
                              });
                              setFormData({
                                id: t.id,
                                translations: initialTranslations
                              });
                             setEditingId(t.id); 
                           }} className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/5 hover:text-primary">
                             <Edit2 className="h-4 w-4" />
                           </Button>
                           {refs.length === 0 && (
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/5" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingId(t.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
      </GlassCard>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTranslations.length)} of {filteredTranslations.length} entries
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                disabled={currentPage === 1}
                className="rounded-xl h-10 px-4 font-bold text-[10px] uppercase tracking-widest border-slate-200"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-xl font-bold text-[10px] border-slate-200",
                        currentPage === pageNum ? "shadow-lg shadow-primary/20" : ""
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                disabled={currentPage === totalPages}
                className="rounded-xl h-10 px-4 font-bold text-[10px] uppercase tracking-widest border-slate-200"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* 翻译资产维护指南 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-sm group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-2">词条归属划分</h4>
            <ul className="space-y-2 text-[10px] text-slate-500 leading-relaxed font-medium">
              <li>• <span className="text-slate-900">业务库</span>：包含产品详情、规格、核心优势等动态内容。</li>
              <li>• <span className="text-slate-900">系统库</span>：包含导航、按钮、类目名称、站点基础设施。</li>
            </ul>
          </div>

          <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-sm group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-2">内容录入规范</h4>
            <ul className="space-y-2 text-[10px] text-slate-500 leading-relaxed font-medium">
              <li>• <span className="text-slate-900">HTML 支持</span>：支持基础标签（如 b, i, table），AI 会自动保留。</li>
              <li>• <span className="text-slate-900">占位符</span>：请勿修改 %s 或 {} 等动态占位符，以免程序报错。</li>
            </ul>
          </div>

          <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-sm group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            <div className="h-12 w-12 rounded-2xl bg-blue-100/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-2">词条状态说明</h4>
            <ul className="space-y-2 text-[10px] text-slate-500 leading-relaxed font-medium">
              <li>• <span className="text-slate-900">ACTIVE</span>：语种已在前端激活，内容会实时同步至全站。</li>
              <li>• <span className="text-slate-900">EMPTY</span>：内容为空或等于 ID，AI 智译会自动扫描填充。</li>
            </ul>
          </div>

          <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-sm group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
            <div className="h-12 w-12 rounded-2xl bg-purple-100/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Info className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-purple-600 mb-2">命名空间前缀</h4>
            <ul className="space-y-2 text-[10px] text-slate-500 leading-relaxed font-medium">
              <li>• <span className="text-slate-900">prod_</span>：产品；<span className="text-slate-900">spec_</span>：规格参数。</li>
              <li>• <span className="text-slate-900">ui_</span>：界面；<span className="text-slate-900">nav_</span>：导航；<span className="text-slate-900">cat_</span>：类目。</li>
            </ul>
          </div>
        </div>
      </div>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="rounded-[var(--radius-brand)] max-w-xl p-0 overflow-hidden shadow-2xl border border-white/20 glass-deep">
          <div className="bg-primary/95 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-20 -translate-y-20 animate-pulse" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-wider">创建词条资产</DialogTitle>
              <DialogDescription className="text-white/60 text-xs font-medium uppercase tracking-[0.1em] mt-1">Definition of a new localized data point.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-10 space-y-8 bg-transparent">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 pl-1">Unique Resource ID</Label>
              <Input 
                placeholder="建议前缀: ui_ (界面), prod_ (产品), spec_ (规格)" 
                value={formData.id} 
                onChange={e => setFormData({...formData, id: e.target.value})} 
                disabled={!!editingId}
                className={cn(
                  "h-12 rounded-lg bg-slate-200/20 border-slate-200/30 font-mono text-xs focus-visible:ring-4 focus-visible:ring-primary/5 shadow-sm transition-all",
                  !!editingId && "opacity-50 cursor-not-allowed"
                )} 
              />
              <p className="text-[10px] text-slate-400 italic font-medium">ID 必须全局唯一。保存后不可更改。</p>
            </div>
            
            <div className="space-y-6">
              {activeLanguages.map(lang => (
                <div key={lang.code} className="space-y-3">
                  <div className="flex items-center justify-between pl-1">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{lang.label} 内容</Label>
                    {(lang.code !== 'zh' && lang.code !== 'en') && (
                      <ShinyButton 
                        disabled={translatingId === `new-${lang.code}`}
                        onClick={async () => {
                          const sourceText = formData.translations['en'] || formData.translations['zh'];
                          if (!sourceText) {
                            toast({ variant: "destructive", title: "缺少源语言", description: "请先输入中文或英文内容" });
                            return;
                          }
                          setTranslatingId(`new-${lang.code}`);
                          try {
                            const res = await translateContent({ 
                              text: sourceText, 
                              sourceLang: formData.translations['en'] ? 'en' : 'zh', 
                              targetLangs: [lang.code],
                              model: aiConfig?.model || 'gemini-2.0-flash-exp',
                              apiKey: aiConfig?.apiKey || ''
                            });
                            if (res && res[lang.code]) {
                              setFormData({
                                ...formData,
                                translations: { ...formData.translations, [lang.code]: res[lang.code] }
                              });
                              toast({ title: "AI 智译成功" });
                            }
                          } catch (e) {
                            toast({ variant: "destructive", title: "AI 翻译失败" });
                          } finally {
                            setTranslatingId(null);
                          }
                        }}
                        className="h-7"
                      >
                        <Sparkles />
                        智译
                      </ShinyButton>
                    )}
                  </div>
                  <Textarea 
                    value={formData.translations[lang.code] || ''} 
                    onChange={e => setFormData({
                      ...formData, 
                      translations: { ...formData.translations, [lang.code]: e.target.value }
                    })} 
                    className={cn(
                      "rounded-lg min-h-[100px] text-xs bg-slate-200/20 border-slate-200/30 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all py-3 shadow-sm",
                      translatingId === `new-${lang.code}` && "animate-pulse border-primary/30 ring-2 ring-primary/10"
                    )} 
                    readOnly={translatingId === `new-${lang.code}`}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="bg-slate-50/80 p-8 border-t border-slate-100/50 gap-4">
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="h-12 rounded-xl flex-1 font-bold uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-100 transition-colors">取消操作</Button>
            <Button onClick={handleSave} className="h-12 rounded-xl flex-1 font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all">签署并同步</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] overflow-hidden border-none shadow-2xl p-0 bg-white">
          <div className="bg-red-500 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-16 -translate-y-16" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-xl font-headline font-bold uppercase tracking-wider flex items-center gap-3">
                <AlertTriangle className="h-6 w-6" /> 确认永久删除
              </DialogTitle>
              <DialogDescription className="text-red-100 text-xs font-medium uppercase tracking-widest mt-2">
                Permanent Asset Deletion
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              您确定要删除词条 <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{deletingId}</span> 吗？
            </p>
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-4">
              <Info className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-red-800 uppercase">风险提示</p>
                <p className="text-[10px] text-red-700/70 leading-relaxed">此操作无法撤销。虽然系统已确认该词条目前未被任何产品或分类引用，但手动硬编码的引用可能会失效。</p>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-slate-50 p-6 border-t border-slate-100 gap-3">
            <Button variant="ghost" onClick={() => setDeletingId(null)} className="h-12 rounded-xl flex-1 font-bold uppercase tracking-widest text-[10px] text-slate-400">取消</Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteEntry} 
              disabled={isDeleting} 
              className="h-12 rounded-xl flex-1 font-bold uppercase tracking-widest text-[10px] bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              确认彻底删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}