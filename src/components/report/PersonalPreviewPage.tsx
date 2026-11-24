import { useEffect, useMemo, useRef, useState } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { buildDestinyCard } from '../../report/destiny-card.ts'
import { useLocale } from '../../i18n/index.ts'
import BirthForm from '../BirthForm.tsx'
import { FateEmblem } from '../HomeOverview.tsx'
import { buildPersonalPreview } from '../../report/personal-preview.ts'
import { PREVIEW_KINDS, checkoutHash, previewHash, localizedPreviewProduct } from '../../report/personal-products.ts'
import { readPreviewDraft, updatePreviewDraft } from '../../utils/preview-draft.ts'
import type { PreviewKind } from '../../report/personal-products.ts'
import ReadingText from './ReadingText.tsx'
import ReportIcon from './ReportIcon.tsx'
import FateKeyMark from './FateKeyMark.tsx'
import DestinyCardPreview from './DestinyCardPreview.tsx'
import './personal-preview.css'
import ReportPrice from './ReportPrice.tsx'
import ReportChoiceDetails, { reportScope } from './ReportChoiceDetails.tsx'
import BuyReportLink from './BuyReportLink.tsx'
import SandboxCheckout from './SandboxCheckout.tsx'

function focusSection(id: string) {
  const section = document.getElementById(id)
  section?.focus({ preventScroll: true })
  section?.scrollIntoView({ block: 'start' })
}

export default function PersonalPreviewPage({ kind, input, onFirstBirth }: { kind: PreviewKind; input: BirthInput | null; onFirstBirth: (input: BirthInput) => void }) {
  const { t, locale } = useLocale()
  const [draft] = useState(readPreviewDraft)
  const [second, setSecond] = useState(draft.second)
  const currentYear = new Date().getFullYear()
  const year = draft.year && draft.year >= currentYear && draft.year <= currentYear + 10 ? draft.year : currentYear + 1
  const [editing, setEditing] = useState<'first' | 'second' | null>(null)
  const focusAfterSubmit = useRef(false)
  const checkoutIntent = window.location.hash.endsWith('-checkout')
  const product = localizedPreviewProduct(kind, locale, t)
  const preview = useMemo(() => input ? buildPersonalPreview(kind, { first: input, second, year }) : null, [kind, input, second, year])
  const paired = kind === 'compatibility' || kind === 'bundle'
  const destinyCards = useMemo(() => input ? [buildDestinyCard(input), ...(paired && second ? [buildDestinyCard(second)] : [])] : [], [input, second, paired])
  const needsPartner = Boolean(preview?.needsPartner)
  const ready = Boolean(preview && !needsPartner && !editing)
  const pageTitle = locale === 'ko' ? product.title : preview?.title ?? product.title

  useEffect(() => { document.title = pageTitle + ' | The Fate Key' }, [pageTitle])
  useEffect(() => {
    if (input) updatePreviewDraft({ kind })
  }, [kind, input])
  useEffect(() => { focusSection(checkoutIntent ? 'personal-checkout' : 'my-report') }, [kind, checkoutIntent])
  useEffect(() => {
    if (focusAfterSubmit.current && !editing) {
      focusAfterSubmit.current = false
      focusSection(needsPartner ? 'personal-partner-heading' : checkoutIntent ? 'personal-checkout' : 'personal-destiny-card')
    }
  }, [input, second, editing, needsPartner, checkoutIntent])

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
    <nav className="fate-preview-steps" aria-label={t(checkoutIntent ? 'purchase.checkout' : 'buyer.flow.label')}><ol>
      <li><a href="#reports"><b>1</b>{t('buyer.flow.choose')}</a></li>
      <li data-current={!ready ? '' : undefined}>{input ? <button type="button" onClick={() => editPerson('first')} aria-current={!ready ? 'step' : undefined}><b>2</b>{t('site.steps.details')}</button> : <span aria-current="step"><b>2</b>{t('site.steps.details')}</span>}</li>
      <li data-current={ready ? '' : undefined}><span aria-current={ready ? 'step' : undefined}><b>3</b>{t(checkoutIntent ? 'purchase.checkout' : 'site.steps.preview')}</span></li>
    </ol></nav>
    <a href="#reports" className="fate-product-back">← {t('complete.back')}</a>
    <header className="fate-personal-preview-heading"><FateKeyMark /><div><p className="fate-eyebrow">{t(checkoutIntent ? 'purchase.checkout' : 'buyer.preview.eyebrow')}</p><h1 id="personal-preview-title">{pageTitle}</h1>{!checkoutIntent && <p>{t('buyer.preview.intro')}</p>}</div></header>
    <div className="fate-personal-preview-controls"><div><label htmlFor="personal-report-kind">{t('buyer.preview.kind')}</label><select id="personal-report-kind" value={kind} onChange={event => window.location.assign(checkoutIntent ? checkoutHash(event.target.value as PreviewKind) : previewHash(event.target.value as PreviewKind))}>{PREVIEW_KINDS.map(value => <option key={value} value={value}>{localizedPreviewProduct(value, locale, t).title}</option>)}</select></div></div>
    {(!input || checkoutIntent) && <section id="personal-checkout" className="fate-checkout-summary" tabIndex={-1} aria-labelledby="personal-checkout-title">
      <div><p className="fate-eyebrow">{t('purchase.heading')}</p><h2 id="personal-checkout-title">{product.title}</h2><ReportPrice kind={kind} /></div>
      {checkoutIntent ? ready && input ? <SandboxCheckout order={{ kind, first: input, ...(paired ? { second } : {}), ...((kind === 'year' || kind === 'bundle') ? { year } : {}) }} /> : <p role="status">{t('purchase.needDetails')}</p> : <BuyReportLink kind={kind} />}
    </section>}
    {checkoutIntent ? <details className="fate-checkout-contents"><summary>{t('buyer.preview.contents')}</summary><ReportChoiceDetails kind={kind} /></details> : !input ? <ReportChoiceDetails kind={kind} /> : null}

    {!input || editing === 'first' ? <section className="fate-personal-birth-form">
      <h2 id="personal-first-heading" tabIndex={-1}>{t(input ? 'buyer.preview.change' : 'buyer.preview.enter')}</h2><p>{t('buyer.preview.enterText')}</p>
      <BirthForm key={input ? 'edit-first' : 'new-first'} initialInput={input ?? undefined} onSubmit={submitFirst} submitLabel={t(checkoutIntent ? 'purchase.continue' : input ? 'buyer.preview.update' : 'buyer.preview.calculate')} />
      {input && <button type="button" className="fate-outline-button" onClick={() => { setEditing(null); requestAnimationFrame(() => focusSection(needsPartner ? 'personal-partner-heading' : checkoutIntent ? 'personal-checkout' : 'personal-destiny-card')) }}>{t('buyer.preview.cancel')}</button>}
    </section> : <>
      {needsPartner ? <section className="fate-personal-birth-form"><h2 id="personal-partner-heading" tabIndex={-1}>{t('buyer.preview.partner')}</h2><p>{t('buyer.preview.partnerText')}</p><BirthForm key="partner" onSubmit={submitSecond} initialInput={second} rememberInput={false} submitLabel={t(checkoutIntent ? 'purchase.continue' : second ? 'buyer.preview.update' : 'buyer.preview.compare')} />{second && <button type="button" className="fate-outline-button" onClick={() => { setEditing(null); requestAnimationFrame(() => focusSection('personal-opening-heading')) }}>{t('buyer.preview.cancel')}</button>}</section> : null}
      <section className="fate-personal-subjects" aria-label={t('buyer.preview.details')}>
        <div><p className="fate-eyebrow">{t('buyer.preview.details')}</p><p>{locale === 'ko' ? '입력한 생년월일로 지금 개인 운명 카드와 리포트 답변 미리보기를 만들어요. 구매 후 전체 리포트를 받을 수 있어요.' : 'Your birth details generate this personal card and report preview now. The full report is available after purchase.'}</p><button type="button" className="fate-outline-button" onClick={() => editPerson('first')}>{t('buyer.preview.change')}</button></div>
      </section>
      {needsPartner || editing === 'second' ? <section className="fate-personal-birth-form">
        <h2 id="personal-partner-heading" tabIndex={-1}>{t('buyer.preview.partner')}</h2><p>{t('buyer.preview.partnerText')}</p>
        <BirthForm key="partner" onSubmit={submitSecond} initialInput={second} rememberInput={false} submitLabel={t(checkoutIntent ? 'purchase.continue' : second ? 'buyer.preview.update' : 'buyer.preview.compare')} />
        {second && <button type="button" className="fate-outline-button" onClick={() => { setEditing(null); requestAnimationFrame(() => focusSection('personal-opening-heading')) }}>{t('buyer.preview.cancel')}</button>}
      </section> : preview ? <>
        {(input.unknownTime || (paired && second?.unknownTime)) && <p role="status" className="fate-personal-pending">{t('buyer.preview.unknown')}</p>}
        <section id="personal-destiny-card" className="fate-personal-card-preview-section" aria-label={t('destiny.preview.title')}>
          {destinyCards.map((card, index) => <article className="fate-personal-card-preview-item" key={index}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', marginInline: 'auto' }}>
              <DestinyCardPreview card={card} />
              
            </div>
            <div className="fate-personal-card-meaning"><p className="fate-eyebrow">{locale === 'ko' ? '내 운명 카드' : 'YOUR DESTINY CARD'}</p><h2>{card.title}</h2><p>{card.sentence}</p><p className="fate-reading-small-note">{locale === 'ko' ? '이 카드는 구매 후 잠금 표시 없는 SNS용 4:5 이미지로 제공돼요.' : 'Your purchased report includes this card without the preview mark, ready to share in 4:5 format.'}</p></div>
          </article>)}
        </section>
        <section className="fate-preview-access" aria-labelledby="preview-access-title"><div><p className="fate-eyebrow">{locale === 'ko' ? '내 리포트 미리보기' : 'YOUR REPORT PREVIEW'}</p><h2 id="preview-access-title">{locale === 'ko' ? '내 답변을 먼저 확인해 보세요' : 'Preview your personal answers'}</h2><p>{locale === 'ko' ? '내 운명 카드와 리포트 답변 일부를 먼저 보고, 전체 내용은 구매 후 확인할 수 있어요.' : 'See your Destiny Card and selected answers first. The complete report is available after purchase.'}</p></div><span>{locale === 'ko' ? '무료 미리보기' : 'FREE PREVIEW'}</span></section>
        <nav className="fate-preview-tools" aria-label={t('buyer.preview.tools')}>
          <button type="button" onClick={() => focusSection('personal-preview-excerpts')} aria-controls="personal-preview-excerpts">{locale === 'ko' ? '내 답변 읽기' : 'Read your answers'}</button>
          <button type="button" onClick={() => focusSection('personal-preview-contents')} aria-controls="personal-preview-contents">{t('buyer.preview.contents')}</button>
        </nav>
        <section className="fate-personal-opening"><p className="fate-eyebrow">{locale === 'ko' ? '내 차트로 만든 내용' : 'MADE FROM YOUR BIRTH CHART'}</p><h2 id="personal-opening-heading" tabIndex={-1}>{locale === 'ko' ? '내 리포트 답변 미리보기' : 'A preview of your report answers'}</h2>
          <p>{locale === 'ko' ? '아래 답변은 입력한 출생 정보로 생성된 개인 리포트 내용이에요.' : 'The answers below are personal report content generated from the birth details you entered.'}</p>
        </section>
        <div className="fate-personal-preview-layout"><div>
          <section className="fate-personal-excerpts" aria-labelledby="personal-preview-excerpts"><p className="fate-eyebrow">{locale === 'ko' ? '개인 답변 일부' : 'SELECTED PERSONAL ANSWERS'}</p><h2 id="personal-preview-excerpts" tabIndex={-1}>{locale === 'ko' ? '내 질문에 대한 답변 미리보기' : 'Your answers, in preview'}</h2><p>{locale === 'ko' ? '전체 질문과 답변 중 약 20%를 보여드려요. 같은 내용이 여러 질문에 연결될 경우 미리보기에는 한 번만 표시합니다.' : 'This preview shows about 20% of the report’s question-answer content. Shared answers appear only once here; the full report includes every answer.'}</p>{preview.excerpts.map(section => <section id={`personal-excerpt-${section.id}`} tabIndex={-1} key={section.id} className="fate-personal-excerpt"><div><ReportIcon kind={section.icon ?? product.icon} /><h3>{section.title}</h3></div><p><ReadingText text={section.lead} /></p></section>)}</section>
        </div><aside className="fate-personal-order-summary" aria-labelledby="personal-preview-contents">
          <FateEmblem /><p className="fate-eyebrow">{t('buyer.preview.full')}</p><h2 id="personal-preview-contents" tabIndex={-1}>{preview.title}</h2><p className="fate-preview-full-scope">{reportScope(kind, t)}</p>
          <p className="fate-personal-price"><ReportPrice kind={kind} /></p><p className="fate-reading-small-note">{t('buyer.price.note')}</p><ul>{preview.contents.map(item => <li key={item.id}><span aria-hidden="true">✓</span>{item.title}</li>)}</ul><p className="fate-reading-small-note">{t('reading.extras.includes')}</p>
          <div className="fate-personal-delivery"><FateKeyMark /><p>{t('buyer.preview.delivery')}</p></div><BuyReportLink kind={kind} /><a href={product.sample} className="fate-outline-button">{t('buyer.preview.sample')}</a><p className="fate-reading-small-note">{t('buyer.preview.sampleNote')}</p>
        </aside></div>
        <section className="fate-personal-next"><h2>{t('buyer.preview.nextTitle')}</h2><p>{t('buyer.preview.nextText')}</p><div className="fate-preview-next-actions"><a href={product.sample} className="fate-complete-primary">{t('buyer.preview.sample')}</a><a href="#reports" className="fate-outline-button">{t('buyer.preview.otherReports')}</a></div></section>
      </> : null}
    </>}
    <footer className="fate-reading-small-note"><p>{t('buyer.preview.local')}</p><p>{t('reading.footer.note')}</p></footer>
  </article>
}
