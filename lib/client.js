window.__ModuleLoader__.load({ id: "dsh-whale-skin", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

/**
 * whale.ts — pixel whale sprite (user-drawn 16x16, typed in directly).
 *
 * 16 rows of characters; palette: K=black outline/water, B=bright blue body,
 * L=light belly, W=white mouth, .=transparent.
 * Source (user text): A=transparent, B=black, C=blue, D=light blue.
 */
const SPRITE = [
    '..K...K.........',
    '.K.K.K.K........',
    '....K.....K...K.',
    '.........KBK.KBK',
    '....K....KBBKBBK',
    '..........KBBBK.',
    '..KKKKKK...KBBK.',
    '.KBBBBBBK..KBBK.',
    'KBBBBBBBBKKBBBBK',
    'KBKBBBKBBBBBBBBK',
    'KBKBBBKBBBBBBBBK',
    'KBBBBBBBBBBBBBBK',
    'KB.....BBBBKBBK.',
    'KL......LKBBKBK.',
    '.KLLLLLLLKKBBK..',
    '..KKKKKKK..KK...',
];
const PALETTE = {
    K: '#000000',
    B: '#0000FF',
    L: '#99CAFF',
    W: '#FFFFFF',
};
/** Render the whale as an HTML block of colored cells. */
function whaleHtml(scale = 4) {
    const cell = String(scale) + 'px';
    const rows = SPRITE.map(row => '<div style="display:flex;height:' + cell + '">' +
        row.split('').map(ch => {
            const c = PALETTE[ch];
            return '<span style="display:inline-block;width:' + cell + ';height:' + cell +
                (c ? ';background:' + c : '') + '"></span>';
        }).join('') +
        '</div>').join('');
    return '<div class="dsh-whale-whale" style="display:inline-block;line-height:0">' + rows + '</div>';
}

const name = 'whale-skin';
// ── DOM contract (dsh internal structure) ────────────────────────────────
// Centralized selectors so a dsh refactor breaks in ONE obvious place with a
// console warning instead of silently degrading ("looks fine, feature dead").
const SELECTORS = {
    phase: '[data-phase]',
    scroll: '[data-conversation-scroll]',
    card: '[data-composer-card]',
    seat: '[data-composer-seat]',
    row: '[data-composer-card] > [class$="_row"]',
    dock: '[data-slot="conversation.composer.dock"]',
    footArea: '[class$="_footArea"]',
    headerUtilities: '[class$="_headerUtilities"]',
};
// Smoke check: log a structured warning for every contract selector that is
// missing when the skin loads. A missing selector usually means dsh's UI
// structure changed; the skin may still work partially, so warn loudly.
// Delayed until the SPA has rendered (see apply): at apply() time the
// conversation tree barely exists and every selector would "miss".
let selectorsChecked = false;
function assertSelectors() {
    if (selectorsChecked)
        return;
    selectorsChecked = true;
    for (const [key, sel] of Object.entries(SELECTORS)) {
        if (!document.querySelector(sel)) {
            console.warn(`[dsh-whale-skin] contract selector missing: ${key} = ${sel} (dsh UI changed?)`);
        }
    }
}
/** Refined terminal element styles injected via a <style> tag. */
// Style note: the skin is aggressively square (the very first rule zeroes
// every border-radius), so individual rules below intentionally never set
// border-radius — any value would be dead code overridden by the global rule.
const TERMINAL_CSS = [
    // ── square corners: the terminal look ────────────────────────────────────
    // No font rules: the user wants the default dsh/browser fonts everywhere
    // (the terminal look is layout + colours, not typeface).
    '*, *::before, *::after { border-radius: 0 !important; }',
    // ── conversation: terminal log flow ──────────────────────────────────────
    // Tight rows, separators; ALL text (assistant / user bubble / input) shares
    // one left column at 24px; the ">" prompts float at 4px on that axis.
    '[data-conversation-scroll] [class$="_column"] { gap: 4px !important; }',
    '[data-conversation-scroll] [class$="_flowItem"] { padding: 2px 0; }',
    '[data-conversation-scroll] [class$="_flowItem"]:not([data-chat-flow-kind="user"]):not([data-chat-flow-kind="steering"]) { padding-left: 24px !important; }',
    '[data-conversation-scroll] [class$="_flowItem"] + [class$="_flowItem"] { border-top: 1px solid rgba(125, 161, 222, 0.15); }',
    // De-bubble; user messages go LEFT-aligned and full width.
    '[class$="_bubble"] { background: transparent !important; border: none !important; box-shadow: none !important; padding: 2px 0 !important; }',
    '[data-chat-flow-kind="user"], [data-chat-flow-kind="steering"] { position: relative; padding-left: 0 !important; }',
    // Message prompts: 40px 1000-weight, floated well past the column's left
    // edge (-16px overhang). line-height: 1 pins the glyph box to its own font
    // size; a 40px glyph's visual centre sits ~top+22px, so to land on the
    // first text line's centre (20px here: flow 2 + bubble 6 + half line) the
    // top must be -2px. font-weight caps at 1000 in CSS (1200 is ignored).
    '[data-chat-flow-kind="user"]::before, [data-chat-flow-kind="steering"]::before { content: ">"; position: absolute; left: -16px; top: -4px; color: #7DA1DE; font-size: 40px; line-height: 1; font-weight: 1000; }',
    '[data-chat-flow-kind="user"] [class$="_userRow"], [data-chat-flow-kind="steering"] [class$="_userRow"] { align-items: stretch !important; }',
    '[data-chat-flow-kind="user"] [class$="_userStack"], [data-chat-flow-kind="steering"] [class$="_userStack"] { align-items: stretch !important; max-width: none !important; }',
    // User bubble: the colour block wraps ONLY the text — 12px side padding
    // (which also carries the text to the 56px column), 6px top/bottom so the
    // block is not too tall. It starts 12px in from the flow column (44px
    // absolute), so the ">" prompt at 32px stays OUTSIDE the block; the right
    // side keeps its own 12px too (width -24px).
    '[data-chat-flow-kind="user"] [class$="_bubble"], [data-chat-flow-kind="steering"] [class$="_bubble"] { width: calc(100% - 24px) !important; box-sizing: border-box; margin-left: 12px !important; background: rgba(125, 161, 222, 0.14) !important; padding: 6px 12px !important; }',
    // Bottom clearance: the bottombar is a normal flex child after the
    // scrollBody (scrollbar never covered); a small pad keeps the last flow
    // line from touching the bar — breathing room, not a dead band.
    '[data-conversation-scroll] { padding-bottom: 8px !important; }',
    // ── input card scrolls with the flow (seat NOT sticky) ───────────────────
    // The composer seat stays static so the input card rides the transcript and
    // you can scroll down to it; only the toolbar row + token dock are lifted
    // into the fixed bottombar below.
    '[data-composer-seat] { position: static !important; background: none !important; }',
    // Input card: mist-blue tint. background-clip: content-box draws the tint
    // only inside the padding, so asymmetric padding shapes it: left 12px starts
    // the blue at the 44px block axis (matching the bubbles), right 0 lets it
    // run to the column edge (the message text also ends there), and the grow
    // text adds its own 12px left padding, landing on the 56px text column.
    '[data-composer-card] { border: none !important; background: rgba(125, 161, 222, 0.14) !important; background-clip: content-box !important; box-shadow: none !important; padding: 6px 0 6px 12px !important; max-width: var(--dsh-whale-input-width) !important; }',
    // No scrollbar and no height cap: the draft grows with its content (dsh
    // caps at 132px by default; the flow already scrolls the whole page).
    '[data-composer-card] [data-input-scroll] { max-height: none !important; overflow-y: visible !important; }',
    // ── input: block caret + terminal prompt glyph (sharp ">") ───────────────
    // The textarea/backdrop/mirror trio MUST share padding (InputBar.module.css
    // warns the layers drift otherwise): pad ALL three with the same 12px on
    // every side. The text then starts at card-left + 12px = 44 + 12 = 56px,
    // the shared text column.
    // Default bar caret (browser-native: its thickness/length are not
    // CSS-tunable — caret-shape alternatives are all-or-nothing, and the
    // underscore variant reads too thin; the default is the safe look).
    'textarea { caret-color: #7DA1DE !important; }',
    // The prompt is an INDEPENDENT decoration, outside the tint: the card now
    // spans the full column (left edge = column edge), so -16px puts the arrow
    // on the same -16px axis as the message prompts — a clear gap before the
    // tint. top 0 aligns the 40px glyph with the card's text block (the card
    // has no flow padding, so the arrow needs no negative lift; -4 read high).
    // 40px 1000-weight makes it a bold, visible prompt (1000 is the CSS
    // font-weight cap).
    '[data-composer-card]::before { content: ">"; position: absolute; left: -16px; top: 0; color: #7DA1DE; font-size: 40px; line-height: 1; font-weight: 1000; pointer-events: none; z-index: 1; }',
    // Vertical rhythm: 6px top/bottom keeps the tint slim; the 12px side pads
    // carry the text to the shared 56px column.
    '[class$="_grow"] textarea, [class$="_grow"] [class$="_backdrop"], [class$="_grow"] [class$="_mirror"] { padding: 6px 12px !important; }',
    // ── fixed bottombar (toolbar row + token dock, moved by fixBottomBar) ────
    // A NORMAL flex child of [data-phase] (which is flex-column; scrollBody is
    // flex:1), appended AFTER the scrollBody — so it pins to the bottom WITHOUT
    // absolute positioning: the scroll area naturally ends above it and its
    // scrollbar is never covered. Its 32px side padding mirrors the ChatView
    // scroll padding, so the inner column (max-width: --dsh-chat-content-width,
    // auto margins) centres on exactly the message column axis; the row's 24px
    // side padding puts the first button at the 24px text inset.
    '#dsh-whale-bottombar { flex: none; background: var(--dsw-alias-bg-base); border-top: 1px solid rgba(125, 161, 222, 0.15); padding: 2px 32px 0; }',
    '#dsh-whale-bottombar [class$="_row"] { position: static !important; background: none !important; max-width: var(--dsh-chat-content-width) !important; margin: 0 auto !important; padding: 2px 24px 4px !important; }',
    '#dsh-whale-bottombar [data-slot="conversation.composer.dock"] { position: static !important; background: none !important; max-width: var(--dsh-chat-content-width) !important; margin: 0 auto !important; padding: 0 24px 4px !important; }',
    // Token stats row (merged from the stats-widen plugin): StatsLine caps at
    // the content width with nowrap + ellipsis, so long lines get cut; let it
    // wrap instead.
    '[data-slot="conversation.composer.dock"] > div { max-width: var(--dsh-chat-content-width) !important; padding: 0 !important; white-space: normal !important; text-overflow: clip !important; }',
    // ── whale host (above the sidebar foot, left-aligned) ────────────────────
    '.dsh-whale-whale { display: inline-block; line-height: 0; opacity: 0.92; }',
    '.dsh-whale-whale-host { display: flex; justify-content: flex-start; padding: 12px 0 6px 12px; }',
    // ── width toggle button (top-right header, capsule like Session log) ─────
    // The capsule outline survives via border-color only; the global square rule
    // makes the pill square, which is the terminal look.
    '#dsh-whale-width-toggle { display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 6px 12px; border: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); background: transparent; font-size: 13px; line-height: 20px; cursor: pointer; white-space: nowrap; }',
    '#dsh-whale-width-toggle:hover { background: var(--dsw-alias-interactive-bg-hover); color: #7DA1DE; }',
    // ── message chrome: always-visible timestamps + user actions order ───────
    // dsh hides timestamps under hover (data-time-hover-root opacity 0); force
    // them visible. User messages use clock="start" (time left, copy right);
    // reorder so the copy button sits left like the assistant's, time follows.
    '[data-time-hover-root] :is([class$="_timeStart"], [class$="_timeEnd"]) { opacity: 1 !important; }',
    // Actions row: one full-width grey card (like the user bubble), not a
    // fit-content strip — dsh's default row is content-sized, leaving a grey
    // sliver that "floats" under the text.
    // Grey blocks follow the theme's text colour at low opacity: label-primary
    // is near-black in light mode and near-white in dark mode, so 8% of it
    // reads as a soft grey card in BOTH modes (12% read too dark in light mode;
    // a fixed rgba can only ever match one scheme).
    // Grey blocks: LIGHT mode = neutral grey rgba(0,0,0,0.04) — barely-there
    // grey, neither warm nor blue. DARK mode = neutral white 14% so it stands
    // off the dark base.
    '[data-time-hover-root] [class$="_actions"] { background: rgba(0, 0, 0, 0.04); padding: 0 10px; width: 100%; box-sizing: border-box; }',
    'body[data-ds-dark-theme] [data-time-hover-root] [class$="_actions"] { background: rgba(255, 255, 255, 0.14); }',
    // MUST come after the width:100% rule above (same specificity, later wins):
    // user + steering + pending actions get the same 12px inset as the bubbles,
    // so their grey cards line up with the text column instead of spanning full
    // width. (Pending steering becomes a REAL steering node on send, so both
    // the data-chat-flow-kind="steering" and the pre-admission attribute must
    // match — a missing variant is exactly what "drifts left after sending".)
    '[data-chat-flow-kind="user"] [class$="_actions"], [data-chat-flow-kind="steering"] [class$="_actions"], [data-pending-steering] [class$="_actions"] { margin-left: 12px !important; width: calc(100% - 24px) !important; }',
    '[data-chat-flow-kind="user"] [class$="_actions"] > [class$="_timeStart"], [data-chat-flow-kind="steering"] [class$="_actions"] > [class$="_timeStart"], [data-pending-steering] [class$="_actions"] > [class$="_timeStart"] { order: 3; padding-right: 0; padding-left: 12px; }',
    // ── produced-files row + timestamps: ONE grey card ──────────────────────
    // The turn-tail container holds the produced-files row AND the actions row;
    // give the CONTAINER the grey block and strip the children's own
    // backgrounds so the whole tail reads as a single card. 6px top/bottom
    // padding keeps it slim; the 12px side padding starts its text at 56px.
    // The tail lives inside an assistant flowItem (24px inset), so -12px margin
    // pulls its left edge back to 44px — the same block axis as the bubbles.
    // Natural 8px gap separates the two rows INSIDE the card.
    // Grey blocks: light mode barely-there neutral grey, dark mode neutral white.
    '[data-turn-tail] { gap: 8px !important; background: rgba(0, 0, 0, 0.04) !important; padding: 6px 12px !important; margin-left: -12px !important; box-sizing: border-box; }',
    'body[data-ds-dark-theme] [data-turn-tail] { background: rgba(255, 255, 255, 0.14) !important; }',
    '[data-turn-tail] [class$="_actions"] { background: transparent !important; padding: 0 !important; }',
    '[class$="_root"]:has(> [data-produced-files-row]) { background: transparent !important; padding: 0 !important; margin-top: 0 !important; }',
    '[class$="_root"]:has(> [data-produced-files-row]) [class$="_file"] { background: transparent; border: 1px solid rgba(125, 161, 222, 0.35); color: var(--dsw-alias-label-secondary); padding: 0 8px; }',
    '[class$="_root"]:has(> [data-produced-files-row]) [class$="_file"]:hover { color: var(--dsw-alias-label-primary); }',
    // ── pending steering (Host-authoritative pre-admission bubble) ────────────
    // It renders OUTSIDE a flowItem (no data-chat-flow-kind) but reuses the
    // user bubble classes. CRITICAL: data-pending-steering sits on the userRow
    // element ITSELF, so the row must be stretched directly (a descendant
    // selector for "_userRow" can never match). The bubble's own left padding
    // aligns the text with the message column; no row padding, or the ">"
    // prompt would float outside the blue block.
    '[data-pending-steering] { position: relative; align-items: stretch !important; }',
    // Pending rows render WITHOUT a flowItem: the bubble's 6px top padding puts
    // the first text line's centre at 18px, and the 40px glyph rides low, so
    // top -6px lifts it onto the line (one notch less than the input card,
    // which reads lower).
    '[data-pending-steering]::before { content: ">"; position: absolute; left: -16px; top: -6px; color: #7DA1DE; font-size: 40px; line-height: 1; font-weight: 1000; }',
    '[data-pending-steering] [class$="_userStack"] { align-items: stretch !important; max-width: none !important; }',
    // Same "wraps only the text" block as the user bubble: 12px in from the
    // scroll padding (44px), 6px top/bottom + 12px sides, text at 56px.
    '[data-pending-steering] [class$="_bubble"] { width: calc(100% - 24px) !important; box-sizing: border-box; margin-left: 12px !important; background: rgba(125, 161, 222, 0.14) !important; padding: 6px 12px !important; }',
    // ── turn activity ("Deep diving...") aligns with the text column ─────────
    // TurnStatus renders directly in the flow (no flowItem inset), so without
    // help its label starts at the column edge; push it onto the 24px text axis.
    '[class$="_turnStatus"] { margin-left: 24px !important; }',
    // ── reasoning ("Think") disclosure stays inside its row ──────────────────
    // The collapsed summary is nowrap in dsh; Consolas renders wider than the
    // default font, so long thinking lines can overflow the row. Let the
    // summary shrink (ellipsis) and ensure the expanded body wraps.
    '[data-variant="think"] [class$="_summary"] { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    '[data-variant="think"] [class$="_thinkBody"] { overflow-wrap: anywhere; }',
    // ── scrollbars: thin flat ────────────────────────────────────────────────
    // Scoped to the conversation surface so other plugins' scrollbars (settings
    // panels, modals) keep their themed look.
    '[data-conversation-scroll]::-webkit-scrollbar { width: 10px; height: 10px; }',
    '[data-conversation-scroll]::-webkit-scrollbar-thumb { background: #343945; border: 2px solid #22262E; }',
    '[data-conversation-scroll]::-webkit-scrollbar-thumb:hover { background: #454D59; }',
    // ── links: brand accent (scoped: only inside the conversation surface) ───
    '[data-conversation-scroll] a, [data-composer-card] a { color: #7DA1DE !important; }',
]
    // Every rule is scoped under body[data-skin="whale"] so the skin only applies
    // while it is the active skin and never bleeds into other plugins' UI. The
    // attribute is set by apply() on load. scopeRule/splitTopLevel live in
    // style.ts (pure functions, unit-tested).
    .map(scopeRule)
    .join('\n');
function injectStyle() {
    if (document.getElementById('dsh-whale-skin-style'))
        return;
    const el = document.createElement('style');
    el.id = 'dsh-whale-skin-style';
    el.textContent = TERMINAL_CSS;
    document.head.appendChild(el);
}
// Lift the toolbar row (inside the input card) and the token dock (the
// InputBar root footer) into a fixed bottombar pinned to [data-phase]. The
// input card itself stays in the flow, so it scrolls with the transcript.
// A MutationObserver re-pins the row/dock after React re-renders.
let bottomBar = null;
let observer = null;
function fixBottomBar() {
    const scroll = document.querySelector(SELECTORS.scroll);
    if (!scroll)
        return;
    if (!bottomBar || !document.body.contains(bottomBar)) {
        bottomBar = document.createElement('div');
        bottomBar.id = 'dsh-whale-bottombar';
        // Insert AFTER the scrollBody so the bar is the last flex child of the
        // column: the scroll area ends above it and its scrollbar is never
        // covered by the bar.
        scroll.insertAdjacentElement('afterend', bottomBar);
    }
    const seat = document.querySelector(SELECTORS.seat);
    if (!seat)
        return;
    const row = seat.querySelector(SELECTORS.row);
    if (row && row.parentNode !== bottomBar)
        bottomBar.insertBefore(row, bottomBar.firstChild);
    // Move the token dock only when it actually has content: a bare slot (no
    // cost-meter) would otherwise render an empty bar. Children other than text
    // count as content; whitespace-only text does not.
    const dock = seat.querySelector(SELECTORS.dock);
    if (dock && dock.parentNode !== bottomBar) {
        const hasContent = dock.children.length > 0 || (dock.textContent || '').trim() !== '';
        if (hasContent)
            bottomBar.appendChild(dock);
    }
}
function startBottomBarWatch() {
    if (observer)
        return;
    // rAF-coalesced callback: streaming output can fire hundreds of mutations
    // per second, and fixBottomBar+applyWidthMode+re-injects are idempotent
    // DOM/query work — no point running them more than once per frame.
    let rafId = 0;
    const run = () => {
        rafId = 0;
        // First real mutation means the SPA tree exists — the right moment for the
        // selector contract check (at apply() it would all be "missing").
        assertSelectors();
        fixBottomBar();
        // Re-apply the persisted content-width (the conversation root may not
        // exist when apply() first ran; also catches React remounts).
        applyWidthMode();
        // Re-inject the whale and the width toggle if a React remount dropped
        // them (both guard on getElementById/pending internally, so this is a
        // no-op while they are present or a retry loop is running).
        injectWhale();
        injectWidthToggle();
    };
    observer = new MutationObserver(() => {
        if (rafId !== 0)
            return;
        rafId = requestAnimationFrame(run);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    fixBottomBar();
}
// Inject the whale BETWEEN the session list (regionArea) and the foot
// (settings button): the root is a fixed-height column whose foot would be
// pushed out of view if the whale sat above the logo row.
//
// Leak guard: injectWhale / injectWidthToggle are re-invoked from the
// MutationObserver (React remounts). While the target selector is missing,
// each call used to build a fresh detached node + a fresh 20s interval —
// over a long session that accumulates thousands of timers. A module-level
// `pending` bit makes later calls no-ops; ONE shared 500ms timer drives the
// retries until the target appears (or a hard cap stops it).
let whalePending = false;
let whaleGaveUp = false;
let togglePending = false;
let toggleGaveUp = false;
function injectWhale() {
    if (document.getElementById('dsh-whale-whale-host'))
        return;
    if (whalePending || whaleGaveUp)
        return; // retry loop running, or gave up
    const host = document.createElement('div');
    host.id = 'dsh-whale-whale-host';
    host.className = 'dsh-whale-whale-host';
    host.innerHTML = whaleHtml(5); // 16 cols x 5px = 80px wide
    const tryInject = () => {
        const foot = document.querySelector(SELECTORS.footArea);
        if (foot && foot.parentElement) {
            foot.parentElement.insertBefore(host, foot);
            whalePending = false;
            whaleGaveUp = false; // target found: allow future re-injection if remounted
            return true;
        }
        return false;
    };
    if (!tryInject()) {
        // SPA renders asynchronously: watch until the foot appears. After the fast
        // retry cap (20s), slow down to 5s so a slow cold start (large session,
        // slow disk) still gets the whale — never a permanent dead-end.
        whalePending = true;
        let tries = 0;
        const fast = setInterval(() => {
            tries++;
            if (tryInject()) {
                clearInterval(fast);
                return;
            }
            if (tries >= 40) {
                clearInterval(fast);
                whalePending = false;
                whaleGaveUp = true;
                // Slow re-arm: keep probing every 5s; when the target appears, inject.
                const slow = setInterval(() => {
                    if (tryInject())
                        clearInterval(slow);
                }, 5000);
            }
        }, 500);
    }
}
// ── content width toggle: centered (default) vs full-bleed ─────────────────
// ONE design axis: messages and input resolve against the same column width,
// so the toggle only changes how much side whitespace remains, never the
// per-column alignment. The two variables differ in wide mode because their
// 100% resolves against different parents:
//   --dsh-chat-content-width  (message column; 100% = scroll content, V-64)
//   --dsh-whale-input-width (input card; 100% = composer root content, V-32)
// The bottom bar's inner column reuses --dsh-chat-content-width (its 32px
// side padding + centered max-width lands flush with the message column).
// Persisted in localStorage; flipped on the conversation root ([data-phase]).
const WIDTH_KEY = 'dsh-whale-content-width:v1';
const WIDTH_KEY_LEGACY = 'dsh-whale-content-width'; // pre-v1 key, migrated once
const WIDTH_CENTER = '748px';
const WIDTH_WIDE = '100%'; // column: fill the scroll content area
const INPUT_WIDE = 'calc(100% - 32px)'; // card: fill scroll area minus root pads
// Memory cache of the stored width mode: the observer runs every frame during
// streaming output, and reading localStorage on every frame is needless I/O.
// Only the toggle click writes through to localStorage; applyWidthMode reads
// the cache.
let widthModeCache = null;
function getStoredWidthMode() {
    if (widthModeCache !== null)
        return widthModeCache;
    try {
        let mode = localStorage.getItem(WIDTH_KEY);
        if (mode === null) {
            // Migrate the pre-v1 key once, then write the versioned one.
            const legacy = localStorage.getItem(WIDTH_KEY_LEGACY);
            if (legacy === 'wide' || legacy === 'center') {
                mode = legacy;
                localStorage.setItem(WIDTH_KEY, mode);
            }
        }
        widthModeCache = mode === 'wide' ? 'wide' : 'center';
    }
    catch {
        widthModeCache = 'center';
    }
    return widthModeCache;
}
function setStoredWidthMode(mode) {
    widthModeCache = mode;
    try {
        localStorage.setItem(WIDTH_KEY, mode);
    }
    catch { /* ignore */ }
}
function applyWidthMode() {
    const root = document.querySelector(SELECTORS.phase);
    if (!root)
        return;
    const mode = getStoredWidthMode();
    const el = root;
    el.style.setProperty('--dsh-chat-content-width', mode === 'wide' ? WIDTH_WIDE : WIDTH_CENTER);
    el.style.setProperty('--dsh-whale-input-width', mode === 'wide' ? INPUT_WIDE : WIDTH_CENTER);
}
function injectWidthToggle() {
    if (document.getElementById('dsh-whale-width-toggle'))
        return;
    if (togglePending || toggleGaveUp)
        return; // retry loop running, or gave up
    const make = () => {
        // Top-right header utilities, next to the session-log download button.
        const utils = document.querySelector(SELECTORS.headerUtilities);
        if (!utils)
            return false;
        const btn = document.createElement('button');
        btn.id = 'dsh-whale-width-toggle';
        btn.title = '切换内容宽度：居中 / 占满';
        // Label describes the ACTION (what a click will do), not the current state.
        btn.textContent = getStoredWidthMode() === 'wide' ? '居中' : '占满';
        btn.setAttribute('aria-pressed', getStoredWidthMode() === 'wide' ? 'true' : 'false');
        btn.addEventListener('click', () => {
            const next = getStoredWidthMode() === 'wide' ? 'center' : 'wide';
            setStoredWidthMode(next);
            btn.textContent = next === 'wide' ? '居中' : '占满';
            btn.setAttribute('aria-pressed', next === 'wide' ? 'true' : 'false');
            applyWidthMode();
        });
        utils.appendChild(btn);
        togglePending = false;
        toggleGaveUp = false; // target found: allow future re-injection if remounted
        return true;
    };
    if (!make()) {
        togglePending = true;
        let tries = 0;
        const iv = setInterval(() => {
            tries++;
            if (make()) {
                clearInterval(iv);
                return;
            }
            if (tries >= 40) {
                togglePending = false;
                toggleGaveUp = true;
                clearInterval(iv);
                // Slow re-arm for slow cold starts: keep probing every 5s.
                const slow = setInterval(() => {
                    if (make())
                        clearInterval(slow);
                }, 5000);
            }
        }, 500);
    }
}
function apply(ctx) {
    // Mark the skin as active: every TERMINAL_CSS rule is scoped under this
    // attribute so the skin never bleeds into other plugins' UI.
    document.body.setAttribute('data-skin', 'whale');
    // 1. Inject terminal element styles and the pixel whale.
    injectStyle();
    injectWhale();
    injectWidthToggle();
    applyWidthMode();
    // 2. Keep the persisted width and the bottom-bar pinning in sync. The first
    // observer callback also runs assertSelectors (after the SPA has rendered).
    startBottomBarWatch();
}

module.exports = { name, apply };
return module.exports; } });
