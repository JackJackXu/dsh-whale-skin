# Changelog — dsh-whale-skin

本文件的格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

## [0.1.1] — 2026-08-18

### 修复

- **回退到底栏稳定版**：撤销此前多次失败的底栏弹窗修复尝试（fixed/sticky/body 方案），恢复物理搬移 + 普通 flex 子元素的布局——用户确认过的正常状态；弹窗随之恢复正常
- **弹窗根因修正**：核对官方 `Menu.tsx`/`Menu.module.css`——`.list` 相对 anchor wrapper（`.root` 自带 relative）定位，物理搬移 `.row` + 强制 static 不影响弹窗；真机回归（三项 ×3 ×深浅色）通过并记录于 ISSUES.md
- **CI 修复**：`npm install --legacy-peer-deps`（peerDependencies 的官方包在 npmjs 只有旧版本，自动解析秒挂）；代码去掉官方类型 import（`apply(_ctx: unknown)`，皮肤不触达 client runtime）；diff 守卫收窄到 `lib/`（Windows 生成的 lock 含 win32 平台包，Linux CI 的 npm install 会改写 lock，全树守卫必红）
- **防重复注入**：鲸鱼/宽度按钮注入加 `pending` 防重入 + 终态放弃标记（此前 React 重挂载会反复注入、累积定时器）
- **observer rAF 节流**：MutationObserver 回调每帧合并一次，流式输出不再高频执行 DOM 查询
- **CSS 作用域修复**：`scopeRule()` 正确逐段处理逗号选择器（含嵌套 `:is()` 内逗号）、深色主题规则合并属性（此前 `body[data-skin] body[data-ds-dark-theme]` 永不匹配，深色模式时间栏/产物卡背景失效）
- **dock 空态**：token 统计栏仅在有内容时搬移；搬入后变空自动移回 seat（不留空底栏）
- **按钮语义**：宽度切换按钮文案改为动作（切到占满/切到居中）+ `aria-pressed`
- **assertSelectors 延迟**：选择器契约检查推迟到 SPA 渲染后（首帧执行会全部误报）

### 变更

- **CSS 作用域化**：所有规则加 `body[data-skin="whale"]` 前缀，不污染其他插件 UI
- **选择器契约**：`SELECTORS` 常量表 + 加载时缺失警告
- **tsdown 唯一权威构建**：`lib/` 产物由 `npm run build` 生成并入库；删除 `build-client.cjs`（沙箱可直跑 tsdown）；CI 在干净检出跑 build + `git diff --exit-code -- lib/` 防产物漂移
- **dispose**：`apply()` 返回 disposer——断 observer/清定时器/移除注入元素与 `data-skin`，皮肤可卸载
- **bundle 冒烟增强**：mock DOM 执行 `apply()` + `dispose()`（拦"能加载但运行时崩"）
- **CI**：GitHub Actions（typecheck + bundle 重建）
- **测试**：`tests/scope-rule.test.js`（作用域规则 5 用例，含 `:is()`）+ `tests/bundle-smoke.test.js`
- **清理**：删未使用的 `dsh-client-ui-theme` peer 依赖

## [0.1.0] — 2026-08-17

- 由 `dsh-terminal-skin` **改名**为 `dsh-whale-skin`（包名/插件 id/CSS 前缀/目录全套）
- 修复 mist-terminal 主题残留导致的 `inject is not defined` 加载崩溃
- `lib/` 编译产物提交进 git，支持 GitHub 直接安装
- 皮肤功能：终端风布局（全直角/对齐轴线/蓝块消息/`>` 提示符）、固定底栏、宽度切换、像素鲸鱼、token 统计栏
