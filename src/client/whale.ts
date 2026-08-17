/**
 * whale.ts — pixel whale sprite (user-drawn 16x16, typed in directly).
 *
 * 16 rows of characters; palette: K=black outline/water, B=bright blue body,
 * L=light belly, W=white mouth, .=transparent.
 * Source (user text): A=transparent, B=black, C=blue, D=light blue.
 */

export const SPRITE: readonly string[] = [
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
  'KBBBBBBBBBBBBBK.',
  'KB.....BBBBKBBK.',
  'KL......LKBBKBK.',
  '.KLLLLLLLKKBBK..',
  '..KKKKKKK..KK...',
]

const PALETTE: Record<string, string> = {
  K: '#000000',
  B: '#0000FF',
  L: '#99CAFF',
  W: '#FFFFFF',
}

/** Render the whale as an HTML block of colored cells. */
export function whaleHtml(scale = 4): string {
  const cell = String(scale) + 'px'
  const rows = SPRITE.map(row =>
    '<div style="display:flex;height:' + cell + '">' +
    row.split('').map(ch => {
      const c = PALETTE[ch]
      return '<span style="display:inline-block;width:' + cell + ';height:' + cell +
        (c ? ';background:' + c : '') + '"></span>'
    }).join('') +
    '</div>',
  ).join('')
  return '<div class="dsh-terminal-whale" style="display:inline-block;line-height:0">' + rows + '</div>'
}
