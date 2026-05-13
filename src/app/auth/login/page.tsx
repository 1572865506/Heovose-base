"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ShieldCheck, Mail, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NextImage from 'next/image';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { getAssetUrl } from '@/lib/image-utils';

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* 动态浅色背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 animate-pulse duration-[8s]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse duration-[12s]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-700">
        <div className="mb-12 text-center space-y-4">
           <div className="flex justify-center mb-2">
              {siteConfig?.logoStandard ? (
                <NextImage 
                  src={getAssetUrl(siteConfig.logoStandard)} 
                  alt="Heovose Logo" 
                  width={280} 
                  height={56} 
                  className="h-12 w-auto object-contain"
                  priority
                />
              ) : (
                <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">HEOVOSE <span className="text-primary">ELEVATE</span></h1>
              )}
           </div>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">Global Admin Infrastructure</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-2xl border-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden">
          <CardHeader className="pt-10 pb-6 text-center space-y-2">
            <CardTitle className="text-xl font-bold text-slate-900 uppercase tracking-widest">后台身份验证</CardTitle>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Authentication Protocol required</p>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-8">
              {error && (
                <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-destructive text-[11px] font-bold text-center animate-shake">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2 group">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-primary transition-colors">电子邮箱 / Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="admin@heovose.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/50 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <div className="flex justify-between items-center ml-1">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-primary transition-colors">登录密码 / Password</Label>
                    <span className="text-[9px] text-slate-400 font-bold cursor-pointer hover:text-primary transition-colors uppercase tracking-widest">忘记密码?</span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary/50 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-8 pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    正在同步凭证...
                  </>
                ) : (
                  <>
                    <Lock className="mr-3 h-4 w-4" />
                    安全进入控制台
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-12 text-center">
           <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.4em]">© 2026 HEOVOSE TECHNOLOGY • ALL RIGHTS RESERVED</p>
        </div>
      </div>
    </div>
  );
}
