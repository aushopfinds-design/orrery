/** Fictional review fixtures only; no provider, private order or live payment calls. */
import { mkdirSync, writeFileSync } from 'node:fs'
import type { SajuResult } from '../packages/core/src/types.ts'
import { calculateSaju } from '../packages/core/src/saju.ts'
import { CATEGORY_SCENARIOS } from '../src/report/category-catalog.ts'
import { structuralAssessment, periodAssessment } from '../src/report/structural-assessment.ts'
import { timingPoint } from '../src/report/traditional-analysis.ts'
const folder = 'docs/report-r9-review'
mkdirSync(folder, { recursive: true })
const ko = { supported: '이 보수적인 규칙에서는 일간이 도움을 받는 쪽으로 기웁니다. 월지의 중심 기운이 일간을 돕고, 중심 지장간에 같은 오행의 뿌리가 있으며, 겉으로 드러난 천간에서도 도움이 확인되기 때문입니다. 모든 학파가 합의한 신강 확정 판정은 아닙니다.', 'support-needed': '이 보수적인 규칙에서는 일간에 도움이 필요한 쪽으로 기웁니다. 월지의 중심 기운은 일간을 돕지 않고, 같은 오행의 뿌리가 없으며, 드러난 천간에는 도움과 부담이 함께 있습니다. 재물 기회가 보여도 감당할 부담을 함께 읽습니다. 신약을 확정한 전문가 판정은 아닙니다.', mixed: '도움과 부담의 근거가 엇갈립니다. 계절·뿌리·드러난 십성이 같은 결론을 가리키지 않으므로, 신강이나 신약 중 하나를 억지로 선택하지 않습니다.', deferred: '출생시간이 없거나 특수한 구조를 따로 검토해야 하므로, 강약 판단을 보류합니다. 모르는 시간을 채워 넣거나 종격·합화를 임의로 확정하지 않습니다.' }
const examples = CATEGORY_SCENARIOS[0]
const a = calculateSaju(examples.first), b = calculateSaju(examples.second)
const population = Array.from({ length: 24 }, (_, i) => {
  const input = { ...CATEGORY_SCENARIOS[i % 2].first, year: 1960 + i, month: i % 12 + 1, day: 5 + i % 20, unknownTime: i % 5 === 0 }
  const result = calculateSaju(input), assessment = structuralAssessment(result)
  const point = timingPoint(result, 2027)
  return { input, tendency: assessment.tendency, signals: assessment.signals, monthExposures: assessment.monthlyHidden, patternCandidate: assessment.patternCandidate ?? null, annual: periodAssessment(result, point.pillar, point.date) }
})
writeFileSync(`${folder}/structural-audit.json`, JSON.stringify({ policy: 'FATE-qualitative-r1', status: 'provisional-review-only', expertValidated: false, examples, population }, null, 2) + '\n')
const lines = ['# 7개 상품 — 새 구조 분석의 영어·한국어 대조', '', 'r9 가상 샘플. 아래는 새 분석 부분의 발췌 대조이며 7개 리포트 전체 한국어 완역본은 아닙니다. 영어 전문은 all-seven-en.md에 있습니다. 한국어는 검수용으로 작성했으며 공급자 번역을 호출하지 않았습니다.', '', '**주의: 조건을 명시한 자체 보수적 규칙입니다. 정통 명리학 전체의 합의나 전문가 검증을 받았다는 뜻이 아닙니다.**', '']
for (const kind of ['Complete', 'Compatibility', 'Year', 'Career', 'Business', 'Wellbeing', 'Bundle']) {
  lines.push(`## ${kind}`, '')
  const people: [string, SajuResult][] = [['Person A', a]]
  if (['Compatibility', 'Bundle'].includes(kind)) people.push(['Person B', b])
  for (const [label, chart] of people) {
    const reading = structuralAssessment(chart)
    lines.push(`### ${label}`, '', '**English — support assessment**', '', reading.verdict, '', '**한국어 — 도움과 부담의 종합**', '', ko[reading.tendency], '', '**English — structure and balancing candidates**', '', reading.paragraphs[3], '', reading.balanceText, '', '**한국어 — 격국·용신 후보의 범위**', '', `월지의 지장간이 겉의 천간에 같은 글자로 나타나는지 확인했습니다. ${reading.patternCandidate ? `확인된 후보의 근거 글자는 ${reading.patternCandidate.stem}, 십성은 ${reading.patternCandidate.god}입니다. 어디까지나 월령에 기초한 격국 후보이며, 성격·파격이나 유리한 용신을 확정한 것은 아닙니다.` : '일반 격국 후보를 하나로 확정할 근거가 부족하거나, 비겁 월령의 별도 판단이 필요합니다.'} 억부 관점의 균형 후보군과 격국의 후보는 구분합니다. 조후·종격·합화까지 종합한 단일 용신은 정하지 않았습니다.`, '')
    const p = timingPoint(chart, 2027), flow = periodAssessment(chart, p.pillar, p.date)
    lines.push('**English — actual 2027 reference and active cycle**', '', flow.text, '', '**한국어 — 시기 해석의 범위**', '', `실제 비교 간지는 ${p.pillar}, 대표 날짜는 ${p.date}입니다. ${flow.cycle ? `그 날짜에 계산상 진행 중인 대운은 ${flow.cycle.ganzi}입니다.` : '해당 날짜의 진행 대운이 계산 범위에 없어 유리·불리 판정을 보류합니다.'} ${flow.direction === 'unresolved' ? '출생 사주의 강약이나 진행 대운에 미확정 항목이 있어 길흉을 단정하지 않습니다.' : '두 시기 층의 도움과 부담이 같은 방향인지 비교한 조건부 해석이며 사건을 예측한 결과는 아닙니다.'} ${flow.tension ? '충·형·해·파에 해당하는 마찰도 별도로 확인되므로 긍정적인 균형 해석만으로 덮지 않습니다.' : '확인된 마찰 신호가 없더라도 편안한 시기가 보장되는 것은 아닙니다.'}`, '')
  }
}
writeFileSync(`${folder}/seven-products-en-ko.md`, lines.join('\n'))
console.log(JSON.stringify(population.reduce<Record<string, number>>((counts, item) => ({ ...counts, [item.tendency]: (counts[item.tendency] ?? 0) + 1 }), {})))
