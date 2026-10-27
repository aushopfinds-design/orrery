import { describe,it,expect } from 'vitest'
import { customerDeliveryText } from './customer-delivery.ts'
describe('customer appendix',()=>{
 it('keeps body, dated facts, conflicts and roots while dropping repetitive internal audit prose',()=>{
  const body='THE FATE KEY · Test\n\nOpening + pressure: your work changes.'
  const text=body+'\n\nCalculation notes\n\nFrom the chart: Reference 2027-01-15: 辛丑.\n\nFrom the chart: Reference / birth day: branch 沖.\n\nFrom the chart: Root at month.\n\nFrom the chart: Activity policy FATE-activity-r1: capacity deferred.\n\nFrom the chart: 2027-01-15: No judgement about whether the period may be easier or harder is assigned: the balance of support and demands in your birth chart or a current longer period is unresolved.\n\nFrom the chart: Root at month.'
  const result=customerDeliveryText(text)
  expect(result).toContain(body);expect(result).toContain('2027-01-15: 辛丑');expect(result).toContain('branch 沖')
  expect(result.match(/Root at month/g)).toHaveLength(1);expect(result).not.toMatch(/FATE-activity|No judgement/)
  expect(text).toContain('FATE-activity')
 })
 it('does not filter customer prose when a second bundled report begins',()=>{
  const text='Calculation notes\n\nFrom the chart: Root at month.\n\nTHE FATE KEY · Second report\n\nYour work changes.'
  expect(customerDeliveryText(text)).toContain('Second report\n\nYour work changes.')
 })
})
