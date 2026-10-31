import type { InterpretationPlan } from './interpretation-plan.ts'
import { pair, type Passage } from './purchase-language.ts'
import { BUYER_ANSWERS } from './buyer-answers.ts'
/** Suitability is a chart interpretation of a route plus capacity, never a success prediction. */
export function businessVerdict(p:InterpretationPlan['primary']):Passage{
 const outputMoney=p.resolution.circuits.some(c=>c.code==='output-to-money')
 const professional=p.resolution.circuits.some(c=>c.code==='authority-to-resource')
 const money=p.visibleMoney.length>0
 if(p.strength.signals.unknownTime)return pair(`${BUYER_ANSWERS[p.monthStemGod].founder.en}${outputMoney?' Your chart also links the work you produce with customers and money.':''} The suitable scale and workload remain less certain without a birth time.`,`${BUYER_ANSWERS[p.monthStemGod].founder.ko}${outputMoney?' 결과물을 만드는 특징과 고객·재물도 연결됩니다.':''} 출생시간이 없어 맞는 사업 규모와 감당할 업무량은 분명히 정하기 어렵습니다.`)
 if(outputMoney)return p.strength.tendency==='supported'?pair('Business is a plausible fit when a skill or product you can deliver is what earns the sale. Your chart links producing useful work with customers and money, with support for carrying the workload.','제공할 수 있는 기술이나 상품으로 판매를 만드는 사업이 맞는 쪽으로 읽습니다. 결과물을 만드는 특징과 고객·재물이 연결되고 업무를 감당할 바탕도 함께 나타납니다.')
 :p.strength.tendency==='support-needed'?pair('Your chart has a route from skills to sales, but running the whole operation alone looks more demanding. Business suitability here depends on support for delivery and costs, not simply on finding customers.','기술을 판매로 연결하는 통로는 있지만 운영 전체를 혼자 맡는 부담은 큰 쪽으로 읽습니다. 고객 확보만이 아니라 납품과 비용을 감당할 도움을 갖추는지가 사업 적합성의 조건입니다.')
 :pair('Your chart connects useful skills with sales, so business has a meaningful place in the reading. The less settled part is how much extra work and financial responsibility you can carry at once.','기술과 판매가 연결되어 사업을 살펴볼 근거가 있습니다. 다만 추가 업무와 재정적인 책임을 한 번에 얼마나 감당할지는 분명히 정하기 어려운 부분입니다.')
 if(money&&['正財','偏財'].includes(p.monthStemGod))return pair('A customer-facing business is a plausible fit: finding buyers, handling transactions or keeping regular accounts has a clear place in your chart. The practical limit is whether delivery and available money can keep pace with sales.','고객을 상대하는 사업이 맞는 쪽으로 읽습니다. 구매자를 찾고 거래하거나 꾸준한 고객을 관리하는 특징이 사주에 나타납니다. 판매에 맞춰 납품과 쓸 수 있는 자금도 따라가는지가 현실적인 한계입니다.')
 if(professional)return pair('An expertise-led service is a clearer business route than relying on fast sales alone. Your chart connects responsibility with learning or specialist support; the commercial side still needs a separate check.','빠른 판매만 추구하기보다 전문성을 제공하는 서비스가 더 분명한 사업 통로입니다. 책임과 배움·전문 지원이 연결되며 실제 수입을 만드는 부분은 따로 살펴야 합니다.')
 return pair(`Your chart gives a more specific answer about how to work than a broad yes to business ownership. ${BUYER_ANSWERS[p.monthStemGod].founder.en}`,`사업 전체가 맞는다고 넓게 판단하기보다 어떤 방식으로 일하는지가 더 구체적으로 드러납니다. ${BUYER_ANSWERS[p.monthStemGod].founder.ko}`)
}
export function lifeWork(p:InterpretationPlan['primary']):Passage{
 const g=p.monthStemGod
 if(['食神','傷官'].includes(g))return pair('Your work story centres on what you create or improve. The recurring choice is how to turn that contribution into a role that gives you room to use it.','직업의 큰 줄기는 무엇을 만들고 개선하는지에 있습니다. 그 기여를 발휘할 여지가 있는 역할로 연결하는 선택이 반복되는 주제입니다.')
 if(['正財','偏財'].includes(g))return pair('Work and money are closely linked in your life reading. Managing customers, exchanges or continuing commitments is a recurring responsibility, rather than a separate financial topic.','인생 풀이에서 일과 재물이 가깝게 연결됩니다. 고객과 거래, 계속 맡을 일을 다루는 책임이 단순한 금전 문제를 넘어 반복되는 주제입니다.')
 if(['正官','偏官'].includes(g))return pair('Responsibility is a strong thread in your working life. The turning point is whether a larger role gives you real authority or simply more to carry.','직업 인생에서는 책임이 중요한 줄기로 나타납니다. 역할이 커질 때 실제 권한이 생기는지, 맡을 일만 늘어나는지가 갈림길입니다.')
 if(['正印','偏印'].includes(g))return pair('Knowledge is a lasting source of value in your work story. The important transition is from learning or understanding something to using it where other people need it.','지식이 직업 인생에서 오래 쓰는 가치로 나타납니다. 배우고 이해하는 데서 다른 사람에게 필요한 곳에 실제로 쓰는 단계로 옮기는 일이 중요합니다.')
 return pair('Independence and other people’s expectations run through your working life. Having your own area matters, but so does how you share decisions, costs and credit.','독립성과 주변의 기대가 직업 인생의 줄기로 나타납니다. 자기 영역을 갖는 일과 함께 결정·비용·공로를 어떻게 나누는지도 중요합니다.')
}

export function partnerVerdict(p:InterpretationPlan['primary']):Passage{
 const god=p.yearStemGod
 if(['正印','偏印'].includes(god))return pair('A partnership is more useful here when it adds knowledge, a reliable method or support you would otherwise have to provide yourself. The contribution needs to become usable work, not just reassurance.','직접 마련해야 할 지식과 믿을 수 있는 방법, 지원을 더해 주는 동업이 더 유용한 쪽으로 읽습니다. 안심시키는 말뿐 아니라 실제로 쓸 수 있는 업무 기여가 중요합니다.')
 if(['比肩','劫財'].includes(god))return pair('Partnership brings a stronger question about shared control. Working with an equal can widen what you do, but overlapping authority can turn an ordinary decision into a contest.','동업에서는 공동 결정권의 문제가 더 두드러집니다. 동등한 사람이 범위를 넓혀 줄 수 있지만 권한이 겹치면 평범한 결정도 경쟁으로 바뀔 수 있습니다.')
 if(['食神','傷官'].includes(god))return pair('Partnership is more useful when it adds a skill, a better product or a clearer way to sell it. A second voice without a defined piece of delivery can make the offer harder to finish.','기술과 개선된 상품, 더 분명한 판매 방식을 더해 주는 동업이 더 유용합니다. 제공할 결과를 맡지 않은 채 의견만 더해지면 상품을 마치기 어려울 수 있습니다.')
 if(['正財','偏財'].includes(god))return pair('Your partnership reading puts customers, fees and financial commitments first. A partner can extend commercial reach, while unclear ownership of the income is the main point to resolve.','동업에서는 고객과 대금, 재정적인 약속을 먼저 읽습니다. 거래의 범위를 넓혀 줄 수 있지만 수입이 누구에게 속하는지는 먼저 해결해야 할 부분입니다.')
 return pair('A partnership needs a clear division of responsibility to suit this reading. Someone who takes real ownership of an area is more useful than a second person directing the same work.','책임을 분명히 나누는 동업이 더 맞는 쪽으로 읽습니다. 같은 일에 지시를 더하는 사람보다 한 영역을 실제로 책임지는 사람이 더 유용합니다.')
}
