import { useLocale } from '../../i18n/index.ts'
import type { ReadingBrief } from '../../report/reading-brief.ts'
import ReadingText from './ReadingText.tsx'
import ReportIcon from './ReportIcon.tsx'
import FateKeyMark from './FateKeyMark.tsx'

export default function ReportBriefView({ brief, href, onRead }: { brief: ReadingBrief; href?: string; onRead?: () => void }) {
  const { t } = useLocale()
  return <section className="fate-reading-brief" aria-label={t('reading.brief.title')}>
    <header><FateKeyMark /><div>{brief.scope && <p className="fate-eyebrow">{brief.scope}</p>}<h3>{t('reading.brief.title')}</h3><p>{t('reading.brief.intro')}</p></div></header>
    <div className="fate-brief-pair">{[
      { key: 'support', icon: 'support', items: brief.support },
      { key: 'watch', icon: 'caution', items: brief.watchFor },
    ].map(group => <section className={`fate-brief-${group.key}`} key={group.key}>
      <h4><ReportIcon kind={group.icon} />{t(`reading.brief.${group.key}`)}</h4>
      <ul>{group.items.map(item => <li key={item}><ReadingText text={item} /></li>)}</ul>
    </section>)}</div>
    <div className="fate-brief-action"><h4>{t('reading.brief.action')}</h4><p><ReadingText text={brief.action} /></p></div>
    <div className="fate-brief-source"><p>{t('reading.brief.from')} <strong>{brief.chapterTitle}</strong></p>{onRead ? <button type="button" onClick={onRead} className="print:hidden">{t('reading.brief.read')} →</button> : href ? <a href={href} className="print:hidden">{t('reading.brief.read')} →</a> : null}</div>
  </section>
}

export function BackToChapters({ prefix }: { prefix: string }) {
  const { t } = useLocale()
  return <a className="fate-chapter-return print:hidden" href={`#${prefix}-contents`}>↑ {t('reading.brief.back')}</a>
}
