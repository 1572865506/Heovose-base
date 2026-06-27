"use client";

import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { Loader2, TableProperties, Settings, ImageIcon, Library, Info } from 'lucide-react';
import { AdminTabs, AdminTabsList, AdminTabsTrigger, AdminTabsContent } from '@/components/admin/AdminTabs';
import { useToast } from '@/hooks/use-toast';
import { smartTranslate } from '@/lib/translate-client';
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import { AdminEditorHeader } from '@/components/admin/AdminEditorHeader';
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
  labelId?: string;
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
  videoUrl: string;
  galleryUrls: string[];
  specGroups: ProductSpecGroup[];
  localizedDetails: Record<string, string>;
  enabledLanguages: string[];
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

const generateUniqueId = (prefix: string) => {
  const randomStr = Math.random().toString(36).substring(2, 7);
  const timeStr = Date.now().toString(36);
  return `${prefix}${randomStr}${timeStr}`;
};

function robustJsonParse(rawStr: string) {
  let jsonStr = (String(rawStr) || '').trim();
  if (jsonStr.includes('```')) jsonStr = jsonStr.replace(/```json\n?|```/g, '').trim();

  // 1. 常规清洗与解析
  const clean = (s: string) => s.replace(/"\s*[：:]\s*"/g, '": "').replace(/([glv]_[a-zA-Z0-9_]+)\s*[：:]\s*/gi, '"$1": ');
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
      // 匹配 "key": "value" 或 key: "value" 等各种变形
      const regex = /["']?([a-zA-Z0-9_]+)["']?\s*[：:]\s*["']([^"']*)["']/gi;
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
  const initialDataRef = useRef<ProductFormData | null>(null);
  const hasPushedStateRef = useRef(false);

  const checkIsDirty = () => {
    if (!initialDataRef.current) return false;
    const cleanObj = (obj: any) => {
      if (!obj) return '';
      return JSON.stringify({
        id: obj.id,
        categoryId: obj.categoryId,
        status: obj.status,
        nameZh: obj.nameZh,
        nameEn: obj.nameEn,
        descZh: obj.descZh,
        descEn: obj.descEn,
        mainImageUrl: obj.mainImageUrl,
        videoUrl: obj.videoUrl,
        galleryUrls: obj.galleryUrls,
        localizedDetails: obj.localizedDetails,
        enabledLanguages: obj.enabledLanguages,
        specGroups: obj.specGroups?.map((g: any) => ({
          titleZh: g.titleZh,
          titleEn: g.titleEn,
          items: g.items?.map((i: any) => ({
            labelZh: i.labelZh,
            labelEn: i.labelEn,
            valueZh: i.valueZh,
            valueEn: i.valueEn
          }))
        }))
      });
    };
    return cleanObj(formData) !== cleanObj(initialDataRef.current);
  };

  const getDifferentSections = (draftData: any, initForm: any) => {
    const diffs: string[] = [];
    if (!draftData || !initForm) return diffs;
    const basicFields = ['id', 'categoryId', 'status', 'nameZh', 'nameEn', 'descZh', 'descEn', 'enabledLanguages'];
    if (basicFields.some(f => JSON.stringify(draftData[f]) !== JSON.stringify(initForm[f]))) {
      diffs.push('基础配置');
    }
    const mediaFields = ['mainImageUrl', 'videoUrl', 'galleryUrls'];
    if (mediaFields.some(f => JSON.stringify(draftData[f]) !== JSON.stringify(initForm[f]))) {
      diffs.push('产品图');
    }
    const cleanSpecs = (groups: any) => groups?.map((g: any) => ({
      titleZh: g.titleZh,
      titleEn: g.titleEn,
      items: g.items?.map((i: any) => ({
        labelZh: i.labelZh,
        labelEn: i.labelEn,
        valueZh: i.valueZh,
        valueEn: i.valueEn
      }))
    })) || [];
    if (JSON.stringify(cleanSpecs(draftData.specGroups)) !== JSON.stringify(cleanSpecs(initForm.specGroups))) {
      diffs.push('规格参数');
    }
    if (JSON.stringify(draftData.localizedDetails) !== JSON.stringify(initForm.localizedDetails)) {
      diffs.push('详细介绍');
    }
    return diffs;
  };

  const [formData, setFormData] = useState<ProductFormData>({
    id: '', categoryId: '', mainImageUrl: '', videoUrl: '', galleryUrls: [],
    nameEn: '', nameZh: '', descEn: '', descZh: '',
    localizedDetails: { zh: '', en: '' },
    specGroups: [], status: 'published',
    enabledLanguages: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [targetDetailsLang, setTargetDetailsLang] = useState('en');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  const [idConflict, setIdConflict] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'main' | 'video' | 'gallery' | 'richtext-zh' | 'richtext-target'>('main');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftTime, setDraftTime] = useState('');
  const [differentSections, setDifferentSections] = useState<string[]>([]);
  const draftDataRef = useRef<any>(null);

  const { data: product, isLoading: isProdLoading } = useLocalDoc<any>('products', productId || 'new');
  const { data: categories } = useLocalCollection<any>('productCategories');
  const { data: translations } = useLocalCollection<any>('localizedStrings?full=true');
  const { data: aiConfig } = useLocalDoc<any>('settings', 'ai');
  const { data: langConfig } = useLocalDoc<any>('settings', 'languages');
  const { data: specTemplates, mutate: mutateTemplates } = useLocalCollection<any>('specTemplates');

  const supportedLangs = useMemo(() => {
    const list = langConfig?.supportedLanguages || [{ code: 'zh', label: '中文' }, { code: 'en', label: 'English' }];
    return list.filter((l: any) => l.isActive !== false);
  }, [langConfig]);

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
        if (t) {
          const content = (t?.content as any) || {};
          return {
            zh: content.zh || (t as any)?.zh || '',
            en: content.en || (t as any)?.en || ''
          };
        }
        // 如果 id 本身不是以 key 命名的，直接作为内容返回，防止后台读取出空白
        if (id && !/^(biz_tr_|spec_|psl_|psv_|psg_|prod_|cat_)/i.test(id)) {
          return { zh: id, en: id };
        }
        return { zh: '', en: '' };
      };
      let rawGroups = product.specGroups;
      if (typeof rawGroups === 'string') {
        try {
          rawGroups = JSON.parse(rawGroups);
        } catch (e) {
          rawGroups = [];
        }
      }
      const groupsArray = Array.isArray(rawGroups) ? rawGroups : [];
      const sGroups = groupsArray.map((g: any) => ({
        uid: generateUniqueId('sg'),
        titleEn: getT(g.titleId).en, titleZh: getT(g.titleId).zh,
        titleId: g.titleId,
        items: (Array.isArray(g.items) ? g.items : []).map((i: any) => ({
          uid: generateUniqueId('si'),
          labelEn: getT(i.labelId).en, labelZh: getT(i.labelId).zh,
          valueEn: getT(i.valueId).en, valueZh: getT(i.valueId).zh,
          labelId: i.labelId,
          valueId: i.valueId
        }))
      }));
      const initialForm = {
        id: product.id, categoryId: product.categoryId, mainImageUrl: product.mainImageUrl,
        videoUrl: product.videoUrl || '',
        galleryUrls: product.galleryImageUrls || [],
        nameEn: getT(product.nameTextId).en, nameZh: getT(product.nameTextId).zh,
        descEn: getT(product.descriptionTextId).en, descZh: getT(product.descriptionTextId).zh,
        localizedDetails: product.localizedDetails || { zh: '', en: '' },
        specGroups: sGroups, status: product.status || 'published',
        enabledLanguages: product.enabledLanguages || supportedLangs.map((l: any) => l.code)
      };
      setFormData(initialForm);
      if (!initialDataRef.current) {
        initialDataRef.current = initialForm;
        const draftKey = `heovose_draft_product_${isEditing ? productId : 'new'}`;
        const draftStr = localStorage.getItem(draftKey);
        if (draftStr) {
          try {
            const draft = JSON.parse(draftStr);
            const cleanObj = (obj: any) => {
              if (!obj) return '';
              return JSON.stringify({
                id: obj.id,
                categoryId: obj.categoryId,
                status: obj.status,
                nameZh: obj.nameZh,
                nameEn: obj.nameEn,
                descZh: obj.descZh,
                descEn: obj.descEn,
                mainImageUrl: obj.mainImageUrl,
                videoUrl: obj.videoUrl,
                galleryUrls: obj.galleryUrls,
                localizedDetails: obj.localizedDetails,
                enabledLanguages: obj.enabledLanguages,
                specGroups: obj.specGroups?.map((g: any) => ({
                  titleZh: g.titleZh,
                  titleEn: g.titleEn,
                  items: g.items?.map((i: any) => ({
                    labelZh: i.labelZh,
                    labelEn: i.labelEn,
                    valueZh: i.valueZh,
                    valueEn: i.valueEn
                  }))
                }))
              });
            };
            if (cleanObj(draft.data) !== cleanObj(initialForm)) {
              setHasDraft(true);
              setDraftTime(new Date(draft.timestamp).toLocaleString());
              setDifferentSections(getDifferentSections(draft.data, initialForm));
              draftDataRef.current = draft.data;
            } else {
              localStorage.removeItem(draftKey);
            }
          } catch (e) {
            console.error("Failed to parse local draft", e);
          }
        }
      }
      setLastUpdatedAt(product.updatedAt || null);
    }
  }, [isEditing, product, translations, supportedLangs]);

  // 新建产品时，当语言列表配置加载完，默认勾选全部可见语言
  useEffect(() => {
    if (!isEditing && supportedLangs.length > 0) {
      const defaultForm = {
        id: '', categoryId: '', mainImageUrl: '', videoUrl: '', galleryUrls: [],
        nameEn: '', nameZh: '', descEn: '', descZh: '',
        localizedDetails: { zh: '', en: '' },
        specGroups: [], status: 'published' as const,
        enabledLanguages: supportedLangs.map((l: any) => l.code)
      };
      setFormData(defaultForm);
      if (!initialDataRef.current) {
        initialDataRef.current = defaultForm;
        const draftKey = 'heovose_draft_product_new';
        const draftStr = localStorage.getItem(draftKey);
        if (draftStr) {
          try {
            const draft = JSON.parse(draftStr);
            const cleanObj = (obj: any) => {
              if (!obj) return '';
              return JSON.stringify({
                id: obj.id,
                categoryId: obj.categoryId,
                status: obj.status,
                nameZh: obj.nameZh,
                nameEn: obj.nameEn,
                descZh: obj.descZh,
                descEn: obj.descEn,
                mainImageUrl: obj.mainImageUrl,
                videoUrl: obj.videoUrl,
                galleryUrls: obj.galleryUrls,
                localizedDetails: obj.localizedDetails,
                enabledLanguages: obj.enabledLanguages,
                specGroups: obj.specGroups?.map((g: any) => ({
                  titleZh: g.titleZh,
                  titleEn: g.titleEn,
                  items: g.items?.map((i: any) => ({
                    labelZh: i.labelZh,
                    labelEn: i.labelEn,
                    valueZh: i.valueZh,
                    valueEn: i.valueEn
                  }))
                }))
              });
            };
            if (cleanObj(draft.data) !== cleanObj(defaultForm)) {
              setHasDraft(true);
              setDraftTime(new Date(draft.timestamp).toLocaleString());
              setDifferentSections(getDifferentSections(draft.data, defaultForm));
              draftDataRef.current = draft.data;
            } else {
              localStorage.removeItem(draftKey);
            }
          } catch (e) {
            console.error("Failed to parse local draft", e);
          }
        }
      }
    }
  }, [isEditing, supportedLangs]);

  // 监听浏览器刷新/关闭，防止未保存数据丢失
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (checkIsDirty()) {
        e.preventDefault();
        e.returnValue = '您有未保存的修改，确定要离开吗？';
        return '您有未保存的修改，确定要离开吗？';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  // 当检测到数据脏时，向 window.history 压入一个阻塞状态，用来拦截浏览器回退物理按键
  useEffect(() => {
    const isDirty = checkIsDirty();
    if (isDirty && !hasPushedStateRef.current) {
      window.history.pushState({ isBlocking: true }, '', window.location.href);
      hasPushedStateRef.current = true;
    } else if (!isDirty && hasPushedStateRef.current) {
      hasPushedStateRef.current = false;
      window.history.back();
    }
  }, [formData]);

  // 监听 popstate（浏览器物理后退）
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (hasPushedStateRef.current) {
        const confirmLeave = window.confirm("您有未保存的修改，确定要返回吗？所有未保存的修改都将丢失。");
        if (confirmLeave) {
          hasPushedStateRef.current = false;
          // 浏览器已经回退了一步，我们只需允许流程通过即可
        } else {
          // 恢复阻塞状态以防下一次后退
          window.history.pushState({ isBlocking: true }, '', window.location.href);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [formData]);

  // 自动保存草稿至 localStorage
  useEffect(() => {
    if (!initialDataRef.current) return;
    const draftKey = `heovose_draft_product_${isEditing ? productId : 'new'}`;
    if (checkIsDirty()) {
      localStorage.setItem(draftKey, JSON.stringify({
        timestamp: Date.now(),
        data: formData
      }));
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [formData]);

  const handleRestoreDraft = () => {
    if (draftDataRef.current) {
      setFormData(draftDataRef.current);
      setHasDraft(false);
      toast({ title: "已恢复本地草稿", description: "已为您恢复上次未保存的编辑内容。" });
    }
  };

  const handleDiscardDraft = () => {
    const draftKey = `heovose_draft_product_${isEditing ? productId : 'new'}`;
    localStorage.removeItem(draftKey);
    setHasDraft(false);
    toast({ title: "已忽略草稿", description: "本地暂存草稿已被清理。" });
  };

  useEffect(() => {
    if (isEditing || !formData.id) {
      setIdConflict(false);
      return;
    }

    const handler = setTimeout(() => {
      fetch(`/api/products/${encodeURIComponent(formData.id)}`)
        .then(res => {
          if (res.status === 200) {
            setIdConflict(true);
          } else {
            setIdConflict(false);
          }
        })
        .catch(() => {
          setIdConflict(false);
        });
    }, 500); // 500ms 防抖

    return () => {
      clearTimeout(handler);
    };
  }, [formData.id, isEditing]);

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

  const findLocalTranslation = (zhText: string): string | null => {
    if (!zhText || !translations) return null;
    const cleanZh = zhText.trim();
    const match = translations.find((t: any) => {
      const zh = (t.zh || t.content?.zh || '').trim();
      const en = (t.en || t.content?.en || '').trim();
      return zh === cleanZh && en !== '';
    });
    if (match) {
      return match.en || match.content?.en || null;
    }
    return null;
  };

  const handleSave = async () => {
    if (!formData.id || !formData.categoryId || idConflict) {
      toast({ variant: "destructive", title: "无法保存", description: "请检查 ID 或分类是否完整" });
      return;
    }

    setIsAiProcessing(true);
    try {
      // 1. 整理本产品全部的多语言文案，准备一并提交进行哈希去重
      const translationsToSync: { zh: string; en: string }[] = [
        { zh: formData.nameZh, en: formData.nameEn },
        { zh: formData.descZh, en: formData.descEn }
      ];

      formData.specGroups.forEach(g => {
        if (g.titleZh) {
          const titleEn = g.titleEn || findLocalTranslation(g.titleZh) || '';
          translationsToSync.push({ zh: g.titleZh, en: titleEn });
        }
        g.items.forEach(i => {
          if (i.labelZh) {
            const labelEn = i.labelEn || findLocalTranslation(i.labelZh) || '';
            translationsToSync.push({ zh: i.labelZh, en: labelEn });
          }
          if (i.valueZh) {
            const valueEn = i.valueEn || findLocalTranslation(i.valueZh) || '';
            translationsToSync.push({ zh: i.valueZh, en: valueEn });
          }
        });
      });

      // 2. 调用批量接口，查询/写入，换取哈希 ID 映射表
      const bulkRes = await fetch('/api/localizedStrings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: translationsToSync })
      });
      if (!bulkRes.ok) throw new Error("批量同步翻译数据失败");

      const { mapping } = await bulkRes.json() as { mapping: Record<string, string> };

      const getHashId = (zh: string, en: string) => {
        const cleanZh = (zh || '').trim();
        let cleanEn = (en || '').trim();
        if (cleanZh && !cleanEn) {
          // 尝试查找历史字典翻译作为兜底
          const localEn = findLocalTranslation(cleanZh);
          if (localEn) {
            cleanEn = localEn.trim();
          }
        }
        const key = `${cleanZh}::${cleanEn}`;
        return mapping[key] || cleanZh;
      };

      const nameHashId = getHashId(formData.nameZh, formData.nameEn);
      const descHashId = getHashId(formData.descZh, formData.descEn);

      const sGroups = formData.specGroups.map(g => ({
        titleId: getHashId(g.titleZh, g.titleEn),
        items: g.items.map(i => ({
          labelId: getHashId(i.labelZh, i.labelEn),
          valueId: getHashId(i.valueZh, i.valueEn)
        }))
      }));

      // 3. 保存产品数据到后台
      const res = await fetch(`/api/products/${formData.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          nameTextId: nameHashId,
          descriptionTextId: descHashId,
          specGroups: sGroups,
          categoryId: formData.categoryId,
          galleryImageUrls: formData.galleryUrls,
          updatedAt: lastUpdatedAt
        })
      });

      if (!res.ok) {
        if (res.status === 409) {
          const errorData = await res.json();
          toast({
            variant: "destructive",
            title: "保存失败 (版本冲突)",
            description: errorData.message || "该产品已被其他人修改，请备份您的编辑内容并刷新页面后再试"
          });
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.error || "产品主数据同步失败");
      }

      const updatedProduct = await res.json();
      setLastUpdatedAt(updatedProduct.updatedAt || null);

      toast({ title: "同步成功", description: "产品数据已持久化至云端" });
      initialDataRef.current = formData;
      localStorage.removeItem(`heovose_draft_product_${formData.id}`);
      localStorage.removeItem('heovose_draft_product_new');
      if (hasPushedStateRef.current) {
        hasPushedStateRef.current = false;
        window.history.back();
      }
      setTimeout(() => {
        router.push('/admin/products');
      }, 50);
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
      let localNameEn = null;
      let localDescEn = null;

      const nameNeedsTranslate = formData.nameZh && !formData.nameEn;
      if (nameNeedsTranslate) {
        localNameEn = findLocalTranslation(formData.nameZh);
      }

      const descNeedsTranslate = formData.descZh && !formData.descEn;
      if (descNeedsTranslate) {
        localDescEn = findLocalTranslation(formData.descZh);
      }

      const callNameApi = nameNeedsTranslate && !localNameEn;
      const callDescApi = descNeedsTranslate && !localDescEn;

      let nameRes = null;
      let descRes = null;

      if (callNameApi || callDescApi) {
        const [apiNameRes, apiDescRes] = await Promise.all([
          callNameApi ? smartTranslate({ text: formData.nameZh, targetLangs: ['en'], taskType: 'text' }) : null,
          callDescApi ? smartTranslate({ text: formData.descZh, targetLangs: ['en'], taskType: 'text' }) : null
        ]);
        nameRes = apiNameRes;
        descRes = apiDescRes;
      }

      setFormData(prev => ({
        ...prev,
        nameEn: localNameEn || nameRes?.en || prev.nameEn,
        descEn: localDescEn || descRes?.en || prev.descEn
      }));

      if (!nameNeedsTranslate && !descNeedsTranslate) {
        toast({ title: "无需翻译", description: "名称和描述的英文内容已存在" });
      } else if (localNameEn || localDescEn) {
        toast({ title: "智能复用成功", description: "部分字段已直接从历史翻译中获取结果" });
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

  const handleAiTranslateSpecItem = async (groupUid: string, itemUid: string) => {
    if (!aiConfig?.isEnabled) return;
    const gIdx = formData.specGroups.findIndex(g => g.uid === groupUid);
    if (gIdx === -1) return;
    const iIdx = formData.specGroups[gIdx].items.findIndex(i => i.uid === itemUid);
    if (iIdx === -1) return;
    const item = formData.specGroups[gIdx].items[iIdx];
    const key = `item_${itemUid}`;

    const needsLabel = !item.labelEn;
    const needsValue = !item.valueEn;

    if (!needsLabel && !needsValue) {
      toast({ title: "无需翻译", description: "该项已有翻译内容" });
      return;
    }

    setProcessingItems(prev => new Set(prev).add(key));
    try {
      let localLabelEn = null;
      let localValueEn = null;

      if (needsLabel) localLabelEn = findLocalTranslation(item.labelZh);
      if (needsValue) localValueEn = findLocalTranslation(item.valueZh);

      const callLabelApi = needsLabel && !localLabelEn;
      const callValueApi = needsValue && !localValueEn;

      let labelEn = localLabelEn || '';
      let valueEn = localValueEn || '';

      if (callLabelApi || callValueApi) {
        const apiTask: Record<string, string> = {};
        if (callLabelApi) apiTask.label = item.labelZh;
        if (callValueApi) apiTask.value = item.valueZh;

        const res = await smartTranslate({
          text: JSON.stringify(apiTask),
          targetLangs: ['en'],
          taskType: 'spec'
        });

        if (res?.en) {
          const result = robustJsonParse(res.en);
          if (typeof result === 'object' && result !== null) {
            if (callLabelApi) labelEn = result.label || '';
            if (callValueApi) valueEn = result.value || '';
          }
        }
      }

      setFormData(prev => {
        const nextGroups = [...prev.specGroups];
        const targetGIdx = nextGroups.findIndex(g => g.uid === groupUid);
        if (targetGIdx === -1) return prev;
        const targetIIdx = nextGroups[targetGIdx].items.findIndex(i => i.uid === itemUid);
        if (targetIIdx === -1) return prev;

        nextGroups[targetGIdx] = {
          ...nextGroups[targetGIdx],
          items: [...nextGroups[targetGIdx].items]
        };
        nextGroups[targetGIdx].items[targetIIdx] = {
          ...nextGroups[targetGIdx].items[targetIIdx],
          labelEn: needsLabel ? (labelEn || item.labelEn) : item.labelEn,
          valueEn: needsValue ? (valueEn || item.valueEn) : item.valueEn
        };
        return { ...prev, specGroups: nextGroups };
      });

      if (localLabelEn || localValueEn) {
        toast({ title: "智能复用成功", description: "部分字段已从历史词库复用填入" });
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
      formData.specGroups.forEach((g) => {
        if (g.titleZh && !g.titleEn) taskMap[`g_${g.uid}`] = g.titleZh;
        g.items.forEach((i) => {
          if (i.labelZh && !i.labelEn) taskMap[`l_${g.uid}_${i.uid}`] = i.labelZh;
          if (i.valueZh && !i.valueEn) taskMap[`v_${g.uid}_${i.uid}`] = i.valueZh;
        });
      });

      const totalTasks = Object.keys(taskMap).length;
      if (totalTasks === 0) {
        alert('没有需要翻译的空字段');
        return;
      }

      // 1. 本地词库缓存拦截
      const localResults: Record<string, string> = {};
      const apiTaskMap: Record<string, string> = {};

      Object.keys(taskMap).forEach(key => {
        const zhText = taskMap[key];
        const localEn = findLocalTranslation(zhText);
        if (localEn) {
          localResults[key] = localEn;
        } else {
          apiTaskMap[key] = zhText;
        }
      });

      const totalApiTasks = Object.keys(apiTaskMap).length;
      let apiResults: Record<string, string> = {};

      if (totalApiTasks > 0) {
        const res = await smartTranslate({
          text: JSON.stringify(apiTaskMap),
          targetLangs: ['en'],
          taskType: 'spec'
        });

        if (res?.en) {
          apiResults = robustJsonParse(res.en);
          if (typeof apiResults !== 'object' || apiResults === null) {
            throw new Error('AI 返回的数据格式无法解析为对象');
          }
        }
      }

      const results = { ...localResults, ...apiResults };

      setFormData(prev => {
        const next = [...prev.specGroups];
        Object.keys(results).forEach(rawKey => {
          const val = results[rawKey];
          if (!val) return;

          const cleanVal = String(val).replace(/\\n/g, '\n');
          const key = rawKey.trim().replace(/[：:]/g, '');
          const parts = key.split('_');
          const type = parts[0].toLowerCase();

          if (type === 'g') {
            const groupUid = parts[1];
            const gIdx = next.findIndex(g => g.uid === groupUid);
            if (gIdx !== -1) {
              next[gIdx] = { ...next[gIdx], titleEn: cleanVal };
              matchCount++;
            }
          } else if (type === 'l' || type === 'v') {
            const groupUid = parts[1];
            const itemUid = parts[2];
            const gIdx = next.findIndex(g => g.uid === groupUid);
            if (gIdx !== -1) {
              next[gIdx] = { ...next[gIdx], items: [...next[gIdx].items] };
              const iIdx = next[gIdx].items.findIndex(i => i.uid === itemUid);
              if (iIdx !== -1) {
                if (type === 'l') {
                  next[gIdx].items[iIdx] = { ...next[gIdx].items[iIdx], labelEn: cleanVal };
                  matchCount++;
                } else if (type === 'v') {
                  next[gIdx].items[iIdx] = { ...next[gIdx].items[iIdx], valueEn: cleanVal };
                  matchCount++;
                }
              }
            }
          }
        });
        return { ...prev, specGroups: next };
      });

      setRenderKey(prev => prev + 1);
      alert(`✅ 全表智译完成！已回填 ${matchCount} 个字段。（其中 ${Object.keys(localResults).length} 个来自历史词库复用）`);
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

  const handleBack = () => {
    if (checkIsDirty()) {
      const confirmLeave = window.confirm("您有未保存的修改，确定要返回吗？所有未保存的修改都将丢失。");
      if (!confirmLeave) return;
      localStorage.removeItem(`heovose_draft_product_${isEditing ? productId : 'new'}`);
    }
    if (hasPushedStateRef.current) {
      hasPushedStateRef.current = false;
      window.history.back();
    }
    setTimeout(() => {
      router.push('/admin/products');
    }, 50);
  };

  if (isProdLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20 text-primary" /></div>;

  return (
    <div className="max-w-full w-full mx-auto space-y-10 pb-32 animate-in fade-in duration-700 relative min-h-screen">
      <AiGradientDef />
      <EditorHeader
        isEditing={isEditing}
        formData={formData}
        categories={categories || []}
        translations={translations || []}
        translationCoverage={translationCoverage}
        idConflict={idConflict}
        onUpdateField={(f: string, v: any) => {
          if (f === 'categoryId') handleCategoryChange(v);
          else handleUpdateField(f as keyof ProductFormData, v);
        }}
        onSave={handleSave}
        onIdChange={(id: string) => handleUpdateField('id', id)}
        isSaving={isAiProcessing}
        onBack={handleBack}
      />

      {hasDraft && (
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0">
          <Alert className="bg-primary/[0.04] border-primary/25 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 backdrop-blur-md shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Info className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div>
                <AlertTitle className="text-xs font-black text-foreground uppercase tracking-wider">检测到本地未保存的修改草稿</AlertTitle>
                <AlertDescription className="text-[10px] text-muted-foreground/80 mt-0.5 leading-relaxed flex flex-col gap-1">
                  <span>系统于 <span className="font-bold text-primary">{draftTime}</span> 自动为您暂存了未同步的修改草稿。</span>
                  {differentSections.length > 0 && (
                    <span className="text-[9px] text-primary/80 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      不一致板块: {differentSections.join('、')}
                    </span>
                  )}
                </AlertDescription>
              </div>
            </div>
            <div className="flex gap-2.5 w-full sm:w-auto justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-4 text-[9px] font-bold uppercase tracking-widest rounded-xl border-border/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                onClick={handleDiscardDraft}
              >
                忽略并删除
              </Button>
              <Button 
                size="sm" 
                className="h-8 px-4 text-[9px] font-bold uppercase tracking-widest rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/15 transition-all"
                onClick={handleRestoreDraft}
              >
                恢复草稿
              </Button>
            </div>
          </Alert>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-0">
        <AdminTabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex justify-center">
            <AdminTabsList>
              <AdminTabsTrigger value="basic"><Settings className="h-4 w-4" /> 基础配置</AdminTabsTrigger>
              <AdminTabsTrigger value="media"><ImageIcon className="h-4 w-4" /> 产品图</AdminTabsTrigger>
              <AdminTabsTrigger value="specs"><TableProperties className="h-4 w-4" /> 规格参数</AdminTabsTrigger>
              <AdminTabsTrigger value="details"><Library className="h-4 w-4" /> 详细介绍</AdminTabsTrigger>
            </AdminTabsList>
          </div>

          <AdminTabsContent value="basic"><BasicInfoSection formData={formData} updateField={handleUpdateField} aiConfigEnabled={aiConfig?.isEnabled} isAiProcessing={isAiProcessing} onAiTranslate={handleAiTranslateBasic} onOpenPicker={(t) => { setPickerTarget(t as any); setIsPickerOpen(true); }} /></AdminTabsContent>
          <AdminTabsContent value="media"><MediaSection galleryUrls={formData.galleryUrls} onUpdateGallery={(urls) => handleUpdateField('galleryUrls', urls)} onOpenPicker={() => { setPickerTarget('gallery'); setIsPickerOpen(true); }} onMoveItem={(idx, dir) => { const n = [...formData.galleryUrls]; const t = dir === 'left' ? idx - 1 : idx + 1; if (t >= 0 && t < n.length) { [n[idx], n[t]] = [n[t], n[idx]]; handleUpdateField('galleryUrls', n); } }} /></AdminTabsContent>
          <AdminTabsContent value="specs">
            <SpecMatrixSection
              key={renderKey}
              groups={formData.specGroups} setGroups={(g) => handleUpdateField('specGroups', g)} aiConfig={aiConfig} isAiProcessing={isAiProcessing} processingItems={processingItems} onAiTranslate={handleAiTranslateSpecItem}
              onAiTranslateAll={handleAiTranslateAllSpecs}
              onMoveGroup={(groupUid, dir) => {
                const next = [...formData.specGroups];
                const idx = next.findIndex(g => g.uid === groupUid);
                if (idx === -1) return;
                const target = dir === 'up' ? idx - 1 : idx + 1;
                if (target >= 0 && target < next.length) {
                  [next[idx], next[target]] = [next[target], next[idx]];
                  handleUpdateField('specGroups', next);
                }
              }}
              onMoveItem={(groupUid, itemUid, dir) => {
                const next = [...formData.specGroups];
                const gIdx = next.findIndex(g => g.uid === groupUid);
                if (gIdx === -1) return;
                const items = [...next[gIdx].items];
                const iIdx = items.findIndex(i => i.uid === itemUid);
                if (iIdx === -1) return;
                const target = dir === 'up' ? iIdx - 1 : iIdx + 1;
                if (target >= 0 && target < items.length) {
                  [items[iIdx], items[target]] = [items[target], items[iIdx]];
                  next[gIdx].items = items;
                  handleUpdateField('specGroups', next);
                }
              }}
              onDeleteGroup={(groupUid) => {
                const next = [...formData.specGroups];
                const idx = next.findIndex(g => g.uid === groupUid);
                if (idx !== -1) {
                  next.splice(idx, 1);
                  handleUpdateField('specGroups', next);
                }
              }}
              specTemplates={specTemplates || []}
              onApplyTemplate={(tpl, replace) => {
                const newGroups = tpl.specGroups.map((g: any) => ({
                  uid: generateUniqueId('tg'),
                  titleEn: g.titleEn,
                  titleZh: g.titleZh,
                  items: g.items.map((i: any) => ({
                    uid: generateUniqueId('ti'),
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
          </AdminTabsContent>
          <AdminTabsContent value="details"><StorySection zhContent={formData.localizedDetails.zh} targetContent={formData.localizedDetails[targetDetailsLang] || ''} targetLang={targetDetailsLang} onZhChange={(c) => handleUpdateField('localizedDetails', { ...formData.localizedDetails, zh: c })} onTargetChange={(c) => handleUpdateField('localizedDetails', { ...formData.localizedDetails, [targetDetailsLang]: c })} onTargetLangChange={setTargetDetailsLang} onAiTranslate={handleAiTranslateDetails} onImageClick={(t) => { setPickerTarget(t as any); setIsPickerOpen(true); }} supportedLangs={supportedLangs} isAiProcessing={isAiProcessing} aiConfigEnabled={aiConfig?.isEnabled} zhEditorRef={zhEditorRef} targetEditorRef={targetEditorRef} /></AdminTabsContent>
        </AdminTabs>
      </div>

      <MediaLibraryDialog
        open={isPickerOpen} onOpenChange={setIsPickerOpen} selectionMode={pickerTarget === 'gallery' ? 'multiple' : 'single'} title="选择资产"
        onSelect={(assets) => {
          const urls = assets.map(a => a.url);
          if (pickerTarget === 'main') handleUpdateField('mainImageUrl', urls[0]);
          else if (pickerTarget === 'video') handleUpdateField('videoUrl', urls[0]);
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
