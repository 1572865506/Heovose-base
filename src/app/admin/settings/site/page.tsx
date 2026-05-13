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
  Search, 
  Link as LinkIcon, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  Info,
  ExternalLink,
  Smartphone,
  Monitor,
  Layout,
  RefreshCw,
  MousePointer2,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';

// --- Types ---
interface SiteConfig {
  primaryDomain?: string;
  logoStandard?: string;
  logoInverted?: string;
  favicon?: string;
  productSeoTemplate?: string;
  articleSeoTemplate?: string;
  socialLinks?: { platform: string; url: string }[];
}

interface LocalizedString {
  id: string;
  [key: string]: any;
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
};

// --- Sub-components (defined outside to prevent re-render issues) ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700", className)}>
    {children}
  </div>
);

export default function SiteSettingsPage() {
  const { toast } = useToast();
  const [activeLang, setActiveLang] = useState('zh');
  const [isSaving, setIsSaving] = useState(false);
  
  // Media Library State
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'logoStandard' | 'logoInverted' | 'favicon' | null>(null);

  // 1. Fetch Global Settings Doc (for non-translatable fields)
  const { data: siteConfig, mutate: mutateConfig } = useLocalDoc<SiteConfig>('settings', 'site');
  
  // 2. Fetch All Translations (for translatable fields)
  const { data: translations, mutate: mutateTrans, isLoading: isTransLoading } = useLocalCollection<LocalizedString>('localizedStrings?full=true');
  
  // 3. Language Settings (for knowing which languages are active)
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  const activeLanguages = useMemo(() => langSettings?.supportedLanguages || [
    { code: 'zh', label: '中文' }, 
    { code: 'en', label: 'English' }
  ], [langSettings]);

  // --- Local State for Form ---
  const [localConfig, setLocalConfig] = useState<SiteConfig>({});
  
  // We use a separate state to track translation edits before saving
  const [transEdits, setTransEdits] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (siteConfig) setLocalConfig(siteConfig);
  }, [siteConfig]);

  // Sync translation edits from DB when loaded
  useEffect(() => {
    if (translations) {
      const initialEdits: any = {};
      Object.values(SITE_KEYS).forEach(key => {
        const entry = translations.find(t => t.id === key);
        if (entry) {
          const content = (entry.content as any) || {};
          // Ensure all active languages have a value, even if empty
          const fullContent: Record<string, string> = {};
          activeLanguages.forEach((l: any) => {
            fullContent[l.code] = content[l.code] || (entry[l.code] as string) || '';
          });
          initialEdits[key] = fullContent;
        } else {
          const emptyContent: Record<string, string> = {};
          activeLanguages.forEach((l: any) => { emptyContent[l.code] = ''; });
          initialEdits[key] = emptyContent;
        }
      });
      setTransEdits(initialEdits);
    }
  }, [translations, activeLanguages]);

  const handleTransChange = (key: string, lang: string, value: string) => {
    setTransEdits(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [lang]: value
      }
    }));
  };

  const openMedia = (target: 'logoStandard' | 'logoInverted' | 'favicon') => {
    setMediaTarget(target);
    setIsMediaOpen(true);
  };

  const handleMediaSelect = (assets: any[]) => {
    if (mediaTarget && assets.length > 0) {
      const selectedAsset = assets[0];
      // CRITICAL: Use asset.url instead of asset.id for preview and config consistency
      setLocalConfig(prev => ({ ...prev, [mediaTarget]: selectedAsset.url }));
    }
    setIsMediaOpen(false);
  };

  const handleAddSocial = () => {
    const current = localConfig.socialLinks || [];
    setLocalConfig(prev => ({
      ...prev,
      socialLinks: [...current, { platform: 'Facebook', url: '' }]
    }));
  };

  const handleRemoveSocial = (index: number) => {
    const current = [...(localConfig.socialLinks || [])];
    current.splice(index, 1);
    setLocalConfig(prev => ({ ...prev, socialLinks: current }));
  };

  const handleSocialChange = (index: number, field: 'platform' | 'url', value: string) => {
    const current = [...(localConfig.socialLinks || [])];
    current[index] = { ...current[index], [field]: value };
    setLocalConfig(prev => ({ ...prev, socialLinks: current }));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'twitter':
      case 'x': return <Twitter className="h-4 w-4" />;
      default: return <LinkIcon className="h-4 w-4" />;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save Site Config
      await fetch('/api/settings/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localConfig),
      });

      // 2. Save All Linked Translations
      const transPromises = Object.entries(transEdits).map(([id, content]) => {
        return fetch(`/api/localizedStrings/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, content }),
        });
      });
      await Promise.all(transPromises);

      // 3. Trigger Domain Sync (Hook)
      if (localConfig.primaryDomain) {
        await fetch('/api/admin/system/domain-sync', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: localConfig.primaryDomain }) 
        }).catch(err => console.log('Domain sync hook (optional) skipped or failed:', err));
      }

      mutateConfig();
      mutateTrans();
      toast({ 
        title: "全站配置部署成功", 
        description: "词库、视觉资产及域名路由已同步至边缘节点。",
        className: "bg-slate-900 text-white rounded-2xl border-none shadow-2xl"
      });
    } catch (e) {
      toast({ variant: "destructive", title: "部署失败", description: "通信链路异常，请稍后重试。" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 relative">
      {/* Background Decor */}
      <div className="absolute top-[-5%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-accent/5 blur-[100px] rounded-full -z-10" />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
              <Layout className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-headline font-bold text-slate-900">站点与品牌管理</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-2xl pl-1">
            定义全站 SEO 策略、视觉资产以及公司基本资料。所有文本均由词库动态驱动。
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
            {activeLanguages.map((lang: any) => (
              <Button 
                key={lang.code}
                variant={activeLang === lang.code ? "outline" : "outline"} 
                size="sm" 
                onClick={() => setActiveLang(lang.code)}
                className={cn(
                  "h-9 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border-none",
                  activeLang === lang.code ? "bg-white text-primary shadow-sm" : "text-slate-400 bg-transparent"
                )}
              >
                {lang.label}
              </Button>
            ))}
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="rounded-full h-12 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            签署并部署
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Site & Brand */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* SEO & TDK Section */}
          <GlassCard>
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full translate-x-32 -translate-y-32" />
               <div className="relative z-10 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline font-bold">SEO 与 检索优化</CardTitle>
                    <CardDescription className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Search Engine & Discovery</CardDescription>
                  </div>
               </div>
            </div>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                    站点标题 (SITE_TITLE) <Badge variant="outline" className="text-[8px] opacity-60">词库联动</Badge>
                  </Label>
                  <Input 
                    value={transEdits[SITE_KEYS.TITLE]?.[activeLang] || ''} 
                    onChange={e => handleTransChange(SITE_KEYS.TITLE, activeLang, e.target.value)}
                    placeholder="例如: Heovose Elevate | 铝合金门窗智造专家"
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                      站点关键词 (SITE_KEYWORDS)
                    </Label>
                    <Input 
                      value={transEdits[SITE_KEYS.KEYWORDS]?.[activeLang] || ''} 
                      onChange={e => handleTransChange(SITE_KEYS.KEYWORDS, activeLang, e.target.value)}
                      placeholder="关键词,用逗号隔开"
                      className="h-14 rounded-2xl bg-slate-50 border-none font-bold shadow-inner"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                      主运行域名 (Primary Domain)
                    </Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        value={localConfig.primaryDomain || ''} 
                        onChange={e => setLocalConfig({...localConfig, primaryDomain: e.target.value})}
                        placeholder="https://www.heovose.com"
                        className="h-14 pl-12 rounded-2xl bg-slate-50 border-none font-mono text-xs font-bold shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                    全站 SEO 描述 (SITE_DESCRIPTION)
                  </Label>
                  <Textarea 
                    value={transEdits[SITE_KEYS.DESC]?.[activeLang] || ''} 
                    onChange={e => handleTransChange(SITE_KEYS.DESC, activeLang, e.target.value)}
                    placeholder="简明扼要地描述您的品牌与服务..."
                    className="min-h-[100px] rounded-2xl bg-slate-50 border-none font-medium shadow-inner p-4"
                  />
                </div>
              </div>

              {/* SEO Templates */}
              <div className="pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                    产品页 SEO 模板 <Sparkles className="h-3 w-3 text-primary" />
                  </Label>
                  <Input 
                    value={localConfig.productSeoTemplate || ''} 
                    onChange={e => setLocalConfig({...localConfig, productSeoTemplate: e.target.value})}
                    placeholder="[ProductName] | [SiteTitle]"
                    className="h-12 rounded-xl bg-slate-900 text-white border-none font-mono text-xs shadow-xl"
                  />
                  <p className="text-[10px] text-slate-400 italic px-1">可用变量: [ProductName], [SiteTitle], [Category]</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                    案例/文章 SEO 模板
                  </Label>
                  <Input 
                    value={localConfig.articleSeoTemplate || ''} 
                    onChange={e => setLocalConfig({...localConfig, articleSeoTemplate: e.target.value})}
                    placeholder="[Title] - [SiteTitle]"
                    className="h-12 rounded-xl bg-slate-900 text-white border-none font-mono text-xs shadow-xl"
                  />
                  <p className="text-[10px] text-slate-400 italic px-1">可用变量: [Title], [SiteTitle], [Date]</p>
                </div>
              </div>
            </CardContent>
          </GlassCard>

          {/* Company Infrastructure Section */}
          <GlassCard>
            <CardHeader className="p-8 border-b border-slate-50">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline font-bold text-slate-900">企业基础设施资料</CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Company Identity & Contact</CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">官方公司名称</Label>
                      <Input 
                        value={transEdits[SITE_KEYS.COMPANY_NAME]?.[activeLang] || ''} 
                        onChange={e => handleTransChange(SITE_KEYS.COMPANY_NAME, activeLang, e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">办公物理地址 (为空则隐藏)</Label>
                      <Input 
                        value={transEdits[SITE_KEYS.COMPANY_ADDR]?.[activeLang] || ''} 
                        onChange={e => handleTransChange(SITE_KEYS.COMPANY_ADDR, activeLang, e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">全球联络电话</Label>
                      <Input 
                        value={transEdits[SITE_KEYS.COMPANY_PHONE]?.[activeLang] || ''} 
                        onChange={e => handleTransChange(SITE_KEYS.COMPANY_PHONE, activeLang, e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-none font-bold font-mono"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">官方联络邮箱</Label>
                      <Input 
                        value={transEdits[SITE_KEYS.COMPANY_EMAIL]?.[activeLang] || ''} 
                        onChange={e => handleTransChange(SITE_KEYS.COMPANY_EMAIL, activeLang, e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-none font-bold font-mono"
                      />
                    </div>
                  </div>
               </div>

               {/* Social Matrix */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <RefreshCw className="h-3 w-3" /> 社交媒体矩阵 (Social Matrix)
                     </p>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={handleAddSocial}
                       className="h-8 rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
                     >
                       <Plus className="h-3 w-3 mr-2" /> 新增矩阵节点
                     </Button>
                   </div>
                   
                   <div className="space-y-3">
                     {(localConfig.socialLinks || []).length === 0 ? (
                       <div className="p-12 border-2 border-dashed border-slate-100 rounded-3xl text-center space-y-3">
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto">
                             <LinkIcon className="h-5 w-5 text-slate-200" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">暂无配置社交外链</p>
                       </div>
                     ) : (
                       localConfig.socialLinks?.map((link, idx) => (
                         <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                           <div className="flex-1 grid grid-cols-12 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                             <div className="col-span-4 flex items-center gap-3 pl-2">
                                <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                                   {getPlatformIcon(link.platform)}
                                </div>
                                <select 
                                  value={link.platform} 
                                  onChange={(e) => handleSocialChange(idx, 'platform', e.target.value)}
                                  className="bg-transparent border-none text-[11px] font-bold text-slate-600 focus:ring-0 cursor-pointer"
                                >
                                  <option value="Facebook">Facebook</option>
                                  <option value="Instagram">Instagram</option>
                                  <option value="LinkedIn">LinkedIn</option>
                                  <option value="YouTube">YouTube</option>
                                  <option value="Twitter">X / Twitter</option>
                                  <option value="Other">Other</option>
                                </select>
                             </div>
                             <div className="col-span-8">
                                <Input 
                                  value={link.url} 
                                  onChange={(e) => handleSocialChange(idx, 'url', e.target.value)}
                                  placeholder="https://..." 
                                  className="h-9 border-none bg-white/50 text-xs font-medium rounded-xl"
                                />
                             </div>
                           </div>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             onClick={() => handleRemoveSocial(idx)}
                             className="h-10 w-10 rounded-full text-slate-300 hover:text-destructive hover:bg-destructive/5 shrink-0"
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       ))
                     )}
                   </div>
                   <p className="text-[10px] text-slate-400 italic px-2">链接将自动同步至网站页脚社交图标组。</p>
                </div>
            </CardContent>
          </GlassCard>
        </div>

        {/* Right Column: Brand Assets */}
        <div className="lg:col-span-4 space-y-10">
          <GlassCard>
            <CardHeader className="p-8 border-b border-slate-50">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline font-bold text-slate-900">视觉资产 (Assets)</CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Logo & Icons</CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Logo Standard */}
              <div className="space-y-4">
                 <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                   标准 LOGO (浅色背景)
                   <TooltipProvider>
                     <Tooltip>
                       <TooltipTrigger><Info className="h-3.5 w-3.5" /></TooltipTrigger>
                       <TooltipContent>用于白色或淡色背景的导航栏与页脚</TooltipContent>
                     </Tooltip>
                   </TooltipProvider>
                 </Label>
                 <div 
                   onClick={() => openMedia('logoStandard')}
                   className="group relative aspect-[3/1] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center transition-all hover:border-primary/50 cursor-pointer"
                 >
                   {localConfig.logoStandard ? (
                     <div className="relative w-full h-full p-4">
                       <Image src={getAssetUrl(localConfig.logoStandard)} alt="Logo" fill className="object-contain" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <Button size="sm" variant="secondary" className="rounded-full h-8 text-[10px] font-bold uppercase tracking-widest">更换图片</Button>
                       </div>
                     </div>
                   ) : (
                     <div className="text-center space-y-2 opacity-30">
                       <ImageIcon className="h-8 w-8 mx-auto" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">点击上传</p>
                     </div>
                   )}
                 </div>
              </div>

              {/* Logo Inverted */}
              <div className="space-y-4">
                 <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
                   反色 LOGO (深色/透明)
                 </Label>
                 <div 
                   onClick={() => openMedia('logoInverted')}
                   className="group relative aspect-[3/1] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center transition-all cursor-pointer"
                 >
                   {localConfig.logoInverted ? (
                     <div className="relative w-full h-full p-4">
                       <Image src={getAssetUrl(localConfig.logoInverted)} alt="Logo" fill className="object-contain" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <Button size="sm" variant="secondary" className="rounded-full h-8 text-[10px] font-bold uppercase tracking-widest">更换图片</Button>
                       </div>
                     </div>
                   ) : (
                     <div className="text-center space-y-2 opacity-30 text-white">
                       <ImageIcon className="h-8 w-8 mx-auto" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">点击上传</p>
                     </div>
                   )}
                 </div>
              </div>

              {/* Favicon */}
              <div className="space-y-4">
                 <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Favicon (站点图标)</Label>
                 <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-16 w-16 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                       {localConfig.favicon ? (
                         <Image src={getAssetUrl(localConfig.favicon)} alt="Fav" width={32} height={32} />
                       ) : (
                         <Layout className="h-6 w-6 text-slate-300" />
                       )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openMedia('favicon')}
                        className="h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest border-slate-200"
                      >
                        上传 .ico / .png
                      </Button>
                      <p className="text-[10px] text-slate-400 italic">建议尺寸: 32x32 或 48x48</p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard className="bg-primary/5 border-primary/10">
             <div className="p-8 space-y-4 text-center">
                <ShieldCheck className="h-10 w-10 text-primary mx-auto opacity-40" />
                <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">数据一致性守卫</p>
                <p className="text-[10px] text-primary/60 leading-relaxed italic">
                  签署并同步后，所有变更将立即生效于全站生产环境。建议在发布前访问原始域名进行核验。
                </p>
             </div>
          </GlassCard>

          <GlassCard className="border-none shadow-sm opacity-60 hover:opacity-100 transition-opacity">
            <div className="p-8 text-center space-y-4">
               <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-[0.1em]">
                 需要增减支持的本地化语言？
               </p>
               <Button variant="outline" className="w-full h-14 rounded-2xl border-primary/20 text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5" asChild>
                 <Link href="/admin/translations">进入翻译资产治理</Link>
               </Button>
            </div>
          </GlassCard>
        </div>
      </div>

      <MediaLibraryDialog
        open={isMediaOpen}
        onOpenChange={setIsMediaOpen}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
