/**
 * bundle-protocol.cjs — 客户端 bundle 协议的单一来源（banner/footer/id 规则）。
 *
 * tsdown.config.ts（权威构建）与 build-client.cjs（受限沙箱等价构建）共用
 * 这份常量，避免两处各写一份导致漂移：改协议只改这里。
 */
'use strict';

/**
 * banner：__ModuleLoader__.load({ id: <包名>, factory: (require) => {
 * id 必须是 package.json 的 name（宿主按包名查 bundle）。
 * @param {string} packageName - package.json 的 name
 */
function banner(packageName) {
  return `window.__ModuleLoader__.load({ id: ${JSON.stringify(packageName)}, factory: (require) => {`;
}

/** footer：闭合 factory，返回模块导出。 */
const footer = 'return module.exports; } });';

/** intro：factory 体内声明的 CJS 兼容垫片。 */
const intro = 'var module = { exports: {} }; var exports = module.exports;';

/** 平台模块表（external，不内联）：bundle 内 import 这些名字走 loader 表。 */
const PLATFORM_MODULES = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
];

module.exports = { banner, footer, intro, PLATFORM_MODULES };
