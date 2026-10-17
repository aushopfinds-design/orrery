import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'
import { CHART_GLOSSARY, explainCalculation } from '../../report/calculation-notes.ts'

export function CalculationNotice({ input, label }: { input: BirthInput; label?: string }) {
  const basis = explainCalculation(input)
  if (!basis.nearBoundary) return null
  return <p role="status" className="fate-reading-time-note">{label && <strong>{label}: </strong>}{basis.boundaryNote}</p>
}

export function ChartGlossary({ expanded = false }: { expanded?: boolean }) {
  const { t } = useLocale()
  const entries = <dl className="fate-chart-glossary">{CHART_GLOSSARY.map(item => <div key={item.term}><dt><strong>{item.term}</strong></dt><dd>{item.meaning}</dd></div>)}</dl>
  return expanded ? <section className="fate-reading-chapter fate-report-glossary"><h3>{t('reading.glossary.title')}</h3>{entries}</section> : <section className="fate-reading-chapter fate-report-glossary"><details><summary>{t('reading.glossary.title')}</summary>{entries}</details></section>
}
