import type { CategoryReading } from '../../report/category-shared.ts'
import { buyerQuestionTitles } from '../../report/personal-products.ts'

/** Safe presentation boundary for any public category sample route. */
export default function CategoryReadingView({ report }: { report: CategoryReading }) {
  const questions = buyerQuestionTitles(report.kind)
  return <article className="fate-complete-reading fate-category-reading fate-preview-shell" lang="en">
    <header className="fate-reading-cover fate-reading-cover-complete">
      <div className="fate-report-cover-content">
        <p className="fate-eyebrow">THE FATE KEY · DESIGN SAMPLE</p>
        <h1>{report.title}</h1>
        <p>This sample shows the premium report design. Personal conclusions and timing are provided with the paid report.</p>
      </div>
    </header>
    <section className="fate-reading-chapter">
      <h2>Questions in the paid report</h2>
      <ol>{questions.map(title => <li key={title}>{title}</li>)}</ol>
      <p>Clear personal explanations and relevant timing in a premium letter-style PDF.</p>
      <a className="fate-complete-primary" href={`#my-report-${report.kind}`}>View the personal preview →</a>
    </section>
  </article>
}
