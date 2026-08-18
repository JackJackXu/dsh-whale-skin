// bundle 冒烟测试 — 真实加载 lib/client.js 的 factory 并检查模块形状，
// 保证"bundle 引用未定义符号"这类错误（如 scopeRule 漏打包）在 CI 就炸出来，
// 而不是等皮肤加载时 ReferenceError。运行：npm test（或 node tests/bundle-smoke.test.js）

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const bundleSrc = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'client.js'),
  'utf8'
)

// 模拟 DSH 的 __ModuleLoader__：bundle 以 window.__ModuleLoader__.load({id, factory})
// 注册。load 把 entry 存入外部对象（new Function 作用域隔离，不能直接闭包读）。
const holder = { entry: null }
const sandbox = {
  window: { __ModuleLoader__: { load(entry) { holder.entry = entry } } },
  console, Object, Symbol, JSON, Date, Math, RegExp,
  String, Array, Number, Boolean, Promise,
}
const fn = new Function(...Object.keys(sandbox), `${bundleSrc}\n;return true;`)
fn(...Object.values(sandbox))

const entry = holder.entry
let pass = true
const check = (name, cond) => {
  if (!cond) pass = false
  console.log((cond ? '✅' : '❌') + ' ' + name)
}

check('bundle 注册了入口', entry !== null && typeof entry === 'object')
check('id 是包名', entry && entry.id === 'dsh-whale-skin')
check('factory 是函数', entry && typeof entry.factory === 'function')

if (pass) {
  // 调用 factory 模拟加载：返回的模块必须有 name/apply（apply 内部用到 DOM，
  // 这里不执行它——只验证模块形状和 bundle 本身无未定义符号）。
  let factoryError = null
  let mod = null
  try {
    mod = entry.factory(() => { throw new Error('should not require') })
  } catch (e) {
    factoryError = e
  }
  check('factory 不抛错', factoryError === null)
  check('factory 返回模块', mod !== null && typeof mod === 'object')
  check('模块有 name', typeof mod.name === 'string')
  check('模块有 apply', typeof mod.apply === 'function')
  if (factoryError) console.log('  factory 错误: ' + factoryError.message)
}

console.log(pass ? '\nbundle smoke 通过' : '\nbundle smoke 失败')
process.exit(pass ? 0 : 1)
