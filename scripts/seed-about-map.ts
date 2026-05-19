import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const translations = [
  // --- HERO SECTION KEYS (OPTION 2: GLOBAL MANUFACTURING ECOSYSTEM) ---
  {
    id: 'ABOUT_HERO_BADGE',
    content: {
      zh: '全球化先进电脑设备智造企业',
      en: 'Global Advanced Computing Manufacturer',
      id: 'Produsen Komputasi Canggih Global',
    }
  },
  {
    id: 'ABOUT_HERO_TITLE_1',
    content: {
      zh: '智造互联',
      en: 'Intelligent Connection &',
      id: 'Koneksi Cerdas &',
    }
  },
  {
    id: 'ABOUT_HERO_TITLE_2',
    content: {
      zh: '视显未来',
      en: 'Visionary Display',
      id: 'Tampilan Visioner',
    }
  },
  {
    id: 'ABOUT_HERO_SUBTITLE',
    content: {
      zh: 'Heovose 控股协同中印三大先进智造工厂，构筑起从“小尺寸微型计算”到“大尺寸商用显示”的精密硬件底座。依托多年的软硬件自研实力与成本控制优势，我们携手全球合作伙伴，共创合作共赢、视显万物的数字化未来。',
      en: 'Heovose coordinates three state-of-the-art manufacturing plants across China and Indonesia, delivering precision computing from Mini PCs to commercial interactive displays. Harnessing decades of R&D and cost integration, we pioneer a win-win future with global partners.',
      id: 'Heovose mengoordinasikan tiga pabrik manufaktur canggih di China dan Indonesia, menghadirkan komputasi presisi mulai dari Mini PC hingga tampilan interaktif komersial. Memanfaatkan R&D puluhan tahun dan integrasi biaya, kami merintis masa depan yang saling menguntungkan dengan mitra global.',
    }
  },
  {
    id: 'ABOUT_HERO_VAL1_LABEL',
    content: {
      zh: '专业专注',
      en: 'Focused',
      id: 'Fokus',
    }
  },
  {
    id: 'ABOUT_HERO_VAL1_DESC',
    content: {
      zh: '深耕不辍',
      en: 'Dedication',
      id: 'Dedikasi',
    }
  },
  {
    id: 'ABOUT_HERO_VAL2_LABEL',
    content: {
      zh: '三厂联动',
      en: 'Tri-Factory',
      id: 'Tiga Pabrik',
    }
  },
  {
    id: 'ABOUT_HERO_VAL2_DESC',
    content: {
      zh: '全球交付',
      en: 'Global Delivery',
      id: 'Pengiriman Global',
    }
  },
  {
    id: 'ABOUT_HERO_VAL3_LABEL',
    content: {
      zh: '共创未来',
      en: 'Evolution',
      id: 'Evolusi',
    }
  },
  {
    id: 'ABOUT_HERO_VAL3_DESC',
    content: {
      zh: '蓬勃共赢',
      en: 'Win-Win Ecosystem',
      id: 'Ekosistem Saling Menguntungkan',
    }
  },
  {
    id: 'ABOUT_HERO_SCROLL',
    content: {
      zh: '探索更多',
      en: 'Discover More',
      id: 'Jelajahi Lebih Lanjut',
    }
  },

  // --- MAP SECTION KEYS ---
  {
    id: 'ABOUT_MAP_TITLE',
    content: {
      zh: '全球智造版图',
      en: 'Global Manufacturing Infrastructure',
      id: 'Peta Infrastruktur Global',
    }
  },
  {
    id: 'ABOUT_MAP_SUBTITLE',
    content: {
      zh: '布局三厂联动体系，展示强大的全球交付与服务保证能力。',
      en: 'Strategic three-factory ecosystem ensuring global delivery and service excellence.',
      id: 'Ekosistem tiga pabrik strategis yang menjamin pengiriman global.',
    }
  },
  {
    id: 'ABOUT_MAP_BADGE',
    content: {
      zh: '3大生产基地',
      en: '3 Production Bases',
      id: '3 Pangkalan Produksi',
    }
  },
  {
    id: 'ABOUT_MAP_BASE1_LOC',
    content: {
      zh: '中国·广东',
      en: 'Guangdong, China',
      id: 'Guangdong, Tiongkok',
    }
  },
  {
    id: 'ABOUT_MAP_BASE1_TITLE',
    content: {
      zh: '小尺寸智造中心',
      en: 'Small-size Smart Manufacturing Center',
      id: 'Pusat Manufaktur Pintar Ukuran Kecil',
    }
  },
  {
    id: 'ABOUT_MAP_BASE1_FOCUS',
    content: {
      zh: '专注小尺寸设备，走专业化、精细化路线。',
      en: 'Precision small-size device engineering.',
      id: 'Fokus pada rekayasa perangkat ukuran kecil yang presisi.',
    }
  },
  {
    id: 'ABOUT_MAP_BASE1_TAGS',
    content: {
      zh: '一体机,笔记本,Mini PC',
      en: 'AIO,Laptop,Mini PC',
      id: 'AIO,Laptop,Mini PC',
    }
  },
  {
    id: 'ABOUT_MAP_BASE2_LOC',
    content: {
      zh: '中国·广东',
      en: 'Guangdong, China',
      id: 'Guangdong, Tiongkok',
    }
  },
  {
    id: 'ABOUT_MAP_BASE2_TITLE',
    content: {
      zh: '大尺寸商显基地',
      en: 'Commercial Display Base',
      id: 'Pangkalan Tampilan Komersial',
    }
  },
  {
    id: 'ABOUT_MAP_BASE2_FOCUS',
    content: {
      zh: '专注规模化、高端化商用显示系统。',
      en: 'High-end commercial display systems.',
      id: 'Sistem tampilan komersial kelas atas.',
    }
  },
  {
    id: 'ABOUT_MAP_BASE2_TAGS',
    content: {
      zh: '会议机,教育机,人机交互',
      en: 'Conference,Education,Interaction',
      id: 'Konferensi,Pendidikan,Interaksi',
    }
  },
  {
    id: 'ABOUT_MAP_BASE3_LOC',
    content: {
      zh: '印尼·东南亚',
      en: 'Indonesia, SE Asia',
      id: 'Indonesia, Asia Tenggara',
    }
  },
  {
    id: 'ABOUT_MAP_BASE3_TITLE',
    content: {
      zh: '区域生产中心',
      en: 'Regional Production Center',
      id: 'Pusat Produksi Regional',
    }
  },
  {
    id: 'ABOUT_MAP_BASE3_FOCUS',
    content: {
      zh: '全球化战略布局，实现本地化服务响应。',
      en: 'Strategic global localized manufacturing.',
      id: 'Manufaktur lokal yang strategis di tingkat global.',
    }
  },
  {
    id: 'ABOUT_MAP_BASE3_TAGS',
    content: {
      zh: '本地化制造,快速响应',
      en: 'Local Mfg,Fast Response',
      id: 'Manufaktur Lokal,Respon Cepat',
    }
  },
  {
    id: 'ABOUT_CERT_NO_IMAGE',
    content: {
      zh: '暂无证书图',
      en: 'No Certificate Image',
      id: 'Tidak ada gambar sertifikat',
    }
  }
];

async function main() {
  console.log('Seeding localized strings for About Us (Hero & Map sections with Option 2)...');
  for (const t of translations) {
    await prisma.localizedString.upsert({
      where: { id: t.id },
      update: { content: t.content },
      create: {
        id: t.id,
        content: t.content
      }
    });
  }
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
