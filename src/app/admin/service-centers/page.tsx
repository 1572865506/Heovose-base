'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Landmark,
  Phone,
  Mail,
  Clock,
  FileText,
  Edit2,
  Trash2,
  MapPin,
  Loader2,
  Building2,
  ShieldAlert,
  Copy,
  CheckCircle2,
  Sparkles,
  Upload,
  Database,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  region: 'CN' | 'ID';
  subRegion: string; // Dynamic Province/City/Sub-region
  phone: string;
  email?: string;
  hours?: string;
  note?: string;
}

interface ServiceCentersData {
  centers: ServiceCenter[];
}

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    className={cn("bg-card backdrop-blur-xl border border-border shadow-sm rounded-3xl overflow-hidden relative group", className)}
  >
    {children}
  </motion.div>
);

const SectionLabel = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <div className="flex items-center gap-2 mb-3">
    {Icon && <Icon className="w-3.5 h-3.5 text-primary/50" />}
    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{children}</span>
  </div>
);

export default function ServiceCentersAdminPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'CN' | 'ID'>('ALL');
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>('ALL');

  // Single CRUD Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ServiceCenter | null>(null);

  // Form fields state
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formRegion, setFormRegion] = useState<'CN' | 'ID'>('CN');
  const [formSubRegion, setFormSubRegion] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formNote, setFormNote] = useState('');

  // Bulk Import Dialog state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'APPEND' | 'OVERWRITE'>('APPEND');
  const [importError, setImportError] = useState<string | null>(null);
  const [importCount, setImportCount] = useState(0);

  // Fetch PostgreSQL service centers data
  const { data: serviceCentersData, mutate: mutateCenters, isLoading } = useLocalDoc<ServiceCentersData>('settings', 'service_centers');

  const centers = useMemo(() => serviceCentersData?.centers || [], [serviceCentersData]);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = centers.length;
    const cnCount = centers.filter(c => c.region === 'CN').length;
    const idCount = centers.filter(c => c.region === 'ID').length;
    return { total, cnCount, idCount };
  }, [centers]);

  // Aggregate dynamic sub-regions from active centers list based on country selection
  const availableSubRegions = useMemo(() => {
    const countryFiltered = centers.filter(c => selectedRegion === 'ALL' || c.region === selectedRegion);
    const uniqueSubs = countryFiltered
      .map(c => c.subRegion?.trim())
      .filter((v, i, a) => v && a.indexOf(v) === i);
    return uniqueSubs.sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }, [centers, selectedRegion]);

  // Reset sub-region filter whenever country region filter changes
  useEffect(() => {
    setSelectedSubRegion('ALL');
  }, [selectedRegion]);

  // Filter centers based on Country, Sub-region, and Search query
  const filteredCenters = useMemo(() => {
    return centers.filter(c => {
      const matchesRegion = selectedRegion === 'ALL' || c.region === selectedRegion;
      const matchesSubRegion = selectedSubRegion === 'ALL' || c.subRegion === selectedSubRegion;
      const matchesSearch = searchQuery === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.subRegion && c.subRegion.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.note && c.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.hours && c.hours.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRegion && matchesSubRegion && matchesSearch;
    });
  }, [centers, selectedRegion, selectedSubRegion, searchQuery]);

  // JSON Validation Logic for Importer
  const validateImportJson = (text: string) => {
    if (!text.trim()) {
      setImportError(null);
      setImportCount(0);
      return null;
    }
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setImportError("数据根格式错误：必须是一个 JSON 数组格式，例如: [ { ... } ]");
        setImportCount(0);
        return null;
      }
      if (parsed.length === 0) {
        setImportError("解析校验失败：导入的 JSON 数组内无任何数据对象");
        setImportCount(0);
        return null;
      }
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
          setImportError(`第 ${i + 1} 项数据校验失败：name (名称) 为必填项，且必须为非空字符串。`);
          setImportCount(0);
          return null;
        }
        if (!item.address || typeof item.address !== 'string' || !item.address.trim()) {
          setImportError(`第 ${i + 1} 项数据校验失败：address (地址) 为必填项，且必须为非空字符串。`);
          setImportCount(0);
          return null;
        }
        if (!item.phone || typeof item.phone !== 'string' || !item.phone.trim()) {
          setImportError(`第 ${i + 1} 项数据校验失败：phone (联系电话) 为必填项，且必须为非空字符串。`);
          setImportCount(0);
          return null;
        }
        if (!item.subRegion || typeof item.subRegion !== 'string' || !item.subRegion.trim()) {
          setImportError(`第 ${i + 1} 项数据校验失败：subRegion (省市/地区/省份) 为必填项，且必须为非空字符串。`);
          setImportCount(0);
          return null;
        }
        if (item.region !== 'CN' && item.region !== 'ID') {
          setImportError(`第 ${i + 1} 项数据校验失败：region 字段必须是 \"CN\"（中国）或 \"ID\"（印尼）二者之一。`);
          setImportCount(0);
          return null;
        }
      }
      setImportError(null);
      setImportCount(parsed.length);
      return parsed;
    } catch (err: any) {
      setImportError("JSON 语法解析错误，请确认双引号配对、逗号结尾正确。详情: " + err.message);
      setImportCount(0);
      return null;
    }
  };

  // Auto-validate import text on paste/change
  useEffect(() => {
    validateImportJson(importText);
  }, [importText]);

  // Open Dialog for Add
  const handleAddClick = () => {
    setEditingCenter(null);
    setFormName('');
    setFormAddress('');
    setFormRegion('CN');
    setFormSubRegion('');
    setFormPhone('');
    setFormEmail('');
    setFormHours('周一至周五 09:00 - 18:00');
    setFormNote('');
    setIsDialogOpen(true);
  };

  // Open Dialog for Edit
  const handleEditClick = (center: ServiceCenter) => {
    setEditingCenter(center);
    setFormName(center.name);
    setFormAddress(center.address);
    setFormRegion(center.region);
    setFormSubRegion(center.subRegion || '');
    setFormPhone(center.phone);
    setFormEmail(center.email || '');
    setFormHours(center.hours || '');
    setFormNote(center.note || '');
    setIsDialogOpen(true);
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim() || !formPhone.trim() || !formSubRegion.trim()) {
      toast({
        variant: "destructive",
        title: "校验未通过",
        description: "名称、省市/地区、地址和电话为必填项，请填写完整。"
      });
      return;
    }

    setIsSaving(true);
    try {
      let updatedCenters = [...centers];

      if (editingCenter) {
        // Edit existing center
        updatedCenters = updatedCenters.map(c => 
          c.id === editingCenter.id
            ? {
                ...c,
                name: formName.trim(),
                address: formAddress.trim(),
                region: formRegion,
                subRegion: formSubRegion.trim(),
                phone: formPhone.trim(),
                email: formEmail.trim() || undefined,
                hours: formHours.trim() || undefined,
                note: formNote.trim() || undefined,
              }
            : c
        );
      } else {
        // Add new center
        const newCenter: ServiceCenter = {
          id: 'center_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          name: formName.trim(),
          address: formAddress.trim(),
          region: formRegion,
          subRegion: formSubRegion.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim() || undefined,
          hours: formHours.trim() || undefined,
          note: formNote.trim() || undefined,
        };
        updatedCenters.push(newCenter);
      }

      const response = await fetch('/api/settings/service_centers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centers: updatedCenters }),
      });

      if (!response.ok) throw new Error('Failed to save service centers');

      await mutateCenters();
      setIsDialogOpen(false);
      toast({
        title: editingCenter ? "更新成功" : "创建成功",
        description: `服务网点「${formName}」已成功签署写入数据库。`,
        className: "bg-primary text-white border-none rounded-2xl animate-in fade-in shadow-xl"
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "同步失败",
        description: "保存失败，请检查数据库连接网关。"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Execute Bulk Import
  const handleExecuteImport = async () => {
    const parsed = validateImportJson(importText);
    if (!parsed) {
      toast({
        variant: "destructive",
        title: "导入校验未通过",
        description: "请首先修正文本域中 JSON 数据包的格式与字段错误。"
      });
      return;
    }

    setIsSaving(true);
    try {
      const timestamp = Date.now().toString(36);
      const newItems: ServiceCenter[] = parsed.map((item: any, index: number) => ({
        id: item.id || `center_${timestamp}_${Math.random().toString(36).substr(2, 4)}_${index}`,
        name: item.name.trim(),
        address: item.address.trim(),
        region: item.region,
        subRegion: item.subRegion.trim(),
        phone: item.phone.trim(),
        email: item.email?.trim() || undefined,
        hours: item.hours?.trim() || undefined,
        note: item.note?.trim() || undefined,
      }));

      let finalCenters: ServiceCenter[] = [];
      if (importMode === 'APPEND') {
        finalCenters = [...centers, ...newItems];
      } else {
        finalCenters = newItems;
      }

      const response = await fetch('/api/settings/service_centers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centers: finalCenters }),
      });

      if (!response.ok) throw new Error('Failed to save imported centers');

      await mutateCenters();
      setIsImportDialogOpen(false);
      setImportText('');
      toast({
        title: "批量导入成功",
        description: `已成功签署录入 ${newItems.length} 家服务中心！目前系统共有 ${finalCenters.length} 家网点。`,
        className: "bg-primary text-white border-none rounded-2xl shadow-xl animate-in fade-in"
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "导入同步失败",
        description: "数据写入错误，请确认 PostgreSQL 连通状况。"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDeleteClick = async (center: ServiceCenter) => {
    if (!confirm(`确定要删除服务中心「${center.name}」吗？`)) return;

    try {
      const updatedCenters = centers.filter(c => c.id !== center.id);

      const response = await fetch('/api/settings/service_centers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centers: updatedCenters }),
      });

      if (!response.ok) throw new Error('Failed to delete center');

      await mutateCenters();
      toast({
        title: "删除成功",
        description: `服务网点「${center.name}」已成功从数据库中移除。`,
        className: "bg-red-600 text-white border-none rounded-2xl animate-in fade-in shadow-xl"
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "删除失败，请检查数据库通信状态。"
      });
    }
  };

  // Copy Address Helper
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "地址已复制",
      description: "信息已成功写入系统剪贴板。",
      className: "bg-primary text-white border-none rounded-2xl"
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-32">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Service Center Console v1.2</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 admin-interface-dark:text-white tracking-tight font-headline">服务中心管理</h1>
          <p className="text-slate-500 admin-interface-dark:text-slate-400 max-w-2xl leading-relaxed">
            在此配置前台展示的全球服务中心网点。系统已完成深度升级，现已支持按 **“国家/所属地区（Region）”** 与 **“二级省份/城市区域（subRegion）”** 双层分类筛选，支持数十个省份的大规模列表秒级检索。
          </p>
        </div>

        {/* Action Button Controls Row */}
        <div className="flex items-center gap-3.5 self-start md:self-end">
          <Button
            onClick={() => setIsImportDialogOpen(true)}
            variant="outline"
            className="rounded-2xl h-14 px-7 gap-2.5 font-bold uppercase tracking-widest text-[10px] border-border hover:bg-muted/10 hover:scale-105 transition-all text-slate-700 dark:text-white"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            批量导入 JSON
          </Button>

          <Button
            onClick={handleAddClick}
            className="rounded-2xl h-14 px-8 gap-2.5 font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10 hover:scale-105 transition-all bg-primary hover:bg-primary/90 text-white border-none"
          >
            <Plus className="w-5 h-5" />
            新增服务中心
          </Button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm flex items-center justify-between overflow-hidden relative group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">全球网点总数</span>
            <h3 className="text-4xl font-black text-slate-900 admin-interface-dark:text-white font-headline">{metrics.total}</h3>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary"><Landmark className="w-6 h-6" /></div>
        </div>

        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm flex items-center justify-between overflow-hidden relative group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">中国区中心 (CN)</span>
            <h3 className="text-4xl font-black text-slate-900 admin-interface-dark:text-white font-headline">{metrics.cnCount}</h3>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-500"><Building2 className="w-6 h-6" /></div>
        </div>

        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm flex items-center justify-between overflow-hidden relative group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">印度尼西亚中心 (ID)</span>
            <h3 className="text-4xl font-black text-slate-900 admin-interface-dark:text-white font-headline">{metrics.idCount}</h3>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-teal-500/5 flex items-center justify-center text-teal-500"><Building2 className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Search & Double Filter Bar */}
      <div className="space-y-4 p-5 bg-muted/10 border border-border rounded-3xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground/60" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索服务中心名称、地址、省市、电话或备注..."
              className="pl-11 h-12 bg-card border-border/60 hover:border-primary/30 focus-visible:border-primary/50 rounded-2xl text-xs font-semibold placeholder:text-muted-foreground/40 shadow-inner"
            />
          </div>

          {/* Region Country Pills Filter */}
          <div className="flex items-center gap-2 bg-muted/20 border border-border p-1 rounded-2xl shrink-0 w-full md:w-auto">
            {(['ALL', 'CN', 'ID'] as const).map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={cn(
                  "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                  selectedRegion === region
                    ? "bg-card text-primary shadow-sm border border-border/60 scale-105"
                    : "text-muted-foreground hover:text-foreground bg-transparent"
                )}
              >
                {region === 'ALL' ? '全部国家' : region === 'CN' ? '中国区 (CN)' : '印尼区 (ID)'}
              </button>
            ))}
          </div>
        </div>

        {/* Level 2: Dynamic Sub-Regions Filters Row */}
        {availableSubRegions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/40">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground/50 px-2.5 shrink-0">
              <Globe className="w-3 h-3" />
              <span>省市/地区过滤:</span>
            </div>
            
            <button
              onClick={() => setSelectedSubRegion('ALL')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-200",
                selectedSubRegion === 'ALL'
                  ? "bg-primary text-white shadow-sm scale-102"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border/60"
              )}
            >
              全部
            </button>

            {availableSubRegions.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubRegion(sub)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-200",
                  selectedSubRegion === sub
                    ? "bg-primary text-white shadow-sm scale-102"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border/60"
                )}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">正在检索数据库资产...</p>
        </div>
      ) : (
        /* Bento Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCenters.map(center => (
              <GlassCard key={center.id} className="hover:border-primary/30 transition-all duration-500 hover:shadow-lg">
                {/* Header Tag */}
                <div className="p-6 md:p-8 pb-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      center.region === 'CN'
                        ? "bg-blue-500/5 text-blue-500 border-blue-500/20"
                        : "bg-teal-500/5 text-teal-500 border-teal-500/20"
                    )}>
                      {center.region === 'CN' ? '中国区' : '印度尼西亚'}
                    </span>
                    
                    {/* Province badge tag */}
                    <span className="px-2.5 py-1 rounded-full bg-slate-500/5 border border-slate-500/10 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                      {center.subRegion || '通用'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      onClick={() => handleEditClick(center)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(center)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-6">
                  {/* Name */}
                  <h3 className="text-lg font-black text-slate-900 admin-interface-dark:text-white leading-tight font-headline group-hover:text-primary transition-colors">
                    {center.name}
                  </h3>

                  {/* Address Box */}
                  <div className="p-4 bg-muted/10 border border-border/40 rounded-2xl flex items-start justify-between gap-4 group/addr">
                    <div className="flex gap-2.5 items-start">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{center.address}</p>
                    </div>
                    <Button
                      onClick={() => handleCopyText(center.address)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-primary/10 text-primary opacity-0 group-hover/addr:opacity-100 transition-opacity shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Detail Grid */}
                  <div className="space-y-3.5 pt-4 border-t border-dashed">
                    {/* Phone */}
                    <div className="flex items-center gap-3">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 admin-interface-dark:text-slate-200">{center.phone}</span>
                    </div>

                    {/* Email */}
                    {center.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                        <span className="text-xs font-semibold text-muted-foreground">{center.email}</span>
                      </div>
                    )}

                    {/* Hours */}
                    {center.hours && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                        <span className="text-xs font-semibold text-muted-foreground">{center.hours}</span>
                      </div>
                    )}

                    {/* Note */}
                    {center.note && (
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-500/[0.03] border border-orange-500/10">
                        <FileText className="w-3.5 h-3.5 text-orange-500/60 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-semibold text-orange-500/80 leading-relaxed">{center.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {filteredCenters.length === 0 && (
            <div className="col-span-12 py-24 text-center border border-dashed border-border rounded-3xl bg-card">
              <ShieldAlert className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-slate-900 admin-interface-dark:text-white text-sm font-bold">没有匹配的服务中心</p>
              <p className="text-muted-foreground text-xs mt-1">请重置筛选条件或点击上方功能按钮。</p>
            </div>
          )}
        </div>
      )}

      {/* --- Dialog 1: Add / Edit Single Center Dialog Modal --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border border-border/80 shadow-2xl rounded-[2.5rem] p-10 backdrop-blur-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black font-headline text-slate-900 admin-interface-dark:text-white tracking-tight flex items-center gap-3">
              <Landmark className="w-6 h-6 text-primary" />
              {editingCenter ? '编辑服务网点' : '新增服务网点'}
            </DialogTitle>
            <DialogDescription className="text-xs mt-1 text-muted-foreground">
              请输入服务中心网点的信息。这里的所有文本字段都会按照您输入的原始语言直接渲染在前台。
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Region Select */}
              <div className="space-y-2">
                <SectionLabel>所属国家/地区 (Country)</SectionLabel>
                <Select
                  value={formRegion}
                  onValueChange={(val: 'CN' | 'ID') => setFormRegion(val)}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-card border-border/80 text-xs font-bold focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder="选择所在国家/地区" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border shadow-lg rounded-xl">
                    <SelectItem value="CN" className="text-xs font-bold py-2.5 rounded-lg cursor-pointer">中国 (CN)</SelectItem>
                    <SelectItem value="ID" className="text-xs font-bold py-2.5 rounded-lg cursor-pointer">印度尼西亚 (ID)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SubRegion */}
              <div className="space-y-2">
                <SectionLabel>省市/地区 (Province / Sub-Region)</SectionLabel>
                <Input
                  value={formSubRegion}
                  onChange={e => setFormSubRegion(e.target.value)}
                  placeholder="例如: 广东省、四川省 或 DKI Jakarta"
                  className="h-11 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <SectionLabel>网点名称 (Name)</SectionLabel>
                <Input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="例如: 深圳智慧服务中心 或 Pusat Layanan Jakarta"
                  className="h-11 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <SectionLabel icon={Phone}>联系电话 (Phone)</SectionLabel>
                <Input
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="例如: +86 755 8888 8888"
                  className="h-11 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <SectionLabel icon={Mail}>电子邮箱 (Email - 可选)</SectionLabel>
                <Input
                  value={formEmail}
                  type="email"
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="例如: support@heovose.com"
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>

              {/* Hours */}
              <div className="space-y-2">
                <SectionLabel icon={Clock}>工作时间 (Hours - 可选)</SectionLabel>
                <Input
                  value={formHours}
                  onChange={e => setFormHours(e.target.value)}
                  placeholder="例如: 周一至周五 09:00 - 18:00"
                  className="h-11 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <SectionLabel icon={MapPin}>详细地址 (Address)</SectionLabel>
              <Input
                value={formAddress}
                onChange={e => setFormAddress(e.target.value)}
                placeholder="网点的本地化完整街道地址..."
                className="h-11 rounded-xl text-xs font-bold"
                required
              />
            </div>

            {/* Note */}
            <div className="space-y-2">
              <SectionLabel icon={FileText}>网点备注 (Note - 可选)</SectionLabel>
              <Textarea
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                placeholder="可填写该网点的一些特有保障服务、交通引导或注意事项..."
                className="min-h-[100px] rounded-xl p-4 leading-relaxed text-xs font-bold"
              />
            </div>

            <DialogFooter className="pt-6 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl h-11 px-6 text-xs font-bold uppercase tracking-wider border-border hover:bg-muted/10"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl h-11 px-8 gap-2 text-xs font-bold uppercase tracking-wider shadow-lg bg-primary hover:bg-primary/90 text-white border-none"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    保存网点
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Dialog 2: Bulk JSON Import Dialog Modal --- */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl bg-card border border-border/80 shadow-2xl rounded-[2.5rem] p-10 backdrop-blur-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black font-headline text-slate-900 admin-interface-dark:text-white tracking-tight flex items-center gap-3">
              <Database className="w-6 h-6 text-primary" />
              批量导入服务网点
            </DialogTitle>
            <DialogDescription className="text-xs mt-1 text-muted-foreground leading-relaxed">
              请在此处粘贴包含服务网点结构体的 JSON 数据数组。已为您将省市/二级地区属性 `subRegion` 自动设为必填项。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Template Sample block */}
            <div className="space-y-2">
              <SectionLabel icon={FileText}>数据格式模板示例 (JSON Array Template)</SectionLabel>
              <pre className="p-4 bg-muted/30 border border-border/50 rounded-2xl text-[10px] text-muted-foreground overflow-x-auto leading-normal font-mono">
{`[
  {
    "name": "Surabaya Service Center",
    "region": "ID",
    "subRegion": "Jawa Timur",
    "address": "Jl. Basuki Rahmat No. 8, Surabaya",
    "phone": "+62 31 123456",
    "email": "sub@heovose.com",
    "hours": "Mon-Fri 09:00-17:00",
    "note": "Original spare parts support"
  }
]`}
              </pre>
            </div>

            {/* Merge Mode Switch Pills */}
            <div className="space-y-2">
              <SectionLabel icon={Landmark}>导入覆盖模式选择 (Import Mode)</SectionLabel>
              <div className="flex items-center gap-3 bg-muted/20 border border-border p-1 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setImportMode('APPEND')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                    importMode === 'APPEND'
                      ? "bg-card text-primary shadow-sm border border-border/60 scale-102 font-black"
                      : "text-muted-foreground hover:text-foreground bg-transparent"
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  追加合并模式 (与当前已有数据合并)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('OVERWRITE')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                    importMode === 'OVERWRITE'
                      ? "bg-red-500/10 text-red-500 shadow-sm border border-red-500/20 scale-102 font-black"
                      : "text-muted-foreground hover:text-foreground bg-transparent"
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  覆盖重建模式 (清空旧数据全新导入)
                </button>
              </div>
            </div>

            {/* Paste Textarea */}
            <div className="space-y-2">
              <SectionLabel icon={FileText}>粘贴 JSON 数据数组 (Paste JSON Here)</SectionLabel>
              <Textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="在此处粘贴 JSON 数据数组..."
                className="min-h-[160px] rounded-xl p-4 font-mono text-[10px] leading-relaxed"
              />
            </div>

            {/* Live Syntax Validation Status Banner */}
            {importText.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 border rounded-2xl flex items-start gap-3",
                  importError
                    ? "bg-red-500/[0.03] border-red-500/20 text-red-600"
                    : "bg-green-500/[0.03] border-green-500/20 text-green-700"
                )}
              >
                {importError ? (
                  <>
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold leading-normal">{importError}</p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold leading-normal">
                      校验通过！成功解析出 **{importCount}** 家服务中心网点记录。
                      {importMode === 'APPEND'
                        ? ` 导入后系统网点总数将增至 ${centers.length + importCount} 家。`
                        : ` 导入后系统将清空当前所有数据，并以这 ${importCount} 家新记录为准。`}
                    </p>
                  </>
                )}
              </motion.div>
            )}

            <DialogFooter className="pt-4 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportText('');
                }}
                className="rounded-xl h-11 px-6 text-xs font-bold uppercase tracking-wider border-border hover:bg-muted/10"
              >
                取消
              </Button>
              <Button
                onClick={handleExecuteImport}
                disabled={isSaving || importCount === 0 || !!importError}
                className={cn(
                  "rounded-xl h-11 px-8 gap-2 text-xs font-bold uppercase tracking-wider shadow-lg text-white border-none",
                  importMode === 'OVERWRITE'
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    正在同步写入...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    确认导入 ({importCount} 条记录)
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
