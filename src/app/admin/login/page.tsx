
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, HelpCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (err: any) {
      console.error(err);
      setError('登录失败。请检查邮箱和密码是否正确，并确保在 Firebase Console 中已创建该账号。');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md shadow-2xl border-border/40 overflow-hidden rounded-2xl">
        <div className="h-1.5 bg-primary" />
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <Image
              src="/image/Heovose-color.svg"
              alt="Heovose Logo"
              width={160}
              height={32}
              className="h-8 w-auto"
            />
          </div>
          <CardTitle className="text-xl font-headline font-bold text-primary">后台管理中心</CardTitle>
          <CardDescription className="text-xs">请输入您的凭据以访问管理仪表盘。</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/10 rounded-xl">
                <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-60">电子邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@heovose.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl h-11 border-muted bg-muted/20"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-60">密码</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold">
                      <HelpCircle className="h-3 w-3" /> 需要帮助？
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 rounded-xl shadow-2xl border-border/40">
                    <div className="space-y-2 text-[10px] leading-relaxed">
                      <p className="font-bold text-primary uppercase tracking-tight">如何登录：</p>
                      <ol className="list-decimal list-inside space-y-1 opacity-70">
                        <li>访问 <strong>Firebase Console</strong></li>
                        <li>在 <strong>Authentication</strong> 添加用户</li>
                        <li>在 <strong>Firestore</strong> 创建 <code>admins</code> 集合</li>
                        <li>添加 ID 为用户 <strong>UID</strong> 的文档</li>
                      </ol>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl h-11 border-muted bg-muted/20"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-4 pb-8">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              立即登录
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
