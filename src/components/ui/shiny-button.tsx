"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface ShinyButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  shape?: "capsule" | "rounded"
  disabled?: boolean
}

export function ShinyButton({ 
  children, 
  onClick, 
  className = "", 
  shape = "capsule",
  disabled = false
}: ShinyButtonProps) {
  return (
    <>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,500&display=swap");

        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @property --gradient-angle-offset {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @property --gradient-percent {
          syntax: "<percentage>";
          initial-value: 5%;
          inherits: false;
        }

        @property --gradient-shine {
          syntax: "<color>";
          initial-value: white;
          inherits: false;
        }

        .shiny-cta {
          --shiny-cta-bg: #fdfcff;
          --shiny-cta-bg-subtle: #f5f3ff;
          --shiny-cta-fg: #005C99;
          --shiny-cta-highlight: #818cf8;
          --shiny-cta-highlight-subtle: #a5b4fc;
          --animation: gradient-angle linear infinite;
          --duration: 3s;
          --shadow-size: 2px;
          --transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);
          
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          outline-offset: 4px;
          padding: 0 1.25rem;
          height: 2.5rem;
          font-family: "Inter", sans-serif;
          font-size: 0.8125rem;
          line-height: 1.2;
          font-weight: 600;
          border: 1px solid transparent;
          color: var(--shiny-cta-fg);
          background: linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg)) padding-box,
            conic-gradient(
              from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
              transparent,
              #06B6D4 5%,
              #4F46E5 10%,
              #D946EF 15%,
              #F43F5E 20%,
              transparent 25%
            ) border-box;
          box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle);
          transition: var(--transition);
          transition-property: --gradient-angle-offset, --gradient-percent, --gradient-shine, border-radius;
        }

        .shiny-cta.shape-capsule {
          border-radius: 360px;
        }

        .shiny-cta.shape-rounded {
          border-radius: 12px;
        }

        .shiny-cta:disabled {
          --shiny-cta-bg: #f3f4f6;
          --shiny-cta-bg-subtle: #e5e7eb;
          --shiny-cta-fg: #9ca3af;
          cursor: not-allowed;
          background: linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg)) padding-box,
            linear-gradient(#e5e7eb, #e5e7eb) border-box;
          box-shadow: none;
          opacity: 0.8;
        }

        .shiny-cta::before,
        .shiny-cta::after,
        .shiny-cta span::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset-inline-start: 50%;
          inset-block-start: 50%;
          translate: -50% -50%;
          z-index: -1;
        }

        .shiny-cta:active:not(:disabled) {
          translate: 0 1px;
        }

        /* Dots pattern */
        .shiny-cta::before {
          --size: calc(100% - var(--shadow-size) * 3);
          --position: 2px;
          --space: calc(var(--position) * 2);
          width: var(--size);
          height: var(--size);
          background: radial-gradient(
            circle at var(--position) var(--position),
            #818cf8 calc(var(--position) / 4),
            transparent 0
          ) padding-box;
          background-size: var(--space) var(--space);
          background-repeat: space;
          mask-image: conic-gradient(
            from calc(var(--gradient-angle) + 45deg),
            black,
            transparent 10% 90%,
            black
          );
          border-radius: inherit;
          opacity: 0.1;
          z-index: -1;
        }

        .shiny-cta:disabled::before {
          display: none;
        }

        /* Inner shimmer */
        .shiny-cta::after {
          --animation: shimmer linear infinite;
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(
            -50deg,
            transparent,
            rgba(129, 140, 248, 0.1),
            transparent
          );
          mask-image: radial-gradient(circle at bottom, transparent 40%, black);
          opacity: 0.6;
        }

        .shiny-cta:disabled::after {
          display: none;
        }

        .shiny-cta span {
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .shiny-cta span::before {
          --size: calc(100% + 1rem);
          width: var(--size);
          height: var(--size);
          box-shadow: inset 0 -1ex 2rem 4px rgba(129, 140, 248, 0.2);
          opacity: 0;
          transition: opacity var(--transition);
          animation: calc(var(--duration) * 1.5) breathe linear infinite;
        }

        /* Icon styling with rainbow gradient and physical rotation */
        .shiny-cta :global(svg) {
          width: 1rem;
          height: 1rem;
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: drop-shadow(0 0 2px rgba(129, 140, 248, 0.1));
          stroke: url(#shiny-icon-gradient) !important;
        }

        .shiny-cta:disabled :global(svg) {
          stroke: #9ca3af !important;
          filter: none;
        }

        .shiny-cta:hover:not(:disabled) :global(svg) {
          transform: rotate(360deg) scale(1.15);
        }

        /* Animate icon gradient stops */
        @keyframes icon-rainbow {
          0% { stop-color: #06B6D4; }
          25% { stop-color: #4F46E5; }
          50% { stop-color: #D946EF; }
          75% { stop-color: #F43F5E; }
          100% { stop-color: #06B6D4; }
        }

        .rainbow-stop-1 { animation: icon-rainbow 3s linear infinite; }
        .rainbow-stop-2 { animation: icon-rainbow 3s linear infinite -0.75s; }
        .rainbow-stop-3 { animation: icon-rainbow 3s linear infinite -1.5s; }
        .rainbow-stop-4 { animation: icon-rainbow 3s linear infinite -2.25s; }

        /* Animate */
        .shiny-cta,
        .shiny-cta::before,
        .shiny-cta::after {
          animation: var(--animation) var(--duration),
            var(--animation) calc(var(--duration) / 0.4) reverse paused;
          animation-composition: add;
        }

        .shiny-cta:disabled,
        .shiny-cta:disabled::before,
        .shiny-cta:disabled::after {
          animation: none;
        }

        .shiny-cta:is(:hover, :focus-visible):not(:disabled) {
          --gradient-percent: 20%;
          --gradient-angle-offset: 95deg;
          --gradient-shine: var(--shiny-cta-highlight-subtle);
        }

        .shiny-cta:is(:hover, :focus-visible):not(:disabled),
        .shiny-cta:is(:hover, :focus-visible):not(:disabled)::before,
        .shiny-cta:is(:hover, :focus-visible):not(:disabled)::after {
          animation-play-state: running;
        }

        .shiny-cta:is(:hover, :focus-visible):not(:disabled) span::before {
          opacity: 1;
        }

        @keyframes gradient-angle {
          to {
            --gradient-angle: 360deg;
          }
        }

        @keyframes shimmer {
          to {
            rotate: 360deg;
          }
        }

        @keyframes breathe {
          from, to {
            scale: 1;
          }
          50% {
            scale: 1.2;
          }
        }
      `}</style>

      {/* SVG Gradient Definition for Icon Stroke with animated stops */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="shiny-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="rainbow-stop-1" />
            <stop offset="33%" className="rainbow-stop-2" />
            <stop offset="66%" className="rainbow-stop-3" />
            <stop offset="100%" className="rainbow-stop-4" />
          </linearGradient>
        </defs>
      </svg>

      <button 
        className={cn("shiny-cta", `shape-${shape}`, className)} 
        onClick={onClick}
        disabled={disabled}
      >
        <span>{children}</span>
      </button>
    </>
  )
}
