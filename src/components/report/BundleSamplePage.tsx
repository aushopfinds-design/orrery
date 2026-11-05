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
      <h2>Questions in the paid collection</h2>
      <ol>{buyerQuestionTitles('bundle').map(title => <li key={title}>{title}</li>)}</ol>
      <p>Ten connected answers, relevant timing, a premium letter-style PDF and the Destiny Card design preview.</p>
      <a className="fate-complete-primary" href="#my-report-bundle">View the collection preview →</a>
    </section>
  </article>
}
