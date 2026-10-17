import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import BirthForm from './BirthForm.tsx'
import ProductCatalog from './ProductCatalog.tsx'
import HomeOverview, { FateEmblem, HomeBenefits, HomeFAQ } from './HomeOverview.tsx'
import LanguageMenu from './LanguageMenu.tsx'
import HeroArtwork from './HeroArtwork.tsx'
import HeroDestinyCard from './HeroDestinyCard.tsx'
import type { BirthFormHandle, SavedFormState } from './BirthForm.tsx'
import ProfileModal from './ProfileModal.tsx'
import CopyButton from './CopyButton.tsx'
import { useLocale } from '../i18n/index.ts'
import { useReportHash, resolveReportRoute, resolveFocusCategory, navigationTarget } from '../utils/report-route.ts'
import type { BirthInput } from '@orrery/core/types'
import BuyerJourney from './BuyerJourney.tsx'
import { previewHash, resolvePreviewKind } from '../report/personal-products.ts'
import { readPreviewDraft, updatePreviewDraft } from '../utils/preview-draft.ts'
import { formStateFromBirth, matchesBirth, normalizeBirthFormState, readBirthFormState } from '../utils/birth-form-state.ts'
import { previewProduct } from '../report/personal-products.ts'
import ReportBoundary from './report/ReportBoundary.tsx'

type Tab = 'saju' | 'ziwei' | 'natal' | 'reading'
const SajuView = lazy(() => import('./saju/SajuView.tsx'))
const ZiweiView = lazy(() => import('./ziwei/ZiweiView.tsx'))
const NatalView = lazy(() => import('./natal/NatalView.tsx'))
const SiteInfoPage = lazy(() => import('./SiteInfoPage.tsx'))
const ReadingView = lazy(() => import('./report/ReadingView.tsx'))
const FreeReadingView = lazy(() => import('./report/FreeReadingView.tsx'))
const CompleteReportPage = lazy(() => import('./CompleteReportPage.tsx'))
const CategoryReportPage = lazy(() => import('./CategoryReportPage.tsx'))
const CategorySamplePage = lazy(() => import('./report/CategorySamplePage.tsx'))
const BundleSamplePage = lazy(() => import('./report/BundleSamplePage.tsx'))
const PersonalPreviewPage = lazy(() => import('./report/PersonalPreviewPage.tsx'))
const HomeReportPreview = lazy(() => import('./HomeReportPreview.tsx'))
const DestinyCardStudio = lazy(() => import('./DestinyCardStudio.tsx'))
const SAMPLE_BIRTH: BirthInput = {
  year: 1998, month: 3, day: 25, hour: 3, minute: 0,
  gender: 'M', timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006,
}

export default function App() {
  const { t } = useLocale()
  const hash = useReportHash()
  const route = resolveReportRoute(hash)
  const focusCategory = resolveFocusCategory(hash)
  const previewKind = resolvePreviewKind(hash)
  const [tab, setTab] = useState<Tab>('reading')
  const [menuOpen, setMenuOpen] = useState(false)
  const [birthInput, setBirthInput] = useState<BirthInput | null>(() => readPreviewDraft().first ?? null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [externalFormState, setExternalFormState] = useState<SavedFormState | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const birthFormRef = useRef<BirthFormHandle>(null)
  const lastFormStateRef = useRef<SavedFormState | null>(null)
  function scrollToReading() {
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  function handleSubmit(input: BirthInput) {
    lastFormStateRef.current = birthFormRef.current?.getCurrentState() ?? lastFormStateRef.current
    updatePreviewDraft({ first: input })
    setBirthInput(input)
    setTab('reading')
    window.location.hash = 'free-reading'
    scrollToReading()
  }
  function handlePersonalBirth(input: BirthInput) {
    updatePreviewDraft({ first: input })
    setBirthInput(input)
    setTab('reading')
    const stored = readBirthFormState()
    lastFormStateRef.current = stored && matchesBirth(stored, input) ? stored : formStateFromBirth(input)
  }
  function viewSample() {
    window.location.hash = 'sample-report'
    scrollToReading()
  }
  function startFree() {
    window.location.hash = 'birth-details'
    requestAnimationFrame(() => document.getElementById('birth-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const getCurrentFormState = useCallback(() => {
    const active = birthFormRef.current?.getCurrentState()
    if (active) return normalizeBirthFormState(active)
    if (!birthInput) return null
    const stored = readBirthFormState()
    if (stored && matchesBirth(stored, birthInput)) return stored
    const last = lastFormStateRef.current
    return last && matchesBirth(last, birthInput) ? last : formStateFromBirth(birthInput)
  }, [birthInput])
  function handleDataCleared() {
    setBirthInput(null); lastFormStateRef.current = null; setExternalFormState(null); setTab('reading'); setProfileModalOpen(false)
  }
  const currentNav = navigationTarget(hash)
  const links = [
    ['#home', 'home.nav.home'], ['#birth-details', 'home.nav.free'],
    ['#reports', 'home.nav.reports'],
    ...(birthInput || route === 'personal-preview' ? [[previewHash(previewKind ?? readPreviewDraft().kind), 'site.nav.my']] : []),
    ['#about', 'home.nav.about'], ['#help', 'site.help.nav'],
  ]
  function navigateHomeSection() {
    setMenuOpen(false)
  }
  const showingFree = route === 'free' && birthInput != null
  const showingSample = route === 'sample'
  const showingReport = showingSample || route === 'category-sample' || route === 'bundle-sample'
  const showingHome = route === 'home' || (route === 'free' && !birthInput)
  useEffect(() => {
    if (!showingHome) return
    const section = hash.slice(1)
    if (['home', 'birth-details', 'report-preview', 'reports', 'about', 'faq', 'discover', 'focused-reports', 'destiny-card'].includes(section)) {
      document.getElementById(section)?.scrollIntoView({ block: 'start' })
    }
  }, [hash, showingHome])
  useEffect(() => {
    if (route === 'personal-preview') return
    const title = route === 'card-studio' ? t('destiny.studio.title') : route === 'help' ? t('site.help.title') : route === 'guide' ? t('site.guide.title') : route === 'privacy' ? t('site.privacy.title') : route === 'free' ? t('reading.free.title') : route === 'bundle-product' || route === 'bundle-sample' ? t('category.bundle.title') : focusCategory ? previewProduct(focusCategory).title : route === 'sample' || route === 'product' ? t('complete.title') : t('home.hero.title')
    document.title = title + (route.includes('sample') ? ' — ' + t('site.title.sample') : '') + ' | The Fate Key'
  }, [route, focusCategory, t])
  return (
    <div className="fate-site" id="home">
      <a className="fate-skip-link" href="#main-content" onClick={event => { event.preventDefault(); const main = document.getElementById('main-content'); main?.focus(); main?.scrollIntoView({ block: 'start' }) }}>{t('site.skip')}</a>
      <header className="fate-hero">
        <nav className="fate-nav" aria-label={t('home.nav.label')}>
          <a href="#home" className="fate-brand" aria-label="The Fate Key" onClick={navigateHomeSection}>
            <FateEmblem className="fate-brand-emblem" />
            <span><strong>The Fate Key</strong><small>UNLOCK A BRIGHTER YOU</small></span>
          </a>
          <div className="fate-desktop-links">{links.map(([href, key]) => <a key={href} href={href} aria-current={currentNav === (href.startsWith('#my-report') ? '#my-report' : href) ? 'page' : undefined} onClick={navigateHomeSection}>{t(key)}</a>)}</div>
          <div className="fate-nav-actions">
            <LanguageMenu inline />
            <button type="button" className="fate-saved-button" onClick={() => setProfileModalOpen(true)}>{t('home.nav.saved')}</button>
            <button type="button" className="fate-menu-button" aria-label={t('home.nav.menu')} aria-expanded={menuOpen} aria-controls="fate-mobile-menu" onClick={() => setMenuOpen(open => !open)}><span aria-hidden="true">{menuOpen ? '×' : '☰'}</span></button>
          </div>
          {menuOpen && <div className="fate-mobile-menu" id="fate-mobile-menu">{links.map(([href, key]) => <a key={href} href={href} aria-current={currentNav === (href.startsWith('#my-report') ? '#my-report' : href) ? 'page' : undefined} onClick={navigateHomeSection}>{t(key)}</a>)}<button type="button" onClick={() => { setMenuOpen(false); setProfileModalOpen(true) }}>{t('home.nav.saved')}</button></div>}
        </nav>
        {showingHome && <HeroArtwork />}
        <div className="fate-hero-layout" hidden={!showingHome}>
          <div className="fate-hero-intro">
            <p className="fate-eyebrow">{t('home.hero.eyebrow')}</p>
            <h1>{t('home.hero.title')}<br /><em>{t('home.hero.highlight')}</em></h1>
            <p className="fate-hero-description">{t('home.hero.text')}</p>
            <div className="fate-hero-reading-actions">
              <a href="#birth-details" className="fate-complete-primary">{t('preview.home.start')} <span aria-hidden="true">→</span></a>
              <a href="#report-preview" className="fate-hero-example-link">{t('preview.home.look')} <span aria-hidden="true">↗</span></a>
            </div>
            <div className="fate-hero-promises">{['free', 'card'].map(key => <span key={key}>{t(`buyer.hero.${key}`)}</span>)}</div>
          </div>
          <section id="birth-details" className="fate-birth-panel" aria-labelledby="birth-heading">
            <div className="fate-birth-heading"><span aria-hidden="true">✦</span><h2 id="birth-heading">{t('home.form.title')}</h2></div>
            <p className="fate-birth-description">{t('home.form.text')}</p>
            {showingHome && <BirthForm compact ref={birthFormRef} onSubmit={handleSubmit} externalState={externalFormState} onExternalStateConsumed={() => setExternalFormState(null)} />}
          </section>
          {showingHome && <HeroDestinyCard />}
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className={showingFree || showingReport ? 'fate-main fate-main-reading' : 'fate-main'}>
        <ReportBoundary key={route}><Suspense fallback={<p role="status" className="fate-reading-loading">{t('reading.loading')}</p>}>
        {showingHome && <>
          <ProductCatalog />
          <HomeBenefits />
          <Suspense fallback={<section id="report-preview" className="fate-section"><p role="status">{t('reading.loading')}</p></section>}>
            <HomeReportPreview input={SAMPLE_BIRTH} />
          </Suspense>
          <BuyerJourney />
          <HomeOverview onViewSample={viewSample} />
          <HomeFAQ />
        </>}
        {route === 'product' && <CompleteReportPage onStartFree={startFree} onViewSample={viewSample} />}
        {showingSample && <div ref={resultsRef}><ReadingView input={SAMPLE_BIRTH} /></div>}
        {route === 'category-product' && focusCategory && <CategoryReportPage key={focusCategory} kind={focusCategory} />}
        {route === 'bundle-product' && <CategoryReportPage kind="bundle" />}
        {route === 'category-sample' && focusCategory && <CategorySamplePage key={focusCategory} kind={focusCategory} />}
        {route === 'bundle-sample' && <BundleSamplePage />}
        {route === 'card-studio' && <DestinyCardStudio input={birthInput} />}
        {(route === 'help' || route === 'guide' || route === 'privacy') && <SiteInfoPage key={route} page={route} hash={hash} onDataCleared={handleDataCleared} onOpenSaved={() => setProfileModalOpen(true)} />}
        {route === 'personal-preview' && previewKind && <PersonalPreviewPage key={previewKind} kind={previewKind} input={birthInput} onFirstBirth={handlePersonalBirth} />}
        {showingFree && birthInput && (
          <div ref={resultsRef}>
            <FreeReadingView input={birthInput} />
            {/* Show the plain-English reading first; expert calculations remain available in separate tabs. */}
            <details className="fate-chart-options print:hidden" onToggle={event => { if (!event.currentTarget.open) setTab('reading') }}><summary>{t('buyer.expert.optional')}</summary><div className="flex items-center gap-2 border-b border-[#b58b52]/40 mt-5 mb-5 overflow-x-auto pb-2">
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
                    const [{ calculateSaju }, { createChart }, { calculateNatal }, { sajuToText, ziweiToText, natalToText }] = await Promise.all([import('@orrery/core/saju'), import('@orrery/core/ziwei'), import('@orrery/core/natal'), import('../utils/text-export.ts')])
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
            </details>
          </div>
        )}
        </Suspense></ReportBoundary>
      </main>
      <footer className="fate-footer">
        <div className="fate-footer-inner">
          <a href="#home" className="fate-brand" aria-label="The Fate Key" onClick={navigateHomeSection}><FateEmblem className="fate-brand-emblem" /><span><strong>The Fate Key</strong><small>UNLOCK A BRIGHTER YOU</small></span></a>
          <div className="fate-footer-links">{links.slice(1).map(([href,key]) => <a key={href} href={href} aria-current={currentNav === (href.startsWith('#my-report') ? '#my-report' : href) ? 'page' : undefined} onClick={navigateHomeSection}>{t(key)}</a>)}</div>
          <div className="fate-footer-service-links"><a href="#destiny-card">{t('destiny.nav')}</a><a href="#reading-guide">{t('site.guide.title')}</a><a href="#your-data">{t('site.privacy.title')}</a><a href="#help-faq">{t('home.nav.faq')}</a></div>
          <div className="fate-footer-service-links"><a href="/samples/">{t('site.public.samples')}</a><a href="/about/">{t('site.public.about')}</a><a href="/privacy/">{t('site.public.privacy')}</a><a href="/use-and-limitations/">{t('site.public.limitations')}</a></div>
          <p>{t('home.footer.note')}</p>
          <p className="fate-footer-credit">© {new Date().getFullYear()} The Fate Key · {t('home.footer.engine')} <a href="https://github.com/rath/orrery" target="_blank" rel="noopener noreferrer">Orrery</a></p>
        </div>
      </footer>
      {profileModalOpen && <ProfileModal open={true} onClose={() => setProfileModalOpen(false)} getCurrentFormState={getCurrentFormState} onSelect={data => { setExternalFormState(data); startFree() }} />}
    </div>
  )
}
