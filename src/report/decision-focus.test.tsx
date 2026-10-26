import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { calculateSaju } from '@orrery/core/saju'
import { getFourPillars, getRelation } from '@orrery/core/pillars'
import { buildDecisionFocus, buildPairDecisionFocus, decisionFocusText } from './decision-focus.ts'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCategoryReading } from './category-readings.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildPersonalPreview, personalPreviewText } from './personal-preview.ts'
import { plainReadingText } from './reading-text.ts'
import { THEME_FAMILY } from './theme-family.ts'
import DecisionFocusView from '../components/report/DecisionFocusView.tsx'

const kinds = ['complete', 'career', 'business', 'wellbeing', 'year'] as const
const charts = Array.from({ length: 180 }, (_, index) => calculateSaju({
  ...CATEGORY_SCENARIOS[index % 2].first,
  year: 1960 + Math.floor(index / 12), month: index % 12 + 1, day: index * 7 % 25 + 1,
}))
const a = calculateSaju(CATEGORY_SCENARIOS[0].first)
const b = calculateSaju(CATEGORY_SCENARIOS[0].second)

describe('A personal decision focus uses two themes and an observable next step', () => {
  it('changes the synthesis and review when the second theme changes with the same day style and main theme', () => {
    const one = charts.find(first => charts.some(second => second.pillars[1].pillar.stem === first.pillars[1].pillar.stem
      && second.pillars[2].stemSipsin === first.pillars[2].stemSipsin
      && THEME_FAMILY[second.pillars[2].branchSipsin] !== THEME_FAMILY[first.pillars[2].branchSipsin]))!
    expect(one).toBeDefined()
    const two = charts.find(second => second.pillars[1].pillar.stem === one.pillars[1].pillar.stem
      && second.pillars[2].stemSipsin === one.pillars[2].stemSipsin
      && THEME_FAMILY[second.pillars[2].branchSipsin] !== THEME_FAMILY[one.pillars[2].branchSipsin])!
    for (const kind of kinds.filter(kind => kind !== 'year')) {
      expect(buildDecisionFocus(kind, one).synthesis).not.toBe(buildDecisionFocus(kind, two).synthesis)
      expect(buildDecisionFocus(kind, one).review).not.toBe(buildDecisionFocus(kind, two).review)
    }
    const sameDrivers = new Map<string, ReturnType<typeof buildDecisionFocus>>()
    let matched = false
    for (const chart of charts) {
      const key = [chart.pillars[1].pillar.stem, chart.pillars[2].stemSipsin, chart.pillars[2].branchSipsin].join('|')
      const focus = buildDecisionFocus('career', chart)
      const previous = sameDrivers.get(key)
      if (previous) {
        expect(focus.headline).toBe(previous.headline)
        expect(focus.firstStep).toBe(previous.firstStep)
        expect(focus.review).toBe(previous.review)
        matched = true
      }
      sameDrivers.set(key, focus)
    }
    expect(matched).toBe(true)
  })

  it('keeps the action in the purchased subject and states the actual annual reference', () => {
    for (const chart of charts.slice(0, 60)) {
      const career = buildDecisionFocus('career', chart)
      const business = buildDecisionFocus('business', chart)
      const everyday = buildDecisionFocus('wellbeing', chart)
      expect(career.firstStep).not.toBe(business.firstStep)
      expect(career.firstStep + career.pauseIf).not.toMatch(/customer|offer.*sell|profit/i)
      expect(business.firstStep + business.pauseIf).toMatch(/customer|offer|delivery|tester/i)
      expect(everyday.firstStep + everyday.pauseIf).not.toMatch(/symptom|diagnos|medicine|supplement/i)
      const annual = buildDecisionFocus('year', chart, 2027)
      const pillar = getFourPillars(2027, 7, 15, 12, 0)[0]
      const god = getRelation(chart.pillars[1].pillar.stem, pillar[0])!.hanja
      expect(annual.evidence.join(' ')).toContain(pillar)
      expect(annual.evidence.join(' ')).toContain(god)
      expect(annual.evidence.join(' ')).toContain('12:00 Asia/Seoul')
      expect(annual).not.toEqual(buildDecisionFocus('year', chart, 2028))
    }
    expect(() => buildDecisionFocus('year', a)).toThrow(/valid reference year/)
  })

  it('keeps prose readable and chart jargon in the source notes', () => {
    for (const chart of charts) for (const kind of kinds) {
      const focus = buildDecisionFocus(kind, chart, 2027)
      for (const text of [focus.headline, focus.synthesis, focus.firstStep, focus.pauseIf, focus.review]) {
        expect(text.trim().length).toBeGreaterThan(10)
        expect(text).not.toMatch(/undefined|NaN|\[object Object\]|[\u3400-\u9fff]|principal|inner.stem/)
        expect(text.split(/\s+/).length).toBeLessThanOrEqual(85)
      }
    }
  })

  it('changes the joint conversation with the second person and keeps each person in the right role when swapped', () => {
    const forward = buildPairDecisionFocus(a, b)
    const reverse = buildPairDecisionFocus(b, a)
    expect(reverse.headline).toBe(forward.headline)
    expect(reverse.synthesis).not.toBe(forward.synthesis)
    expect(reverse.evidence[0]).toContain(b.pillars[1].pillar.ganzi)
    expect(reverse.evidence[1]).toContain(a.pillars[1].pillar.ganzi)
    const other = charts.find(chart => buildPairDecisionFocus(a, chart).headline !== forward.headline)!
    expect(other).toBeDefined()
    expect(buildPairDecisionFocus(a, other).firstStep).not.toBe(forward.firstStep)
    const same = buildPairDecisionFocus(a, a)
    expect(same.synthesis).toContain('two people free to want different things')
    expect(same.headline).not.toMatch(/perfect|soulmate|score/i)
  })

  it('does not use an unknown entered hour to change the decision focus', () => {
    const one = calculateSaju({ ...a.input, unknownTime: true, hour: 1, minute: 0 })
    const two = calculateSaju({ ...a.input, unknownTime: true, hour: 22, minute: 59 })
    for (const kind of kinds) expect(buildDecisionFocus(kind, one, 2027)).toEqual(buildDecisionFocus(kind, two, 2027))
    expect(buildPairDecisionFocus(one, b)).toEqual(buildPairDecisionFocus(two, b))
  })

  it('uses the same focus in the full report, preview, public markup and saved text', () => {
    for (const kind of [...kinds, 'compatibility'] as const) {
      const report = kind === 'complete' ? buildCompleteReading(a, 2026) : buildCategoryReading(kind, a, { second: b, year: 2027 })
      const preview = buildPersonalPreview(kind, { first: a.input, second: b.input, year: 2027 })
      expect(preview.brief!.focus).toEqual(report.focus)
      const expected = plainReadingText(decisionFocusText(report.focus))
      expect(report.fullText).toContain('Your reading at a glance')
      expect(report.fullText).toContain(plainReadingText(report.focus.headline))
      expect(report.fullText).toContain(plainReadingText(report.focus.synthesis))
      for(const fact of report.focus.evidence)expect(report.fullText).toContain(fact)
      expect(personalPreviewText(preview)).toContain(expected)
      const html = renderToStaticMarkup(<DecisionFocusView focus={report.focus} />)
      expect(html).toContain('Pause and clarify if')
      expect(html).toContain('Review after the attempt')
      expect(html).toContain('<details')
      expect(html).toContain(report.focus.firstStep)
    }
  })
})

describe('Each chapter adds a different practical check', () => {
  it('gives each main chapter its own practical point and meaningful cautions', () => {
    for (const chart of charts.slice(0, 60)) {
      const reports = [buildCompleteReading(chart, 2026), ...['career', 'business', 'wellbeing', 'year', 'compatibility'].map(kind => buildCategoryReading(kind as 'career' | 'business' | 'wellbeing' | 'year' | 'compatibility', chart, { second: b, year: 2027 }))]
      for (const report of reports) {
        const sections = 'months' in report ? [...report.chapters, ...report.months] : report.chapters
        const bullets = sections.flatMap(chapter => [...chapter.guidance.keepClose, ...chapter.guidance.watchFor])
        expect(new Set(report.chapters.map(chapter => chapter.tryThis)).size, report.title).toBe(report.chapters.length)
        expect(bullets.every(item => item.length > 10)).toBe(true)
      }
    }
  },15000)
})
