import type { SajuResult } from '@orrery/core/types'
import type { FocusCategory } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCompatibilityReading } from './compatibility-reading.ts'
import { buildCareerReading, buildBusinessReading } from './work-focus-readings.ts'
import { buildYearAheadReading } from './year-ahead-reading.ts'
import { buildBalanceReading } from './balance-reading.ts'
import { getFourPillars, getRelation, getJeonggi } from '@orrery/core/pillars'
import { PERSONAL_PROFILES, RELATIONSHIP_PROFILES, WORK_PROFILES } from './reading-profiles.ts'
import { PAIR_LENSES } from './category-profiles.ts'
import { plainReadingText } from './reading-text.ts'

export { buildCompatibilityReading, buildCareerReading, buildBusinessReading, buildYearAheadReading, buildBalanceReading }
export function buildCategoryReading(kind: FocusCategory, first: SajuResult, options: { second?: SajuResult; year?: number } = {}) {
  const year = options.year ?? new Date().getFullYear()
  switch (kind) {
    case 'compatibility':
      if (!options.second) throw new Error('Two birth charts are needed for compatibility')
      return buildCompatibilityReading(first, options.second, year)
    case 'year': return buildYearAheadReading(first, options.year ?? new Date().getFullYear() + 1)
    case 'career': return buildCareerReading(first, year)
    case 'business': return buildBusinessReading(first, year)
    case 'wellbeing': return buildBalanceReading(first, year)
  }
}
export function buildBundleReading(first: SajuResult, second: SajuResult, annualYear = new Date().getFullYear() + 1, referenceYear = new Date().getFullYear()) {
  const complete = buildCompleteReading(first, referenceYear)
  const compatibility = buildCompatibilityReading(first, second, referenceYear)
  const annual = buildYearAheadReading(first, annualYear)
  const dayA = first.pillars[1], dayB = second.pillars[1], month = first.pillars[2]
  const yearlyPillar = getFourPillars(annualYear, 7, 15, 12, 0)[0]
  const annualGod = getRelation(dayA.pillar.stem, yearlyPillar[0])!.hanja
  const annualInner = getRelation(dayA.pillar.stem, getJeonggi(yearlyPillar[1]))!.hanja
  const natalWork = WORK_PROFILES[month.stemSipsin], yearlyWork = WORK_PROFILES[annualGod]
  const aCare = RELATIONSHIP_PROFILES[dayA.pillar.branch], bCare = RELATIONSHIP_PROFILES[dayB.pillar.branch]
  const aLens = PAIR_LENSES[getRelation(dayA.pillar.stem, dayB.pillar.stem)!.hanja]
  const bLens = PAIR_LENSES[getRelation(dayB.pillar.stem, dayA.pillar.stem)!.hanja]
  const overviewTitle = 'Reading the Three Reports Together'
  const overviewParagraphs = [
    `A personal plan begins to affect your time together. The three readings help you separate your own approach, the other person's needs and the extra focus of ${annualYear}. Person A is the subject of the life and annual readings; the relationship reading compares both people.`,
    `**What stays consistent:** Person A's birth-day image is ${PERSONAL_PROFILES[dayA.pillar.stem].image}. The birth-month reading points to **${natalWork.theme}**. These describe the starting pattern that the annual reading is compared with.`,
    annualGod === month.stemSipsin ? `**What ${annualYear} emphasises:** The year's main relationship repeats the birth-month one. The familiar theme of **${yearlyWork.theme}** therefore appears at both levels. The annual inner layer adds **${WORK_PROFILES[annualInner].theme}**. Look at how an existing responsibility or interest could develop, rather than assuming the year requires a complete change.` : `**What ${annualYear} adds:** The birth-month theme is **${natalWork.theme}**, while the annual comparison introduces **${yearlyWork.theme}**. Those can pull attention towards different choices. Keep the working conditions that already help you, then choose one way to explore the added theme.`,
    `**What the relationship adds:** Person A reads the connection through **${aLens.theme}**; Person B reads it through **${bLens.theme}**. Person A's close-relationship theme values **${aCare.need}**, while Person B's values **${bCare.need}**. A year focused on one person's plans still needs room for both answers.`,
    `**One choice to discuss together:** Take a plan that would change your shared time. Person A explains why it matters; Person B says what it would change for them. ${dayA.pillar.branch === dayB.pillar.branch ? 'Your day branches share a relationship theme, but the amount of time or support each person wants can still differ.' : 'Your day branches bring different relationship themes, so ask what support would look like to each person.'} Agree one detail before treating the whole plan as settled.`,
  ]
  const synthesis = plainReadingText(overviewParagraphs.join('\n\n'))
  const overview = { title: overviewTitle, fullText: [overviewTitle, synthesis].join('\n\n'), paragraphs: overviewParagraphs }
  const fullText = ['THE FATE KEY · Complete Bundle', overview.fullText, complete.fullText, compatibility.fullText, annual.fullText].join('\n\n')
  const summary = [{ label: 'The life pattern', text: complete.summary[0].text }, { label: 'The connection', text: compatibility.summary[0].text }, { label: `${annualYear} adds`, text: annual.summary[0].text }]
  return { complete, compatibility, annual, overview, summary, synthesis, fullText, wordCount: fullText.split(/\s+/).length }
}
