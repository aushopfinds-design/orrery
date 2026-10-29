/** Short customer appendix; the source report retains its full calculation evidence. */
export function customerDeliveryText(text:string, simplifyMyLifeRepetition=false):string {
 let appendix=false
 let myLife=false, section=''
 const seen=new Set<string>()
 return text.split(/\n\n/).filter(block=>{
  if(block==='Calculation notes'){appendix=true;myLife=false;return true}
  if(/^THE FATE KEY · /.test(block)){appendix=false;myLife=simplifyMyLifeRepetition&&block==='THE FATE KEY · My Life';section='';seen.clear();return true}
  if(myLife&&/^\d{2} · /.test(block))section=block.slice(0,2)
  // Several My Life chapters already explain the same caution in their body.
  // Keep the practical point and the full source note, but avoid echoing it in a
  // second labelled sentence. The other paid reports retain their own endings.
  if(myLife&&block.startsWith('Main caution: ')&&(['01','02','03','05','06','07','08'].includes(section)))return false
  // The cycle source repeats the same labelled practical point on every decade.
  // Keep its first occurrence in My Life; the cycle-specific reading and dates remain.
  if(myLife&&block.startsWith('Practical point: ')){
   const key=block.replace(/\d{4}-\d{2}-\d{2}/g,'<cycle-date>').replace(/\s+/g,' ').trim()
   if(seen.has(key))return false
   seen.add(key)
  }
  if(!appendix)return true
  // Internal policy decisions are not additional chart facts. Keep dated pillars,
  // pair relationships, roots and the glossary, without repeating audit diagnostics.
  if(/(?:Activity policy FATE-|Assessment FATE-|Structural interpretation policy:|No judgement about whether the period|balance of support and demands in your birth chart or a current longer period is unresolved)/.test(block))return false
  const key=block.replace(/^From the chart: /,'').replace(/\s+/g,' ').trim()
  if(seen.has(key))return false
  seen.add(key);return true
 }).map(block=>block.replaceAll('FATE-qualitative-r1','support-and-workload check').replaceAll('FATE-ordinary-structure-r1','work-pattern check')).join('\n\n')
}
