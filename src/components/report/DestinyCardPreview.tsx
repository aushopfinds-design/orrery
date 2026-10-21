import { useId } from 'react'
import { useLocale } from '../../i18n/index.ts'
import type { DestinyCardData } from '../../report/destiny-card.ts'
import DestinyCardArtwork from './DestinyCardArtwork.tsx'

/** Public previews remain watermarked; purchased rendering is server-only. */
export default function DestinyCardPreview({ card }: { card: DestinyCardData }) {
  const { t } = useLocale()
  const id = useId().replace(/:/g, '')
  return <DestinyCardArtwork card={card} id={id} labels={{ personal: t('destiny.card.personal'), element: t('destiny.card.element'), numbers: t('destiny.card.numbers'), colour: t('destiny.card.color'), watermark: t('destiny.preview.watermark') }} />
}
