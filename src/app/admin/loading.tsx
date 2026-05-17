export default function AdminLoading() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ── 左侧侧边栏骨架 ── */}
      <aside className="w-[240px] shrink-0 border-r border-border/20 bg-background/40 backdrop-blur-xl flex flex-col gap-4 p-5">
        {/* Logo 占位 */}
        <div className="h-8 w-28 rounded-xl bg-muted/30 animate-pulse mb-4" />
        {/* 菜单项骨架 */}
        {[80, 60, 72, 55, 68, 50, 64, 58].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-xl bg-muted/20 animate-pulse shrink-0"
              style={{ animationDelay: `${i * 60}ms` }}
            />
            <div
              className="h-3 rounded-lg bg-muted/20 animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
            />
          </div>
        ))}
      </aside>

      {/* ── 右侧主区域 ── */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* 极光背景光晕 */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[140px] animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[120px] animate-[pulse_5s_ease-in-out_infinite_1s]" />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-primary/[0.02] blur-[100px] animate-[pulse_6s_ease-in-out_infinite_2s]" />
        </div>

        {/* 顶部工具栏骨架 */}
        <div className="h-16 border-b border-border/20 bg-background/60 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-xl bg-muted/20 animate-pulse" />
            <div className="h-3 w-32 rounded-lg bg-muted/20 animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-24 rounded-full bg-muted/20 animate-pulse" />
            <div className="h-8 w-8 rounded-xl bg-muted/20 animate-pulse" />
            <div className="h-9 w-9 rounded-2xl bg-muted/30 animate-pulse" />
          </div>
        </div>

        {/* 中央加载核心 */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="flex flex-col items-center gap-10">

            {/* 7个渐变圆点流光加载动画 */}
            <div className="flex items-center justify-center gap-3.5 h-12">
              {[
                { color: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.6)' }, // 蓝
                { color: '#6366f1', shadow: 'rgba(99, 102, 241, 0.6)' }, // 蓝紫
                { color: '#8b5cf6', shadow: 'rgba(139, 92, 246, 0.6)' }, // 紫
                { color: '#ec4899', shadow: 'rgba(236, 72, 153, 0.6)' }, // 粉
                { color: '#ef4444', shadow: 'rgba(239, 68, 68, 0.6)' },  // 红
                { color: '#f97316', shadow: 'rgba(249, 115, 22, 0.6)' },  // 橙
                { color: '#eab308', shadow: 'rgba(234, 179, 8, 0.6)' },  // 黄
              ].map((dot, idx) => (
                <div
                  key={idx}
                  className="admin-dot-loader-item rounded-full"
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: dot.color,
                    '--dot-shadow': dot.shadow,
                    animationDelay: `${idx * 0.15}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* 文字区域 */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70">
                  加载中
                </span>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">
                Heovose Elevate OS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
