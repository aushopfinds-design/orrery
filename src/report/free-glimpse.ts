import type { BirthInput } from '@orrery/core/types'
import type { Locale } from '../i18n/store.ts'
import { calculateSaju } from '@orrery/core/saju'
import { STEMS, STEM_ELEMENTS } from './reading.ts'
import type { ReadingElement } from './reading.ts'
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

const KOREAN_STRENGTHS: Record<string, string> = {
  '甲': '흩어진 생각에 방향을 더해 다른 사람도 이해할 수 있게 정리하는 힘이 있습니다.',
  '乙': '정면 돌파가 어려울 때 실행할 수 있는 다른 방법을 찾아내는 편입니다.',
  '丙': '낯선 생각도 다른 사람이 시도해 볼 수 있도록 쉽게 풀어내는 힘이 있습니다.',
  '丁': '다른 사람에게 더 편리한 경험을 만들어 주는 작은 변화를 알아차립니다.',
  '戊': '막연한 약속을 여럿이 믿고 따를 수 있는 실질적인 계획으로 바꿉니다.',
  '己': '다른 사람이 지나치기 쉬운 작은 개선을 차근차근 쌓아 갑니다.',
  '庚': '모두가 미뤄 온 결정을 분명히 짚고 다음 단계로 나아가도록 돕습니다.',
  '辛': '메시지나 결과물을 더 세심하게 만드는 마무리의 차이를 알아봅니다.',
  '壬': '여러 곳의 정보를 연결해 다른 사람이 놓친 선택지를 찾아냅니다.',
  '癸': '간과된 걱정을 알아차리고 편하게 이야기할 수 있는 질문을 건넵니다.',
}
const KOREAN_PERSONALITY: Record<string, string> = {
  '甲': '분명한 길을 세우고 더 큰 목표를 향해 나아가려는 성향이 있습니다. 계획이 바뀌면 답답함을 느낄 수 있어 상황에 맞게 방향을 조정하는 여유가 도움이 됩니다.',
  '乙': '작은 변화를 알아차리고 장애물을 돌아가는 방법을 찾는 편입니다. 다른 사람에게 맞추다 보면 자신의 필요를 뒤로 미루지 않도록 살펴보세요.',
  '丙': '열정과 개방적인 태도로 사람들을 연결하는 성향이 있습니다. 모두에게 응답하려다 집중력이 소진되지 않도록 혼자만의 시간도 챙기는 편이 좋습니다.',
  '丁': '세심한 관심과 따뜻함, 목적의식으로 빛나는 편입니다. 사소한 결정까지 크게 고민하지 않도록 시작 전에 충분한 기준을 정해 두면 좋습니다.',
  '戊': '꾸준한 약속과 실질적인 책임을 중요하게 여기는 편입니다. 혼자 너무 많이 짊어지기보다 필요한 도움을 나누어 요청하는 것이 도움이 됩니다.',
  '己': '인내심을 갖고 쓸모 있는 일을 차근차근 키워 가는 성향이 있습니다. 다른 사람을 돌보느라 자신의 계획을 미루지 않도록 챙겨 보세요.',
  '庚': '직접적인 답과 분명한 기준, 눈에 보이는 진전을 선호하는 편입니다. 기준을 전할 때 그 이유를 함께 설명하면 의도가 더 잘 전달됩니다.',
  '辛': '완성도와 미묘한 차이, 알맞은 표현에 주의를 기울입니다. 완벽한 결과만 기다리다가 좋은 일을 미루지 않도록 적절한 시점을 정해 보세요.',
  '壬': '아이디어를 연결하고 여러 가능성을 살펴보는 것을 즐기는 편입니다. 흥미로운 선택지가 많을수록 작은 실험 하나를 정해 끝까지 해보면 도움이 됩니다.',
  '癸': '관찰하고 귀 기울이며 질문을 통해 배우는 성향이 있습니다. 생각을 혼자 간직하기보다 필요한 바를 분명히 나누면 주변 사람도 이해하기 쉽습니다.',
}
const KOREAN_ELEMENTS: Record<ReadingElement, string> = { Wood: '목(木)', Fire: '화(火)', Earth: '토(土)', Metal: '금(金)', Water: '수(水)' }
const KOREAN_COLORS: Record<string, string> = { 'Blue-green': '청록색', 'Leaf green': '잎사귀 초록색', Red: '빨강', 'Warm coral': '따뜻한 산호색', Yellow: '노랑', Sand: '모래색', White: '흰색', 'Soft silver': '은은한 은색', Black: '검정', 'Deep navy': '짙은 남색' }

function birthSummary(input: BirthInput, locale: Locale) {
  const date = new Date(Date.UTC(input.year, input.month - 1, input.day)).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })
  const time = input.unknownTime ? (locale === 'ko' ? '출생 시간 미상' : 'birth time unknown') : `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`
  return `${date} · ${time} · ${input.timezone ?? 'Asia/Seoul'}`
}

export function buildFreeGlimpse(input: BirthInput, locale: Locale = 'en') {
  const chart = calculateSaju(input)
  const stem = chart.pillars[1].pillar.stem
  const element = STEM_ELEMENTS[stem]
  const symbols = ELEMENT_SYMBOLS[element]
  const strength = locale === 'ko' ? KOREAN_STRENGTHS[stem] : NATURAL_STRENGTHS[stem]
  if (!element || !symbols || !strength) throw new Error('A valid birth-day chart is needed for this preview')
  return {
    birthSummary: birthSummary(input, locale),
    personality: locale === 'ko' ? KOREAN_PERSONALITY[stem] : `${STEMS[stem].approach} ${STEMS[stem].caution}`,
    strength,
    symbol: { element, colors: symbols.colors.slice(0, 2).map(color => ({ ...color, name: locale === 'ko' ? KOREAN_COLORS[color.name] : color.name })),
      elementLabel: locale === 'ko' ? KOREAN_ELEMENTS[element] : element, numbers: [...symbols.numbers] as [number, number] },
    timeUnknown: Boolean(input.unknownTime),
  }
}
