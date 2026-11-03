import type { ReportChapter } from './complete-reading.ts'
/** Five topic answers once at the front; full arguments remain in their chapters. */
export function reportOverview(chapters: ReportChapter[], targetedProduct01 = true) {
  const order = ['personality','money','career','love','patterns']
  const isComplete = targetedProduct01 && chapters.some(c=>c.id==='personality')
  const selected = isComplete ? order.map(id=>chapters.find(c=>c.id===id)).filter((c):c is ReportChapter=>Boolean(c)) : chapters.slice(0,5)
  // The opening page is a contents map, not a second copy of each chapter's
  // first sentence. Keep it brief and let the reader reach the interpretation.
  const descriptions=['Your personal nature and the different roles you carry.','How your chart connects earning routes with the resources needed to keep money.','The work settings and responsibilities that best fit your chart.','Your private needs, relationship patterns and timing themes.','A guide to the years that stand out and the reason each one does.']
  return selected.map((c,index)=>({label:c.title.replace(/^\d+ · /,''),text:!isComplete?(c.lead.match(/^.*?[.!?](?=\s|$)/)?.[0]??c.lead):descriptions[index]??'A chart-based reading for this part of your life.'}))
}
export function reportOverviewText(chapters: ReportChapter[], targetedProduct01 = true) {
 return ['Your reading at a glance',...reportOverview(chapters,targetedProduct01).map(item=>item.label+' — '+item.text)].join('\n\n')
}
