import { useSyncExternalStore } from 'react'

export type ReportRoute = 'home' | 'free' | 'product' | 'sample'

export function resolveReportRoute(hash: string): ReportRoute {
  if (hash === '#complete-life-reading') return 'product'
  if (hash === '#free-reading') return 'free'
  if (hash === '#sample-report' || hash.startsWith('#sample-report-')) return 'sample'
  return 'home'
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}
const snapshot = () => resolveReportRoute(window.location.hash)
export function useReportRoute(): ReportRoute {
  return useSyncExternalStore(subscribe, snapshot, () => 'home')
}
