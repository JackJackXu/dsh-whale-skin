/**
 * index.ts — dsh-terminal-skin browser half (redesigned).
 *
 * Mist-blue terminal skin. Layout intent (from ui-conversation source):
 *   ConversationRoot: header (fixed) / scrollBody[data-conversation-scroll]
 *   (scrolls) / composerSeat inside scrollBody (sticky by default).
 *   InputBar inside the seat: card[data-composer-card] > scroll
 *   [data-input-scroll] (the draft) + row (toolbar buttons), and a footer
 *   slot (token stats).
 *
 * This skin:
 *  - square corners, monospace, mist-blue accents;
 *  - the conversation flows like a terminal: message rows + the input line
 *    scroll together (seat forced static);
 *  - the toolbar row and the token stats are MOVED into a fixed bottom bar
 *    (DOM operation, kept in sync via MutationObserver — the seat's parent
 *    container lives at the end of the flow, so CSS sticky cannot pin them);
 *  - the user-drawn 1:1 whale sits at the top of the sidebar.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { whaleHtml } from './whale.js'

export const name = 'terminal-skin'

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
  '[data-composer-card] { border: none !important; background: rgba(125, 161, 222, 0.14) !important; background-clip: content-box !important; box-shadow: none !important; padding: 6px 0 6px 12px !important; max-width: var(--dsh-terminal-input-width) !important; }',
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
  '#dsh-terminal-bottombar { flex: none; background: var(--dsw-alias-bg-base); border-top: 1px solid rgba(125, 161, 222, 0.15); padding: 2px 32px 0; }',
  '#dsh-terminal-bottombar [class$="_row"] { position: static !important; background: none !important; max-width: var(--dsh-chat-content-width) !important; margin: 0 auto !important; padding: 2px 24px 4px !important; }',
  '#dsh-terminal-bottombar [data-slot="conversation.composer.dock"] { position: static !important; background: none !important; max-width: var(--dsh-chat-content-width) !important; margin: 0 auto !important; padding: 0 24px 4px !important; }',
  // Token stats row (merged from the stats-widen plugin): StatsLine caps at
  // the content width with nowrap + ellipsis, so long lines get cut; let it
  // wrap instead.
  '[data-slot="conversation.composer.dock"] > div { max-width: var(--dsh-chat-content-width) !important; padding: 0 !important; white-space: normal !important; text-overflow: clip !important; }',
  // ── links / brand accents ────────────────────────────────────────────────
  'a { color: #7DA1DE !important; }',
  // ── thin flat scrollbar ──────────────────────────────────────────────────
  '*::-webkit-scrollbar { width: 10px; height: 10px; }',
  '*::-webkit-scrollbar-thumb { background: #343945; border: 2px solid #22262E; }',
  '*::-webkit-scrollbar-thumb:hover { background: #454D59; }',
  // ── whale host (above the sidebar foot, left-aligned) ────────────────────
  '.dsh-terminal-whale { display: inline-block; line-height: 0; opacity: 0.92; }',
  '.dsh-terminal-whale-host { display: flex; justify-content: flex-start; padding: 12px 0 6px 12px; }',
  // ── width toggle button (top-right header, capsule like Session log) ─────
  // The capsule outline survives via border-color only; the global square rule
  // makes the pill square, which is the terminal look.
  '#dsh-terminal-width-toggle { display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 6px 12px; border: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); background: transparent; font-size: 13px; line-height: 20px; cursor: pointer; white-space: nowrap; }',
  '#dsh-terminal-width-toggle:hover { background: var(--dsw-alias-interactive-bg-hover); color: #7DA1DE; }',
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
].join('\n')

function injectStyle(): void {
  if (document.getElementById('dsh-terminal-skin-style')) return
  const el = document.createElement('style')
  el.id = 'dsh-terminal-skin-style'
  el.textContent = TERMINAL_CSS
  document.head.appendChild(el)
}

// Lift the toolbar row (inside the input card) and the token dock (the
// InputBar root footer) into a fixed bottombar pinned to [data-phase]. The
// input card itself stays in the flow, so it scrolls with the transcript.
// A MutationObserver re-pins the row/dock after React re-renders.
let bottomBar: HTMLElement | null = null
let observer: MutationObserver | null = null

function fixBottomBar(): void {
  const root = document.querySelector('[data-phase]')
  const scroll = document.querySelector('[data-conversation-scroll]')
  if (!root || !scroll) return
  if (!bottomBar || !document.body.contains(bottomBar)) {
    bottomBar = document.createElement('div')
    bottomBar.id = 'dsh-terminal-bottombar'
    // Insert AFTER the scrollBody so the bar is the last flex child of the
    // column: the scroll area ends above it and its scrollbar is never
    // covered by the bar.
    scroll.insertAdjacentElement('afterend', bottomBar)
  }
  const seat = document.querySelector('[data-composer-seat]')
  if (!seat) return
  const row = seat.querySelector('[data-composer-card] > [class$="_row"]')
  if (row && row.parentNode !== bottomBar) bottomBar.insertBefore(row, bottomBar.firstChild)
  const dock = seat.querySelector('[data-slot="conversation.composer.dock"]')
  if (dock && dock.parentNode !== bottomBar) bottomBar.appendChild(dock)
}

function startBottomBarWatch(): void {
  if (observer) return
  observer = new MutationObserver(() => {
    fixBottomBar()
    // Re-apply the persisted content-width (the conversation root may not
    // exist when apply() first ran; also catches React remounts).
    applyWidthMode()
  })
  observer.observe(document.body, { childList: true, subtree: true })
  fixBottomBar()
}

// Inject the whale BETWEEN the session list (regionArea) and the foot
// (settings button): the root is a fixed-height column whose foot would be
// pushed out of view if the whale sat above the logo row.
function injectWhale(): void {
  if (document.getElementById('dsh-terminal-whale-host')) return
  const host = document.createElement('div')
  host.id = 'dsh-terminal-whale-host'
  host.className = 'dsh-terminal-whale-host'
  host.innerHTML = whaleHtml(5) // 16 cols x 5px = 80px wide

  const tryInject = (): boolean => {
    const foot = document.querySelector('[class$="_footArea"]')
    if (foot && foot.parentElement) {
      foot.parentElement.insertBefore(host, foot)
      return true
    }
    return false
  }

  if (!tryInject()) {
    // SPA renders asynchronously: watch until the foot appears.
    let tries = 0
    const iv = setInterval(() => {
      tries++
      if (tryInject() || tries > 40) clearInterval(iv)
    }, 500)
  }
}

// ── content width toggle: centered (default) vs full-bleed ─────────────────
// ONE design axis: messages, input and bottom bar all resolve against the
// same column width, so the toggle only changes how much side whitespace
// remains, never the per-column alignment. The three variables differ in
// wide mode because their 100% resolves against different parents:
//   --dsh-chat-content-width  (message column; 100% = scroll content, V-64)
//   --dsh-terminal-input-width (input card; 100% = composer root content, V-32)
//   --dsh-terminal-bar-width   (bottom bar; 100% = the full [data-phase], V)
// In wide mode each is tuned so the resulting box is exactly V-64 wide and
// its left edge lands at 32px, flush with the message column.
// Persisted in localStorage; flipped on the conversation root ([data-phase]).
const WIDTH_KEY = 'dsh-terminal-content-width'
const WIDTH_CENTER = '748px'
const WIDTH_WIDE = '100%' // column: fill the scroll content area
const INPUT_WIDE = 'calc(100% - 32px)' // card: fill scroll area minus root pads
const BAR_WIDE = 'calc(100% - 64px)' // bar: full root minus both side clearances

function getStoredWidthMode(): string {
  try { return localStorage.getItem(WIDTH_KEY) === 'wide' ? 'wide' : 'center' } catch { return 'center' }
}

function applyWidthMode(): void {
  const root = document.querySelector('[data-phase]')
  if (!root) return
  const mode = getStoredWidthMode()
  const el = root as HTMLElement
  el.style.setProperty('--dsh-chat-content-width', mode === 'wide' ? WIDTH_WIDE : WIDTH_CENTER)
  el.style.setProperty('--dsh-terminal-input-width', mode === 'wide' ? INPUT_WIDE : WIDTH_CENTER)
  el.style.setProperty('--dsh-terminal-bar-width', mode === 'wide' ? BAR_WIDE : WIDTH_CENTER)
}

function injectWidthToggle(): void {
  if (document.getElementById('dsh-terminal-width-toggle')) return
  const make = (): boolean => {
    // Top-right header utilities, next to the session-log download button.
    const utils = document.querySelector('[class$="_headerUtilities"]')
    if (!utils) return false
    const btn = document.createElement('button')
    btn.id = 'dsh-terminal-width-toggle'
    btn.title = '切换内容宽度：居中 / 占满'
    btn.textContent = getStoredWidthMode() === 'wide' ? '占满' : '居中'
    btn.addEventListener('click', () => {
      const next = getStoredWidthMode() === 'wide' ? 'center' : 'wide'
      try { localStorage.setItem(WIDTH_KEY, next) } catch { /* ignore */ }
      btn.textContent = next === 'wide' ? '占满' : '居中'
      applyWidthMode()
    })
    utils.appendChild(btn)
    return true
  }
  if (!make()) {
    let tries = 0
    const iv = setInterval(() => {
      tries++
      if (make() || tries > 40) clearInterval(iv)
    }, 500)
  }
}

export function apply(ctx: ClientContext): void {
  // 1. Inject terminal element styles and the pixel whale.
  injectStyle()
  injectWhale()
  injectWidthToggle()
  applyWidthMode()
  // 2. Keep the persisted width and the bottom-bar pinning in sync.
  startBottomBarWatch()
}
