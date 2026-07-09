"use client";

import { useState, useEffect, useMemo, Fragment } from 'react';
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
import { History, RotateCcw, Terminal, Download, Database, Cpu, Info, ShieldCheck, Globe, Save, Settings2, Loader2, Cloud, FileText, PlayCircle, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { GlassCard } from '@/components/admin/GlassCard';
import { AdminFormSection } from '@/components/admin/AdminFormSection';

interface LanguageOption {
  code: string;
  label: string;
}

const updateSteps = [
  { key: 'backup', label: '📂 数据库与系统备份', desc: '执行更新前的本地 SQL 数据自动备份归档' },
  { key: 'git_pull', label: '⬇️ 代码源拉取同步', desc: '从远程 GitHub 仓库拉取最新提交变更' },
  { key: 'npm_install', label: '📦 同步项目依赖项', desc: '安装或升级最新 package.json 中的依赖' },
  { key: 'db_push', label: '🔄 数据库 Schema 热同步', desc: '自动推送并映射数据库表的字段及索引变更' },
  { key: 'build', label: '🏗️ 生产环境打包与预编译', desc: 'Next.js 静态生产构建优化与资源导出 (约需 1-2 分钟)' },
  { key: 'restart', label: '🔄 容器进程重启激活', desc: '自动重启 heovose-web 容器加载最新的内存进程' },
];

interface AppConfig {
  supportedLanguages: LanguageOption[];
  defaultLanguage?: string;
}

interface StorageConfig {
  baseUrl: string;
}



export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isUploadingBackup, setIsUploadingBackup] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [sysStatus, setSysStatus] = useState<any>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [expandedBackups, setExpandedBackups] = useState<Record<string, boolean>>({});

  const toggleBackupExpanded = (timestamp: string) => {
    setExpandedBackups(prev => ({
      ...prev,
      [timestamp]: !prev[timestamp]
    }));
  };

  const groupedBackups = useMemo(() => {
    const groups: Record<string, {
      timestamp: string;
      time: any;
      dbBackup?: any;
      storageBackup?: any;
    }> = {};
    const fallbackGroups: any[] = [];

    backups.forEach((b: any) => {
      if (b.type !== "DATABASE" && b.type !== "STORAGE") return;

      const match = b.filename.match(/(?:db_backup_|minio_backup_)([0-9]{8}_[0-9]{6})/);
      if (match) {
        const ts = match[1];
        if (!groups[ts]) {
          groups[ts] = {
            timestamp: ts,
            time: b.time,
          };
        }
        if (b.type === "DATABASE") {
          groups[ts].dbBackup = b;
        } else {
          groups[ts].storageBackup = b;
        }
      } else {
        fallbackGroups.push({
          timestamp: b.filename,
          time: b.time,
          dbBackup: b.type === "DATABASE" ? b : undefined,
          storageBackup: b.type === "STORAGE" ? b : undefined,
        });
      }
    });

    const list = Object.values(groups).concat(fallbackGroups);
    return list.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [backups]);

  const isStuck = useMemo(() => {
    if (sysStatus?.updateStatus?.status !== 'running') return false;
    const lastUpdated = new Date(sysStatus.updateStatus.updatedAt).getTime();
    const now = new Date().getTime();
    return now - lastUpdated > 5 * 60 * 1000; // 超过 5 分钟未更新状态判定为卡死
  }, [sysStatus]);

  const formatTimestamp = (ts: string, fallbackTime: any) => {
    const match = ts.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/);
    if (match) {
      const [_, y, m, d, hr, min, sec] = match;
      return `${y}-${m}-${d} ${hr}:${min}:${sec}`;
    }
    return new Date(fallbackTime).toLocaleString();
  };

  const { data: langSettings, isLoading: isLangLoading, mutate: mutateLangs } = useLocalDoc<AppConfig>('settings', 'languages');
  const { data: storageSettings, isLoading: isStorageLoading, mutate: mutateStorage } = useLocalDoc<StorageConfig>('settings', 'storage');

  const [formData, setFormData] = useState<any>({
    supportedLanguages: [],
    defaultLanguage: 'zh'
  });

  const [storageData, setStorageData] = useState<any>({
    baseUrl: '/storage'
  });

  useEffect(() => {
    if (langSettings) {
      setFormData({
        supportedLanguages: langSettings.supportedLanguages || [],
        defaultLanguage: langSettings.defaultLanguage || 'zh',
        _version: (langSettings as any)._version
      });
    }
    if (storageSettings) {
      setStorageData({
        baseUrl: storageSettings.baseUrl || '/storage',
        _version: (storageSettings as any)._version
      });
    }
    fetchStatus();
    fetchBackups();
  }, [langSettings, storageSettings]);

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
      const resLangs = await fetch('/api/settings/languages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!resLangs.ok) {
        if (resLangs.status === 409) {
          const errData = await resLangs.json();
          throw new Error(`语言配置保存失败：${errData.message || "已被他人修改"}`);
        }
        throw new Error("语言配置保存失败，请检查网络或重试。");
      }

      const savedLangs = await resLangs.json();
      setFormData(savedLangs);

      const resStorage = await fetch('/api/settings/storage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storageData),
      });

      if (!resStorage.ok) {
        if (resStorage.status === 409) {
          const errData = await resStorage.json();
          throw new Error(`存储配置保存失败：${errData.message || "已被他人修改"}`);
        }
        throw new Error("存储配置保存失败，请检查网络或重试。");
      }

      const savedStorage = await resStorage.json();
      setStorageData(savedStorage);

      mutateLangs();
      mutateStorage();
      toast({ title: "系统配置已保存" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "保存失败", description: e.message || "未知错误" });
    } finally {
      setIsSaving(false);
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

  const handleUploadBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingBackup(true);
    let successCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/system/upload-backup', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
        } else {
          throw new Error(data.error || `文件 ${file.name} 上传失败`);
        }
      }
      toast({ title: "备份文件导入成功", description: `已成功上传并导入 ${successCount} 个备份文件` });
      fetchBackups();
    } catch (err: any) {
      toast({ variant: "destructive", title: "导入失败", description: err.message });
    } finally {
      setIsUploadingBackup(false);
      e.target.value = '';
    }
  };
  const handleDownload = (filename: string) => {
    window.open(`/api/admin/system/backups/${filename}`, '_blank');
  };

  const handleRestore = async (sqlFile: string, minioFile: string, timestamp: string) => {
    const confirmText = prompt(`⚠️ 危险操作：您正在尝试将系统数据库和存储空间（图片/素材等）同时还原到 ${timestamp} 的状态。\n这会完全覆盖当前所有的数据与素材，且此操作不可逆！\n\n若确认要执行，请输入 "CONFIRM"：`);

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
        toast({ title: "还原成功", description: "系统还原成功，页面即将自动刷新。" });
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
      if (!res.ok) {
        throw new Error(data.error || "获取升级状态失败");
      }
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

      <AdminPageHeader
        title="核心系统设定"
        subtitle="System / Maintenance"
        icon={Settings2}
        actions={
          <Button
            onClick={handleSave}
            disabled={isSaving || isLangLoading}
            className="rounded-2xl h-12 px-8 gap-2.5 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? '部署配置中' : '签署并同步配置'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area (Left) */}
        <div className="lg:col-span-8 space-y-6">
          <AdminFormSection
            title="全局本地化引擎"
            subtitle="Site Connectivity & Fallback"
            icon={Globe}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 pl-1">
                  <Globe className="h-4 w-4 text-primary" /> 站点默认语种 (Fallback)
                </Label>
                <Select
                  value={formData.defaultLanguage}
                  onValueChange={(v) => setFormData({ ...formData, defaultLanguage: v })}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-muted/10 border border-border/60 font-bold text-foreground/80 focus:ring-1 focus:ring-primary/30">
                    <SelectValue placeholder="选择默认语种" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 shadow-2xl p-1 bg-card/90 backdrop-blur-xl">
                    {formData.supportedLanguages.length > 0 ? (
                      formData.supportedLanguages.filter((l: any) => l.isActive !== false).map((lang: any) => (
                        <SelectItem key={lang.code} value={lang.code} className="rounded-lg h-9 text-xs font-bold my-0.5">
                          {lang.label} ({lang.code.toUpperCase()})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="zh" disabled className="text-xs italic p-4">请先在“翻译管理”中激活语言</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground italic font-medium leading-relaxed px-1">
                  若 URL 未指定语种或特定内容缺失翻译，系统将强制回退至此锚点。
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 pl-1">
                  <ShieldCheck className="h-4 w-4 text-primary" /> 访问控制协议
                </Label>
                <div className="h-10 flex items-center justify-between px-4 bg-muted/10 rounded-xl border border-border/60">
                  <span className="text-xs font-bold text-foreground">生产环境流量拦截</span>
                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">LIVE</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic font-medium leading-relaxed px-1">
                  当前正在监听外部公共请求。权限由 <b>Auth.js</b> 与后端路由守卫共同保障。
                </p>
              </div>
            </div>

            {/* 基础设施存储配置 */}
            <div className="pt-6 border-t border-border/40 space-y-3">
              <Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 pl-1">
                <Database className="h-4 w-4 text-primary" /> 存储资产分发前缀 (Storage Base URL)
              </Label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={storageData.baseUrl}
                  onChange={(e) => setStorageData({ ...storageData, baseUrl: e.target.value })}
                  placeholder="例如: /storage 或 http://192.168.1.190:9000/heovose-assets"
                  className="flex-1 h-10 rounded-xl bg-muted/10 border border-border/60 px-4 font-mono text-xs font-bold text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                />
                <Button
                  variant="outline"
                  onClick={() => setStorageData({ baseUrl: '/storage' })}
                  className="h-10 px-4 rounded-xl border-dashed border-border/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
                >
                  恢复默认
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic font-medium leading-relaxed px-1">
                <b>提示：</b>默认建议使用 <code className="text-primary bg-primary/5 px-1 py-0.5 rounded border border-primary/10">/storage</code>（内网/公网自适应模式）。若使用独立 CDN，请填入完整 URL。
              </p>
            </div>
          </AdminFormSection>

          <AdminFormSection
            title="维护与安全中心"
            subtitle="Maintenance & Security"
            icon={ShieldCheck}
            className="border-t"
            actions={
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider hidden sm:inline mr-2">
                  {sysStatus?.lastBackup ? `最近备份: ${new Date(sysStatus.lastBackup.time).toLocaleString()}` : '暂无备份'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackup}
                  disabled={isBackingUp}
                  className="rounded-xl h-9 border-border/60 text-[10px] font-bold hover:bg-muted/10 gap-1.5 uppercase tracking-wider"
                >
                  {isBackingUp ? <Loader2 className="h-3 w-3 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
                  立即备份
                </Button>
                {updateInfo ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="rounded-xl h-9 bg-primary text-white text-[10px] font-bold shadow-lg shadow-primary/20 gap-1.5 animate-pulse hover:scale-105 transition-all uppercase tracking-wider"
                  >
                    {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    立即安装 ({updateInfo.count})
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheckUpdate}
                    disabled={isChecking}
                    className="rounded-xl h-9 border-primary/30 text-primary text-[10px] font-bold hover:bg-primary/5 gap-1.5 uppercase tracking-wider"
                  >
                    {isChecking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Cpu className="h-3.5 w-3.5" />}
                    检查更新
                  </Button>
                )}
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-4">

                {updateInfo && (
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <History className="h-3 w-3" /> 待更新内容
                    </p>
                    <div className="space-y-1">
                      {updateInfo.logs.map((log: string, idx: number) => (
                        <p key={idx} className="text-[10px] text-foreground/60 font-mono truncate">{log}</p>
                      ))}
                    </div>
                  </div>
                )}

                {sysStatus?.updateStatus && sysStatus.updateStatus.status !== 'idle' && (
                  <div className="p-4 bg-muted/5 border border-border/40 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="h-3.5 w-3.5 animate-pulse" /> 系统更新实时进度
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-bold uppercase",
                          sysStatus.updateStatus.status === 'running' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                          sysStatus.updateStatus.status === 'success' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                          sysStatus.updateStatus.status === 'failed' && "bg-red-500/10 text-red-400 border-red-500/20",
                        )}
                      >
                        {sysStatus.updateStatus.status === 'running' && '进行中'}
                        {sysStatus.updateStatus.status === 'success' && '更新成功'}
                        {sysStatus.updateStatus.status === 'failed' && '更新失败'}
                      </Badge>
                    </div>

                    {/* Stuck warning banner */}
                    {isStuck && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2 animate-pulse">
                        <Info className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-yellow-500/90 leading-normal font-medium">
                          <b>提示：</b>检测到更新进程已超过 5 分钟未响应，可能由于服务器内存（RAM）不足导致构建卡死或被系统终止，请检查服务器状态。
                        </p>
                      </div>
                    )}

                    {/* Error message alert */}
                    {sysStatus.updateStatus.status === 'failed' && sysStatus.updateStatus.error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                        <Info className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">构建出错中断</p>
                          <p className="text-[10px] text-red-500/90 font-mono leading-normal">{sysStatus.updateStatus.error}</p>
                        </div>
                      </div>
                    )}

                    {/* Step Timeline */}
                    <div className="space-y-3.5 pl-1.5 pt-1">
                      {updateSteps.map((step, idx) => {
                        const currentStepIndex = updateSteps.findIndex(s => s.key === sysStatus.updateStatus.currentStep);
                        let state = 'waiting';
                        if (sysStatus.updateStatus.status === 'failed' && sysStatus.updateStatus.currentStep === step.key) {
                          state = 'failed';
                        } else if (sysStatus.updateStatus.status === 'success') {
                          state = 'success';
                        } else if (sysStatus.updateStatus.currentStep === step.key && sysStatus.updateStatus.status === 'running') {
                          state = 'running';
                        } else if (currentStepIndex !== -1 && idx < currentStepIndex) {
                          state = 'success';
                        }

                        return (
                          <div key={step.key} className="flex gap-3.5 items-start relative group">
                            {/* Left line segment */}
                            {idx < updateSteps.length - 1 && (
                              <div
                                className={cn(
                                  "absolute left-[9px] top-[18px] bottom-[-20px] w-[2px] transition-colors duration-500",
                                  state === 'success' ? "bg-emerald-500/40" : "bg-border/30"
                                )}
                              />
                            )}

                            {/* Dot indicator */}
                            <div className="relative mt-0.5">
                              {state === 'success' && (
                                <div className="h-5 w-5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                  <span className="text-[9px] font-bold">✓</span>
                                </div>
                              )}
                              {state === 'running' && (
                                <div className="h-5 w-5 rounded-full bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400">
                                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                </div>
                              )}
                              {state === 'failed' && (
                                <div className="h-5 w-5 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400">
                                  <span className="text-[9px] font-bold">✕</span>
                                </div>
                              )}
                              {state === 'waiting' && (
                                <div className="h-5 w-5 rounded-full bg-muted/10 border border-border/40 flex items-center justify-center text-muted-foreground/40">
                                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                </div>
                              )}
                            </div>

                            {/* Text details */}
                            <div className="space-y-0.5">
                              <p className={cn(
                                "text-[11px] font-bold transition-colors",
                                state === 'success' && "text-foreground/90",
                                state === 'running' && "text-blue-400 font-bold",
                                state === 'failed' && "text-red-400 font-bold",
                                state === 'waiting' && "text-muted-foreground/40"
                              )}>
                                {step.label}
                              </p>
                              <p className={cn(
                                "text-[9px] transition-colors leading-normal",
                                state === 'waiting' ? "text-muted-foreground/20" : "text-muted-foreground/60"
                              )}>
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {sysStatus?.updateLog && (
                  <div className="border border-border/40 rounded-xl overflow-hidden shadow-2xl bg-black/95">
                    <style>{`
                        .custom-terminal-scrollbar::-webkit-scrollbar {
                          width: 6px;
                          height: 6px;
                        }
                        .custom-terminal-scrollbar::-webkit-scrollbar-track {
                          background: transparent;
                        }
                        .custom-terminal-scrollbar::-webkit-scrollbar-thumb {
                          background: rgba(255, 255, 255, 0.15);
                          border-radius: 99px;
                        }
                        .custom-terminal-scrollbar::-webkit-scrollbar-thumb:hover {
                          background: rgba(255, 255, 255, 0.3);
                        }
                      `}</style>
                    {/* Terminal window title bar */}
                    <div className="flex items-center px-4 py-2 bg-[#1a1a1a] border-b border-border/10">
                      <p className="text-[10px] text-muted-foreground/80 font-mono flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5 text-primary" /> update_log.txt — sh
                      </p>
                    </div>

                    {/* Terminal Content body */}
                    <div className="p-4 bg-slate-950/90">
                      <pre className="text-[11px] text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-terminal-scrollbar">
                        {sysStatus.updateLog}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AdminFormSection>

          {/* Backup History Table */}
          <AdminFormSection
            title="备份档案库"
            subtitle="Backup History & Recovery"
            icon={History}
            actions={
              <div className="flex items-center gap-2">
                <label className="flex items-center cursor-pointer">
                  <span className="inline-flex items-center justify-center rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 h-8 px-3 transition-colors">
                    {isUploadingBackup ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Upload className="h-3 w-3 mr-1" />
                    )}
                    导入备份
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".sql,.sql.gz,.tar,.tar.gz"
                    multiple
                    onChange={handleUploadBackup}
                    disabled={isUploadingBackup}
                  />
                </label>
                <Button variant="ghost" size="sm" onClick={fetchBackups} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 h-8 rounded-lg">刷新列表</Button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/10">
                  <tr>
                    <th className="px-8 py-3.5 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">备份名称 / 包含内容</th>
                    <th className="px-8 py-3.5 text-[10px] font-bold uppercase text-muted-foreground tracking-widest text-center">备份类型</th>
                    <th className="px-8 py-3.5 text-[10px] font-bold uppercase text-muted-foreground tracking-widest text-center">文件大小</th>
                    <th className="px-8 py-3.5 text-[10px] font-bold uppercase text-muted-foreground tracking-widest text-right">状态 / 操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {groupedBackups.length > 0 ? (
                    groupedBackups.map((group: any, groupIdx: number) => {
                      const isExpanded = !!expandedBackups[group.timestamp];
                      const totalSize = (group.dbBackup ? group.dbBackup.size : 0) + (group.storageBackup ? group.storageBackup.size : 0);
                      const hasDb = !!group.dbBackup;
                      const hasStorage = !!group.storageBackup;

                      return (
                        <Fragment key={group.timestamp || groupIdx}>
                          <tr
                            className="group hover:bg-muted/10 transition-colors cursor-pointer"
                            onClick={() => toggleBackupExpanded(group.timestamp)}
                          >
                            <td className="px-8 py-4.5">
                              <div className="flex items-center gap-3">
                                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-foreground/90">
                                    备份归档 - {formatTimestamp(group.timestamp, group.time)}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                                    生成时间: {new Date(group.time).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {hasDb && (
                                  <Badge variant="outline" className="text-[9px] font-bold uppercase bg-blue-500/10 text-blue-500 border-blue-500/20">
                                    数据库
                                  </Badge>
                                )}
                                {hasStorage && (
                                  <Badge variant="outline" className="text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    存储桶
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-4.5 text-center text-[10px] font-bold text-muted-foreground">
                              {(totalSize / 1024 / 1024).toFixed(2)} MB
                            </td>
                            <td className="px-8 py-4.5 text-right">
                              <div className="flex justify-end items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                {hasDb && hasStorage && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isRestoring}
                                    onClick={() => handleRestore(group.dbBackup.filename, group.storageBackup.filename, formatTimestamp(group.timestamp, group.time))}
                                    className="h-8 px-3 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/10 gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                                  >
                                    {isRestoring ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                                    一键还原
                                  </Button>
                                )}
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer" onClick={() => toggleBackupExpanded(group.timestamp)}>
                                  {isExpanded ? '折叠' : '展开'}
                                </span>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <>
                              {group.dbBackup && (
                                <tr className="bg-muted/5 border-b border-border/20">
                                  <td className="px-8 py-3.5 pl-14">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-3.5 w-3.5 text-blue-400" />
                                      <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[280px]" title={group.dbBackup.filename}>
                                        {group.dbBackup.filename}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-3.5 text-center">
                                    <Badge variant="outline" className="text-[8px] font-bold uppercase bg-blue-500/5 text-blue-400 border-blue-500/10">
                                      SQL DATA
                                    </Badge>
                                  </td>
                                  <td className="px-8 py-3.5 text-center text-[10px] font-mono text-muted-foreground/80">
                                    {(group.dbBackup.size / 1024 / 1024).toFixed(2)} MB
                                  </td>
                                  <td className="px-8 py-3.5 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleDownload(group.dbBackup.filename); }}
                                        title="下载数据库备份"
                                        className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              {group.storageBackup && (
                                <tr className="bg-muted/5 border-b border-border/20">
                                  <td className="px-8 py-3.5 pl-14">
                                    <div className="flex items-center gap-2">
                                      <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                                      <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[280px]" title={group.storageBackup.filename}>
                                        {group.storageBackup.filename}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-3.5 text-center">
                                    <Badge variant="outline" className="text-[8px] font-bold uppercase bg-emerald-500/5 text-emerald-400 border-emerald-500/10">
                                      STORAGE DATA
                                    </Badge>
                                  </td>
                                  <td className="px-8 py-3.5 text-center text-[10px] font-mono text-muted-foreground/80">
                                    {(group.storageBackup.size / 1024 / 1024).toFixed(2)} MB
                                  </td>
                                  <td className="px-8 py-3.5 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleDownload(group.storageBackup.filename); }}
                                        title="下载存储备份"
                                        className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          )}
                        </Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <Database className="h-8 w-8" />
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">暂无备份档案</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </AdminFormSection>
        </div>

        {/* Sidebar (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="shadow-2xl">
            <CardHeader className="p-6 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">系统内核状态监控</CardTitle>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Version</span>
                  <span className="font-mono font-bold text-primary">v2.1.0-gold</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stability</span>
                  <span className="font-bold text-xs uppercase text-emerald-400">99.9% Uptime</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">DB Cluster</span>
                  <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20 uppercase">POSTGRESQL CONNECTED</span>
                </div>
              </div>

              <div className="p-4 bg-muted/10 rounded-2xl border border-border/40 flex gap-3">
                <div className="mt-0.5">
                  <Info className="h-4 w-4 text-primary shrink-0" />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium italic">
                  <b>节点提示：</b>此面板展示当前容器的硬件拓扑与连接池状态。若出现离线报警，请检查 GCP 密钥存续期。
                </p>
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard>
            <CardHeader className="p-6 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">基础设施架构</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2.5 border-b border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Database</span>
                  <code className="text-xs font-mono font-bold text-foreground bg-muted/10 px-1.5 py-0.5 rounded border border-border/40">PostgreSQL</code>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Storage</span>
                  <span className="text-xs font-mono font-bold text-foreground">MinIO S3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Runtime</span>
                  <span className="text-xs font-bold text-foreground">Next.js 15.x</span>
                </div>
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard className="opacity-80 hover:opacity-100 transition-opacity">
            <div className="p-6 text-center space-y-3">
              <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-[0.1em]">
                需要增减支持的本地化语言？
              </p>
              <Button variant="outline" className="w-full h-10 rounded-xl border-primary/30 text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5 h-10 rounded-xl" asChild>
                <a href="/admin/translations">进入翻译资产治理</a>
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}