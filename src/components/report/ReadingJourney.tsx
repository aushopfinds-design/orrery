import { useLocale } from '../../i18n/index.ts'

export default function ReadingJourney({ step }: { step: 1 | 2 | 3 }) {
  const { t } = useLocale()
  const steps = [
    { href: '#birth-details', key: 'details' },
    { href: '#free-reading', key: 'snapshot' },
    { href: '#my-report', key: 'preview' },
  ]
  return <nav className="fate-reading-journey print:hidden" aria-label={t('site.steps.label')}>
    <ol>{steps.map((item, index) => <li key={item.key} data-current={step === index + 1 ? '' : undefined}>
      {step === index + 1 ? <span aria-current="step"><b>{index + 1}</b>{t('site.steps.' + item.key)}</span>
        : <a href={item.href}><b>{index + 1}</b>{t('site.steps.' + item.key)}</a>}
    </li>)}</ol>
  </nav>
}
