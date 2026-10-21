import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { calculateSaju } from '@orrery/core/saju'
import { STEMS } from './reading.ts'
import { ELEMENT_SYMBOLS } from './report-extras.ts'
import { PREVIEW_KINDS } from './personal-products.ts'
import { buildDestinyCard, destinyCardCount, destinyShareText, DESTINY_SHARE_URL } from './destiny-card.ts'
import DestinyCardArtwork from '../components/report/DestinyCardArtwork.tsx'
import DestinyCardPreview from '../components/report/DestinyCardPreview.tsx'
import DestinyCardStudio from '../components/DestinyCardStudio.tsx'
import { resolveReportRoute } from '../utils/report-route.ts'

// The app is client-rendered; use the real English dictionary in static-markup checks.
vi.mock('../i18n/index.ts', async importOriginal => {
  const actual = await importOriginal<typeof import('../i18n/index.ts')>()
  return { ...actual, useLocale: () => ({ locale: 'en', t: (key: string) => actual.t('en', key) }) }
})

const birth = { year: 1998, month: 3, day: 25, hour: 3, minute: 0, gender: 'M' as const, timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 }

describe('Destiny Card identity, privacy and purchase boundaries', () => {
  it('uses the report’s actual day symbol and traditional number pairs across all ten stems', () => {
    const seen = new Set<string>()
    for (let day = 1; day <= 28; day++) {
      const input = { ...birth, day }
      const stem = calculateSaju(input).pillars[1].pillar.stem
      const card = buildDestinyCard(input)
      seen.add(stem)
      expect(card.stem).toBe(stem)
      expect(card.daySymbol).toBe(STEMS[stem].name)
      expect(card.element).toBe(STEMS[stem].element)
      expect(card.numbers).toEqual(ELEMENT_SYMBOLS[card.element].numbers)
      expect(card.colors).toEqual(ELEMENT_SYMBOLS[card.element].colors)
      expect(card.sentence.length).toBeGreaterThan(15)
      expect(card.title).not.toMatch(/undefined|score|guarantee/i)
    }
    expect(seen.size).toBe(10)
  })

  it('shares the full illustrated artwork while keeping public and issued labels distinct', () => {
    const card = buildDestinyCard(birth, 'Minji')
    const labels = { personal: 'MY PERSONAL KEY', element: 'ELEMENT', numbers: 'MY NUMBERS', colour: 'MY COLOUR', watermark: 'SANDBOX EDITION' }
    const issued = renderToStaticMarkup(<DestinyCardArtwork card={card} id="issued" labels={labels} preview={false} artworkHref="data:image/png;base64,example" />)
    expect(issued).toContain('viewBox="0 0 1080 1350"')
    expect(issued).toContain('Minji')
    expect(issued).toContain(card.title)
    expect(issued).toContain('data:image/png;base64,example')
    expect(issued).not.toContain('rotate(-25 540 590)')
    expect(issued).not.toContain('fate-card-celestial-effects')
    const preview = renderToStaticMarkup(<DestinyCardPreview card={card} />)
    expect(preview).toContain('rotate(-25 540 590)')
    expect(preview).toContain('PERSONAL PREVIEW')
    expect(preview).toContain('fate-card-border-light')
    expect(preview).toContain('fate-card-star')
    expect(preview).toContain('aria-pressed="true"')
  })

  it('keeps birth details hidden until a person explicitly chooses birthday display', () => {
    const hidden = buildDestinyCard(birth, 'Alex')
    expect(hidden).not.toHaveProperty('birthDate')
    expect(JSON.stringify(hidden)).not.toMatch(/1998|New_York|latitude|longitude|hour|minute|timezone/)
    const shown = buildDestinyCard(birth, 'Alex', true)
    expect(shown.birthDate).toBe('25 MARCH 1998')
    expect(Object.keys(shown).filter(key => !(key in hidden))).toEqual(['birthDate'])
    expect(destinyShareText()).toContain(DESTINY_SHARE_URL)
    expect(DESTINY_SHARE_URL).not.toMatch(/\?|1998|Alex|New_York/)
  })

  it('keeps unknown-time placeholders and display names out of the chart calculation', () => {
    expect(buildDestinyCard({ ...birth, unknownTime: true, hour: 1, minute: 0 })).toEqual(buildDestinyCard({ ...birth, unknownTime: true, hour: 23, minute: 59 }))
    const card = buildDestinyCard(birth, '  Alex\n\u202etest  ')
    expect(card.displayName).toBe('Alextest')
    expect(Array.from(buildDestinyCard(birth, '🌙'.repeat(40)).displayName)).toHaveLength(24)
    const malicious = renderToStaticMarkup(<DestinyCardPreview card={buildDestinyCard(birth, '<script>alert(1)</script>')} />)
    expect(malicious).toContain('&lt;script&gt;')
    expect(malicious).not.toContain('<script>')
  })

  it('counts a compatibility or bundle card per person, not per report chapter or product', () => {
    for (const kind of PREVIEW_KINDS) expect(destinyCardCount(kind)).toBe(kind === 'compatibility' || kind === 'bundle' ? 2 : 1)
  })

  it('marks personal previews and offers no personal export or client payment unlock', () => {
    const html = renderToStaticMarkup(<DestinyCardStudio input={birth} />)
    expect(html).toContain('PERSONAL PREVIEW · NOT ISSUED')
    expect(html).toContain('Checkout is not open yet')
    expect(html).not.toContain('download=')
    expect(html).not.toMatch(/25 MARCH 1998|checked=""|paid=true|receipt|orderId/)
    expect(html).toContain('Show my birth date')
  })

  it('offers genuine public image and MP4 samples, clearly distinguished from a customer result', () => {
    const html = renderToStaticMarkup(<DestinyCardStudio input={null} />)
    expect(html).toContain('Design-Sample.png')
    expect(html).toContain('Design-Sample.mp4')
    expect(html).toContain('public promotional samples')
    expect(resolveReportRoute('#card-studio')).toBe('card-studio')
    expect(resolveReportRoute('#destiny-card')).toBe('home')
  })
})
