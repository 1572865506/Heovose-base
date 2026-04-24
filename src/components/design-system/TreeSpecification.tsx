"use client";

import React, { useState } from 'react';
import { 
  Workflow, 
  ChevronRight as ChevronRightIcon, 
  Folder, 
  Monitor, 
  Cpu, 
  File, 
  Settings, 
  Move, 
  ShieldCheck 
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const TreeSpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => {
  const [treeExpanded, setTreeExpanded] = useState<Set<string>>(new Set(['root', 'products']));

  const toggleTree = (id: string) => {
    const newExpanded = new Set(treeExpanded);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setTreeExpanded(newExpanded);
  };

  return (
    <section id={variant === "frontend" ? "section-08" : "admin-08"} className="space-y-10 pb-40">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">08. 树形结构菜单规范 (Tree Structure)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
           {/* 08.1 基础形态与层级 */}
           <div className="space-y-10">
              <div className="flex items-center gap-3">
                <Workflow className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">8.1 基础层级形态 (Basic Hierarchy)</span>
              </div>
              
              <div className="bg-muted/5 rounded-3xl border border-border/40 p-6">
                <div className="space-y-1">
                  {/* Root Level */}
                  <div 
                    className={cn(
                      "flex items-center gap-3 h-10 px-3 rounded-xl cursor-pointer transition-all",
                      "hover:bg-primary/5 text-primary group"
                    )}
                    onClick={() => toggleTree('root')}
                  >
                    <ChevronRightIcon className={cn("h-4 w-4 transition-transform duration-300 opacity-40", treeExpanded.has('root') && "rotate-90")} />
                    <Folder className="h-4 w-4 opacity-60" />
                    <span className="text-sm font-bold">Heovose Enterprise</span>
                    <Badge variant="outline" className="ml-auto text-[7px] h-4">ROOT</Badge>
                  </div>

                  {/* Level 1 */}
                  {treeExpanded.has('root') && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <div className="pl-6 border-l border-primary/10 ml-5 space-y-1">
                        <div 
                          className="flex items-center gap-3 h-10 px-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
                          onClick={() => toggleTree('products')}
                        >
                          <ChevronRightIcon className={cn("h-4 w-4 transition-transform duration-300", treeExpanded.has('products') && "rotate-90")} />
                          <Folder className="h-4 w-4 opacity-40" />
                          <span className="text-sm font-medium">Product Portfolio</span>
                        </div>

                        {/* Level 2 */}
                        {treeExpanded.has('products') && (
                          <div className="pl-6 border-l border-primary/10 ml-5 space-y-1 animate-in slide-in-from-top-1 duration-200">
                            <div className="flex items-center gap-3 h-9 px-3 rounded-lg border-l-2 border-primary bg-primary/5 text-primary">
                              <Monitor className="h-3.5 w-3.5" />
                              <span className="text-[13px] font-bold">AIO Series Pro</span>
                              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            </div>
                            <div className="flex items-center gap-3 h-9 px-3 rounded-lg hover:bg-primary/5 transition-all text-muted-foreground/60 hover:text-primary">
                              <Cpu className="h-3.5 w-3.5" />
                              <span className="text-[13px]">Mini PC Solutions</span>
                            </div>
                            <div className="flex items-center gap-3 h-9 px-3 rounded-lg hover:bg-primary/5 transition-all text-muted-foreground/60 hover:text-primary">
                              <File className="h-3.5 w-3.5" />
                              <span className="text-[13px]">User Guide.pdf</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 h-10 px-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-all text-muted-foreground">
                          <ChevronRightIcon className="h-4 w-4 opacity-20" />
                          <Folder className="h-4 w-4 opacity-40" />
                          <span className="text-sm font-medium">Technical Specs</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
           </div>
           {/* 8.2 物理参数定义 */}
           <div className="space-y-10">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">8.2 物理参数定义 (Specs Definition)</span>
              </div>
              
              <div className="space-y-6">
                 <div className="flex items-start gap-8">
                    <div className="w-24 h-24 bg-muted/20 rounded-2xl flex items-center justify-center border border-dashed border-primary/20">
                       <Move className="h-10 w-10 text-primary/40" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold uppercase">标准缩进步长</p>
                       <p className="text-2xl font-headline font-bold text-primary">24px</p>
                       <p className="text-[9px] text-muted-foreground leading-relaxed uppercase">确保层级深度感知明确，不因层级过多导致视觉局促。</p>
                    </div>
                 </div>
                 
                 <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="flex items-center gap-2 mb-4">
                       <ShieldCheck className="h-4 w-4 text-primary" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">交互反馈标准</span>
                    </div>
                    <ul className="space-y-3">
                       <li className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">默认节点高度 (Primary)</span>
                          <span className="font-mono font-bold">40px</span>
                       </li>
                       <li className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">次级节点高度 (Secondary)</span>
                          <span className="font-mono font-bold">36px</span>
                       </li>
                       <li className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Hover 背景色</span>
                          <code className="bg-white px-1.5 rounded border">bg-primary/5</code>
                       </li>
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
});
TreeSpecification.displayName = "TreeSpecification";
