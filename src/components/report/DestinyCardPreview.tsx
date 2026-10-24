import { useId, useState } from 'react'
import { useLocale } from '../../i18n/index.ts'
import type { DestinyCardData } from '../../report/destiny-card.ts'
import DestinyCardArtwork from './DestinyCardArtwork.tsx'

/** Public previews remain watermarked; purchased rendering is server-only. */
export default function DestinyCardPreview({ card }: { card: DestinyCardData }) {
  const { t } = useLocale()
  const id = useId().replace(/:/g, '')
  const [moving, setMoving] = useState(() => typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  return <div className="fate-personal-card-motion"><DestinyCardArtwork animated={moving} card={card} id={id} labels={{ personal: t('destiny.card.personal'), element: t('destiny.card.element'), numbers: t('destiny.card.numbers'), colour: t('destiny.card.color'), watermark: t('destiny.preview.watermark') }} /><button type="button" className="fate-destiny-motion" aria-pressed={moving} onClick={() => setMoving(value => !value)}><span aria-hidden="true">{moving ? 'Ⅱ' : '▷'}</span>{t(moving ? 'destiny.motion.pause' : 'destiny.motion.play')}</button></div>
}
