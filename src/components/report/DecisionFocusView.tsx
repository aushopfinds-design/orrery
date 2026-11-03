import type { ReactNode } from 'react'
import type { DecisionFocus } from '../../report/decision-focus.ts'
import { homepageCopy } from '../../i18n/homepage.ts'
import FateKeyMark from './FateKeyMark.tsx'
import ReadingText from './ReadingText.tsx'

const english = {
  title: homepageCopy['reading.decision.title'], intro: homepageCopy['reading.decision.intro'],
  first: homepageCopy['reading.decision.first'], pause: homepageCopy['reading.decision.pause'],
  review: homepageCopy['reading.decision.review'], why: homepageCopy['reading.decision.why'],
}

export default function DecisionFocusView({ focus, labels = english, scope, className = '', children }: {
  focus: DecisionFocus; labels?: typeof english; scope?: string; className?: string; children?: ReactNode
}) {
  return <section className={`fate-reading-brief fate-decision-focus ${className}`} aria-label={labels.title}>
    <header><FateKeyMark /><div>{scope && <p className="fate-eyebrow">{scope}</p>}<p className="fate-eyebrow">{labels.title}</p><h3>{focus.headline}</h3><p>{labels.intro}</p></div></header>
    <p className="fate-decision-synthesis"><ReadingText text={focus.synthesis} /></p>
    <dl className="fate-decision-steps">{[
      { label: labels.first, text: focus.firstStep },
      { label: labels.pause, text: focus.pauseIf },
      { label: labels.review, text: focus.review },
    ].map(item => <div key={item.label}><dt>{item.label}</dt><dd><ReadingText text={item.text} /></dd></div>)}</dl>
    <details className="fate-decision-evidence"><summary>{labels.why}</summary><ul>{focus.evidence.map(fact => <li key={fact}>{fact}</li>)}</ul></details>
    {children && <div className="fate-brief-source">{children}</div>}
  </section>
}
