"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Maximize, Hash, Search, Lock, Eye, EyeOff, ShieldAlert, AlertCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const InputSpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isBackend = variant === 'backend';

  return (
    <section id={isBackend ? "admin-shared-05" : "section-05"} className="space-y-10">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">
          {isBackend ? "05. 输入系统规范 (Admin Input System)" : "05. 输入系统规范 (Inputs)"}
        </h2>
      </div>

      <div className={cn(
        "p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20",
        isBackend ? "bg-muted/5" : "bg-white"
      )}>
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Maximize className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">5.1 高度尺寸标准 (Input Scale)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
            <div className="space-y-2">
              <Label className={cn("text-[9px] font-bold uppercase", isBackend ? "text-primary/60" : "opacity-40")}>Extra Small / 28px</Label>
              <Input className={cn("h-7 rounded-md", isBackend ? "text-[10px] bg-muted/20 border-border/60" : "text-[10px]")} placeholder="XS Input..." />
            </div>
            <div className="space-y-2">
              <Label className={cn("text-[9px] font-bold uppercase", isBackend ? "text-primary/60" : "opacity-40")}>Small / 36px</Label>
              <Input className={cn("h-9 rounded-lg", isBackend ? "text-[11px] bg-muted/20 border-border/60" : "text-[11px]")} placeholder="SM Input..." />
            </div>
            <div className="space-y-2">
              <Label className={cn("text-[9px] font-bold uppercase", isBackend ? "text-primary/60" : "opacity-40")}>Default / 44px</Label>
              <Input className={cn("h-11 rounded-xl", isBackend ? "text-xs bg-muted/20 border-border/60 focus:bg-muted/10" : "text-xs")} placeholder="Base Input..." />
            </div>
            <div className="space-y-2">
              <Label className={cn("text-[9px] font-bold uppercase", isBackend ? "text-primary/60" : "opacity-40")}>Large / 56px</Label>
              <Input className={cn("h-14 rounded-2xl", isBackend ? "text-sm bg-muted/20 border-border/60" : "text-sm")} placeholder="LG Input..." />
            </div>
          </div>
          {isBackend && (
            <p className="text-[10px] text-muted-foreground italic mt-4 border-l-2 border-primary/20 pl-4">
              后台规范：表单内容与 Placeholder 强制对齐 text-xs (12px)。聚焦时背景由 bg-muted/20 变为 bg-muted/10。
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-10">
            <div className="space-y-8">
               <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Hash className="h-4 w-4" /> 复合型输入框 (Composite Inputs)</span>
               <div className="space-y-6">
                 <div className="space-y-2">
                   <Label className={cn("text-[9px] font-bold uppercase", isBackend ? "text-primary/60" : "opacity-40")}>Icon Prefix / 搜索模式</Label>
                   <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                     <Input className={cn("h-12 pl-12 rounded-2xl border-none shadow-inner", isBackend ? "bg-muted/20" : "bg-muted/10")} placeholder="输入搜索关键词..." />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label className={cn("text-[9px] font-bold uppercase", isBackend ? "text-primary/60" : "opacity-40")}>Password with Toggle / 密码态</Label>
                   <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                     <Input 
                       type={showPassword ? "text" : "password"} 
                       className={cn("h-12 pl-12 pr-12 rounded-2xl", isBackend ? "bg-muted/20 border-border/60 text-xs" : "")} 
                       placeholder="请输入登录密码" 
                       defaultValue="secure_password_123"
                     />
                     <button 
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                     >
                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </button>
                   </div>
                 </div>
                 <div className="space-y-2">
                    <Label className={cn("text-[9px] font-bold uppercase", isBackend ? "text-primary/60" : "opacity-40")}>Action Suffix / 组合模式</Label>
                    <div className="flex gap-2">
                       <Input className={cn("h-12 rounded-2xl flex-1", isBackend ? "bg-muted/20 border-border/60 text-xs" : "")} placeholder="Enter coupon code..." />
                       <Button className="h-12 px-6 rounded-2xl uppercase font-bold text-[10px] tracking-widest">Apply</Button>
                    </div>
                 </div>
               </div>
            </div>
          </div>
          <div className="space-y-10">
            <div className="space-y-8">
               <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> 5.3 状态逻辑展示 (State Matrix)</span>
               <div className="grid grid-cols-1 gap-6">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase text-destructive">Error State / 校验失败</Label>
                    <div className="relative">
                       <Input className={cn("h-12 rounded-2xl border-destructive bg-destructive/5 text-destructive focus-visible:ring-destructive/10", isBackend ? "text-xs" : "")} defaultValue="invalid_email@format" />
                       <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                    </div>
                    <p className="text-[9px] font-bold text-destructive uppercase tracking-tight">请输入有效的电子邮箱地址</p>
                 </div>
                 <div className="space-y-2">
                    <Label className={cn("text-[9px] font-bold uppercase", isBackend ? "text-primary/60" : "opacity-40")}>Disabled State / 禁用锁定</Label>
                    <Input disabled className={cn("h-12 rounded-2xl", isBackend ? "bg-muted/10 border-border/40 text-xs" : "")} defaultValue="readonly_data_field" />
                 </div>
                 <div className="space-y-2">
                    <Label className={cn("text-[9px] font-bold uppercase", isBackend ? "text-primary/60" : "opacity-40")}>Multi-line Textarea / 多行文本</Label>
                    <Textarea className={cn("min-h-[120px] rounded-lg px-3 py-2 leading-relaxed", isBackend ? "text-xs bg-muted/20 border-border/60" : "text-xs")} placeholder="在此输入详细的硬件项目需求说明..." />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
InputSpecification.displayName = "InputSpecification";
