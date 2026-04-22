# Heovose Elevate 前台视觉与交互规范白皮书

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
*   **技术/等宽字体 (Monospace)**: `JetBrains Mono` - 用于 SKU、技术参数矩阵，确保数值严丝合缝。

### 2.2 层级阶梯
*   **Hero Main**: 96px | Tracking -5% | Leading 0.85 (超大、紧凑)。
*   **Section Heading**: 36px - 48px | Bold | 科技几何感。
*   **Technical Spec**: 13px | Monospace | 用于规格表数值展示。
*   **Supplementary**: 10px | Tracking Widest | All Caps (标签标准)。

---

## 3. 几何与物理资产 (Geometry & Border)

### 3.1 圆角阶梯 (Radius)
*   **超级圆角 (Brand)**: `rounded-[2.5rem]` (40px) - 前台核心容器、大图、Hero 浮动层。
*   **容器级 (Container)**: `rounded-2xl` (16px) - 内部卡片、次级板块。
*   **组件级 (Component)**: `rounded-lg` (8px) - 按钮、输入框、徽章。

### 3.2 边框规范 (Border)
*   **1px (发丝线)**: 基础分割、发丝边框，增强精致感。
*   **2px (标准边框)**: 业务卡片默认边框、激活态边框。
*   **Dashed (虚线)**: 用于占位、引导性导入或非核心装饰。

### 3.3 阴影体系 (Shadow Hierarchy)
*   **shadow-sm**: 组件级。用于微型原子组件。
*   **shadow-md**: 容器级。建立卡片物理厚度。
*   **shadow-xl**: 激活态。用于卡片悬停反馈。
*   **shadow-2xl**: 全局级。用于导航、Hero 屏悬浮视觉。

---

## 4. 交互模式与 AI 特效 (Interactions & FX)

### 4.1 AI 智感极光 (AI Aurora Language)
*   **视觉特征**: 脱离业务蓝/橙色系，独立采用 4 色极光动态流动渐变。
*   **核心类名**: `.ai-btn-glow` (带有动态 `::before` 渐变层)。
*   **寓意**: 传达“智慧、全方位、灵动”的辅助工具质感。

### 4.2 玻璃拟态标准 (Glass-morphism)
*   **M1 (标准)**: Blur 16px | Opacity 70% | 适用于顶部导航。
*   **M2 (深邃)**: Blur 40px | Opacity 40% | 适用于背景复杂的卡片浮层。

---

## 5. 业务组件准则 (Business Guidelines)

### 5.1 产品展示卡片
*   **宽高比**: 锁定 4:3 比例展示硬件设备。
*   **背景**: 统一使用 `bg-muted/20` 营造科技内陷感。
*   **交互**: 悬停时必须包含 `scale-110` 的图片缩放与 `shadow-2xl` 的投影升起反馈。

---
**最后更新**: 2024-06-05
**维护者**: App Prototyper (AI Agent)