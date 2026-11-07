import type { ReportChapter } from './complete-reading.ts'
/** Five topic answers once at the front; full arguments remain in their chapters. */
export function reportOverview(chapters: ReportChapter[], targetedProduct01 = true) {
  const order = ['personality','money','career','love','patterns']
  const isComplete = targetedProduct01 && chapters.some(c=>c.id==='personality')
  const selected = isComplete ? order.map(id=>chapters.find(c=>c.id===id)).filter((c):c is ReportChapter=>Boolean(c)) : chapters.slice(0,5)
  // The opening page is a contents map, not a second copy of each chapter's
  // first sentence. Keep it brief and let the reader reach the interpretation.
  const descriptions=['Your personal nature and the different roles you carry.','How your chart connects earning routes with the resources needed to keep money.','The work settings and responsibilities that best fit your chart.','Your private needs, relationship patterns and timing themes.','A guide to the years that stand out and the reason each one does.']
  return selected.map((c,index)=>{
    const label=c.title.replace(/^\d+ · /,'')
    if (!isComplete && c.id === 'two-directions') {
      const perspectives=[c.lead,...c.paragraphs]
      const yours=perspectives.find(line=>/^From your side:|^You:/.test(line))
      const partner=perspectives.find(line=>/^From your partner(?:'|’)s side:|^Your partner:/.test(line))
      if(yours&&partner){
        const clean=(line:string,prefix:RegExp)=>line.replace(prefix,'').replace(/^(?:The )?attraction may be\s*/i,'').replace(/\s+stand out[.!?]*$/i,'').replace(/[.!?]+$/u,'').trim().replace(/^(.+?) may feel (.+)$/i,'$1 that feels $2').replace(/^./u,char=>char.toLowerCase())
        return {label,text:`You may be drawn to ${clean(yours,/^(?:From your side:|You:)\s*/)}, while your partner may be drawn to ${clean(partner,/^(?:From your partner(?:'|’)s side:|Your partner:)\s*/)}.`}
      }
    }
    return {label,text:!isComplete?(c.lead.match(/^.*?[.!?](?=\s|$)/)?.[0]??c.lead):descriptions[index]??'A chart-based reading for this part of your life.'}
  })
}
export function reportOverviewText(chapters: ReportChapter[], targetedProduct01 = true) {
 return ['Your reading at a glance',...reportOverview(chapters,targetedProduct01).map(item=>item.label+' — '+item.text)].join('\n\n')
}
