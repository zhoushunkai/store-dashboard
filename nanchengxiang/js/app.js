/* ============================================
   app.js - 南城香协作终端
   Supabase 云端数据 + 前端路由
   ============================================ */

/* ---------------- Supabase 配置（部署时替换） ---------------- */
const SUPABASE_URL = 'https://omkshuposrdmwgukpoxd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ta3NodXBvc3JkbXdndWtwb3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTM2NTcsImV4cCI6MjEwMTEyOTY1N30.WH7ta72Bm2cICuQhW--O26BftF1FJZtN3WNwOddfQO4';

const App = {
  supabase: null,
  currentUser: null,
  currentHash: '',
  dataCache: {},       // 内存缓存，页面同步读取
  dataReady: false,    // 缓存是否就绪

  /* ---- 种子数据（首次初始化用，camelCase 兼容旧代码） ---- */
  // daily_reports: [{ id, inspector, date, type('online'|'offline'), items: [{ store, score, findings }] }]
  seedData: {
    daily_reports: [],
    stores: [
      { id: 's001', name: '控江路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '徐常青', managerTitle: '门店第一负责人', employeeId: '2283', mode: '3.0' },
      { id: 's002', name: '内江路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '段琳阁', managerTitle: '门店第一负责人', employeeId: '15841', mode: '3.0' },
      { id: 's003', name: '打浦路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '刘中骞', managerTitle: '门店第一负责人', employeeId: '2073', mode: '3.0' },
      { id: 's004', name: '江苏路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '陈高峰', managerTitle: '门店第一负责人', employeeId: '12199', mode: '3.0' },
      { id: 's005', name: '张杨路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '朱福林', managerTitle: '门店第一负责人', employeeId: '15014', mode: '3.0' },
      { id: 's006', name: '曹杨路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '杨亚辉', managerTitle: '门店第一负责人', employeeId: '16346', mode: '3.0' },
      { id: 's007', name: '仙霞路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '高丽', managerTitle: '门店第一负责人', employeeId: '20406', mode: '3.0' },
      { id: 's008', name: '鸿兴路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '于洋洋', managerTitle: '门店第一负责人', employeeId: '17671', mode: '3.0' },
      { id: 's009', name: '张江路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '杨秀旗', managerTitle: '门店第一负责人', employeeId: '19111', mode: '3.0' },
      { id: 's010', name: '漕河泾店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '张泽雨', managerTitle: '门店第一负责人', employeeId: '16946', mode: '3.0' },
      { id: 's011', name: '同普路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '赵红卫', managerTitle: '门店第一负责人', employeeId: '17253', mode: '3.0' },
      { id: 's012', name: '龙阳路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '姚杰', managerTitle: '门店第一负责人', employeeId: '19236', mode: '3.0' },
      { id: 's013', name: '大连路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '朱涛', managerTitle: '门店第一负责人', employeeId: '18906', mode: '3.0' },
      { id: 's014', name: '莲花路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '赵志远', managerTitle: '门店第一负责人', employeeId: '16477', mode: '3.0' },
      { id: 's015', name: '制造局路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '王声敏', managerTitle: '门店第一负责人', employeeId: '3013', mode: '3.0' },
      { id: 's016', name: '都市路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '鲁远亮', managerTitle: '门店第一负责人', employeeId: '8983', mode: '3.0' },
      { id: 's017', name: '沪南路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '陈林', managerTitle: '门店第一负责人', employeeId: '18579', mode: '3.0' },
      { id: 's018', name: '碧波路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '耿玉杰', managerTitle: '门店第一负责人', employeeId: '9223', mode: '3.0' },
      { id: 's019', name: '漕宝路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '王永振', managerTitle: '门店第一负责人', employeeId: '17566', mode: '3.0' },
      { id: 's020', name: '祁连山路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '凡小伟', managerTitle: '门店第一负责人', employeeId: '19209', mode: '3.0' },
      { id: 's021', name: '政通路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '王天宇', managerTitle: '门店第一负责人', employeeId: '17050', mode: '3.0' },
      { id: 's022', name: '宁夏路店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '刘瑞腾', managerTitle: '门店第一负责人', employeeId: '19656', mode: '3.0' },
      { id: 's023', name: '大融城店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '臧文娜', managerTitle: '门店第一负责人', employeeId: '17743', mode: '3.0' },
      { id: 's024', name: '南翔店', district: '上海', adminArea: '上海', bizArea: '上海', region: '上海', manager: '聂伟龙', managerTitle: '门店第一负责人', employeeId: '15964', mode: '3.0' },
      { id: 's025', name: '天通苑店', district: '昌平区', adminArea: '昌平区', bizArea: '训练店', region: '训练店', manager: '马瑞霞', managerTitle: '门店第一负责人', employeeId: '8856', mode: '3.0' },
      { id: 's026', name: '立水桥店', district: '朝阳区', adminArea: '朝阳区', bizArea: '训练店', region: '训练店', manager: '马心丽', managerTitle: '储备店长', employeeId: '13728', mode: '3.0' },
      { id: 's027', name: '物资学院店', district: '通州区', adminArea: '通州区', bizArea: '训练店', region: '训练店', manager: '何子元', managerTitle: '储备店长', employeeId: '10864', mode: '3.0' },
      { id: 's028', name: '常营店', district: '朝阳区', adminArea: '朝阳区', bizArea: '训练店', region: '训练店', manager: '杨二光', managerTitle: '门店第一负责人', employeeId: '15467', mode: '3.0' },
      { id: 's029', name: '枣园店', district: '大兴区', adminArea: '大兴区', bizArea: '训练店', region: '训练店', manager: '曹露露', managerTitle: '门店第一负责人', employeeId: '13707', mode: '3.0' },
      { id: 's030', name: '张仪村店', district: '丰台区', adminArea: '丰台区', bizArea: '训练店', region: '训练店', manager: '赵宁', managerTitle: '门店第一负责人', employeeId: '5031', mode: '3.0' },
      { id: 's031', name: '清河店', district: '海淀区', adminArea: '海淀区', bizArea: '训练店', region: '训练店', manager: '邓继鲁', managerTitle: '门店第一负责人', employeeId: '13580', mode: '3.0' },
      { id: 's032', name: '阎村店', district: '房山区', adminArea: '房山区', bizArea: '训练店', region: '训练店', manager: '王克霞', managerTitle: '门店第一负责人', employeeId: '18607', mode: '3.0' },
      { id: 's033', name: '永安路店', district: '西城区', adminArea: '西城区', bizArea: '训练店', region: '训练店', manager: '石清曼', managerTitle: '门店第一负责人', employeeId: '16786', mode: '3.0' },
      { id: 's034', name: '门头沟店', district: '门头沟区', adminArea: '门头沟区', bizArea: '训练店', region: '训练店', manager: '周松涛', managerTitle: '门店第一负责人', employeeId: '16316', mode: '3.0' },
      { id: 's035', name: '和平东街店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营一区', region: '经营一区', manager: '滕桂桃', managerTitle: '门店第一负责人', employeeId: '18509', mode: '2.5' },
      { id: 's036', name: '首经贸店', district: '丰台区', adminArea: '丰台区', bizArea: '经营一区', region: '经营一区', manager: '曾冬梅', managerTitle: '门店第一负责人', employeeId: '1236', mode: '2.5' },
      { id: 's037', name: '和平西桥店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营一区', region: '经营一区', manager: '宋凤堂', managerTitle: '门店第一负责人', employeeId: '11689', mode: '2.5' },
      { id: 's038', name: '通州北苑店', district: '通州区', adminArea: '通州区', bizArea: '经营一区', region: '经营一区', manager: '董聪慧', managerTitle: '门店第一负责人', employeeId: '17509', mode: '2.5' },
      { id: 's039', name: '环影十二街店', district: '通州区', adminArea: '通州区', bizArea: '经营一区', region: '经营一区', manager: '陈荣', managerTitle: '门店第一负责人', employeeId: '6579', mode: '2.0' },
      { id: 's040', name: '东花市店', district: '东城区', adminArea: '东城区', bizArea: '经营一区', region: '经营一区', manager: '徐建', managerTitle: '门店第一负责人', employeeId: '10668', mode: '2.0' },
      { id: 's041', name: '富力城店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营一区', region: '经营一区', manager: '李景畅', managerTitle: '储备店长', employeeId: '14015', mode: '2.0' },
      { id: 's042', name: '龙德广场店', district: '昌平区', adminArea: '昌平区', bizArea: '经营一区', region: '经营一区', manager: '冯学利', managerTitle: '门店第一负责人', employeeId: '11889', mode: '2.0' },
      { id: 's043', name: '国贸店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营一区', region: '经营一区', manager: '聂文波', managerTitle: '门店第一负责人', employeeId: '6295', mode: '2.0' },
      { id: 's044', name: '新中关店', district: '海淀区', adminArea: '海淀区', bizArea: '经营一区', region: '经营一区', manager: '申俊萍', managerTitle: '门店第一负责人', employeeId: '10415', mode: '2.0' },
      { id: 's045', name: '霍营店', district: '昌平区', adminArea: '昌平区', bizArea: '经营一区', region: '经营一区', manager: '王冬梅', managerTitle: '门店第一负责人', employeeId: '2550', mode: '2.0' },
      { id: 's046', name: '开阳里店', district: '丰台区', adminArea: '丰台区', bizArea: '经营一区', region: '经营一区', manager: '闫晶晶', managerTitle: '门店第一负责人', employeeId: '2863', mode: '2.0' },
      { id: 's047', name: '大成路店', district: '丰台区', adminArea: '丰台区', bizArea: '经营一区', region: '经营一区', manager: '张会敏', managerTitle: '门店第一负责人', employeeId: '13935', mode: '2.0' },
      { id: 's048', name: '大红门店', district: '丰台区', adminArea: '丰台区', bizArea: '经营一区', region: '经营一区', manager: '张晴晴', managerTitle: '门店第一负责人', employeeId: '2245', mode: '2.0' },
      { id: 's049', name: '紫竹桥店', district: '海淀区', adminArea: '海淀区', bizArea: '经营一区', region: '经营一区', manager: '杨忠华', managerTitle: '储备店长', employeeId: '17820', mode: '2.0' },
      { id: 's050', name: '新宫店', district: '丰台区', adminArea: '丰台区', bizArea: '经营一区', region: '经营一区', manager: '李超', managerTitle: '门店第一负责人', employeeId: '11379', mode: '2.0' },
      { id: 's051', name: '五道口店', district: '海淀区', adminArea: '海淀区', bizArea: '经营一区', region: '经营一区', manager: '崔盼成', managerTitle: '门店第一负责人', employeeId: '11738', mode: '2.0' },
      { id: 's052', name: '通胡大街店', district: '通州区', adminArea: '通州区', bizArea: '经营一区', region: '经营一区', manager: '赵炳旭', managerTitle: '门店第一负责人', employeeId: '8028', mode: '2.0' },
      { id: 's053', name: '潘家园店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营一区', region: '经营一区', manager: '张玉莲', managerTitle: '门店第一负责人', employeeId: '14519', mode: '2.0' },
      { id: 's054', name: '黄渠店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营二区', region: '经营二区', manager: '杜安山', managerTitle: '门店第一负责人', employeeId: '10081', mode: '2.0' },
      { id: 's055', name: '垡头店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营二区', region: '经营二区', manager: '张焱珂', managerTitle: '门店第一负责人', employeeId: '15236', mode: '2.0' },
      { id: 's056', name: '旧宫店', district: '大兴区', adminArea: '大兴区', bizArea: '经营二区', region: '经营二区', manager: '卢二宁', managerTitle: '门店第一负责人', employeeId: '16478', mode: '2.0' },
      { id: 's057', name: '吕家营店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营二区', region: '经营二区', manager: '蒋明艳', managerTitle: '门店第一负责人', employeeId: '3171', mode: '2.0' },
      { id: 's058', name: '刘家窑店', district: '丰台区', adminArea: '丰台区', bizArea: '经营二区', region: '经营二区', manager: '韩荣荣', managerTitle: '门店第一负责人', employeeId: '8161', mode: '2.0' },
      { id: 's059', name: '木樨园店', district: '丰台区', adminArea: '丰台区', bizArea: '经营二区', region: '经营二区', manager: '姚梦钰', managerTitle: '门店第一负责人', employeeId: '16095', mode: '2.0' },
      { id: 's060', name: '酒仙桥店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营二区', region: '经营二区', manager: '李明月', managerTitle: '门店第一负责人', employeeId: '3028', mode: '2.0' },
      { id: 's061', name: '角门店', district: '丰台区', adminArea: '丰台区', bizArea: '经营二区', region: '经营二区', manager: '李兴翠', managerTitle: '门店第一负责人', employeeId: '10325', mode: '2.0' },
      { id: 's062', name: '成寿寺店', district: '丰台区', adminArea: '丰台区', bizArea: '经营二区', region: '经营二区', manager: '牛旺', managerTitle: '门店第一负责人', employeeId: '13579', mode: '2.0' },
      { id: 's063', name: '劲松店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营二区', region: '经营二区', manager: '于秀红', managerTitle: '门店第一负责人', employeeId: '5539', mode: '2.0' },
      { id: 's064', name: '双井店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营二区', region: '经营二区', manager: '李婉婷', managerTitle: '门店第一负责人', employeeId: '17026', mode: '2.0' },
      { id: 's065', name: '洋桥店', district: '丰台区', adminArea: '丰台区', bizArea: '经营二区', region: '经营二区', manager: '李满龙', managerTitle: '门店第一负责人', employeeId: '17018', mode: '2.0' },
      { id: 's066', name: '公益西桥店', district: '丰台区', adminArea: '丰台区', bizArea: '经营二区', region: '经营二区', manager: '吴泽', managerTitle: '门店第一负责人', employeeId: '19237', mode: '2.0' },
      { id: 's067', name: '西局店', district: '丰台区', adminArea: '丰台区', bizArea: '经营二区', region: '经营二区', manager: '徐瑞峰', managerTitle: '储备店长', employeeId: '10478', mode: '2.0' },
      { id: 's068', name: '甘露园店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营二区', region: '经营二区', manager: '周周', managerTitle: '门店第一负责人', employeeId: '15509', mode: '2.0' },
      { id: 's069', name: '宋家庄店', district: '丰台区', adminArea: '丰台区', bizArea: '经营二区', region: '经营二区', manager: '李景叶', managerTitle: '门店第一负责人', employeeId: '4668', mode: '2.0' },
      { id: 's070', name: '西红门店', district: '大兴区', adminArea: '大兴区', bizArea: '经营二区', region: '经营二区', manager: '齐家乐', managerTitle: '门店第一负责人', employeeId: '12147', mode: '2.0' },
      { id: 's071', name: '苹果园店', district: '石景山区', adminArea: '石景山区', bizArea: '经营二区', region: '经营二区', manager: '王清清', managerTitle: '门店第一负责人', employeeId: '4282', mode: '2.0' },
      { id: 's072', name: '六里桥东店', district: '丰台区', adminArea: '丰台区', bizArea: '经营二区', region: '经营二区', manager: '张丹萍', managerTitle: '门店第一负责人', employeeId: '16892', mode: '2.0' },
      { id: 's073', name: '安贞店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营三区', region: '经营三区', manager: '刘竞阳', managerTitle: '门店第一负责人', employeeId: '19232', mode: '2.0' },
      { id: 's074', name: '北太平庄店', district: '海淀区', adminArea: '海淀区', bizArea: '经营三区', region: '经营三区', manager: '王宏武', managerTitle: '门店第一负责人', employeeId: '12521', mode: '2.0' },
      { id: 's075', name: '小西天店', district: '海淀区', adminArea: '海淀区', bizArea: '经营三区', region: '经营三区', manager: '魏倩倩', managerTitle: '门店第一负责人', employeeId: '9820', mode: '2.0' },
      { id: 's076', name: '志新路店', district: '海淀区', adminArea: '海淀区', bizArea: '经营三区', region: '经营三区', manager: '秦双双', managerTitle: '门店第一负责人', employeeId: '16490', mode: '2.0' },
      { id: 's077', name: '奥体店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营三区', region: '经营三区', manager: '胡晓飞', managerTitle: '门店第一负责人', employeeId: '5625', mode: '2.0' },
      { id: 's078', name: '立水桥二店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营三区', region: '经营三区', manager: '孟紫藤', managerTitle: '门店第一负责人', employeeId: '7710', mode: '2.0' },
      { id: 's079', name: '马甸桥店', district: '西城区', adminArea: '西城区', bizArea: '经营三区', region: '经营三区', manager: '范瑞焕', managerTitle: '门店第一负责人', employeeId: '19207', mode: '2.0' },
      { id: 's080', name: '牡丹园店', district: '海淀区', adminArea: '海淀区', bizArea: '经营三区', region: '经营三区', manager: '张明君', managerTitle: '门店第一负责人', employeeId: '15430', mode: '2.0' },
      { id: 's081', name: '六道口店', district: '海淀区', adminArea: '海淀区', bizArea: '经营三区', region: '经营三区', manager: '高秋瑾', managerTitle: '二副', employeeId: '12256', mode: '2.0' },
      { id: 's082', name: '金码大厦店', district: '海淀区', adminArea: '海淀区', bizArea: '经营三区', region: '经营三区', manager: '付兵（代）', managerTitle: '储备店长', employeeId: '17334', mode: '2.0' },
      { id: 's083', name: '马连道店', district: '西城区', adminArea: '西城区', bizArea: '经营三区', region: '经营三区', manager: '冉伟', managerTitle: '门店第一负责人', employeeId: '4075', mode: '2.0' },
      { id: 's084', name: '刘家窑二店', district: '丰台区', adminArea: '丰台区', bizArea: '经营三区', region: '经营三区', manager: '王丹丹', managerTitle: '门店第一负责人', employeeId: '11985', mode: '2.0' },
      { id: 's085', name: '传媒大学店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营三区', region: '经营三区', manager: '仵蜜蜜', managerTitle: '门店第一负责人', employeeId: '15418', mode: '2.0' },
      { id: 's086', name: '左家庄店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营三区', region: '经营三区', manager: '吴艳磊', managerTitle: '门店第一负责人', employeeId: '12674', mode: '2.0' },
      { id: 's087', name: '丰台南路店', district: '丰台区', adminArea: '丰台区', bizArea: '经营三区', region: '经营三区', manager: '朱乃云', managerTitle: '门店第一负责人', employeeId: '4175', mode: '2.0' },
      { id: 's088', name: '朝阳大悦城店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营三区', region: '经营三区', manager: '周宗楠', managerTitle: '门店第一负责人', employeeId: '16722', mode: '2.0' },
      { id: 's089', name: '甘露园二店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营三区', region: '经营三区', manager: '崔梦宇', managerTitle: '门店第一负责人', employeeId: '15042', mode: '2.0' },
      { id: 's090', name: '中日友好医院店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营三区', region: '经营三区', manager: '张春燕', managerTitle: '门店第一负责人', employeeId: '1407', mode: '2.0' },
      { id: 's091', name: '北京西站店', district: '丰台区', adminArea: '丰台区', bizArea: '经营四区', region: '经营四区', manager: '田财云', managerTitle: '门店第一负责人', employeeId: '6705', mode: '2.5' },
      { id: 's092', name: '马驹桥店', district: '通州区', adminArea: '通州区', bizArea: '经营四区', region: '经营四区', manager: '刘永豪', managerTitle: '门店第一负责人', employeeId: '15726', mode: '2.5' },
      { id: 's093', name: '现代城店', district: '通州区', adminArea: '通州区', bizArea: '经营四区', region: '经营四区', manager: '赵涵', managerTitle: '门店第一负责人', employeeId: '18992', mode: '2.5' },
      { id: 's094', name: '康化路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营四区', region: '经营四区', manager: '陈振南', managerTitle: '门店第一负责人', employeeId: '14768', mode: '2.5' },
      { id: 's095', name: '巴沟店', district: '海淀区', adminArea: '海淀区', bizArea: '经营四区', region: '经营四区', manager: '冯晚霞', managerTitle: '门店第一负责人', employeeId: '19283', mode: '2.5' },
      { id: 's096', name: '朝阳门南小街店', district: '东城区', adminArea: '东城区', bizArea: '经营四区', region: '经营四区', manager: '田雅霜', managerTitle: '门店第一负责人', employeeId: '18006', mode: '2.0' },
      { id: 's097', name: '十里河店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营四区', region: '经营四区', manager: '武媛媛', managerTitle: '门店第一负责人', employeeId: '11890', mode: '2.0' },
      { id: 's098', name: '看丹桥店', district: '丰台区', adminArea: '丰台区', bizArea: '经营四区', region: '经营四区', manager: '吴晗', managerTitle: '门店第一负责人', employeeId: '14485', mode: '2.0' },
      { id: 's099', name: '翠微路店', district: '海淀区', adminArea: '海淀区', bizArea: '经营四区', region: '经营四区', manager: '邱永浩', managerTitle: '门店第一负责人', employeeId: '7163', mode: '2.0' },
      { id: 's100', name: '草桥店', district: '丰台区', adminArea: '丰台区', bizArea: '经营四区', region: '经营四区', manager: '邓颖', managerTitle: '门店第一负责人', employeeId: '18157', mode: '2.0' },
      { id: 's101', name: '玉泉路店', district: '海淀区', adminArea: '海淀区', bizArea: '经营四区', region: '经营四区', manager: '郑胜起', managerTitle: '门店第一负责人', employeeId: '10062', mode: '2.0' },
      { id: 's102', name: '西罗园店', district: '丰台区', adminArea: '丰台区', bizArea: '经营四区', region: '经营四区', manager: '杨舒婷', managerTitle: '门店第一负责人', employeeId: '19072', mode: '2.0' },
      { id: 's103', name: '阜成门店', district: '西城区', adminArea: '西城区', bizArea: '经营四区', region: '经营四区', manager: '刘志修', managerTitle: '门店第一负责人', employeeId: '11803', mode: '2.0' },
      { id: 's104', name: '分钟寺店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营四区', region: '经营四区', manager: '江双', managerTitle: '门店第一负责人', employeeId: '12085', mode: '2.0' },
      { id: 's105', name: '定安路店', district: '东城区', adminArea: '东城区', bizArea: '经营四区', region: '经营四区', manager: '袁晓红', managerTitle: '门店第一负责人', employeeId: '8042', mode: '2.0' },
      { id: 's106', name: '石榴庄店', district: '丰台区', adminArea: '丰台区', bizArea: '经营四区', region: '经营四区', manager: '刘澳利', managerTitle: '门店第一负责人', employeeId: '18858', mode: '2.0' },
      { id: 's107', name: '公主坟店', district: '海淀区', adminArea: '海淀区', bizArea: '经营四区', region: '经营四区', manager: '郭艳美', managerTitle: '门店第一负责人', employeeId: '2110', mode: '2.0' },
      { id: 's108', name: '柳芳店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营四区', region: '经营四区', manager: '王佳雪', managerTitle: '门店第一负责人', employeeId: '6795', mode: '2.0' },
      { id: 's109', name: '永安里店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营五区', region: '经营五区', manager: '熊胜红', managerTitle: '门店第一负责人', employeeId: '11373', mode: '2.0' },
      { id: 's110', name: '科丰桥店', district: '丰台区', adminArea: '丰台区', bizArea: '经营五区', region: '经营五区', manager: '李宏亮', managerTitle: '门店第一负责人', employeeId: '5901', mode: '2.0' },
      { id: 's111', name: '万丰路店', district: '丰台区', adminArea: '丰台区', bizArea: '经营五区', region: '经营五区', manager: '周小龙', managerTitle: '门店第一负责人', employeeId: '15464', mode: '2.0' },
      { id: 's112', name: '将台路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营五区', region: '经营五区', manager: '石佳佳', managerTitle: '门店第一负责人', employeeId: '14985', mode: '2.0' },
      { id: 's113', name: '四惠东店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营五区', region: '经营五区', manager: '李欢', managerTitle: '门店第一负责人', employeeId: '18457', mode: '2.0' },
      { id: 's114', name: '东直门店', district: '东城区', adminArea: '东城区', bizArea: '经营五区', region: '经营五区', manager: '武春艳', managerTitle: '门店第一负责人', employeeId: '19198', mode: '2.0' },
      { id: 's115', name: '十里河三店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营五区', region: '经营五区', manager: '李敏', managerTitle: '门店第一负责人', employeeId: '9971', mode: '2.0' },
      { id: 's116', name: '北京南站店', district: '丰台区', adminArea: '丰台区', bizArea: '经营五区', region: '经营五区', manager: '赵倩', managerTitle: '门店第一负责人', employeeId: '6680', mode: '2.0' },
      { id: 's117', name: '四道口店', district: '海淀区', adminArea: '海淀区', bizArea: '经营五区', region: '经营五区', manager: '吴迪', managerTitle: '门店第一负责人', employeeId: '4928', mode: '2.0' },
      { id: 's118', name: '天通苑三店', district: '昌平区', adminArea: '昌平区', bizArea: '经营五区', region: '经营五区', manager: '孙振', managerTitle: '门店第一负责人', employeeId: '3190', mode: '2.0' },
      { id: 's119', name: '隆福寺店', district: '东城区', adminArea: '东城区', bizArea: '经营五区', region: '经营五区', manager: '容晓晴', managerTitle: '门店第一负责人', employeeId: '14769', mode: '2.0' },
      { id: 's120', name: '花家地店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营五区', region: '经营五区', manager: '闫会平', managerTitle: '门店第一负责人', employeeId: '12087', mode: '2.0' },
      { id: 's121', name: '岳各庄店', district: '丰台区', adminArea: '丰台区', bizArea: '经营五区', region: '经营五区', manager: '周春兰', managerTitle: '门店第一负责人', employeeId: '19492', mode: '2.0' },
      { id: 's122', name: '西三旗店', district: '海淀区', adminArea: '海淀区', bizArea: '经营五区', region: '经营五区', manager: '郝方方', managerTitle: '门店第一负责人', employeeId: '9278', mode: '2.0' },
      { id: 's123', name: '西坝河店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营五区', region: '经营五区', manager: '李晓花', managerTitle: '储备店长', employeeId: '15546', mode: '2.0' },
      { id: 's124', name: '九棵树店', district: '通州区', adminArea: '通州区', bizArea: '经营五区', region: '经营五区', manager: '杨育彪', managerTitle: '门店第一负责人', employeeId: '13206', mode: '2.0' },
      { id: 's125', name: '九龙山店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营五区', region: '经营五区', manager: '高月生', managerTitle: '门店第一负责人', employeeId: '10609', mode: '2.0' },
      { id: 's126', name: '亚运村店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营五区', region: '经营五区', manager: '孔维哲', managerTitle: '门店第一负责人', employeeId: '17682', mode: '2.0' },
      { id: 's127', name: '望京二店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营五区', region: '经营五区', manager: '周文杰', managerTitle: '门店第一负责人', employeeId: '11165', mode: '2.0' },
      { id: 's128', name: '大望路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营六区', region: '经营六区', manager: '刘彦乔', managerTitle: '门店第一负责人', employeeId: '5705', mode: '2.0' },
      { id: 's129', name: '月坛店', district: '西城区', adminArea: '西城区', bizArea: '经营六区', region: '经营六区', manager: '彭冬冬', managerTitle: '门店第一负责人', employeeId: '1825', mode: '2.0' },
      { id: 's130', name: '菜市口店', district: '西城区', adminArea: '西城区', bizArea: '经营六区', region: '经营六区', manager: '李郑杰', managerTitle: '门店第一负责人', employeeId: '13223', mode: '2.0' },
      { id: 's131', name: '大郊亭店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营六区', region: '经营六区', manager: '赵京阳', managerTitle: '门店第一负责人', employeeId: '2662', mode: '2.0' },
      { id: 's132', name: '回龙观店', district: '昌平区', adminArea: '昌平区', bizArea: '经营六区', region: '经营六区', manager: '何祖奇', managerTitle: '门店第一负责人', employeeId: '7461', mode: '2.0' },
      { id: 's133', name: '育新店', district: '昌平区', adminArea: '昌平区', bizArea: '经营六区', region: '经营六区', manager: '王宇', managerTitle: '门店第一负责人', employeeId: '7479', mode: '2.0' },
      { id: 's134', name: '磁器口店', district: '东城区', adminArea: '东城区', bizArea: '经营六区', region: '经营六区', manager: '王玉辉', managerTitle: '门店第一负责人', employeeId: '2523', mode: '2.0' },
      { id: 's135', name: '马家堡店', district: '丰台区', adminArea: '丰台区', bizArea: '经营六区', region: '经营六区', manager: '姚守明', managerTitle: '门店第一负责人', employeeId: '19096', mode: '2.0' },
      { id: 's136', name: '六里桥店', district: '丰台区', adminArea: '丰台区', bizArea: '经营六区', region: '经营六区', manager: '郭明月', managerTitle: '门店第一负责人', employeeId: '8490', mode: '2.0' },
      { id: 's137', name: '建国门店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营六区', region: '经营六区', manager: '徐萌萌', managerTitle: '门店第一负责人', employeeId: '16776', mode: '2.0' },
      { id: 's138', name: '白云路店', district: '西城区', adminArea: '西城区', bizArea: '经营六区', region: '经营六区', manager: '陈志文', managerTitle: '门店第一负责人', employeeId: '6102', mode: '2.0' },
      { id: 's139', name: '人民大学店', district: '海淀区', adminArea: '海淀区', bizArea: '经营六区', region: '经营六区', manager: '马冰雪', managerTitle: '门店第一负责人', employeeId: '19142', mode: '2.0' },
      { id: 's140', name: '天健广场店', district: '丰台区', adminArea: '丰台区', bizArea: '经营六区', region: '经营六区', manager: '丁志', managerTitle: '门店第一负责人', employeeId: '19463', mode: '2.0' },
      { id: 's141', name: '管庄店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营六区', region: '经营六区', manager: '高翔', managerTitle: '门店第一负责人', employeeId: '7398', mode: '2.0' },
      { id: 's142', name: '珠江帝景店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营六区', region: '经营六区', manager: '刘丹', managerTitle: '门店第一负责人', employeeId: '7393', mode: '2.0' },
      { id: 's143', name: '青年路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营六区', region: '经营六区', manager: '洪勤', managerTitle: '门店第一负责人', employeeId: '6480', mode: '2.0' },
      { id: 's144', name: '黄村西大街店', district: '大兴区', adminArea: '大兴区', bizArea: '经营六区', region: '经营六区', manager: '于红丽', managerTitle: '门店第一负责人', employeeId: '5156', mode: '2.0' },
      { id: 's145', name: '北苑路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营六区', region: '经营六区', manager: '张立香', managerTitle: '门店第一负责人', employeeId: '16163', mode: '2.0' },
      { id: 's146', name: '北新桥店', district: '东城区', adminArea: '东城区', bizArea: '经营六区', region: '经营六区', manager: '安帅锦', managerTitle: '门店第一负责人', employeeId: '11427', mode: '2.0' },
      { id: 's147', name: '回龙观二店', district: '昌平区', adminArea: '昌平区', bizArea: '经营七区', region: '经营七区', manager: '王晋一', managerTitle: '门店第一负责人', employeeId: '5474', mode: '2.5' },
      { id: 's148', name: '角门西店', district: '丰台区', adminArea: '丰台区', bizArea: '经营七区', region: '经营七区', manager: '牛菲', managerTitle: '门店第一负责人', employeeId: '10300', mode: '2.5' },
      { id: 's149', name: '魏公村店', district: '海淀区', adminArea: '海淀区', bizArea: '经营七区', region: '经营七区', manager: '高晓博', managerTitle: '门店第一负责人', employeeId: '10769', mode: '2.5' },
      { id: 's150', name: '旧宫二店', district: '大兴区', adminArea: '大兴区', bizArea: '经营七区', region: '经营七区', manager: '倪梦贤', managerTitle: '门店第一负责人', employeeId: '16224', mode: '2.5' },
      { id: 's151', name: '马连洼店', district: '海淀区', adminArea: '海淀区', bizArea: '经营七区', region: '经营七区', manager: '刘杰', managerTitle: '门店第一负责人', employeeId: '1865', mode: '2.5' },
      { id: 's152', name: '动物园店', district: '西城区', adminArea: '西城区', bizArea: '经营七区', region: '经营七区', manager: '李智', managerTitle: '门店第一负责人', employeeId: '19537', mode: '2.0' },
      { id: 's153', name: '大悦春风里店', district: '大兴区', adminArea: '大兴区', bizArea: '经营七区', region: '经营七区', manager: '孙红雨', managerTitle: '门店第一负责人', employeeId: '14744', mode: '2.0' },
      { id: 's154', name: '磁器口二店', district: '东城区', adminArea: '东城区', bizArea: '经营七区', region: '经营七区', manager: '张亭', managerTitle: '门店第一负责人', employeeId: '16103', mode: '2.0' },
      { id: 's155', name: '劲松二店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营七区', region: '经营七区', manager: '王秀秀', managerTitle: '门店第一负责人', employeeId: '3676', mode: '2.0' },
      { id: 's156', name: '前门店', district: '东城区', adminArea: '东城区', bizArea: '经营七区', region: '经营七区', manager: '胡鹏云', managerTitle: '门店第一负责人', employeeId: '16094', mode: '2.0' },
      { id: 's157', name: '通州万达店', district: '通州区', adminArea: '通州区', bizArea: '经营七区', region: '经营七区', manager: '张涛', managerTitle: '门店第一负责人', employeeId: '14430', mode: '2.0' },
      { id: 's158', name: '望京三店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营七区', region: '经营七区', manager: '张顺亮', managerTitle: '门店第一负责人', employeeId: '8022', mode: '2.0' },
      { id: 's159', name: '国贸二店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营七区', region: '经营七区', manager: '李胜欣', managerTitle: '门店第一负责人', employeeId: '11658', mode: '2.0' },
      { id: 's160', name: '右安门店', district: '丰台区', adminArea: '丰台区', bizArea: '经营七区', region: '经营七区', manager: '谢明丽', managerTitle: '门店第一负责人', employeeId: '14482', mode: '2.0' },
      { id: 's161', name: '灯市口店', district: '东城区', adminArea: '东城区', bizArea: '经营七区', region: '经营七区', manager: '薛九骞', managerTitle: '门店第一负责人', employeeId: '14108', mode: '2.0' },
      { id: 's162', name: '保福寺店', district: '海淀区', adminArea: '海淀区', bizArea: '经营七区', region: '经营七区', manager: '王慧', managerTitle: '门店第一负责人', employeeId: '5472', mode: '2.0' },
      { id: 's163', name: '常营二店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营七区', region: '经营七区', manager: '张阳莉', managerTitle: '门店第一负责人', employeeId: '9197', mode: '2.0' },
      { id: 's164', name: '丰台东大街店', district: '丰台区', adminArea: '丰台区', bizArea: '经营八区', region: '经营八区', manager: '高宁', managerTitle: '门店第一负责人', employeeId: '19616', mode: '2.0' },
      { id: 's165', name: '定福庄二店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营八区', region: '经营八区', manager: '甘宇环', managerTitle: '门店第一负责人', employeeId: '4346', mode: '2.0' },
      { id: 's166', name: '蒲黄榆店', district: '丰台区', adminArea: '丰台区', bizArea: '经营八区', region: '经营八区', manager: '郑光纪', managerTitle: '门店第一负责人', employeeId: '16986', mode: '2.0' },
      { id: 's167', name: '小屯路店', district: '丰台区', adminArea: '丰台区', bizArea: '经营八区', region: '经营八区', manager: '赵昌芹', managerTitle: '门店第一负责人', employeeId: '10703', mode: '2.0' },
      { id: 's168', name: '丰管路店', district: '丰台区', adminArea: '丰台区', bizArea: '经营八区', region: '经营八区', manager: '赵兴猛', managerTitle: '门店第一负责人', employeeId: '11200', mode: '2.0' },
      { id: 's169', name: '未来科技城店', district: '昌平区', adminArea: '昌平区', bizArea: '经营八区', region: '经营八区', manager: '韩相杰', managerTitle: '门店第一负责人', employeeId: '11000', mode: '2.0' },
      { id: 's170', name: '高米店北店', district: '大兴区', adminArea: '大兴区', bizArea: '经营八区', region: '经营八区', manager: '沈小君', managerTitle: '门店第一负责人', employeeId: '8708', mode: '2.0' },
      { id: 's171', name: '宣武门店', district: '西城区', adminArea: '西城区', bizArea: '经营八区', region: '经营八区', manager: '肖星', managerTitle: '门店第一负责人', employeeId: '11983', mode: '2.0' },
      { id: 's172', name: '生物医药基地店', district: '大兴区', adminArea: '大兴区', bizArea: '经营八区', region: '经营八区', manager: '刘超', managerTitle: '门店第一负责人', employeeId: '6212', mode: '2.0' },
      { id: 's173', name: '万源路店', district: '大兴区', adminArea: '大兴区', bizArea: '经营八区', region: '经营八区', manager: '张川', managerTitle: '门店第一负责人', employeeId: '9768', mode: '2.0' },
      { id: 's174', name: '双桥店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营八区', region: '经营八区', manager: '相小奇', managerTitle: '门店第一负责人', employeeId: '12337', mode: '2.0' },
      { id: 's175', name: '天宫院店', district: '大兴区', adminArea: '大兴区', bizArea: '经营八区', region: '经营八区', manager: '李晴', managerTitle: '门店第一负责人', employeeId: '14538', mode: '2.0' },
      { id: 's176', name: '增光路店', district: '海淀区', adminArea: '海淀区', bizArea: '经营八区', region: '经营八区', manager: '程娟', managerTitle: '门店第一负责人', employeeId: '7990', mode: '2.0' },
      { id: 's177', name: '健德门店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营八区', region: '经营八区', manager: '陈晓霞', managerTitle: '门店第一负责人', employeeId: '2091', mode: '2.0' },
      { id: 's178', name: '陶然亭店', district: '西城区', adminArea: '西城区', bizArea: '经营八区', region: '经营八区', manager: '蔡俊超', managerTitle: '门店第一负责人', employeeId: '14134', mode: '2.0' },
      { id: 's179', name: '新华大街店', district: '通州区', adminArea: '通州区', bizArea: '经营八区', region: '经营八区', manager: '苏嘉宁', managerTitle: '门店第一负责人', employeeId: '10607', mode: '2.0' },
      { id: 's180', name: '梨园店', district: '通州区', adminArea: '通州区', bizArea: '经营八区', region: '经营八区', manager: '王淑敏', managerTitle: '门店第一负责人', employeeId: '14778', mode: '2.0' },
      { id: 's181', name: '五棵松店', district: '海淀区', adminArea: '海淀区', bizArea: '经营九区', region: '经营九区', manager: '李英诚', managerTitle: '门店第一负责人', employeeId: '9955', mode: '2.5' },
      { id: 's182', name: '广安门店', district: '西城区', adminArea: '西城区', bizArea: '经营九区', region: '经营九区', manager: '陈晶', managerTitle: '门店第一负责人', employeeId: '8065', mode: '2.5' },
      { id: 's183', name: '五路居店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营九区', region: '经营九区', manager: '张国才', managerTitle: '门店第一负责人', employeeId: '11896', mode: '2.5' },
      { id: 's184', name: '三元桥店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营九区', region: '经营九区', manager: '孔令军', managerTitle: '门店第一负责人', employeeId: '5715', mode: '2.5' },
      { id: 's185', name: '南小街店', district: '大兴区', adminArea: '大兴区', bizArea: '经营九区', region: '经营九区', manager: '黄军恒', managerTitle: '门店第一负责人', employeeId: '11755', mode: '2.5' },
      { id: 's186', name: '黄寺店', district: '西城区', adminArea: '西城区', bizArea: '经营九区', region: '经营九区', manager: '王亚奇', managerTitle: '门店第一负责人', employeeId: '7019', mode: '2.0' },
      { id: 's187', name: '中关村店', district: '海淀区', adminArea: '海淀区', bizArea: '经营九区', region: '经营九区', manager: '钟伟栋', managerTitle: '门店第一负责人', employeeId: '7920', mode: '2.0' },
      { id: 's188', name: '望京店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营九区', region: '经营九区', manager: '吴章梅', managerTitle: '门店第一负责人', employeeId: '17218', mode: '2.0' },
      { id: 's189', name: '迪阳大厦店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营九区', region: '经营九区', manager: '李明光', managerTitle: '门店第一负责人', employeeId: '1421', mode: '2.0' },
      { id: 's190', name: '太阳宫店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营九区', region: '经营九区', manager: '王雪丽', managerTitle: '门店第一负责人', employeeId: '5237', mode: '2.0' },
      { id: 's191', name: '常营陆港城店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营九区', region: '经营九区', manager: '胡方辉', managerTitle: '门店第一负责人', employeeId: '15503', mode: '2.0' },
      { id: 's192', name: '昌发展万科店', district: '昌平区', adminArea: '昌平区', bizArea: '经营九区', region: '经营九区', manager: '段彦鹤', managerTitle: '门店第一负责人', employeeId: '10775', mode: '2.0' },
      { id: 's193', name: '北京北站店', district: '西城区', adminArea: '西城区', bizArea: '经营九区', region: '经营九区', manager: '王磊', managerTitle: '门店第一负责人', employeeId: '12824', mode: '2.0' },
      { id: 's194', name: '人民大学二店', district: '海淀区', adminArea: '海淀区', bizArea: '经营九区', region: '经营九区', manager: '赵少帅', managerTitle: '门店第一负责人', employeeId: '15863', mode: '2.0' },
      { id: 's195', name: '东中街店', district: '东城区', adminArea: '东城区', bizArea: '经营十区', region: '经营十区', manager: '周峰', managerTitle: '门店第一负责人', employeeId: '274', mode: '3.0' },
      { id: 's196', name: '郁花园店', district: '大兴区', adminArea: '大兴区', bizArea: '经营十区', region: '经营十区', manager: '李承兵', managerTitle: '门店第一负责人', employeeId: '2280', mode: '3.0' },
      { id: 's197', name: '十里堡店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营十区', region: '经营十区', manager: '董莹莹', managerTitle: '门店第一负责人', employeeId: '18797', mode: '3.0' },
      { id: 's198', name: '定福庄店', district: '朝阳区', adminArea: '朝阳区', bizArea: '经营十区', region: '经营十区', manager: '郭丰瑜', managerTitle: '门店第一负责人', employeeId: '12636', mode: '3.0' }
    ],
    users: [
      { id: 'u001', name: '管理员', role: '总部', area: '', storeId: '', store: '', phone: '13800000001' },
      { id: 'u002', name: '刘畅', role: '线上稽核', area: '', storeId: '', store: '', phone: '13800000002' },
      { id: 'u003', name: '马昕茹', role: '线上稽核', area: '', storeId: '', store: '', phone: '13800000003' },
      { id: 'u004', name: '陶畅', role: '线上稽核', area: '', storeId: '', store: '', phone: '13800000004' },
      { id: 'u005', name: '范晓明', role: '线下稽核', area: '', storeId: '', store: '', phone: '13800000005' },
      { id: 'u006', name: '钱磊', role: '线下稽核', area: '', storeId: '', store: '', phone: '13800000006' },
      { id: 'u007', name: '教练A', role: '区域教练', area: '经营一区', storeId: '', store: '', phone: '13800000007' },
      { id: 'u008', name: '教练B', role: '区域教练', area: '上海', storeId: '', store: '', phone: '13800000008' },
      { id: 'u009', name: '张三', role: '店长', area: '', storeId: 'FZ001', store: '方庄店', phone: '13800000009' },
      { id: 'u010', name: '李四', role: '店长', area: '', storeId: 'WJ001', store: '望京店', phone: '13800000010' },
      { id: 'u011', name: '王五', role: '店长', area: '', storeId: 'SLH001', store: '十里河店', phone: '13800000011' },
      { id: 'u012', name: '赵六', role: '店长', area: '', storeId: 'SH001', store: '上海徐汇店', phone: '13800000012' },
      { id: 'u013', name: '孙七', role: '店长', area: '', storeId: 'HD001', store: '海淀黄庄店', phone: '13800000013' },
      { id: 'u014', name: '周八', role: '店长', area: '', storeId: 'DC001', store: '东城王府井店', phone: '13800000014' },
      { id: 'u015', name: '侯兴宇', role: '总部', area: '', storeId: '', store: '', phone: '15081280260' },
      { id: 'u016', name: '客服小王', role: '客服', area: '', storeId: '', store: '', phone: '13800000016' },
      { id: 'u017', name: '营运李总', role: '营运', area: '', storeId: '', store: '', phone: '13800000017' }
    ],
    region_coaches: [
      { region: '经营一区', coach: '教练A', storeCount: 3 },
      { region: '经营二区', coach: '教练B', storeCount: 2 },
      { region: '经营三区', coach: '教练C', storeCount: 1 },
      { region: '上海', coach: '教练B', storeCount: 2 }
    ],
    penalties: [
      { id: 'p001', storeId: 'FZ001', store: '方庄店', region: '经营一区', district: '朝阳区', manager: '张三', eventDate: '2026-08-03', event: '未及时上传日清记录', category: '管理失职', level: '一级批评教育', source: '现场稽核', inspector: '范晓明', personName: '张三', personLevel: '一级批评教育', personType: '管理失职', penaltyPerson: '', penaltyManager: '', survey: '经查，门店未及时上传7月28日日清记录', suggestion: '通报批评，限期整改', policyRef: '新奖惩制度第3.1条', dutyPerson: '', dutyManager: '', dutyValue: '', dutyCoach: '', status: '待补填' },
      { id: 'p002', storeId: 'WJ001', store: '望京店', region: '经营一区', district: '朝阳区', manager: '李四', eventDate: '2026-08-05', event: '外卖平台差评未回复', category: '运营类', level: '二级书面警告', source: '线上差评', inspector: '刘畅', personName: '李四', personLevel: '二级书面警告', personType: '运营类', penaltyPerson: '200', penaltyManager: '100', survey: '顾客在外卖平台投诉卫生问题，门店未及时回复', suggestion: '书面警告，罚款200元', policyRef: '新奖惩制度第5.2条', dutyPerson: '李四', dutyManager: '李四', dutyValue: '200', dutyCoach: '', status: '已闭环' },
      { id: 'p003', storeId: 'SLH001', store: '十里河店', region: '经营二区', district: '朝阳区', manager: '王五', eventDate: '2026-08-10', event: '食品过期未下架', category: '食品安全', level: '三级降职降薪', source: '线下稽核', inspector: '钱磊', personName: '王五', personLevel: '三级降职降薪', personType: '食品安全', penaltyPerson: '取消当月奖金', penaltyManager: '取消当月奖金', survey: '巡检发现冷藏柜中有过期食材未及时处理', suggestion: '降职降薪，取消当月奖金', policyRef: '新奖惩制度第8.1条', dutyPerson: '王五', dutyManager: '王五', dutyValue: '取消当月奖金', dutyCoach: '教练A', status: '已闭环' },
      { id: 'p004', storeId: 'SH001', store: '上海徐汇店', region: '上海', district: '上海', manager: '赵六', eventDate: '2026-08-12', event: '员工旷工', category: '纪律类', level: '经济处罚', source: '店长上报', inspector: '赵六', personName: '员工A', personLevel: '经济处罚', personType: '纪律类', penaltyPerson: '100', penaltyManager: '', survey: '员工未经请假擅自离岗', suggestion: '经济处罚100元', policyRef: '新奖惩制度第1.2条', dutyPerson: '', dutyManager: '', dutyValue: '', dutyCoach: '', status: '超时' }
    ],
    complaints: [
      { id: 'c001', storeId: 'FZ001', store: '方庄店', date: '2026-08-01', meal: '午餐', content: '菜品太咸，服务态度差', opportunity: '口味标准化/服务培训', platform: '点评', responsible: '张三', responsibleTitle: '店长', dutyManager: '张三', status: '待处理', appealContent: '', appealResult: '' },
      { id: 'c002', storeId: 'WJ001', store: '望京店', date: '2026-08-03', meal: '晚餐', content: '等了40分钟才上菜', opportunity: '出餐速度优化', platform: '公众号', responsible: '李四', responsibleTitle: '店长', dutyManager: '李四', status: '待处理', appealContent: '', appealResult: '' },
      { id: 'c003', storeId: 'SLH001', store: '十里河店', date: '2026-08-05', meal: '早餐', content: '豆浆有异味', opportunity: '食品安全检查', platform: '点评', responsible: '王五', responsibleTitle: '店长', dutyManager: '王五', status: '已处理', appealContent: '', appealResult: '' },
      { id: 'c004', storeId: 'SH001', store: '上海徐汇店', date: '2026-08-07', meal: '午餐', content: '餐具不干净', opportunity: '清洗流程规范', platform: '点评', responsible: '赵六', responsibleTitle: '店长', dutyManager: '赵六', status: '待处理', appealContent: '', appealResult: '' },
      { id: 'c005', storeId: 'FZ001', store: '方庄店', date: '2026-08-08', meal: '晚餐', content: '外卖漏送菜品', opportunity: '外卖打包流程', platform: '点评', responsible: '打包员', responsibleTitle: '小时工', dutyManager: '张三', status: '已驳回', appealContent: '员工操作失误已处罚', appealResult: '驳回' }
    ],
    onlineRecords: [
      { id: 'o001', inspector: '刘畅', storeId: 'FZ001', store: '方庄店', date: '2026-08-01', content: '顾客差评：菜品味道偏咸' },
      { id: 'o002', inspector: '刘畅', storeId: 'WJ001', store: '望京店', date: '2026-08-02', content: '投诉出餐速度慢' }
    ],
    offlineRecords: [
      { id: 'of001', inspector: '范晓明', storeId: 'FZ001', store: '方庄店', date: '2026-08-03', score: 85, content: '后厨卫生扣5分；食材存放扣10分' },
      { id: 'of002', inspector: '钱磊', storeId: 'SLH001', store: '十里河店', date: '2026-08-06', score: 72, content: '食品过期扣15分；服务态度扣8分；环境扣5分' }
    ]
  },

  /* ---- 字段名转换工具（camelCase ↔ snake_case） ---- */
  _toSnake(str) {
    return str.replace(/[A-Z]/g, function(m) { return '_' + m.toLowerCase(); });
  },
  _toCamel(str) {
    return str.replace(/_([a-z])/g, function(m, c) { return c.toUpperCase(); });
  },
  _camelRow(row) {
    if (!row) return row;
    var out = {};
    for (var k in row) {
      if (row.hasOwnProperty(k)) out[this._toCamel(k)] = row[k];
    }
    return out;
  },
  _snakeRow(row) {
    if (!row) return row;
    var out = {};
    for (var k in row) {
      if (row.hasOwnProperty(k)) out[this._toSnake(k)] = row[k];
    }
    return out;
  },
  _camelList(list) {
    var self = this;
    return list.map(function(r) { return self._camelRow(r); });
  },
  _snakeList(list) {
    var self = this;
    return list.map(function(r) { return self._snakeRow(r); });
  },

  /* ---- 表名映射 ---- */
  tables: ['stores', 'users', 'region_coaches', 'penalties', 'complaints', 'online_records', 'offline_records', 'daily_reports', 'inspection_templates', 'inspection_results', 'inspection_issues'],

  /* ---- 权限矩阵 ---- */
  Permissions: {
    matrix: {
      '总部':     { inspection: true, daily: true, penalty: true, complaint: true, notice: true, dashboard: true, task: true },
      '线上稽核': { inspection: true, inspection_edit: true, daily: true, penalty: false, complaint: false, notice: true, dashboard: false, task: true },
      '线下稽核': { inspection: true, inspection_edit: true, daily: true, penalty: false, complaint: false, notice: true, dashboard: false, task: true },
      '稽核员':   { inspection: true, inspection_edit: true, daily: true, penalty: false, complaint: false, notice: true, dashboard: false, task: true },
      '客服':     { inspection: true, daily: true, penalty: true, complaint: true, notice: true, dashboard: true, task: true },
      '营运':     { inspection: true, daily: false, penalty: true, complaint: true, notice: true, dashboard: true, task: true },
      '店长':     { inspection: true, daily: false, penalty: true, complaint: true, notice: true, dashboard: false, task: true },
      '区域教练': { inspection: true, daily: true, penalty: true, complaint: true, notice: true, dashboard: true, task: true },
      '稽核':     { inspection: true, inspection_edit: true, daily: true, penalty: true, complaint: true, notice: true, dashboard: true, task: true },
      'admin':   { inspection: true, daily: true, penalty: true, complaint: true, notice: true, dashboard: true, task: true }
    },
    canAccess: function(role, module) {
      var perm = this.matrix[role];
      if (!perm) return false;
      return perm[module] === true;
    },
    roleNames: {
      '总部': '总部管理员', '线上稽核': '线上稽核员', '线下稽核': '线下稽核员', '稽核员': '稽核员',
      '客服': '客服', '营运': '营运', '区域教练': '区域教练', '店长': '店长', 'admin': '预览模式'
    },
    roleBadgeColors: {
      '总部': '#c41a1a', '线上稽核': '#2563eb', '线下稽核': '#7c3aed', '稽核员': '#2563eb',
      '客服': '#059669', '营运': '#d97706', '区域教练': '#d97706', '店长': '#059669', 'admin': '#6b7280'
    }
  },

  /* ==================== 初始化 ==================== */
  async init() {
    // 初始化 Supabase 客户端
    if (typeof supabase !== 'undefined') {
      this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // 立即渲染页面，不等待网络数据
    this.bindHashChange();
    this.bindTabBar();
    this.checkLogin();

    // 后台加载数据，完成后自动刷新当前页面
    var self = this;
    setTimeout(async function() {
      try {
        var dataPromise = self.initData();
        var timeout = new Promise(function(_, reject) {
          setTimeout(function() { reject(new Error('timeout')); }, 8000);
        });
        await Promise.race([dataPromise, timeout]);
      } catch (e) {
        console.warn('[App] 数据加载超时，使用本地缓存:', e.message);
        if (!self.dataReady) self.initLocalFallback();
      }
      // 数据就绪后刷新当前页面
      var hash = (location.hash || '#home').replace('#', '');
      if (Pages && Pages[hash]) Pages[hash]();
    }, 100);
  },

  /* 首次使用种子数据到 Supabase；已有数据则直接加载 */
  async initData() {
    if (!this.supabase) {
      this.initLocalFallback();
      return;
    }

    try {
      for (var t = 0; t < this.tables.length; t++) {
        var table = this.tables[t];
        if (this.seedData[table] && this.seedData[table].length > 0) {
          var { count } = await this.supabase.from(table).select('*', { count: 'exact', head: true });
          if (count === 0) {
            // 写入 Supabase 时转 snake_case
            await this.supabase.from(table).insert(this._snakeList(this.seedData[table]));
          }
        }
      }
      console.log('[Supabase] 种子数据初始化完成');
      await this.loadAll();
      this.dataReady = true;
    } catch (e) {
      console.warn('[Supabase] 连接失败，回退 localStorage:', e.message);
      this.initLocalFallback();
    }
  },

  /* Supabase 不可用时回退 localStorage */
  initLocalFallback() {
    if (!localStorage.getItem('nanchengxiang_stores')) {
      localStorage.setItem('nanchengxiang_stores', JSON.stringify(this.seedData.stores));
      localStorage.setItem('nanchengxiang_users', JSON.stringify(this.seedData.users));
      localStorage.setItem('nanchengxiang_region_coaches', JSON.stringify(this.seedData.region_coaches));
      localStorage.setItem('nanchengxiang_penalties', JSON.stringify(this.seedData.penalties));
      localStorage.setItem('nanchengxiang_complaints', JSON.stringify(this.seedData.complaints));
      localStorage.setItem('nanchengxiang_online_records', JSON.stringify(this.seedData.online_records));
      localStorage.setItem('nanchengxiang_offline_records', JSON.stringify(this.seedData.offline_records));
      localStorage.setItem('nanchengxiang_daily_reports', JSON.stringify(this.seedData.daily_reports));
    }
    this.dataCache.stores = JSON.parse(localStorage.getItem('nanchengxiang_stores') || '[]');
    this.dataCache.users = JSON.parse(localStorage.getItem('nanchengxiang_users') || '[]');
    this.dataCache.region_coaches = JSON.parse(localStorage.getItem('nanchengxiang_region_coaches') || '[]');
    this.dataCache.penalties = JSON.parse(localStorage.getItem('nanchengxiang_penalties') || '[]');
    this.dataCache.complaints = JSON.parse(localStorage.getItem('nanchengxiang_complaints') || '[]');
    this.dataCache.online_records = JSON.parse(localStorage.getItem('nanchengxiang_online_records') || '[]');
    this.dataCache.offline_records = JSON.parse(localStorage.getItem('nanchengxiang_offline_records') || '[]');
    this.dataCache.daily_reports = JSON.parse(localStorage.getItem('nanchengxiang_daily_reports') || '[]');
    this.dataCache.notices = JSON.parse(localStorage.getItem('nanchengxiang_notices') || '[]');
    var localTemplates = localStorage.getItem('nanchengxiang_inspection_templates');
    if (localTemplates) { try { this.dataCache.inspection_templates = JSON.parse(localTemplates); } catch(e) {} }
    var localResults = localStorage.getItem('nanchengxiang_inspection_results');
    if (localResults) { try { this.dataCache.inspection_results = JSON.parse(localResults); } catch(e) {} }
    var localIssues = localStorage.getItem('nanchengxiang_inspection_issues');
    if (localIssues) { try { this.dataCache.inspection_issues = JSON.parse(localIssues); } catch(e) {} }
    this.dataReady = true;
  },

  /* 从 Supabase 加载全部数据到缓存 */
  async loadAll() {
    var tasks = [];
    for (var t = 0; t < this.tables.length; t++) {
      tasks.push(this._loadTable(this.tables[t]));
    }
    await Promise.all(tasks);
    this.dataReady = true;
  },

  async _loadTable(table) {
    var allRows = [];
    var from = 0;
    var limit = 1000;
    while (true) {
      var { data, error } = await this.supabase.from(table).select('*').range(from, from + limit - 1);
      if (error) { console.error('[Supabase] load ' + table + ':', error.message); break; }
      if (!data || data.length === 0) break;
      // Supabase 返回 snake_case，转 camelCase 存入缓存
      allRows = allRows.concat(this._camelList(data));
      if (data.length < limit) break;
      from += limit;
    }
    this.dataCache[table] = allRows;
    // Supabase 返回空时用 localStorage 兜底
    if (allRows.length === 0) {
      var localData = localStorage.getItem('nanchengxiang_' + table);
      if (localData) {
        try { this.dataCache[table] = JSON.parse(localData); } catch (e) {}
      }
    }
  },

  /* 页面切换时刷新缓存（获取最新数据） */
  async refreshData() {
    if (this.supabase && this.dataReady) {
      try {
        await this.loadAll();
      } catch (e) { /* 保持旧缓存 */ }
    }
  },

  /* ==================== 数据存取（兼容旧接口） ==================== */
  getStores()          { return this.dataCache.stores || []; },
  getUsers()           { return this.dataCache.users || []; },
  getPenalties()       { return this.dataCache.penalties || []; },
  getComplaints()      { return this.dataCache.complaints || []; },
  getOnlineRecords()   { return this.dataCache.online_records || []; },
  getOfflineRecords()  { return this.dataCache.offline_records || []; },
  getRegionCoaches()   { return this.dataCache.region_coaches || []; },
  getDailyReports()   { return this.dataCache.daily_reports || []; },
  getTemplates()      { return this.dataCache.inspection_templates || []; },
  getResults()        { return this.dataCache.inspection_results || []; },
  getIssues()         { return this.dataCache.inspection_issues || []; },

  async saveDailyReports(data) {
    this.dataCache.daily_reports = data;
    localStorage.setItem('nanchengxiang_daily_reports', JSON.stringify(data));
    if (this.supabase) {
      await this.supabase.from('daily_reports').delete().neq('id', '__none__');
      if (data.length > 0) await this.supabase.from('daily_reports').insert(this._snakeList(data));
    }
  },
  async saveTemplates(data) {
    this.dataCache.inspection_templates = data;
    localStorage.setItem('nanchengxiang_inspection_templates', JSON.stringify(data));
    if (this.supabase) {
      await this.supabase.from('inspection_templates').delete().neq('id','__none__');
      if (data.length > 0) await this.supabase.from('inspection_templates').insert(this._snakeList(data));
    }
  },
  async saveResults(data) {
    this.dataCache.inspection_results = data;
    localStorage.setItem('nanchengxiang_inspection_results', JSON.stringify(data));
    if (this.supabase) {
      await this.supabase.from('inspection_results').delete().neq('id','__none__');
      if (data.length > 0) await this.supabase.from('inspection_results').insert(this._snakeList(data));
    }
  },
  async saveIssues(data) {
    this.dataCache.inspection_issues = data;
    localStorage.setItem('nanchengxiang_inspection_issues', JSON.stringify(data));
    if (this.supabase) {
      await this.supabase.from('inspection_issues').delete().neq('id','__none__');
      if (data.length > 0) await this.supabase.from('inspection_issues').insert(this._snakeList(data));
    }
  },

  async savePenalties(data) {
    this.dataCache.penalties = data;
    localStorage.setItem('nanchengxiang_penalties', JSON.stringify(data));
    if (this.supabase) {
      await this.supabase.from('penalties').delete().neq('id', '__none__');
      if (data.length > 0) await this.supabase.from('penalties').insert(this._snakeList(data));
    }
  },
  async saveComplaints(data) {
    this.dataCache.complaints = data;
    localStorage.setItem('nanchengxiang_complaints', JSON.stringify(data));
    if (this.supabase) {
      await this.supabase.from('complaints').delete().neq('id', '__none__');
      if (data.length > 0) await this.supabase.from('complaints').insert(this._snakeList(data));
    }
  },
  async saveOnlineRecords(data) {
    this.dataCache.online_records = data;
    localStorage.setItem('nanchengxiang_online_records', JSON.stringify(data));
    if (this.supabase) {
      await this.supabase.from('online_records').delete().neq('id', '__none__');
      if (data.length > 0) await this.supabase.from('online_records').insert(this._snakeList(data));
    }
  },
  async saveOfflineRecords(data) {
    this.dataCache.offline_records = data;
    localStorage.setItem('nanchengxiang_offline_records', JSON.stringify(data));
    if (this.supabase) {
      await this.supabase.from('offline_records').delete().neq('id', '__none__');
      if (data.length > 0) await this.supabase.from('offline_records').insert(this._snakeList(data));
    }
  },
  async saveUsers(data) {
    this.dataCache.users = data;
    localStorage.setItem('nanchengxiang_users', JSON.stringify(data));
    if (this.supabase) {
      try {
        await this.supabase.from('users').delete().neq('id', '__none__');
        if (data.length > 0) await this.supabase.from('users').insert(this._snakeList(data));
      } catch (e) {
        console.warn('[Supabase] saveUsers 失败，保留 localStorage 数据:', e.message);
      }
    }
  },

  /* 单用户增删改 */
  async addUser(user) {
    var users = this.getUsers();
    user.id = user.id || 'u' + Date.now();
    users.push(user);
    await this.saveUsers(users);
    this.toast(user.name + ' 已添加');
  },
  async updateUser(id, updates) {
    var users = this.getUsers();
    var idx = users.findIndex(function(u) { return u.id === id; });
    if (idx === -1) return;
    for (var k in updates) { if (updates.hasOwnProperty(k)) users[idx][k] = updates[k]; }
    await this.saveUsers(users);
    this.toast((updates.name || '用户') + ' 已更新');
  },
  async deleteUser(id) {
    var users = this.getUsers();
    var user = users.find(function(u) { return u.id === id; });
    if (!user) return;
    var name = user.name;
    var filtered = users.filter(function(u) { return u.id !== id; });
    await this.saveUsers(filtered);
    this.toast(name + ' 已删除');
  },
  async saveStores(data) {
    this.dataCache.stores = data;
    localStorage.setItem('nanchengxiang_stores', JSON.stringify(data));
    if (this.supabase) {
      await this.supabase.from('stores').delete().neq('id', '__none__');
      if (data.length > 0) await this.supabase.from('stores').insert(this._snakeList(data));
    }
  },

  /* ==================== 路由 ==================== */
  bindHashChange() {
    window.addEventListener('hashchange', () => this.route());
    this.route();
  },

  async route() {
    var hash = location.hash.replace('#', '') || 'login';
    this.currentHash = hash;

    if (!this.currentUser && hash !== 'login') {
      location.hash = '#login';
      return;
    }

    // 页面切换时刷新数据
    if (hash !== 'login') {
      await this.refreshData();
    }

    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });

    var page = document.getElementById('page-' + hash);
    if (page) {
      page.classList.add('active');
      if (typeof Pages !== 'undefined' && Pages[hash]) {
        Pages[hash]();
      }
    }

    var tabPages = ['home', 'inspection', 'penalty', 'complaint', 'dashboard', 'template', 'daily', 'task', 'inspectionTemplates', 'inspectionFill', 'inspectionResults', 'inspectionIssues', 'inspectionDashboard'];
    document.querySelectorAll('.tab-item').forEach(function(t) {
      t.classList.toggle('active', t.dataset.page === hash);
    });

    var tabbar = document.getElementById('tabbar');
    tabbar.style.display = (hash === 'login' || hash === 'offline-inspect' || hash === 'admin') ? 'none' : 'flex';

    // 按角色权限过滤底部Tab栏（2026-08-06部署修复）
    // 权限过滤 Tab 栏
    if (this.currentUser) {
      var role = this.currentUser.role;
      var self = this;
      var pageToModule = { 'inspection': 'inspection', 'daily': 'daily', 'penalty': 'penalty',
                           'complaint': 'complaint', 'template': 'notice', 'task': 'task', 'dashboard': 'dashboard',
                           'inspectionTemplates': 'inspection', 'inspectionFill': 'inspection_edit',
                           'inspectionResults': 'inspection', 'inspectionIssues': 'inspection',
                           'inspectionDashboard': 'inspection' };
      document.querySelectorAll('.tab-item').forEach(function(t) {
        var page = t.dataset.page;
        var module = pageToModule[page];
        if (!module) return;
        t.style.display = self.Permissions.canAccess(role, module) ? '' : 'none';
      });
    }

    var titleMap = {
      login: '南城香协作终端', home: '首页', inspection: '门店检查', 'offline-inspect': '线下门店检查',
      penalty: '处罚登记', complaint: '差评申诉', dashboard: '领导看板', template: '通知模板', admin: '数据管理',
      daily: '稽核日报', task: '任务发布',
      inspectionTemplates: '稽核模板', inspectionFill: '稽核检查',
      inspectionResults: '检查结果', inspectionIssues: '问题工单', inspectionDashboard: '稽核看板'
    };
    document.getElementById('header-title').textContent = titleMap[hash] || '';
    document.getElementById('header-back').style.display = (hash === 'login') ? 'none' : 'block';
  },

  bindTabBar() {
    document.querySelectorAll('.tab-item').forEach(function(tab) {
      tab.addEventListener('click', function() {
        location.hash = '#' + tab.dataset.page;
      });
    });
  },

  navigate(page) {
    location.hash = '#' + page;
  },

  /* ==================== 登录 ==================== */
  checkLogin() {
    var saved = localStorage.getItem('nanchengxiang_current_user');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      location.hash = '#home';
    } else {
      location.hash = '#login';
    }
  },

  login(userId) {
    var users = this.getUsers();
    var user = users.find(function(u) { return u.id === userId; });
    if (!user) return false;
    this.currentUser = user;
    localStorage.setItem('nanchengxiang_current_user', JSON.stringify(user));
    return true;
  },

  quickLogin() {
    this.currentUser = { id: 'admin', name: '预览模式', role: 'admin', area: '总部', storeId: '', store: '' };
    localStorage.setItem('nanchengxiang_current_user', JSON.stringify(this.currentUser));
    localStorage.setItem('nanchengxiang_preview_mode', '1');
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('nanchengxiang_current_user');
    location.hash = '#login';
  },

  /* ==================== Toast ==================== */
  toast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(function() { el.classList.remove('show'); }, 2000);
  },

  /* ==================== XLS 下载模板 ==================== */
  downloadTemplate(type) {
    var headers, sample;
    if (type === 'users') {
      headers = ['id','name','role','area','storeId','store','phone'];
      sample = ['u099','测试员工','店长','经营一区','FZ001','方庄店','13800000099'];
    } else {
      headers = ['id','name','district','adminArea','bizArea','region','manager','managerTitle','mode'];
      sample = ['S099','测试门店','朝阳区','朝阳区','经营一区','经营一区','张三','门店第一负责人','2.0'];
    }
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table>';
    html += '<tr>' + headers.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr>';
    html += '<tr>' + sample.map(function(c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
    html += '</table></body></html>';
    var blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = type + '_template.xls';
    a.click();
  },

  /* ==================== XLS 导入 ==================== */
  importXLS(input, type) {
    var self = this;
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = async function(e) {
      var data = new Uint8Array(e.target.result);
      var wb = XLSX.read(data, { type: 'array' });
      var sheet = wb.Sheets[wb.SheetNames[0]];
      var rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      if (rows.length < 2) { self.toast('文件为空或缺少表头'); return; }
      var headers = rows[0].map(function(h) { return String(h).trim(); });
      var count = 0;
      var dataRows = rows.slice(1);

      if (type === 'users') {
        var users = self.getUsers();
        var existingIds = {};
        users.forEach(function(u) { existingIds[u.id] = true; });
        for (var i = 0; i < dataRows.length; i++) {
          var cols = dataRows[i];
          var row = {};
          for (var j = 0; j < headers.length; j++) {
            row[headers[j]] = String(cols[j] || '').trim();
          }
          if (!row.id || !row.name) continue;
          if (existingIds[row.id]) continue;
          users.push({ id: row.id, name: row.name, role: row.role || '店长', phone: row.phone || '', area: row.area || '', storeId: row.storeId || '', store: row.store || '' });
          existingIds[row.id] = true;
          count++;
        }
        await self.saveUsers(users);
      } else if (type === 'stores') {
        var stores = self.getStores();
        var existingStoreIds = {};
        stores.forEach(function(s) { existingStoreIds[s.id] = true; });
        for (var i = 0; i < dataRows.length; i++) {
          var cols = dataRows[i];
          var row = {};
          for (var j = 0; j < headers.length; j++) {
            row[headers[j]] = String(cols[j] || '').trim();
          }
          if (!row.id || !row.name) continue;
          if (existingStoreIds[row.id]) continue;
          stores.push({
            id: row.id, name: row.name, district: row.district || '', adminArea: row.adminArea || '',
            bizArea: row.bizArea || '', region: row.region || '', manager: row.manager || '',
            managerTitle: row.managerTitle || '', mode: row.mode || ''
          });
          existingStoreIds[row.id] = true;
          count++;
        }
        await self.saveStores(stores);
      }
      self.toast('成功导入 ' + count + ' 条数据');
      input.value = '';
    };
    reader.readAsArrayBuffer(file);
  },

  /* ==================== XLS 导出 ==================== */
  exportXLS(type) {
    var data, headers;
    if (type === 'penalties') {
      data = this.getPenalties();
      headers = ['id', 'storeId', 'store', 'region', 'district', 'manager', 'eventDate', 'event', 'category', 'level', 'source', 'inspector', 'personName', 'personLevel', 'personType', 'penaltyPerson', 'penaltyManager', 'survey', 'suggestion', 'policyRef', 'dutyPerson', 'dutyManager', 'dutyValue', 'dutyCoach', 'status'];
    } else if (type === 'complaints') {
      data = this.getComplaints();
      headers = ['id', 'storeId', 'store', 'date', 'meal', 'content', 'opportunity', 'platform', 'responsible', 'responsibleTitle', 'dutyManager', 'status', 'appealContent', 'appealResult'];
    } else if (type === 'users') {
      data = this.getUsers();
      headers = ['id', 'name', 'role', 'area', 'storeId', 'store', 'phone'];
    } else if (type === 'daily_reports') {
      data = [];
      var reports = this.getDailyReports();
      reports.forEach(function(r) {
        (r.items || []).forEach(function(item) {
          data.push({
            id: r.id, inspector: r.inspector, date: r.date, type: r.type,
            store: item.store, score: item.score, findings: item.findings
          });
        });
      });
      headers = ['id', 'inspector', 'date', 'type', 'store', 'score', 'findings'];
    } else {
      var stores = this.getStores();
      var penalties = this.getPenalties();
      var complaints = this.getComplaints();
      data = stores.map(function(s) {
        var storePenalties = penalties.filter(function(p) { return p.storeId === s.id; });
        var done = storePenalties.filter(function(p) { return p.status === '已闭环'; }).length;
        var storeComplaints = complaints.filter(function(c) { return c.storeId === s.id; });
        var passed = storeComplaints.filter(function(c) { return c.status === '已申诉' && c.appealResult === '通过'; }).length;
        return {
          storeId: s.id, store: s.name, district: s.district, region: s.region,
          manager: s.manager, mode: s.mode,
          totalPenalties: storePenalties.length, closedPenalties: done,
          totalComplaints: storeComplaints.length, passedAppeals: passed
        };
      });
      headers = ['storeId', 'store', 'district', 'region', 'manager', 'mode', 'totalPenalties', 'closedPenalties', 'totalComplaints', 'passedAppeals'];
    }
    var rows = [headers];
    data.forEach(function(row) {
      var vals = headers.map(function(h) {
        return row[h] !== undefined ? row[h] : '';
      });
      rows.push(vals);
    });
    var ws = XLSX.utils.aoa_to_sheet(rows);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    var blob = new Blob([wbout], { type: 'application/vnd.ms-excel' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    var now = new Date();
    a.download = type + '_' + now.getFullYear() + ('0'+(now.getMonth()+1)).slice(-2) + ('0'+now.getDate()).slice(-2) + '.xls';
    a.click();
    this.toast('导出成功');
  },

  /* ==================== 可搜索门店选择器 ==================== */

  // 渲染可搜索选择器HTML
  renderStoreSelect(id, stores, selectedValue, placeholder) {
    placeholder = placeholder || '输入门店名称搜索...';
    selectedValue = selectedValue || '';
    var sel = stores.find(function(s) { return s.id === selectedValue; });
    var display = sel ? (sel.id + '  ' + sel.name) : '';
    var h = '<div class="search-select" id="' + id + '">';
    h += '<input type="text" class="search-select-input" value="' + this._esc(display) + '" placeholder="' + this._esc(placeholder) + '" autocomplete="off" data-selected="' + this._esc(selectedValue) + '">';
    h += '<div class="search-select-dropdown" style="display:none"></div>';
    h += '</div>';
    return h;
  },

  // 初始化可搜索选择器（页面渲染后调用）
  initStoreSelect(id, stores, onSelect) {
    var self = this;
    var container = document.getElementById(id);
    if (!container) return;
    var input = container.querySelector('.search-select-input');
    var dropdown = container.querySelector('.search-select-dropdown');
    if (!input || !dropdown) return;

    var filterTimer;
    function filter(keyword) {
      var kw = (keyword || '').toLowerCase().trim();
      if (!kw) {
        // 清空时展示全部（最多50条，提高性能）
        kw = '';
      }
      var filtered = stores.filter(function(s) {
        return s.name.toLowerCase().indexOf(kw) >= 0 ||
               s.id.toLowerCase().indexOf(kw) >= 0 ||
               s.district.toLowerCase().indexOf(kw) >= 0 ||
               s.region.toLowerCase().indexOf(kw) >= 0 ||
               (s.manager && s.manager.toLowerCase().indexOf(kw) >= 0);
      });
      // 超过50条只显示前50
      var total = filtered.length;
      if (total > 50) filtered = filtered.slice(0, 50);
      if (filtered.length === 0) {
        dropdown.innerHTML = '<div class="search-select-empty">无匹配门店</div>';
      } else {
        var html = '';
        if (total > 50) {
          html += '<div class="search-select-hint">显示前50条，共' + total + '条，请继续输入缩小范围</div>';
        }
        filtered.forEach(function(s) {
          html += '<div class="search-select-item" data-id="' + self._esc(s.id) + '" data-name="' + self._esc(s.name) + '">';
          html += '<span class="ssi-id">' + self._esc(s.id) + '</span>';
          html += '<span class="ssi-name">' + self._esc(s.name) + '</span>';
          html += '<span class="ssi-meta">' + self._esc(s.district + ' · ' + s.region) + '</span>';
          html += '</div>';
        });
        dropdown.innerHTML = html;

        // 绑定点击
        dropdown.querySelectorAll('.search-select-item').forEach(function(item) {
          item.addEventListener('mousedown', function(e) {
            e.preventDefault();
            var sid = item.dataset.id;
            var sname = item.dataset.name;
            input.value = sid + '  ' + sname;
            input.dataset.selected = sid;
            dropdown.style.display = 'none';
            self._markStoreSelectValid(container, true);
            if (onSelect) onSelect(sid, sname);
          });
        });
      }
      dropdown.style.display = 'block';
    }

    input.addEventListener('focus', function() {
      // 聚焦时如果已有选中值，清空输入框方便重新搜索
      if (input.dataset.selected) {
        input.value = '';
      }
      filter(input.value);
    });

    input.addEventListener('input', function() {
      clearTimeout(filterTimer);
      filterTimer = setTimeout(function() { filter(input.value); }, 150);
    });

    // 点击外部关闭
    document.addEventListener('click', function(e) {
      if (!container.contains(e.target)) {
        dropdown.style.display = 'none';
        // 如果未选中有效值，恢复之前选中的显示
        if (!input.dataset.selected && stores.length > 0) {
          var prev = stores.find(function(s) { return s.id === input.dataset.selected; });
          if (!prev) {
            input.value = '';
            self._markStoreSelectValid(container, false);
          }
        } else if (input.dataset.selected) {
          var sel = stores.find(function(s) { return s.id === input.dataset.selected; });
          if (sel) {
            input.value = sel.id + '  ' + sel.name;
          }
        }
        // 如果input为空，标记无效
        if (!input.dataset.selected || !input.value.trim()) {
          self._markStoreSelectValid(container, false);
        }
      }
    });

    // 初始状态：如果有默认值，显示
    if (selectedValue) {
      container.classList.add('selected');
    }
  },

  // 获取可搜索选择器的选中值
  getStoreSelectValue(id) {
    var input = document.querySelector('#' + id + ' .search-select-input');
    return input ? input.dataset.selected || '' : '';
  },

  // 重置选择器
  resetStoreSelect(id) {
    var container = document.getElementById(id);
    if (!container) return;
    var input = container.querySelector('.search-select-input');
    if (input) {
      input.value = '';
      input.dataset.selected = '';
    }
    container.classList.remove('selected');
  },

  // 标记选择器状态（有效/无效样式）
  _markStoreSelectValid(container, valid) {
    if (valid) {
      container.classList.add('selected');
      container.classList.remove('invalid');
    } else {
      container.classList.remove('selected');
      if (!container.querySelector('.search-select-input').value.trim()) {
        container.classList.remove('invalid');
      }
    }
  },

  // HTML转义
  _esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

  /* 启动 */
document.addEventListener('DOMContentLoaded', function() { App.init(); });
