import { describe, expect, it } from 'vitest'
import { reportEmphasis } from './report.ts'

describe('PDF emphasis survives plain text serialization', () => {
  it('retains authored bold phrases and practical next steps, without bolding all prose', () => {
    const result = reportEmphasis({ chapters: [{ paragraphs: ['An ordinary sentence. **Check the full cost.** Then compare it.', '**Check the full cost.**'], tryThis: 'Write down the confirmed payment date.' }], fullText: 'An ordinary sentence. Check the full cost. Then compare it.' })
    expect(result).toEqual(['Check the full cost.', 'Write down the confirmed payment date.'])
    expect(result).not.toContain('An ordinary sentence.')
  })
})
