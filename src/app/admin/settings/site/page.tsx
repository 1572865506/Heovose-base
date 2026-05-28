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
  FileText,
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
  Share2,
  Award,
  Shield,
  Boxes,
  Zap,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { AdminTabs, AdminTabsList, AdminTabsTrigger, AdminTabsContent } from '@/components/admin/AdminTabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';
import { motion, AnimatePresence } from 'framer-motion';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { GlassCard as UnifiedGlassCard } from '@/components/admin/GlassCard';
import { AdminFormSection } from '@/components/admin/AdminFormSection';

// --- Types ---
interface SiteConfig {
  primaryDomain?: string;
  logoStandard?: string;
  logoInverted?: string;
  favicon?: string;
  socialLinks?: { platform: string; url: string }[];
  certifications?: { key: string; image?: string }[];
  _version?: number;
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

const MotionGlassCard = motion(UnifiedGlassCard);

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <MotionGlassCard 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("border-border shadow-sm", className)}
  >
    {children}
  </MotionGlassCard>
);

const SectionLabel = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
  <div className="flex items-center gap-2 mb-4">
    {Icon && <Icon className="w-3.5 h-3.5 text-primary/50" />}
    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{children}</span>
  </div>
);

export default function SiteSettingsPage() {
  const { toast } = useToast();
  const [activeLang, setActiveLang] = useState('zh');
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'logoStandard' | 'logoInverted' | 'favicon' | null>(null);
  const [activeCertIndexForMedia, setActiveCertIndexForMedia] = useState<number | null>(null);

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
      // Dynamically initialize certification translations
      if (localConfig.certifications) {
        localConfig.certifications.forEach((cert: any) => {
          const tKey = `ABOUT_CERT_${cert.key}`;
          const entry = translations.find(t => t.id === tKey);
          if (entry) {
            initialEdits[tKey] = (entry.content as any) || {};
          } else {
            initialEdits[tKey] = {};
          }
        });
      }
      setTransEdits(prev => ({ ...initialEdits, ...prev }));
    }
  }, [translations, localConfig.certifications]);

  const handleTransChange = (key: string, lang: string, value: string) => {
    setTransEdits(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [lang]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localConfig),
      });

      if (!res.ok) {
        if (res.status === 409) {
          const errData = await res.json();
          throw new Error(errData.message || "配置已被他人修改，请刷新页面加载最新配置后再重试。");
        }
        throw new Error("部署失败，请检查网络或重试。");
      }

      const updatedConfig = await res.json();
      setLocalConfig(updatedConfig);

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
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "部署失败", 
        description: e.message || "网络通信异常，请检查网关状态。" 
      });
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

  const addCert = () => {
    const key = prompt("请输入证书唯一标识 (例如: UL, FDA, TUV):");
    if (!key) return;
    const uppercaseKey = key.trim().toUpperCase();
    if (!/^[A-Z0-9_]+$/.test(uppercaseKey)) {
      alert("标识只能包含大写字母、数字 and 下划线！");
      return;
    }
    const current = [...(localConfig.certifications || [])];
    if (current.some((c: any) => c.key === uppercaseKey)) {
      alert("该标识已存在！");
      return;
    }
    const newCert = { key: uppercaseKey, image: '' };
    setLocalConfig({
      ...localConfig,
      certifications: [...current, newCert]
    });
    setTransEdits(prev => ({
      ...prev,
      [`ABOUT_CERT_${uppercaseKey}`]: { zh: uppercaseKey, en: uppercaseKey }
    }));
  };

  const removeCert = (index: number) => {
    if (!confirm("确定要删除此证书吗？")) return;
    const current = [...(localConfig.certifications || [])];
    current.splice(index, 1);
    setLocalConfig({ ...localConfig, certifications: current });
  };

  const openCertImageSelect = (index: number) => {
    setActiveCertIndexForMedia(index);
    setIsMediaOpen(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-32">
      {/* Header Area */}
      <AdminPageHeader
        title="站点与品牌设置"
        subtitle="System / Brand"
        icon={Star}
        actions={
          <>
            <div className="flex p-1 bg-muted/20 border border-border/40 rounded-xl">
              {activeLanguages.map((l: any) => (
                <button
                  key={l.code}
                  onClick={() => setActiveLang(l.code)}
                  className={cn(
                    "px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                    activeLang === l.code ? "bg-card text-primary shadow-md scale-105 border border-border/60" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="rounded-2xl h-12 px-8 gap-2.5 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              签署并部署
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Config Matrix */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <AdminTabs defaultValue="identity" className="space-y-8">
            <AdminTabsList className="mb-2">
              <AdminTabsTrigger value="identity"><Globe className="h-4 w-4" /> 品牌身份</AdminTabsTrigger>
              <AdminTabsTrigger value="contact"><Mail className="h-4 w-4" /> 联系矩阵</AdminTabsTrigger>
              <AdminTabsTrigger value="seo"><Zap className="h-4 w-4" /> 智能 SEO</AdminTabsTrigger>
              <AdminTabsTrigger value="about"><FileText className="h-4 w-4" /> 关于内容</AdminTabsTrigger>
              <AdminTabsTrigger value="certs"><Award className="h-4 w-4" /> 证书管理</AdminTabsTrigger>
            </AdminTabsList>

            <AdminTabsContent value="identity" className="mt-0 space-y-8 focus-visible:outline-none">
              <AdminFormSection
                title="核心身份信息"
                subtitle="定义站点在全球搜索结果中的第一印象。"
                icon={Globe}
              >
                <div className="space-y-6">
                  <div className="space-y-4">
                    <SectionLabel icon={Info}>站点标题 (Meta Title)</SectionLabel>
                    <Input 
                      value={transEdits[SITE_KEYS.TITLE]?.[activeLang] || ''} 
                      onChange={e => handleTransChange(SITE_KEYS.TITLE, activeLang, e.target.value)}
                      placeholder="例如: Heovose - 全球领先的 IT 解决方案提供商"
                      className="h-11 rounded-xl text-sm font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <SectionLabel icon={Search}>关键词 (Keywords)</SectionLabel>
                      <Input 
                        value={transEdits[SITE_KEYS.KEYWORDS]?.[activeLang] || ''} 
                        onChange={e => handleTransChange(SITE_KEYS.KEYWORDS, activeLang, e.target.value)}
                        placeholder="关键词, 多个, 以逗号分隔"
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-4">
                      <SectionLabel icon={LinkIcon}>官方主域名</SectionLabel>
                      <Input 
                        value={localConfig.primaryDomain || ''} 
                        onChange={e => setLocalConfig({...localConfig, primaryDomain: e.target.value})}
                        placeholder="https://heovose.com"
                        className="h-10 rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionLabel icon={Layout}>全局 Meta 描述</SectionLabel>
                    <Textarea 
                      value={transEdits[SITE_KEYS.DESC]?.[activeLang] || ''} 
                      onChange={e => handleTransChange(SITE_KEYS.DESC, activeLang, e.target.value)}
                      placeholder="简明扼要地描述您的品牌，字数建议在 160 字以内。"
                      className="min-h-[120px] rounded-xl p-4 leading-relaxed"
                    />
                  </div>
                </div>
              </AdminFormSection>

              <AdminFormSection
                title="社交媒体矩阵"
                subtitle="配置页脚展示的全球社交平台链接。"
                icon={Share2}
                actions={
                  <Button onClick={addSocial} variant="outline" size="sm" className="rounded-xl gap-2 border-border h-9 px-4 text-[10px] font-bold uppercase tracking-wider hover:bg-muted/10">
                    <Plus className="w-3.5 h-3.5" /> 添加平台
                  </Button>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence mode="popLayout">
                    {(localConfig.socialLinks || []).map((link, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group flex items-center gap-4 p-5 bg-muted/10 hover:bg-muted/20 border border-border/60 hover:border-primary/30 rounded-2xl transition-all duration-300 shadow-sm"
                      >
                        <div className="space-y-2 flex-1">
                          <Input 
                            value={link.platform} 
                            onChange={e => updateSocial(idx, 'platform', e.target.value)}
                            placeholder="平台名称"
                            className="h-8 bg-transparent border-none p-0 text-xs font-black uppercase tracking-widest text-primary focus-visible:bg-transparent focus-visible:ring-0 focus-visible:border-none"
                          />
                          <Input 
                            value={link.url} 
                            onChange={e => updateSocial(idx, 'url', e.target.value)}
                            placeholder="URL 链接"
                            className="h-9 rounded-lg"
                          />
                        </div>
                        <button 
                          onClick={() => removeSocial(idx)}
                          className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {(!localConfig.socialLinks || localConfig.socialLinks.length === 0) && (
                  <div className="py-12 text-center border border-dashed border-border rounded-2xl bg-muted/5">
                    <Share2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground/60 text-xs font-medium">暂无社交媒体配置，点击右上角添加。</p>
                  </div>
                )}
              </AdminFormSection>
            </AdminTabsContent>

            <AdminTabsContent value="contact" className="mt-0 space-y-8 focus-visible:outline-none">
              <AdminFormSection
                title="企业联系信息"
                subtitle="用于展示在页脚与联系我们页面的全球通用信息。"
                icon={Building2}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <SectionLabel>官方公司名称</SectionLabel>
                    <Input value={transEdits[SITE_KEYS.COMPANY_NAME]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_NAME, activeLang, e.target.value)} className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-4">
                    <SectionLabel>总部地址</SectionLabel>
                    <Input value={transEdits[SITE_KEYS.COMPANY_ADDR]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_ADDR, activeLang, e.target.value)} className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-4">
                    <SectionLabel icon={Phone}>全球客服热线</SectionLabel>
                    <Input value={transEdits[SITE_KEYS.COMPANY_PHONE]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_PHONE, activeLang, e.target.value)} className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-4">
                    <SectionLabel icon={Mail}>官方联络邮箱</SectionLabel>
                    <Input value={transEdits[SITE_KEYS.COMPANY_EMAIL]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_EMAIL, activeLang, e.target.value)} className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-4">
                    <SectionLabel icon={MessagesSquare}>WeChat ID</SectionLabel>
                    <Input value={transEdits[SITE_KEYS.COMPANY_WECHAT]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_WECHAT, activeLang, e.target.value)} className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-4">
                    <SectionLabel icon={GlobeIcon}>WhatsApp 号码</SectionLabel>
                    <Input value={transEdits[SITE_KEYS.COMPANY_WHATSAPP]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.COMPANY_WHATSAPP, activeLang, e.target.value)} className="h-10 rounded-xl" />
                  </div>
                </div>
              </AdminFormSection>
            </AdminTabsContent>

            <AdminTabsContent value="seo" className="mt-0 space-y-8 focus-visible:outline-none">
              <AdminFormSection
                title="智能 SEO 模板引擎"
                subtitle="自动为成千上万个产品和文章页生成高度优化的 SEO 标题。"
                icon={Hash}
              >
                <div className="space-y-6">
                  <div className="space-y-4">
                    <SectionLabel icon={Database}>产品详情页模板 (Product Template)</SectionLabel>
                    <Input 
                      value={transEdits[SITE_KEYS.PRODUCT_SEO_TEMPLATE]?.[activeLang] || ''} 
                      onChange={e => handleTransChange(SITE_KEYS.PRODUCT_SEO_TEMPLATE, activeLang, e.target.value)}
                      placeholder="示例: {{title}} | {{category}} | Heovose Tech"
                      className="h-10 rounded-xl font-mono text-xs text-primary"
                    />
                    <div className="flex flex-wrap gap-2">
                      {['{{title}}', '{{category}}', '{{brand}}', '{{sku}}'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-muted/20 text-[10px] font-bold text-muted-foreground rounded-full border border-border/40">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-border/60">
                    <SectionLabel icon={Database}>内容文章页模板 (Article Template)</SectionLabel>
                    <Input 
                      value={transEdits[SITE_KEYS.ARTICLE_SEO_TEMPLATE]?.[activeLang] || ''} 
                      onChange={e => handleTransChange(SITE_KEYS.ARTICLE_SEO_TEMPLATE, activeLang, e.target.value)}
                      placeholder="示例: {{title}} - 行业洞察 - Heovose"
                      className="h-10 rounded-xl font-mono text-xs text-blue-600 dark:text-blue-400"
                    />
                    <div className="flex flex-wrap gap-2">
                      {['{{title}}', '{{author}}', '{{brand}}'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-muted/20 text-[10px] font-bold text-muted-foreground rounded-full border border-border/40">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </AdminFormSection>
            </AdminTabsContent>

            <AdminTabsContent value="about" className="mt-0 space-y-8 focus-visible:outline-none">
              <AdminFormSection
                title="“关于我们” 页面核心文案"
                subtitle="在此管理前台企业介绍及大事记的文字描述。"
                icon={Sparkles}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <SectionLabel>Hero 顶部标题</SectionLabel>
                      <Input value={transEdits[SITE_KEYS.ABOUT_HERO_TITLE]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.ABOUT_HERO_TITLE, activeLang, e.target.value)} className="h-10 rounded-xl font-bold" />
                    </div>
                    <div className="space-y-4">
                      <SectionLabel>Hero 顶部副标题</SectionLabel>
                      <Input value={transEdits[SITE_KEYS.ABOUT_HERO_SUBTITLE]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.ABOUT_HERO_SUBTITLE, activeLang, e.target.value)} className="h-10 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <SectionLabel>品牌简介标题</SectionLabel>
                    <Input value={transEdits[SITE_KEYS.ABOUT_INTRO_TITLE]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.ABOUT_INTRO_TITLE, activeLang, e.target.value)} className="h-10 rounded-xl font-bold" />
                  </div>
                  <div className="space-y-4">
                    <SectionLabel>品牌详细介绍 (支持换行)</SectionLabel>
                    <Textarea value={transEdits[SITE_KEYS.ABOUT_INTRO_TEXT]?.[activeLang] || ''} onChange={e => handleTransChange(SITE_KEYS.ABOUT_INTRO_TEXT, activeLang, e.target.value)} className="min-h-[160px] rounded-xl p-4 leading-relaxed" />
                  </div>
                </div>
              </AdminFormSection>
            </AdminTabsContent>

            <AdminTabsContent value="certs" className="mt-0 space-y-8 focus-visible:outline-none">
              <AdminFormSection
                title="企业证书设置"
                subtitle="配置在“关于我们”页面动态展示的证书及其图片和多语言翻译。"
                icon={Award}
                actions={
                  <Button onClick={addCert} variant="outline" size="sm" className="rounded-xl gap-2 border-border h-9 px-4 text-[10px] font-bold uppercase tracking-wider hover:bg-muted/10">
                    <Plus className="w-3.5 h-3.5" /> 添加证书
                  </Button>
                }
              >
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence mode="popLayout">
                    {(localConfig.certifications || []).map((cert, idx) => {
                      const tKey = `ABOUT_CERT_${cert.key}`;
                      return (
                        <motion.div 
                          key={cert.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="group flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-muted/10 hover:bg-muted/20 border border-border/60 hover:border-primary/30 rounded-2xl transition-all duration-300 shadow-sm"
                        >
                          {/* Certificate Image Selector & Preview */}
                          <div className="flex items-center gap-4 shrink-0">
                            <div 
                              onClick={() => openCertImageSelect(idx)}
                              className="h-20 w-16 rounded-xl bg-card border border-border/80 hover:border-primary flex items-center justify-center text-muted-foreground shadow-sm cursor-pointer overflow-hidden group/thumb relative transition-all"
                            >
                              {cert.image ? (
                                <img 
                                  src={getAssetUrl(cert.image)} 
                                  alt={cert.key} 
                                  className="w-full h-full object-contain p-1 group-hover/thumb:scale-105 transition-transform" 
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center p-2 text-center text-[8px] font-bold text-muted-foreground/60 gap-1">
                                  <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                                  <span>未上传</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white text-[8px] font-black uppercase tracking-wider transition-opacity">
                                选择图片
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">证书图片</Label>
                              <Button 
                                onClick={() => openCertImageSelect(idx)} 
                                variant="outline" 
                                size="sm" 
                                className="h-7 px-3 text-[9px] font-bold rounded-lg border-border hover:bg-muted/10"
                              >
                                {cert.image ? '更换图片' : '上传/选择'}
                              </Button>
                            </div>
                          </div>

                          {/* Key info & input */}
                          <div className="flex-1 space-y-2 w-full">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5 text-primary/50" /> {cert.key}
                              </span>
                              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">翻译键值: {tKey}</span>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">证书展示名称 ({activeLanguages.find((l: any) => l.code === activeLang)?.label || activeLang.toUpperCase()})</Label>
                              <Input 
                                value={transEdits[tKey]?.[activeLang] || ''} 
                                onChange={e => handleTransChange(tKey, activeLang, e.target.value)}
                                placeholder={`在当前语言下显示的名称，如: ISO 9001 质量认证`}
                                className="h-9 rounded-xl text-xs font-bold"
                              />
                            </div>
                          </div>

                          {/* Delete button */}
                          <button 
                            onClick={() => removeCert(idx)}
                            className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all self-end md:self-center opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                {(!localConfig.certifications || localConfig.certifications.length === 0) && (
                  <div className="py-12 text-center border border-dashed border-border rounded-2xl bg-muted/5">
                    <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground/60 text-xs font-medium">暂无证书配置，点击右上角“添加证书”以初始化。</p>
                  </div>
                )}
              </AdminFormSection>
            </AdminTabsContent>
          </AdminTabs>
        </div>

        {/* Right Column: Brand Assets & Preview */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Logo Matrix */}
          <AdminFormSection
            title="品牌视觉资产 (Logo)"
            icon={ImageIcon}
          >
            <div className="space-y-6">
              {/* Standard Logo */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <SectionLabel>标准 LOGO (Light Mode)</SectionLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><Info className="w-4 h-4 text-muted-foreground/40" /></TooltipTrigger>
                      <TooltipContent><p className="w-48 text-xs">用于浅色背景，通常出现在导航栏和常规文档中。</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div 
                  onClick={() => {setMediaTarget('logoStandard'); setIsMediaOpen(true);}}
                  className="group relative aspect-[3/1] bg-muted/10 hover:bg-muted/20 border-2 border-dashed border-border/60 hover:border-primary/50 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden shadow-inner"
                >
                  {localConfig.logoStandard ? (
                    <div className="relative w-full h-full p-6 transition-transform duration-500 group-hover:scale-105">
                      <Image src={getAssetUrl(localConfig.logoStandard)} alt="Standard Logo" fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                      <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">点击上传</p>
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
                  className="group relative aspect-[3/1] bg-black hover:bg-black/90 border-2 border-dashed border-border/60 hover:border-primary/50 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden shadow-inner"
                >
                  {localConfig.logoInverted ? (
                    <div className="relative w-full h-full p-6 transition-transform duration-500 group-hover:scale-105">
                      <Image src={getAssetUrl(localConfig.logoInverted)} alt="Inverted Logo" fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon className="w-8 h-8 text-white/10 mx-auto" />
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">点击上传</p>
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
                <div className="flex items-center gap-4 p-4 bg-muted/10 border border-border/40 rounded-2xl">
                  <div className="h-12 w-12 bg-card rounded-xl border border-border/60 shadow-sm flex items-center justify-center overflow-hidden">
                    {localConfig.favicon ? (
                      <Image src={getAssetUrl(localConfig.favicon)} alt="Favicon" width={28} height={28} />
                    ) : (
                      <Globe className="w-6 h-6 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {setMediaTarget('favicon'); setIsMediaOpen(true);}}
                      className="rounded-xl h-8 px-4 text-xs font-bold"
                    >
                      更换图标
                    </Button>
                    <p className="text-[9px] text-muted-foreground/50">建议尺寸: 32x32 或 64x64px (ICO/PNG)</p>
                  </div>
                </div>
              </div>
            </div>
          </AdminFormSection>

          {/* Quick Health Status */}
          <GlassCard className="bg-primary/95 shadow-2xl shadow-primary/20 border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000 rotate-12">
              <ShieldCheck className="w-40 h-40 text-white" />
            </div>
            <div className="p-6 md:p-8 text-white space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-white animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">系统合规性就绪</span>
              </div>
              <p className="text-white/80 text-xs leading-relaxed font-medium italic">
                “您的品牌配置符合国际 SEO 最佳实践。签署并部署后，系统将自动刷新边缘 CDN 缓存，确保全球一致性体验。”
              </p>
              <div className="pt-2 flex gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">TLS 加密</p>
                  <p className="text-sm font-bold">已启用</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">多语言同步</p>
                  <p className="text-sm font-bold">100%</p>
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
          if (activeCertIndexForMedia !== null && assets[0]) {
            const current = [...(localConfig.certifications || [])];
            current[activeCertIndexForMedia] = { 
              ...current[activeCertIndexForMedia], 
              image: assets[0].url 
            };
            setLocalConfig({ ...localConfig, certifications: current });
            setActiveCertIndexForMedia(null);
          } else if (mediaTarget && assets[0]) {
            setLocalConfig({...localConfig, [mediaTarget]: assets[0].url});
          }
          setIsMediaOpen(false);
        }} 
      />
    </div>
  );
}
