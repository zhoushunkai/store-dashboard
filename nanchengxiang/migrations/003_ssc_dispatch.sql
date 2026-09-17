-- ==============================================
-- SSC 申请分发改造（v105）
-- 背景：SSC 由「共享服务工单」升级为「申请分发」模式
--   流程：门店端提报 → 稽核归口接收 → 分发职能部门 → 部门办理 → 闭环
--   申请类型：外部顾客反馈 / 门店反馈
--   状态流转：待接收 → 待分发 → 处理中 → 已闭环（历史单据「待受理」仍兼容展示）
--   承办部门枚举：优化部 / 食安部 / 培训部 / 事业管理室 / 2.0事业部
--            （历史旧值：信息部 / 人力部 / 企划部 / 产品部 / 营运部 / 物流部 / 财务部 / 采购部，仅展示不报错）
-- 说明：本次改造【不新增、不删除任何列】，沿用既有 ssc_tickets 结构：
--   接收/分发信息记录在 logs(JSONB) 中（action=接收申请 / 分发部门），
--   承办部门写入 department，办理人写入 handler。
-- 本文件可重复执行（幂等），无需在 Supabase 控制台额外操作。
-- ==============================================

-- 幂等兜底：确保字段存在（线上已存在则跳过）
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS department     TEXT   DEFAULT '';
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS ticket_type    TEXT   DEFAULT '';
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS title          TEXT   DEFAULT '';
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS content        TEXT   DEFAULT '';
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS urgency        TEXT   DEFAULT '普通';
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS submitter      TEXT   DEFAULT '';
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS submitter_role TEXT   DEFAULT '';
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS expect_date    TEXT   DEFAULT '';
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS status         TEXT   DEFAULT '待受理';
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS handler        TEXT   DEFAULT '';
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS logs           JSONB  DEFAULT '[]'::jsonb;
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS created_at     TEXT   DEFAULT '';
ALTER TABLE ssc_tickets ADD COLUMN IF NOT EXISTS updated_at     TEXT   DEFAULT '';

-- 行级安全策略（沿用 anon 读写，与现有各表一致）
ALTER TABLE ssc_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ssc_tickets_all" ON ssc_tickets;
CREATE POLICY "ssc_tickets_all" ON ssc_tickets FOR ALL USING (true);

-- 索引
CREATE INDEX IF NOT EXISTS idx_ssc_tickets_status ON ssc_tickets (status);
CREATE INDEX IF NOT EXISTS idx_ssc_tickets_dept   ON ssc_tickets (department);
CREATE INDEX IF NOT EXISTS idx_ssc_tickets_type   ON ssc_tickets (ticket_type);

-- 字段注释（说明新状态机与部门枚举）
COMMENT ON COLUMN ssc_tickets.status IS '待接收/待分发/处理中/已闭环（历史值：待受理）';
COMMENT ON COLUMN ssc_tickets.department IS '承办职能部门：优化部/食安部/培训部/事业管理室/2.0事业部';
COMMENT ON COLUMN ssc_tickets.logs IS '流转日志：提报申请/接收申请/分发部门/处理记录/闭环申请';
