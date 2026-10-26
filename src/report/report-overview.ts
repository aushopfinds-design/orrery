import type { ReportChapter } from './complete-reading.ts'
/** Five topic answers once at the front; full arguments remain in their chapters. */
export function reportOverview(chapters: ReportChapter[]) {
  const order = ['personality','money','career','love','patterns']
  const selected = chapters.some(c=>c.id==='personality') ? order.map(id=>chapters.find(c=>c.id===id)).filter((c):c is ReportChapter=>Boolean(c)) : chapters.slice(0,5)
  return selected.map(c=>({label:c.title.replace(/^\d+ · /,''),text:c.lead.match(/^.*?[.!?](?=\s|$)/)?.[0]??c.lead}))
}
export function reportOverviewText(chapters: ReportChapter[]) {
 return ['Your reading at a glance',...reportOverview(chapters).map(item=>item.label+' — '+item.text)].join('\n\n')
}
