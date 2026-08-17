/**
 * dsh-terminal-skin — host half.
 *
 * The host side is intentionally a no-op loader entry: the whole feature
 * lives in the browser half (`./client`), which DSH's dsh-client-modules
 * picks up through the package's `dsh.client` declaration — the same shape
 * as the shipped ui-* packages.
 */
export const name = 'terminal-skin';
/** Host loader entry; no host-side behaviour. */
export function apply() {
    // The browser half registers the skin, injects the pixel whale and the
    // terminal element styles.
}
