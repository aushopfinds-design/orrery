import { useMemo, useState } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { calculateSaju } from '@orrery/core/saju'
import CopyButton from '../CopyButton.tsx'
import { buildEnglishReading } from '../../report/reading.ts'

interface Props {
  input: BirthInput
}

export default function ReadingView({ input }: Props) {
  const report = useMemo(() => buildEnglishReading(calculateSaju(input)), [input])
  const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  // Preview IDs are random and are not payment or fulfilment identifiers.
  // Paid orders must receive server-generated, securely stored identifiers.
  const [reportId] = useState(() => `PREVIEW-${crypto.randomUUID().slice(0, 12).toUpperCase()}`)

  return (
    <article lang="en" aria-label="Personal Saju reading" className="space-y-8 pb-8 text-[#14243a]">\n      <div className="relative overflow-hidden rounded-3xl bg-[#071b33] text-white border-2 border-[#c9a05e] px-6 py-12 sm:py-20 text-center shadow-2xl" style={{backgroundImage:"linear-gradient(180deg,rgba(4,17,33,.1),#071b33),url(/saju-moon-mountains.svg)",backgroundPosition:"center",backgroundSize:"cover"}}>\n        <div className="absolute inset-3 rounded-2xl border border-[#e8c27d]/70 pointer-events-none" />\n        <p className="relative text-xs tracking-[.3em] text-[#f0ce90]">✦ SAJU STORY ✦</p>\n        <p className="relative mt-5 text-sm tracking-widest text-[#f0ce90]">PERSONAL LIFE READING</p>\n        <h1 className="relative mt-4 font-serif text-4xl sm:text-6xl font-semibold">Your Life, Your Story</h1>\n        <p className="relative mt-4 text-sm sm:text-base text-slate-200">A personal journey through your strengths, relationships and the chapters ahead.</p>\n        <div className="relative mt-10 inline-block rounded-full border border-[#d8b37c] px-5 py-2 text-sm text-[#f0ce90]">{report.birthSummary}</div>\n      </div>
      <div className="flex justify-end print:hidden"><button type="button" onClick={() => window.print()} className="rounded-full bg-[#14243a] px-6 py-3 text-sm font-semibold text-[#f6e5c2] shadow-md">Save or Print PDF</button></div>
      <header className="rounded-2xl bg-[#fffaf2] border border-[#d7b77b] p-5 sm:p-9 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-amber-700 dark:text-amber-400 mb-2">Personal Saju Reading · English</p>
        <h2 className="text-2xl sm:text-3xl font-semibold leading-tight text-gray-900 dark:text-white">{report.headline}</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">{report.subtitle}</p>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">{report.birthSummary}</p>
        <div className="mt-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 p-4"><p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Start with your story</p><p className="mt-1 text-sm leading-6 text-stone-700 dark:text-stone-300">Explore your personality, relationships, work, money and the changing themes of your life below. You do not need to understand traditional Saju terms to enjoy this reading.</p></div>
        <details className="mt-4 rounded-xl border border-stone-200 dark:border-gray-700 p-3"><summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-300">See my traditional birth chart (optional)</summary><div className="mt-3 flex flex-wrap gap-2" aria-label="Calculated four pillars">
          {report.pillarSummary.map(item => (
            <span key={item} className="text-sm rounded-lg px-3 py-2 bg-stone-100 text-stone-800 dark:bg-gray-800 dark:text-gray-200">{item}</span>
          ))}
        </div>
        </details>
        <div className="mt-5 flex items-center justify-end flex-wrap gap-2 border-t border-stone-200 dark:border-gray-800 pt-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Your Day Master: {report.dayMaster}</span>
          <CopyButton label="Copy this report" getText={() => report.fullText} />
        </div>
      </header>

      {report.sections.map(section => (
        <section key={section.heading} className="bg-[#fffaf2] border border-[#d7b77b] rounded-2xl p-5 sm:p-9 shadow-sm">
          <p className="text-xs tracking-[.2em] text-[#a97939] mb-2">✦ SAJU STORY · PERSONAL INSIGHTS</p><h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#14243a] mb-5">{section.heading}</h3>
          <div className="space-y-3 text-[15px] leading-7 text-gray-700 dark:text-gray-300">
            {section.paragraphs.map((paragraph, index) => <div key={index} className="space-y-3">{index === 0 ? <p className="font-semibold text-[#14243a] text-lg leading-8 border-l-4 border-[#d4a45e] pl-4">{paragraph}</p> : <p>{paragraph}</p>}</div>)}
          </div>
        </section>
      ))}

      <section className="bg-white dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-xl p-5 sm:p-6">
        <p className="text-xs tracking-widest text-[#a97939] mb-2">✦ YOUR LIFE CHAPTERS</p><h3 className="font-serif text-2xl font-semibold text-[#14243a] mb-2">07 · Your Life Timeline</h3>
        <p className="text-sm leading-6 text-gray-600 dark:text-gray-400 mb-4">These are different traditional themes for each period, not fixed predictions of what will happen.</p>
        {report.periods.length ? (
          <div className="space-y-4">
            {report.periods.map(period => (
              <div key={period.period} className="border-l-2 border-amber-600 dark:border-amber-400 pl-4 py-1">
                <p className="text-xs font-semibold tracking-wide text-amber-800 dark:text-amber-300">{period.period} · {period.pillar}</p>
                <h4 className="font-semibold text-gray-900 dark:text-white my-1">{period.headline}</h4>
                <p className="text-[15px] leading-7 text-gray-700 dark:text-gray-300">{period.text}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-600 dark:text-gray-300">Ten-year cycles are not available for this birth record.</p>}
      </section>

      <section className="bg-[#fffaf2] border border-[#d7b77b] rounded-2xl p-5 sm:p-9 shadow-sm">
        <p className="text-xs tracking-[.2em] text-[#a97939] mb-2">✦ A YEAR OF REFLECTION</p>
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#14243a] mb-3">08 · Your Twelve-Month Guide</h3>
        <p className="text-sm leading-6 text-stone-600 mb-6">Twelve practical, birth-chart-inspired reflections. These are not calculated monthly fortune predictions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {report.monthly.map(month => (
            <div key={month.period} className="rounded-xl border border-[#dec99f] bg-white/70 p-4 break-inside-avoid">
              <p className="text-xs uppercase tracking-widest text-[#956f36]">{month.period}</p>
              <h4 className="font-serif text-xl font-semibold mt-2 text-[#14243a]">{month.headline}</h4>
              <p className="mt-2 text-sm leading-6 text-stone-700">{month.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border-2 border-[#cba366] bg-[#081c35] text-white p-6 sm:p-12 text-center shadow-2xl">
        <div className="absolute inset-3 border border-[#d9b67b]/70 rounded-2xl pointer-events-none" />
        <p className="relative text-xs tracking-[.3em] text-[#e8c488]">✦ SAJU STORY ✦</p>
        <h3 className="relative mt-5 font-serif text-3xl text-[#f6e5c2]">Personal Reading Preview</h3>
        <p className="relative mt-4 max-w-lg mx-auto leading-7 text-slate-200">This personalised Saju report was prepared and issued by SAJU STORY using the birth details supplied. It offers a traditional interpretation for personal reflection.</p>
        <div className="relative my-8 mx-auto w-36 h-36 rounded-full border-[6px] border-double border-[#e5b86d] bg-gradient-to-br from-[#fff1bc] via-[#b77a27] to-[#f6d88e] flex flex-col items-center justify-center text-[#41250c] shadow-[0_0_36px_rgba(235,184,95,.5)]">
          <span className="text-4xl">✦</span><span className="text-sm font-serif font-bold">SAJU STORY</span><span className="text-[10px] tracking-widest">ISSUED</span>
        </div>
        <p className="relative font-serif text-xl text-[#f6e5c2]">Preview prepared by SAJU STORY</p>
        <p className="relative mt-4 text-xs text-slate-300">Report reference: {reportId} · Issued: {issueDate}</p>
        <p className="relative mt-6 text-xs text-[#e8c488]">YOUR STORY IS STILL BEING WRITTEN</p>
      </section>
      <aside className="rounded-xl p-5 bg-stone-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200" aria-label="Reading limitations">
        <details><summary className="cursor-pointer font-semibold mb-2">How was this reading calculated? (optional)</summary>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-6">
          {report.caveats.map(note => <li key={note}>{note}</li>)}
        </ul>
        </details><p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Traditional interpretation for reflection, not a guaranteed prediction. Preview version · No payment has been taken.</p>
      </aside>
    </article>
  )
}
