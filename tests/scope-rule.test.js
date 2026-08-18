// scopeRule 逻辑验证（与 src/client/index.ts 中的实现一致）
function scopeRule(rule) {
  const brace = rule.indexOf('{')
  const selectors = rule.slice(0, brace)
  const body = rule.slice(brace)
  const scoped = selectors
    .split(',')
    .map(part => part.trim())
    .map(part => {
      if (part.startsWith('body[')) {
        // 已是 body[data-skin] 前缀的直接保留（防重复）；body[data-ds-dark-theme] X
        // 合并成 body[data-skin="whale"][data-ds-dark-theme] X
        if (part.startsWith('body[data-skin="whale"]')) return part
        return part.replace(/^body\[/, 'body[data-skin="whale"][')
      }
      return 'body[data-skin="whale"] ' + part
    })
    .join(', ')
  return scoped + ' ' + body
}

const cases = [
  ['深色规则', 'body[data-ds-dark-theme] [data-turn-tail] { background: #fff !important; }',
    'body[data-skin="whale"][data-ds-dark-theme] [data-turn-tail] { background: #fff !important; }'],
  ['逗号选择器', '*, *::before, *::after { border-radius: 0 !important; }',
    'body[data-skin="whale"] *, body[data-skin="whale"] *::before, body[data-skin="whale"] *::after { border-radius: 0 !important; }'],
  ['普通规则', '[data-conversation-scroll] a { color: #7DA1DE !important; }',
    'body[data-skin="whale"] [data-conversation-scroll] a { color: #7DA1DE !important; }'],
  ['已是皮肤前缀', 'body[data-skin="whale"] [data-phase] { }',
    'body[data-skin="whale"] [data-phase] { }'],
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
