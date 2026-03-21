# Agent Layer 推进计划

## 当前状态 (2026-03-21)

| 组件 | 状态 | 数量 |
|------|------|------|
| Clinics | ✅ 正常 | 851条 (Supabase) |
| Playgrounds | ⚠️ 需迁移 | 12条 (SQLite → Supabase) |
| Wellness | ⚠️ 需创建 | 0条 |
| API | ✅ 正常 | 运行在 localhost:3002 |
| MCP Tools | ✅ 正常 | 6个工具 |

---

## 待完成任务

### 阶段 1: 数据库基础设施

需要在你的 Supabase 项目中执行以下 SQL：

1. 打开 https://supabase.com/dashboard/project/lalpxtoxziyjibifibsx
2. 进入 SQL Editor
3. 粘贴并执行 `scripts/create-supabase-tables.sql`

这将创建：
- `playgrounds` 表
- `wellness` 表  
- `leads` 表

### 阶段 2: 数据迁移

SQL 执行完成后，运行迁移脚本：

```bash
cd ~/clawd/agent-layer
npm run migrate:playgrounds
```

这会把 SQLite 里的 12 条 playground 数据迁移到 Supabase。

### 阶段 3: 部署到 Render

已配置 `render.yaml`，只需：

1. 推送代码到 GitHub
2. 在 Render 创建 Web Service
3. 设置环境变量 `SUPABASE_SERVICE_KEY`

---

## 文件清单

- `scripts/create-supabase-tables.sql` - Supabase 建表 SQL
- `scripts/migrate-playgrounds.ts` - 数据迁移脚本
- `render.yaml` - Render 部署配置
- `DEPLOYMENT.md` - 完整部署指南

---

## 下一步行动

1. 我现在可以帮你执行 Supabase SQL（如果你有 service key）
2. 或者你可以手动在 Supabase Console 执行
3. 然后运行迁移脚本
4. 最后部署到 Render

你想怎么推进？