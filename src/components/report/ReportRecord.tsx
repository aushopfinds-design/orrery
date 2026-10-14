import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'
import { REPORT_EDITION } from '../../report/complete-reading.ts'
import FateKeyMark from './FateKeyMark.tsx'

interface Props { input: BirthInput; birthSummary: string; referenceYear: number; preparedOn: string; secondaryInput?: BirthInput; secondaryBirthSummary?: string; series?: string }

export function PublisherSignature({ preparedOn }: { preparedOn: string }) {
  const { t } = useLocale()
  return <div className="fate-report-signature">
    <div className="fate-report-publisher-mark" aria-hidden="true"><span>THE FATE KEY</span><FateKeyMark /><small>{t('reading.record.publisherMark')}</small></div>
    <div><p className="fate-eyebrow">{t('reading.record.publishedBy')}</p><h3>The Fate Key</h3><p>{t('reading.record.signature')}</p><span>{t('reading.record.edition')} {REPORT_EDITION} · {preparedOn} (UTC)</span></div>
  </div>
}

export default function ReportRecord({ input, birthSummary, referenceYear, preparedOn, secondaryInput, secondaryBirthSummary, series }: Props) {
  const { t } = useLocale()
  const time = input.unknownTime ? t('reading.record.unknown') : `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`
  const longitude = input.longitude == null ? t('reading.record.notSupplied') : `${Math.abs(input.longitude).toFixed(4)}° ${input.longitude < 0 ? 'W' : 'E'}`
  const fields = [
    [t('reading.record.edition'), REPORT_EDITION],
    [t('reading.record.preparedOn'), preparedOn],
    [t('reading.record.referenceYear'), String(referenceYear)],
    [t('reading.record.calendar'), t('reading.record.gregorian')],
    [t('reading.record.timezone'), input.timezone ?? 'Asia/Seoul (default)'],
    [t('reading.record.birthTime'), time],
    [t('reading.record.longitude'), longitude],
    [t('reading.record.pillars'), t('reading.record.pillarCount').replace('{n}', input.unknownTime ? '3' : '4')],
  ]
  return <section className="fate-reading-chapter fate-report-record" aria-label={t('reading.record.title')}>
    <header><FateKeyMark /><div><p className="fate-eyebrow">THE FATE KEY · {series ?? t('reading.record.series')}</p><h2>{t('reading.record.title')}</h2><p>{t('reading.record.intro')}</p></div></header>
    <p className="fate-report-record-birth"><strong>{secondaryInput ? t('category.person.a') : t('reading.design.preparedFor')}</strong><span>{birthSummary}</span></p>
    <dl className="fate-report-record-fields">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    {secondaryInput && <section className="fate-report-secondary"><p className="fate-report-record-birth"><strong>{t('category.person.b')}</strong><span>{secondaryBirthSummary}</span></p><dl className="fate-report-record-fields"><div><dt>{t('reading.record.timezone')}</dt><dd>{secondaryInput.timezone ?? 'Asia/Seoul (default)'}</dd></div><div><dt>{t('reading.record.birthTime')}</dt><dd>{secondaryInput.unknownTime ? t('reading.record.unknown') : `${String(secondaryInput.hour).padStart(2, '0')}:${String(secondaryInput.minute).padStart(2, '0')}`}</dd></div><div><dt>{t('reading.record.longitude')}</dt><dd>{secondaryInput.longitude == null ? t('reading.record.notSupplied') : `${Math.abs(secondaryInput.longitude).toFixed(4)}° ${secondaryInput.longitude < 0 ? 'W' : 'E'}`}</dd></div><div><dt>{t('reading.record.pillars')}</dt><dd>{t('reading.record.pillarCount').replace('{n}', secondaryInput.unknownTime ? '3' : '4')}</dd></div></dl></section>}
    <p className="fate-report-record-basis">{t('reading.record.basis')}</p>
    <PublisherSignature preparedOn={preparedOn} />
  </section>
}
