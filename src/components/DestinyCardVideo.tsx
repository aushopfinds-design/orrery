import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../i18n/index.ts'
import { DESTINY_SAMPLE_POSTER, DESTINY_SAMPLE_VIDEO } from '../report/destiny-card.ts'

export default function DestinyCardVideo() {
  const { t } = useLocale()
  const ref = useRef<HTMLVideoElement>(null)
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [manualMotion, setManualMotion] = useState<boolean | null>(null)
  const motion = manualMotion ?? !reduced
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = (event: MediaQueryListEvent) => { setReduced(event.matches); setManualMotion(null) }
    preference.addEventListener('change', change)
    return () => preference.removeEventListener('change', change)
  }, [])
  useEffect(() => {
    const video = ref.current
    if (!video) return
    let visible = !('IntersectionObserver' in window)
    const sync = () => {
      if (motion && visible && !document.hidden) void video.play().catch(() => { /* The poster remains available when autoplay is blocked. */ })
      else video.pause()
    }
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { threshold: .15 }) : null
    observer?.observe(video)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', sync); video.pause() }
  }, [motion])
  return <div className="fate-destiny-video">
    <video ref={ref} src={DESTINY_SAMPLE_VIDEO} poster={DESTINY_SAMPLE_POSTER} width="1080" height="1350" loop muted playsInline preload="none" aria-label={t('destiny.video.label')} />
    <button type="button" className="fate-destiny-motion" onClick={() => setManualMotion(!motion)} aria-pressed={motion}><span aria-hidden="true">{motion ? 'Ⅱ' : '▷'}</span>{t(motion ? 'destiny.motion.pause' : 'destiny.motion.play')}</button>
  </div>
}
