import './fate-envelope-cover.css'
import type { BirthInput } from '@orrery/core/types'
import { buyerQuestionTitles } from '../../report/personal-products.ts'

const EXAMPLE_ANSWERS = [
  'In this fictional example, Avery is presented as thoughtful and observant, with a preference for understanding a situation before acting. The report style would turn that theme into practical language: notice where careful listening helps, and where waiting too long can make a decision harder.',
  'Avery’s example strengths are patience, close attention and follow-through. The same habits may become limiting when every detail must feel settled before starting. A useful reading would describe both sides of a pattern and help the reader recognise when each one appears.',
  'The fictional example points toward work with clear responsibilities, steady skill-building and room to solve practical problems. It would then connect that description to the reader’s real experience, because a chart cannot tell which training, workplace or role is available to them.',
  'In this sample, money is described through choices and habits rather than a promise of income. Avery might benefit from seeing how planning and consistency support financial decisions, while checking whether caution sometimes delays a reasonable opportunity.',
  'Avery’s fictional relationship example values reliability and honest conversation. It would explain how that need might appear in everyday choices, then invite the reader to compare the description with their own relationships instead of presenting it as a fixed fact.',
  'The example challenge is taking on too much responsibility before asking for support. A practical explanation would show how this could affect energy and communication, then suggest one small boundary to try and review.',
  'This sample demonstrates cautious timing language: a period may be useful for reviewing priorities or preparing for change, but it cannot promise a specific event. A paid report would explain the timing basis and limits that apply to the buyer’s chart.',
] as const

/** Complete fictional sample report. It contains no customer chart or paid report answers. */
export default function ReadingView({ prefix = 'sample-report' }: { input: BirthInput; embedded?: boolean; prefix?: string }) {
  const questions = buyerQuestionTitles('complete')
  return <article id={prefix} className="fate-complete-reading fate-preview-shell fate-full-sample" aria-label="Complete illustrative report sample" lang="en">
    <header className="fate-reading-cover fate-reading-cover-complete fate-envelope-cover">
      <img className="fate-envelope-cover-art" src="/images/reports/fate-letter-envelope-cover.jpg" alt="" aria-hidden="true" />
      <div className="fate-report-cover-content">
        <p className="fate-eyebrow">THE FATE KEY · COMPLETE DESIGN SAMPLE</p>
        <h1>Your Life, Your Destiny</h1>
        <p className="fate-reading-cover-tagline">A full look at the report’s structure and writing style.</p>
        <p>This demonstration uses a fictional reader named Avery. No birth details or chart calculations are used. It is not a personal reading.</p>
        <span className="fate-sample-ribbon">FICTIONAL EXAMPLE · NOT A CUSTOMER REPORT</span>
      </div>

    </header>

    <section className="fate-reading-chapter fate-sample-introduction">
      <p className="fate-eyebrow">HOW TO READ THIS SAMPLE</p>
      <h2>A complete example, from opening to summary</h2>
      <p>The pages below show how a finished report can answer its questions directly, explain a theme in everyday language and offer a useful point to reflect on. All answer text is invented for demonstration and is not calculated from Saju or taken from a paid customer report.</p>
      <div className="fate-sample-at-glance"><h3>Example themes at a glance</h3><ul><li>Notice where careful observation helps you make sound choices.</li><li>Use steady skill-building as a guide when considering work.</li><li>Set a clear limit before taking on more responsibility.</li></ul></div>
    </section>

    <nav className="fate-sample-contents" aria-label="Sample report contents">
      <h2>Inside this sample report</h2>
      <ol>{questions.map((question, index) => <li key={question}><a href={`#${prefix}-question-${index + 1}`}>{question}</a></li>)}</ol>
      <a href={`#${prefix}-summary`}>Closing summary</a>
    </nav>

    <div className="fate-sample-answer-list">
      {questions.map((question, index) => <section className="fate-reading-chapter fate-sample-answer" id={`${prefix}-question-${index + 1}`} key={question}>
        <p className="fate-eyebrow">QUESTION {String(index + 1).padStart(2, '0')} · FICTIONAL EXAMPLE</p>
        <h2>{question}</h2>
        <p className="fate-sample-direct-answer"><strong>Example answer:</strong> {EXAMPLE_ANSWERS[index]}</p>
        <aside><strong>What a personal report adds</strong><p>It uses the buyer’s own chart and birth details to explain whether this theme applies, what supports the interpretation and where its limits matter.</p></aside>
      </section>)}
    </div>

    <section className="fate-reading-chapter fate-sample-summary" id={`${prefix}-summary`}>
      <p className="fate-eyebrow">CLOSING SUMMARY · FICTIONAL EXAMPLE</p>
      <h2>A final note for Avery</h2>
      <p>This demonstration brings its themes together: use careful observation as a strength, keep building practical skills and make room to ask for support. These are sample-writing choices, not conclusions about you.</p>
      <p><strong>In a purchased report, the final summary is based on your birth chart and connects back to the questions you asked.</strong></p>
    </section>

    <section className="fate-reading-chapter fate-sample-paid-difference">
      <h2>What the complete paid report includes</h2>
      <ul><li>Answers to all seven questions using the buyer’s own birth information.</li><li>Plain-English explanations and relevant chart timing where supported.</li><li>Connected themes, visual sections and a premium letter-style PDF.</li></ul>
      <p className="fate-reading-small-note">This public example contains no personal chart calculation, complete personal conclusions or customer data.</p>
      <a className="fate-complete-primary" href="#reports">Explore the report options <span aria-hidden="true">→</span></a>
      <a className="fate-buyer-sample-link" href="#my-report">View your free personal preview</a>
    </section>
  </article>
}
