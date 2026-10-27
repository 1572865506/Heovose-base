'use client';

import { useMemo } from 'react';
import { Locale } from '@/lib/translations';
import { useTranslations } from '@/hooks/use-translations';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  ShieldCheck, 
  Cookie, 
  Lock, 
  Database, 
  Eye, 
  FileCheck, 
  UserCheck, 
  RefreshCw, 
  Mail, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

interface PrivacyContentProps {
  initialLocale: Locale;
}

export default function PrivacyContent({ initialLocale }: PrivacyContentProps) {
  const locale = initialLocale || 'en';
  const { t } = useTranslations(locale);
  const { data: siteConfig } = useLocalDoc<any>('settings', 'site');
  const companyName = siteConfig?.companyName || 'Heovose Technology';
  const contactEmail = siteConfig?.contactEmail || 'sales@heovose.com';

  const isZh = locale === 'zh';

  const setLocale = (newLoc: Locale) => {
    if (typeof window !== 'undefined') {
      document.cookie = `NEXT_LOCALE=${newLoc}; path=/; max-age=31536000`; // 1 year
      localStorage.setItem('heovose-locale', newLoc);
      window.location.pathname = window.location.pathname.replace(/^\/[a-z]{2,3}/i, `/${newLoc}`);
    }
  };

  // 章节内容结构化定义（根据当前语言自适应呈现，杜绝硬编码全局词条字典）
  const content = useMemo(() => {
    if (isZh) {
      return {
        badge: '合规与隐私保护政策',
        title: 'Cookie 政策与隐私授权条款',
        subtitle: `在 ${companyName}，我们尊重并严密保护您的隐私权益。本声明详细阐明了我们使用 Cookie 及相关存储技术的机制，以及我们在获取您的明确授权时所涉及的具体数据范畴、协议约定与您的自主控制权。`,
        lastUpdated: '最后修订日期：2026 年 10 月',
        sections: [
          {
            id: 'overview',
            icon: ShieldCheck,
            title: '一、前言与承诺',
            paragraphs: [
              `本《Cookie 政策与隐私授权条款》（以下简称“本条款”）适用于您对 ${companyName} 官方网站及相关数字服务的访问与使用。`,
              '我们严格遵守适用的国际数据保护法律法规（包括但不限于欧盟 GDPR、加州 CCPA 及中华人民共和国个人信息保护相关法规），坚持“最小必要、明确授权、公开透明、安全可控”的原则，保障您的数字资产与个人信息安全。',
              '当您首次访问我们的网站时，我们会通过 Cookie 授权横幅向您征求同意。在您做出选择之前，非必要的分析性 Cookie 与追踪功能将保持休眠状态。'
            ]
          },
          {
            id: 'cookie-definition',
            icon: Cookie,
            title: '二、什么是 Cookie 及同类本地存储技术',
            paragraphs: [
              'Cookie 是由网络服务器放置在您计算机、平板电脑或移动设备上的小型文本文件。除此之外，我们还会使用浏览器的本地存储（LocalStorage）和会话存储（SessionStorage）技术。',
              '这些技术使网站能够识别您的设备、记住您的操作习惯（例如选择的语言、已加入询盘的产品列表等），确保网页加载迅速、功能稳定，并帮助我们了解访问者如何与网站互动，从而持续改进网站体验。'
            ]
          },
          {
            id: 'scopes-and-consents',
            icon: Layers,
            title: '三、我们向您获取的协议与授权范围（核心清单）',
            paragraphs: [
              '为了让您对个人数据的使用拥有充分的知情权，以下完整列出在您使用本网站并进行授权时，我们所涉及的协议范围与具体数据项：'
            ],
            subsections: [
              {
                title: '1. 必备型技术存储（Strictly Necessary - 默认保障基础运行）',
                desc: '此类数据属于网站提供核心功能所必需，不包含可直接识别个人身份的信息，无需且不依赖追踪授权即可运行：',
                items: [
                  { label: '多语言偏好记忆 (NEXT_LOCALE / heovose-locale)', detail: '记录您所偏好的浏览语言，确保在页面跳转及后续回访时，网站能够以正确的语言显示，无需重复手动切换。' },
                  { label: '会话安全与 CSRF 防伪凭证', detail: '保护表单提交与数据接口免受跨站请求伪造（CSRF）等恶意网络攻击，保障通信安全。' },
                  { label: '询盘清单暂存 (Inquiry Basket)', detail: '在您的浏览器内存与会话中暂存您感兴趣的产品意向，防止在浏览不同产品页面或网络波动时清单丢失。' },
                  { label: 'Cookie 授权决策记录 (cookie-consent)', detail: '记录您对 Cookie 条款的授权决策（接受或拒绝分析），避免在您每次浏览时重复弹出提示框打扰。' }
                ]
              },
              {
                title: '2. 交互分析与体验优化授权（Analytics & Performance - 仅在您明确同意后激活）',
                desc: '当您点击“接受”或在设置中授权时，我们仅在授权生效后开始处理以下数据，旨在了解内容受众喜好、优化排版与提升系统性能：',
                items: [
                  { label: '匿名访客标识与会话凭证', detail: '系统随机生成的匿名序列号（如 visitorId / sessionId），用于识别单一访问周期的连续性，绝不与任何现实个人身份进行关联。' },
                  { label: '页面访问足迹与停留时长', detail: '记录您访问的页面路径、首屏进入页（Landing Page）、页面平均停留时间以及滚动深度百分比（Scroll Depth），用于评估内容吸引力。' },
                  { label: '访问来源与推广渠道标识', detail: '记录引导您进入网站的外部来源链接（Referrer）及合法营销参数（如 utm_source、utm_medium 等），用于统计渠道投放效能。' },
                  { label: '设备特征与视口分辨率', detail: '读取屏幕分辨率（宽度与高度）、浏览器内核及操作系统类型（User-Agent），用于确保不同型号手机、平板与高分显示屏的完美自适应渲染。' },
                  { label: '粗略区域统计信息（国家与城市级别）', detail: '根据接入点 IP 由网络服务提供商反向识别的粗略国家及城市名称（例如 CN / Localhost / 新加坡），用于海外服务网点布局统计，绝对不获取任何精确的 GPS 经纬度位置。' },
                  { label: '核心体验与加载测速指标', detail: '收集 TTFB（首字节到达时间）、FCP（首次内容绘制时间）、DOM 解析时长等性能数据，协助技术团队快速消除卡顿、提升加载速度。' }
                ]
              },
              {
                title: '3. 商务咨询与主动询盘授权（Inquiry & Direct Communications）',
                desc: '当您主动通过“联系我们”或“提交询盘”表单向我们发送商业合作诉求时，即表示您授权我们处理以下信息：',
                items: [
                  { label: '联络人姓名与公司名称', detail: '用于商业礼仪称呼及确定企业合作主体。' },
                  { label: '电子邮箱与联系电话', detail: '专用于向您发送产品报价方案、技术规格书文件及售后支持回复。' },
                  { label: '所在国家/地区与采购需求说明', detail: '协助调配就近的区域服务中心及专业技术顾问，为您提供定制化解决方案。' }
                ],
                notice: '重要承诺：我们严正声明，绝不向任何第三方数据公司倒卖、出租或滥用您的商务联系信息，所有商业数据均在专用加密通道下严格流转。'
              }
            ]
          },
          {
            id: 'security',
            icon: Lock,
            title: '四、数据安全保障与跨境存储规范',
            paragraphs: [
              '传输安全：本网站全站强制启用现代 TLS 1.3 传输层加密协议，确保您的浏览器与我们服务器之间的所有通信数据在网络传输中防窃听、防篡改。',
              '服务器与存储架构：我们的核心服务运行于受到严格防火墙保护的海外合规云节点（阿里云新加坡等高可用集群）。数据库与文件存储服务实施严格的网络隔离与强密码鉴权，定期执行脱敏冷备归档。',
              '最小权限控制：仅限经授权的专业技术人员与客户支持专员可在严格鉴权下访问询盘记录，所有管理操作均留有审计日志。'
            ]
          },
          {
            id: 'retention',
            icon: Database,
            title: '五、数据保留期限',
            paragraphs: [
              '会话与分析数据：匿名的浏览会话数据在系统内保留不超过 90 天，之后将自动汇总为无个人识别属性的统计图表并彻底清理原始记录。',
              '商务询盘数据：作为日常商业沟通与售后质保所必需，我们将根据商业合同与法律要求保留相应的业务往来邮件与工单，直至商务关系结束或您依法要求删除。',
              '本地存储凭据：存储在您设备本地的 Cookie 与 LocalStorage 具有预设的过期时限（通常为 30 天至 1 年），您亦可随时在浏览器中一键清理。'
            ]
          },
          {
            id: 'user-rights',
            icon: UserCheck,
            title: '六、您的权利与撤销授权途径',
            paragraphs: [
              '您对自己的个人数据拥有完全的主导权。根据适用的法律法规，您享有以下合法权利：'
            ],
            bullets: [
              '撤销同意权：您可以通过随时清除浏览器缓存（Cookie / LocalStorage）来撤销您对分析统计的授权，或在页面下方的 Cookie 管理入口重新选择拒绝。',
              '查阅与访问权：您有权了解我们是否处理了您的个人数据，以及该数据的具体范围。',
              '更正与更新权：若您发现您提交的商务信息有误，可随时联系我们进行更正。',
              '删除与遗忘权：您可以随时要求我们删除或销毁您曾经提交的商务询盘记录。'
            ],
            actionNotice: `若需行使上述任何权利，或对我们的数据保护实践有任何疑问，请随时联系我们的数据合规负责人：${contactEmail}。我们在收到请求后将在法定时限内予以回复与处理。`
          },
          {
            id: 'updates',
            icon: RefreshCw,
            title: '七、条款的修订与通知',
            paragraphs: [
              '我们可能会因业务模式调整、法律法规变动或技术架构升级而不时更新本 Cookie 与隐私政策条款。',
              '更新后的条款将在本页面公布并更新“最后修订日期”。重大变更时，我们亦会在网站显著位置或通过更新横幅向您做出特别提示。'
            ]
          }
        ]
      };
    }

    // Default English Version
    return {
      badge: 'Compliance & Privacy Policy',
      title: 'Cookie Policy & Privacy Consent Agreement',
      subtitle: `At ${companyName}, we deeply respect and safeguard your privacy rights. This statement comprehensively outlines how we use Cookies and related storage technologies, the specific scopes of agreements and data permissions we obtain from you, and your full autonomy over your personal information.`,
      lastUpdated: 'Last Updated: October 2026',
      sections: [
        {
          id: 'overview',
          icon: ShieldCheck,
          title: '1. Introduction & Commitment',
          paragraphs: [
            `This Cookie Policy and Privacy Consent Agreement ("Policy") applies to your access and use of the official website and related digital services of ${companyName}.`,
            'We strictly abide by applicable global data protection regulations (including GDPR, CCPA, and personal data protection standards) under the principles of necessity, explicit consent, transparency, and data integrity.',
            'When you visit our site for the first time, we ask for your consent via our Cookie banner. Non-essential analytical cookies remain dormant until you explicitly provide your permission.'
          ]
        },
        {
          id: 'cookie-definition',
          icon: Cookie,
          title: '2. What Are Cookies and Local Storage Technologies?',
          paragraphs: [
            'Cookies are small text files placed on your computer, tablet, or smartphone by web servers. We also employ browser LocalStorage and SessionStorage technologies.',
            'These technologies enable our site to recognize your browser, remember your preferences (such as selected language and inquiry items), provide fast and reliable navigation, and help us analyze how visitors interact with our content to continuously improve our platform.'
          ]
        },
        {
          id: 'scopes-and-consents',
          icon: Layers,
          title: '3. Scope of Agreements & Explicit Permissions Obtained',
          paragraphs: [
            'To ensure complete transparency regarding the data we collect, below is the comprehensive list of agreements and data categories involved when you browse our site and provide consent:'
          ],
          subsections: [
            {
              title: '1. Strictly Necessary Storage (Essential for Site Operation)',
              desc: 'These storage items are strictly necessary for the core functionalities of the website and do not process identifiable personal profiles. They do not require opt-in consent to function:',
              items: [
                { label: 'Language Preference (NEXT_LOCALE / heovose-locale)', detail: 'Remembers your chosen language so subsequent page views and return visits automatically load in the right locale without requiring repetitive manual switching.' },
                { label: 'Security & Anti-CSRF Tokens', detail: 'Protects contact forms and backend APIs against Cross-Site Request Forgery (CSRF) and automated abuse, ensuring safe communication.' },
                { label: 'Inquiry Basket State', detail: 'Temporarily holds products you are interested in during your current browsing session, preventing loss of your inquiry items upon page transitions.' },
                { label: 'Consent Status Record (cookie-consent)', detail: 'Stores your decision (accepted or declined) to prevent repetitive cookie consent prompts on every page load.' }
              ]
            },
            {
              title: '2. Analytics & Experience Optimization (Activated Only Upon Your Explicit Consent)',
              desc: 'When you click "Accept" or grant consent in preferences, we collect and process the following telemetry data strictly to optimize site layout, responsiveness, and content relevance:',
              items: [
                { label: 'Pseudonymous Visitor & Session IDs', detail: 'Randomly generated unique identifiers (e.g., visitorId / sessionId) that group page views within a single visit without linking to any real-world identity.' },
                { label: 'Navigation Footprint & Dwell Time', detail: 'Tracks page paths visited, landing pages, time spent per page, and scroll depth percentages to measure content engagement.' },
                { label: 'Traffic Referral Channels (Referrer & UTM)', detail: 'Records the external URL that directed you to our website, along with legitimate marketing parameters (utm_source, utm_medium, utm_campaign) to analyze channel efficacy.' },
                { label: 'Device Specifications & Viewport Resolution', detail: 'Reads display dimensions (width & height), browser engine, and operating system attributes (User-Agent) to ensure responsive rendering across all mobile, tablet, and high-DPI screens.' },
                { label: 'Coarse Geographic Indicators (Country & City Level)', detail: 'Approximated geographical origin derived from CDN network headers (e.g., CN, SG, US) based on your IP, used solely for global regional traffic statistics. We NEVER collect precise GPS coordinates.' },
                { label: 'Performance & Speed Telemetry (Web Vitals)', detail: 'Measures TTFB (Time to First Byte), FCP (First Contentful Paint), and DOM load duration to assist our engineering team in identifying bottlenecks and optimizing loading times.' }
              ]
            },
            {
              title: '3. Business Inquiries & Communications Consent',
              desc: 'When you voluntarily reach out to us via our "Contact Us" or "Submit Inquiry" dialogs, you grant us permission to handle the following details:',
              items: [
                { label: 'Contact Name & Company Name', detail: 'Used to address you respectfully and understand the commercial organization you represent.' },
                { label: 'Corporate Email & Phone Number', detail: 'Used solely to transmit tailored product quotation proposals, technical spec sheets, and after-sales follow-ups.' },
                { label: 'Country/Region & Procurement Specifications', detail: 'Helps us route your inquiry to the nearest authorized technical service center and assigned sales engineers.' }
              ],
              notice: 'Strict Non-Disclosure: We explicitly promise that we NEVER sell, lease, or distribute your business inquiries to third-party data brokers or advertisement networks.'
            }
          ]
        },
        {
          id: 'security',
          icon: Lock,
          title: '4. Data Security Standards & Cross-Border Storage',
          paragraphs: [
            'In-Transit Encryption: All site traffic is strictly enforced through modern TLS 1.3 transport encryption, protecting data transfers from interception and tampering.',
            'Cloud Infrastructure: Our services run on enterprise cloud clusters (e.g., Alibaba Cloud Singapore region) protected by strict firewalls. Databases and storage buckets are network-isolated and regularly backed up.',
            'Access Control: Only authorized personnel with authenticated credentials have access to submitted inquiries for business fulfillment purposes, with complete audit logging in place.'
          ]
        },
        {
          id: 'retention',
          icon: Database,
          title: '5. Data Retention Periods',
          paragraphs: [
            'Analytical Data: Pseudonymous session metrics are retained for up to 90 days before being aggregated into non-identifiable statistics and permanently purged.',
            'Inquiry Records: Business communication history is maintained as necessary to fulfill contractual warranties and service obligations, or until you request its deletion.',
            'Client Storage: Cookies and LocalStorage keys on your device have predefined expiration horizons (typically 30 days to 1 year) and can be cleared by you at any time.'
          ]
        },
        {
          id: 'user-rights',
          icon: UserCheck,
          title: '6. Your Rights & How to Revoke Consent',
          paragraphs: [
            'You retain absolute sovereignty over your data. Under applicable privacy laws, you possess the following actionable rights:'
          ],
          bullets: [
            'Right to Revoke: You can revoke analytics consent at any time by clearing your browser cache/cookies, or resetting preferences via the Cookie prompt.',
            'Right of Access: You may request confirmation of whether we hold information submitted by you and obtain a copy thereof.',
            'Right to Rectification: You can request immediate correction of any inaccurate contact details.',
            'Right to Erasure: You may request complete deletion of any inquiry records associated with your email address.'
          ],
          actionNotice: `To exercise any of your rights or raise data governance questions, please contact our Data Compliance Team at: ${contactEmail}. We will respond within the statutory timeframe.`
        },
        {
          id: 'updates',
          icon: RefreshCw,
          title: '7. Policy Revisions & Notice',
          paragraphs: [
            'We may revise this Cookie Policy from time to time to reflect operational, legal, or technical changes.',
            'All updates will be published on this page with an updated "Last Updated" date. In the event of material modifications, prominent notifications will be posted across our digital channels.'
          ]
        }
      ]
    };
  }, [isZh, companyName, contactEmail]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-primary/20 selection:text-primary">
      <Navbar locale={locale} setLocale={setLocale} />

      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-8 md:p-14 border border-slate-200/80 shadow-xs mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-0 pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4" />
                <span>{content.badge}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-headline font-bold text-slate-900 tracking-tight leading-tight">
                {content.title}
              </h1>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-3xl">
                {content.subtitle}
              </p>
              <div className="pt-2 text-xs font-semibold text-slate-400">
                {content.lastUpdated}
              </div>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8">
            {content.sections.map((sec: any) => {
              const IconComp = sec.icon;
              return (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border border-slate-200/70 shadow-2xs space-y-6"
                >
                  <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight">
                      {sec.title}
                    </h2>
                  </div>

                  {sec.paragraphs && (
                    <div className="space-y-3">
                      {sec.paragraphs.map((p: string, idx: number) => (
                        <p key={idx} className="text-sm md:text-base text-slate-600 leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Subsections (for detailed consent breakdown) */}
                  {sec.subsections && (
                    <div className="space-y-6 pt-2">
                      {sec.subsections.map((sub: any, sIdx: number) => (
                        <div key={sIdx} className="bg-slate-50/70 rounded-2xl p-5 md:p-7 border border-slate-200/60 space-y-4">
                          <div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1">
                              {sub.title}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                              {sub.desc}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {sub.items.map((item: any, iIdx: number) => (
                              <div
                                key={iIdx}
                                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                  <span className="text-xs md:text-sm font-bold text-slate-800">
                                    {item.label}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed pl-6">
                                  {item.detail}
                                </p>
                              </div>
                            ))}
                          </div>

                          {sub.notice && (
                            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-3.5 rounded-xl border border-emerald-200/60">
                              {sub.notice}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bullet points (if any) */}
                  {sec.bullets && (
                    <ul className="space-y-2.5 pt-1 pl-1">
                      {sec.bullets.map((b: string, bIdx: number) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-sm md:text-base text-slate-600 leading-relaxed">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.actionNotice && (
                    <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-2xl p-4 md:p-5 mt-4">
                      <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs md:text-sm font-medium text-slate-700 leading-relaxed">
                        {sec.actionNotice}
                      </p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
