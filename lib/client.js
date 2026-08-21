window.__ModuleLoader__.load({ id: "dsh-whale-skin", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;

//#region lib/client/whale.js
/**
* whale.ts — pixel whale sprite (user-drawn 16x16, typed in directly).
*
* 16 rows of characters; palette: K=black outline/water, B=bright blue body,
* L=light belly, W=white mouth, .=white background (not transparent — the
* whale renders as a solid white tile, see PALETTE).
* Source (user text): A=transparent, B=black, C=blue, D=light blue.
*/
const SPRITE = [
	"..K...K.........",
	".K.K.K.K........",
	"....K.....K...K.",
	".........KBK.KBK",
	"....K....KBBKBBK",
	"..........KBBBK.",
	"..KKKKKK...KBBK.",
	".KBBBBBBK..KBBK.",
	"KBBBBBBBBKKBBBBK",
	"KBKBBBKBBBBBBBBK",
	"KBKBBBKBBBBBBBBK",
	"KBBBBBBBBBBBBBBK",
	"KB.....BBBBKBBK.",
	"KL......LKBBKBK.",
	".KLLLLLLLKKBBK..",
	"..KKKKKKK..KK..."
];
const PALETTE = {
	K: "#000000",
	B: "#0000FF",
	L: "#99CAFF",
	W: "#FFFFFF",
	".": "#FFFFFF"
};
/** Render the whale as an HTML block of colored cells. */
function whaleHtml(scale = 4) {
	const cell = String(scale) + "px";
	const rows = SPRITE.map((row) => "<div style=\"display:flex;height:" + cell + "\">" + row.split("").map((ch) => {
		const c = PALETTE[ch];
		return "<span style=\"display:inline-block;width:" + cell + ";height:" + cell + (c ? ";background:" + c : "") + "\"></span>";
	}).join("") + "</div>").join("");
	return "<div class=\"dsh-whale-whale\" style=\"display:inline-block;line-height:0\">" + rows + "</div>";
}

//#endregion
//#region lib/client/style.js
/**
* style.ts — 皮肤 CSS 作用域化（纯函数，独立模块以便测试直接引用真实现）。
*/
function splitTopLevel(selectors) {
	const parts = [];
	let depth = 0;
	let cur = "";
	for (const ch of selectors) {
		if (ch === "(" || ch === "[") depth++;
		else if (ch === ")" || ch === "]") depth--;
		if (ch === "," && depth === 0) {
			parts.push(cur);
			cur = "";
		} else cur += ch;
	}
	parts.push(cur);
	return parts;
}
function scopeRule(rule) {
	const brace = rule.indexOf("{");
	const selectors = rule.slice(0, brace);
	const body = rule.slice(brace);
	const scoped = splitTopLevel(selectors).map((part) => part.trim()).map((part) => {
		if (part.startsWith("body[")) {
			if (part.startsWith("body[data-skin=\"whale\"]")) return part;
			return part.replace(/^body\[/, "body[data-skin=\"whale\"][");
		}
		return "body[data-skin=\"whale\"] " + part;
	}).join(", ");
	return scoped + " " + body;
}

//#endregion
//#region lib/client/index.js
const name = "whale-skin";
const SELECTORS = {
	phase: "[data-phase]",
	scroll: "[data-conversation-scroll]",
	card: "[data-composer-card]",
	seat: "[data-composer-seat]",
	row: "[data-composer-card] > [class$=\"_row\"]",
	dock: "[data-slot=\"conversation.composer.dock\"]",
	footArea: "[class$=\"_footArea\"]",
	headerUtilities: "[class$=\"_headerUtilities\"]"
};
let selectorsChecked = false;
function assertSelectors() {
	if (selectorsChecked) return;
	selectorsChecked = true;
	for (const [key, sel] of Object.entries(SELECTORS)) if (!document.querySelector(sel)) console.warn(`[dsh-whale-skin] contract selector missing: ${key} = ${sel} (dsh UI changed?)`);
}
/** Refined terminal element styles injected via a <style> tag. */
const TERMINAL_CSS = [
	"*, *::before, *::after { border-radius: 0 !important; }",
	"[data-conversation-scroll] [class$=\"_column\"] { gap: 4px !important; }",
	"[data-conversation-scroll] [class$=\"_flowItem\"] { padding: 2px 0; }",
	"[data-conversation-scroll] [class$=\"_flowItem\"]:not([data-chat-flow-kind=\"user\"]):not([data-chat-flow-kind=\"steering\"]) { padding-left: 24px !important; }",
	"[data-conversation-scroll] [class$=\"_flowItem\"] + [class$=\"_flowItem\"] { border-top: 1px solid rgba(125, 161, 222, 0.15); }",
	"[class$=\"_bubble\"] { background: transparent !important; border: none !important; box-shadow: none !important; padding: 2px 0 !important; }",
	"[data-chat-flow-kind=\"user\"], [data-chat-flow-kind=\"steering\"] { position: relative; padding-left: 0 !important; }",
	"[data-chat-flow-kind=\"user\"]::before, [data-chat-flow-kind=\"steering\"]::before { content: \">\"; position: absolute; left: -16px; top: -4px; color: #7DA1DE; font-size: 40px; line-height: 1; font-weight: 1000; }",
	"[data-chat-flow-kind=\"user\"] [class$=\"_userRow\"], [data-chat-flow-kind=\"steering\"] [class$=\"_userRow\"] { align-items: stretch !important; }",
	"[data-chat-flow-kind=\"user\"] [class$=\"_userStack\"], [data-chat-flow-kind=\"steering\"] [class$=\"_userStack\"] { align-items: stretch !important; max-width: none !important; }",
	"[data-chat-flow-kind=\"user\"] [class$=\"_bubble\"], [data-chat-flow-kind=\"steering\"] [class$=\"_bubble\"] { width: calc(100% - 12px) !important; box-sizing: border-box; margin-left: 12px !important; background: rgba(125, 161, 222, 0.14) !important; padding: 6px 0 6px 12px !important; }",
	"[data-conversation-scroll] { padding-bottom: 8px !important; }",
	"[data-composer-seat] { position: static !important; background: none !important; }",
	"[data-composer-card] { border: none !important; background: rgba(125, 161, 222, 0.14) !important; background-clip: content-box !important; box-shadow: none !important; padding: 6px 0 6px 12px !important; max-width: var(--dsh-whale-input-width) !important; }",
	"[data-composer-card] [data-input-scroll] { max-height: none !important; overflow-y: visible !important; }",
	"textarea { caret-color: #7DA1DE !important; }",
	"[data-composer-card]::before { content: \">\"; position: absolute; left: -16px; top: 0; color: #7DA1DE; font-size: 40px; line-height: 1; font-weight: 1000; pointer-events: none; z-index: 1; }",
	"[class$=\"_grow\"] textarea, [class$=\"_grow\"] [class$=\"_backdrop\"], [class$=\"_grow\"] [class$=\"_mirror\"] { padding: 6px 12px !important; }",
	"#dsh-whale-bottombar { flex: none; background: var(--dsw-alias-bg-base); border-top: 1px solid rgba(125, 161, 222, 0.15); padding: 2px 32px 0; }",
	"#dsh-whale-bottombar [class$=\"_row\"] { position: static !important; background: none !important; max-width: var(--dsh-chat-content-width) !important; margin: 0 auto !important; padding: 2px 24px 4px !important; }",
	"#dsh-whale-bottombar [data-slot=\"conversation.composer.dock\"] { position: static !important; background: none !important; max-width: var(--dsh-chat-content-width) !important; margin: 0 auto !important; padding: 0 24px 4px !important; }",
	"[data-slot=\"conversation.composer.dock\"] > div { max-width: var(--dsh-chat-content-width) !important; padding: 0 !important; white-space: normal !important; text-overflow: clip !important; }",
	".dsh-whale-whale { display: inline-block; line-height: 0; }",
	".dsh-whale-whale-host { display: flex; justify-content: flex-start; padding: 12px 0 6px 12px; }",
	"#dsh-whale-width-toggle { display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 6px 12px; border: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-primary); background: transparent; font-size: 13px; line-height: 20px; cursor: pointer; white-space: nowrap; }",
	"#dsh-whale-width-toggle:hover { background: var(--dsw-alias-interactive-bg-hover); color: #7DA1DE; }",
	"[data-time-hover-root] :is([class$=\"_timeStart\"], [class$=\"_timeEnd\"]) { opacity: 1 !important; }",
	"[data-time-hover-root] [class$=\"_actions\"] { background: rgba(0, 0, 0, 0.04); padding: 0 10px; width: 100%; box-sizing: border-box; }",
	"body[data-ds-dark-theme] [data-time-hover-root] [class$=\"_actions\"] { background: rgba(255, 255, 255, 0.14); }",
	"[data-chat-flow-kind=\"user\"] [class$=\"_actions\"], [data-chat-flow-kind=\"steering\"] [class$=\"_actions\"], [data-pending-steering] [class$=\"_actions\"] { margin-left: 12px !important; width: calc(100% - 12px) !important; }",
	"[data-chat-flow-kind=\"user\"] [class$=\"_actions\"] > [class$=\"_timeStart\"], [data-chat-flow-kind=\"steering\"] [class$=\"_actions\"] > [class$=\"_timeStart\"], [data-pending-steering] [class$=\"_actions\"] > [class$=\"_timeStart\"] { order: 3; padding-right: 0; padding-left: 12px; }",
	"[data-turn-tail] { gap: 8px !important; background: rgba(0, 0, 0, 0.04) !important; padding: 6px 12px !important; margin-left: -12px !important; box-sizing: border-box; }",
	"body[data-ds-dark-theme] [data-turn-tail] { background: rgba(255, 255, 255, 0.14) !important; }",
	"[data-turn-tail] [class$=\"_actions\"] { background: transparent !important; padding: 0 !important; }",
	"[class$=\"_root\"]:has(> [data-produced-files-row]) { background: transparent !important; padding: 0 !important; margin-top: 0 !important; }",
	"[class$=\"_root\"]:has(> [data-produced-files-row]) [class$=\"_file\"] { background: transparent; border: 1px solid rgba(125, 161, 222, 0.35); color: var(--dsw-alias-label-secondary); padding: 0 8px; }",
	"[class$=\"_root\"]:has(> [data-produced-files-row]) [class$=\"_file\"]:hover { color: var(--dsw-alias-label-primary); }",
	"[data-pending-steering] { position: relative; align-items: stretch !important; }",
	"[data-pending-steering]::before { content: \">\"; position: absolute; left: -16px; top: -6px; color: #7DA1DE; font-size: 40px; line-height: 1; font-weight: 1000; }",
	"[data-pending-steering] [class$=\"_userStack\"] { align-items: stretch !important; max-width: none !important; }",
	"[data-pending-steering] [class$=\"_bubble\"] { width: calc(100% - 12px) !important; box-sizing: border-box; margin-left: 12px !important; background: rgba(125, 161, 222, 0.14) !important; padding: 6px 0 6px 12px !important; }",
	"[class$=\"_turnStatus\"] { margin-left: 24px !important; }",
	"[data-variant=\"think\"] [class$=\"_summary\"] { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
	"[data-variant=\"think\"] [class$=\"_thinkBody\"] { overflow-wrap: anywhere; }",
	"[data-conversation-scroll]::-webkit-scrollbar { width: 10px; height: 10px; }",
	"[data-conversation-scroll]::-webkit-scrollbar-thumb { background: #343945; border: 2px solid #22262E; }",
	"[data-conversation-scroll]::-webkit-scrollbar-thumb:hover { background: #454D59; }",
	"[data-conversation-scroll] a, [data-composer-card] a { color: #7DA1DE !important; }"
].map(scopeRule).join("\n");
function injectStyle() {
	if (document.getElementById("dsh-whale-skin-style")) return;
	const el = document.createElement("style");
	el.id = "dsh-whale-skin-style";
	el.textContent = TERMINAL_CSS;
	document.head.appendChild(el);
}
let bottomBar = null;
let observer = null;
function fixBottomBar() {
	const scroll = document.querySelector(SELECTORS.scroll);
	if (!scroll) return;
	if (!bottomBar || !document.body.contains(bottomBar)) {
		bottomBar = document.createElement("div");
		bottomBar.id = "dsh-whale-bottombar";
		scroll.insertAdjacentElement("afterend", bottomBar);
	}
	const seat = document.querySelector(SELECTORS.seat);
	if (!seat) return;
	const row = seat.querySelector(SELECTORS.row);
	if (row && row.parentNode !== bottomBar) bottomBar.insertBefore(row, bottomBar.firstChild);
	const dock = seat.querySelector(SELECTORS.dock);
	if (dock) {
		const hasContent = dock.children.length > 0 || (dock.textContent || "").trim() !== "";
		if (hasContent && dock.parentNode !== bottomBar) bottomBar.appendChild(dock);
		else if (!hasContent && dock.parentNode === bottomBar) seat.appendChild(dock);
	}
}
function startBottomBarWatch() {
	if (observer) return;
	let rafId = 0;
	const run = () => {
		rafId = 0;
		assertSelectors();
		fixBottomBar();
		applyWidthMode();
		injectWhale();
		injectWidthToggle();
	};
	observer = new MutationObserver(() => {
		if (rafId !== 0) return;
		rafId = requestAnimationFrame(run);
	});
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
	fixBottomBar();
}
let whalePending = false;
let whaleGaveUp = false;
let togglePending = false;
let toggleGaveUp = false;
let whaleFastTimer;
let whaleSlowTimer;
let toggleFastTimer;
let toggleSlowTimer;
function injectWhale() {
	if (document.getElementById("dsh-whale-whale-host")) return;
	if (whalePending || whaleGaveUp) return;
	const host = document.createElement("div");
	host.id = "dsh-whale-whale-host";
	host.className = "dsh-whale-whale-host";
	host.innerHTML = whaleHtml(5);
	const tryInject = () => {
		const foot = document.querySelector(SELECTORS.footArea);
		if (foot && foot.parentElement) {
			foot.parentElement.insertBefore(host, foot);
			whalePending = false;
			whaleGaveUp = false;
			return true;
		}
		return false;
	};
	if (!tryInject()) {
		whalePending = true;
		let tries = 0;
		whaleFastTimer = setInterval(() => {
			tries++;
			if (tryInject()) {
				clearInterval(whaleFastTimer);
				whaleFastTimer = void 0;
				return;
			}
			if (tries >= 40) {
				clearInterval(whaleFastTimer);
				whaleFastTimer = void 0;
				whalePending = false;
				whaleGaveUp = true;
				whaleSlowTimer = setInterval(() => {
					if (tryInject()) {
						clearInterval(whaleSlowTimer);
						whaleSlowTimer = void 0;
					}
				}, 5e3);
			}
		}, 500);
	}
}
const WIDTH_KEY = "dsh-whale-content-width:v1";
const WIDTH_KEY_LEGACY = "dsh-whale-content-width";
const WIDTH_CENTER = "748px";
const WIDTH_WIDE = "100%";
const INPUT_WIDE = "calc(100% - 32px)";
let widthModeCache = null;
function getStoredWidthMode() {
	if (widthModeCache !== null) return widthModeCache;
	try {
		let mode = localStorage.getItem(WIDTH_KEY);
		if (mode === null) {
			const legacy = localStorage.getItem(WIDTH_KEY_LEGACY);
			if (legacy === "wide" || legacy === "center") {
				mode = legacy;
				localStorage.setItem(WIDTH_KEY, mode);
			}
		}
		widthModeCache = mode === "wide" ? "wide" : "center";
	} catch {
		widthModeCache = "center";
	}
	return widthModeCache;
}
function setStoredWidthMode(mode) {
	widthModeCache = mode;
	try {
		localStorage.setItem(WIDTH_KEY, mode);
	} catch {}
}
function applyWidthMode() {
	const root = document.querySelector(SELECTORS.phase);
	if (!root) return;
	const mode = getStoredWidthMode();
	const el = root;
	el.style.setProperty("--dsh-chat-content-width", mode === "wide" ? WIDTH_WIDE : WIDTH_CENTER);
	el.style.setProperty("--dsh-whale-input-width", mode === "wide" ? INPUT_WIDE : WIDTH_CENTER);
}
function injectWidthToggle() {
	if (document.getElementById("dsh-whale-width-toggle")) return;
	if (togglePending || toggleGaveUp) return;
	const make = () => {
		const utils = document.querySelector(SELECTORS.headerUtilities);
		if (!utils) return false;
		const btn = document.createElement("button");
		btn.id = "dsh-whale-width-toggle";
		btn.title = "切换内容宽度：居中 / 占满";
		btn.textContent = getStoredWidthMode() === "wide" ? "居中" : "占满";
		btn.setAttribute("aria-pressed", getStoredWidthMode() === "wide" ? "true" : "false");
		btn.addEventListener("click", () => {
			const next = getStoredWidthMode() === "wide" ? "center" : "wide";
			setStoredWidthMode(next);
			btn.textContent = next === "wide" ? "居中" : "占满";
			btn.setAttribute("aria-pressed", next === "wide" ? "true" : "false");
			applyWidthMode();
		});
		utils.appendChild(btn);
		togglePending = false;
		toggleGaveUp = false;
		return true;
	};
	if (!make()) {
		togglePending = true;
		let tries = 0;
		toggleFastTimer = setInterval(() => {
			tries++;
			if (make()) {
				clearInterval(toggleFastTimer);
				toggleFastTimer = void 0;
				return;
			}
			if (tries >= 40) {
				togglePending = false;
				toggleGaveUp = true;
				clearInterval(toggleFastTimer);
				toggleFastTimer = void 0;
				toggleSlowTimer = setInterval(() => {
					if (make()) {
						clearInterval(toggleSlowTimer);
						toggleSlowTimer = void 0;
					}
				}, 5e3);
			}
		}, 500);
	}
}
function dispose() {
	if (observer) {
		observer.disconnect();
		observer = null;
	}
	if (whaleFastTimer) {
		clearInterval(whaleFastTimer);
		whaleFastTimer = void 0;
	}
	if (whaleSlowTimer) {
		clearInterval(whaleSlowTimer);
		whaleSlowTimer = void 0;
	}
	if (toggleFastTimer) {
		clearInterval(toggleFastTimer);
		toggleFastTimer = void 0;
	}
	if (toggleSlowTimer) {
		clearInterval(toggleSlowTimer);
		toggleSlowTimer = void 0;
	}
	document.getElementById("dsh-whale-skin-style")?.remove();
	document.getElementById("dsh-whale-whale-host")?.remove();
	document.getElementById("dsh-whale-width-toggle")?.remove();
	document.body.removeAttribute("data-skin");
}
function apply(_ctx) {
	document.body.setAttribute("data-skin", "whale");
	injectStyle();
	injectWhale();
	injectWidthToggle();
	applyWidthMode();
	startBottomBarWatch();
	return dispose;
}

//#endregion
exports.apply = apply;
exports.dispose = dispose;
exports.name = name;
return module.exports; } });
//# sourceMappingURL=client.js.map