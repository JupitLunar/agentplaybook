# Agent Layer v2.0 - 完整执行计划

## 阶段 1: 数据库基础设施 (0-2小时)
- [ ] 1.1 在 Supabase 创建 playgrounds 表
- [ ] 1.2 在 Supabase 创建 wellness 表
- [ ] 1.3 在 Supabase 创建 leads 表（如果不存在）
- [ ] 1.4 创建统一的 places_view（跨表搜索视图）

## 阶段 2: 数据迁移 (1-3小时)
- [ ] 2.1 迁移 EdmontonPlayground 数据 (8条)
- [ ] 2.2 迁移 CalgaryPlayground 数据 (5条)
- [ ] 2.3 验证 clinics 数据 (851条已存在)
- [ ] 2.4 创建 wellness 示例数据

## 阶段 3: API 完善 (2-4小时)
- [ ] 3.1 测试所有 MCP tools 正常工作
- [ ] 3.2 修复 data-service 中的 transform 函数
- [ ] 3.3 添加错误处理和日志
- [ ] 3.4 实现跨 vertical 搜索

## 阶段 4: 部署 (3-5小时)
- [ ] 4.1 创建 Render 部署配置
- [ ] 4.2 设置环境变量
- [ ] 4.3 部署并验证
- [ ] 4.4 配置自定义域名

## 阶段 5: 监控与优化 (持续)
- [ ] 5.1 设置健康检查 endpoint
- [ ] 5.2 添加性能指标
- [ ] 5.3 文档更新

## 子任务分配

### Sub-Agent 1: 数据库专家
任务: 执行所有 SQL，创建表结构

### Sub-Agent 2: 数据工程师
任务: 迁移所有 playground/wellness 数据到 Supabase

### Sub-Agent 3: API 开发
任务: 测试和修复 API，确保 MCP tools 工作

### Sub-Agent 4: DevOps
任务: Render 部署和配置

## Cron 检查点
每 30 分钟检查:
1. 当前阶段进度
2. 是否有阻塞问题
3. 是否需要调整计划
