import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import BirthForm from './BirthForm.tsx'
import ProductCatalog from './ProductCatalog.tsx'
import HomeOverview, { FateEmblem, HomeBenefits, HomeFAQ } from './HomeOverview.tsx'
import LanguageMenu from './LanguageMenu.tsx'
import type { BirthFormHandle, SavedFormState } from './BirthForm.tsx'
import ProfileModal from './ProfileModal.tsx'
import CopyButton from './CopyButton.tsx'
import { useLocale } from '../i18n/index.ts'
import SajuView from './saju/SajuView.tsx'
import ZiweiView from './ziwei/ZiweiView.tsx'
import NatalView from './natal/NatalView.tsx'
import { useReportRoute } from '../utils/report-route.ts'
import { calculateSaju } from '@orrery/core/saju'
import { createChart } from '@orrery/core/ziwei'
import { calculateNatal } from '@orrery/core/natal'
import { sajuToText, ziweiToText, natalToText } from '../utils/text-export.ts'
import type { BirthInput } from '@orrery/core/types'

type Tab = 'saju' | 'ziwei' | 'natal' | 'reading'
const ReadingView = lazy(() => import('./report/ReadingView.tsx'))
const FreeReadingView = lazy(() => import('./report/FreeReadingView.tsx'))
const CompleteReportPage = lazy(() => import('./CompleteReportPage.tsx'))
const SAMPLE_BIRTH: BirthInput = {
  year: 1998, month: 3, day: 25, hour: 3, minute: 0,
  gender: 'M', timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006,
}

export default function App() {
  const { t } = useLocale()
  const route = useReportRoute()
  const [tab, setTab] = useState<Tab>('reading')
  const [menuOpen, setMenuOpen] = useState(false)
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [externalFormState, setExternalFormState] = useState<SavedFormState | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const birthFormRef = useRef<BirthFormHandle>(null)
  function scrollToReading() {
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  function handleSubmit(input: BirthInput) {
    setBirthInput(input)
    setTab('reading')
    window.location.hash = 'free-reading'
    scrollToReading()
  }
  function viewSample() {
    window.location.hash = 'sample-report'
    scrollToReading()
  }
  function startFree() {
    window.location.hash = 'birth-details'
    requestAnimationFrame(() => document.getElementById('birth-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const getCurrentFormState = useCallback(() => birthFormRef.current?.getCurrentState() ?? null, [])
  const links = [
    ['#home', 'home.nav.home'], ['#birth-details', 'home.nav.free'],
    ['#reports', 'home.nav.reports'], ['#about', 'home.nav.about'], ['#faq', 'home.nav.faq'],
  ]
  function navigateHomeSection() {
    setMenuOpen(false)
    setBirthInput(null)
  }
  const showingFree = route === 'free' && birthInput != null
  const showingSample = route === 'sample'
  const showingHome = route === 'home' || (route === 'free' && !birthInput)
  return (
    <div className="fate-site" id="home">
      <header className="fate-hero">
        <nav className="fate-nav" aria-label={t('home.nav.label')}>
          <a href="#home" className="fate-brand" aria-label="The Fate Key" onClick={navigateHomeSection}>
            <FateEmblem className="fate-brand-emblem" />
            <span><strong>The Fate Key</strong><small>UNLOCK A BRIGHTER YOU</small></span>
          </a>
          <div className="fate-desktop-links">{links.map(([href, key]) => <a key={href} href={href} onClick={navigateHomeSection}>{t(key)}</a>)}</div>
          <div className="fate-nav-actions">
            <LanguageMenu inline />
            <button type="button" className="fate-saved-button" onClick={() => setProfileModalOpen(true)}>{t('home.nav.saved')}</button>
            <button type="button" className="fate-menu-button" aria-label={t('home.nav.menu')} aria-expanded={menuOpen} aria-controls="fate-mobile-menu" onClick={() => setMenuOpen(open => !open)}><span aria-hidden="true">{menuOpen ? '×' : '☰'}</span></button>
          </div>
          {menuOpen && <div className="fate-mobile-menu" id="fate-mobile-menu">{links.map(([href, key]) => <a key={href} href={href} onClick={navigateHomeSection}>{t(key)}</a>)}<button type="button" onClick={() => { setMenuOpen(false); setProfileModalOpen(true) }}>{t('home.nav.saved')}</button></div>}
        </nav>
        <div className="fate-hero-art" aria-hidden="true" hidden={!showingHome && !showingFree}>
          <svg viewBox="825 115 780 700" preserveAspectRatio="xMidYMid slice"><image href="/images/fate-key-approved-hero.webp" width="1606" height="979" /></svg>
          <span className="fate-key-glow" /><span className="fate-mist" />
          {[[15,18,0],[36,35,1.2],[66,12,2.4],[91,28,.6],[84,54,3],[20,70,1.8],[67,80,2.8]].map(([x,y,delay],i) => <span key={i} className="fate-star" style={{left:`${x}%`,top:`${y}%`,animationDelay:`${delay}s`}} />)}
        </div>
        <div className="fate-hero-layout" hidden={!showingHome && !showingFree}>
          <div className="fate-hero-intro">
            <p className="fate-eyebrow">{t('home.hero.eyebrow')}</p>
            <h1>{t('home.hero.title')}<br /><em>{t('home.hero.highlight')}</em></h1>
            <p className="fate-hero-description">{t('home.hero.text')}</p>
          </div>
          <section id="birth-details" className="fate-birth-panel" aria-labelledby="birth-heading">
            <div className="fate-birth-heading"><span aria-hidden="true">✦</span><h2 id="birth-heading">{t('home.form.title')}</h2></div>
            <p className="fate-birth-description">{t('home.form.text')}</p>
            <BirthForm ref={birthFormRef} onSubmit={handleSubmit} externalState={externalFormState} onExternalStateConsumed={() => setExternalFormState(null)} />
          </section>
        </div>
      </header>
      {showingHome && <HomeBenefits />}
      <main className={showingFree || showingSample ? 'fate-main fate-main-reading' : 'fate-main'}>
        <Suspense fallback={<p role="status" className="fate-reading-loading">{t('reading.loading')}</p>}>
        {showingHome && <><HomeOverview onViewSample={viewSample} /><ProductCatalog /><HomeFAQ /></>}
        {route === 'product' && <CompleteReportPage onStartFree={startFree} onViewSample={viewSample} />}
        {showingSample && <div ref={resultsRef}><ReadingView input={SAMPLE_BIRTH} /></div>}
        {showingFree && birthInput && (
          <>
            {/* Show the plain-English reading first; expert calculations remain available in separate tabs. */}
            <div ref={resultsRef} className="flex items-center gap-2 border-b border-[#b58b52]/40 mt-10 mb-5 overflow-x-auto pb-2">
              <button
                className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'saju'
                    ? 'border-[#eac18a] text-[#f4d19b]'
                    : 'border-transparent text-slate-300 hover:text-[#f4d19b]'
                }`}
                onClick={() => setTab('saju')}
              >
                {t('app.tab.saju')}
              </button>
              <button
                className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'ziwei'
                    ? 'border-[#eac18a] text-[#f4d19b]'
                    : 'border-transparent text-slate-300 hover:text-[#f4d19b]'
                }`}
                onClick={() => setTab('ziwei')}
              >
                {t('app.tab.ziwei')}
              </button>
              <button
                className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'natal'
                    ? 'border-[#eac18a] text-[#f4d19b]'
                    : 'border-transparent text-slate-300 hover:text-[#f4d19b]'
                }`}
                onClick={() => setTab('natal')}
              >
                {t('app.tab.natal')}
              </button>
              <button
                className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'reading'
                    ? 'border-[#eac18a] text-[#f4d19b]'
                    : 'border-transparent text-slate-300 hover:text-[#f4d19b]'
                }`}
                onClick={() => setTab('reading')}
              >
                {t('reading.free.tab')}
              </button>
              <div className="ml-auto pb-1">
                <CopyButton
                  label={<>{t('app.copyAll')}<br />{t('app.copyAllSub')}</>}
                  getText={async () => {
                    const saju = calculateSaju(birthInput)
                    const parts = [sajuToText(saju)]
                    if (!birthInput.unknownTime) {
                      const chart = createChart(
                        birthInput.year, birthInput.month, birthInput.day,
                        birthInput.hour,
                        birthInput.minute,
                        birthInput.gender === 'M',
                        birthInput.timezone,
                        birthInput.longitude,
                      )
                      parts.push(ziweiToText(chart))
                    }
                    const natal = await calculateNatal(birthInput)
                    parts.push(natalToText(natal))
                    return parts.join('\n\n')
                  }}
                />
              </div>
            </div>

            {tab === 'saju' && <SajuView input={birthInput} />}
            {tab === 'ziwei' && <ZiweiView input={birthInput} />}
            {tab === 'natal' && <NatalView input={birthInput} />}
            {tab === 'reading' && <FreeReadingView input={birthInput} />}
          </>
        )}
        </Suspense>
      </main>
      <footer className="fate-footer">
        <div className="fate-footer-inner">
          <a href="#home" className="fate-brand" aria-label="The Fate Key" onClick={navigateHomeSection}><FateEmblem className="fate-brand-emblem" /><span><strong>The Fate Key</strong><small>UNLOCK A BRIGHTER YOU</small></span></a>
          <div className="fate-footer-links">{links.slice(1).map(([href,key]) => <a key={href} href={href} onClick={navigateHomeSection}>{t(key)}</a>)}</div>
          <p>{t('home.footer.note')}</p>
          <p className="fate-footer-credit">© {new Date().getFullYear()} The Fate Key · {t('home.footer.engine')} <a href="https://github.com/rath/orrery" target="_blank" rel="noopener noreferrer">Orrery</a></p>
        </div>
      </footer>
      <ProfileModal open={profileModalOpen} onClose={() => setProfileModalOpen(false)} getCurrentFormState={getCurrentFormState} onSelect={setExternalFormState} />
    </div>
  )
}
