'use client';

import { useState, useEffect } from 'react';
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
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  MessageSquare, 
  ChevronRight,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  UserCircle,
  Package,
  Server,
  Key,
  Shield,
  Globe,
  Lock,
  ChevronLeft,
  Download,
  MapPin,
  Languages,
  FileDown,
  Compass,
  Layers,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Settings } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function InquiriesPage() {
  const { toast } = useToast();
  const { data: inquiries, isLoading, mutate } = useLocalCollection<any>('inquiries');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processed'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Settings State
  const [settings, setSettings] = useState({
    inquiry_forward_email: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    smtp_secure: 'false'
  });

  // Fetch settings on load
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
      });
  }, []);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      // Save all settings in parallel
      const promises = Object.entries(settings).map(([key, value]) => 
        fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        })
      );
      
      await Promise.all(promises);
      toast({ title: "所有设置已保存" });
      setIsSettingsOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "部分设置保存失败" });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const filteredInquiries = inquiries?.filter((inq: any) => {
    const matchesSearch = inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Paginated Data
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResendEmail = async (id: string) => {
    if (isResendingEmail) return;
    setIsResendingEmail(true);
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '发送失败');

      setSelectedInquiry((prev: any) => prev ? {
        ...prev,
        dossier: {
          ...(prev.dossier || {}),
          mailStatus: data.mailStatus,
          mailError: data.mailError,
          mailSentAt: data.mailSentAt,
        }
      } : prev);
      mutate();

      if (data.success) {
        toast({ title: '询盘通知邮件已重新转发' });
      } else {
        toast({
          variant: 'destructive',
          title: data.mailStatus === 'unconfigured' ? '发信服务器未配置' : '邮件转发失败',
          description: data.mailError || '请检查发信服务器设置',
        });
      }
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: '重新转发请求失败',
        description: e?.message || '请稍后重试',
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      await mutate();
      
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
      
      toast({ title: "状态已更新" });
    } catch (e) {
      toast({ variant: "destructive", title: "更新失败" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条询盘吗？')) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      mutate();
      setIsDetailOpen(false);
      toast({ title: "询盘已删除" });
    } catch (e) {
      toast({ variant: "destructive", title: "删除失败" });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimeSafe = (dateVal: any, pattern: string = 'yyyy-MM-dd HH:mm:ss') => {
    if (!dateVal) return '-';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '-';
      return format(d, pattern);
    } catch {
      return '-';
    }
  };

  const escapeCell = (str: any) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const handleExport = () => {
    if (!filteredInquiries.length) {
      toast({ variant: "destructive", title: "没有可导出的数据" });
      return;
    }

    const headers = [
      '序号',
      '意向评级',
      '客户姓名',
      '电子邮箱',
      '联系电话',
      '公司名称',
      '所在国家/地区',
      '建议沟通语种',
      '关联产品名称',
      '关联产品ID',
      '规格书PDF下载',
      '站内总停留',
      '对比浏览产品',
      '流量来源渠道',
      '处理状态',
      '提交时间',
      '客户咨询留言'
    ];

    const rowsHtml = filteredInquiries.map((inq: any, idx: number) => {
      const dossier = inq.dossier || {};
      const rating = dossier.leadRating || '🌱 常规快速';
      const isHigh = rating.includes('极高');
      const isDeep = rating.includes('深度');
      const ratingStyle = isHigh 
        ? 'background-color: #ffe4e6; color: #e11d48; font-weight: bold;' 
        : isDeep 
        ? 'background-color: #dbeafe; color: #2563eb; font-weight: bold;' 
        : 'background-color: #f1f5f9; color: #475569;';

      const statusStyle = inq.status === 'pending'
        ? 'background-color: #ffedd5; color: #c2410c; font-weight: bold;'
        : 'background-color: #dcfce7; color: #15803d; font-weight: bold;';

      const pdfStyle = dossier.pdfDownloaded
        ? 'color: #16a34a; font-weight: bold;'
        : 'color: #64748b;';

      // 纯净标准的提交时间戳
      const submitTime = formatTimeSafe(inq.createdAt, 'yyyy-MM-dd HH:mm:ss');

      const comparedProds = dossier.comparedProducts && dossier.comparedProducts.length > 0
        ? dossier.comparedProducts.join('、')
        : '无';

      return `
        <tr style="height: 32px;">
          <td style="text-align: center; border: 1px solid #cbd5e1;">${idx + 1}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; ${ratingStyle}">${escapeCell(rating)}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: bold;">${escapeCell(inq.name)}</td>
          <td style="border: 1px solid #cbd5e1;"><a href="mailto:${escapeCell(inq.email)}">${escapeCell(inq.email)}</a></td>
          <td style="border: 1px solid #cbd5e1; mso-number-format:'\\@';">${escapeCell(inq.phone || '未提供')}</td>
          <td style="border: 1px solid #cbd5e1;">${escapeCell(inq.company || '个人客户')}</td>
          <td style="border: 1px solid #cbd5e1;">${escapeCell(dossier.location || '未知国家/地区')}</td>
          <td style="border: 1px solid #cbd5e1;">${escapeCell(dossier.language || '未知')}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: bold;">${escapeCell(inq.productName || (inq.productId ? `产品 ${inq.productId}` : '通用咨询'))}</td>
          <td style="border: 1px solid #cbd5e1; mso-number-format:'\\@'; font-family: monospace;">${escapeCell(inq.productId || '无')}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; ${pdfStyle}">${dossier.pdfDownloaded ? '已下载 (高意向)' : '未下载'}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1;">${escapeCell(dossier.dwellTime || '刚刚进站')}</td>
          <td style="border: 1px solid #cbd5e1;">${escapeCell(comparedProds)}</td>
          <td style="border: 1px solid #cbd5e1;">${escapeCell(dossier.channel || '直接访问')}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; ${statusStyle}">${inq.status === 'pending' ? '待处理' : '已处理'}</td>
          <td style="border: 1px solid #cbd5e1; white-space: nowrap;">${submitTime}</td>
          <td style="border: 1px solid #cbd5e1; max-width: 400px; white-space: pre-wrap;">${escapeCell(inq.message)}</td>
        </tr>
      `;
    }).join('');

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>官网客户询盘列表</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                  <x:DoNotDisplayZeros/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; }
          th { background-color: #0f172a; color: #ffffff; font-weight: bold; font-size: 13px; height: 38px; text-align: center; vertical-align: middle; border: 1px solid #475569; padding: 6px 12px; }
          td { vertical-align: middle; padding: 6px 10px; color: #1e293b; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `heovose-inquiries-${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "数据导出成功", description: "已为您生成带画像样式的 Excel 报表" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <AdminPageHeader
        title="询盘管理"
        subtitle="Management / Content / Inquiries"
        icon={MessageSquare}
        actions={
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="搜索姓名、邮箱或公司..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-11 h-12 rounded-2xl bg-white border-slate-200 shadow-sm focus-visible:ring-primary/20 transition-all admin-interface-dark:bg-slate-900/50 admin-interface-dark:border-slate-800 admin-interface-dark:text-white admin-interface-dark:placeholder:text-slate-500"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="h-12 rounded-2xl gap-2 font-bold px-6 border-slate-200 hover:bg-slate-50 transition-all text-slate-600 admin-interface-dark:border-slate-800 admin-interface-dark:hover:bg-slate-800/50 admin-interface-dark:text-slate-300"
            >
              <Download className="h-4 w-4" /> 导出 Excel
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={cn(
                  "h-12 rounded-2xl gap-2 font-bold px-6 border-slate-200 hover:bg-slate-50 transition-all admin-interface-dark:border-slate-800 admin-interface-dark:hover:bg-slate-800/50 admin-interface-dark:text-slate-300",
                  statusFilter !== 'all' && "border-primary text-primary bg-primary/5"
                )}>
                  <Filter className="h-4 w-4" />
                  {statusFilter === 'all' ? '筛选' : statusFilter === 'pending' ? '待处理' : '已处理'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-slate-100 shadow-xl admin-interface-dark:bg-slate-950 admin-interface-dark:border-slate-900">
                <DropdownMenuCheckboxItem 
                  checked={statusFilter === 'all'}
                  onCheckedChange={() => {
                    setStatusFilter('all');
                    setCurrentPage(1);
                  }}
                  className="rounded-xl font-medium"
                >
                  全部询盘
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator className="bg-slate-50 admin-interface-dark:bg-slate-900" />
                <DropdownMenuCheckboxItem 
                  checked={statusFilter === 'pending'}
                  onCheckedChange={() => {
                    setStatusFilter('pending');
                    setCurrentPage(1);
                  }}
                  className="rounded-xl font-medium text-orange-600 focus:text-orange-600 admin-interface-dark:text-orange-400 admin-interface-dark:focus:text-orange-400"
                >
                  待处理
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={statusFilter === 'processed'}
                  onCheckedChange={() => {
                    setStatusFilter('processed');
                    setCurrentPage(1);
                  }}
                  className="rounded-xl font-medium text-green-600 focus:text-green-600 admin-interface-dark:text-green-400 admin-interface-dark:focus:text-green-400"
                >
                  已处理
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              onClick={() => setIsSettingsOpen(true)}
              className="h-12 w-12 rounded-2xl p-0 border-slate-200 hover:bg-slate-50 transition-all admin-interface-dark:border-slate-800 admin-interface-dark:hover:bg-slate-800/50 admin-interface-dark:text-slate-300 animate-in fade-in"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] overflow-hidden admin-interface-dark:bg-slate-950/40 admin-interface-dark:border-slate-900">
        <Table>
          <TableHeader className="bg-slate-50/50 admin-interface-dark:bg-slate-900/30">
            <TableRow className="hover:bg-transparent border-slate-100 admin-interface-dark:border-slate-900">
              <TableHead className="w-[240px] py-4 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 admin-interface-dark:text-slate-500">客户信息</TableHead>
              <TableHead className="max-w-[300px] py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 admin-interface-dark:text-slate-500">公司/主题</TableHead>
              <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 admin-interface-dark:text-slate-500 text-center">状态</TableHead>
              <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 admin-interface-dark:text-slate-500 text-center">邮件状态</TableHead>
              <TableHead className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 admin-interface-dark:text-slate-500">日期</TableHead>
              <TableHead className="w-[100px] py-4 px-8 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 admin-interface-dark:text-slate-500">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest admin-interface-dark:text-slate-700">数据加载中...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center admin-interface-dark:bg-slate-900/50">
                      <MessageSquare className="h-8 w-8 text-slate-200 admin-interface-dark:text-slate-800" />
                    </div>
                    <p className="text-sm font-medium text-slate-400 admin-interface-dark:text-slate-600">暂无询盘记录</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedInquiries.map((inquiry: any) => (
                <TableRow key={inquiry.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100 admin-interface-dark:hover:bg-slate-900/20 admin-interface-dark:border-slate-900">
                  <TableCell className="py-4 px-8">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors admin-interface-dark:text-slate-100">{inquiry.name}</span>
                        {inquiry.dossier?.leadRating && (
                          <span className={cn(
                            "text-[9px] leading-none font-semibold px-1.5 py-[3px] rounded-full inline-flex items-center gap-0.5 shrink-0",
                            inquiry.dossier.leadRating.includes('极高') 
                              ? "bg-rose-50 text-rose-600 admin-interface-dark:bg-rose-950/30 admin-interface-dark:text-rose-400 border border-rose-200/50" 
                              : inquiry.dossier.leadRating.includes('深度') 
                              ? "bg-blue-50 text-blue-600 admin-interface-dark:bg-blue-950/30 admin-interface-dark:text-blue-400 border border-blue-200/50" 
                              : "bg-slate-100 text-slate-500 admin-interface-dark:bg-slate-900 admin-interface-dark:text-slate-400"
                          )}>
                            {inquiry.dossier.leadRating.split(' ')[0]} {inquiry.dossier.leadRating.split(' ')[1]}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 mt-1 admin-interface-dark:text-slate-500">{inquiry.email}</span>
                      {inquiry.dossier?.location && inquiry.dossier.location !== '未知国家/地区' && (
                        <span className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 admin-interface-dark:text-slate-500">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{inquiry.dossier.location}</span>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col max-w-[300px]">
                      <span className="text-sm font-medium text-slate-700 truncate admin-interface-dark:text-slate-300">{inquiry.company || '个人客户'}</span>
                      <span className="text-xs text-slate-400 mt-1 truncate admin-interface-dark:text-slate-500">{inquiry.message}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <Badge className={cn(
                      "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-none shadow-sm pointer-events-none",
                      inquiry.status === 'pending' ? "bg-orange-50 text-orange-600 admin-interface-dark:bg-orange-950/30 admin-interface-dark:text-orange-400" :
                      inquiry.status === 'processed' ? "bg-green-50 text-green-600 admin-interface-dark:bg-green-950/30 admin-interface-dark:text-green-400" : "bg-slate-50 text-slate-400 admin-interface-dark:bg-slate-900/50 admin-interface-dark:text-slate-400"
                    )}>
                      {inquiry.status === 'pending' ? '待处理' : '已处理'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    {inquiry.dossier?.mailStatus === 'failed' || inquiry.dossier?.mailStatus === 'unconfigured' ? (
                      <Badge
                        title={inquiry.dossier?.mailError || ''}
                        className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-none shadow-sm bg-rose-50 text-rose-600 hover:bg-rose-100 admin-interface-dark:bg-rose-950/30 admin-interface-dark:text-rose-400 admin-interface-dark:hover:bg-rose-950/50 gap-1"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {inquiry.dossier.mailStatus === 'unconfigured' ? '未配置SMTP' : '转发失败'}
                      </Badge>
                    ) : (
                      <Badge className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-none shadow-sm pointer-events-none",
                        inquiry.emailViewedAt
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-50 animate-pulse admin-interface-dark:bg-blue-950/30 admin-interface-dark:text-blue-400 admin-interface-dark:hover:bg-blue-950/30"
                          : "bg-slate-50 text-slate-400 hover:bg-slate-50 admin-interface-dark:bg-slate-900/50 admin-interface-dark:text-slate-400 admin-interface-dark:hover:bg-slate-900/50"
                      )}>
                        {inquiry.emailViewedAt ? '邮件已阅' : '尚未查阅'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-xs font-medium text-slate-400 admin-interface-dark:text-muted-foreground">
                      {formatTimeSafe(inquiry.createdAt, 'yyyy-MM-dd HH:mm')}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-8 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setIsDetailOpen(true);
                      }}
                      className="h-10 w-10 rounded-xl hover:bg-primary/15 hover:text-primary transition-all"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {!isLoading && filteredInquiries.length > 0 && (
          <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between admin-interface-dark:bg-slate-950/50 admin-interface-dark:border-slate-900">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest admin-interface-dark:text-slate-500">
              显示 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredInquiries.length)} 共 {filteredInquiries.length} 条
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="h-10 w-10 rounded-xl border-slate-200 disabled:opacity-30 admin-interface-dark:border-slate-800 admin-interface-dark:hover:bg-slate-800/50 admin-interface-dark:text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 px-2">
                <span className="text-xs font-bold text-slate-900 admin-interface-dark:text-white">{currentPage}</span>
                <span className="text-xs font-bold text-slate-400 admin-interface-dark:text-slate-600">/</span>
                <span className="text-xs font-bold text-slate-400 admin-interface-dark:text-slate-600">{totalPages}</span>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="h-10 w-10 rounded-xl border-slate-200 disabled:opacity-30 admin-interface-dark:border-slate-800 admin-interface-dark:hover:bg-slate-800/50 admin-interface-dark:text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl admin-interface-dark:bg-slate-950 admin-interface-dark:border admin-interface-dark:border-slate-900">
          {selectedInquiry && (
            <div className="flex flex-col">
              <div className="bg-slate-900 p-10 text-white relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-32 -translate-y-32" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                        <UserCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-headline font-bold">{selectedInquiry.name}</DialogTitle>
                        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Inquiry Details Protocol</p>
                      </div>
                    </div>
                  </div>
                  <Badge className={cn(
                    "rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-none h-10 flex items-center",
                    selectedInquiry.status === 'pending' ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"
                  )}>
                    {selectedInquiry.status === 'pending' ? '待处理 PENDING' : '已完成 PROCESSED'}
                  </Badge>
                </div>
              </div>

              <div className="p-10 space-y-10 bg-white max-h-[70vh] overflow-y-auto scrollbar-minimal admin-interface-dark:bg-slate-950">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1 admin-interface-dark:text-slate-500">
                        <Mail className="h-3 w-3 text-primary" /> 电子邮箱
                      </label>
                      <div className="h-14 px-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between group admin-interface-dark:bg-slate-900/50 admin-interface-dark:border-slate-800">
                        <span className="text-sm font-medium text-slate-700 truncate mr-2 admin-interface-dark:text-slate-300">{selectedInquiry.email}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={() => window.open(`mailto:${selectedInquiry.email}`)}>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1 admin-interface-dark:text-slate-500">
                        <Eye className="h-3 w-3 text-primary" /> 邮件通知与查阅状态
                      </label>
                      <div className={cn(
                        "min-h-[56px] px-4 py-2 rounded-lg border flex items-center justify-between gap-2",
                        (selectedInquiry.dossier?.mailStatus === 'failed' || selectedInquiry.dossier?.mailStatus === 'unconfigured')
                          ? "bg-rose-50 border-rose-200 admin-interface-dark:bg-rose-950/20 admin-interface-dark:border-rose-900/40"
                          : selectedInquiry.emailViewedAt
                          ? "bg-green-50 border-green-100 admin-interface-dark:bg-green-950/20 admin-interface-dark:border-green-900/30"
                          : "bg-slate-50 border-slate-100 admin-interface-dark:bg-slate-900/50 admin-interface-dark:border-slate-800"
                      )}>
                        <div className="min-w-0 flex-1">
                          {(selectedInquiry.dossier?.mailStatus === 'failed' || selectedInquiry.dossier?.mailStatus === 'unconfigured') ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 admin-interface-dark:text-rose-400">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                <span>{selectedInquiry.dossier.mailStatus === 'unconfigured' ? '未配置发信服务器' : '自动转发邮件失败'}</span>
                              </div>
                              {selectedInquiry.dossier?.mailError && (
                                <p className="text-[10px] text-rose-500/80 truncate" title={selectedInquiry.dossier.mailError}>
                                  {selectedInquiry.dossier.mailError}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", selectedInquiry.emailViewedAt ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
                              <span className={cn("text-sm font-bold uppercase tracking-tight", selectedInquiry.emailViewedAt ? "text-green-700 admin-interface-dark:text-green-400" : "text-slate-400 admin-interface-dark:text-slate-500")}>
                                {selectedInquiry.emailViewedAt ? '邮件已查阅' : '邮件未查阅'}
                              </span>
                              {selectedInquiry.emailViewedAt && (
                                <span className="text-[10px] font-bold text-green-600/60 uppercase ml-1">
                                  {format(new Date(selectedInquiry.emailViewedAt), 'HH:mm')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isResendingEmail}
                          onClick={() => handleResendEmail(selectedInquiry.id)}
                          className="h-8 px-2.5 text-[11px] font-bold gap-1 shrink-0 hover:bg-white/80 admin-interface-dark:hover:bg-slate-800"
                          title="手动重新转发询盘通知邮件"
                        >
                          <RefreshCw className={cn("h-3 w-3", isResendingEmail && "animate-spin")} />
                          {isResendingEmail ? '发送中' : '重发'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1 admin-interface-dark:text-slate-500">
                        <Phone className="h-3 w-3 text-primary" /> 联系电话
                      </label>
                      <div className="h-14 px-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center admin-interface-dark:bg-slate-900/50 admin-interface-dark:border-slate-800">
                        <span className="text-sm font-medium text-slate-700 admin-interface-dark:text-slate-300">{selectedInquiry.phone || '未提供'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1 admin-interface-dark:text-slate-500">
                        <Building2 className="h-3 w-3 text-primary" /> 公司名称
                      </label>
                      <div className="h-14 px-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center admin-interface-dark:bg-slate-900/50 admin-interface-dark:border-slate-800">
                        <span className="text-sm font-medium text-slate-700 truncate admin-interface-dark:text-slate-300">{selectedInquiry.company || '个人客户'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1 admin-interface-dark:text-slate-500">
                        <Calendar className="h-3 w-3 text-primary" /> 提交时间
                      </label>
                      <div className="h-14 px-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center admin-interface-dark:bg-slate-900/50 admin-interface-dark:border-slate-800">
                        <span className="text-sm font-medium text-slate-700 admin-interface-dark:text-slate-300">
                          {formatTimeSafe(selectedInquiry.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 admin-interface-dark:border-slate-900">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1 admin-interface-dark:text-slate-500">
                    <MessageSquare className="h-3 w-3 text-primary" /> 咨询内容
                  </label>
                  <div className="p-8 bg-slate-50 rounded-lg border border-slate-100 admin-interface-dark:bg-slate-900/50 admin-interface-dark:border-slate-800">
                    <p className="text-sm text-slate-600 leading-loose font-medium whitespace-pre-wrap admin-interface-dark:text-slate-300">
                      {selectedInquiry.message}
                    </p>
                  </div>
                </div>

                {selectedInquiry.productId && (
                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between admin-interface-dark:bg-primary/10 admin-interface-dark:border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm admin-interface-dark:bg-slate-900">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">关联产品 (Linked Product)</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5 admin-interface-dark:text-slate-200">
                          {selectedInquiry.productName ? `${selectedInquiry.productName} (ID: ${selectedInquiry.productId})` : `ID: ${selectedInquiry.productId}`}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open(`/products/${selectedInquiry.productId}`, '_blank')}
                      className="rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 text-primary gap-1"
                    >
                      查看产品 <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}

                {/* 客户战术画像分析专栏 */}
                <div className="space-y-4 pt-4 border-t border-slate-100 admin-interface-dark:border-slate-900">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1 admin-interface-dark:text-slate-500">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" /> 客户战术画像分析 (Sales Intelligence Dossier)
                    </label>
                    {selectedInquiry.dossier?.leadRating ? (
                      <Badge className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-bold border-none shadow-sm",
                        selectedInquiry.dossier.leadRating.includes('极高') 
                          ? "bg-rose-50 text-rose-600 border border-rose-200/60 admin-interface-dark:bg-rose-950/30 admin-interface-dark:text-rose-400"
                          : selectedInquiry.dossier.leadRating.includes('深度')
                          ? "bg-blue-50 text-blue-600 border border-blue-200/60 admin-interface-dark:bg-blue-950/30 admin-interface-dark:text-blue-400"
                          : "bg-slate-100 text-slate-600 admin-interface-dark:bg-slate-900 admin-interface-dark:text-slate-400"
                      )}>
                        {selectedInquiry.dossier.leadRating}
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-slate-400 admin-interface-dark:text-slate-600">未采集隐性画像</span>
                    )}
                  </div>

                  {selectedInquiry.dossier ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* 所在国家/地区（严格符合隐私授权条款） */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 admin-interface-dark:bg-slate-900/40 admin-interface-dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 admin-interface-dark:text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> 所在国家/地区
                        </p>
                        <p className="text-sm font-semibold text-slate-800 admin-interface-dark:text-slate-200">
                          {selectedInquiry.dossier.location || '未知国家/地区'}
                        </p>
                      </div>

                      {/* 建议沟通语种 */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 admin-interface-dark:bg-slate-900/40 admin-interface-dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 admin-interface-dark:text-slate-500">
                          <Languages className="h-3.5 w-3.5 text-primary" /> 建议沟通语种
                        </p>
                        <p className="text-sm font-semibold text-slate-800 admin-interface-dark:text-slate-200">
                          {selectedInquiry.dossier.language || '未知'}
                        </p>
                      </div>

                      {/* 站内总停留 */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 admin-interface-dark:bg-slate-900/40 admin-interface-dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 admin-interface-dark:text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-primary" /> 站内总停留时长
                        </p>
                        <p className="text-sm font-semibold text-slate-800 admin-interface-dark:text-slate-200">
                          {selectedInquiry.dossier.dwellTime || '刚刚进站'}
                        </p>
                      </div>

                      {/* 规格书PDF下载 */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 admin-interface-dark:bg-slate-900/40 admin-interface-dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 admin-interface-dark:text-slate-500">
                          <FileDown className="h-3.5 w-3.5 text-primary" /> 规格书PDF下载
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-bold",
                            selectedInquiry.dossier.pdfDownloaded ? "text-emerald-600 admin-interface-dark:text-emerald-400" : "text-slate-500"
                          )}>
                            {selectedInquiry.dossier.pdfDownloaded ? '已下载技术规格表' : '未下载'}
                          </span>
                          {selectedInquiry.dossier.pdfDownloaded && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-300 text-emerald-600 bg-emerald-50">
                              高意向
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* 流量来源渠道 */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 admin-interface-dark:bg-slate-900/40 admin-interface-dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 admin-interface-dark:text-slate-500">
                          <Compass className="h-3.5 w-3.5 text-primary" /> 流量来源渠道
                        </p>
                        <p className="text-sm font-semibold text-slate-800 truncate admin-interface-dark:text-slate-200">
                          {selectedInquiry.dossier.channel || '直接访问'}
                        </p>
                      </div>

                      {/* 对比浏览产品型号 */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 admin-interface-dark:bg-slate-900/40 admin-interface-dark:border-slate-800 sm:col-span-2 lg:col-span-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 admin-interface-dark:text-slate-500">
                          <Layers className="h-3.5 w-3.5 text-primary" /> 对比浏览产品
                        </p>
                        <p className="text-sm font-semibold text-slate-800 truncate admin-interface-dark:text-slate-200">
                          {selectedInquiry.dossier.comparedProducts && selectedInquiry.dossier.comparedProducts.length > 0
                            ? selectedInquiry.dossier.comparedProducts.join('、')
                            : '仅关注当前询盘产品'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center admin-interface-dark:bg-slate-900/20 admin-interface-dark:border-slate-800">
                      <p className="text-xs text-slate-400 admin-interface-dark:text-slate-500">
                        该询盘提交时未携带访客会话追踪或属于历史询盘记录
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6 admin-interface-dark:border-slate-900 admin-interface-dark:bg-slate-950/50">
                <Button 
                  variant="ghost" 
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="h-12 rounded-2xl text-destructive hover:bg-destructive/5 hover:text-destructive gap-2 font-bold uppercase tracking-widest text-[10px]"
                >
                  <Trash2 className="h-4 w-4" />
                  永久删除记录
                </Button>

                <div className="flex items-center gap-4">
                  {selectedInquiry.status === 'pending' ? (
                    <Button 
                      onClick={() => handleStatusChange(selectedInquiry.id, 'processed')}
                      className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 gap-2 font-bold uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      标记为已处理
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => handleStatusChange(selectedInquiry.id, 'pending')}
                      className="h-12 px-8 rounded-full border-slate-200 text-slate-600 gap-2 font-bold uppercase tracking-widest text-[10px] admin-interface-dark:border-slate-800 admin-interface-dark:text-slate-300 admin-interface-dark:hover:bg-slate-900"
                    >
                      <Clock className="h-4 w-4" />
                      设为待处理
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl admin-interface-dark:bg-slate-950 admin-interface-dark:border admin-interface-dark:border-slate-900">
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full translate-x-32 -translate-y-32" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold">系统转发与发信设置</DialogTitle>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">SMTP & Forwarding Protocol</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-8 bg-white max-h-[60vh] overflow-y-auto scrollbar-minimal admin-interface-dark:bg-slate-950">
            {/* 转发设置 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-3 w-3 text-primary" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest admin-interface-dark:text-slate-200">通知转发 (Forwarding)</h3>
              </div>
              <div className="space-y-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 admin-interface-dark:bg-slate-900/50 admin-interface-dark:border-slate-800">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 admin-interface-dark:text-slate-400">管理员接收邮箱</Label>
                  <Input 
                    placeholder="admin@example.com"
                    value={settings.inquiry_forward_email}
                    onChange={(e) => setSettings(s => ({ ...s, inquiry_forward_email: e.target.value }))}
                    className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-primary/20 admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-800 admin-interface-dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* SMTP 设置 (折叠) */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="smtp-settings" className="border-none">
                <AccordionTrigger className="hover:no-underline py-0">
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-5 w-5 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Server className="h-3 w-3 text-blue-500" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest admin-interface-dark:text-slate-200">发信服务器 (SMTP)</h3>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="pt-4 pb-0">
                  <div className="space-y-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 admin-interface-dark:bg-slate-900/50 admin-interface-dark:border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 admin-interface-dark:text-slate-400">SMTP 主机</Label>
                        <Input 
                          placeholder="smtp.example.com"
                          value={settings.smtp_host}
                          onChange={(e) => setSettings(s => ({ ...s, smtp_host: e.target.value }))}
                          className="h-11 rounded-xl bg-white border-slate-200 admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-800 admin-interface-dark:text-slate-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 admin-interface-dark:text-slate-400">端口</Label>
                        <Input 
                          placeholder="587"
                          value={settings.smtp_port}
                          onChange={(e) => setSettings(s => ({ ...s, smtp_port: e.target.value }))}
                          className="h-11 rounded-xl bg-white border-slate-200 admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-800 admin-interface-dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 admin-interface-dark:text-slate-400">SMTP 用户名</Label>
                        <Input 
                          placeholder="user@example.com"
                          value={settings.smtp_user}
                          onChange={(e) => setSettings(s => ({ ...s, smtp_user: e.target.value }))}
                          className="h-11 rounded-xl bg-white border-slate-200 admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-800 admin-interface-dark:text-slate-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 admin-interface-dark:text-slate-400">SMTP 密码</Label>
                        <Input 
                          type="password"
                          placeholder="••••••••"
                          value={settings.smtp_password}
                          onChange={(e) => setSettings(s => ({ ...s, smtp_password: e.target.value }))}
                          className="h-11 rounded-xl bg-white border-slate-200 admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-800 admin-interface-dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 admin-interface-dark:bg-slate-900 admin-interface-dark:border-slate-800">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold text-slate-700 admin-interface-dark:text-slate-300">SSL/TLS 安全连接</Label>
                        <p className="text-[10px] text-slate-400 admin-interface-dark:text-slate-500">开启后将使用 465 端口或强制加密</p>
                      </div>
                      <Switch 
                        checked={settings.smtp_secure === 'true'}
                        onCheckedChange={(checked) => setSettings(s => ({ ...s, smtp_secure: String(checked) }))}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-3 admin-interface-dark:border-slate-900 admin-interface-dark:bg-slate-950/50">
            <Button 
              variant="outline" 
              disabled={isTestingSmtp}
              onClick={async () => {
                if (!settings.smtp_host || !settings.smtp_user || !settings.inquiry_forward_email) {
                  toast({ variant: "destructive", title: "请先填写完整的 SMTP 设置和接收邮箱" });
                  return;
                }
                setIsTestingSmtp(true);
                try {
                  const res = await fetch('/api/admin/settings/test-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      host: settings.smtp_host,
                      port: settings.smtp_port,
                      secure: settings.smtp_secure,
                      user: settings.smtp_user,
                      pass: settings.smtp_password,
                      to: settings.inquiry_forward_email
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    toast({ title: "测试邮件已发送", description: `请检查 ${settings.inquiry_forward_email}` });
                  } else {
                    throw new Error(data.error);
                  }
                } catch (e: any) {
                  toast({ variant: "destructive", title: "连接测试失败", description: e.message });
                } finally {
                  setIsTestingSmtp(false);
                }
              }}
              className="rounded-2xl font-bold h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-100 admin-interface-dark:border-slate-800 admin-interface-dark:text-slate-300 admin-interface-dark:hover:bg-slate-900"
            >
              {isTestingSmtp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isTestingSmtp ? '正在测试...' : '测试连接并发送邮件'}
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsSettingsOpen(false)} className="rounded-2xl font-bold h-12 px-6">
                取消
              </Button>
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSavingSettings}
                className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold h-12 px-10 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                保存全局配置
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

