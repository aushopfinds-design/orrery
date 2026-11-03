import { splitDeliveredReading, CALCULATION_NOTES } from './report-delivery.ts'
import { bundleNarrative } from './purchase-narrative.ts'
import { bundleInterpretationPlans } from './interpretation-plan.ts'
import { buildTraditionalCompleteFromPlan, buildTraditionalCategory, buildTraditionalCategoryFromPlan } from './traditional-reading.ts'
import type { ReportChapter } from './complete-reading.ts'
import type { SajuResult } from '@orrery/core/types'
import type { FocusCategory } from './category-catalog.ts'
import { buildCompatibilityReading } from './compatibility-reading.ts'
import { buildCareerReading, buildBusinessReading } from './work-focus-readings.ts'
import { buildYearAheadReading } from './year-ahead-reading.ts'
import { buildBalanceReading } from './balance-reading.ts'
import { plainReadingText } from './reading-text.ts'

export { buildCompatibilityReading, buildCareerReading, buildBusinessReading, buildYearAheadReading, buildBalanceReading }
export function buildCategoryReading(kind: FocusCategory, first: SajuResult, options: { second?: SajuResult; year?: number; periodStart?: string; periodTimezone?: string } = {}) {
  const year = options.year ?? new Date().getFullYear()
  switch (kind) {
    case 'compatibility':
      if (!options.second) throw new Error('Two birth charts are needed for compatibility')
      return buildCompatibilityReading(first, options.second, year)
    case 'year': return buildYearAheadReading(first, options.year ?? new Date().getFullYear() + 1, options.periodStart, options.periodTimezone)
    case 'career': return buildCareerReading(first, year)
    case 'love': return buildTraditionalCategory(kind, first, year)
    case 'business': return buildBusinessReading(first, year)
    case 'wellbeing': return buildBalanceReading(first, year)
  }
}
export function buildBundleReading(first: SajuResult, second: SajuResult, annualYear = new Date().getFullYear() + 1, referenceYear = new Date().getFullYear(), periodStart?: string, periodTimezone?: string) {
  return buildBundleFromPlans(bundleInterpretationPlans(first, second, annualYear, referenceYear, periodStart, periodTimezone))
}
export function buildBundleFromPlans(plans: ReturnType<typeof bundleInterpretationPlans>) {
  const complete = buildTraditionalCompleteFromPlan(plans.complete)
  const compatibility = buildTraditionalCategoryFromPlan(plans.compatibility)
  const annual = buildTraditionalCategoryFromPlan(plans.annual)
  const career = buildTraditionalCategoryFromPlan(plans.career)
  const love = buildTraditionalCategoryFromPlan(plans.love)
  // The life report owns the shared glossary, method and symbolic keepsake appendix.
  // The relationship and annual sections retain their own calculated evidence.
  for (const report of [compatibility, annual, career, love]) {
    report.sharedAppendixInLifeReport = true
    const parts = splitDeliveredReading(report.fullText)
    report.fullText = parts.body.split('\n\nYour Everyday Compass')[0] + '\n\n' + CALCULATION_NOTES + '\n\n' + parts.appendix.split('\n\nChart terms in plain English')[0]
    report.wordCount = report.fullText.split(/\s+/).length
  }
  const overviewTitle = 'How Do Your Life, Love, Work and Year Connect?'
  const overviewParagraphs = bundleNarrative(plans).map(line=>line.en)
  const synthesis = plainReadingText(overviewParagraphs.join('\n\n'))
  const overview = { title: overviewTitle, fullText: [overviewTitle, synthesis].join('\n\n'), paragraphs: overviewParagraphs }
  const chapter = (report: { chapters: ReportChapter[] }, id: string) => {
    const found = report.chapters.find(item => item.id === id)
    if (!found) throw new Error(`Missing collection answer source: ${id}`)
    return found
  }
  const answer = (number: number, question: string, source: ReportChapter, timing?: string) => {
    const practicalStep = plainReadingText(source.tryThis || source.guidance.keepClose[0] || source.lead)
    return [
      `${String(number).padStart(2, '0')} · ${question}`,
      `Question: ${question}`,
      `Your Answer: ${plainReadingText(source.lead)}`,
      ...(timing ? [`Important Timing: ${plainReadingText(timing)}`] : []),
      `Practical Step: ${practicalStep}`,
    ].join('\n\n')
  }
  const life = chapter(complete, 'personality')
  const social = chapter(complete, 'social')
  const strengthsOverview = {
    ...life,
    title: 'Your Strengths and Blind Spots',
    lead: social.lead,
    paragraphs: [social.paragraphs[0] ?? social.tryThis, life.paragraphs[0] ?? life.tryThis],
    tryThis: social.tryThis,
  }
  const careerFit = chapter(career, 'two-work-layers')
  const moneyFit = chapter(career, 'money-commitments')
  const relationshipNeed = chapter(love, 'love-needs')
  const relationshipFit = chapter(compatibility, 'two-styles')
  const challenge = chapter(complete, 'life-challenges')
  const yearTheme = chapter(annual, 'annual-theme')
  const yearPeriods = chapter(annual, 'annual-plan')
  const longTerm = chapter(complete, 'patterns')
  const nextCycle = complete.periods[1]
  const longTiming = nextCycle
    ? `${nextCycle.period} (${nextCycle.pillar}). ${nextCycle.paragraphs[1] ?? nextCycle.paragraphs[0]}`
    : longTerm.paragraphs.find(line => /\b20\d{2}\b/.test(line))
  const lifeTimeline = complete.periods.length
    ? complete.periods.map(period => `${period.period} · ${period.pillar}: ${period.paragraphs.join(' ')}`)
    : ['No ten-year cycle falls within the available calculated range.']
  const integratedAnswer = overviewParagraphs[0] ?? 'Your chart brings work, personal needs and relationship choices into one practical decision.'
  const collectionQuestions = [
    answer(1, 'What kind of person are you at your core?', life),
    answer(2, 'Which strengths help you most, and what can get in your way?', strengthsOverview),
    answer(3, 'What kind of work is the best fit for you?', careerFit),
    answer(4, 'How are you most likely to earn and manage money?', moneyFit),
    answer(5, 'What do you need from a close relationship?', relationshipNeed),
    answer(6, 'How do you and your partner fit together?', relationshipFit),
    answer(7, 'What recurring challenge deserves your attention?', challenge),
    answer(8, 'What should you know about the next 12 months?', yearTheme, `${annual.months[0]?.label ?? ''} through ${annual.months.at(-1)?.label ?? ''}. ${yearPeriods.lead}`),
    answer(9, 'When could a longer-term life or work shift deserve attention?', longTerm, longTiming),
    [
      '10 · How Do Your Life, Love, Work and Timing Fit Together?',
      'Question: How do these parts of your life connect?',
      `Your Answer: ${plainReadingText(integratedAnswer)}`,
      `Chart Links: ${plainReadingText(overviewParagraphs.slice(1, 3).join(' '))}`,
      `Shared Timing: ${plainReadingText(overviewParagraphs.slice(3, 5).join(' '))}`,
      `Practical Step: ${plainReadingText(overviewParagraphs.at(-1) ?? 'Compare work demands with actual pay and capacity, then make room for the relationship needs shown in both charts.')}`,
    ].join('\n\n'),
  ]
  const includedReports = [complete, compatibility, career, annual, love]
  const deliveredReports = includedReports.map(report => splitDeliveredReading(report.fullText))
  const deliveredBodies = deliveredReports.map(report => report.body.split('\n\n').filter(block => !block.includes('From the chart:')).join('\n\n'))
  const fullText = [
    'THE FATE KEY · Your Destiny Collection',
    overview.fullText,
    'Birth details', complete.birthSummary, ...complete.pillarSummary,
    "Your partner's birth details", compatibility.subjects[1].birthSummary,
    'Your Ten Questions', ...collectionQuestions,
    'Your Included Reports',
    ...deliveredBodies,
    CALCULATION_NOTES,
    'Chart evidence for these answers',
    ...deliveredReports.map(report => report.appendix),
    'Longer-term timing reference', ...lifeTimeline,
    'How this reading is prepared', ...complete.methodNotes,
  ].join('\n\n')
  const summary = [{ label: 'Your Life, Your Destiny', text: complete.summary[0].text }, { label: 'Your Next 12 Months', text: annual.summary[0].text }, { label: 'Are We Meant to Be?', text: compatibility.summary[0].text }, { label: 'Success, Money & Your Future', text: career.summary[0].text }, { label: 'Relationship Needs', text: love.summary[0].text }]
  return { title: 'Your Destiny Collection', complete, compatibility, annual, career, love, overview, summary, synthesis, fullText, wordCount: fullText.split(/\s+/).length }
}
