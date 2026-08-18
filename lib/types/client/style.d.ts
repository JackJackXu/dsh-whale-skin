/**
 * style.ts — 皮肤 CSS 作用域化（纯函数，独立模块以便测试直接引用真实现）。
 */
export declare function splitTopLevel(selectors: string): string[];
export declare function scopeRule(rule: string): string;
