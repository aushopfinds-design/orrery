import { useCallback, useRef, useState } from 'react'
import BirthForm from './BirthForm.tsx'
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
    <div className="min-h-screen bg-[#f8f7f5] text-[#10223b]">
      <header className="relative overflow-hidden bg-[#071b33] text-white">
        <div className="absolute inset-0 opacity-70" style={{background:'radial-gradient(circle at 76% 42%, #d2a15d 0%, #6e6b77 13%, #16324c 33%, #071b33 70%)'}} />
        <div className="absolute inset-0 bg-cover bg-[position:70%_center] sm:bg-center opacity-65" style={{backgroundImage:"url(/saju-moon-mountains.svg)"}} />\n        <div className="absolute inset-0 bg-gradient-to-r from-[#071b33]/95 via-[#071b33]/65 to-[#071b33]/10" />\n        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(#fff 1px, transparent 1px)',backgroundSize:'44px 44px'}} />
        <nav className="relative z-10 max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 text-[#f2d19c]" aria-label="Destiny Code home"><img src="/destiny-code-emblem.svg" alt="" className="h-12 w-12 sm:h-14 sm:w-14" /><span className="font-serif text-lg sm:text-2xl tracking-[.08em]">DESTINY CODE</span></a>
          <a href="#birth-details" className="rounded-full bg-[#e6bc7c] px-5 py-2 text-sm font-semibold text-[#10223b]">Get My Reading →</a>
        </nav>
        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-12 pb-28 sm:pt-20 sm:pb-32">
          <p className="text-xs sm:text-sm tracking-[0.22em] uppercase text-[#e9c48c]">YOUR LIFE. DECODED.</p>
          <h1 className="font-serif text-4xl sm:text-6xl leading-tight mt-5 max-w-2xl">Discover What Your Birth Date <span className="text-[#e9c48c]">Reveals About You</span></h1>
          <p className="mt-5 max-w-xl text-lg text-slate-200 leading-relaxed">A personalised birth-chart reading to explore your personality, love, career, money and the chapters ahead.</p>
          <p className="mt-7 text-sm text-[#e9c48c]">Personal insights · Clear explanations · Practical guidance</p>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <section id="birth-details" className="relative -mt-12 z-20 max-w-4xl mx-auto">
          <div className="text-center mb-5">
            <h2 className="font-serif text-3xl text-[#10223b]">Enter Your Birth Details</h2>
            <p className="mt-2 text-sm text-slate-600">Start your personal reading. Birth time and location help make it more specific.</p>
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
        {!birthInput && <section className="py-16">
          <p className="text-center text-xs tracking-[0.2em] text-[#ad7a38] uppercase">What you'll discover</p>
          <h2 className="text-center font-serif text-3xl sm:text-4xl mt-3 mb-9">A Clear Guide to Your Life</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ['✦','Your Personality','Understand your strengths, habits and hidden potential.'],
              ['♡','Love & Relationships','Explore how you connect and communicate.'],
              ['$','Money & Success','Reflect on your choices and financial habits.'],
              ['◇','Career & Purpose','Find work styles and environments that may suit you.'],
              ['↗','Life Timeline','Explore the themes of different life chapters.'],
              ['◷','Next 12 Months','Discover traditional themes for the year ahead.'],
            ].map(([symbol,title,description])=><div key={title} className="rounded-2xl border border-[#e8e3dc] bg-white overflow-hidden shadow-sm">
              <div className="h-24 sm:h-32 relative overflow-hidden bg-[#0b2741]" style={{backgroundImage:"linear-gradient(125deg, rgba(7,27,51,.3), rgba(211,161,95,.1)), url(/saju-moon-mountains.svg)",backgroundSize:"cover",backgroundPosition: title === "Love & Relationships" ? "75% 30%" : title === "Life Timeline" ? "35% 60%" : "center"}}><div className="absolute bottom-2 left-3 rounded-full bg-white/90 px-3 py-1 text-xl text-[#ad7a38]">{symbol}</div></div><div className="p-4 sm:p-6">
              <h3 className="font-serif text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p></div>
            </div>)}
          </div>
          <div className="mt-12 rounded-2xl bg-[#f0ebe4] p-7 sm:p-10">
            <p className="text-xs tracking-widest uppercase text-[#ad7a38]">Sample report</p>
            <h3 className="font-serif text-2xl mt-2">A Reading You Can Actually Understand</h3>
            <p className="mt-3 text-slate-600 leading-relaxed max-w-2xl">Your report explains the traditional symbols behind your chart in everyday English, then offers questions and practical ideas to help you reflect. Every reading is based on your birth details.</p>
            <p className="mt-3 text-xs text-slate-500">Inspired by traditional Korean birth-chart interpretation, not a scientific prediction of future events.</p>
          </div>
        </section>}
        {birthInput && (
          <>
            {/* Show the plain-English reading first; expert calculations remain available in separate tabs. */}
            <div ref={resultsRef} className="flex items-center border-b border-gray-200 dark:border-gray-700 mt-10 mb-4 overflow-x-auto">
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
      <footer className="text-center text-xs text-slate-500 bg-[#eeeae4] py-8 px-4">
        <p>DESTINY CODE · Traditional Saju insights for reflection, not guaranteed outcomes.</p>
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
