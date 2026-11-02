import type { ReadingElement } from './reading.ts'

export const ELEMENT_SYMBOLS: Record<ReadingElement, { colors: { name: string; hex: string }[]; numbers: [number, number] }> = {
  Wood: { colors: [{ name: 'Blue-green', hex: '#28796c' }, { name: 'Leaf green', hex: '#75965a' }], numbers: [3, 8] },
  Fire: { colors: [{ name: 'Red', hex: '#b7463e' }, { name: 'Warm coral', hex: '#d78064' }], numbers: [2, 7] },
  Earth: { colors: [{ name: 'Yellow', hex: '#d4ad45' }, { name: 'Sand', hex: '#d7c3a0' }], numbers: [5, 10] },
  Metal: { colors: [{ name: 'White', hex: '#fffdf7' }, { name: 'Soft silver', hex: '#bbc4c9' }], numbers: [4, 9] },
  Water: { colors: [{ name: 'Black', hex: '#252b34' }, { name: 'Deep navy', hex: '#203d60' }], numbers: [1, 6] },
}

export const SYMBOL_NOTE = 'These colours and numbers are traditional symbols for your birth-day element. Use them as personal reminders. They do not change the odds of an event or promise a result.'
