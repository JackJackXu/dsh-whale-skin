/**
 * build-client.js — 生成 lib/client.js（与 tsdown 客户端协议等价的产物）
 *
 * 说明：tsdown 打包 client bundle 时内部 spawn esbuild，在受限沙箱中无法执行；
 * 本脚本按 tsdown.client.ts 的 banner/footer 协议，将 tsc 产出的两个 ESM
 * 模块（index/whale，无外部值依赖）合并为单个 CJS closure 产物，
 * 协议外壳与 tsdown 一致（window.__ModuleLoader__.load({ id, factory })），
 * 代码体行为等价——注意产物文本并非逐字节相同。
 *
 * 在正常环境（用户终端）中，`npm run build` 的 tsdown 步骤会生成等价产物。
 */
const fs = require('fs');
const path = require('path');
const { banner, footer, intro } = require('./bundle-protocol.cjs');

const ROOT = __dirname;
const CLIENT = path.join(ROOT, 'lib', 'client');
const OUT = path.join(ROOT, 'lib', 'client.js');

function read(name) {
  return fs.readFileSync(path.join(CLIENT, name), 'utf8');
}

/** 把单个 ESM 模块体转成闭包内定义（去掉 import/export 外壳）。 */
function toClosure(src, label) {
  const out = src
    .replace(/^import .*;$/gm, '')
    .replace(/^export const /gm, 'const ')
    .replace(/^export function /gm, 'function ')
    .replace(/^export \{[\s\S]*?\};$/gm, '')
    .trim();
  // Fail loud instead of shipping a "looks fine, breaks at runtime" bundle:
  // tsc's emit shape changing (e.g. a multi-line import) must surface here,
  // not as a broken skin in production.
  const leftovers = [...out.matchAll(/^(?:import|export)[\s{*]/gm)].map(m => m[0]);
  if (leftovers.length > 0) {
    throw new Error(`${label}: unhandled ESM syntax after strip — ${leftovers.join(' | ')}`);
  }
  return out;
}

// NOTE: theme.js is intentionally NOT bundled anymore — the mist-terminal
// theme was removed (whale skin only). Bundling a stale lib/client/theme.js
// left the removed MIST_TERMINAL definition and a dangling `inject` export in
// the bundle, which broke plugin loading with "inject is not defined".
// Order matters: style.js (scopeRule) must be defined BEFORE index.js uses it.
const whale = toClosure(read('whale.js'), 'whale.js');
const style = toClosure(read('style.js'), 'style.js');
const index = toClosure(read('index.js'), 'index.js');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

// The bundle's module.exports references these by name; assert they exist so
// a renamed/removed export fails the build instead of shipping a ReferenceError.
for (const required of ['name', 'apply']) {
  if (!new RegExp(`\\b${required}\\b`).test(index)) {
    throw new Error(`index.js: required export "${required}" not found — bundle would throw at load`);
  }
}
// index.js calls scopeRule as a callback (`.map(scopeRule)`) imported from
// style.js: the closure must actually contain it, or the bundle throws
// ReferenceError on load.
if (!/\bscopeRule\b/.test(index) || !/function scopeRule/.test(style)) {
  throw new Error('index.js uses scopeRule but style.js was not bundled — bundle would throw at load');
}

const bundle = `${banner(pkg.name)}
${intro}
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

${[whale, style, index].join('\n\n')}

module.exports = { name, apply };
${footer}
`;

fs.writeFileSync(OUT, bundle);
console.log('[ok] 生成 lib/client.js (' + bundle.length + 'B)');
console.log('[ok] 格式: window.__ModuleLoader__.load({ id: ' + pkg.name + ' ... })');
