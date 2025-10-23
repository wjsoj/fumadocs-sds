-- 创建 api_keys 表
CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  api_key VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 启用行级安全策略 (RLS)
-- 这将阻止所有客户端直接访问，只允许服务端通过 service_role key 访问
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- 不创建任何策略，这意味着：
-- 1. anon 和 authenticated 角色无法访问任何数据
-- 2. 只有使用 service_role key 的服务端代码可以绕过 RLS 访问数据
-- 这是最安全的配置方式

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_api_keys_student_id ON api_keys(student_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);

-- 插入初始数据
INSERT INTO api_keys (student_id, name, api_key) VALUES
('250001XXXX', 'XXX', 'sk-YQ**********'),
ON CONFLICT (student_id) DO NOTHING;

-- 添加注释
COMMENT ON TABLE api_keys IS 'API密钥管理表';
COMMENT ON COLUMN api_keys.id IS '主键ID';
COMMENT ON COLUMN api_keys.student_id IS '学号';
COMMENT ON COLUMN api_keys.name IS '姓名';
COMMENT ON COLUMN api_keys.api_key IS 'API密钥';
COMMENT ON COLUMN api_keys.created_at IS '创建时间';
COMMENT ON COLUMN api_keys.updated_at IS '更新时间';
