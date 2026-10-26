'use client';

import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export function ProductShareModal({
  isOpen,
  onClose,
  productName,
}: ProductShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 终端环境与浏览器探测
  const getDeviceContext = () => {
    if (typeof window === 'undefined') return { isIOS: false, isAndroid: false, isWeChat: false, isQQ: false, safariVersion: 0 };
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isWeChat = /MicroMessenger/i.test(ua);
    const isQQ = /QQ\//i.test(ua);

    let safariVersion = 0;
    const match = ua.match(/Version\/(\d+)/);
    if (match && match[1]) {
      safariVersion = parseInt(match[1], 10);
    }
    return { isIOS, isAndroid, isWeChat, isQQ, safariVersion };
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fallback below
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    } catch {
      return false;
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const device = getDeviceContext();

  return (
    <div
      className="fixed inset-0 z-[100002] flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(16, 24, 32, 0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-md bg-card text-foreground border border-border/60 rounded-[2rem] p-5 sm:p-6 shadow-2xl shadow-primary/10 flex flex-col relative z-10 backdrop-blur-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border/40 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Share2 className="h-4 w-4" />
            </div>
            <h4 className="font-headline font-bold text-base text-foreground">
              分享产品规格书
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            aria-label="关闭分享窗口"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 友好终端降级提示卡片 */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-primary/5 border border-primary/15 text-primary text-xs mb-4">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
          <div className="space-y-0.5">
            <p className="font-bold">
              {device.isWeChat
                ? '检测到您正在使用微信浏览器'
                : device.isQQ
                ? '检测到您正在使用QQ浏览器'
                : device.safariVersion < 15 && device.isIOS
                ? 'Safari 旧版本 (<15) 优化提示'
                : '已为您匹配最优分享通道'}
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {device.isWeChat
                ? '受微信限制无法调起原生菜单，可点击右上角【···】选择发送给朋友，或选择下方快捷渠道：'
                : device.safariVersion < 15 && device.isIOS
                ? '当前系统版本不支持原生文件直传，您可通过下方快捷渠道一键转发规格书：'
                : '系统原生分享接口未开放，您可通过以下快捷渠道直接分享给客户与好友：'}
            </p>
          </div>
        </div>

        {/* 多渠道快捷直达入口（微信、QQ、WhatsApp、Facebook、X 等） */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {/* 微信 */}
          <button
            type="button"
            onClick={async () => {
              const success = await copyToClipboard(currentUrl);
              if (device.isWeChat) {
                toast({
                  title: '请点击右上角【···】',
                  description: '在微信中点击屏幕右上角菜单即可直接发送给好友或群聊。',
                });
              } else {
                toast({
                  title: success ? '规格书链接已复制' : '复制失败',
                  description: '打开微信粘贴即可直接发送给好友或微信群。',
                });
              }
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-muted/30 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all group"
          >
            <div className="h-10 w-10 rounded-2xl bg-[#07C160] text-white flex items-center justify-center shadow-md shadow-[#07C160]/20 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M8.5 4C4.36 4 1 6.91 1 10.5c0 1.98.98 3.76 2.54 4.96l-.64 2.37 2.65-1.38c.92.3 1.91.47 2.95.47.33 0 .66-.02.98-.05-.27-.72-.42-1.5-.42-2.31 0-3.6 3.13-6.52 7-6.52.26 0 .52.02.77.05C15.82 5.76 12.44 4 8.5 4zm-2 3a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm4 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm6.5 2.5c-3.31 0-6 2.46-6 5.5s2.69 5.5 6 5.5c.83 0 1.62-.16 2.35-.44l2.12 1.1-.51-1.9c1.25-.96 2.04-2.38 2.04-3.96 0-3.04-2.69-5.5-6-5.5zm-1.5 2.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-emerald-600">微信</span>
          </button>

          {/* QQ */}
          <a
            href={`https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(productName)}&summary=${encodeURIComponent('查看完整技术规格表')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-muted/30 hover:bg-sky-500/10 hover:text-sky-600 transition-all group"
          >
            <div className="h-10 w-10 rounded-2xl bg-[#12B7F5] text-white flex items-center justify-center shadow-md shadow-[#12B7F5]/20 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.94.55 3.75 1.5 5.28L2.5 21l3.85-.98C7.83 20.65 9.85 21.2 12 21.2c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 3.2c2.1 0 3.8 1.7 3.8 3.8 0 .8-.25 1.55-.7 2.15.9.65 1.5 1.7 1.5 2.9 0 1.6-1.05 2.95-2.5 3.35-.45.9-1.2 1.6-2.1 1.6s-1.65-.7-2.1-1.6C8.95 17.05 7.9 15.7 7.9 14.1c0-1.2.6-2.25 1.5-2.9-.45-.6-.7-1.35-.7-2.15 0-2.1 1.7-3.8 3.8-3.8z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-sky-600">QQ</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${productName} Specification: ${currentUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-muted/30 hover:bg-[#25D366]/10 hover:text-[#25D366] transition-all group"
          >
            <div className="h-10 w-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-[#25D366]/20 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-[#25D366]">WhatsApp</span>
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-muted/30 hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-all group"
          >
            <div className="h-10 w-10 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-md shadow-[#1877F2]/20 group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-[#1877F2]">Facebook</span>
          </a>

          {/* X (Twitter) */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${productName} Specification`)}&url=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-muted/30 hover:bg-slate-500/10 hover:text-foreground transition-all group"
          >
            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">X</span>
          </a>
        </div>

        {/* 快速复制链接区域 */}
        <div className="p-2.5 bg-muted/30 rounded-2xl border border-border/40 flex items-center gap-2 mb-3">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 bg-transparent text-xs text-muted-foreground font-mono focus:outline-none truncate px-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={async () => {
              const success = await copyToClipboard(currentUrl);
              if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            className={cn(
              "h-8 px-3 rounded-xl text-xs font-bold shrink-0 transition-all",
              copied
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> 已复制
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1" /> 复制链接
              </>
            )}
          </Button>
        </div>

        {/* 终端兼容性支持说明 */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 pt-2.5 border-t border-border/40">
          <span>兼容：iOS Safari(全版本) · 安卓 · 微信 · QQ · PC</span>
          <span className="font-mono">已优化适配</span>
        </div>
      </div>
    </div>
  );
}
