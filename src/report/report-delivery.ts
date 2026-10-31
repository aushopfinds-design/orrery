import type { ReportChapter } from './complete-reading.ts'

export const CALCULATION_NOTES = 'Calculation notes'
/** Keep the reading first. Evidence remains available once in a labelled appendix. */
export function splitDeliveredReading(text: string): { body: string; appendix: string } {
  const marker = '\n\n' + CALCULATION_NOTES + '\n\n'
  const at = text.indexOf(marker)
  return at < 0 ? { body: text, appendix: '' } : { body: text.slice(0, at), appendix: text.slice(at + marker.length) }
}
export function deliveredChapter(chapter: ReportChapter): string[] {
  const action = 'Practical point: ' + chapter.tryThis
  const caution = 'Main caution: ' + chapter.guidance.watchFor.join(' ')
  const lines = [chapter.lead, ...chapter.paragraphs]
    .filter(line => line !== chapter.tryThis && !chapter.guidance.watchFor.includes(line))
  return [chapter.title, ...new Set(lines), ...(chapter.showGuidance === false ? [] : [action, [caution]])]
}
export function calculationAppendix(groups: { title: string; evidence: string[] }[]): string {
  const seen = new Set<string>()
  const blocks = groups.flatMap(group => {
    const facts = group.evidence.filter(fact => { if (!fact || seen.has(fact)) return false; seen.add(fact); return true })
    return facts.length ? [group.title, ...facts.map(fact => 'From the chart: ' + fact)] : []
  })
  return [CALCULATION_NOTES, ...blocks].join('\n\n')
}
/** The focus explanation belongs with the calculation sheet in a delivered report. */
export function withoutFocusEvidence(text: string): string {
  return text.split('\n\n').filter(block => !block.startsWith('Why this focus:')).join('\n\n')
}
