import { mkdir, writeFile } from 'node:fs/promises'
import { PDFArray, PDFDict, PDFDocument, PDFName } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { CATEGORY_SCENARIOS } from '../../src/report/category-catalog.ts'
import { productQuestions } from '../../src/report/product-questions.ts'
import { issueReport } from './report.ts'

const products = ['complete', 'career', 'compatibility', 'year', 'business', 'wellbeing', 'bundle'] as const

describe('seven simplified report products use the paid PDF path', () => {
  it('generates one representative PDF per product with its questions and navigation intact', async () => {
    const output = process.env.FATE_SIMPLE_REPORT_PDF_DIR
    if (output) await mkdir(output, { recursive: true })
    const profiles = [CATEGORY_SCENARIOS[0], CATEGORY_SCENARIOS[2]] // known-time and unknown-time international profiles
    for (const profile of profiles) for (const kind of products) {
      const paired = kind === 'compatibility' || kind === 'bundle'
      const report = await issueReport({
        kind,
        first: profile.first,
        ...(paired ? { second: profile.second } : {}),
        ...(kind === 'year' || kind === 'bundle' ? { year: 2026, periodStart: '2026-11', periodEnd: '2027-10', periodTimezone: 'America/New_York' } : {}),
      }, '12345678-1234-4234-8234-123456789099', 2026, 'test')

      const definitions = productQuestions(kind)
      const questions = [...report.text.matchAll(/(?:^|\n)Question: ([^\n]+)\n/g)].map(match => match[1].trim())
      expect(questions, `${kind} question titles and order`).toEqual(definitions.map(item => item.title))
      expect(report.answerProvenance?.map(item => item.questionId), `${kind} question IDs and order`).toEqual(definitions.map(item => item.id))
      expect(questions.length, `${kind} question count`).toBe(kind === 'bundle' ? 10 : 7)
      expect(report.text).not.toMatch(/undefined|NaN|\[object Object\]/)
      if (kind === 'year') expect(report.text).toContain('Analysis window: November 2026 through October 2027.')
      expect(report.answerProvenance).toHaveLength(definitions.length)
      const questionMatches = [...report.text.matchAll(/(?:^|\n)Question: ([^\n]+)\n/g)]
      for (const [index, question] of definitions.entries()) {
        expect(questionMatches[index]?.[1].trim(), `${kind}/${question.id} body heading`).toBe(question.title)
        const sectionStart = questionMatches[index]!.index! + questionMatches[index]![0].length
        const sectionEnd = questionMatches[index + 1]?.index ?? report.text.length
        expect(report.text.slice(sectionStart, sectionEnd).trim(), `${kind}/${question.id} answer`).not.toMatch(/^$/)
      }
      if (profile.first.unknownTime) {
        expect(report.text).toContain('Hour: Unknown')
        expect(report.text).not.toMatch(/Hour (?:pillar|stem|branch) [甲乙丙丁戊己庚辛壬癸]/)
      }

      const bytes = Buffer.from(report.pdf, 'base64')
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
      const pdf = await PDFDocument.load(bytes)
      expect(pdf.getPageCount()).toBeGreaterThan(1)
      const links = pdf.getPages().flatMap(page => page.node.Annots()?.asArray() ?? [])
      expect(links.length, `${kind} internal navigation`).toBeGreaterThan(0)
      const contentsPage = pdf.getPages()[2]
      const contentsLinks = (contentsPage.node.Annots()?.asArray() ?? []).filter(annotation => {
        const dictionary = pdf.context.lookup(annotation, PDFDict)
        return dictionary.get(PDFName.of('Subtype'))?.toString() === '/Link'
      })
      expect(contentsLinks, `${kind} official question contents entries`).toHaveLength(definitions.length)
      const linkRects = contentsLinks.map(annotation => {
        const dictionary = pdf.context.lookup(annotation, PDFDict)
        return pdf.context.lookup(dictionary.get(PDFName.of('Rect'))!, PDFArray).asArray().map(value => Number(value.toString()))
      }).sort((a, b) => b[3] - a[3])
      for (let index = 1; index < linkRects.length; index++) {
        expect(linkRects[index][3], `${kind} question links do not overlap`).toBeLessThanOrEqual(linkRects[index - 1][1])
      }
      const destinations = contentsLinks.map(annotation => {
        const dictionary = pdf.context.lookup(annotation, PDFDict)
        const destination = pdf.context.lookup(dictionary.get(PDFName.of('Dest'))!, PDFArray)
        const pageIndex = pdf.getPages().findIndex(page => page.ref.toString() === destination.get(0).toString())
        expect(pageIndex, `${kind} question link destination`).toBeGreaterThanOrEqual(0)
        return { pageIndex, y: Number(destination.get(3).toString()) }
      })
      for (let index = 1; index < destinations.length; index++) {
        const previous = destinations[index - 1]
        const current = destinations[index]
        expect(current.pageIndex, `${kind} question destinations follow answer order`).toBeGreaterThanOrEqual(previous.pageIndex)
        if (current.pageIndex === previous.pageIndex) {
          expect(current.y, `${kind} same-page answer destinations follow reading order`).toBeLessThanOrEqual(previous.y)
        }
      }
      if (output) await writeFile(`${output}/${kind}-${profile.id}.pdf`, bytes)
    }
  }, 180_000)
})
