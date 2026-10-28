import type { BirthInput } from '@orrery/core/types'
import { getFourPillars } from '@orrery/core/pillars'
import { YANGGAN } from '@orrery/core/constants'
import { adjustBirthInputToKstWallClock, adjustBirthInputToSolarTime, DEFAULT_LONGITUDE } from '@orrery/core/timezone'

type Clock = Pick<BirthInput, 'year' | 'month' | 'day' | 'hour' | 'minute'>
const stamp = (c: Clock) => Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute)
const time = (minutes: number) => {
  const value = ((minutes % 1440) + 1440) % 1440
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
}
const clockLabel = (c: Clock) => `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')} ${time(c.hour * 60 + c.minute)}`
const shift = (c: Clock, minutes: number): Clock => {
  const d = new Date(stamp(c) + minutes * 60_000)
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), hour: d.getUTCHours(), minute: d.getUTCMinutes() }
}
const pillarAt = (c: Clock, input: BirthInput) => getFourPillars(
  c.year, c.month, c.day, c.hour, c.minute, input.jasiMethod,
  input.timezone != null && input.timezone !== 'Asia/Seoul'
    ? { longitude: input.longitude ?? DEFAULT_LONGITUDE }
    : undefined,
)

export interface CalculationExplanation {
  cycleSetting: string
  cycleDirection: string
  enteredClock: string
  effectiveClock: string
  correction: string
  convention: string
  hourPillar: string
  nearBoundary: boolean
  boundaryNote?: string
  adjacentHours?: { before: string; after: string; boundary: string }
  notes: string[]
}

/** Explain the existing engine convention; never substitute a different calculation. */
export function explainCalculation(input: BirthInput): CalculationExplanation {
  const normalized = input.unknownTime ? { ...input, hour: 12, minute: 0 } : input
  const solar = input.timezone != null && input.timezone !== 'Asia/Seoul'
  const effective = solar ? adjustBirthInputToSolarTime(normalized) : adjustBirthInputToKstWallClock(normalized)
  const [yearPillar, , , hourPillar] = pillarAt(effective, input)
  const yang = YANGGAN.includes(yearPillar[0])
  const forward = (input.gender === 'M' && yang) || (input.gender === 'F' && !yang)
  const cycleSetting = input.gender === 'M' ? 'Male' : 'Female'
  const cycleDirection = forward ? 'Forward' : 'Reverse'
  const change = Math.round((stamp(effective) - stamp(normalized)) / 60_000)
  const correction = `${change > 0 ? '+' : ''}${change} minutes from the entered local clock`
  const convention = solar
    ? 'Local time is resolved with its IANA time zone, including historical daylight saving, then adjusted for longitude and the approximate equation of time.'
    : 'The Korean standard-clock convention is used. Historical Korean clock changes are normalized to the KST wall clock; no extra longitude adjustment is applied.'
  const notes = [
    `Traditional cycle setting: ${cycleSetting}. The calculated year stem ${yearPillar[0]} is ${yang ? 'yang' : 'yin'}, so the ten-year cycles run ${cycleDirection.toLowerCase()}. This setting determines cycle direction; it is not a personality judgement.`,
    convention,
    solar
      ? 'Solar-term boundaries are converted to the birthplace longitude’s apparent solar clock, using the same equation-of-time convention as the birth-time adjustment.'
      : 'Solar-term boundaries are compared on the Korean KST wall clock. The engine uses a generated astronomical term table rounded to the input’s minute precision.',
  ]
  const base: CalculationExplanation = {
    cycleSetting, cycleDirection,
    enteredClock: input.unknownTime ? 'Not supplied' : clockLabel(input),
    effectiveClock: input.unknownTime ? 'Midday reference only; birth hour not inferred' : clockLabel(effective),
    correction: input.unknownTime ? 'Not an estimate of birth time' : correction,
    convention, hourPillar: input.unknownTime ? 'Unknown; excluded' : hourPillar,
    nearBoundary: false, notes,
  }
  if (input.unknownTime) {
    notes.push('Birth time is unknown. The hour pillar and hour comparisons are excluded. Midday is used only as a calculation reference; it is not an estimated birth time. The displayed ten-year cycle start date is also only a reference and may shift with the actual birth time.')
    notes.push(input.jasiMethod === 'split'
      ? 'The displayed day pillar uses the entered calendar date. Under the selected split Zi-hour convention, a birth after 23:30 calculation clock keeps that day pillar but may have a different hour pillar, which is excluded here.'
      : 'The displayed day pillar uses the midday reference. Under this engine’s default unified Zi-hour convention, a birth at or after 23:30 calculation clock can move the day pillar to the next day. Because the birth time is unknown, that possibility cannot be checked; the day-based interpretation may therefore differ.')
    return base
  }
  notes.push(`Recorded local clock: ${clockLabel(input)} in ${input.timezone ?? 'Asia/Seoul (default)'}. Calculation clock: ${clockLabel(effective)} (${correction}). The calculation clock is a convention-based value, not a second recorded birth time.`)
  const minute = effective.hour * 60 + effective.minute
  // calcPillarIndices uses 01:30, 03:30, ... 23:30 for every input path.
  const start = Math.floor((minute - 90) / 120) * 120 + 90
  const nearest = Math.round((minute - 90) / 120) * 120 + 90
  const conventional = Math.round((minute - 60) / 120) * 120 + 60
  const engineDistance = Math.abs(minute - nearest)
  const conventionalDistance = Math.abs(minute - conventional)
  const boundary = engineDistance <= 15 ? nearest : start + 120
  const before = pillarAt(shift(effective, boundary - minute - 1), input)[3]
  const after = pillarAt(shift(effective, boundary - minute), input)[3]
  base.adjacentHours = { before, after, boundary: time(boundary) }
  notes.push(`Hour convention: this engine uses half-hour-offset two-hour windows, including 01:30 and 03:30. Here ${hourPillar} is selected in the ${time(start)}-${time(start + 120 - 1)} calculation-clock window. Across ${time(boundary)}, the adjacent hour pillars are ${before} / ${after}. Other calculators may use the conventional odd-hour boundaries instead.`)
  if (engineDistance <= 15 || conventionalDistance <= 15) {
    base.nearBoundary = true
    base.boundaryNote = engineDistance <= 15
      ? `Near an hour boundary: the calculation clock is ${engineDistance} minutes from this engine's ${time(nearest)} boundary. The pillars on its two sides are ${before} / ${after}. Check the recorded birth time before relying on hour-sensitive details.`
      : `Near a conventional hour boundary: the calculation clock is ${conventionalDistance} minutes from ${time(conventional)}. This engine instead changes hours at ${time(boundary)} (${before} / ${after}). A different hour convention or an uncertain birth time can change the result.`
    notes.push(base.boundaryNote)
  }
  notes.push(`Late-night day boundary: ${input.jasiMethod === 'split' ? 'split Zi-hour convention' : 'unified Zi-hour convention (the day changes at 23:30 on the calculation clock)'}.`)
  return base
}

export const CHART_GLOSSARY = [
  { term: '比肩 / 劫財', meaning: 'These compare the day stem with stems of the same element. In this report they introduce questions about independence, shared decisions and working alongside others.' },
  { term: '食神 / 傷官', meaning: 'These describe the element produced by the day stem. Here they introduce themes of making, expressing ideas and improving what you create.' },
  { term: '正財 / 偏財', meaning: 'These describe the element controlled by the day stem. Here they introduce themes of managing everyday resources or exploring opportunities; they do not state how wealthy someone is.' },
  { term: '正官 / 偏官', meaning: 'These describe the element that controls the day stem. Here they introduce questions about expectations, responsibility and responding under pressure.' },
  { term: '正印 / 偏印', meaning: 'These describe the element that produces the day stem. Here they introduce themes of learning, receiving support and finding your own way to understand something.' },
  { term: 'Ten-year cycle / 大運', meaning: 'A traditional sequence calculated from the birth month, year-stem polarity and selected male/female cycle setting. The recorded start date is a calculation reference, not a promised event date.' },
  { term: 'Combination / 合', meaning: 'A traditional relationship between chart symbols. It is a prompt to explore how needs can work together, not proof of an easy relationship.' },
  { term: 'Clash / 沖', meaning: 'A directly opposing pair of chart symbols. Use it to ask about competing needs; it does not establish that conflict has happened.' },
  { term: 'Friction pattern / 刑', meaning: 'A traditional pattern name. In the naming convention used here, 子卯 is 無禮, 寅巳申 is 無恩 and 丑戌未 is 恃勢. The latter two are three-branch families; a matched pair must not be described as a complete three-branch group.' },
  { term: 'Disruption / 破; strain / 害', meaning: 'Names for symbol-pair relationships in the checked tables. They are not diagnoses, damage scores or predictions of harm.' },
  { term: 'Wonjin / 怨嗔; Gwimun / 鬼門', meaning: 'Traditional pair-marker names. Here they are source labels for reflection on friction or sensitivity, a way to discuss sensitivity and misunderstandings without deciding what either person has experienced.' },
  { term: 'Ten Gods / 十神', meaning: 'Traditional names comparing other stems with the birth-day stem. The everyday English headings describe reflection themes, not literal gods or fixed personality types.' },
] as const

/** Only labels actually used in the selected report evidence belong in its glossary. */
export function chartGlossaryFor(evidence: readonly string[]) {
  const used = evidence.filter(fact => !/^No\b/i.test(fact.trim())).join(' ')
  return CHART_GLOSSARY.flatMap(item => {
    const labels = item.term.match(/[\u3400-\u9fff]+/g) ?? []
    const present = labels.filter(label => used.includes(label))
    if (!present.length) return []
    const english = item.term.split(' / ')[0]
    const term = /[A-Za-z]/.test(english) ? `${english} / ${present.join(' / ')}` : present.join(' / ')
    return [{ term, meaning: item.meaning }]
  })
}

export const PAIR_METHOD_NOTE = 'Isolated two-branch comparisons do not claim a complete three-branch punishment group. The report retains directly checked clashes and other pair relationships.'
export const REFERENCE_CLOCK_NOTE = 'Annual and monthly comparison points use 12:00 Asia/Seoul as one shared calculation reference. This is separate from the birthplace time zone used for the birth chart; it does not move an overseas birth to Seoul.'
