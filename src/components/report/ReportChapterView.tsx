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
    <div className="fate-report-chapter-layout"><div className="fate-report-prose">{chapter.paragraphs.filter(text=>chapter.showGuidance===false||text!==chapter.tryThis&&!chapter.guidance.watchFor.includes(text)).map(paragraph => <p key={paragraph}><ReadingText text={paragraph} /></p>)}{chapter.example && <EverydayExampleView example={chapter.example} showScene={chapter.lead !== chapter.example.scene} />}{children}</div>{chapter.showGuidance!==false&&<ReadingGuidance guidance={chapter.guidance} />}</div>
    {chapter.showGuidance!==false&&!chapter.guidance.keepClose.includes(chapter.tryThis)&&<div className="fate-reading-practice"><FateKeyMark /><div><strong>{t('reading.tryThis')}</strong><p>{chapter.tryThis}</p></div></div>}<ChartEvidence facts={chapter.evidence} />
    <BackToChapters prefix={prefix} />
  </section>
}
