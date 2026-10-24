import type { StructureResolution } from '../../src/report/structure-resolution.ts'
import { resolutionClaimIds } from '../../src/report/resolution-language.ts'
const CODE: Record<string, string> = {
  'output-to-money': '식상과 재성이 확인한 자리에 함께 있습니다. 기술과 표현을 유료 상품으로 연결하는 경로를 읽되, 이것만으로 식상생재의 성격이나 재물 성과를 확정하지 않습니다.',
  'money-to-authority': '재성과 정관이 확인한 자리에 함께 있습니다. 거래 기회에 계약·기준·책임이 따라오는 구조로 읽습니다.',
  'authority-to-resource': '관성과 인성이 확인한 자리에 함께 있습니다. 책임의 크기뿐 아니라 이를 감당할 교육·지원·처리 방법을 함께 살핍니다.',
  'output-checks-pressure': '식신과 편관이 확인한 자리에 함께 있습니다. 기술로 압박을 다룰 수 있는지는 원국의 지원을 함께 봐야 하며, 존재만으로 식신제살이 성립했다고 확정하지 않습니다.',
  'expression-versus-authority': '상관과 정관이 모두 투출했습니다. 기준을 비판하는 표현과 공식 권한이 충돌할 수 있어 직장에서 결정권과 기준에 관한 마찰을 살핍니다.',
  'resource-versus-output': '편인과 식신이 모두 투출했습니다. 전문적인 분석과 준비가 실제 납품에 필요한 꾸준함과 경쟁할 수 있으나, 이것만으로 식신이 파괴됐다고 단정하지 않습니다.',
  'money-versus-resource': '재성과 인성이 모두 투출했습니다. 거래상 의무와 준비에 필요한 시간·지원이 서로 다른 방향을 향할 수 있어 실제 위치를 함께 살핍니다.',
  'money-adds-pressure': '재성과 편관이 모두 투출했습니다. 고객 업무가 늘면서 이행해야 할 의무가 커질 수 있어 재물 활동의 증가를 곧 편한 재물운으로 보지 않습니다.',
  'mixed-authority': '정관과 편관이 모두 투출했습니다. 정해진 규칙과 긴급한 요구가 경쟁하는 구조로 읽으며, 사람의 부정직함이나 실제 사건을 단정하지 않습니다.',
}
const REASON: Record<string, string> = {
  'unknown-hour': '출생시간이 미상임', 'special-structure-or-combination': '특수 구조나 완성된 합의 별도 판단이 필요함', 'unresolved-strength': '지원과 부담이 한 방향으로 정리되지 않음',
  'peer-led-month': '비겁 월령의 별도 규칙이 필요함', 'no-clear-exposed-month-anchor': '투출한 월령 지장간 하나로 중심을 잡을 수 없음', 'climate-priority-unresolved': '계절적 조후가 우선순위를 바꿀 수 있음',
  'anchor-stem-combination': '격국 중심 후보의 천간에 합이 있음', 'competing-exposed-relationships': '투출한 관계 사이에 경쟁이 남음', 'month-branch-friction': '월지에 확인된 마찰 관계가 있음', 'no-supported-single-route': '투출과 통근을 함께 갖춘 단일 경로가 정책 조건을 충족하지 않음',
  'pattern-route-unresolved': '월령 격국에 정책상 근거를 갖춘 일반 경로가 정리되지 않음',
}
const ELEMENT: Record<string, string> = { Wood: '목', Fire: '화', Earth: '토', Metal: '금', Water: '수' }
const ROUTE: Record<string, string> = { 'resource-before-demand': '부담을 맡기 전에 인성의 지원을 확보하는 경로', 'output-before-money': '식상으로 힘을 표현하고 재물 활동에 연결하는 경로', 'authority-with-money': '재성이 동반된 정관의 책임을 활용하는 경로' }
export function resolutionKorean(r: StructureResolution) {
  const text = [
    '월령을 중심으로 정하는 격국과 억부 관점의 균형용신은 서로 다른 판단입니다. 아래의 조건부 우선순위는 정해진 일반 명식 정책 안에서만 적용되며, 보편적인 행운의 오행이나 성과 보장이 아닙니다.',
    r.pattern.status === 'month-anchored' ? `월령 지장간 ${r.pattern.stem}이 ${r.pattern.exposedAt.join('·')}에 투출하여 ${r.pattern.god}를 격국의 중심으로 잡습니다. 아래는 이를 돕거나 경쟁하는 관계의 점검이며 격국 성패 전체를 인증하는 판정은 아닙니다.` : '확인한 근거만으로 일반 격국을 완성된 형태로 정하지 않습니다. 월령의 관계는 남기되 격국 이름을 강제로 붙이지 않습니다.',
    ...r.circuits.map(c => CODE[c.code]), ...r.risks.map(c => CODE[c.code]),
    r.useful.status === 'conditional' ? `이 일반 억부 정책에서는 ${ELEMENT[r.useful.element!]}을 조건부 우선 기운으로 읽습니다. 근거는 ${ROUTE[r.useful.route!]}이며 해당 천간이 투출하고 통근한 것을 함께 확인했습니다. 색·구매·건강 처방이나 특정 시기의 길운을 보장하는 뜻은 아닙니다.` : `하나의 균형용신을 선택하지 않습니다. 이유는 ${r.useful.reasons.map(code => REASON[code]).join('; ')}입니다. 없는 오행을 곧 필요한 오행으로 정하지 않습니다.`,
  ]
  return resolutionClaimIds(r).map((id, i) => ({ id, text: text[i] }))
}
