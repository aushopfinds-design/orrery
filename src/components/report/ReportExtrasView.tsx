import { useLocale } from '../../i18n/index.ts'
import { SYMBOL_NOTE, SYMBOL_SOURCES } from '../../report/report-extras.ts'
import type { InsightQuestion, ReportExtras, SymbolCard } from '../../report/report-extras.ts'
import ReadingText from './ReadingText.tsx'
import ReportIcon from './ReportIcon.tsx'
import FateKeyMark from './FateKeyMark.tsx'
import ChapterHeading from './ChapterHeading.tsx'
import { ChartEvidence } from './ReportChapterView.tsx'
import { BackToChapters } from './ReportBriefView.tsx'

function QuestionCard({ item }: { item: InsightQuestion }) {
  const { t } = useLocale()
  return <section className="fate-compass-question">
    <h4>{item.question}</h4>
    <p><ReadingText text={item.answer} /></p>
    <p className="fate-compass-basis"><strong>{t('reading.extras.why')}</strong> {item.basis}</p>
  </section>
}

function SymbolCards({ symbols }: { symbols: SymbolCard[] }) {
  const { t } = useLocale()
  return <>
    <div className="fate-compass-symbol-grid">{symbols.map(symbol => <section className="fate-compass-symbol" key={symbol.person}>
      <div className="fate-compass-symbol-heading"><FateKeyMark /><div><p>{symbol.person}</p><h4>{t('reading.extras.element').replace('{element}', symbol.element)}</h4></div></div>
      <div className="fate-compass-symbol-values">
        <div><p>{t('reading.extras.colors')}</p><ul className="fate-compass-swatches">{symbol.colors.map(color => <li key={color.name}><span style={{ backgroundColor: color.hex }} aria-hidden="true" />{color.name}</li>)}</ul></div>
        <div><p>{t('reading.extras.numbers')}</p><strong className="fate-compass-numbers">{symbol.numbers.join(' · ')}</strong></div>
      </div>
      <p className="fate-compass-symbol-use">{symbol.use}</p>
      <p className="fate-compass-symbol-basis">{symbol.basis}</p>
    </section>)}</div>
    <p className="fate-compass-symbol-note">{SYMBOL_NOTE}</p>
  </>
}

export function ReportExtrasPreview({ question, symbols }: { question: InsightQuestion; symbols: SymbolCard[] }) {
  const { t } = useLocale()
  return <section className="fate-compass fate-compass-preview" aria-labelledby="personal-compass-title">
    <header><p className="fate-eyebrow">{t('reading.extras.previewEyebrow')}</p><h2 id="personal-compass-title">{t('reading.extras.title')}</h2><p>{t('reading.extras.previewText')}</p></header>
    <h3 className="fate-compass-subtitle">{t('reading.extras.questions')}</h3>
    <QuestionCard item={question} />
    <h3 className="fate-compass-subtitle">{t('reading.extras.symbols')}</h3>
    <SymbolCards symbols={symbols} />
    <p className="fate-compass-preview-includes">{t('reading.extras.includes')}</p>
  </section>
}

export default function ReportExtrasView({ extras, prefix }: { extras: ReportExtras; prefix: string }) {
  const { t } = useLocale()
  const sectionId = `${prefix}-everyday-compass`
  return <section id={sectionId} className="fate-reading-chapter fate-compass" aria-label={t('reading.extras.title')}>
    <ChapterHeading title={t('reading.extras.title')} kind="balance" />
    <p className="fate-compass-intro">{t('reading.extras.intro')}</p>
    <h3 className="fate-compass-subtitle">{t('reading.extras.questions')}</h3>
    <div className="fate-compass-questions">{extras.questions.map(item => <QuestionCard key={item.question} item={item} />)}</div>
    <div className="fate-compass-choices">{[
      { key: 'closer', icon: 'support', items: extras.keepClose },
      { key: 'less', icon: 'caution', items: extras.stepBack },
    ].map(group => <section key={group.key} className={`fate-compass-${group.key}`}>
      <h3><ReportIcon kind={group.icon} />{t(`reading.extras.${group.key}`)}</h3>
      <p className="fate-compass-group-note">{t(`reading.extras.${group.key}Note`)}</p>
      <ul>{group.items.map(item => <li key={item.title}><h4>{item.title}</h4><p><ReadingText text={item.text} /></p></li>)}</ul>
    </section>)}</div>
    <h3 className="fate-compass-subtitle">{t('reading.extras.symbols')}</h3>
    <SymbolCards symbols={extras.symbols} />
    <div className="fate-compass-reminder"><FateKeyMark /><blockquote><span>{t('reading.extras.reminder')}</span><p>{extras.reminder}</p></blockquote></div>
    <section className="fate-compass-experiment"><h3>{extras.experiment.title}</h3><ol>{extras.experiment.steps.map(step => <li key={step}><ReadingText text={step} /></li>)}</ol></section>
    <ChartEvidence facts={extras.evidence} />
    <details className="fate-compass-sources print:hidden"><summary>{t('reading.extras.sources')}</summary><p>{t('reading.extras.sourceNote')}</p><ul>{SYMBOL_SOURCES.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>)}</ul></details>
    <p className="hidden print:block fate-compass-print-sources">{t('reading.extras.sources')}: {SYMBOL_SOURCES.map(source => `${source.label} — ${source.url}`).join(' · ')}</p>
    <BackToChapters prefix={prefix} />
  </section>
}
