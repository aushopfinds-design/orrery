import type { PreviewKind } from '../../report/personal-products.ts'

interface ReportArtworkProps {
  kind: PreviewKind
  title: string
  motionEnabled: boolean
}

// Match the cover artwork used by the paid PDF, with the selected product title.
export default function ReportArtwork({ kind, title }: ReportArtworkProps) {
  return <div className={`fate-report-artwork fate-report-artwork-${kind}`} aria-hidden="true">
    <div className="fate-report-cover-page">
      <img src="/images/reports/fate-letter-envelope-cover.jpg" alt="" loading="lazy" decoding="async" />
      <span>THE FATE KEY</span>
      <strong>{title}</strong>
      <small>A PERSONAL SAJU READING</small>
    </div>
  </div>
}
