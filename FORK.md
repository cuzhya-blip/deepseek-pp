# This Fork

- 上游：[zhu1090093659/deepseek-pp](https://github.com/zhu1090093659/deepseek-pp)（2026-09-16 起归档，只读）
- 本 fork：[cuzhya-blip/deepseek-pp](https://github.com/cuzhya-blip/deepseek-pp)
- 本地路径：`E:\programfile\ai项目\deepseekpp`
- 基线：`v1.14.0` / `0a02c72`
- 用途：自用维护，不发布到商店

## 本 fork 的改动

### feat: 记忆全量注入模式（默认开启）

上游的记忆注入是「关键词筛选 + 1500 token 预算」，与当前输入无关但长期有用的记忆会被漏掉。
本 fork 新增 `memoryInjectionMode`：

- **`full`（默认）**：不按关键词筛选，按「项目 / 全局」分大节、按类型（身份 / 反馈 / 话题 / 资料）分小节，全量注入；
- **`filtered`**：保留上游的筛选 + 预算行为；
- 硬上限 48K token，只在极端情况下截断，防止上下文被撑爆；
- 排序规则：置顶 → 项目优先于全局 → 类型固定顺序 → 最近更新。

设置入口：侧边栏 → 设置 → 提示词 → 记忆注入 → 注入模式。

相关文件：

| 文件 | 作用 |
| --- | --- |
| `core/prompt/settings.ts` | 新设置项、默认值、normalize |
| `core/memory/selector.ts` | `selectAllMemories` / `formatMemoriesGrouped` |
| `core/prompt/augmentation.ts` | 注入模式分支 |
| `core/interceptor/request-augmentation.ts` | 把设置传进 prompt 组装 |
| `core/messaging/persistence-runtime-request-codec.ts` | 保存设置的字段校验 |
| `entrypoints/sidepanel/components/PromptControlPanel.tsx` | 设置 UI |
| `tests/memory-injection-mode.test.ts` | 5 项单测 |

### feat: 对话内「遗忘」语义

系统提示词（chat + thinking，中英双语）新增「记忆删除规则」：

1. 用户说「忘掉 / 删除 / 不要再提」某条记忆时，先按名称或 `#id` 定位；
2. 调用 `memory_delete` 删除；
3. 明确告知删掉了哪一条；找不到匹配就直说，不假装删除。

相关文件：`core/i18n/resources/{zh-CN,en}/prompt.ts`、`tests/prompt-memory-forget.test.ts`。

### 分组注入示例

```text
## 项目记忆
### 身份
- #12 用户职业: 前端工程师
### 反馈
- #15 回答风格: 先结论后细节
## 全局记忆
### 话题
- #18 小说进度: 写到第三章
```

## 开发

```bash
npm ci
npm run compile          # tsc --noEmit
npm run build:chrome     # 产物 dist/chrome-mv3
```

加载：`chrome://extensions` → 加载已解压 → 选 `dist/chrome-mv3`。

测试：

```bash
npx vitest run tests/memory-injection-mode.test.ts
npm run prompt:freeze:update   # 改 prompt 后更新 golden
```

## 维护约定

- `main` 保持与上游 v1.14.0 一致；功能改动走分支，自测通过后合并。
- 上游已归档，`upstream` remote 只作对照，不再拉取。
- 不提交 `dist/`、`node_modules/`、`.wxt/`。
- prompt 相关改动必须同步更新 golden，并跑 `prompt-output-contract`。
