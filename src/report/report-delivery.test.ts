import { describe, expect, it } from 'vitest'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS } from './category-catalog.ts'
import { buildCompleteReading } from './complete-reading.ts'
import { buildCategoryReading, buildBundleReading } from './category-readings.ts'
import { buildPersonalPreview } from './personal-preview.ts'
import { splitDeliveredReading } from './report-delivery.ts'
const first = { ...CATEGORY_SCENARIOS[0].first, unknownTime: true }
const a = calculateSaju(first), b = calculateSaju(CATEGORY_SCENARIOS[0].second)
describe('Customer reading before its calculation appendix', () => {
  it.each(['complete','career','business','compatibility','year','wellbeing','bundle'] as const)('%s retains evidence behind the full customer reading', kind => {
    const report = kind === 'complete' ? buildCompleteReading(a, 2026) : kind === 'bundle' ? buildBundleReading(a,b,2027,2026) : buildCategoryReading(kind,a,{second:kind==='compatibility'?b:undefined,year:kind==='year'?2027:2026})
    const parts = splitDeliveredReading(report.fullText)
    expect(parts.body).not.toContain('From the chart:')
    expect(parts.body).not.toContain('Why this focus:')
    expect(parts.appendix).toContain('From the chart:')
    expect(parts.body).toContain('Practical point:')
    expect(parts.body).toContain('Main caution:')
    const evidence = parts.appendix.split('\n\n').filter(line=>line.startsWith('From the chart:'))
    if(kind!=='bundle')expect(new Set(evidence).size).toBe(evidence.length)
    if('chapters' in report)for(const chapter of report.chapters)for(const fact of chapter.evidence)expect(parts.appendix).toContain(fact)
    if('complete' in report)for(const title of [report.complete.title,report.compatibility.title,report.annual.title])expect(parts.body).toContain(title)
  })
  it('opens every personal preview with actual interpretation, including unknown-time charts', () => {
    for(const kind of ['complete','career','business','compatibility','year','wellbeing','bundle'] as const){
      const preview=buildPersonalPreview(kind,{first,second:b.input,year:2027})
      for(const excerpt of preview.excerpts){
        expect(excerpt.lead).not.toMatch(/^(Reading basis:|About this reading:)/)
        expect(excerpt.paragraphs.join(' ')).not.toMatch(/Reading basis:|About this reading:/)
      }
    }
  })
  it('does not reuse complete money and relationship paragraphs across twelve months', () => {
    const report=buildCategoryReading('year',a,{year:2027})
    const paragraphs=report.months.flatMap(month=>month.paragraphs).filter(line=>/^(Money:|At home:)/.test(line))
    expect(paragraphs).toHaveLength(24)
    expect(new Set(paragraphs).size).toBe(paragraphs.length)
  })
})
