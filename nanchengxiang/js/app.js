/* ============================================







   app.js - 南城香协作终端







   Supabase 云端数据 + 前端路由







   ============================================ */















/* ---------------- Supabase 配置（部署时替换） ---------------- */







const SUPABASE_URL = 'https://omkshuposrdmwgukpoxd.supabase.co';







const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ta3NodXBvc3JkbXdndWtwb3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTM2NTcsImV4cCI6MjEwMTEyOTY1N30.WH7ta72Bm2cICuQhW--O26BftF1FJZtN3WNwOddfQO4';















/* ---------------- 全局工具函数 ---------------- */







window.safeGet = function(key, def) {



  try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch(e) { return def; }



};



window.safeSet = function(key, val) {



  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}



};







const App = {







  supabase: null,







  currentUser: null,







  currentHash: '',







  dataCache: {},       // 内存缓存，页面同步读取







  dataReady: false,    // 缓存是否就绪















  /* ---- 种子数据（首次初始化用，camelCase 兼容旧代码） ---- */







  // daily_reports: [{ id, inspector, date, type('online'|'offline'), items: [{ store, score, findings }] }]







  seedData: {







    daily_reports: [{id: 'sd_dr_001', inspector: '钱磊', date: '2026-07-29', type: 'online', items: [{store: '天慧广场店', score: 94, findings: '[QSC] 超五分钟未翻动；[QSC] 铲子掉落台面继续使用；[QSC] 超30分钟未处理'}, {store: '万航渡路店', score: 91, findings: '[QSC] 填补餐具未戴手套；[QSC] 超五分钟未翻动；[QSC] 超30分钟未处理；[QSC] 打包盒接触隔层'}, {store: '杨庄东街店', score: 95, findings: '[QSC] 超五分钟未翻动；[QSC] 超30分钟未处理；[QSC] 仪容仪表不合格'}, {store: '左安门店', score: 92, findings: '[QSC] 菜刀接触保鲜盒底；[QSC] 超五分钟未翻动；[QSC] 超30分钟未处理；[QSC] 仪容仪表不合格'}, {store: '汇融天地店', score: 86, findings: '[QSC] 带耳钉；[QSC] 仪容仪表不合格；[QSC] 未戴口罩；[QSC] 接触馒头未戴手套；[QSC] 午餐炒菜断档；[QSC] 超五分钟未翻动；[QSC] 超30分钟未处理'}, {store: '朝丰家园店', score: 90, findings: '[QSC] 超五分钟未翻动；[QSC] 超30分钟未处理；[QSC] 夹子接触盖子；[QSC] 炒锅洗份数盒'}, {store: '马家堡店', score: 94, findings: '[QSC] 超五分钟未翻动；[QSC] 超30分钟未处理；[QSC] 夹子接触台面'}, {store: '丰管路店', score: 94, findings: '[QSC] 超五分钟未翻动；[QSC] 超30分钟未处理；[QSC] 夹子接触台面；[QSC] 报损过多'}], storeCount: 8, issuesCount: 32}, {id: 'sd_dr_002', inspector: '钱磊', date: '2026-07-30', type: 'online', items: [{store: '郁花园店', score: 95, findings: '[QSC] 未规范佩戴口罩；[QSC] 仪容仪表不合格；[QSC] 未溜边放'}, {store: '物资学院店', score: 88, findings: '[QSC] 佩戴首饰；[QSC] 仪容仪表不合格；[QSC] 米饭未加盖；[QSC] 包装袋入水；[QSC] 关火一分钟后出餐；[QSC] 米饭未及时打散'}, {store: '青年路店', score: 90, findings: '[QSC] 饮料未用规定工具称量；[QSC] 垃圾桶垃圾溢出；[QSC] 金针菇未软榻；[QSC] 汤汁少'}, {store: '旧宫店', score: 90, findings: '[QSC] 锅贴煎制时间不足；[QSC] 筷子掉落台面；[QSC] 米饭未及时打散；[QSC] 焯水时间过长；[QSC] 佩戴首饰'}, {store: '太平街店', score: 87, findings: '[QSC] 浇油操作错误；[QSC] 2米饭未加盖；[QSC] 3打烊过早；[QSC] 4交叉污染；[QSC] 5自助服务区未及时清洁；[QSC] 6未使用专用称量器具'}], storeCount: 5, issuesCount: 24}, {id: 'sd_dr_003', inspector: '钱磊', date: '2026-07-31', type: 'online', items: [{store: '通胡大街店', score: 90, findings: '[QSC] 打烊过早；[QSC] 仪容仪表不合格；[QSC] 交叉污染，煮台热料包；[QSC] 未及时加盖；[QSC] 米饭未及时打散'}, {store: '木樨园桥西店', score: 91, findings: '[QSC] 打烊过早；[QSC] 交叉污染；[QSC] 热料包方式错误；[QSC] 水未开下米'}, {store: '交大东路店', score: 87, findings: '[QSC] 米饭未及时打散；[QSC] 工牌无名字；[QSC] 货物掉落地面；[QSC] 炒肉无锅圈；[QSC] 饮料未使用规定器具称量；[QSC] 米饭未及时加盖'}, {store: '丰台南路店', score: 89, findings: '[QSC] 只放辣椒未放油；[QSC] 仪容仪表不合格；[QSC] 锅圈接触台面后继续使用；[QSC] 米饭未及时打散；[QSC] 米饭未及时加盖'}, {store: '和平东桥店', score: 92, findings: '[QSC] 筷子头落入烤鱼酱；[QSC] 水未开下配料；[QSC] 保鲜盒落地；[QSC] 饮料未使用规定器具称量'}], storeCount: 5, issuesCount: 24}, {id: 'sd_dr_004', inspector: '钱磊', date: '2026-08-01', type: 'online', items: [{store: '平乐园店', score: 90, findings: '[QSC] 水未开下绿豆；[QSC] 未及时清洁；[QSC] 咸菜断档；[QSC] 焯水时间过长'}, {store: '宋家庄店', score: 91, findings: '[QSC] 水未开下小米；[QSC] 放油不标准；[QSC] 米饭未及时打散；[QSC] 汤汁过少；[QSC] 填补餐具未戴手套；[QSC] 一块面出七根半油条'}, {store: '和义南站店', score: 87, findings: '[QSC] 仪容仪表不合格；[QSC] 米饭未及时打散；[QSC] 未及时分装；[QSC] 垃圾溢出；[QSC] 佩戴首饰；[QSC] 交叉污染'}, {store: '通州耿庄店', score: 89, findings: '[QSC] 提前打烊；[QSC] 烧麦接触墙壁；[QSC] 米饭未及时打散；[QSC] 煎制时间不足；[QSC] 报损过多'}, {store: '驼房营店', score: 92, findings: '[QSC] 佩戴首饰；[QSC] 仪容仪表不合格；[QSC] 油条开叉；[QSC] 加料汁后未充分搅拌；[QSC] 加小葱未使用标准工器具'}], storeCount: 5, issuesCount: 26}, {id: 'sd_dr_005', inspector: '钱磊', date: '2026-08-02', type: 'online', items: [{store: '晓月中路店', score: 90, findings: '[QSC] 蒸菜断档；[QSC] 超 5 分钟未翻动；[QSC] 超 30 分钟未处理'}, {store: '德胜门店', score: 92, findings: '[QSC] 填补餐具未戴手套；[QSC] 超 30 分钟未处理；[QSC] 超 5 分钟未翻动；[QSC] 未溜边放'}, {store: '红庙店', score: 91, findings: '[QSC] 蒸菜断档；[QSC] 填补餐具未戴手套；[QSC] 超 5 分钟未翻动；[QSC] 超 30 分钟未处理'}, {store: '内江路店', score: 88, findings: '[QSC] 超 5 分钟未翻动；[QSC] 超 30 分钟未处理；[QSC] 炒菜断档；[QSC] 蒸菜断档；[QSC] 交叉污染'}, {store: '江苏路店', score: 92, findings: '[QSC] 超 5 分钟未翻动；[QSC] 超 30 分钟未处理；[QSC] 夹子放入屉中；[QSC] 未用新碗'}, {store: '控江路店', score: 86, findings: '[QSC] 用手抓熟包子；[QSC] 报损过多；[QSC] 超 5 分钟未翻动；[QSC] 超 30 分钟未处理；[QSC] 未溜边放；[QSC] 午餐蒸菜断档；[QSC] 晚餐蒸菜断档'}, {store: '小马厂店', score: 91, findings: '[QSC] 仪容仪表不合格；[QSC] 夹子接触桌面后继续使用；[QSC] 超 5 分钟未翻动；[QSC] 晚餐蒸菜断档'}, {store: '海淀黄庄店', score: 92, findings: '[QSC] 仪容仪表不合格；[QSC] 夹子接触桌面后继续使用；[QSC] 超 5 分钟未翻动；[QSC] 超 30 分钟未处理'}], storeCount: 8, issuesCount: 35}, {id: 'sd_dr_006', inspector: '钱磊', date: '2026-08-04', type: 'online', items: [{store: '天通西苑店', score: 88, findings: '[QSC] 佩戴首饰；[QSC] 仪容仪表不合格；[QSC] 交叉污染；[QSC] 未及时分装；[QSC] 焯水时间过长；[QSC] 米饭未及时打散'}, {store: '小园地铁店', score: 90, findings: '[QSC] 包子掉落台面继续使用；[QSC] 米饭未加盖；[QSC] 提前打烊；[QSC] 仪容仪表不合格；[QSC] 米饭未及时打散'}, {store: '新天地店', score: 92, findings: '[QSC] 米饭未加盖；[QSC] 交叉污染；[QSC] 工牌无名字；[QSC] 米饭未及时打散'}, {store: '次渠店', score: 87, findings: '[QSC] 工牌无名字；[QSC] 仪容仪表不合格；[QSC] 水未开下配料；[QSC] 米饭未及时打散；[QSC] 报损过多；[QSC] 汤汁过少；[QSC] 浇油数量不标准；[QSC] 未及时清洁'}, {store: '莲怡园店', score: 86, findings: '[QSC] 未穿工服；[QSC] 米饭未加盖；[QSC] 浇油数量不标准；[QSC] 交叉污染；[QSC] 米饭未及时打散；[QSC] 咸菜断档；[QSC] 未及时清洁'}], storeCount: 5, issuesCount: 30}, {id: 'sd_dr_007', inspector: '钱磊', date: '2026-08-05', type: 'online', items: [{store: '宛平城店', score: 95, findings: '[QSC] 未使用标准工器具；[QSC] 米饭未及时打散'}, {store: '草桥地铁店', score: 94, findings: '[QSC] 汤勺接触水龙头开关；[QSC] 提前打烊；[QSC] 报损过多；[QSC] 仪容仪表不合格'}, {store: '南站 2 店', score: 96, findings: '[QSC] 嘴里嚼东西；[QSC] 后厨摘帽子'}, {store: '角北店', score: 91, findings: '[QSC] 仪容仪表不合格；[QSC] 下馄饨未抖动；[QSC] 汤勺接触水龙头开关；[QSC] 未使用标准工器具称量'}, {store: '黄寺大街店', score: 89, findings: '[QSC] 汤勺接触桌面；[QSC] 仪容仪表不合格；[QSC] 三勺油两份肉；[QSC] 自助服务区未及时清洁；[QSC] 制作饮料未使用标准工器具'}], storeCount: 5, issuesCount: 17}, {id: 'dr0100', date: '2026-08-01', inspector: '陶畅', storeCount: 5, issuesCount: 25, type: 'offline', items: [{store: '小营西路店', score: 89, findings: '[QSC] 1.值班类\n\n\n\n①员工岗位标准掌握不足，部分产品规格参数不清楚\n\n\n\n②台账相关抽查问答存在不熟悉问题；[QSC] 2.服务类\n\n\n\n①前厅话术频次较低，9:00后到店顾客未听见迎宾语；[QSC] 3.产品类\n\n\n\n①高峰期部分菜品断档，出餐超时\n\n\n\n②西红柿加工未去除果蒂，处理不符合标准\n\n\n\n③早餐出品不合格，素包子出现破损；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①桌椅台面残留油渍污渍，收餐清理不及时\n\n\n\n②饮水机滴水盘存有毛发，清洁不到位\n\n\n\n③门店门框、玻璃下方存在污渍，有张贴小广告痕迹\n\n\n\n④门口三包区域垃圾未及时清理\n\n\n\n⑤开水器、封膜机设备表面有污渍积灰\n\n\n\n⑥冰箱门封条存有污渍\n\n\n\n顾客不可视区域\n\n\n\n①后厨水池下方清洁不到位留有污渍\n\n\n\n②洗碗机设备封条、天花板存在污渍毛发；[QSC] 5.食安类\n\n\n\n①托盘存有食物残渣未清理干净\n\n\n\n②消毒柜未正常开启，餐盘残留残渣\n\n\n\n③筷子清洗不干净存在污渍\n\n\n\n④晨检相关记录缺失无法找到\n\n\n\n⑤垃圾分类执行不彻底\n\n\n\n⑥食材生熟混放，部分物料未封口储存'}, {store: '秋实路店', score: 86, findings: '[QSC] 1.值班类\n\n\n\n①门店管理人员对产品标准掌握不熟，抽查问答答错\n\n\n\n②员工岗位知识掌握存在短板；[QSC] 2.服务类\n\n\n\n①前厅员工工服纽扣未全部扣齐，着装不规范\n\n\n\n②后厨值班经理佩戴项链，仪容不符合要求；[QSC] 3.产品类\n\n\n\n①小葱切制规格不合格，切配未达标\n\n\n\n②馄饨破皮后正常出餐，出品检查不到位；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜内筷子、餐盘残留污渍残渣\n\n\n\n②饮水机出水口有水垢未清洁\n\n\n\n③清洁工具摆放杂乱、工具表面有污渍\n\n\n\n④门店玻璃留有手印污渍\n\n\n\n⑤豆浆机、开水器设备污渍未清理干净\n\n\n\n⑥消毒柜下方散落毛发\n\n\n\n顾客不可视区域\n\n\n\n①后厨设备底部积有污渍\n\n\n\n②后厨墙面、胶条存有污渍\n\n\n\n③备餐区下方墙面污垢堆积\n\n\n\n④冰柜封条污渍较重未清洁；[QSC] 5.食安类\n\n\n\n①垃圾分类未执行到位\n\n\n\n②制冰机内部水垢污垢未清理\n\n\n\n③员工水杯没有集中定点存放\n\n\n\n④案板刀具未分区管理，带有食物残渣污渍'}, {store: '红军营店', score: 89, findings: '[QSC] 1.值班类\n\n\n\n①管理人员产品标准掌握不熟练\n\n\n\n②岗位抽查问答存在不熟悉情况；[QSC] 2.服务类\n\n\n\n无问题项；[QSC] 3.产品类\n\n\n\n①圆白菜储存不当出现冻伤，原材料品质受损；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①餐桌餐椅残留食物残渣\n\n\n\n②饮水机出水口有水垢污渍\n\n\n\n③天花板积有毛絮灰尘\n\n\n\n④前台设备表面积灰、留有污渍\n\n\n\n顾客不可视区域\n\n\n\n①后厨设备底部残留污渍残渣\n\n\n\n②后厨水池下方污渍堆积\n\n\n\n⑤冰柜门封条存有污渍残渣；[QSC] 5.食安类\n\n\n\n①冷藏库内食材开封后未及时封口加盖储存\n\n\n\n②冰箱内部生熟食材混放\n\n\n\n③米面粮油未离地存放\n\n\n\n④制冰机内部水垢未清理\n\n\n\n⑤刀具上面残留食物残渣'}, {store: '木偶剧院店', score: 87, findings: '[QSC] 1.值班类\n\n\n\n①管理人员对产品配比标准掌握不清\n\n\n\n②员工岗位相关制度问答答错；[QSC] 2.服务类\n\n\n\n①前厅员工工服仅扣一颗纽扣，着装不规范；[QSC] 3.产品类\n\n\n\n①蔬菜储存不当出现冻伤情况\n\n\n\n②香葱、小葱切制规格不合格，香葱夹带黄叶；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜餐具残留残渣污渍\n\n\n\n②饮水机接水口存有污渍\n\n\n\n③餐桌餐椅表面残留食物残渣\n\n\n\n④天花板检修口周边堆积毛絮灰尘\n\n\n\n⑤前台设备顶部污渍积灰未清理\n\n\n\n顾客不可视区域\n\n\n\n①后厨设备底部残留污渍残渣\n\n\n\n②后厨水池下方污渍堆积\n\n\n\n③收银台底部胶渍、油污较重\n\n\n\n④冰柜门封条污渍残渣未清理；[QSC] 5.食安类\n\n\n\n①库房食材开封后未封口储存\n\n\n\n②冰箱内生熟食材混放存放\n\n\n\n③米面粮油没有离地存放\n\n\n\n④制冰机内部有水垢污渍\n\n\n\n⑤刀具缝隙残留食物残渣'}, {store: '黄寺大街店', score: 87, findings: '[QSC] 1.值班类\n\n\n\n①管理人员产品克重标准掌握不熟悉\n\n\n\n②员工相关制度抽查问答出错；[QSC] 2.服务类\n\n\n\n无问题项；[QSC] 3.产品类\n\n\n\n①圆白菜储存不当出现冻伤\n\n\n\n②香葱原料夹带黄叶，品质不佳\n\n\n\n③烤串制作不达标，鸡肉串破皮、羊肉串重量超标；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜餐碟存有毛发\n\n\n\n②餐具柜抽屉内部残留残渣\n\n\n\n③餐桌台面残留食物残渣污渍\n\n\n\n④厨余垃圾桶桶盖未加盖\n\n\n\n⑤门店铜牌位置有污渍\n\n\n\n⑥开水机顶部积灰存有污渍\n\n\n\n顾客不可视区域\n\n\n\n①排烟罩积攒油垢\n\n\n\n②冰箱层架、封条存在污渍；[QSC] 5.食安类\n\n\n\n①垃圾分类落实不到位\n\n\n\n②冷藏食材开封后未封口储存\n\n\n\n③冰箱内部生熟混放，出现交叉存放风险\n\n\n\n④案板、刀具残留食物残渣污渍\n\n\n\n⑤晨检记录缺失，台账资料不全'}]}, {id: 'dr0101', date: '2026-08-01', inspector: '马昕茹', storeCount: 7, issuesCount: 0, type: 'online', items: [{store: '顺义站前南街店', score: 84, findings: ''}, {store: '北花园店', score: 89, findings: ''}, {store: '西二旗店', score: 86, findings: ''}, {store: '丰台大悦春风里店', score: 86, findings: ''}, {store: '通州店', score: 93, findings: ''}, {store: '通州梨园店', score: 91, findings: ''}, {store: '马驹桥店', score: 79, findings: ''}]}, {id: 'dr0103', date: '2026-08-01', inspector: '范晓明', storeCount: 3, issuesCount: 0, type: 'online', items: [{store: '枣园店', score: 86, findings: ''}, {store: '木偶剧院店', score: 90, findings: ''}, {store: '新桥南街店', score: 87, findings: ''}]}, {id: 'dr0104', date: '2026-08-01', inspector: '徐瑞雪', storeCount: 4, issuesCount: 4, type: 'offline', items: [{store: '车公庄店', score: 91, findings: '[QSC] 无差异'}, {store: '杨庄东街店', score: 93, findings: '[QSC] 无差异'}, {store: '金顶北路店', score: 87, findings: '[QSC] 长款0.3元'}, {store: '西八里庄店', score: 89, findings: '[QSC] 无差异'}]}, {id: 'dr0105', date: '2026-08-01', inspector: '乔雨地', storeCount: 4, issuesCount: 4, type: 'offline', items: [{store: '次渠店', score: 81, findings: '[QSC] 短款1.2元'}, {store: '辛房路店', score: 90, findings: '[QSC] 短款95.2元'}, {store: '亦庄店', score: 89, findings: '[QSC] 无误差'}, {store: '亦庄桥店', score: 88, findings: '[QSC] 长款10元'}]}, {id: 'dr0106', date: '2026-08-02', inspector: '马昕茹', storeCount: 8, issuesCount: 0, type: 'online', items: [{store: '定福庄店', score: 88, findings: ''}, {store: '打浦路店', score: 72, findings: ''}, {store: '郁花园店', score: 96, findings: ''}, {store: '安慧北里店', score: 93, findings: ''}, {store: '东大桥店', score: 89, findings: ''}, {store: '十里堡店', score: 90, findings: ''}, {store: '将台路店', score: 89, findings: ''}, {store: '翠成馨园店', score: 93, findings: ''}]}, {id: 'dr0107', date: '2026-08-02', inspector: '张炜玉', storeCount: 8, issuesCount: 0, type: 'online', items: [{store: '东中街店', score: 84, findings: ''}, {store: '北苑中街店', score: 90, findings: ''}, {store: '广渠门店', score: 94, findings: ''}, {store: '清河店', score: 95, findings: ''}, {store: '天慧广场店', score: 95, findings: ''}, {store: '古城大街店', score: 90, findings: ''}, {store: '航天桥店', score: 85, findings: ''}, {store: '车公庄店', score: 82, findings: ''}]}, {id: 'dr0109', date: '2026-08-02', inspector: '范晓明', storeCount: 3, issuesCount: 0, type: 'online', items: [{store: '东坝店', score: 86, findings: ''}, {store: '五道口店', score: 88, findings: ''}, {store: '前进花园店', score: 83, findings: ''}]}, {id: 'dr0110', date: '2026-08-02', inspector: '乔雨地', storeCount: 4, issuesCount: 4, type: 'offline', items: [{store: '驼房营店', score: 90, findings: '[QSC] 无误差'}, {store: '天通西苑店', score: 91, findings: '[QSC] 无误差'}, {store: '回龙观东大街店', score: 88, findings: '[QSC] 长款6.3元'}, {store: '昌平地铁店', score: 90, findings: '[QSC] 短款10元'}]}, {id: 'dr0111', date: '2026-08-02', inspector: '王红丽', storeCount: 4, issuesCount: 4, type: 'offline', items: [{store: '光彩路店', score: 90, findings: '[QSC] 短款4.38元'}, {store: '物资学院店', score: 87, findings: '[QSC] 无差异'}, {store: '通胡大街店', score: 91, findings: '[QSC] 无差异'}, {store: '垡头店', score: 89, findings: '[QSC] 长款4.2元'}]}, {id: 'dr0112', date: '2026-08-03', inspector: '范晓明', storeCount: 3, issuesCount: 0, type: 'online', items: [{store: '北大地店', score: 89, findings: ''}, {store: '暖山生活店', score: 95, findings: ''}, {store: '周庄嘉园店', score: 83, findings: ''}]}, {id: 'dr0113', date: '2026-08-03', inspector: '张炜玉', storeCount: 8, issuesCount: 0, type: 'online', items: [{store: '杨庄地铁店', score: 86, findings: ''}, {store: '金融街店', score: 89, findings: ''}, {store: '迎春路店', score: 83, findings: ''}, {store: '右安门店', score: 87, findings: ''}, {store: '中关村南路店', score: 92, findings: ''}, {store: '古城大街店', score: 90, findings: ''}, {store: '航天桥店', score: 85, findings: ''}, {store: '车公庄店', score: 82, findings: ''}]}, {id: 'dr0114', date: '2026-08-03', inspector: '陶畅', storeCount: 3, issuesCount: 15, type: 'offline', items: [{store: '新桥南街店', score: 90, findings: '[QSC] 1.值班类\n\n\n\n①早餐产品供应管控不到位，9:05‑9:17松糕出现断档\n\n\n\n②员工对公司相关制度掌握不足\n\n\n\n③岗位SOP知识抽查回答不熟练\n\n\n\n④设备故障报修跟进记录不完善；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①烧麦出现破皮，蒸制出品未按标准操作；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜内餐碟存在污渍、筷子残留残渣\n\n\n\n②饮水机斟水口有污渍未清洁\n\n\n\n③铜锅、锅架表面油渍、锅底有污渍\n\n\n\n④桌椅缝隙残留食物残渣\n\n\n\n⑤门店门玻璃留有手印污渍\n\n\n\n⑥门口三包区有纸巾杂物垃圾\n\n\n\n顾客不可视区域\n\n\n\n①收汁锅残留污渍未清洁干净\n\n\n\n②洗碗机内部存有污垢污渍\n\n\n\n③冰箱密封条积有污渍；[QSC] 5.食安类\n\n\n\n①常温库房原料开封后未封口储存\n\n\n\n②制冰机内部有水垢未清理\n\n\n\n③晨检相关台账记录未及时填写'}, {store: '杨庄地铁店', score: 90, findings: '[QSC] 1.值班类\n\n\n\n①在岗人员手机数量统计核对不一致\n\n\n\n②员工制度掌握抽查回答有误\n\n\n\n③岗位SOP知识抽查回答不熟练\n\n\n\n④设备出品检查记录不规范；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①番茄鱼出品未撒小葱，出品标准未落实\n\n\n\n②高峰期扣肉出现断档，菜品档口管控不足\n\n\n\n③蔬菜出现冻伤、黄豆未按要求存放冷冻冰箱，原料储存不当\n\n\n\n④剪刀工具存有污渍\n\n\n\n⑤蒜蓉粉丝虾粉丝发干，出品未达标；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①无回餐空位，回餐盘收纳不合理\n\n\n\n②洗碗间垃圾桶未加盖\n\n\n\n③开水器龙头、封膜机顶部存在污渍\n\n\n\n④冰箱密封条留有污渍\n\n\n\n顾客不可视区域\n\n\n\n无问题；[QSC] 5.食安类\n\n\n\n①餐盘柜未开启，餐盘无预热温度\n\n\n\n②晨检、食品添加剂台账记录未及时更新\n\n\n\n③垃圾没有完全分类\n\n\n\n④物料原料开封后未封口存放'}, {store: '嘉园店', score: 88, findings: '[QSC] 1.值班类\n\n\n\n①高峰期牛肉面估清断货，产品档口管控不足\n\n\n\n②门店广告机画面显示异常未及时处理报修\n\n\n\n③员工制度掌握抽查回答有误\n\n\n\n④岗位SOP知识抽查回答不熟练\n\n\n\n⑤广告机故障报修跟进不及时；[QSC] 2.服务类\n\n\n\n①后厨员工工服扣子未按规范扣好；[QSC] 3.产品类\n\n\n\n无问题；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜餐碟存有油渍、毛发\n\n\n\n②抽屉内部残留杂物残渣\n\n\n\n③洗碗间垃圾桶未加盖\n\n\n\n④门店大门玻璃留有胶痕污渍\n\n\n\n⑤墙面开关位置存在污渍\n\n\n\n⑥封膜机顶部留有污渍\n\n\n\n⑦消毒柜内部残留残渣\n\n\n\n顾客不可视区域\n\n\n\n①清洁工具摆放杂乱、剪刀存有污渍\n\n\n\n②后厨各类容器、设备表面油垢未清理\n\n\n\n③收汁台下方积存油垢\n\n\n\n④冰箱层架位置留有污渍；[QSC] 5.食安类\n\n\n\n①库房开封原料未封口储存\n\n\n\n②冰箱内物品堆放杂乱、包装箱直接放置冰箱\n\n\n\n③后厨区域发现苍蝇，虫害防控不到位'}]}, {id: 'dr0115', date: '2026-08-03', inspector: '王红丽', storeCount: 3, issuesCount: 3, type: 'offline', items: [{store: '暖山生活店', score: 93, findings: '[QSC] 长款20.1元'}, {store: '广源大厦店', score: 86, findings: '[QSC] 短款0.1元'}, {store: '和平东桥店', score: 92, findings: '[QSC] 无差异'}]}, {id: 'dr0116', date: '2026-08-03', inspector: '乔雨地', storeCount: 6, issuesCount: 15, type: 'offline', items: [{store: '玉桥中路店', score: 0, findings: '[QSC] 玉桥中路，经营四区，第一负责人王新龙；[QSC] 整体周清痕迹明显，设备底部干净，遗漏点：；[QSC] 冰箱层架有霉斑、污渍，密封条需要进一步清理'}, {store: '李老新村店', score: 0, findings: '[QSC] 李老新村，经营八区，区域直管；[QSC] 整体周清痕迹明显，忽略冰箱密封条卫生，前厅三个吊灯内部蜘蛛网未清理'}, {store: '通州梨园店', score: 0, findings: '[QSC] 通州梨园店，经营四区，店长张帅帅；[QSC] 整体周清痕迹明显，忽略点：冰箱层架夹缝霉斑，前厅墙角蜘蛛网，墙面胶痕'}, {store: '塔营北街店', score: 0, findings: '[QSC] 塔营北街店。经营四区，店长关姗姗；[QSC] 整体周清痕迹明显，效果良好；[QSC] 忽略冰箱柜门卫生，柜门油渍，层架污渍'}, {store: '甜水园店', score: 0, findings: '[QSC] 经营八区，甜水园店，店长郝帅杰；[QSC] 周清痕迹明显；[QSC] 但忽略了吧台的冰箱层架，发霉、长毛；制冰机少许青苔'}, {store: '东大桥店', score: 91, findings: '[QSC] 短款五元'}]}, {id: 'dr0117', date: '2026-08-04', inspector: '范晓明', storeCount: 3, issuesCount: 0, type: 'online', items: [{store: '北大地店', score: 89, findings: ''}, {store: '暖山生活店', score: 95, findings: ''}, {store: '周庄嘉园店', score: 83, findings: ''}]}, {id: 'dr0118', date: '2026-08-04', inspector: '张炜玉', storeCount: 8, issuesCount: 0, type: 'online', items: [{store: '杨庄地铁店', score: 86, findings: ''}, {store: '金融街店', score: 89, findings: ''}, {store: '迎春路店', score: 83, findings: ''}, {store: '右安门店', score: 87, findings: ''}, {store: '中关村南路店', score: 92, findings: ''}, {store: '古城大街店', score: 90, findings: ''}, {store: '航天桥店', score: 85, findings: ''}, {store: '车公庄店', score: 82, findings: ''}]}, {id: 'dr0119', date: '2026-08-04', inspector: '陶畅', storeCount: 3, issuesCount: 15, type: 'offline', items: [{store: '新桥南街店', score: 90, findings: '[QSC] 1.值班类\n\n\n\n①早餐产品供应管控不到位，9:05‑9:17松糕出现断档\n\n\n\n②员工对公司相关制度掌握不足\n\n\n\n③岗位SOP知识抽查回答不熟练\n\n\n\n④设备故障报修跟进记录不完善；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①烧麦出现破皮，蒸制出品未按标准操作；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜内餐碟存在污渍、筷子残留残渣\n\n\n\n②饮水机斟水口有污渍未清洁\n\n\n\n③铜锅、锅架表面油渍、锅底有污渍\n\n\n\n④桌椅缝隙残留食物残渣\n\n\n\n⑤门店门玻璃留有手印污渍\n\n\n\n⑥门口三包区有纸巾杂物垃圾\n\n\n\n顾客不可视区域\n\n\n\n①收汁锅残留污渍未清洁干净\n\n\n\n②洗碗机内部存有污垢污渍\n\n\n\n③冰箱密封条积有污渍；[QSC] 5.食安类\n\n\n\n①常温库房原料开封后未封口储存\n\n\n\n②制冰机内部有水垢未清理\n\n\n\n③晨检相关台账记录未及时填写'}, {store: '杨庄地铁店', score: 90, findings: '[QSC] 1.值班类\n\n\n\n①在岗人员手机数量统计核对不一致\n\n\n\n②员工制度掌握抽查回答有误\n\n\n\n③岗位SOP知识抽查回答不熟练\n\n\n\n④设备出品检查记录不规范；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①番茄鱼出品未撒小葱，出品标准未落实\n\n\n\n②高峰期扣肉出现断档，菜品档口管控不足\n\n\n\n③蔬菜出现冻伤、黄豆未按要求存放冷冻冰箱，原料储存不当\n\n\n\n④剪刀工具存有污渍\n\n\n\n⑤蒜蓉粉丝虾粉丝发干，出品未达标；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①无回餐空位，回餐盘收纳不合理\n\n\n\n②洗碗间垃圾桶未加盖\n\n\n\n③开水器龙头、封膜机顶部存在污渍\n\n\n\n④冰箱密封条留有污渍\n\n\n\n顾客不可视区域\n\n\n\n无问题；[QSC] 5.食安类\n\n\n\n①餐盘柜未开启，餐盘无预热温度\n\n\n\n②晨检、食品添加剂台账记录未及时更新\n\n\n\n③垃圾没有完全分类\n\n\n\n④物料原料开封后未封口存放'}, {store: '嘉园店', score: 88, findings: '[QSC] 1.值班类\n\n\n\n①高峰期牛肉面估清断货，产品档口管控不足\n\n\n\n②门店广告机画面显示异常未及时处理报修\n\n\n\n③员工制度掌握抽查回答有误\n\n\n\n④岗位SOP知识抽查回答不熟练\n\n\n\n⑤广告机故障报修跟进不及时；[QSC] 2.服务类\n\n\n\n①后厨员工工服扣子未按规范扣好；[QSC] 3.产品类\n\n\n\n无问题；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜餐碟存有油渍、毛发\n\n\n\n②抽屉内部残留杂物残渣\n\n\n\n③洗碗间垃圾桶未加盖\n\n\n\n④门店大门玻璃留有胶痕污渍\n\n\n\n⑤墙面开关位置存在污渍\n\n\n\n⑥封膜机顶部留有污渍\n\n\n\n⑦消毒柜内部残留残渣\n\n\n\n顾客不可视区域\n\n\n\n①清洁工具摆放杂乱、剪刀存有污渍\n\n\n\n②后厨各类容器、设备表面油垢未清理\n\n\n\n③收汁台下方积存油垢\n\n\n\n④冰箱层架位置留有污渍；[QSC] 5.食安类\n\n\n\n①库房开封原料未封口储存\n\n\n\n②冰箱内物品堆放杂乱、包装箱直接放置冰箱\n\n\n\n③后厨区域发现苍蝇，虫害防控不到位'}]}, {id: 'dr0120', date: '2026-08-04', inspector: '王红丽', storeCount: 3, issuesCount: 3, type: 'offline', items: [{store: '暖山生活店', score: 93, findings: '[QSC] 长款20.1元'}, {store: '广源大厦店', score: 86, findings: '[QSC] 短款0.1元'}, {store: '和平东桥店', score: 92, findings: '[QSC] 无差异'}]}, {id: 'dr0121', date: '2026-08-04', inspector: '乔雨地', storeCount: 6, issuesCount: 15, type: 'offline', items: [{store: '玉桥中路店', score: 0, findings: '[QSC] 玉桥中路，经营四区，第一负责人王新龙；[QSC] 整体周清痕迹明显，设备底部干净，遗漏点：；[QSC] 冰箱层架有霉斑、污渍，密封条需要进一步清理'}, {store: '李老新村店', score: 0, findings: '[QSC] 李老新村，经营八区，区域直管；[QSC] 整体周清痕迹明显，忽略冰箱密封条卫生，前厅三个吊灯内部蜘蛛网未清理'}, {store: '通州梨园店', score: 0, findings: '[QSC] 通州梨园店，经营四区，店长张帅帅；[QSC] 整体周清痕迹明显，忽略点：冰箱层架夹缝霉斑，前厅墙角蜘蛛网，墙面胶痕'}, {store: '塔营北街店', score: 0, findings: '[QSC] 塔营北街店。经营四区，店长关姗姗；[QSC] 整体周清痕迹明显，效果良好；[QSC] 忽略冰箱柜门卫生，柜门油渍，层架污渍'}, {store: '甜水园店', score: 0, findings: '[QSC] 经营八区，甜水园店，店长郝帅杰；[QSC] 周清痕迹明显；[QSC] 但忽略了吧台的冰箱层架，发霉、长毛；制冰机少许青苔'}, {store: '东大桥店', score: 91, findings: '[QSC] 短款五元'}]}, {id: 'dr0122', date: '2026-08-05', inspector: '马昕茹', storeCount: 5, issuesCount: 0, type: 'online', items: [{store: '朝丰家园店', score: 86, findings: ''}, {store: '马家堡店', score: 85, findings: ''}, {store: '光彩路店', score: 87, findings: ''}, {store: '小营西路店', score: 95, findings: ''}, {store: '枣园地铁店', score: 92, findings: ''}]}, {id: 'dr0123', date: '2026-08-05', inspector: '张炜玉', storeCount: 8, issuesCount: 0, type: 'online', items: [{store: '万航渡路店', score: 81, findings: ''}, {store: '杨庄东街店', score: 91, findings: ''}, {store: '左安门店', score: 86, findings: ''}, {store: '汇融天地店', score: 85, findings: ''}, {store: '丰管路店', score: 84, findings: ''}, {store: '古城大街店', score: 90, findings: ''}, {store: '航天桥店', score: 85, findings: ''}, {store: '车公庄店', score: 82, findings: ''}]}, {id: 'dr0124', date: '2026-08-05', inspector: '陶畅', storeCount: 5, issuesCount: 25, type: 'offline', items: [{store: '石榴园店', score: 83, findings: '[QSC] 1.值班类\n\n\n\n①在岗人员手机数量收集不一致\n\n\n\n②早餐9:30后产品断档，豆腐脑断档10分钟；[QSC] 2.服务类\n\n\n\n①后厨员工工服纽扣未扣齐；[QSC] 3.产品类\n\n\n\n①蔬菜包存在冻伤情况\n\n\n\n②制备区香菜发黄；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜内餐具有残渣污渍\n\n\n\n②洗手池周边存有垃圾\n\n\n\n③垃圾桶未加盖\n\n\n\n④三包区域烟头、纸巾垃圾未清理\n\n\n\n⑤设备表面存在污渍，封膜机有污渍\n\n\n\n⑥消毒柜内部有毛发\n\n\n\n顾客不可视区域\n\n\n\n①后厨设备下方地面卫生较差\n\n\n\n②收汁锅未清洁留有污渍\n\n\n\n③洗碗间有水垢油污、地面不干净\n\n\n\n④冰柜密封条存有污渍；[QSC] 5.食安类\n\n\n\n①原材料未做到先进先出\n\n\n\n②常温库存原料开封后未封口储存\n\n\n\n③制冰机内部存有残渣污垢未清理\n\n\n\n④员工水杯未集中定点存放\n\n\n\n⑤案板刀具残留食物残渣\n\n\n\n⑥后厨区域发现苍蝇\n\n\n\n⑦各类台账记录更新不及时'}, {store: '木樨园桥西店', score: 86, findings: '[QSC] 1.值班类\n\n\n\n无问题；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①洋葱上冻储存\n\n\n\n②烤串鸡肉皮单独成块，操作不符合标准\n\n\n\n③黄焖鸡收汁不够浓稠，出品不达标；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜餐具残留残渣\n\n\n\n②垃圾桶没有加盖\n\n\n\n②门框上方存有蜘蛛网小虫\n\n\n\n③封膜机、豆浆机机盖污渍未清理\n\n\n\n④吧台水池下方存有污渍\n\n\n\n⑤消毒柜底部积灰\n\n\n\n顾客不可视区域\n\n\n\n①清洁工具摆放杂乱、剪刀存有污渍\n\n\n\n②洗碗间台面下方结蜘蛛网\n\n\n\n③库房货架下方有蜘蛛网\n\n\n\n④冰柜密封条、冰箱内侧边角污渍未清理；[QSC] 5.食安类\n\n\n\n①原材料未落实先进先出\n\n\n\n②开封物料未封口保存\n\n\n\n③制冰机内部有水垢污垢\n\n\n\n④案板、刀具存有残渣飞虫'}, {store: '天桥店', score: 87, findings: '[QSC] 1.值班类\n\n\n\n无问题；[QSC] 2.服务类\n\n\n\n①收台员工未按要求佩戴腰包；[QSC] 3.产品类\n\n\n\n①洋葱、螺丝椒上冻储存\n\n\n\n②香菜存在黄叶\n\n\n\n③烤串鸡皮单独成块，操作不标准\n\n\n\n④烤串出现漏签问题\n\n\n\n⑤红烧鲈鱼出品碗边没有擦拭干净；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①洗碗间垃圾桶未加盖\n\n\n\n顾客不可视区域\n\n\n\n①锅贴机油槽、蒸饭车把手留有油渍\n\n\n\n②冰柜滤网、密封条污渍未清洁；[QSC] 5.食安类\n\n\n\n①牛奶原材料未离地存放\n\n\n\n②制冰机内部有水垢污垢\n\n\n\n③刀具存有食物残渣\n\n\n\n④台账晨检记录、添加剂记录未及时更新'}, {store: '日坛北路店', score: 86, findings: '[QSC] 1.值班类\n\n\n\n无问题；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①蔬菜存在冻伤\n\n\n\n②香菜烂叶\n\n\n\n③烤串黑边没有修剪，出品不合格；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜小碟子存有污渍\n\n\n\n②抽屉内部留有鸡蛋壳残渣\n\n\n\n③门框留有胶痕污渍\n\n\n\n④豆浆机、封膜机顶部污渍未清理\n\n\n\n⑤消毒柜内部残留残渣\n\n\n\n顾客不可视区域\n\n\n\n①清洁工具摆放杂乱，剪刀留有污渍\n\n\n\n②蒸饭车把手油渍、备餐间水池污渍\n\n\n\n③后厨风口存有毛絮、天花板污渍\n\n\n\n④洗碗机内部有水垢\n\n\n\n⑤库房风口毛絮堆积\n\n\n\n⑥冰箱滤网、密封条污渍未清理；[QSC] 5.食安类\n\n\n\n①开封辣椒物料没有封口储存\n\n\n\n②制冰机水槽有水垢污渍\n\n\n\n③案板刀具残留食物残渣\n\n\n\n④各类台账记录未及时更新'}, {store: '将台路店', score: 91, findings: '[QSC] 1.值班类\n\n\n\n无问题；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①蔬菜存放出现上冻情况\n\n\n\n②剪刀存有污渍\n\n\n\n③蒜蓉粉丝虾蒜蓉铺撒不均匀，出品不达标；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①垃圾桶外围脏污\n\n\n\n②餐桌台面残留残渣油渍\n\n\n\n③餐盘存有毛发、餐碟残留残渣\n\n\n\n④饮水机出水口污渍\n\n\n\n⑤洗碗间垃圾桶未加盖\n\n\n\n⑥封膜机、开水器有水垢污渍\n\n\n\n⑦消毒柜内部残留残渣\n\n\n\n⑧冰箱密封条侧边存有污渍\n\n\n\n顾客不可视区域\n\n\n\n①外卖柜门胶条、蒸饭车把手油渍\n\n\n\n②天花板上方堆积毛絮\n\n\n\n③洗碗间内部水垢、墙面留有污渍；[QSC] 5.食安类\n\n\n\n①托盘残留食物残渣\n\n\n\n②筷子存有残渣污渍\n\n\n\n③员工水杯未集中存放\n\n\n\n④剩余物料储存未封口'}]}, {id: 'dr0126', date: '2026-08-05', inspector: '王红丽', storeCount: 4, issuesCount: 4, type: 'offline', items: [{store: '五道口店', score: 82, findings: '[QSC] 无差异'}, {store: '马连洼店', score: 85, findings: '[QSC] 无差异'}, {store: '霍营地铁店', score: 91, findings: '[QSC] 短款7元'}, {store: '温都水城店', score: 89, findings: '[QSC] 无差异'}]}, {id: 'dr0127', date: '2026-08-06', inspector: '马昕茹', storeCount: 2, issuesCount: 0, type: 'online', items: [{store: '国展店', score: 86, findings: ''}, {store: '迎春路店', score: 85, findings: ''}]}, {id: 'dr0128', date: '2026-08-06', inspector: '张炜玉', storeCount: 8, issuesCount: 0, type: 'online', items: [{store: '西八里庄店', score: 91, findings: ''}, {store: '兴丰大街店', score: 92, findings: ''}, {store: '左安门店', score: 86, findings: ''}, {store: '汇融天地店', score: 85, findings: ''}, {store: '丰管路店', score: 84, findings: ''}, {store: '古城大街店', score: 90, findings: ''}, {store: '航天桥店', score: 85, findings: ''}, {store: '车公庄店', score: 82, findings: ''}]}, {id: 'dr0129', date: '2026-08-06', inspector: '陶畅', storeCount: 4, issuesCount: 20, type: 'offline', items: [{store: '良乡店', score: 89, findings: '[QSC] 1.值班类\n\n\n\n①早餐时段虾仁锅贴、松糕素包出现断档，早餐产品供应未达标\n\n\n\n②员工SOP知识抽查掌握度不足，部分问题回答错误；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n无问题；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜内餐具残留残渣污垢\n\n\n\n②餐桌椅表面存在残渣、小飞虫\n\n\n\n③门店对外企划海报未按时翻面更新\n\n\n\n④封膜机顶部存在污渍\n\n\n\n顾客不可视区域\n\n\n\n①蒸饭车把手、烤箱存有油渍未清洁\n\n\n\n②洗碗机封条有水垢污渍\n\n\n\n③冰柜门下方积有油垢；[QSC] 5.食安类\n\n\n\n①辣椒段未执行先进先出原则\n\n\n\n②面条、烤串原材料开封后未加盖密封存放\n\n\n\n③制冰机水槽有水垢\n\n\n\n④净水机内部发现飞虫尸体\n\n\n\n⑤菜板残留食物残渣'}, {store: '鲁谷银河店', score: 91, findings: '[QSC] 1.值班类\n\n\n\n①员工岗位SOP知识点回答有误；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①圆白菜、洋葱存在冻伤情况；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①洗手间出风口积存毛絮\n\n\n\n②墙面存在毛絮灰尘\n\n\n\n③收银台上方出风口未清洁\n\n\n\n④开水机、封膜机顶部积灰污渍\n\n\n\n⑤消毒柜内部残留毛发、残渣\n\n\n\n顾客不可视区域\n\n\n\n①剪刀存有污渍\n\n\n\n②库房货架下方堆放垃圾残渣\n\n\n\n③后厨冰箱密封条、层架油污未清理；[QSC] 5.食安类\n\n\n\n①茶叶蛋原材料开封后未完全封口\n\n\n\n②制冰机水槽有水垢、冰铲污渍\n\n\n\n③灭蝇灯粘虫纸未及时更换'}, {store: '三环新城店', score: 90, findings: '[QSC] 1.值班类\n\n\n\n①员工SOP知识抽查部分原料克数回答错误；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①制备区香菜存在黄叶，原料品相不合格；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①饮水机出水口存在污渍\n\n\n\n②餐椅表面残留食物残渣\n\n\n\n③豆浆机、封膜机存有污渍未清洁干净\n\n\n\n④吧台水池下方有污渍\n\n\n\n⑤消毒柜抽屉内部有毛发\n\n\n\n⑥炒菜机旁玻璃留有油渍\n\n\n\n顾客不可视区域\n\n\n\n①剪刀存在油渍\n\n\n\n②油条机柜门存有油渍；[QSC] 5.食安类\n\n\n\n①垃圾未做到完全分类投放\n\n\n\n②葱油未落实先进先出\n\n\n\n③食材开封存放未封口\n\n\n\n④净水机内部存在虫子尸体'}, {store: '白纸坊店', score: 89, findings: '[QSC] 1.值班类\n\n\n\n①员工SOP考核多项原料参数回答错误；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①香菜带有黄叶、小葱切制不符合标准；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜内筷子、水杯残留残渣、毛发\n\n\n\n②饮水机斟水口周边存在污渍\n\n\n\n③门框有蛛网、门锁留有胶痕\n\n\n\n④封膜机顶部、豆浆机盖子污渍未清理\n\n\n\n⑤消毒柜内部存有残渣\n\n\n\n顾客不可视区域\n\n\n\n①后厨设备下方清洁不到位\n\n\n\n②锅贴机油槽未清理\n\n\n\n③洗碗机有水垢污渍\n\n\n\n④库房货架下方残留污渍残渣\n\n\n\n⑤冰柜层架、密封条存有污渍；[QSC] 5.食安类\n\n\n\n①冰箱内存放物品存在交叉污染风险\n\n\n\n②制冰机水槽留有污渍\n\n\n\n③菜板存在残渍、掉漆\n\n\n\n④后厨区域发现蚊虫，虫害防控不到位'}]}, {id: 'dr0130', date: '2026-08-06', inspector: '徐瑞雪', storeCount: 4, issuesCount: 4, type: 'offline', items: [{store: '大钟寺店', score: 87, findings: '[QSC] 无差异'}, {store: '中关村南路店', score: 93, findings: '[QSC] ﻿长款17.45元（备用金500无误，另一个钱箱内17.5为私人款项换零钱放入）'}, {store: '双榆树店', score: 90, findings: '[QSC] 无差异'}, {store: '昌平南环路店', score: 87, findings: '[QSC] 无差异'}]}, {id: 'dr0131', date: '2026-08-06', inspector: '乔雨地', storeCount: 5, issuesCount: 5, type: 'offline', items: [{store: '拱辰南大街店', score: 86, findings: '[QSC] 无误差'}, {store: '晓月中路店', score: 92, findings: '[QSC] 长款4.2元'}, {store: '丰台南路店', score: 93, findings: '[QSC] 无误差'}, {store: '东大街店', score: 94, findings: '[QSC] 无误差'}, {store: '南站店', score: 93, findings: '[QSC] 无误差'}]}, {id: 'dr0132', date: '2026-08-07', inspector: '张炜玉', storeCount: 8, issuesCount: 0, type: 'online', items: [{store: '白纸坊店', score: 83, findings: ''}, {store: '垡头店', score: 90, findings: ''}, {store: '天通东苑店', score: 92, findings: ''}, {store: '富力又一城店', score: 91, findings: ''}, {store: '丰管路店', score: 84, findings: ''}, {store: '古城大街店', score: 90, findings: ''}, {store: '航天桥店', score: 85, findings: ''}, {store: '车公庄店', score: 82, findings: ''}]}, {id: 'dr0133', date: '2026-08-07', inspector: '钱磊', storeCount: 5, issuesCount: 0, type: 'online', items: [{store: '广渠门外大街店', score: 90, findings: ''}, {store: '马连道店', score: 93, findings: ''}, {store: '草房地铁店', score: 84, findings: ''}, {store: '泰和园店', score: 96, findings: ''}, {store: '土桥店', score: 87, findings: ''}]}, {id: 'dr0134', date: '2026-08-07', inspector: '陶畅', storeCount: 5, issuesCount: 25, type: 'offline', items: [{store: '红庙店', score: 89, findings: '[QSC] 1.值班类\n\n\n\n①员工工装形象不达标，人员着装未做到干净整洁\n\n\n\n②财务台账存在短款8.22元，台账管理存在问题；[QSC] 2.服务类\n\n\n\n①服务台未主动介绍餐具位置\n\n\n\n②前厅服务话术频次低，未做到到店主动问候；[QSC] 3.产品类\n\n\n\n①原材料葱花存在冻伤情况；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①桌面有汤汁、牛奶残渣未及时清理\n\n\n\n②洗手间镜子存在水印\n\n\n\n③三包区地面存在垃圾\n\n\n\n④开水器龙头有水渍污渍\n\n\n\n⑤消毒柜内部存在残渣、头发\n\n\n\n⑥外卖台冰箱滤网未清洁\n\n\n\n顾客不可视区域\n\n\n\n①洗碗间垃圾桶未盖盖子\n\n\n\n②工具刀具摆放杂乱，剪刀未清洁\n\n\n\n③后厨设备下方卫生未清洁\n\n\n\n④电子秤存在油渍\n\n\n\n⑤洗碗机密封条有水垢水渍\n\n\n\n⑥库房货架下方卫生未清洁；[QSC] 5.食安类\n\n\n\n①托盘存在残渣污渍\n\n\n\n②餐盘餐碟存在残渣污渍\n\n\n\n③筷子存在残渣污渍\n\n\n\n④晨检台账未更新\n\n\n\n⑤物料未封口存放'}, {store: '十里堡店', score: 90, findings: '[QSC] 1.值班类\n\n\n\n①员工佩戴项链，工装形象不规范\n\n\n\n②财务台账短款5.3元，台账管理异常；[QSC] 2.服务类\n\n\n\n无；[QSC] 3.产品类\n\n\n\n①番茄鱼出品品质不达标，西红柿糊锅\n\n\n\n②原材料蔬菜存在冻伤；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①垃圾桶外围存在污渍\n\n\n\n②大门玻璃存在大量手印脏污\n\n\n\n③桌面存在椅面残渣未清理\n\n\n\n④饮水机斟出口存在污渍\n\n\n\n⑤洗手台镜子有水渍\n\n\n\n⑥洗碗间垃圾桶未加盖\n\n\n\n⑦门框毛絮、门锁存在胶痕\n\n\n\n⑧空调散热口积灰\n\n\n\n⑨开关存在污渍\n\n\n\n⑩封膜机顶部存在污渍\n\n\n\n顾客不可视区域\n\n\n\n①冰箱封条存在污渍、内部有残渣\n\n\n\n②油条机柜门存在油渍\n\n\n\n③洗碗机有水垢污渍；[QSC] 5.食安类\n\n\n\n①托盘存在残渣、残渣污渍\n\n\n\n②晨检台账填写不完整\n\n\n\n③员工水杯未集中存放\n\n\n\n④茶叶蛋物料未完全封口'}, {store: '十里堡地铁店', score: 87, findings: '[QSC] 1.值班类\n\n\n\n无；[QSC] 2.服务类\n\n\n\n①上餐未按要求使用托盘；[QSC] 3.产品类\n\n\n\n①备餐区香菜存在黑叶，原料处理不到位；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜内部餐碟存在污渍残渣\n\n\n\n②桌面存在残渣未清理\n\n\n\n③封膜机顶部存在污渍\n\n\n\n④消毒柜内部积灰\n\n\n\n顾客不可视区域\n\n\n\n①剪刀存在油渍，工具摆放杂乱\n\n\n\n②烤串冰箱、备餐间冰箱下方存在污渍\n\n\n\n③蒸饭车把手存在油渍\n\n\n\n④收汁台下方存在油垢\n\n\n\n⑤冰箱门、封条存在毛絮污渍；[QSC] 5.食安类\n\n\n\n①物料未执行先进先出原则\n\n\n\n②花椒、大米等物料开封后未封口\n\n\n\n③制冰机内部有水垢污渍\n\n\n\n④刀具案板存在食物残渣\n\n\n\n⑤后厨出现苍蝇虫害问题'}, {store: '石佛营店', score: 86, findings: '[QSC] 1.值班类\n\n\n\n①后厨男员工未佩戴工牌，前厅员工工服扣子未扣齐\n\n\n\n②店长不在岗，门店主体责任无法核查\n\n\n\n③采购台账8月份记录缺失，食安文件台账不全；[QSC] 2.服务类\n\n\n\n无；[QSC] 3.产品类\n\n\n\n①备餐区香菜存在黄叶，原料处理不合格；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜内餐具存在污渍\n\n\n\n②饮水机斟出口存在污渍\n\n\n\n③三包区地面存在垃圾\n\n\n\n④开水机龙头、封膜机顶部存在污渍\n\n\n\n⑤消毒柜内部存在残渣\n\n\n\n顾客不可视区域\n\n\n\n①剪刀存在油垢，工具摆放杂乱\n\n\n\n②烤串冰箱下方卫生未清洁\n\n\n\n③蒸饭车把手存在油垢\n\n\n\n④洗碗机存在水垢\n\n\n\n⑤冰箱层架、封条存在污渍；[QSC] 5.食安类\n\n\n\n①物料未执行先进先出\n\n\n\n②开封产品未封口存放\n\n\n\n③制冰机有水垢污渍\n\n\n\n④案板刀具存在食物残渣'}, {store: '新天地店', score: 89, findings: '[QSC] 1.值班类\n\n\n\n①财务台账短款1.1元；[QSC] 2.服务类\n\n\n\n无；[QSC] 3.产品类\n\n\n\n①圆白菜原材料冻伤\n\n\n\n②备餐区香菜出现烂叶；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜餐碟存在残渣污渍\n\n\n\n②抽屉内部留有残渣\n\n\n\n③洗手池存在污渍\n\n\n\n④桌面有椅面残渣\n\n\n\n⑤天花板存在蜘蛛网\n\n\n\n顾客不可视区域\n\n\n\n①后厨水池、外卖台冰箱底部存在污渍\n\n\n\n②冲汤机存在污渍\n\n\n\n③收汁台下方油垢，收油容器污渍\n\n\n\n④洗碗机存在污垢\n\n\n\n⑤冰箱封条存在污渍；[QSC] 5.食安类\n\n\n\n①开封物料未封口存放\n\n\n\n②制冰机有水垢污渍\n\n\n\n③员工水杯未集中存放\n\n\n\n④案板存在食物残渣'}]}, {id: 'dr0135', date: '2026-08-07', inspector: '范晓明', storeCount: 6, issuesCount: 0, type: 'online', items: [{store: '灯市口地铁店', score: 89, findings: ''}, {store: '石榴园店', score: 82, findings: ''}, {store: '四路通店', score: 95, findings: ''}, {store: '开阳里店', score: 91, findings: ''}, {store: '东四南大街店', score: 87, findings: ''}, {store: '小营路店', score: 90, findings: ''}]}, {id: 'dr0136', date: '2026-08-07', inspector: '乔雨地', storeCount: 4, issuesCount: 4, type: 'offline', items: [{store: '丰台大悦春风里店', score: 89, findings: '[QSC] 无误差'}, {store: '角北店', score: 85, findings: '[QSC] 长款5.6元'}, {store: '西马场店', score: 83, findings: '[QSC] 短款192.5元'}, {store: '赵公口店', score: 92, findings: '[QSC] 无误差'}]}, {id: 'dr0137', date: '2026-08-07', inspector: '王红丽', storeCount: 4, issuesCount: 4, type: 'offline', items: [{store: '东中街店', score: 87, findings: '[QSC] 无差异'}, {store: '和平里店', score: 88, findings: '[QSC] 长款0.5元'}, {store: '科学院南路店', score: 87, findings: '[QSC] 无差异'}, {store: '金融街店', score: 90, findings: '[QSC] 短款1.8元'}]}, {id: 'dr0138', date: '2026-08-07', inspector: '徐瑞雪', storeCount: 4, issuesCount: 4, type: 'offline', items: [{store: '东坝店', score: 83, findings: '[QSC] 无差异'}, {store: '常营V中心店', score: 93, findings: '[QSC] 长款0.48元'}, {store: '青年路店', score: 90, findings: '[QSC] 长款0.1元'}, {store: '大柳树店', score: 86, findings: '[QSC] 无差异'}]}, {id: 'dr0139', date: '2026-08-08', inspector: '马昕茹', storeCount: 4, issuesCount: 0, type: 'online', items: [{store: '方庄店', score: 0, findings: ''}, {store: '泰和园店', score: 0, findings: ''}, {store: '天通东苑店', score: 0, findings: ''}, {store: '富力又一城店', score: 0, findings: ''}]}, {id: 'dr0140', date: '2026-08-08', inspector: '张炜玉', storeCount: 8, issuesCount: 0, type: 'online', items: [{store: '东大桥店', score: 88, findings: ''}, {store: '金融街店', score: 90, findings: ''}, {store: '天通东苑店', score: 92, findings: ''}, {store: '富力又一城店', score: 91, findings: ''}, {store: '丰管路店', score: 84, findings: ''}, {store: '古城大街店', score: 90, findings: ''}, {store: '航天桥店', score: 85, findings: ''}, {store: '车公庄店', score: 82, findings: ''}]}, {id: 'dr0141', date: '2026-08-08', inspector: '钱磊', storeCount: 1, issuesCount: 0, type: 'online', items: [{store: '双井桥东店', score: 90, findings: ''}]}, {id: 'dr0142', date: '2026-08-08', inspector: '陶畅', storeCount: 2, issuesCount: 10, type: 'offline', items: [{store: '夕照寺店', score: 90, findings: '[QSC] 1.值班类\n\n\n\n无问题；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①香菜存在黄叶；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜筷子存在污渍\n\n\n\n②饮水机斟出口污渍\n\n\n\n③桌面存在污渍残渣\n\n\n\n④垃圾桶未加盖\n\n\n\n⑤门框角落有毛絮蜘蛛网\n\n\n\n⑥吊灯未正常开启\n\n\n\n⑦豆浆机盖子清洁不彻底\n\n\n\n⑧消毒柜内部有灰尘虫子尸体\n\n\n\n顾客不可视区域\n\n\n\n①外卖台下方存在污渍\n\n\n\n②蒸饭车把手存在油渍\n\n\n\n③洗碗机密封条有污渍\n\n\n\n④库房货架下方有残渣\n\n\n\n⑤冰柜层架存在污渍；[QSC] 5.食安类\n\n\n\n①开封产品未封口储存\n\n\n\n②制冰机水槽有水垢残渣'}, {store: '和义南站店', score: 88, findings: '[QSC] 1.值班类\n\n\n\n①值班经理长时间离岗顶岗；[QSC] 2.服务类\n\n\n\n①收桌后手部未消毒就上餐；[QSC] 3.产品类\n\n\n\n①香菇片、圆白菜出现冻伤；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①卫生间风口有毛絮\n\n\n\n②椅面存在残渣\n\n\n\n③铜牌标牌存在污渍\n\n\n\n④门口三包区域存在垃圾\n\n\n\n⑤消毒柜内部有毛发污渍\n\n\n\n顾客不可视区域\n\n\n\n①剪刀工具存在污渍\n\n\n\n②锅贴机油槽未清洁干净\n\n\n\n③蒸饭车把手有油渍\n\n\n\n④后厨风口存在毛絮\n\n\n\n⑤收汁台下方有油垢\n\n\n\n⑥洗碗机盖子、密封条有污渍\n\n\n\n⑦后厨冰箱密封条存在污渍；[QSC] 5.食安类\n\n\n\n①咸菜开封后未封口\n\n\n\n②净水滤芯到期未更换\n\n\n\n③砧板刀具存在食物残渣\n\n\n\n④灭蝇灯未开启'}]}, {id: 'dr0143', date: '2026-08-08', inspector: '王红丽', storeCount: 5, issuesCount: 5, type: 'offline', items: [{store: '万源路店', score: 87, findings: '[QSC] 长款0.4元'}, {store: '阜成门店', score: 91, findings: '[QSC] 无差异'}, {store: '莲怡园店', score: 80, findings: '[QSC] 短款10元'}, {store: '达官营店', score: 89, findings: '[QSC] 无差异'}, {store: '小马厂店', score: 91, findings: '[QSC] 短款1.7元'}]}, {id: 'dr0144', date: '2026-08-08', inspector: '乔雨地', storeCount: 2, issuesCount: 2, type: 'offline', items: [{store: '大兴龙湖天街店', score: 92, findings: '[QSC] 无误差'}, {store: '黄村西大街店', score: 90, findings: '[QSC] 无误差'}]}, {id: 'dr0145', date: '2026-08-08', inspector: '徐瑞雪', storeCount: 3, issuesCount: 3, type: 'offline', items: [{store: '平乐园店', score: 88, findings: '[QSC] 备用金600，钱箱总额896.7元，今日现金收入257.9，长款36.8元（6.8元为收银员早餐一个订单未入机，30元为店长私人款项换零钱放入）'}, {store: '兴丰大街店', score: 88, findings: '[QSC] 长款0.48元'}, {store: '枣园店', score: 88, findings: '[QSC] 无差异'}]}, {id: 'dr0146', date: '2026-08-09', inspector: '马昕茹', storeCount: 4, issuesCount: 0, type: 'online', items: [{store: '万源路店', score: 81, findings: ''}, {store: '798店', score: 94, findings: ''}, {store: '亦庄桥店', score: 94, findings: ''}, {store: '马连洼店', score: 92, findings: ''}]}, {id: 'dr0147', date: '2026-08-09', inspector: '钱磊', storeCount: 4, issuesCount: 0, type: 'online', items: [{store: '西罗园店', score: 87, findings: ''}, {store: '赵公口店', score: 96, findings: ''}, {store: '霍营地铁店', score: 88, findings: ''}, {store: '北京站店', score: 91, findings: ''}]}, {id: 'dr0148', date: '2026-08-09', inspector: '范晓明', storeCount: 5, issuesCount: 0, type: 'online', items: [{store: '七里庄店', score: 88, findings: ''}, {store: '春秀路店', score: 91, findings: ''}, {store: '甜水园店', score: 91, findings: ''}, {store: '金顶北路店', score: 87, findings: ''}, {store: '正阳大街店', score: 87, findings: ''}]}, {id: 'dr0149', date: '2026-08-09', inspector: '陶畅', storeCount: 4, issuesCount: 20, type: 'offline', items: [{store: '新街口店', score: 87, findings: '[QSC] 1.值班类\n\n\n\n①后厨员工佩戴手链，员工工服扣子缺少一颗；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①蔬菜存在冻伤情况\n\n\n\n②香菜黄叶，原材料处理不达标；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①饮水机斟出口污渍\n\n\n\n②抽屉内部存在残渣\n\n\n\n③卫生间洗手台、镜子有水渍\n\n\n\n④椅面存在残渣\n\n\n\n⑤垃圾桶未加盖子\n\n\n\n⑥开关存在污渍\n\n\n\n⑦消毒柜下方有灰尘残渣\n\n\n\n⑧出餐口玻璃存在污渍\n\n\n\n顾客不可视区域\n\n\n\n①剪刀工具有污渍\n\n\n\n②收汁台下方存在油垢\n\n\n\n③洗碗机设备、盘子有污渍油垢\n\n\n\n④库房货架下方未清洁\n\n\n\n⑤冰柜滤网、密封条存在污渍毛絮；[QSC] 5.食安类\n\n\n\n①开封原材料未封口储存\n\n\n\n②原材料未离地存放\n\n\n\n③制冰机内部有水垢\n\n\n\n④刀具砧板有残渣，未分色管理'}, {store: '崇文门店', score: 92, findings: '[QSC] 1.值班类\n\n\n\n无问题；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①圆白菜冻伤\n\n\n\n②香菜存在烂叶；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①椅面存在残渣\n\n\n\n②收银机表面存在污渍\n\n\n\n③出餐口玻璃有油渍\n\n\n\n顾客不可视区域\n\n\n\n①洗碗间封条存在油渍\n\n\n\n②冰柜密封条存在污渍；[QSC] 5.食安类\n\n\n\n①垃圾未完全分类\n\n\n\n②花椒开封后未封口\n\n\n\n③制冰机水槽存在水垢'}, {store: '潘家园东路店', score: 87, findings: '[QSC] 1.值班类\n\n\n\n①在岗员工手机未交齐\n\n\n\n②钱箱钥匙未拔下；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①香菜存在烂叶；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①消毒柜筷子内有残渣\n\n\n\n②抽屉内部有鸡蛋皮残渣\n\n\n\n③椅面存在残渣\n\n\n\n④后厨开关有污渍\n\n\n\n⑤企划海报未翻面\n\n\n\n⑥封膜机、豆浆机顶部有污渍\n\n\n\n顾客不可视区域\n\n\n\n①风口存在毛絮\n\n\n\n②收汁台下方有油垢\n\n\n\n③洗碗间有水垢\n\n\n\n④货架下方未清洁\n\n\n\n⑤冰箱密封条存在污渍；[QSC] 5.食安类\n\n\n\n①茶叶蛋开封未封口\n\n\n\n②冰箱内生熟存在交叉污染\n\n\n\n③制冰机水槽有水渍水垢\n\n\n\n④砧板刀具残留食物残渣\n\n\n\n⑤灭蝇纸需要更换'}, {store: '左安门店', score: 90, findings: '[QSC] 1.值班类\n\n\n\n①在岗人员上交手机数量不一致；[QSC] 2.服务类\n\n\n\n无问题；[QSC] 3.产品类\n\n\n\n①豆腐脑高峰期断档\n\n\n\n②香菇片原材料冻伤\n\n\n\n③早餐肉包破损，出品不合格；[QSC] 4.环境类\n\n\n\n顾客可视区域\n\n\n\n①垃圾桶外围存在污渍\n\n\n\n②桌面有食物残渣\n\n\n\n③无回餐空位\n\n\n\n④门口三包区存在垃圾\n\n\n\n⑤空调散热口积攒灰尘\n\n\n\n⑥开关表面存在污渍\n\n\n\n⑦冰柜密封条有污渍\n\n\n\n顾客不可视区域\n\n\n\n①库房货架底部存在污渍；[QSC] 5.食安类\n\n\n\n①托盘存在残渣纸屑\n\n\n\n②餐碟内有毛发残渣\n\n\n\n③晨检记录未及时更新\n\n\n\n④灭蝇灯未开启'}]}, {id: 'dr0150', date: '2026-08-09', inspector: '乔雨地', storeCount: 4, issuesCount: 4, type: 'offline', items: [{store: '万寿路西街店', score: 88, findings: '[QSC] 无误差'}, {store: '定慧寺店', score: 90, findings: '[QSC] 短款0.49元'}, {store: '彰化路店', score: 90, findings: '[QSC] 无误差'}, {store: '远大路店', score: 87, findings: '[QSC] 短款99.6元'}]}, {id: 'dr0151', date: '2026-08-09', inspector: '王红丽', storeCount: 4, issuesCount: 4, type: 'offline', items: [{store: '马驹桥店', score: 85, findings: '[QSC] 无差异'}, {store: '三营门店', score: 89, findings: '[QSC] 无差异'}, {store: '灯市口地铁店', score: 90, findings: '[QSC] 长款10元'}, {store: '西罗园店', score: 84, findings: '[QSC] 长款5元'}]}],

    inspection_templates: [{"id":"tpl1786091061234","name":"6月优化部用-2026年2月2.0_2.5门店线上检查表格大迭代3.0","version":1,"items":[{"index":0,"score":2,"content":"早餐粥类产品按标准进行操作（皮蛋粥、红豆粥、小米粥、酸辣汤、牛奶、豆浆、橙汁、豆腐脑）；","category":"","deductRule":"2.0"},{"index":1,"score":2,"content":"早餐煎制产品按标准进行操作（锅贴）；","category":"","deductRule":"2.0"},{"index":2,"score":2,"content":"早餐炸制产品按照标准进行操作（油条、炸糕）；","category":"","deductRule":"2.0"},{"index":3,"score":2,"content":"制备区产品按照标准进行操作（焯制拌制圆白菜）","category":"","deductRule":"2.0"},{"index":4,"score":4,"content":"①2.0门店黄焖鸡按照标准焖制/2.5门店三杯鸡有润锅动作，煎鸡肉时，需平摊不翻动，每面煎约10-15秒                                                       ②金针菇去根打散","category":"","deductRule":"4.0"},{"index":5,"score":3,"content":"①2.0门店：螺丝椒炒肉操作符合标准（关键点：空锅烧5秒后加油摇锅，使用硅胶勺炒制，小黑锅：先放肉，放汁，放辣椒，一次出一份）                                                                    ②2.5门店：先下入肥肉（炒出油，焦黄，打卷，）锅内下入阳雀湖辣椒后，必须有按压动作","category":"","deductRule":"3.0"},{"index":6,"score":3,"content":"麻婆豆腐操作符合标准（关键点：漏勺控水，先放酱后放豆腐，收汁时间不低于2.5分钟，使用硅胶勺操作）","category":"","deductRule":"3.0"},{"index":7,"score":3,"content":"肥牛操作符合标准（关键点：金针菇彻底打散，洋葱金针菇煮软榻后放肥牛片，肥牛煮制过程中要来回挑动肉片使其受热更均匀，肥牛片不碎）","category":"","deductRule":"3.0"},{"index":8,"score":3,"content":"酸菜鱼操作符合标准（关键点：花椒炸油浴油器温度200-210℃，鱼片轻轻挑开煮制大火烧开开锅煮约3-4分钟，不要频繁搅动防止鱼片太碎）","category":"","deductRule":"3.0"},{"index":9,"score":3,"content":"馄饨操作符合标准（馄饨关键点：开水下锅，馄饨抖动防止粘连，煮制时间4分钟，开水冲汤）","category":"","deductRule":"3.0"},{"index":10,"score":3,"content":"面条操作符合标准（面条关键点：开水下锅，挑动防粘连，煮制时间3分钟，牛肉料包开水煮透，开水冲汤）","category":"","deductRule":"3.0"},{"index":11,"score":2,"content":"红烧鲈鱼：制作过程中，必须要抖动，防止粘锅，出锅后观察汤汁是否浓稠，出餐时器具确保干净/低峰期不可外放","category":"","deductRule":"2.0"},{"index":12,"score":4,"content":"米饭的操作符合标准（关键点：米饭蒸好 10 分钟内打散，洗米符合标准）","category":"","deductRule":"4.0"},{"index":13,"score":2,"content":"米饭的操作符合标准（关键点：是否更换保温槽做到先进先出，盖饭台米饭加盖保温，2分钟以上不操作需要加盖（低峰期））","category":"","deductRule":"2.0"},{"index":14,"score":2,"content":"饮料（柠檬茶、奶茶）按照标准操作","category":"","deductRule":"2.0"},{"index":15,"score":3,"content":"早开市早餐产品按时供应，早餐产品9:30前不可断档，早餐9:30分后可断档1款粥","category":"","deductRule":"3.0"},{"index":16,"score":3,"content":"添加规范：                                                                                                  \n\n1、14：00之后两款咸菜单次添加量不得多于1/2\n\n2、添加咸菜不可在顾客可视区域携带原包装添加，统一使用保鲜盒中转\n\n3、晚打烊后服务台上剩余的咸菜放入保鲜盒加盖放入冷藏冰箱\n\n4、早开市咸菜不可前一天备货，一律早开市前添加\n\n5.营业期间两款咸菜不得断档","category":"","deductRule":"3.0"},{"index":17,"score":2,"content":"清洗标准\n1、午高峰过后需要更换新的透明份数盒，更换下来的份数盒使用洗碗机清洗消毒\n2、晚打烊后盛放咸菜的透明份数盒使用洗碗机清洗消毒，晾干后第二天待用","category":"","deductRule":"2.0"},{"index":18,"score":2,"content":"2.5门店：虾仁炒蛋有润锅动作，虾仁被鸡蛋包裹住，煎蛋定型过程仅使用推拉、翻拌手法，成品无黑糊、碎散。","category":"","deductRule":"2.0"},{"index":19,"score":3,"content":"门店现场是否立即收桌（有桌没收，员工没有收桌的动作）","category":"","deductRule":"3.0"},{"index":20,"score":2,"content":"员工在顾客可视范围内是否有不雅动作（交头接耳，打闹，亲密动作等）","category":"","deductRule":"2.0"},{"index":21,"score":2,"content":"员工工作期间要佩戴帽子、口罩、围裙/工牌（工牌上要有姓名）/工服要保持洁净/员工要佩戴发网","category":"","deductRule":"2.0"},{"index":22,"score":2,"content":"上班期间员工不得玩手机/戴耳机","category":"","deductRule":"2.0"},{"index":23,"score":2,"content":"点餐是否给顾客计时沙漏和定位卡/客用餐具水杯、小碟不可断档","category":"","deductRule":"2.0"},{"index":24,"score":2,"content":"门店是否执行服务话术：欢迎，欢送（达成率80%）/是否执行点餐话术","category":"","deductRule":"2.0"},{"index":25,"score":2,"content":"禁止佩戴大耳环、大项链等易造成卫生隐患或视觉冲突的饰品，工作期间禁止佩戴戒指、手链、手串等饰品。","category":"","deductRule":"2.0"},{"index":26,"score":2,"content":"广告机正常开启，显示正常","category":"","deductRule":"2.0"},{"index":27,"score":2,"content":"三元自助区干净整洁","category":"","deductRule":"2.0"},{"index":28,"score":2,"content":"收汁岗台面摆放整洁，无残渣","category":"","deductRule":"2.0"},{"index":29,"score":2,"content":"烤串岗台面摆放整洁，无残渣，烤串岗每日打样清洁追踪","category":"","deductRule":"2.0"},{"index":30,"score":2,"content":"所有区域地面（低峰期）：干净整洁、无水渍、无大面积纸屑及残渣","category":"","deductRule":"2.0"},{"index":31,"score":3,"content":"所有垃圾桶：无垃圾溢出","category":"","deductRule":"3.0"},{"index":32,"score":2,"content":"20:00之前，禁止有提前收市打烊动作","category":"","deductRule":"2.0"},{"index":33,"score":2,"content":"物料是否按照标准储存，（关键点：大米隔墙离地）","category":"","deductRule":"2.0"},{"index":34,"score":3,"content":"前厅手部清洁（例如：扫地后上餐，上完卫生间后上餐，收完桌后上餐）（消毒洗手都可以，按项目查）","category":"","deductRule":"3.0"},{"index":35,"score":4,"content":"食品加工人员可以及时洗手（收银后、处理食物前、处理垃圾后、使用卫生间后、接触生食后、接触受到污染的工具设备后、咳嗽、打喷嚏或者抹鼻涕后、处理废弃物后、触摸耳朵、鼻子、头发、面部、口腔、或身体其他部位后、从事任何可能会污染双手的活动后）","category":"","deductRule":"4.0"},{"index":36,"score":2,"content":"进后厨前使用滚筒粘去身上毛发","category":"","deductRule":"2.0"},{"index":37,"score":1,"content":"一切外来人员进入后厨必须佩戴口罩和网帽（或工帽），包括政府检查、内部检查、维修、收垃圾等（公司内部人员要出示企业微信身份）","category":"","deductRule":"1.0"},{"index":38,"score":4,"content":"员工进行食品加工（熟制产品，顾客直接入口）以及前厅填补客用餐具时都要佩戴手套","category":"","deductRule":"4.0"},{"index":39,"score":2,"content":"食品与不洁工器具交叉污染","category":"","deductRule":"2.0"},{"index":40,"score":2,"content":"回收餐具以及洗碗筐不得接触地面以及垃圾桶","category":"","deductRule":"2.0"},{"index":41,"score":0,"content":"辣椒炒肉有润锅动作，先下入肥肉（炒出油、焦黄、打卷），再放入瘦肉，锅内下入阳雀湖辣椒后，必须有按压动作","category":"","deductRule":"0.0"},{"index":42,"score":0,"content":"三杯鸡有润锅动作，煎鸡肉时，需平摊不翻动、每面煎约10-15秒；","category":"","deductRule":"0.0"},{"index":43,"score":0,"content":"虾仁炒蛋有润锅动作，虾仁被鸡蛋包裹住，煎蛋定型过程仅使用推拉、翻拌手法","category":"","deductRule":"0.0"},{"index":44,"score":0,"content":"门店执行物料外放标准","category":"","deductRule":"0.0"},{"index":45,"score":0,"content":"门店早餐价签根据企划部要求做出更新","category":"","deductRule":"0.0"},{"index":46,"score":0,"content":"早餐收市（10：00）：报损蒸制产品数理，报损数量≤10=2分。不用写分，不合格的写个数","category":"","deductRule":"0.0"},{"index":47,"score":0,"content":"午餐收市（14：30）：外送备货剩余数量，报损数量≤5=2分，不用写分，不合格的写个数","category":"","deductRule":"0.0"},{"index":48,"score":0,"content":"晚餐收市：米饭报损数量，报损数量≤1屉(锅）=2分，不用写分，不合格的写个数","category":"","deductRule":"0.0"},{"index":49,"score":0,"content":"员工餐标准操作，不允许集中补单。集中补单，写上","category":"","deductRule":"0.0"},{"index":50,"score":0,"content":"员工餐的用餐区域：客区、监控能看见位置。不合格，写上","category":"","deductRule":"0.0"},{"index":51,"score":0,"content":"骑手餐（便装的需拍照片、照片上传企微群，报备教练）；不允许集中补单，不合格，写上","category":"","deductRule":"0.0"},{"index":52,"score":0,"content":"能耗管理：关于门店水管理，电管理的不合格现象都可以记录","category":"","deductRule":"0.0"}],"isActive":true,"createdAt":"2026-08-07","updatedAt":"2026-08-07"}],



    inspection_results: [{"id": "r001", "storeId": "s011", "store": "天慧广场店", "inspector": "钱磊", "date": "2026-07-29", "totalScore": 94, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r002", "storeId": "s005", "store": "万航渡路店", "inspector": "钱磊", "date": "2026-07-29", "totalScore": 91, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r003", "storeId": "s170", "store": "杨庄东街店", "inspector": "钱磊", "date": "2026-07-29", "totalScore": 95, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r004", "storeId": "s166", "store": "左安门店", "inspector": "钱磊", "date": "2026-07-29", "totalScore": 92, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r005", "storeId": "s006", "store": "汇融天地店", "inspector": "钱磊", "date": "2026-07-29", "totalScore": 86, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r006", "storeId": "s165", "store": "朝丰家园店", "inspector": "钱磊", "date": "2026-07-29", "totalScore": 90, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r007", "storeId": "s178", "store": "马家堡店", "inspector": "钱磊", "date": "2026-07-29", "totalScore": 94, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r008", "storeId": "s182", "store": "丰管路店", "inspector": "钱磊", "date": "2026-07-29", "totalScore": 94, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r009", "storeId": "s196", "store": "郁花园店", "inspector": "钱磊", "date": "2026-07-30", "totalScore": 95, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r010", "storeId": "s079", "store": "物资学院店", "inspector": "钱磊", "date": "2026-07-30", "totalScore": 88, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r011", "storeId": "s160", "store": "青年路店", "inspector": "钱磊", "date": "2026-07-30", "totalScore": 90, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r012", "storeId": "s146", "store": "旧宫店", "inspector": "钱磊", "date": "2026-07-30", "totalScore": 90, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r013", "storeId": "s148", "store": "太平街店", "inspector": "钱磊", "date": "2026-07-30", "totalScore": 87, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r014", "storeId": "s075", "store": "通胡大街店", "inspector": "钱磊", "date": "2026-07-31", "totalScore": 90, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r015", "storeId": "s132", "store": "木樨园桥西店", "inspector": "钱磊", "date": "2026-07-31", "totalScore": 91, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r016", "storeId": "s042", "store": "交大东路店", "inspector": "钱磊", "date": "2026-07-31", "totalScore": 87, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r017", "storeId": "s113", "store": "丰台南路店", "inspector": "钱磊", "date": "2026-07-31", "totalScore": 89, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r018", "storeId": "s017", "store": "和平东桥店", "inspector": "钱磊", "date": "2026-07-31", "totalScore": 92, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r019", "storeId": "s089", "store": "平乐园店", "inspector": "钱磊", "date": "2026-08-01", "totalScore": 90, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r020", "storeId": "s152", "store": "宋家庄店", "inspector": "钱磊", "date": "2026-08-01", "totalScore": 91, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r021", "storeId": "s133", "store": "和义南站店", "inspector": "钱磊", "date": "2026-08-01", "totalScore": 87, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r022", "storeId": "s071", "store": "通州耿庄店", "inspector": "钱磊", "date": "2026-08-01", "totalScore": 89, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r023", "storeId": "s068", "store": "驼房营店", "inspector": "钱磊", "date": "2026-08-01", "totalScore": 92, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r024", "storeId": "s181", "store": "晓月中路店", "inspector": "钱磊", "date": "2026-08-02", "totalScore": 90, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r025", "storeId": "s149", "store": "德胜门店", "inspector": "钱磊", "date": "2026-08-02", "totalScore": 92, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r026", "storeId": "s164", "store": "红庙店", "inspector": "钱磊", "date": "2026-08-02", "totalScore": 91, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r027", "storeId": "s002", "store": "内江路店", "inspector": "钱磊", "date": "2026-08-02", "totalScore": 88, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r028", "storeId": "s004", "store": "江苏路店", "inspector": "钱磊", "date": "2026-08-02", "totalScore": 92, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r029", "storeId": "s001", "store": "控江路店", "inspector": "钱磊", "date": "2026-08-02", "totalScore": 86, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r030", "storeId": "s191", "store": "小马厂店", "inspector": "钱磊", "date": "2026-08-02", "totalScore": 91, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r031", "storeId": "s177", "store": "海淀黄庄店", "inspector": "钱磊", "date": "2026-08-02", "totalScore": 92, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r032", "storeId": "s024", "store": "天通西苑店", "inspector": "钱磊", "date": "2026-08-04", "totalScore": 88, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r033", "storeId": "s094", "store": "小园地铁店", "inspector": "钱磊", "date": "2026-08-04", "totalScore": 90, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r034", "storeId": "s087", "store": "新天地店", "inspector": "钱磊", "date": "2026-08-04", "totalScore": 92, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r035", "storeId": "s141", "store": "次渠店", "inspector": "钱磊", "date": "2026-08-04", "totalScore": 87, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r036", "storeId": "s108", "store": "莲怡园店", "inspector": "钱磊", "date": "2026-08-04", "totalScore": 86, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r037", "storeId": "s104", "store": "宛平城店", "inspector": "钱磊", "date": "2026-08-05", "totalScore": 95, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r038", "storeId": "s136", "store": "草桥地铁店", "inspector": "钱磊", "date": "2026-08-05", "totalScore": 94, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r039", "storeId": "s115", "store": "南站 2 店", "inspector": "钱磊", "date": "2026-08-05", "totalScore": 96, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r040", "storeId": "s134", "store": "角北店", "inspector": "钱磊", "date": "2026-08-05", "totalScore": 91, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"}, {"id": "r041", "storeId": "s051", "store": "黄寺大街店", "inspector": "钱磊", "date": "2026-08-05", "totalScore": 89, "maxScore": 100, "templateId": "qianlei-online", "status": "已完成"},{"id": "a0020", "date": "2026-08-01", "inspector": "陶畅", "storeId": "s186", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0021", "date": "2026-08-01", "inspector": "陶畅", "storeId": "s020", "score": 86, "type": "offline", "qscScore": 86, "complianceIssues": 0},{"id": "a0022", "date": "2026-08-01", "inspector": "陶畅", "storeId": "s019", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0023", "date": "2026-08-01", "inspector": "陶畅", "storeId": "s050", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0024", "date": "2026-08-01", "inspector": "陶畅", "storeId": "s051", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0025", "date": "2026-08-01", "inspector": "马昕茹", "storeId": "s015", "score": 84, "type": "online", "qscScore": 84, "complianceIssues": 0},{"id": "a0026", "date": "2026-08-01", "inspector": "马昕茹", "storeId": "s085", "score": 89, "type": "online", "qscScore": 89, "complianceIssues": 0},{"id": "a0027", "date": "2026-08-01", "inspector": "马昕茹", "storeId": "s032", "score": 86, "type": "online", "qscScore": 86, "complianceIssues": 0},{"id": "a0028", "date": "2026-08-01", "inspector": "马昕茹", "storeId": "s137", "score": 86, "type": "online", "qscScore": 86, "complianceIssues": 0},{"id": "a0029", "date": "2026-08-01", "inspector": "马昕茹", "storeId": "s072", "score": 93, "type": "online", "qscScore": 93, "complianceIssues": 0},{"id": "a0030", "date": "2026-08-01", "inspector": "马昕茹", "storeId": "s074", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0031", "date": "2026-08-01", "inspector": "马昕茹", "storeId": "s143", "score": 79, "type": "online", "qscScore": 79, "complianceIssues": 0},{"id": "a0032", "date": "2026-08-01", "inspector": "钱磊", "storeId": "s089", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0033", "date": "2026-08-01", "inspector": "钱磊", "storeId": "s152", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0034", "date": "2026-08-01", "inspector": "钱磊", "storeId": "s133", "score": 87, "type": "online", "qscScore": 87, "complianceIssues": 0},{"id": "a0035", "date": "2026-08-01", "inspector": "钱磊", "storeId": "s071", "score": 89, "type": "online", "qscScore": 89, "complianceIssues": 0},{"id": "a0036", "date": "2026-08-01", "inspector": "钱磊", "storeId": "s068", "score": 92, "type": "online", "qscScore": 92, "complianceIssues": 0},{"id": "a0037", "date": "2026-08-01", "inspector": "范晓明", "storeId": "s122", "score": 86, "type": "online", "qscScore": 86, "complianceIssues": 0},{"id": "a0038", "date": "2026-08-01", "inspector": "范晓明", "storeId": "s050", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0039", "date": "2026-08-01", "inspector": "范晓明", "storeId": "s095", "score": 87, "type": "online", "qscScore": 87, "complianceIssues": 0},{"id": "a0040", "date": "2026-08-01", "inspector": "徐瑞雪", "storeId": "s193", "score": 91, "type": "offline", "qscScore": 91, "complianceIssues": 0},{"id": "a0041", "date": "2026-08-01", "inspector": "徐瑞雪", "storeId": "s170", "score": 93, "type": "offline", "qscScore": 93, "complianceIssues": 0},{"id": "a0042", "date": "2026-08-01", "inspector": "徐瑞雪", "storeId": "s092", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0043", "date": "2026-08-01", "inspector": "徐瑞雪", "storeId": "s043", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0044", "date": "2026-08-01", "inspector": "乔雨地", "storeId": "s141", "score": 81, "type": "offline", "qscScore": 81, "complianceIssues": 0},{"id": "a0045", "date": "2026-08-01", "inspector": "乔雨地", "storeId": "s142", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0046", "date": "2026-08-01", "inspector": "乔雨地", "storeId": "s144", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0047", "date": "2026-08-01", "inspector": "乔雨地", "storeId": "s145", "score": 88, "type": "offline", "qscScore": 88, "complianceIssues": 0},{"id": "a0048", "date": "2026-08-02", "inspector": "马昕茹", "storeId": "s198", "score": 88, "type": "online", "qscScore": 88, "complianceIssues": 0},{"id": "a0049", "date": "2026-08-02", "inspector": "马昕茹", "storeId": "s003", "score": 72, "type": "online", "qscScore": 72, "complianceIssues": 0},{"id": "a0050", "date": "2026-08-02", "inspector": "马昕茹", "storeId": "s196", "score": 96, "type": "online", "qscScore": 96, "complianceIssues": 0},{"id": "a0051", "date": "2026-08-02", "inspector": "马昕茹", "storeId": "s012", "score": 93, "type": "online", "qscScore": 93, "complianceIssues": 0},{"id": "a0052", "date": "2026-08-02", "inspector": "马昕茹", "storeId": "s162", "score": 89, "type": "online", "qscScore": 89, "complianceIssues": 0},{"id": "a0053", "date": "2026-08-02", "inspector": "马昕茹", "storeId": "s197", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0054", "date": "2026-08-02", "inspector": "马昕茹", "storeId": "s161", "score": 89, "type": "online", "qscScore": 89, "complianceIssues": 0},{"id": "a0055", "date": "2026-08-02", "inspector": "马昕茹", "storeId": "s163", "score": 93, "type": "online", "qscScore": 93, "complianceIssues": 0},{"id": "a0056", "date": "2026-08-02", "inspector": "张炜玉", "storeId": "s195", "score": 84, "type": "online", "qscScore": 84, "complianceIssues": 0},{"id": "a0057", "date": "2026-08-02", "inspector": "张炜玉", "storeId": "s185", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0058", "date": "2026-08-02", "inspector": "张炜玉", "storeId": "s009", "score": 94, "type": "online", "qscScore": 94, "complianceIssues": 0},{"id": "a0059", "date": "2026-08-02", "inspector": "张炜玉", "storeId": "s176", "score": 95, "type": "online", "qscScore": 95, "complianceIssues": 0},{"id": "a0060", "date": "2026-08-02", "inspector": "张炜玉", "storeId": "s011", "score": 95, "type": "online", "qscScore": 95, "complianceIssues": 0},{"id": "a0061", "date": "2026-08-02", "inspector": "张炜玉", "storeId": "s192", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0062", "date": "2026-08-02", "inspector": "张炜玉", "storeId": "s174", "score": 85, "type": "online", "qscScore": 85, "complianceIssues": 0},{"id": "a0063", "date": "2026-08-02", "inspector": "张炜玉", "storeId": "s193", "score": 82, "type": "online", "qscScore": 82, "complianceIssues": 0},{"id": "a0064", "date": "2026-08-02", "inspector": "钱磊", "storeId": "s181", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0065", "date": "2026-08-02", "inspector": "钱磊", "storeId": "s149", "score": 92, "type": "online", "qscScore": 92, "complianceIssues": 0},{"id": "a0066", "date": "2026-08-02", "inspector": "钱磊", "storeId": "s164", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0067", "date": "2026-08-02", "inspector": "钱磊", "storeId": "s002", "score": 88, "type": "online", "qscScore": 88, "complianceIssues": 0},{"id": "a0068", "date": "2026-08-02", "inspector": "钱磊", "storeId": "s004", "score": 92, "type": "online", "qscScore": 92, "complianceIssues": 0},{"id": "a0069", "date": "2026-08-02", "inspector": "钱磊", "storeId": "s001", "score": 86, "type": "online", "qscScore": 86, "complianceIssues": 0},{"id": "a0070", "date": "2026-08-02", "inspector": "钱磊", "storeId": "s191", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0071", "date": "2026-08-02", "inspector": "钱磊", "storeId": "s177", "score": 92, "type": "online", "qscScore": 92, "complianceIssues": 0},{"id": "a0072", "date": "2026-08-02", "inspector": "范晓明", "storeId": "s067", "score": 86, "type": "online", "qscScore": 86, "complianceIssues": 0},{"id": "a0073", "date": "2026-08-02", "inspector": "范晓明", "storeId": "s045", "score": 88, "type": "online", "qscScore": 88, "complianceIssues": 0},{"id": "a0074", "date": "2026-08-02", "inspector": "范晓明", "storeId": "s014", "score": 83, "type": "online", "qscScore": 83, "complianceIssues": 0},{"id": "a0075", "date": "2026-08-02", "inspector": "乔雨地", "storeId": "s068", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0076", "date": "2026-08-02", "inspector": "乔雨地", "storeId": "s024", "score": 91, "type": "offline", "qscScore": 91, "complianceIssues": 0},{"id": "a0077", "date": "2026-08-02", "inspector": "乔雨地", "storeId": "s026", "score": 88, "type": "offline", "qscScore": 88, "complianceIssues": 0},{"id": "a0078", "date": "2026-08-02", "inspector": "乔雨地", "storeId": "s030", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0079", "date": "2026-08-02", "inspector": "王红丽", "storeId": "s194", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0080", "date": "2026-08-02", "inspector": "王红丽", "storeId": "s079", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0081", "date": "2026-08-02", "inspector": "王红丽", "storeId": "s075", "score": 91, "type": "offline", "qscScore": 91, "complianceIssues": 0},{"id": "a0082", "date": "2026-08-02", "inspector": "王红丽", "storeId": "s082", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0083", "date": "2026-08-03", "inspector": "范晓明", "storeId": "s099", "score": 89, "type": "online", "qscScore": 89, "complianceIssues": 0},{"id": "a0084", "date": "2026-08-03", "inspector": "范晓明", "storeId": "s135", "score": 95, "type": "online", "qscScore": 95, "complianceIssues": 0},{"id": "a0085", "date": "2026-08-03", "inspector": "范晓明", "storeId": "s086", "score": 83, "type": "online", "qscScore": 83, "complianceIssues": 0},{"id": "a0086", "date": "2026-08-03", "inspector": "张炜玉", "storeId": "s171", "score": 86, "type": "online", "qscScore": 86, "complianceIssues": 0},{"id": "a0087", "date": "2026-08-03", "inspector": "张炜玉", "storeId": "s188", "score": 89, "type": "online", "qscScore": 89, "complianceIssues": 0},{"id": "a0088", "date": "2026-08-03", "inspector": "张炜玉", "storeId": "s007", "score": 83, "type": "online", "qscScore": 83, "complianceIssues": 0},{"id": "a0089", "date": "2026-08-03", "inspector": "张炜玉", "storeId": "s151", "score": 87, "type": "online", "qscScore": 87, "complianceIssues": 0},{"id": "a0090", "date": "2026-08-03", "inspector": "张炜玉", "storeId": "s173", "score": 92, "type": "online", "qscScore": 92, "complianceIssues": 0},{"id": "a0091", "date": "2026-08-03", "inspector": "张炜玉", "storeId": "s192", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0092", "date": "2026-08-03", "inspector": "张炜玉", "storeId": "s174", "score": 85, "type": "online", "qscScore": 85, "complianceIssues": 0},{"id": "a0093", "date": "2026-08-03", "inspector": "张炜玉", "storeId": "s193", "score": 82, "type": "online", "qscScore": 82, "complianceIssues": 0},{"id": "a0094", "date": "2026-08-03", "inspector": "陶畅", "storeId": "s095", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0095", "date": "2026-08-03", "inspector": "陶畅", "storeId": "s171", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0096", "date": "2026-08-03", "inspector": "陶畅", "storeId": "s180", "score": 88, "type": "offline", "qscScore": 88, "complianceIssues": 0},{"id": "a0097", "date": "2026-08-03", "inspector": "王红丽", "storeId": "s135", "score": 93, "type": "offline", "qscScore": 93, "complianceIssues": 0},{"id": "a0098", "date": "2026-08-03", "inspector": "王红丽", "storeId": "s172", "score": 86, "type": "offline", "qscScore": 86, "complianceIssues": 0},{"id": "a0099", "date": "2026-08-03", "inspector": "王红丽", "storeId": "s017", "score": 92, "type": "offline", "qscScore": 92, "complianceIssues": 0},{"id": "a0100", "date": "2026-08-03", "inspector": "乔雨地", "storeId": "s076", "score": 0, "type": "offline", "qscScore": 0, "complianceIssues": 0},{"id": "a0101", "date": "2026-08-03", "inspector": "乔雨地", "storeId": "s150", "score": 0, "type": "offline", "qscScore": 0, "complianceIssues": 0},{"id": "a0102", "date": "2026-08-03", "inspector": "乔雨地", "storeId": "s074", "score": 0, "type": "offline", "qscScore": 0, "complianceIssues": 0},{"id": "a0103", "date": "2026-08-03", "inspector": "乔雨地", "storeId": "s083", "score": 0, "type": "offline", "qscScore": 0, "complianceIssues": 0},{"id": "a0104", "date": "2026-08-03", "inspector": "乔雨地", "storeId": "s156", "score": 0, "type": "offline", "qscScore": 0, "complianceIssues": 0},{"id": "a0105", "date": "2026-08-03", "inspector": "乔雨地", "storeId": "s162", "score": 91, "type": "offline", "qscScore": 91, "complianceIssues": 0},{"id": "a0106", "date": "2026-08-04", "inspector": "范晓明", "storeId": "s099", "score": 89, "type": "online", "qscScore": 89, "complianceIssues": 0},{"id": "a0107", "date": "2026-08-04", "inspector": "范晓明", "storeId": "s135", "score": 95, "type": "online", "qscScore": 95, "complianceIssues": 0},{"id": "a0108", "date": "2026-08-04", "inspector": "范晓明", "storeId": "s086", "score": 83, "type": "online", "qscScore": 83, "complianceIssues": 0},{"id": "a0109", "date": "2026-08-04", "inspector": "张炜玉", "storeId": "s171", "score": 86, "type": "online", "qscScore": 86, "complianceIssues": 0},{"id": "a0110", "date": "2026-08-04", "inspector": "张炜玉", "storeId": "s188", "score": 89, "type": "online", "qscScore": 89, "complianceIssues": 0},{"id": "a0111", "date": "2026-08-04", "inspector": "张炜玉", "storeId": "s007", "score": 83, "type": "online", "qscScore": 83, "complianceIssues": 0},{"id": "a0112", "date": "2026-08-04", "inspector": "张炜玉", "storeId": "s151", "score": 87, "type": "online", "qscScore": 87, "complianceIssues": 0},{"id": "a0113", "date": "2026-08-04", "inspector": "张炜玉", "storeId": "s173", "score": 92, "type": "online", "qscScore": 92, "complianceIssues": 0},{"id": "a0114", "date": "2026-08-04", "inspector": "张炜玉", "storeId": "s192", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0115", "date": "2026-08-04", "inspector": "张炜玉", "storeId": "s174", "score": 85, "type": "online", "qscScore": 85, "complianceIssues": 0},{"id": "a0116", "date": "2026-08-04", "inspector": "张炜玉", "storeId": "s193", "score": 82, "type": "online", "qscScore": 82, "complianceIssues": 0},{"id": "a0117", "date": "2026-08-04", "inspector": "陶畅", "storeId": "s095", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0118", "date": "2026-08-04", "inspector": "陶畅", "storeId": "s171", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0119", "date": "2026-08-04", "inspector": "陶畅", "storeId": "s180", "score": 88, "type": "offline", "qscScore": 88, "complianceIssues": 0},{"id": "a0120", "date": "2026-08-04", "inspector": "王红丽", "storeId": "s135", "score": 93, "type": "offline", "qscScore": 93, "complianceIssues": 0},{"id": "a0121", "date": "2026-08-04", "inspector": "王红丽", "storeId": "s172", "score": 86, "type": "offline", "qscScore": 86, "complianceIssues": 0},{"id": "a0122", "date": "2026-08-04", "inspector": "王红丽", "storeId": "s017", "score": 92, "type": "offline", "qscScore": 92, "complianceIssues": 0},{"id": "a0123", "date": "2026-08-04", "inspector": "乔雨地", "storeId": "s076", "score": 0, "type": "offline", "qscScore": 0, "complianceIssues": 0},{"id": "a0124", "date": "2026-08-04", "inspector": "乔雨地", "storeId": "s150", "score": 0, "type": "offline", "qscScore": 0, "complianceIssues": 0},{"id": "a0125", "date": "2026-08-04", "inspector": "乔雨地", "storeId": "s074", "score": 0, "type": "offline", "qscScore": 0, "complianceIssues": 0},{"id": "a0126", "date": "2026-08-04", "inspector": "乔雨地", "storeId": "s083", "score": 0, "type": "offline", "qscScore": 0, "complianceIssues": 0},{"id": "a0127", "date": "2026-08-04", "inspector": "乔雨地", "storeId": "s156", "score": 0, "type": "offline", "qscScore": 0, "complianceIssues": 0},{"id": "a0128", "date": "2026-08-04", "inspector": "乔雨地", "storeId": "s162", "score": 91, "type": "offline", "qscScore": 91, "complianceIssues": 0},{"id": "a0129", "date": "2026-08-05", "inspector": "马昕茹", "storeId": "s165", "score": 86, "type": "online", "qscScore": 86, "complianceIssues": 0},{"id": "a0130", "date": "2026-08-05", "inspector": "马昕茹", "storeId": "s178", "score": 85, "type": "online", "qscScore": 85, "complianceIssues": 0},{"id": "a0131", "date": "2026-08-05", "inspector": "马昕茹", "storeId": "s194", "score": 87, "type": "online", "qscScore": 87, "complianceIssues": 0},{"id": "a0132", "date": "2026-08-05", "inspector": "马昕茹", "storeId": "s186", "score": 95, "type": "online", "qscScore": 95, "complianceIssues": 0},{"id": "a0133", "date": "2026-08-05", "inspector": "马昕茹", "storeId": "s010", "score": 92, "type": "online", "qscScore": 92, "complianceIssues": 0},{"id": "a0134", "date": "2026-08-05", "inspector": "张炜玉", "storeId": "s005", "score": 81, "type": "online", "qscScore": 81, "complianceIssues": 0},{"id": "a0135", "date": "2026-08-05", "inspector": "张炜玉", "storeId": "s170", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0136", "date": "2026-08-05", "inspector": "张炜玉", "storeId": "s166", "score": 86, "type": "online", "qscScore": 86, "complianceIssues": 0},{"id": "a0137", "date": "2026-08-05", "inspector": "张炜玉", "storeId": "s006", "score": 85, "type": "online", "qscScore": 85, "complianceIssues": 0},{"id": "a0138", "date": "2026-08-05", "inspector": "张炜玉", "storeId": "s182", "score": 84, "type": "online", "qscScore": 84, "complianceIssues": 0},{"id": "a0139", "date": "2026-08-05", "inspector": "张炜玉", "storeId": "s192", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0140", "date": "2026-08-05", "inspector": "张炜玉", "storeId": "s174", "score": 85, "type": "online", "qscScore": 85, "complianceIssues": 0},{"id": "a0141", "date": "2026-08-05", "inspector": "张炜玉", "storeId": "s193", "score": 82, "type": "online", "qscScore": 82, "complianceIssues": 0},{"id": "a0142", "date": "2026-08-05", "inspector": "陶畅", "storeId": "s138", "score": 83, "type": "offline", "qscScore": 83, "complianceIssues": 0},{"id": "a0143", "date": "2026-08-05", "inspector": "陶畅", "storeId": "s132", "score": 86, "type": "offline", "qscScore": 86, "complianceIssues": 0},{"id": "a0144", "date": "2026-08-05", "inspector": "陶畅", "storeId": "s052", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0145", "date": "2026-08-05", "inspector": "陶畅", "storeId": "s184", "score": 86, "type": "offline", "qscScore": 86, "complianceIssues": 0},{"id": "a0146", "date": "2026-08-05", "inspector": "陶畅", "storeId": "s161", "score": 91, "type": "offline", "qscScore": 91, "complianceIssues": 0},{"id": "a0147", "date": "2026-08-05", "inspector": "钱磊", "storeId": "s104", "score": 95, "type": "online", "qscScore": 95, "complianceIssues": 0},{"id": "a0148", "date": "2026-08-05", "inspector": "钱磊", "storeId": "s136", "score": 94, "type": "online", "qscScore": 94, "complianceIssues": 0},{"id": "a0149", "date": "2026-08-05", "inspector": "钱磊", "storeId": "s115", "score": 96, "type": "online", "qscScore": 96, "complianceIssues": 0},{"id": "a0150", "date": "2026-08-05", "inspector": "钱磊", "storeId": "s134", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0151", "date": "2026-08-05", "inspector": "钱磊", "storeId": "s051", "score": 89, "type": "online", "qscScore": 89, "complianceIssues": 0},{"id": "a0152", "date": "2026-08-05", "inspector": "王红丽", "storeId": "s045", "score": 82, "type": "offline", "qscScore": 82, "complianceIssues": 0},{"id": "a0153", "date": "2026-08-05", "inspector": "王红丽", "storeId": "s038", "score": 85, "type": "offline", "qscScore": 85, "complianceIssues": 0},{"id": "a0154", "date": "2026-08-05", "inspector": "王红丽", "storeId": "s187", "score": 91, "type": "offline", "qscScore": 91, "complianceIssues": 0},{"id": "a0155", "date": "2026-08-05", "inspector": "王红丽", "storeId": "s028", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0156", "date": "2026-08-06", "inspector": "马昕茹", "storeId": "s154", "score": 86, "type": "online", "qscScore": 86, "complianceIssues": 0},{"id": "a0157", "date": "2026-08-06", "inspector": "马昕茹", "storeId": "s007", "score": 85, "type": "online", "qscScore": 85, "complianceIssues": 0},{"id": "a0158", "date": "2026-08-06", "inspector": "张炜玉", "storeId": "s043", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0159", "date": "2026-08-06", "inspector": "张炜玉", "storeId": "s124", "score": 92, "type": "online", "qscScore": 92, "complianceIssues": 0},{"id": "a0160", "date": "2026-08-06", "inspector": "张炜玉", "storeId": "s166", "score": 86, "type": "online", "qscScore": 86, "complianceIssues": 0},{"id": "a0161", "date": "2026-08-06", "inspector": "张炜玉", "storeId": "s006", "score": 85, "type": "online", "qscScore": 85, "complianceIssues": 0},{"id": "a0162", "date": "2026-08-06", "inspector": "张炜玉", "storeId": "s182", "score": 84, "type": "online", "qscScore": 84, "complianceIssues": 0},{"id": "a0163", "date": "2026-08-06", "inspector": "张炜玉", "storeId": "s192", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0164", "date": "2026-08-06", "inspector": "张炜玉", "storeId": "s174", "score": 85, "type": "online", "qscScore": 85, "complianceIssues": 0},{"id": "a0165", "date": "2026-08-06", "inspector": "张炜玉", "storeId": "s193", "score": 82, "type": "online", "qscScore": 82, "complianceIssues": 0},{"id": "a0166", "date": "2026-08-06", "inspector": "陶畅", "storeId": "s121", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0167", "date": "2026-08-06", "inspector": "陶畅", "storeId": "s091", "score": 91, "type": "offline", "qscScore": 91, "complianceIssues": 0},{"id": "a0168", "date": "2026-08-06", "inspector": "陶畅", "storeId": "s096", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0169", "date": "2026-08-06", "inspector": "陶畅", "storeId": "s109", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0170", "date": "2026-08-06", "inspector": "徐瑞雪", "storeId": "s039", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0171", "date": "2026-08-06", "inspector": "徐瑞雪", "storeId": "s173", "score": 93, "type": "offline", "qscScore": 93, "complianceIssues": 0},{"id": "a0172", "date": "2026-08-06", "inspector": "徐瑞雪", "storeId": "s046", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0173", "date": "2026-08-06", "inspector": "徐瑞雪", "storeId": "s027", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0174", "date": "2026-08-06", "inspector": "乔雨地", "storeId": "s120", "score": 86, "type": "offline", "qscScore": 86, "complianceIssues": 0},{"id": "a0175", "date": "2026-08-06", "inspector": "乔雨地", "storeId": "s181", "score": 92, "type": "offline", "qscScore": 92, "complianceIssues": 0},{"id": "a0176", "date": "2026-08-06", "inspector": "乔雨地", "storeId": "s113", "score": 93, "type": "offline", "qscScore": 93, "complianceIssues": 0},{"id": "a0177", "date": "2026-08-06", "inspector": "乔雨地", "storeId": "s101", "score": 94, "type": "offline", "qscScore": 94, "complianceIssues": 0},{"id": "a0178", "date": "2026-08-06", "inspector": "乔雨地", "storeId": "s114", "score": 93, "type": "offline", "qscScore": 93, "complianceIssues": 0},{"id": "a0179", "date": "2026-08-07", "inspector": "张炜玉", "storeId": "s109", "score": 83, "type": "online", "qscScore": 83, "complianceIssues": 0},{"id": "a0180", "date": "2026-08-07", "inspector": "张炜玉", "storeId": "s082", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0181", "date": "2026-08-07", "inspector": "张炜玉", "storeId": "s023", "score": 92, "type": "online", "qscScore": 92, "complianceIssues": 0},{"id": "a0182", "date": "2026-08-07", "inspector": "张炜玉", "storeId": "s084", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0183", "date": "2026-08-07", "inspector": "张炜玉", "storeId": "s182", "score": 84, "type": "online", "qscScore": 84, "complianceIssues": 0},{"id": "a0184", "date": "2026-08-07", "inspector": "张炜玉", "storeId": "s192", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0185", "date": "2026-08-07", "inspector": "张炜玉", "storeId": "s174", "score": 85, "type": "online", "qscScore": 85, "complianceIssues": 0},{"id": "a0186", "date": "2026-08-07", "inspector": "张炜玉", "storeId": "s193", "score": 82, "type": "online", "qscScore": 82, "complianceIssues": 0},{"id": "a0187", "date": "2026-08-07", "inspector": "钱磊", "storeId": "s063", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0188", "date": "2026-08-07", "inspector": "钱磊", "storeId": "s111", "score": 93, "type": "online", "qscScore": 93, "complianceIssues": 0},{"id": "a0189", "date": "2026-08-07", "inspector": "钱磊", "storeId": "s158", "score": 84, "type": "online", "qscScore": 84, "complianceIssues": 0},{"id": "a0190", "date": "2026-08-07", "inspector": "钱磊", "storeId": "s140", "score": 96, "type": "online", "qscScore": 96, "complianceIssues": 0},{"id": "a0191", "date": "2026-08-07", "inspector": "钱磊", "storeId": "s073", "score": 87, "type": "online", "qscScore": 87, "complianceIssues": 0},{"id": "a0192", "date": "2026-08-07", "inspector": "陶畅", "storeId": "s164", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0193", "date": "2026-08-07", "inspector": "陶畅", "storeId": "s197", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0194", "date": "2026-08-07", "inspector": "陶畅", "storeId": "s155", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0195", "date": "2026-08-07", "inspector": "陶畅", "storeId": "s081", "score": 86, "type": "offline", "qscScore": 86, "complianceIssues": 0},{"id": "a0196", "date": "2026-08-07", "inspector": "陶畅", "storeId": "s087", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0197", "date": "2026-08-07", "inspector": "范晓明", "storeId": "s153", "score": 89, "type": "online", "qscScore": 89, "complianceIssues": 0},{"id": "a0198", "date": "2026-08-07", "inspector": "范晓明", "storeId": "s138", "score": 82, "type": "online", "qscScore": 82, "complianceIssues": 0},{"id": "a0199", "date": "2026-08-07", "inspector": "范晓明", "storeId": "s054", "score": 95, "type": "online", "qscScore": 95, "complianceIssues": 0},{"id": "a0200", "date": "2026-08-07", "inspector": "范晓明", "storeId": "s119", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0201", "date": "2026-08-07", "inspector": "范晓明", "storeId": "s061", "score": 87, "type": "online", "qscScore": 87, "complianceIssues": 0},{"id": "a0202", "date": "2026-08-07", "inspector": "范晓明", "storeId": "s022", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0203", "date": "2026-08-07", "inspector": "乔雨地", "storeId": "s137", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0204", "date": "2026-08-07", "inspector": "乔雨地", "storeId": "s134", "score": 85, "type": "offline", "qscScore": 85, "complianceIssues": 0},{"id": "a0205", "date": "2026-08-07", "inspector": "乔雨地", "storeId": "s129", "score": 83, "type": "offline", "qscScore": 83, "complianceIssues": 0},{"id": "a0206", "date": "2026-08-07", "inspector": "乔雨地", "storeId": "s008", "score": 92, "type": "offline", "qscScore": 92, "complianceIssues": 0},{"id": "a0207", "date": "2026-08-07", "inspector": "王红丽", "storeId": "s195", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0208", "date": "2026-08-07", "inspector": "王红丽", "storeId": "s183", "score": 88, "type": "offline", "qscScore": 88, "complianceIssues": 0},{"id": "a0209", "date": "2026-08-07", "inspector": "王红丽", "storeId": "s044", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0210", "date": "2026-08-07", "inspector": "王红丽", "storeId": "s188", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0211", "date": "2026-08-07", "inspector": "徐瑞雪", "storeId": "s067", "score": 83, "type": "offline", "qscScore": 83, "complianceIssues": 0},{"id": "a0212", "date": "2026-08-07", "inspector": "徐瑞雪", "storeId": "s157", "score": 93, "type": "offline", "qscScore": 93, "complianceIssues": 0},{"id": "a0213", "date": "2026-08-07", "inspector": "徐瑞雪", "storeId": "s160", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0214", "date": "2026-08-07", "inspector": "徐瑞雪", "storeId": "s159", "score": 86, "type": "offline", "qscScore": 86, "complianceIssues": 0},{"id": "a0215", "date": "2026-08-08", "inspector": "马昕茹", "storeId": "s056", "score": 0, "type": "online", "qscScore": 0, "complianceIssues": 0},{"id": "a0216", "date": "2026-08-08", "inspector": "马昕茹", "storeId": "s140", "score": 0, "type": "online", "qscScore": 0, "complianceIssues": 0},{"id": "a0217", "date": "2026-08-08", "inspector": "马昕茹", "storeId": "s023", "score": 0, "type": "online", "qscScore": 0, "complianceIssues": 0},{"id": "a0218", "date": "2026-08-08", "inspector": "马昕茹", "storeId": "s084", "score": 0, "type": "online", "qscScore": 0, "complianceIssues": 0},{"id": "a0219", "date": "2026-08-08", "inspector": "张炜玉", "storeId": "s162", "score": 88, "type": "online", "qscScore": 88, "complianceIssues": 0},{"id": "a0220", "date": "2026-08-08", "inspector": "张炜玉", "storeId": "s188", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0221", "date": "2026-08-08", "inspector": "张炜玉", "storeId": "s023", "score": 92, "type": "online", "qscScore": 92, "complianceIssues": 0},{"id": "a0222", "date": "2026-08-08", "inspector": "张炜玉", "storeId": "s084", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0223", "date": "2026-08-08", "inspector": "张炜玉", "storeId": "s182", "score": 84, "type": "online", "qscScore": 84, "complianceIssues": 0},{"id": "a0224", "date": "2026-08-08", "inspector": "张炜玉", "storeId": "s192", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0225", "date": "2026-08-08", "inspector": "张炜玉", "storeId": "s174", "score": 85, "type": "online", "qscScore": 85, "complianceIssues": 0},{"id": "a0226", "date": "2026-08-08", "inspector": "张炜玉", "storeId": "s193", "score": 82, "type": "online", "qscScore": 82, "complianceIssues": 0},{"id": "a0227", "date": "2026-08-08", "inspector": "钱磊", "storeId": "s080", "score": 90, "type": "online", "qscScore": 90, "complianceIssues": 0},{"id": "a0228", "date": "2026-08-08", "inspector": "陶畅", "storeId": "s064", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0229", "date": "2026-08-08", "inspector": "陶畅", "storeId": "s133", "score": 88, "type": "offline", "qscScore": 88, "complianceIssues": 0},{"id": "a0230", "date": "2026-08-08", "inspector": "王红丽", "storeId": "s147", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0231", "date": "2026-08-08", "inspector": "王红丽", "storeId": "s033", "score": 91, "type": "offline", "qscScore": 91, "complianceIssues": 0},{"id": "a0232", "date": "2026-08-08", "inspector": "王红丽", "storeId": "s108", "score": 80, "type": "offline", "qscScore": 80, "complianceIssues": 0},{"id": "a0233", "date": "2026-08-08", "inspector": "王红丽", "storeId": "s090", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0234", "date": "2026-08-08", "inspector": "王红丽", "storeId": "s191", "score": 91, "type": "offline", "qscScore": 91, "complianceIssues": 0},{"id": "a0235", "date": "2026-08-08", "inspector": "乔雨地", "storeId": "s127", "score": 92, "type": "offline", "qscScore": 92, "complianceIssues": 0},{"id": "a0236", "date": "2026-08-08", "inspector": "乔雨地", "storeId": "s126", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0237", "date": "2026-08-08", "inspector": "徐瑞雪", "storeId": "s089", "score": 88, "type": "offline", "qscScore": 88, "complianceIssues": 0},{"id": "a0238", "date": "2026-08-08", "inspector": "徐瑞雪", "storeId": "s124", "score": 88, "type": "offline", "qscScore": 88, "complianceIssues": 0},{"id": "a0239", "date": "2026-08-08", "inspector": "徐瑞雪", "storeId": "s122", "score": 88, "type": "offline", "qscScore": 88, "complianceIssues": 0},{"id": "a0240", "date": "2026-08-09", "inspector": "马昕茹", "storeId": "s147", "score": 81, "type": "online", "qscScore": 81, "complianceIssues": 0},{"id": "a0241", "date": "2026-08-09", "inspector": "马昕茹", "storeId": "s047", "score": 94, "type": "online", "qscScore": 94, "complianceIssues": 0},{"id": "a0242", "date": "2026-08-09", "inspector": "马昕茹", "storeId": "s145", "score": 94, "type": "online", "qscScore": 94, "complianceIssues": 0},{"id": "a0243", "date": "2026-08-09", "inspector": "马昕茹", "storeId": "s038", "score": 92, "type": "online", "qscScore": 92, "complianceIssues": 0},{"id": "a0244", "date": "2026-08-09", "inspector": "钱磊", "storeId": "s058", "score": 87, "type": "online", "qscScore": 87, "complianceIssues": 0},{"id": "a0245", "date": "2026-08-09", "inspector": "钱磊", "storeId": "s008", "score": 96, "type": "online", "qscScore": 96, "complianceIssues": 0},{"id": "a0246", "date": "2026-08-09", "inspector": "钱磊", "storeId": "s187", "score": 88, "type": "online", "qscScore": 88, "complianceIssues": 0},{"id": "a0247", "date": "2026-08-09", "inspector": "钱磊", "storeId": "s062", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0248", "date": "2026-08-09", "inspector": "范晓明", "storeId": "s103", "score": 88, "type": "online", "qscScore": 88, "complianceIssues": 0},{"id": "a0249", "date": "2026-08-09", "inspector": "范晓明", "storeId": "s065", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0250", "date": "2026-08-09", "inspector": "范晓明", "storeId": "s156", "score": 91, "type": "online", "qscScore": 91, "complianceIssues": 0},{"id": "a0251", "date": "2026-08-09", "inspector": "范晓明", "storeId": "s092", "score": 87, "type": "online", "qscScore": 87, "complianceIssues": 0},{"id": "a0252", "date": "2026-08-09", "inspector": "范晓明", "storeId": "s102", "score": 87, "type": "online", "qscScore": 87, "complianceIssues": 0},{"id": "a0253", "date": "2026-08-09", "inspector": "陶畅", "storeId": "s035", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0254", "date": "2026-08-09", "inspector": "陶畅", "storeId": "s059", "score": 92, "type": "offline", "qscScore": 92, "complianceIssues": 0},{"id": "a0255", "date": "2026-08-09", "inspector": "陶畅", "storeId": "s069", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0256", "date": "2026-08-09", "inspector": "陶畅", "storeId": "s166", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0257", "date": "2026-08-09", "inspector": "乔雨地", "storeId": "s036", "score": 88, "type": "offline", "qscScore": 88, "complianceIssues": 0},{"id": "a0258", "date": "2026-08-09", "inspector": "乔雨地", "storeId": "s175", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0259", "date": "2026-08-09", "inspector": "乔雨地", "storeId": "s040", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0260", "date": "2026-08-09", "inspector": "乔雨地", "storeId": "s037", "score": 87, "type": "offline", "qscScore": 87, "complianceIssues": 0},{"id": "a0261", "date": "2026-08-09", "inspector": "王红丽", "storeId": "s143", "score": 85, "type": "offline", "qscScore": 85, "complianceIssues": 0},{"id": "a0262", "date": "2026-08-09", "inspector": "王红丽", "storeId": "s131", "score": 89, "type": "offline", "qscScore": 89, "complianceIssues": 0},{"id": "a0263", "date": "2026-08-09", "inspector": "王红丽", "storeId": "s153", "score": 90, "type": "offline", "qscScore": 90, "complianceIssues": 0},{"id": "a0264", "date": "2026-08-09", "inspector": "王红丽", "storeId": "s058", "score": 84, "type": "offline", "qscScore": 84, "complianceIssues": 0}],







    inspection_issues: [{"id": "i0001", "resultId": "r001", "storeId": "s011", "content": "超五分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0002", "resultId": "r001", "storeId": "s011", "content": "铲子掉落台面继续使用", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0003", "resultId": "r001", "storeId": "s011", "content": "超30分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0004", "resultId": "r002", "storeId": "s005", "content": "填补餐具未戴手套", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0005", "resultId": "r002", "storeId": "s005", "content": "超五分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0006", "resultId": "r002", "storeId": "s005", "content": "超30分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0007", "resultId": "r002", "storeId": "s005", "content": "打包盒接触隔层", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0008", "resultId": "r003", "storeId": "s170", "content": "超五分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0009", "resultId": "r003", "storeId": "s170", "content": "超30分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0010", "resultId": "r003", "storeId": "s170", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0011", "resultId": "r004", "storeId": "s166", "content": "菜刀接触保鲜盒底", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0012", "resultId": "r004", "storeId": "s166", "content": "超五分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0013", "resultId": "r004", "storeId": "s166", "content": "超30分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0014", "resultId": "r004", "storeId": "s166", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0015", "resultId": "r005", "storeId": "s006", "content": "带耳钉", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0016", "resultId": "r005", "storeId": "s006", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0017", "resultId": "r005", "storeId": "s006", "content": "未戴口罩", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0018", "resultId": "r005", "storeId": "s006", "content": "接触馒头未戴手套", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0019", "resultId": "r005", "storeId": "s006", "content": "午餐炒菜断档", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0020", "resultId": "r005", "storeId": "s006", "content": "超五分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0021", "resultId": "r005", "storeId": "s006", "content": "超30分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0022", "resultId": "r006", "storeId": "s165", "content": "超五分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0023", "resultId": "r006", "storeId": "s165", "content": "超30分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0024", "resultId": "r006", "storeId": "s165", "content": "夹子接触盖子", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0025", "resultId": "r006", "storeId": "s165", "content": "炒锅洗份数盒", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0026", "resultId": "r007", "storeId": "s178", "content": "超五分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0027", "resultId": "r007", "storeId": "s178", "content": "超30分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0028", "resultId": "r007", "storeId": "s178", "content": "夹子接触台面", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0029", "resultId": "r008", "storeId": "s182", "content": "超五分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0030", "resultId": "r008", "storeId": "s182", "content": "超30分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0031", "resultId": "r008", "storeId": "s182", "content": "夹子接触台面", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0032", "resultId": "r008", "storeId": "s182", "content": "报损过多", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0033", "resultId": "r009", "storeId": "s196", "content": "未规范佩戴口罩", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0034", "resultId": "r009", "storeId": "s196", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0035", "resultId": "r009", "storeId": "s196", "content": "未溜边放", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0036", "resultId": "r010", "storeId": "s079", "content": "佩戴首饰", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0037", "resultId": "r010", "storeId": "s079", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0038", "resultId": "r010", "storeId": "s079", "content": "米饭未加盖", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0039", "resultId": "r010", "storeId": "s079", "content": "包装袋入水", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0040", "resultId": "r010", "storeId": "s079", "content": "关火一分钟后出餐", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0041", "resultId": "r010", "storeId": "s079", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0042", "resultId": "r011", "storeId": "s160", "content": "饮料未用规定工具称量", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0043", "resultId": "r011", "storeId": "s160", "content": "垃圾桶垃圾溢出", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0044", "resultId": "r011", "storeId": "s160", "content": "金针菇未软榻", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0045", "resultId": "r011", "storeId": "s160", "content": "汤汁少", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0046", "resultId": "r012", "storeId": "s146", "content": "锅贴煎制时间不足", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0047", "resultId": "r012", "storeId": "s146", "content": "筷子掉落台面", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0048", "resultId": "r012", "storeId": "s146", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0049", "resultId": "r012", "storeId": "s146", "content": "焯水时间过长", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0050", "resultId": "r012", "storeId": "s146", "content": "佩戴首饰", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0051", "resultId": "r013", "storeId": "s148", "content": "浇油操作错误", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0052", "resultId": "r013", "storeId": "s148", "content": "2米饭未加盖", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0053", "resultId": "r013", "storeId": "s148", "content": "3打烊过早", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0054", "resultId": "r013", "storeId": "s148", "content": "4交叉污染", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0055", "resultId": "r013", "storeId": "s148", "content": "5自助服务区未及时清洁", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0056", "resultId": "r013", "storeId": "s148", "content": "6未使用专用称量器具", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0057", "resultId": "r014", "storeId": "s075", "content": "打烊过早", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0058", "resultId": "r014", "storeId": "s075", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0059", "resultId": "r014", "storeId": "s075", "content": "交叉污染，煮台热料包", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0060", "resultId": "r014", "storeId": "s075", "content": "未及时加盖", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0061", "resultId": "r014", "storeId": "s075", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0062", "resultId": "r015", "storeId": "s132", "content": "打烊过早", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0063", "resultId": "r015", "storeId": "s132", "content": "交叉污染", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0064", "resultId": "r015", "storeId": "s132", "content": "热料包方式错误", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0065", "resultId": "r015", "storeId": "s132", "content": "水未开下米", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0066", "resultId": "r016", "storeId": "s042", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0067", "resultId": "r016", "storeId": "s042", "content": "工牌无名字", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0068", "resultId": "r016", "storeId": "s042", "content": "货物掉落地面", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0069", "resultId": "r016", "storeId": "s042", "content": "炒肉无锅圈", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0070", "resultId": "r016", "storeId": "s042", "content": "饮料未使用规定器具称量", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0071", "resultId": "r016", "storeId": "s042", "content": "米饭未及时加盖", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0072", "resultId": "r017", "storeId": "s113", "content": "只放辣椒未放油", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0073", "resultId": "r017", "storeId": "s113", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0074", "resultId": "r017", "storeId": "s113", "content": "锅圈接触台面后继续使用", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0075", "resultId": "r017", "storeId": "s113", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0076", "resultId": "r017", "storeId": "s113", "content": "米饭未及时加盖", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0077", "resultId": "r018", "storeId": "s017", "content": "筷子头落入烤鱼酱", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0078", "resultId": "r018", "storeId": "s017", "content": "水未开下配料", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0079", "resultId": "r018", "storeId": "s017", "content": "保鲜盒落地", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0080", "resultId": "r018", "storeId": "s017", "content": "饮料未使用规定器具称量", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0081", "resultId": "r019", "storeId": "s089", "content": "水未开下绿豆", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0082", "resultId": "r019", "storeId": "s089", "content": "未及时清洁", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0083", "resultId": "r019", "storeId": "s089", "content": "咸菜断档", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0084", "resultId": "r019", "storeId": "s089", "content": "焯水时间过长", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0085", "resultId": "r020", "storeId": "s152", "content": "水未开下小米", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0086", "resultId": "r020", "storeId": "s152", "content": "放油不标准", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0087", "resultId": "r020", "storeId": "s152", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0088", "resultId": "r020", "storeId": "s152", "content": "汤汁过少", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0089", "resultId": "r020", "storeId": "s152", "content": "填补餐具未戴手套", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0090", "resultId": "r020", "storeId": "s152", "content": "一块面出七根半油条", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0091", "resultId": "r021", "storeId": "s133", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0092", "resultId": "r021", "storeId": "s133", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0093", "resultId": "r021", "storeId": "s133", "content": "未及时分装", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0094", "resultId": "r021", "storeId": "s133", "content": "垃圾溢出", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0095", "resultId": "r021", "storeId": "s133", "content": "佩戴首饰", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0096", "resultId": "r021", "storeId": "s133", "content": "交叉污染", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0097", "resultId": "r022", "storeId": "s071", "content": "提前打烊", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0098", "resultId": "r022", "storeId": "s071", "content": "烧麦接触墙壁", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0099", "resultId": "r022", "storeId": "s071", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0100", "resultId": "r022", "storeId": "s071", "content": "煎制时间不足", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0101", "resultId": "r022", "storeId": "s071", "content": "报损过多", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0102", "resultId": "r023", "storeId": "s068", "content": "佩戴首饰", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0103", "resultId": "r023", "storeId": "s068", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0104", "resultId": "r023", "storeId": "s068", "content": "油条开叉", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0105", "resultId": "r023", "storeId": "s068", "content": "加料汁后未充分搅拌", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0106", "resultId": "r023", "storeId": "s068", "content": "加小葱未使用标准工器具", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0107", "resultId": "r024", "storeId": "s181", "content": "蒸菜断档", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0108", "resultId": "r024", "storeId": "s181", "content": "超 5 分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0109", "resultId": "r024", "storeId": "s181", "content": "超 30 分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0110", "resultId": "r025", "storeId": "s149", "content": "填补餐具未戴手套", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0111", "resultId": "r025", "storeId": "s149", "content": "超 30 分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0112", "resultId": "r025", "storeId": "s149", "content": "超 5 分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0113", "resultId": "r025", "storeId": "s149", "content": "未溜边放", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0114", "resultId": "r026", "storeId": "s164", "content": "蒸菜断档", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0115", "resultId": "r026", "storeId": "s164", "content": "填补餐具未戴手套", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0116", "resultId": "r026", "storeId": "s164", "content": "超 5 分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0117", "resultId": "r026", "storeId": "s164", "content": "超 30 分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0118", "resultId": "r027", "storeId": "s002", "content": "超 5 分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0119", "resultId": "r027", "storeId": "s002", "content": "超 30 分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0120", "resultId": "r027", "storeId": "s002", "content": "炒菜断档", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0121", "resultId": "r027", "storeId": "s002", "content": "蒸菜断档", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0122", "resultId": "r027", "storeId": "s002", "content": "交叉污染", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0123", "resultId": "r028", "storeId": "s004", "content": "超 5 分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0124", "resultId": "r028", "storeId": "s004", "content": "超 30 分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0125", "resultId": "r028", "storeId": "s004", "content": "夹子放入屉中", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0126", "resultId": "r028", "storeId": "s004", "content": "未用新碗", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0127", "resultId": "r029", "storeId": "s001", "content": "用手抓熟包子", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0128", "resultId": "r029", "storeId": "s001", "content": "报损过多", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0129", "resultId": "r029", "storeId": "s001", "content": "超 5 分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0130", "resultId": "r029", "storeId": "s001", "content": "超 30 分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0131", "resultId": "r029", "storeId": "s001", "content": "未溜边放", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0132", "resultId": "r029", "storeId": "s001", "content": "午餐蒸菜断档", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0133", "resultId": "r029", "storeId": "s001", "content": "晚餐蒸菜断档", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0134", "resultId": "r030", "storeId": "s191", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0135", "resultId": "r030", "storeId": "s191", "content": "夹子接触桌面后继续使用", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0136", "resultId": "r030", "storeId": "s191", "content": "超 5 分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0137", "resultId": "r030", "storeId": "s191", "content": "晚餐蒸菜断档", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0138", "resultId": "r031", "storeId": "s177", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0139", "resultId": "r031", "storeId": "s177", "content": "夹子接触桌面后继续使用", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0140", "resultId": "r031", "storeId": "s177", "content": "超 5 分钟未翻动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0141", "resultId": "r031", "storeId": "s177", "content": "超 30 分钟未处理", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0142", "resultId": "r032", "storeId": "s024", "content": "佩戴首饰", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0143", "resultId": "r032", "storeId": "s024", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0144", "resultId": "r032", "storeId": "s024", "content": "交叉污染", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0145", "resultId": "r032", "storeId": "s024", "content": "未及时分装", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0146", "resultId": "r032", "storeId": "s024", "content": "焯水时间过长", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0147", "resultId": "r032", "storeId": "s024", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0148", "resultId": "r033", "storeId": "s094", "content": "包子掉落台面继续使用", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0149", "resultId": "r033", "storeId": "s094", "content": "米饭未加盖", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0150", "resultId": "r033", "storeId": "s094", "content": "提前打烊", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0151", "resultId": "r033", "storeId": "s094", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0152", "resultId": "r033", "storeId": "s094", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0153", "resultId": "r034", "storeId": "s087", "content": "米饭未加盖", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0154", "resultId": "r034", "storeId": "s087", "content": "交叉污染", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0155", "resultId": "r034", "storeId": "s087", "content": "工牌无名字", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0156", "resultId": "r034", "storeId": "s087", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0157", "resultId": "r035", "storeId": "s141", "content": "工牌无名字", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0158", "resultId": "r035", "storeId": "s141", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0159", "resultId": "r035", "storeId": "s141", "content": "水未开下配料", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0160", "resultId": "r035", "storeId": "s141", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0161", "resultId": "r035", "storeId": "s141", "content": "报损过多", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0162", "resultId": "r035", "storeId": "s141", "content": "汤汁过少", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0163", "resultId": "r035", "storeId": "s141", "content": "浇油数量不标准", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0164", "resultId": "r035", "storeId": "s141", "content": "未及时清洁", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0165", "resultId": "r036", "storeId": "s108", "content": "未穿工服", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0166", "resultId": "r036", "storeId": "s108", "content": "米饭未加盖", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0167", "resultId": "r036", "storeId": "s108", "content": "浇油数量不标准", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0168", "resultId": "r036", "storeId": "s108", "content": "交叉污染", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0169", "resultId": "r036", "storeId": "s108", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0170", "resultId": "r036", "storeId": "s108", "content": "咸菜断档", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0171", "resultId": "r036", "storeId": "s108", "content": "未及时清洁", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0172", "resultId": "r037", "storeId": "s104", "content": "未使用标准工器具", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0173", "resultId": "r037", "storeId": "s104", "content": "米饭未及时打散", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0174", "resultId": "r038", "storeId": "s136", "content": "汤勺接触水龙头开关", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0175", "resultId": "r038", "storeId": "s136", "content": "提前打烊", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0176", "resultId": "r038", "storeId": "s136", "content": "报损过多", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0177", "resultId": "r038", "storeId": "s136", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0178", "resultId": "r039", "storeId": "s115", "content": "嘴里嚼东西", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0179", "resultId": "r039", "storeId": "s115", "content": "后厨摘帽子", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0180", "resultId": "r040", "storeId": "s134", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0181", "resultId": "r040", "storeId": "s134", "content": "下馄饨未抖动", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0182", "resultId": "r040", "storeId": "s134", "content": "汤勺接触水龙头开关", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0183", "resultId": "r040", "storeId": "s134", "content": "未使用标准工器具称量", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0184", "resultId": "r041", "storeId": "s051", "content": "汤勺接触桌面", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0185", "resultId": "r041", "storeId": "s051", "content": "仪容仪表不合格", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0186", "resultId": "r041", "storeId": "s051", "content": "三勺油两份肉", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0187", "resultId": "r041", "storeId": "s051", "content": "自助服务区未及时清洁", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"}, {"id": "i0188", "resultId": "r041", "storeId": "s051", "content": "制作饮料未使用标准工器具", "category": "QSC", "stdScore": 1, "actualScore": 0, "status": "待处理", "inspector": "钱磊"},{"id": "i1001", "resultId": "a0020", "storeId": "s186", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①员工岗位标准掌握不足，部分产品规格参数不清楚\n②台账相关抽查问答存在不熟悉问题"},{"id": "i1002", "resultId": "a0020", "storeId": "s186", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n①前厅话术频次较低，9:00后到店顾客未听见迎宾语"},{"id": "i1003", "resultId": "a0020", "storeId": "s186", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①高峰期部分菜品断档，出餐超时\n②西红柿加工未去除果蒂，处理不符合标准\n③早餐出品不合格，素包子出现破损"},{"id": "i1004", "resultId": "a0020", "storeId": "s186", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①桌椅台面残留油渍污渍，收餐清理不及时\n②饮水机滴水盘存有毛发，清洁不到位\n③门店门框、玻璃下方存在污渍，有张贴小广告痕迹\n④门口三包区域垃圾未及时清理\n⑤开水器、封膜机设备表面有污渍积灰\n⑥冰箱门封条存有污渍\n顾客不可视区域\n①后厨水池下方清洁不到位留有污渍\n②洗碗机设备封条、天花板存在污渍毛发"},{"id": "i1005", "resultId": "a0020", "storeId": "s186", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①托盘存有食物残渣未清理干净\n②消毒柜未正常开启，餐盘残留残渣\n③筷子清洗不干净存在污渍\n④晨检相关记录缺失无法找到\n⑤垃圾分类执行不彻底\n⑥食材生熟混放，部分物料未封口储存"},{"id": "i1006", "resultId": "a0021", "storeId": "s020", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①门店管理人员对产品标准掌握不熟，抽查问答答错\n②员工岗位知识掌握存在短板"},{"id": "i1007", "resultId": "a0021", "storeId": "s020", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n①前厅员工工服纽扣未全部扣齐，着装不规范\n②后厨值班经理佩戴项链，仪容不符合要求"},{"id": "i1008", "resultId": "a0021", "storeId": "s020", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①小葱切制规格不合格，切配未达标\n②馄饨破皮后正常出餐，出品检查不到位"},{"id": "i1009", "resultId": "a0021", "storeId": "s020", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜内筷子、餐盘残留污渍残渣\n②饮水机出水口有水垢未清洁\n③清洁工具摆放杂乱、工具表面有污渍\n④门店玻璃留有手印污渍\n⑤豆浆机、开水器设备污渍未清理干净\n⑥消毒柜下方散落毛发\n顾客不可视区域\n①后厨设备底部积有污渍\n②后厨墙面、胶条存有污渍\n③备餐区下方墙面污垢堆积\n④冰柜封条污渍较重未清洁"},{"id": "i1010", "resultId": "a0021", "storeId": "s020", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①垃圾分类未执行到位\n②制冰机内部水垢污垢未清理\n③员工水杯没有集中定点存放\n④案板刀具未分区管理，带有食物残渣污渍"},{"id": "i1011", "resultId": "a0022", "storeId": "s019", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①管理人员产品标准掌握不熟练\n②岗位抽查问答存在不熟悉情况"},{"id": "i1012", "resultId": "a0022", "storeId": "s019", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题项"},{"id": "i1013", "resultId": "a0022", "storeId": "s019", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①圆白菜储存不当出现冻伤，原材料品质受损"},{"id": "i1014", "resultId": "a0022", "storeId": "s019", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①餐桌餐椅残留食物残渣\n②饮水机出水口有水垢污渍\n③天花板积有毛絮灰尘\n④前台设备表面积灰、留有污渍\n顾客不可视区域\n①后厨设备底部残留污渍残渣\n②后厨水池下方污渍堆积\n⑤冰柜门封条存有污渍残渣"},{"id": "i1015", "resultId": "a0022", "storeId": "s019", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①冷藏库内食材开封后未及时封口加盖储存\n②冰箱内部生熟食材混放\n③米面粮油未离地存放\n④制冰机内部水垢未清理\n⑤刀具上面残留食物残渣"},{"id": "i1016", "resultId": "a0023", "storeId": "s050", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①管理人员对产品配比标准掌握不清\n②员工岗位相关制度问答答错"},{"id": "i1017", "resultId": "a0023", "storeId": "s050", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n①前厅员工工服仅扣一颗纽扣，着装不规范"},{"id": "i1018", "resultId": "a0023", "storeId": "s050", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①蔬菜储存不当出现冻伤情况\n②香葱、小葱切制规格不合格，香葱夹带黄叶"},{"id": "i1019", "resultId": "a0023", "storeId": "s050", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜餐具残留残渣污渍\n②饮水机接水口存有污渍\n③餐桌餐椅表面残留食物残渣\n④天花板检修口周边堆积毛絮灰尘\n⑤前台设备顶部污渍积灰未清理\n顾客不可视区域\n①后厨设备底部残留污渍残渣\n②后厨水池下方污渍堆积\n③收银台底部胶渍、油污较重\n④冰柜门封条污渍残渣未清理"},{"id": "i1020", "resultId": "a0023", "storeId": "s050", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①库房食材开封后未封口储存\n②冰箱内生熟食材混放存放\n③米面粮油没有离地存放\n④制冰机内部有水垢污渍\n⑤刀具缝隙残留食物残渣"},{"id": "i1021", "resultId": "a0024", "storeId": "s051", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①管理人员产品克重标准掌握不熟悉\n②员工相关制度抽查问答出错"},{"id": "i1022", "resultId": "a0024", "storeId": "s051", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题项"},{"id": "i1023", "resultId": "a0024", "storeId": "s051", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①圆白菜储存不当出现冻伤\n②香葱原料夹带黄叶，品质不佳\n③烤串制作不达标，鸡肉串破皮、羊肉串重量超标"},{"id": "i1024", "resultId": "a0024", "storeId": "s051", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜餐碟存有毛发\n②餐具柜抽屉内部残留残渣\n③餐桌台面残留食物残渣污渍\n④厨余垃圾桶桶盖未加盖\n⑤门店铜牌位置有污渍\n⑥开水机顶部积灰存有污渍\n顾客不可视区域\n①排烟罩积攒油垢\n②冰箱层架、封条存在污渍"},{"id": "i1025", "resultId": "a0024", "storeId": "s051", "date": "2026-08-01", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①垃圾分类落实不到位\n②冷藏食材开封后未封口储存\n③冰箱内部生熟混放，出现交叉存放风险\n④案板、刀具残留食物残渣污渍\n⑤晨检记录缺失，台账资料不全"},{"id": "i1026", "resultId": "a0040", "storeId": "s193", "date": "2026-08-01", "inspector": "徐瑞雪", "category": "QSC", "description": "无差异"},{"id": "i1027", "resultId": "a0041", "storeId": "s170", "date": "2026-08-01", "inspector": "徐瑞雪", "category": "QSC", "description": "无差异"},{"id": "i1028", "resultId": "a0042", "storeId": "s092", "date": "2026-08-01", "inspector": "徐瑞雪", "category": "QSC", "description": "长款0.3元"},{"id": "i1029", "resultId": "a0043", "storeId": "s043", "date": "2026-08-01", "inspector": "徐瑞雪", "category": "QSC", "description": "无差异"},{"id": "i1030", "resultId": "a0044", "storeId": "s141", "date": "2026-08-01", "inspector": "乔雨地", "category": "QSC", "description": "短款1.2元"},{"id": "i1031", "resultId": "a0045", "storeId": "s142", "date": "2026-08-01", "inspector": "乔雨地", "category": "QSC", "description": "短款95.2元"},{"id": "i1032", "resultId": "a0046", "storeId": "s144", "date": "2026-08-01", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1033", "resultId": "a0047", "storeId": "s145", "date": "2026-08-01", "inspector": "乔雨地", "category": "QSC", "description": "长款10元"},{"id": "i1034", "resultId": "a0075", "storeId": "s068", "date": "2026-08-02", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1035", "resultId": "a0076", "storeId": "s024", "date": "2026-08-02", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1036", "resultId": "a0077", "storeId": "s026", "date": "2026-08-02", "inspector": "乔雨地", "category": "QSC", "description": "长款6.3元"},{"id": "i1037", "resultId": "a0078", "storeId": "s030", "date": "2026-08-02", "inspector": "乔雨地", "category": "QSC", "description": "短款10元"},{"id": "i1038", "resultId": "a0079", "storeId": "s194", "date": "2026-08-02", "inspector": "王红丽", "category": "QSC", "description": "短款4.38元"},{"id": "i1039", "resultId": "a0080", "storeId": "s079", "date": "2026-08-02", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1040", "resultId": "a0081", "storeId": "s075", "date": "2026-08-02", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1041", "resultId": "a0082", "storeId": "s082", "date": "2026-08-02", "inspector": "王红丽", "category": "QSC", "description": "长款4.2元"},{"id": "i1042", "resultId": "a0094", "storeId": "s095", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①早餐产品供应管控不到位，9:05‑9:17松糕出现断档\n②员工对公司相关制度掌握不足\n③岗位SOP知识抽查回答不熟练\n④设备故障报修跟进记录不完善"},{"id": "i1043", "resultId": "a0094", "storeId": "s095", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1044", "resultId": "a0094", "storeId": "s095", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①烧麦出现破皮，蒸制出品未按标准操作"},{"id": "i1045", "resultId": "a0094", "storeId": "s095", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜内餐碟存在污渍、筷子残留残渣\n②饮水机斟水口有污渍未清洁\n③铜锅、锅架表面油渍、锅底有污渍\n④桌椅缝隙残留食物残渣\n⑤门店门玻璃留有手印污渍\n⑥门口三包区有纸巾杂物垃圾\n顾客不可视区域\n①收汁锅残留污渍未清洁干净\n②洗碗机内部存有污垢污渍\n③冰箱密封条积有污渍"},{"id": "i1046", "resultId": "a0094", "storeId": "s095", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①常温库房原料开封后未封口储存\n②制冰机内部有水垢未清理\n③晨检相关台账记录未及时填写"},{"id": "i1047", "resultId": "a0095", "storeId": "s171", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①在岗人员手机数量统计核对不一致\n②员工制度掌握抽查回答有误\n③岗位SOP知识抽查回答不熟练\n④设备出品检查记录不规范"},{"id": "i1048", "resultId": "a0095", "storeId": "s171", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1049", "resultId": "a0095", "storeId": "s171", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①番茄鱼出品未撒小葱，出品标准未落实\n②高峰期扣肉出现断档，菜品档口管控不足\n③蔬菜出现冻伤、黄豆未按要求存放冷冻冰箱，原料储存不当\n④剪刀工具存有污渍\n⑤蒜蓉粉丝虾粉丝发干，出品未达标"},{"id": "i1050", "resultId": "a0095", "storeId": "s171", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①无回餐空位，回餐盘收纳不合理\n②洗碗间垃圾桶未加盖\n③开水器龙头、封膜机顶部存在污渍\n④冰箱密封条留有污渍\n顾客不可视区域\n无问题"},{"id": "i1051", "resultId": "a0095", "storeId": "s171", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①餐盘柜未开启，餐盘无预热温度\n②晨检、食品添加剂台账记录未及时更新\n③垃圾没有完全分类\n④物料原料开封后未封口存放"},{"id": "i1052", "resultId": "a0096", "storeId": "s180", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①高峰期牛肉面估清断货，产品档口管控不足\n②门店广告机画面显示异常未及时处理报修\n③员工制度掌握抽查回答有误\n④岗位SOP知识抽查回答不熟练\n⑤广告机故障报修跟进不及时"},{"id": "i1053", "resultId": "a0096", "storeId": "s180", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n①后厨员工工服扣子未按规范扣好"},{"id": "i1054", "resultId": "a0096", "storeId": "s180", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n无问题"},{"id": "i1055", "resultId": "a0096", "storeId": "s180", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜餐碟存有油渍、毛发\n②抽屉内部残留杂物残渣\n③洗碗间垃圾桶未加盖\n④门店大门玻璃留有胶痕污渍\n⑤墙面开关位置存在污渍\n⑥封膜机顶部留有污渍\n⑦消毒柜内部残留残渣\n顾客不可视区域\n①清洁工具摆放杂乱、剪刀存有污渍\n②后厨各类容器、设备表面油垢未清理\n③收汁台下方积存油垢\n④冰箱层架位置留有污渍"},{"id": "i1056", "resultId": "a0096", "storeId": "s180", "date": "2026-08-03", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①库房开封原料未封口储存\n②冰箱内物品堆放杂乱、包装箱直接放置冰箱\n③后厨区域发现苍蝇，虫害防控不到位"},{"id": "i1057", "resultId": "a0097", "storeId": "s135", "date": "2026-08-03", "inspector": "王红丽", "category": "QSC", "description": "长款20.1元"},{"id": "i1058", "resultId": "a0098", "storeId": "s172", "date": "2026-08-03", "inspector": "王红丽", "category": "QSC", "description": "短款0.1元"},{"id": "i1059", "resultId": "a0099", "storeId": "s017", "date": "2026-08-03", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1060", "resultId": "a0100", "storeId": "s076", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "玉桥中路，经营四区，第一负责人王新龙"},{"id": "i1061", "resultId": "a0100", "storeId": "s076", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "整体周清痕迹明显，设备底部干净，遗漏点："},{"id": "i1062", "resultId": "a0100", "storeId": "s076", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "冰箱层架有霉斑、污渍，密封条需要进一步清理"},{"id": "i1063", "resultId": "a0101", "storeId": "s150", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "李老新村，经营八区，区域直管"},{"id": "i1064", "resultId": "a0101", "storeId": "s150", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "整体周清痕迹明显，忽略冰箱密封条卫生，前厅三个吊灯内部蜘蛛网未清理"},{"id": "i1065", "resultId": "a0102", "storeId": "s074", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "通州梨园店，经营四区，店长张帅帅"},{"id": "i1066", "resultId": "a0102", "storeId": "s074", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "整体周清痕迹明显，忽略点：冰箱层架夹缝霉斑，前厅墙角蜘蛛网，墙面胶痕"},{"id": "i1067", "resultId": "a0103", "storeId": "s083", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "塔营北街店。经营四区，店长关姗姗"},{"id": "i1068", "resultId": "a0103", "storeId": "s083", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "整体周清痕迹明显，效果良好"},{"id": "i1069", "resultId": "a0103", "storeId": "s083", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "忽略冰箱柜门卫生，柜门油渍，层架污渍"},{"id": "i1070", "resultId": "a0104", "storeId": "s156", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "经营八区，甜水园店，店长郝帅杰"},{"id": "i1071", "resultId": "a0104", "storeId": "s156", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "周清痕迹明显"},{"id": "i1072", "resultId": "a0104", "storeId": "s156", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "但忽略了吧台的冰箱层架，发霉、长毛；制冰机少许青苔"},{"id": "i1073", "resultId": "a0105", "storeId": "s162", "date": "2026-08-03", "inspector": "乔雨地", "category": "QSC", "description": "短款五元"},{"id": "i1074", "resultId": "a0117", "storeId": "s095", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①早餐产品供应管控不到位，9:05‑9:17松糕出现断档\n②员工对公司相关制度掌握不足\n③岗位SOP知识抽查回答不熟练\n④设备故障报修跟进记录不完善"},{"id": "i1075", "resultId": "a0117", "storeId": "s095", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1076", "resultId": "a0117", "storeId": "s095", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①烧麦出现破皮，蒸制出品未按标准操作"},{"id": "i1077", "resultId": "a0117", "storeId": "s095", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜内餐碟存在污渍、筷子残留残渣\n②饮水机斟水口有污渍未清洁\n③铜锅、锅架表面油渍、锅底有污渍\n④桌椅缝隙残留食物残渣\n⑤门店门玻璃留有手印污渍\n⑥门口三包区有纸巾杂物垃圾\n顾客不可视区域\n①收汁锅残留污渍未清洁干净\n②洗碗机内部存有污垢污渍\n③冰箱密封条积有污渍"},{"id": "i1078", "resultId": "a0117", "storeId": "s095", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①常温库房原料开封后未封口储存\n②制冰机内部有水垢未清理\n③晨检相关台账记录未及时填写"},{"id": "i1079", "resultId": "a0118", "storeId": "s171", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①在岗人员手机数量统计核对不一致\n②员工制度掌握抽查回答有误\n③岗位SOP知识抽查回答不熟练\n④设备出品检查记录不规范"},{"id": "i1080", "resultId": "a0118", "storeId": "s171", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1081", "resultId": "a0118", "storeId": "s171", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①番茄鱼出品未撒小葱，出品标准未落实\n②高峰期扣肉出现断档，菜品档口管控不足\n③蔬菜出现冻伤、黄豆未按要求存放冷冻冰箱，原料储存不当\n④剪刀工具存有污渍\n⑤蒜蓉粉丝虾粉丝发干，出品未达标"},{"id": "i1082", "resultId": "a0118", "storeId": "s171", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①无回餐空位，回餐盘收纳不合理\n②洗碗间垃圾桶未加盖\n③开水器龙头、封膜机顶部存在污渍\n④冰箱密封条留有污渍\n顾客不可视区域\n无问题"},{"id": "i1083", "resultId": "a0118", "storeId": "s171", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①餐盘柜未开启，餐盘无预热温度\n②晨检、食品添加剂台账记录未及时更新\n③垃圾没有完全分类\n④物料原料开封后未封口存放"},{"id": "i1084", "resultId": "a0119", "storeId": "s180", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①高峰期牛肉面估清断货，产品档口管控不足\n②门店广告机画面显示异常未及时处理报修\n③员工制度掌握抽查回答有误\n④岗位SOP知识抽查回答不熟练\n⑤广告机故障报修跟进不及时"},{"id": "i1085", "resultId": "a0119", "storeId": "s180", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n①后厨员工工服扣子未按规范扣好"},{"id": "i1086", "resultId": "a0119", "storeId": "s180", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n无问题"},{"id": "i1087", "resultId": "a0119", "storeId": "s180", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜餐碟存有油渍、毛发\n②抽屉内部残留杂物残渣\n③洗碗间垃圾桶未加盖\n④门店大门玻璃留有胶痕污渍\n⑤墙面开关位置存在污渍\n⑥封膜机顶部留有污渍\n⑦消毒柜内部残留残渣\n顾客不可视区域\n①清洁工具摆放杂乱、剪刀存有污渍\n②后厨各类容器、设备表面油垢未清理\n③收汁台下方积存油垢\n④冰箱层架位置留有污渍"},{"id": "i1088", "resultId": "a0119", "storeId": "s180", "date": "2026-08-04", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①库房开封原料未封口储存\n②冰箱内物品堆放杂乱、包装箱直接放置冰箱\n③后厨区域发现苍蝇，虫害防控不到位"},{"id": "i1089", "resultId": "a0120", "storeId": "s135", "date": "2026-08-04", "inspector": "王红丽", "category": "QSC", "description": "长款20.1元"},{"id": "i1090", "resultId": "a0121", "storeId": "s172", "date": "2026-08-04", "inspector": "王红丽", "category": "QSC", "description": "短款0.1元"},{"id": "i1091", "resultId": "a0122", "storeId": "s017", "date": "2026-08-04", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1092", "resultId": "a0123", "storeId": "s076", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "玉桥中路，经营四区，第一负责人王新龙"},{"id": "i1093", "resultId": "a0123", "storeId": "s076", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "整体周清痕迹明显，设备底部干净，遗漏点："},{"id": "i1094", "resultId": "a0123", "storeId": "s076", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "冰箱层架有霉斑、污渍，密封条需要进一步清理"},{"id": "i1095", "resultId": "a0124", "storeId": "s150", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "李老新村，经营八区，区域直管"},{"id": "i1096", "resultId": "a0124", "storeId": "s150", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "整体周清痕迹明显，忽略冰箱密封条卫生，前厅三个吊灯内部蜘蛛网未清理"},{"id": "i1097", "resultId": "a0125", "storeId": "s074", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "通州梨园店，经营四区，店长张帅帅"},{"id": "i1098", "resultId": "a0125", "storeId": "s074", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "整体周清痕迹明显，忽略点：冰箱层架夹缝霉斑，前厅墙角蜘蛛网，墙面胶痕"},{"id": "i1099", "resultId": "a0126", "storeId": "s083", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "塔营北街店。经营四区，店长关姗姗"},{"id": "i1100", "resultId": "a0126", "storeId": "s083", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "整体周清痕迹明显，效果良好"},{"id": "i1101", "resultId": "a0126", "storeId": "s083", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "忽略冰箱柜门卫生，柜门油渍，层架污渍"},{"id": "i1102", "resultId": "a0127", "storeId": "s156", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "经营八区，甜水园店，店长郝帅杰"},{"id": "i1103", "resultId": "a0127", "storeId": "s156", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "周清痕迹明显"},{"id": "i1104", "resultId": "a0127", "storeId": "s156", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "但忽略了吧台的冰箱层架，发霉、长毛；制冰机少许青苔"},{"id": "i1105", "resultId": "a0128", "storeId": "s162", "date": "2026-08-04", "inspector": "乔雨地", "category": "QSC", "description": "短款五元"},{"id": "i1106", "resultId": "a0142", "storeId": "s138", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①在岗人员手机数量收集不一致\n②早餐9:30后产品断档，豆腐脑断档10分钟"},{"id": "i1107", "resultId": "a0142", "storeId": "s138", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n①后厨员工工服纽扣未扣齐"},{"id": "i1108", "resultId": "a0142", "storeId": "s138", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①蔬菜包存在冻伤情况\n②制备区香菜发黄"},{"id": "i1109", "resultId": "a0142", "storeId": "s138", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜内餐具有残渣污渍\n②洗手池周边存有垃圾\n③垃圾桶未加盖\n④三包区域烟头、纸巾垃圾未清理\n⑤设备表面存在污渍，封膜机有污渍\n⑥消毒柜内部有毛发\n顾客不可视区域\n①后厨设备下方地面卫生较差\n②收汁锅未清洁留有污渍\n③洗碗间有水垢油污、地面不干净\n④冰柜密封条存有污渍"},{"id": "i1110", "resultId": "a0142", "storeId": "s138", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①原材料未做到先进先出\n②常温库存原料开封后未封口储存\n③制冰机内部存有残渣污垢未清理\n④员工水杯未集中定点存放\n⑤案板刀具残留食物残渣\n⑥后厨区域发现苍蝇\n⑦各类台账记录更新不及时"},{"id": "i1111", "resultId": "a0143", "storeId": "s132", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n无问题"},{"id": "i1112", "resultId": "a0143", "storeId": "s132", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1113", "resultId": "a0143", "storeId": "s132", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①洋葱上冻储存\n②烤串鸡肉皮单独成块，操作不符合标准\n③黄焖鸡收汁不够浓稠，出品不达标"},{"id": "i1114", "resultId": "a0143", "storeId": "s132", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜餐具残留残渣\n②垃圾桶没有加盖\n②门框上方存有蜘蛛网小虫\n③封膜机、豆浆机机盖污渍未清理\n④吧台水池下方存有污渍\n⑤消毒柜底部积灰\n顾客不可视区域\n①清洁工具摆放杂乱、剪刀存有污渍\n②洗碗间台面下方结蜘蛛网\n③库房货架下方有蜘蛛网\n④冰柜密封条、冰箱内侧边角污渍未清理"},{"id": "i1115", "resultId": "a0143", "storeId": "s132", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①原材料未落实先进先出\n②开封物料未封口保存\n③制冰机内部有水垢污垢\n④案板、刀具存有残渣飞虫"},{"id": "i1116", "resultId": "a0144", "storeId": "s052", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n无问题"},{"id": "i1117", "resultId": "a0144", "storeId": "s052", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n①收台员工未按要求佩戴腰包"},{"id": "i1118", "resultId": "a0144", "storeId": "s052", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①洋葱、螺丝椒上冻储存\n②香菜存在黄叶\n③烤串鸡皮单独成块，操作不标准\n④烤串出现漏签问题\n⑤红烧鲈鱼出品碗边没有擦拭干净"},{"id": "i1119", "resultId": "a0144", "storeId": "s052", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①洗碗间垃圾桶未加盖\n顾客不可视区域\n①锅贴机油槽、蒸饭车把手留有油渍\n②冰柜滤网、密封条污渍未清洁"},{"id": "i1120", "resultId": "a0144", "storeId": "s052", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①牛奶原材料未离地存放\n②制冰机内部有水垢污垢\n③刀具存有食物残渣\n④台账晨检记录、添加剂记录未及时更新"},{"id": "i1121", "resultId": "a0145", "storeId": "s184", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n无问题"},{"id": "i1122", "resultId": "a0145", "storeId": "s184", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1123", "resultId": "a0145", "storeId": "s184", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①蔬菜存在冻伤\n②香菜烂叶\n③烤串黑边没有修剪，出品不合格"},{"id": "i1124", "resultId": "a0145", "storeId": "s184", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜小碟子存有污渍\n②抽屉内部留有鸡蛋壳残渣\n③门框留有胶痕污渍\n④豆浆机、封膜机顶部污渍未清理\n⑤消毒柜内部残留残渣\n顾客不可视区域\n①清洁工具摆放杂乱，剪刀留有污渍\n②蒸饭车把手油渍、备餐间水池污渍\n③后厨风口存有毛絮、天花板污渍\n④洗碗机内部有水垢\n⑤库房风口毛絮堆积\n⑥冰箱滤网、密封条污渍未清理"},{"id": "i1125", "resultId": "a0145", "storeId": "s184", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①开封辣椒物料没有封口储存\n②制冰机水槽有水垢污渍\n③案板刀具残留食物残渣\n④各类台账记录未及时更新"},{"id": "i1126", "resultId": "a0146", "storeId": "s161", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n无问题"},{"id": "i1127", "resultId": "a0146", "storeId": "s161", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1128", "resultId": "a0146", "storeId": "s161", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①蔬菜存放出现上冻情况\n②剪刀存有污渍\n③蒜蓉粉丝虾蒜蓉铺撒不均匀，出品不达标"},{"id": "i1129", "resultId": "a0146", "storeId": "s161", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①垃圾桶外围脏污\n②餐桌台面残留残渣油渍\n③餐盘存有毛发、餐碟残留残渣\n④饮水机出水口污渍\n⑤洗碗间垃圾桶未加盖\n⑥封膜机、开水器有水垢污渍\n⑦消毒柜内部残留残渣\n⑧冰箱密封条侧边存有污渍\n顾客不可视区域\n①外卖柜门胶条、蒸饭车把手油渍\n②天花板上方堆积毛絮\n③洗碗间内部水垢、墙面留有污渍"},{"id": "i1130", "resultId": "a0146", "storeId": "s161", "date": "2026-08-05", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①托盘残留食物残渣\n②筷子存有残渣污渍\n③员工水杯未集中存放\n④剩余物料储存未封口"},{"id": "i1131", "resultId": "a0152", "storeId": "s045", "date": "2026-08-05", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1132", "resultId": "a0153", "storeId": "s038", "date": "2026-08-05", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1133", "resultId": "a0154", "storeId": "s187", "date": "2026-08-05", "inspector": "王红丽", "category": "QSC", "description": "短款7元"},{"id": "i1134", "resultId": "a0155", "storeId": "s028", "date": "2026-08-05", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1135", "resultId": "a0166", "storeId": "s121", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①早餐时段虾仁锅贴、松糕素包出现断档，早餐产品供应未达标\n②员工SOP知识抽查掌握度不足，部分问题回答错误"},{"id": "i1136", "resultId": "a0166", "storeId": "s121", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1137", "resultId": "a0166", "storeId": "s121", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n无问题"},{"id": "i1138", "resultId": "a0166", "storeId": "s121", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜内餐具残留残渣污垢\n②餐桌椅表面存在残渣、小飞虫\n③门店对外企划海报未按时翻面更新\n④封膜机顶部存在污渍\n顾客不可视区域\n①蒸饭车把手、烤箱存有油渍未清洁\n②洗碗机封条有水垢污渍\n③冰柜门下方积有油垢"},{"id": "i1139", "resultId": "a0166", "storeId": "s121", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①辣椒段未执行先进先出原则\n②面条、烤串原材料开封后未加盖密封存放\n③制冰机水槽有水垢\n④净水机内部发现飞虫尸体\n⑤菜板残留食物残渣"},{"id": "i1140", "resultId": "a0167", "storeId": "s091", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①员工岗位SOP知识点回答有误"},{"id": "i1141", "resultId": "a0167", "storeId": "s091", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1142", "resultId": "a0167", "storeId": "s091", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①圆白菜、洋葱存在冻伤情况"},{"id": "i1143", "resultId": "a0167", "storeId": "s091", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①洗手间出风口积存毛絮\n②墙面存在毛絮灰尘\n③收银台上方出风口未清洁\n④开水机、封膜机顶部积灰污渍\n⑤消毒柜内部残留毛发、残渣\n顾客不可视区域\n①剪刀存有污渍\n②库房货架下方堆放垃圾残渣\n③后厨冰箱密封条、层架油污未清理"},{"id": "i1144", "resultId": "a0167", "storeId": "s091", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①茶叶蛋原材料开封后未完全封口\n②制冰机水槽有水垢、冰铲污渍\n③灭蝇灯粘虫纸未及时更换"},{"id": "i1145", "resultId": "a0168", "storeId": "s096", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①员工SOP知识抽查部分原料克数回答错误"},{"id": "i1146", "resultId": "a0168", "storeId": "s096", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1147", "resultId": "a0168", "storeId": "s096", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①制备区香菜存在黄叶，原料品相不合格"},{"id": "i1148", "resultId": "a0168", "storeId": "s096", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①饮水机出水口存在污渍\n②餐椅表面残留食物残渣\n③豆浆机、封膜机存有污渍未清洁干净\n④吧台水池下方有污渍\n⑤消毒柜抽屉内部有毛发\n⑥炒菜机旁玻璃留有油渍\n顾客不可视区域\n①剪刀存在油渍\n②油条机柜门存有油渍"},{"id": "i1149", "resultId": "a0168", "storeId": "s096", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①垃圾未做到完全分类投放\n②葱油未落实先进先出\n③食材开封存放未封口\n④净水机内部存在虫子尸体"},{"id": "i1150", "resultId": "a0169", "storeId": "s109", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①员工SOP考核多项原料参数回答错误"},{"id": "i1151", "resultId": "a0169", "storeId": "s109", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1152", "resultId": "a0169", "storeId": "s109", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①香菜带有黄叶、小葱切制不符合标准"},{"id": "i1153", "resultId": "a0169", "storeId": "s109", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜内筷子、水杯残留残渣、毛发\n②饮水机斟水口周边存在污渍\n③门框有蛛网、门锁留有胶痕\n④封膜机顶部、豆浆机盖子污渍未清理\n⑤消毒柜内部存有残渣\n顾客不可视区域\n①后厨设备下方清洁不到位\n②锅贴机油槽未清理\n③洗碗机有水垢污渍\n④库房货架下方残留污渍残渣\n⑤冰柜层架、密封条存有污渍"},{"id": "i1154", "resultId": "a0169", "storeId": "s109", "date": "2026-08-06", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①冰箱内存放物品存在交叉污染风险\n②制冰机水槽留有污渍\n③菜板存在残渍、掉漆\n④后厨区域发现蚊虫，虫害防控不到位"},{"id": "i1155", "resultId": "a0170", "storeId": "s039", "date": "2026-08-06", "inspector": "徐瑞雪", "category": "QSC", "description": "无差异"},{"id": "i1156", "resultId": "a0171", "storeId": "s173", "date": "2026-08-06", "inspector": "徐瑞雪", "category": "QSC", "description": "﻿长款17.45元（备用金500无误，另一个钱箱内17.5为私人款项换零钱放入）"},{"id": "i1157", "resultId": "a0172", "storeId": "s046", "date": "2026-08-06", "inspector": "徐瑞雪", "category": "QSC", "description": "无差异"},{"id": "i1158", "resultId": "a0173", "storeId": "s027", "date": "2026-08-06", "inspector": "徐瑞雪", "category": "QSC", "description": "无差异"},{"id": "i1159", "resultId": "a0174", "storeId": "s120", "date": "2026-08-06", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1160", "resultId": "a0175", "storeId": "s181", "date": "2026-08-06", "inspector": "乔雨地", "category": "QSC", "description": "长款4.2元"},{"id": "i1161", "resultId": "a0176", "storeId": "s113", "date": "2026-08-06", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1162", "resultId": "a0177", "storeId": "s101", "date": "2026-08-06", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1163", "resultId": "a0178", "storeId": "s114", "date": "2026-08-06", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1164", "resultId": "a0192", "storeId": "s164", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①员工工装形象不达标，人员着装未做到干净整洁\n②财务台账存在短款8.22元，台账管理存在问题"},{"id": "i1165", "resultId": "a0192", "storeId": "s164", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n①服务台未主动介绍餐具位置\n②前厅服务话术频次低，未做到到店主动问候"},{"id": "i1166", "resultId": "a0192", "storeId": "s164", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①原材料葱花存在冻伤情况"},{"id": "i1167", "resultId": "a0192", "storeId": "s164", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①桌面有汤汁、牛奶残渣未及时清理\n②洗手间镜子存在水印\n③三包区地面存在垃圾\n④开水器龙头有水渍污渍\n⑤消毒柜内部存在残渣、头发\n⑥外卖台冰箱滤网未清洁\n顾客不可视区域\n①洗碗间垃圾桶未盖盖子\n②工具刀具摆放杂乱，剪刀未清洁\n③后厨设备下方卫生未清洁\n④电子秤存在油渍\n⑤洗碗机密封条有水垢水渍\n⑥库房货架下方卫生未清洁"},{"id": "i1168", "resultId": "a0192", "storeId": "s164", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①托盘存在残渣污渍\n②餐盘餐碟存在残渣污渍\n③筷子存在残渣污渍\n④晨检台账未更新\n⑤物料未封口存放"},{"id": "i1169", "resultId": "a0193", "storeId": "s197", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①员工佩戴项链，工装形象不规范\n②财务台账短款5.3元，台账管理异常"},{"id": "i1170", "resultId": "a0193", "storeId": "s197", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无"},{"id": "i1171", "resultId": "a0193", "storeId": "s197", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①番茄鱼出品品质不达标，西红柿糊锅\n②原材料蔬菜存在冻伤"},{"id": "i1172", "resultId": "a0193", "storeId": "s197", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①垃圾桶外围存在污渍\n②大门玻璃存在大量手印脏污\n③桌面存在椅面残渣未清理\n④饮水机斟出口存在污渍\n⑤洗手台镜子有水渍\n⑥洗碗间垃圾桶未加盖\n⑦门框毛絮、门锁存在胶痕\n⑧空调散热口积灰\n⑨开关存在污渍\n⑩封膜机顶部存在污渍\n顾客不可视区域\n①冰箱封条存在污渍、内部有残渣\n②油条机柜门存在油渍\n③洗碗机有水垢污渍"},{"id": "i1173", "resultId": "a0193", "storeId": "s197", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①托盘存在残渣、残渣污渍\n②晨检台账填写不完整\n③员工水杯未集中存放\n④茶叶蛋物料未完全封口"},{"id": "i1174", "resultId": "a0194", "storeId": "s155", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n无"},{"id": "i1175", "resultId": "a0194", "storeId": "s155", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n①上餐未按要求使用托盘"},{"id": "i1176", "resultId": "a0194", "storeId": "s155", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①备餐区香菜存在黑叶，原料处理不到位"},{"id": "i1177", "resultId": "a0194", "storeId": "s155", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜内部餐碟存在污渍残渣\n②桌面存在残渣未清理\n③封膜机顶部存在污渍\n④消毒柜内部积灰\n顾客不可视区域\n①剪刀存在油渍，工具摆放杂乱\n②烤串冰箱、备餐间冰箱下方存在污渍\n③蒸饭车把手存在油渍\n④收汁台下方存在油垢\n⑤冰箱门、封条存在毛絮污渍"},{"id": "i1178", "resultId": "a0194", "storeId": "s155", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①物料未执行先进先出原则\n②花椒、大米等物料开封后未封口\n③制冰机内部有水垢污渍\n④刀具案板存在食物残渣\n⑤后厨出现苍蝇虫害问题"},{"id": "i1179", "resultId": "a0195", "storeId": "s081", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①后厨男员工未佩戴工牌，前厅员工工服扣子未扣齐\n②店长不在岗，门店主体责任无法核查\n③采购台账8月份记录缺失，食安文件台账不全"},{"id": "i1180", "resultId": "a0195", "storeId": "s081", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无"},{"id": "i1181", "resultId": "a0195", "storeId": "s081", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①备餐区香菜存在黄叶，原料处理不合格"},{"id": "i1182", "resultId": "a0195", "storeId": "s081", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜内餐具存在污渍\n②饮水机斟出口存在污渍\n③三包区地面存在垃圾\n④开水机龙头、封膜机顶部存在污渍\n⑤消毒柜内部存在残渣\n顾客不可视区域\n①剪刀存在油垢，工具摆放杂乱\n②烤串冰箱下方卫生未清洁\n③蒸饭车把手存在油垢\n④洗碗机存在水垢\n⑤冰箱层架、封条存在污渍"},{"id": "i1183", "resultId": "a0195", "storeId": "s081", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①物料未执行先进先出\n②开封产品未封口存放\n③制冰机有水垢污渍\n④案板刀具存在食物残渣"},{"id": "i1184", "resultId": "a0196", "storeId": "s087", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①财务台账短款1.1元"},{"id": "i1185", "resultId": "a0196", "storeId": "s087", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无"},{"id": "i1186", "resultId": "a0196", "storeId": "s087", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①圆白菜原材料冻伤\n②备餐区香菜出现烂叶"},{"id": "i1187", "resultId": "a0196", "storeId": "s087", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜餐碟存在残渣污渍\n②抽屉内部留有残渣\n③洗手池存在污渍\n④桌面有椅面残渣\n⑤天花板存在蜘蛛网\n顾客不可视区域\n①后厨水池、外卖台冰箱底部存在污渍\n②冲汤机存在污渍\n③收汁台下方油垢，收油容器污渍\n④洗碗机存在污垢\n⑤冰箱封条存在污渍"},{"id": "i1188", "resultId": "a0196", "storeId": "s087", "date": "2026-08-07", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①开封物料未封口存放\n②制冰机有水垢污渍\n③员工水杯未集中存放\n④案板存在食物残渣"},{"id": "i1189", "resultId": "a0203", "storeId": "s137", "date": "2026-08-07", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1190", "resultId": "a0204", "storeId": "s134", "date": "2026-08-07", "inspector": "乔雨地", "category": "QSC", "description": "长款5.6元"},{"id": "i1191", "resultId": "a0205", "storeId": "s129", "date": "2026-08-07", "inspector": "乔雨地", "category": "QSC", "description": "短款192.5元"},{"id": "i1192", "resultId": "a0206", "storeId": "s008", "date": "2026-08-07", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1193", "resultId": "a0207", "storeId": "s195", "date": "2026-08-07", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1194", "resultId": "a0208", "storeId": "s183", "date": "2026-08-07", "inspector": "王红丽", "category": "QSC", "description": "长款0.5元"},{"id": "i1195", "resultId": "a0209", "storeId": "s044", "date": "2026-08-07", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1196", "resultId": "a0210", "storeId": "s188", "date": "2026-08-07", "inspector": "王红丽", "category": "QSC", "description": "短款1.8元"},{"id": "i1197", "resultId": "a0211", "storeId": "s067", "date": "2026-08-07", "inspector": "徐瑞雪", "category": "QSC", "description": "无差异"},{"id": "i1198", "resultId": "a0212", "storeId": "s157", "date": "2026-08-07", "inspector": "徐瑞雪", "category": "QSC", "description": "长款0.48元"},{"id": "i1199", "resultId": "a0213", "storeId": "s160", "date": "2026-08-07", "inspector": "徐瑞雪", "category": "QSC", "description": "长款0.1元"},{"id": "i1200", "resultId": "a0214", "storeId": "s159", "date": "2026-08-07", "inspector": "徐瑞雪", "category": "QSC", "description": "无差异"},{"id": "i1201", "resultId": "a0228", "storeId": "s064", "date": "2026-08-08", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n无问题"},{"id": "i1202", "resultId": "a0228", "storeId": "s064", "date": "2026-08-08", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1203", "resultId": "a0228", "storeId": "s064", "date": "2026-08-08", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①香菜存在黄叶"},{"id": "i1204", "resultId": "a0228", "storeId": "s064", "date": "2026-08-08", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜筷子存在污渍\n②饮水机斟出口污渍\n③桌面存在污渍残渣\n④垃圾桶未加盖\n⑤门框角落有毛絮蜘蛛网\n⑥吊灯未正常开启\n⑦豆浆机盖子清洁不彻底\n⑧消毒柜内部有灰尘虫子尸体\n顾客不可视区域\n①外卖台下方存在污渍\n②蒸饭车把手存在油渍\n③洗碗机密封条有污渍\n④库房货架下方有残渣\n⑤冰柜层架存在污渍"},{"id": "i1205", "resultId": "a0228", "storeId": "s064", "date": "2026-08-08", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①开封产品未封口储存\n②制冰机水槽有水垢残渣"},{"id": "i1206", "resultId": "a0229", "storeId": "s133", "date": "2026-08-08", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①值班经理长时间离岗顶岗"},{"id": "i1207", "resultId": "a0229", "storeId": "s133", "date": "2026-08-08", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n①收桌后手部未消毒就上餐"},{"id": "i1208", "resultId": "a0229", "storeId": "s133", "date": "2026-08-08", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①香菇片、圆白菜出现冻伤"},{"id": "i1209", "resultId": "a0229", "storeId": "s133", "date": "2026-08-08", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①卫生间风口有毛絮\n②椅面存在残渣\n③铜牌标牌存在污渍\n④门口三包区域存在垃圾\n⑤消毒柜内部有毛发污渍\n顾客不可视区域\n①剪刀工具存在污渍\n②锅贴机油槽未清洁干净\n③蒸饭车把手有油渍\n④后厨风口存在毛絮\n⑤收汁台下方有油垢\n⑥洗碗机盖子、密封条有污渍\n⑦后厨冰箱密封条存在污渍"},{"id": "i1210", "resultId": "a0229", "storeId": "s133", "date": "2026-08-08", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①咸菜开封后未封口\n②净水滤芯到期未更换\n③砧板刀具存在食物残渣\n④灭蝇灯未开启"},{"id": "i1211", "resultId": "a0230", "storeId": "s147", "date": "2026-08-08", "inspector": "王红丽", "category": "QSC", "description": "长款0.4元"},{"id": "i1212", "resultId": "a0231", "storeId": "s033", "date": "2026-08-08", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1213", "resultId": "a0232", "storeId": "s108", "date": "2026-08-08", "inspector": "王红丽", "category": "QSC", "description": "短款10元"},{"id": "i1214", "resultId": "a0233", "storeId": "s090", "date": "2026-08-08", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1215", "resultId": "a0234", "storeId": "s191", "date": "2026-08-08", "inspector": "王红丽", "category": "QSC", "description": "短款1.7元"},{"id": "i1216", "resultId": "a0235", "storeId": "s127", "date": "2026-08-08", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1217", "resultId": "a0236", "storeId": "s126", "date": "2026-08-08", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1218", "resultId": "a0237", "storeId": "s089", "date": "2026-08-08", "inspector": "徐瑞雪", "category": "QSC", "description": "备用金600，钱箱总额896.7元，今日现金收入257.9，长款36.8元（6.8元为收银员早餐一个订单未入机，30元为店长私人款项换零钱放入）"},{"id": "i1219", "resultId": "a0238", "storeId": "s124", "date": "2026-08-08", "inspector": "徐瑞雪", "category": "QSC", "description": "长款0.48元"},{"id": "i1220", "resultId": "a0239", "storeId": "s122", "date": "2026-08-08", "inspector": "徐瑞雪", "category": "QSC", "description": "无差异"},{"id": "i1221", "resultId": "a0253", "storeId": "s035", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①后厨员工佩戴手链，员工工服扣子缺少一颗"},{"id": "i1222", "resultId": "a0253", "storeId": "s035", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1223", "resultId": "a0253", "storeId": "s035", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①蔬菜存在冻伤情况\n②香菜黄叶，原材料处理不达标"},{"id": "i1224", "resultId": "a0253", "storeId": "s035", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①饮水机斟出口污渍\n②抽屉内部存在残渣\n③卫生间洗手台、镜子有水渍\n④椅面存在残渣\n⑤垃圾桶未加盖子\n⑥开关存在污渍\n⑦消毒柜下方有灰尘残渣\n⑧出餐口玻璃存在污渍\n顾客不可视区域\n①剪刀工具有污渍\n②收汁台下方存在油垢\n③洗碗机设备、盘子有污渍油垢\n④库房货架下方未清洁\n⑤冰柜滤网、密封条存在污渍毛絮"},{"id": "i1225", "resultId": "a0253", "storeId": "s035", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①开封原材料未封口储存\n②原材料未离地存放\n③制冰机内部有水垢\n④刀具砧板有残渣，未分色管理"},{"id": "i1226", "resultId": "a0254", "storeId": "s059", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n无问题"},{"id": "i1227", "resultId": "a0254", "storeId": "s059", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1228", "resultId": "a0254", "storeId": "s059", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①圆白菜冻伤\n②香菜存在烂叶"},{"id": "i1229", "resultId": "a0254", "storeId": "s059", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①椅面存在残渣\n②收银机表面存在污渍\n③出餐口玻璃有油渍\n顾客不可视区域\n①洗碗间封条存在油渍\n②冰柜密封条存在污渍"},{"id": "i1230", "resultId": "a0254", "storeId": "s059", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①垃圾未完全分类\n②花椒开封后未封口\n③制冰机水槽存在水垢"},{"id": "i1231", "resultId": "a0255", "storeId": "s069", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①在岗员工手机未交齐\n②钱箱钥匙未拔下"},{"id": "i1232", "resultId": "a0255", "storeId": "s069", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1233", "resultId": "a0255", "storeId": "s069", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①香菜存在烂叶"},{"id": "i1234", "resultId": "a0255", "storeId": "s069", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①消毒柜筷子内有残渣\n②抽屉内部有鸡蛋皮残渣\n③椅面存在残渣\n④后厨开关有污渍\n⑤企划海报未翻面\n⑥封膜机、豆浆机顶部有污渍\n顾客不可视区域\n①风口存在毛絮\n②收汁台下方有油垢\n③洗碗间有水垢\n④货架下方未清洁\n⑤冰箱密封条存在污渍"},{"id": "i1235", "resultId": "a0255", "storeId": "s069", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①茶叶蛋开封未封口\n②冰箱内生熟存在交叉污染\n③制冰机水槽有水渍水垢\n④砧板刀具残留食物残渣\n⑤灭蝇纸需要更换"},{"id": "i1236", "resultId": "a0256", "storeId": "s166", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "1.值班类\n①在岗人员上交手机数量不一致"},{"id": "i1237", "resultId": "a0256", "storeId": "s166", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "2.服务类\n无问题"},{"id": "i1238", "resultId": "a0256", "storeId": "s166", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "3.产品类\n①豆腐脑高峰期断档\n②香菇片原材料冻伤\n③早餐肉包破损，出品不合格"},{"id": "i1239", "resultId": "a0256", "storeId": "s166", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "4.环境类\n顾客可视区域\n①垃圾桶外围存在污渍\n②桌面有食物残渣\n③无回餐空位\n④门口三包区存在垃圾\n⑤空调散热口积攒灰尘\n⑥开关表面存在污渍\n⑦冰柜密封条有污渍\n顾客不可视区域\n①库房货架底部存在污渍"},{"id": "i1240", "resultId": "a0256", "storeId": "s166", "date": "2026-08-09", "inspector": "陶畅", "category": "QSC", "description": "5.食安类\n①托盘存在残渣纸屑\n②餐碟内有毛发残渣\n③晨检记录未及时更新\n④灭蝇灯未开启"},{"id": "i1241", "resultId": "a0257", "storeId": "s036", "date": "2026-08-09", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1242", "resultId": "a0258", "storeId": "s175", "date": "2026-08-09", "inspector": "乔雨地", "category": "QSC", "description": "短款0.49元"},{"id": "i1243", "resultId": "a0259", "storeId": "s040", "date": "2026-08-09", "inspector": "乔雨地", "category": "QSC", "description": "无误差"},{"id": "i1244", "resultId": "a0260", "storeId": "s037", "date": "2026-08-09", "inspector": "乔雨地", "category": "QSC", "description": "短款99.6元"},{"id": "i1245", "resultId": "a0261", "storeId": "s143", "date": "2026-08-09", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1246", "resultId": "a0262", "storeId": "s131", "date": "2026-08-09", "inspector": "王红丽", "category": "QSC", "description": "无差异"},{"id": "i1247", "resultId": "a0263", "storeId": "s153", "date": "2026-08-09", "inspector": "王红丽", "category": "QSC", "description": "长款10元"},{"id": "i1248", "resultId": "a0264", "storeId": "s058", "date": "2026-08-09", "inspector": "王红丽", "category": "QSC", "description": "长款5元"}],







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







    ],















    work_records: [{"id": "wr5000", "date": "2026-08-01", "user": "刘畅", "type": "客诉", "summary": "线上差评点评", "detail": {"content": "江苏路店 美团 店内手机信号差，咨询值班经理，对方态度冷淡，敷衍回应后直接转身离开 管理层服务意识不足、客诉应答规范缺失\n潘家园店 点评 米饭内发现卷曲毛发异物，未留存照片，问题食材被服务员直接收走，存在食安风险 食品安全异物问题、门店客诉处置流程违规（擅自收走证物）\n远大路店 点评 早餐高峰期收银员不遵守排队秩序，允许顾客插队，无 VIP 通道公示，引发其他顾客反感 收银秩序管理、公平待客、现场管控缺失\n石佛营店 点评 早餐勺子清洁不到位，餐具存在残留污渍，餐具清洗质检未落实 餐具卫生、后厨清洗巡检漏洞\n塔营北街店 点评 餐品价格上调；自助流食偏咸；收银员人手不足，券码消费外带商品缺货仅小额退款；店内环境嘈杂 口味标准化、收银人力配置、售后退款机制、就餐环境管控\n枣园店 美团 备注不放香菜依旧添加；订单超时承诺方案无法兑现，员工还歪曲沟通事实，承诺未履约 订单备注执行不到位、履约纠纷、员工沟通话术不规范\n木樨园桥西店 点评 早餐时段服务员频繁主动和顾客闲聊，边界感差，打扰想要安静就餐的客人，店内氛围嘈杂 员工服务边界培训缺失，混淆热情服务与过度闲聊", "col3": "群内曝光、以邮件形式发送各位区域经理，同时汇总差评进行公示"}, "stores": []},{"id": "wr5001", "date": "2026-08-01", "user": "刘畅", "type": "客诉", "summary": "公众号留言投诉", "detail": {"content": "未知门店——公众号：最近早餐没有橙汁了，胡辣汤也变稀了\n未知门店——公众号：那么热的天，空调不开，吃一顿饭出汗量，堪比跑个5公里", "col3": "正在联系顾客"}, "stores": []},{"id": "wr5002", "date": "2026-08-01", "user": "刘畅", "type": "客诉", "summary": "舆情检查记录个数", "detail": {"content": "未知门店——老板抖音：北京你们家米饭生的咋说？好像没听说过信息回馈嘛", "col3": "正在联系顾客"}, "stores": []},{"id": "wr5003", "date": "2026-08-01", "user": "刘畅", "type": "客诉", "summary": "个人洞察", "detail": {"content": "投诉流程均存在漏洞，各类问题未能形成有效闭环反馈。", "col3": ""}, "stores": []},{"id": "wr5004", "date": "2026-08-02", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量2.0", "detail": {"content": "前进花园店、五道口店、东坝店"}, "stores": []},{"id": "wr5005", "date": "2026-08-02", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量3.0", "detail": {"content": "翠城馨园店、将台路店、十里堡店、东大桥店、车公庄店、安慧北里店、郁花园店、打浦路店、航天桥、古城大街店、定福庄店、天慧广场店、清河店、海淀黄庄店、小马厂店、广渠门店、控江路店、北苑中街店、江苏路店、东中街店"}, "stores": []},{"id": "wr5006", "date": "2026-08-02", "user": "侯兴宇", "type": "管理", "summary": "抽检线上稽核员工工作", "detail": {"content": ""}, "stores": []},{"id": "wr5007", "date": "2026-08-02", "user": "侯兴宇", "type": "管理", "summary": "其他工作", "detail": {"content": "1.万店掌未完成任务门店曝光\n2.门店考勤异常情况曝光\n3.订货异常记录\n4.OA任务处理\n5.月报"}, "stores": []},{"id": "wr5008", "date": "2026-08-02", "user": "侯兴宇", "type": "管理", "summary": "个人洞察\n（本月目标养成习惯，写一句话就可接受）", "detail": {"content": "尾部门店的扣分点基本集中在操作细节，店长的核心能力不仅要保持门店环境卫生，更要盯紧出品全流程的标准落地。"}, "stores": []},{"id": "wr5009", "date": "2026-08-03", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量2.0", "detail": {"content": "南站4店、彰化路店、崇文门店、李老新村、暖山生活店、北大地"}, "stores": []},{"id": "wr5010", "date": "2026-08-03", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量3.0", "detail": {"content": "中关村南路店，"}, "stores": []},{"id": "wr5011", "date": "2026-08-03", "user": "侯兴宇", "type": "管理", "summary": "抽检线上稽核员工工作", "detail": {"content": ""}, "stores": []},{"id": "wr5012", "date": "2026-08-03", "user": "侯兴宇", "type": "管理", "summary": "其他工作", "detail": {"content": "1.万店掌未完成任务门店曝光\n2.门店考勤异常情况曝光\n3.订货异常记录\n4.OA任务处理\n5.月报"}, "stores": []},{"id": "wr5013", "date": "2026-08-03", "user": "侯兴宇", "type": "管理", "summary": "个人洞察\n（本月目标养成习惯，写一句话就可接受）", "detail": {"content": "尾部门店的扣分点基本集中在操作细节，店长的核心能力不仅要保持门店环境卫生，更要盯紧出品全流程的标准落地。"}, "stores": []},{"id": "wr5014", "date": "2026-08-03", "user": "刘畅", "type": "客诉", "summary": "线上差评点评", "detail": {"content": "石佛营店｜美团｜早餐用餐餐品内吃出头发｜食品安全异物问题、后厨卫生管控漏洞\n西站店｜点评｜早 8:30 点餐，豆腐脑套餐错上豆浆，先后被告知豆腐脑、小米粥售罄，库存未及时同步，未提前告知顾客，耽误出行旅客时间｜早餐备货不足、进销库存更新不及时、餐前主动告知机制缺失", "col3": "群内曝光、以邮件形式发送各位区域经理，同时汇总差评进行公示"}, "stores": []},{"id": "wr5015", "date": "2026-08-03", "user": "刘畅", "type": "客诉", "summary": "公众号留言投诉", "detail": {"content": "天桥店——微信支付：退了米饭的，缺没把米饭的钱退我\n菜户营店——微信支付：早上买的豆腐脑不好，退钱", "col3": "已同步店长"}, "stores": []},{"id": "wr5016", "date": "2026-08-03", "user": "刘畅", "type": "客诉", "summary": "个人洞察", "detail": {"content": "食品安全异物、客流高峰备货预案不足为今日主要问题", "col3": ""}, "stores": []},{"id": "wr5017", "date": "2026-08-04", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量2.0", "detail": {"content": "南站4店、彰化路店、崇文门店、李老新村、暖山生活店、北大地"}, "stores": []},{"id": "wr5018", "date": "2026-08-04", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量3.0", "detail": {"content": "中关村南路店，"}, "stores": []},{"id": "wr5019", "date": "2026-08-04", "user": "侯兴宇", "type": "管理", "summary": "抽检线上稽核员工工作", "detail": {"content": ""}, "stores": []},{"id": "wr5020", "date": "2026-08-04", "user": "侯兴宇", "type": "管理", "summary": "其他工作", "detail": {"content": "1.万店掌未完成任务门店曝光\n2.门店考勤异常情况曝光\n3.订货异常记录\n4.OA任务处理\n5.月报"}, "stores": []},{"id": "wr5021", "date": "2026-08-04", "user": "侯兴宇", "type": "管理", "summary": "个人洞察\n（本月目标养成习惯，写一句话就可接受）", "detail": {"content": "尾部门店的扣分点基本集中在操作细节，店长的核心能力不仅要保持门店环境卫生，更要盯紧出品全流程的标准落地。"}, "stores": []},{"id": "wr5022", "date": "2026-08-04", "user": "刘畅", "type": "客诉", "summary": "线上差评点评", "detail": {"content": "石佛营店｜美团｜早餐用餐餐品内吃出头发｜食品安全异物问题、后厨卫生管控漏洞\n西站店｜点评｜早 8:30 点餐，豆腐脑套餐错上豆浆，先后被告知豆腐脑、小米粥售罄，库存未及时同步，未提前告知顾客，耽误出行旅客时间｜早餐备货不足、进销库存更新不及时、餐前主动告知机制缺失", "col3": "群内曝光、以邮件形式发送各位区域经理，同时汇总差评进行公示"}, "stores": []},{"id": "wr5023", "date": "2026-08-04", "user": "刘畅", "type": "客诉", "summary": "公众号留言投诉", "detail": {"content": "天桥店——微信支付：退了米饭的，缺没把米饭的钱退我\n菜户营店——微信支付：早上买的豆腐脑不好，退钱", "col3": "已同步店长"}, "stores": []},{"id": "wr5024", "date": "2026-08-04", "user": "刘畅", "type": "客诉", "summary": "个人洞察", "detail": {"content": "食品安全异物、客流高峰备货预案不足为今日主要问题", "col3": ""}, "stores": []},{"id": "wr5025", "date": "2026-08-05", "user": "刘畅", "type": "客诉", "summary": "线上差评点评", "detail": {"content": "昌平地铁店 点评 今天来昌平办事，出了地铁昌平站有一家南城香，进入点餐，前台跟我说去外卖口点，外卖口跟我说前台点，两个老娘们折腾我来回三趟，后来彻底不理我了，一气之下离开此地，2026 年 8 月 3 日早 8:30\n华威桥店 点评 红烧鲈鱼越做越难吃，今天（8 月 3 日）17:30 下班的做菜师傅（男，50 岁左右），根本就是在对付，一边做菜，一边闲聊天，不但超时不说，做得鱼还特别难吃，没有鲈鱼的鲜味，甚至没有咸淡味。南城香都是雇了一些什么人在工作啊？降本增效也不带这样的，这种水平的师傅，去任何一家餐饮店都不能操刀的！\n天桥店 美团 晚上七点多正是晚饭饭点来吃饭，明显店里服务员着急下班，拿着拖把来回拖地，就不能等会儿再拖？一顿饭被赶来赶去，根本没法安心吃饭。跟店长说了下，店长丝毫没有歉意，反倒怪来得太晚。七点本来就是用餐高峰期，明明是店员急于打扫下班，却把问题推给顾客，服务态度太差，绝不会再来。\n古城北路店 点评 还有人吃呢，就把粥给收了，也挺看看还有人付过费在那吃呢吧，不值\n拱辰南大街店 点评 他们家的烤串特别难吃，好像就没熟。还带红血丝。说的米饭可以续，结果给一丢丢，根本就吃不饱。就这种服务态度，下次不会再来了。[弱][弱][弱][弱][弱][弱] 点的肥牛饭。超级难吃。\n灯市口地铁店 点评 / 美团 服务员上错了菜，还是得客人自己才发现，然后直接把喝了的饮料和吃了的菜撤掉了，饮料似乎都没换直接给了下一桌。问服务员我们点的菜在哪里，还要自己去取。说了堂食，结果打包成了外卖。叽里咕噜了半天连个道歉都没有，找店员反馈店员也嬉皮笑脸的\n口味：一般，但越买越贵\n服务：很差，店家没有培训吗？\n性价比：越来越低", "col3": "群内曝光、以邮件形式发送各位区域经理，同时汇总差评进行公示"}, "stores": []},{"id": "wr5026", "date": "2026-08-05", "user": "刘畅", "type": "客诉", "summary": "公众号留言投诉", "detail": {"content": "航天桥店——微信支付：白菜豆腐太软烂，不是新炒的，很多就是剩菜似的，没法吃  顾客联系方式", "col3": "已同步相关负责人"}, "stores": []},{"id": "wr5027", "date": "2026-08-05", "user": "刘畅", "type": "客诉", "summary": "电话投诉", "detail": {"content": "回龙观东大街店——电话投诉：北门一直不开启，反馈多次也不开", "col3": "已同步相关负责人"}, "stores": []},{"id": "wr5028", "date": "2026-08-05", "user": "刘畅", "type": "客诉", "summary": "舆情检查记录个数", "detail": {"content": "金融街店——小红书：南城香吃出弯曲毛发", "col3": "已同步相关负责人"}, "stores": []},{"id": "wr5029", "date": "2026-08-05", "user": "刘畅", "type": "客诉", "summary": "个人洞察", "detail": {"content": "今日核心突出问题：饭点提前收餐赶客、出品管控松懈", "col3": ""}, "stores": []},{"id": "wr5030", "date": "2026-08-05", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量2.0", "detail": {"content": "宛平城店、草桥地铁店、南站2店、角北店、黄寺大街店、三环新城店、嘉园店、天桥店、阜成门店、红军营店、东大街店、玉桥中路店、青塔店、潘家园东路店、华源一里店"}, "stores": []},{"id": "wr5031", "date": "2026-08-05", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量3.0", "detail": {"content": "丰管路店、汇融天地店、左安门店、杨庄东街店、万航渡路店、朝丰家园店、枣园地铁店、小营西路店、光彩路店、马家堡店"}, "stores": []},{"id": "wr5032", "date": "2026-08-05", "user": "侯兴宇", "type": "管理", "summary": "抽检线上稽核员工工作", "detail": {"content": ""}, "stores": []},{"id": "wr5033", "date": "2026-08-05", "user": "侯兴宇", "type": "管理", "summary": "其他工作", "detail": {"content": "1.万店掌未完成任务门店曝光\n2.门店考勤异常情况曝光\n3.订货异常记录\n4.OA任务处理"}, "stores": []},{"id": "wr5034", "date": "2026-08-05", "user": "侯兴宇", "type": "管理", "summary": "个人洞察\n（本月目标养成习惯，写一句话就可接受）", "detail": {"content": "重点问题：一是出品标准执行差，配比、制作流程走样，货品频繁断档；二是食安操作不规范，手套佩戴、物料储存、设备清洁反复违规；三是员工仪容工牌、首饰佩戴屡查屡犯；四是前厅后厨环境卫生死角清理不及时；五是值班自查落实不到位。"}, "stores": []},{"id": "wr5035", "date": "2026-08-06", "user": "刘畅", "type": "客诉", "summary": "线上差评点评", "detail": {"content": "红军营店 点评 [米饭] 口味：东西有点难吃，但是油条还是挺好吃的，那个写着现磨的豆浆里头感觉全是渣渣，吃着吃着突然感觉有点恶心。\n[薄荷] 环境：人多座位还少椅子好像都没有擦，我也不知道前面那一位顾客他有没有在椅子上留什么脏东西。\n[服务铃] 服务：说话感觉挺难听的，我真搞不懂那些人是怎么给他好评的。\n[糖果] 性价比：真的不建议去吃，虽然我经常去吃，但是就是旁边就这一家早餐店，门还有两个，我想进去凉快一下顺便吃一个早餐还要打开两个门。\n顺义站前南街店 点评 我要的是不辣的串怎么就给我上的辣的这个是给孩子吃的孩子吃不了辣上菜能不能仔细点\n通州店 点评 第一次来这家店吃早餐，特别热闹！这环境太差了，「豆腐脑」档口员工和顾客对骂半天，一句都不让，我的天啊…… 吵架的顾客走了，甚至都走半天了，几个员工还在大声嚷嚷，素质实在是太差了…… 粥里面最好喝的是「皮蛋瘦肉粥」，其次是酸辣汤，绿豆粥需要自己加糖，橙汁没有了就不让喝了……\n白纸坊店 点评 点了「辣椒炒肉」，吃到一半发现一大块粘连在一起的肉没炒熟（见图 1），服务员给我换了一份、结果汤了吧唧的，不好吃（见图 2）。不会是把第一份加了点菜，但又怕炒糊又加了水做出的第二份吧。总结，品控非常不稳定。\n拱辰南大街店 点评 地处房山区良乡拱辰南大街路口南城香，路过，听说南城香里面饭香，串乡，混沌香，很惊讶想进去查查看，尝尝香，结果一进店，点啥没啥，真的不想吃，勉强点了一个盖饭，没有突出香味，什么味道没有，冷静静静的，没有氛围感\n[米饭] 口味：不好吃，现在体验感糟糕，盖饭不好吃，跟普通小店一样。\n[薄荷] 环境：环境还凑合，一般般\n[服务铃] 服务：不咋滴，没有服务，没用氛围感\n[糖果] 性价比：一般\n👫🏻排队：不排队。", "col3": "群内曝光、以邮件形式发送各位区域经理，同时汇总差评进行公示"}, "stores": []},{"id": "wr5036", "date": "2026-08-06", "user": "刘畅", "type": "客诉", "summary": "公众号留言投诉", "detail": {"content": "清河店——公众号：店里开发票不及时，联系不上商家", "col3": "已同步店长"}, "stores": []},{"id": "wr5037", "date": "2026-08-06", "user": "刘畅", "type": "客诉", "summary": "电话投诉", "detail": {"content": "狼垡店——电话投诉：今日到店使用会员储值消费，门店告知无法使用，要求在哪充值仅能在哪家门店消费。", "col3": "已同步店长"}, "stores": []},{"id": "wr5038", "date": "2026-08-06", "user": "刘畅", "type": "客诉", "summary": "个人洞察", "detail": {"content": "新员工岗前业务培训存在缺口，不仅容易直接产生客诉，也会放大门店原有出品、服务细节上的漏洞，造成负面舆情外溢。", "col3": ""}, "stores": []},{"id": "wr5039", "date": "2026-08-07", "user": "刘畅", "type": "客诉", "summary": "线上差评点评", "detail": {"content": "五道口店 点评 我也算是南城香老顾客了 总共去过的也得有很多家了 这是最差劲的一家 八点到的皮蛋瘦肉粥完全没有了 让补一直不给补 服务态度也是极差 沟通希望补一点粥完全不搭理人 这位服务员在 p1 避雷一下吧 [笑哭][捂脸] 摆脸子给谁看呢 一说要退钱就立刻说马上补 牛奶也没有了 理直气壮的说今天就是没有 并且在付款前没有提前告知\n至于粥的品质 完全一坨 一股糊锅底味儿 [弱][捂脸] 我以前是经常喝南城香的粥的是没有这个味道的 这回是头一次 里面甚至还有那个黑色锅底的渣子 真的很恶心\n马驹桥店 美团 收银工作人员服务态度较差，粥品费用我已经支付完毕，对方没有核对收款记录，执意要求我重复付款。出现工作失误不仅不主动核实，还理直气壮强词夺理。简简单单吃顿早餐，平白无故产生争执，非常影响心情，体验感很差，不建议大家到店消费。不推荐，不推荐，不推荐\n亦庄店 点评 服务员态度不好 我要加米饭 他给我乘 问我要多少 我说再来一点 因为俩个人 我们点了两个人的套餐 结果他非常用力的把米饭甩在我的盘子里 也不问我够不够就关上了 我起码也是消费者啊 为什么对我这样\n翠成馨园店 点评 午饭做的还不错，木须肉炒的挺有味。早点的品种还可以，该有的基本都有。早点三块钱一位，可以随便喝粥，牛奶，豆浆，小菜，我拿着花三块钱租的一个碗，喝了皮蛋瘦肉粥后，碗里也不干净了，就去找穿黑色工作服的工作人员要了个纸杯，接了杯牛奶喝了，再去用纸杯接豆浆的时候，一位穿着淡蓝色工作服的女性服务员，拿着块脏抹布，哪干净擦哪，也不正脸看我，就在我边上说，喝豆浆得花钱，要用碗喝，不是白喝的，我就问她，你和我说话那？她说是的，我又说，喝豆浆不能用纸杯，必须要用碗？她说，是的，不能用纸杯，只能用碗喝。我也懒得再说什么了，喝完豆浆就走人了。我只不过把碗放在了桌上，拿杯子去接豆浆，就被这位女士想当然的认为我没花三块钱，想占便宜。我环顾了一下店里的所有工作人员，除了这个女性服务员穿的是淡蓝色工作服，其它人穿的都是黑色工作服，感觉所有穿黑色衣服的人都挺热情周到的，反而是这个穿浅色工作服的人心里如此阴暗呢，压根也没确认我是否花三块钱租碗了，就想当然的认为我占便宜了。难道是，绩效考核最差的，才会穿浅色工作服吗？\n航天桥店 美团 环境：很差，太热，空调不舍得开。满屋油烟很呛。服务员全都拉着脸，很冷漠。\n金融街店 点评 [薄荷] 环境：至少是永和大王，现在改成了南城香，地方挺大的。\n[糖果] 性价比：品质早餐 3 元，包括小米粥、皮蛋瘦肉粥、豆浆、牛奶、汤…… 无限量提供，结果我们八点四十五左右到的，皮蛋瘦肉粥还剩下锅底，还有糊味儿、小米粥没有了、菠菜鸡蛋汤还有，然后其他都没上，又上了一锅一样的菠菜汤！\n除了这 3 元，其他油条、包子都有。\n[服务铃] 服务：问了服务员，服务员只说，没有了，也不会上了，现在只有汤……", "col3": "群内曝光、以邮件形式发送各位区域经理，同时汇总差评进行公示"}, "stores": []},{"id": "wr5040", "date": "2026-08-07", "user": "刘畅", "type": "客诉", "summary": "电话投诉", "detail": {"content": "驼房营店 电话投诉 顾客电话投诉：今早到店就餐，门店皮蛋瘦肉粥配料少、碎，品质不佳。", "col3": "群内曝光、以邮件形式发送各位区域经理，同时汇总差评进行公示"}, "stores": []},{"id": "wr5041", "date": "2026-08-07", "user": "刘畅", "type": "客诉", "summary": "舆情检查记录个数", "detail": {"content": "未知门店——老板抖音：汪总问一下，你们怎么解决这个问题，过了饭点好多东西没有了，像经典的安格斯肥牛饭，过了饭点去好多东西没有了。体验感极差。", "col3": "与顾客取得联系，顾客未回复"}, "stores": []},{"id": "wr5042", "date": "2026-08-07", "user": "刘畅", "type": "客诉", "summary": "个人洞察", "detail": {"content": "门店备货及出品管控存在漏洞，一线员工缺少标准化处置动作，简单的缺货、核对类问题，因沟通方式不当升级为客诉，拉低整体就餐体验。", "col3": ""}, "stores": []},{"id": "wr5043", "date": "2026-08-07", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量2.0", "detail": {"content": "广渠门外大街店、马连道店、良乡店、太平桥店、草房地铁店、白纸坊店、富丰桥店、华威桥店、泰和园店、垡头店、土桥店、天通东苑店、菜户营西路店、富力又一城店、万寿路西街店、花园北路店、灯市口地铁店\n四路通店、建新东街店、石榴园店、开阳里店、东四南大街店、方庄店、小营路店"}, "stores": []},{"id": "wr5044", "date": "2026-08-07", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量3.0", "detail": {"content": "常营V中心店、右安门、杨庄地铁店"}, "stores": []},{"id": "wr5045", "date": "2026-08-07", "user": "侯兴宇", "type": "管理", "summary": "抽检线上稽核员工工作", "detail": {"content": ""}, "stores": []},{"id": "wr5046", "date": "2026-08-07", "user": "侯兴宇", "type": "管理", "summary": "其他工作", "detail": {"content": "1.万店掌未完成任务门店曝光\n2.门店考勤异常情况曝光\n3.订货异常记录\n4.OA任务处理"}, "stores": []},{"id": "wr5047", "date": "2026-08-07", "user": "侯兴宇", "type": "管理", "summary": "个人洞察\n（本月目标养成习惯，写一句话就可接受）", "detail": {"content": "值班管理缺位是低分门店的底层共性根源\n本次 84 分、88 分、89.5 分尾部门店普遍存在值班经理履职缺失问题：多数时间待在后厨，极少巡查前厅、不抽查出品、发现违规不制止，全店日常管控完全依靠员工自觉。"}, "stores": []},{"id": "wr5048", "date": "2026-08-08", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量2.0", "detail": {"content": "西三旗店、虎坊桥店、石佛营店、新街口店、三营门店、双井桥东店"}, "stores": []},{"id": "wr5049", "date": "2026-08-08", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量3.0", "detail": {"content": ""}, "stores": []},{"id": "wr5050", "date": "2026-08-08", "user": "侯兴宇", "type": "管理", "summary": "抽检线上稽核员工工作", "detail": {"content": ""}, "stores": []},{"id": "wr5051", "date": "2026-08-08", "user": "侯兴宇", "type": "管理", "summary": "其他工作", "detail": {"content": "1.万店掌未完成任务门店曝光\n2.门店考勤异常情况曝光\n3.订货异常记录\n4.OA任务处理"}, "stores": []},{"id": "wr5052", "date": "2026-08-08", "user": "侯兴宇", "type": "管理", "summary": "个人洞察\n（本月目标养成习惯，写一句话就可接受）", "detail": {"content": "本期低分门店问题均为长期重复出现的基础类 QSC 问题，并非新问题。核心根源在于门店值班自查机制失效，管理层对标准化落地监督不足，岗前培训、在岗巡检不到位，制度要求无法转化为员工日常操作习惯，食安风险与品质风险持续存在。"}, "stores": []},{"id": "wr5053", "date": "2026-08-09", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量2.0", "detail": {"content": "正阳大街店、金顶北路店、七里庄店、甜水园店、春秀路店、马连洼店、亦庄桥店、798点、万源路店、北京站店、霍营地铁店、赵公口店、西罗园店"}, "stores": []},{"id": "wr5054", "date": "2026-08-09", "user": "侯兴宇", "type": "管理", "summary": "稽核组当日\n工作量3.0", "detail": {"content": ""}, "stores": []},{"id": "wr5055", "date": "2026-08-09", "user": "侯兴宇", "type": "管理", "summary": "抽检线上稽核员工工作", "detail": {"content": ""}, "stores": []},{"id": "wr5056", "date": "2026-08-09", "user": "侯兴宇", "type": "管理", "summary": "其他工作", "detail": {"content": "1.万店掌未完成任务门店曝光\n2.门店考勤异常情况曝光\n3.订货异常记录\n4.OA任务处理"}, "stores": []},{"id": "wr5057", "date": "2026-08-09", "user": "侯兴宇", "type": "管理", "summary": "个人洞察\n（本月目标养成习惯，写一句话就可接受）", "detail": {"content": "环境卫生细节缺失\n前厅后厨普遍存在清洁死角；消毒柜、制冰机、洗碗机、冰箱密封条长期水垢、油污；桌椅、设备外壁、库房货架残渣堆积；蚊虫管控不到位，门店出现苍蝇。"}, "stores": []}]







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







  tables: ['stores', 'users', 'region_coaches', 'penalties', 'complaints', 'online_records', 'offline_records', 'daily_reports', 'inspection_templates', 'inspection_results', 'inspection_issues', 'work_records'],















  /* ---- 权限矩阵 ---- */







  Permissions: {







    matrix: {







      '总部':     { inspection: true, inspection_edit: true, inspection_results: true, daily: true, penalty: true, complaint: true, notice: true, dashboard: true, task: true },







      '线上稽核': { inspection: true, inspection_edit: true, inspection_results: true, daily: true, penalty: false, complaint: false, notice: true, dashboard: false, task: true },







      '线下稽核': { inspection: true, inspection_edit: true, inspection_results: true, daily: true, penalty: false, complaint: false, notice: true, dashboard: false, task: true },







      '稽核员':   { inspection: true, inspection_edit: true, inspection_results: true, daily: true, penalty: false, complaint: false, notice: true, dashboard: false, task: true },







      '客服':     { inspection: false, daily: true, penalty: true, complaint: true, notice: true, dashboard: true, task: true },







      '营运':     { inspection: false, daily: false, penalty: true, complaint: true, notice: true, dashboard: true, task: true },







      '店长':     { inspection: false, inspection_results: true, daily: false, penalty: true, complaint: true, notice: true, dashboard: false, task: true },







      '区域教练': { inspection: false, daily: true, penalty: true, complaint: true, notice: true, dashboard: true, task: true },







      '稽核':     { inspection: true, inspection_edit: true, inspection_results: true, daily: true, penalty: true, complaint: true, notice: true, dashboard: true, task: true },







      'admin':   { inspection: true, inspection_results: true, daily: true, penalty: true, complaint: true, notice: true, dashboard: true, task: true }







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







      localStorage.setItem('nanchengxiang_inspection_results', JSON.stringify(this.seedData.inspection_results));







      localStorage.setItem('nanchengxiang_inspection_issues', JSON.stringify(this.seedData.inspection_issues));







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







    // 种子数据合并：确保 seedData 中但 Supabase 缺失的记录被载入







    if (this.seedData[table] && this.seedData[table].length > 0) {







      var existingIds = {};







      this.dataCache[table].forEach(function(r){ existingIds[r.id]=true; });







      this.seedData[table].forEach(function(r){







        if (!existingIds[r.id]) { this.dataCache[table].push(r); }







      }.bind(this));







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







  getDailyReports()   { var d = this.dataCache.daily_reports || []; if (d.length === 0 && this.seedData.daily_reports && this.seedData.daily_reports.length > 0) { this.dataCache.daily_reports = JSON.parse(JSON.stringify(this.seedData.daily_reports)); return this.dataCache.daily_reports; } return d; },







  getTemplates()      { var d = this.dataCache.inspection_templates || []; if (d.length === 0 && this.seedData.inspection_templates && this.seedData.inspection_templates.length > 0) { this.dataCache.inspection_templates = JSON.parse(JSON.stringify(this.seedData.inspection_templates)); return this.dataCache.inspection_templates; } return d; },







  getResults()        { var d = this.dataCache.inspection_results || []; if (this.seedData.inspection_results && this.seedData.inspection_results.length > 0) { var ids={}; d.forEach(function(r){ids[r.id]=true}); this.seedData.inspection_results.forEach(function(r){if(!ids[r.id])d.push(r)}); } return d; },







  getIssues()         { var d = this.dataCache.inspection_issues || []; if (this.seedData.inspection_issues && this.seedData.inspection_issues.length > 0) { var ids={}; d.forEach(function(r){ids[r.id]=true}); this.seedData.inspection_issues.forEach(function(r){if(!ids[r.id])d.push(r)}); } return d; },















  async saveDailyReports(data) {







    this.dataCache.daily_reports = data;







    localStorage.setItem('nanchengxiang_daily_reports', JSON.stringify(data));







    if (this.supabase) {







      await this.supabase.from('daily_reports').delete().neq('id', '__none__');







      if (data.length > 0) await this.supabase.from('daily_reports').insert(this._snakeList(data));







    }







  },







  getWorkRecords()    { let all = [...this.seedData.work_records]; let saved = safeGet('nanchengxiang_work_records', []); all = all.concat(saved.filter(r => !all.some(s => s.id === r.id))); return all; },







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







                           'inspectionResults': 'inspection_results', 'inspectionIssues': 'inspection',







                           'inspectionDashboard': 'inspection' };







      document.querySelectorAll('.tab-item').forEach(function(t) {







        var page = t.dataset.page;







        var module = pageToModule[page];







        if (!module) return;







        if (page === 'inspection') {
          t.style.display = (self.Permissions.canAccess(role, 'inspection') || self.Permissions.canAccess(role, 'inspection_results')) ? '' : 'none';
        } else {
          t.style.display = self.Permissions.canAccess(role, module) ? '' : 'none';
        }







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







