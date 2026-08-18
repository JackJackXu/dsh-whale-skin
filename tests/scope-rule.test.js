// scopeRule 单元测试 — import 源码中的真实现（style.ts 编译产物），
// 避免"测试复制实现"的假绿。运行：npm test（或 node tests/scope-rule.test.js）

import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { scopeRule } = require(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'client', 'style.js'))

const cases = [
  // 深色规则：body[data-ds-dark-theme] X -> body[data-skin][data-ds-dark-theme] X
  ['深色规则', 'body[data-ds-dark-theme] [data-turn-tail] { background: rgba(255,255,255,.14) !important; }',
    'body[data-skin="whale"][data-ds-dark-theme] [data-turn-tail] { background: rgba(255,255,255,.14) !important; }'],
  // 顶层逗号选择器：每段都要前缀
  ['逗号选择器', '*, *::before, *::after { border-radius: 0 !important; }',
    'body[data-skin="whale"] *, body[data-skin="whale"] *::before, body[data-skin="whale"] *::after { border-radius: 0 !important; }'],
  // 普通规则
  ['普通规则', '[data-conversation-scroll] a { color: #7DA1DE !important; }',
    'body[data-skin="whale"] [data-conversation-scroll] a { color: #7DA1DE !important; }'],
  // 已是皮肤前缀：幂等（不重复加前缀）
  ['已是皮肤前缀', 'body[data-skin="whale"] [data-phase] { }',
    'body[data-skin="whale"] [data-phase] { }'],
  // 嵌套逗号（:is()）：整组是一个段，不能拆开
  ['嵌套 :is() 逗号', '[data-time-hover-root] :is([class$="_timeStart"], [class$="_timeEnd"]) { opacity: 1 !important; }',
    'body[data-skin="whale"] [data-time-hover-root] :is([class$="_timeStart"], [class$="_timeEnd"]) { opacity: 1 !important; }'],
]

let pass = 0
for (const [name, input, expected] of cases) {
  const got = scopeRule(input)
  const ok = got === expected
  if (ok) pass++
  console.log((ok ? '✅' : '❌') + ' ' + name)
  if (!ok) {
    console.log('  input:    ' + input)
    console.log('  expected: ' + expected)
    console.log('  got:      ' + got)
  }
}
console.log('\n' + pass + '/' + cases.length + ' 通过')
process.exit(pass === cases.length ? 0 : 1)
