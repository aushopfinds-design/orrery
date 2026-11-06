import './fate-envelope-cover.css'
import type { FocusCategory } from '../../report/category-catalog.ts'
import { previewProduct, buyerQuestionTitles } from '../../report/personal-products.ts'

const SAMPLE_ANSWERS: Record<FocusCategory, string> = {
  compatibility: 'Two people can bring different strengths to a relationship. A useful reading explores how those styles support each other and where a clear conversation may help.',
  year: 'A year reading looks at themes in phases, not as guaranteed events. It explains supportive or demanding periods only where the chart timing gives a useful basis.',
  career: 'A work setting that rewards focused effort and practical problem-solving may be worth exploring. A personal report connects that possibility to your birth chart and work experience.',
  love: 'A relationship reading can describe what helps someone feel secure and how that need may shape their choices in close relationships.',
  business: 'Business fit is more than a yes-or-no label. A reading can explore decision style, capacity and risk, then suggest a small test before a larger commitment.',
  wellbeing: 'A strength can become tiring when it has no boundary. A personal reading explores how a pattern may help in one setting and create pressure in another.',
}

/** Public visual sample with product questions only; no fictional or customer reading data. */
export default function CategorySamplePage({ kind }: { kind: FocusCategory }) {
  const product = previewProduct(kind)
  return <article id={`${kind}-sample`} className="fate-complete-reading fate-category-reading fate-preview-shell" lang="en">
    <header className="fate-reading-cover fate-reading-cover-complete fate-envelope-cover">
      <img className="fate-envelope-cover-art" src="/images/reports/fate-letter-envelope-cover.jpg" alt="" aria-hidden="true" />
      <div className="fate-report-cover-content">
        <p className="fate-eyebrow">THE FATE KEY · DESIGN SAMPLE</p>
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <p>Illustrative design sample · not a personal reading</p>
      </div>
    </header>
    <section className="fate-reading-chapter">
      <h2>Questions in the paid report</h2>
      <ol>{buyerQuestionTitles(kind).map(title => <li key={title}>{title}</li>)}</ol>
      <p>The paid report answers these questions with personal explanations and relevant timing in a premium letter-style PDF.</p>
      <section className="fate-reading-chapter fate-sample-excerpt">
        <p className="fate-eyebrow">SHORT EXAMPLE · NOT A CUSTOMER READING</p>
        <h2>{buyerQuestionTitles(kind)[0]}</h2>
        <blockquote>{SAMPLE_ANSWERS[kind]}</blockquote>
        <p>This general example shows the writing style. It is not personalised, calculated from a birth chart, or a complete paid answer.</p>
      </section>
      <a className="fate-complete-primary" href={`#my-report-${kind}`}>View the personal preview →</a>
    </section>
  </article>
}
