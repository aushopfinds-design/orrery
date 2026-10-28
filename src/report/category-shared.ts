import { reportOverviewText } from './report-overview.ts'
import { deliveredChapter, calculationAppendix } from './report-delivery.ts'
import { chartGlossaryFor } from './calculation-notes.ts'
import type { SajuResult, BirthInput } from '@orrery/core/types'
import { getRelation, analyzePillarRelations } from '@orrery/core/pillars'
import { buildFreeReading, REPORT_EDITION } from './complete-reading.ts'
import type { ReportChapter, ElementCount } from './complete-reading.ts'
import { buildEnglishReading, STEMS, TEN_GODS } from './reading.ts'
import { PERSONAL_PROFILES, WORK_PROFILES, RELATIONSHIP_PROFILES } from './reading-profiles.ts'
import type { ReadingGuidance } from './reading-profiles.ts'
import { plainReadingText } from './reading-text.ts'
import type { FocusCategory } from './category-catalog.ts'
import { reportExtrasText, SYMBOL_NOTE } from './report-extras.ts'
import type { ReportExtras } from './report-extras.ts'
import { everydayExampleText } from './personal-examples.ts'
import type { EverydayExample } from './personal-examples.ts'
import { THEME_FAMILY as FAMILY } from './theme-family.ts'
import { applicationText } from './report-applications.ts'
import type { ReportApplication } from './report-applications.ts'
import { explainCalculation, PAIR_METHOD_NOTE } from './calculation-notes.ts'
import type { CalculationExplanation } from './calculation-notes.ts'
import type { DecisionFocus } from './decision-focus.ts'
export { THEME_FAMILY as FAMILY } from './theme-family.ts'
export { moneyTiming, moneyTimingFacts } from './timing-observations.ts'

export const POSITIONS = ['hour', 'day', 'month', 'year']
export interface ReportSubject { label: string; input: BirthInput; birthSummary: string; pillarSummary: string[]; dayMaster: string; elements: ElementCount[]; visibleMarkers: number; calculation: CalculationExplanation }
export interface ReportMonth extends ReportChapter { label: string; referenceDate: string; pillar: string; yearPillar: string }
export interface CategoryReading { sharedAppendixInLifeReport?: true; focus: DecisionFocus; kind: FocusCategory; title: string; headline: string; referenceYear: number; subjects: ReportSubject[]; summary: { label: string; text: string }[]; chapters: ReportChapter[]; months: ReportMonth[]; applications: ReportApplication[]; extras: ReportExtras; methodNotes: string[]; fullText: string; wordCount: number }

export function chartContext(result: SajuResult) {
  const [hour, day, month, year] = result.pillars
  const personal = PERSONAL_PROFILES[day.pillar.stem]
  const work = WORK_PROFILES[month.stemSipsin]
  const inner = WORK_PROFILES[month.branchSipsin]
  const group = WORK_PROFILES[year.stemSipsin]
  const relationship = RELATIONSHIP_PROFILES[day.pillar.branch]
  if (!personal || !work || !inner || !group || !relationship) throw new Error('A valid birth chart is needed')
  const available = result.pillars.map((pillar, index) => ({ pillar, index })).filter(item => !(result.input.unknownTime && item.index === 0))
  return { result, hour, day, month, year, personal, work, inner, group, relationship, family: FAMILY[month.stemSipsin], available, snapshot: buildFreeReading(result) }
}
export function subject(result: SajuResult, label = 'Birth details'): ReportSubject {
  const snapshot = buildFreeReading(result)
  return { label, input: result.input, birthSummary: snapshot.birthSummary, pillarSummary: snapshot.pillarSummary, dayMaster: snapshot.dayMaster, elements: snapshot.elements, visibleMarkers: snapshot.visibleMarkers, calculation: explainCalculation(result.input) }
}
export function pillarFact(result: SajuResult, index: number, person = ''): string {
  if (index === 0 && result.input.unknownTime) return `${person ? person + ': ' : ''}birth time unknown; hour excluded.`
  const p = result.pillars[index]
  return `${person ? person + ': ' : ''}${POSITIONS[index]} pillar ${p.pillar.ganzi}. Stem ${p.pillar.stem}: ${p.stemSipsin} (${TEN_GODS[p.stemSipsin]?.title ?? 'starting point'}); branch ${p.pillar.branch}: ${p.branchSipsin} (${TEN_GODS[p.branchSipsin]?.title ?? 'supporting theme'}).`
}
export function moneyMarkers(result: SajuResult) {
  const c = chartContext(result)
  const visible = c.available.flatMap(({ pillar, index }) => [
    ...(index === 1 ? [] : [{ god: pillar.stemSipsin, source: `${POSITIONS[index]} stem ${pillar.pillar.stem}` }]),
    { god: pillar.branchSipsin, source: `${POSITIONS[index]} branch ${pillar.pillar.branch}` },
  ]).filter(item => item.god === '正財' || item.god === '偏財')
  const inner = c.available.flatMap(({ pillar, index }) => [...pillar.jigang.replace(/\s/g, '')].flatMap(stem => {
    const god = getRelation(c.day.pillar.stem, stem)?.hanja
    return god === '正財' || god === '偏財' ? [{ god, source: `${stem} inside the ${POSITIONS[index]} branch ${pillar.pillar.branch}` }] : []
  }))
  const steady = visible.some(item => item.god === '正財')
  const opportunity = visible.some(item => item.god === '偏財')
  const hiddenSteady = inner.some(item => item.god === '正財')
  const hiddenOpportunity = inner.some(item => item.god === '偏財')
  const theme = steady && opportunity ? 'a steady base and room for an opportunity' : steady ? 'steady commitments and clear records' : opportunity ? 'new offers and useful connections' : inner.length ? 'checking the quieter commitments behind a visible choice' : 'starting with real costs and promises'
  return { steady, opportunity, hiddenSteady, hiddenOpportunity, theme, facts: visible.length || inner.length ? [...visible, ...inner].map(item => `${item.source}: ${item.god} (${TEN_GODS[item.god].title}).`) : ['No 正財 or 偏財 was found in the checked visible markers or inner stems. This does not measure financial ability.'] }
}
export function pairFacts(first: string, second: string, label: string): string[] {
  const pair = analyzePillarRelations(first, second)
  const branches = pair.branch.filter(item => !(item.type === '刑' && (item.detail === '無恩' || item.detail === '恃勢')))
  const facts = [...pair.stem.map(item => `stem ${item.type}${item.detail ? ' (' + item.detail + ')' : ''}`), ...branches.map(item => `branch ${item.type}${item.detail ? ' (' + item.detail + ')' : ''}`)]
  return [`${label}: ${first} with ${second}. ${facts.length ? facts.join('; ') : 'No pair pattern in the checked tables'}.`]
}
export function chapter(id: string, title: string, lead: string, paragraphs: string[], evidence: string[], tryThis: string, guidance: ReadingGuidance, icon = 'personality', example?: EverydayExample): ReportChapter {
  return { id, title, lead, paragraphs, evidence, tryThis, guidance, icon, ...(example ? { example } : {}) }
}
export function selectedCycles(result: SajuResult, year: number) {
  return buildEnglishReading(result, year).periods.map(period => result.daewoon.find(cycle => cycle.ganzi === period.pillar && cycle.startDate.getUTCFullYear() === Number(period.period.split('–')[0]))!).filter(Boolean)
}
export function cycleFacts(result: SajuResult, year: number) {
  const cycles = selectedCycles(result, year)
  return cycles.length ? cycles.map(cycle => `Ten-year cycle ${cycle.ganzi}; calculated start ${cycle.startDate.toISOString().slice(0, 10)}; stem ${cycle.stemSipsin}; branch ${cycle.branchSipsin}.`) : [`No current or upcoming ten-year cycle is available for ${year} in this chart’s calculated range. Birth year: ${result.input.year}.`]
}
export function validateYear(year: number, result: SajuResult) {
  if (!Number.isInteger(year) || year < 1900 || year > 2100 || year < result.input.year) throw new Error('Choose a report year from 1900 to 2100, on or after the birth year')
}
export function commonMethod(result: SajuResult, year: number): string[] {
  return [
    ...explainCalculation(result.input).notes,
    ...buildEnglishReading(result, year).caveats.filter(note => !note.startsWith('Each monthly chapter') && !note.startsWith('Monthly headlines')),
    'These chapter examples, questions and helpful habits are editorial cultural interpretations. They are not facts known about the person or a professionally validated assessment.',
    'The situation pages are optional editorial exercises. Birth-chart themes shape their personal checks and practice details; the situation itself is not inferred from the chart. Compare the choices with actual circumstances and review what happens.',
    'The report does not diagnose chart strength, chart structure or useful elements. Counts and pair patterns do not supply those advanced conclusions.',
    SYMBOL_NOTE,
    PAIR_METHOD_NOTE,
    ...(result.input.unknownTime ? ['An unknown birth time excludes the hour pillar and every hour comparison. Ten-year starting dates remain approximate.'] : []),
  ]
}
export function finishReading(data: Omit<CategoryReading, 'fullText' | 'wordCount'>): CategoryReading {
  const chapters = data.chapters.map((item, index) => ({ ...item, title: `${String(index + 1).padStart(2, '0')} · ${item.title}` }))
  const chapterText = (item: ReportChapter) => [...deliveredChapter(item), ...(item.example ? everydayExampleText(item.example, item.lead !== item.example.scene) : [])]
  const fullText = plainReadingText([
    `THE FATE KEY · ${data.title}`, `Report edition ${REPORT_EDITION} · Reference year ${data.referenceYear}`,
    ...data.subjects.flatMap(item => [item.label, item.birthSummary, item.pillarSummary.join(' · '), `Cycle setting: ${item.calculation.cycleSetting}; direction: ${item.calculation.cycleDirection}.`, ...(data.subjects.length > 1 ? item.calculation.notes : [])]),
    reportOverviewText(chapters),
    ...chapters.flatMap(chapterText),
    ...(data.months.length ? ['Your Twelve Months', ...data.months.flatMap(chapterText)] : []),
    ...(data.applications.length ? ['Situations you can work through', ...data.applications.map(applicationText)] : []),
    ...(data.kind === 'career' ? [] : [reportExtrasText(data.extras, true)]),
    data.kind === 'career'
      ? calculationAppendix([{ title: 'Calculation basis', evidence: [data.subjects[0].birthSummary, data.subjects[0].pillarSummary.join(' · '), `Annual comparison dates: ${Array.from({ length: Math.min(10, 2101 - data.referenceYear) }, (_, index) => `${data.referenceYear + index}-07-15`).join(', ')}. These are comparison points, not full calendar years.`, `Ten-year-cycle dates use the supplied birth details and the engine time convention.`] }])
      : calculationAppendix([{ title: 'Reading focus', evidence: data.focus.evidence }, { title: 'Symbol guide evidence', evidence: data.extras.evidence }, ...[...chapters, ...data.months].map(item => ({ title: item.title, evidence: item.evidence }))]),
    'Chart terms in plain English', ...(data.kind === 'career' ? ['Ten Gods name relationships between the Day Master and other chart symbols. A visible count is a placement count, not a strength or fortune score.', 'Annual comparisons use 15 July; ten-year cycles begin on their calculated dates.'] : chartGlossaryFor([...chapters.flatMap(chapter => chapter.evidence), ...data.months.flatMap(month => month.evidence), ...data.focus.evidence]).map(item => `${item.term}: ${item.meaning}`)),
    'How this reading is prepared', ...(data.kind === 'career' ? ['This is a traditional interpretation of calculated symbols, not a validated prediction. Timing markers describe chart relationships, not guaranteed events.'] : data.methodNotes),
  ].join('\n\n'))
  return { ...data, chapters, fullText, wordCount: fullText.split(/\s+/).length }
}
export const symbolName = (stem: string) => STEMS[stem]?.name ?? 'Unknown'
