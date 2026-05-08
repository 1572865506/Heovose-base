
export type Locale = 'en' | 'zh' | 'id' | 'vi';

export const translations = {
  en: {
    core_advantages: 'Core Advantages',
    product_contact_now: 'Contact Now',
    product_spec_sheet: 'Spec Sheet',
    product_global_support: 'Global Support',
    product_sales_consulting: 'Sales Consulting',
    product_tab_desc: 'Description',
    product_tab_specs: 'Specifications',
    nav: {
      wholesale: 'Wholesale Products',
      projects: 'Project Solutions',
      cases: 'Cases',
      products: 'Products',
      company: 'Company',
      contact: 'Contact Us',
      about: 'About Us',
      career: 'Career',
      projects_nav: 'Project Products',
      sub: {
        aio: 'AIO & Semi-finished',
        aio_desc: 'All-in-One PCs and professional barebones kits.',
        laptop: 'Laptops',
        laptop_desc: 'Business and consumer portable computing solutions.',
        minipc: 'Mini PCs',
        minipc_desc: 'High-performance computing in a compact form factor.',
        electromechanical: 'Electromechanical',
        electromechanical_desc: 'Computer cases, power supplies, and cooling systems.',
        monitor: 'Monitors',
        monitor_desc: 'Professional and industrial grade display solutions.',
        components: 'PC Components',
        components_desc: 'Motherboards, GPUs, RAM, Hard Drives, and CPUs.',
        conference: 'Conference Tablets',
        conference_desc: 'Interactive intelligent displays for modern meetings.',
        showroom: 'Showroom Projects',
        showroom_desc: 'Commercial display showroom and exhibition engineering.',
        featured: 'Featured',
        catalog_title: 'Industrial Hardware Catalog 2024',
        catalog_desc: 'Explore our latest catalog featuring cutting-edge hardware.',
        download: 'DOWNLOAD CATALOG',
      }
    },
    footer: {
      slogan1: 'The world shares good things!',
      slogan2: 'Let excellent application solutions benefit the world!',
    },
    hero: {
      headline: 'All In One Computer',
      subheadline: 'Professional Manufacturer',
      cta: 'Explore Solutions',
      wholesale: 'Wholesale Products',
      project: 'Project Products',
      learnMore: 'Learn More',
    },
    video: {
      title: 'Global Intelligent Manufacturing',
      subtitle: 'Redefining Desktop & Display Excellence.',
    },
    products: {
      title: 'Our Portfolio',
      subtitle: 'Engineered for Performance and Reliability',
      aio: 'All-in-One PCs',
      minipc: 'Mini PC',
      monitor: 'Industrial Monitors',
      kiosk: 'Self-Service Kiosks',
      requestQuote: 'REQUEST QUOTE',
      listTitle: 'Product Catalog',
      listSubtitle: 'Discover our comprehensive range of high-end computing solutions.',
      searchPlaceholder: 'Search products by name...',
      allCategories: 'All Categories',
      noResults: 'No products found matching your criteria.',
      viewDetails: 'View Details',
      specSheet: 'Spec Sheet',
      needQuote: 'Need a custom quote?',
      expertHelp: 'Our experts are ready to help you with large-scale deployment and technical specs.',
      contactSales: 'Contact Sales',
      wholesaleLine: 'Wholesale Line',
      projectSolutions: 'Project Solutions',
      quickSearch: 'Quick Search',
      categories: 'Categories',
      itemsCount: 'Items',
      resetFilters: 'Reset All Filters',
      syncing: 'Synchronizing Global Inventory...',
      noSubCategories: 'No sub-categories defined',
    },
    gallery: {
      title: 'Featured Products',
      subtitle: 'Innovation and Precision in Every Detail',
    },
    cases: {
      title: 'Success Stories',
      subtitle: 'Real-world impact of Heovose hardware solutions.',
      viewCase: 'VIEW CASE',
      tags: {
        retail: 'RETAIL',
        industry: 'INDUSTRIAL',
        office: 'CORPORATE',
        transport: 'TRANSIT'
      },
      retail: {
        title: 'Smart Retail Transformation',
        desc: 'Deploying custom kiosks for seamless check-out in Singapore.'
      },
      industry: {
        title: 'Industrial Edge Computing',
        desc: 'High-performance Mini PCs driving automated lines in Germany.'
      },
      office: {
        title: 'Modern Workspace Integration',
        desc: 'Premium AIO solutions for a leading tech hub in Tokyo.'
      },
      transport: {
        title: 'Public Transit Signage',
        desc: 'Durable industrial monitors for New York subway networks.'
      }
    },
    stats: {
      factories: 'Global Factories',
      series: 'AIO Series',
      clients: 'Happy Clients',
      experience: 'Years Excellence',
    },
    process: {
      title: 'Precision Manufacturing',
      subtitle: 'The 11-Step Excellence Workflow',
      PROCESS_TITLE: 'Precision Manufacturing',
      PROCESS_SUBTITLE: 'The 11-Step Excellence Workflow',
      steps: [
        { title: 'PMC PLANNING', desc: 'Production and material control planning for optimal resource allocation and timeline management.' },
        { title: 'PROCUREMENT', desc: 'Strategic sourcing and purchasing of high-quality raw materials from certified suppliers.' },
        { title: 'SUPPLIER', desc: 'Managing supplier relationships and ensuring timely delivery of components.' },
        { title: 'RECEIVING', desc: 'Receiving and verifying incoming materials against purchase orders.' },
        { title: 'INSPECTION', desc: 'Comprehensive quality inspection ensuring all materials meet specifications.' },
        { title: 'WAREHOUSING', desc: 'Secure storage of qualified materials in climate-controlled facilities.' },
        { title: 'MATERIAL ISSUING', desc: 'Systematic material requisition and distribution to production lines.' },
        { title: 'MANUFACTURING', desc: 'Precision manufacturing using advanced equipment and strict quality protocols.' },
        { title: 'PRE-SHIPMENT INSPECTION', desc: 'Final quality assurance before products leave the facility.' },
        { title: 'WAREHOUSING', desc: 'Product storage and inventory management before shipment.' },
        { title: 'SHIPMENT', desc: 'Secure packaging and global distribution to customers worldwide.' },
      ]
    },
    map: {
      title: 'Global Footprint',
      subtitle: 'Strategically located to serve world-class brands.',
      locations: [
        {
          id: 'panyu',
          type: 'HQ',
          title: 'PANYU HUB',
          address: 'Panyu District, Guangzhou, Guangdong Province, China',
          desc: 'Primary Global Marketing Headquarters and Strategic Operations Command',
          posTop: '35%',
          posLeft: '80%'
        },
        {
          id: 'shunde',
          type: 'Factory',
          title: 'SHUNDE FACILITY',
          address: 'Shunde District, Foshan, Guangdong Province, China',
          desc: 'Specialized in small-size computer equipment production and R&D',
          posTop: '38%',
          posLeft: '79%'
        },
        {
          id: 'beijiao',
          type: 'Factory',
          title: 'BEIJIAO FACILITY',
          address: 'Beijiao Town, Shunde District, Foshan, Guangdong Province, China',
          desc: 'Large-size and commercial display production hub for global markets',
          posTop: '40%',
          posLeft: '78%'
        },
        {
          id: 'jakarta',
          type: 'Global',
          title: 'JAKARTA BASE',
          address: 'Jakarta, Indonesia',
          desc: 'Strategic international manufacturing facility serving Southern markets',
          posTop: '65%',
          posLeft: '72%'
        }
      ]
    }
  },
  zh: {
    core_advantages: '核心优势',
    product_contact_now: '立即咨询',
    product_spec_sheet: '规格书',
    product_global_support: '全球支持',
    product_sales_consulting: '业务咨询',
    product_tab_desc: '详细描述',
    product_tab_specs: '技术规格',
    nav: {
      wholesale: '批发产品',
      projects: '项目产品',
      cases: '案例',
      products: '产品中心',
      company: '公司信息',
      contact: '联系我们',
      about: '关于我们',
      career: '加入我们',
      projects_nav: '项目产品',
      sub: {
        aio: '电脑一体机及半成品',
        aio_desc: '高集成电脑一体机及专业级半成品套装。',
        laptop: '笔记本',
        laptop_desc: '高效办公与消费类便携式电脑方案。',
        minipc: '小主机',
        minipc_desc: '紧凑空间下的高性能计算核心。',
        electromechanical: '机电产品',
        electromechanical_desc: '包含机箱、电源及散热器等周边硬件。',
        monitor: '显示器',
        monitor_desc: '全品类专业及工业级视觉显示方案。',
        components: '电脑配件',
        components_desc: '主板、显卡、内存、硬盘及CPU核心部件。',
        conference: '会议平板',
        conference_desc: '为现代智能办公设计的交互式显示终端。',
        showroom: '商显展厅工程',
        showroom_desc: '商业显示展厅及各类展览展示工程。',
        featured: '特色推荐',
        catalog_title: '工业硬件手册 2024',
        catalog_desc: '探索我们包含前沿硬件技术的最新手册。',
        download: '立即下载手册',
      }
    },
    footer: {
      slogan1: '世界共享美好！',
      slogan2: '让优秀的场景应用方案造福世界！',
    },
    hero: {
      headline: '一体机电脑',
      subheadline: '专业制造商',
      cta: '探索方案',
      wholesale: '批发产品',
      project: '项目产品',
      learnMore: '了解更多',
    },
    video: {
      title: '全球智能制造',
      subtitle: '重塑桌面与显示之美',
    },
    products: {
      title: '产品中心',
      subtitle: '为性能与可靠性而生',
      aio: '一体机电脑',
      minipc: '迷你电脑',
      monitor: '工业显示器',
      kiosk: '自助终端机',
      requestQuote: '获取报价',
      listTitle: '产品目录',
      listSubtitle: '发现我们全系列的高端计算解决方案。',
      searchPlaceholder: '按名称搜索产品...',
      allCategories: '所有分类',
      noResults: '未找到符合条件的产品。',
      viewDetails: '查看详情',
      specSheet: '技术规格',
      needQuote: '需要定制报价？',
      expertHelp: '我们的专家随时准备为您提供大规模部署方案和技术支持。',
      contactSales: '联系销售',
      wholesaleLine: '批发产品线',
      projectSolutions: '项目解决方案',
      quickSearch: '快速搜索',
      categories: '产品分类',
      itemsCount: '件产品',
      resetFilters: '重置所有过滤器',
      syncing: '正在同步全球库存...',
      noSubCategories: '未定义子分类',
    },
    gallery: {
      title: '精选产品',
      subtitle: '于细节处见创新与精密',
    },
    cases: {
      title: '案例展示',
      subtitle: 'Heovose 硬件方案在全球的真实应用。',
      viewCase: '查看案例',
      tags: {
        retail: '新零售',
        industry: '工业控制',
        office: '企业办公',
        transport: '轨道交通'
      },
      retail: {
        title: '智慧零售转型',
        desc: '为新加坡大型商超部署定制化自助结账系统。'
      },
      industry: {
        title: '工业边缘计算',
        desc: '助力德国自动化工厂生产线的高性能计算方案。'
      },
      office: {
        title: '现代办公集成',
        desc: '为东京科技中心提供高端一体机桌面方案。'
      },
      transport: {
        title: '公共交通数字标牌',
        desc: '高耐用性工业显示器应用于纽约地铁网络。'
      }
    },
    stats: {
      factories: '全球工厂',
      series: 'AIO 系列',
      clients: '合作伙伴',
      experience: '行业经验',
    },
    process: {
      title: '精密制造',
      subtitle: '11步卓越生产流程',
      PROCESS_TITLE: '精密制造',
      PROCESS_SUBTITLE: '11步卓越生产流程',
      steps: [
        { title: 'PMC 计划', desc: '生产与物料控制计划，实现最优资源配置和时间进度管理。' },
        { title: '采购管理', desc: '从认证供应商处进行高品质原材料的战略采购。' },
        { title: '供应商协作', desc: '管理供应商关系并确保关键组件的准时交付。' },
        { title: '物料接收', desc: '根据采购订单接收并严格核实进厂原材料。' },
        { title: '品质检验', desc: '全面的质量检查，确保所有材料符合规格。' },
        { title: '仓储管理', desc: '在气候受控的设施中安全存储合格材料。' },
        { title: '物料发放', desc: '系统化的物料申领并分发至生产线。' },
        { title: '生产制造', desc: '使用先进设备和严格质量协议的精密制造。' },
        { title: '出货前检验', desc: '产品离开工厂前的最后质量保证。' },
        { title: '成品入库', desc: '出货前的产品存储与库存管理。' },
        { title: '包装发货', desc: '专业的工业防护包装，安全高效地配送至全球客户。' },
      ]
    },
    map: {
      title: '全球布局',
      subtitle: '战略布局，服务全球品牌。',
      locations: [
        {
          id: 'panyu',
          type: 'HQ',
          title: 'PANYU HUB (番禺)',
          address: '中国 广东 广州 番禺区',
          desc: '全球营销总部与战略运营指挥中心',
          posTop: '35%',
          posLeft: '80%'
        },
        {
          id: 'shunde',
          type: 'Factory',
          title: 'SHUNDE FACILITY (顺德)',
          address: '中国 广东 佛山 顺德区',
          desc: '专注于小型化计算设备的生产与研发',
          posTop: '38%',
          posLeft: '79%'
        },
        {
          id: 'beijiao',
          type: 'Factory',
          title: 'BEIJIAO FACILITY (北滘)',
          address: '中国 广东 佛山 顺德 北滘镇',
          desc: '服务全球市场的大尺寸及商显生产枢纽',
          posTop: '40%',
          posLeft: '78%'
        },
        {
          id: 'jakarta',
          type: 'Global',
          title: 'JAKARTA BASE (雅加达)',
          address: '印度尼西亚 雅加达',
          desc: '服务南方市场的战略性国际制造基地',
          posTop: '65%',
          posLeft: '72%'
        }
      ]
    }
  },
  id: {
    core_advantages: 'Keunggulan Utama',
    product_contact_now: 'Hubungi Sekarang',
    product_spec_sheet: 'Lembar Spek',
    product_global_support: 'Dukungan Global',
    product_sales_consulting: 'Konsultasi Penjualan',
    product_tab_desc: 'Deskripsi Detail',
    product_tab_specs: 'Spesifikasi Teknis',
    nav: {
      wholesale: 'Produk Grosir',
      projects: 'Solusi Proyek',
      cases: 'Kasus',
      products: 'Produk',
      company: 'Perusahaan',
      contact: 'Hubungi Kami',
      about: 'Tentang Kami',
      career: 'Karir',
      projects_nav: 'Produk Proyek',
      sub: {
        aio: 'AIO & Setengah Jadi',
        aio_desc: 'PC All-in-One dan kit barebones profesional.',
        laptop: 'Laptop',
        laptop_desc: 'Solusi komputasi portabel bisnis dan konsumen.',
        minipc: 'Mini PC',
        minipc_desc: 'Komputasi performa tinggi dalam faktor bentuk kompak.',
        electromechanical: 'Elektromekanikal',
        electromechanical_desc: 'Casing komputer, catu daya, dan sistem pendingin.',
        monitor: 'Monitor',
        monitor_desc: 'Solusi tampilan kelas profesional dan industri.',
        components: 'Komponen PC',
        components_desc: 'Motherboard, GPU, RAM, Hard Drive, dan CPU.',
        conference: 'Tablet Konferensi',
        conference_desc: 'Tampilan cerdas interaktif untuk pertemuan modern.',
        showroom: 'Proyek Showroom',
        showroom_desc: 'Showroom màn hình thương mại và triển lảm.',
        featured: 'Unggulan',
        catalog_title: 'Katalog Perangkat Keras Industri 2024',
        catalog_desc: 'Jelajahi katalog terbaru kami yang menampilkan perangkat keras mutakhir.',
        download: 'UNDUH KATALOG',
      }
    },
    footer: {
      slogan1: 'Dunia berbagi hal-hal baik!',
      slogan2: 'Biarkan solusi aplikasi yang luar biasa bermanfaat bagi dunia!',
    },
    hero: {
      headline: 'Komputer All In One',
      subheadline: 'Produsen Profesional',
      cta: 'Jelajahi Solusi',
      wholesale: 'Produk Grosir',
      project: 'Project Products',
      learnMore: 'Pelajari Lebih Lanjut',
    },
    video: {
      title: 'Manufaktur Cerdas Global',
      subtitle: 'Mendefinisikan Ulang Keunggulan Desktop & Tampilan.',
    },
    products: {
      title: 'Portofolio Kami',
      subtitle: 'Dirancang untuk Performa dan Keandalan',
      aio: 'PC All-in-One',
      minipc: 'Mini PC',
      monitor: 'Monitor Industri',
      kiosk: 'Kios Layanan Mandiri',
      requestQuote: 'MINTA PENAWARAN',
      listTitle: 'Katalog Produk',
      listSubtitle: 'Temukan rangkaian lengkap solusi komputasi kelas atas kami.',
      searchPlaceholder: 'Cari produk berdasarkan nama...',
      allCategories: 'Semua Kategori',
      noResults: 'Tidak ada produk yang ditemukan.',
      viewDetails: 'Lihat Detail',
      specSheet: 'Lembar Spek',
    },
    gallery: {
      title: 'Produk Unggulan',
      subtitle: 'Inovasi dan Presisi dalam Setiap Detail',
    },
    cases: {
      title: 'Kisah Sukses',
      subtitle: 'Dampak dunia nyata dari solusi perangkat keras Heovose.',
      viewCase: 'LIHAT KASUS',
      tags: {
        retail: 'RITEL',
        industry: 'INDUSTRI',
        office: 'KORPORAT',
        transport: 'TRANSIT'
      },
      retail: {
        title: 'Smart Retail Transformation',
        desc: 'Menyebarkan kios khusus untuk checkout lancar di Singapura.'
      },
      industry: {
        title: 'Komputasi Tepi Industri',
        desc: 'Mini PC performa tinggi menggerakkan lini otomatis di Jerman.'
      },
      office: {
        title: 'Integrasi Ruang Kerja Modern',
        desc: 'Solusi AIO premium untuk hub teknologi terkemuka di Tokyo.'
      },
      transport: {
        title: 'Papan Nama Transportasi Publik',
        desc: 'Monitor industri tahan lama untuk jaringan kereta bawah tanah New York.'
      }
    },
    stats: {
      factories: 'Pabrik Global',
      series: 'Seri AIO',
      clients: 'Klien Puas',
      experience: 'Tahun Keunggulan',
    },
    process: {
      title: 'Manufaktur Presisi',
      subtitle: 'Alur Kerja Keunggulan 11-Langkah',
      PROCESS_TITLE: 'Manufaktur Presisi',
      PROCESS_SUBTITLE: 'Alur Kerja Keunggulan 11-Langkah',
      steps: [
        { title: 'PMC PLANNING', desc: 'Perencanaan pengendalian produksi và vật tư để tối ưu hóa nguồn lực.' },
        { title: 'PROCUREMENT', desc: 'Sourcing chiến lược và mua nguyên liệu chất lượng cao.' },
        { title: 'SUPPLIER', desc: 'Quản lý mối quan hệ nhà cung cấp và đảm bảo giao hàng đúng hạn.' },
        { title: 'RECEIVING', desc: 'Tiếp nhận và xác minh vật liệu so với đơn đặt hàng.' },
        { title: 'INSPEKSI', desc: 'Inspeksi kualitas komprehensif memastikan semua bahan memenuhi spesifikasi.' },
        { title: 'PERGUDANGAN', desc: 'Penyimpanan bahan yang aman ở cơ sở kiểm soát khí hậu.' },
        { title: 'PENGELUARAN MATERIAL', desc: 'Permintaan material yang hệ thống và phân phối đến các dây chuyền sản xuất.' },
        { title: 'MANUFACTURING', desc: 'Manufaktur chính xác sử dụng thiết bị tiên tiến và các giao thức chất lượng nghiêm ngặt.' },
        { title: 'PRE-SHIPMENT INSPECTION', desc: 'Jaminan chất lượng cuối cùng sebelum produk meninggalkan pabrik.' },
        { title: 'WAREHOUSING', desc: 'Penyimpanan produk và quản lý hàng tồn kho trước khi xuất xưởng.' },
        { title: 'PENGIRIMAN', desc: 'Pengemasan aman và phân phối toàn cầu đến khách hàng trên toàn thế giới.' },
      ]
    },
    map: {
      title: 'Jejak Global',
      subtitle: 'Strategically located to serve world-class brands.',
      locations: [
        {
          id: 'panyu',
          type: 'HQ',
          title: 'PANYU HUB',
          address: 'Distrik Panyu, Guangzhou, Provinsi Guangdong, Tiongkok',
          desc: 'Markas Besar Pemasaran Global Utama và Trung tâm điều hành chiến lược',
          posTop: '35%',
          posLeft: '80%'
        },
        {
          id: 'shunde',
          type: 'FASILITAS SHUNDE',
          address: 'Distrik Shunde, Foshan, Provinsi Guangdong, Tiongkok',
          desc: 'Spesialisasi trong sản xuất thiết bị máy tính cỡ nhỏ và R&D',
          posTop: '38%',
          posLeft: '79%'
        },
        {
          id: 'beijiao',
          type: 'FASILITAS BEIJIAO',
          address: 'Kota Beijiao, Distrik Shunde, Foshan, Provinsi Guangdong, Tiongkok',
          desc: 'Hub sản xuất màn hình thương mại cho thị trường toàn cầu',
          posTop: '40%',
          posLeft: '78%'
        },
        {
          id: 'jakarta',
          type: 'BASIS JAKARTA',
          address: 'Jakarta, Indonesia',
          desc: 'Cơ sở sản xuất quốc tế chiến lược phục vụ thị trường miền Nam',
          posTop: '65%',
          posLeft: '72%'
        }
      ]
    }
  },
  vi: {
    core_advantages: 'Ưu điểm cốt lõi',
    product_contact_now: 'Liên hệ ngay',
    product_spec_sheet: 'Bảng thông số',
    product_global_support: 'Hỗ trợ toàn cầu',
    product_sales_consulting: 'Tư vấn bán hàng',
    product_tab_desc: 'Mô tả chi tiết',
    product_tab_specs: 'Thông số kỹ thuật',
    nav: {
      wholesale: 'Sản phẩm Bán buôn',
      projects: 'Giải pháp Dự án',
      cases: 'Trường hợp',
      products: 'Sản phẩm',
      company: 'Công ty',
      contact: 'Liên hệ',
      about: 'Về chúng tôi',
      career: 'Tuyển dụng',
      projects_nav: 'Sản phẩm Dự án',
      sub: {
        aio: 'AIO & Bán thành phẩm',
        aio_desc: 'Máy tính All-in-One và bộ barebones chuyên nghiệp.',
        laptop: 'Máy tính xách tay',
        laptop_desc: 'Giải pháp máy tính xách tay doanh nghiệp và người tiêu dùng.',
        minipc: 'Mini PC',
        minipc_desc: 'Máy tính hiệu suất cao trong một kích thước nhỏ gọn.',
        electromechanical: 'Cơ điện',
        electromechanical_desc: 'Vỏ máy tính, bộ nguồn và hệ thống làm mát.',
        monitor: 'Màn hình',
        monitor_desc: 'Giải pháp màn hình lớp chuyên nghiệp và công nghiệp.',
        components: 'Linh kiện PC',
        components_desc: 'Bo mạch chủ, GPU, RAM, Ổ cứng và CPU.',
        conference: 'Máy tính bảng hội nghị',
        conference_desc: 'Màn hình thông minh tương tác cho các cuộc họp hiện đại.',
        showroom: 'Dự án Showroom',
        showroom_desc: 'Showroom màn hình thương mại và triển lãm.',
        featured: 'Nổi bật',
        catalog_title: 'Danh mục Phần cứng Công nghiệp 2024',
        catalog_desc: 'Khám phá danh mục mới nhất của chúng tôi.',
        download: 'TẢI DANH MỤC',
      }
    },
    footer: {
      slogan1: 'Thế giới chia sẻ những điều tốt đẹp!',
      slogan2: 'Hãy để các giải pháp ứng dụng xuất sắc mang lại lợi ích cho thế giới!',
    },
    hero: {
      headline: 'Máy tính All In One',
      subheadline: 'Nhà sản xuất chuyên nghiệp',
      cta: 'Khám phá giải pháp',
      wholesale: 'Sản phẩm Bán buôn',
      project: 'Project Products',
      learnMore: 'Tìm hiểu thêm',
    },
    video: {
      title: 'Sản xuất thông minh toàn cầu',
      subtitle: 'Định nghĩa lại sự xuất sắc của máy tính để bàn & màn hình.',
    },
    products: {
      title: 'Danh mục của chúng tôi',
      subtitle: 'Được thiết kế cho hiệu suất và độ tin cậy',
      aio: 'Máy tính All-in-One',
      minipc: 'Mini PC',
      monitor: 'Màn hình công nghiệp',
      kiosk: 'Kiosk tự phục vụ',
      requestQuote: 'YÊU CẦU BÁO GIÁ',
      listTitle: 'Danh mục sản phẩm',
      listSubtitle: 'Khám phá loạt giải pháp máy tính cao cấp toàn diện của chúng tôi.',
      searchPlaceholder: 'Tìm kiếm sản phẩm theo tên...',
      allCategories: 'Tất cả danh mục',
      noResults: 'Không tìm thấy sản phẩm.',
      viewDetails: 'Xem chi tiết',
      specSheet: 'Bảng thông số',
    },
    gallery: {
      title: 'Sản phẩm Nổi bật',
      subtitle: 'Đổi mới và Chính xác trong từng Chi tiết',
    },
    cases: {
      title: 'Câu chuyện thành công',
      subtitle: 'Tác động thực tế của giải pháp phần cứng Heovose.',
      viewCase: 'XEM CHI TIẾT',
      tags: {
        retail: 'BÁN LẺ',
        industry: 'CÔNG NGHIỆP',
        office: 'DOANH NGHIỆP',
        transport: 'VẬN TẢI'
      },
      retail: {
        title: 'Chuyển đổi bán lẻ thông minh',
        desc: 'Triển khai kiosk tùy chỉnh để thanh toán liền mạch tại Singapore.'
      },
      industry: {
        title: 'Máy tính biên công nghiệp',
        desc: 'Mini PC hiệu suất cao vận hành dây chuyền tự động tại Đức.'
      },
      office: {
        title: 'Tích hợp không gian làm việc hiện đại',
        desc: 'Giải pháp AIO cao cấp cho trung tâm công nghệ hàng đầu tại Tokyo.'
      },
      transport: {
        title: 'Biển báo giao thông công cộng',
        desc: 'Màn hình công nghiệp bền bỉ cho hệ thống tàu điện ngầm New York.'
      }
    },
    stats: {
      factories: 'Nhà máy toàn cầu',
      series: 'Dòng AIO',
      clients: 'Khách hàng hài lòng',
      experience: 'Năm kinh nghiệm',
    },
    process: {
      title: 'Sản xuất chính xác',
      subtitle: 'Quy trình 11 bước xuất sắc',
      PROCESS_TITLE: 'Sản xuất chính xác',
      PROCESS_SUBTITLE: 'Quy trình 11 bước xuất sắc',
      steps: [
        { title: 'PMC PLANNING', desc: 'Lập kế hoạch kiểm soát sản xuất và vật tư để tối ưu hóa nguồn lực.' },
        { title: 'PROCUREMENT', desc: 'Tìm nguồn cung ứng chiến lược và mua nguyên liệu chất lượng cao.' },
        { title: 'SUPPLIER', desc: 'Quản lý mối quan hệ nhà cung cấp và đảm bảo giao hàng đúng hạn.' },
        { title: 'RECEIVING', desc: 'Tiếp nhận và xác minh vật liệu so với đơn đặt hàng.' },
        { title: 'KIỂM TRA', desc: 'Kiểm tra chất lượng toàn diện đảm bảo mọi nguyên vật liệu đạt tiêu chuẩn.' },
        { title: 'LƯU KHO', desc: 'Lưu trữ an toàn nguyên vật liệu đạt chuẩn trong cơ sở kiểm soát khí hậu.' },
        { title: 'PHÁT HÀNH VẬT LIỆU', desc: 'Yêu cầu và phân phối vật liệu hệ thống đến các dây chuyền sản xuất.' },
        { title: 'SẢN XUẤT', desc: 'Sản xuất chính xác sử dụng thiết bị tiên tiến và các giao thức chất lượng nghiêm ngặt.' },
        { title: 'PRE-SHIPMENT INSPECTION', desc: 'Đảm bảo chất lượng cuối cùng trước khi sản phẩm rời khỏi nhà máy.' },
        { title: 'WAREHOUSING', desc: 'Lưu kho sản phẩm và quản lý hàng tồn kho trước khi xuất xưởng.' },
        { title: 'VẬN CHUYỂN', desc: 'Đóng gói an toàn và phân phối toàn cầu đến khách hàng trên toàn thế giới.' },
      ]
    },
    map: {
      title: 'Dấu ấn toàn cầu',
      subtitle: 'Vị trí chiến lược phục vụ các thương hiệu thế giới.',
      locations: [
        {
          id: 'panyu',
          type: 'HQ',
          title: 'TRUNG TÂM PHIÊN NGƯ',
          address: 'Quận Phiên Ngư, Quảng Châu, Quảng Đông, Trung Quốc',
          desc: 'Trụ sở tiếp thị toàn cầu chính và Trung tâm điều hành chiến lược',
          posTop: '35%',
          posLeft: '80%'
        },
        {
          id: 'shunde',
          type: 'CƠ SỞ THUẬN ĐỨC',
          address: 'Quận Thuận Đức, Phật Sơn, Quảng Đông, Trung Quốc',
          desc: 'Chuyên sản xuất thiết bị máy tính cỡ nhỏ và R&D',
          posTop: '38%',
          posLeft: '79%'
        },
        {
          id: 'beijiao',
          type: 'CƠ SỞ BẮC GIẢO',
          address: 'Thị trấn Bắc Giảo, Thuận Đức, Phật Sơn, Quảng Đông, Trung Quốc',
          desc: 'Trung tâm sản xuất màn hình thương mại cho thị trường toàn cầu',
          posTop: '40%',
          posLeft: '78%'
        },
        {
          id: 'jakarta',
          type: 'CĂN CỨ JAKARTA',
          address: 'Jakarta, Indonesia',
          desc: 'Cơ sở sản xuất quốc tế chiến lược phục vụ thị trường miền Nam',
          posTop: '65%',
          posLeft: '72%'
        }
      ]
    }
  }
};
