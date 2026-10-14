import { useEffect, useMemo, useState } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'
import BirthForm from '../BirthForm.tsx'
import { FateEmblem } from '../HomeOverview.tsx'
import { buildPersonalPreview } from '../../report/personal-preview.ts'
import { PREVIEW_KINDS, previewHash, previewProduct } from '../../report/personal-products.ts'
import { readPreviewDraft, savePreviewDraft } from '../../utils/preview-draft.ts'
import type { PreviewKind } from '../../report/personal-products.ts'
import ReadingText from './ReadingText.tsx'
import ReportIcon from './ReportIcon.tsx'
import FateKeyMark from './FateKeyMark.tsx'

export default function PersonalPreviewPage({ kind, input, onFirstBirth }: { kind: PreviewKind; input: BirthInput | null; onFirstBirth: (input: BirthInput) => void }) {
  const { t } = useLocale()
  const [draft] = useState(readPreviewDraft)
  const [second, setSecond] = useState(draft.second)
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(() => draft.year && draft.year >= currentYear && draft.year <= currentYear + 10 ? draft.year : currentYear + 1)
  const [editingSecond, setEditingSecond] = useState(false)
  const product = previewProduct(kind)
  const preview = useMemo(() => input ? buildPersonalPreview(kind, { first: input, second, year }) : null, [kind, input, second, year])
  const paired = kind === 'compatibility' || kind === 'bundle'
  useEffect(() => { document.getElementById('my-report')?.scrollIntoView({ block: 'start' }) }, [kind])
  function chooseYear(value: number) { setYear(value); savePreviewDraft({ first: input ?? undefined, second, year: value }) }
  function submitSecond(value: BirthInput) { setSecond(value); setEditingSecond(false); savePreviewDraft({ first: input ?? undefined, second: value, year }) }
  return <article id="my-report" className="fate-personal-preview" lang="en" aria-labelledby="personal-preview-title">
    <a href="#reports" className="fate-product-back">← {t('complete.back')}</a>
    <header className="fate-personal-preview-heading"><FateKeyMark /><div><p className="fate-eyebrow">{t('buyer.preview.eyebrow')}</p><h1 id="personal-preview-title">{preview?.title ?? product.title}</h1><p>{t('buyer.preview.intro')}</p></div></header>
    <div className="fate-personal-preview-controls"><div><label htmlFor="personal-report-kind">{t('buyer.preview.kind')}</label><select id="personal-report-kind" value={kind} onChange={event => window.location.assign(previewHash(event.target.value as PreviewKind))}>{PREVIEW_KINDS.map(value => <option key={value} value={value}>{previewProduct(value).title}</option>)}</select></div>{(kind === 'year' || kind === 'bundle') && <div><label htmlFor="personal-report-year">{t('category.examples.year')}</label><select id="personal-report-year" value={year} onChange={event => chooseYear(Number(event.target.value))}>{Array.from({ length: 11 }, (_, index) => new Date().getFullYear() + index).map(value => <option key={value} value={value}>{value}</option>)}</select></div>}</div>
    {!input ? <section className="fate-personal-birth-form"><h2>{t('buyer.preview.enter')}</h2><p>{t('buyer.preview.enterText')}</p><BirthForm onSubmit={onFirstBirth} submitLabel={t('buyer.preview.calculate')} /></section> : <>
      <section className="fate-personal-subjects" aria-label={t('buyer.preview.details')}><div><p className="fate-eyebrow">{t('buyer.preview.details')}</p>{preview?.subjects.map(person => <div key={person.label}><strong>{paired ? person.label : t('buyer.preview.yourChart')}</strong><p>{person.birthSummary}</p><span>{person.dayMaster} · {person.pillarSummary.join(' · ')}</span></div>)}</div><a href="#birth-details" className="fate-outline-button">{t('buyer.preview.change')}</a></section>
      {(preview?.needsPartner || editingSecond) ? <section className="fate-personal-birth-form"><h2>{t('buyer.preview.partner')}</h2><p>{t('buyer.preview.partnerText')}</p><BirthForm key="partner" onSubmit={submitSecond} initialInput={second} rememberInput={false} submitLabel={t('buyer.preview.compare')} /></section> : <>
        {paired && <button type="button" className="fate-outline-button fate-partner-edit" onClick={() => setEditingSecond(true)}>{t('buyer.preview.editPartner')}</button>}
        {(input.unknownTime || (paired && second?.unknownTime)) && <p role="status" className="fate-personal-pending">{t('buyer.preview.unknown')}</p>}
        <section className="fate-personal-opening"><p className="fate-eyebrow">{t('buyer.preview.fromChart')}</p><h2>{preview?.headline}</h2><div className="fate-personal-theme-grid">{preview?.summary.map(theme => <div key={theme.label}><ReportIcon kind={product.icon} /><h3>{theme.label}</h3><p>{theme.text}</p></div>)}</div></section>
        <div className="fate-personal-preview-layout"><div><section className="fate-personal-excerpts" aria-labelledby="personal-excerpt-title"><p className="fate-eyebrow">{t('buyer.preview.excerpts')}</p><h2 id="personal-excerpt-title">{t('buyer.preview.excerptsTitle')}</h2><p>{t('buyer.preview.excerptsText')}</p>{preview?.excerpts.map(section => <section key={section.id} className="fate-personal-excerpt"><div><ReportIcon kind={section.icon ?? product.icon} /><h3>{section.title}</h3></div><p><ReadingText text={section.lead} /></p>{section.paragraphs.map(text => <p key={text}><ReadingText text={text} /></p>)}<details><summary>{t('reading.chartSource')}</summary><ul>{section.evidence.map(fact => <li key={fact}>{fact}</li>)}</ul></details></section>)}</section>
          {preview?.monthly.length ? <section className="fate-personal-months"><h2>{t('buyer.preview.monthly')}</h2><p>{t('buyer.preview.monthlyText')}</p><ol>{preview.monthly.map(month => <li key={month.label}><strong>{month.label}</strong><span><ReadingText text={month.lead} /></span></li>)}</ol></section> : null}
        </div><aside className="fate-personal-order-summary" aria-labelledby="preview-order-title"><FateEmblem /><p className="fate-eyebrow">{t('buyer.preview.full')}</p><h2 id="preview-order-title">{preview?.title}</h2><p className="fate-personal-price">{product.price ?? t('home.products.tbd.price')}</p><p className="fate-reading-small-note">{t('buyer.price.note')}</p><ul>{preview?.contents.map(item => <li key={item.id}><span aria-hidden="true">✓</span>{item.title}</li>)}</ul><div className="fate-personal-delivery"><FateKeyMark /><p>{t('buyer.preview.delivery')}</p></div><p className="fate-personal-pending" role="status">{t('buyer.checkout.pending')}</p><a href={product.sample} className="fate-outline-button">{t('buyer.preview.sample')}</a><p className="fate-reading-small-note">{t('buyer.preview.sampleNote')}</p></aside></div>
        <section className="fate-personal-next"><h2>{t('buyer.preview.nextTitle')}</h2><p>{t('buyer.preview.nextText')}</p><a href="#reports" className="fate-outline-button">{t('buyer.preview.otherReports')}</a></section>
      </>}
    </>}
    <footer className="fate-reading-small-note"><p>{t('buyer.preview.local')}</p><p>{t('reading.footer.note')}</p></footer>
  </article>
}
