-- 南城香协作终端 - Supabase 数据库建表脚本
-- 在 Supabase 项目 SQL Editor 中执行本文件全部内容

-- 门店表
CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT DEFAULT '',
  admin_area TEXT DEFAULT '',
  biz_area TEXT DEFAULT '',
  region TEXT DEFAULT '',
  manager TEXT DEFAULT '',
  manager_title TEXT DEFAULT '',
  mode TEXT DEFAULT ''
);
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores_all" ON stores FOR ALL USING (true);

-- 人员表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  area TEXT DEFAULT '',
  store_id TEXT DEFAULT '',
  store TEXT DEFAULT ''
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_all" ON users FOR ALL USING (true);

-- 区域教练
CREATE TABLE region_coaches (
  id SERIAL PRIMARY KEY,
  region TEXT NOT NULL,
  coach TEXT NOT NULL,
  store_count INTEGER DEFAULT 0
);
ALTER TABLE region_coaches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "region_coaches_all" ON region_coaches FOR ALL USING (true);

-- 处罚记录
CREATE TABLE penalties (
  id TEXT PRIMARY KEY,
  store_id TEXT DEFAULT '',
  store TEXT DEFAULT '',
  region TEXT DEFAULT '',
  district TEXT DEFAULT '',
  manager TEXT DEFAULT '',
  event_date TEXT DEFAULT '',
  event TEXT DEFAULT '',
  category TEXT DEFAULT '',
  level TEXT DEFAULT '',
  source TEXT DEFAULT '',
  inspector TEXT DEFAULT '',
  person_name TEXT DEFAULT '',
  person_level TEXT DEFAULT '',
  person_type TEXT DEFAULT '',
  penalty_person TEXT DEFAULT '',
  penalty_manager TEXT DEFAULT '',
  survey TEXT DEFAULT '',
  suggestion TEXT DEFAULT '',
  policy_ref TEXT DEFAULT '',
  duty_person TEXT DEFAULT '',
  duty_manager TEXT DEFAULT '',
  duty_value TEXT DEFAULT '',
  duty_coach TEXT DEFAULT '',
  status TEXT DEFAULT '待补填'
);
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "penalties_all" ON penalties FOR ALL USING (true);

-- 差评记录
CREATE TABLE complaints (
  id TEXT PRIMARY KEY,
  store_id TEXT DEFAULT '',
  store TEXT DEFAULT '',
  date TEXT DEFAULT '',
  meal TEXT DEFAULT '',
  content TEXT DEFAULT '',
  opportunity TEXT DEFAULT '',
  platform TEXT DEFAULT '',
  responsible TEXT DEFAULT '',
  responsible_title TEXT DEFAULT '',
  duty_manager TEXT DEFAULT '',
  status TEXT DEFAULT '待处理',
  appeal_content TEXT DEFAULT '',
  appeal_result TEXT DEFAULT ''
);
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints_all" ON complaints FOR ALL USING (true);

-- 线上稽核记录
CREATE TABLE online_records (
  id TEXT PRIMARY KEY,
  store_id TEXT DEFAULT '',
  store TEXT DEFAULT '',
  date TEXT DEFAULT '',
  inspector TEXT DEFAULT '',
  content TEXT DEFAULT ''
);
ALTER TABLE online_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "online_records_all" ON online_records FOR ALL USING (true);

-- 线下稽核记录
CREATE TABLE offline_records (
  id TEXT PRIMARY KEY,
  store_id TEXT DEFAULT '',
  store TEXT DEFAULT '',
  date TEXT DEFAULT '',
  inspector TEXT DEFAULT '',
  score INTEGER DEFAULT 0,
  content TEXT DEFAULT ''
);
ALTER TABLE offline_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offline_records_all" ON offline_records FOR ALL USING (true);
