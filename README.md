# dsh-whale-skin

DSH web 皮肤。**颜色和字体全部保持用户默认主题**（亮/暗随系统、字体不干预），皮肤只做终端风格的**布局**。GUI 控件全部保持可点击。

## 设计原则

1. **不干预颜色/字体**：跟随用户默认主题（不强制暗色、不指定字体），只改布局与局部装饰色
2. **尊重 dsh 交互**：不改任何控件的功能，只换外观
3. **已知问题透明记录**：见 `ISSUES.md`

## 功能

- **终端风布局**（CSS 注入，颜色/字体回默认主题）
  - 全直角（`border-radius: 0`）
  - 消息行、用户气泡、输入框、时间栏、产物行的**统一对齐轴线**：文字 56px / 色块 44px / 提示符 `>` 在列左缘
  - 用户消息 = 左对齐蓝底块（`>` 提示符在色块外，独立蓝色箭头）
  - 插队输入（pending steering）与正式消息同款样式
  - 产物文件行 + 时间栏 = 一整块灰卡
  - 输入框 = 随内容长高的无滚动条块（无高度上限）
  - 时间戳常显、复制键与时间顺序统一
- **固定底栏**（DOM 操作 + MutationObserver）
  - 按钮行 + token 统计信息栏从滚动流移出，固定在底部，宽度与输入卡片对齐
  - 分割线保持与消息分隔线等宽
- **内容宽度切换**：右上角"居中 / 占满"胶囊按钮（持久化到 localStorage）
  - 居中：748px 固定列；占满：视口减两侧留白。两种模式文字、色块、`>` 全部同轴对齐
- **像素鲸鱼**：会话列表下方、设置按钮上方（用户手绘 1:1 图提取）
- **token 统计栏**（已整合原 stats-widen 插件功能）：不截断、可换行

## 架构

```
src/
├── index.ts          # host 半部（no-op loader entry，注册插件）
└── client/
    ├── index.ts      # 浏览器入口：注入样式 / 鲸鱼 / 底栏 / 宽度切换
    └── whale.ts      # 像素鲸鱼 sprite + html 渲染（纯静态常量，无 XSS）
```

**浏览器端加载链**：DSH 的 `dsh-client-modules` 读取 package.json 的 `dsh.client` 声明 → 加载 `lib/client.js`（bundle）→ 调用 `apply(ctx)` → 注入 `<style>` + 鲸鱼 DOM + 底栏 MutationObserver + 宽度切换按钮。

**固定底栏的实现（重要）**：dsh 的输入卡片（`[data-composer-card]`）随对话流滚动，但工具栏行 + token 统计栏需要钉在底部。CSS `position: sticky` 无法钉住（seat 的父容器在流末尾），所以用 `fixBottomBar()` 把 `.row` 和 dock **物理移入** `#dsh-whale-bottombar`（`[data-phase]` 的普通 flex 子元素，插在滚动区之后），再靠 MutationObserver 在 React 重渲染后重新固定。dock 仅在**有内容**时搬移（无 cost-meter 时空槽不显示空底栏）。

**CSS 作用域**：所有规则经 `scopeRule()` 加 `body[data-skin="whale"]` 前缀，皮肤只在自己激活时生效；逗号选择器逐段加前缀、深色主题规则正确合并属性（`body[data-skin][data-ds-dark-theme]`）。

## Build

```bash
npm install
npm run build     # tsc (host) + tsc (client) + tsdown (client bundle) — 唯一权威路径
npm test          # scopeRule 单测 + bundle 冒烟（加载并执行 lib/client.js 的 apply/dispose）
```

输出 `lib/index.js`（host 半部）与 `lib/client.js`（浏览器 bundle）。`lib/` 已提交进 git，GitHub 安装无需本机构建；CI 在干净检出上跑 `npm run build` 后 `git diff --exit-code`，保证提交产物 = 构建产物。

> ⚠️ **`node build-client.cjs` 不是正式构建路径**：它只是沙箱无法跑 tsdown 时的临时产物（协议外壳一致、代码体行为等价，但文本不同）。用它生成的 `lib/client.js` **用完即弃、不可提交**——提交了会让 CI 的 diff 守卫必红。

**改源码后的流程**：
1. `npm run build` 重建 `lib/`
2. `npm run typecheck` 类型检查
3. `npm test` 回归（scopeRule + bundle 冒烟）
4. 提交 `src/` 和 `lib/`（两者都要，GitHub 安装用的是 `lib/`）

## Install

GitHub 正式安装（推荐，与仓库同步）：

```bash
dsh plugin --profile web add github:JackJackXu/dsh-whale-skin
```

开发态（改源码时）：先 `npm run build` 重建 `lib/`，然后：

```bash
dsh plugin --profile web add "link:C:/MyMy/my_work/dsh_default/plugins/dsh-whale-skin"
```

重启 dsh profile 生效。

## 兼容性

- 目标：DSH `0.1.0-rc.x`（当前开发于 rc.6）
- ⚠️ 皮肤依赖 dsh 内部 DOM 结构（`data-composer-*`、class 后缀等）。**dsh 升级前端重构后需回归测试**——失效通常"看起来正常但某功能悄悄坏"

## 已知问题

- ~~底部工具栏「选择模型 / 选择权限」弹窗透明且点不上~~ — **已恢复**（回退到底栏稳定版后弹窗正常；历史根因记录在 `ISSUES.md`）
- 物理搬移 DOM 依赖 dsh 内部结构，dsh 升级前端重构后需回归测试（见 `ISSUES.md`）

## License

MIT（见 [LICENSE](LICENSE)）
