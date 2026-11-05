import { buyerQuestionTitles } from '../../report/personal-products.ts'

/** Static public bundle preview. Never calculates or embeds the paid collection. */
export default function BundleSamplePage() {
  return <article id="complete-bundle-sample" className="fate-complete-reading fate-bundle-reading fate-preview-shell" lang="en">
    <header className="fate-reading-cover fate-reading-cover-complete">
      <div className="fate-report-cover-content">
        <p className="fate-eyebrow">THE FATE KEY · DESIGN SAMPLE</p>
        <h1>Your Complete Destiny</h1>
        <p>One integrated ten-question reading across life, relationships, work, money and timing.</p>
        <p>The finished report uses the premium letter design and connects its themes in one personal reading.</p>
      </div>
    </header>
    <section className="fate-reading-chapter">
      <h2>How Do Your Life, Love, Work and Year Themes Fit Together?</h2>
      <p>The complete collection connects these areas in one personal reading. The overview brings the separate report themes together.</p>
    </section>
    <section className="fate-reading-chapter">
      <h2>Questions in the paid collection</h2>
      <ol>{buyerQuestionTitles('bundle').map(title => <li key={title}>{title}</li>)}</ol>
      <p>Ten connected answers, relevant timing, a premium letter-style PDF and the Destiny Card design preview.</p>
      <section className="fate-reading-chapter fate-sample-excerpt">
        <p className="fate-eyebrow">SHORT EXAMPLE · NOT A CUSTOMER READING</p>
        <h2>{buyerQuestionTitles('bundle')[0]}</h2>
        <blockquote>Your personality, work style, money habits and relationship needs can influence one another. The complete reading brings these themes together so you can see the pattern, not just separate parts.</blockquote>
        <p>This general example shows the writing style. It is not personalised, calculated from a birth chart, or a complete paid answer.</p>
      </section>
      <a className="fate-complete-primary" href="#my-report-bundle">View the collection preview →</a>
    </section>
  </article>
}
