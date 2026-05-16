'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Loader2, 
  Globe, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  Info,
  Layout,
  Plus,
  Trash2,
  MessagesSquare,
  Globe as GlobeIcon,
  Search,
  Hash,
  Database,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  Phone,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface SiteConfig {
  primaryDomain?: string;
  logoStandard?: string;
  logoInverted?: string;
  favicon?: string;
  socialLinks?: { platform: string; url: string }[];
}

interface LocalizedString {
  id: string;
  content: Record<string, string>;
}

// --- Translation Key Constants ---
const SITE_KEYS = {
  TITLE: 'SITE_TITLE',
  DESC: 'SITE_DESCRIPTION',
  KEYWORDS: 'SITE_KEYWORDS',
  COMPANY_NAME: 'COMPANY_NAME',
  COMPANY_ADDR: 'COMPANY_ADDR',
  COMPANY_PHONE: 'COMPANY_PHONE',
  COMPANY_EMAIL: 'COMPANY_EMAIL',
  COMPANY_WECHAT: 'COMPANY_WECHAT',
  COMPANY_WHATSAPP: 'COMPANY_WHATSAPP',
  PRODUCT_SEO_TEMPLATE: 'PRODUCT_SEO_TEMPLATE',
  ARTICLE_SEO_TEMPLATE: 'ARTICLE_SEO_TEMPLATE',
  ABOUT_HERO_TITLE: 'ABOUT_HERO_TITLE',
  ABOUT_HERO_SUBTITLE: 'ABOUT_HERO_SUBTITLE',
  ABOUT_INTRO_TITLE: 'ABOUT_INTRO_TITLE',
  ABOUT_INTRO_TEXT: 'ABOUT_INTRO_TEXT',
};

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden", className)}
  >
    {children}
  </motion.div>
);

const SectionLabel = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
  <div className="flex items-center gap-2 mb-4">
    {Icon && <Icon className="w-3.5 h-3.5 text-primary/50" />}
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{children}</span>
  </div>
);

export default function SiteSettingsPage() {
  const { toast } = useToast();
  const [activeLang, setActiveLang] = useState('zh');
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'logoStandard' | 'logoInverted' | 'favicon' | null>(null);

  const { data: siteConfig, mutate: mutateConfig } = useLocalDoc<SiteConfig>('settings', 'site');
  const { data: translations, mutate: mutateTrans } = useLocalCollection<LocalizedString>('localizedStrings?full=true');
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  
  const activeLanguages = useMemo(() => langSettings?.supportedLanguages || [
    { code: 'zh', label: '中文' }, 
    { code: 'en', label: 'English' }
  ], [langSettings]);

  const [localConfig, setLocalConfig] = useState<SiteConfig>({});
  const [transEdits, setTransEdits] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (siteConfig) setLocalConfig(siteConfig);
  }, [siteConfig]);

  useEffect(() => {
    if (translations) {
      const initialEdits: any = {};
      Object.values(SITE_KEYS).forEach(key => {
        const entry = translations.find(t => t.id === key);
        if (entry) {
          initialEdits[key] = (entry.content as any) || {};
        } else {
          initialEdits[key] = {};
        }
      });
      setTransEdits(initialEdits);
    }
  }, [translations]);

  const handleTransChange = (key: string, lang: string, value: string) => {
    setTransEdits(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [lang]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/settings/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localConfig),
      });

      const transPromises = Object.entries(transEdits).map(([id, content]) => {
        return fetch(`/api/localizedStrings/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, content }),
        });
      });
      await Promise.all(transPromises);

      mutateConfig();
      mutateTrans();
      toast({ 
        title: "全局配置已同步", 
        description: "品牌资产与多语言词库已成功签署部署。",
        className: "bg-primary text-white border-none rounded-2xl"
      });
    } catch (e) {
      toast({ variant: "destructive", title: "部署失败", description: "网络通信异常，请检查网关状态。" });
    } finally {
      setIsSaving(false);
    }
  };

  const addSocial = () => {
    const current = [...(localConfig.socialLinks || [])];
    setLocalConfig({ ...localConfig, socialLinks: [...current, { platform: 'LinkedIn', url: '' }] });
  };

  const removeSocial = (index: number) => {
    const current = [...(localConfig.socialLinks || [])];
    current.splice(index, 1);
    setLocalConfig({ ...localConfig, socialLinks: current });
  };

  const updateSocial = (index: number, field: string, value: string) => {
    const current = [...(localConfig.socialLinks || [])];
    current[index] = { ...current[index], [field]: value };
    setLocalConfig({ ...localConfig, socialLinks: current });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-32">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Brand Engine v2.0</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight font-headline">站点与品牌设置</h1>
          <p className="text-slate-500 max-w-xl leading-relaxed">
            在此管理您的全球品牌资产、联系矩阵以及智能 SEO 引擎。
            所有更改将实时同步至全球 20+ 个边缘节点。
          </p>
        </div>

        <div className="flex items-center gap-6 p-2 bg-white/50 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-sm">
          <div className="flex p-1 bg-slate-100/50 rounded-full">
            {activeLanguages.map((l: any) => (
              <button
                key={l.code}
                onClick={() => setActiveLang(l.code)}
                className={cn(
                  "px-6 py-2 rounded-full text-xs font-bold transition-all duration-300",
                  activeLang === l.code ? "bg-white text-primary shadow-lg scale-105" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-12 px-10 rounded-full bg-primary hover:bg-primary/90 text-white font-bold gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            签署并部署
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Left Column: Config Matrix */}
        <div className="col-span-12 lg:col-span-8 space-y-12">
          <Tabs defaultValue="identity" className="space-y-10">
            <TabsList className="bg-slate-100/50 p-1.5 rounded-[2rem] h-14 border border-slate-200/50 w-full md:w-fit backdrop-blur-md">
              <TabsTrigger value="identity" className="rounded-full px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg text-[11px] font-black uppercase tracking-widest transition-all">品牌身份</TabsTrigger>
              <TabsTrigger value="contact" className="rounded-full px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg text-[11px] font-black uppercase tracking-widest transition-all">联系矩阵</TabsTrigger>
              <TabsTrigger value="seo" className="rounded-full px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg text-[11px] font-black uppercase tracking-widest transition-all">智能 SEO</TabsTrigger>
              <TabsTrigger value="about" className="rounded-full px-10 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg text-[11px] font-black uppercase tracking-widest transition-all">关于内容</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="mt-0 space-y-10 focus-visible:outline-none">
              <GlassCard>
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold font-headline text-slate-900">核心身份信息</CardTitle>
                    <CardDescription className="mt-1">定义站点在全球搜索结果中的第一印象。</CardDescription>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-2xl"><Globe className="w-6 h-6 text-primary" /></div>
                </div>
                <div className="p-12 space-y-10">
                  <div className="space-y-4">
                    <SectionLabel icon={Info}>站点标题 (Meta Title)</SectionLabel>
                    <Input 
                      value={transEdits[SITE_KEYS.TITLE]?.[activeLang] || ''} 
                      onChange={e => handleTransChange(SITE_KEYS.TITLE, activeLang, e.target.value)}
                      placeholder="例如: Heovose - 全球领先的 IT 解决方案提供商"
                      className="h-16 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <SectionLabel icon={Search}>关键词 (Keywords)</SectionLabel>
                      <Input 
                        value={transEdits[SITE_KEYS.KEYWORDS]?.[activeLang] || ''} 
                        onChange={e => handleTransChange(SITE_KEYS.KEYWORDS, activeLang, e.target.value)}
                        placeholder="关键词, 多个, 以逗号分隔"
                        className="h-14 rounded-xl bg-slate-50/50 border-slate-100"
                      />
                    </div>
                    <div className="space-y-4">
                      <SectionLabel icon={LinkIcon}>官方主域名</SectionLabel>
                      <Input 
                        value={localConfig.primaryDomain || ''} 
                        onChange={e => setLocalConfig({...localConfig, primaryDomain: e.target.value})}
                        placeholder="https://heovose.com"
                        className="h-14 rounded-xl bg-slate-50/50 border-slate-100 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionLabel icon={Layout}>全局 Meta 描述</SectionLabel>
                    <Textarea 
                      value={transEdits[SITE_KEYS.DESC]?.[activeLang] || ''} 
                      onChange={e => handleTransChange(SITE_KEYS.DESC, activeLang, e.target.value)}
                      placeholder="简明扼要地描述您的品牌，字数建议在 160 字以内。"
                      className="min-h-[120px] rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white p-6 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold font-headline text-slate-900">社交媒体矩阵</CardTitle>
                    <CardDescription className="mt-1">配置页脚展示的全球社交平台链接。</CardDescription>
                  </div>
                  <Button onClick={addSocial} variant="outline" className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5">
                    <Plus className="w-4 h-4" /> 添加平台
                  </Button>
                </div>
                <div className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                      {(localConfig.socialLinks || []).map((link, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group flex items-center gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-white transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="space-y-2 flex-1">
                            <Input 
                              value={link.platform} 
                              onChange={e => updateSocial(idx, 'platform', e.target.value)}
                              placeholder="平台名称"
                              className="h-8 bg-transparent border-none p-0 text-xs font-black uppercase tracking-widest text-primary focus:ring-0"
                            />
                            <Input 
                              value={link.url} 
                              onChange={e => updateSocial(idx, 'url', e.target.value)}
                              placeholder="URL 链接"
                              className="h-10 bg-white rounded-lg border-slate-100 text-sm font-medium"
                            />
                          </div>
                          <button 
                            onClick={() => removeSocial(idx)}
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  {(!localConfig.socialLinks || localConfig.socialLinks.length === 0) && (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                      <Share2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">暂无社交媒体配置，点击右上角添加。</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="contact" className="mt-0 space-y-10 focus-visible:outline-none">
              <GlassCard>
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold font-headline text-slate-900">企业联系信息</CardTitle>
                    <CardDescription className="mt-1">用于展示在页脚与联系我们页面的全球通用信息。</CardDescription>
                  </div>
                  <div className="p-3 bg-accent/5 rounded-2xl"><Building2 className="w-6 h-6 text-accent" /></div>
                </div>
                <div className="p-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-4">
                      <SectionLabel>官方公司名称</SectionLabel>
                      <Input value={transEdits[SITE_KEYS.COMPANY_NAME]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_NAME, activeLang, e.target.value)} className="h-14 rounded-xl" />
                    </div>
                    <div className="space-y-4">
                      <SectionLabel>总部地址</SectionLabel>
                      <Input value={transEdits[SITE_KEYS.COMPANY_ADDR]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_ADDR, activeLang, e.target.value)} className="h-14 rounded-xl" />
                    </div>
                    <div className="space-y-4">
                      <SectionLabel icon={Phone}>全球客服热线</SectionLabel>
                      <Input value={transEdits[SITE_KEYS.COMPANY_PHONE]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_PHONE, activeLang, e.target.value)} className="h-14 rounded-xl" />
                    </div>
                    <div className="space-y-4">
                      <SectionLabel icon={Mail}>官方联络邮箱</SectionLabel>
                      <Input value={transEdits[SITE_KEYS.COMPANY_EMAIL]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_EMAIL, activeLang, e.target.value)} className="h-14 rounded-xl" />
                    </div>
                    <div className="space-y-4">
                      <SectionLabel icon={MessagesSquare}>WeChat ID</SectionLabel>
                      <Input value={transEdits[SITE_KEYS.COMPANY_WECHAT]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_WECHAT, activeLang, e.target.value)} className="h-14 rounded-xl" />
                    </div>
                    <div className="space-y-4">
                      <SectionLabel icon={GlobeIcon}>WhatsApp 号码</SectionLabel>
                      <Input value={transEdits[SITE_KEYS.COMPANY_WHATSAPP]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_WHATSAPP, activeLang, e.target.value)} className="h-14 rounded-xl" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="seo" className="mt-0 space-y-10 focus-visible:outline-none">
              <GlassCard>
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold font-headline text-slate-900">智能 SEO 模板引擎</CardTitle>
                    <CardDescription className="mt-1">自动为成千上万个产品和文章页生成高度优化的 SEO 标题。</CardDescription>
                  </div>
                  <div className="p-3 bg-blue-500/5 rounded-2xl"><Hash className="w-6 h-6 text-blue-500" /></div>
                </div>
                <div className="p-12 space-y-10">
                  <div className="space-y-4">
                    <SectionLabel icon={Database}>产品详情页模板 (Product Template)</SectionLabel>
                    <Input 
                      value={transEdits[SITE_KEYS.PRODUCT_SEO_TEMPLATE]?.[activeLang] || ''} 
                      onChange={e => handleTransChange(SITE_KEYS.PRODUCT_SEO_TEMPLATE, activeLang, e.target.value)}
                      placeholder="示例: {{title}} | {{category}} | Heovose Tech"
                      className="h-16 rounded-2xl bg-slate-50/50 border-slate-100 font-mono text-primary"
                    />
                    <div className="flex flex-wrap gap-2">
                      {['{{title}}', '{{category}}', '{{brand}}', '{{sku}}'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-400 rounded-full border border-slate-200">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <SectionLabel icon={Database}>内容文章页模板 (Article Template)</SectionLabel>
                    <Input 
                      value={transEdits[SITE_KEYS.ARTICLE_SEO_TEMPLATE]?.[activeLang] || ''} 
                      onChange={e => handleTransChange(SITE_KEYS.ARTICLE_SEO_TEMPLATE, activeLang, e.target.value)}
                      placeholder="示例: {{title}} - 行业洞察 - Heovose"
                      className="h-16 rounded-2xl bg-slate-50/50 border-slate-100 font-mono text-blue-600"
                    />
                    <div className="flex flex-wrap gap-2">
                      {['{{title}}', '{{author}}', '{{brand}}'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-400 rounded-full border border-slate-200">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="about" className="mt-0 space-y-10 focus-visible:outline-none">
              <GlassCard>
                <div className="p-10 border-b border-slate-100">
                  <CardTitle className="text-2xl font-bold font-headline text-slate-900">“关于我们” 页面核心文案</CardTitle>
                </div>
                <div className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <SectionLabel>Hero 顶部标题</SectionLabel>
                      <Input value={transEdits[SITE_KEYS.ABOUT_HERO_TITLE]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.ABOUT_HERO_TITLE, activeLang, e.target.value)} className="h-14 font-bold" />
                    </div>
                    <div className="space-y-4">
                      <SectionLabel>Hero 顶部副标题</SectionLabel>
                      <Input value={transEdits[SITE_KEYS.ABOUT_HERO_SUBTITLE]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.ABOUT_HERO_SUBTITLE, activeLang, e.target.value)} className="h-14" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <SectionLabel>品牌简介标题</SectionLabel>
                    <Input value={transEdits[SITE_KEYS.ABOUT_INTRO_TITLE]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.ABOUT_INTRO_TITLE, activeLang, e.target.value)} className="h-14 font-bold" />
                  </div>
                  <div className="space-y-4">
                    <SectionLabel>品牌详细介绍 (支持换行)</SectionLabel>
                    <Textarea value={transEdits[SITE_KEYS.ABOUT_INTRO_TEXT]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.ABOUT_INTRO_TEXT, activeLang, e.target.value)} className="min-h-[200px] leading-relaxed p-6" />
                  </div>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Brand Assets & Preview */}
        <div className="col-span-12 lg:col-span-4 space-y-12">
          {/* Logo Matrix */}
          <GlassCard>
            <div className="p-8 border-b border-slate-100 flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">品牌视觉资产 (Logo)</CardTitle>
            </div>
            <div className="p-8 space-y-8">
              {/* Standard Logo */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <SectionLabel>标准 LOGO (Light Mode)</SectionLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><Info className="w-4 h-4 text-slate-300" /></TooltipTrigger>
                      <TooltipContent><p className="w-48 text-xs">用于浅色背景，通常出现在导航栏和常规文档中。</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div 
                  onClick={() => {setMediaTarget('logoStandard'); setIsMediaOpen(true);}}
                  className="group relative aspect-[3/1] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white transition-all overflow-hidden shadow-inner"
                >
                  {localConfig.logoStandard ? (
                    <div className="relative w-full h-full p-6 transition-transform duration-500 group-hover:scale-105">
                      <Image src={getAssetUrl(localConfig.logoStandard)} alt="Standard Logo" fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">点击上传</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ArrowUpRight className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Inverted Logo */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <SectionLabel>反色 LOGO (Dark Mode)</SectionLabel>
                </div>
                <div 
                  onClick={() => {setMediaTarget('logoInverted'); setIsMediaOpen(true);}}
                  className="group relative aspect-[3/1] bg-slate-900 border-2 border-slate-800 rounded-3xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden shadow-2xl"
                >
                  {localConfig.logoInverted ? (
                    <div className="relative w-full h-full p-6 transition-transform duration-500 group-hover:scale-105">
                      <Image src={getAssetUrl(localConfig.logoInverted)} alt="Inverted Logo" fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon className="w-8 h-8 text-white/20 mx-auto" />
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">点击上传</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ArrowUpRight className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div className="space-y-4">
                <SectionLabel>网站图标 (Favicon)</SectionLabel>
                <div className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="h-16 w-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                    {localConfig.favicon ? (
                      <Image src={getAssetUrl(localConfig.favicon)} alt="Favicon" width={32} height={32} />
                    ) : (
                      <Globe className="w-8 h-8 text-slate-200" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {setMediaTarget('favicon'); setIsMediaOpen(true);}}
                      className="rounded-full h-10 px-6 font-bold"
                    >
                      更换图标
                    </Button>
                    <p className="text-[10px] text-slate-400">建议尺寸: 32x32 或 64x64px (ICO/PNG)</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Health Status */}
          <GlassCard className="bg-primary shadow-2xl shadow-primary/20 border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000 rotate-12">
              <ShieldCheck className="w-40 h-40 text-white" />
            </div>
            <div className="p-10 text-white space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-white" />
                <span className="text-sm font-black uppercase tracking-widest">系统合规性就绪</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed font-medium italic">
                “您的品牌配置符合国际 SEO 最佳实践。签署并部署后，系统将自动刷新边缘 CDN 缓存，确保全球一致性体验。”
              </p>
              <div className="pt-4 flex gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">TLS 加密</p>
                  <p className="text-lg font-bold">已启用</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">多语言同步</p>
                  <p className="text-lg font-bold">100%</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <MediaLibraryDialog 
        open={isMediaOpen} 
        onOpenChange={setIsMediaOpen} 
        onSelect={(assets) => {
          if (mediaTarget && assets[0]) {
            setLocalConfig({...localConfig, [mediaTarget]: assets[0].url});
          }
          setIsMediaOpen(false);
        }} 
      />
    </div>
  );
}
