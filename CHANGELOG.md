# Changelog — dsh-whale-skin

本文件的格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased] — 审查中（未发布）

### 变更

- **删除死代码**：`--dsh-whale-bar-width` CSS 变量及 `BAR_WIDE` 常量（从未被消费）
- **SPA 重挂载恢复**：MutationObserver 现在也重注入鲸鱼和宽度切换按钮（React 重挂载丢 DOM 后自动补回）
- **build-client.cjs 加固**：`toClosure` 加 ESM 残留检查 + `name`/`apply` 导出断言——构建期失败而非运行时崩溃
- **文档同步**：README 重写（架构/兼容性/流程）、补 LICENSE（MIT）、ISSUES.md 记录弹窗 bug 根因

## [0.1.0] — 2026-08-17

- 由 `dsh-terminal-skin` **改名**为 `dsh-whale-skin`（包名/插件 id/CSS 前缀/目录全套）
- 修复 mist-terminal 主题残留导致的 `inject is not defined` 加载崩溃
- `lib/` 编译产物提交进 git，支持 GitHub 直接安装
- 皮肤功能：终端风布局（全直角/对齐轴线/蓝块消息/`>` 提示符）、固定底栏、宽度切换、像素鲸鱼、token 统计栏
