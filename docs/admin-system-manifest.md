
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
*   **字体与占位符规范**:
    *   **内容字号**: 管理后台表单内容与占位符（Placeholder）统一使用 **`text-xs` (12px)**。
    *   **标签字号**: 统一使用 **`text-[10px] font-bold uppercase tracking-wider`**。
*   **布局防溢出准则 (Anti-Expansion)**:
    *   主布局容器 (`<main>`) 必须配合 `min-w-0` 和 `overflow-hidden` 确保侧边栏宽度计算异常时不会破坏全局页面的水平稳定性。
    *   所有包含横向滚动内容（如详情图轮播）的 Flex 子容器必须逐级声明 **`min-w-0`**。

---

## 2. 核心功能逻辑 (Business Logic)

### 2.1 产品编辑器 (Product Editor)
*   **ID 生成**: 格式为 `PROD_分类名(大写)_月日(MMDD)_4位随机码`。
*   **媒体素材中心**: 
    *   采用固定高度 240px，副图库支持横向滚动。
    *   **排序交互**: 细节图卡片底部必须集成 `ChevronLeft/Right` 排序按钮，支持实时调整 `galleryUrls` 顺序。
*   **AI 智译**: 翻译按钮必须放置在“目标语种（英文）”一侧的工具栏，遵循从源文到译文的视觉逻辑。

### 2.7 AI 智译中枢规范 (AI Governance)
*   **模型准则**: 默认使用 **Gemini 2.5** 系列（如 `2.5-flash`）。
*   **鉴权策略**: 优先支持管理员在 UI 界面手动输入 Google AI Studio API Key，实现动态实例化。
*   **自检结果持久化**: 自检结果（状态、耗时、时间戳）必须持久化至数据库，刷新页面应保持最后一次自检结论。

---

**最后更新日期**: 2024-05-30
**维护者**: App Prototyper (AI Agent)
