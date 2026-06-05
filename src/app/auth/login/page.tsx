"use client";
import '../../admin/admin-theme.css';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ShieldCheck, Mail, Key, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NextImage from 'next/image';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { getAssetUrl } from '@/lib/image-utils';
import { useAdminTheme } from "@/components/admin/AdminThemeProvider";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';

const Ballpit = dynamic(() => import('@/components/ui/Ballpit'), {
  ssr: false,
});


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
  const { resolvedTheme } = useAdminTheme();
  const isDark = resolvedTheme === 'dark';

  // 动态将客户端中 NextAuth 要求的环境变量修正为浏览器当前真实的 origin，
  // 彻底避免从不同局域网 IP、本地 localhost 或生产域名访问时由于 Origin 不匹配或端上变量缺失导致的 Invalid URL 崩溃报错。
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const anyWin = window as any;
      anyWin.process = anyWin.process || {};
      anyWin.process.env = anyWin.process.env || {};
      anyWin.process.env.NEXTAUTH_URL = origin;
      anyWin.process.env.AUTH_URL = origin;
    }
  }, []);

  // 决定最终展示的 Logo 图片
  const logoSrc = isDark
    ? (siteConfig?.logoInverted || siteConfig?.logoStandard)
    : siteConfig?.logoStandard;

  // 仅在深色模式且未配置专用 logoInverted 时，才对 logoStandard 进行 CSS 翻转
  const shouldInvert = isDark && !siteConfig?.logoInverted && !!siteConfig?.logoStandard;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await loginAction({ email, password });

      if (result?.error) {
        let errorMsg = "登录失败：邮箱或密码错误";
        if (result.error === "AccessDenied") {
          errorMsg = "系统内部错误，请联系系统管理员";
        }
        setError(errorMsg);
        toast({ title: "认证失败", description: errorMsg, variant: "destructive" });
      } else {
        toast({ title: "登录成功", description: "欢迎回来，正在为您准备控制台..." });
        window.location.href = "/admin";
      }
    } catch (err: any) {
      // 允许 Next.js 的服务端正常跳转机制抛出重定向信号
      if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
        return;
      }
      console.error("Login unexpected client error:", err);
      const errDetail = String(err?.message || err || '');
      setError(`发生意外错误: ${errDetail}`);
      toast({ 
        title: "认证意外中断", 
        description: `错误详情: ${errDetail}`, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300 selection:bg-primary",
      isDark ? "bg-black selection:text-black" : "bg-slate-50 selection:text-white"
    )}>
      {/* 背景底层 */}
      <div className={cn(
        "absolute inset-0 z-0 transition-colors duration-300",
        isDark ? "bg-[#080810]" : "bg-slate-50"
      )}>
        {!isDark && (
          <>
            <div className="absolute top-[-30%] right-[-10%] w-[700px] h-[700px] rounded-full bg-primary/[0.04] blur-[160px] animate-[pulse_5s_ease-in-out_infinite]" />
            <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-[140px] animate-[pulse_6s_ease-in-out_infinite_1s]" />
          </>
        )}
        {/* Ballpit 粒子背景 */}
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-80">
          <Ballpit
            count={40}
            gravity={0.02}
            friction={0.992}
            wallBounce={0.85}
            followCursor={false}
            colors={isDark ? [0x4f46e5, 0x06b6d4, 0x10b981] : [0x3b82f6, 0xec4899, 0xf59e0b]}
            minSize={0.4}
            maxSize={0.8}
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in-95 duration-1000">
        <div className="mb-12 text-center space-y-6">
          <div className="flex justify-center mb-2">
            {logoSrc && (
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <NextImage
                  src={getAssetUrl(logoSrc)}
                  alt="Heovose Logo"
                  width={320}
                  height={64}
                  className={cn(
                    "h-14 w-auto object-contain relative z-10 transition-all duration-300",
                    shouldInvert && "invert"
                  )}
                  priority
                />
              </div>
            )}
          </div>
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md transition-all duration-300",
            isDark ? "bg-white/5 border-white/10" : "bg-slate-100/80 border-slate-200"
          )}>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className={cn(
              "text-[9px] font-bold uppercase tracking-[0.3em] transition-colors duration-300",
              isDark ? "text-white/40" : "text-slate-500"
            )}>安全网关登录</p>
          </div>
        </div>

        <Card className={cn(
          "backdrop-blur-3xl rounded-[3rem] overflow-hidden relative group transition-all duration-300",
          isDark
            ? "bg-black/40 border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
            : "bg-white border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)]"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-transparent pointer-events-none" />

          <CardHeader className="pt-12 pb-6 text-center space-y-2 relative">
            <div className="h-1 w-12 bg-primary/20 mx-auto rounded-full mb-4" />
            <CardTitle className={cn(
              "text-xl font-bold uppercase tracking-[0.3em] transition-colors duration-300",
              isDark ? "text-white" : "text-slate-800"
            )}>身份安全验证</CardTitle>
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300",
              isDark ? "text-white/30" : "text-slate-400"
            )}>Authorized Personnel Only</p>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-10">
              {error && (
                <div className={cn(
                  "p-4 rounded-2xl border text-[11px] font-bold text-center animate-in slide-in-from-top-2 duration-300 transition-colors duration-300",
                  isDark
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-red-50 border-red-100 text-red-500"
                )}>
                  ACCESS DENIED: {error}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2 group/field">
                  <Label className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em] ml-1 group-focus-within/field:text-primary transition-colors duration-300",
                    isDark ? "text-white/40" : "text-slate-500"
                  )}>凭证识别 / Identifier</Label>
                  <div className="relative">
                    <Mail className={cn(
                      "absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 group-focus-within/field:text-primary transition-colors duration-300",
                      isDark ? "text-white/20" : "text-slate-400"
                    )} />
                    <Input
                      type="email"
                      placeholder="admin@heovose.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={cn(
                        "h-16 pl-14 rounded-2xl transition-all shadow-inner text-sm font-medium",
                        isDark
                          ? "bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:bg-white/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5"
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2 group/field">
                  <div className="flex justify-between items-center ml-1">
                    <Label className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.2em] group-focus-within/field:text-primary transition-colors duration-300",
                      isDark ? "text-white/40" : "text-slate-500"
                    )}>访问令牌 / Access Token</Label>
                    <span className={cn(
                      "text-[9px] font-bold cursor-pointer hover:text-primary transition-colors uppercase tracking-widest duration-300",
                      isDark ? "text-white/20" : "text-slate-400"
                    )}>忘记密码？</span>
                  </div>
                  <div className="relative">
                    <Key className={cn(
                      "absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 group-focus-within/field:text-primary transition-colors duration-300",
                      isDark ? "text-white/20" : "text-slate-400"
                    )} />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={cn(
                        "h-16 pl-14 rounded-2xl transition-all shadow-inner text-sm font-medium",
                        isDark
                          ? "bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:bg-white/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5"
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5"
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-10 pt-4">
              <Button
                type="submit"
                className="w-[50%] mx-auto h-16 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-3 h-5 w-5" />
                    登录
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-20 text-center space-y-2">
          <div className="flex justify-center gap-4 opacity-20">
            <div className={cn("h-px w-8 my-auto transition-colors duration-300", isDark ? "bg-white" : "bg-slate-400")} />
            <div className={cn("h-1 w-1 rounded-full transition-colors duration-300", isDark ? "bg-white" : "bg-slate-500")} />
            <div className={cn("h-px w-8 my-auto transition-colors duration-300", isDark ? "bg-white" : "bg-slate-400")} />
          </div>
          <p className={cn(
            "text-[9px] font-bold uppercase tracking-[0.6em] transition-colors duration-300",
            isDark ? "text-white/20" : "text-slate-400"
          )}>© 2026</p>
        </div>
      </div>
    </div>
  );
}
