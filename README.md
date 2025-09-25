# sds

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## Explore

In the project, you can see:

- `lib/source.ts`: Code for content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api) provides the interface to access your content.
- `lib/layout.shared.tsx`: Shared options for layouts, optional but preferred to keep.

| Route                     | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `app/(home)`              | The route group for your landing page and other pages. |
| `app/docs`                | The documentation layout and pages.                    |
| `app/api/search/route.ts` | The Route Handler for search.                          |

### Fumadocs MDX

A `source.config.ts` config file has been included, you can customise different options like frontmatter schema.

Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.vercel.app) - learn about Fumadocs

# 问卷调查API系统

这是一个基于Next.js和Supabase构建的问卷调查系统，提供问卷提交和结果查询功能。

## 功能特性

- ✅ 问卷提交：支持基于设备指纹的匿名提交
- ✅ 结果查询：JWT认证保护的管理接口
- ✅ 设备识别：基于浏览器信息生成设备指纹
- ✅ 数据分组：相同设备的提交自动归类
- ✅ 统计分析：提供提交统计和趋势数据

## 环境配置

1. 复制环境变量模板文件：
```bash
cp .env.example .env.local
```

2. 配置环境变量：
```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT认证
JWT_SECRET=your_jwt_secret_key

# 管理员密码
ADMIN_PASSWORD=your_admin_password
```

3. 在Supabase中执行数据库脚本：
运行 `database-schema.sql` 文件中的SQL语句来创建必要的表和权限。

## API 端点

### 1. 提交问卷

**POST** `/api/surveys/submit`

```json
{
  "surveyId": "survey_001",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "screenResolution": "1920x1080",
    "timezone": "Asia/Shanghai",
    "language": "zh-CN"
  },
  "answers": {
    "question1": "答案1",
    "question2": ["选项A", "选项B"],
    "question3": 5
  }
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "问卷提交成功",
  "submissionId": "uuid-here",
  "submittedAt": "2024-01-01T12:00:00.000Z"
}
```

### 2. 管理员登录

**POST** `/api/auth/login`

```json
{
  "password": "your_admin_password"
}
```

**响应示例：**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "认证成功",
  "expiresIn": "24小时"
}
```

### 3. 查询提交结果

**GET** `/api/surveys/results?surveyId=survey_001`

**请求头：**
```
Authorization: Bearer your_jwt_token
```

**响应示例：**
```json
{
  "success": true,
  "survey_id": "survey_001",
  "statistics": {
    "total_submissions": 25,
    "unique_devices": 12,
    "submissions_by_day": {
      "2024-01-01": 5,
      "2024-01-02": 8
    },
    "date_range": {
      "earliest": "2024-01-01T10:30:00.000Z",
      "latest": "2024-01-02T15:45:00.000Z"
    }
  },
  "device_groups": [
    {
      "device_info": {
        "device_fingerprint": "abc123",
        "user_agent": "Mozilla/5.0...",
        "submission_count": 3,
        "first_submission": "2024-01-01T10:30:00.000Z",
        "last_submission": "2024-01-02T14:20:00.000Z"
      },
      "submissions": [
        {
          "id": "submission-uuid",
          "submitted_at": "2024-01-02T14:20:00.000Z",
          "answers": { "question1": "答案1" }
        }
      ]
    }
  ]
}
```

## 前端集成示例

```javascript
// 提交问卷
async function submitSurvey() {
  const deviceInfo = {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  }

  const response = await fetch('/api/surveys/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      surveyId: 'my_survey_001',
      deviceInfo,
      answers: {
        question1: '用户的答案',
        question2: 5,
        question3: ['选项A', '选项B']
      }
    })
  })

  const result = await response.json()
  console.log('提交结果:', result)
}

// 管理员获取结果
async function getResults(surveyId) {
  // 先登录获取token
  const loginResponse = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password: 'your_admin_password'
    })
  })
  
  const { token } = await loginResponse.json()

  // 查询结果
  const response = await fetch(`/api/surveys/results?surveyId=${surveyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const results = await response.json()
  console.log('问卷结果:', results)
}
```

## 数据库结构

主表 `survey_submissions` 包含以下字段：

- `id`: 主键UUID
- `survey_id`: 问卷ID
- `device_fingerprint`: 设备指纹
- `user_agent`: 用户代理字符串
- `ip_address`: IP地址
- `screen_resolution`: 屏幕分辨率
- `timezone`: 时区
- `language`: 语言
- `submitted_at`: 提交时间
- `answers`: JSON格式的答案数据
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 安全考虑

1. **匿名提交**：系统不需要用户注册，通过设备指纹识别重复提交
2. **JWT认证**：管理接口使用JWT token保护
3. **Row Level Security**：Supabase RLS确保数据安全
4. **环境变量**：敏感信息存储在环境变量中

## 扩展功能建议

- 添加问卷配置管理
- 实现提交频率限制
- 添加数据导出功能
- 创建可视化仪表板
- 支持多语言问卷
