import { buildTraditionalComplete } from './traditional-reading.ts'
import type { SajuResult, BirthInput, PillarDetail } from '@orrery/core/types'
import { BRANCH_ELEMENTS, STEM_ELEMENTS, STEMS, TEN_GODS } from './reading.ts'
import type { ReadingElement, ReadingPeriod } from './reading.ts'
import { PERSONAL_PROFILES, WORK_PROFILES } from './reading-profiles.ts'
import type { ReadingGuidance } from './reading-profiles.ts'
import type { ReportExtras } from './report-extras.ts'
import type { EverydayExample } from './personal-examples.ts'
import type { ReportApplication } from './report-applications.ts'
import type { CalculationExplanation } from './calculation-notes.ts'
import type { DecisionFocus } from './decision-focus.ts'

export const REPORT_EDITION = '2026.10-r17'

export interface ReadingConnection {
  id: string
  title: string
  basis: string
  text: string
  question: string
  chapterId: string
  evidence: string[]
}

export interface ReportChapter {
  id: string
  icon?: string
  title: string
  lead: string
  paragraphs: string[]
  evidence: string[]
  tryThis: string
  guidance: ReadingGuidance
  showGuidance?: boolean
  example?: EverydayExample
}
export interface CompleteReadingPeriod extends ReadingPeriod {
  paragraphs: string[]
  evidence: string[]
  guidance: ReadingGuidance
  tryThis: string
}
export interface ElementCount { element: ReadingElement; count: number }
export interface CompleteReading {
  focus: DecisionFocus
  calculation: CalculationExplanation
  title: string
  birthSummary: string
  pillarSummary: string[]
  dayMaster: string
  headline: string
  summary: { label: string; text: string }[]
  connections: ReadingConnection[]
  referenceYear: number
  chapters: ReportChapter[]
  periods: CompleteReadingPeriod[]
  actionPlan: ReportChapter
  applications: ReportApplication[]
  extras: ReportExtras
  elements: ElementCount[]
  visibleMarkers: number
  methodNotes: string[]
  fullText: string
  wordCount: number
}
export interface FreeReading {
  title: string
  birthSummary: string
  pillarSummary: string[]
  dayMaster: string
  headline: string
  paragraphs: string[]
  workNote: string
  elements: ElementCount[]
  visibleMarkers: number
  evidence: string[]
  tryThis: string
  timeUnknown: boolean
  guidance: ReadingGuidance
}

const POSITIONS = ['hour', 'day', 'month', 'year']
const ELEMENT_ORDER: ReadingElement[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']


function context(result: SajuResult) {
  const [hour, day, month, year] = result.pillars
  const personal = PERSONAL_PROFILES[day.pillar.stem]
  const self = STEMS[day.pillar.stem]
  if (!personal || !self) throw new Error('A valid day pillar is needed for this report')
  const work = WORK_PROFILES[month.stemSipsin]
  if (!work) throw new Error('A valid month relationship is needed for this report')
  const elements = ELEMENT_ORDER.map(element => ({ element, count: 0 }))
  const available = result.pillars.map((pillar, index) => ({ pillar, index }))
    .filter(({ index }) => !(result.input.unknownTime && index === 0))
  for (const { pillar } of available) {
    for (const element of [STEM_ELEMENTS[pillar.pillar.stem], BRANCH_ELEMENTS[pillar.pillar.branch]]) {
      const found = elements.find(item => item.element === element)
      if (found) found.count++
    }
  }
  const maximum = Math.max(...elements.map(item => item.count))
  const prominent = elements.filter(item => item.count === maximum)
  const absent = elements.filter(item => item.count === 0)
  return { hour, day, month, year, personal, self, work, available, elements, prominent, absent }
}

function formatBirth(input: BirthInput): string {
  const date = new Date(Date.UTC(input.year, input.month - 1, input.day)).toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
  return `${date} · ${input.unknownTime ? 'birth time unknown' : `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`} · ${input.timezone ?? 'Asia/Seoul (default)'}`
}
function pillarSummary(result: SajuResult): string[] {
  return [3, 2, 1, 0].map(index => `${POSITIONS[index][0].toUpperCase()}${POSITIONS[index].slice(1)}: ${index === 0 && result.input.unknownTime ? 'Unknown' : result.pillars[index].pillar.ganzi}`)
}
function fact(pillar: PillarDetail, index: number, branch = false): string {
  const marker = branch ? pillar.pillar.branch : pillar.pillar.stem
  const god = branch ? pillar.branchSipsin : pillar.stemSipsin
  return `${POSITIONS[index][0].toUpperCase()}${POSITIONS[index].slice(1)} ${branch ? 'branch' : 'stem'} ${marker}: ${TEN_GODS[god]?.title ?? (god === '本元' ? 'your starting point' : 'supporting theme')} (${god}).`
}
export function buildFreeReading(result: SajuResult): FreeReading {
  const c = context(result)
  return {
    title: 'Your Free Saju Snapshot', birthSummary: formatBirth(result.input),
    pillarSummary: pillarSummary(result), dayMaster: c.self.name, headline: c.personal.headline,
    paragraphs: [
      c.personal.strength,
      c.personal.pressure,
    ],
    workNote: `Your birth month adds a focus on **${c.work.theme}**. You may prefer work with ${c.work.setting}.`,
    elements: c.elements, visibleMarkers: result.input.unknownTime ? 6 : 8,
    evidence: [`Day stem ${c.day.pillar.stem} (${c.self.name}).`, fact(c.month, 2)],
    tryThis: c.personal.practice, timeUnknown: Boolean(result.input.unknownTime),
    guidance: { keepClose: c.personal.keepClose.slice(0, 1), watchFor: c.personal.watchFor.slice(0, 1) },
  }
}

export function buildCompleteReading(result: SajuResult, asOfYear = new Date().getFullYear()): CompleteReading {
  return buildTraditionalComplete(result, asOfYear)
}
