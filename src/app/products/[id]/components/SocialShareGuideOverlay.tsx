'use client';

import React, { useState } from 'react';
import {
  Share2,
  Copy,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export interface SocialShareGuideOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  socialAppName: string;
  productName: string;
  shareUrl: string;
  locale?: string;
}

export function SocialShareGuideOverlay({
  isOpen,
  onClose,
  socialAppName = '微信',
  productName,
  shareUrl,
  locale = 'zh',
}: SocialShareGuideOverlayProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isZh = locale === 'zh';

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      toast({
        title: isZh ? '规格书链接已复制' : 'Specification Link Copied',
        description: isZh
          ? '您可以直接在聊天窗口中粘贴发送给客户或好友。'
          : 'You can paste and send it directly in your chat or message.',
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({
        title: isZh ? '复制失败' : 'Copy Failed',
        description: isZh ? '请长按页面地址栏进行复制。' : 'Please copy the URL from the browser address bar.',
        variant: 'destructive',
      });
    }
  };

  const isWeChat = socialAppName.includes('微信');
  const isQQ = socialAppName.includes('QQ');
  const isWhatsApp = socialAppName.includes('WhatsApp');
  const isFacebook = socialAppName.includes('Facebook');
  const isInstagram = socialAppName.includes('Instagram');
  const isTwitter = socialAppName.includes('Twitter') || socialAppName.includes('X');
  const isLine = socialAppName.includes('LINE');

  // 动态匹配社交软件的品牌色彩
  let brandBgClass = 'bg-primary text-primary-foreground shadow-primary/30';
  if (isWeChat) brandBgClass = 'bg-[#07C160] text-white shadow-[#07C160]/30';
  else if (isWhatsApp) brandBgClass = 'bg-[#25D366] text-white shadow-[#25D366]/30';
  else if (isQQ) brandBgClass = 'bg-[#12B7F5] text-white shadow-[#12B7F5]/30';
  else if (isFacebook) brandBgClass = 'bg-[#1877F2] text-white shadow-[#1877F2]/30';
  else if (isInstagram) brandBgClass = 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-[#DD2A7B]/30';
  else if (isTwitter) brandBgClass = 'bg-slate-900 text-white shadow-slate-900/30';
  else if (isLine) brandBgClass = 'bg-[#06C755] text-white shadow-[#06C755]/30';

  return (
    <div
      className="fixed inset-0 z-[100005] bg-black/85 backdrop-blur-md flex flex-col justify-start items-end p-4 sm:p-6 select-none animate-in fade-in duration-200 overflow-hidden"
      onClick={onClose}
    >
      {/* 右上角指引手绘风格动态箭头与高亮光晕 */}
      <div className="relative mr-4 sm:mr-8 mt-2 flex flex-col items-end pointer-events-none animate-bounce duration-1000">
        <svg
          className="w-24 h-24 sm:w-28 sm:h-28 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 弯曲弧线指向右上角 */}
          <path
            d="M20 85 C 30 45, 60 25, 88 14"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="6 6"
          />
          {/* 箭头头部 */}
          <path
            d="M72 10 L 92 12 L 86 32"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 极简智能交互卡片 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[340px] sm:max-w-sm mr-1 sm:mr-4 mt-1 bg-slate-900/90 text-white border border-white/20 rounded-3xl p-5 shadow-2xl shadow-black/60 backdrop-blur-2xl flex flex-col relative z-10 animate-in zoom-in-95 duration-200"
      >
        {/* 卡片头部 */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-2xl flex items-center justify-center shadow-md ${brandBgClass}`}>
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">
                  {isZh ? `${socialAppName}专属分享` : `${socialAppName} In-App Share`}
                </span>
                <Badge
                  variant="outline"
                  className="bg-amber-400/10 border-amber-400/30 text-amber-300 text-[10px] px-1.5 py-0 font-mono"
                >
                  {isZh ? '智能直达' : 'Smart Share'}
                </Badge>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 步骤引导列表 */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="h-6 w-6 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
              1
            </span>
            <div className="text-xs text-white/90 leading-relaxed">
              {isZh ? (
                <>点击屏幕右上角的 <span className="font-bold text-amber-300 px-1 py-0.5 rounded bg-white/10 mx-0.5">···</span> 或 <span className="font-bold text-amber-300 px-1 py-0.5 rounded bg-white/10 mx-0.5">菜单</span> 按钮</>
              ) : (
                <>Tap the <span className="font-bold text-amber-300 px-1 py-0.5 rounded bg-white/10 mx-0.5">···</span> or <span className="font-bold text-amber-300 px-1 py-0.5 rounded bg-white/10 mx-0.5">Menu</span> button at the top-right corner</>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="h-6 w-6 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
              2
            </span>
            <div className="text-xs text-white/90 leading-relaxed">
              {isZh ? (
                <>选择 <span className="font-bold text-emerald-400">“发送给朋友”</span> 或 <span className="font-bold text-sky-400">“分享到朋友圈/群聊”</span> 转发完整规格书</>
              ) : (
                <>Choose <span className="font-bold text-emerald-400">"Share"</span> or <span className="font-bold text-sky-400">"Send to Chat"</span> to forward the complete specification</>
              )}
            </div>
          </div>
        </div>

        {/* 贴心辅助：链接已复制与手动复制操作 */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="text-[11px] text-white/60 truncate flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
            <span className="truncate">{productName || 'Specification'}</span>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleCopy}
            className={`h-8 px-3 rounded-xl text-xs font-bold shrink-0 transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-white" />
                {isZh ? '已复制' : 'Copied'}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1" />
                {isZh ? '复制链接' : 'Copy Link'}
              </>
            )}
          </Button>
        </div>

        {/* 底部轻量提示 */}
        <div className="mt-3 text-center">
          <span className="text-[10px] text-white/40">
            {isZh ? '轻触屏幕任意空白位置即可关闭指引' : 'Tap anywhere outside to dismiss'}
          </span>
        </div>
      </div>
    </div>
  );
}
