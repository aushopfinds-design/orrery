import { describe, expect, it } from 'vitest'
import { pdfTextPresentation, reportEmphasis } from './report.ts'

describe('customer-facing PDF answer paragraphs', () => {
  it('removes internal labels and keeps Bottom Line as a section signal', () => {
    for (const label of ['Your Answer', 'Answer', 'Answer detail', 'What This Means for You', 'Important Timing', 'Practical point', 'Main caution']) {
      const result = pdfTextPresentation(`${label}: A clear sentence.`)
      expect(result.value).toBe('A clear sentence.')
      expect(result.bottomLine).toBe(false)
    }
    const takeaway = pdfTextPresentation('Bottom Line: A specific takeaway. A second short sentence.')
    expect(takeaway).toEqual({ value: 'A specific takeaway. A second short sentence.', directAnswer: false, bottomLine: true })
  })

  it('marks only the first answer paragraph as direct', () => {
    expect(pdfTextPresentation('Answer: The chart points to a defined work role.').directAnswer).toBe(true)
    expect(pdfTextPresentation('Answer detail: The timing remains uncertain.').directAnswer).toBe(false)
  })
})

describe('PDF emphasis survives plain text serialization', () => {
  it('retains authored bold phrases and practical next steps, without bolding all prose', () => {
    const result = reportEmphasis({ chapters: [{ paragraphs: ['An ordinary sentence. **Check the full cost.** Then compare it.', '**Check the full cost.**'], tryThis: 'Write down the confirmed payment date.' }], fullText: 'An ordinary sentence. Check the full cost. Then compare it.' })
    expect(result).toEqual(['Check the full cost.', 'Write down the confirmed payment date.'])
    expect(result).not.toContain('An ordinary sentence.')
  })
})
