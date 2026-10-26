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
      getProductText,
      getSystemText,
      getAssetUrl,
    },
    ref
  ) => {
    const specPages = specPagination.subsequentPages;
    const totalPdfPages = specPagination.totalPages;

    // 动态提取全部有效画廊图片（排除主图与视频文件，绝不遗漏用户上传的任何图片）
    const validGalleryImages = useMemo(() => {
      if (!product?.galleryImageUrls || !Array.isArray(product.galleryImageUrls)) return [];
      return product.galleryImageUrls.filter(
        (img: string) => img && img !== product.mainImageUrl && !isVideoUrl(img)
      );
    }, [product?.galleryImageUrls, product?.mainImageUrl]);

    // 根据画廊缩略图真实数量自适应计算网格与尺寸，确保所有图片完整呈现且与大图完美等宽
    const thumbLayout = useMemo(() => {
      const count = validGalleryImages.length;
      if (count === 0) return null;

      const containerW = heroImageConfig.mainWidth;
      // 5 张及以下：单行，标准间距 8px
      if (count <= 5) {
        const gap = 8;
        const width = Math.min(
          heroImageConfig.thumbWidth,
          Math.floor((containerW - (count - 1) * gap) / count)
        );
        const height = Math.round((width * 9) / 11);
        return {
          gap,
          width,
          height,
          imgMaxW: width - 8,
          imgMaxH: height - 8,
          wrap: false,
        };
      }
      // 6~7 张：单行自适应紧凑网格（如 7 张时为 64px 宽），间距 6px，完整铺满大图总宽度
      if (count <= 7) {
        const gap = 6;
        const width = Math.floor((containerW - (count - 1) * gap) / count);
        const height = Math.round((width * 9) / 11);
        return {
          gap,
          width,
          height,
          imgMaxW: width - 6,
          imgMaxH: height - 6,
          wrap: false,
        };
      }
      // 8 张及以上：双行或多行弹性换行排布，每行最多 6 张，自动折行居中
      const cols = Math.min(count, 6);
      const gap = 6;
      const width = Math.floor((containerW - (cols - 1) * gap) / cols);
      const height = Math.round((width * 9) / 11);
      return {
        gap,
        width,
        height,
        imgMaxW: width - 6,
        imgMaxH: height - 6,
        wrap: true,
      };
    }, [validGalleryImages.length, heroImageConfig]);

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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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

            {/* 产品分类与标题：分类胶囊由内边距自然居中，彻底消除固定高度与负偏移造成的贴底问题 */}
            <div className="space-y-1.5 mb-5">
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

            {/* 主图区：严格遵循 11:9 黄金画幅，根据优势数量弹性压缩纵向高度，绝不拉伸挤压 */}
            <div
              className="rounded-2xl bg-muted/5 border border-slate-200/60 shadow-sm relative overflow-hidden"
              style={{
                width: `${heroImageConfig.mainWidth}px`,
                height: `${heroImageConfig.mainHeight}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
              }}
            >
              <img
                src={getAssetUrl(product?.mainImageUrl || '/image/product-placeholder.png')}
                alt={getProductText(product?.nameTextId, product?.nameText)}
                style={{
                  maxWidth: `${heroImageConfig.imgMaxW}px`,
                  maxHeight: `${heroImageConfig.imgMaxH}px`,
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  margin: 'auto',
                }}
                crossOrigin="anonymous"
              />
            </div>

            {/* 封面精选画廊缩略图：完整展示所有有效画廊图片，自适应锁定 11:9 黄金画幅 */}
            {validGalleryImages.length > 0 && thumbLayout && (
              <div
                className="flex items-center justify-center"
                style={{
                  width: `${heroImageConfig.mainWidth}px`,
                  margin: '0 auto 10px auto',
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: thumbLayout.wrap ? 'wrap' : 'nowrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: `${thumbLayout.gap}px`,
                  boxSizing: 'border-box',
                }}
              >
                {validGalleryImages.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200/70 overflow-hidden shrink-0 shadow-2xs"
                    style={{
                      width: `${thumbLayout.width}px`,
                      height: `${thumbLayout.height}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <img
                      src={getAssetUrl(img)}
                      alt={`Gallery ${idx}`}
                      style={{
                        maxWidth: `${thumbLayout.imgMaxW}px`,
                        maxHeight: `${thumbLayout.imgMaxH}px`,
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                        margin: 'auto',
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                ))}
              </div>
            )}

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
            <span className="tracking-wide">HEOVOSE ELEVATE &bull; {companyEmail || 'sales@heovose.com'}</span>
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
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                    {parsedSpecs.unorderedFootnotes.map((fn, idx) => (
                      <p key={idx} className="text-xs text-slate-400 font-mono flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-500 font-bold shrink-0 select-none">{'*'.repeat(idx + 1)}</span>
                        <span>{fn}</span>
                      </p>
                    ))}
                    {parsedSpecs.orderedFootnotes.map((fn, idx) => (
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
                <span className="tracking-wide">HEOVOSE ELEVATE &bull; {companyEmail || 'sales@heovose.com'}</span>
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
