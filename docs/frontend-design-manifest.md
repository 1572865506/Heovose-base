
# Heovose Elevate 前台视觉与交互规范 whitepaper

本手册定义了 Heovose 官网前台（用户端）的视觉语言、交互标准及设计逻辑，旨在确保品牌在“标准化批发”与“定制化项目”双轨业务下的高度一致性与专业质感。

---

## 1. 品牌双轨色彩体系 (Color Identity)

### 1.1 批发线：品牌蓝主题 (Wholesale Blue)
*   **主色 (Primary)**: `#005B99` - 传达信赖、规模化与稳定性。
*   **辅助色 (Accent)**: `#FCDC00` - 提升交互亮感，用于核心 CTA。
*   **中性色阶**: 基于 HSL(210, 10%, 90%) 延伸，用于卡片背景与描边。

### 1.2 项目线：工业橙主题 (Project Orange)
*   **主色 (Primary)**: `#F97316` - 传达活力、定制化与工业张力。
*   **辅助色 (Accent)**: `#101820` - 深邃黑作为工业质感的压舱石。
*   **中性色阶**: 强化灰度对比，减少蓝调干扰。

---

## 2. 字体系统规范 (Typography)

### 2.1 字体家族分工
*   **标题字体 (Display)**: `Space Grotesk` (Sans-serif) - 现代、科技感，适用于 H1-H3。
*   **正文字体 (Body)**: `Inter` (Sans-serif) - 高可读性，适用于说明、介绍及列表。
*   **技术/规格字体 (Monospace)**: `JetBrains Mono` - 用于 SKU、技术参数矩阵、硬件规格表，确保数值严丝合缝。

### 2.2 排版层级阶梯 (Hierarchy Specs)
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

## 3. 几何与物理资产 (Geometry & Border)

### 3.1 圆角阶梯 (Radius)
*   **超级圆角 (Brand)**: `rounded-[2.5rem]` (40px) - 前台核心容器、大图、Hero 屏悬浮层。
*   **容器级 (Container)**: `rounded-2xl` (16px) - 内部卡片、次级板块、多行文本框。
*   **组件级 (Component)**: `rounded-lg` (8px) - 按钮、输入框、徽章、多行文本输入框。

### 3.2 边框规范 (Border)
*   **1px (发丝线)**: 基础分割、发丝边框，增强精致感。
*   **2px (标准边框)**: 业务卡片默认边框、激活态边框、选择控件边框。
*   **Dashed (虚线)**: 用于占位、引导性导入或非核心装饰。

---

## 4. 按钮系统规范 (Button System)

### 4.1 尺寸标准 (Sizes)
*   **Extra Small (XS)**: 高度 28px, 字体 9px (加粗)。
*   **Small (SM)**: 高度 36px, 字体 10px (加粗)。
*   **Default (Base)**: 高度 44px, 字体 12px (加粗)。
*   **Large (LG)**: 高度 56px, 字体 14px (加粗)。

### 4.2 状态色值 (States)
*   **Safety (安全)**: 绿色系，代表认证通过或完成。
*   **Info (信息)**: 蓝色系，代表常规操作或引导。
*   **Warning (警告)**: 橙色/黄色，代表风险提示。
*   **Danger (危险)**: 红色，代表删除或不可逆操作。

### 4.3 纯图标与混合交互 (Icon & Mixed)
*   **交互反馈**: 针对带背景的混合按钮，Hover 状态必须实现背景色与文字色的全反转。
*   **高对比度准则**: 悬停时背景由 `bg-muted` 切换为品牌主色 `bg-primary`，图标与文字同步由灰色变为纯白。

### 4.4 模组化按钮组 (Modular Groups)
*   **结构定义**: 采用 `bg-muted/20` 承托底座，内嵌 `p-1` 间距。
*   **状态切换**: 激活项采用实色背景+纯白文字；非激活项在悬停时采用 `bg-primary/10` 浅蓝反馈。

---

## 5. 交互组件规范 (Interactive Controls)

### 5.1 选择控件 (Checkbox & Radio)
*   **样式**: 采用 2px 物理边框。选中态使用 `bg-primary` 填充。
*   **反馈**: 禁用态锁定为 `opacity-50` 且背景变为 `bg-muted`。

### 5.2 开关按钮 (Toggle Switch)
*   **物理尺寸**: 标准高度 24px。
*   **视觉反馈**: 开启态背景为品牌主色 `bg-primary`，关闭态为中性灰 `bg-muted`。

### 5.3 菜单与下拉 (Menus & Select)
*   **圆角标准**: 采用内嵌级圆角 `rounded-xl` (12px)。
*   **深度感知**: 弹出层强制应用 `shadow-xl` 或 `shadow-2xl`。

---

## 8. 输入系统规范 (Input System)

### 8.1 物理标准 (Physicals)
*   **圆角**: 统一锁定为 `rounded-lg` (8px)。适用于 Input 与 Textarea。
*   **高度阶梯**: XS(28px), SM(36px), Base(44px), LG(56px)。
*   **背景**: 统一采用 `bg-muted/10` 以增强在白色背景上的物理存在感。

### 8.2 状态逻辑 (States)
*   **Focus**: 边框转为 `border-primary`，并开启 `ring-4 ring-primary/5` 光晕。
*   **Error**: 边框与文字转为 `destructive` 色值，并显示 Alert 图标。
*   **Disabled**: 透明度降至 `50%`，光标锁定。

---

## 9. 表格系统规范 (Table System)

### 9.1 结构准则 (Structural)
*   **外容器**: 统一采用 `rounded-2xl` (16px) 并配合 `border` 封闭。
*   **表头 (Header)**: 固定背景色为 `bg-muted/30`，字体锁定为 `text-[10px] font-bold uppercase tracking-widest`。
*   **行高 (Rows)**: 标准行高 56px，多行文本单元格根据内容自动撑开。

### 9.2 交互准则 (Interaction)
*   **行悬停 (Row Hover)**: 触发 `bg-primary/5` 浅蓝背景反馈。
*   **固定布局 (Sticky)**: 在大数据量场景下，表头必须 `sticky top-0`；核心识别列（如ID/名称）建议 `sticky left-0`。
*   **背景补齐准则**: 凡应用 `sticky` 定位的单元格必须显式声明 **非透明背景色**（如 `bg-white`），以防止滚动时产生文字穿透。

---

## 10. 标签与徽章系统 (Badges & Tags)

### 10.1 语义状态 (Semantic States)
*   **Default**: 品牌主色 `bg-primary`。
*   **Info**: 蓝色系 `bg-blue-500`。
*   **Warning**: 橙色系 `bg-orange-500`。
*   **Safety**: 绿色系 `bg-green-600`。
*   **Neutral**: 灰色系 `bg-muted-foreground`。

### 10.2 尺寸标准 (Badge Sizes)
*   **Small (SM)**: 高度 20px, 字体 8px。
*   **Base**: 高度 24px, 字体 10px。
*   **Large (LG)**: 高度 32px, 字体 12px。

### 10.3 交互特性 (Interactive)
*   **Removable**: 带有 X 图标的标签，悬停图标时触发 `text-destructive` 反馈。

---
**最后更新**: 2024-06-05
**维护者**: App Prototyper (AI Agent)
