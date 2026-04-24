"use client";

import React, { useState, useMemo } from 'react';
import { 
  TableProperties, 
  Maximize, 
  Workflow, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  ChevronRight 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const TableSpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['ord-1']));
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'time', direction: 'desc' });

  const businessData = [
    { name: '智能零售终端 A1', stock: 1240, transit: 450, time: 1717564800000, timeStr: '2024.06.05 12:00' },
    { name: '工业一体机 H24', stock: 850, transit: 120, time: 1717568400000, timeStr: '2024.06.05 13:00' },
    { name: '医疗显控模组 M1', stock: 320, transit: 85, time: 1717572000000, timeStr: '2024.06.05 14:00' },
  ];

  const sortedBusinessData = useMemo(() => {
    const sorted = [...businessData];
    sorted.sort((a, b) => {
      if (a.time < b.time) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a.time > b.time) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [sortConfig]);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <section id={variant === "frontend" ? "section-06" : "admin-06"} className="space-y-10">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">06. 表格系统规范 (Tables)</h2>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-12">
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><TableProperties className="h-4 w-4" /> 6.1 基础形态与业务状态 (Styles & Status)</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">斑马纹带状态表格 (Zebra with Status)</p>
              <div className="rounded-2xl border overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest pl-6">ID</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest">任务名称</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest pr-6">当前进度</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="even:bg-muted/20 hover:bg-primary/5 transition-colors">
                      <TableCell className="text-xs font-mono pl-6 opacity-40">#001</TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                           <span className="text-xs font-bold">核心主板 SMT 贴片</span>
                           <Badge className="w-fit mt-1 h-4 text-[7px] bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors cursor-default">运行中 / LIVE</Badge>
                         </div>
                      </TableCell>
                      <TableCell className="pr-6 w-32">
                         <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] font-bold uppercase"><span className="opacity-40">Progress</span><span>85%</span></div>
                            <Progress value={85} className="h-1" />
                         </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="even:bg-muted/20 hover:bg-primary/5 transition-colors">
                      <TableCell className="text-xs font-mono pl-6 opacity-40">#002</TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                           <span className="text-xs font-bold">24寸屏体老化测试</span>
                           <Badge variant="outline" className="w-fit mt-1 h-4 text-[7px] bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-colors cursor-default">待检 / WAITING</Badge>
                         </div>
                      </TableCell>
                      <TableCell className="pr-6 w-32">
                         <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] font-bold uppercase"><span className="opacity-40">Progress</span><span>12%</span></div>
                            <Progress value={12} className="h-1 [&>div]:bg-orange-400" />
                         </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">无边框与极简状态 (Borderless & Minimal)</p>
              <Table>
                <TableHeader className="border-b-2 border-primary/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[9px] font-bold uppercase text-primary">工程参数</TableHead>
                    <TableHead className="text-[9px] font-bold uppercase text-primary text-right">监控指标</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b-0 hover:bg-primary/5 transition-colors">
                    <TableCell className="text-xs font-medium flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> 电压稳定性 (V_IN)
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono font-bold text-primary">220.4 V</TableCell>
                  </TableRow>
                  <TableRow className="border-b-0 hover:bg-primary/5 transition-colors">
                    <TableCell className="text-xs font-medium flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-destructive" /> 环境湿度控制
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono font-bold text-destructive">68.2% RH</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-12">
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Maximize className="h-4 w-4" /> 6.2 固定表头与固定列 (Sticky & Fixed)</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">固定表头型 (Sticky Header / Y-Axis)</p>
              <div className="rounded-2xl border border-separate border-spacing-0 overflow-hidden shadow-inner bg-white relative">
                <div className="max-h-[300px] overflow-y-auto scrollbar-minimal">
                  <Table className="border-separate border-spacing-0">
                    <TableHeader className="sticky top-0 z-40">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="sticky top-0 z-50 bg-muted font-bold text-[9px] uppercase pl-6 py-4 border-b border-border/60 shadow-sm">检测项</TableHead>
                        <TableHead className="sticky top-0 z-50 bg-muted font-bold text-[9px] uppercase py-4 border-b border-border/60 shadow-sm">检测时间</TableHead>
                        <TableHead className="sticky top-0 z-50 bg-muted font-bold text-[9px] uppercase pr-6 py-4 text-right border-b border-border/60 shadow-sm">结果</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 15 }).map((_, i) => (
                        <TableRow key={i} className="hover:bg-muted/5 transition-colors border-b">
                          <TableCell className="text-xs font-bold pl-6 py-4 flex items-center gap-2 bg-white">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary/20" /> QA_STEP_{100 + i}
                          </TableCell>
                          <TableCell className="text-[10px] opacity-40 font-mono bg-white">2024.06.05 14:00:{i < 10 ? `0${i}` : i}</TableCell>
                          <TableCell className="pr-6 text-right font-bold text-green-600 text-[10px] uppercase bg-white">Pass</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">固定首列型 (Fixed Column / X-Axis)</p>
              <div className="rounded-2xl border border-separate border-spacing-0 overflow-hidden shadow-inner bg-white relative">
                <div className="max-w-full overflow-x-auto scrollbar-minimal">
                  <div className="min-w-[1200px]">
                    <Table className="border-separate border-spacing-0">
                      <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-b">
                          <TableHead className="sticky left-0 top-0 z-50 bg-muted font-bold text-[9px] uppercase pl-6 border-r border-border/60 py-4 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">核心产品型号 (Fixed)</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center py-4 bg-muted/30">主板架构</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center py-4 bg-muted/30">显示规格</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center py-4 bg-muted/30">内存通道</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase text-center py-4 bg-muted/30">存储插槽</TableHead>
                          <TableHead className="text-[9px] font-bold uppercase pr-6 text-right py-4 bg-muted/30">发布时间</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { model: 'Heovose H24 Pro', arch: 'Intel Alder Lake', disp: '23.8" IPS 1080P', mem: 'DDR4 Dual', storage: '2x M.2 NVMe', date: '2024 Q3' },
                          { model: 'Mini M10 Lite', arch: 'AMD Ryzen 5000', disp: 'N/A (Mini PC)', mem: 'SO-DIMM DDR4', storage: '1x M.2 + 1x SATA', date: '2024 Q2' },
                          { model: 'X-Station Ultra', arch: 'Intel Core i9', disp: '32" 4K HDR', mem: 'DDR5 6400', storage: '4x M.2 Gen5', date: '2024 Q4' },
                        ].map((row, i) => (
                          <TableRow key={i} className="hover:bg-primary/5 group transition-colors border-b">
                            <TableCell className="sticky left-0 z-30 bg-white font-bold text-xs pl-6 border-r border-border/60 py-4 shadow-[4px_0_10px_rgba(0,0,0,0.1)] group-hover:bg-muted/10">{row.model}</TableCell>
                            <TableCell className="text-[11px] text-center opacity-60 py-4 bg-white group-hover:bg-transparent">{row.arch}</TableCell>
                            <TableCell className="text-[11px] text-center opacity-60 py-4 bg-white group-hover:bg-transparent">{row.disp}</TableCell>
                            <TableCell className="text-[11px] text-center opacity-60 py-4 bg-white group-hover:bg-transparent">{row.mem}</TableCell>
                            <TableCell className="text-[11px] text-center opacity-60 py-4 bg-white group-hover:bg-transparent">{row.storage}</TableCell>
                            <TableCell className="text-[10px] font-mono font-bold pr-6 text-right uppercase py-4 bg-white group-hover:bg-transparent">{row.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-border/40 shadow-sm space-y-12">
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Workflow className="h-4 w-4" /> 6.3 深度交互与逻辑展开 (Advanced Interaction)</span>
          </div>

          <div className="grid grid-cols-1 gap-12">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">多级表头与动态排序 (Multi-level & Sort)</p>
                 <Badge variant="outline" className="text-[8px] h-5"><Filter className="h-2.5 w-2.5 mr-1" /> ACTIVE ANALYTICS</Badge>
               </div>
               <div className="rounded-2xl border overflow-hidden shadow-sm">
                 <Table>
                   <TableHeader className="bg-muted/30">
                     <TableRow className="hover:bg-transparent border-none">
                       <TableHead rowSpan={2} className="pl-6 border-r font-bold text-[9px] uppercase tracking-tighter w-48">制造业务线 (Lines)</TableHead>
                       <TableHead colSpan={2} className="text-center border-b border-r font-bold text-[9px] uppercase tracking-widest py-3 bg-primary/5">库存与物流状态</TableHead>
                       <TableHead rowSpan={2} className="font-bold text-[9px] uppercase pr-6 text-right">
                          <div 
                            className="flex items-center justify-end gap-1 cursor-pointer hover:text-primary transition-colors group"
                            onClick={() => handleSort('time')}
                          >
                            最后审计时间
                            {sortConfig.key === 'time' && (
                              sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-primary animate-in zoom-in" /> : <ArrowDown className="h-3 w-3 text-primary animate-in zoom-in" />
                            )}
                            {sortConfig.key !== 'time' && <ArrowDown className="h-3 w-3 opacity-20 group-hover:opacity-100" />}
                          </div>
                       </TableHead>
                     </TableRow>
                     <TableRow className="hover:bg-transparent">
                       <TableHead className="text-[8px] font-bold uppercase text-center border-r py-2">仓储实存</TableHead>
                       <TableHead className="text-[8px] font-bold uppercase text-center border-r py-2">在途订单</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {sortedBusinessData.map((row, i) => (
                       <TableRow key={i} className="hover:bg-primary/5 transition-colors">
                         <TableCell className="pl-6 font-bold text-xs border-r">{row.name}</TableCell>
                         <TableCell className="text-center border-r font-mono text-xs font-bold text-primary">{row.stock.toLocaleString()}</TableCell>
                         <TableCell className="text-center border-r font-mono text-xs opacity-60">{row.transit.toLocaleString()}</TableCell>
                         <TableCell className="text-[10px] opacity-40 pr-6 uppercase text-right">{row.timeStr}</TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">可展开详情行 (Expandable Row Interaction)</p>
              <div className="rounded-2xl border overflow-hidden shadow-md">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-none">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest">订单 ID</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest">终端客户</TableHead>
                      <TableHead className="text-[9px] font-bold uppercase tracking-widest pr-6 text-right">订单估值 (USD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 'ord-1', code: '#ORD-2024-0051', client: 'Amazon EU Distribution', value: '$42,500.00', addr: 'Rue de Rivoli 75, Paris, France', items: 'H24 Pro x50, Mini M10 x120' },
                      { id: 'ord-2', code: '#ORD-2024-0052', client: 'Tesla R&D Center', value: '$18,200.00', addr: '3500 Deer Creek Rd, Palo Alto, USA', items: 'Custom Touch Panels x12, GPU Kits x5' },
                      { id: 'ord-3', code: '#ORD-2024-0053', client: 'Samsung Global Logistics', value: '$156,000.00', addr: 'Gyeonggi-do, South Korea', items: 'AIO Barebones x400, SSD Bulk x800' },
                      { id: 'ord-4', code: '#ORD-2024-0054', client: 'Siemens Industrial Automation', value: '$9,400.00', addr: 'Werner-von-Siemens-Strasse, Munich, DE', items: 'IP65 Monitors x20' },
                      { id: 'ord-5', code: '#ORD-2024-0055', client: 'Google Mountain View HQ', value: '$21,000.00', addr: '1600 Amphitheatre Pkwy, CA, USA', items: 'Micro PC Prototypes x30' }
                    ].map((row) => (
                      <React.Fragment key={row.id}>
                        <TableRow 
                          className={cn("cursor-pointer transition-all duration-300", expandedRows.has(row.id) ? "bg-primary/5" : "hover:bg-muted/10")} 
                          onClick={() => toggleRow(row.id)}
                        >
                          <TableCell className="pl-4">
                            <ChevronRight className={cn("h-4 w-4 transition-transform duration-500", expandedRows.has(row.id) && "rotate-90 text-primary")} />
                          </TableCell>
                          <TableCell className="text-xs font-mono font-bold text-primary">{row.code}</TableCell>
                          <TableCell className="text-xs font-medium">{row.client}</TableCell>
                          <TableCell className="text-xs font-mono font-bold pr-6 text-right text-primary">{row.value}</TableCell>
                        </TableRow>
                        {expandedRows.has(row.id) && (
                          <TableRow className="bg-muted/5 border-b-2 border-primary/10 animate-in fade-in slide-in-from-top-4 duration-700">
                            <TableCell colSpan={4} className="p-8">
                              <div className="grid grid-cols-3 gap-12">
                                <div className="space-y-2">
                                  <p className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">配送地址 / SHIPPING</p>
                                  <p className="text-xs font-medium leading-relaxed">{row.addr}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">物料清单 / ITEMS</p>
                                  <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground">{row.items}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">结算状态 / STATUS</p>
                                  <Badge className="h-5 text-[8px] font-bold bg-green-500 text-white border-none uppercase">Verified & Paid</Badge>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
TableSpecification.displayName = "TableSpecification";
