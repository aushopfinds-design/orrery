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
import { PERSONAL_PROFILES, RELATIONSHIP_PROFILES } from './reading-profiles.ts'
import { WORKING_LANGUAGE as LANGUAGE } from './purchase-language.ts'
import { DESTINY_COLLECTION_QUESTIONS } from './product-questions.ts'

export { DESTINY_COLLECTION_QUESTIONS } from './product-questions.ts'

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
  // Product 07 preserves the included Product 01 edition; targeted root-cause
  // narrative changes are applied only to standalone Product 01 reports.
  const complete = buildTraditionalCompleteFromPlan(plans.complete, true, false)
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
  const answer = (number: number, question: string, source: ReportChapter, details: string[], bottomLine: string, collectionLead?: string) => {
    return [
      `${String(number).padStart(2, '0')} · ${question}`,
      `Question: ${question}`,
      `Your Answer: ${plainReadingText(collectionLead ?? source.lead)}`,
      ...details.filter(Boolean).slice(0, 2).map(detail => `Answer detail: ${plainReadingText(detail)}`),
      `Bottom Line: ${plainReadingText(bottomLine)}`,
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
  const loveNeed = chapter(love, 'love-needs')
  const challenge = chapter(complete, 'life-challenges')
  const yearTheme = chapter(annual, 'annual-theme')
  const longTerm = chapter(complete, 'patterns')
  const lifeTimeline = complete.periods.length
    ? complete.periods.map(period => `${period.period} · ${period.pillar}: ${period.paragraphs.join(' ')}`)
    : ['No ten-year cycle falls within the available calculated range.']
  const coreProfile = PERSONAL_PROFILES[plans.complete.primary.dayStem]
  const privateNeed = RELATIONSHIP_PROFILES[plans.complete.primary.dayBranch].need
  const workTheme = LANGUAGE[plans.complete.primary.monthStemGod].name.en
  const pressurePattern = plainReadingText(coreProfile.pressure).replace(/[.!?]+$/u, '').replace(/^[A-Z]/u, letter => letter.toLowerCase())
  const challengeAnswer = `A recurring challenge is that ${pressurePattern}. It can crowd out your need for ${privateNeed}, linking your chart's work and private-life themes. This is a pattern to notice, not a fixed outcome.`
  const primaryMoney = plans.complete.primary
  const hasSteadyIncome = (items: { god: string }[]) => items.some(item => item.god === '正財')
  const hasVariableIncome = (items: { god: string }[]) => items.some(item => item.god === '偏財')
  const visibleSteady = hasSteadyIncome(primaryMoney.visibleMoney), visibleVariable = hasVariableIncome(primaryMoney.visibleMoney)
  const hiddenSteady = hasSteadyIncome(primaryMoney.hiddenMoney), hiddenVariable = hasVariableIncome(primaryMoney.hiddenMoney)
  const incomeSummary = visibleSteady && visibleVariable
    ? 'repeat income and new deals both appear in the visible chart, so cash planning needs to account for both'
    : visibleSteady ? 'repeat income is the clearer visible route'
      : visibleVariable ? 'new customers or project fees are the clearer visible route'
        : hiddenSteady && hiddenVariable ? 'repeat and project income appear in less visible signs, without a clear amount'
          : hiddenSteady ? 'a possible repeat-pay route appears in less visible signs'
            : hiddenVariable ? 'a possible project-income route appears in less visible signs'
              : 'the chart gives clearer work-fit clues than direct income clues'
  const integratedCollectionAnswer = `Your personal style centres on ${coreProfile.focus}. At work, your chart points to ${workTheme}; ${incomeSummary}. These areas meet through the time and effort you can give, while your close relationships have a separate need: ${privateNeed}. The chart describes connected themes, not a guaranteed cause or outcome.`
  const threeInsights = `Three chart-linked themes stand out: your core style is ${coreProfile.focus}; your work fit centres on ${workTheme}; and close relationships work best when your need for ${privateNeed} is understood.`
  const repeatingPatternText = plainReadingText(coreProfile.watchFor.at(-1) ?? coreProfile.watchFor[0])
  const repeatingPattern = `A pattern that may repeat is ${repeatingPatternText.charAt(0).toLowerCase()}${repeatingPatternText.slice(1)} Your chart links this tendency to a work style centred on ${workTheme}; it is a pattern to notice, not a fixed outcome.`
  const finalMessage = `Your chart points to a clear theme: ${workTheme} at work and your need for ${privateNeed} both matter in the life you build. Treat this as a personal pattern to weigh alongside your real circumstances, not as a fixed outcome.`
  const turningPointThemes = longTerm.paragraphs
    .map(line => /^Why (\d{4})(?:\s+\([^)]*\))? is highlighted here:\s*(.+)$/u.exec(line))
    .filter((match): match is RegExpExecArray => Boolean(match))
    .slice(0, 3)
  const turningPointLabel = (year: string, theme: string) => theme
    .replace(new RegExp(`^The ${year} theme of `), '')
    .split(/\s+connects with\s+/iu)[0]
    .replace(/[.!?]+$/u, '')
  const yearPriority = plainReadingText(yearTheme.tryThis)
    .replace(/^Focus this year on\s+/iu, '')
    .replace(/\s+at work$/iu, '')
    .replace(/[.!?]+$/u, '')
  const threeYearPriority = `For the next three years, prioritise ${yearPriority}. The annual chart comparison identifies this as a useful focus; it does not provide a separate forecast for each of the three years.`
  const collectionQuestions = [
    answer(1, DESTINY_COLLECTION_QUESTIONS[0], life, [`Your personal style is read from your birth-day sign, your public work role from the birth month, and your close-relationship need from a separate chart position.`, `Your earning clues describe possible routes, while your relationship need describes what supports closeness.`], 'Your chart’s strongest themes are your personal style and the work you are suited to. The kind of care you need in close relationships is a third part of that picture.', threeInsights),
    answer(2, DESTINY_COLLECTION_QUESTIONS[1], careerFit, careerFit.paragraphs, 'Use your work strength where your contribution is visible and clearly owned. A chart theme points to a direction, while real openings depend on your choices and circumstances.', `Your clearest opportunity is to make your contribution in ${workTheme} visible. Choose one project or responsibility where the result can be seen and credited to you.`),
    answer(3, DESTINY_COLLECTION_QUESTIONS[2], challenge, [challenge.paragraphs[0], challenge.paragraphs[2]], 'Your challenge is letting a useful strength become a role you cannot put down. Protecting your personal needs helps you choose when to use that strength.', challengeAnswer),
    answer(4, DESTINY_COLLECTION_QUESTIONS[3], moneyFit, [moneyFit.paragraphs[0], loveNeed.lead], 'Your personal style shapes how you approach work. Work, money and close relationships still depend on the time and effort you can realistically give.', integratedCollectionAnswer),
    answer(5, DESTINY_COLLECTION_QUESTIONS[4], life, [plainReadingText(coreProfile.pressure), `Your work theme is ${workTheme}; the repeated pattern is a tendency to carry the same response into that setting.`], 'A familiar strength can become a repeated pattern when it shapes both your work choices and your response to pressure. Notice when the same approach is no longer helping.', repeatingPattern),
    answer(6, DESTINY_COLLECTION_QUESTIONS[5], longTerm, turningPointThemes.length ? [`The first year links to ${turningPointLabel(turningPointThemes[0][1], turningPointThemes[0][2])}. The detailed comparison is included in the chart timing pages.`] : [longTerm.paragraphs[0]], turningPointThemes.length
      ? 'Use these years as review points for the named themes, not as guaranteed events. Compare them with real work, money and personal decisions before making a change.'
      : 'No listed year means the available calculation did not identify a supported timing signal. Review your real circumstances rather than treating an unverified date as guidance.', turningPointThemes.length
      ? `The chart flags ${turningPointThemes.map(([_, year, theme]) => `${year} (${turningPointLabel(year, theme)})`).join('; ')} as review years. These comparisons identify themes, not guaranteed life events.`
      : 'No specific year stands out in the verified turning-point comparisons available for this reading. The chart supports themes to review, not a date for a major life event.'),
    answer(7, DESTINY_COLLECTION_QUESTIONS[6], yearTheme, [yearTheme.paragraphs[0]], 'Keep one work priority central, then check whether your actual responsibilities and authority support it. The annual chart comparison offers a focus, not a separate forecast for each of the next three years.', threeYearPriority),
    answer(8, DESTINY_COLLECTION_QUESTIONS[7], strengthsOverview, [social.paragraphs[0], life.paragraphs[0]], 'Your potential is easiest to miss when a familiar strength feels ordinary to you. Look at what others rely on you to do, while checking that the role still suits you.', `A strength you may overlook is this: ${plainReadingText(coreProfile.strength)} The chart links this trait to your natural way of approaching work and close relationships.`),
    answer(9, DESTINY_COLLECTION_QUESTIONS[8], life, [`Your work theme is ${workTheme}; your close-relationship need is ${privateNeed}. They describe separate parts of the chart that have to fit into the same life.`], 'A fulfilling life in this chart balances meaningful contribution with the kind of closeness that supports you. Your own priorities and lived experience remain the guide.', `A more fulfilling life may come from work centred on ${workTheme} and close relationships that make room for ${privateNeed}. The chart offers these as personal themes, not a fixed definition of happiness.`),
    [
      `10 · ${DESTINY_COLLECTION_QUESTIONS[9]}`,
      `Question: ${DESTINY_COLLECTION_QUESTIONS[9]}`,
      `Your Answer: ${plainReadingText(finalMessage)}`,
      `Answer detail: Your work theme is ${workTheme}; your close-relationship need is ${privateNeed}. These are distinct chart clues, not a prediction that one will determine the other.`,
      `Bottom Line: ${plainReadingText(`Build around ${workTheme} while making room for ${privateNeed}. Let your real circumstances shape how that balance looks.`)}`,
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
