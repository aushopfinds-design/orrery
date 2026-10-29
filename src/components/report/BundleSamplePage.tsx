import { useEffect, useMemo, useState } from 'react'
import { calculateSaju } from '@orrery/core/saju'
import { useLocale } from '../../i18n/index.ts'
import { CATEGORY_SCENARIOS } from '../../report/category-catalog.ts'
import { buildBundleReading } from '../../report/category-readings.ts'
import { useReportHash } from '../../utils/report-route.ts'
import CopyButton from '../CopyButton.tsx'
import FateKeyMark from './FateKeyMark.tsx'
import { SamplePicker } from './CategorySamplePage.tsx'
import ReadingView from './ReadingView.tsx'
import CategoryReadingView from './CategoryReadingView.tsx'
import ReadingText from './ReadingText.tsx'

type BundleTab = 'life' | 'year' | 'compatibility' | 'career' | 'love'
const tabs: BundleTab[] = ['life', 'year', 'compatibility', 'career', 'love']

export default function BundleSamplePage() {
  const { t } = useLocale()
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [year, setYear] = useState(2027)
  const hash = useReportHash()
  const tab: BundleTab = hash.includes('-compatibility') ? 'compatibility' : hash.includes('-year') ? 'year' : hash.includes('-career') ? 'career' : hash.includes('-love') ? 'love' : 'life'
  const [showPrintHelp, setShowPrintHelp] = useState(false)
  const scenario = CATEGORY_SCENARIOS[scenarioIndex]
  const bundle = useMemo(() => buildBundleReading(calculateSaju(scenario.first), calculateSaju(scenario.second), year), [scenario, year])
  useEffect(() => { document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }) }, [hash])
  function selectTab(value: BundleTab) {
    window.location.assign(`#complete-bundle-sample-${value}`)
  }
  return <article id="complete-bundle-sample" className="fate-complete-reading fate-bundle-reading printable-reading" lang="en" aria-label={t('category.bundle.sampleTitle')}>
    <div className="fate-sample-toolbar print:hidden"><a href="#complete-bundle">← {t('category.bundle.title')}</a><span>{t('reading.complete.sampleBadge')}</span></div>
    <header className="fate-bundle-intro"><FateKeyMark /><div><p className="fate-eyebrow">{t('category.series')}</p><h1>{t('category.bundle.title')}</h1><p>{t('category.bundle.description')}</p><p>{t('category.bundle.people')}</p><p className="fate-reading-small-note">{t('reading.complete.sampleNote')}</p></div></header>
    <SamplePicker scenarioIndex={scenarioIndex} onScenarioChange={setScenarioIndex} paired year={year} onYearChange={setYear} />
    <section className="fate-report-chapter"><h2>{bundle.overview.title}</h2><div className="fate-report-prose">{bundle.overview.paragraphs.map(text => <p key={text}><ReadingText text={text} /></p>)}</div></section>
    <div className="fate-reading-controls print:hidden"><CopyButton label={t('category.bundle.copy')} getText={() => `${t('reading.complete.sampleNote')}\n\n${bundle.fullText}`} /><button type="button" className="fate-complete-primary" onClick={() => { setShowPrintHelp(true); window.print() }}>{t('category.bundle.print')}</button>{showPrintHelp && <p role="status">{t('reading.printHelp')}</p>}</div>
    <div className="fate-bundle-tabs print:hidden" role="tablist" aria-label={t('category.bundle.tabs')}>{tabs.map(value => <button key={value} id={`bundle-tab-${value}`} type="button" role="tab" aria-selected={tab === value} aria-controls={`complete-bundle-sample-${value}`} onClick={() => selectTab(value)} onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const index = tabs.indexOf(value)
      const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[tabs.length - 1] : tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]
      selectTab(next)
      document.getElementById(`bundle-tab-${next}`)?.focus()
    }} tabIndex={tab === value ? 0 : -1}>{t(`category.bundle.tab.${value}`)}</button>)}</div>
    <p className="fate-reading-small-note fate-bundle-print-note print:hidden">{t('category.bundle.printNote')}</p>
    {tabs.map(value => <section key={value} id={`complete-bundle-sample-${value}`} role="tabpanel" aria-labelledby={`bundle-tab-${value}`} tabIndex={0} className="fate-bundle-pane" data-active={value === tab}>
      {value === 'life' ? <ReadingView input={scenario.first} embedded prefix="complete-bundle-sample-life-report" /> : <CategoryReadingView report={value === 'compatibility' ? bundle.compatibility : value === 'year' ? bundle.annual : value === 'career' ? bundle.career : bundle.love} embedded prefix={`complete-bundle-sample-${value}-report`} />}
    </section>)}
  </article>
}
