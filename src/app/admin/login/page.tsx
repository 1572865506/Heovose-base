
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
      setError('Invalid email or password. Please ensure you have created an account in the Firebase Console.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md shadow-2xl border-border/40 overflow-hidden rounded-[2rem]">
        <div className="h-2 bg-primary" />
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center mb-2">
            <Image
              src="/image/Heovose-color.svg"
              alt="Heovose Logo"
              width={180}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-headline font-bold text-primary">Admin Control Center</CardTitle>
          <CardDescription>Enter your credentials to access the management dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 rounded-xl">
                <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@heovose.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl h-12 border-muted"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest ml-1">Password</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold">
                      <HelpCircle className="h-3 w-3" /> Need help?
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 rounded-xl shadow-2xl border-border/40">
                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-primary uppercase tracking-tight">How to Login:</p>
                      <ol className="list-decimal list-inside space-y-1 opacity-70">
                        <li>Go to <strong>Firebase Console</strong>.</li>
                        <li>In <strong>Authentication</strong>, add a new user.</li>
                        <li>In <strong>Firestore</strong>, create a collection <code>admins</code>.</li>
                        <li>Add a document with the user's <strong>UID</strong>.</li>
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
                className="rounded-xl h-12 border-muted"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-4 pb-8">
            <Button 
              type="submit" 
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
