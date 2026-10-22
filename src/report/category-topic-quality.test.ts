import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { analyzePillarRelations, getFourPillars, getJeonggi, getRelation } from '@orrery/core/pillars'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCategoryReading } from './category-readings.ts'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { LIFE_FOCUS, CLOSENESS_PROMPTS } from './reading-scenarios.ts'
import { FOCUS_WORK } from './category-profiles.ts'
import { RELATIONSHIP_PROFILES } from './reading-profiles.ts'
import { moneyTiming } from './category-shared.ts'

const charts = Array.from({ length: 30 }, (_, index) => calculateSaju({ ...CATEGORY_SCENARIOS[index % 2].first, year: 1960 + index, month: index % 12 + 1, day: index % 20 + 5 }))

describe('Each focused report answers the question its buyer chose', () => {
  it('ties the five-year money window and monthly money references to calculated symbols', () => {
    for (const chart of charts.slice(0, 12)) {
      const day = chart.pillars[1].pillar.stem
      const windows = moneyTiming(chart, 2026)
      expect(windows.map(item => item.year)).toEqual([2026, 2027, 2028, 2029, 2030])
      for (const window of windows) {
        const annual = getFourPillars(window.year, 7, 15, 12, 0)[0]
        const gods = [annual[0], getJeonggi(annual[1])].map(stem => getRelation(day, stem)!.hanja)
        expect(window.pillar).toBe(annual)
        expect(window.money).toEqual([...new Set(gods.filter(god => god === '正財' || god === '偏財'))])
      }
      const report = buildCategoryReading('year', chart, { year: 2027 })
      for (const month of report.months) {
        const gods = [month.pillar[0], getJeonggi(month.pillar[1])].map(stem => getRelation(day, stem)!.hanja)
        const hasMoney = gods.some(god => god === '正財' || god === '偏財')
        expect(report.summary[1].text.includes(month.label)).toBe(hasMoney)
      }
    }
  })

  it('explains the actual birth-month interaction for both people', () => {
    for (let index = 0; index < 12; index++) {
      const first = charts[index], second = charts[index + 7]
      const reading = buildCategoryReading('compatibility', first, { second, year: 2026 })
      const pair = analyzePillarRelations(first.pillars[2].pillar.ganzi, second.pillars[2].pillar.ganzi)
      const clash = [...pair.stem, ...pair.branch].some(item => item.type === '沖')
      const combine = [...pair.stem, ...pair.branch].some(item => item.type === '合')
      const daily = reading.summary[2].text
      expect(daily.includes('show a clash')).toBe(clash)
      if (!clash) expect(daily.includes('show a combination')).toBe(combine)
      expect(reading.chapters.find(chapter => chapter.id === 'shared-routine')!.evidence.join(' ')).toContain('Birth-month comparison')
    }
  })
  it('keeps career money questions about pay, hours and the role rather than customers', () => {
    for (const chart of charts) {
      const report = buildCategoryReading('career', chart, { year: 2026 })
      const god = chart.pillars[2].stemSipsin
      const money = report.chapters.find(chapter => chapter.id === 'money-commitments')!
      const text = money.paragraphs.join(' ')
      expect(text).toContain(LIFE_FOCUS[god].payQuestion)
      expect(text).toContain('expected hours')
      expect(text).toContain('necessary costs')
      expect(report.extras.questions[3].answer).not.toContain(FOCUS_WORK[god].customer)
      expect(report.extras.questions[3].answer).toContain('confirmed pay')
      expect(money.evidence.join(' ')).toContain(chart.pillars[2].stemSipsin)
    }
  })

  it('keeps business customer guidance about delivery, scope and communication', () => {
    for (const chart of charts) {
      const report = buildCategoryReading('business', chart, { year: 2026 })
      const chapter = report.chapters.find(item => item.id === 'customer-communication')!
      const text = [...chapter.paragraphs, ...chapter.guidance.keepClose, ...chapter.guidance.watchFor].join(' ')
      expect(text).toContain('customer')
      expect(text).toContain('deadline')
      expect(text).toContain('revision')
      expect(chapter.icon).not.toBe('love')
      for (const romanticCaution of RELATIONSHIP_PROFILES[chart.pillars[1].pillar.branch].watchFor) expect(chapter.guidance.watchFor).not.toContain(romanticCaution)
    }
  })

  it('gives annual readers personal-life prompts as well as work themes', () => {
    for (const chart of charts.slice(0, 12)) for (const year of [2027, 2028]) {
      const report = buildCategoryReading('year', chart, { year })
      const guide = [...report.extras.questions.map(item => item.answer), ...report.extras.experiment.steps].join(' ')
      expect(guide).not.toMatch(/customer|portfolio|interview/i)
      expect(report.chapters[0].paragraphs.join(' ')).toContain('personal plan')
      expect(report.chapters.find(item => item.id === 'annual-plan')!.paragraphs.join(' ')).toContain('What will I begin?')
      expect(report.chapters.find(item => item.id === 'annual-connections')!.paragraphs.join(' ')).toContain(RELATIONSHIP_PROFILES[chart.pillars[1].pillar.branch].need)
      for (const month of report.months) {
        expect(month.paragraphs.some(text => text.startsWith('**Outside work:**'))).toBe(true)
        expect(month.paragraphs.some(text => text.startsWith("**Review this month's attempt:**"))).toBe(true)
      }
      expect(new Set(report.months.map(month => month.tryThis)).size).toBe(12)
    }
  })

  it('uses each person’s relationship theme for actual closeness examples', () => {
    for (let index = 0; index < charts.length; index++) {
      const a = charts[index]
      const b = charts[(index + 7) % charts.length]
      const pair = buildCategoryReading('compatibility', a, { second: b, year: 2026 })
      const conversation = pair.chapters.find(item => item.id === 'close-conversation')!
      const aPrompt = CLOSENESS_PROMPTS[a.pillars[1].pillar.branch]
      const bPrompt = CLOSENESS_PROMPTS[b.pillars[1].pillar.branch]
      expect(conversation.paragraphs.find(text => text.startsWith('**An idea to try with Person A:**'))).toContain(aPrompt)
      expect(conversation.paragraphs.find(text => text.startsWith('**An idea to try with Person B:**'))).toContain(bPrompt)
      expect(buildCompleteReading(a, 2026).chapters.find(item => item.id === 'love')!.paragraphs.join(' ')).toContain(aPrompt)
    }
  })
})
