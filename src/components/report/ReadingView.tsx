import type { BirthInput } from '@orrery/core/types'

/** Public sample shell. It intentionally accepts no report data and performs no chart calculation. */
export default function ReadingView({ prefix = 'sample-report' }: { input: BirthInput; embedded?: boolean; prefix?: string }) {
  return <article id={prefix} className="fate-complete-reading fate-preview-shell" aria-label="Report design sample" lang="en">
    <header className="fate-reading-cover fate-reading-cover-complete">
      <div className="fate-report-cover-content">
        <p className="fate-eyebrow">THE FATE KEY · DESIGN SAMPLE</p>
        <h1>Your Life, Your Destiny</h1>
        <p className="fate-reading-cover-tagline">A personal report built around your questions.</p>
        <p>This sample shows the premium report design. Question titles and short wording examples are available in the product preview; full answers are provided with the paid report.</p>
      </div>
    </header>
    <section className="fate-reading-chapter">
      <h2>Inside the paid report</h2>
      <p>Seven personal questions, clear explanations, relevant timing and a keepsake PDF in the premium letter design.</p>
      <a className="fate-complete-primary" href="#my-report">View the personal preview →</a>
    </section>
  </article>
}
