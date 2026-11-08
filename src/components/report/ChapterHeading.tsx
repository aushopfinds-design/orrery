import { useLocale } from '../../i18n/index.ts'
import ReportIcon from './ReportIcon.tsx'
import FateKeyMark from './FateKeyMark.tsx'

export default function ChapterHeading({ title, kind }: { title: string; kind: string }) {
  const { t } = useLocale()
  const numbered = title.match(/^(\d+) · (.+)$/)
  const number = numbered?.[1]
  const heading = numbered?.[2] ?? title
  return (
    <header className="fate-report-chapter-heading">
      <span className={`fate-report-chapter-icon fate-report-icon-${kind}`}><ReportIcon kind={kind} /></span>
      <div><p><FateKeyMark />{number ? `${t('reading.design.chapter')} ${number}` : t('reading.design.guide')}<span className="fate-report-chapter-publisher"> · THE FATE KEY</span></p><h2>{heading}</h2></div>
      {number && <span className="fate-report-chapter-number" aria-hidden="true">{number}</span>}
    </header>
  )
}
