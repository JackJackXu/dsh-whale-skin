// bundle 冒烟测试 — 真实加载 lib/client.js 的 factory，并实际执行 apply()/dispose()。
// 两层拦截：
//   1. 模块形状：factory 返回 { name, apply }（"bundle 引用未定义符号"如 scopeRule 漏打包，
//      在 factory 执行时 ReferenceError，CI 就炸出来）；
//   2. 运行时：用 mock DOM 执行 apply()（皮肤加载路径：注入 style/whale/toggle、起 observer），
//      再执行返回的 disposer——拦住"能加载但 apply 时崩"（如 document 拼错、定时器句柄类型错误）。
// 运行：npm test（或 node tests/bundle-smoke.test.js）

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

// apply() 会触达：document（body/style/head/querySelector/getElementById）、
// localStorage（宽度模式）、MutationObserver（底栏重钉）、setInterval（鲸鱼/开关重试）、
// requestAnimationFrame（observer 回调合并）。全部 mock 为最小可用实现；
// 选择器一律返回 null，所以注入走"重试循环"分支而不是注入成功分支。
const timers = new Set()
function makeEl() {
  return {
    id: '', className: '', innerHTML: '', textContent: '', title: '',
    style: {}, dataset: {},
    setAttribute() {}, removeAttribute() {}, addEventListener() {}, appendChild() {},
    remove() {},
  }
}
const sandbox = {
  window: { __ModuleLoader__: { load(entry) { holder.entry = entry } } },
  console, Object, Symbol, JSON, Date, Math, RegExp,
  String, Array, Number, Boolean, Promise,
  setInterval(fn) { timers.add(fn); return fn },
  clearInterval(fn) { timers.delete(fn) },
  requestAnimationFrame() { return 0 }, // never auto-run: rAF callbacks only fire in a real browser
  localStorage: { getItem: () => null, setItem() {} },
  MutationObserver: class { observe() {} disconnect() {} },
  document: {
    body: { setAttribute() {}, removeAttribute() {} },
    getElementById: () => null,
    createElement: () => makeEl(),
    head: { appendChild() {} },
    querySelector: () => null,
  },
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

  // 运行时：执行 apply()（mock DOM），再执行返回的 disposer。
  let applyError = null
  let disposeFn = null
  try {
    disposeFn = mod.apply({})
  } catch (e) {
    applyError = e
  }
  check('apply() 不抛错（mock DOM）', applyError === null)
  check('apply() 返回 disposer（皮肤可卸载）', typeof disposeFn === 'function')
  if (applyError) console.log('  apply 错误: ' + applyError.message)

  if (typeof disposeFn === 'function') {
    let disposeError = null
    try { disposeFn() } catch (e) { disposeError = e }
    check('dispose() 不抛错', disposeError === null)
    if (disposeError) console.log('  dispose 错误: ' + disposeError.message)
  }
}

console.log(pass ? '\nbundle smoke 通过' : '\nbundle smoke 失败')
process.exit(pass ? 0 : 1)
