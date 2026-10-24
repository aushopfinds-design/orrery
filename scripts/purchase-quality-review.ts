import { mkdirSync, writeFileSync } from 'node:fs'
import { calculateSaju } from '../packages/core/src/saju.ts'
import { CATEGORY_SCENARIOS } from '../src/report/category-catalog.ts'
import { buildInterpretationPlan } from '../src/report/interpretation-plan.ts'
import { customerNarrative, customerPeriod, bundleNarrative } from '../src/report/purchase-narrative.ts'
import { humanMonth } from '../src/report/period-voice.ts'
import { purchaseYears, purchaseMonths } from '../src/report/purchase-timing.ts'
import { buildReview } from '../server/admin-review/report.ts'
import { BUYER_OUTLINES } from '../src/report/buyer-outline.ts'
import { koreanReadingFromPlan } from '../server/admin-review/korean-reading.ts'
import { PREVIEW_KINDS, previewProduct } from '../src/report/personal-products.ts'
const directory=process.argv[2]??'docs/report-r15-review'
mkdirSync(directory,{recursive:true})
const places=[{timezone:'America/New_York',latitude:40.7128,longitude:-74.006},{timezone:'Europe/London',latitude:51.5074,longitude:-0.1278},{timezone:'Australia/Sydney',latitude:-33.8688,longitude:151.2093},{timezone:'Asia/Seoul',latitude:37.5665,longitude:126.978},{timezone:'Asia/Kolkata',latitude:22.5726,longitude:88.3639},{timezone:'America/Sao_Paulo',latitude:-23.55,longitude:-46.6333}]
const inputs=Array.from({length:24},(_,i)=>({...CATEGORY_SCENARIOS[i%2].first,year:1962+i,month:i%12+1,day:5+i%21,hour:4+i%16,minute:17,gender:i%2?'F' as const:'M' as const,unknownTime:i%4===0,...places[i%places.length]}))
const results=[]
for(let i=0;i<inputs.length;i++){
 const chart=calculateSaju(inputs[i]),partner=calculateSaju(inputs[(i+7)%inputs.length])
 const reports=[]
 for(const kind of PREVIEW_KINDS){
  const review=buildReview({kind,first:inputs[i],...(['compatibility','bundle'].includes(kind)?{second:partner.input}:{}),...(['year','bundle'].includes(kind)?{year:2027}:{})},2026)
  reports.push({kind,documents:review.documents.length,pairedPassages:review.documents.reduce((n,d)=>n+d.reviewedClaims.filter(c=>c.id.startsWith('customer.')).length,0),allSourcesPresent:review.documents.every(d=>d.english&&!/NaN|undefined|\[object Object\]/.test(d.english)&&d.koreanOriginal)})
 }
 const states=(rows:ReturnType<typeof purchaseYears>)=>Object.fromEntries(['conditional-opening','opening-with-caution','conditional-support','extra-care','topic-only'].map(state=>[state,rows.filter(r=>r.status===state).length]))
 results.push({buyer:i+1,unknownTime:!!chart.input.unknownTime,timezone:chart.input.timezone,work:states(purchaseYears(chart,2026,'work')),business:states(purchaseYears(chart,2026,'business')),months:states(purchaseMonths(chart,2027)),reports})
}
writeFileSync(directory+'/quality-checks.json',JSON.stringify({buyers:24,products:7,checks:results,scope:'Authored customer chapter passages, actions, cautions, months, longer periods and bundle overview. No external reader study or universal expert certification.'},null,2)+'\n')
const en=['# Seven reports — customer passages','Fictional birth details. Detailed calculation appendices are separate. The collection combines the life, compatibility and annual reports below with a final overview; those reports appear once here.'],ko=['# 7개 상품 — 고객 본문 한국어','가상 출생 정보입니다. 상세 계산 근거는 별도 자료에 있습니다. 전체 묶음은 아래의 종합·궁합·올해 풀이와 마지막 통합 요약으로 구성됩니다. 같은 본문은 여기서 한 번씩 표시합니다.']
for(const kind of ['complete','career','business','compatibility','year','wellbeing'] as const){
 const first=calculateSaju(CATEGORY_SCENARIOS[0].first),second=calculateSaju(CATEGORY_SCENARIOS[0].second),plan=buildInterpretationPlan(kind,first,kind==='year'?2027:2026,kind==='compatibility'?second:undefined)
 en.push('# '+previewProduct(kind).title);ko.push('# '+({complete:'종합 인생',career:'직업·재물',business:'사업',compatibility:'궁합',year:'올해 운세',wellbeing:'성향·강점과 약점'}[kind]))
 const native=customerNarrative(plan), headings=koreanReadingFromPlan(plan).split('\n\n').filter(line=>/^\d{2} · /.test(line)), ids=[...plan.sections.map(x=>x.id),...(kind==='complete'?['next-moves']:[]),...plan.months.map((_,i)=>'month-'+(i+1))]
 for(const [index,id]of ids.entries()){if(id==='month-1'){en.push('## Twelve months at a glance','| Month | Main reading |','| --- | --- |',...plan.months.map((month,i)=>`| ${humanMonth(month.date)} | ${native['month-'+(i+1)].lines[0].en.replace(/\|/g,'/')} |`));ko.push('## 12개월 한눈에 보기','| 월 | 핵심 풀이 |','| --- | --- |',...plan.months.map((month,i)=>`| ${month.date.slice(0,4)}년 ${Number(month.date.slice(5,7))}월 | ${native['month-'+(i+1)].lines[0].ko.replace(/\|/g,'/')} |`))};const s=native[id],title=BUYER_OUTLINES[kind].find(row=>row[0]===id)?.[1]??(id==='next-moves'?'The Next Ten Years':plan.months[Number(id.split('-')[1])-1]?.date.slice(0,7)??id);en.push('## '+title,...s.lines.map(l=>l.en),'Practical point: '+s.action.en,'Main caution: '+s.caution.en);ko.push('## '+(headings[index]??(id==='next-moves'?'앞으로 10년':title)),...s.lines.map(l=>l.ko),'실제로 살필 점: '+s.action.ko,'주의할 점: '+s.caution.ko)}
 if(kind==='complete')plan.selectedCycles.forEach((_,index)=>{en.push('## Longer period',...customerPeriod(plan,index).map(l=>l.en));ko.push('## 긴 흐름',...customerPeriod(plan,index).map(l=>l.ko))})
}
const {first,second}=CATEGORY_SCENARIOS[0],a=calculateSaju(first),b=calculateSaju(second)
const plans={complete:buildInterpretationPlan('complete',a,2026),compatibility:buildInterpretationPlan('compatibility',a,2026,b),annual:buildInterpretationPlan('year',a,2027)}
en.push('# Bundle overview',...bundleNarrative(plans).map(l=>l.en));ko.push('# 묶음의 통합 설명',...bundleNarrative(plans).map(l=>l.ko))
writeFileSync(directory+'/customer-passages-en.md',en.join('\n\n').replace(/\|\n\n(?=\|)/g,'|\n')+'\n');writeFileSync(directory+'/customer-passages-ko.md',ko.join('\n\n').replace(/\|\n\n(?=\|)/g,'|\n')+'\n')
console.log(JSON.stringify({buyers:results.length,outputs:results.reduce((n,r)=>n+r.reports.length,0),allSourcesPresent:results.every(r=>r.reports.every(p=>p.allSourcesPresent)),openingBuyers:results.filter(r=>r.work['conditional-opening']+r.work['opening-with-caution']>0).length}))
