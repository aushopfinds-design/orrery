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
  const [showPrintHelp, setShowPrintHelp] = useState(false)

  return (
    <article lang="en" aria-label="Personal Saju reading" className="printable-reading space-y-6 pb-8 text-[#f5e6ce]">
      <div className="relative overflow-hidden rounded-3xl bg-[#071b33] text-white border-2 border-[#c9a05e] px-6 py-12 sm:py-20 text-center shadow-2xl" style={{backgroundImage:"linear-gradient(180deg,rgba(4,17,33,.1),#071b33),url(/saju-moon-mountains.svg)",backgroundPosition:"center",backgroundSize:"cover"}}>
        <div className="absolute inset-3 rounded-2xl border border-[#e8c27d]/70 pointer-events-none" />
        <img src="/destiny-code-emblem.svg" alt="FATE KEY gold tree and crescent emblem" className="relative mx-auto h-28 w-28 sm:h-36 sm:w-36" /><p className="relative mt-3 text-xs tracking-[.3em] text-[#f0ce90]">FATE KEY</p>
        <p className="relative mt-5 text-sm tracking-widest text-[#f0ce90]">PERSONAL LIFE READING</p>
        <h1 className="relative mt-4 font-serif text-4xl sm:text-6xl font-semibold">YOUR LIFE. DECODED.</h1>
        <p className="relative mt-4 text-sm sm:text-base text-slate-200">A personal journey through your strengths, relationships and the chapters ahead.</p>
        <div className="relative mt-10 inline-block rounded-full border border-[#d8b37c] px-5 py-2 text-sm text-[#f0ce90]">{report.birthSummary}</div>
      </div>
      {!input.unknownTime && input.timezone && input.timezone !== 'Asia/Seoul' && input.longitude == null && (
        <div role="alert" className="rounded-xl border-2 border-amber-400 bg-amber-950/70 px-5 py-4 text-amber-100">
          <p className="font-semibold">Birthplace information needed</p>
          <p className="mt-2 text-sm leading-6">Your birthplace longitude is missing. The hour pillar may be incorrect because the calculator used a fallback longitude. Please enter your birthplace before relying on this reading or purchasing a report.</p>
        </div>
      )}
      <div className="print:hidden flex flex-col items-end gap-2">
        <button type="button" onClick={() => { setShowPrintHelp(true); window.print() }} className="rounded-full bg-[#14243a] px-6 py-3 text-sm font-semibold text-[#f6e5c2] shadow-md">Save or Print PDF</button>
        {showPrintHelp && <p role="status" className="max-w-sm text-right text-xs leading-5 text-slate-300">In the print window, select “Save as PDF” as the destination. For the best appearance, enable background graphics. This is a preview, not a paid order.</p>}
      </div>
      <div className="px-1 pt-2">
        <h2 className="font-serif text-3xl text-[#f5e6ce] sm:text-4xl">Your Destiny Report</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">A personalized guide to your life's journey and potential.</p>
        <nav aria-label="Report sections" className="mt-5 grid grid-cols-5 gap-0.5 sm:gap-1 rounded-xl bg-[#0b2037] p-2 text-center">
          {[['♙','Overview','#report-overview'],['♡','Love','#report-love'],['♧','Career','#report-career'],['◈','Money','#report-money'],['✧','Life Path','#report-timeline']].map(([symbol,label,href]) => <a key={label} href={href} className="flex min-h-16 flex-col items-center justify-center rounded-lg text-[#eac18a] hover:bg-[#e9bf81]/15 focus:bg-[#e9bf81]/20"><span className="text-xl">{symbol}</span><span className="mt-1 text-[9px] leading-tight sm:text-[10px] text-[#f5e6ce]">{label}</span></a>)}
        </nav>
      </div>
      <header id="report-overview" className="scroll-mt-5 rounded-2xl bg-[#0b2037] border border-[#a88353]/70 p-5 sm:p-9 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#f1c989] mb-2">Personal Birth-Chart Reading · English</p>
        <h2 className="text-2xl sm:text-3xl font-semibold leading-tight text-[#f5e6ce]">{report.headline}</h2>
        <p className="mt-3 text-slate-200 leading-relaxed">{report.subtitle}</p>
        <p className="mt-4 text-xs text-slate-300">{report.birthSummary}</p>
        <div className="mt-5 rounded-xl bg-[#193149] border border-[#9f8054]/60 p-4"><p className="text-sm font-semibold text-[#f4d19b]">Start with your story</p><p className="mt-1 text-sm leading-6 text-slate-200">Explore your personality, relationships, work, money and the changing themes of your life below. You do not need to understand traditional Saju terms to enjoy this reading.</p></div>
        <details className="mt-4 rounded-xl border border-[#8c765b]/70 p-3"><summary className="cursor-pointer text-sm font-medium text-slate-200">See my traditional birth chart (optional)</summary><div className="mt-3 flex flex-wrap gap-2" aria-label="Calculated four pillars">
          {report.pillarSummary.map(item => (
            <span key={item} className="text-sm rounded-lg px-3 py-2 bg-stone-100 text-stone-800 dark:bg-gray-800 dark:text-gray-200">{item}</span>
          ))}
        </div>
        </details>
        <div className="mt-5 flex items-center justify-end flex-wrap gap-2 border-t border-[#8c765b]/70 pt-4">
          <span className="text-sm font-medium text-slate-200">Your Day Master: {report.dayMaster}</span>
          <CopyButton label="Copy this report" getText={() => report.fullText} />
        </div>
      </header>

      {report.sections.map(section => (
        <section key={section.heading} id={/love|relationship/i.test(section.heading) ? "report-love" : /career|work/i.test(section.heading) ? "report-career" : /money|finance/i.test(section.heading) ? "report-money" : undefined} className="bg-[#0b2037] border border-[#a88353]/70 rounded-2xl p-5 sm:p-9 shadow-sm">
          <p className="text-xs tracking-[.2em] text-[#a97939] mb-2">✦ FATE KEY · PERSONAL INSIGHTS</p><h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#f4d19b] mb-5">{section.heading}</h3>
          <div className="space-y-3 text-[15px] leading-7 text-slate-200">
            {section.paragraphs.map((paragraph, index) => <div key={index} className="space-y-3">{index === 0 ? <p className="font-semibold text-[#f4d19b] text-lg leading-8 border-l-4 border-[#d4a45e] pl-4">{paragraph}</p> : <p>{paragraph}</p>}</div>)}
          </div>
        </section>
      ))}

      <section id="report-timeline" className="scroll-mt-5 bg-[#0b2037] border border-[#a88353]/70 rounded-xl p-5 sm:p-6">
        <p className="text-xs tracking-widest text-[#a97939] mb-2">✦ YOUR LIFE CHAPTERS</p><h3 className="font-serif text-2xl font-semibold text-[#f4d19b] mb-2">07 · Your Life Timeline</h3>
        <p className="text-sm leading-6 text-slate-300 mb-4">These are different traditional themes for each period, not fixed predictions of what will happen.</p>
        {report.periods.length ? (
          <div className="space-y-4">
            {report.periods.map(period => (
              <div key={period.period} className="relative border-l-2 border-[#e5b878] pl-6 py-4 before:absolute before:-left-[8px] before:top-6 before:h-[14px] before:w-[14px] before:rounded-full before:border-2 before:border-[#f4d19b] before:bg-[#b78649] before:shadow-[0_0_16px_#e5b878]">
                <p className="text-xs font-semibold tracking-wide text-[#eac18a]">{period.period} · {period.pillar}</p>
                <h4 className="font-semibold text-[#f5e6ce] my-1">{period.headline}</h4>
                <p className="text-[15px] leading-7 text-slate-200">{period.text}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate-200">Ten-year cycles are not available for this birth record.</p>}
      </section>

      <section className="bg-[#0b2037] border border-[#a88353]/70 rounded-2xl p-5 sm:p-9 shadow-sm">
        <p className="text-xs tracking-[.2em] text-[#a97939] mb-2">✦ A YEAR OF REFLECTION</p>
        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#f4d19b] mb-3">08 · Your Twelve-Month Guide</h3>
        <p className="text-sm leading-6 text-slate-300 mb-6">Twelve practical, birth-chart-inspired reflections. These are not calculated monthly fortune predictions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {report.monthly.map(month => (
            <div key={month.period} className="rounded-xl border border-[#dec99f] bg-[#10243b] p-4 break-inside-avoid">
              <p className="text-xs uppercase tracking-widest text-[#f4d19b]">{month.period}</p>
              <h4 className="font-serif text-xl font-semibold mt-2 text-[#f4d19b]">{month.headline}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-200">{month.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border-2 border-[#cba366] bg-[#081c35] text-white p-6 sm:p-12 text-center shadow-2xl">
        <div className="absolute inset-3 border border-[#d9b67b]/70 rounded-2xl pointer-events-none" />
        <p className="relative text-xs tracking-[.3em] text-[#e8c488]">✦ FATE KEY ✦</p>
        <h3 className="relative mt-5 font-serif text-3xl text-[#f6e5c2]">Personal Reading Preview</h3>
        <p className="relative mt-4 max-w-lg mx-auto leading-7 text-slate-200">This personalised birth-chart report was prepared and issued by FATE KEY using the birth details supplied. It offers a traditional interpretation for personal reflection.</p>
        <div className="relative my-8 mx-auto w-36 h-36 rounded-full border-[6px] border-double border-[#e5b86d] bg-gradient-to-br from-[#fff1bc] via-[#b77a27] to-[#f6d88e] flex flex-col items-center justify-center text-[#41250c] shadow-[0_0_36px_rgba(235,184,95,.5)]">
          <img src="/destiny-code-emblem.svg" alt="" className="w-28 h-28" />
        </div>
        <p className="relative font-serif text-xl text-[#f6e5c2]">Preview prepared by FATE KEY</p>
        <p className="relative mt-4 text-xs text-slate-300">Report reference: {reportId} · Issued: {issueDate}</p>
        <p className="relative mt-6 text-xs text-[#e8c488]">YOUR STORY IS STILL BEING WRITTEN</p>
      </section>
      <aside className="rounded-xl p-5 bg-[#13243b] text-[#f4e8d5] print:hidden" aria-label="Reading limitations">
        <details><summary className="cursor-pointer font-semibold mb-2">How was this reading calculated? (optional)</summary>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-6">
          {report.caveats.map(note => <li key={note}>{note}</li>)}
        </ul>
        </details><p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Traditional interpretation for reflection, not a guaranteed prediction. Preview version · No payment has been taken.</p>
      </aside>
      <section className="hidden print:block text-sm leading-6 text-slate-800" aria-label="Printed reading limitations">
        <h3 className="font-semibold">About this reading</h3>
        <p>Traditional Saju interpretation for personal reflection, not a guaranteed prediction. Preview version; no payment has been taken.</p>
        <ul className="list-disc pl-5">{report.caveats.map(note => <li key={note}>{note}</li>)}</ul>
      </section>
    </article>
  )
}
