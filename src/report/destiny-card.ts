import type { BirthInput } from '@orrery/core/types'
import { calculateSaju } from '@orrery/core/saju'
import { STEMS } from './reading.ts'
import type { ReadingElement } from './reading.ts'
import { PERSONAL_PROFILES } from './reading-profiles.ts'
import { ELEMENT_SYMBOLS } from './report-extras.ts'
import type { PreviewKind } from './personal-products.ts'

export const DESTINY_SHARE_URL = 'https://thefatekey.com/#destiny-card'
export const DESTINY_SAMPLE_IMAGE = '/images/cards/the-fate-key-sample.png'
export const DESTINY_SAMPLE_POSTER = '/images/cards/the-fate-key-sample.webp'
export const DESTINY_SAMPLE_VIDEO = '/media/cards/the-fate-key-sample.mp4'

const KEY_TITLES: Record<string, string> = {
  '甲': 'The Steady Grower', '乙': 'The Gentle Pathfinder',
  '丙': 'The Warm Spark', '丁': 'The Thoughtful Light',
  '戊': 'The Steady Anchor', '己': 'The Quiet Builder',
  '庚': 'The Clear Compass', '辛': 'The Careful Refiner',
  '壬': 'The Open Explorer', '癸': 'The Quiet Observer',
}

export interface DestinyCardData {
  displayName: string
  title: string
  sentence: string
  stem: string
  daySymbol: string
  element: ReadingElement
  numbers: [number, number]
  colors: { name: string; hex: string }[]
  birthDate?: string
}

/** The bundle contains two subjects, not one new card per included report. */
export function destinyCardCount(kind: PreviewKind): 1 | 2 {
  return kind === 'compatibility' || kind === 'bundle' ? 2 : 1
}

/** Presentation only. This does not grant a paid entitlement or create an order. */
export function buildDestinyCard(input: BirthInput, name = '', showBirthday = false): DestinyCardData {
  const chart = calculateSaju(input)
  const stem = chart.pillars[1].pillar.stem
  const symbol = STEMS[stem]
  if (!symbol || !KEY_TITLES[stem]) throw new Error('A valid birth-day symbol is needed')
  const palette = ELEMENT_SYMBOLS[symbol.element]
  // Never include a time, place, timezone or hidden birth date in the card model.
  const visibleName = Array.from(name).filter(character => {
    const code = character.codePointAt(0)!
    return code >= 32 && (code < 127 || code > 159) && (code < 0x202a || code > 0x202e) && (code < 0x2066 || code > 0x2069)
  }).join('')
  const cleanName = Array.from(visibleName.trim()).slice(0, 24).join('')
  const card: DestinyCardData = {
    displayName: cleanName || 'Your Personal Key',
    title: KEY_TITLES[stem], sentence: PERSONAL_PROFILES[stem].headline,
    stem, daySymbol: symbol.name, element: symbol.element,
    numbers: [...palette.numbers], colors: palette.colors.map(color => ({ ...color })),
  }
  if (showBirthday) card.birthDate = `${input.day} ${['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'][input.month - 1]} ${input.year}`
  return card
}

/** A public campaign caption. Personal draft details never enter a shared URL. */
export function destinyShareText(): string {
  return `What would your personal key look like? ✨\nExplore your Saju story with The Fate Key. A Destiny Card is planned with every paid report at launch.\n${DESTINY_SHARE_URL}\n#TheFateKey #DestinyCard #Saju`
}

export function cardTextLines(text: string, width = 31): string[] {
  const lines: string[] = []
  for (const word of text.split(/\s+/)) {
    const last = lines.length - 1
    if (last >= 0 && lines[last].length + word.length + 1 <= width) lines[last] += ' ' + word
    else lines.push(word)
  }
  return lines
}
