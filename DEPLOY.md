# NodeAPIs - AI模型中转站聚合平台

## 项目简介

NodeAPIs 是一个 AI 大模型 API 中转站聚合平台，帮助开发者发现和比较各种 AI API 代理服务。

## 技术栈

- **前端**: Next.js 16, React, TailwindCSS, shadcn/ui
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **部署**: Docker, Docker Compose, Nginx

## 功能特性

- 中转站展示和搜索
- 价格对比
- 状态监控
- 后台管理系统
- 用户提交申请

## 本地开发

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 Supabase 配置

# 启动开发服务器
pnpm dev
```

## Supabase 配置

1. 创建 Supabase 项目: https://supabase.com
2. 在 SQL Editor 中运行 `supabase/schema.sql` 创建表结构
3. 从 Settings -> API 获取 URL 和 anon key
4. 填入 `.env.local` 文件

## Docker 部署

### 方式一: 简单部署 (推荐)

使用 Supabase 云数据库，只部署应用：

```bash
# 1. 配置环境变量
cp .env.example .env.local
nano .env.local  # 填入 Supabase 配置

# 2. 部署
docker-compose -f docker-compose.simple.yml up -d --build
```

### 方式二: 完整部署

包含本地 PostgreSQL 和 Nginx：

```bash
# 1. 配置环境变量
cp .env.example .env.local
nano .env.local

# 2. 部署
docker-compose up -d --build

# 3. 获取 SSL 证书 (可选)
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d nodeapis.xyz
```

### 一键部署

```bash
chmod +x deploy.sh
./deploy.sh
```

## 后台管理

访问 `/admin` 进入后台登录页面。

### 登录方式

支持三种登录方式：
1. **邮箱密码登录** - 传统方式
2. **Google OAuth** - 使用 Google 账号登录
3. **Discord OAuth** - 使用 Discord 账号登录

### 配置 OAuth (Google / Discord)

#### Google OAuth 配置：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建项目或选择已有项目
3. 进入 APIs & Services -> Credentials
4. 创建 OAuth 2.0 Client ID
5. 添加授权重定向 URI: `https://your-project.supabase.co/auth/v1/callback`
6. 在 Supabase Dashboard -> Authentication -> Providers -> Google 中填入 Client ID 和 Client Secret

#### Discord OAuth 配置：

1. 前往 [Discord Developer Portal](https://discord.com/developers/applications)
2. 创建新应用
3. 进入 OAuth2 设置
4. 添加 Redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. 在 Supabase Dashboard -> Authentication -> Providers -> Discord 中填入 Client ID 和 Client Secret

### 添加管理员账号

默认管理员账号需要在数据库中创建：

```sql
-- 方式1: 邮箱密码登录 (使用 bcrypt 加密密码后插入)
INSERT INTO admins (email, password_hash, auth_provider) VALUES 
('admin@nodeapis.xyz', '$2a$10$...', 'email');  -- 替换为实际加密后的密码

-- 方式2: Google OAuth 登录
INSERT INTO admins (email, auth_provider) VALUES 
('your-google-email@gmail.com', 'google');

-- 方式3: Discord OAuth 登录  
INSERT INTO admins (email, auth_provider) VALUES 
('your-discord-email@example.com', 'discord');
```

生成密码 hash:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your_password', 10);
console.log(hash);
```

## 目录结构

```
├── app/
│   ├── api/              # API 路由
│   │   ├── providers/    # 中转站公开 API
│   │   ├── submissions/  # 提交申请 API
│   │   └── admin/        # 管理后台 API
│   ├── admin/            # 后台管理页面
│   └── page.tsx          # 首页
├── components/           # React 组件
├── lib/
│   ├── supabase/         # Supabase 客户端
│   └── types.ts          # TypeScript 类型定义
├── supabase/
│   └── schema.sql        # 数据库表结构
├── Dockerfile            # Docker 镜像配置
├── docker-compose.yml    # 完整部署配置
├── docker-compose.simple.yml  # 简化部署配置
├── nginx.conf            # Nginx 配置
└── deploy.sh             # 部署脚本
```

## 导出到 GitHub

1. 在 v0 界面点击右上角的三个点菜单
2. 选择 "Download ZIP" 下载代码
3. 解压后推送到你的 GitHub 仓库：

```bash
cd nodeapis
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/nodeapis.git
git push -u origin main
```

或者直接在 v0 中连接 GitHub 仓库自动同步。

## 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase 项目 URL | 是 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 匿名密钥 | 是 |
| POSTGRES_USER | PostgreSQL 用户名 (本地部署) | 否 |
| POSTGRES_PASSWORD | PostgreSQL 密码 (本地部署) | 否 |
| POSTGRES_DB | PostgreSQL 数据库名 (本地部署) | 否 |

## License

MIT
