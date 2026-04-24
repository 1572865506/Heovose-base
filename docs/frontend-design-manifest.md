
# Heovose Elevate 前台视觉与交互规范 whitepaper

本手册定义了 Heovose 官网前台（用户端）的视觉语言、交互标准及设计逻辑，旨在确保品牌在“标准化批发”与“定制化项目”双轨业务下的高度一致性与专业质感。

---

## 00. 品牌双轨色彩体系 (Color Identity)

### 00.1 批发线：品牌蓝主题 (Wholesale Blue)
*   **主色 (Primary)**: `#005B99` - 传达信赖、规模化与稳定性。
*   **辅助色 (Accent)**: `#FCDC00` - 提升交互亮感，用于核心 CTA。
*   **中性色阶**: 基于 HSL(210, 10%, 90%) 延伸，用于卡片背景与描边。

### 00.2 项目线：工业橙主题 (Project Orange)
*   **主色 (Primary)**: `#F97316` - 传达活力、定制化与工业张力。
*   **辅助色 (Accent)**: `#101820` - 深邃黑作为工业质感的压舱石。
*   **中性色阶**: 强化灰度对比，减少蓝调干扰。

---

## 01. 字体系统规范 (Typography)

### 01.1 字体家族分工
*   **标题字体 (Display)**: `Space Grotesk` (Sans-serif) - 现代、科技感，适用于 H1-H3。
*   **正文字体 (Body)**: `Inter` (Sans-serif) - 高可读性，适用于说明、介绍及列表。
*   **技术/规格字体 (Monospace)**: `JetBrains Mono` - 用于 SKU、技术参数矩阵、硬件规格表，确保数值严丝合缝。

### 01.2 排版层级阶梯 (Hierarchy Specs)
*   **Hero Main (主标题)**: 
    *   Size: 96px 
    *   Tracking: -5% (Tighter) 
    *   Leading: 0.85 (Compact)
*   **Section Heading (章节标题)**: 
    *   Size: 48px 
    *   Tracking: -2% (Tight) 
    *   Leading: 1.1
*   **Technical Specs (规格参数)**:
    *   Size: 14px (Value) / 10px (Label)
    *   Font: JetBrains Mono (Value) / Inter (Label)
    *   Leading: 1.2
    *   **布局模式**: 垂直容器模式（Label 在上，Value 在下，独立卡片承载）。
*   **Body Text (标准正文)**: 
    *   Size: 16px 
    *   Tracking: 0% 
    *   Leading: 1.6 (Relaxed)
*   **Supplementary (技术辅助)**: 
    *   Size: 10px 
    *   Tracking: Widest (10%) 
    *   Leading: 1.0

---

## 02. 几何与物理资产 (Geometry & Border)

### 02.1 圆角阶梯 (Radius)
*   **超级圆角 (Brand)**: `rounded-[2.5rem]` (40px) - 前台核心容器、大图、Hero 屏悬浮层。
*   **容器级 (Container)**: `rounded-2xl` (16px) - 内部卡片、次级板块、多行文本框。
*   **组件级 (Component)**: `rounded-lg` (8px) - 按钮、输入框、徽章、多行文本输入框。

### 02.2 边框规范 (Border)
*   **1px (发丝线)**: 基础分割、发丝边框，增强精致感。
*   **2px (标准边框)**: 业务卡片默认边框、激活态边框、选择控件边框。
*   **Dashed (虚线)**: 用于占位、引导性导入或非核心装饰。

---

## 03. 按钮系统规范 (Button System)

### 03.1 尺寸标准 (Sizes)
*   **Extra Small (XS)**: 高度 28px, 字体 9px (加粗)。
*   **Small (SM)**: 高度 36px, 字体 10px (加粗)。
*   **Default (Base)**: 高度 44px, 字体 12px (加粗)。
*   **Large (LG)**: 高度 56px, 字体 14px (加粗)。

### 03.2 状态色值 (States)
*   **Safety (安全)**: 绿色系，代表认证通过或完成。
*   **Info (信息)**: 蓝色系，代表常规操作或引导。
*   **Warning (警告)**: 橙色/黄色，代表风险提示。
*   **Danger (危险)**: 红色，代表删除或不可逆操作。

### 03.3 纯图标与混合交互 (Icon & Mixed)
*   **交互反馈**: 针对带背景的混合按钮，Hover 状态必须实现背景色与文字色的全反转。
*   **高对比度准则**: 悬停时背景由 `bg-muted` 切换为品牌主色 `bg-primary`，图标与文字同步由灰色变为纯白。

### 03.4 模组化按钮组 (Modular Groups)
*   **结构定义**: 采用 `bg-muted/20` 承托底座，内嵌 `p-1` 间距。
*   **状态切换**: 激活项采用实色背景+纯白文字；非激活项在悬停时采用 `bg-primary/10` 浅蓝反馈。

---

## 04. 交互组件规范 (Interactive Controls)

### 04.1 选择控件 (Checkbox & Radio)
*   **样式**: 采用 2px 物理边框。选中态使用 `bg-primary` 填充。
*   **反馈**: 禁用态锁定为 `opacity-50` 且背景变为 `bg-muted`。

### 04.2 开关按钮 (Toggle Switch)
*   **物理尺寸**: 标准高度 24px。
*   **视觉反馈**: 开启态背景为品牌主色 `bg-primary`，关闭态为中性灰 `bg-muted`。

### 04.3 菜单与下拉 (Menus & Select)
*   **圆角标准**: 采用内嵌级圆角 `rounded-xl` (12px)。
*   **深度感知**: 弹出层强制应用 `shadow-xl` 或 `shadow-2xl`。

---

## 05. 输入系统规范 (Input System)

### 05.1 物理标准 (Physicals)
*   **圆角**: 统一锁定为 `rounded-lg` (8px)。适用于 Input 与 Textarea。
*   **高度阶梯**: XS(28px), SM(36px), Base(44px), LG(56px)。
*   **背景**: 统一采用 `bg-muted/10` 以增强在白色背景上的物理存在感。

### 05.2 状态逻辑 (States)
*   **Focus**: 边框转为 `border-primary`，并开启 `ring-4 ring-primary/5` 光晕。
*   **Error**: 边框与文字转为 `destructive` 色值，并显示 Alert 图标。
*   **Disabled**: 透明度降至 `50%`，光标锁定。

---

## 06. 表格系统规范 (Table System)

### 06.1 结构准则 (Structural)
*   **外容器**: 统一采用 `rounded-2xl` (16px) 并配合 `border` 封闭。
*   **表头 (Header)**: 固定背景色为 `bg-muted/30`，字体锁定为 `text-[10px] font-bold uppercase tracking-widest`。
*   **行高 (Rows)**: 标准行高 56px，多行文本单元格根据内容自动撑开。

### 06.2 交互准则 (Interaction)
*   **行悬停 (Row Hover)**: 触发 `bg-primary/5` 浅蓝背景反馈。
*   **固定布局 (Sticky)**: 在大数据量场景下，表头必须 `sticky top-0`；核心识别列（如ID/名称）建议 `sticky left-0`。
*   **架构约束 (Architecture)**: 为确保 `sticky` 定位生效，`Table` 组件必须移除内部的 `overflow-auto` 容器。所有滚动容器应由外部 `div` 明确管理（如 `max-h` + `overflow-y-auto`）。
*   **背景补齐准则**: 凡应用 `sticky` 定位的单元格必须显式声明 **非透明背景色**（如 `bg-white` 或 `bg-muted`），以防止滚动时产生文字穿透。

### 06.3 高级逻辑 (Advanced Logic)
*   **动态排序 (Sortable)**: 交互列必须包含 `ArrowUp/ArrowDown` 状态指示。排序触发时需伴随 `animate-in zoom-in` 微动效。
*   **可展开行 (Expandable)**: 采用 `React.Fragment` 配合 `AnimatePresence` 实现详情行的平滑展开，详情区背景锁定为 `bg-muted/5`。

---

## 07. 标签与徽章系统 (Badges & Tags)

### 07.1 语义状态 (Semantic States)
*   **Default**: 品牌主色 `bg-primary`；Hover 态为 `bg-primary/90`。
*   **Info**: 蓝色系 `bg-blue-500`；Hover 态切换为深一度的 `bg-blue-600`。
*   **Warning**: 橙色系 `bg-orange-500`；Hover 态切换为深一度的 `bg-orange-600`。
*   **Safety**: 绿色系 `bg-green-600`；Hover 态切换为深一度的 `bg-green-700`。
*   **Neutral**: 灰色系 `bg-muted-foreground`；Hover 态切换为 `bg-foreground`。

### 07.2 尺寸与变体 (Badge Sizes & Variants)
*   **Small (SM)**: 高度 20px, 字体 8px。
*   **Base**: 高度 24px, 字体 10px。
*   **Large (LG)**: 高度 32px, 字体 12px。
*   **Hover 易读性**: 针对幽灵态/浅色态标签，Hover 时统一强制转为 **品牌主色 (Solid Primary) + 纯白文字**，以确保极致的视觉反差与识别度。

### 07.3 可移除交互标签 (Removable Tags)
*   **结构**: 采用 `bg-muted/40` 底色，配以红色 Hover 态的 X 按钮。
*   **用途**: 过滤条件、多选参数展示。

### 07.4 标签云排版 (Tag Cloud)
*   **布局**: 采用流式布局 (Flex Wrap)，保持统一的间距与高度一致性。

---

## 08. 树形结构菜单规范 (Tree Structure Menu)

### 08.1 层级排版 (Hierarchy)
*   **缩进步长**: 统一使用 **24px (1.5rem)** 进行层级递增。
*   **物理高度**: 节点高度固定为 **40px (Primary)** / **36px (Secondary)**。
*   **视觉引导**: 采用 1px 虚线或浅色实线作为深度引导线，增强视觉连接感。

### 08.2 物理参数定义 (Specs Definition)
*   **缩进步长**: 24px。
*   **Hover 反馈**: 背景应用 `bg-primary/5`。

---

## 09. 分页系统规范 (Pagination System)

### 09.1 形态与尺寸 (Forms & Sizes)
*   **标准分页 (Standard)**: 基础物理尺寸为 40px (h-10, w-10)，圆角采用 `rounded-xl`。
*   **小型分页 (Small)**: 基础物理尺寸为 28px (h-7, w-7)，圆角采用 `rounded-lg`。

### 09.2 状态逻辑 (Status Logic)
*   **激活状态 (Active)**: 背景应用 `bg-primary/10`，边框使用 `border-primary/20`，配合主色加粗字体 `text-primary font-bold`。
*   **悬停反馈 (Hover)**: 所有可点击项增加统一的 `hover:bg-primary/5` 或 `hover:bg-primary/20` 反馈。

---

## 10. 选项卡系统规范 (Tabs System)

### 10.1 样式准则 (Styles)
*   **下划线式 (Underline)**: 采用 2px 品牌色底边 作为激活指示。
*   **胶囊式 (Segmented Pill)**: 容器采用 `bg-muted/20`，激活项使用白色背景与投影。

### 10.2 卡片容器式 (Card Container)
*   **几何对齐 (Inverted Corners)**: 激活项底部两侧必须应用反向圆角技术，确保标签页与面板边框实现平滑连接。
*   **对齐参数**: 基于面板圆角 $R=16px$，标签内缩位移应匹配计算公式。

### 10.3 垂直排版样式 (Vertical Positions)
*   **样式**: 左侧或右侧垂直排列，采用 3px 物理边缘条作为激活指示。

---

## 11. 轮播组件系统 (Carousel)

### 11.1 基础导航
- **内置切换**: Hover 时显现左右切换按钮，减少视觉干扰。
- **自动步进**: 支持 `Autoplay` 插件，建议间隔 5s。
*   **内置切换按钮**: 切换按钮建议内置于容器内，并仅在悬停时显现（Group-hover）。
*   **倒计时进度条**: 必须包含自动填充的进度条，时长与自动播放延迟（5000ms）同步。

### 11.2 指示器规范
- **倒计时指示**: 指示器带有进度条，显示自动播放剩余时间。
- **索引对齐**: 宽度 ≥ 1200px 时，索引与指示器右对齐。
*   **数字索引**: 数字索引（如 01 / 05）必须位于指示器右侧，并由竖线分隔。

### 11.3 大型组件：对齐模式 (Large Alignment)
*   **尺寸依赖**: 
    *   组件宽度 < 1200px: 指示器强制 **居中对齐**。
    *   组件宽度 >= 1200px: 指示器采用 **右对齐**。
*   **宽度约束**: 所有右对齐元素必须遵循全局 **1400px** 内容宽度界限，不可溢出至屏幕边缘。
*   **交互逻辑**: 采用 Spring 物理模拟过渡；悬停时暂停自动播放。

---

## 12. 毛玻璃效果规范 (Glassmorphism System)

### 12.1 模糊阶梯 (Blur Levels)
*   **Crystal (轻薄)**: `backdrop-blur-sm` (4px), 背景 `white/30`。
*   **Frosted (标准)**: `backdrop-blur-md` (12px), 背景 `white/60`。
*   **Deep (深邃)**: `backdrop-blur-2xl` (40px), 背景 `white/80`。
*   **Eclipse (暗色)**: `backdrop-blur-md` (12px), 背景 `black/40`。

### 12.2 物理边框与感知 (Stroke & Perception)
*   **发丝描边**: 必须应用 `1px` 白色透明描边 (`border-white/20`) 以模拟物理折射缘。
*   **多重投影**: 针对 Level 03 必须应用 `shadow-2xl` 以强化深度感。

### 12.3 核心应用场景
*   **全局导航**: 顶部固定导航栏强制应用 **Frosted** 级别。
*   **模态弹窗**: 核心对话框建议应用 **Deep** 级别以隔离背景干扰。
*   **浮动标签**: 增强型 Badge 或 Tooltip 可应用 **Crystal** 级别。

---

## 13. 动力学系统规范 (Motion System)

### 13.1 物理曲线定义 (Curve Definition)
*   **Stiff (高刚性)**: `cubic-bezier(0.175, 0.885, 0.32, 1.1)` - 用于微交互反馈。
*   **Gentle (柔和型)**: `cubic-bezier(0.34, 1.56, 0.64, 1)` - 品牌标准进入动效。
*   **Reveal (品牌揭示)**: `cubic-bezier(0.77, 0, 0.175, 1)` - 极具视觉张力的揭示效果。

### 13.2 级联进入规范 (Staggered Entrance)
*   **步进步长**: 模块间延迟建议为 `100ms`。
*   **方向性**: 统一采用 `Fade-in + Slide-up (20px)` 的组合。

---

## 14. AI 智算与交互全链路规范 (AI Interaction Standards)

### 14.1 AI 按钮几何形态 (Button Geometry)
为了平衡“高科技感”与“系统一致性”，AI 按钮支持双形态配置：
*   **胶囊型 (Capsule)**: 默认形态，使用 `rounded-[360px]`，适用于旗舰级独立功能。
*   **圆角型 (Rounded)**: 遵循系统标准 `rounded-lg` (8px)，适用于嵌入式表单或次级 AI 操作，确保几何语言不产生割裂。

### 14.2 AI 视觉资产标准 (Visual Assets)
*   **极光背景 (Aurora Glow)**: AI 核心展区必须应用多层 `Mesh Gradient`（网格渐变），模糊度设定为 `100px`，配合 `animate-aurora` 实现流体律动。
*   **物理旋转 (Physical Rotation)**: AI 相关图标（如 Sparkles）禁止使用匀速旋转。必须采用 **非线性物理旋转**：每隔 `3s` 触发一次 `360deg` 旋转，且旋转过程伴随物理加速度感知。
*   **虹彩渐变 (Iridescent Gradient)**: 图标描边必须应用 `linearGradient` 虹彩定义，且渐变位移须与旋转周期同步重置，确保视觉连续性。

### 14.3 交互逻辑约束
*   **智译/生成态**: 激活 AI 任务时，相关 Input 强制开启 `AI-Aura` 流光效果，并锁定为 Read-only，直到数据回传完成。详细交互逻辑请参见后台规范中的 AI 交互规范章节（AI-Aura 系统）。

---

## 15. 反馈与加载规范 (Feedback & Loading)

### 15.1 骨架屏占位 (Skeleton Screens)
*   **样式**: 采用 `bg-primary/5` 底色，配合呼吸感脉冲动画。
*   **逻辑**: 在异步数据加载完成前，必须保持布局高度一致，防止布局抖动。

### 15.2 全域通知系统 (Notifications)
*   **视觉**: 玻璃质感底色，圆角 `24px`，带重影投影。
*   **位置**: 桌面端右上角，移动端顶部居中。

---

## 16. 导航深度与展示 (Exhibition & Navigation)

### 16.1 探索路径 (Breadcrumbs)
*   **规范**: 字体 `10px font-bold uppercase`，配合 `ChevronRight` 作为分割。

### 16.2 巨型菜单 (Mega Menu)
*   **结构**: 采用 `2.5rem` 圆角的玻璃面板，内部分为 3-4 列展示产品线。
*   **交互**: 悬停时触发 `Gentle` 曲线的平滑位移。

### 16.3 多媒体展示 (Multimedia Frame)
*   **控件**: 悬停显现毛玻璃控制器，播放按钮具备 `Scale-up` 反馈。

---

**最后更新**: 2026-04-24
**维护者**: App Prototyper (AI Agent)
