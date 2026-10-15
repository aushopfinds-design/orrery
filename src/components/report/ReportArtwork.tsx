import { useEffect, useRef, useState } from 'react'
import type { PreviewKind } from '../../report/personal-products.ts'
import FateKeyMark from './FateKeyMark.tsx'

const STARS = [
  { left: '71%', top: '29%', delay: '-.6s', duration: '3.4s' },
  { left: '87%', top: '48%', delay: '-2.4s', duration: '4.6s' },
  { left: '56%', top: '62%', delay: '-1.7s', duration: '3.9s' },
  { left: '44%', top: '23%', delay: '-3.1s', duration: '5.1s' },
  { left: '79%', top: '74%', delay: '-.9s', duration: '4.2s' },
] as const

interface ReportArtworkProps {
  kind: PreviewKind
  title: string
  motionEnabled: boolean
}

// The heading and description below each cover provide its accessible content.
// Keep these decorative layers out of the reading order and pause offscreen work.
export default function ReportArtwork({ kind, title, motionEnabled }: ReportArtworkProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(() => !('IntersectionObserver' in window))

  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .05 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} className={`fate-report-artwork fate-report-artwork-${kind}`} data-motion={motionEnabled && inView ? 'running' : 'paused'} aria-hidden="true">
    <img className="fate-report-artwork-image" src={`/images/reports/${kind}-v1-640.webp`} srcSet={`/images/reports/${kind}-v1-640.webp 640w, /images/reports/${kind}-v1-1200.webp 1200w`} sizes={kind === 'bundle' ? '(max-width: 850px) calc(100vw - 64px), 330px' : '(max-width: 700px) calc(100vw - 64px), (max-width: 850px) 640px, (max-width: 1200px) 33vw, 430px'} width="1200" height="800" alt="" loading="lazy" decoding="async" />
    <div className="fate-report-artwork-effects">
      <span className="fate-report-artwork-glow" />
      {STARS.map((star, index) => <span key={index} className="fate-report-artwork-star" style={{ left: star.left, top: star.top, animationDelay: star.delay, animationDuration: star.duration }} />)}
      <span className="fate-report-artwork-mote" />
      <span className="fate-report-artwork-mote fate-report-artwork-mote-second" />
    </div>
    <div className="fate-report-artwork-shade" />
    <span className="fate-report-artwork-brand">THE FATE KEY</span>
    <FateKeyMark />
    <strong className="fate-report-artwork-title">{title}</strong>
  </div>
}
