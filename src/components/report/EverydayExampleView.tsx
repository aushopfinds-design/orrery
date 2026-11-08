import { useLocale } from '../../i18n/index.ts'
import type { EverydayExample } from '../../report/personal-examples.ts'
import ReadingText from './ReadingText.tsx'
import FateKeyMark from './FateKeyMark.tsx'

export default function EverydayExampleView({ example, headingLevel = 3, showScene = true }: { example: EverydayExample; headingLevel?: 3 | 4; showScene?: boolean }) {
  const { t } = useLocale()
  const Heading = headingLevel === 4 ? 'h4' : 'h3'
  return <section className="fate-everyday-example" aria-label={t('reading.example.title')}>
    <header><FateKeyMark /><div><p>{t('reading.example.eyebrow')}</p><Heading>{t('reading.example.title')}</Heading></div></header>
    {showScene && <p className="fate-example-scene"><ReadingText text={example.scene} /></p>}
    <div className="fate-example-response"><strong>{t('reading.example.response')}</strong><blockquote><ReadingText text={example.response} /></blockquote></div>
    <p className="fate-example-check"><strong>{t('reading.example.check')}</strong> <ReadingText text={example.check} /></p>
    <details className="fate-example-basis"><summary>{t('reading.example.basis')}</summary><p><ReadingText text={example.basis} /></p><ul>{example.facts.map(fact => <li key={fact}>{fact}</li>)}</ul></details>
    <p className="fate-example-note">{t('reading.example.note')}</p>
    <p className="hidden print:block fate-example-print-basis">{t('reading.example.basis')}: {example.basis} {example.facts.join(' ')}</p>
  </section>
}
