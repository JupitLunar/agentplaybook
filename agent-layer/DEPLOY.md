# Agent Layer - Fly.io Deployment Guide

## 快速部署

### 1. 安装 Fly.io CLI
```bash
curl -L https://fly.io/install.sh | sh
```

### 2. 登录
```bash
fly auth login
```

### 3. 创建 PostgreSQL 数据库
```bash
fly postgres create --name agent-layer-db --region lax
```

### 4. 设置密钥
```bash
# 设置 API 密钥
fly secrets set API_KEY="your-secure-api-key"

# 可选：设置 Slack 通知
fly secrets set SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# 可选：设置邮件服务
fly secrets set RESEND_API_KEY="re_..."
fly secrets set FROM_EMAIL="notifications@yourdomain.com"
```

### 5. 部署
```bash
npm run build
fly deploy
```

### 6. 数据库迁移
```bash
fly ssh console
# 然后在容器中运行
npx tsx scripts/migrate-fly.ts
```

### 7. 同步数据
```bash
# 通过 API 触发同步
curl -X POST https://your-app.fly.dev/v1/sync \
  -H "X-API-Key: your-api-key"
```

## 监控

### 健康检查
```bash
curl https://your-app.fly.dev/health
curl https://your-app.fly.dev/ready
curl https://your-app.fly.dev/live
```

### 指标
```bash
curl https://your-app.fly.dev/metrics \
  -H "X-API-Key: your-api-key"
```

### 日志
```bash
fly logs
```

## MCP 协议使用

### 列出工具
```bash
curl -X POST https://your-app.fly.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### 调用工具
```bash
curl -X POST https://your-app.fly.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "search_places",
      "arguments": {
        "vertical": "wellness",
        "province": "AB",
        "city": "calgary"
      }
    }
  }'
```

## 环境变量

| 变量 | 描述 | 必需 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | 是 |
| `API_KEY` | API 认证密钥 | 是 |
| `PORT` | 服务器端口 | 否 (默认 8080) |
| `NODE_ENV` | 环境模式 | 否 |
| `LOG_LEVEL` | 日志级别 | 否 (默认 info) |
| `SLACK_WEBHOOK_URL` | Slack 通知 Webhook | 否 |
| `RESEND_API_KEY` | Resend 邮件 API 密钥 | 否 |
| `FROM_EMAIL` | 发件人邮箱 | 否 |

## 故障排除

### 应用无法启动
```bash
fly status
fly logs
```

### 数据库连接问题
```bash
fly postgres connect -a agent-layer-db
```

### 重建部署
```bash
fly deploy --strategy immediate
```
