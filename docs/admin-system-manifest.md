
# Heovose Admin 系统设计与功能规范白皮书

本手册定义了 Heovose 管理后台的视觉语言、交互标准及核心业务逻辑，旨在确保系统的长期可维护性、视觉一致性及操作稳定性。

---

## 0. 沿用前台规范声明 (Shared Specifications)

管理后台系统与前台用户界面在以下基础设计规范上保持完全一致，不得单独定义或覆盖。所有实现必须直接引用前台设计系统组件：

| 章节 | 规范名称 | 说明 |
|------|----------|------|
| 01   | 字体系统规范 (Typography) | Space Grotesk / Inter / JetBrains Mono 三字体族，排版层级阶梯与技术规格模型完全沿用 |
| 02   | 几何与投影规范 (Geometry & Shadow) | 圆角阶梯（40px / 24px / 16px / 8px）、投影标准与视觉节奏完全沿用 |
| 03   | 按钮系统规范 (Button System) | 主操作按钮、线性按钮、幽灵按钮、危险按钮、图标按钮等所有变体完全沿用 |
| 04   | 交互组件单元规范 (Interactive Units) | Select、Switch、Checkbox、Slider 等基础表单控件外观与状态规范完全沿用 |

> **架构原则**：以上规范通过组件 `variant="backend"` prop 直接复用前台实现，禁止在管理后台中独立重写样式。

---

## 05. 视觉语言与布局 (Visual Identity)

### 5.1 圆角阶梯标准 (Radius)
*   **容器级 (rounded-2xl)**: 16px - 用于模块容器。
*   **内嵌级 (rounded-xl)**: 12px - 用于内部卡片、下拉菜单。
*   **组件级 (rounded-lg)**: 8px - 用于按钮、输入框。

### 5.2 全局间距与吸顶准则 (Spacing & Sticky)
*   **内边距 (Padding)**: 统一使用 `p-6` (24px)。
*   **板块间距 (Gap)**: 统一使用 `gap-6` (24px)。
*   **吸顶头部 (Sticky Header)**: 采用 `top-[-24px]` (抵消布局内边距) 配合 `backdrop-blur-md` 玻璃材质。

---

## 06. 字体与表单规范 (Typography & Forms)

### 6.1 内容字号 (Content & Placeholder)
*   管理后台表单内容与占位符（Placeholder）**强制对齐**，统一使用 **`text-xs` (12px)**。禁止在控件上混合使用 14px。
*   **标签字号 (Label)**: 统一使用 **`text-[10px] font-bold uppercase tracking-wider`**。
*   **输入字重**: 输入框内容统一使用 `font-medium` 或常规字重，禁止在 Input 内部使用 `font-bold`（除非是特殊数值展示）。

---

## 07. 控件状态准则 (Control States)

### 7.1 背景与边框
*   **基础背景**: 统一使用 **`bg-muted/20`** (浅灰) 以区别于白色卡片容器底色。
*   **聚焦反馈 (Focus)**: 
    *   边框转为 `border-primary/50`。
    *   开启 `ring-4 ring-primary/5` 的扩散光晕。
    *   **背景严禁使用纯白**: 聚焦时背景应微调为 **`bg-muted/10`**，确保在纯白容器（Card）中依然具有清晰的物理边界。

---

## 08. AI 交互规范 (AI Interaction)

### 8.1 视觉效果
*   AI 相关图标与边框必须应用 **`ai-btn-glow`** 与 **`ai-icon-gradient`**。采用 4 色极光流动渐变，配合呼吸感光晕。

### 8.2 AI-Aura 加载与生成逻辑 (Aura Loading)
针对正在与 API 交互或生成内容的组件，必须提供具备品牌辨识度的动态反馈：
*   **流光边框 (Shimmer Border)**: 输入框或容器外围应用 `2px` 的旋转 `conic-gradient`（使用品牌彩虹色：Cyan, Indigo, Rose）。
*   **生成式骨架屏 (Generative Skeleton)**: 占位内容不使用纯灰色，而是采用低饱和度的彩虹渐变微光 (`animate-shimmer`)。

### 8.3 智译按钮标准
1.  **完整版 (Full)**: 图标 + "AI 智译"，用于页面级主工具栏。
2.  **简短版 (Short)**: 图标 + "智译"，用于板块级副工具栏。
3.  **精简版 (Minimal)**: 仅图标，用于行内或输入框伴随操作。

---

## 09. 核心业务逻辑 (Business Logic)

### 9.1 ID 生成
*   格式为 `PROD_分类名(大写)_月日(MMDD)_4位随机码`。

### 9.2 媒体素材中心
*   采用固定高度 240px，副图库支持横向滚动。所有 Flex 子项必须强制声明 `min-w-0` 以防止撑宽父容器。

---

## 10. 数据看板与度量 (Dashboard & Metrics)

### 10.1 指标卡片
*   悬停时图标容器背景反转为 `bg-primary text-white`。
*   **趋势标识**: 上升 (`green-500`), 下降 (`orange-500`), 稳定 (`primary`)。

### 10.2 实时可视化
*   柱状图集成 `animate-pulse` 体现实时性。
*   折线图采用 `draw` 路径动画，悬停时弹出浮动 Tooltip。

---

## 11. 高级列表与过滤 (Advanced Filtering)

### 11.1 过滤工具栏
*   搜索框高度锁定为 `h-10`，采用 `bg-muted/10` 无边框设计。

### 11.2 批量操作栏
*   当列表选中项 > 0 时滑出。强制使用 **`bg-primary text-white`** 强对比色。

---

## 12. 详情面板与抽屉 (Detail Panels)

### 12.1 物理尺寸与材质
*   宽度锁定为 **400px - 600px**。
*   必须应用 **`backdrop-blur-2xl bg-white/80`**，确保在复杂列表之上依然具备可读性。

---

## 13. 权限与审计 (Permissions & Logs)

### 13.1 角色语义色
*   Admin (`green`), Editor (`blue`), Viewer (`muted-foreground`)。

### 13.2 审计时间轴
*   采用虚线连线（`bg-dashed-border`），悬停节点应用 `scale-125` 的动力学反馈。

---

## 14. 异常流与撤销机制 (Exceptions & Undo)

### 14.1 即时校验
*   强制采用 **`OnBlur` (失焦)** 校验。错误态背景切换为 `bg-destructive/5`。

### 14.2 撤销机制
*   删除操作后不应立即弹窗确认，而是提供 **5-10 秒** 的“撤销”时间窗（Undo Toast）。

---

## 15. 缺省页与加载态 (Empty States & Loading)

### 15.1 缺省页
*   采用品牌色 10% 透明度的线框图插画，必须包含明确的行动指引（CTA）。

### 15.2 骨架屏
*   结构必须与实际组件 1:1 匹配，强制使用 `animate-pulse`。

---

## 16. 通知与反馈系统 (Feedback & Notifications)

### 16.1 吐司通知 (Toast)
*   统一从 **右上角** 弹出，具备 `backdrop-blur-2xl` 玻璃感。

---

**最后更新日期**: 2026-04-24
**维护者**: App Prototyper (AI Agent)
