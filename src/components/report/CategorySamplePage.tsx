import type { FocusCategory } from '../../report/category-catalog.ts'
import { previewProduct, buyerQuestionTitles } from '../../report/personal-products.ts'

const SAMPLE_WORDING: Record<FocusCategory, string> = {
  compatibility: 'Example: “Your report looks at how two different communication styles can meet.”',
  year: 'Example: “Your report explains how the year is organised and where to read each month.”',
  career: 'Example: “Your report explores how your working style and money patterns fit together.”',
  love: 'Example: “Your report explores relationship themes in clear, everyday language.”',
  business: 'Example: “Your report explores the working conditions that may support your business style.”',
  wellbeing: 'Example: “Your report describes personal patterns in clear, everyday language.”',
}

/** Public visual sample with product questions only; no fictional or customer reading data. */
export default function CategorySamplePage({ kind }: { kind: FocusCategory }) {
  const product = previewProduct(kind)
  return <article id={`${kind}-sample`} className="fate-complete-reading fate-category-reading fate-preview-shell" lang="en">
    <header className="fate-reading-cover fate-reading-cover-complete">
      <div className="fate-report-cover-content">
        <p className="fate-eyebrow">THE FATE KEY · DESIGN SAMPLE</p>
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <p>{SAMPLE_WORDING[kind]}</p>
      </div>
    </header>
    <section className="fate-reading-chapter">
      <h2>Questions in the paid report</h2>
      <ol>{buyerQuestionTitles(kind).map(title => <li key={title}>{title}</li>)}</ol>
      <p>The paid report answers these questions with personal explanations and relevant timing in a premium letter-style PDF.</p>
      <a className="fate-complete-primary" href={`#my-report-${kind}`}>View the personal preview →</a>
    </section>
  </article>
}
