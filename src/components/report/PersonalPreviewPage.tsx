import { useEffect, useMemo, useRef, useState } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'
import BirthForm from '../BirthForm.tsx'
import { buildPersonalPreview, personalPreviewText } from '../../report/personal-preview.ts'
import { checkoutHash, previewProduct } from '../../report/personal-products.ts'
import { readPreviewDraft, updatePreviewDraft } from '../../utils/preview-draft.ts'
import type { PreviewKind } from '../../report/personal-products.ts'
import CopyButton from '../CopyButton.tsx'
import FateKeyMark from './FateKeyMark.tsx'
import { isPurchaseHost, isSandboxHost } from '../../utils/purchase-client.ts'
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
  const [editing, setEditing] = useState<'first' | 'second' | null>(null)
  const [purchaseAvailable, setPurchaseAvailable] = useState(false)
  const focusAfterSubmit = useRef(false)
  const checkoutIntent = window.location.hash.endsWith('-checkout')
  const sandbox = isSandboxHost(window.location.hostname)
  const product = previewProduct(kind)
  const preview = useMemo(() => input ? buildPersonalPreview(kind, { first: input, second }, locale) : null, [kind, input, second, locale])
  const paired = kind === 'compatibility' || kind === 'bundle'
  const needsPartner = Boolean(preview?.needsPartner)
  const pageTitle = preview?.title ?? (locale === 'ko' ? ({ complete: '나의 삶과 운명', year: '앞으로 12개월 리딩', compatibility: '관계 리딩', career: '직업과 재물 리딩', love: '나의 연애 리딩', bundle: '운명 종합 패키지', business: '사업과 창업 리딩', wellbeing: '성격과 오행 리딩' } as const)[kind] : product.title)

  useEffect(() => {
    document.title = pageTitle + ' | The Fate Key'
    let cancelled = false
    if (!isPurchaseHost(window.location.hostname)) return () => { cancelled = true }
    void fetch('/api/payments?action=availability', { cache: 'no-store' }).then(response => response.json()).then(value => {
      if (!cancelled) setPurchaseAvailable(value.available === true && value.mode === 'live')
    }).catch(() => { if (!cancelled) setPurchaseAvailable(false) })
    return () => { cancelled = true }
  }, [pageTitle])
  useEffect(() => { if (input) updatePreviewDraft({ kind }) }, [kind, input])
  useEffect(() => { focusSection(checkoutIntent ? 'personal-checkout' : 'my-report') }, [kind, checkoutIntent])
  useEffect(() => {
    if (focusAfterSubmit.current && !editing) {
      focusAfterSubmit.current = false
      focusSection(needsPartner ? 'personal-partner-heading' : checkoutIntent ? 'personal-checkout' : 'personal-opening-heading')
    }
  }, [input, second, editing, needsPartner, checkoutIntent])

  function submitFirst(value: BirthInput) {
    updatePreviewDraft({ first: value, second, kind })
    focusAfterSubmit.current = true
    setEditing(null)
    onFirstBirth(value)
  }
  function submitSecond(value: BirthInput) {
    setSecond(value)
    setEditing(null)
    focusAfterSubmit.current = true
    updatePreviewDraft({ first: input ?? undefined, second: value, kind })
  }
  function editPerson(person: 'first' | 'second') {
    setEditing(person)
    requestAnimationFrame(() => focusSection(person === 'first' ? 'personal-first-heading' : 'personal-partner-heading'))
  }

  return <article id="my-report" className="fate-personal-preview fate-glimpse" lang={locale} aria-labelledby="personal-preview-title">
    <a href="#reports" className="fate-product-back">← {t('complete.back')}</a>
    <header className="fate-personal-preview-heading"><FateKeyMark /><div><p className="fate-eyebrow">{t('buyer.preview.eyebrow')}</p><h1 id="personal-preview-title">{pageTitle}</h1><p>{t('buyer.preview.intro')}</p></div></header>
    {checkoutIntent && !input && <section id="personal-checkout" className="fate-glimpse-cta"><h2>{pageTitle}</h2><p><strong>{product.price}</strong></p><p>{paired ? t('buyer.preview.partnerText') : t('purchase.needDetails')}</p></section>}
    {!input || editing === 'first' ? <section className="fate-personal-birth-form">
      <h2 id="personal-first-heading" tabIndex={-1}>{t(input ? 'buyer.preview.change' : 'buyer.preview.enter')}</h2><p>{t('buyer.preview.enterText')}</p>
      <BirthForm key={input ? 'edit-first' : 'new-first'} initialInput={input ?? undefined} onSubmit={submitFirst} submitLabel={t(input ? 'buyer.preview.update' : 'buyer.preview.calculate')} />
      {input && <button type="button" className="fate-outline-button" onClick={() => setEditing(null)}>{t('buyer.preview.cancel')}</button>}
    </section> : needsPartner || editing === 'second' ? <section className="fate-personal-birth-form">
      <h2 id="personal-partner-heading" tabIndex={-1}>{t('buyer.preview.partner')}</h2><p>{t('buyer.preview.partnerText')}</p>
      <BirthForm key="partner" onSubmit={submitSecond} initialInput={second} rememberInput={false} submitLabel={second ? t('buyer.preview.update') : t('buyer.preview.compare')} />
    </section> : preview ? <>
      {preview.timeUnknown && <p role="status" className="fate-personal-pending">{t('reading.timeUnknown')}</p>}
      <section className="fate-glimpse-card" aria-labelledby="personal-opening-heading">
        <p className="fate-eyebrow">{preview.birthSummary}</p>
        <h2 id="personal-opening-heading" tabIndex={-1}>{t('glimpse.personality')}</h2><p>{preview.personality}</p>
        <h2>{t('glimpse.strength')}</h2><p>{preview.strength}</p>
        <h2>{t('glimpse.symbols')}</h2><div className="fate-glimpse-symbols"><span>{preview.symbol.colors.map(color => <i key={color.name} title={color.name} style={{ backgroundColor: color.hex }} />)} {preview.symbol.colors.map(color => color.name).join(' · ')}</span><strong>{preview.symbol.elementLabel} · {preview.symbol.numbers.slice(0, 2).join(' · ')}</strong></div>
      </section>
      <section className="fate-glimpse-locked" aria-labelledby="glimpse-locked-title"><h2 id="glimpse-locked-title">{t('glimpse.locked')}</h2><ul>{preview.lockedQuestions.slice(0, 4).map(question => <li key={question}><span aria-hidden="true">🔒</span>{question}</li>)}</ul></section>
      <section id="personal-checkout" className="fate-glimpse-cta" tabIndex={-1}><h2>{t('glimpse.ctaTitle')}</h2><p>{t('glimpse.ctaText')}</p><div className="fate-glimpse-purchase"><strong>{product.price}</strong>{purchaseAvailable && !checkoutIntent ? <a className="fate-complete-primary" href={checkoutHash(kind)}>{t('glimpse.buy').replace('$19.99', product.price)}</a> : checkoutIntent && (purchaseAvailable || sandbox) && input ? <SandboxCheckout order={{ kind, first: input, ...(paired ? { second } : {}) }} /> : <p role="status">{t('glimpse.purchaseClosed')}</p>}</div></section>
      <nav className="fate-glimpse-tools" aria-label={t('buyer.preview.tools')}><CopyButton label={t('buyer.preview.copy')} getText={() => personalPreviewText(preview, locale)} /><button type="button" onClick={() => window.print()}>{t('buyer.preview.print')}</button>{input && <button type="button" onClick={() => editPerson('first')}>{t('buyer.preview.change')}</button>}</nav>
      <p className="fate-reading-small-note">{t('buyer.preview.local')}</p>
    </> : null}
  </article>
}
