/**
 * build-client.js — 生成 lib/client.js（与 tsdown 客户端协议等价的产物）
 *
 * 说明：tsdown 打包 client bundle 时内部 spawn esbuild，在受限沙箱中无法执行；
 * 本脚本按 tsdown.client.ts 的 banner/footer 协议，将 tsc 产出的两个 ESM
 * 模块（index/whale，无外部值依赖）合并为单个 CJS closure 产物，
 * 格式与 tsdown 完全一致：window.__ModuleLoader__.load({ id, factory })。
 *
 * 在正常环境（用户终端）中，`npm run build` 的 tsdown 步骤会生成等价产物。
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CLIENT = path.join(ROOT, 'lib', 'client');
const OUT = path.join(ROOT, 'lib', 'client.js');

function read(name) {
  return fs.readFileSync(path.join(CLIENT, name), 'utf8');
}

/** 把单个 ESM 模块体转成闭包内定义（去掉 import/export 外壳）。 */
function toClosure(src) {
  return src
    .replace(/^import .*;$/gm, '')
    .replace(/^export const /gm, 'const ')
    .replace(/^export function /gm, 'function ')
    .replace(/^export \{[\s\S]*?\};$/gm, '')
    .trim();
}

// NOTE: theme.js is intentionally NOT bundled anymore — the mist-terminal
// theme was removed (whale skin only). Bundling a stale lib/client/theme.js
// left the removed MIST_TERMINAL definition and a dangling `inject` export in
// the bundle, which broke plugin loading with "inject is not defined".
const whale = toClosure(read('whale.js'));
const index = toClosure(read('index.js'));

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const bundle = `window.__ModuleLoader__.load({ id: ${JSON.stringify(pkg.name)}, factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

${[whale, index].join('\n\n')}

module.exports = { name, apply };
return module.exports;
} });
`;

fs.writeFileSync(OUT, bundle);
console.log('[ok] 生成 lib/client.js (' + bundle.length + 'B)');
console.log('[ok] 格式: window.__ModuleLoader__.load({ id: ' + pkg.name + ' ... })');
