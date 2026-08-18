# ISSUES — dsh-whale-skin 已知问题

## Issue #1：底部工具栏的模型/权限弹窗透明且点不上（已恢复 + 机制确认，2026-08-18）

**报告日期**：2026-08-17（用户实测）
**状态**：已恢复。回退到底栏稳定版（物理搬移 + `[data-phase]` 普通 flex 子元素，commit 540a51a）后，用户实测底栏与弹窗均正常；当前代码与 540a51a 一致。下方保留现象与机制结论；**若将来底栏方案改动导致弹窗复发，先读本文档**。

### 现象

底部固定工具栏（`#dsh-whale-bottombar`）上：
- 点「选择模型」或「选择权限」时，弹出的菜单**透明、看不清**，且**鼠标经常点不上**（点选项无反应）；
- 但最左边的「+」（命令菜单）弹窗**正常**。

### 根因与机制（已核对官方源码，2026-08-18 修正）

皮肤用 `fixBottomBar()` 把工具栏行 `.row`（含 PermissionSelect / ModelSelect）**物理移出** `[data-composer-card]`，移进 `#dsh-whale-bottombar`，并强制 `position: static !important`。

关键机制（对照 `refs\dsh_src\packages\client\ui-primitives\src\Menu.tsx` 与 `Menu.module.css`）：

1. dsh 的 `Menu` 组件默认是 **pure CSS positioning relative to the anchor wrapper — no popper**：`.list` 是 `position: absolute`（`Menu.module.css` `.list`），其 containing block 是 **anchor wrapper（`.root`，自带 `position: relative`）**，不是 `.row`，也不是 `.card`。
2. 因此皮肤搬移 `.row` + 强制 `position: static` **不改变 `.list` 的 containing block**——菜单仍相对按钮旁的 wrapper 精确定位，不受底栏搬移影响。
3. 08-17 报告的"透明/点不上"出现在底栏方案调整期间（position: fixed 钉底方案时代：`[data-phase]` 的 overflow/transform 祖先会裁剪 fixed 弹层，`4129ce6`/`a942e0e` 即该方案）。回退到物理搬移稳定版（540a51a）后用户实测弹窗恢复正常。
4. 为什么「+」命令菜单当时正常：它不走 `Menu` 组件的就地渲染路径（命令面板渲染方式不同），从未受底栏定位上下文影响。

> 结论：当前底栏方案（物理搬移 + static）在代码机制上**不构成** ISSUES 原记录的致病条件；原根因分析（".list 向上找祖先")没有注意到 `.root` 自带 relative，已按官方源码修正。

### 验证记录

- [x] **2026-08-18 真机回归（用户执行，通过）**：选择模型 / 选择权限 / + 命令菜单 各点 3 次，浅色一遍、深色一遍——三项全部正常（弹窗清晰可点、位置正确），与机制结论一致。

### 复现步骤

1. 启动 DSH（启用 dsh-whale-skin）；
2. 底部工具栏点「选择模型」或「选择权限」；
3. 观察：弹窗透明/错位，点击无响应；对比左侧「+」弹窗正常。

### 环境

- DSH 0.1.0-rc.6 / dsh-whale-skin 0.1.1（GitHub 安装）
- Windows 11 / 浏览器内核（DSH DLE 壳）
