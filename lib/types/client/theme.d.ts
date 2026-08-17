/**
 * theme.ts — mist-terminal skin definition.
 *
 * Palette from dsh-TUI's "Gentle Mist Blue" dark adaptation, mapped onto the
 * DSH `--dsw-*` design tokens (the alias layer drives every component).
 */
export interface SkinTokens {
    [token: string]: string;
}
export declare const MIST_TERMINAL: {
    id: string;
    colorScheme: "dark";
    tokens: {
        '--dsw-alias-bg-base': string;
        '--dsw-alias-bg-layer-1': string;
        '--dsw-alias-bg-layer-2': string;
        '--dsw-alias-bg-layer-3': string;
        '--dsw-alias-bg-overlay': string;
        '--dsw-alias-label-primary': string;
        '--dsw-alias-label-secondary': string;
        '--dsw-alias-label-tertiary': string;
        '--dsw-alias-label-caption': string;
        '--dsw-alias-label-dimmed': string;
        '--dsw-alias-border-l1': string;
        '--dsw-alias-border-l2': string;
        '--dsw-alias-border-l3': string;
        '--dsw-alias-brand-primary': string;
        '--dsw-alias-brand-text': string;
        '--dsw-alias-button-primary-hover': string;
        '--dsw-alias-button-primary-dimmed': string;
        '--dsw-alias-state-business-primary': string;
        '--dsw-alias-state-business-tertiary': string;
        '--dsw-specific-sidebar-fill': string;
        '--dsw-specific-sidebar-nav-item-hover': string;
        '--dsw-specific-sidebar-nav-item-active': string;
        '--dsw-specific-sidebar-nav-item-active-accent': string;
        '--dsw-specific-input-major': string;
        '--dsw-specific-bubble': string;
        '--dsw-specific-bubble-highlight': string;
        '--dsw-specific-menu': string;
        '--dsw-specific-selector': string;
        '--dsw-alias-markdown-code-block': string;
        '--dsw-alias-markdown-inline-code': string;
        '--dsw-alias-scrollbar-bg-l1': string;
        '--dsw-alias-scrollbar-bg-l2': string;
        '--dsw-alias-scrollbar-hover-l1': string;
        '--dsw-alias-scrollbar-hover-l2': string;
        '--dsw-font-family': string;
    };
};
