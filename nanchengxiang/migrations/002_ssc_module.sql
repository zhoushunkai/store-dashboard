-- ==============================================
-- SSC 共享服务工单模块迁移（v100）
-- 工单涉及部门：信息部 / 人力部 / 企划部 / 产品部 / 营运部 / 物流部 / 财务部 / 采购部
-- 状态流转：待受理 → 处理中 → 已闭环
-- 权限：前端仅 admin 可见（数据表沿用 anon 读写策略，与现有表一致）
-- ==============================================

CREATE TABLE IF NOT EXISTS ssc_tickets (
  id TEXT PRIMARY KEY,
  department TEXT DEFAULT '',          -- 涉及部门
  ticket_type TEXT DEFAULT '',         -- 工单类型：咨询/需求/报障/建议/其他
  title TEXT DEFAULT '',               -- 标题
  content TEXT DEFAULT '',             -- 内容描述
  urgency TEXT DEFAULT '普通',          -- 紧急程度：普通/紧急/特急
  submitter TEXT DEFAULT '',           -- 提交人
  submitter_role TEXT DEFAULT '',      -- 提交人角色
  expect_date TEXT DEFAULT '',         -- 期望完成时间
  status TEXT DEFAULT '待受理',         -- 待受理/处理中/已闭环
  handler TEXT DEFAULT '',             -- 处理人
  logs JSONB DEFAULT '[]'::jsonb,      -- 处理记录（流转与处理日志）
  created_at TEXT DEFAULT '',
  updated_at TEXT DEFAULT ''
);

ALTER TABLE ssc_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ssc_tickets_all" ON ssc_tickets;
CREATE POLICY "ssc_tickets_all" ON ssc_tickets FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_ssc_tickets_status ON ssc_tickets (status);
CREATE INDEX IF NOT EXISTS idx_ssc_tickets_dept ON ssc_tickets (department);
