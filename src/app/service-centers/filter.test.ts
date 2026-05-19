import { describe, it, expect } from 'vitest';

// Interface matching our ServiceCenter structure
interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  region: 'CN' | 'ID';
  subRegion: string;
  phone: string;
  email?: string;
  hours?: string;
  note?: string;
}

// Pure filter function extracted exactly from our ServiceCentersContent component logic
function getFilteredCenters({
  centers,
  selectedRegion,
  selectedSubRegion,
  searchQuery,
}: {
  centers: ServiceCenter[];
  selectedRegion: 'ALL' | 'CN' | 'ID';
  selectedSubRegion: string;
  searchQuery: string;
}): ServiceCenter[] {
  return centers.filter(c => {
    const matchesRegion = selectedRegion === 'ALL' || c.region === selectedRegion;
    const matchesSubRegion = selectedSubRegion === 'ALL' || c.subRegion === selectedSubRegion;
    const matchesSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.subRegion && c.subRegion.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.note && c.note.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesSubRegion && matchesSearch;
  });
}

describe('Service Centers Dual-Level Filtering Logic', () => {
  const mockCenters: ServiceCenter[] = [
    {
      id: 'sz_center',
      region: 'CN',
      subRegion: '广东省',
      name: '深圳智慧服务中心',
      address: '深圳市龙岗区坂田街道天安云谷一期3栋',
      phone: '+86 755 8888 8888',
      email: 'cn.support@heovose.com',
      hours: '周一至周五 09:00 - 18:00',
      note: '支持到店自提与加急硬件保修服务'
    },
    {
      id: 'bj_center',
      region: 'CN',
      subRegion: '北京市',
      name: '北京智慧服务中心',
      address: '北京市朝阳区国贸大厦B座',
      phone: '+86 10 6666 6666',
      email: 'bj.support@heovose.com',
      hours: '周一至周五 09:00 - 18:00',
      note: '支持企业现场保修'
    },
    {
      id: 'jk_center',
      region: 'ID',
      subRegion: 'DKI Jakarta',
      name: 'Pusat Layanan Jakarta',
      address: 'Jl. Kuningan Mulia No.9, Kecamatan Setiabudi, Jakarta Selatan',
      phone: '+62 21 5555 5555',
      email: 'id.support@heovose.com',
      hours: 'Senin - Jumat 09:00 - 18:00',
      note: 'Menyediakan layanan perbaikan perangkat keras ekspres'
    }
  ];

  it('应该是默认返回全部网点列表 (selectedRegion=ALL, selectedSubRegion=ALL, searchQuery="")', () => {
    const result = getFilteredCenters({
      centers: mockCenters,
      selectedRegion: 'ALL',
      selectedSubRegion: 'ALL',
      searchQuery: '',
    });
    expect(result).toHaveLength(3);
    expect(result.map(c => c.id)).toContain('sz_center');
    expect(result.map(c => c.id)).toContain('bj_center');
    expect(result.map(c => c.id)).toContain('jk_center');
  });

  it('应该支持按「所属国家 (Region)」进行一级过滤', () => {
    // 过滤中国区
    const cnResult = getFilteredCenters({
      centers: mockCenters,
      selectedRegion: 'CN',
      selectedSubRegion: 'ALL',
      searchQuery: '',
    });
    expect(cnResult).toHaveLength(2);
    expect(cnResult.map(c => c.id)).not.toContain('jk_center');

    // 过滤印尼区
    const idResult = getFilteredCenters({
      centers: mockCenters,
      selectedRegion: 'ID',
      selectedSubRegion: 'ALL',
      searchQuery: '',
    });
    expect(idResult).toHaveLength(1);
    expect(idResult[0].id).toBe('jk_center');
  });

  it('应该支持按「省市/二级区域 (subRegion)」进行二级过滤', () => {
    // 仅查找 广东省
    const gdResult = getFilteredCenters({
      centers: mockCenters,
      selectedRegion: 'ALL',
      selectedSubRegion: '广东省',
      searchQuery: '',
    });
    expect(gdResult).toHaveLength(1);
    expect(gdResult[0].id).toBe('sz_center');

    // 仅查找 北京市
    const bjResult = getFilteredCenters({
      centers: mockCenters,
      selectedRegion: 'ALL',
      selectedSubRegion: '北京市',
      searchQuery: '',
    });
    expect(bjResult).toHaveLength(1);
    expect(bjResult[0].id).toBe('bj_center');
  });

  it('应该支持模糊多条件搜索检索网点', () => {
    // 按名称搜索
    const searchName = getFilteredCenters({
      centers: mockCenters,
      selectedRegion: 'ALL',
      selectedSubRegion: 'ALL',
      searchQuery: 'Pusat',
    });
    expect(searchName).toHaveLength(1);
    expect(searchName[0].id).toBe('jk_center');

    // 按地址搜索
    const searchAddr = getFilteredCenters({
      centers: mockCenters,
      selectedRegion: 'ALL',
      selectedSubRegion: 'ALL',
      searchQuery: '国贸',
    });
    expect(searchAddr).toHaveLength(1);
    expect(searchAddr[0].id).toBe('bj_center');

    // 按电话搜索
    const searchPhone = getFilteredCenters({
      centers: mockCenters,
      selectedRegion: 'ALL',
      selectedSubRegion: 'ALL',
      searchQuery: '755',
    });
    expect(searchPhone).toHaveLength(1);
    expect(searchPhone[0].id).toBe('sz_center');

    // 大小写不敏感与省市检索
    const searchSub = getFilteredCenters({
      centers: mockCenters,
      selectedRegion: 'ALL',
      selectedSubRegion: 'ALL',
      searchQuery: 'jakarta',
    });
    expect(searchSub).toHaveLength(1);
    expect(searchSub[0].id).toBe('jk_center');
  });

  it('应该完美支持国家 + 省市 + 模糊检索的联合深度匹配', () => {
    // 查询中国 + 广东省 + 搜索关键词 "智慧"
    const combinedMatch = getFilteredCenters({
      centers: mockCenters,
      selectedRegion: 'CN',
      selectedSubRegion: '广东省',
      searchQuery: '智慧',
    });
    expect(combinedMatch).toHaveLength(1);
    expect(combinedMatch[0].id).toBe('sz_center');

    // 查询中国 + 北京市 + 搜索关键词 "天安云谷" (无匹配项)
    const noMatch = getFilteredCenters({
      centers: mockCenters,
      selectedRegion: 'CN',
      selectedSubRegion: '北京市',
      searchQuery: '天安云谷',
    });
    expect(noMatch).toHaveLength(0);
  });
});
