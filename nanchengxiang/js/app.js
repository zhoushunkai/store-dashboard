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
      { id: 's001', name: '控江路店', district: '上海', adminArea: '上海', bizArea: '经营一区', region: '上海', manager: '徐常青', managerTitle: '门店第一负责人', employeeId: '2283', mode: '3.0' },
      { id: 's002', name: '内江路店', district: '上海', adminArea: '上海', bizArea: '经营二区', region: '上海', manager: '段琳阁', managerTitle: '门店第一负责人', employeeId: '15841', mode: '3.0' },
      { id: 's003', name: '打浦路店', district: '上海', adminArea: '上海', bizArea: '经营三区', region: '上海', manager: '刘中骞', managerTitle: '门店第一负责人', employeeId: '2073', mode: '3.0' },
      { id: 's004', name: '江苏路店', district: '上海', adminArea: '上海', bizArea: '经营四区', region: '上海', manager: '陈高峰', managerTitle: '门店第一负责人', employeeId: '12199', mode: '3.0' },
      { id: 's005', name: '万航渡路店', district: '上海', adminArea: '上海', bizArea: '经营五区', region: '上海', manager: '区域直管', managerTitle: '', employeeId: '', mode: '3.0' },
      { id: 's006', name: '汇融天地店', district: '上海', adminArea: '上海', bizArea: '经营六区', region: '上海', manager: '关晓亮', managerTitle: '储备店长', employeeId: '25145', mode: '3.0' },
      { id: 's007', name: '迎春路店', district: '上海', adminArea: '上海', bizArea: '经营七店', region: '上海', manager: '吴冠旺', managerTitle: '储备店长', employeeId: '25211', mode: '3.0' },
      { id: 's008', name: '赵公口店', district: '丰台区', adminArea: '丰台区', bizArea: '经营八区', region: '训练店', manager: '胡敬花', managerTitle: '门店第一负责人', employeeId: '338', mode: '2.0' },
      { id: 's009', name: '广渠门店', district: '东城区', adminArea: '东城区', bizArea: '经营九区', region: '训练店', manager: '马雨欣', managerTitle: '门店第一负责人', employeeId: '12460', mode: '3.0' },
      { id: 's010', name: '枣园地铁店', district: '大兴区', adminArea: '大兴区', bizArea: '经营十区', region: '训练店', manager: '朱澳洋', managerTitle: '门店第一负责人', employeeId: '5851', mode: '3.0' },
      { id: 's011', name: '天慧广场店', district: '大兴区', adminArea: '大兴区', bizArea: '训练店', region: '训练店', manager: '鲁临双', managerTitle: '门店第一负责人', employeeId: '12366', mode: '3.0' },
      { id: 's012', name: '安慧北里店', district: '朝阳区', adminArea: '朝阳区', bizArea: '上海', region: '训练店', manager: '苏丽莉', managerTitle: '门店第一负责人', employeeId: '8799', mode: '3.0' },
      { id: 's013', name: '潘家园店', district: '朝阳区', adminArea: '朝阳区', bizArea: '总数', region: '训练店', manager: '王彩雪', managerTitle: '门店第一负责人', employeeId: '306', mode: '2.5' },
      { id: 's014', name: '前进花园店', district: '顺义区', adminArea: '顺义区', bizArea: '事业管理室：邹安定、王同斌（兼），陈贵安      【 2.0程帅威、3.0陈秋】', region: '经营一区', manager: '李海波', managerTitle: '门店第一负责人', employeeId: '16259', mode: '2.0' },
      { id: 's015', name: '顺义站前南街店', district: '顺义区', adminArea: '顺义区', bizArea: '', region: '经营一区', manager: '赵涛', managerTitle: '门店第一负责人', employeeId: '7852', mode: '2.0' },
      { id: 's016', name: '建新东街店', district: '顺义区', adminArea: '顺义区', bizArea: '', region: '经营一区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's017', name: '和平东桥店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营一区', manager: '刘喜梅', managerTitle: '门店第一负责人', employeeId: '1977', mode: '2.0' },
      { id: 's018', name: '和平街店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营一区', manager: '刘明花', managerTitle: '门店第一负责人', employeeId: '2567', mode: '2.0' },
      { id: 's019', name: '红军营店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营一区', manager: '尚敏敏', managerTitle: '门店第一负责人', employeeId: '1998', mode: '2.0' },
      { id: 's020', name: '秋实路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营一区', manager: '张开琴', managerTitle: '门店第一负责人', employeeId: '1784', mode: '2.0' },
      { id: 's021', name: '小关北里店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营一区', manager: '于静', managerTitle: '门店第一负责人', employeeId: '9168', mode: '2.0' },
      { id: 's022', name: '小营路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营一区', manager: '王丽娜', managerTitle: '门店第一负责人', employeeId: '29', mode: '2.0' },
      { id: 's023', name: '天通东苑店', district: '昌平区', adminArea: '昌平区', bizArea: '', region: '经营一区', manager: '周孟君', managerTitle: '门店第一负责人', employeeId: '292', mode: '2.0' },
      { id: 's024', name: '天通西苑店', district: '昌平区', adminArea: '昌平区', bizArea: '', region: '经营一区', manager: '张然', managerTitle: '门店第一负责人', employeeId: '757', mode: '2.0' },
      { id: 's025', name: '西三旗店', district: '昌平区', adminArea: '昌平区', bizArea: '', region: '经营一区', manager: '王俊丽', managerTitle: '门店第一负责人', employeeId: '2511', mode: '2.0' },
      { id: 's026', name: '回龙观东大街店', district: '昌平区', adminArea: '昌平区', bizArea: '', region: '经营一区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.5' },
      { id: 's027', name: '昌平南环路店', district: '昌平区', adminArea: '昌平区', bizArea: '', region: '经营一区', manager: '朱翠翠', managerTitle: '门店第一负责人', employeeId: '12345', mode: '2.0' },
      { id: 's028', name: '温都水城店', district: '昌平区', adminArea: '昌平区', bizArea: '', region: '经营一区', manager: '刘丽', managerTitle: '门店第一负责人', employeeId: '1771', mode: '2.0' },
      { id: 's029', name: '回龙观风雅园店', district: '昌平区', adminArea: '昌平区', bizArea: '', region: '经营一区', manager: '任立志', managerTitle: '门店第一负责人', employeeId: '1631', mode: '2.0' },
      { id: 's030', name: '昌平地铁店', district: '昌平区', adminArea: '昌平区', bizArea: '', region: '经营一区', manager: '邹喜尧', managerTitle: '门店第一负责人', employeeId: '22988', mode: '2.0' },
      { id: 's031', name: '鼓楼南街店', district: '昌平区', adminArea: '昌平区', bizArea: '', region: '经营一区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's032', name: '西二旗店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营一区', manager: '梁书平', managerTitle: '门店第一负责人', employeeId: '1189', mode: '2.0' },
      { id: 's033', name: '阜成门店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营二区', manager: '周肖', managerTitle: '门店第一负责人', employeeId: '2711', mode: '2.0' },
      { id: 's034', name: '三里河店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营二区', manager: '王芬', managerTitle: '门店第一负责人', employeeId: '3029', mode: '2.5' },
      { id: 's035', name: '新街口店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营二区', manager: '于涛', managerTitle: '门店第一负责人', employeeId: '2919', mode: '2.5' },
      { id: 's036', name: '万寿路西街店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营二区', manager: '陈书芳', managerTitle: '门店第一负责人', employeeId: '10013', mode: '2.5' },
      { id: 's037', name: '远大路店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营二区', manager: '张抗抗', managerTitle: '门店第一负责人', employeeId: '4991', mode: '2.5' },
      { id: 's038', name: '马连洼店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营二区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's039', name: '大钟寺店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营二区', manager: '于黎明', managerTitle: '门店第一负责人', employeeId: '112', mode: '2.0' },
      { id: 's040', name: '彰化路店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营二区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's041', name: '花园北路店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营二区', manager: '孙正宇', managerTitle: '门店第一负责人', employeeId: '6420', mode: '2.5' },
      { id: 's042', name: '交大东路店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营二区', manager: '赵状状', managerTitle: '门店第一负责人', employeeId: '301', mode: '2.0' },
      { id: 's043', name: '西八里庄店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营二区', manager: '陈玉飞', managerTitle: '门店第一负责人', employeeId: '4202', mode: '2.5' },
      { id: 's044', name: '科学院南路店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营二区', manager: '李顺', managerTitle: '二副', employeeId: '24936', mode: '2.5' },
      { id: 's045', name: '五道口店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营二区', manager: '梁烁', managerTitle: '区域教练', employeeId: '25124', mode: '2.0' },
      { id: 's046', name: '双榆树店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营二区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.5' },
      { id: 's047', name: '798店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营二区', manager: '李彩英', managerTitle: '门店第一负责人', employeeId: '1728', mode: '2.0' },
      { id: 's048', name: '望京花家地店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营二区', manager: '杜小玲', managerTitle: '门店第一负责人', employeeId: '6121', mode: '2.0' },
      { id: 's049', name: '望京西园店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营二区', manager: '王海洋', managerTitle: '门店第一负责人', employeeId: '8236', mode: '2.0' },
      { id: 's050', name: '木偶剧院店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营二区', manager: '柏成', managerTitle: '门店第一负责人', employeeId: '10273', mode: '2.5' },
      { id: 's051', name: '黄寺大街店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营二区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's052', name: '天桥店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营三区', manager: '林周强', managerTitle: '门店第一负责人', employeeId: '280', mode: '2.0' },
      { id: 's053', name: '虎坊桥店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营三区', manager: '吴文霞', managerTitle: '门店第一负责人', employeeId: '146', mode: '2.0' },
      { id: 's054', name: '四路通店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营三区', manager: '张红光', managerTitle: '门店第一负责人', employeeId: '7352', mode: '2.0' },
      { id: 's055', name: '洋桥南店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营三区', manager: '宋胜雷', managerTitle: '门店第一负责人', employeeId: '8558', mode: '2.0' },
      { id: 's056', name: '方庄店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营三区', manager: '陈明振', managerTitle: '门店第一负责人', employeeId: '1641', mode: '2.0' },
      { id: 's057', name: '蒲黄榆店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营三区', manager: '余世煜', managerTitle: '门店第一负责人', employeeId: '474', mode: '2.0' },
      { id: 's058', name: '西罗园店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营三区', manager: '季必成', managerTitle: '门店第一负责人', employeeId: '5251', mode: '2.0' },
      { id: 's059', name: '崇文门店', district: '东城区', adminArea: '东城区', bizArea: '', region: '经营三区', manager: '周磊', managerTitle: '门店第一负责人', employeeId: '5547', mode: '2.0' },
      { id: 's060', name: '王府井店', district: '东城区', adminArea: '东城区', bizArea: '', region: '经营三区', manager: '樊元聪', managerTitle: '门店第一负责人', employeeId: '5858', mode: '2.0' },
      { id: 's061', name: '东四南大街店', district: '东城区', adminArea: '东城区', bizArea: '', region: '经营三区', manager: '朱紫平', managerTitle: '门店第一负责人', employeeId: '20284', mode: '2.0' },
      { id: 's062', name: '北京站店', district: '东城区', adminArea: '东城区', bizArea: '', region: '经营三区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's063', name: '广渠门外大街店', district: '东城区', adminArea: '东城区', bizArea: '', region: '经营三区', manager: '邱军军', managerTitle: '门店第一负责人', employeeId: '11090', mode: '2.0' },
      { id: 's064', name: '夕照寺店', district: '东城区', adminArea: '东城区', bizArea: '', region: '经营三区', manager: '刘东', managerTitle: '门店第一负责人', employeeId: '209', mode: '2.5' },
      { id: 's065', name: '春秀路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营三区', manager: '崔彦国', managerTitle: '门店第一负责人', employeeId: '3836', mode: '2.0' },
      { id: 's066', name: '成寿寺店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营三区', manager: '张硕', managerTitle: '门店第一负责人', employeeId: '22879', mode: '2.0' },
      { id: 's067', name: '东坝店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营三区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's068', name: '驼房营店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营三区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's069', name: '潘家园东路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营三区', manager: '齐立平', managerTitle: '一副', employeeId: '3529', mode: '2.5' },
      { id: 's070', name: '华威桥店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营三区', manager: '周璐', managerTitle: '门店第一负责人', employeeId: '1693', mode: '2.0' },
      { id: 's071', name: '耿庄店', district: '通州区', adminArea: '通州区', bizArea: '', region: '经营四区', manager: '何宝金', managerTitle: '门店第一负责人', employeeId: '2966', mode: '2.0' },
      { id: 's072', name: '通州店', district: '通州区', adminArea: '通州区', bizArea: '', region: '经营四区', manager: '刘加刚', managerTitle: '门店第一负责人', employeeId: '1691', mode: '2.0' },
      { id: 's073', name: '土桥店', district: '通州区', adminArea: '通州区', bizArea: '', region: '经营四区', manager: '刘琦', managerTitle: '门店第一负责人', employeeId: '9998', mode: '2.0' },
      { id: 's074', name: '通州梨园店', district: '通州区', adminArea: '通州区', bizArea: '', region: '经营四区', manager: '张帅帅', managerTitle: '店长', employeeId: '10615', mode: '2.0' },
      { id: 's075', name: '通胡大街店', district: '通州区', adminArea: '通州区', bizArea: '', region: '经营四区', manager: '吴亚超', managerTitle: '门店第一负责人', employeeId: '9191', mode: '2.0' },
      { id: 's076', name: '玉桥中路店', district: '通州区', adminArea: '通州区', bizArea: '', region: '经营四区', manager: '王新龙', managerTitle: '门店第一负责人', employeeId: '949', mode: '2.0' },
      { id: 's077', name: '通州果园店', district: '通州区', adminArea: '通州区', bizArea: '', region: '经营四区', manager: '徐洪亮', managerTitle: '门店第一负责人', employeeId: '6455', mode: '2.0' },
      { id: 's078', name: '玉桥东里店', district: '通州区', adminArea: '通州区', bizArea: '', region: '经营四区', manager: '闫良莹', managerTitle: '门店第一负责人', employeeId: '14406', mode: '2.0' },
      { id: 's079', name: '物资学院店', district: '通州区', adminArea: '通州区', bizArea: '', region: '经营四区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.5' },
      { id: 's080', name: '双井桥东店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营四区', manager: '丁卜军', managerTitle: '门店第一负责人', employeeId: '8275', mode: '2.0' },
      { id: 's081', name: '石佛营店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营四区', manager: '樊志雄', managerTitle: '门店第一负责人', employeeId: '1936', mode: '2.0' },
      { id: 's082', name: '垡头店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营四区', manager: '刘震', managerTitle: '门店第一负责人', employeeId: '325', mode: '2.0' },
      { id: 's083', name: '塔营北街店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营四区', manager: '关姗姗', managerTitle: '门店第一负责人', employeeId: '4923', mode: '2.0' },
      { id: 's084', name: '富力又一城店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营四区', manager: '吴少艳', managerTitle: '门店第一负责人', employeeId: '1666', mode: '2.0' },
      { id: 's085', name: '北花园店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营四区', manager: '刘微', managerTitle: '门店第一负责人', employeeId: '11107', mode: '2.0' },
      { id: 's086', name: '周庄嘉园店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营四区', manager: '琚璐瑶', managerTitle: '门店第一负责人', employeeId: '4787', mode: '2.0' },
      { id: 's087', name: '新天地店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营四区', manager: '王子龙', managerTitle: '门店第一负责人', employeeId: '21103', mode: '2.0' },
      { id: 's088', name: '百子湾店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营四区', manager: '金瑞', managerTitle: '门店第一负责人', employeeId: '196', mode: '2.0' },
      { id: 's089', name: '平乐园店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营四区', manager: '冯佩佩', managerTitle: '门店第一负责人', employeeId: '1546', mode: '2.0' },
      { id: 's090', name: '达官营店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营五区', manager: '樊雪晴', managerTitle: '门店第一负责人', employeeId: '1774', mode: '2.0' },
      { id: 's091', name: '鲁谷银河店', district: '石景山区', adminArea: '石景山区', bizArea: '', region: '经营五区', manager: '姚晓楠', managerTitle: '门店第一负责人', employeeId: '326', mode: '2.0' },
      { id: 's092', name: '金顶北路店', district: '石景山区', adminArea: '石景山区', bizArea: '', region: '经营五区', manager: '赵玉杰', managerTitle: '门店第一负责人', employeeId: '4131', mode: '2.0' },
      { id: 's093', name: '古城北路店', district: '石景山区', adminArea: '石景山区', bizArea: '', region: '经营五区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's094', name: '小园地铁店', district: '门头沟区', adminArea: '门头沟区', bizArea: '', region: '经营五区', manager: '贾建伟', managerTitle: '门店第一负责人', employeeId: '3637', mode: '2.0' },
      { id: 's095', name: '新桥南街店', district: '门头沟区', adminArea: '门头沟区', bizArea: '', region: '经营五区', manager: '张涛', managerTitle: '门店第一负责人', employeeId: '6364', mode: '2.0' },
      { id: 's096', name: '三环新城店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '况孝武', managerTitle: '门店第一负责人', employeeId: '1605', mode: '2.0' },
      { id: 's097', name: '纪家庙店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '刘跃', managerTitle: '门店第一负责人', employeeId: '6936', mode: '2.0' },
      { id: 's098', name: '青塔店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '王慧芳', managerTitle: '门店第一负责人', employeeId: '2051', mode: '2.0' },
      { id: 's099', name: '北大地店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '李宝颖', managerTitle: '门店第一负责人', employeeId: '2170', mode: '2.0' },
      { id: 's100', name: '富丰桥店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '董伦', managerTitle: '门店第一负责人', employeeId: '7537', mode: '2.0' },
      { id: 's101', name: '东大街店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '辛粉粉', managerTitle: '门店第一负责人', employeeId: '2945', mode: '2.5' },
      { id: 's102', name: '正阳大街店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '郭杏辉', managerTitle: '门店第一负责人', employeeId: '2340', mode: '2.0' },
      { id: 's103', name: '七里庄店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '刘强', managerTitle: '门店第一负责人', employeeId: '2510', mode: '2.0' },
      { id: 's104', name: '宛平城店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's105', name: '太平桥店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '王会', managerTitle: '门店第一负责人', employeeId: '23', mode: '2.0' },
      { id: 's106', name: '华源一里店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '闵丹丹', managerTitle: '门店第一负责人', employeeId: '4246', mode: '2.0' },
      { id: 's107', name: '梅市口店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '李俊辉', managerTitle: '门店第一负责人', employeeId: '10757', mode: '2.0' },
      { id: 's108', name: '莲怡园店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营五区', manager: '潘永帅', managerTitle: '储备店长', employeeId: '25490', mode: '2.5' },
      { id: 's109', name: '白纸坊店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营六区', manager: '段小元', managerTitle: '门店第一负责人', employeeId: '1059', mode: '2.5' },
      { id: 's110', name: '陶然亭店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营六区', manager: '屈凡伟', managerTitle: '门店第一负责人', employeeId: '1', mode: '2.0' },
      { id: 's111', name: '马连道店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营六区', manager: '董晶晶', managerTitle: '门店第一负责人', employeeId: '8417', mode: '2.0' },
      { id: 's112', name: '菜户营西路店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营六区', manager: '惠霞', managerTitle: '门店第一负责人', employeeId: '8049', mode: '2.0' },
      { id: 's113', name: '丰台南路店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营六区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's114', name: '南站店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营六区', manager: '黄华静', managerTitle: '门店第一负责人', employeeId: '127', mode: '2.0' },
      { id: 's115', name: '南站2店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营六区', manager: '黄华静', managerTitle: '门店第一负责人', employeeId: '127', mode: '2.0' },
      { id: 's116', name: '南站3店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营六区', manager: '赵棋', managerTitle: '门店第一负责人', employeeId: '2001', mode: '2.0' },
      { id: 's117', name: '南站4店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营六区', manager: '赵棋', managerTitle: '门店第一负责人', employeeId: '2001', mode: '2.0' },
      { id: 's118', name: '西站店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营六区', manager: '王贵龙', managerTitle: '门店第一负责人', employeeId: '23306', mode: '2.0' },
      { id: 's119', name: '开阳里店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营六区', manager: '李颖', managerTitle: '门店第一负责人', employeeId: '5676', mode: '2.0' },
      { id: 's120', name: '拱辰南大街店', district: '房山区', adminArea: '房山区', bizArea: '', region: '经营六区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's121', name: '良乡店', district: '房山区', adminArea: '房山区', bizArea: '', region: '经营六区', manager: '尚雯璐', managerTitle: '门店第一负责人', employeeId: '2024', mode: '2.0' },
      { id: 's122', name: '枣园店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营六区', manager: '束佩佩', managerTitle: '门店第一负责人', employeeId: '255', mode: '2.0' },
      { id: 's123', name: '丽园路店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营六区', manager: '陈素芳', managerTitle: '门店第一负责人', employeeId: '277', mode: '2.0' },
      { id: 's124', name: '兴丰大街店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营六区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's125', name: '狼垡店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营六区', manager: '胡瑞霞', managerTitle: '门店第一负责人', employeeId: '14592', mode: '2.0' },
      { id: 's126', name: '黄村西大街店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营六区', manager: '吕晓华', managerTitle: '门店第一负责人', employeeId: '884', mode: '2.5' },
      { id: 's127', name: '大兴龙湖天街店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营六区', manager: '桂齐涛', managerTitle: '门店第一负责人', employeeId: '2668', mode: '2.5' },
      { id: 's128', name: '高米店北店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营六区', manager: '王琴', managerTitle: '门店第一负责人', employeeId: '2', mode: '2.5' },
      { id: 's129', name: '西马场店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营七区', manager: '李伟', managerTitle: '区域教练', employeeId: '25404', mode: '2.0' },
      { id: 's130', name: '东铁营店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营七区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's131', name: '三营门店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营七区', manager: '王伟', managerTitle: '门店第一负责人', employeeId: '6054', mode: '2.0' },
      { id: 's132', name: '木樨园桥西店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营七区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's133', name: '和义南站店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营七区', manager: '赵美玲', managerTitle: '门店第一负责人', employeeId: '1646', mode: '2.0' },
      { id: 's134', name: '角北店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营七区', manager: '杨磊', managerTitle: '门店第一负责人', employeeId: '3100', mode: '2.0' },
      { id: 's135', name: '暖山生活店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营七区', manager: '李佳豪', managerTitle: '门店第一负责人', employeeId: '20065', mode: '2.0' },
      { id: 's136', name: '草桥地铁店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营七区', manager: '沈美玲', managerTitle: '门店第一负责人', employeeId: '445', mode: '2.0' },
      { id: 's137', name: '丰台大悦春风里店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营七区', manager: '阙丽娜', managerTitle: '门店第一负责人', employeeId: '3119', mode: '2.5' },
      { id: 's138', name: '石榴园店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营七区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.5' },
      { id: 's139', name: '临泓路店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营七区', manager: '刘佳豪', managerTitle: '门店第一负责人', employeeId: '9860', mode: '2.5' },
      { id: 's140', name: '泰和园店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营七区', manager: '常红燕', managerTitle: '门店第一负责人', employeeId: '2646', mode: '2.5' },
      { id: 's141', name: '次渠店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营七区', manager: '裴丙文', managerTitle: '门店第一负责人', employeeId: '4673', mode: '2.0' },
      { id: 's142', name: '辛房路店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营七区', manager: '叶子瑞', managerTitle: '门店第一负责人', employeeId: '16699', mode: '2.0' },
      { id: 's143', name: '马驹桥店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营七区', manager: '吝付旺', managerTitle: '门店第一负责人', employeeId: '12379', mode: '2.0' },
      { id: 's144', name: '亦庄店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营七区', manager: '霍志鹏', managerTitle: '门店第一负责人', employeeId: '4836', mode: '2.0' },
      { id: 's145', name: '亦庄桥店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营七区', manager: '古佳玉', managerTitle: '门店第一负责人', employeeId: '22304', mode: '2.0' },
      { id: 's146', name: '旧宫店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营七区', manager: '唐勇', managerTitle: '门店第一负责人', employeeId: '47', mode: '2.0' },
      { id: 's147', name: '万源路店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营七区', manager: '金艳鸽', managerTitle: '门店第一负责人', employeeId: '10892', mode: '2.5' },
      { id: 's148', name: '太平街店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营八区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's149', name: '德胜门店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营八区', manager: '王玉杰', managerTitle: '门店第一负责人', employeeId: '18518', mode: '3.0' },
      { id: 's150', name: '李老新村店', district: '通州区', adminArea: '通州区', bizArea: '', region: '经营八区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's151', name: '右安门店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营八区', manager: '王嘉烨', managerTitle: '门店第一负责人', employeeId: '24301', mode: '3.0' },
      { id: 's152', name: '宋家庄店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营八区', manager: '谢莉莉', managerTitle: '门店第一负责人', employeeId: '4132', mode: '2.0' },
      { id: 's153', name: '灯市口地铁店', district: '东城区', adminArea: '东城区', bizArea: '', region: '经营八区', manager: '韦世海', managerTitle: '门店第一负责人', employeeId: '4849', mode: '2.0' },
      { id: 's154', name: '国展店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '田凯迪', managerTitle: '区域教练', employeeId: '25405', mode: '3.0' },
      { id: 's155', name: '十里堡地铁店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '尤磊', managerTitle: '门店第一负责人', employeeId: '15042', mode: '2.0' },
      { id: 's156', name: '甜水园店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '郝帅杰', managerTitle: '门店第一负责人', employeeId: '9011', mode: '2.0' },
      { id: 's157', name: '常营V中心店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '郭宏巍', managerTitle: '门店第一负责人', employeeId: '142', mode: '3.0' },
      { id: 's158', name: '草房地铁店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's159', name: '大柳树店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's160', name: '青年路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.5' },
      { id: 's161', name: '将台路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '张青玲', managerTitle: '门店第一负责人', employeeId: '4820', mode: '3.0' },
      { id: 's162', name: '东大桥店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '张志龙', managerTitle: '门店第一负责人', employeeId: '545', mode: '3.0' },
      { id: 's163', name: '翠成馨园店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '韩影', managerTitle: '门店第一负责人', employeeId: '5122', mode: '3.0' },
      { id: 's164', name: '红庙店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '王丹丹', managerTitle: '门店第一负责人', employeeId: '18486', mode: '3.0' },
      { id: 's165', name: '朝丰家园店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '3.0' },
      { id: 's166', name: '左安门店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '秦少霞', managerTitle: '门店第一负责人', employeeId: '847', mode: '3.0' },
      { id: 's167', name: '潘家园桥北店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营八区', manager: '金晶', managerTitle: '储备店长', employeeId: '25246', mode: '3.0' },
      { id: 's168', name: '建华南路店', district: '', adminArea: '', bizArea: '', region: '经营八区', manager: '刘云龙', managerTitle: '储备店长', employeeId: '25497', mode: '3.0' },
      { id: 's169', name: '七星园店', district: '石景山区', adminArea: '石景山区', bizArea: '', region: '经营九区', manager: '肖本健', managerTitle: '门店第一负责人', employeeId: '14455', mode: '2.0' },
      { id: 's170', name: '杨庄东街店', district: '石景山区', adminArea: '石景山区', bizArea: '', region: '经营九区', manager: '王燕敏', managerTitle: '门店第一负责人', employeeId: '1687', mode: '3.0' },
      { id: 's171', name: '杨庄地铁店', district: '石景山区', adminArea: '石景山区', bizArea: '', region: '经营九区', manager: '贾士坤', managerTitle: '门店第一负责人', employeeId: '2417', mode: '3.0' },
      { id: 's172', name: '广源大厦店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营九区', manager: '何洋', managerTitle: '门店第一负责人', employeeId: '11660', mode: '2.0' },
      { id: 's173', name: '中关村南路店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营九区', manager: '杨海川', managerTitle: '门店第一负责人', employeeId: '1041', mode: '3.0' },
      { id: 's174', name: '航天桥店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营九区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '3.0' },
      { id: 's175', name: '定慧寺店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营九区', manager: '杨晓亮', managerTitle: '门店第一负责人', employeeId: '7725', mode: '3.0' },
      { id: 's176', name: '清河店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营九区', manager: '栾祖全', managerTitle: '门店第一负责人', employeeId: '27', mode: '3.0' },
      { id: 's177', name: '海淀黄庄店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营九区', manager: '刘少增', managerTitle: '门店第一负责人', employeeId: '22982', mode: '3.0' },
      { id: 's178', name: '马家堡店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营九区', manager: '金灿', managerTitle: '门店第一负责人', employeeId: '21714', mode: '3.0' },
      { id: 's179', name: '角门店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营九区', manager: '陈冬冬', managerTitle: '门店第一负责人', employeeId: '38', mode: '2.0' },
      { id: 's180', name: '嘉园店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营九区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's181', name: '晓月中路店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营九区', manager: '郭杏娟', managerTitle: '门店第一负责人', employeeId: '2596', mode: '3.0' },
      { id: 's182', name: '丰管路店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营九区', manager: '刘艳鹏', managerTitle: '门店第一负责人', employeeId: '22994', mode: '3.0' },
      { id: 's183', name: '和平里店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营九区', manager: '区域直管', managerTitle: '', employeeId: '', mode: '2.0' },
      { id: 's184', name: '日坛北路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营九区', manager: '姜雨含', managerTitle: '门店第一负责人', employeeId: '25129', mode: '2.0' },
      { id: 's185', name: '北苑中街店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营九区', manager: '汪霞', managerTitle: '门店第一负责人', employeeId: '2601', mode: '3.0' },
      { id: 's186', name: '小营西路店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营九区', manager: '关永鑫', managerTitle: '门店第一负责人', employeeId: '21794', mode: '3.0' },
      { id: 's187', name: '霍营地铁店', district: '昌平区', adminArea: '昌平区', bizArea: '', region: '经营九区', manager: '晋清源', managerTitle: '门店第一负责人', employeeId: '28', mode: '2.0' },
      { id: 's188', name: '金融街店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营九区', manager: '沈静婷', managerTitle: '门店第一负责人', employeeId: '198', mode: '3.0' },
      { id: 's189', name: '西宸里店', district: '', adminArea: '', bizArea: '', region: '经营九区', manager: '刘世杰', managerTitle: '储备店长', employeeId: '25358', mode: '3.0' },
      { id: 's190', name: '四路通二店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营九区', manager: '张耀民', managerTitle: '储备店长', employeeId: '25541', mode: '3.0' },
      { id: 's191', name: '小马厂店', district: '西城区', adminArea: '西城区', bizArea: '', region: '经营十区', manager: '李承东', managerTitle: '门店第一负责人', employeeId: '2270', mode: '3.0' },
      { id: 's192', name: '古城大街店', district: '石景山区', adminArea: '石景山区', bizArea: '', region: '经营十区', manager: '汪开天', managerTitle: '门店第一负责人', employeeId: '19331', mode: '3.0' },
      { id: 's193', name: '车公庄店', district: '海淀区', adminArea: '海淀区', bizArea: '', region: '经营十区', manager: '王爱民', managerTitle: '门店第一负责人', employeeId: '174', mode: '3.0' },
      { id: 's194', name: '光彩路店', district: '丰台区', adminArea: '丰台区', bizArea: '', region: '经营十区', manager: '吴建', managerTitle: '门店第一负责人', employeeId: '2264', mode: '3.0' },
      { id: 's195', name: '东中街店', district: '东城区', adminArea: '东城区', bizArea: '', region: '经营十区', manager: '周峰', managerTitle: '门店第一负责人', employeeId: '274', mode: '3.0' },
      { id: 's196', name: '郁花园店', district: '大兴区', adminArea: '大兴区', bizArea: '', region: '经营十区', manager: '李承兵', managerTitle: '门店第一负责人', employeeId: '2280', mode: '3.0' },
      { id: 's197', name: '十里堡店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营十区', manager: '董莹莹', managerTitle: '门店第一负责人', employeeId: '18797', mode: '3.0' },
      { id: 's198', name: '定福庄店', district: '朝阳区', adminArea: '朝阳区', bizArea: '', region: '经营十区', manager: '郭丰瑜', managerTitle: '门店第一负责人', employeeId: '12636', mode: '3.0' }
    ],
    users: [ { id: 'u001', name: '管理员', role: '总部', area: '', storeId: '', store: '', phone: '13800000001' },
      { id: 'u002', name: '刘畅', role: '线上稽核', area: '', storeId: '', store: '', phone: '13800000002' },
      { id: 'u003', name: '马昕茹', role: '线上稽核', area: '', storeId: '', store: '', phone: '13800000003' },
      { id: 'u004', name: '陶畅', role: '线上稽核', area: '', storeId: '', store: '', phone: '13800000004' },
      { id: 'u005', name: '范晓明', role: '线下稽核', area: '', storeId: '', store: '', phone: '13800000005' },
      { id: 'u006', name: '钱磊', role: '线下稽核', area: '', storeId: '', store: '', phone: '13800000006' },
      { id: 'u007', name: '教练A', role: '区域教练', area: '经营一区', storeId: '', store: '', phone: '13800000007' },
      { id: 'u008', name: '教练B', role: '区域教练', area: '上海', storeId: '', store: '', phone: '13800000008' },
      { id: 'u009', name: '张三', role: '店长', area: '', storeId: 's056', store: '方庄店', phone: '13800000009' },
      { id: 'u010', name: '李四', role: '店长', area: '', storeId: 's048', store: '望京花家地店', phone: '13800000010' },
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
      { id: 'p001', storeId: 's056', store: '方庄店', region: '经营一区', district: '朝阳区', manager: '张三', eventDate: '2026-08-03', event: '未及时上传日清记录', category: '管理失职', level: '一级批评教育', source: '现场稽核', inspector: '范晓明', personName: '张三', personLevel: '一级批评教育', personType: '管理失职', penaltyPerson: '', penaltyManager: '', survey: '经查，门店未及时上传7月28日日清记录', suggestion: '通报批评，限期整改', policyRef: '新奖惩制度第3.1条', dutyPerson: '', dutyManager: '', dutyValue: '', dutyCoach: '', status: '待补填' },
      { id: 'p002', storeId: 's048', store: '望京花家地店', region: '经营一区', district: '朝阳区', manager: '李四', eventDate: '2026-08-05', event: '外卖平台差评未回复', category: '运营类', level: '二级书面警告', source: '线上差评', inspector: '刘畅', personName: '李四', personLevel: '二级书面警告', personType: '运营类', penaltyPerson: '200', penaltyManager: '100', survey: '顾客在外卖平台投诉卫生问题，门店未及时回复', suggestion: '书面警告，罚款200元', policyRef: '新奖惩制度第5.2条', dutyPerson: '李四', dutyManager: '李四', dutyValue: '200', dutyCoach: '', status: '已闭环' },
      { id: 'p003', storeId: 'SLH001', store: '十里河店', region: '经营二区', district: '朝阳区', manager: '王五', eventDate: '2026-08-10', event: '食品过期未下架', category: '食品安全', level: '三级降职降薪', source: '线下稽核', inspector: '钱磊', personName: '王五', personLevel: '三级降职降薪', personType: '食品安全', penaltyPerson: '取消当月奖金', penaltyManager: '取消当月奖金', survey: '巡检发现冷藏柜中有过期食材未及时处理', suggestion: '降职降薪，取消当月奖金', policyRef: '新奖惩制度第8.1条', dutyPerson: '王五', dutyManager: '王五', dutyValue: '取消当月奖金', dutyCoach: '教练A', status: '已闭环' },
      { id: 'p004', storeId: 'SH001', store: '上海徐汇店', region: '上海', district: '上海', manager: '赵六', eventDate: '2026-08-12', event: '员工旷工', category: '纪律类', level: '经济处罚', source: '店长上报', inspector: '赵六', personName: '员工A', personLevel: '经济处罚', personType: '纪律类', penaltyPerson: '100', penaltyManager: '', survey: '员工未经请假擅自离岗', suggestion: '经济处罚100元', policyRef: '新奖惩制度第1.2条', dutyPerson: '', dutyManager: '', dutyValue: '', dutyCoach: '', status: '超时' }
    ],
    complaints: [
      { id: 'c001', storeId: 's056', store: '方庄店', date: '2026-08-01', meal: '午餐', content: '菜品太咸，服务态度差', opportunity: '口味标准化/服务培训', platform: '点评', responsible: '张三', responsibleTitle: '店长', dutyManager: '张三', status: '待处理', appealContent: '', appealResult: '' },
      { id: 'c002', storeId: 's048', store: '望京花家地店', date: '2026-08-03', meal: '晚餐', content: '等了40分钟才上菜', opportunity: '出餐速度优化', platform: '公众号', responsible: '李四', responsibleTitle: '店长', dutyManager: '李四', status: '待处理', appealContent: '', appealResult: '' },
      { id: 'c003', storeId: 'SLH001', store: '十里河店', date: '2026-08-05', meal: '早餐', content: '豆浆有异味', opportunity: '食品安全检查', platform: '点评', responsible: '王五', responsibleTitle: '店长', dutyManager: '王五', status: '已处理', appealContent: '', appealResult: '' },
      { id: 'c004', storeId: 'SH001', store: '上海徐汇店', date: '2026-08-07', meal: '午餐', content: '餐具不干净', opportunity: '清洗流程规范', platform: '点评', responsible: '赵六', responsibleTitle: '店长', dutyManager: '赵六', status: '待处理', appealContent: '', appealResult: '' },
      { id: 'c005', storeId: 's056', store: '方庄店', date: '2026-08-08', meal: '晚餐', content: '外卖漏送菜品', opportunity: '外卖打包流程', platform: '点评', responsible: '打包员', responsibleTitle: '小时工', dutyManager: '张三', status: '已驳回', appealContent: '员工操作失误已处罚', appealResult: '驳回' }
    ],
    onlineRecords: [
      { id: 'o001', inspector: '刘畅', storeId: 's056', store: '方庄店', date: '2026-08-01', content: '顾客差评：菜品味道偏咸' },
      { id: 'o002', inspector: '刘畅', storeId: 's048', store: '望京花家地店', date: '2026-08-02', content: '投诉出餐速度慢' }
    ],
    areaCoaches: [
        {
                "area": "经营一区",
                "leader": "胡柯翊",
                "type": "bizArea"
        },
        {
                "area": "经营二区",
                "leader": "李万鹏",
                "type": "bizArea"
        },
        {
                "area": "经营三区",
                "leader": "李鹏",
                "type": "bizArea"
        },
        {
                "area": "经营四区",
                "leader": "高瑶",
                "type": "bizArea"
        },
        {
                "area": "经营五区",
                "leader": "程帅威",
                "type": "bizArea"
        },
        {
                "area": "经营六区",
                "leader": "杨贺川",
                "type": "bizArea"
        },
        {
                "area": "经营七店",
                "leader": "赵芳",
                "type": "bizArea"
        },
        {
                "area": "经营八区",
                "leader": "李塘龙",
                "type": "bizArea"
        },
        {
                "area": "经营九区",
                "leader": "闫海青",
                "type": "bizArea"
        },
        {
                "area": "经营十区",
                "leader": "陈秋",
                "type": "bizArea"
        },
        {
                "area": "训练店",
                "leader": "陈贵安",
                "type": "region"
        },
        {
                "area": "上海",
                "leader": "洪登峰",
                "type": "region"
        }
],
    offlineRecords: [
      { id: 'of001', inspector: '范晓明', storeId: 's056', store: '方庄店', date: '2026-08-03', score: 85, content: '后厨卫生扣5分；食材存放扣10分' },
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
      '总部':     { inspection: true, inspection_edit: true, daily: true, penalty: true, complaint: true, notice: true, dashboard: true, task: true },
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

  getAreaCoaches()   { return this.seedData.areaCoaches || []; },
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

    var tabPages = ['home', 'inspection', 'penalty', 'complaint', 'dashboard', 'template', 'daily', 'task'];
    var inspectionSubPages = ['inspectionTemplates', 'inspectionFill', 'inspectionResults', 'inspectionIssues', 'inspectionDashboard'];
    document.querySelectorAll('.tab-item').forEach(function(t) {
      var highlightHash = inspectionSubPages.indexOf(hash) >= 0 ? 'inspection' : hash;
      t.classList.toggle('active', t.dataset.page === highlightHash);
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
    if (!user) {
      var seedUsers = this.seedData && this.seedData.users ? this.seedData.users : [];
      user = seedUsers.find(function(u) { return u.id === userId; });
    }
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
