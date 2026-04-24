"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { CheckCircle2, LayoutGrid, Zap, ChevronDown } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const ControlSpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => {
  const isBackend = variant === 'backend';
  
  return (
  <section id={isBackend ? "admin-shared-04" : "section-04"} className="space-y-10">
    <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
      <div className="h-2 w-10 bg-primary rounded-full" />
      <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">
        {isBackend ? "04. 交互组件单元规范 (Admin Controls)" : "04. 交互组件单元规范 (Controls)"}
      </h2>
    </div>

    <div className={cn(
      "p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20",
      isBackend ? "bg-muted/5" : "bg-white"
    )}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div className="space-y-8">
             <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> 多选框规范 (Checkbox Matrix)</p>
             <div className="flex flex-wrap gap-12">
                <div className="flex items-center space-x-3">
                  <Checkbox id="c-interactive" className="h-5 w-5 rounded-md" defaultChecked />
                  <Label htmlFor="c-interactive" className={cn("font-bold uppercase cursor-pointer", isBackend ? "text-[10px] text-primary" : "text-xs text-primary")}>可交互展示 (Interactive)</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox id="c-disabled" disabled className="h-5 w-5 rounded-md" />
                  <Label htmlFor="c-disabled" className={cn("font-bold uppercase", isBackend ? "text-[10px] opacity-20" : "text-xs opacity-20")}>禁用态 (Disabled)</Label>
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> 单选框规范 (Radio Group)</p>
             <div className="flex flex-wrap gap-12">
               <RadioGroup defaultValue="r-demo-1" className="flex items-center gap-12">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="r-demo-1" id="r1" className="h-5 w-5" />
                    <Label htmlFor="r1" className={cn("font-bold uppercase cursor-pointer", isBackend ? "text-[10px] text-primary" : "text-xs text-primary")}>选项 A (Active)</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="r-demo-2" id="r2" className="h-5 w-5" />
                    <Label htmlFor="r2" className={cn("font-bold uppercase cursor-pointer", isBackend ? "text-[10px] text-primary" : "text-xs text-primary")}>选项 B (Normal)</Label>
                  </div>
               </RadioGroup>
             </div>
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-8">
             <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Zap className="h-4 w-4" /> 开关按钮规范 (Toggle Switch)</p>
             <div className="flex flex-wrap gap-12">
                <div className="flex items-center space-x-4">
                  <Switch defaultChecked className="scale-110" id="s-interactive" />
                  <Label htmlFor="s-interactive" className={cn("font-bold uppercase cursor-pointer", isBackend ? "text-[10px] text-primary" : "text-xs text-primary")}>可交互开关 (Toggle)</Label>
                </div>
                <div className="flex items-center space-x-4 opacity-40">
                  <Switch disabled className="scale-110" />
                  <Label className={cn("font-bold uppercase", isBackend ? "text-[10px]" : "text-xs")}>锁定 (Disabled)</Label>
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2"><ChevronDown className="h-4 w-4" /> 菜单选择规范 (Dropdowns)</p>
             <div className="flex flex-wrap gap-6">
                <div className="space-y-2 w-48">
                  <Label className={cn("text-[9px] font-bold uppercase", isBackend ? "text-primary/60" : "opacity-40")}>标准选择器 (Select)</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className={cn("h-11 rounded-xl border-border/60 font-bold", isBackend ? "bg-muted/20 text-xs" : "text-[11px]")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-none">
                      <SelectItem value="zh" className="text-xs font-medium">中文简体 (ZH)</SelectItem>
                      <SelectItem value="en" className="text-xs font-medium">English (EN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-48">
                  <Label className={cn("text-[9px] font-bold uppercase", isBackend ? "text-primary/60" : "opacity-40")}>多级下拉 (Cascader)</Label>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className={cn("w-full h-11 rounded-xl justify-between px-4 font-bold border-border/60", isBackend ? "bg-muted/20 text-xs" : "text-[11px]")}>
                        项目分类 <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-[200] w-56 p-1.5 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-xl">
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold opacity-40 px-3">业务垂直领域</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-border/10" />
                      <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-primary/5 focus:bg-primary/5">零售终端</DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-primary/5 focus:bg-primary/5">
                          工业制造
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="z-[200] p-1.5 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-xl">
                          <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold focus:bg-primary/5">工业一体机</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold focus:bg-primary/5">嵌入式盒子</DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold hover:bg-primary/5 focus:bg-primary/5">医疗显控</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
});
ControlSpecification.displayName = "ControlSpecification";
