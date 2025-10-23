-- Survey submissions table
CREATE TABLE survey_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id TEXT NOT NULL, -- 问卷ID，用于区分不同的问卷
    device_fingerprint TEXT NOT NULL, -- 设备指纹，用于标识不同的提交源
    user_agent TEXT, -- 用户代理信息
    ip_address TEXT, -- IP地址（可选）
    screen_resolution TEXT, -- 屏幕分辨率
    timezone TEXT, -- 时区信息
    language TEXT, -- 浏览器语言
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 提交时间
    answers JSONB NOT NULL, -- 问卷答案，存储为JSON格式
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_survey_submissions_survey_id ON survey_submissions(survey_id);
CREATE INDEX idx_survey_submissions_device_fingerprint ON survey_submissions(device_fingerprint);
CREATE INDEX idx_survey_submissions_submitted_at ON survey_submissions(submitted_at);

-- 为相同设备和问卷ID的组合创建复合索引
CREATE INDEX idx_survey_submissions_device_survey ON survey_submissions(device_fingerprint, survey_id);

-- 授予 Supabase 默认角色所需的基础权限
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON survey_submissions TO anon, authenticated;
GRANT SELECT, INSERT ON survey_submissions TO service_role;

-- 设置Row Level Security (RLS) - 虽然我们不使用用户系统，但仍然可以启用RLS
ALTER TABLE survey_submissions ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果已经存在）
DROP POLICY IF EXISTS "Allow insert for all" ON survey_submissions;

-- 允许使用 anon key 的请求插入数据
CREATE POLICY "Allow anon insert" ON survey_submissions FOR INSERT TO anon WITH CHECK (true);

-- 允许登录用户（authenticated role）插入数据，方便未来扩展
CREATE POLICY "Allow authenticated insert" ON survey_submissions FOR INSERT TO authenticated WITH CHECK (true);

-- 创建策略：不允许普通用户读取数据（需要通过API进行身份验证）
CREATE POLICY "Restrict select" ON survey_submissions FOR SELECT USING (false);

-- 为服务角色创建策略允许读取所有数据（用于管理后台查询）
CREATE POLICY "Allow service role to read all" ON survey_submissions FOR SELECT TO service_role USING (true);

-- 为服务角色创建策略允许插入数据（作为备用）
CREATE POLICY "Allow service role to insert" ON survey_submissions FOR INSERT TO service_role WITH CHECK (true);

-- 如果插入仍然失败，可以执行以下命令确认当前角色
-- SELECT auth.role();

-- 确保 RLS 策略生效，可以检查当前策略
-- SELECT * FROM pg_policies WHERE tablename = 'survey_submissions';

-- 如果仍有问题，可以临时禁用 RLS（不推荐用于生产环境）
-- ALTER TABLE survey_submissions DISABLE ROW LEVEL SECURITY;

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器自动更新 updated_at 字段
CREATE TRIGGER update_survey_submissions_updated_at BEFORE UPDATE
    ON survey_submissions FOR EACH ROW EXECUTE FUNCTION
    update_updated_at_column();

-- ==================== 进度跟踪相关表 ====================

-- 进度跟踪表
CREATE TABLE progress_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL, -- 会话ID
    device_fingerprint TEXT NOT NULL, -- 设备指纹
    user_agent TEXT, -- 用户代理信息
    ip_address TEXT, -- IP地址（可选）
    current_step INTEGER DEFAULT 0, -- 当前完成的步骤
    total_steps INTEGER DEFAULT 0, -- 总步骤数
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 唯一约束：同一会话和设备只能有一条记录
    UNIQUE(session_id, device_fingerprint)
);

-- 实时连接状态表
CREATE TABLE realtime_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    device_fingerprint TEXT NOT NULL,
    user_agent TEXT,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT true,
    
    -- 唯一约束：同一会话和设备只能有一条记录
    UNIQUE(session_id, device_fingerprint)
);

-- 为进度跟踪表创建索引
CREATE INDEX idx_progress_tracking_session ON progress_tracking(session_id);
CREATE INDEX idx_progress_tracking_device ON progress_tracking(device_fingerprint);
CREATE INDEX idx_progress_tracking_current_step ON progress_tracking(current_step);
CREATE INDEX idx_progress_tracking_updated_at ON progress_tracking(updated_at);

-- 为实时连接表创建索引
CREATE INDEX idx_realtime_connections_session ON realtime_connections(session_id);
CREATE INDEX idx_realtime_connections_device ON realtime_connections(device_fingerprint);
CREATE INDEX idx_realtime_connections_online ON realtime_connections(is_online);
CREATE INDEX idx_realtime_connections_last_activity ON realtime_connections(last_activity);

-- 为进度跟踪表设置权限
GRANT INSERT, UPDATE, SELECT ON progress_tracking TO anon, authenticated;
GRANT ALL ON progress_tracking TO service_role;

-- 为实时连接表设置权限
GRANT INSERT, UPDATE, SELECT ON realtime_connections TO anon, authenticated;
GRANT ALL ON realtime_connections TO service_role;

-- 启用 RLS
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_connections ENABLE ROW LEVEL SECURITY;

-- 进度跟踪表策略
CREATE POLICY "Allow all operations on progress_tracking" ON progress_tracking
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to progress_tracking" ON progress_tracking
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 实时连接表策略
CREATE POLICY "Allow all operations on realtime_connections" ON realtime_connections
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to realtime_connections" ON realtime_connections
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 为进度跟踪表创建更新时间触发器
CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE
    ON progress_tracking FOR EACH ROW EXECUTE FUNCTION
    update_updated_at_column();

-- 为实时连接表创建最后活动时间更新函数
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为实时连接表创建最后活动时间触发器
CREATE TRIGGER update_realtime_connections_last_activity BEFORE UPDATE
    ON realtime_connections FOR EACH ROW EXECUTE FUNCTION
    update_last_activity();
