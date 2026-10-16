import { useEffect, useMemo, useRef, useState } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'
import BirthForm from '../BirthForm.tsx'
import { FateEmblem } from '../HomeOverview.tsx'
import { buildPersonalPreview, personalPreviewText } from '../../report/personal-preview.ts'
import { PREVIEW_KINDS, previewHash, previewProduct } from '../../report/personal-products.ts'
import { readPreviewDraft, updatePreviewDraft } from '../../utils/preview-draft.ts'
import type { PreviewKind } from '../../report/personal-products.ts'
import ReadingText from './ReadingText.tsx'
import ReportIcon from './ReportIcon.tsx'
import FateKeyMark from './FateKeyMark.tsx'
import ReportPrice from './ReportPrice.tsx'
import ReportChoiceDetails, { reportScope } from './ReportChoiceDetails.tsx'
import CopyButton from '../CopyButton.tsx'
import { ReportExtrasPreview } from './ReportExtrasView.tsx'
import EverydayExampleView from './EverydayExampleView.tsx'
import ReportBriefView from './ReportBriefView.tsx'
import ReportApplicationsView from './ReportApplicationsView.tsx'
import DestinyCardBonus from './DestinyCardBonus.tsx'

function focusSection(id: string) {
  const section = document.getElementById(id)
  section?.focus({ preventScroll: true })
  section?.scrollIntoView({ block: 'start' })
}

export default function PersonalPreviewPage({ kind, input, onFirstBirth }: { kind: PreviewKind; input: BirthInput | null; onFirstBirth: (input: BirthInput) => void }) {
  const { t } = useLocale()
  const [draft] = useState(readPreviewDraft)
  const [second, setSecond] = useState(draft.second)
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(() => draft.year && draft.year >= currentYear && draft.year <= currentYear + 10 ? draft.year : currentYear + 1)
  const [editing, setEditing] = useState<'first' | 'second' | null>(null)
  const focusAfterSubmit = useRef(false)
  const product = previewProduct(kind)
  const preview = useMemo(() => input ? buildPersonalPreview(kind, { first: input, second, year }) : null, [kind, input, second, year])
  const paired = kind === 'compatibility' || kind === 'bundle'
  const needsPartner = Boolean(preview?.needsPartner)
  const ready = Boolean(preview && !needsPartner && !editing)
  const pageTitle = preview?.title ?? product.title

  useEffect(() => { document.title = pageTitle + ' | The Fate Key' }, [pageTitle])
  useEffect(() => {
    if (input) updatePreviewDraft({ kind })
  }, [kind, input])
  useEffect(() => { document.getElementById('my-report')?.scrollIntoView({ block: 'start' }) }, [kind])
  useEffect(() => {
    if (focusAfterSubmit.current && !editing) {
      focusAfterSubmit.current = false
      focusSection(needsPartner ? 'personal-partner-heading' : 'personal-opening-heading')
    }
  }, [input, second, editing, needsPartner])

  function chooseYear(value: number) {
    setYear(value)
    updatePreviewDraft({ first: input ?? undefined, second, year: value, kind })
  }
  function submitFirst(value: BirthInput) {
    updatePreviewDraft({ first: value, second, year, kind })
    focusAfterSubmit.current = true
    setEditing(null)
    onFirstBirth(value)
  }
  function submitSecond(value: BirthInput) {
    setSecond(value)
    setEditing(null)
    focusAfterSubmit.current = true
    updatePreviewDraft({ first: input ?? undefined, second: value, year, kind })
  }
  function editPerson(person: 'first' | 'second') {
    setEditing(person)
    requestAnimationFrame(() => focusSection(person === 'first' ? 'personal-first-heading' : 'personal-partner-heading'))
  }

  return <article id="my-report" className="fate-personal-preview" lang="en" aria-labelledby="personal-preview-title">
    <nav className="fate-preview-steps" aria-label={t('buyer.flow.label')}><ol>
      <li><a href="#reports"><b>1</b>{t('buyer.flow.choose')}</a></li>
      <li data-current={!ready ? '' : undefined}>{input ? <button type="button" onClick={() => editPerson('first')} aria-current={!ready ? 'step' : undefined}><b>2</b>{t('site.steps.details')}</button> : <span aria-current="step"><b>2</b>{t('site.steps.details')}</span>}</li>
      <li data-current={ready ? '' : undefined}><span aria-current={ready ? 'step' : undefined}><b>3</b>{t('site.steps.preview')}</span></li>
    </ol></nav>
    <a href="#reports" className="fate-product-back">← {t('complete.back')}</a>
    <header className="fate-personal-preview-heading"><FateKeyMark /><div><p className="fate-eyebrow">{t('buyer.preview.eyebrow')}</p><h1 id="personal-preview-title">{pageTitle}</h1><p>{t('buyer.preview.intro')}</p></div></header>
    <div className="fate-personal-preview-controls"><div><label htmlFor="personal-report-kind">{t('buyer.preview.kind')}</label><select id="personal-report-kind" value={kind} onChange={event => window.location.assign(previewHash(event.target.value as PreviewKind))}>{PREVIEW_KINDS.map(value => <option key={value} value={value}>{previewProduct(value).title}</option>)}</select></div>{(kind === 'year' || kind === 'bundle') && <div><label htmlFor="personal-report-year">{t('category.examples.year')}</label><select id="personal-report-year" value={year} onChange={event => chooseYear(Number(event.target.value))}>{Array.from({ length: 11 }, (_, index) => currentYear + index).map(value => <option key={value} value={value}>{value}</option>)}</select></div>}</div>
    <ReportChoiceDetails kind={kind} />

    {!input || editing === 'first' ? <section className="fate-personal-birth-form">
      <h2 id="personal-first-heading" tabIndex={-1}>{t(input ? 'buyer.preview.change' : 'buyer.preview.enter')}</h2><p>{t('buyer.preview.enterText')}</p>
      <BirthForm key={input ? 'edit-first' : 'new-first'} initialInput={input ?? undefined} onSubmit={submitFirst} submitLabel={t(input ? 'buyer.preview.update' : 'buyer.preview.calculate')} />
      {input && <button type="button" className="fate-outline-button" onClick={() => { setEditing(null); requestAnimationFrame(() => focusSection(needsPartner ? 'personal-partner-heading' : 'personal-opening-heading')) }}>{t('buyer.preview.cancel')}</button>}
    </section> : <>
      <section className="fate-personal-subjects" aria-label={t('buyer.preview.details')}>
        <div><p className="fate-eyebrow">{t('buyer.preview.details')}</p>{preview?.subjects.map((person, index) => <div className="fate-preview-person" key={person.label}><div><strong>{paired ? person.label : t('buyer.preview.yourChart')}</strong><p>{person.birthSummary}</p><details><summary>{t('buyer.preview.chartNotes')}</summary><span>{person.dayMaster} · {person.pillarSummary.join(' · ')}</span></details></div><button type="button" className="fate-outline-button" onClick={() => editPerson(index === 0 ? 'first' : 'second')}>{t(paired ? index === 0 ? 'buyer.preview.editA' : 'buyer.preview.editB' : 'buyer.preview.change')}</button></div>)}</div>
      </section>
      {needsPartner || editing === 'second' ? <section className="fate-personal-birth-form">
        <h2 id="personal-partner-heading" tabIndex={-1}>{t('buyer.preview.partner')}</h2><p>{t('buyer.preview.partnerText')}</p>
        <BirthForm key="partner" onSubmit={submitSecond} initialInput={second} rememberInput={false} submitLabel={t(second ? 'buyer.preview.update' : 'buyer.preview.compare')} />
        {second && <button type="button" className="fate-outline-button" onClick={() => { setEditing(null); requestAnimationFrame(() => focusSection('personal-opening-heading')) }}>{t('buyer.preview.cancel')}</button>}
      </section> : preview ? <>
        {(input.unknownTime || (paired && second?.unknownTime)) && <p role="status" className="fate-personal-pending">{t('buyer.preview.unknown')}</p>}
        <section className="fate-preview-access" aria-labelledby="preview-access-title"><div><p className="fate-eyebrow">{t('buyer.preview.ready')}</p><h2 id="preview-access-title">{t('buyer.preview.accessTitle')}</h2><p>{t('buyer.preview.accessText')}</p></div><span>{t('buyer.preview.freeBadge')}</span></section>
        <nav className="fate-preview-tools" aria-label={t('buyer.preview.tools')}>
          <button type="button" onClick={() => focusSection('personal-preview-excerpts')} aria-controls="personal-preview-excerpts">{t('buyer.preview.read')}</button>
          <button type="button" onClick={() => focusSection('personal-preview-contents')} aria-controls="personal-preview-contents">{t('buyer.preview.contents')}</button>
          <CopyButton key={kind} label={t('buyer.preview.copy')} getText={() => personalPreviewText(preview)} />
          <button type="button" onClick={() => window.print()}>{t('buyer.preview.print')}</button>
        </nav>
        <p className="fate-preview-save-note">{t('buyer.preview.saveNote')}</p>
        <section className="fate-personal-opening"><p className="fate-eyebrow">{t('buyer.preview.fromChart')}</p><h2 id="personal-opening-heading" tabIndex={-1}>{preview.headline}</h2>
          {preview.brief && <ReportBriefView brief={preview.brief} onRead={() => focusSection(`personal-excerpt-${preview.brief!.chapterId}`)} />}
          <details className="fate-report-chart-details print:hidden"><summary>{t('reading.brief.themes')}</summary><div className="fate-personal-theme-grid">{preview.summary.map(theme => <div key={theme.label}><ReportIcon kind={product.icon} /><h3>{theme.label}</h3><p>{theme.text}</p></div>)}</div></details>
          <div className="hidden print:block"><div className="fate-personal-theme-grid">{preview.summary.map(theme => <div key={theme.label}><ReportIcon kind={product.icon} /><h3>{theme.label}</h3><p>{theme.text}</p></div>)}</div></div>
        </section>
        <ReportApplicationsView items={preview.applications} prefix={`personal-${kind}`} preview />
        <div className="fate-personal-preview-layout"><div>
          <section className="fate-personal-excerpts" aria-labelledby="personal-preview-excerpts"><p className="fate-eyebrow">{t('buyer.preview.excerpts')}</p><h2 id="personal-preview-excerpts" tabIndex={-1}>{t('buyer.preview.excerptsTitle')}</h2><p>{t('buyer.preview.excerptsText')}</p>{preview.excerpts.map(section => <section id={`personal-excerpt-${section.id}`} tabIndex={-1} key={section.id} className="fate-personal-excerpt"><div><ReportIcon kind={section.icon ?? product.icon} /><h3>{section.title}</h3></div><p><ReadingText text={section.lead} /></p>{section.example && <EverydayExampleView example={section.example} headingLevel={4} />}{section.paragraphs.map(text => <p key={text}><ReadingText text={text} /></p>)}<details><summary>{t('reading.chartSource')}</summary><ul>{section.evidence.map(fact => <li key={fact}>{fact}</li>)}</ul></details></section>)}</section>
          {preview.extras && <ReportExtrasPreview question={preview.extras.question} symbols={preview.extras.symbols} />}
          {preview.monthly.length > 0 && <section className="fate-personal-months"><h2>{t('buyer.preview.monthly')}</h2><p>{t('buyer.preview.monthlyText')}</p><ol>{preview.monthly.map(month => <li key={month.label}><strong>{month.label}</strong><span><ReadingText text={month.lead} /></span></li>)}</ol></section>}
        </div><aside className="fate-personal-order-summary" aria-labelledby="personal-preview-contents">
          <FateEmblem /><p className="fate-eyebrow">{t('buyer.preview.full')}</p><h2 id="personal-preview-contents" tabIndex={-1}>{preview.title}</h2><p className="fate-preview-full-scope">{reportScope(kind, t)}</p>
          <p className="fate-personal-price"><ReportPrice kind={kind} /></p><p className="fate-reading-small-note">{t('buyer.price.note')}</p><ul>{preview.contents.map(item => <li key={item.id}><span aria-hidden="true">✓</span>{item.title}</li>)}</ul><p className="fate-reading-small-note">{t('reading.extras.includes')}</p>
          <div className="fate-personal-delivery"><FateKeyMark /><p>{t('buyer.preview.delivery')}</p></div><p className="fate-personal-pending" role="status">{t('buyer.checkout.pending')}</p><a href={product.sample} className="fate-outline-button">{t('buyer.preview.sample')}</a><p className="fate-reading-small-note">{t('buyer.preview.sampleNote')}</p>
        </aside></div>
        <DestinyCardBonus kind={kind} />
        <section className="fate-personal-next"><h2>{t('buyer.preview.nextTitle')}</h2><p>{t('buyer.preview.nextText')}</p><div className="fate-preview-next-actions"><a href={product.sample} className="fate-complete-primary">{t('buyer.preview.sample')}</a><a href="#reports" className="fate-outline-button">{t('buyer.preview.otherReports')}</a></div></section>
      </> : null}
    </>}
    <footer className="fate-reading-small-note"><p>{t('buyer.preview.local')}</p><p>{t('reading.footer.note')}</p></footer>
  </article>
}
