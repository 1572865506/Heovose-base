"use client";

import { useState, useEffect } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { History, RotateCcw, Terminal, Download, Database, Cpu, Info, ShieldCheck, Globe, Save, Settings2, Loader2, Cloud, FileText, PlayCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LanguageOption {
  code: string;
  label: string;
}

interface AppConfig {
  supportedLanguages: LanguageOption[];
  defaultLanguage?: string;
}

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden", className)}>
    {children}
  </div>
);

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [sysStatus, setSysStatus] = useState<any>(null);
  const [backups, setBackups] = useState<any[]>([]);

  const { data: langSettings, isLoading: isLangLoading, mutate: mutateLangs } = useLocalDoc<AppConfig>('settings', 'languages');
  
  const [formData, setFormData] = useState<AppConfig>({
    supportedLanguages: [],
    defaultLanguage: 'zh'
  });

  useEffect(() => {
    if (langSettings) {
      setFormData({
        supportedLanguages: langSettings.supportedLanguages || [],
        defaultLanguage: langSettings.defaultLanguage || 'zh'
      });
    }
    fetchStatus();
    fetchBackups();
  }, [langSettings]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/system/status');
      const data = await res.json();
      setSysStatus(data);
    } catch (e) {
      console.error("Failed to fetch status");
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/admin/system/backups');
      const data = await res.json();
      if (data.backups) setBackups(data.backups);
    } catch (e) {
      console.error("Failed to fetch backups");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/settings/languages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      mutateLangs();
      setIsSaving(false);
      toast({ title: "系统配置已保存" });
    } catch (e) {
      setIsSaving(false);
      toast({ variant: "destructive", title: "保存失败" });
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch('/api/admin/system/backup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast({ title: "备份成功", description: `已生成: ${data.output}` });
        fetchStatus();
        fetchBackups();
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "备份失败", description: e.message });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownload = (filename: string) => {
    window.open(`/api/admin/system/backups/${filename}`, '_blank');
  };

  const handleRestore = async (sqlFile: string) => {
    const timestamp = sqlFile.match(/\d{8}_\d{6}/)?.[0];
    if (!timestamp) {
      toast({ variant: "destructive", title: "无效的备份文件", description: "无法识别时间戳" });
      return;
    }

    const minioFile = backups.find(b => b.filename.includes(timestamp) && b.type === "STORAGE")?.filename;
    if (!minioFile) {
      toast({ variant: "destructive", title: "缺少匹配的存储备份", description: "无法找到对应的 MinIO 备份文件" });
      return;
    }

    const confirmText = prompt(`⚠️ 危险操作：您正在尝试将数据库和存储还原到 ${timestamp} 的状态。\n当前所有数据将被覆盖且不可撤销！\n\n请输入 "CONFIRM" 以继续：`);
    
    if (confirmText !== "CONFIRM") {
      toast({ title: "还原已取消" });
      return;
    }

    setIsRestoring(true);
    try {
      const res = await fetch('/api/admin/system/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sqlFile, minioFile })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "还原成功", description: "系统数据已恢复，建议手动刷新页面。" });
        window.location.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "还原失败", description: e.message });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCheckUpdate = async () => {
    setIsChecking(true);
    setUpdateInfo(null);
    try {
      const res = await fetch('/api/admin/system/check', { method: 'POST' });
      const data = await res.json();
      if (data.hasUpdate) {
        setUpdateInfo(data);
        toast({ title: "发现新更新", description: `共有 ${data.count} 个新的提交记录` });
      } else {
        toast({ title: "已是最新版本", description: "当前代码与远程仓库一致" });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "检查失败", description: e.message });
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdate = async () => {
    if (!confirm("确定要启动系统更新吗？这将拉取最新代码并重新构建项目，期间网站可能会有短暂延迟。更新前会自动执行备份。")) return;
    
    setIsUpdating(true);
    setUpdateInfo(null);
    try {
      const res = await fetch('/api/admin/system/update', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast({ title: "更新已启动", description: data.message });
        const interval = setInterval(async () => {
          await fetchStatus();
        }, 5000);
        setTimeout(() => clearInterval(interval), 120000);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "更新启动失败", description: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative">
      {/* Background Aurora Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] bg-accent/10 blur-[100px] rounded-full -z-10" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <Settings2 className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-headline font-bold text-slate-900">核心系统设定</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-2xl pl-1">配置全站基础参数、语言降级策略以及底层基础设施连接状态。</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isLangLoading} 
          className="rounded-full h-12 px-8 gap-2 font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? '部署配置中' : '签署并同步配置'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area (Left) */}
        <div className="lg:col-span-8 space-y-10">
          <GlassCard className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)]">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
               <div className="relative z-10 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-headline font-bold">全局本地化引擎</CardTitle>
                    <CardDescription className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-1 font-bold">Site Connectivity & Fallback</CardDescription>
                  </div>
               </div>
            </div>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                    <Globe className="h-4 w-4 text-primary" /> 站点默认语种 (Fallback)
                  </Label>
                  <Select 
                    value={formData.defaultLanguage} 
                    onValueChange={(v) => setFormData({...formData, defaultLanguage: v})}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 shadow-inner">
                      <SelectValue placeholder="选择默认语种" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      {formData.supportedLanguages.length > 0 ? (
                        formData.supportedLanguages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code} className="rounded-xl h-10 text-xs font-bold my-1">
                            {lang.label} ({lang.code.toUpperCase()})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="zh" disabled className="text-xs italic p-4">请先在“翻译管理”中激活语言</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed px-1">
                    若 URL 未指定语种或特定内容缺失翻译，系统将强制回退至此锚点。
                  </p>
                </div>
                
                <div className="space-y-4">
                   <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 pl-1">
                     <ShieldCheck className="h-4 w-4 text-primary" /> 访问控制协议
                   </Label>
                   <div className="h-14 flex items-center justify-between px-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                      <span className="text-xs font-bold text-slate-900">生产环境流量拦截</span>
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">LIVE</span>
                      </div>
                   </div>
                   <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed px-1">
                    当前正在监听外部公共请求。权限由 <b>Auth.js</b> 与后端路由守卫共同保障。
                  </p>
                </div>
              </div>
            </CardContent>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <GlassCard className="border-none shadow-xl">
              <CardHeader className="p-8 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-inner">
                    <Cloud className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline font-bold text-slate-900">基础设施架构</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Cloud Infra</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database</span>
                    <code className="text-xs font-mono font-bold text-slate-900">PostgreSQL</code>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage</span>
                    <span className="text-xs font-mono font-bold text-slate-900">MinIO S3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Runtime</span>
                    <span className="text-xs font-bold text-slate-900">Next.js 15.x</span>
                  </div>
                </div>
              </CardContent>
            </GlassCard>

            <GlassCard className="border-none shadow-xl border-t-4 border-t-primary">
              <CardHeader className="p-8 border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline font-bold text-slate-900">维护与安全中心</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Maintenance & Security</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">状态摘要</p>
                    <p className="text-xs font-medium text-slate-700">
                      {sysStatus?.lastBackup ? `最近备份: ${new Date(sysStatus.lastBackup.time).toLocaleString()}` : '暂无备份记录'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleBackup}
                      disabled={isBackingUp}
                      className="rounded-xl h-12 border-slate-200 text-xs font-bold hover:bg-slate-50 gap-2"
                    >
                      {isBackingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                      立即备份
                    </Button>
                    {updateInfo ? (
                      <Button 
                        variant="default"
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="rounded-xl h-12 bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 gap-2 animate-bounce"
                      >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        立即安装 ({updateInfo.count})
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={handleCheckUpdate}
                        disabled={isChecking}
                        className="rounded-xl h-12 border-primary/20 text-primary text-xs font-bold hover:bg-primary/5 gap-2"
                      >
                        {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
                        检查更新
                      </Button>
                    )}
                  </div>
                  
                  {updateInfo && (
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <History className="h-3 w-3" /> 待更新内容
                      </p>
                      <div className="space-y-1">
                        {updateInfo.logs.map((log: string, idx: number) => (
                          <p key={idx} className="text-[10px] text-slate-600 font-mono truncate">{log}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {sysStatus?.updateLog && (
                    <div className="p-4 bg-slate-900 rounded-xl overflow-hidden">
                      <p className="text-[9px] text-primary font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Terminal className="h-3 w-3" /> 维护日志摘要
                      </p>
                      <pre className="text-[9px] text-white/60 font-mono leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto">
                        {sysStatus.updateLog}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </GlassCard>
          </div>

          {/* Backup History Table */}
          <GlassCard className="border-none shadow-xl">
             <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center shadow-inner">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline font-bold text-slate-900">备份档案库</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Backup History & Recovery</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchBackups} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5">刷新列表</Button>
             </CardHeader>
             <CardContent className="p-0">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50/50">
                         <tr>
                            <th className="px-8 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest">文件名称</th>
                            <th className="px-8 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-center">类型</th>
                            <th className="px-8 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-center">大小</th>
                            <th className="px-8 py-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">操作</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {backups.filter(b => b.type === "DATABASE").length > 0 ? (
                           backups.filter(b => b.type === "DATABASE").map((backup, idx) => (
                              <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                       <FileText className="h-4 w-4 text-slate-300" />
                                       <div>
                                          <p className="text-xs font-bold text-slate-700">{backup.filename}</p>
                                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(backup.time).toLocaleString()}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6 text-center">
                                    <Badge variant="outline" className="text-[9px] font-bold uppercase bg-blue-50 text-blue-600 border-blue-100">SQL DATA</Badge>
                                 </td>
                                 <td className="px-8 py-6 text-center text-[10px] font-bold text-slate-500">
                                    {(backup.size / 1024 / 1024).toFixed(2)} MB
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2">
                                       <Button 
                                         variant="ghost" 
                                         size="sm" 
                                         onClick={() => handleDownload(backup.filename)}
                                         title="下载备份"
                                         className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                                       >
                                          <Download className="h-4 w-4" />
                                       </Button>
                                       <Button 
                                         variant="ghost" 
                                         size="sm" 
                                         disabled={isRestoring}
                                         onClick={() => handleRestore(backup.filename)}
                                         title="还原此版本"
                                         className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                       >
                                          {isRestoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                                       </Button>
                                    </div>
                                 </td>
                              </tr>
                           ))
                         ) : (
                           <tr>
                             <td colSpan={4} className="px-8 py-12 text-center">
                               <div className="flex flex-col items-center gap-2 opacity-30">
                                 <Database className="h-8 w-8" />
                                 <p className="text-xs font-bold uppercase tracking-widest">暂无备份档案</p>
                               </div>
                             </td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </CardContent>
          </GlassCard>
        </div>

        {/* Sidebar (Right) */}
        <div className="lg:col-span-4 space-y-8">
          <GlassCard className="border-none bg-slate-900 text-white shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">系统内核状态监控</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Version</span>
                     <span className="font-mono font-bold text-primary">v2.1.0-gold</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Stability</span>
                     <span className="font-bold text-xs uppercase text-green-400">99.9% Uptime</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">DB Cluster</span>
                     <Badge className="bg-primary text-white border-none h-6 px-3 text-[9px] font-bold uppercase shadow-lg shadow-primary/20">POSTGRESQL CONNECTED</Badge>
                  </div>
               </div>

               <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex gap-4">
                  <div className="mt-1">
                    <Info className="h-5 w-5 text-primary shrink-0" />
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed font-medium italic">
                    <b>节点提示：</b>此面板展示当前容器的硬件拓扑与连接池状态。若出现离线报警，请检查 GCP 密钥存续期。
                  </p>
               </div>
            </CardContent>
          </GlassCard>

          <GlassCard className="border-none shadow-sm opacity-60 hover:opacity-100 transition-opacity">
            <div className="p-8 text-center space-y-4">
               <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-[0.1em]">
                 需要增减支持的本地化语言？
               </p>
               <Button variant="outline" className="w-full h-14 rounded-2xl border-primary/20 text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5" asChild>
                 <a href="/admin/translations">进入翻译资产治理</a>
               </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}