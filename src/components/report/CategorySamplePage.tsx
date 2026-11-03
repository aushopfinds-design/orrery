import { useMemo, useState } from 'react'
import { calculateSaju } from '@orrery/core/saju'
import { useLocale } from '../../i18n/index.ts'
import { CATEGORY_SCENARIOS } from '../../report/category-catalog.ts'
import type { FocusCategory } from '../../report/category-catalog.ts'
import { buildCategoryReading } from '../../report/category-readings.ts'
import CategoryReadingView from './CategoryReadingView.tsx'

export function SamplePicker({ scenarioIndex, onScenarioChange, year, onYearChange, paired = false }: { scenarioIndex: number; onScenarioChange: (value: number) => void; year?: number; onYearChange?: (value: number) => void; paired?: boolean }) {
  const { t } = useLocale()
  return <section className="fate-category-picker print:hidden" aria-label={t('category.examples.label')}><div><label htmlFor="category-example">{t('category.examples.choose')}</label><select id="category-example" value={scenarioIndex} onChange={event => onScenarioChange(Number(event.target.value))}>{CATEGORY_SCENARIOS.map((item, index) => <option key={item.id} value={index}>{paired || item.id === 'unknown-hour' ? item.label : item.label.split(' · ')[0]}</option>)}</select></div>{year != null && onYearChange && <div><label htmlFor="category-year">{t('category.examples.year')}</label><select id="category-year" value={year} onChange={event => onYearChange(Number(event.target.value))}>{Array.from({ length: 11 }, (_, index) => 2026 + index).map(value => <option key={value} value={value}>{value}</option>)}</select></div>}<p>{t('category.examples.note')}</p></section>
}
export default function CategorySamplePage({ kind }: { kind: FocusCategory }) {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [year, setYear] = useState(2027)
  const scenario = CATEGORY_SCENARIOS[scenarioIndex]
  const report = useMemo(() => buildCategoryReading(kind, calculateSaju(scenario.first), { second: kind === 'compatibility' ? calculateSaju(scenario.second) : undefined, year: kind === 'year' ? year : new Date().getFullYear() }), [kind, scenario, year])
  return <CategoryReadingView report={report} controls={<SamplePicker scenarioIndex={scenarioIndex} onScenarioChange={setScenarioIndex} paired={kind === 'compatibility'} year={kind === 'year' ? year : undefined} onYearChange={kind === 'year' ? setYear : undefined} />} />
}
