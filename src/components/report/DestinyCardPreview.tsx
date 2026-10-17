import { useId } from 'react'
import { useLocale } from '../../i18n/index.ts'
import { cardTextLines, DESTINY_SAMPLE_POSTER } from '../../report/destiny-card.ts'
import type { DestinyCardData } from '../../report/destiny-card.ts'

/** Always watermarked. Purchaser exports need a verified order integration. */
export default function DestinyCardPreview({ card }: { card: DestinyCardData }) {
  const { t } = useLocale()
  const id = useId().replace(/:/g, '')
  const lines = cardTextLines(card.sentence)
  return <svg className="fate-destiny-personal-card" viewBox="0 0 1080 1350" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>{`${card.displayName} · ${card.title}`}</title>
    <desc id={`${id}-desc`}>{[card.daySymbol, card.numbers.join(' / '), card.colors.map(color => color.name).join(' / '), card.sentence, card.birthDate, t('destiny.preview.watermark')].filter(Boolean).join('. ')}</desc>
    <defs><linearGradient id={`${id}-bg`} x2="1" y2="1"><stop stopColor="#102c3c" /><stop offset=".45" stopColor="#020d19" /><stop offset="1" stopColor="#092131" /></linearGradient><linearGradient id={`${id}-gold`}><stop stopColor="#b8843b" /><stop offset=".45" stopColor="#ffe5a1" /><stop offset="1" stopColor="#b8843b" /></linearGradient><linearGradient id={`${id}-fade`} x2="0" y2="1"><stop stopColor="#04121d" /><stop offset=".15" stopColor="#04121d" stopOpacity="0" /><stop offset=".8" stopColor="#04121d" stopOpacity="0" /><stop offset="1" stopColor="#04121d" /></linearGradient><clipPath id={`${id}-art`}><rect x="28" y="290" width="1024" height="530" rx="12" /></clipPath></defs>
    <rect width="1080" height="1350" rx="40" fill={`url(#${id}-bg)`} />
    <rect x="20" y="20" width="1040" height="1310" rx="35" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="3" /><rect x="30" y="30" width="1020" height="1290" rx="29" fill="none" stroke="#c99f58" strokeOpacity=".35" />
    <g textAnchor="middle" fill="#f7e9c7"><text x="540" y="78" fontSize="22" letterSpacing="11">THE FATE KEY</text><text x="540" y="129" fontSize="18" letterSpacing="8">{t('destiny.card.personal')}</text><text x="540" y="203" fontFamily="Georgia, serif" fontSize={Array.from(card.displayName).length > 16 ? 49 : 65} textLength={Array.from(card.displayName).length > 16 ? 850 : undefined} lengthAdjust="spacingAndGlyphs">{card.displayName}</text><text x="540" y="252" fontFamily="Georgia, serif" fontSize="32" fill="#e8c37c">{card.title}</text>{card.birthDate && <text x="540" y="285" fontSize="19" letterSpacing="4">{card.birthDate}</text>}</g>
    <image href={DESTINY_SAMPLE_POSTER} x="26" y="16" width="1028" height="1285" clipPath={`url(#${id}-art)`} /><rect x="28" y="290" width="1024" height="530" fill={`url(#${id}-fade)`} />
    <g fill="#e7bf72" textAnchor="middle"><text x="540" y="862" fontSize="25" letterSpacing="3">{card.stem} · {card.daySymbol.toUpperCase()}</text><path d="M100 891H980 M365 917V1025 M715 917V1025" stroke="#a67c3a" strokeOpacity=".7" /><text x="205" y="947" fontSize="17" letterSpacing="4">{t('destiny.card.element')}</text><text x="540" y="947" fontSize="17" letterSpacing="4">{t('destiny.card.numbers')}</text><text x="875" y="947" fontSize="17" letterSpacing="4">{t('destiny.card.color')}</text><text x="205" y="1007" fontSize="40" fontFamily="Georgia, serif" fill="#fff4db">{card.element.toUpperCase()}</text><text x="540" y="1011" fontSize="66" fontFamily="Georgia, serif">{card.numbers.join(' · ')}</text><circle cx="875" cy="988" r="24" fill={card.colors[0].hex} stroke="#efd194" strokeWidth="3" /><text x="875" y="1054" fontSize="21" fill="#fff4db">{card.colors[0].name}</text></g>
    <g textAnchor="middle" fill="#fff0cd" fontFamily="Georgia, serif" fontSize="37">{lines.map((line, index) => <text key={index} x="540" y={1127 + index * 45}>{line}</text>)}</g>
    <text x="540" y="1260" textAnchor="middle" fill="#e7bf72" fontSize="26" letterSpacing="5">thefatekey.com</text><text x="540" y="1300" textAnchor="middle" fill="#d1c4a6" fontSize="15" letterSpacing="3">{t('destiny.preview.watermark')}</text>
    <g transform="rotate(-25 540 590)" textAnchor="middle"><rect x="125" y="551" width="830" height="75" rx="10" fill="#03111e" fillOpacity=".74" /><text x="540" y="601" fill="#fff0cc" fontSize="35" letterSpacing="7">{t('destiny.preview.watermark')}</text></g>
  </svg>
}
