import { useEffect, useMemo, useRef, useState } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../i18n/index.ts'
import { buildDestinyCard, destinyCardCount, destinyShareText, DESTINY_SHARE_URL } from '../report/destiny-card.ts'
import { readPreviewDraft } from '../utils/preview-draft.ts'
import { previewProduct } from '../report/personal-products.ts'
import { SYMBOL_NOTE } from '../report/report-extras.ts'
import { exportCard, saveCardBlob } from '../utils/card-export.tsx'
import DestinyCardPreview from './report/DestinyCardPreview.tsx'
import CopyButton from './CopyButton.tsx'

export default function DestinyCardStudio({ input }: { input: BirthInput | null }) {
  const { t } = useLocale()
  const [draft] = useState(readPreviewDraft)
  const [mode, setMode] = useState<'sample' | 'personal'>(input ? 'personal' : 'sample')
  const [person, setPerson] = useState(0)
  const [names, setNames] = useState(['', ''])
  const [birthdays, setBirthdays] = useState([false, false])
  const [shareStatus, setShareStatus] = useState('')
  const [sharing, setSharing] = useState(false)
  const sampleRequest = useRef<AbortController | null>(null)
  useEffect(() => () => sampleRequest.current?.abort(), [])
  const sampleCard = useMemo(() => buildDestinyCard({ year:1992, month:8, day:17, hour:0, minute:0, unknownTime:true, gender:'M', timezone:'Australia/Sydney', latitude:-33.8688, longitude:151.2093 }, 'Design Sample'), [])
  async function sampleFile(format: 'png' | 'mp4') {
    sampleRequest.current?.abort()
    const request = new AbortController(); sampleRequest.current = request
    return exportCard(sampleCard, format, request.signal, percent => setShareStatus(t('card.export.progress').replace('{percent}', String(percent))), true)
  }
  async function saveSample(format: 'png' | 'mp4') {
    if (sharing) return
    setSharing(true); setShareStatus('')
    try { saveCardBlob(await sampleFile(format), `The-Fate-Key-Design-Sample.${format}`); setShareStatus(t('destiny.share.done')) }
    catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setShareStatus(t(error instanceof Error && error.message === 'card_video_unsupported' ? 'card.export.unsupported' : 'card.export.error')) }
    finally { setSharing(false) }
  }
  const kind = draft.kind ?? 'complete'
  const count = destinyCardCount(kind)
  const currentInput = person === 0 ? input : draft.second ?? null
  const card = useMemo(() => currentInput ? buildDestinyCard(currentInput, names[person], birthdays[person]) : null, [currentInput, names, birthdays, person])
  const title = t('destiny.studio.title')
  useEffect(() => { document.getElementById('card-studio')?.scrollIntoView({ block: 'start' }) }, [])
  useEffect(() => { document.title = title + ' | The Fate Key' }, [title])

  async function shareSample() {
    setShareStatus('')
    if (!navigator.share) { setShareStatus(t('destiny.share.fallback')); return }
    setSharing(true)
    try {
      const file = new File([await sampleFile('mp4')], 'The-Fate-Key-Design-Sample.mp4', { type: 'video/mp4' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'The Fate Key · Design Sample', text: destinyShareText() })
      else await navigator.share({ title: 'The Fate Key · Destiny Card', text: destinyShareText(), url: DESTINY_SHARE_URL })
      setShareStatus(t('destiny.share.done'))
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setShareStatus(t('destiny.share.fallback'))
    } finally { setSharing(false) }
  }

  return <article id="card-studio" className="fate-card-studio fate-section" aria-labelledby="card-studio-title">
    <a href="#destiny-card" className="fate-product-back">← {t('destiny.studio.back')}</a>
    <header className="fate-card-studio-heading"><p className="fate-eyebrow">{t('destiny.home.eyebrow')}</p><h1 id="card-studio-title">{t('destiny.studio.title')}</h1><p>{t('destiny.studio.intro')}</p></header>
    <div className="fate-card-studio-modes" role="group" aria-label={t('destiny.studio.mode')}><button type="button" aria-pressed={mode === 'sample'} onClick={() => setMode('sample')}>{t('destiny.studio.sample')}</button><button type="button" aria-pressed={mode === 'personal'} onClick={() => setMode('personal')}>{t('destiny.studio.personal')}</button></div>
    <div className="fate-card-studio-layout">
      <div className="fate-card-studio-canvas">{mode === 'personal' && card ? <DestinyCardPreview card={card} /> : <DestinyCardPreview card={sampleCard} />}<p>{t(mode === 'sample' ? 'destiny.home.sample' : card ? 'destiny.preview.note' : 'destiny.studio.noDetailsSample')}</p></div>
      <div className="fate-card-studio-panel">
        {mode === 'personal' ? <section aria-labelledby="destiny-personal-title"><p className="fate-eyebrow">{t('destiny.preview.eyebrow')}</p><h2 id="destiny-personal-title">{t('destiny.preview.title')}</h2>{input ? <>
          <p className="fate-card-order-note">{previewProduct(kind).title} · {t(count === 2 ? 'destiny.count.two' : 'destiny.count.one')}</p>
          {count === 2 && <div className="fate-card-person-switch" role="group" aria-label={t('destiny.preview.person')}>{[0, 1].map(index => <button type="button" key={index} aria-pressed={person === index} onClick={() => setPerson(index)}>{t(index === 0 ? 'destiny.preview.personA' : 'destiny.preview.personB')}</button>)}</div>}
          {card ? <><label htmlFor="destiny-display-name">{t('destiny.preview.name')}</label><input id="destiny-display-name" type="text" autoComplete="off" maxLength={48} value={names[person]} placeholder={t('destiny.preview.placeholder')} onChange={event => setNames(values => values.map((value, index) => index === person ? event.target.value : value))} /><p className="fate-destiny-small">{t('destiny.preview.nameNote')}</p><label className="fate-card-birthday"><input type="checkbox" checked={birthdays[person]} onChange={event => setBirthdays(values => values.map((value, index) => index === person ? event.target.checked : value))} /><span>{t('destiny.preview.birthday')}</span></label><p className="fate-destiny-small">{t('destiny.preview.privacy')}</p><p className="fate-card-basis">{t('destiny.preview.basis').replace('{symbol}', card.daySymbol)}</p></> : <p>{t('destiny.preview.partner')}</p>}
          <aside className="fate-card-locked"><span aria-hidden="true">✦</span><div><strong>{t('destiny.preview.lockTitle')}</strong><p>{t('destiny.preview.lockText')}</p><span>{t('destiny.preview.formats')}</span></div></aside>
          <a href={count === 2 && !card ? '#my-report-' + kind : '#reports'} className="fate-destiny-text-link">{t(count === 2 && !card ? 'destiny.preview.addPartner' : 'destiny.preview.reports')} →</a>
        </> : <><p>{t('destiny.studio.needDetails')}</p><a href="#birth-details" className="fate-complete-primary">{t('destiny.home.start')} →</a></>}
        <button type="button" className="fate-card-sample-instead" onClick={() => setMode('sample')}>{t('destiny.preview.trySample')} ↗</button></section> : <section aria-labelledby="destiny-share-title"><p className="fate-eyebrow">{t('destiny.share.eyebrow')}</p><h2 id="destiny-share-title">{t('destiny.share.title')}</h2><p>{t('destiny.share.text')}</p><div className="fate-card-downloads"><button type="button" data-export-format="png" disabled={sharing} onClick={() => void saveSample('png')}><span aria-hidden="true">↓</span><strong>{t('destiny.share.image')}</strong><small>PNG · 1080 × 1350</small></button><button type="button" data-export-format="mp4" disabled={sharing} onClick={() => void saveSample('mp4')}><span aria-hidden="true">▷</span><strong>{t('destiny.share.video')}</strong><small>MP4 · 6 {t('destiny.share.seconds')} · 4:5</small></button></div><p className="fate-destiny-small">{t('card.export.note')}</p><label htmlFor="destiny-share-caption">{t('destiny.share.caption')}</label><textarea id="destiny-share-caption" rows={6} readOnly value={destinyShareText()} /><div className="fate-card-share-buttons"><CopyButton label={t('destiny.share.copy')} getText={destinyShareText} /><button type="button" onClick={shareSample} disabled={sharing} aria-busy={sharing}>{t(sharing ? 'destiny.share.preparing' : 'destiny.share.native')}</button></div><p className="fate-card-share-status" role="status">{shareStatus}</p><p className="fate-destiny-small">{t('destiny.share.how')}</p><a href="#birth-details" className="fate-destiny-text-link">{t('destiny.home.start')} →</a></section>}
      </div>
    </div>
    <section className="fate-card-delivery-plan" aria-labelledby="destiny-delivery-title"><p className="fate-eyebrow">{t('destiny.delivery.eyebrow')}</p><h2 id="destiny-delivery-title">{t('destiny.delivery.title')}</h2><ol>{['choose', 'make', 'keep'].map((key, index) => <li key={key}><b>0{index + 1}</b><h3>{t(`destiny.delivery.${key}.title`)}</h3><p>{t(`destiny.delivery.${key}.text`)}</p></li>)}</ol><p className="fate-destiny-small">{t('destiny.home.availability')}</p></section>
    <details className="fate-card-symbol-note"><summary>{t('destiny.symbols.title')}</summary><p>{SYMBOL_NOTE}</p><p>{t('destiny.symbols.text')}</p></details>
  </article>
}
