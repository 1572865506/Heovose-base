import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const translations = [
  {
    id: 'NAV_SERVICE_CENTERS',
    content: {
      zh: '服务中心',
      en: 'Service Centers',
      id: 'Pusat Layanan',
    }
  },
  {
    id: 'SERVICE_HERO_BADGE',
    content: {
      zh: '全球客户支持与保障体系',
      en: 'Global Customer Support Network',
      id: 'Jaringan Layanan Pelanggan Global',
    }
  },
  {
    id: 'SERVICE_HERO_TITLE',
    content: {
      zh: '全球服务中心',
      en: 'Global Service Centers',
      id: 'Pusat Layanan Global',
    }
  },
  {
    id: 'SERVICE_HERO_SUBTITLE',
    content: {
      zh: '为您提供全方位、高效的本地化硬件保修与售后技术服务保障。中国区及印尼区网点均提供原厂配件自提及快速维保服务。',
      en: 'Providing comprehensive and efficient localized hardware warranty and technical support. Direct pickup and repair available at all CN and ID locations.',
      id: 'Menyediakan garansi perangkat keras dan dukungan teknis lokal yang efisien. Pengambilan langsung dan perbaikan tersedia di semua lokasi.',
    }
  },
  {
    id: 'SERVICE_SEARCH_PLACEHOLDER',
    content: {
      zh: '输入网点名称、地址、电话或备注进行搜索...',
      en: 'Search by name, address, phone or notes...',
      id: 'Cari berdasarkan nama, alamat, telepon atau catatan...',
    }
  },
  {
    id: 'SERVICE_TAB_ALL',
    content: {
      zh: '全部地区',
      en: 'All Regions',
      id: 'Semua Wilayah',
    }
  },
  {
    id: 'SERVICE_TAB_CN',
    content: {
      zh: '中国区 (CN)',
      en: 'China (CN)',
      id: 'Tiongkok (CN)',
    }
  },
  {
    id: 'SERVICE_TAB_ID',
    content: {
      zh: '印度尼西亚 (ID)',
      en: 'Indonesia (ID)',
      id: 'Indonesia (ID)',
    }
  },
  {
    id: 'SERVICE_LABEL_PHONE',
    content: {
      zh: '联系电话',
      en: 'Phone',
      id: 'Telepon',
    }
  },
  {
    id: 'SERVICE_LABEL_EMAIL',
    content: {
      zh: '电子邮箱',
      en: 'Email',
      id: 'Email',
    }
  },
  {
    id: 'SERVICE_LABEL_HOURS',
    content: {
      zh: '工作时间',
      en: 'Working Hours',
      id: 'Jam Kerja',
    }
  },
  {
    id: 'SERVICE_LABEL_NOTE',
    content: {
      zh: '网点备注',
      en: 'Note',
      id: 'Catatan',
    }
  },
  {
    id: 'SERVICE_COPY_ADDRESS',
    content: {
      zh: '复制地址',
      en: 'Copy Address',
      id: 'Salin Alamat',
    }
  },
  {
    id: 'SERVICE_ADDRESS_COPIED',
    content: {
      zh: '地址复制成功',
      en: 'Address copied to clipboard',
      id: 'Alamat berhasil disalin',
    }
  },
  {
    id: 'SERVICE_DIAL',
    content: {
      zh: '立即拨号',
      en: 'Dial Now',
      id: 'Telepon Sekarang',
    }
  },
  {
    id: 'SERVICE_NO_DATA',
    content: {
      zh: '暂无匹配的服务网点',
      en: 'No matching service centers found',
      id: 'Pusat layanan tidak ditemukan',
    }
  },
  {
    id: 'SERVICE_NO_DATA_DESC',
    content: {
      zh: '您可以尝试切换地区选项卡或更改您的搜索关键词。',
      en: 'Try switching region tabs or changing your search keywords.',
      id: 'Cobalah untuk mengubah pencarian Anda atau memilih wilayah lain.',
    }
  },
  {
    id: 'SERVICE_LOAD_MORE',
    content: {
      zh: '加载更多网点',
      en: 'Load More Centers',
      id: 'Muat Lebih Banyak Cabang',
    }
  },
  {
    id: 'SERVICE_LABEL_SUBREGION',
    content: {
      zh: '省市/地区',
      en: 'Region / Province',
      id: 'Wilayah / Provinsi',
    }
  },
  {
    id: 'SERVICE_SUB_ALL',
    content: {
      zh: '全部区域',
      en: 'All Areas',
      id: 'Semua Area',
    }
  }
];

async function main() {
  console.log('Seeding localized strings for Service Centers page...');
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
  console.log('Service Centers localized strings seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Failed to seed translations:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
