"use client";
import '../../admin/admin-theme.css';

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ShieldCheck, Mail, Key, Sparkles, Fingerprint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NextImage from 'next/image';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { getAssetUrl } from '@/lib/image-utils';

// Canvas 2D 矢量流场背景 (antigravity.google 同款效果)
import FlowField from '@/components/ui/FlowField';


interface SiteConfig {
  logoStandard?: string;
  logoInverted?: string;
  primaryDomain?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { data: siteConfig } = useLocalDoc<SiteConfig>('settings', 'site');

  // 强制进入后台专属深色模式
  useEffect(() => {
    document.documentElement.classList.add('admin-interface-dark');
    return () => {
      // 如果跳转到前端页面，则移除
      if (!window.location.pathname.startsWith('/admin')) {
        document.documentElement.classList.remove('admin-interface-dark');
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        let errorMsg = "登录失败：邮箱或密码错误";
        if (result.error === "Configuration" || result.error === "AccessDenied") {
          errorMsg = "系统内部错误，请联系系统管理员";
        }
        setError(errorMsg);
        toast({ title: "认证失败", description: errorMsg, variant: "destructive" });
      } else {
        toast({ title: "登录成功", description: "欢迎回来，正在为您准备控制台..." });
        router.push("/admin");
      }
    } catch (err) {
      setError("发生意外错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black selection:bg-primary selection:text-black">
      {/* ✨ FlowField 矢量流场粒子背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#080810]" />
        <FlowField
          gridSpacing={26}
          dotRadius={1.2}
          mouseRadius={260}
          maxStretch={8}
          hueStart={210}
          hueRange={220}
          bgColor="#080810"
          dotColor="rgba(255,255,255,0.06)"
          autoAnimate={true}
          flowSpeed={0.0006}
          saturation={85}
          lightness={68}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in-95 duration-1000">
        <div className="mb-12 text-center space-y-6">
           <div className="flex justify-center mb-2">
              {siteConfig?.logoStandard ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <NextImage 
                    src={getAssetUrl(siteConfig.logoStandard)} 
                    alt="Heovose Logo" 
                    width={320} 
                    height={64} 
                    className="h-14 w-auto object-contain invert relative z-10"
                    priority
                  />
                </div>
              ) : (
                <h1 className="text-4xl font-headline font-black text-white tracking-tighter flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 rotate-3">
                    <Fingerprint className="h-7 w-7 text-black" />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-1">Infrastructure</span>
                    <span>HEOVOSE</span>
                  </div>
                </h1>
              )}
           </div>
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
             <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
             <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.3em]">Secure Gateway Protocol v4.0</p>
           </div>
        </div>

        <Card className="bg-black/40 backdrop-blur-3xl border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] rounded-[3rem] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-transparent pointer-events-none" />
          
          <CardHeader className="pt-12 pb-6 text-center space-y-2 relative">
            <div className="h-1 w-12 bg-primary/20 mx-auto rounded-full mb-4" />
            <CardTitle className="text-xl font-bold text-white uppercase tracking-[0.3em]">身份安全验证</CardTitle>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Authorized Personnel Only</p>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-10">
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold text-center animate-in slide-in-from-top-2 duration-300">
                   ACCESS DENIED: {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div className="space-y-2 group/field">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within/field:text-primary transition-colors">凭证识别 / Identifier</Label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within/field:text-primary transition-colors" />
                    <Input
                      type="email"
                      placeholder="admin@heovose.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-16 pl-14 rounded-2xl bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:bg-white/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2 group/field">
                  <div className="flex justify-between items-center ml-1">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-focus-within/field:text-primary transition-colors">访问令牌 / Access Token</Label>
                    <span className="text-[9px] text-white/20 font-bold cursor-pointer hover:text-primary transition-colors uppercase tracking-widest">Forgot?</span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within/field:text-primary transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-16 pl-14 rounded-2xl bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:bg-white/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-10 pt-4">
              <Button 
                type="submit" 
                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-3 h-5 w-5" />
                    Enter Infrastructure
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-20 text-center space-y-2">
           <div className="flex justify-center gap-4 opacity-20">
              <div className="h-px w-8 bg-white my-auto" />
              <div className="h-1 w-1 bg-white rounded-full" />
              <div className="h-px w-8 bg-white my-auto" />
           </div>
           <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.6em]">© 2026 HEOVOSE TECHNOLOGY • QUANTUM ENCRYPTED</p>
        </div>
      </div>
    </div>
  );
}
