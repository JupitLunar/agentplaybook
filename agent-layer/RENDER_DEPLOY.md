# Agent Layer - Render 部署指南

## 一键部署

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/agent-layer)

## 手动部署步骤

### 1. 创建 GitHub 仓库

```bash
cd ~/clawd/agent-layer
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/agent-layer.git
git push -u origin main
```

### 2. 登录 Render

访问: https://render.com
- 点击 "Sign in with GitHub"
- 授权访问你的仓库

### 3. 创建 Web Service

1. 点击 "New" → "Web Service"
2. 选择你的 `agent-layer` 仓库
3. 配置:
   - **Name**: `agent-layer`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.js`
   - **Plan**: Free

4. 点击 "Create Web Service"

### 4. 设置环境变量

在 Render Dashboard → Environment:
```
API_KEY=your-secure-api-key-here
```

### 5. 添加磁盘 (持久化数据库)

在 Render Dashboard → Disks:
- **Name**: `agent-data`
- **Mount Path**: `/data`
- **Size**: 1 GB

### 6. 数据库迁移

部署完成后，在 Render Shell 中运行:
```bash
npx tsx scripts/migrate-sqlite.ts
npx tsx scripts/sync-sites.ts
```

### 7. 访问 API

部署完成后，你的 API 地址:
```
https://agent-layer-xxxx.onrender.com
```

测试:
```bash
curl https://agent-layer-xxxx.onrender.com/health
```

## API 端点

| 端点 | 说明 |
|------|------|
| `GET /health` | 健康检查 |
| `GET /v1/search?vertical=wellness` | 搜索商家 |
| `POST /v1/actions/lead_get_matched` | 创建线索 |
| `POST /v1/sync` | 同步数据 |
| `GET /docs` | API 文档 |

## 免费额度

- **Web Service**: 750 小时/月 (足够 24/7 运行)
- **Disk**: 1GB 永久存储
- **带宽**: 100GB/月

足够起步使用。
