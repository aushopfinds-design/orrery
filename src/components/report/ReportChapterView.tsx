import type { ReactNode } from 'react'
import type { ReportChapter } from '../../report/complete-reading.ts'
import { useLocale } from '../../i18n/index.ts'
import ReadingText from './ReadingText.tsx'
import ReadingGuidance from './ReadingGuidance.tsx'
import ChapterHeading from './ChapterHeading.tsx'
import FateKeyMark from './FateKeyMark.tsx'
import EverydayExampleView from './EverydayExampleView.tsx'
import { BackToChapters } from './ReportBriefView.tsx'

export function ChartEvidence({ facts }: { facts: string[] }) {
  const { t } = useLocale()
  return <><details className="fate-reading-evidence"><summary><span>{t('reading.chartSource')}</span><small>{t('reading.record.sourceCount').replace('{n}', String(facts.length))}</small></summary><ul>{facts.map(fact => <li key={fact}>{fact}</li>)}</ul></details><p className="hidden print:block fate-reading-print-evidence"><strong>{t('reading.chartSource')}</strong> {facts.join(' ')}</p></>
}
export default function ReportChapterView({ chapter, prefix = 'sample-report', children }: { chapter: ReportChapter; prefix?: string; children?: ReactNode }) {
  const { t } = useLocale()
  return <section id={`${prefix}-${chapter.id}`} className="fate-reading-chapter">
    <ChapterHeading title={chapter.title} kind={chapter.icon ?? chapter.id} />
    <p className="fate-reading-lead"><ReadingText text={chapter.lead} /></p>
    <div className="fate-report-chapter-layout"><div className="fate-report-prose">{chapter.example && <EverydayExampleView example={chapter.example} />}{chapter.paragraphs.map(paragraph => <p key={paragraph}><ReadingText text={paragraph} /></p>)}{children}</div><ReadingGuidance guidance={chapter.guidance} /></div>
    <div className="fate-reading-practice"><FateKeyMark /><div><strong>{t('reading.tryThis')}</strong><p>{chapter.tryThis}</p></div></div><ChartEvidence facts={chapter.evidence} />
    <BackToChapters prefix={prefix} />
  </section>
}
