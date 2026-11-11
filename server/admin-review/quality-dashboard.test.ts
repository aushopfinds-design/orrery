import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildQualityData } from './quality-dashboard.ts'

async function json<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(resolve(process.cwd(), file), 'utf8')) as T
}

describe('admin quality dashboard data', () => {
  it('connects all extracted reports and keeps PDF scores separate from question scores', async () => {
    const source = await json<{ source_commit: string; audit_date: string; pdfs: Array<{ product_id: string; profile_id: string; pdf: string; page_count: number; question_count: number; answers: Array<{ title: string; actual_answer: string; status: string; score: number | null; deductions: string[] }> }>; card_asset_check?: { pdfs_checked?: number; embedded_card_image_found?: number } }>('docs/quality-audits/35-pdf-content-extraction-2026-11-11.json')
    const preliminary = await json<{ reviews: Array<{ pdfId: string; productId: string; profileId: string; questionId: string; score: null; status: 'FIX' | 'VERIFY'; deductionSentence: string; deductionReason: string; revisionNote: string; revisedAnswer: string; githubSha: string; pdfVersion: string }> }>('docs/quality-audits/product-03-preliminary-review-2026-11-11.json')
    const evaluation = await json<{ manual_content_review?: { pdf_scores?: Array<{ product_id: string; profile_index: number; score: number }> } }>('docs/quality-audits/current-pdf-quality-evaluation-2026-11-11.json')
    const result = buildQualityData(source, preliminary.reviews, evaluation.manual_content_review?.pdf_scores ?? [], [])
    expect(result.pdfCount).toBe(35)
    expect(result.answerCount).toBe(260)
    expect(result.pdfs.reduce((count, pdf) => count + pdf.questionCount, 0)).toBe(260)
    expect(result.pdfs.filter(pdf => pdf.productId === '03').map(pdf => pdf.pdfEvaluation?.score)).toEqual([84, 86, 84, 83, 83])
    expect(result.pdfs.filter(pdf => pdf.productId !== '03').every(pdf => pdf.pdfEvaluation === null)).toBe(true)
    expect(result.pdfs.flatMap(pdf => pdf.answers).every(answer => answer.review === null)).toBe(true)
  })
})
