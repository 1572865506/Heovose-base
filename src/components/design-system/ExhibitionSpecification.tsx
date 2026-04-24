"use client";

import React from 'react';
import { Monitor, Globe, ChevronRight, LayoutGrid, ChevronDown, ArrowUpRight, GalleryHorizontal, Play, Maximize } from 'lucide-react';

export const ExhibitionSpecification = React.memo(() => {
  return (
    <section id="section-16" className="space-y-10 pb-40">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">16. 导航深度与展示 (Exhibition & Navigation)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
        {/* 16.1 面包屑与结构 */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Monitor className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">16.1 探索路径规范 (Breadcrumbs)</span>
          </div>

          <div className="p-8 bg-muted/5 rounded-[2rem] border border-border/40">
            <nav className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer group">
                <Globe className="h-3 w-3" />
                Solutions
              </div>
              <ChevronRight className="h-3 w-3 text-primary/20" />
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                Smart Manufacturing
              </div>
              <ChevronRight className="h-3 w-3 text-primary/20" />
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                X-Series 09 Pro
              </div>
            </nav>
          </div>
        </div>

        {/* 16.2 巨型菜单展示 */}
        <div className="space-y-8">
           <div className="flex items-center gap-3">
             <LayoutGrid className="h-4 w-4 text-primary" />
             <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">16.2 巨型菜单排版 (Mega Menu)</span>
           </div>

           <div className="relative group w-full">
             <div className="w-full h-14 bg-primary rounded-2xl flex items-center px-8 text-white relative z-20">
                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                   Product Categories <ChevronDown className="h-3 w-3" />
                </span>
             </div>
             
             {/* 浮动面板 */}
             <div className="absolute top-full left-0 right-0 mt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-500 ease-spring-gentle z-50">
               <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[2.5rem] p-10 grid grid-cols-4 gap-10 overflow-hidden">
                 {/* 装饰图 */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                 
                 {[
                   { title: 'Wholesale Solutions', items: ['Smart Displays', 'OLED Terminals', 'Touch Modules', 'Standard ICs'] },
                   { title: 'Project Customization', items: ['Medical Grade', 'Military Specs', 'Aviation Panels', 'Automotive UI'] },
                   { title: 'Technical Services', items: ['R&D Support', 'Integration Guide', 'Global Logistics', 'QA Protocol'] },
                   { title: 'Brand Story', items: ['History', 'Innovation Lab', 'Sustainability', 'Global Press'] }
                 ].map(cat => (
                   <div key={cat.title} className="space-y-6 relative z-10">
                     <h5 className="text-[11px] font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-3">{cat.title}</h5>
                     <ul className="space-y-4">
                       {cat.items.map(item => (
                         <li key={item} className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-between group/item">
                           {item}
                           <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                         </li>
                       ))}
                     </ul>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>

        {/* 16.3 多媒体展示框架 */}
        <div className="space-y-8">
           <div className="flex items-center gap-3">
             <GalleryHorizontal className="h-4 w-4 text-primary" />
             <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">16.3 多媒体展示规范 (Multimedia Frame)</span>
           </div>

           <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-border/40 group shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40" />
              
              {/* 中央播放按钮 */}
              <button className="absolute inset-0 flex items-center justify-center">
                 <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white/40">
                   <Play className="h-8 w-8 text-white fill-white ml-1" />
                 </div>
              </button>

              {/* 底部控制器规范 */}
              <div className="absolute bottom-10 left-10 right-10 flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                 <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 w-1/3 bg-primary" />
                 </div>
                 <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                    <span className="font-mono text-[10px] text-white">03:42 / 12:00</span>
                    <div className="h-3 w-px bg-white/20" />
                    <Maximize className="h-4 w-4 text-white cursor-pointer hover:text-primary transition-colors" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
});
ExhibitionSpecification.displayName = "ExhibitionSpecification";
