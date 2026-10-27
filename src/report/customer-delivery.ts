/** Short customer appendix; the source report retains its full calculation evidence. */
export function customerDeliveryText(text:string):string {
 let appendix=false
 const seen=new Set<string>()
 return text.split(/\n\n/).filter(block=>{
  if(block==='Calculation notes'){appendix=true;return true}
  if(/^THE FATE KEY · /.test(block)){appendix=false;seen.clear();return true}
  if(!appendix)return true
  // Internal policy decisions are not additional chart facts. Keep dated pillars,
  // pair relationships, roots and the glossary, without repeating audit diagnostics.
  if(/(?:Activity policy FATE-|Assessment FATE-|Structural interpretation policy:|No judgement about whether the period|balance of support and demands in your birth chart or a current longer period is unresolved)/.test(block))return false
  const key=block.replace(/^From the chart: /,'').replace(/\s+/g,' ').trim()
  if(seen.has(key))return false
  seen.add(key);return true
 }).map(block=>block.replaceAll('FATE-qualitative-r1','support-and-workload check').replaceAll('FATE-ordinary-structure-r1','work-pattern check')).join('\n\n')
}
