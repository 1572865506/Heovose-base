'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  ArrowRight,
  Star,
  ShieldCheck,
  Download,
  Mail,
  ChevronRight,
  ChevronLeft,
  Globe,
  Zap,
  Phone,
  Loader2,
  Play,
  ZoomIn,
  ZoomOut,
  X,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Copy,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/image-utils';
import { useTranslations } from '@/hooks/use-translations';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useInquiry } from '@/components/providers/InquiryProvider';
import { HoverVideoPlayer } from '@/components/HoverVideoPlayer';
import { injectTranslations } from '@/lib/translation-injector';
import { ProductPdfLayout } from './components/ProductPdfLayout';
import { ProductSpecPreviewModal } from './components/ProductSpecPreviewModal';
import { ProductShareModal } from './components/ProductShareModal';
import { SocialShareGuideOverlay } from './components/SocialShareGuideOverlay';


const isVideoUrl = (url: string) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);
};

const SYSTEM_FALLBACKS: Record<string, Record<string, string>> = {
  nav_home: { zh: '首页', en: 'Home', id: 'Beranda', vi: 'Trang chủ' },
  nav_products: { zh: '产品中心', en: 'Products', id: 'Produk', vi: 'Sản phẩm' },
  core_advantages: { zh: '核心优势', en: 'Core Advantages', id: 'Keunggulan Utama', vi: 'Ưu thế cốt lõi' },
  product_contact_now: { zh: '立即咨询', en: 'Contact Now', id: 'Hubungi Sekarang', vi: 'Liên hệ ngay' },
  product_spec_sheet: { zh: '下载规格表', en: 'Download Spec Sheet', id: 'Unduh Lembar Spek', vi: 'Tải thông số' },
  nav_contact: { zh: '联系我们', en: 'Contact Us', id: 'Hubungi Kami', vi: 'Liên hệ chúng tôi' },
  product_tab_desc: { zh: '产品详情', en: 'Description', id: 'Deskripsi', vi: 'Chi tiết sản phẩm' },
  product_tab_specs: { zh: '技术参数', en: 'Specifications', id: 'Spesifikasi', vi: 'Thông số kỹ thuật' },
  related_products_title: { zh: '相关产品', en: 'Related Products', id: 'Produk Terkait', vi: 'Sản phẩm liên quan' },
  explore_more_tech: { zh: '探索更多高端科技', en: 'Explore more high-end technology', id: 'Jelajahi lebih banyak teknologi kelas atas', vi: 'Khám phá thêm công nghệ cao cấp' },
  view_all: { zh: '查看全部', en: 'View All', id: 'Lihat Semua', vi: 'Xem tất cả' },
  continued: { zh: '续', en: 'Continued', id: 'Lanjutan', vi: 'Tiếp tục' }
};

export default function ProductClient({ product, initialLocale }: { product: any, initialLocale: Locale }) {
  const searchParams = useSearchParams();
  const { openInquiry } = useInquiry();

  // Synchronous detectLocale to avoid secondary rendering pass and prevent Hydration Mismatch
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const [mounted, setMounted] = useState(false);
  const [productUrl, setProductUrl] = useState('');
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: 'image' | 'video' }>(() => {
    return {
      url: product?.mainImageUrl || '',
      type: isVideoUrl(product?.mainImageUrl || '') ? 'video' : 'image'
    };
  });
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [sanitizedDetails, setSanitizedDetails] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportLogoUrl, setExportLogoUrl] = useState<string>('');
  const [specPreviewData, setSpecPreviewData] = useState<{
    isOpen: boolean;
    pages: string[];
    fileName: string;
    pdfBlob?: Blob;
    pdfFile?: File;
    pdfDoc?: any;
  }>({
    isOpen: false,
    pages: [],
    fileName: '',
  });
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isFallbackModalOpen, setIsFallbackModalOpen] = useState(false);
  const [isSocialGuideOpen, setIsSocialGuideOpen] = useState(false);
  const [currentSocialAppName, setCurrentSocialAppName] = useState('微信');
  const printLayoutRef = useRef<HTMLDivElement>(null);

  // 全环境剪贴板兜底函数（即使在局域网 HTTP 或旧浏览器下也能 100% 成功复制）
  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        // fallback
      }
    }
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      return false;
    }
  };

  // 预渲染 Logo 为精确尺寸的真实位图，彻底根除移动端 SVG 未缩放裁切问题
  const rasterizeLogo = async (url: string, targetWidth: number, targetHeight: number): Promise<string> => {
    if (!url) return '';
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth * 3;
          canvas.height = targetHeight * 3;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            ctx.drawImage(img, x, y, w, h);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        } catch (e) {
          console.warn('Logo rasterize error:', e);
        }
        resolve(url);
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  };

  const handleOpenSpecPreview = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      // 预先将 Logo 渲染为 169x32 的标准高保真位图
      const rawLogo = siteConfig?.logoStandard ? getAssetUrl(siteConfig.logoStandard) : '/image/Heovose-color.svg';
      const logoPng = await rasterizeLogo(rawLogo, 169, 32);
      setExportLogoUrl(logoPng);

      // 给 React 状态更新和 DOM 挂载预留时间
      await new Promise((r) => setTimeout(r, 250));

      const container = printLayoutRef.current;
      if (!container) {
        window.print();
        setIsExporting(false);
        return;
      }

      const pageElements = Array.from(container.querySelectorAll<HTMLElement>('.print-page'));
      if (pageElements.length === 0) {
        window.print();
        setIsExporting(false);
        return;
      }

      // 等待离屏容器中所有图片资源加载完成（带超时保险）
      const waitForImages = async (el: HTMLElement) => {
        const images = Array.from(el.querySelectorAll('img'));
        await Promise.all(
          images.map((img) => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
              setTimeout(resolve, 3000);
            });
          })
        );
      };

      await waitForImages(container);

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvasOptions = {
        scale: 3, // 3x 超高清采样（~300 DPI 印刷级高保真分辨率）
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        windowWidth: 1200, // 强制虚拟桌面宽度，彻底消除手机 390px 视口造成的物理横向裁切
        windowHeight: 1600,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc: Document) => {
          // 确保克隆文档具有足够视口宽度，绝不裁剪右侧
          const clonedHtml = clonedDoc.documentElement;
          const clonedBody = clonedDoc.body;
          if (clonedHtml) {
            clonedHtml.style.width = '1200px';
            clonedHtml.style.minWidth = '1200px';
          }
          if (clonedBody) {
            clonedBody.style.width = '1200px';
            clonedBody.style.minWidth = '1200px';
            clonedBody.style.position = 'relative';
          }
          // 强制优先中文字体栈，消除西文字体度量对汉字基线的拉扯致使下沉的缺陷，并修复 Tailwind preflight 对基线的破坏
          const fontResetStyle = clonedDoc.createElement('style');
          fontResetStyle.innerHTML = `
            .print-layout, .print-layout * {
              font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", "Noto Sans SC", "Noto Sans CJK SC", -apple-system, sans-serif !important;
              -webkit-font-smoothing: antialiased;
              text-rendering: optimizeLegibility;
            }
            .print-layout img {
              display: inline-block !important;
            }
            .print-layout svg {
              display: inline-block !important;
              vertical-align: middle !important;
            }
          `;
          clonedDoc.head.appendChild(fontResetStyle);

          const clonedLayout = clonedDoc.querySelector('.print-layout') as HTMLElement;
          if (clonedLayout) {
            clonedLayout.style.position = 'absolute';
            clonedLayout.style.left = '0';
            clonedLayout.style.top = '0';
            clonedLayout.style.width = '794px';
            clonedLayout.style.display = 'block';
            clonedLayout.style.visibility = 'visible';
          }
        },
      };

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pagesDataUrls: string[] = [];

      // 遍历所有独立的 A4 页面容器逐页渲染
      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const canvas = await html2canvas(pageElements[i], canvasOptions);
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pagesDataUrls.push(imgData);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'SLOW');
      }

      const rawTitle = getProductText(product?.nameTextId, product?.nameText) || 'Specification';
      // 深度清洗文件名：过滤所有控制符、路径符、Unicode标点符号（如省略号），截取安全长度
      const safeTitle = rawTitle
        .replace(/[\r\n\t/\\?%*:|"<>…,\u2026'"`]/g, '_')
        .replace(/[_\s]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 50);
      const fileName = `${safeTitle || 'Specification'}.pdf`;

      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // 打开站内规格书预览模态窗，并持久化保存 pdf 实例，便于后续一键原生调用 pdf.save()
      setSpecPreviewData({
        isOpen: true,
        pages: pagesDataUrls,
        fileName,
        pdfBlob,
        pdfFile,
        pdfDoc: pdf,
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // 终端环境与浏览器探测（精细识别国内微信/QQ/钉钉及海外热门 WhatsApp, Telegram, X, Facebook, Instagram, LINE 等）
  const getDeviceContext = () => {
    if (typeof navigator === 'undefined') {
      return {
        isIOS: false,
        isAndroid: false,
        isWeChat: false,
        isEnterpriseWeChat: false,
        isQQ: false,
        isDingTalk: false,
        isWeibo: false,
        isLark: false,
        isDomesticSocial: false,
        isWhatsApp: false,
        isFacebook: false,
        isInstagram: false,
        isTwitter: false,
        isTelegram: false,
        isLine: false,
        isLinkedIn: false,
        isOverseasSocial: false,
        isSocialApp: false,
        socialAppName: '',
        safariVersion: 999,
      };
    }
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);

    // 国内主流社交软件内置容器识别
    const isWeChat = /MicroMessenger/i.test(ua);
    const isEnterpriseWeChat = /wxwork/i.test(ua);
    const isQQ = /QQ\//i.test(ua) || /V1_AND_SQ_/i.test(ua);
    const isDingTalk = /DingTalk/i.test(ua);
    const isWeibo = /Weibo/i.test(ua);
    const isLark = /Lark/i.test(ua) || /Feishu/i.test(ua);
    const isDomesticSocial = isWeChat || isEnterpriseWeChat || isQQ || isDingTalk || isWeibo || isLark;

    // 海外热门社交应用内置容器识别
    const isWhatsApp = /WhatsApp/i.test(ua);
    const isFacebook = /FBAN|FBAV|FB_IAB|Messenger/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isTwitter = /Twitter/i.test(ua);
    const isTelegram = /Telegram/i.test(ua);
    const isLine = /Line\//i.test(ua);
    const isLinkedIn = /LinkedInApp/i.test(ua);
    const isOverseasSocial = isWhatsApp || isFacebook || isInstagram || isTwitter || isTelegram || isLine || isLinkedIn;

    let socialAppName = '';
    if (isWeChat) socialAppName = isEnterpriseWeChat ? '企业微信' : '微信';
    else if (isQQ) socialAppName = 'QQ';
    else if (isDingTalk) socialAppName = '钉钉';
    else if (isWeibo) socialAppName = '微博';
    else if (isLark) socialAppName = '飞书';
    else if (isWhatsApp) socialAppName = 'WhatsApp';
    else if (isTelegram) socialAppName = 'Telegram';
    else if (isFacebook) socialAppName = 'Facebook';
    else if (isInstagram) socialAppName = 'Instagram';
    else if (isTwitter) socialAppName = 'X (Twitter)';
    else if (isLine) socialAppName = 'LINE';
    else if (isLinkedIn) socialAppName = 'LinkedIn';

    const isSocialApp = isDomesticSocial || isOverseasSocial;

    let safariVersion = 999;
    const safariMatch = ua.match(/Version\/(\d+)/);
    if (safariMatch && /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS/i.test(ua)) {
      safariVersion = parseInt(safariMatch[1], 10);
    }
    return {
      isIOS,
      isAndroid,
      isWeChat,
      isEnterpriseWeChat,
      isQQ,
      isDingTalk,
      isWeibo,
      isLark,
      isDomesticSocial,
      isWhatsApp,
      isFacebook,
      isInstagram,
      isTwitter,
      isTelegram,
      isLine,
      isLinkedIn,
      isOverseasSocial,
      isSocialApp,
      socialAppName,
      safariVersion,
    };
  };

  // 分享功能：智能识别访问设备和环境，减少多层级弹窗，海内外社交内置容器均智能直达
  const handleShareSpec = async () => {
    if (isSharing) return;
    setIsSharing(true);

    const rawTitle = getProductText(product?.nameTextId, product?.nameText) || 'Specification';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `${rawTitle} - Technical Specification`;
    const device = getDeviceContext();

    // 1. 若在封闭式国内社交软件内置浏览器（微信、企业微信、QQ内置、钉钉等）：
    // 这些平台底层禁用了 Web Share API，自动复制链接并直接拉起右上角【···】直达指引蒙层
    if (device.isDomesticSocial) {
      setCurrentSocialAppName(device.socialAppName);
      await copyToClipboard(currentUrl);

      if (typeof (window as any).WeixinJSBridge !== 'undefined') {
        try {
          (window as any).WeixinJSBridge.call('showOptionMenu');
        } catch {}
      }

      toast({
        title: `已开启${device.socialAppName}专属分享`,
        description: '规格书链接已自动复制，点击右上角【···】即可直接转发给好友！',
      });

      setIsSocialGuideOpen(true);
      setIsSharing(false);
      return;
    }

    // 2. 外部普通浏览器 / 现代移动端浏览器（包括 Android、HarmonyOS、iOS 等）：
    // 关键规范：
    // a. 绝不在同一个点击事件中多次调用 navigator.share（第一次若失败，用户手势立即被浏览器消耗，第二次必报 NotAllowedError）！
    // b. 必须先通过同步的 navigator.canShare() 预检当前设备支持的数据格式，然后再发起一次且仅一次 navigator.share！
    // c. 在 Android / 鸿蒙上分享链接时，只传 title 和 url，不传冗余 text，根除 Android Intent 字段冲突崩溃！
    if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
      let targetPayload: any = null;

      // 优先预检：是否支持原生文件直传（包含 Android Chrome/Edge 以及 iOS Safari 15+）
      if (specPreviewData.pdfFile && typeof (navigator as any).canShare === 'function') {
        try {
          const testFilePayload = { files: [specPreviewData.pdfFile], title: rawTitle };
          if ((navigator as any).canShare(testFilePayload)) {
            targetPayload = testFilePayload;
          }
        } catch (e) {
          console.warn('[Share] File canShare test skipped:', e);
        }
      }

      // 若不支持直接传文件，降级为精准链接分享（专为安卓/鸿蒙系统 Intent 优化，只传 title 和 url）
      if (!targetPayload) {
        const linkPayload = {
          title: rawTitle,
          url: currentUrl,
        };
        if (typeof (navigator as any).canShare === 'function') {
          try {
            if ((navigator as any).canShare(linkPayload)) {
              targetPayload = linkPayload;
            }
          } catch {
            targetPayload = linkPayload;
          }
        } else {
          targetPayload = linkPayload;
        }
      }

      // 执行且仅执行一次系统原生 share，保留完整瞬时用户手势凭据
      if (targetPayload) {
        try {
          await (navigator as any).share(targetPayload);
          setIsSharing(false);
          return; // 系统原生分享面板成功拉起并完成！
        } catch (shareErr: any) {
          // 若用户在系统分享菜单中主动点击了“取消”或返回，直接平稳退出
          if (shareErr?.name === 'AbortError') {
            setIsSharing(false);
            return;
          }
          console.warn('[Share] Native share failed, proceeding to fallback:', shareErr);
        }
      }
    }

    // 3. 降级环境（如桌面 PC、或定制浏览器安全策略屏蔽）：自动复制链接并呼出多渠道分享中心弹窗
    const copied = await copyToClipboard(currentUrl);
    toast({
      title: copied ? '规格书链接已复制' : '分享面板已就绪',
      description: '已为您复制产品直达链接，您可通过快捷渠道分享给好友或客户。',
    });
    setIsFallbackModalOpen(true);
    setIsSharing(false);
  };

  // 保存规格书 PDF：优先调用系统原生另存为 (SavePicker)，兜底使用 jsPDF 原生导出与标准 Blob 触发
  const handleSaveSpec = async () => {
    if (!specPreviewData.pdfBlob || isSaving) return;
    setIsSaving(true);

    // 双重校验文件名与 .pdf 后缀，清洗安全文件名（保留字母、数字、中文、下划线、减号）
    const rawFileName = specPreviewData.fileName || 'Specification.pdf';
    const cleanBase = rawFileName
      .replace(/\.pdf$/i, '')
      .replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40);
    const finalFileName = `${cleanBase || 'Product_Specification'}.pdf`;

    const blob = specPreviewData.pdfBlob.type === 'application/pdf'
      ? specPreviewData.pdfBlob
      : new Blob([specPreviewData.pdfBlob], { type: 'application/pdf' });

    try {
      // 1. 方案一（现代桌面 Chrome / Edge 首选）：调用浏览器原生系统“另存为”对话框
      // 该 API 直接由 Windows/macOS 操作系统接管，强制锁定 .pdf 扩展名，绝无乱码或无后缀问题
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: finalFileName,
            types: [
              {
                description: 'PDF Document (*.pdf)',
                accept: {
                  'application/pdf': ['.pdf'],
                },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          toast({
            title: '规格书保存成功',
            description: `${finalFileName} 已成功保存到您的电脑。`,
          });
          setIsSaving(false);
          return;
        } catch (pickerErr: any) {
          if (pickerErr?.name === 'AbortError') {
            // 用户在系统对话框中主动点击了“取消”
            setIsSaving(false);
            return;
          }
          console.warn('showSaveFilePicker failed, trying fallback methods:', pickerErr);
        }
      }

      // 2. 方案二（jsPDF 原生保存）：由 jsPDF 自身核心引擎直接写入
      if (specPreviewData.pdfDoc && typeof specPreviewData.pdfDoc.save === 'function') {
        try {
          specPreviewData.pdfDoc.save(finalFileName);
          setIsSaving(false);
          return;
        } catch (pdfSaveErr) {
          console.warn('jsPDF save failed, falling back to blob anchor:', pdfSaveErr);
        }
      }

      // 3. 方案三（主窗口直接触发 a[download]）：彻底弃用隐藏 iframe，避免 Chrome 将其判定为子框架后台流生成乱码无后缀临时文件
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = finalFileName;
      link.setAttribute('download', finalFileName);
      link.rel = 'noopener';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 5000);
    } catch (saveErr) {
      console.error('All PDF download methods failed:', saveErr);
      toast({
        title: '下载遇到问题',
        description: '未能直接保存文件，请重试或尝试转发分享。',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    setProductUrl(window.location.href);

    // 挂载后再把匹配成功的语种存入 local storage 和 Cookie
    if (typeof window !== 'undefined') {
      localStorage.setItem('heovose-locale', locale);
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; // 1 year
    }
  }, [locale]);

  useEffect(() => {
    if (product?.mainImageUrl) {
      setActiveMedia({
        url: product.mainImageUrl,
        type: isVideoUrl(product.mainImageUrl) ? 'video' : 'image'
      });
    }
  }, [product?.mainImageUrl]);

  const { data: categories } = useLocalCollection<any>('productCategories');
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  const { data: siteConfig } = useLocalDoc<any>('settings', 'site');
  const { t: tr } = useTranslations(locale);

  // 校验解析出的翻译内容是否是系统级翻译 Key 或是无有效内容的英文 Key。
  // 如果是 Key 模式（如大写且含下划线，或含有前缀等），直接判定为未翻译，返回空。
  const isTranslationKey = (val: any, textId?: string): boolean => {
    if (typeof val !== 'string' || !val) return false;
    const clean = val.trim();
    if (textId && clean === textId) return true;
    
    // 如果是系统正式翻译ID（以 biz_tr_ 或 spec_ 开头），它不是硬编码的系统语言Key占位符，而是待匹配的多语言文本，不应该判定为Key
    if (/^(biz_tr_|spec_)/i.test(clean)) return false;
    if (textId && /^(biz_tr_|spec_)/i.test(textId)) return false;
    
    // 匹配系统预设规则：大写字母+下划线，或者特定前缀
    if (/^[A-Z0-9_]{3,}$/.test(clean)) return true;
    if (/^(PROD|SPEC|CAT|MAP|ABOUT|NAV|SYS|SERVICE|PROCESS|CASES|ADV)_/i.test(clean)) return true;
    return false;
  };

  const sanitizeVal = (val: any, textId?: string) => {
    if (isTranslationKey(val, textId)) return '';
    return val || '';
  };

  // 本地翻译兜底逻辑，服务于 SSR 和首次渲染，防止没有接口数据时显示空白
  const getProductText = (textId: string, textObj: any) => {
    if (!textId) return '';

    if (textObj) {
      let content = textObj.content || textObj;
      if (typeof content === 'string') {
        try { content = JSON.parse(content); } catch { content = {}; }
      }
      if (content && typeof content === 'object') {
        if (content.content && typeof content.content === 'object' && !Array.isArray(content.content)) {
          content = content.content;
        }
        if (content[locale] !== undefined && content[locale] !== null && content[locale] !== '') {
          return sanitizeVal(content[locale], textId);
        }
        if (locale === 'vi' && content['vn'] !== undefined && content['vn'] !== null && content['vn'] !== '') {
          return sanitizeVal(content['vn'], textId);
        }
        if (locale === 'vn' && content['vi'] !== undefined && content['vi'] !== null && content['vi'] !== '') {
          return sanitizeVal(content['vi'], textId);
        }
      }
      if (textObj[locale] !== undefined && textObj[locale] !== null && textObj[locale] !== '') {
        return sanitizeVal(textObj[locale], textId);
      }
      if (locale === 'vi' && textObj['vn'] !== undefined && textObj['vn'] !== null && textObj['vn'] !== '') {
        return sanitizeVal(textObj['vn'], textId);
      }
      if (locale === 'vn' && textObj['vi'] !== undefined && textObj['vi'] !== null && textObj['vi'] !== '') {
        return sanitizeVal(textObj['vi'], textId);
      }
      const fallbackVal = textObj.en || textObj.zh || '';
      return sanitizeVal(fallbackVal, textId);
    }
    const fromGlobal = tr(textId);
    if (fromGlobal && !isTranslationKey(fromGlobal)) return fromGlobal;
    return '';
  };

  const specTranslationMap = useMemo(() => {
    const map = new Map<string, any>();
    if (product?.specTranslations && Array.isArray(product.specTranslations)) {
      product.specTranslations.forEach((t: any) => {
        if (t && t.id) {
          map.set(t.id, t);
        }
      });
    }
    return map;
  }, [product]);

  const getSpecText = (textId: string) => {
    if (!textId) return '';
    const translationObj = specTranslationMap.get(textId);
    if (translationObj) {
      return getProductText(textId, translationObj);
    }
    const fromGlobal = tr(textId);
    if (fromGlobal && fromGlobal !== textId && !isTranslationKey(fromGlobal)) return fromGlobal;
    
    // 如果是类似 spec_ / biz_tr_ 等 ID 格式，但前台未能成功关联对应的多语言词条对象：
    // 我们也尽力将这个文本作为 ID 进行原样或全局缓存返回，不直接过滤丢弃
    return textId;
  };

  const getSystemText = (key: string) => {
    const fromDb = tr(key);
    if (fromDb) return fromDb;
    const fallback = SYSTEM_FALLBACKS[key];
    if (fallback) {
      return fallback[locale] || fallback['en'] || '';
    }
    return key;
  };

  const companyEmail = tr('COMPANY_EMAIL') || 'sales@heovose.com';
  const companyPhone = tr('COMPANY_PHONE');
  const companyName = tr('COMPANY_NAME') || siteConfig?.companyName || tr('SITE_TITLE') || 'Heovose Technology';
  const companyWebsite = siteConfig?.primaryDomain 
    ? siteConfig.primaryDomain.replace(/^https?:\/\//i, '').replace(/\/$/, '')
    : (typeof window !== 'undefined' ? window.location.host : 'www.heovose.com');
  const companyContact = companyPhone && companyPhone !== companyEmail
    ? `${companyEmail} / ${companyPhone}`
    : companyEmail;

  // 动态将该产品及其分类和规格的翻译按需注入全局缓存
  useEffect(() => {
    if (product) {
      const translations = [
        product.nameText,
        product.descriptionText,
        product.category?.nameText,
        product.category?.descriptionText,
        ...(product.specTranslations || [])
      ].filter(Boolean);
      injectTranslations(locale, translations);
    }
  }, [product, locale]);

  const productDetails = useMemo(() => {
    if (!product?.localizedDetails) return '';
    let details = product.localizedDetails;
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch (e) {
        console.error('Failed to parse localizedDetails JSON:', e);
        return '';
      }
    }
    const content = details?.[locale] || details?.['en'] || details?.['zh'] || '';
    const plainText = content.replace(/<[^>]*>?/gm, '').trim();
    if (!plainText) return '';

    // Process all img tags inside the rich-text details using getAssetUrl
    // to dynamically resolve local/private storage hosts into correct asset URLs
    const processedHtml = content.replace(/<img\s+([^>]*?)src="([^"]*?)"([^>]*?)>/gi, (match: string, before: string, src: string, after: string) => {
      return `<img ${before}src="${getAssetUrl(src)}"${after}>`;
    });

    return processedHtml;
  }, [product, locale]);

  useEffect(() => {
    if (productDetails) {
      import('dompurify').then((DOMPurifyModule) => {
        const DOMPurify = DOMPurifyModule.default || DOMPurifyModule;
        setSanitizedDetails(DOMPurify.sanitize(productDetails));
      }).catch((err) => {
        console.error('Failed to load DOMPurify', err);
        setSanitizedDetails('');
      });
    } else {
      setSanitizedDetails('');
    }
  }, [productDetails]);

  const categoryName = useMemo(() => {
    if (!product) return '';
    // 优先采用产品自带的分类多语言实体，满足 SSR 阶段渲染
    const cat = product.category;
    if (cat) {
      return getProductText(cat.nameTextId, cat.nameText);
    }
    const found = categories?.find((c: any) => c.id === product.categoryId);
    return found ? getProductText(found.nameTextId, found.nameText) : '';
  }, [product, categories, locale, tr]);

  const advantages = useMemo(() => {
    const desc = getProductText(product?.descriptionTextId, product?.descriptionText);
    if (!desc) return [];
    return desc.split(/\r?\n/).map((line: string) => line.trim()).filter((line: string) => line.length > 0);
  }, [product, locale, tr]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [product.mainImageUrl, ...(product.galleryImageUrls || [])].filter(Boolean) as string[];
  }, [product]);

  const zoomImages = useMemo(() => {
    return galleryImages.filter(img => !isVideoUrl(img));
  }, [galleryImages]);

  const currentZoomIndex = useMemo(() => {
    return zoomImages.indexOf(activeMedia.url);
  }, [zoomImages, activeMedia.url]);

  useEffect(() => {
    if (!isZoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomOpen(false);
        setZoomScale(1);
      } else if (e.key === 'ArrowLeft' && currentZoomIndex > 0) {
        setActiveMedia({ url: zoomImages[currentZoomIndex - 1], type: 'image' });
        setZoomScale(1);
      } else if (e.key === 'ArrowRight' && currentZoomIndex < zoomImages.length - 1) {
        setActiveMedia({ url: zoomImages[currentZoomIndex + 1], type: 'image' });
        setZoomScale(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen, currentZoomIndex, zoomImages]);

  const { data: relatedProducts } = useLocalCollection<any>(product?.id ? `products/${product.id}/related` : null);

  // 注入推荐产品的翻译数据
  useEffect(() => {
    if (relatedProducts && Array.isArray(relatedProducts)) {
      const trans = relatedProducts.flatMap((p: any) => [p.nameText, p.descriptionText].filter(Boolean));
      injectTranslations(locale, trans);
    }
  }, [relatedProducts, locale]);

  const displayRelatedProducts = useMemo(() => {
    return relatedProducts || [];
  }, [relatedProducts]);

  const parsedSpecs = useMemo(() => {
    if (!product?.specGroups) return { groups: [], orderedFootnotes: [], unorderedFootnotes: [] };
    let specGroupsArray = product.specGroups;
    if (typeof specGroupsArray === 'string') {
      try {
        specGroupsArray = JSON.parse(specGroupsArray);
      } catch (e) {
        console.error('Failed to parse specGroups JSON:', e);
        return { groups: [], orderedFootnotes: [], unorderedFootnotes: [] };
      }
    }
    if (!Array.isArray(specGroupsArray)) return { groups: [], orderedFootnotes: [], unorderedFootnotes: [] };

    const orderedList: string[] = [];
    const unorderedList: string[] = [];

    const getOrderedIndex = (content: string) => {
      const idx = orderedList.indexOf(content);
      if (idx !== -1) return idx + 1;
      orderedList.push(content);
      return orderedList.length;
    };

    const getUnorderedAsterisks = (content: string) => {
      let idx = unorderedList.indexOf(content);
      if (idx === -1) {
        unorderedList.push(content);
        idx = unorderedList.length - 1;
      }
      return '*'.repeat(idx + 1);
    };

    const processText = (text: string) => {
      if (!text) return '';
      
      // 1. Process Ordered Footnotes [[content]]
      let result = text.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
        const footnoteContent = (p1 || '').trim();
        if (!footnoteContent) return '';
        const num = getOrderedIndex(footnoteContent);
        return `<sup class="text-amber-500 font-bold ml-0.5 select-none">[${num}]</sup>`;
      });

      // 2. Process Unordered Footnotes {{content}}
      result = result.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
        const footnoteContent = (p1 || '').trim();
        if (!footnoteContent) return '';
        const asterisks = getUnorderedAsterisks(footnoteContent);
        return `<sup class="text-amber-500 font-black ml-0.5 select-none">${asterisks}</sup>`;
      });

      return result;
    };

    const groups = specGroupsArray.map((group: any) => ({
      title: processText(getSpecText(group.titleId) || ''),
      footnote: getSpecText(group.footnoteId),
      items: (group.items || []).map((item: any) => {
        const label = processText(getSpecText(item.labelId) || '');
        const value = processText(getSpecText(item.valueId) || '');
        return { label, value };
      }).filter((i: any) => (i.label && i.label.trim() !== '') || (i.value && i.value.trim() !== ''))
    })).filter((g: any) => g.title && g.items.length > 0);

    return { groups, orderedFootnotes: orderedList, unorderedFootnotes: unorderedList };
  }, [product, locale, tr, specTranslationMap]);

  const groupedSpecs = parsedSpecs.groups;

  // 核心优势自适应画幅与缩略图尺寸配置（优势过多时压缩纵向高度，确保第一页完整排版不换页，且宽高严格锁定 11:9 黄金画幅）
  const heroImageConfig = useMemo(() => {
    const advCount = advantages.length;
    if (advCount === 0) {
      // 无核心优势：主图适度精炼居中（484x396，严格 11:9），为下方技术规格表留出充足空间
      return {
        mainWidth: 484,
        mainHeight: 396,
        imgMaxW: 452,
        imgMaxH: 364,
        thumbWidth: 77,
        thumbHeight: 63,
        thumbImgMaxW: 71,
        thumbImgMaxH: 57,
        thumbGap: 8,
        useTwoColumnsForAdv: false,
      };
    } else if (advCount <= 2) {
      // 1~2 条核心优势：大画幅旗舰封面（572x468，严格 11:9）
      return {
        mainWidth: 572,
        mainHeight: 468,
        imgMaxW: 540,
        imgMaxH: 436,
        thumbWidth: 99,
        thumbHeight: 81,
        thumbImgMaxW: 91,
        thumbImgMaxH: 73,
        thumbGap: 10,
        useTwoColumnsForAdv: false,
      };
    } else if (advCount <= 4) {
      // 3~4 条核心优势：适度压缩主图（484x396，严格 11:9）与缩略图，核心优势采用双列网格，确保整页不换页
      return {
        mainWidth: 484,
        mainHeight: 396,
        imgMaxW: 452,
        imgMaxH: 364,
        thumbWidth: 88,
        thumbHeight: 72,
        thumbImgMaxW: 80,
        thumbImgMaxH: 64,
        thumbGap: 8,
        useTwoColumnsForAdv: true,
      };
    } else {
      // 5 条及以上核心优势（内容极多）：极限压缩主图（440x360，严格 11:9）与缩略图，优势双列紧凑卡片，第一页完整排版绝不换页
      return {
        mainWidth: 440,
        mainHeight: 360,
        imgMaxW: 410,
        imgMaxH: 330,
        thumbWidth: 77,
        thumbHeight: 63,
        thumbImgMaxW: 71,
        thumbImgMaxH: 57,
        thumbGap: 6,
        useTwoColumnsForAdv: true,
      };
    }
  }, [advantages.length]);

  // 工业级智能双列流规格表分页：左右两列排布不同规格子表，保持子表完整性，绝不随意切碎表格
  const specPagination = useMemo(() => {
    if (!groupedSpecs || groupedSpecs.length === 0) {
      return {
        page1Data: { leftGroups: [], rightGroups: [] },
        subsequentPages: [],
        totalPages: 1,
      };
    }

    const hasAdvantages = advantages.length > 0;
    const hasGallery = product?.galleryImageUrls && product.galleryImageUrls.filter((img: string) => img !== product.mainImageUrl && !isVideoUrl(img)).length > 0;

    // 单列单位充盈安全容量：下调至 31.2（以 26.4px 基准行高计算，增加约 15.8px 底端呼吸安全空间）
    // 确保右栏内容底端与绝对定位页脚之间留有绝对充裕的留白，杜绝遮挡表格
    const SUBSEQUENT_COL_CAPACITY = 31.2;
    // 无优势时 Page 1 安全容量：有画廊 9 行/列，无画廊 13 行/列
    const PAGE_1_COL_CAPACITY = hasAdvantages ? 0 : (hasGallery ? 9 : 13);

    interface SpecGroupChunk {
      title: string;
      isContinued: boolean;
      items: Array<{ label: string; value: string }>;
      footnote?: string;
    }

    interface SpecPageData {
      leftGroups: SpecGroupChunk[];
      rightGroups: SpecGroupChunk[];
    }

    // 真实物理行高精确换算（1.0 单位 = 26.4px 基准单行高度）：
    // 包含字高 (15.4px) + 上下 padding (10px) + 边线 (1px)；
    // 严格按照列宽（约 240px 可视宽度）与文本长度对多行折行进行足额加权计算，杜绝低估导致的溢出
    const getItemUnits = (item: { label: string; value: string }): number => {
      const cleanVal = (item.value || '').replace(/<[^>]+>/g, '').trim();
      const valLen = cleanVal.length;
      let valUnits = 1.0;
      if (valLen > 140) {
        valUnits = 3.3; // 5行及以上超长文本（如复杂输入输出端口）
      } else if (valLen > 95) {
        valUnits = 2.7; // 4行文本
      } else if (valLen > 55) {
        valUnits = 2.1; // 3行文本
      } else if (valLen > 24) {
        valUnits = 1.5; // 2行文本
      }

      const cleanLabel = (item.label || '').replace(/<[^>]+>/g, '').trim();
      let labelUnits = 1.0;
      if (cleanLabel.length > 20) {
        labelUnits = 1.5;
      }

      return Math.max(valUnits, labelUnits);
    };

    const HEADER_UNITS = 1.15; // 子表标题所占高度单位（字高 16px + pb 7px + mb 5px + border 1px ≈ 29px）
    const GROUP_GAP_UNITS = 0.55; // 组间纵向留白单位（14px 间隙 / 26.4px）

    const getGroupUnits = (items: Array<{ label: string; value: string }>): number => {
      const itemsUnit = items.reduce((sum, it) => sum + getItemUnits(it), 0);
      return HEADER_UNITS + itemsUnit + GROUP_GAP_UNITS;
    };

    // 精确测算在剩余可用空间 avail 内，最多能安全塞入多少个 items，确保累加高度绝对不超载
    const calcFitCount = (items: Array<{ label: string; value: string }>, avail: number): number => {
      let used = HEADER_UNITS;
      let count = 0;
      for (let i = 0; i < items.length; i++) {
        const u = getItemUnits(items[i]);
        if (used + u + GROUP_GAP_UNITS <= avail) {
          used += u;
          count++;
        } else {
          break;
        }
      }
      return count;
    };

    const totalUnits = groupedSpecs.reduce((sum: number, g: any) => sum + getGroupUnits(g.items), 0);

    // 核心排版准则：只有当整份产品的所有规格能在 Page 1 完整 100% 容纳（整份 PDF 为 1 页）时，才在 Page 1 底部排布；
    // 一旦规格内容超出 Page 1 容量（必须跨页），Page 1 则保持作为纯净大气的旗舰产品封面，所有技术规格统一从 Page 2 开始展开，绝不在封面底部强塞半截残缺表！
    const canFitEntirelyOnPage1 = !hasAdvantages && totalUnits <= PAGE_1_COL_CAPACITY * 2;

    let remainingGroups = groupedSpecs.map((g: any) => ({
      rawTitle: g.title,
      footnote: g.footnote,
      items: [...g.items],
      isSplit: false,
    }));

    // 双列连续流式自然分栏引擎（反 N 字型排序：左上 -> 左下 -> 右上 -> 右下）：
    // 1. 空间极致饱满：左列能排尽量排，排不下且有空间则果断切分，续表流向右列（左主右续）；
    // 2. 右列续表排完后，继续排入后续子表；若放不下，同样切分填满右列，余量流向下一页左侧（续表延伸到下一页左侧）；
    // 3. 彻底杜绝大面积空白区域，每一栏均饱满严整，同时物理高度严格受控，绝不遮挡页脚。
    const distributeGroupsToPage = (
      groupsPool: typeof remainingGroups,
      colCapacity: number
    ): { pageData: SpecPageData; remainingPool: typeof remainingGroups } => {
      const leftGroups: SpecGroupChunk[] = [];
      const rightGroups: SpecGroupChunk[] = [];
      let leftUnits = 0;
      let rightUnits = 0;

      let currentPool = [...groupsPool];
      let currentCol: 'left' | 'right' = 'left';

      while (currentPool.length > 0) {
        const group = currentPool[0];
        const gUnits = getGroupUnits(group.items);

        if (currentCol === 'left') {
          const leftAvail = colCapacity - leftUnits;

          // 1. 左列能完整容纳该子表（或续表）
          if (gUnits <= leftAvail) {
            leftGroups.push({
              title: group.isSplit
                ? `${group.rawTitle} <span class="text-xs text-slate-400 font-normal ml-2">(${getSystemText('continued') || '续'})</span>`
                : group.rawTitle,
              isContinued: group.isSplit,
              items: group.items,
              footnote: group.footnote,
            });
            leftUnits += gUnits;
            currentPool.shift();
            continue; // 左列还有剩余空间，继续排下一个子表！
          }

          // 2. 左列无法完整容纳该表：果断进行分栏，充分填满左下，续表流向右上！
          const fitLeft = calcFitCount(group.items, leftAvail);
          if (fitLeft >= 1 && group.items.length - fitLeft >= 1) {
            const leftItems = group.items.slice(0, fitLeft);
            const restItems = group.items.slice(fitLeft);

            leftGroups.push({
              title: group.isSplit
                ? `${group.rawTitle} <span class="text-xs text-slate-400 font-normal ml-2">(${getSystemText('continued') || '续'})</span>`
                : group.rawTitle,
              isContinued: group.isSplit,
              items: leftItems,
              footnote: undefined,
            });
            leftUnits += getGroupUnits(leftItems);

            // 续表顺流排到右侧（续表）继续
            currentPool[0] = { ...group, items: restItems, isSplit: true };
            currentCol = 'right';
            continue;
          } else {
            // 左列空间已无法容纳哪怕 1 项，左列饱和，转入右列
            currentCol = 'right';
            continue;
          }
        }

        if (currentCol === 'right') {
          const rightAvail = colCapacity - rightUnits;

          // 1. 右列能完整容纳
          if (gUnits <= rightAvail) {
            rightGroups.push({
              title: group.isSplit
                ? `${group.rawTitle} <span class="text-xs text-slate-400 font-normal ml-2">(${getSystemText('continued') || '续'})</span>`
                : group.rawTitle,
              isContinued: group.isSplit,
              items: group.items,
              footnote: group.footnote,
            });
            rightUnits += gUnits;
            currentPool.shift();
            continue; // 右列还有剩余空间，继续排下一个子表！
          }

          // 2. 右列无法完整容纳：果断进行分栏，充分填满右下，续表流向下一页左侧！
          const fitRight = calcFitCount(group.items, rightAvail);
          if (fitRight >= 1 && group.items.length - fitRight >= 1) {
            const rightItems = group.items.slice(0, fitRight);
            const restItems = group.items.slice(fitRight);

            rightGroups.push({
              title: group.isSplit
                ? `${group.rawTitle} <span class="text-xs text-slate-400 font-normal ml-2">(${getSystemText('continued') || '续'})</span>`
                : group.rawTitle,
              isContinued: group.isSplit,
              items: rightItems,
              footnote: undefined,
            });
            rightUnits += getGroupUnits(rightItems);

            // 续表顺延至下一页左侧继续！
            currentPool[0] = { ...group, items: restItems, isSplit: true };
            break; // 本页两列均已充分利用饱和，结束本页
          } else {
            // 右列空间已无法容纳哪怕 1 项，结束本页，转入下一页左列完整开始
            break;
          }
        }
      }

      return {
        pageData: { leftGroups, rightGroups },
        remainingPool: currentPool,
      };
    };

    let page1Data: SpecPageData = { leftGroups: [], rightGroups: [] };
    const subsequentPages: SpecPageData[] = [];

    // 1. 若整份规格表在 Page 1 能够 100% 完整容纳，排入 Page 1
    if (canFitEntirelyOnPage1 && remainingGroups.length > 0) {
      const res1 = distributeGroupsToPage(remainingGroups, PAGE_1_COL_CAPACITY);
      page1Data = res1.pageData;
      remainingGroups = res1.remainingPool;
    }

    // 2. 否则，所有规格子表统一从后续纯表格页开始排布，保持封面完整大气与表格零碎片
    while (remainingGroups.length > 0) {
      const res = distributeGroupsToPage(remainingGroups, SUBSEQUENT_COL_CAPACITY);
      // 防止极端死循环兜底
      if (res.pageData.leftGroups.length === 0 && res.pageData.rightGroups.length === 0) {
        const g = remainingGroups.shift();
        if (g) {
          const half = Math.ceil(g.items.length / 2);
          res.pageData.leftGroups.push({
            title: g.rawTitle,
            isContinued: g.isSplit,
            items: g.items.slice(0, half),
          });
          res.pageData.rightGroups.push({
            title: `${g.rawTitle} <span class="text-xs text-slate-400 font-normal ml-2">(${getSystemText('continued') || '续'})</span>`,
            isContinued: true,
            items: g.items.slice(half),
            footnote: g.footnote,
          });
          subsequentPages.push(res.pageData);
        }
        continue;
      }
      subsequentPages.push(res.pageData);
      remainingGroups = res.remainingPool;
    }

    const totalPages = canFitEntirelyOnPage1 && subsequentPages.length === 0 ? 1 : 1 + subsequentPages.length;

    return { page1Data, subsequentPages, totalPages };
  }, [groupedSpecs, advantages.length, product, locale]);

  const specPages = specPagination.subsequentPages;
  const totalPdfPages = specPagination.totalPages;

  const jsonLd = useMemo(() => {
    if (!product) return null;
    const productName = getProductText(product.nameTextId, product.nameText);
    const productDesc = product.descriptionTextId ? getProductText(product.descriptionTextId, product.descriptionText) : '';

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": productName,
      "image": product.mainImageUrl ? [getAssetUrl(product.mainImageUrl)] : [],
      "description": productDesc,
      "sku": product.id,
      "mpn": product.id,
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "0",
        "highPrice": "0",
        "offerCount": "1",
        "price": "0",
        "url": productUrl,
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Heovose Elevate"
        }
      }
    };
  }, [product, locale, productUrl]);

  return (
    <main className="min-h-screen bg-background">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Navbar locale={locale} setLocale={setLocale} />

      <div className="pt-32 pb-20 no-print">
        <div className="container mx-auto px-6">
          {/* Print Only Header */}
          <div className="print-header hidden print:flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
            <span className="text-xl font-bold tracking-widest text-primary">HEOVOSE ELEVATE</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Product Specification</span>
          </div>
          <nav className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest mb-12 no-print">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300">
              <Globe className="h-3 w-3" />
              {getSystemText('nav_home')}
            </Link>
            <ChevronRight className="h-3 w-3 text-primary/20" />
            <Link href="/products" className="text-muted-foreground hover:text-primary transition-all duration-300">
              {getSystemText('nav_products')}
            </Link>
            <ChevronRight className="h-3 w-3 text-primary/20" />
            <span className="text-primary truncate max-w-[120px] sm:max-w-[200px] md:max-w-[350px] inline-block align-bottom" title={getProductText(product.nameTextId, product.nameText)}>
              {getProductText(product.nameTextId, product.nameText)}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-[11/9] bg-muted/20 rounded-[2.5rem] overflow-hidden border border-border/40 shadow-inner group flex items-center justify-center">
                {activeMedia.type === 'video' ? (
                  <video
                    src={getAssetUrl(activeMedia.url)}
                    controls
                    autoPlay
                    playsInline
                    muted
                    onEnded={() => {
                      if (product?.mainImageUrl) {
                        setActiveMedia({
                          url: product.mainImageUrl,
                          type: isVideoUrl(product.mainImageUrl) ? 'video' : 'image'
                        });
                      }
                    }}
                    className="w-full h-full object-cover rounded-[2.5rem]"
                  />
                ) : (
                  <Image
                    src={getAssetUrl(activeMedia.url || product.mainImageUrl || '/image/product-placeholder.png')}
                    alt={getProductText(product.nameTextId, product.nameText)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                    className="object-cover premium-zoom-image cursor-zoom-in"
                    onClick={() => setIsZoomOpen(true)}
                  />
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 no-print">
                {[product.mainImageUrl, ...(product.galleryImageUrls || [])].filter(Boolean).map((img, idx) => {
                  const isVid = isVideoUrl(img);
                  const isActive = activeMedia.url === img;

                  return (
                    <button
                      key={`img-${idx}`}
                      onClick={() => setActiveMedia({ url: img, type: isVid ? 'video' : 'image' })}
                      className={cn(
                        "relative aspect-[11/9] rounded-2xl overflow-hidden border-2 bg-muted/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center group/media-thumb",
                        isActive ? "border-primary" : "border-transparent hover:border-primary/40"
                      )}
                    >
                      {isVid ? (
                        <>
                          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            <Image src={getAssetUrl(product.mainImageUrl || '/image/product-placeholder.png')} alt="Video Thumbnail" fill sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw" className="object-cover opacity-60" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover/media-thumb:scale-110 transition-transform duration-300">
                              <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <Image src={getAssetUrl(img || '/image/product-placeholder.png')} alt="Thumbnail" fill sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw" className="object-cover" />
                      )}
                    </button>
                  );
                })}

                {product.videoUrl && ![product.mainImageUrl, ...(product.galleryImageUrls || [])].filter(Boolean).includes(product.videoUrl) && (
                  <button
                    onClick={() => setActiveMedia({ url: product.videoUrl, type: 'video' })}
                    className={cn(
                      "relative aspect-[11/9] rounded-2xl overflow-hidden border-2 bg-muted/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center group/vid-thumb",
                      activeMedia.type === 'video' && activeMedia.url === product.videoUrl ? "border-primary" : "border-transparent hover:border-primary/40"
                    )}
                  >
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                      <Image src={getAssetUrl(product.mainImageUrl || '/image/product-placeholder.png')} alt="Video Thumbnail" fill sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw" className="object-cover opacity-60 animate-fade-in" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover/vid-thumb:scale-110 transition-transform duration-300">
                        <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Print Only Gallery Grid (Images only) */}
              {galleryImages.filter(img => !isVideoUrl(img)).length > 0 && (
                <div className="hidden print:grid grid-cols-3 gap-4 mt-4">
                  {galleryImages.filter(img => !isVideoUrl(img)).map((img, idx) => (
                    <div key={idx} className="relative aspect-[11/9] border border-slate-200 rounded-2xl overflow-hidden bg-muted/5">
                      <Image src={getAssetUrl(img)} alt="Product Gallery" fill sizes="(max-width: 768px) 33vw, 25vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

            </div>


            <div className="lg:col-span-5 flex flex-col space-y-10">
              <div className="space-y-4">
                {categoryName && (
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center h-6 px-3.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.18em] leading-none select-none">
                      {categoryName}
                    </span>
                  </div>
                )}
                <h1 className="text-4xl font-headline font-bold leading-tight text-primary">{getProductText(product.nameTextId, product.nameText)}</h1>
              </div>

              {advantages.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] leading-none">{getSystemText('core_advantages')}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {advantages.map((adv: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-3 bg-muted/20 rounded-2xl border border-border/20">
                        <Star className="h-5 w-5 shrink-0 text-primary fill-primary/10" />
                        <span className="text-sm leading-5 text-muted-foreground font-medium whitespace-pre-wrap">{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6 no-print">
                <Button
                  onClick={() => openInquiry({
                    productId: product.id,
                    productName: getProductText(product.nameTextId, product.nameText)
                  })}
                  className="h-16 min-h-16 px-10 rounded-2xl text-base font-bold flex-1 shadow-xl"
                >
                  {getSystemText('product_contact_now')} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={handleOpenSpecPreview}
                  disabled={isExporting}
                  variant="outline"
                  className="h-16 min-h-16 px-8 rounded-2xl"
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-5 w-5" />
                  )}
                  {getSystemText('product_spec_sheet')}
                </Button>
              </div>

              <div className="pt-8 border-t border-border/40 no-print">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{getSystemText('nav_contact')}</span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    <a href={`mailto:${companyEmail}`} className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                      <Mail className="h-4 w-4 opacity-40" /> {companyEmail}
                    </a>
                    <a href={`tel:${companyPhone}`} className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                      <Phone className="h-4 w-4 opacity-40" /> {companyPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-slate-100 no-print">
        <div className="container mx-auto px-6 py-24 max-w-[1200px]">
          <Tabs defaultValue={productDetails ? "desc" : "specs"} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 border-b border-slate-100 w-full justify-start gap-12 rounded-none mb-16 no-print">
              {productDetails && <TabsTrigger value="desc" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-6 text-sm font-bold text-slate-400 data-[state=active]:text-primary transition-all tracking-widest">{getSystemText('product_tab_desc')}</TabsTrigger>}
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-6 text-sm font-bold text-slate-400 data-[state=active]:text-primary transition-all tracking-widest">{getSystemText('product_tab_specs')}</TabsTrigger>
            </TabsList>

            {productDetails && (
              <TabsContent value="desc" forceMount className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 data-[state=inactive]:hidden print:data-[state=inactive]:block">
                <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizedDetails }} />
              </TabsContent>
            )}
            <TabsContent value="specs" forceMount className="animate-in fade-in slide-in-from-bottom-4 duration-700 data-[state=inactive]:hidden print:data-[state=inactive]:block">
              <div className="space-y-16">
                {groupedSpecs.map((group: any, gIdx: number) => (
                  <div key={gIdx} className="space-y-8">
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-headline font-bold text-primary shrink-0" dangerouslySetInnerHTML={{ __html: group.title }} />
                      <div className="h-px bg-border flex-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.items.map((item: any, iIdx: number) => (
                        <div key={iIdx} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col gap-3 group/spec">
                          <span className="text-xs font-bold tracking-[0.1em] text-slate-400 group-hover/spec:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: item.label }} />
                          <span className="text-sm font-normal text-slate-900 font-['JetBrains_Mono'] leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: item.value }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {(parsedSpecs.orderedFootnotes.length > 0 || parsedSpecs.unorderedFootnotes.length > 0) && (
                  <div className="mt-16 pt-8 border-t border-slate-100 space-y-3 no-print">
                    <div className="space-y-3">
                      {parsedSpecs.unorderedFootnotes.map((fn, idx) => (
                        <p key={idx} className="text-xs text-slate-400/90 font-mono flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-500 font-bold shrink-0 select-none">{'*'.repeat(idx + 1)}</span>
                          <span>{fn}</span>
                        </p>
                      ))}
                      {parsedSpecs.orderedFootnotes.map((fn, idx) => (
                        <p key={idx} className="text-xs text-slate-400/90 font-mono flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-500 font-bold shrink-0 select-none">[{idx + 1}]</span>
                          <span>{fn}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {displayRelatedProducts.length > 0 && (
            <div className="mt-40 space-y-12 no-print">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-headline font-bold text-primary uppercase tracking-tight">{getSystemText('related_products_title')}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{getSystemText('explore_more_tech')}</p>
                </div>
                <div className="h-px bg-slate-100 flex-1 mx-12 hidden md:block" />
                <Link href="/products" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-all">
                  {getSystemText('view_all')}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {displayRelatedProducts.map((p: any) => {
                  const cat = categories?.find((c: any) => c.id === p.categoryId);
                  return (
                    <Link key={p.id} href={`/products/${p.id}?lang=${locale}`} className="group space-y-4">
                      <div className="relative aspect-[11/9] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10">
                        <HoverVideoPlayer
                          productId={p.id}
                          videoUrl={p.videoUrl}
                          mainImageUrl={p.mainImageUrl}
                          alt={getProductText(p.nameTextId, p.nameText)}
                        />
                      </div>
                      <div className="space-y-1 px-1">
                        <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest truncate">
                          {cat ? getProductText(cat.nameTextId, cat.nameText) : ''}
                        </p>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{getProductText(p.nameTextId, p.nameText)}</h4>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer locale={locale} />
      {/* High-quality Zoom overlay modal */}
      {isZoomOpen && activeMedia.type === 'image' && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => { setIsZoomOpen(false); setZoomScale(1); }}
        >
          {/* Bottom controls: Prev, Current/Total, Next */}
          <div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-6 bg-white/10 border border-white/10 px-3 py-3 rounded-full backdrop-blur-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Left Button */}
            <button
              disabled={currentZoomIndex === 0}
              onClick={() => {
                if (currentZoomIndex > 0) {
                  setActiveMedia({ url: zoomImages[currentZoomIndex - 1], type: 'image' });
                  setZoomScale(1);
                }
              }}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 text-white active:scale-90 cursor-pointer",
                currentZoomIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10"
              )}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Index Display */}
            <span className="text-white/80 font-mono text-xs font-bold tracking-widest select-none">
              {currentZoomIndex + 1} <span className="text-white/30 mx-1">/</span> {zoomImages.length}
            </span>

            {/* Right Button */}
            <button
              disabled={currentZoomIndex === zoomImages.length - 1}
              onClick={() => {
                if (currentZoomIndex < zoomImages.length - 1) {
                  setActiveMedia({ url: zoomImages[currentZoomIndex + 1], type: 'image' });
                  setZoomScale(1);
                }
              }}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 text-white active:scale-90 cursor-pointer",
                currentZoomIndex === zoomImages.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10"
              )}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="absolute top-6 right-6 flex items-center gap-4" onClick={e => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
              onClick={() => setZoomScale(s => Math.min(3, s + 0.25))}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
              onClick={() => setZoomScale(s => Math.max(0.5, s - 0.25))}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
              onClick={() => { setIsZoomOpen(false); setZoomScale(1); }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative w-[90vw] h-[80vh] flex items-center justify-center overflow-auto pointer-events-none">
            <div
              className="relative transition-transform duration-300 ease-out pointer-events-auto"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <img
                src={getAssetUrl(activeMedia.url || product.mainImageUrl || '/image/product-placeholder.png')}
                alt="Product Zoom"
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* 离屏 PDF 规格书排版与渲染模块 */}
      <ProductPdfLayout
        ref={printLayoutRef}
        isExporting={isExporting}
        exportLogoUrl={exportLogoUrl}
        siteConfig={siteConfig}
        product={product}
        categoryName={categoryName}
        heroImageConfig={heroImageConfig}
        advantages={advantages}
        specPagination={specPagination}
        parsedSpecs={parsedSpecs}
        companyEmail={companyEmail}
        companyName={companyName}
        companyWebsite={companyWebsite}
        companyContact={companyContact}
        getProductText={getProductText}
        getSystemText={getSystemText}
        getAssetUrl={getAssetUrl}
      />

      {/* 沉浸式站内规格书预览模态窗 */}
      <ProductSpecPreviewModal
        isOpen={specPreviewData.isOpen}
        onClose={() => setSpecPreviewData((prev) => ({ ...prev, isOpen: false }))}
        pages={specPreviewData.pages}
        productName={product ? getProductText(product.nameTextId, product.nameText) : ''}
        isDownloadingPdf={isSaving}
        onDownloadPdf={handleSaveSpec}
        onShare={handleShareSpec}
        getSystemText={getSystemText}
      />

      {/* 多渠道降级分享中心模态窗（适用于外部普通浏览器/桌面PC） */}
      <ProductShareModal
        isOpen={isFallbackModalOpen}
        onClose={() => setIsFallbackModalOpen(false)}
        productName={product ? getProductText(product.nameTextId, product.nameText) : ''}
      />

      {/* 社交软件（微信/QQ/企业微信/钉钉/海外热门社交等）专属右上角直达引导蒙层 */}
      <SocialShareGuideOverlay
        isOpen={isSocialGuideOpen}
        onClose={() => setIsSocialGuideOpen(false)}
        socialAppName={currentSocialAppName}
        productName={product ? getProductText(product.nameTextId, product.nameText) : ''}
        shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
        locale={locale}
      />

    </main>
  );
}
