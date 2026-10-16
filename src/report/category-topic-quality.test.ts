import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCategoryReading } from './category-readings.ts'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { LIFE_FOCUS, CLOSENESS_PROMPTS } from './reading-scenarios.ts'
import { FOCUS_WORK } from './category-profiles.ts'
import { RELATIONSHIP_PROFILES } from './reading-profiles.ts'

const charts = Array.from({ length: 30 }, (_, index) => calculateSaju({ ...CATEGORY_SCENARIOS[index % 2].first, year: 1960 + index, month: index % 12 + 1, day: index % 20 + 5 }))

describe('Each focused report answers the question its buyer chose', () => {
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
