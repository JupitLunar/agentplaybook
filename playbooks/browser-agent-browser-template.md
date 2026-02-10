# Browser / agent-browser 操作模板（最短可复用）

> 目标：把「打开页面 → 获取可操作元素 → 点击/输入/提交 → 抓取结果」变成固定套路。

## 0) 何时用 browser vs agent-browser
- **browser 工具**：直接用 Clawdbot 内置 `functions.browser`（推荐优先）。
- **agent-browser skill**：如果你们环境里有单独的 agent-browser 技能/封装，原则同上；遇到需要更高层封装时再用。

## 1) 基础流程（强烈建议照抄）
1. **打开页面**
   - `browser open` 到目标 URL（或 `navigate` 到新地址）。
2. **抓快照（可操作参照）**
   - `browser snapshot`（建议 refs=aria 以获得稳定引用）。
3. **操作页面**
   - `browser act`：`click` / `type` / `press` / `select`。
4. **再次 snapshot 校验状态**
   - 看是否出现成功提示、跳转、错误信息。
5. **提取信息**
   - 直接从 snapshot 文本里摘取；必要时用 `browser console/evaluate` 抓页面变量（谨慎）。

## 2) 常用动作清单
- 点击：按钮、链接、菜单项
- 输入：搜索框、登录表单（尽量不要在聊天里粘贴敏感密码）
- 提交：Enter 或点击提交按钮
- 等待：优先用「等待某个元素出现/消失」；不得已才用固定 sleep

## 3) 稳定性与排障
- 先 `snapshot` 再 `act`，不要盲点。
- 元素找不到：
  - 尝试滚动（page down）
  - 展开折叠菜单
  - 换 `refs=aria` 的 snapshot
- 页面动态加载：
  - 重复 snapshot
  - 等待关键文本出现（例如“Results”）
- 登录/权限限制：
  - 记录为“公开不可达”并降级到其他信源（GitHub/Docs/公告）

## 4) 站点策略（经验法则）
- **X.com**：未登录基本无法搜索 → 直接降级到 GitHub/Docs/Discord 公告
- **GitHub**：优先 Releases/Tags/CHANGELOG；issues 用于判断活跃与痛点
- **Docs**：优先 Changelog / Getting Started / Integrations

## 5) 产出模板（交付格式）
- 5–10 条要点
- 每条要点标注来源（docs/github/x/discord）
- 关键链接列表
- “下一步建议” 3 条以内
