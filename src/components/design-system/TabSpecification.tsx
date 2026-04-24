"use client";

import React, { useState } from 'react';
import { LayoutGrid, Layers, AlignLeft } from 'lucide-react';
import { cn } from "@/lib/utils";

export const TabSpecification = React.memo(({ variant = 'frontend' }: { variant?: 'frontend' | 'backend' }) => {
  const [activeBasicTab, setActiveBasicTab] = useState('Overview');
  const [activePillTab, setActivePillTab] = useState('Details');
  const [activeCardTab, setActiveCardTab] = useState('Hardware');
  const [activeLeftTab, setActiveLeftTab] = useState('Profile');
  const [activeRightTab, setActiveRightTab] = useState('System');

  return (
    <section id={variant === "frontend" ? "section-10" : "admin-10"} className="space-y-10 pb-40">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">10. 选项卡系统规范 (Tabs)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
        <div className="grid grid-cols-1 gap-20">
          
          {/* 10.1 横向基础样式 */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">10.1 横向基础样式 (Horizontal Styles)</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* 基础下划线 */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">基础样式 (Underline Tab)</p>
                <div className="bg-muted/5 p-8 rounded-2xl border border-border/40 shadow-inner flex justify-center">
                  <div className="w-full max-w-sm">
                    <div className="flex border-b border-border/40">
                      {['Overview', 'Specs', 'Reviews'].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setActiveBasicTab(tab)}
                          className={cn(
                            "h-10 px-6 uppercase tracking-widest transition-colors border-b-2",
                            activeBasicTab === tab 
                              ? "font-bold text-[10px] text-primary border-primary bg-primary/5" 
                              : "font-medium text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/5 border-transparent"
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="p-4 pt-6 text-[11px] text-muted-foreground leading-relaxed h-20">
                       {activeBasicTab === 'Overview' && '使用底部粗线条作为当前状态指示器，常用于页面顶部的导航或大版块切换。'}
                       {activeBasicTab === 'Specs' && '这是技术参数面板的交互占位内容，用于展示物理规格。'}
                       {activeBasicTab === 'Reviews' && '这是用户评价面板的占位内容，展现动态反馈。'}
                    </div>
                  </div>
                </div>
              </div>
              {/* 胶囊选项卡 */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">选项卡样式 (Segmented Pill)</p>
                <div className="bg-muted/5 p-8 rounded-2xl border border-border/40 shadow-inner flex justify-center">
                  <div className="w-full max-w-sm flex flex-col items-center">
                    <div className="inline-flex bg-muted/20 p-1.5 rounded-xl border border-border/40">
                      {['Details', 'Logs', 'Settings'].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setActivePillTab(tab)}
                          className={cn(
                            "h-9 px-6 uppercase tracking-widest rounded-lg transition-colors",
                            activePillTab === tab 
                              ? "font-bold text-[10px] bg-white text-primary shadow-sm" 
                              : "font-medium text-[10px] text-muted-foreground hover:text-primary"
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="p-4 pt-6 text-[11px] text-muted-foreground leading-relaxed w-full h-20 text-center">
                       {activePillTab === 'Details' && '被包含在明显的槽位容器中，选项采用白底与投影框出实体感。'}
                       {activePillTab === 'Logs' && '展示详细的系统操作日志流。'}
                       {activePillTab === 'Settings' && '面板的高级配置选项。'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 10.2 卡片容器式 */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">10.2 卡片容器式 (Card Container)</span>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-bold text-muted-foreground uppercase">卡片式 (Folder Card Tab)</p>
               <div className="bg-muted/5 p-8 rounded-2xl border border-border/40 shadow-inner">
                  <div className="max-w-2xl mx-auto">
                    <div className="flex gap-2 px-8">
                      {['Hardware', 'Software', 'Network'].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setActiveCardTab(tab)}
                          className={cn(
                            "h-12 px-8 uppercase tracking-widest transition-all relative group",
                            activeCardTab === tab 
                              ? "font-bold text-[10px] bg-white text-primary border border-b-0 border-border/40 rounded-t-2xl z-10" 
                              : "font-medium text-[10px] text-muted-foreground bg-transparent border-transparent hover:text-primary z-0"
                          )}
                        >
                          {tab}
                          
                          {activeCardTab === tab && (
                            <>
                              {/* 左侧反向圆角桥接 */}
                              <div className="absolute -left-4 bottom-0 w-4 h-4 overflow-hidden pointer-events-none">
                                <div className="w-full h-full rounded-br-2xl border-r border-b border-border/40 shadow-[0_0_0_20px_#ffffff]" />
                              </div>
                              
                              {/* 右侧反向圆角桥接 */}
                              <div className="absolute -right-4 bottom-0 w-4 h-4 overflow-hidden pointer-events-none">
                                <div className="w-full h-full rounded-bl-2xl border-l border-b border-border/40 shadow-[0_0_0_20px_#ffffff]" />
                              </div>

                              {/* 底部遮罩 */}
                              <div className="absolute -left-[1px] -bottom-[1px] w-[calc(100%+2px)] h-[2.5px] bg-white z-20" />
                            </>
                          )}

                          {activeCardTab !== tab && (
                            <div className="absolute inset-0 bg-primary/5 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="bg-white border border-border/40 rounded-2xl p-8 shadow-sm relative z-0 -mt-[1px]">
                       <div className="h-24 flex items-center justify-center border-2 border-dashed border-primary/10 rounded-xl transition-all">
                          <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">{activeCardTab} Configuration Panel</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
          {/* 10.3 垂直排版样式 */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <AlignLeft className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">10.3 垂直排版样式 (Vertical Positions)</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* 左侧垂直 */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">左侧标签页 (Left Position)</p>
                <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden flex min-h-[240px]">
                  <div className="w-32 flex flex-col border-r border-border/40 bg-muted/5 pt-4">
                    {['Profile', 'Security', 'Billing'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveLeftTab(tab)}
                        className={cn(
                          "h-12 px-4 text-left uppercase tracking-widest border-l-[3px] transition-colors",
                          activeLeftTab === tab 
                            ? "font-bold text-[10px] text-primary border-primary bg-primary/5" 
                            : "font-medium text-[10px] text-muted-foreground border-transparent hover:bg-muted/10 hover:text-primary"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 p-6 flex flex-col">
                     <h4 className="text-sm font-bold uppercase mb-4 text-primary">{activeLeftTab} Settings</h4>
                     <div className="flex-1 border-2 border-dashed border-primary/10 rounded-xl flex items-center justify-center transition-all">
                        <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">{activeLeftTab} Content Area</span>
                     </div>
                  </div>
                </div>
              </div>
              {/* 右侧垂直 */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">右侧标签页 (Right Position)</p>
                <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden flex min-h-[240px]">
                  <div className="flex-1 p-6 flex flex-col">
                     <h4 className="text-sm font-bold uppercase mb-4 text-primary text-right">{activeRightTab} Config</h4>
                     <div className="flex-1 border-2 border-dashed border-primary/10 rounded-xl flex items-center justify-center transition-all">
                        <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">{activeRightTab} Content Area</span>
                     </div>
                  </div>
                  <div className="w-32 flex flex-col border-l border-border/40 bg-muted/5 pt-4">
                    {['System', 'Users', 'Logs'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveRightTab(tab)}
                        className={cn(
                          "h-12 px-4 text-right uppercase tracking-widest border-r-[3px] transition-colors",
                          activeRightTab === tab 
                            ? "font-bold text-[10px] text-primary border-primary bg-primary/5" 
                            : "font-medium text-[10px] text-muted-foreground border-transparent hover:bg-muted/10 hover:text-primary"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
TabSpecification.displayName = "TabSpecification";
