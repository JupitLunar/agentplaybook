# ClawdHub（clawhub CLI）安装/更新/验收 Checklist

> 目标：把技能获取流程标准化为：**search/explore → inspect → install → 最小验收 → update 维护**。

## 0) 名称与站点（避免踩坑）
- 统一写法：**ClawdHub**
- 推荐域名：**https://clawdhub.com**（以你们实际 CLI 默认 registry 为准）
- CLI 命令：`clawhub ...`

## 1) 先确认 CLI 可用
- `npx -y clawhub --help`
- 或全局安装：`npm i -g clawdhub`，然后 `clawhub --help`

## 2) 探索与搜索
- 浏览最近更新：`clawhub explore`
- 向量搜索：`clawhub search "self improving agent"`

## 3) 安装前必须 inspect（风险控制）
- `clawhub inspect <slug>`
- 检查点：
  - 需要哪些凭证（API key/OAuth）
  - 是否会发外部消息/写文件/执行命令
  - 依赖哪些本机二进制/服务

## 4) 安装（落地到 workspace skills）
- 默认：安装到当前目录的 `./skills/<slug>`
- 明确指定：
  - `clawhub install <slug> --workdir /Users/cathleenlin/clawd --dir skills`

## 5) 最小验收（装完立刻做）
- 文件是否在 `skills/<slug>/`
- 是否有 `SKILL.md` 并且描述清楚用法
- 跑一条最安全的示例（只读/不发消息/不删改）
- 记录：需要补的配置项清单（token、env、账号绑定）

## 6) 更新策略
- 单个更新：`clawhub update <slug>`
- 全量更新：`clawhub update --all`
- 强制更新：`clawhub update --all --no-input --force`
- 变更前后对比：建议 `git diff`（如果 skills 目录纳入版本控制的话）

## 7) 自我改进闭环建议（把技能用起来）
- 每周：
  1) `clawhub update --all`
  2) 跑一次“最小验收”脚本/清单
  3) 汇总：新增/破坏性变更/需要迁移的配置
  4) 产出：3 条改进建议（自动化/文档/安全）

## 8) 常见问题
- 找不到技能：换更具体的 query（加领域词）
- 安装后不可用：通常是缺 token 或依赖二进制；先读 SKILL.md
- 站点名混淆：写文档时统一 **ClawdHub / clawdhub.com**
