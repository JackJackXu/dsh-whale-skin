/**
 * style.ts — 皮肤 CSS 作用域化（纯函数，独立模块以便测试直接引用真实现）。
 */

// Split a selector list on TOP-LEVEL commas only. Naive `split(',')` breaks
// nested commas such as `:is([class$="_timeStart"], [class$="_timeEnd"])` —
// the :is() group is ONE selector segment and must not be split.
export function splitTopLevel(selectors: string): string[] {
  const parts: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of selectors) {
    if (ch === '(' || ch === '[') depth++
    else if (ch === ')' || ch === ']') depth--
    if (ch === ',' && depth === 0) {
      parts.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  parts.push(cur)
  return parts
}

// Scope ONE css rule under body[data-skin="whale"]. Pitfalls handled:
//  1. Top-level commas split selector lists — every segment gets the prefix,
//     not just the first (`*, *::before, *::after` must scope all three).
//     Nested commas inside :is()/[] are NOT split (splitTopLevel).
//  2. Rules already gated on body[...] (dark theme: `body[data-ds-dark-theme]
//     X`) must become `body[data-skin="whale"][data-ds-dark-theme] X`, never
//     `body[data-skin] body[data-ds-dark-theme]` (body cannot nest — that
//     selector can never match).
export function scopeRule(rule: string): string {
  const brace = rule.indexOf('{')
  const selectors = rule.slice(0, brace)
  const body = rule.slice(brace)
  const scoped = splitTopLevel(selectors)
    .map(part => part.trim())
    .map(part => {
      if (part.startsWith('body[')) {
        // 已是 body[data-skin="whale"] 前缀的直接保留（防重复注入时再次加前缀）；
        // body[data-ds-dark-theme] X 合并成 body[data-skin="whale"][data-ds-dark-theme] X
        if (part.startsWith('body[data-skin="whale"]')) return part
        return part.replace(/^body\[/, 'body[data-skin="whale"][')
      }
      return 'body[data-skin="whale"] ' + part
    })
    .join(', ')
  return scoped + ' ' + body
}
