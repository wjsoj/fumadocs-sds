-- ==================== Supabase Realtime 配置 ====================

-- 1. 确保 Realtime 扩展已启用（在 Supabase Dashboard 中应该已经启用）
-- 如果没有启用，执行：
-- CREATE EXTENSION IF NOT EXISTS realtime;

-- 2. 为 progress_tracking 表启用 Realtime
-- 将表添加到 realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE progress_tracking;

-- 3. 为 realtime_connections 表启用 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE realtime_connections;

-- 4. 检查当前 publication 中的表
-- 执行以下查询来验证配置：
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- 5. 确保表有正确的 REPLICA IDENTITY
-- 这对于 realtime 功能是必需的
ALTER TABLE progress_tracking REPLICA IDENTITY FULL;
ALTER TABLE realtime_connections REPLICA IDENTITY FULL;

-- 6. 验证权限
-- 确保 anon 和 authenticated 角色可以订阅 realtime 更新
GRANT SELECT ON progress_tracking TO anon, authenticated;
GRANT SELECT ON realtime_connections TO anon, authenticated;

-- 7. 检查 RLS 策略
-- 确保 RLS 策略允许用户看到他们自己的数据
-- 已经在主 schema 文件中配置了

-- ==================== 测试查询 ====================
-- 使用以下查询来测试配置是否正确：

-- 检查表是否在 realtime publication 中
-- 应该返回 2 行结果
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('progress_tracking', 'realtime_connections');

-- 检查表的 replica identity
-- 正确的查询方式：使用 pg_class
SELECT 
    n.nspname AS schema_name,
    c.relname AS table_name,
    CASE c.relreplident
        WHEN 'd' THEN 'default (primary key)'
        WHEN 'n' THEN 'nothing'
        WHEN 'f' THEN 'full'
        WHEN 'i' THEN 'index'
    END AS replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('progress_tracking', 'realtime_connections')
  AND n.nspname = 'public';

-- 检查权限
-- 方式 1: 详细列表
SELECT 
    table_name,
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name IN ('progress_tracking', 'realtime_connections')
ORDER BY table_name, grantee, privilege_type;

-- 方式 2: 按角色聚合（更清晰）
SELECT 
    table_name,
    grantee,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants 
WHERE table_name IN ('progress_tracking', 'realtime_connections')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;
