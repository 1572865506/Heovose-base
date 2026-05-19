import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCenters = {
  centers: [
    {
      id: "sz_center",
      region: "CN",
      subRegion: "广东省",
      name: "深圳智慧服务中心",
      address: "深圳市龙岗区坂田街道天安云谷一期3栋",
      phone: "+86 755 8888 8888",
      email: "cn.support@heovose.com",
      hours: "周一至周五 09:00 - 18:00",
      note: "支持到店自提与加急硬件保修服务"
    },
    {
      id: "jk_center",
      region: "ID",
      subRegion: "DKI Jakarta",
      name: "Pusat Layanan Jakarta",
      address: "Jl. Kuningan Mulia No.9, RT.6/RW.7, Kecamatan Setiabudi, Jakarta Selatan",
      phone: "+62 21 5555 5555",
      email: "id.support@heovose.com",
      hours: "Senin - Jumat 09:00 - 18:00",
      note: "Menyediakan layanan perbaikan perangkat keras ekspres"
    }
  ]
};

async function main() {
  console.log('Seeding Heovose Service Centers settings...');
  
  await prisma.setting.upsert({
    where: { id: 'service_centers' },
    update: {
      value: JSON.stringify(defaultCenters)
    },
    create: {
      id: 'service_centers',
      value: JSON.stringify(defaultCenters)
    }
  });

  console.log('Successfully seeded service centers settings in the database!');
}

main()
  .catch((e) => {
    console.error('Failed to seed service centers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
