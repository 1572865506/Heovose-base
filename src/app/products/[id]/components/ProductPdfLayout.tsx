'use client';

import React, { forwardRef, useMemo } from 'react';
import { ShieldCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const isVideoUrl = (url: string) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);
};

export interface ProductPdfLayoutProps {
  isExporting: boolean;
  exportLogoUrl: string;
  siteConfig: any;
  product: any;
  categoryName: string | null;
  heroImageConfig: {
    mainWidth: number;
    mainHeight: number;
    imgMaxW: number;
    imgMaxH: number;
    thumbWidth: number;
    thumbHeight: number;
    thumbImgMaxW: number;
    thumbImgMaxH: number;
    thumbGap: number;
    useTwoColumnsForAdv: boolean;
  };
  advantages: string[];
  specPagination: {
    page1Data: {
      leftGroups: any[];
      rightGroups: any[];
    };
    subsequentPages: Array<{
      leftGroups: any[];
      rightGroups: any[];
    }>;
    totalPages: number;
  };
  parsedSpecs: {
    groups: any[];
    orderedFootnotes: string[];
    unorderedFootnotes: string[];
  };
  companyEmail?: string;
  companyName?: string;
  companyWebsite?: string;
  companyContact?: string;
  getProductText: (id?: any, fallback?: any) => string;
  getSystemText: (key: string) => string;
  getAssetUrl: (url: string | null | undefined) => string;
}

export const ProductPdfLayout = forwardRef<HTMLDivElement, ProductPdfLayoutProps>(
  (
    {
      isExporting,
      exportLogoUrl,
      siteConfig,
      product,
      categoryName,
      heroImageConfig,
      advantages,
      specPagination,
      parsedSpecs,
      companyEmail,
      companyName,
      companyWebsite,
      companyContact,
      getProductText,
      getSystemText,
      getAssetUrl,
    },
    ref
  ) => {
    const specPages = specPagination.subsequentPages;
    const totalPdfPages = specPagination.totalPages;

    const mainImgUrl = getAssetUrl(product?.mainImageUrl || '/image/product-placeholder.png');

    // 动态提取全部有效画廊图片（排除主图与视频文件，绝不遗漏用户上传的任何图片）
    const validGalleryImages = useMemo(() => {
      if (!product?.galleryImageUrls || !Array.isArray(product.galleryImageUrls)) return [];
      return product.galleryImageUrls.filter(
        (img: string) => img && img !== product.mainImageUrl && !isVideoUrl(img)
      );
    }, [product?.galleryImageUrls, product?.mainImageUrl]);

    const galleryCount = validGalleryImages.length;

    // 依据核心优势条目数及是否有下方缩略图，智能分配图片展示区域基准高度，最大化呈现产品细节：
    const heroHeight = useMemo(() => {
      const advCount = advantages.length;
      const hasBottomGallery = validGalleryImages.length >= 4;

      if (advCount === 0) {
        return hasBottomGallery ? 340 : 440;
      }
      if (advCount <= 2) {
        return hasBottomGallery ? 320 : 400;
      }
      if (advCount <= 4) {
        return hasBottomGallery ? 290 : 360;
      }
      // 5 条及以上核心优势
      return hasBottomGallery ? 260 : 310;
    }, [advantages.length, validGalleryImages.length]);

    // 极简横线子表渲染器（类似苹果/特斯拉技术规格书风格：纯正顶格对齐，紧凑列宽消除过大间距，极简细横线）
    const renderSubTable = (group: any, key: string) => {
      return (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* 子表标题：纯文字顶格左对齐，增加边线距离，采用浅灰色细横线 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              paddingBottom: '7px',
              borderBottom: '1px solid #cbd5e1',
              marginBottom: '5px',
              boxSizing: 'border-box',
            }}
          >
            <h3
              className="text-xs font-headline font-bold text-slate-800 tracking-wide"
              style={{
                margin: 0,
                padding: 0,
                lineHeight: '1.3',
                textAlign: 'left',
              }}
              dangerouslySetInnerHTML={{ __html: group.title }}
            />
          </div>

          {/* 参数行：浅灰色细分割线 + 顶端自适应贴合 */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {group.items.map((item: any, iIdx: number) => (
              <div
                key={iIdx}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  paddingTop: '5px',
                  paddingBottom: '7px',
                  borderBottom: '1px solid #e2e8f0',
                  boxSizing: 'border-box',
                }}
              >
                {/* 参数名称 (Label)：紧凑比例 28%，右侧适度间距，与参数值自然贴近，基线严格对齐 */}
                <div style={{ width: '28%', flexShrink: 0, paddingRight: '12px', boxSizing: 'border-box' }}>
                  <div
                    className="text-[11px] font-medium text-slate-500"
                    style={{
                      lineHeight: '1.4',
                      margin: 0,
                      padding: 0,
                      textAlign: 'left',
                      wordBreak: 'break-word',
                    }}
                    dangerouslySetInnerHTML={{ __html: item.label }}
                  />
                </div>

                {/* 参数数值 (Value)：宽阔比例 72%，长文本自然展开，基线严格对齐 */}
                <div style={{ flex: 1, minWidth: 0, boxSizing: 'border-box' }}>
                  <div
                    className="text-[11px] font-semibold text-slate-900 text-left whitespace-pre-wrap"
                    style={{
                      lineHeight: '1.4',
                      margin: 0,
                      padding: 0,
                      wordBreak: 'break-word',
                    }}
                    dangerouslySetInnerHTML={{ __html: item.value }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 子表局部脚注 */}
          {group.footnote && (
            <div style={{ paddingTop: '5px', paddingBottom: '2px' }}>
              <p
                className="text-[10px] text-slate-400 font-mono italic leading-relaxed"
                style={{ margin: 0 }}
              >
                * {group.footnote}
              </p>
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          "print-layout",
          isExporting ? "block" : "hidden print:block"
        )}
        style={
          isExporting
            ? {
                position: 'fixed',
                left: '-9999px',
                top: 0,
                width: '794px',
                zIndex: -9999,
                backgroundColor: '#ffffff',
                pointerEvents: 'none',
              }
            : undefined
        }
      >
        {/* Page 1: 产品封面与核心形象 */}
        <div
          className="print-page bg-white text-slate-900"
          style={{
            position: 'relative',
            width: '794px',
            height: '1123px',
            maxHeight: '1123px',
            padding: '36px 44px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", "Noto Sans SC", "Noto Sans CJK SC", -apple-system, sans-serif',
          }}
        >
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
            {/* Header: 优雅的品牌主色横线，高度自适应，文字留足呼吸感，杜绝下半部裁切 */}
            <div
              className="flex items-center justify-between border-b-2 border-primary pb-3 mb-5"
              style={{ minHeight: '44px', boxSizing: 'border-box' }}
            >
              <div className="flex items-center shrink-0" style={{ width: '169px', height: '32px' }}>
                <img
                  src={exportLogoUrl || getAssetUrl(siteConfig?.logoStandard || '/image/Heovose-color.svg')}
                  alt="Logo"
                  style={{ width: '169px', height: '32px', display: 'block', objectFit: 'contain' }}
                  crossOrigin="anonymous"
                />
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '32px',
                  paddingLeft: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  overflow: 'visible',
                }}
              >
                <span
                  className="text-xs text-slate-500 font-bold uppercase tracking-wider"
                  style={{
                    lineHeight: '1',
                    display: 'inline-block',
                    position: 'relative',
                    top: '-3.5px',
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                  }}
                >
                  {getProductText(product?.nameTextId, product?.nameText)}
                </span>
              </div>
            </div>

            {/* 产品分类与标题 */}
            <div className="space-y-1.5 mb-4">
              {categoryName && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    className="rounded-full bg-primary/5 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.18em]"
                    style={{
                      height: '24px',
                      padding: '0 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ display: 'inline-block', lineHeight: '1', position: 'relative', top: '-4.5px' }}>
                      {categoryName}
                    </span>
                  </div>
                </div>
              )}
              <h1 className="text-3xl font-headline font-bold leading-tight text-primary">
                {getProductText(product?.nameTextId, product?.nameText)}
              </h1>
            </div>

            {/* 产品多图自适应排版引擎：充分利用 706px 可用宽度，消除多余边距，所有卡片严格锁定 11:9 黄金画幅 */}
            {(() => {
              // 1 张图（无副图）：单主图卡片在 11:9 画幅下最大化呈现，大幅扩充尺寸填满宽度，产品细节巨幅清晰
              if (galleryCount === 0) {
                const singleW = 706;
                const singleH = Math.round((singleW * 9) / 11);
                return (
                  <div
                    className="rounded-2xl bg-white border border-slate-200/70 shadow-2xs overflow-hidden"
                    style={{
                      width: `${singleW}px`,
                      height: `${singleH}px`,
                      aspectRatio: '11 / 9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto',
                      boxSizing: 'border-box',
                    }}
                  >
                    <img
                      src={mainImgUrl}
                      alt={getProductText(product?.nameTextId, product?.nameText)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                );
              }

              // 2 张图（主图 + 1 张副图）：
              // 左右布局 100% 撑满 706px 可视宽（主图 467px + 间距 10px + 副图 229px = 706px）！
              // 主图居左（严格 11:9），右侧上方为 11:9 副图卡片，下方自然空出距离，两边绝无大片多余空白
              if (galleryCount === 1) {
                const mainH = 382;
                const mainW = Math.round((mainH * 11) / 9); // 467px
                const subH = Math.round((mainH - 8) / 2); // 187px
                const subW = Math.round((subH * 11) / 9); // 229px
                const blockW = 706;

                return (
                  <div
                    style={{
                      width: `${blockW}px`,
                      height: `${mainH}px`,
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '10px',
                      margin: '0 auto 12px auto',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* 主图：严格 11:9 */}
                    <div
                      className="rounded-2xl bg-white border border-slate-200/70 shadow-2xs overflow-hidden"
                      style={{
                        width: `${mainW}px`,
                        height: `${mainH}px`,
                        aspectRatio: '11 / 9',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                      }}
                    >
                      <img
                        src={mainImgUrl}
                        alt="Main"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        crossOrigin="anonymous"
                      />
                    </div>
                    {/* 右侧：副图卡片严格 11:9，位于右侧上方，下方自然空出距离 */}
                    <div
                      style={{
                        width: `${subW}px`,
                        height: `${mainH}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        gap: '8px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <div
                        className="rounded-xl bg-white border border-slate-200/70 shadow-2xs overflow-hidden"
                        style={{
                          width: `${subW}px`,
                          height: `${subH}px`,
                          aspectRatio: '11 / 9',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxSizing: 'border-box',
                        }}
                      >
                        <img
                          src={getAssetUrl(validGalleryImages[0])}
                          alt="Gallery 1"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                          crossOrigin="anonymous"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              // 3 张图（主图 + 2 张副图）：
              // 100% 充满 706px 宽度（467px + 10px + 229px = 706px）！
              // 主图居左（严格 11:9），右侧上下垂直排列 2 张副图（各严格 11:9，等高对齐）
              if (galleryCount === 2) {
                const mainH = 382;
                const mainW = Math.round((mainH * 11) / 9); // 467px
                const subH = Math.round((mainH - 8) / 2); // 187px
                const subW = Math.round((subH * 11) / 9); // 229px
                const blockW = 706;

                return (
                  <div
                    style={{
                      width: `${blockW}px`,
                      height: `${mainH}px`,
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '10px',
                      margin: '0 auto 12px auto',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* 主图：严格 11:9 */}
                    <div
                      className="rounded-2xl bg-white border border-slate-200/70 shadow-2xs overflow-hidden"
                      style={{
                        width: `${mainW}px`,
                        height: `${mainH}px`,
                        aspectRatio: '11 / 9',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                      }}
                    >
                      <img
                        src={mainImgUrl}
                        alt="Main"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        crossOrigin="anonymous"
                      />
                    </div>
                    {/* 右侧上下垂直 2 张副图：全部严格 11:9 */}
                    <div
                      style={{
                        width: `${subW}px`,
                        height: `${mainH}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px',
                        boxSizing: 'border-box',
                      }}
                    >
                      {validGalleryImages.map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-white border border-slate-200/70 shadow-2xs overflow-hidden"
                          style={{
                            width: `${subW}px`,
                            height: `${subH}px`,
                            aspectRatio: '11 / 9',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box',
                          }}
                        >
                          <img
                            src={getAssetUrl(img)}
                            alt={`Gallery ${idx}`}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                            crossOrigin="anonymous"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 4 张图（主图 + 3 张副图）：
              // 100% 充满 706px 宽度（主图 523px + 间距 13px + 副图 170px = 706px）！
              // 主图居左（严格 11:9），右侧上下垂直排列 3 张副图（每张副图容器严格 11:9）
              if (galleryCount === 3) {
                const mainH = 428;
                const mainW = Math.round((mainH * 11) / 9); // 523px
                const subH = Math.round((mainH - 12) / 3); // 139px
                const subW = Math.round((subH * 11) / 9); // 170px
                const blockW = 706;

                return (
                  <div
                    style={{
                      width: `${blockW}px`,
                      height: `${mainH}px`,
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '13px',
                      margin: '0 auto 12px auto',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* 主图：严格 11:9 */}
                    <div
                      className="rounded-2xl bg-white border border-slate-200/70 shadow-2xs overflow-hidden"
                      style={{
                        width: `${mainW}px`,
                        height: `${mainH}px`,
                        aspectRatio: '11 / 9',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                      }}
                    >
                      <img
                        src={mainImgUrl}
                        alt="Main"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        crossOrigin="anonymous"
                      />
                    </div>
                    {/* 右侧上下垂直 3 张副图：全部严格 11:9 */}
                    <div
                      style={{
                        width: `${subW}px`,
                        height: `${mainH}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px',
                        boxSizing: 'border-box',
                      }}
                    >
                      {validGalleryImages.map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-white border border-slate-200/70 shadow-2xs overflow-hidden"
                          style={{
                            width: `${subW}px`,
                            height: `${subH}px`,
                            aspectRatio: '11 / 9',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box',
                          }}
                        >
                          <img
                            src={getAssetUrl(img)}
                            alt={`Gallery ${idx}`}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                            crossOrigin="anonymous"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 5~11 张图（副图 4~10 张，系统上限最多 10 张副图）：
              // 上半部：主图与右侧 2 张大副图进一步放大，100% 占满 706px 页面可用宽（大图宽 467px、高 382px，右侧小图宽 229px、高 187px，总宽 706px，彻底消除两边空隙）
              // 下半部：剩余副图（最多 8 张）在 706px 页面可用总宽上整齐铺满，缩略图高度达 68px~115px，细节大幅清晰，每个卡片严格 11:9
              const rightImages = validGalleryImages.slice(0, 2);
              const bottomImages = validGalleryImages.slice(2);
              const nBot = bottomImages.length;

              // 上半部分高度与宽度计算（严格锁定 11:9 黄金画幅，满宽 706px 铺展）
              const topH = 382;
              const topMainW = Math.round((topH * 11) / 9); // 467px
              const topSubH = Math.round((topH - 8) / 2); // 187px
              const topSubW = Math.round((topSubH * 11) / 9); // 229px
              const topBlockW = 706;

              // 下半部缩略图自适应尺寸计算：充分铺满 706px 宽度，两端对齐，彻底消除两边空余，大幅放大缩略图画幅
              const botGap = nBot > 6 ? 6 : 8;
              const botCardW = Math.min(
                Math.floor((706 - (nBot - 1) * botGap) / nBot),
                140
              );
              const botCardH = Math.round((botCardW * 9) / 11);
              const botRowW = nBot * botCardW + (nBot - 1) * botGap;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '0 auto 12px auto', width: '100%', alignItems: 'center' }}>
                  {/* 上半部：主图与右侧 2 张副图（全为 11:9，满宽 706px） */}
                  <div style={{ width: `${topBlockW}px`, height: `${topH}px`, display: 'flex', flexDirection: 'row', gap: '10px' }}>
                    <div
                      className="rounded-2xl bg-white border border-slate-200/70 shadow-2xs overflow-hidden"
                      style={{
                        width: `${topMainW}px`,
                        height: `${topH}px`,
                        aspectRatio: '11 / 9',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                      }}
                    >
                      <img
                        src={mainImgUrl}
                        alt="Main"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div
                      style={{
                        width: `${topSubW}px`,
                        height: `${topH}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px',
                        boxSizing: 'border-box',
                      }}
                    >
                      {rightImages.map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-white border border-slate-200/70 shadow-2xs overflow-hidden"
                          style={{
                            width: `${topSubW}px`,
                            height: `${topSubH}px`,
                            aspectRatio: '11 / 9',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box',
                          }}
                        >
                          <img
                            src={getAssetUrl(img)}
                            alt={`Gallery right ${idx}`}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                            crossOrigin="anonymous"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 下半部：剩余副图整齐铺满可用宽度，每个缩略卡片均严格保持 11:9 比例，画幅充盈细节清晰 */}
                  <div
                    style={{
                      width: `${botRowW}px`,
                      height: `${botCardH}px`,
                      display: 'flex',
                      flexDirection: 'row',
                      gap: `${botGap}px`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {bottomImages.map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-white border border-slate-200/70 shadow-2xs overflow-hidden"
                        style={{
                          width: `${botCardW}px`,
                          height: `${botCardH}px`,
                          aspectRatio: '11 / 9',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxSizing: 'border-box',
                        }}
                      >
                        <img
                          src={getAssetUrl(img)}
                          alt={`Gallery bottom ${idx}`}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                          crossOrigin="anonymous"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 核心优势：全部完整展示，条目多时自动双列排布，牢牢锁定在第一页 */}
            {advantages.length > 0 && (
              <div className="space-y-3 mt-4">
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <span
                    className="text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ lineHeight: '1', display: 'inline-block', position: 'relative', top: '-4px', margin: 0, padding: 0 }}
                  >
                    {getSystemText('core_advantages')}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  {advantages.map((adv: string, i: number) => {
                    const cleanAdv = adv.replace(/^[•·\s\-*]+/, '').trim();
                    const isTwoCols = heroImageConfig.useTwoColumnsForAdv;
                    return (
                      <div
                        key={i}
                        className="bg-slate-50/80 rounded-xl border border-slate-200/60"
                        style={{
                          width: isTwoCols ? 'calc(50% - 3px)' : '100%',
                          display: 'table',
                          tableLayout: 'fixed',
                          padding: isTwoCols ? '6px 12px' : '8px 16px',
                          minHeight: isTwoCols ? '36px' : '42px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <div
                          style={{
                            display: 'table-cell',
                            verticalAlign: 'middle',
                            width: '24px',
                          }}
                        >
                          <div
                            className="rounded-full bg-primary/10 text-primary"
                            style={{
                              width: '20px',
                              height: '20px',
                              lineHeight: '20px',
                              textAlign: 'center',
                            }}
                          >
                            <Star className="h-3 w-3 fill-primary text-primary" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'table-cell',
                            verticalAlign: 'middle',
                            paddingLeft: '8px',
                          }}
                        >
                          <span
                            className="text-xs text-slate-800 font-semibold"
                            style={{
                              lineHeight: '1.35',
                              display: 'block',
                              width: '100%',
                              wordBreak: 'break-word',
                              margin: 0,
                              position: 'relative',
                              top: '-4.5px',
                            }}
                          >
                            {cleanAdv}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 当无核心优势时：独立双列极简横线子表向前推进至产品图下方，设置安全边距 */}
            {advantages.length === 0 && (specPagination.page1Data.leftGroups.length > 0 || specPagination.page1Data.rightGroups.length > 0) && (
              <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '26px', width: '100%' }}>
                  {/* 左列规格子表集合 */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {specPagination.page1Data.leftGroups.map((group: any, gIdx: number) => renderSubTable(group, `p1-l-${gIdx}`))}
                  </div>

                  {/* 右列规格子表集合 */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {specPagination.page1Data.rightGroups.map((group: any, gIdx: number) => renderSubTable(group, `p1-r-${gIdx}`))}
                  </div>
                </div>

                {/* 如果整份规格书在第 1 页全部容纳（无第 2 页）且存在脚注，则在第 1 页底部显示脚注 */}
                {specPagination.subsequentPages.length === 0 && (parsedSpecs.orderedFootnotes.length > 0 || parsedSpecs.unorderedFootnotes.length > 0) && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-1">
                    {parsedSpecs.unorderedFootnotes.map((fn, idx) => (
                      <p key={idx} className="text-[11px] text-slate-400 font-mono flex items-start gap-1.5 leading-relaxed">
                        <span className="text-amber-500 font-bold shrink-0 select-none">{'*'.repeat(idx + 1)}</span>
                        <span>{fn}</span>
                      </p>
                    ))}
                    {parsedSpecs.orderedFootnotes.map((fn, idx) => (
                      <p key={idx} className="text-[11px] text-slate-400 font-mono flex items-start gap-1.5 leading-relaxed">
                        <span className="text-amber-500 font-bold shrink-0 select-none">[{idx + 1}]</span>
                        <span>{fn}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer：绝对锚定在页面底边，杜绝被上方内容挤出页面 */}
          <div
            className="border-t border-slate-200/80 pt-3 text-xs text-slate-400 font-medium flex justify-between items-center"
            style={{
              position: 'absolute',
              bottom: '36px',
              left: '44px',
              right: '44px',
              height: '32px',
              boxSizing: 'border-box',
              paddingTop: '12px',
              flexShrink: 0,
              zIndex: 20,
              backgroundColor: '#ffffff',
            }}
          >
            <span className="tracking-wide">
              {companyName || 'Heovose Technology'} &bull; {companyWebsite || 'www.heovose.com'}
            </span>
            <span className="font-mono font-bold text-slate-500">1 / {totalPdfPages}</span>
          </div>
        </div>

        {/* Page 2 及后续页: 技术参数规格表 */}
        {specPages.map((pageData: any, pageIdx: number) => {
          const currentPrintPage = pageIdx + 2;
          const isLastSpecPage = pageIdx === specPages.length - 1;

          return (
            <div
              key={pageIdx}
              className="print-page bg-white text-slate-900"
              style={{
                position: 'relative',
                width: '794px',
                height: '1123px',
                maxHeight: '1123px',
                padding: '36px 44px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                pageBreakBefore: 'always',
                backgroundColor: '#ffffff',
                fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", "Noto Sans SC", "Noto Sans CJK SC", -apple-system, sans-serif',
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div
                  className="flex items-center justify-between border-b-2 border-primary pb-3 mb-5"
                  style={{ minHeight: '44px', boxSizing: 'border-box' }}
                >
                  <div className="flex items-center shrink-0" style={{ width: '169px', height: '32px' }}>
                    <img
                      src={exportLogoUrl || getAssetUrl(siteConfig?.logoStandard || '/image/Heovose-color.svg')}
                      alt="Logo"
                      style={{ width: '169px', height: '32px', display: 'block', objectFit: 'contain' }}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: '32px',
                      paddingLeft: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      overflow: 'visible',
                    }}
                  >
                    <span
                      className="text-xs text-slate-500 font-bold uppercase tracking-wider"
                      style={{
                        lineHeight: '1',
                        display: 'inline-block',
                        position: 'relative',
                        top: '-3.5px',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                      }}
                    >
                      {getProductText(product?.nameTextId, product?.nameText)}
                    </span>
                  </div>
                </div>

                {/* 规格页大标题：品牌指示条与文字高度精准匹配 */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '22px',
                  }}
                >
                  <span
                    style={{
                      width: '4px',
                      height: '18px',
                      borderRadius: '9999px',
                      backgroundColor: 'hsl(var(--primary))',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <h2
                    className="text-xl font-headline font-bold text-primary"
                    style={{
                      margin: 0,
                      padding: 0,
                      lineHeight: '1',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        lineHeight: '1',
                        position: 'relative',
                        top: '-5.5px',
                      }}
                    >
                      {getSystemText('product_tab_specs')} {specPages.length > 1 ? `(${pageIdx + 1}/${specPages.length})` : ''}
                    </span>
                  </h2>
                </div>

                {/* 规格表：左右独立双列流，设置安全的区块下边距与列间隙 */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '28px', width: '100%', marginBottom: '16px' }}>
                  {/* 左列子表 */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {pageData.leftGroups.map((group: any, gIdx: number) => renderSubTable(group, `sub-${pageIdx}-l-${gIdx}`))}
                  </div>

                  {/* 右列子表 */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {pageData.rightGroups.map((group: any, gIdx: number) => renderSubTable(group, `sub-${pageIdx}-r-${gIdx}`))}
                  </div>
                </div>

                {isLastSpecPage && (parsedSpecs.orderedFootnotes.length > 0 || parsedSpecs.unorderedFootnotes.length > 0) && (
                  <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-1.5">
                    {parsedSpecs.unorderedFootnotes.map((fn: string, idx: number) => (
                      <p key={idx} className="text-xs text-slate-400 font-mono flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-500 font-bold shrink-0 select-none">{'*'.repeat(idx + 1)}</span>
                        <span>{fn}</span>
                      </p>
                    ))}
                    {parsedSpecs.orderedFootnotes.map((fn: string, idx: number) => (
                      <p key={idx} className="text-xs text-slate-400 font-mono flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-500 font-bold shrink-0 select-none">[{idx + 1}]</span>
                        <span>{fn}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer：绝对锚定在页面底边，杜绝被上方内容挤出页面 */}
              <div
                className="border-t border-slate-200/80 pt-3 text-xs text-slate-400 font-medium flex justify-between items-center"
                style={{
                  position: 'absolute',
                  bottom: '36px',
                  left: '44px',
                  right: '44px',
                  height: '32px',
                  boxSizing: 'border-box',
                  paddingTop: '12px',
                  flexShrink: 0,
                  zIndex: 20,
                  backgroundColor: '#ffffff',
                }}
              >
                <span className="tracking-wide">
                  {companyName || 'Heovose Technology'} &bull; {companyWebsite || 'www.heovose.com'}
                </span>
                <span className="font-mono font-bold text-slate-500">{currentPrintPage} / {totalPdfPages}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

ProductPdfLayout.displayName = 'ProductPdfLayout';
