
# Heovose Admin 系统设计与功能规范白皮书

本手册定义了 Heovose 管理后台的视觉语言、交互标准及核心业务逻辑，旨在确保系统的长期可维护性、视觉一致性及操作稳定性。

---

## 1. 视觉语言规范 (Visual Identity)

### 1.1 圆角标准 (Border Radius)
*   **容器级 (Container)**: 统一使用 `rounded-2xl` (16px)。适用于页面卡片、主要弹窗容器。
*   **内嵌级 (Internal)**: 统一使用 `rounded-xl` (12px)。适用于列表项、次级容器、图片容器、富文本编辑器。
*   **组件级 (Component)**: 统一使用 `rounded-lg` (8px)。适用于 Input, Select, Button, Badge。

### 1.2 空间布局 (Layout & Spacing)
*   **全局边距**: 页面主容器内边距统一为 `p-6`。
*   **板块头部 (Section Headers)**: 统一采用 `border-b pb-4 mb-6` 的结构。
*   **板块标题 (Heading)**: 统一锁定为 **`text-sm` (14px) font-bold text-primary uppercase tracking-widest**。图标必须直接置于标题文字左侧，禁用外层装饰框。
*   **高度对齐**: 
    *   标准表单控件 (Input/Select/Button): 统一锁定高度为 **`h-10`**。
*   **字体与占位符规范**:
    *   **内容字号**: 管理后台表单内容统一使用 **`text-xs` (12px)**。
    *   **占位符一致性**: 占位符 (Placeholder) 必须与输入内容字号完全一致，禁止使用 `md:text-sm` 覆盖。
    *   **标签字号**: 统一使用 **`text-[10px] font-bold uppercase tracking-wider`**。
*   **编辑器策略**: 详细介绍等富文本区域采用 **`min-h-[800px]`** 动态计算，并配合内部滚动条，确保工具栏始终可见。

---

## 2. 核心功能逻辑 (Business Logic)

### 2.1 产品编辑器 (Product Editor)
*   **ID 生成**: 格式为 `PROD_分类名(大写)_月日(MMDD)_4位随机码`。
*   **媒体素材中心**: 
    *   采用固定高度 240px，副图库支持横向滚动。
    *   **比例规范**: 内部图片显示区必须符合 **11:9**。
    *   **主图接管**: 支持从全局图库 (Gallery) 直接拾取。
*   **AI 智译**: 翻译按钮必须放置在“目标语种（英文）”一侧的工具栏，遵循从源文到译文的视觉逻辑。

### 2.2 图库管理系统 (Gallery Management)
*   **深度集成**: 富文本编辑器必须支持直接从图库素材中心插入图片。插入时需生成带圆角阴影的统一 HTML 结构。

### 2.5 详细介绍录入规范 (Rich Text)
*   **排版标准**: 采用 Tiptap 富文本引擎，支持 H3 标题、加粗、下划线、列表及引用。
*   **去中心化存储**: 为了性能优化，超长 HTML 内容不再存入全局 `localizedStrings` 集合，而是以 `localizedDetails` 对象形式内嵌在产品文档中。
*   **前端渲染**: 前端展示必须包裹在 `prose` 类名下，遵循 `@tailwindcss/typography` 的标准间距。

### 2.7 AI 智译中枢规范 (AI Governance)
*   **模型准则**: 默认使用 **Gemini 2.5** 系列（如 `2.5-flash`）。
*   **鉴权策略**: 优先支持管理员在 UI 界面手动输入 Google AI Studio API Key，实现动态实例化。
*   **连接自检**: 任何配置变更后，必须通过页面内置的“自动化配置自检”测试。
*   **状态持久化**: 自检结果（状态、耗时、时间戳）必须持久化至数据库，刷新页面应保持最后一次自检结论。

---

**最后更新日期**: 2024-05-28
**维护者**: App Prototyper (AI Agent)
