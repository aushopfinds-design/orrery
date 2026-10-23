/** Both full native texts and the exact shared analysis IDs; fictional inputs only. */
import { mkdirSync, writeFileSync } from 'node:fs'
import { buildReview } from '../server/admin-review/report.ts'
import { CATEGORY_SCENARIOS } from '../src/report/category-catalog.ts'
import { PREVIEW_KINDS } from '../src/report/personal-products.ts'
const directory = process.argv[2] ?? 'docs/report-r11-review'
mkdirSync(directory, { recursive: true })
const { first, second } = CATEGORY_SCENARIOS[0]
const reviews = PREVIEW_KINDS.map(kind => buildReview({ kind, first, ...(['compatibility', 'bundle'].includes(kind) ? { second } : {}), ...(['year', 'bundle'].includes(kind) ? { year: 2027 } : {}) }, 2026))
const en = ['# All seven reports — customer English', '', 'Fictional sample. Written from the same plans as all-seven-ko.md. This is not an issued customer purchase.', '']
const ko = ['# 7개 상품 — 관리자용 한국어 원본', '', '가상 출생 입력으로 생성한 전체 한국어 풀이입니다. 영어를 번역한 문서가 아니라 영어와 같은 분석 계획에서 작성한 별도 원문입니다. 의미와 문체는 검수 초안이며, 문단별 일대일 번역본은 아닙니다.', '']
const claims: string[] = ['# 실제 출력의 핵심 판단 문장 대조', '', '격국·용신, 선택된 개인 강약점, 연간·월간 판단의 한영 문장을 같은 판단 ID로 연결했습니다. 이 자료는 전체 영어 문장의 완역 또는 외부 전문가 인증을 뜻하지 않습니다.', '']
const paired = ['# 7개 상품의 한국어 원본·영어 고객용 풀이', '', '아래는 실제 생성된 두 언어의 발췌입니다. 전체 문서는 all-seven-ko.md와 all-seven-en.md입니다. 같은 분석 식별자를 공유하며 문단 수는 다를 수 있습니다.', '']
for (const review of reviews) {
  for (const doc of review.documents) { claims.push(`## ${review.title} · ${doc.title}`); for (const c of doc.reviewedClaims) claims.push(`### ${c.id}`, '', c.english, '', c.korean, '') }
  en.push(`# ${review.title}`, ...review.documents.flatMap(d => [`## ${d.title}`, d.english, '']))
  ko.push(`# ${review.title}`, ...review.documents.flatMap(d => [`## ${d.title}`, d.koreanOriginal, '']))
  paired.push(`## ${review.title}`, '', `분석: ${review.documents[0].analysisId}`, '', '**한국어 원본 발췌**', '', review.documents[0].koreanOriginal.split('\n\n').slice(4, 10).join('\n\n'), '', '**고객 영어 발췌**', '', review.documents[0].english.split('\n\n').slice(0, 12).join('\n\n'), '')
}
writeFileSync(`${directory}/claim-sentence-pairs.md`, claims.join('\n'))
writeFileSync(`${directory}/all-seven-en.md`, en.join('\n\n'))
writeFileSync(`${directory}/all-seven-ko.md`, ko.join('\n\n'))
writeFileSync(`${directory}/seven-products-en-ko.md`, paired.join('\n'))
writeFileSync(`${directory}/sample-manifest.json`, JSON.stringify({ edition: reviews[0].edition, sourceMode: 'parallel-analysis', first, second, referenceYear: 2026, annualYear: 2027, products: reviews.map(r => ({ kind: r.kind, documents: r.documents.map(d => ({ title: d.title, analysisId: d.analysisId, englishCharacters: d.english.length, koreanCharacters: d.koreanOriginal.length, pairedClaims: d.reviewedClaims.length, sentenceReview: d.sentenceReview })) })) }, null, 2) + '\n')
console.log(JSON.stringify(reviews.map(r => ({ kind: r.kind, documents: r.documents.length, english: r.documents.reduce((n, d) => n + d.english.length, 0), korean: r.documents.reduce((n, d) => n + d.koreanOriginal.length, 0) }))))
