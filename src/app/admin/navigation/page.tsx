
"use client";

import { useEffect, useState } from 'react';
import { 
  Compass, 
  Save, 
  RefreshCw, 
  Layers, 
  LayoutGrid, 
  Sparkles,
  Download,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useToast } from '@/hooks/use-toast';
import { getAssetUrl } from '@/lib/image-utils';
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';

export default function NavigationSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { data: remoteSettings, isLoading, mutate: mutateSettings } = useLocalDoc<any>('settings', 'navigation');
  const [settings, setSettings] = useState<any>({
    navbarMaterial: 'level-02',
    showBorder: true,
    showShadow: true,
    megaMenuColumns: 2,
    megaMenuGap: 12,
    featuredText: '立即下载手册',
    featuredDownloadUrl: '/files/catalog_2026.pdf',
    featuredCoverUrl: '/image/catalog-placeholder.png'
  });

  useEffect(() => {
    if (remoteSettings && Object.keys(remoteSettings).length > 0) {
      setSettings(remoteSettings);
    }
  }, [remoteSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        if (res.status === 409) {
          const errData = await res.json();
          throw new Error(errData.message || "配置已被他人修改，请刷新页面加载最新配置后再重试。");
        }
        throw new Error("保存失败，请检查网络或重试。");
      }
      
      const savedData = await res.json();
      setSettings(savedData);
      
      mutateSettings();
      toast({
        title: "保存成功",
        description: "导航设置已全局更新。",
      });
    } catch (error: any) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-headline font-bold text-foreground flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Compass className="h-5 w-5" />
            </div>
            导航设置
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] pl-14">Management / Content / Navigation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="h-12 rounded-2xl px-8 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? '正在保存...' : '保存全局配置'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="navbar" className="w-full">
        <TabsList className="bg-card/50 backdrop-blur-xl border border-border/40 p-1 rounded-2xl h-14 mb-8">
          <TabsTrigger value="navbar" className="rounded-xl px-8 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] uppercase tracking-widest transition-all">
            <Layers className="mr-2 h-4 w-4" /> 顶栏物理材质
          </TabsTrigger>
          <TabsTrigger value="mega-menu" className="rounded-xl px-8 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] uppercase tracking-widest transition-all">
            <LayoutGrid className="mr-2 h-4 w-4" /> 巨型菜单配置
          </TabsTrigger>
          <TabsTrigger value="featured" className="rounded-xl px-8 h-12 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] uppercase tracking-widest transition-all">
            <Sparkles className="mr-2 h-4 w-4" /> 主推板块设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="navbar" className="space-y-6 outline-none">
          <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden shadow-sm">
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-lg font-headline font-bold text-primary flex items-center gap-3">
                <Layers className="h-5 w-5" /> 材质与深度控制 (Material & Depth)
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">定义顶栏在激活状态下的物理属性</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">材质预设 (Preset)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all cursor-pointer",
                          settings.navbarMaterial === 'level-02' ? "border-primary bg-primary/5" : "border-border/40 bg-muted/20 opacity-50"
                        )}
                        onClick={() => updateSetting('navbarMaterial', 'level-02')}
                      >
                        <p className="text-[10px] font-bold text-primary uppercase">Level 02: Frosted</p>
                        <p className="text-[9px] text-muted-foreground mt-1">12px Blur / 60% Opacity</p>
                      </div>
                      <div 
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all cursor-pointer",
                          settings.navbarMaterial === 'level-03' ? "border-primary bg-primary/5" : "border-border/40 bg-muted/20 opacity-50"
                        )}
                        onClick={() => updateSetting('navbarMaterial', 'level-03')}
                      >
                        <p className="text-[10px] font-bold text-foreground uppercase">Level 03: Deep</p>
                        <p className="text-[9px] text-muted-foreground mt-1">40px Blur / 80% Opacity</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold uppercase tracking-tight">显示底部边框</Label>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Border Bottom on Active</p>
                      </div>
                      <Switch 
                        checked={settings.showBorder} 
                        onCheckedChange={(checked) => updateSetting('showBorder', checked)} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold uppercase tracking-tight">启用阴影投影</Label>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Shadow-sm on Scroll</p>
                      </div>
                      <Switch 
                        checked={settings.showShadow} 
                        onCheckedChange={(checked) => updateSetting('showShadow', checked)} 
                      />
                    </div>
                  </div>
                </div>

                <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-border/40 group">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center" />
                   <div className={cn(
                     "absolute top-0 left-0 right-0 h-16 border-b flex items-center px-6 justify-between",
                     settings.navbarMaterial === 'level-03' ? "glass-deep border-white/10" : "glass-frosted border-white/20",
                     !settings.showBorder && "!border-transparent"
                   )}>
                      <div className="h-4 w-24 bg-white/40 rounded-full" />
                      <div className="flex gap-4">
                         <div className="h-3 w-10 bg-white/40 rounded-full" />
                         <div className="h-3 w-10 bg-white/40 rounded-full" />
                         <div className="h-3 w-10 bg-white/40 rounded-full" />
                      </div>
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl text-[9px] font-bold text-white uppercase tracking-[0.2em]">预览材质 / Material Preview</div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mega-menu" className="space-y-6 outline-none">
          <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden shadow-sm">
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-lg font-headline font-bold text-primary flex items-center gap-3">
                <LayoutGrid className="h-5 w-5" /> 巨型菜单排版 (Architecture)
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">管理二级菜单的列数、间距与布局比例</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
               <div className="p-8 bg-primary/[0.02] rounded-3xl border border-primary/5 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">网格列数 (Columns)</Label>
                     <Input 
                       type="number" 
                       value={settings.megaMenuColumns} 
                       onChange={(e) => updateSetting('megaMenuColumns', parseInt(e.target.value))}
                       className="h-12 rounded-xl bg-card border-border/40 font-bold text-foreground" 
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">水平间距 (Gap X)</Label>
                     <Input 
                       type="number" 
                       value={settings.megaMenuGap} 
                       onChange={(e) => updateSetting('megaMenuGap', parseInt(e.target.value))}
                       className="h-12 rounded-xl bg-card border-border/40 font-bold text-foreground" 
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">比例分配 (Ratio)</Label>
                     <div className="h-12 rounded-xl bg-card border border-border/40 flex items-center px-4 font-bold text-xs text-primary">8 : 4 (Standard)</div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured" className="space-y-6 outline-none">
          <Card className="rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden shadow-sm">
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-lg font-headline font-bold text-primary flex items-center gap-3">
                <Sparkles className="h-5 w-5" /> 主推板块设置 (Featured Promo)
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-60">配置二级菜单右侧的产品推广图册与下载链接</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">推广封面图 (Cover Image)</Label>
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => setIsPickerOpen(true)}
                    >
                       <div className="aspect-[4/3] rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 flex flex-col items-center justify-center gap-4 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all overflow-hidden relative">
                          {settings.featuredCoverUrl ? (
                            <>
                              <Image 
                                src={getAssetUrl(settings.featuredCoverUrl)} 
                                alt="Selected" 
                                fill 
                                className="object-cover opacity-40 group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20 text-white">
                                <ImageIcon className="h-8 w-8" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">点击更换封面图</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="h-16 w-16 rounded-2xl bg-card shadow-sm flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                                <ImageIcon className="h-8 w-8" />
                              </div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">点击上传封面图</p>
                            </>
                          )}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">下载按钮文本 (Button Text)</Label>
                      <Input 
                        value={settings.featuredText} 
                        onChange={(e) => updateSetting('featuredText', e.target.value)}
                        className="h-12 rounded-xl border-border/40 font-bold bg-card text-foreground" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">手册链接 (Download URL)</Label>
                      <div className="relative">
                        <Input 
                          value={settings.featuredDownloadUrl} 
                          onChange={(e) => updateSetting('featuredDownloadUrl', e.target.value)}
                          className="h-12 rounded-xl border-border/40 font-bold pl-12 bg-card text-foreground" 
                        />
                        <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">实时预览 (Live Preview)</Label>
                  <div className="lg:w-80 mx-auto">
                    <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/5 h-full flex flex-col group/card relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
                      
                      <div className="relative z-10 space-y-6 flex flex-col h-full">
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/10 shadow-sm bg-muted/20">
                          <Image 
                            src={getAssetUrl(settings.featuredCoverUrl || "/image/catalog-placeholder.png")} 
                            alt="Preview" 
                            fill 
                            className="object-contain p-4"
                          />
                        </div>
                        
                        <div className="mt-auto">
                          <Button className="w-full h-11 px-6 rounded-2xl bg-primary/5 text-primary border-none font-bold text-[10px] uppercase gap-3 shadow-none pointer-events-none">
                            <Download className="h-3.5 w-3.5 opacity-40" /> 
                            <span>{settings.featuredText}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MediaLibraryDialog 
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={(assets) => {
          if (assets.length > 0) {
            updateSetting('featuredCoverUrl', assets[0].url);
          }
        }}
        selectionMode="single"
        title="选择推荐板块封面"
        subtitle="选择一张精美的产品画册或推广封面图"
      />
    </div>
  );
}
