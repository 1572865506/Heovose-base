'use client';

import { useEffect, useRef, useCallback } from 'react';

interface FlowFieldProps {
  /** 点阵间距，越小粒子越密 (default: 28) */
  gridSpacing?: number;
  /** 粒子静止时的基础半径 (default: 1) */
  dotRadius?: number;
  /** 鼠标影响范围半径，单位 px (default: 220) */
  mouseRadius?: number;
  /** 最大线段拉伸倍率 (default: 6) */
  maxStretch?: number;
  /** 彩虹起始色相 (default: 200 = 蓝) */
  hueStart?: number;
  /** 彩虹色相范围 (default: 200) */
  hueRange?: number;
  /** 背景色 (default: '#0a0a0f' 深黑) */
  bgColor?: string;
  /** 静止点颜色 (default: rgba(255,255,255,0.08)) */
  dotColor?: string;
  /** 启用自动流场动画 (default: true) */
  autoAnimate?: boolean;
  /** 自动流场速度 (default: 0.0008) */
  flowSpeed?: number;
  /** 粒子激活时的饱和度 (default: 90) */
  saturation?: number;
  /** 粒子激活时的亮度 (default: 65) */
  lightness?: number;
}

export default function FlowField({
  gridSpacing = 28,
  dotRadius = 1,
  mouseRadius = 220,
  maxStretch = 7,
  hueStart = 200,
  hueRange = 200,
  bgColor = '#0a0a0f',
  dotColor = 'rgba(255,255,255,0.07)',
  autoAnimate = true,
  flowSpeed = 0.0008,
  saturation = 90,
  lightness = 65,
}: FlowFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const timeRef = useRef(0);
  const lastMoveRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    timeRef.current += flowSpeed;
    const t = timeRef.current;

    const isIdle = autoAnimate && Date.now() - lastMoveRef.current > 1500;
    let mx = mouseRef.current.x;
    let my = mouseRef.current.y;

    // 鼠标闲置时用 Lissajous 曲线自动漫游
    if (isIdle) {
      mx = W / 2 + Math.sin(t * 0.7) * (W * 0.28);
      my = H / 2 + Math.cos(t * 1.1) * (H * 0.22);
    }

    // 清除画布
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    const cols = Math.ceil(W / gridSpacing) + 1;
    const rows = Math.ceil(H / gridSpacing) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const px = col * gridSpacing;
        const py = row * gridSpacing;

        // 到鼠标距离
        const dx = px - mx;
        const dy = py - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / mouseRadius);

        if (influence > 0.001) {
          // 流场角度：基于鼠标方向 + Perlin-like noise (sin/cos combo)
          const noiseAngle =
            Math.sin(px * 0.008 + t * 2.1) * Math.cos(py * 0.007 + t * 1.7) * Math.PI;
          const mouseAngle = Math.atan2(dy, dx) + Math.PI; // 朝向鼠标
          // 融合噪声角与鼠标角
          const angle = mouseAngle * influence + noiseAngle * (1 - influence * 0.5);

          const stretch = influence * maxStretch;
          const falloff = Math.pow(influence, 0.6); // 更平滑的颜色衰减

          // 彩虹色相：基于角度 + 时间 + 距离
          const hue =
            hueStart +
            ((angle / (Math.PI * 2)) * hueRange + t * 80 + dist * 0.3) % hueRange;

          const alpha = 0.25 + falloff * 0.75;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle);

          // 绘制拉伸胶囊形线段
          ctx.beginPath();
          const halfLen = stretch * 1.2;
          const hw = dotRadius + influence * 0.6; // 宽度也随影响增大

          // 圆角矩形 capsule
          const r = hw;
          if (ctx.roundRect) {
            ctx.roundRect(-r, -halfLen, r * 2, halfLen * 2, r);
          } else {
            ctx.rect(-r, -halfLen, r * 2, halfLen * 2);
          }
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;

          // 添加辉光效果
          ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${falloff * 0.6})`;
          ctx.shadowBlur = 4 + falloff * 6;
          ctx.fill();
          ctx.restore();
        } else {
          // 静止状态：绘制小圆点
          ctx.beginPath();
          ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.fill();
        }
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [
    gridSpacing,
    dotRadius,
    mouseRadius,
    maxStretch,
    hueStart,
    hueRange,
    bgColor,
    dotColor,
    autoAnimate,
    flowSpeed,
    saturation,
    lightness,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      // reset canvas CSS size
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      lastMoveRef.current = Date.now();
    };

    const onLeave = () => {
      lastMoveRef.current = 0; // 立即触发自动模式
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
