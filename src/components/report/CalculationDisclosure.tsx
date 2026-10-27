import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'
import { CHART_GLOSSARY, chartGlossaryFor, explainCalculation } from '../../report/calculation-notes.ts'

export function CalculationNotice({ input, label }: { input: BirthInput; label?: string }) {
  const basis = explainCalculation(input)
  if (input.unknownTime) {
    const caveat = basis.notes.find(note => note.startsWith('The displayed day pillar'))
    return caveat ? <p role="status" className="fate-reading-time-note">{label && <strong>{label}: </strong>}{caveat}</p> : null
  }
  if (!basis.nearBoundary) return null
  return <p role="status" className="fate-reading-time-note">{label && <strong>{label}: </strong>}{basis.boundaryNote}</p>
}

export function ChartGlossary({ expanded = false, evidence }: { expanded?: boolean; evidence?: string[] }) {
  const { t } = useLocale()
  const entries = <dl className="fate-chart-glossary">{(evidence ? chartGlossaryFor(evidence) : CHART_GLOSSARY).map(item => <div key={item.term}><dt><strong>{item.term}</strong></dt><dd>{item.meaning}</dd></div>)}</dl>
  return expanded ? <section className="fate-reading-chapter fate-report-glossary"><h3>{t('reading.glossary.title')}</h3>{entries}</section> : <section className="fate-reading-chapter fate-report-glossary"><details><summary>{t('reading.glossary.title')}</summary>{entries}</details></section>
}
