import { useLocale } from '../../i18n/index.ts'
import ReportIcon from './ReportIcon.tsx'
import FateKeyMark from './FateKeyMark.tsx'

export default function ChapterHeading({ title, kind }: { title: string; kind: string }) {
  const { t } = useLocale()
  const [number, ...words] = title.split(' · ')
  return (
    <header className="fate-report-chapter-heading">
      <span className={`fate-report-chapter-icon fate-report-icon-${kind}`}><ReportIcon kind={kind} /></span>
      <div><p><FateKeyMark />{t('reading.design.chapter')} {number}<span className="fate-report-chapter-publisher"> · THE FATE KEY</span></p><h2>{words.join(' · ') || title}</h2></div>
      <span className="fate-report-chapter-number" aria-hidden="true">{number}</span>
    </header>
  )
}
