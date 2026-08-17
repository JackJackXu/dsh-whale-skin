# dsh-whale-skin

DSH web 皮肤。**颜色和字体全部保持用户默认主题**（亮/暗随系统、字体不干预），皮肤只做终端风格的**布局**。GUI 控件全部保持可点击。

## 功能

- **终端风布局**（CSS 注入，颜色/字体回默认主题，不强制暗色）
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

## Build

```bash
npm install
npm run build     # tsc (host) + tsc (client) + tsdown (client bundle)
```

输出 `lib/index.js`（host 半部）与 `lib/client.js`（浏览器 bundle）。
沙箱受限环境可用 `node build-client.cjs` 生成 `lib/client.js`（格式与 tsdown 等价）。
`lib/` 已提交进 git，GitHub 安装无需本机构建。

## Install

GitHub 正式安装（推荐，与仓库同步）：

```bash
dsh plugin --profile web add github:JackJackXu/dsh-whale-skin
```

开发态（改源码时）：先 `node build-client.cjs` 重建 `lib/client.js`，然后：

```bash
dsh plugin --profile web add "link:C:/MyMy/my_work/dsh_default/plugins/dsh-terminal-skin"
```
重启 dsh profile 生效。

## 已知问题

- 底部工具栏「选择模型 / 选择权限」弹窗透明且点不上（见 `ISSUES.md`）。

## 结构

```
src/
├── index.ts          # host 半部（no-op loader entry）
└── client/
    ├── index.ts      # 浏览器入口：注入样式/鲸鱼/底栏/宽度切换
    └── whale.ts      # 像素鲸鱼 sprite + html 渲染
tsdown.config.ts      # client bundle 协议（对应 tsdown.client.ts）
build-client.cjs      # 受限环境下的 lib/client.js 生成器
ISSUES.md             # 已知问题清单
```
