"use client";

import React from 'react';
import { 
  Maximize, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Download, 
  Monitor, 
  Layers, 
  AlignLeft, 
  AlignCenter, 
  AlignRight 
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export const ButtonSpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => (
  <section id={variant === 'frontend' ? "section-03" : "admin-03"} className="space-y-10">
    <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
      <div className="h-2 w-10 bg-primary rounded-full" />
      <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">03. 按钮系统规范定义 (Buttons)</h2>
    </div>

    <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Maximize className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">3.1 物理尺寸阶梯 (Size Scale)</span>
        </div>
        <div className="flex items-end gap-6 flex-wrap">
          <div className="space-y-3">
            <Button className="h-7 px-2 text-[9px] font-bold uppercase rounded-md">Extra Small</Button>
            <p className="text-[9px] text-center font-mono opacity-40">XS / 28px</p>
          </div>
          <div className="space-y-3">
            <Button className="h-9 px-4 text-[10px] font-bold uppercase rounded-lg">Small Action</Button>
            <p className="text-[9px] text-center font-mono opacity-40">SM / 36px</p>
          </div>
          <div className="space-y-3">
            <Button className="h-11 px-8 text-xs font-bold uppercase rounded-xl shadow-md">Default Button</Button>
            <p className="text-[9px] text-center font-mono opacity-40">BASE / 44px</p>
          </div>
          <div className="space-y-3">
            <Button className="h-14 px-12 text-sm font-bold uppercase rounded-2xl shadow-xl">Large Display</Button>
            <p className="text-[9px] text-center font-mono opacity-40">LG / 56px</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">3.2 状态语义按钮 (Status Matrix)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest border-l-2 border-green-600 pl-2">Safety / 安全</p>
            <div className="space-y-2">
              <Button className="w-full h-11 bg-green-600 hover:bg-green-700 text-white border-none rounded-xl font-bold text-[10px] uppercase gap-2"><CheckCircle2 className="h-3.5 w-3.5" /> 确认提交</Button>
              <Button variant="outline" className="w-full h-11 border-green-600 text-green-600 hover:bg-green-50 rounded-xl font-bold text-[10px] uppercase">线性样式</Button>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest border-l-2 border-blue-600 pl-2">Info / 信息</p>
            <div className="space-y-2">
              <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl font-bold text-[10px] uppercase gap-2"><Info className="h-3.5 w-3.5" /> 查看详情</Button>
              <Button variant="outline" className="w-full h-11 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-[10px] uppercase">辅助引导</Button>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest border-l-2 border-orange-600 pl-2">Warning / 警告</p>
            <div className="space-y-2">
              <Button className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white border-none rounded-xl font-bold text-[10px] uppercase gap-2"><AlertCircle className="h-3.5 w-3.5" /> 谨慎操作</Button>
              <Button variant="outline" className="w-full h-11 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-xl font-bold text-[10px] uppercase">风险提示</Button>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest border-l-2 border-destructive pl-2">Danger / 危险</p>
            <div className="space-y-2">
              <Button className="w-full h-11 bg-destructive hover:bg-destructive/90 text-white border-none rounded-xl font-bold text-[10px] uppercase gap-2"><Trash2 className="h-3.5 w-3.5" /> 永久删除</Button>
              <Button variant="outline" className="w-full h-11 border-destructive text-destructive hover:bg-destructive/5 rounded-xl font-bold text-[10px] uppercase">撤销更改</Button>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-l-2 border-muted pl-2">Disabled / 禁用</p>
            <div className="space-y-2">
              <Button disabled className="w-full h-11 rounded-xl font-bold text-[10px] uppercase">锁定状态</Button>
              <Button disabled variant="outline" className="w-full h-11 rounded-xl font-bold text-[10px] uppercase">无法点击</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Monitor className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">3.3 纯图标与混合交互</span>
          </div>
          <div className="flex items-center gap-4">
            <Button size="icon" className="h-12 w-12 rounded-full bg-primary text-white shadow-lg"><Plus className="h-6 w-6" /></Button>
            <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl border-primary text-primary"><Search className="h-5 w-5" /></Button>
            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5"><MoreHorizontal className="h-5 w-5" /></Button>
            <div className="h-10 w-px bg-border mx-4" />
            <Button className="h-12 px-6 rounded-2xl bg-muted/30 text-primary border-none font-bold text-[10px] uppercase gap-3 hover:bg-primary hover:text-white transition-all group/spec">
              <Download className="h-4 w-4 opacity-40 group-hover/spec:opacity-100 transition-opacity group-hover/spec:text-white" /> <span className="group-hover/spec:text-white">规格书下载</span>
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">3.4 模组化按钮组 (Button Groups)</span>
          </div>
          <div className="flex">
             <div className="inline-flex rounded-2xl border border-border/60 bg-muted/20 p-1 gap-1 overflow-hidden">
               <button className="h-10 px-4 rounded-xl bg-primary text-white hover:text-white text-[10px] font-bold uppercase shadow-sm">Grid View</button>
               <button className="h-10 px-4 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all text-[10px] font-bold uppercase">List View</button>
               <button className="h-10 px-4 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all text-[10px] font-bold uppercase">Table</button>
             </div>
          </div>
          <div className="flex">
             <div className="inline-flex rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
               <Button variant="ghost" size="icon" className="h-10 w-10 border-r rounded-none hover:bg-white hover:text-primary transition-colors"><AlignLeft className="h-4 w-4" /></Button>
               <Button variant="ghost" size="icon" className="h-10 w-10 border-r rounded-none hover:bg-white hover:text-primary transition-colors"><AlignCenter className="h-4 w-4" /></Button>
               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none hover:bg-white hover:text-primary transition-colors"><AlignRight className="h-4 w-4" /></Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
));
ButtonSpecification.displayName = "ButtonSpecification";
