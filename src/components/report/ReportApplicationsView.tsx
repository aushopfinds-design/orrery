import { useState } from 'react'
import { useLocale } from '../../i18n/index.ts'
import { applicationText } from '../../report/report-applications.ts'
import type { ReportApplication } from '../../report/report-applications.ts'
import CopyButton from '../CopyButton.tsx'
import FateKeyMark from './FateKeyMark.tsx'
import ReadingText from './ReadingText.tsx'
import ReportIcon from './ReportIcon.tsx'
import { BackToChapters } from './ReportBriefView.tsx'

function SituationPanel({ item, prefix, active, preview }: { item: ReportApplication; prefix: string; active: boolean; preview: boolean }) {
  const { t } = useLocale()
  return <section id={`${prefix}-situation-${item.id}`} role="tabpanel" aria-labelledby={`${prefix}-situation-tab-${item.id}`} tabIndex={0} className="fate-situation-panel" data-active={active}>
    <header className="fate-situation-question"><p className="fate-eyebrow">{item.scope}</p><h3>{item.title}</h3><p><ReadingText text={item.scene} /></p><p className="fate-situation-main-question"><ReadingText text={item.question} /></p></header>
    <section className="fate-situation-personal"><h4><FateKeyMark />{t('reading.application.connection')}</h4>
      <dl>{item.pattern.themes.map(theme => <div key={theme.label}><dt>{theme.label}</dt><dd><ReadingText text={theme.text} /></dd></div>)}</dl>
      {item.pattern.connections.map(text => <p key={text}><ReadingText text={text} /></p>)}
      <blockquote><span>{t('reading.application.personalCheck')}</span><p><ReadingText text={item.pattern.question} /></p></blockquote>
    </section>
    <h4 className="fate-situation-subtitle">{t('reading.application.choices')}</h4>
    <div className="fate-situation-choices">{item.choices.map((choice, index) => <section key={choice.title}><span className="fate-situation-option" aria-hidden="true">{index === 0 ? 'A' : 'B'}</span><h5>{choice.title}</h5><p><strong>{t('reading.application.when')}</strong> <ReadingText text={choice.when} /></p><p><strong>{t('reading.application.tradeoff')}</strong> <ReadingText text={choice.tradeoff} /></p></section>)}</div>
    <div className="fate-situation-words"><ReportIcon kind="social" /><div><h4>{t('reading.application.words')}</h4><blockquote><ReadingText text={item.say} /></blockquote></div></div>
    <div className="fate-situation-practice"><section><h4>{t('reading.application.plan')}</h4><ol>{item.steps.map(step => <li key={step}><ReadingText text={step} /></li>)}</ol></section><section className="fate-situation-record"><h4>{t('reading.application.record')}</h4><ol>{item.record.map(prompt => <li key={prompt}><ReadingText text={prompt} /><span aria-hidden="true" /></li>)}</ol><p>{t('reading.application.recordNote')}</p></section></div>
    <section className="fate-situation-review"><h4>{t('reading.application.review')}</h4><div><p><strong>{t('reading.application.keep')}</strong> <ReadingText text={item.keep} /></p><p><strong>{t('reading.application.adjust')}</strong> <ReadingText text={item.adjust} /></p></div></section>
    <details className="fate-situation-fit print:hidden"><summary>{t('reading.application.fit')}</summary><p><ReadingText text={item.doesNotFit} /></p></details><p className="hidden print:block fate-situation-print-note"><strong>{t('reading.application.fit')}</strong> {item.doesNotFit}</p>
    <details className="fate-situation-sources print:hidden"><summary>{t('reading.chartSource')}</summary><ul>{item.pattern.facts.map(fact => <li key={fact}>{fact}</li>)}</ul></details><p className="hidden print:block fate-situation-print-note"><strong>{t('reading.chartSource')}</strong> {item.pattern.facts.join(' ')}</p>
    <div className="fate-situation-save print:hidden"><CopyButton key={item.id} label={t('reading.application.copy')} getText={() => [`THE FATE KEY · ${t('reading.application.copyBadge')}`, t(preview ? 'buyer.preview.freeBadge' : 'reading.complete.sampleBadge'), t('reading.application.copyDisclosure'), applicationText(item)].join('\n\n')} /><p>{t('reading.application.copyNote')}</p></div>
  </section>
}

export default function ReportApplicationsView({ items, prefix, preview = false }: { items: ReportApplication[]; prefix: string; preview?: boolean }) {
  const { t } = useLocale()
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  if (!items.length) return null
  const active = items.some(item => item.id === activeId) ? activeId : items[0].id
  return <section id={`${prefix}-situations`} className="fate-situations" aria-labelledby={`${prefix}-situations-title`}>
    <header className="fate-situations-heading"><FateKeyMark /><div><p className="fate-eyebrow">{t('reading.application.eyebrow')}</p><h2 id={`${prefix}-situations-title`}>{t('reading.application.title')}</h2><p>{t('reading.application.intro')}</p></div></header>
    {preview && <p className="fate-situations-preview-note">{t('reading.application.preview')}</p>}
    <div className="fate-situation-tabs print:hidden" role="tablist" aria-label={t('reading.application.choose')}>{items.map((item, index) => <button key={item.id} type="button" id={`${prefix}-situation-tab-${item.id}`} role="tab" aria-selected={active === item.id} aria-controls={`${prefix}-situation-${item.id}`} tabIndex={active === item.id ? 0 : -1} onClick={() => setActiveId(item.id)} onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length
      setActiveId(items[next].id)
      document.getElementById(`${prefix}-situation-tab-${items[next].id}`)?.focus()
    }}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{item.title}</span></button>)}</div>
    <p className="fate-situations-note">{t('reading.application.note')}</p>
    {items.map(item => <SituationPanel key={item.id} item={item} prefix={prefix} active={active === item.id} preview={preview} />)}
    {!preview && <BackToChapters prefix={prefix} />}
  </section>
}
