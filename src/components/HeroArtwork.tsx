import { useEffect, useId, useRef, useState } from 'react'
import { useLocale } from '../i18n/index.ts'

// Coordinates belong to the approved illustration, so the light follows its
// existing SVG crop on both narrow and wide screens.
const SPARKLES = [
  { x: 1093, y: 438, size: 30, duration: 3.2, delay: -.8 },
  { x: 1093, y: 278, size: 14, duration: 3.8, delay: -1.9 },
  { x: 1093, y: 349, size: 10, duration: 3.1, delay: -.2 },
  { x: 1039, y: 438, size: 9, duration: 3.4, delay: -1.7 },
  { x: 1149, y: 438, size: 9, duration: 3.6, delay: -.7 },
  { x: 898, y: 126, size: 11, duration: 4.1, delay: -2.7 },
  { x: 1382, y: 556, size: 13, duration: 3.7, delay: -2.8 },
  { x: 1189, y: 568, size: 10, duration: 4.4, delay: -1.5 },
  { x: 1446, y: 327, size: 9, duration: 3.8, delay: -3.1 },
  { x: 946, y: 587, size: 10, duration: 4.7, delay: -3.2 },
] as const

const MOTES = [
  [926, 286], [1004, 204], [1216, 258], [1344, 378], [978, 458],
  [1177, 502], [1062, 592], [1278, 616], [1427, 486], [914, 663],
  [1170, 699], [1320, 696],
] as const

export default function HeroArtwork() {
  const { t } = useLocale()
  const id = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [manualMotion, setManualMotion] = useState<boolean | null>(null)
  const motionEnabled = manualMotion ?? !reducedMotion
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .05 })
    observer.observe(svg)
    const updateVisibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', updateVisibility)
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    motionPreference.addEventListener('change', updateMotionPreference)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', updateVisibility)
      motionPreference.removeEventListener('change', updateMotionPreference)
    }
  }, [])
  return <>
    <div className="fate-hero-art" aria-hidden="true">
    <svg ref={svgRef} className="fate-hero-artwork" data-motion={inView && pageVisible && motionEnabled ? 'running' : 'paused'} data-motion-enabled={motionEnabled} viewBox="825 115 780 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${id}-key-light`}><stop stopColor="#fff6cf" stopOpacity=".82" /><stop offset=".28" stopColor="#ffd374" stopOpacity=".5" /><stop offset=".68" stopColor="#ffb54d" stopOpacity=".16" /><stop offset="1" stopColor="#ffb54d" stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-starlight`}><stop stopColor="#fffef1" stopOpacity=".9" /><stop offset=".18" stopColor="#ffe7a6" stopOpacity=".7" /><stop offset=".48" stopColor="#ffc75d" stopOpacity=".2" /><stop offset="1" stopColor="#ffc75d" stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-mist-light`}><stop stopColor="#cfbb91" stopOpacity=".35" /><stop offset="1" stopColor="#cfbb91" stopOpacity="0" /></radialGradient>
    </defs>
    <image href="/images/fate-key-approved-hero.webp" width="1606" height="979" />
    <g className="fate-art-effects">
      <ellipse className="fate-art-key-light fate-art-animated" cx="1093" cy="470" rx="145" ry="190" fill={`url(#${id}-key-light)`} />
      <circle className="fate-art-key-core fate-art-animated" cx="1093" cy="438" r="58" fill={`url(#${id}-starlight)`} />
      <circle className="fate-art-key-ring fate-art-animated" cx="1093" cy="438" r="50" fill="none" stroke="#fff0bd" strokeWidth="2.8" />
      <g transform="translate(1093 438)">
        <circle className="fate-art-aura fate-art-animated" r="57" fill="none" stroke="#ffe4a1" strokeWidth="2.2" />
        <circle className="fate-art-aura fate-art-animated" r="57" fill="none" stroke="#ffe4a1" strokeWidth="2.2" style={{ animationDelay: '-1.75s' }} />
        <g className="fate-art-orbit fate-art-animated"><circle cx="73" r="14" fill={`url(#${id}-starlight)`} /><circle cx="73" r="3.6" fill="#fff7d5" /></g>
      </g>
      <path className="fate-art-shaft fate-art-animated" d="M1093 351V652" fill="none" stroke="#fff4cf" strokeWidth="4" strokeDasharray="32 280" />
      <ellipse className="fate-art-moon-light fate-art-animated" cx="1275" cy="254" rx="102" ry="145" fill={`url(#${id}-key-light)`} />
      {SPARKLES.map(star => <g key={`${star.x}-${star.y}`} transform={`translate(${star.x} ${star.y})`}>
        <g className="fate-art-sparkle fate-art-animated" style={{ animationDuration: `${star.duration}s`, animationDelay: `${star.delay}s` }}>
          <circle r={star.size * 3} fill={`url(#${id}-starlight)`} />
          <path d={`M0 ${-star.size} L${star.size * .2} ${-star.size * .2} L${star.size} 0 L${star.size * .2} ${star.size * .2} L0 ${star.size} L${-star.size * .2} ${star.size * .2} L${-star.size} 0 L${-star.size * .2} ${-star.size * .2} Z`} fill="#fff5cd" />
          <circle r="1.3" fill="#fffef5" />
        </g>
      </g>)}
      {MOTES.map(([x, y], index) => <circle key={`${x}-${y}`} className="fate-art-mote fate-art-animated" cx={x} cy={y} r={index % 3 === 0 ? 4 : 2.5} fill="#ffe9ba" style={{ animationDelay: `${-index * 1.3}s`, animationDuration: `${6 + index % 4}s` }} />)}
      <ellipse className="fate-art-mist fate-art-animated" cx="1130" cy="734" rx="330" ry="48" fill={`url(#${id}-mist-light)`} />
    </g>
    </svg>
    </div>
    <button type="button" className="fate-hero-motion-button" aria-label={t(motionEnabled ? 'home.hero.motion.pause' : 'home.hero.motion.play')} title={t(motionEnabled ? 'home.hero.motion.pause' : 'home.hero.motion.play')} onClick={() => setManualMotion(!motionEnabled)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{motionEnabled ? <path d="M7 5h4v14H7z M14 5h4v14h-4z" /> : <path d="m8 4 13 8-13 8z" />}</svg>
    </button>
  </>
}
