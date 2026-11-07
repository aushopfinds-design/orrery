import './fate-envelope-cover.css'
import { useEffect, useMemo } from 'react'
import { calculateSaju } from '@orrery/core/saju'
import { CATEGORY_SCENARIOS, categoryInfo } from '../../report/category-catalog.ts'
import type { FocusCategory } from '../../report/category-catalog.ts'
import { buildBundleReading, buildCategoryReading } from '../../report/category-readings.ts'
import { buyerQuestionTitles } from '../../report/personal-products.ts'
import { applyBuyerQuestions } from '../../report/buyer-outline.ts'
import { productQuestions } from '../../report/product-questions.ts'
import { careerMoneyChartData } from '../../report/career-money-charts.ts'
import ReadingText from './ReadingText.tsx'

/** Full public example built from a fixed fictional profile using the same report generator as paid reports. */
export default function FullReportSamplePage({ kind }: { kind: FocusCategory | 'bundle' }) {
  const sample = CATEGORY_SCENARIOS[0]
  const report = useMemo(() => {
    const first = calculateSaju(sample.first)
    const second = calculateSaju(sample.second)
    if (kind === 'bundle') return buildBundleReading(first, second, 2027, 2026, '2027-01', 'UTC')
    return buildCategoryReading(kind, first, { second: kind === 'compatibility' ? second : undefined, year: kind === 'year' ? 2027 : 2026, ...(kind === 'year' ? { periodStart: '2027-01', periodTimezone: 'UTC' } : {}) })
  }, [kind, sample])
  const slug = kind === 'bundle' ? 'complete-bundle' : categoryInfo(kind).slug
  const title = kind === 'bundle' ? 'Your Destiny Collection' : categoryInfo(kind).title
  const questions = buyerQuestionTitles(kind)
  const referenceYear = kind === 'year' ? 2027 : 2026
  const fullText = kind === 'bundle' || !('chapters' in report)
    ? report.fullText
    : applyBuyerQuestions(
      report.fullText,
      kind,
      report.chapters,
      [],
      'standalone',
      kind === 'career' ? careerMoneyChartData(calculateSaju(sample.first), referenceYear).years : [],
      Object.fromEntries(productQuestions(kind).map(question => [question.id, question.title])),
    )
  const paragraphs = fullText.split(/\n{2,}/).map(block => block.trim()).filter(Boolean)

  useEffect(() => {
    const frame = requestAnimationFrame(() => document.getElementById(`${slug}-sample`)?.scrollIntoView({ block: 'start' }))
    return () => cancelAnimationFrame(frame)
  }, [slug])

  return <article id={`${slug}-sample`} className="fate-complete-reading fate-category-reading fate-preview-shell fate-full-sample" lang="en" aria-label={`${title} full illustrative report sample`}>
    <header className="fate-reading-cover fate-reading-cover-complete fate-envelope-cover">
      <img className="fate-envelope-cover-art" src="/images/reports/fate-letter-envelope-cover.jpg" alt="" aria-hidden="true" />
      <div className="fate-report-cover-content">
        <p className="fate-eyebrow">THE FATE KEY · COMPLETE DESIGN SAMPLE</p>
        <h1>{title}</h1>
        <p>A full example showing the report structure and answers.</p>
        <p>Generated from a fixed fictional sample profile. This is not a customer report or a personal reading for you.</p>
        <span className="fate-sample-ribbon">FICTIONAL EXAMPLE · NOT A CUSTOMER REPORT</span>
      </div>
    </header>

    <section className="fate-reading-chapter fate-sample-introduction">
      <p className="fate-eyebrow">HOW TO READ THIS SAMPLE</p>
      <h2>Full report example</h2>
      <p>This example uses the same report-generation system as the paid report, with fictional sample birth details. Its chart interpretation is for demonstration only; it is not advice or a prediction.</p>
      <h3>Questions included</h3>
      <ol>{questions.map(question => <li key={question}>{question}</li>)}</ol>
    </section>

    <nav className="fate-sample-contents" aria-label="Full sample contents">
      <h2>Answers in this full example</h2>
      <ol>{questions.map((question, index) => {
        const source = kind === 'bundle' ? undefined : productQuestions(kind)[index]?.answerSource
        const sourceTitle = kind !== 'bundle' && source ? (report as ReturnType<typeof buildCategoryReading>).chapters.find(chapter => chapter.id === source)?.title : undefined
        const blockIndex = paragraphs.findIndex(block => block.toLowerCase().includes(question.toLowerCase()) || Boolean(sourceTitle && block.toLowerCase().includes(sourceTitle.toLowerCase())))
        return <li key={question}><a href={`#${slug}-block-${blockIndex >= 0 ? blockIndex + 1 : 1}`}>{question}</a></li>
      })}</ol>
    </nav>

    <div className="fate-sample-answer-list">
      {paragraphs.map((block, index) => <section className="fate-reading-chapter fate-sample-answer" id={`${slug}-block-${index + 1}`} key={`${index}-${block.slice(0, 20)}`}>
        {index === 0 && <p className="fate-eyebrow">FULL REPORT TEXT · FICTIONAL EXAMPLE</p>}
        {block.split('\n').map((line, lineIndex) => {
          const isQuestion = /^(?:Question:|Your Answer:|Important Timing:|Practical Step:|Bottom Line:)/i.test(line)
          return isQuestion ? <p key={lineIndex} className="fate-reading-lead"><ReadingText text={line} /></p> : <p key={lineIndex}><ReadingText text={line} /></p>
        })}
      </section>)}
    </div>

    <section className="fate-reading-chapter fate-sample-summary">
      <p className="fate-eyebrow">END OF SAMPLE</p>
      <h2>Explore your own preview</h2>
      <p>This complete example uses a fictional profile. Your personal report is created from the birth details you provide.</p>
      <a className="fate-complete-primary" href={`#my-report-${kind}`}>View the personal preview →</a>
    </section>
  </article>
}
