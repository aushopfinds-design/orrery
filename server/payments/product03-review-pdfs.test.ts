import { mkdir, writeFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import type { BirthInput } from '@orrery/core/types'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { productQuestions } from '../../src/report/product-questions.ts'
import { issueReport } from './report.ts'

const profiles: { first: BirthInput; second: BirthInput }[] = [
  CATEGORY_SCENARIOS[0], CATEGORY_SCENARIOS[1], CATEGORY_SCENARIOS[2],
  { first: { year: 1990, month: 8, day: 14, hour: 8, minute: 30, gender: 'F', timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 }, second: CATEGORY_SCENARIOS[1].second },
  { first: { year: 1975, month: 12, day: 2, hour: 22, minute: 15, gender: 'M', timezone: 'America/Los_Angeles', latitude: 34.0522, longitude: -118.2437 }, second: CATEGORY_SCENARIOS[0].first },
]

describe('Product 03 review PDF batch', () => {
  it('generates five two-person reports with the seven official answers and working navigation', async () => {
    const output = process.env.FATE_PRODUCT03_REVIEW_PDF_DIR
    if (output) await mkdir(output, { recursive: true })
    const q2Answers: string[] = []
    for (const [index, profile] of profiles.entries()) {
      const report = await issueReport({ kind: 'compatibility', first: profile.first, second: profile.second }, `12345678-1234-4234-8234-1234567890${String(index + 1).padStart(2, '0')}`, 2026, 'test')
      const bytes = Buffer.from(report.pdf, 'base64')
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
      const pdf = await PDFDocument.load(bytes)
      expect(pdf.getPageCount()).toBeGreaterThan(1)
      expect(pdf.getPages().flatMap(page => page.node.Annots()?.asArray() ?? []).length).toBeGreaterThanOrEqual(7)
      expect(report.text.match(/Question: /g)).toHaveLength(7)
      expect(report.text.match(/Answer: /g)).toHaveLength(7)
      const officialQuestions = productQuestions('compatibility')
      expect([...report.text.matchAll(/Question: ([^\n]+)/g)].map(match => match[1])).toEqual(officialQuestions.map(question => question.title))
      const reportBody = report.text.split('\n\nCalculation notes\n\n')[0]
      expect(reportBody).not.toContain('Your reading at a glance')
      for (const legacyChapter of [
        'How Do You Fit Together?',
        'Why Are You Drawn to Each Other?',
        'Why Do You See Things Differently?',
        'Can Your Everyday Lives Fit Together?',
        'Can You Agree About Money?',
        'What Brings You Closer - and What Creates Friction?',
        'How Might the Years Ahead Affect Your Relationship?',
        'What Does This Connection Ask of You?',
      ]) expect(reportBody).not.toContain(legacyChapter)
      const q1 = report.text.split('Question: What makes us compatible?')[1]?.split('\n\nQuestion: ')[0] ?? ''
      const q1ByProfile = [
        'That overlap is your clearest point of fit; the personal-life signs add no separate connection or conflict.',
        'This is your clearest common ground, while the chart also points to a difference in personal choices.',
        'That overlap is your clearest point of fit; the personal-life signs add no separate connection or conflict.',
        'Your fit comes from giving both needs room; the chart adds no clear personal-life link or conflict.',
        'Your private-life chart link may support shared plans, while your care needs differ; this is a positive signal, not a promise.',
      ]
      expect(q1).toContain(q1ByProfile[index])
      const q3 = report.text.split('Question: What tends to cause friction between us?')[1]?.split('\n\nQuestion: ')[0] ?? ''
      expect(q3).not.toContain('different signal your partner is watching for')
      expect(q3).not.toContain('Say what you need before either of you assumes what the other meant')
      const q3ByProfile = [
        'The feeling behind the problem can then go unheard.',
        'Say whether you need time alone or reassurance, and when you will reconnect.',
        'The feeling behind the problem can then go unheard.',
        'One of you may need reassurance while the other needs room.',
        'The moment can become tense before either request is clear.',
      ]
      expect(q3).toContain(q3ByProfile[index])
      const q4 = report.text.split('Question: How do we express love differently?')[1]?.split('\n\nQuestion: ')[0] ?? ''
      expect(q4).toMatch(/You may express love|You and your partner may express love in a similar way/)
      expect(q4).not.toMatch(/You may (?:Honest conversation|Clear commitment|Privacy and being understood)/)
      const q4Examples = [
        'If you need time to think, agree when your partner will check back; if your partner offers help, ask what would be useful before stepping in.',
        'A brief check-in followed by keeping one promise you made makes this shared style visible.',
        'If you need time to think, agree when your partner will check back; if your partner offers help, ask what would be useful before stepping in.',
        'When you share a concern, your partner can first reflect what they heard; agree when to check back and follow through.',
        'Keep the shared commitment, agree when quiet time is protected, and say clearly when you are ready to reconnect.',
      ]
      expect(q4).toContain(q4Examples[index])
      const q5 = report.text.split('Question: How do emotional closeness and everyday compatibility differ?')[1]?.split('\n\nQuestion: ')[0] ?? ''
      expect(q5).toMatch(/(?:You tend to:|You both tend to:)/)
      const q5Examples = [
        'Try: Keep one shared plan fixed, then leave room for an extra plan without crowding the week.',
        'Try: For a recurring task, decide who owns it and when to ask for help.',
        'Try: Keep one shared plan fixed, then leave room for an extra plan without crowding the week.',
        'Try: Protect one block of personal time and agree who owns each recurring task.',
        'Try: Give recurring tasks a clear owner while leaving some time open for new plans.',
      ]
      expect(q5).toContain(q5Examples[index])
      expect(q5).not.toMatch(/You(?: both)? value /)
      if (index === 1) {
        expect(q5).toContain('small differences in what you expect from private life can become recurring irritations.')
        expect(q5).toContain('You both tend to: Independence becomes tiring when every task has to be handled alone.')
        expect(q5).not.toContain('Your partner tends to: Independence becomes tiring when every task has to be handled alone.')
        const q7 = report.text.split('Question: What does this connection ask of each of us?')[1]?.split('\n\nQuestion: ')[0] ?? ''
        expect(q7).toContain('each of you can give focused attention while protecting time for separate interests')
        expect(q7).toContain('make room for both connection and independence')
      } else {
        expect(q5).toContain('Your partner tends to:')
      }
      expect(q5).toMatch(/Emotionally, .+ Daily life:/)
      expect(q5).not.toContain('day-sign comparison')
      expect(q5).not.toContain('Compare the personal routine styles below with the way you actually share daily life.')
      const q7 = report.text.split('Question: What does this connection ask of each of us?')[1]?.split('\n\nQuestion: ')[0] ?? ''
      expect(q7).not.toContain('Your chart points to')
      if (index === 0 || index === 2) expect(q7).toContain('Your partner can hear your concern first, then ask before offering advice.')
      const q6 = report.text.split('Question: Which upcoming periods may affect our relationship themes?')[1]?.split('\n\nQuestion: ')[0] ?? ''
      expect(q6).not.toContain('..')
      expect(q6).not.toMatch(/The (?:only )?periods? flagged in this five-year comparison/)
      expect(q6).not.toContain('This is the specific shared-time theme flagged for the year.')
      expect(q6).not.toContain('Check whether it affects time together or personal choice')
      expect(q6).not.toContain('With both charts flagging individual focus')
      expect(q6).toMatch(/Discuss (?:what work time|which social plans|how study|whether new work contacts|where each person|how practical duties|which new plans|how work and money|who owns|which decisions)/)
      if (/period flagged in this five-year comparison is \d{4} for both of you/.test(q6)) {
        expect(q6.match(/Discuss what work time and personal projects leave available for time together, then agree which shared plan to protect\./g)).toHaveLength(1)
      }
      const q2 = report.text.split('Question: Why are we attracted to each other?')[1]?.split('\n\nQuestion: ')[0] ?? ''
      expect(q2).toContain('The chart cannot confirm either person’s actual feelings.')
      expect(q2).toMatch(/The private-life comparison (?:adds no clear connection or conflict|points to different instincts about personal choices|shows a link that may support closeness)/)
      q2Answers.push(q2)
      if (output) await writeFile(`${output}/${String(index + 1).padStart(2, '0')}-compatibility.pdf`, bytes)
    }
    expect(q2Answers.some(answer => answer.includes('adds no clear connection or conflict'))).toBe(true)
    expect(q2Answers.some(answer => answer.includes('different instincts about personal choices'))).toBe(true)
    expect(q2Answers.some(answer => answer.includes('shows a link that may support closeness'))).toBe(true)
  }, 120_000)
})
