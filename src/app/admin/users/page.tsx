"use client";

import { useState } from 'react';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Users,
  ShieldCheck,
  UserPlus,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  Key
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface AdminUser {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: 'superadmin' | 'editor';
  status: 'active' | 'disabled';
}

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden", className)}>
    {children}
  </div>
);

export default function AdminUsersPage() {
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState({
    uid: '',
    email: '',
    displayName: '',
    role: 'editor' as 'superadmin' | 'editor',
    status: 'active' as 'active' | 'disabled'
  });

  const { data: admins, isLoading, mutate: mutateAdmins } = useLocalCollection<AdminUser>('users');

  const resetForm = () => {
    setFormData({ uid: '', email: '', displayName: '', role: 'editor', status: 'active' });
    setEditingUser(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleStartEdit = (user: AdminUser) => {
    setFormData({
      uid: user.id,
      email: user.email || '',
      displayName: user.displayName || '',
      role: user.role,
      status: user.status || 'active'
    });
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.email) {
      toast({ variant: "destructive", title: "请填写邮箱" });
      return;
    }

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.displayName,
          role: formData.role,
          status: formData.status
        }),
      });

      setIsDialogOpen(false);
      resetForm();
      mutateAdmins();
      toast({ title: editingUser ? "管理员授权已更新" : "新管理员已创建" });
    } catch (e) {
      toast({ variant: "destructive", title: "保存失败" });
    }
  };

  const toggleStatus = async (user: AdminUser) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      mutateAdmins();
      toast({ title: newStatus === 'active' ? "账号已激活" : "账号已封禁" });
    } catch (e) {
      toast({ variant: "destructive", title: "状态更新失败" });
    }
  };

  const filteredAdmins = admins?.filter(a => {
    const s = searchQuery.toLowerCase();
    const emailMatch = (a.email || '').toLowerCase().includes(s);
    const nameMatch = (a.displayName || a.name || '').toLowerCase().includes(s);
    const idMatch = (a.id || '').includes(searchQuery);
    return emailMatch || nameMatch || idMatch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative">
      {/* Background Aurora Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] bg-accent/10 blur-[100px] rounded-full -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-headline font-bold text-slate-900">权限治理中心</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-2xl pl-1">管理全站访问权限矩阵，分配多级管理角色、账号状态及安全审计记录。</p>
        </div>
        
        <Button onClick={handleOpenDialog} className="rounded-full h-12 px-8 font-bold uppercase tracking-widest text-xs gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <UserPlus className="h-5 w-5" /> 授权新成员
        </Button>
      </div>

      <GlassCard className="border-primary/20 bg-primary/5 shadow-none">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Info className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">成员准入协议 (Dual-Step Verification)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 p-6 rounded-2xl border border-primary/10 space-y-3 shadow-sm group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">1</div>
                    <span className="text-sm font-bold text-slate-900">填写成员信息</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    在此处输入新成员的邮箱和姓名。系统将为其预留权限席位。
                  </p>
                </div>
                <div className="bg-white/80 p-6 rounded-2xl border border-primary/10 space-y-3 shadow-sm group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">2</div>
                    <span className="text-sm font-bold text-slate-900">成员激活登录</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    新成员使用指定邮箱登录系统后，将自动获得预设的管理权限。
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64 shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-primary/10 pt-6 md:pt-0 md:pl-12">
               <div className="space-y-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 text-slate-900">Governance Stats</div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-slate-500">成员总数</span>
                      <span className="text-4xl font-headline font-bold text-primary tabular-nums tracking-tighter">{admins?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-slate-500">超管席位</span>
                      <span className="text-2xl font-headline font-bold text-orange-600 tabular-nums tracking-tighter">{admins?.filter(a => a.role === 'superadmin').length || 0}</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-2 rounded-2xl border border-white/40 shadow-xl max-w-2xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="通过 姓名、邮箱 或 ID 实时检索成员..." 
            className="pl-12 border-none bg-slate-50/50 h-12 text-sm rounded-xl focus-visible:ring-0 font-medium placeholder:text-slate-400" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <GlassCard>
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20 pl-8 py-5">Profile</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[0.2em] text-slate-400">身份凭证信息</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[0.2em] text-slate-400">权限等级</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-[0.2em] text-slate-400">生命周期状态</TableHead>
              <TableHead className="text-right pr-8 font-bold uppercase text-[10px] tracking-[0.2em] text-slate-400">管理指令</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="h-60 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-10" /></TableCell></TableRow>
            ) : filteredAdmins?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-60 text-center text-xs text-slate-400 italic uppercase font-bold tracking-widest">NO MATCHING ADMINS FOUND</TableCell></TableRow>
            ) : filteredAdmins?.map((admin: any) => (
              <TableRow key={admin.id} className="group hover:bg-slate-50/80 transition-all duration-300 border-slate-50">
                <TableCell className="pl-8 py-6">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-xl">
                    <AvatarImage src={admin.avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      {(admin.displayName || admin.email || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-sm text-slate-900">{admin.name || 'Unnamed Protocol Entity'}</span>
                    <span className="text-xs text-slate-400 font-medium">{admin.email}</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-[9px] font-mono opacity-30 uppercase bg-slate-100 px-2 py-0.5 rounded-md">ID: {admin.id.substring(0, 12)}...</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg opacity-0 group-hover:opacity-60 hover:bg-primary/10 hover:text-primary transition-all" onClick={() => { navigator.clipboard.writeText(admin.id); toast({ title: "ID 已复制至剪贴板" }); }}><Key className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <Badge variant="outline" className={cn(
                    "text-[9px] font-bold uppercase tracking-wider h-6 px-3 border-none rounded-full",
                    admin.role === 'superadmin' ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "bg-blue-500 text-white shadow-lg shadow-blue-100"
                  )}>
                    {admin.role === 'superadmin' ? <ShieldCheck className="h-3 w-3 mr-1.5" /> : <Users className="h-3 w-3 mr-1.5" />}
                    {admin.role}
                  </Badge>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2">
                    {admin.status === 'active' ? (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                        <XCircle className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Disabled</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="pr-8 text-right py-6">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all" onClick={() => handleStartEdit(admin)} title="修改权限角色"><Edit2 className="h-4 w-4" /></Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-10 w-10 rounded-full transition-all", admin.status === 'active' ? "text-red-500 hover:bg-red-50" : "text-green-600 hover:bg-green-50")}
                      onClick={() => toggleStatus(admin)}
                      title={admin.status === 'active' ? "禁用该账户权限" : "恢复账户访问权限"}
                    >
                      <ShieldAlert className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all" onClick={async () => { if(confirm('彻底移除该管理员的系统授权吗？')) { await fetch(`/api/users/${admin.id}`, { method: 'DELETE' }); mutateAdmins(); toast({ title: "授权已移除" }); } }} title="彻底移除授权项"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-md p-0 overflow-hidden border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-white/90 backdrop-blur-2xl">
          <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full translate-x-24 -translate-y-24" />
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                 <ShieldCheck className="h-6 w-6 text-primary" />
                 <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-wider">{editingUser ? '权限级别修订' : '初始化成员授权'}</DialogTitle>
              </div>
              <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Authorization of a new administrative security entity.</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-8 bg-transparent">
            <div className="space-y-6">
              {!editingUser && (
                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1 flex items-center justify-between">
                    展示名称
                  </Label>
                  <Input 
                    placeholder="张工 / Alex" 
                    value={formData.displayName}
                    onChange={e => setFormData({...formData, displayName: e.target.value})}
                    className="h-14 rounded-2xl bg-slate-50 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 shadow-inner"
                  />
                </div>
              )}
              <div className="space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1 flex items-center justify-between">
                  电子邮箱地址
                  <span className="text-[9px] text-primary/60 lowercase font-medium italic">required</span>
                </Label>
                <Input 
                  placeholder="admin@heovose.com" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="h-14 rounded-2xl bg-slate-50 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-dashed border-slate-200">
              <div className="space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">分配治理角色</Label>
                <Select value={formData.role} onValueChange={(v:any) => setFormData({...formData, role: v})}>
                   <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      <SelectItem value="editor" className="rounded-xl h-10 text-xs font-medium my-1">Editor (业务编辑员)</SelectItem>
                      <SelectItem value="superadmin" className="rounded-xl h-10 text-xs font-bold text-orange-600 my-1">Superadmin (全局超管)</SelectItem>
                   </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">赋予准入状态</Label>
                <Select value={formData.status} onValueChange={(v:any) => setFormData({...formData, status: v})}>
                   <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      <SelectItem value="active" className="rounded-xl h-10 text-xs text-green-600 font-bold my-1">已激活 (Grant)</SelectItem>
                      <SelectItem value="disabled" className="rounded-xl h-10 text-xs text-red-500 font-bold my-1">锁定 (Revoke)</SelectItem>
                   </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-slate-50/50 p-10 border-t border-slate-100 gap-4">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-14 rounded-2xl flex-1 text-xs font-bold uppercase tracking-widest text-slate-400">中止授权</Button>
            <Button onClick={handleSave} className="h-14 rounded-2xl flex-1 text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20">确认并签署契约</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}