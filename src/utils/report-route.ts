import { useSyncExternalStore } from 'react'
import { FOCUS_CATALOG } from '../report/category-catalog.ts'
import type { FocusCategory } from '../report/category-catalog.ts'
import { resolvePreviewKind } from '../report/personal-products.ts'

export type ReportRoute = 'home' | 'free' | 'product' | 'sample' | 'category-product' | 'category-sample' | 'bundle-product' | 'bundle-sample' | 'personal-preview' | 'card-studio' | 'help' | 'guide' | 'privacy'

export function resolveFocusCategory(hash: string): FocusCategory | undefined {
  return FOCUS_CATALOG.find(item => hash === `#${item.slug}` || hash === `#${item.slug}-sample` || hash.startsWith(`#${item.slug}-sample-`))?.kind
}

export function resolveReportRoute(hash: string): ReportRoute {
  if (hash === '#card-studio') return 'card-studio'
  if (hash === '#help' || hash.startsWith('#help-')) return 'help'
  if (hash === '#reading-guide' || hash.startsWith('#reading-guide-')) return 'guide'
  if (hash === '#your-data') return 'privacy'
  if (resolvePreviewKind(hash)) return 'personal-preview'
  if (hash === '#complete-life-reading') return 'product'
  if (hash === '#free-reading') return 'free'
  if (hash === '#sample-report' || hash.startsWith('#sample-report-')) return 'sample'
  if (hash === '#complete-bundle') return 'bundle-product'
  if (hash === '#complete-bundle-sample' || hash.startsWith('#complete-bundle-sample-')) return 'bundle-sample'
  const category = resolveFocusCategory(hash)
  if (category) return hash === `#${FOCUS_CATALOG.find(item => item.kind === category)!.slug}` ? 'category-product' : 'category-sample'
  return 'home'
}

export function navigationTarget(hash: string): string {
  const route = resolveReportRoute(hash)
  if (route === 'card-studio' || hash === '#destiny-card') return '#home'
  if (route === 'help' || route === 'guide' || route === 'privacy' || hash === '#faq') return '#help'
  if (route === 'personal-preview') return '#my-report'
  if (route === 'free' || hash === '#birth-details') return '#birth-details'
  if (route !== 'home' || hash === '#reports' || hash === '#focused-reports' || hash === '#discover') return '#reports'
  if (hash === '#about') return '#about'
  return '#home'
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}
const snapshot = () => resolveReportRoute(window.location.hash)
export function useReportRoute(): ReportRoute {
  return useSyncExternalStore(subscribe, snapshot, () => 'home')
}
export function useReportHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash, () => '#home')
}
