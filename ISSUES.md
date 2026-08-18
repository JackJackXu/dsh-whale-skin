# ISSUES — dsh-whale-skin 已知问题

## Issue #1：底部工具栏的模型/权限弹窗透明且点不上（已恢复，2026-08-18）

**报告日期**：2026-08-17（用户实测）
**状态**：已恢复——回退到底栏稳定版（物理搬移 + `[data-phase]` 普通 flex 子元素）后弹窗恢复正常。下方保留完整根因分析供后续参考；**若将来底栏方案改动导致弹窗复发，先读本文档**。

### 现象

底部固定工具栏（`#dsh-whale-bottombar`）上：
- 点「选择模型」或「选择权限」时，弹出的菜单**透明、看不清**，且**鼠标经常点不上**（点选项无反应）；
- 但最左边的「+」（命令菜单）弹窗**正常**。

### 根因分析（已定位，基于 dsh 官方源码）

皮肤用 `fixBottomBar()` 把工具栏行 `.row`（含 PermissionSelect / ModelSelect）**物理移出** `[data-composer-card]`，移进 `#dsh-whale-bottombar`，并强制 `position: static !important`：

```css
'#dsh-whale-bottombar [class$="_row"] { position: static !important; ... }'
```

破坏链（对照 `refs\dsh_src\packages\client\ui-conversation\src\client\skeleton\InputBar.tsx` 与 `ui-primitives\src\Menu.tsx`）：

1. 权限/模型的弹窗是 dsh `Menu` 组件**就地渲染**（`portal=false` 默认）：`.list` 用 `position: absolute; top: calc(100% + 4px)`（`side="top"` 时 `bottom: calc(100% + 4px)`），`z-index: 100`，**相对最近的定位祖先定位**。
2. 原布局中 `.list` 的相对祖先链是 `.card`（`position: relative`，注释明写 "overlay anchor positioning context"）→ `.row` 在 `.card` 内部，定位正常。
3. 皮肤把 `.row` **物理移出 `.card`** 后，`.list` 的定位祖先变成 `#dsh-whale-bottombar` 里的元素——而皮肤又对 `.row` 强制 `position: static`，`.list` 只能继续向上找祖先，最终定位到错误的包含块（bottombar 或更外层），菜单被渲染到按钮附近之外的区域：**菜单内容定位错乱 → 视觉上"透明/看不到"，且点选命中的是别处 → "点不上"**。
4. 为什么「+」正常：命令菜单不是 `Menu` 组件就地渲染（走 command face / 其他渲染路径），不受 `.row` 定位上下文破坏影响。

### 修复方向（未实施）

- **首选**：不物理移动 `.row`。改用 CSS 把输入卡或行钉在底部（`position: sticky; bottom: 0`）或调整 seat 布局，让 `.list` 保持原 `.card` 定位祖先。皮肤注释里写过"CSS sticky 无法钉住"的理由，需重新验证（也许对 `[data-composer-seat]` 用 sticky 或改 flex 结构可行）。
- **备选**：若必须物理移动 DOM，则移动后给 bottombar 内弹窗提供正确定位上下文（例如给 `#dsh-whale-bottombar` 设 `position: relative` 并保留 `.row` 非 static，或对弹窗容器补定位），且确保 bottombar 无 `overflow` 裁剪、z-index 不被局部层叠上下文吞掉。

### 复现步骤

1. 启动 DSH（启用 dsh-whale-skin）；
2. 底部工具栏点「选择模型」或「选择权限」；
3. 观察：弹窗透明/错位，点击无响应；对比左侧「+」弹窗正常。

### 环境

- DSH 0.1.0-rc.6 / dsh-whale-skin 0.1.0（GitHub 安装）
- Windows 11 / 浏览器内核（DSH DLE 壳）
