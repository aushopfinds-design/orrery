import { describe,it,expect } from 'vitest'
import { customerDeliveryText } from './customer-delivery.ts'
describe('customer appendix',()=>{
 it('drops a closing quote that has no answer text',()=>{
  const text=['THE FATE KEY · Test','Question: What helps you feel secure?','Answer: Clear and kind communication.','Answer detail: ”','Calculation notes','From the chart: Day branch 未.'].join('\n\n')
  const buyer=customerDeliveryText(text)
  expect(buyer).toContain('Answer: Clear and kind communication.')
  expect(buyer).not.toContain('Answer detail: ”')
 })
 it('keeps body, dated facts, conflicts and roots while dropping repetitive internal audit prose',()=>{
  const body='THE FATE KEY · Test\n\nOpening + pressure: your work changes.'
  const text=body+'\n\nCalculation notes\n\nFrom the chart: Reference 2027-01-15: 辛丑.\n\nFrom the chart: Reference / birth day: branch 沖.\n\nFrom the chart: Root at month.\n\nFrom the chart: Activity policy FATE-activity-r1: capacity deferred.\n\nFrom the chart: 2027-01-15: No judgement about whether the period may be easier or harder is assigned: the balance of support and demands in your birth chart or a current longer period is unresolved.\n\nFrom the chart: Root at month.'
  const result=customerDeliveryText(text)
  expect(result).toContain(body);expect(result).toContain('2027-01-15: 辛丑');expect(result).toContain('branch 沖')
  expect(result.match(/Root at month/g)).toHaveLength(1);expect(result).not.toMatch(/FATE-activity|No judgement/)
  expect(text).toContain('FATE-activity')
  expect(customerDeliveryText('Calculation notes\n\nThe separate FATE-ordinary-structure-r1 policy.')).toContain('work-pattern check')
 })
 it('does not filter customer prose when a second bundled report begins',()=>{
  const text='Calculation notes\n\nFrom the chart: Root at month.\n\nTHE FATE KEY · Second report\n\nYour work changes.'
  expect(customerDeliveryText(text)).toContain('Second report\n\nYour work changes.')
 })
 it('removes redundant chapter and cycle cautions from My Life buyer copies only',()=>{
  const text=['THE FATE KEY · My Life','02 · What Helps You Thrive','Variety is tiring when every day is full.','Practical point: Choose one duty to decline.','Main caution: Too many duties can be tiring.','03 · How Are You Meant to Make Money?','Main caution: Costs reduce what you keep.','08 · What Do Your Ten-Year Life Cycles Reveal?','July 2024 – July 2034 · 壬子','Practical point: Compare the cycle with actual changes.','Main caution: Clarify duties before accepting them.','09 · What Might the Next Ten Years Bring?','Main caution: This distinct timing note stays.','Calculation notes','From the chart: Money markers at month.'].join('\n\n')
  const buyer=customerDeliveryText(text,true)
  expect(buyer).not.toContain('Main caution: Too many duties can be tiring.')
  expect(buyer).not.toContain('Main caution: Costs reduce what you keep.')
  expect(buyer).not.toContain('Main caution: Clarify duties before accepting them.')
  expect(buyer).toContain('Main caution: This distinct timing note stays.')
  expect(buyer).toContain('From the chart: Money markers at month.')
  expect(customerDeliveryText(text)).toContain('Main caution: Too many duties can be tiring.')
 })
 it('applies the existing targeted cleanup to the current Product 01 title',()=>{
  const text=['THE FATE KEY · Your Life, Your Destiny','06 · What Challenges Keep Returning in Your Life?','Answer: A work pattern and private need differ.','Main caution: Do not expect one to resolve the other.','Calculation notes','From the chart: Day branch 未.'].join('\n\n')
  const buyer=customerDeliveryText(text,true)
  expect(buyer).not.toContain('Main caution: Do not expect one to resolve the other.')
  expect(buyer).toContain('From the chart: Day branch 未.')
  // Product 07 calls this function with cleanup disabled, preserving its included edition.
  expect(customerDeliveryText(text,false)).toContain('Main caution: Do not expect one to resolve the other.')
 })
 it('keeps one repeated method note in standalone buyer copies while preserving protected editions',()=>{
  const note='Answer detail: Reading basis: Your birth time is unknown, so this reading uses the three known pillars.'
  const relationship=['THE FATE KEY · Are We Meant to Be?','01 · Fit',note,'02 · Love',note].join('\n\n')
  expect(customerDeliveryText(relationship,true).split(note)).toHaveLength(2)
  const product02=['THE FATE KEY · Success, Money & Your Future','01 · Work',note,'02 · Money',note].join('\n\n')
  expect(customerDeliveryText(product02,false).split(note)).toHaveLength(3)
 })
 it('leaves the method disclaimer in the report-level method section, not repeated answer text',()=>{
  const note='Answer detail: About this reading: traditional birth-chart interpretation, not guaranteed outcomes.'
  const text=['THE FATE KEY · Are We Meant to Be?',note,'How this reading is prepared','Traditional birth-chart interpretation; outcomes are not guaranteed.'].join('\n\n')
  const buyer=customerDeliveryText(text,true)
  expect(buyer).not.toContain(note)
  expect(buyer).toContain('How this reading is prepared\n\nTraditional birth-chart interpretation; outcomes are not guaranteed.')
  expect(customerDeliveryText(text,false)).toContain(note)
 })
 it('keeps only one identical decade practical point in My Life',()=>{
  const first='Practical point: Read the calculated start 2024-07-19 alongside actual changes in responsibility.'
  const second='Practical point: Read the calculated start 2034-07-19 alongside actual changes in responsibility.'
  const text=['THE FATE KEY · My Life','08 · What Do Your Ten-Year Life Cycles Reveal?','Cycle one',first,'Cycle two',second,'THE FATE KEY · My Year','08 · What Do Your Ten-Year Life Cycles Reveal?',second].join('\n\n')
  const buyer=customerDeliveryText(text,true)
  expect(buyer).toContain(first)
  expect(buyer.split(second)).toHaveLength(2)
 })
})
