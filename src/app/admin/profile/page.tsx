
"use client";

import { useState, useEffect, useRef } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  UserCircle, 
  Save, 
  Loader2, 
  Camera, 
  ShieldCheck, 
  Mail, 
  Key,
  Info,
  ExternalLink,
  Copy
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { data: profile, mutate: mutateProfile } = useLocalDoc<any>('profile', '');

  const [formData, setFormData] = useState({
    displayName: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.name || '',
        avatarUrl: profile.image || ''
      });
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制大小在 200KB 以内
    if (file.size > 200 * 1024) {
      toast({
        variant: "destructive",
        title: "图片过大",
        description: "为了系统性能，头像图片请控制在 200KB 以内。"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setFormData(prev => ({ ...prev, avatarUrl: base64 }));
      toast({ title: "头像已预览", description: "点击下方保存按钮以永久生效。" });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.displayName,
          image: formData.avatarUrl
        }),
      });
      mutateProfile();
      setIsSaving(false);
      toast({ title: "个人资料已更新", description: "新的名称和头像将立即在全站管理界面生效。" });
    } catch (e) {
      setIsSaving(false);
      toast({ variant: "destructive", title: "更新失败" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
          <UserCircle className="h-5 w-5" /> 我的个人资料
        </h2>
        <p className="text-xs text-muted-foreground">自定义您的显示身份。头像将存储在加密的管理员配置中。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden bg-white">
            <div className="bg-primary/5 p-6 border-b border-border/20">
               <div className="flex items-center gap-6">
                 <div 
                   className="relative group cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}
                   title="点击上传本地图片"
                 >
                    <Avatar className="h-20 w-20 rounded-2xl border-2 border-white shadow-xl transition-transform group-hover:scale-95">
                      {formData.avatarUrl ? <AvatarImage src={formData.avatarUrl} className="object-cover" /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold uppercase">
                        {(formData.displayName || user?.email)?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    {/* 隐藏的上传控件 */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                    />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-lg font-bold text-primary">{formData.displayName || '未命名管理员'}</h3>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          <Badge className="bg-primary text-white border-none text-[9px] uppercase tracking-widest px-2">
                            {profile?.role === 'superadmin' ? 'Superadmin' : 'Editor'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase">{user?.email}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/30 rounded-md border border-border/40">
                             <Key className="h-2.5 w-2.5 text-muted-foreground/60" />
                             <code className="text-[8px] font-mono text-muted-foreground/80 uppercase tracking-tighter">ID: {user?.id}</code>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 opacity-40 hover:opacity-100 transition-opacity"
                            onClick={() => {
                              navigator.clipboard.writeText(user?.id || '');
                              toast({ title: "ID 已复制" });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">显示名称</Label>
                  <Input 
                    placeholder="例如: 张工 / Alex" 
                    value={formData.displayName}
                    onChange={e => setFormData({...formData, displayName: e.target.value})}
                    className="h-11 rounded-xl bg-muted/20"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-dashed space-y-4">
                 <div className="flex items-center gap-2 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">账号权限状态</span>
                 </div>
                 <div className="p-4 bg-muted/20 rounded-xl border border-border/40 text-[11px] leading-relaxed text-muted-foreground">
                    您当前具有 <strong>{profile?.role === 'superadmin' ? '超级管理员' : '内容编辑员'}</strong> 权限。
                    {profile?.role === 'superadmin' ? ' 您可以管理全站数据及其他管理员账号。' : ' 您可以管理产品、分类及翻译内容，但无法修改系统设置。'}
                 </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-6 flex justify-end">
               <Button onClick={handleSave} disabled={isSaving} className="rounded-xl h-11 px-8 font-bold uppercase tracking-widest text-xs gap-2 shadow-lg">
                 {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                 保存个人设置
               </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border-border/40 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <Info className="h-4 w-4" /> 头像上传规则
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
               <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <Camera className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold">本地直传</p>
                     <p className="text-[9px] text-muted-foreground leading-relaxed">点击头像框即可从本地选择图片，无需再输入复杂的 URL。</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold">大小限制: 200KB</p>
                     <p className="text-[9px] text-muted-foreground leading-relaxed">为了保证后台加载速度，头像会自动压缩，请确保文件小于 200KB。</p>
                  </div>
               </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-primary rounded-2xl text-white space-y-4 shadow-xl">
             <h4 className="font-bold text-sm uppercase tracking-tight">需要更高权限？</h4>
             <p className="text-[10px] opacity-60 leading-relaxed italic">
               如果您无法访问特定模块，请联系系统管理员获取超级授权。
             </p>
             <Button variant="outline" size="sm" className="w-full rounded-xl bg-white/10 border-white/20 text-white text-[10px] uppercase font-bold gap-2">
               联系超级管理员 <ExternalLink className="h-3 w-3" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
