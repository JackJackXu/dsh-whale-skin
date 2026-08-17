/**
 * theme.ts — mist-terminal skin definition.
 *
 * Palette from dsh-TUI's "Gentle Mist Blue" dark adaptation, mapped onto the
 * DSH `--dsw-*` design tokens (the alias layer drives every component).
 */

export interface SkinTokens {
  [token: string]: string
}

export const MIST_TERMINAL = {
  id: 'mist-terminal',
  colorScheme: 'dark' as const,
  tokens: {
    // background: deep blue-black (dsh-TUI #22262E family)
    '--dsw-alias-bg-base': '#22262E',
    '--dsw-alias-bg-layer-1': '#292D36',
    '--dsw-alias-bg-layer-2': '#2E333D',
    '--dsw-alias-bg-layer-3': '#343945',
    '--dsw-alias-bg-overlay': '#343945',
    // text: warm off-white
    '--dsw-alias-label-primary': '#F6F3ED',
    '--dsw-alias-label-secondary': '#AAB2C2',
    '--dsw-alias-label-tertiary': '#5E6673',
    '--dsw-alias-label-caption': '#5E6673',
    '--dsw-alias-label-dimmed': '#454D59',
    // borders
    '--dsw-alias-border-l1': 'rgba(246, 243, 237, 0.10)',
    '--dsw-alias-border-l2': 'rgba(246, 243, 237, 0.18)',
    '--dsw-alias-border-l3': 'rgba(246, 243, 237, 0.26)',
    // brand: mist blue
    '--dsw-alias-brand-primary': '#7DA1DE',
    '--dsw-alias-brand-text': '#22262E',
    '--dsw-alias-button-primary-hover': '#5E88CC',
    '--dsw-alias-button-primary-dimmed': '#343945',
    '--dsw-alias-state-business-primary': '#7DA1DE',
    '--dsw-alias-state-business-tertiary': '#343945',
    // components
    '--dsw-specific-sidebar-fill': '#1F232A',
    '--dsw-specific-sidebar-nav-item-hover': '#292D36',
    '--dsw-specific-sidebar-nav-item-active': '#343945',
    '--dsw-specific-sidebar-nav-item-active-accent': '#7DA1DE',
    '--dsw-specific-input-major': '#292D36',
    '--dsw-specific-bubble': '#2C3038',
    '--dsw-specific-bubble-highlight': '#343945',
    '--dsw-specific-menu': '#2E333D',
    '--dsw-specific-selector': '#2E333D',
    // code blocks
    '--dsw-alias-markdown-code-block': '#1F232A',
    '--dsw-alias-markdown-inline-code': '#343945',
    // scrollbar
    '--dsw-alias-scrollbar-bg-l1': '#343945',
    '--dsw-alias-scrollbar-bg-l2': '#454D59',
    '--dsw-alias-scrollbar-hover-l1': '#454D59',
    '--dsw-alias-scrollbar-hover-l2': '#55606F',
    // monospace (terminal base); CJK explicit Noto Sans SC (installed, Edge's
    // default) — unspecified CJK falls back to SimSun (宋体), which reads wrong.
    '--dsw-font-family': "Consolas, 'Cascadia Mono', 'Noto Sans SC', sans-serif",
  },
}
