import { describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { reportReference, readReportReference } from './report-reference.ts'
describe('Public report references are stable, distinct and reversible for support',()=>{
 it('keeps all 128 order bits and distinguishes every document in a collection',()=>{
  const values=new Set<string>()
  for(let i=0;i<100;i++){const id=randomUUID();for(let doc=0;doc<6;doc++){
   const reference=reportReference(id,2026,doc);expect(readReportReference(reference)).toEqual({orderId:id,year:2026,document:doc});expect(reportReference(id,2026,doc)).toBe(reference);values.add(reference)
  }}expect(values.size).toBe(600)
 })
 it('rejects forged formats, overflow and values that are not order UUIDs',()=>{
  for(const value of ['FK1.secret','FK-2026-ZZZZZZZZZZZZZZZZZZZZZZZZZZ-01','FK-2026-00000000000000000000000000-01','FK-2026-0O0I0000000000000000000000-01'])expect(readReportReference(value)).toBeNull()
 })
})
