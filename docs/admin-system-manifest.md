
# Heovose Admin 系统设计与功能规范白皮书

本手册定义了 Heovose 管理后台的视觉语言、交互标准及核心业务逻辑，旨在确保系统的长期可维护性、视觉一致性及操作稳定性。

---

## 1. 视觉语言规范 (Visual Identity)

### 1.1 圆角标准 (Border Radius)
*   **容器级 (Container)**: 统一使用 `rounded-2xl` (16px)。适用于页面卡片、主要弹窗容器。
*   **内嵌级 (Internal)**: 统一使用 `rounded-xl` (12px)。适用于列表项、次级容器、图片容器、富文本编辑器。
*   **组件级 (Component)**: 统一使用 `rounded-lg` (8px)。适用于 Input, Select, Button, Badge。

### 1.2 空间布局 (Layout & Spacing)
*   **全局边距**: 页面主容器内边距由 `AdminLayout` 统一为 `p-6` (24px)。
*   **吸顶工具栏修正 (Sticky Header Offset)**: 为抵消 `AdminLayout` 的内边距，页面内 Sticky 工具栏必须显式声明 **`top-[-24px]`** 以实现精准吸顶对齐。
*   **板块头部 (Section Headers)**: 统一采用 `border-b pb-4 mb-6` 的结构。
*   **板块标题 (Heading)**: 统一锁定为 **`text-sm` (14px) font-bold text-primary uppercase tracking-widest**。图标必须直接置于标题文字左侧，禁用外层装饰框。
*   **高度对齐**: 标准表单控件 (Input/Select/Button) 统一锁定高度为 **`h-10`**。

### 1.3 字体与占位符规范 (Typography & Forms)
*   **内容字号 (Content & Placeholder)**: 管理后台表单内容与占位符（Placeholder）**强制对齐**，统一使用 **`text-xs` (12px)**。禁止在控件上混合使用 14px。
*   **标签字号 (Label)**: 统一使用 **`text-[10px] font-bold uppercase tracking-wider`**。
*   **输入字重**: 输入框内容统一使用 `font-medium` 或常规字重，禁止在 Input 内部使用 `font-bold`（除非是特殊数值展示）。

### 1.4 控件边框与状态准则 (Border & States)
*   **基础背景**: 统一使用 **`bg-muted/20`** (浅灰) 以区别于白色卡片容器底色。
*   **边框样式**: 统一使用 `border-border/60`。
*   **悬停反馈**: 边框色加深至 `border-border`。
*   **聚焦反馈 (Focus)**: 
    *   边框转为 `border-primary/50`。
    *   开启 `ring-4 ring-primary/5` 的扩散光晕。
    *   **背景严禁使用纯白**: 聚焦时背景应微调为 **`bg-muted/10`**，确保在纯白容器（Card）中依然具有清晰的物理边界。

---

## 2. 核心功能逻辑 (Business Logic)

### 2.1 产品编辑器 (Product Editor)
*   **ID 生成**: 格式为 `PROD_分类名(大写)_月日(MMDD)_4位随机码`。
*   **媒体素材中心**: 
    *   采用固定高度 240px，副图库支持横向滚动。
    *   **防溢出准则**: 所有 Flex 子项包含滚动内容时，必须强制声明 `min-w-0` 以防止撑宽父容器。
    *   **排序交互**: 细节图卡片底部必须集成 `ChevronLeft/Right` 排序按钮，支持实时调整 `galleryUrls` 顺序。

### 2.2 AI 交互规范 (AI Interaction)
*   **视觉效果**: AI 相关图标与边框必须应用 **`ai-btn-glow`** 与 **`ai-icon-gradient`**。采用 4 色极光流动渐变，配合呼吸感光晕。
*   **AI-Aura 加载与生成逻辑 (Aura Loading)**:
    针对正在与 API 交互或生成内容的组件，必须提供具备品牌辨识度的动态反馈：
    *   **流光边框 (Shimmer Border)**: 输入框或容器外围应用 `2px` 的旋转 `conic-gradient`（使用品牌彩虹色：Cyan, Indigo, Rose）。
    *   **生成式骨架屏 (Generative Skeleton)**: 占位内容不使用纯灰色，而是采用低饱和度的彩虹渐变微光 (`animate-shimmer`)。
*   **智译按钮标准**: 
    1.  **完整版 (Full)**: 图标 + "AI 智译"，用于页面级主工具栏。
    2.  **简短版 (Short)**: 图标 + "智译"，用于板块级副工具栏。
    3.  **精简版 (Minimal)**: 仅图标，用于行内或输入框伴随操作。

---

## 3. 数据看板与度量 (Dashboard & Metrics)

### 3.1 指标卡片 (Metric Cards)
*   **结构**: 采用 `bg-white p-6 rounded-2xl border` 的标准容器。
*   **视觉反馈**: 悬停时应用 `shadow-md`。图标容器背景使用 `bg-muted/20`，悬停时反转为 `bg-primary text-white`。
*   **趋势标识 (Trends)**: 
    *   上升: `text-green-500`
    *   下降: `text-orange-500`
    *   稳定: `text-primary`
*   **进度条**: 内部进度条高度锁定为 `h-1`，背景使用 `bg-muted/20`。

### 3.2 实时数据可视化 (Live Data)
*   **动效**: 柱状图或趋势图必须集成 `animate-pulse` 或过渡动画以体现“实时性”。
*   **交互**: 悬停时通过 `group-hover` 弹出浮动 Tooltip（`bg-primary text-white text-[8px]`）。

---

## 4. 列表工具与详情交互 (Advanced Interaction)

### 4.1 过滤工具栏 (Filtering Toolbar)
*   **搜索框**: 搜索框高度锁定为 `h-10`，采用 `bg-muted/10` 无边框设计，配合 `pl-10` 缩进放置图标。
*   **状态选择器**: 统一采用 `bg-muted/20 border-border/60` 的组合选择器形态。

### 4.2 批量操作栏 (Batch Actions)
*   **唤起逻辑**: 当列表选中项 > 0 时，操作栏从页面顶部/列表顶部滑出。
*   **配色准则**: 强制使用 **`bg-primary text-white`** 强对比色，以明确提示系统处于“多选模式”。
*   **关闭交互**: 必须提供明显的 `X` 退出按钮以取消所有选择。

### 4.3 详情抽屉 (Detail Drawers)
*   **物理尺寸**: 宽度锁定为 **400px - 600px**。
*   **材质**: 必须应用 **`backdrop-blur-2xl bg-white/80`**，模拟半透明玻璃质感，确保不完全遮挡底层列表。
*   **逻辑控制**: 所有复杂表单编辑应在抽屉内完成，禁止在主列表中进行行内编辑。
*   **页脚按钮**: 采用 `bg-muted/5` 的吸底容器包裹主次按钮。

---

## 5. 权限与审计准则 (Security & Audit)

### 5.1 权限矩阵 (Permission Matrix)
*   **角色语义色**:
    *   Admin: `bg-green-500` (全权限)
    *   Editor: `bg-blue-500` (读写)
    *   Viewer: `bg-muted-foreground` (只读)
*   **状态控制**: 开关 (Switch) 必须配合语义色 Badge 同步显示当前模块状态。

### 5.2 审计时间轴 (Audit Timeline)
*   **连线样式**: 采用虚线连线（`bg-dashed-border`），通过渐变实现消失感。
*   **节点图标**: 图标圆圈采用 `bg-white border-2 border-primary`。
*   **交互**: 悬停节点时应用 `scale-125` 的动力学反馈。

---

## 6. 异常流与撤销机制 (Exceptions & Undo)

### 6.1 即时校验准则 (Instant Validation)
*   **触发时机**: 强制采用 **`OnBlur` (失焦)** 校验。禁止在用户输入过程中频繁弹出错误提示，以减少干扰。
*   **视觉反馈**: 
    *   错误态背景切换为 `bg-destructive/5`，边框颜色转为 `border-destructive`。
    *   右侧显示 `AlertCircle` 警告图标，下方淡入 `text-destructive` 的具体错误描述。

### 6.2 宽容性设计：撤销机制 (Undo Mechanism)
*   **逻辑准则**: 针对非破坏性的删除或状态修改，应优先使用 **“操作后撤销”** 而非 “操作前确认”。
*   **交互表现**: 
    *   操作完成后，底部弹出通知栏（Toast），背景使用 `bg-primary`。
    *   通知栏必须包含 **“撤销 (UNDO)”** 按钮。
    *   停留时间建议为 **5-10 秒**，超时后操作正式生效。

---

---

## 7. 缺省与加载规范 (Empty States & Loading)

### 7.1 缺省页 (Empty States)
*   **视觉语言**: 采用品牌色 10% 透明度的线框图插画（如 `Ghost` 图标）。
*   **交互逻辑**: 必须包含明确的行动指引（Call to Action），如“重置搜索”或“创建新项目”。
*   **文案标准**: 标题简短（<10字），描述清晰（指出原因及解决方法）。

### 7.2 骨架屏 (Skeleton)
*   **结构匹配**: 骨架屏的几何形状必须与实际加载后的组件 1:1 匹配。
*   **动效**: 强制使用 `animate-pulse`，背景色采用 `bg-muted/20`。

---

## 8. 通知与反馈进阶 (Advanced Feedback)

### 8.1 吐司通知 (Toast)
*   **位置**: 统一从 **屏幕右上角** 弹出。
*   **语义色**:
    *   Success: `bg-green-500`
    *   Error: `bg-rose-500`
    *   Warning: `bg-orange-500`
    *   Info: `bg-blue-500`
*   **材质**: 必须具备 `backdrop-blur-2xl`，模拟悬浮玻璃感。

### 8.2 确认对话框 (Confirmation Dialog)
*   **高危定义**: 针对不可逆操作（彻底删除、清空），强制使用 **居中模态对话框**。
*   **按钮顺序**: 取消在左（Outline），确定在右（Solid/Destructive）。

---

## 9. 路径与导航准则 (Navigation Hierarchy)

### 9.1 面包屑 (Breadcrumbs)
*   **层级显示**: `父级 / 子级 / 当前页`。
*   **视觉规范**: 最后一级（当前页）使用 `font-bold`，其余级使用 `text-muted-foreground` 并支持点击回跳。
*   **分隔符**: 使用 `ChevronRight` 图标，透明度锁定在 40%。

---

## 10. 响应式降级方案 (Responsive Strategy)

### 10.1 侧边栏折叠 (Sidebar)
*   **状态切换**: 支持手动折叠。折叠后仅保留图标，悬停显示文字 Tooltip。
*   **图标对齐**: 折叠态图标必须保持居中对齐。

### 10.2 详情面板适配
*   **Desktop**: 400px 右侧抽屉。
*   **Tablet**: 80% 宽度居中弹窗。
*   **Mobile**: 100% 宽度全屏覆盖。

---

## 11. 深度检查模式 (Deep Inspection)

### 11.1 技术详情层 (Technical Overlay)
*   **交互方式**: 点击数值或传感器标签触发。
*   **视觉表现**: 采用极简悬浮窗，背景 `backdrop-blur-2xl`。
*   **内容**: 展示过去 24 小时的趋势波形图，提供瞬时数据的历史上下文。

---

## 12. 暗色模式预研 (Dark Mode Readiness)

### 12.1 调色板准则
*   **背景**: 强制使用 `Slate-900` 或 `Slate-950`（#0f172a），禁止纯黑。
*   **高亮**: 品牌色在暗色模式下应切换为更高饱和度的 Accent 色系（如 Cyan-400）。
*   **对比度**: 边框线透明度从轻量版的 5% 提升至 10%-15%。

---

**最后更新日期**: 2026-04-23
**维护者**: App Prototyper (AI Agent)
