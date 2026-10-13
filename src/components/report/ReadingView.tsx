import { useMemo } from 'react'
import type { BirthInput } from '@orrery/core/types'
import { calculateSaju } from '@orrery/core/saju'
import CopyButton from '../CopyButton.tsx'
import { buildEnglishReading } from '../../report/reading.ts'

interface Props {
  input: BirthInput
}

export default function ReadingView({ input }: Props) {
  const report = useMemo(() => buildEnglishReading(calculateSaju(input)), [input])

  return (
    <article lang="en" aria-label="Personal Saju reading" className="space-y-5 pb-8">
      <header className="rounded-2xl bg-white dark:bg-gray-900 border border-stone-200 dark:border-gray-800 p-5 sm:p-7 shadow-sm">
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
        <section key={section.heading} className="bg-white dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-xl p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{section.heading}</h3>
          <div className="space-y-3 text-[15px] leading-7 text-gray-700 dark:text-gray-300">
            {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </section>
      ))}

      <section className="bg-white dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-xl p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">07 · Your ten-year chapters</h3>
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
