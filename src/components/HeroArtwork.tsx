import { useEffect, useId, useRef, useState } from 'react'

// Coordinates belong to the approved illustration, so the light follows its
// existing SVG crop on both narrow and wide screens.
const SPARKLES = [
  { x: 1093, y: 438, size: 12, duration: 4.8, delay: -1.2 },
  { x: 1093, y: 278, size: 8, duration: 5.5, delay: -3.4 },
  { x: 1093, y: 349, size: 5, duration: 4.3, delay: -2.1 },
  { x: 1039, y: 438, size: 5, duration: 5.2, delay: -4.2 },
  { x: 1149, y: 438, size: 5, duration: 4.6, delay: -.7 },
  { x: 898, y: 126, size: 6, duration: 6.1, delay: -2.7 },
  { x: 1382, y: 556, size: 7, duration: 5.7, delay: -4.8 },
  { x: 1189, y: 568, size: 5, duration: 6.4, delay: -1.5 },
  { x: 1446, y: 327, size: 4, duration: 5.8, delay: -3.1 },
  { x: 946, y: 587, size: 5, duration: 6.7, delay: -5.2 },
] as const

const MOTES = [
  [926, 286], [1004, 204], [1216, 258], [1344, 378], [978, 458],
  [1177, 502], [1062, 592], [1278, 616], [1427, 486], [914, 663],
  [1170, 699], [1320, 696],
] as const

export default function HeroArtwork() {
  const id = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .05 })
    observer.observe(svg)
    const updateVisibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])
  return <svg ref={svgRef} className="fate-hero-artwork" data-motion={inView && pageVisible ? 'running' : 'paused'} viewBox="825 115 780 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${id}-key-light`}><stop stopColor="#fff6cf" stopOpacity=".82" /><stop offset=".28" stopColor="#ffd374" stopOpacity=".5" /><stop offset=".68" stopColor="#ffb54d" stopOpacity=".16" /><stop offset="1" stopColor="#ffb54d" stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-starlight`}><stop stopColor="#fffef1" stopOpacity=".9" /><stop offset=".18" stopColor="#ffe7a6" stopOpacity=".7" /><stop offset=".48" stopColor="#ffc75d" stopOpacity=".2" /><stop offset="1" stopColor="#ffc75d" stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-mist-light`}><stop stopColor="#cfbb91" stopOpacity=".35" /><stop offset="1" stopColor="#cfbb91" stopOpacity="0" /></radialGradient>
    </defs>
    <image href="/images/fate-key-approved-hero.webp" width="1606" height="979" />
    <g className="fate-art-effects">
      <ellipse className="fate-art-key-light fate-art-animated" cx="1093" cy="470" rx="110" ry="170" fill={`url(#${id}-key-light)`} />
      <circle className="fate-art-key-core fate-art-animated" cx="1093" cy="438" r="43" fill={`url(#${id}-starlight)`} />
      <circle className="fate-art-key-ring fate-art-animated" cx="1093" cy="438" r="50" fill="none" stroke="#ffe4a1" strokeWidth="1.5" />
      <path className="fate-art-shaft fate-art-animated" d="M1093 526V650" fill="none" stroke="#fff0bd" strokeWidth="2.2" strokeDasharray="18 128" />
      <ellipse className="fate-art-moon-light fate-art-animated" cx="1275" cy="254" rx="102" ry="145" fill={`url(#${id}-key-light)`} />
      {SPARKLES.map(star => <g key={`${star.x}-${star.y}`} transform={`translate(${star.x} ${star.y})`}>
        <g className="fate-art-sparkle fate-art-animated" style={{ animationDuration: `${star.duration}s`, animationDelay: `${star.delay}s` }}>
          <circle r={star.size * 3} fill={`url(#${id}-starlight)`} />
          <path d={`M0 ${-star.size} L${star.size * .2} ${-star.size * .2} L${star.size} 0 L${star.size * .2} ${star.size * .2} L0 ${star.size} L${-star.size * .2} ${star.size * .2} L${-star.size} 0 L${-star.size * .2} ${-star.size * .2} Z`} fill="#fff5cd" />
          <circle r="1.3" fill="#fffef5" />
        </g>
      </g>)}
      {MOTES.map(([x, y], index) => <circle key={`${x}-${y}`} className="fate-art-mote fate-art-animated" cx={x} cy={y} r={index % 3 === 0 ? 1.9 : 1.2} fill="#ffe1a2" style={{ animationDelay: `${-index * 1.3}s`, animationDuration: `${8 + index % 4}s` }} />)}
      <ellipse className="fate-art-mist fate-art-animated" cx="1130" cy="734" rx="330" ry="48" fill={`url(#${id}-mist-light)`} />
    </g>
  </svg>
}
