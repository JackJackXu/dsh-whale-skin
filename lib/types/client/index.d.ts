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
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
export declare const name = "terminal-skin";
export declare function apply(ctx: ClientContext): void;
