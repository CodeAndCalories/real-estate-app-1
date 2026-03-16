/**
 * Deterministic, stable hash-based ID for a signal.
 * Uses FNV-1a 32-bit to produce an 8-character hex string.
 */
export function computeSignalId(address: string, city: string): string {
  const str = `${address}||${city}`
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}
