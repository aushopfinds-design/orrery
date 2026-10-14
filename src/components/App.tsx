import { useCallback, useRef, useState } from 'react'
import BirthForm from './BirthForm.tsx'
import ProductCatalog from './ProductCatalog.tsx'
import type { BirthFormHandle, SavedFormState } from './BirthForm.tsx'
import ProfileModal from './ProfileModal.tsx'
import CopyButton from './CopyButton.tsx'
import { useLocale } from '../i18n/index.ts'
import SajuView from './saju/SajuView.tsx'
import ZiweiView from './ziwei/ZiweiView.tsx'
import NatalView from './natal/NatalView.tsx'
import ReadingView from './report/ReadingView.tsx'
import { calculateSaju } from '@orrery/core/saju'
import { createChart } from '@orrery/core/ziwei'
import { calculateNatal } from '@orrery/core/natal'
import { sajuToText, ziweiToText, natalToText } from '../utils/text-export.ts'
import type { BirthInput } from '@orrery/core/types'

type Tab = 'saju' | 'ziwei' | 'natal' | 'reading'

export default function App() {
  const { t } = useLocale()
  const [tab, setTab] = useState<Tab>('reading')
  const [menuOpen, setMenuOpen] = useState(false)
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [externalFormState, setExternalFormState] = useState<SavedFormState | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const birthFormRef = useRef<BirthFormHandle>(null)

  function handleSubmit(input: BirthInput) {
    setBirthInput(input)
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  const getCurrentFormState = useCallback(() => {
    return birthFormRef.current?.getCurrentState() ?? null
  }, [])

  return (
    <div className="min-h-screen bg-[#061629] text-[#f7e8d0]">
      <header className="relative overflow-hidden bg-[#03111f] text-white">
        <div className="pointer-events-none absolute inset-0" style={{backgroundImage:'linear-gradient(100deg,rgba(2,12,24,.94) 12%,rgba(2,12,24,.75) 60%,rgba(7,30,50,.7)),url(/fate-key-destiny-tree.svg)',backgroundSize:'cover',backgroundPosition:'center'}} />
        <div className="pointer-events-none absolute right-[-55px] top-24 h-60 w-60 rounded-full border border-[#b78b50]/20 sm:right-[10%]" />
        <div className="pointer-events-none absolute right-2 top-32 h-40 w-40 rounded-full border border-[#b78b50]/20" />
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-6">
          <a href="#" className="flex items-center gap-2 text-[#e9c48c]" aria-label="The Fate Key home">
            <img src="/fate-key-destiny-tree.svg" alt="" className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14" />
            <span><span className="block font-serif text-[1.25rem] tracking-[.02em] sm:text-2xl">The Fate Key</span><span className="block text-[8px] tracking-[.21em] text-[#d8bb8c]">UNLOCK A BRIGHTER YOU</span></span>
          </a>
          <button type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)} className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#a7814b]/30 text-2xl text-[#edc88e]">☰</button>
          {menuOpen && <div className="absolute right-5 top-[78px] z-30 flex w-48 flex-col rounded-xl border border-[#a7814b]/50 bg-[#0b2037] p-3 shadow-2xl"><a className="p-3" href="#birth-details" onClick={() => setMenuOpen(false)}>Birth Details</a><a className="p-3" href="#discover" onClick={() => setMenuOpen(false)}>Discover</a><a className="p-3" href="#reports" onClick={() => setMenuOpen(false)}>Our Reports</a></div>}
        </nav>
        <div className="relative z-10 mx-auto flex min-h-[440px] max-w-6xl flex-col justify-center px-6 pb-8 pt-6 sm:min-h-[520px] sm:px-10">
          <p className="max-w-[230px] text-[11px] font-medium leading-5 tracking-[.26em] text-[#e7bc7e]">ANCIENT WISDOM.<br/>MODERN INSIGHT.</p>
          <h1 className="mt-5 max-w-[460px] font-serif text-[2.45rem] leading-[1.12] tracking-tight text-[#fff9ed] sm:text-6xl">Understand<br/>Yourself.<br/>Create a <span className="text-[#e9bd7f]">Brighter Tomorrow.</span></h1>
          <p className="mt-4 max-w-[370px] text-[15px] leading-7 text-slate-200">Discover your unique path with a personalized destiny report based on your birth date and time.</p>
          <a href="#birth-details" className="mt-6 flex min-h-12 w-full max-w-[380px] items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#f5d7a3] to-[#dda767] px-5 text-base font-semibold text-[#08192b] shadow-lg shadow-black/30">Get Your Personal Report <span aria-hidden="true">→</span></a>
          <div className="mt-6 grid max-w-[380px] grid-cols-3 gap-3 text-center text-[#e9bd7f]">
            <div><span className="block text-2xl">✦</span><span className="mt-2 block text-[10px] leading-4 tracking-wide">SELF<br/>DISCOVERY</span></div>
            <div><span className="block text-2xl">♡</span><span className="mt-2 block text-[10px] leading-4 tracking-wide">LOVE &<br/>RELATIONSHIPS</span></div>
            <div><span className="block text-2xl">♧</span><span className="mt-2 block text-[10px] leading-4 tracking-wide">CAREER &<br/>MONEY</span></div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section id="birth-details" className="relative z-20 mx-auto max-w-2xl scroll-mt-3 pt-12 sm:pt-16">
          <div className="mb-6 px-2 sm:mb-8">
            <h2 className="font-serif text-[2.1rem] text-[#f5e6ce] sm:text-4xl">Your Birth Details</h2>
            <p className="mt-2 max-w-sm text-[15px] leading-6 text-slate-300">Enter your information to receive your personalized destiny report.</p>
          </div>
        <BirthForm
          ref={birthFormRef}
          onSubmit={handleSubmit}
          externalState={externalFormState}
          onExternalStateConsumed={() => setExternalFormState(null)}
        />
        <div className="hidden">
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {t('app.profileManage')}
          </button>
        </div>

        </section>
        {!birthInput && <section id="discover" className="py-10 sm:py-16">
          <p className="text-center text-xs tracking-[0.2em] text-[#e9c48c] uppercase">What you'll discover</p>
          <h2 className="text-center font-serif text-3xl text-[#f7e8d0] sm:text-4xl mt-3 mb-9">A Clear Guide to Your Life</h2>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              {symbol: '✦', title: 'Your Personality', description: 'Understand your strengths, habits and hidden potential.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'},
              {symbol: '♡', title: 'Love & Relationships', description: 'Explore how you connect and communicate.', image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80'},
              {symbol: '♥', title: 'Love Compatibility', description: 'Explore the connection between two birth charts.', image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80'},
              {symbol: '$', title: 'Money & Success', description: 'Reflect on your choices and financial habits.', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=900&q=80'},
              {symbol: '◇', title: 'Career & Purpose', description: 'Find work styles and environments that may suit you.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80'},
              {symbol: '♧', title: 'Business & Entrepreneurship', description: 'Explore business decisions, partnerships and working style.', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80'},
              {symbol: '☼', title: 'Health & Wellbeing', description: 'Reflect on balance, daily routines and self-care.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80'},
              {symbol: '↗', title: 'Life Timeline', description: 'See the key phases and turning points in your life.', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80'},
              {symbol: '◷', title: 'Next 12 Months', description: 'Explore traditional themes for the year ahead.', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80'}
            ].map(({symbol,title,description,image}) => <a key={title} href="#birth-details" aria-label={`Explore ${title} — start with your birth details`} className="group relative isolate flex min-h-[330px] flex-col justify-end overflow-hidden rounded-[20px] border border-[#b28a57]/55 bg-[#0b2037] shadow-lg shadow-black/20 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f3d49d] sm:min-h-[350px]">
              <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={e => { e.currentTarget.style.display = 'none' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04172a] via-[#04172a]/75 to-[#04172a]/5" />
              <span aria-hidden="true" className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-2xl text-[#b68445] shadow-md">{symbol}</span>
              <div className="relative z-10 px-5 pb-6 pt-28">
                <h3 className="font-serif text-[1.45rem] font-semibold leading-tight text-[#f3d49d]">{title}</h3>
                <p className="mt-3 max-w-[280px] pr-5 text-sm leading-6 text-slate-100">{description}</p>
                <span aria-hidden="true" className="absolute bottom-6 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ae76] text-lg text-[#f3d49d]">›</span>
              </div>
            </a>)}
          </div>
          <div className="mt-12 rounded-2xl border border-[#967244]/60 bg-[#0b2037] p-7 sm:p-10">
            <p className="text-xs tracking-widest uppercase text-[#e9c48c]">Sample report</p>
            <h3 className="font-serif text-2xl mt-2 text-[#f7e8d0]">A Reading You Can Actually Understand</h3>
            <p className="mt-3 text-slate-200 leading-relaxed max-w-2xl">Your report explains the traditional symbols behind your chart in everyday English, then offers questions and practical ideas to help you reflect. Every reading is based on your birth details.</p>
            <p className="mt-3 text-xs text-slate-400">Inspired by traditional Korean birth-chart interpretation, not a scientific prediction of future events.</p>
          </div>
        </section>}
        <ProductCatalog />
        {birthInput && (
          <>
            {/* Show the plain-English reading first; expert calculations remain available in separate tabs. */}
            <div ref={resultsRef} className="flex items-center gap-2 border-b border-[#b58b52]/40 mt-10 mb-5 overflow-x-auto pb-2">
              <button
                className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'saju'
                    ? 'border-gray-800 text-gray-800 dark:border-gray-200 dark:text-gray-200'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setTab('saju')}
              >
                {t('app.tab.saju')}
              </button>
              <button
                className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'ziwei'
                    ? 'border-gray-800 text-gray-800 dark:border-gray-200 dark:text-gray-200'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setTab('ziwei')}
              >
                {t('app.tab.ziwei')}
              </button>
              <button
                className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'natal'
                    ? 'border-gray-800 text-gray-800 dark:border-gray-200 dark:text-gray-200'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setTab('natal')}
              >
                {t('app.tab.natal')}
              </button>
              <button
                className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === 'reading'
                    ? 'border-amber-700 text-amber-800 dark:border-amber-400 dark:text-amber-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setTab('reading')}
              >
                {t('app.tab.reading')}
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
            {tab === 'reading' && <ReadingView input={birthInput} />}
          </>
        )}


      </main>
      <footer className="text-center text-xs text-slate-300 bg-[#04101e] py-8 px-4">
        <p>FATE KEY · Traditional Saju insights for reflection, not guaranteed outcomes.</p>
        <p className="mt-2">Calculation engine attribution: <a className="underline" href="https://github.com/rath/orrery" target="_blank" rel="noopener noreferrer">Orrery open-source project</a>.</p>
      </footer>
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        getCurrentFormState={getCurrentFormState}
        onSelect={setExternalFormState}
      />
    </div>
  )
}
