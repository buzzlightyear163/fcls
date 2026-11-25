/** Seedad slump (mulberry32) så att mockdata blir samma vid varje laddning */
export function seeded(seed: string | number) {
  let h = typeof seed === 'number' ? seed : 0
  if (typeof seed === 'string') for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i)
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
export function fakeAddress(rnd: () => number, len = 44) {
  let s = ''
  for (let i = 0; i < len; i++) s += B58[Math.floor(rnd() * B58.length)]
  return s
}

/** Brustecken för scramble-effekten (samma uppsättning som referensen) */
const NOISE = '▓▒░█<>/\\|_#$%&*+=?01'
export const noiseChar = () => NOISE.charAt(Math.floor(Math.random() * NOISE.length))
