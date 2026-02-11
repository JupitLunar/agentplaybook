# WhatsApp：同一 Gateway 下的多 Agent 路由（最短落地）

> 目标：**一个 WhatsApp 账号只连接一个 Gateway**，但在同一 Gateway 内运行多个 agent（不同 workspace），并在群聊里通过 **@提及** 分流。

## 原则
- **不要**让多个 Gateway/实例同时登录同一个 WhatsApp 账号（容易互踢/抖动/503）。
- 采用：**单入口（WhatsApp account） + 多 agent（workspaces 隔离） + 路由规则（@mention/匹配）**。

## 最小配置骨架（概念）
你需要三块：
1) `agents.list[]`：声明有哪些 agent（id/name/workspace/mentionPatterns）
2) `channels.whatsapp`：WhatsApp 渠道 + 群聊策略（建议 requireMention）
3)（可选）`bindings[]`：如果你要按群/联系人/关键词做硬路由再加；否则可先不写 bindings，用默认 agent + mentionPatterns。

## 推荐的最小策略（避免轰炸）
- 群聊：`requireMention: true`（只有 @ 到某个 agent 才触发它）
- 私聊：走 `default: true` 的 agent（或你指定的 agent）

## agents.list 示例
> workspace 路径示例：按你们机器实际位置改。

```jsonc
{
  "agents": {
    "list": [
      {
        "id": "coo",
        "name": "Coo",
        "default": true,
        "workspace": "~/.openclaw/workspace-coo",
        "identity": { "name": "Coo" },
        "groupChat": { "mentionPatterns": ["@Coo", "Coo", "@coo"] }
      },
      {
        "id": "jupit",
        "name": "Jupit",
        "workspace": "~/.openclaw/workspace-jupit",
        "identity": { "name": "Jupit" },
        "groupChat": { "mentionPatterns": ["@Jupit", "Jupit", "@jupit"] }
      },
      {
        "id": "ss",
        "name": "SS",
        "workspace": "~/.openclaw/workspace-ss",
        "identity": { "name": "SS" },
        "groupChat": { "mentionPatterns": ["@SS", "SS", "@ss"] }
      }
    ]
  }
}
```

## WhatsApp 群聊触发策略示例
```jsonc
{
  "channels": {
    "whatsapp": {
      "accounts": { "default": {} },
      "groupPolicy": "allowlist",
      "groups": {
        "*": { "requireMention": true }
      }
    }
  }
}
```

## bindings（可选）
- 如果你想“某个群永远归某个 agent”，再加 bindings。
- 第一版建议先不做复杂匹配，先用 @mention 跑通。

## 验收步骤（必须做）
1. 在目标群：发 `@Coo ping` → 应由 Coo 响应
2. 发 `@SS ping` → 应由 SS 响应
3. 发 `@Jupit ping` → 应由 Jupit 响应
4. 群里发一句不 @ 的消息 → **不应该触发**任何 agent（requireMention 生效）
5. 私聊发 `ping` → 应由 default agent 响应

## 常见坑
- mentionPatterns 不匹配（大小写/是否含 @）→ 导致不触发或触发错人
- 群策略没开 requireMention → 群里会被消息轰炸
- accountId/账号命名不一致（如果你用了 bindings）→ 规则不生效

## 何时升级
- 需要按“任务类型/关键词/联系人”硬分流 → 再引入 bindings/match 规则
- 需要跨机器/跨实例 → 变成“跨 gateway 转发”，是另一个 playbook
