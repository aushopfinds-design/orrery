import type { BirthInput } from '@orrery/core/types'
import { calculateSaju } from '@orrery/core/saju'
import { STEMS, STEM_ELEMENTS } from './reading.ts'
import { ELEMENT_SYMBOLS } from './symbolic-colors.ts'

const NATURAL_STRENGTHS: Record<string, string> = {
  '甲': 'You can give a scattered idea a direction that other people can understand.',
  '乙': 'You may spot a workable alternative when a direct approach has stopped helping.',
  '丙': 'You can make an unfamiliar idea feel approachable enough for someone to try.',
  '丁': 'You may notice the small change that makes something easier for another person to use.',
  '戊': 'You can turn a vague promise into something practical that a group can rely on.',
  '己': 'You may make useful progress through small improvements that others overlook.',
  '庚': 'You can name the decision a group has been avoiding and help it move forward.',
  '辛': 'You may see the finishing detail that makes a message or piece of work feel considered.',
  '壬': 'You can connect information from different places and see an option others missed.',
  '癸': 'You may notice an overlooked concern and ask a question that makes it easier to discuss.',
}

function birthSummary(input: BirthInput) {
  const date = new Date(Date.UTC(input.year, input.month - 1, input.day)).toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
  const time = input.unknownTime ? 'birth time unknown' : `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`
  return `${date} · ${time} · ${input.timezone ?? 'Asia/Seoul'}`
}

export function buildFreeGlimpse(input: BirthInput) {
  const chart = calculateSaju(input)
  const stem = chart.pillars[1].pillar.stem
  const element = STEM_ELEMENTS[stem]
  const symbols = ELEMENT_SYMBOLS[element]
  const strength = NATURAL_STRENGTHS[stem]
  if (!element || !symbols || !strength) throw new Error('A valid birth-day chart is needed for this preview')
  return {
    birthSummary: birthSummary(input),
    personality: `${STEMS[stem].approach} ${STEMS[stem].caution}`,
    strength,
    symbol: { element, colors: symbols.colors.slice(0, 2).map(color => ({ ...color })), numbers: [...symbols.numbers] as [number, number] },
    timeUnknown: Boolean(input.unknownTime),
  }
}
