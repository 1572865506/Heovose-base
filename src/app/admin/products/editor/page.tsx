"use client";

import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { Loader2, TableProperties, Settings, ImageIcon, Library } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { smartTranslate } from '@/lib/translate-client';
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';

// 导入拆分后的子组件
import EditorHeader from './components/EditorHeader';
import BasicInfoSection from './components/BasicInfoSection';
import MediaSection from './components/MediaSection';
import SpecMatrixSection from './components/SpecMatrixSection';
import StorySection from './components/StorySection';

// 类型定义
interface ProductSpecEntry {
  uid: string;
  labelZh: string;
  labelEn: string;
  valueZh: string;
  valueEn: string;
  valueId?: string;
}

interface ProductSpecGroup {
  uid: string;
  titleZh: string;
  titleEn: string;
  items: ProductSpecEntry[];
}

interface ProductFormData {
  id: string;
  categoryId: string;
  status: 'published' | 'draft';
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  mainImageUrl: string;
  galleryUrls: string[];
  specGroups: ProductSpecGroup[];
  localizedDetails: Record<string, string>;
}

// 辅助组件：AI 极光渐变
const AiGradientDef = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="ai-aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stopColor="#06B6D4" offset="0%"><animate attributeName="stop-color" values="#06B6D4;#4F46E5;#06B6D4" dur="4s" repeatCount="indefinite" /></stop>
        <stop stopColor="#4F46E5" offset="33%"><animate attributeName="stop-color" values="#4F46E5;#D946EF;#4F46E5" dur="4s" repeatCount="indefinite" /></stop>
        <stop stopColor="#D946EF" offset="66%"><animate attributeName="stop-color" values="#D946EF;#F43F5E;#D946EF" dur="4s" repeatCount="indefinite" /></stop>
        <stop stopColor="#F43F5E" offset="100%"><animate attributeName="stop-color" values="#F43F5E;#06B6D4;#F43F5E" dur="4s" repeatCount="indefinite" /></stop>
      </linearGradient>
    </defs>
  </svg>
);

function robustJsonParse(rawStr: string) {
  let jsonStr = (String(rawStr) || '').trim();
  if (jsonStr.includes('```')) jsonStr = jsonStr.replace(/```json\n?|```/g, '').trim();
  
  // 1. 常规清洗与解析
  const clean = (s: string) => s.replace(/"\s*[：:]\s*"/g, '": "').replace(/([glv]_\d+_?\d*)\s*[：:]\s*/gi, '"$1": ');
  try {
    return JSON.parse(clean(jsonStr));
  } catch (e) {
    try {
      // 2. 处理转义字符
      const sanitized = jsonStr.replace(/[\u0000-\u001F]+/g, m => m === '\n' ? '\\n' : m === '\r' ? '\\r' : m === '\t' ? '\\t' : '');
      return JSON.parse(clean(sanitized));
    } catch (i) {
      // 3. 终极救命稻草：正则特征抠取
      console.log('⚠️ [SmartTranslate] 标准解析失败，启动正则特征抠取...');
      const pairs: Record<string, string> = {};
      // 匹配 "l_0_0": "value" 或 l_0_0: "value" 等各种变形
      const regex = /["']?([glv]_\d+_?\d*)["']?\s*[：:]\s*["']([^"']*)["']/gi;
      let match;
      while ((match = regex.exec(jsonStr)) !== null) {
        pairs[match[1]] = match[2];
      }
      
      if (Object.keys(pairs).length > 0) {
        console.log(`✅ [SmartTranslate] 正则抠取成功，抓取到 ${Object.keys(pairs).length} 个字段`);
        return pairs;
      }
      
      if (!jsonStr.startsWith('{') && !jsonStr.startsWith('[')) return jsonStr;
      return null;
    }
  }
}

function ProductEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const productId = searchParams.get('id');
  const isEditing = !!productId;

  const zhEditorRef = useRef<any>(null);
  const targetEditorRef = useRef<any>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    id: '', categoryId: '', mainImageUrl: '', galleryUrls: [],
    nameEn: '', nameZh: '', descEn: '', descZh: '',
    localizedDetails: { zh: '', en: '' },
    specGroups: [], status: 'published'
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [targetDetailsLang, setTargetDetailsLang] = useState('en');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  const [idConflict, setIdConflict] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'main' | 'gallery' | 'richtext-zh' | 'richtext-target'>('main');

  const { data: product, isLoading: isProdLoading } = useLocalDoc<any>('products', productId || 'new');
  const { data: categories } = useLocalCollection<any>('productCategories');
  const { data: translations } = useLocalCollection<any>('localizedStrings?full=true');
  const { data: allProducts } = useLocalCollection<any>('products');
  const { data: aiConfig } = useLocalDoc<any>('settings', 'ai');
  const { data: langConfig } = useLocalDoc<any>('settings', 'languages');
  const { data: specTemplates, mutate: mutateTemplates } = useLocalCollection<any>('specTemplates');

  const supportedLangs = useMemo(() => langConfig?.supportedLanguages || [{ code: 'zh', label: '中文' }, { code: 'en', label: 'English' }], [langConfig]);

  const translationCoverage = useMemo(() => {
    let tBasic = 0, dBasic = 0;
    if (formData.nameZh) { tBasic++; if (formData.nameEn) dBasic++; }
    if (formData.descZh) { tBasic++; if (formData.descEn) dBasic++; }
    let tSpec = 0, dSpec = 0;
    formData.specGroups.forEach(g => {
      if (g.titleZh) { tSpec++; if (g.titleEn) dSpec++; }
      g.items.forEach(i => {
        if (i.labelZh) { tSpec++; if (i.labelEn) dSpec++; }
        if (i.valueZh) { tSpec++; if (i.valueEn) dSpec++; }
      });
    });
    const zhClean = String(formData.localizedDetails.zh || '').replace(/<[^>]*>/g, '').trim();
    let tDet = 0, dDet = 0;
    if (zhClean) { tDet++; if (String(formData.localizedDetails.en || '').replace(/<[^>]*>/g, '').trim()) dDet++; }
    const total = tBasic + tSpec + tDet;
    const done = dBasic + dSpec + dDet;
    return {
      global: total > 0 ? Math.round((done / total) * 100) : 100,
      basic: tBasic > 0 ? Math.round((dBasic / tBasic) * 100) : 100,
      specs: tSpec > 0 ? Math.round((dSpec / tSpec) * 100) : 100,
      details: tDet > 0 ? Math.round((dDet / tDet) * 100) : 100,
    };
  }, [formData]);

  useEffect(() => {
    if (isEditing && product && translations) {
      const getT = (id?: string) => {
        if (!id) return { zh: '', en: '' };
        const t = translations?.find((tr: any) => tr.id === id);
        const content = (t?.content as any) || {};
        return { 
          zh: content.zh || (t as any)?.zh || '', 
          en: content.en || (t as any)?.en || '' 
        };
      };
      const sGroups = (product.specGroups || []).map((g: any, gIdx: number) => ({
        uid: `sg_${gIdx}_${Date.now()}`,
        titleEn: getT(g.titleId).en, titleZh: getT(g.titleId).zh,
        items: g.items.map((i: any, iIdx: number) => ({
          uid: `si_${gIdx}_${iIdx}_${Date.now()}`,
          labelEn: getT(i.labelId).en, labelZh: getT(i.labelId).zh,
          valueEn: getT(i.valueId).en, valueZh: getT(i.valueId).zh
        }))
      }));
      setFormData({
        id: product.id, categoryId: product.categoryId, mainImageUrl: product.mainImageUrl,
        galleryUrls: product.galleryImageUrls || [],
        nameEn: getT(product.nameTextId).en, nameZh: getT(product.nameTextId).zh,
        descEn: getT(product.descriptionTextId).en, descZh: getT(product.descriptionTextId).zh,
        localizedDetails: product.localizedDetails || { zh: '', en: '' },
        specGroups: sGroups, status: product.status || 'published'
      });
    }
  }, [isEditing, product, translations]);

  useEffect(() => {
    if (!isEditing && formData.id && allProducts) {
      setIdConflict(allProducts.some((p: any) => p.id === formData.id));
    }
  }, [formData.id, allProducts, isEditing]);

  const handleUpdateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const generateProductId = (catId: string) => {
    const monthDay = new Date().toISOString().slice(5, 10).replace('-', '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PROD_${catId}_${monthDay}_${random}`;
  };

  const handleCategoryChange = (catId: string) => {
    handleUpdateField('categoryId', catId);
    // 只要 ID 框不是禁止编辑状态（即非修改模式），就根据分类重新生成 ID
    if (!isEditing) {
      handleUpdateField('id', generateProductId(catId));
    }
  };

  const handleSave = async () => {
    if (!formData.id || !formData.categoryId || idConflict) {
      toast({ variant: "destructive", title: "无法保存", description: "请检查 ID 或分类是否完整" });
      return;
    }
    
    setIsAiProcessing(true); // Re-use processing state for saving feedback
    try {
      const saveL = async (en: any, zh: any, id: string) => {
        const res = await fetch(`/api/localizedStrings/${encodeURIComponent(id)}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, content: { en: String(en || '').trim(), zh: String(zh || '').trim() } })
        });
        if (!res.ok) throw new Error(`翻译数据同步失败 (${id})`);
        return id;
      };

      const nId = await saveL(formData.nameEn, formData.nameZh, `prod_name_${formData.id}`);
      const dId = await saveL(formData.descEn, formData.descZh, `prod_desc_${formData.id}`);
      
      const sGroups = await Promise.all(formData.specGroups.map(async (g, gIdx) => ({
        titleId: await saveL(g.titleEn, g.titleZh, `psg_${formData.id}_${gIdx}`),
        items: await Promise.all(g.items.map(async (i, iIdx) => ({
          labelId: await saveL(i.labelEn, i.labelZh, `psl_${formData.id}_${gIdx}_${iIdx}`),
          valueId: await saveL(i.valueEn, i.valueZh, `psv_${formData.id}_${gIdx}_${iIdx}`)
        })))
      })));

      const res = await fetch(`/api/products/${formData.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData, 
          nameTextId: nId, 
          descriptionTextId: dId, 
          specGroups: sGroups,
          categoryId: formData.categoryId, 
          galleryImageUrls: formData.galleryUrls
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "产品主数据同步失败");
      }

      toast({ title: "同步成功", description: "产品数据已持久化至云端" });
      router.push('/admin/products');
    } catch (e: any) { 
      console.error("Save Error:", e);
      toast({ variant: "destructive", title: "保存失败", description: e.message }); 
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAiTranslateBasic = async () => {
    if (!aiConfig?.isEnabled) return;
    setIsAiProcessing(true);
    try {
      const tasks = [];
      const nameNeedsTranslate = formData.nameZh && !formData.nameEn;
      const descNeedsTranslate = formData.descZh && !formData.descEn;

      const [nameRes, descRes] = await Promise.all([
        nameNeedsTranslate ? smartTranslate({ text: formData.nameZh, targetLangs: ['en'], taskType: 'text' }) : null,
        descNeedsTranslate ? smartTranslate({ text: formData.descZh, targetLangs: ['en'], taskType: 'text' }) : null
      ]);
      
      setFormData(prev => ({ 
        ...prev, 
        nameEn: nameRes?.en || prev.nameEn, 
        descEn: descRes?.en || prev.descEn 
      }));
      
      if (!nameNeedsTranslate && !descNeedsTranslate) {
        toast({ title: "无需翻译", description: "名称和描述的英文内容已存在" });
      }
    } catch (e: any) {
      console.error("Translate Error:", e);
      toast({ 
        variant: "destructive", 
        title: "智译失败", 
        description: e.message || "请求 AI 翻译时发生未知错误" 
      });
    } finally { setIsAiProcessing(false); }
  };

  const handleAiTranslateDetails = async () => {
    if (!aiConfig?.isEnabled || !formData.localizedDetails.zh) return;
    
    // 如果目标语言已有内容，则跳过
    const existing = String(formData.localizedDetails[targetDetailsLang] || '').replace(/<[^>]*>/g, '').trim();
    if (existing) {
      toast({ title: "无需翻译", description: "详情介绍已有翻译内容" });
      return;
    }

    setIsAiProcessing(true);
    try {
      const res = await smartTranslate({
        text: formData.localizedDetails.zh, sourceLang: 'zh', targetLangs: [targetDetailsLang], taskType: 'rich-text'
      });
      if (res && res[targetDetailsLang]) {
        handleUpdateField('localizedDetails', { 
          ...formData.localizedDetails, 
          [targetDetailsLang]: res[targetDetailsLang] 
        });
      }
    } catch (e: any) {
      console.error("Translate Details Error:", e);
      toast({ 
        variant: "destructive", 
        title: "详情智译失败", 
        description: e.message 
      });
    } finally { setIsAiProcessing(false); }
  };

  const handleAiTranslateSpecItem = async (gIdx: number, iIdx: number) => {
    if (!aiConfig?.isEnabled) return;
    const item = formData.specGroups[gIdx].items[iIdx];
    const key = `i_${gIdx}_${iIdx}_label`;

    const needsLabel = !item.labelEn;
    const needsValue = !item.valueEn;

    if (!needsLabel && !needsValue) {
      toast({ title: "无需翻译", description: "该项已有翻译内容" });
      return;
    }

    setProcessingItems(prev => new Set(prev).add(key));
    try {
      const res = await smartTranslate({ 
        text: JSON.stringify({ label: item.labelZh, value: item.valueZh }), 
        targetLangs: ['en'],
        taskType: 'spec'
      });
      
      if (res?.en) {
        const result = robustJsonParse(res.en);
        
        let labelEn = '';
        let valueEn = '';

        if (typeof result === 'object' && result !== null) {
          if (Array.isArray(result)) {
            // 策略 A: 数组索引提取
            labelEn = result[0] || '';
            valueEn = result[1] || '';
          } else {
            // 策略 B: 超级模糊 Key 匹配
            const keys = Object.keys(result);
            const findKey = (terms: string[]) => 
              keys.find(k => terms.some(t => k.toLowerCase().includes(t.toLowerCase())));
            
            const lKey = findKey(['label', 'lbl', 'name', 'key', 'l']);
            const vKey = findKey(['value', 'val', 'content', 'text', 'v', 'res']);
            
            labelEn = lKey ? result[lKey] : '';
            valueEn = vKey ? result[vKey] : '';

            // 策略 C: 兜底逻辑 - 如果没匹配到，按属性顺序取 (第一个是 label, 第二个是 value)
            if (!labelEn && keys[0]) labelEn = result[keys[0]];
            if (!valueEn && keys[1]) valueEn = result[keys[1]];
          }
        } else if (typeof result === 'string') {
          // 策略 D: 纯字符串拆分 (处理 AI 没给 JSON 的情况)
          const parts = result.split(/[\n\r:：]+/).filter(p => p.trim());
          if (parts.length >= 2) {
            labelEn = parts[0].trim();
            valueEn = parts[1].trim();
          } else {
            labelEn = result;
          }
        }

        setFormData(prev => {
          const nextGroups = [...prev.specGroups];
          nextGroups[gIdx] = {
            ...nextGroups[gIdx],
            items: [...nextGroups[gIdx].items]
          };
          nextGroups[gIdx].items[iIdx] = { 
            ...nextGroups[gIdx].items[iIdx], 
            labelEn: needsLabel ? (labelEn || item.labelEn) : item.labelEn, 
            valueEn: needsValue ? (valueEn || item.valueEn) : item.valueEn 
          };
          return { ...prev, specGroups: nextGroups };
        });
      }
    } catch (e: any) {
      console.error("Translate Spec Item Error:", e);
      toast({ 
        variant: "destructive", 
        title: "规格项翻译失败", 
        description: e.message 
      });
    } finally { setProcessingItems(prev => { const n = new Set(prev); n.delete(key); return n; }); }
  };

  const [renderKey, setRenderKey] = useState(0);

  const handleAiTranslateAllSpecs = async () => {
    if (!aiConfig?.isEnabled || formData.specGroups.length === 0) return;
    setIsAiProcessing(true);
    
    let matchCount = 0;
    try {
      const taskMap: Record<string, string> = {};
      formData.specGroups.forEach((g, gIdx) => {
        if (g.titleZh && !g.titleEn) taskMap[`g_${gIdx}`] = g.titleZh;
        g.items.forEach((i, iIdx) => {
          if (i.labelZh && !i.labelEn) taskMap[`l_${gIdx}_${iIdx}`] = i.labelZh;
          if (i.valueZh && !i.valueEn) taskMap[`v_${gIdx}_${iIdx}`] = i.valueZh;
        });
      });
      
      const totalTasks = Object.keys(taskMap).length;
      if (totalTasks === 0) {
        alert('没有需要翻译的空字段');
        return;
      }
      
      const res = await smartTranslate({ 
        text: JSON.stringify(taskMap), 
        targetLangs: ['en'],
        taskType: 'spec'
      });
      
      if (res?.en) {
        const results = robustJsonParse(res.en);

        if (typeof results !== 'object' || results === null) {
          throw new Error('AI 返回的数据格式无法解析为对象');
        }

        setFormData(prev => {
          const next = [...prev.specGroups];
          Object.keys(results).forEach(rawKey => {
            const val = results[rawKey];
            if (!val) return;

            const cleanVal = String(val).replace(/\\n/g, '\n');
            const key = rawKey.trim().replace(/[：:]/g, '');
            const parts = key.split('_');
            const type = parts[0].toLowerCase();
            
            let gIdx = -1;
            let iIdx = -1;

            if (type === 'g') {
              gIdx = parseInt(parts[1]);
            } else if (parts.length === 3) {
              gIdx = parseInt(parts[1]);
              iIdx = parseInt(parts[2]);
            } else if (parts.length === 2) {
              gIdx = 0; 
              iIdx = parseInt(parts[1]);
            }

            if (isNaN(gIdx) || gIdx < 0 || gIdx >= next.length) return;

            if (type === 'g') { 
              next[gIdx] = { ...next[gIdx], titleEn: cleanVal }; 
              matchCount++;
            } else if (type === 'l') { 
              if (isNaN(iIdx) || iIdx < 0) return;
              next[gIdx] = { ...next[gIdx], items: [...next[gIdx].items] };
              if (next[gIdx].items[iIdx]) {
                next[gIdx].items[iIdx] = { ...next[gIdx].items[iIdx], labelEn: cleanVal };
                matchCount++;
              }
            } else if (type === 'v') { 
              if (isNaN(iIdx) || iIdx < 0) return;
              next[gIdx] = { ...next[gIdx], items: [...next[gIdx].items] };
              if (next[gIdx].items[iIdx]) {
                next[gIdx].items[iIdx] = { ...next[gIdx].items[iIdx], valueEn: cleanVal };
                matchCount++;
              }
            }
          });
          return { ...prev, specGroups: next };
        });

        setRenderKey(prev => prev + 1);
        alert(`✅ 全表智译完成！已回填 ${matchCount} 个字段。`);
      }
    } catch (err) {
      alert('智译异常：' + (err as Error).message);
    } finally { setIsAiProcessing(false); }
  };

  const handleSaveTemplate = async (mode: 'create' | 'overwrite', name: string, id: string) => {
    const tId = mode === 'create' ? `tpl_${Date.now()}` : id;
    const tName = mode === 'create' ? name : (specTemplates?.find((t: any) => t.id === id)?.name || name);
    const cleanGroups = formData.specGroups.map(g => ({ 
      titleEn: g.titleEn, 
      titleZh: g.titleZh, 
      items: g.items.map(i => ({ labelEn: i.labelEn, labelZh: i.labelZh, valueEn: i.valueEn, valueZh: i.valueZh })) 
    }));
    await fetch(`/api/specTemplates/${tId}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id: tId, name: tName, specGroups: cleanGroups }) 
    });
    mutateTemplates();
    alert("模板已同步至云端规格库");
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (confirm(`确定要彻底删除模板 "${name}" 吗？`)) { 
      await fetch(`/api/specTemplates/${id}`, { method: 'DELETE' }); 
      mutateTemplates(); 
    }
  };

  if (isProdLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20 text-primary" /></div>;

  return (
    <div className="max-w-full w-full mx-auto space-y-10 pb-32 animate-in fade-in duration-700 relative min-h-screen">
      <AiGradientDef />
      <EditorHeader isEditing={isEditing} formData={formData} categories={categories || []} translations={translations || []} translationCoverage={translationCoverage} idConflict={idConflict} onUpdateField={(f, v) => { if (f === 'categoryId') handleCategoryChange(v); else handleUpdateField(f, v); }} onSave={handleSave} onIdChange={(id) => handleUpdateField('id', id)} isSaving={isAiProcessing} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex justify-center">
            <TabsList className="bg-white/60 backdrop-blur-md p-1.5 h-16 rounded-[1.5rem] border border-white/40 shadow-sm inline-flex items-center gap-1">
              <TabsTrigger value="basic" className="rounded-2xl h-12 px-8 text-[11px] font-bold uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white hover:bg-slate-100 hover:text-slate-900"><Settings className="h-4 w-4 mr-2" /> 基础配置</TabsTrigger>
              <TabsTrigger value="media" className="rounded-2xl h-12 px-8 text-[11px] font-bold uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white hover:bg-slate-100 hover:text-slate-900"><ImageIcon className="h-4 w-4 mr-2" /> 媒体矩阵</TabsTrigger>
              <TabsTrigger value="specs" className="rounded-2xl h-12 px-8 text-[11px] font-bold uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white hover:bg-slate-100 hover:text-slate-900"><TableProperties className="h-4 w-4 mr-2" /> 规格参数</TabsTrigger>
              <TabsTrigger value="details" className="rounded-2xl h-12 px-8 text-[11px] font-bold uppercase tracking-[0.15em] data-[state=active]:bg-slate-900 data-[state=active]:text-white hover:bg-slate-100 hover:text-slate-900"><Library className="h-4 w-4 mr-2" /> 详细介绍</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="basic"><BasicInfoSection formData={formData} updateField={handleUpdateField} aiConfigEnabled={aiConfig?.isEnabled} isAiProcessing={isAiProcessing} onAiTranslate={handleAiTranslateBasic} onOpenPicker={(t) => { setPickerTarget(t as any); setIsPickerOpen(true); }} /></TabsContent>
          <TabsContent value="media"><MediaSection galleryUrls={formData.galleryUrls} onUpdateGallery={(urls) => handleUpdateField('galleryUrls', urls)} onOpenPicker={() => { setPickerTarget('gallery'); setIsPickerOpen(true); }} onMoveItem={(idx, dir) => { const n = [...formData.galleryUrls]; const t = dir === 'left' ? idx - 1 : idx + 1; if (t >= 0 && t < n.length) { [n[idx], n[t]] = [n[t], n[idx]]; handleUpdateField('galleryUrls', n); } }} /></TabsContent>
          <TabsContent value="specs">
            <SpecMatrixSection
              key={renderKey}
              groups={formData.specGroups} setGroups={(g) => handleUpdateField('specGroups', g)} aiConfig={aiConfig} isAiProcessing={isAiProcessing} processingItems={processingItems} onAiTranslate={handleAiTranslateSpecItem}
              onAiTranslateAll={handleAiTranslateAllSpecs}
              onMoveGroup={(idx, dir) => { const next = [...formData.specGroups]; const target = dir === 'up' ? idx - 1 : idx + 1; if (target >= 0 && target < next.length) { [next[idx], next[target]] = [next[target], next[idx]]; handleUpdateField('specGroups', next); } }}
              onMoveItem={(gIdx, iIdx, dir) => { const next = [...formData.specGroups]; const items = [...next[gIdx].items]; const target = dir === 'up' ? iIdx - 1 : iIdx + 1; if (target >= 0 && target < items.length) { [items[iIdx], items[target]] = [items[target], items[iIdx]]; next[gIdx].items = items; handleUpdateField('specGroups', next); } }}
              onDeleteGroup={(idx) => { const next = [...formData.specGroups]; next.splice(idx, 1); handleUpdateField('specGroups', next); }}
              specTemplates={specTemplates || []}
              onApplyTemplate={(tpl, replace) => {
                const newGroups = tpl.specGroups.map((g: any, gIdx: number) => ({
                  uid: `tg_${Date.now()}_${gIdx}`,
                  titleEn: g.titleEn,
                  titleZh: g.titleZh,
                  items: g.items.map((i: any, iIdx: number) => ({
                    uid: `ti_${Date.now()}_${gIdx}_${iIdx}`,
                    labelEn: i.labelEn,
                    labelZh: i.labelZh,
                    valueEn: i.valueEn,
                    valueZh: i.valueZh
                  }))
                }));
                handleUpdateField('specGroups', replace ? newGroups : [...formData.specGroups, ...newGroups]);
              }}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          </TabsContent>
          <TabsContent value="details"><StorySection zhContent={formData.localizedDetails.zh} targetContent={formData.localizedDetails[targetDetailsLang] || ''} targetLang={targetDetailsLang} onZhChange={(c) => handleUpdateField('localizedDetails', { ...formData.localizedDetails, zh: c })} onTargetChange={(c) => handleUpdateField('localizedDetails', { ...formData.localizedDetails, [targetDetailsLang]: c })} onTargetLangChange={setTargetDetailsLang} onAiTranslate={handleAiTranslateDetails} onImageClick={(t) => { setPickerTarget(t as any); setIsPickerOpen(true); }} supportedLangs={supportedLangs} isAiProcessing={isAiProcessing} aiConfigEnabled={aiConfig?.isEnabled} zhEditorRef={zhEditorRef} targetEditorRef={targetEditorRef} /></TabsContent>
        </Tabs>
      </div>

      <MediaLibraryDialog
        open={isPickerOpen} onOpenChange={setIsPickerOpen} selectionMode={pickerTarget === 'gallery' ? 'multiple' : 'single'} title="选择资产"
        onSelect={(assets) => {
          const urls = assets.map(a => a.url);
          if (pickerTarget === 'main') handleUpdateField('mainImageUrl', urls[0]);
          else if (pickerTarget === 'gallery') handleUpdateField('galleryUrls', Array.from(new Set([...formData.galleryUrls, ...urls])).slice(0, 10));
          else if (pickerTarget === 'richtext-zh') zhEditorRef.current?.editor?.commands.setImage({ src: urls[0] });
          else if (pickerTarget === 'richtext-target') targetEditorRef.current?.editor?.commands.setImage({ src: urls[0] });
        }}
      />
    </div>
  );
}

export default function ProductEditorPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20 text-primary" /></div>}>
      <ProductEditorContent />
    </Suspense>
  );
}
