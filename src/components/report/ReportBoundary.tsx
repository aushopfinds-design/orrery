import { Component } from 'react'
import type { ReactNode } from 'react'
import { useLocale } from '../../i18n/index.ts'
import FateKeyMark from './FateKeyMark.tsx'

function ReadingLoadError() {
  const { t } = useLocale()
  return <section className="fate-load-error" role="alert"><FateKeyMark /><h1>{t('site.error.title')}</h1><p>{t('site.error.text')}</p>
    <div><button type="button" className="fate-complete-primary" onClick={() => window.location.reload()}>{t('site.error.reload')}</button><a href="#help" className="fate-outline-button">{t('site.help.cta')}</a></div>
  </section>
}
class ReadingBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <ReadingLoadError /> : this.props.children }
}
export default function ReportBoundary({ children }: { children: ReactNode }) {
  return <ReadingBoundary>{children}</ReadingBoundary>
}
