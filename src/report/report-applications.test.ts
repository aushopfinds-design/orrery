import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCategoryReading } from './category-readings.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildPersonalPreview, personalPreviewText } from './personal-preview.ts'
import { applicationText, buildReportApplications } from './report-applications.ts'
import { plainReadingText } from './reading-text.ts'
import type { ApplicationKind } from './situation-cases.ts'

const kinds: ApplicationKind[] = ['complete', 'career', 'business', 'compatibility', 'year', 'wellbeing']
const first = calculateSaju(CATEGORY_SCENARIOS[0].first)
const second = calculateSaju(CATEGORY_SCENARIOS[0].second)
const charts = Array.from({ length: 180 }, (_, index) => calculateSaju({
  ...CATEGORY_SCENARIOS[index % 2].first,
  year: 1960 + Math.floor(index / 12), month: index % 12 + 1, day: index * 7 % 25 + 1,
}))
const practicalFields = (item: ReturnType<typeof buildReportApplications>[number]) => [
  item.scene, item.question, ...item.choices.flatMap(choice => [choice.title, choice.when, choice.tradeoff]),
  item.say, ...item.steps, ...item.record, item.keep, item.adjust, item.doesNotFit,
  ...item.pattern.connections, item.pattern.question,
]

describe('Situation guides provide choices that a reader can actually review', () => {
  it('gives each category three distinct situations, two trade-offs and observable review criteria', () => {
    const allTitles = new Set<string>()
    for (const kind of kinds) {
      const items = buildReportApplications(kind, first, { second, year: 2027 })
      expect(items).toHaveLength(3)
      expect(new Set(items.map(item => item.id)).size).toBe(3)
      expect(new Set(items.map(item => item.say)).size).toBe(3)
      expect(new Set(items.flatMap(item => item.pattern.connections)).size).toBe(6)
      for (const item of items) {
        allTitles.add(item.title)
        expect(item.kind).toBe(kind)
        expect(item.scene).toMatch(/^If /)
        expect(item.choices).toHaveLength(2)
        expect(item.choices[0].title).not.toBe(item.choices[1].title)
        for (const choice of item.choices) {
          expect(choice.when.length).toBeGreaterThan(25)
          expect(choice.tradeoff.length).toBeGreaterThan(35)
        }
        expect(item.steps).toHaveLength(3)
        expect(item.record).toHaveLength(3)
        expect(item.keep).not.toBe(item.adjust)
        expect(item.doesNotFit.length).toBeGreaterThan(60)
        expect(applicationText(item)).not.toMatch(/undefined|NaN|\[object Object\]|\*\*/)
      }
    }
    expect(allTitles.size).toBe(18)
  })

  it('keeps the practical text plain and does not introduce fate claims or technical chart jargon', () => {
    for (const chart of charts.slice(0, 30)) for (const kind of kinds) {
      for (const item of buildReportApplications(kind, chart, { second, year: 2027 })) {
        for (const field of practicalFields(item)) {
          const text = plainReadingText(field)
          expect(text.split(/\s+/).length, `${kind}: ${text}`).toBeLessThanOrEqual(85)
          expect(text).not.toMatch(/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]|day.master strength|useful element|destined|guaranteed outcome/i)
        }
      }
    }
  })

  it('changes the substantive personal connections across supplied birth charts, not just the source labels', () => {
    const other = calculateSaju(CATEGORY_SCENARIOS[1].first)
    for (const kind of kinds) {
      const a = buildReportApplications(kind, first, { second, year: 2027 })
      const b = buildReportApplications(kind, other, { second, year: 2027 })
      expect(a.map(item => item.pattern.connections)).not.toEqual(b.map(item => item.pattern.connections))
      expect(a.map(item => item.steps)).not.toEqual(b.map(item => item.steps))
      expect(a[0].pattern.facts.join(' ')).toContain(first.pillars[1].pillar.ganzi)
      expect(b[0].pattern.facts.join(' ')).toContain(other.pillars[1].pillar.ganzi)
    }
  })

  it('uses the second birth-month theme where it matters and preserves consistent interpretations for shared drivers', () => {
    const groups = new Map<string, typeof charts>()
    for (const chart of charts) {
      const key = `${chart.pillars[1].pillar.stem}:${chart.pillars[2].stemSipsin}`
      groups.set(key, [...groups.get(key) ?? [], chart])
    }
    const group = [...groups.values()].find(items => new Set(items.map(item => item.pillars[2].branchSipsin)).size > 1)!
    expect(group).toBeDefined()
    const a = group[0]
    const b = group.find(chart => chart.pillars[2].branchSipsin !== a.pillars[2].branchSipsin)!
    expect(buildReportApplications('career', a)[2].pattern.connections).not.toEqual(buildReportApplications('career', b)[2].pattern.connections)
    const sameGroups = new Map<string, typeof charts>()
    for (const chart of charts) {
      const key = `${chart.pillars[1].pillar.stem}:${chart.pillars[2].stemSipsin}:${chart.pillars[2].branchSipsin}`
      sameGroups.set(key, [...sameGroups.get(key) ?? [], chart])
    }
    const same = [...sameGroups.values()].find(items => items.length > 1)!
    expect(same).toBeDefined()
    const one = buildReportApplications('career', same[0])[0].pattern
    const two = buildReportApplications('career', same[1])[0].pattern
    expect(one.themes).toEqual(two.themes)
    expect(one.connections).toEqual(two.connections)
    expect(one.question).toBe(two.question)
  })

  it('keeps both actual people in relationship guides and reverses their needs when swapped', () => {
    expect(() => buildReportApplications('compatibility', first)).toThrow(/Two birth charts/)
    const ab = buildReportApplications('compatibility', first, { second })
    const ba = buildReportApplications('compatibility', second, { second: first })
    expect(ab[0].say).toContain('Person A: “Could you listen first, then ask whether I would like a suggestion?”')
    expect(ab[0].say).not.toContain('Would you like help with a solution')
    for (let i = 0; i < ab.length; i++) {
      expect(ab[i].pattern.themes[0].text).toBe(ba[i].pattern.themes[1].text)
      expect(ab[i].pattern.themes[1].text).toBe(ba[i].pattern.themes[0].text)
      expect(ab[i].pattern.facts.join(' ')).toContain(`Person A: birth-day pillar ${first.pillars[1].pillar.ganzi}`)
      expect(ab[i].pattern.facts.join(' ')).toContain(`Person B: birth-day pillar ${second.pillars[1].pillar.ganzi}`)
    }
  })

  it('uses the selected annual reference and changes planning content beyond the year heading', () => {
    const a = buildReportApplications('year', first, { year: 2027 })
    const b = buildReportApplications('year', first, { year: 2028 })
    expect(a.map(item => item.pattern.themes.map(theme => theme.text))).not.toEqual(b.map(item => item.pattern.themes.map(theme => theme.text)))
    expect(a.map(item => item.pattern.connections)).not.toEqual(b.map(item => item.pattern.connections))
    for (const item of a) expect(item.pattern.facts.join(' ')).toContain('2027-07-15')
    for (const year of [1899, 1997, 2101, 2027.5]) expect(() => buildReportApplications('year', first, { year })).toThrow(/valid year/)
  })

  it('does not use a guessed hour in any situation plan', () => {
    const unknown = calculateSaju({ ...CATEGORY_SCENARIOS[0].first, unknownTime: true, hour: 0, minute: 0 })
    const changed = { ...unknown, pillars: [...unknown.pillars] as typeof unknown.pillars }
    changed.pillars[0] = second.pillars[0]
    for (const kind of kinds) expect(buildReportApplications(kind, changed, { second, year: 2027 })).toEqual(buildReportApplications(kind, unknown, { second, year: 2027 }))
  })

  it('keeps work, customers, relationships and yearly planning in their purchased subject areas', () => {
    for (const chart of charts.slice(0, 20)) for (const kind of kinds) {
      const items = buildReportApplications(kind, chart, { second, year: 2027 })
      const text = items.flatMap(practicalFields).join(' ')
      if (kind === 'career') expect(text).not.toMatch(/customer|profit margin|romantic|marriage/i)
      if (kind === 'business') expect(text).toMatch(/customer|delivery/i)
      if (kind === 'compatibility') expect(text).not.toMatch(/customer|manager|salary|portfolio/i)
      if (kind === 'year') expect(text).not.toMatch(/customer|portfolio|revenue|interview/i)
      if (kind === 'wellbeing') expect(text).not.toMatch(/diagnose|treatment plan|cure|supplement/i)
    }
  })

  it('includes the same situation content in full reports, previews and copy, with the right bundle subjects', () => {
    for (const kind of kinds) {
      const draft = { first: CATEGORY_SCENARIOS[0].first, second: CATEGORY_SCENARIOS[0].second, year: 2027 }
      const preview = buildPersonalPreview(kind, draft)
      const full = kind === 'complete' ? buildCompleteReading(first) : buildCategoryReading(kind, first, { second, year: 2027 })
      expect(preview.applications).toEqual(full.applications)
      const text = personalPreviewText(preview)
      for (const item of preview.applications) {
        expect(text).toContain(applicationText(item))
        expect(full.fullText).toContain(applicationText(item))
      }
    }
    const bundle = buildPersonalPreview('bundle', { first: CATEGORY_SCENARIOS[0].first, second: CATEGORY_SCENARIOS[0].second, year: 2028 })
    expect(bundle.applications).toEqual([])
    expect(bundle.excerpts).toHaveLength(3)
    expect(buildPersonalPreview('bundle', { first: CATEGORY_SCENARIOS[0].first }).applications).toEqual([])
  })
})
