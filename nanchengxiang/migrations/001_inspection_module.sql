-- ==============================================
-- 稽核模块数据库迁移
-- ==============================================

-- 1. 稽核模板表（版本管理）
CREATE TABLE IF NOT EXISTS inspection_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  items JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TEXT DEFAULT '',
  updated_at TEXT DEFAULT ''
);
ALTER TABLE inspection_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_all" ON inspection_templates FOR ALL USING (true);

-- 2. 检查结果表
CREATE TABLE IF NOT EXISTS inspection_results (
  id TEXT PRIMARY KEY,
  template_id TEXT DEFAULT '',
  template_name TEXT DEFAULT '',
  template_version INTEGER DEFAULT 1,
  store_id TEXT DEFAULT '',
  store TEXT DEFAULT '',
  inspector TEXT DEFAULT '',
  date TEXT DEFAULT '',
  scores JSONB DEFAULT '[]'::jsonb,
  total_score REAL DEFAULT 0,
  total_deduct REAL DEFAULT 0,
  status TEXT DEFAULT '草稿',
  remark TEXT DEFAULT '',
  created_at TEXT DEFAULT '',
  updated_at TEXT DEFAULT ''
);
ALTER TABLE inspection_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results_all" ON inspection_results FOR ALL USING (true);

-- 3. 问题工单表（流转：待处理→已整改→已闭环 / 申诉）
CREATE TABLE IF NOT EXISTS inspection_issues (
  id TEXT PRIMARY KEY,
  result_id TEXT DEFAULT '',
  store_id TEXT DEFAULT '',
  store TEXT DEFAULT '',
  item_index INTEGER DEFAULT 0,
  item_content TEXT DEFAULT '',
  item_category TEXT DEFAULT '',
  item_score REAL DEFAULT 0,
  deducted REAL DEFAULT 0,
  deduct_reason TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  inspector TEXT DEFAULT '',
  date TEXT DEFAULT '',
  status TEXT DEFAULT '待处理',
  rectify_content TEXT DEFAULT '',
  rectify_date TEXT DEFAULT '',
  appeal_content TEXT DEFAULT '',
  appeal_reviewer TEXT DEFAULT '',
  appeal_result TEXT DEFAULT '',
  appeal_date TEXT DEFAULT ''
);
ALTER TABLE inspection_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "issues_all" ON inspection_issues FOR ALL USING (true);
