
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
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
  XCircle
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: 'superadmin' | 'editor';
  status: 'active' | 'disabled';
}

export default function AdminUsersPage() {
  const firestore = useFirestore();
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

  const adminsQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'admins') : null, 
    [firestore]
  );
  const { data: admins, isLoading } = useCollection<AdminUser>(adminsQuery);

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
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      role: user.role,
      status: user.status || 'active'
    });
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!firestore || !formData.uid || !formData.email) {
      toast({ variant: "destructive", title: "请填写 UID 和 邮箱" });
      return;
    }

    setDocumentNonBlocking(doc(firestore, 'admins', formData.uid), {
      ...formData,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setIsDialogOpen(false);
    resetForm();
    toast({ title: "管理员授权已更新" });
  };

  const toggleStatus = (user: AdminUser) => {
    if (!firestore) return;
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    setDocumentNonBlocking(doc(firestore, 'admins', user.uid), {
      status: newStatus,
      updatedAt: serverTimestamp()
    }, { merge: true });
    toast({ title: newStatus === 'active' ? "账号已激活" : "账号已封禁" });
  };

  const filteredAdmins = admins?.filter(a => 
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.uid.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <Users className="h-5 w-5" /> 管理员权限中心
          </h2>
          <p className="text-xs text-muted-foreground">管理全站访问权限，分配管理角色及账号状态。</p>
        </div>
        
        <Button onClick={handleOpenDialog} className="rounded-xl h-10 px-5 font-bold uppercase text-xs gap-2 shadow-md">
          <UserPlus className="h-4 w-4" /> 授权新管理员
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="按名称、邮箱或 UID 检索..." 
            className="pl-10 border-none bg-muted/30 h-10 text-xs rounded-xl focus-visible:ring-0" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-16 pl-6">用户</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">身份信息</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">所属角色</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">账号状态</TableHead>
              <TableHead className="w-32 text-right pr-6 font-bold uppercase text-[10px] tracking-widest">管理操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
            ) : filteredAdmins?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-40 text-center text-xs text-muted-foreground italic uppercase">未找到匹配的管理员</TableCell></TableRow>
            ) : filteredAdmins?.map((admin) => (
              <TableRow key={admin.uid} className="group hover:bg-muted/5 transition-colors">
                <TableCell className="pl-6">
                  <Avatar className="h-10 w-10 border border-border/40">
                    <AvatarImage src={admin.avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                      {(admin.displayName || admin.email)[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-xs text-primary">{admin.displayName || '未命名'}</span>
                    <span className="text-[10px] text-muted-foreground">{admin.email}</span>
                    <code className="text-[8px] font-mono opacity-30 mt-1 uppercase">UID: {admin.uid}</code>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "text-[8px] font-bold uppercase tracking-tighter h-5 px-1.5 border-none",
                    admin.role === 'superadmin' ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"
                  )}>
                    {admin.role === 'superadmin' ? <ShieldCheck className="h-2.5 w-2.5 mr-1" /> : null}
                    {admin.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {admin.status === 'active' ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-[10px] font-bold uppercase">
                        <CheckCircle2 className="h-3 w-3" /> 正常
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-destructive text-[10px] font-bold uppercase">
                        <XCircle className="h-3 w-3" /> 已禁用
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" onClick={() => handleStartEdit(admin)} title="修改角色"><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className={cn("h-8 w-8", admin.status === 'active' ? "text-destructive hover:bg-destructive/5" : "text-green-600 hover:bg-green-50")}
                      onClick={() => toggleStatus(admin)}
                      title={admin.status === 'active' ? "禁用账号" : "激活账号"}
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/40 hover:text-destructive" onClick={() => confirm('确定移除该管理员授权吗？') && deleteDocumentNonBlocking(doc(firestore!, 'admins', admin.uid))} title="彻底移除"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl max-w-md p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                 <ShieldCheck className="h-5 w-5" />
                 <DialogTitle className="text-lg font-bold uppercase tracking-widest">{editingUser ? '编辑管理员权限' : '新增管理员授权'}</DialogTitle>
              </div>
              <DialogDescription className="text-white/60 text-xs">通过 Firebase UID 手动授权后台管理权限。</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 bg-white">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-primary">唯一 UID (Firebase UID)</Label>
                <Input 
                  disabled={!!editingUser} 
                  placeholder="在此粘贴用户 UID..." 
                  value={formData.uid}
                  onChange={e => setFormData({...formData, uid: e.target.value})}
                  className="h-11 rounded-xl bg-muted/20 font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-primary">电子邮箱</Label>
                <Input 
                  placeholder="admin@heovose.com" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="h-11 rounded-xl bg-muted/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-primary">分配角色</Label>
                <Select value={formData.role} onValueChange={(v:any) => setFormData({...formData, role: v})}>
                   <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                   <SelectContent className="rounded-xl">
                      <SelectItem value="editor" className="text-xs">Editor (编辑员)</SelectItem>
                      <SelectItem value="superadmin" className="text-xs font-bold text-orange-600">Superadmin (超管)</SelectItem>
                   </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-primary">账号状态</Label>
                <Select value={formData.status} onValueChange={(v:any) => setFormData({...formData, status: v})}>
                   <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                   <SelectContent className="rounded-xl">
                      <SelectItem value="active" className="text-xs text-green-600 font-bold">已激活</SelectItem>
                      <SelectItem value="disabled" className="text-xs text-destructive">已禁用</SelectItem>
                   </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/10 p-4 border-t gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-11 flex-1 text-xs font-bold uppercase">取消</Button>
            <Button onClick={handleSave} className="rounded-xl h-11 flex-1 text-xs font-bold uppercase shadow-lg">确认授权</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
