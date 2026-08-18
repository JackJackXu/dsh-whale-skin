/**
 * whale.ts — pixel whale sprite (user-drawn 16x16, typed in directly).
 *
 * 16 rows of characters; palette: K=black outline/water, B=bright blue body,
 * L=light belly, W=white mouth, .=white background (not transparent — the
 * whale renders as a solid white tile, see PALETTE).
 * Source (user text): A=transparent, B=black, C=blue, D=light blue.
 */
export declare const SPRITE: readonly string[];
/** Render the whale as an HTML block of colored cells. */
export declare function whaleHtml(scale?: number): string;
