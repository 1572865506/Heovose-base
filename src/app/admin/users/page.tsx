"use client";

import { useState, useMemo } from 'react';
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  Search,
  MoreVertical,
  CheckCircle2,
  Lock,
  Eye,
  Loader2,
  Trash2,
  Info,
  Key,
  Package,
  Zap,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// AI 渐变定义
const AiGradientDef = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="role-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stopColor="#06B6D4" offset="0%" />
        <stop stopColor="#4F46E5" offset="100%" />
      </linearGradient>
    </defs>
  </svg>
);

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  permissions: string[];
  createdAt: string;
}

const PERMISSION_GROUPS = [
  { 
    id: 'products', 
    label: '产品与素材', 
    description: '管理产品目录、分类架构及媒体素材中心',
    items: ['products_view', 'products_edit', 'categories_manage', 'gallery_manage']
  },
  { 
    id: 'content', 
    label: '页面内容发布', 
    description: '管理首页排版、全球网点、成功案例及制造流程',
    items: ['home_config', 'map_manage', 'cases_manage', 'steps_manage', 'nav_manage']
  },
  { 
    id: 'system', 
    label: '系统配置中枢', 
    description: '管理多语言词条、AI 模型设置及通用系统参数',
    items: ['translations_manage', 'ai_config', 'settings_manage']
  },
  { 
    id: 'business', 
    label: '业务线索与增长', 
    description: '查看客户询盘详情、处理意向线索',
    items: ['inquiries_view', 'inquiries_reply', 'inquiries_manage']
  },
  { 
    id: 'analytics', 
    label: '数据洞察与分析', 
    description: '查看访客统计、热力图分析及转化漏斗',
    items: ['analytics_view', 'heatmap_view']
  }
];

export default function UserManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'editor' });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const { data: users, isLoading, mutate } = useLocalCollection<AdminUser>('admin/users');

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => 
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleEditClick = (user: AdminUser) => {
    if (user.role === 'superadmin') {
      toast({ variant: "destructive", title: "禁止操作", description: "超级管理员账号无法被修改。" });
      return;
    }
    setEditingUser(user);
    setSelectedRole(user.role);
    setSelectedPermissions(Array.isArray(user.permissions) ? user.permissions : []);
  };

  const handleSavePermissions = async () => {
    if (!editingUser) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          permissions: selectedPermissions
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '更新失败');
      }

      toast({ title: "权限更新成功", description: `已成功同步 ${editingUser.email} 的权限位。` });
      mutate();
      setEditingUser(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "保存失败", description: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast({ variant: "destructive", title: "信息不全", description: "邮箱和密码是必填项。" });
      return;
    }
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '创建失败');
      }
      toast({ title: "用户创建成功", description: `${newUser.email} 已加入团队。` });
      mutate();
      setIsCreateDialogOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'editor' });
    } catch (e: any) {
      toast({ variant: "destructive", title: "创建失败", description: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.role === 'superadmin') return;
    if (!confirm(`确定要删除用户 ${user.email} 吗？此操作不可撤销。`)) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '删除失败');
      }
      toast({ title: "用户已删除", description: "账号已从系统中移除。" });
      mutate();
    } catch (e: any) {
      toast({ variant: "destructive", title: "删除失败", description: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const toggleGroup = (groupItems: string[]) => {
    const allIn = groupItems.every(p => selectedPermissions.includes(p));
    if (allIn) {
      setSelectedPermissions(prev => prev.filter(p => !groupItems.includes(p)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...groupItems])]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <AiGradientDef />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-headline font-bold text-foreground">成员与权限管理</h2>
          </div>
          <p className="text-sm text-muted-foreground font-medium max-w-2xl pl-1">配置团队成员访问权限，确保业务数据安全。支持基于角色的权限包 (RBAC) 与原子化权限微调。</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              placeholder="搜索成员姓名或邮箱..." 
              className="pl-11 w-80 h-12 rounded-2xl border-border/40 bg-card/50 backdrop-blur-sm focus:ring-primary/20 text-foreground"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-full h-12 px-8 font-bold uppercase tracking-widest text-xs gap-2 shadow-xl shadow-primary/20 bg-foreground text-background hover:bg-foreground/90"
          >
            <UserPlus className="h-5 w-5" /> 邀请新成员
          </Button>
        </div>
      </div>

      <div className="bg-card/70 backdrop-blur-xl rounded-[2.5rem] border border-border/40 shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow className="hover:bg-transparent border-border/10">
              <TableHead className="pl-8 py-5 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/60">成员信息 / Profile</TableHead>
              <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/60">系统角色 / Role</TableHead>
              <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/60">活跃权限位 / Permissions</TableHead>
              <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/60 text-right pr-8">操作 / Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="h-64 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary/20" /></TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-40 text-center text-muted-foreground/60 italic font-medium">未找到符合条件的成员</TableCell></TableRow>
            ) : filteredUsers.map((user) => (
              <TableRow key={user.id} className="group hover:bg-muted/10 transition-all border-border/10">
                <TableCell className="pl-8 py-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 rounded-2xl border-2 border-background shadow-md ring-1 ring-border/20">
                      {user.image ? <AvatarImage src={user.image} className="object-cover" /> : null}
                      <AvatarFallback className="bg-primary/5 text-primary font-bold uppercase text-xs">{user.email[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{user.name || '未命名'}</span>
                      <span className="text-xs text-muted-foreground/60 font-medium">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn(
                    "rounded-full px-4 py-1 font-bold text-[10px] tracking-widest border-none shadow-sm uppercase",
                    user.role === 'superadmin' 
                      ? "bg-foreground text-background" 
                      : "bg-primary/10 text-primary"
                  )}>
                    {user.role === 'superadmin' ? 'Super Admin' : 'Editor'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 max-w-md">
                    {user.role === 'superadmin' ? (
                      <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-500 text-[9px] font-bold uppercase tracking-tighter">Full System Access</Badge>
                    ) : user.permissions?.length > 0 ? (
                      user.permissions.slice(0, 3).map(p => (
                        <Badge key={p} variant="outline" className="bg-muted/20 border-border/40 text-muted-foreground text-[9px] font-bold uppercase tracking-tighter px-2">
                          {p.replace('_', ' ')}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground/20 font-bold uppercase tracking-widest italic">None Assigned</span>
                    )}
                    {user.role !== 'superadmin' && user.permissions?.length > 3 && (
                      <Badge variant="outline" className="bg-muted/20 border-border/40 text-muted-foreground/60 text-[9px] font-bold px-2">+{user.permissions.length - 3}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {user.role !== 'superadmin' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditClick(user)}
                          className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteUser(user)}
                          className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {user.role === 'superadmin' && (
                      <div className="h-10 w-10 flex items-center justify-center text-muted-foreground/20">
                        <Lock className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 权限编辑 Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-[2.5rem] bg-card">
          <div className="bg-primary p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full translate-x-20 -translate-y-20" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-wider flex items-center gap-3">
                <ShieldCheck className="h-7 w-7" /> 权限配置中心
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/70 text-xs font-medium uppercase tracking-widest mt-2 flex items-center gap-2">
                RBAC PERMISSION SUITE • <span className="text-white font-bold">{editingUser?.email}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-minimal">
            {/* 角色选择 */}
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">系统角色定义 (Core Role)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setSelectedRole('superadmin')}
                  className={cn(
                    "p-5 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col gap-2",
                    selectedRole === 'superadmin' ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-border/10 hover:border-border/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck className={cn("h-6 w-6", selectedRole === 'superadmin' ? "text-primary" : "text-muted-foreground/20")} />
                    {selectedRole === 'superadmin' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                  <span className="font-bold text-foreground">Super Admin</span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">拥有系统最高权限，包括所有业务模块和成员管理。</p>
                </div>

                <div 
                  onClick={() => setSelectedRole('editor')}
                  className={cn(
                    "p-5 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col gap-2",
                    selectedRole === 'editor' ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-border/10 hover:border-border/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Lock className={cn("h-6 w-6", selectedRole === 'editor' ? "text-primary" : "text-muted-foreground/20")} />
                    {selectedRole === 'editor' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                  <span className="font-bold text-foreground">General Editor</span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">受限角色，仅能访问被显式授权的业务模块。</p>
                </div>
              </div>
            </div>

            {selectedRole === 'editor' && (
              <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">细分权限分配 (Granular Permissions)</Label>
                <div className="space-y-4">
                  {PERMISSION_GROUPS.map(group => (
                    <div key={group.id} className="p-6 bg-muted/20 rounded-3xl border border-border/10 space-y-4 transition-all hover:bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-background shadow-sm flex items-center justify-center">
                            {group.id === 'products' && <Package className="h-5 w-5 text-blue-500" />}
                            {group.id === 'content' && <Eye className="h-5 w-5 text-emerald-500" />}
                            {group.id === 'system' && <Key className="h-5 w-5 text-purple-500" />}
                            {group.id === 'business' && <Zap className="h-5 w-5 text-orange-500" />}
                            {group.id === 'analytics' && <BarChart3 className="h-5 w-5 text-pink-500" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{group.label}</h4>
                            <p className="text-[10px] text-muted-foreground font-medium">{group.description}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleGroup(group.items)}
                          className="h-8 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
                        >
                          {group.items.every(p => selectedPermissions.includes(p)) ? '取消全选' : '全选'}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pl-12">
                        {group.items.map(perm => (
                          <div key={perm} className="flex items-center space-x-3 group/perm">
                            <Checkbox 
                              id={perm} 
                              checked={selectedPermissions.includes(perm)}
                              onCheckedChange={() => togglePermission(perm)}
                              className="rounded-md border-border/40 data-[state=checked]:bg-primary"
                            />
                            <label htmlFor={perm} className="text-[11px] font-bold text-muted-foreground/60 cursor-pointer group-hover/perm:text-foreground transition-colors uppercase tracking-tight">
                              {perm.replace('_', ' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRole === 'superadmin' && (
              <div className="p-8 bg-amber-500/10 rounded-3xl border border-amber-500/20 flex gap-5 animate-in zoom-in-95 duration-500">
                <ShieldAlert className="h-10 w-10 text-amber-500 shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wider">最高权限预警</h4>
                  <p className="text-[11px] text-amber-500/70 leading-relaxed font-medium">超级管理员将自动获得全站所有模块的读写权限，包括敏感的系统配置、成员管理及财务数据。请确保账号归属人具备最高安全信任度。</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="bg-muted/10 p-8 border-t border-border/10 gap-4">
            <Button variant="ghost" onClick={() => setEditingUser(null)} className="h-14 rounded-2xl flex-1 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/40">放弃修改</Button>
            <Button 
              onClick={handleSavePermissions} 
              disabled={isUpdating}
              className="h-14 rounded-2xl flex-1 font-bold uppercase tracking-widest text-[10px] bg-primary shadow-xl shadow-primary/20"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              同步至数据库并生效
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建用户 Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-[2rem] bg-card">
          <div className="bg-foreground p-8 text-background relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><UserPlus className="h-20 w-20" /></div>
             <DialogHeader className="relative z-10">
                <DialogTitle className="text-xl font-headline font-bold uppercase tracking-wider">创建新团队成员</DialogTitle>
                <DialogDescription className="text-background/40 text-[10px] uppercase font-bold tracking-widest mt-1">
                  CORE INFRASTRUCTURE • ADD MEMBER
                </DialogDescription>
             </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">成员姓名</Label>
                  <Input 
                    placeholder="例如: Anthony" 
                    className="h-12 rounded-xl bg-muted/20 border-border/10 text-foreground"
                    value={newUser.name}
                    onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">登录邮箱</Label>
                  <Input 
                    type="email"
                    placeholder="email@example.com" 
                    className="h-12 rounded-xl bg-muted/20 border-border/10 text-foreground"
                    value={newUser.email}
                    onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">初始密码</Label>
                  <Input 
                    type="password"
                    placeholder="••••••••" 
                    className="h-12 rounded-xl bg-muted/20 border-border/10 text-foreground"
                    value={newUser.password}
                    onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">预设角色</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setNewUser(prev => ({ ...prev, role: 'editor' }))}
                      className={cn(
                        "py-3 rounded-xl border-2 text-xs font-bold transition-all",
                        newUser.role === 'editor' ? "border-primary bg-primary/5 text-primary" : "border-border/10 text-muted-foreground/40 hover:border-border/40"
                      )}
                    >
                      普通编辑 (Editor)
                    </button>
                    <button 
                      onClick={() => setNewUser(prev => ({ ...prev, role: 'superadmin' }))}
                      className={cn(
                        "py-3 rounded-xl border-2 text-xs font-bold transition-all",
                        newUser.role === 'superadmin' ? "border-primary bg-primary/5 text-primary" : "border-border/10 text-muted-foreground/40 hover:border-border/40"
                      )}
                    >
                      超级管理 (Admin)
                    </button>
                  </div>
               </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-muted/10 border-t border-border/10 gap-3">
             <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="h-12 rounded-xl flex-1 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/40">取消</Button>
             <Button 
               onClick={handleCreateUser}
               disabled={isUpdating}
               className="h-12 rounded-xl flex-1 font-bold uppercase text-[10px] tracking-widest bg-foreground text-background shadow-xl shadow-foreground/10"
             >
               {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
               创建并发送通知
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}