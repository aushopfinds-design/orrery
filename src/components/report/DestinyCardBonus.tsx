import type { PreviewKind } from '../../report/personal-products.ts'
import { destinyCardCount } from '../../report/destiny-card.ts'
import { useLocale } from '../../i18n/index.ts'
import FateKeyMark from './FateKeyMark.tsx'

export default function DestinyCardBonus({ kind }: { kind: PreviewKind }) {
  const { t } = useLocale()
  return <section className="fate-destiny-bonus" aria-labelledby="destiny-bonus-title"><FateKeyMark /><div><p className="fate-eyebrow">{t('destiny.included.launch')}</p><h2 id="destiny-bonus-title">{t(destinyCardCount(kind) === 2 ? 'destiny.bonus.pair' : 'destiny.bonus.single')}</h2><p>{t('destiny.bonus.text')}</p><a href="#card-studio">{t('destiny.bonus.preview')} ↗</a></div><span>{t('destiny.bonus.pending')}</span></section>
}
