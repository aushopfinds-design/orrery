import type { BirthInput } from '@orrery/core/types'
import { reportPrice } from './pricing.ts'

export type ActiveFocusCategory = 'compatibility' | 'year' | 'career' | 'love'
export type LegacyFocusCategory = 'business' | 'wellbeing'
export type FocusCategory = ActiveFocusCategory | LegacyFocusCategory
export const FOCUS_CATALOG: { kind: FocusCategory; slug: string; title: string; price: string; icon: string; description: string; scope: string }[] = [
  { kind: 'compatibility', slug: 'love-compatibility', title: 'Our Love', price: reportPrice('compatibility'), icon: 'love', description: 'Discover your relationship strengths and challenges.', scope: 'Two-person chart comparisons, communication prompts and shared routines. No match percentage, marriage prediction or verdict on a relationship.' },
  { kind: 'year', slug: 'year-ahead', title: 'My Year', price: reportPrice('year'), icon: 'timeline', description: 'Explore your year ahead, month by month.', scope: 'An annual theme, ten-year context and twelve monthly reflections. Monthly reference dates are not complete calendar-month forecasts.' },
  { kind: 'career', slug: 'career-money', title: 'My Money & Career', price: reportPrice('career'), icon: 'career', description: 'Explore your career strengths and money patterns.', scope: 'Work preferences, skill experiments, money habits, business structure and calculated life-cycle themes. No income forecast, investment advice or guaranteed job recommendation.' },
  { kind: 'love', slug: 'my-love', title: 'My Love', price: reportPrice('love'), icon: 'love', description: 'Explore your love life and future relationship patterns.', scope: 'A personal reading of relationship needs, recurring patterns and calculated timing. It does not predict a specific partner, marriage or separation.' },
]
export const LEGACY_FOCUS_CATALOG: typeof FOCUS_CATALOG = [
  { kind: 'business', slug: 'business-reading', title: 'Born to Build a Business?', price: reportPrice('business'), icon: 'money', description: 'Explore your approach to starting something, choosing an offer, sharing decisions and keeping promises to customers.', scope: 'Founder habits, offers, teamwork, capacity and a small launch experiment. No profit forecast, business valuation or legal and tax advice.' },
  { kind: 'wellbeing', slug: 'everyday-balance', title: 'The Real You: Strengths & Weaknesses', price: reportPrice('wellbeing'), icon: 'balance', description: 'Notice everyday patterns in effort, boundaries and support. Use your chart imagery to try a gentler, more workable routine.', scope: 'Daily habits and five-element imagery for reflection. No medical diagnosis, treatment, health prediction or lucky-element prescription.' },
]
export function categoryInfo(kind: FocusCategory) { return [...FOCUS_CATALOG, ...LEGACY_FOCUS_CATALOG].find(item => item.kind === kind)! }

export interface CategoryScenario { id: string; label: string; first: BirthInput; second: BirthInput }
export const CATEGORY_SCENARIOS: CategoryScenario[] = [
  { id: 'new-york-london', label: 'New York 1998 · London 2000', first: { year: 1998, month: 3, day: 25, hour: 3, minute: 0, gender: 'M', timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 }, second: { year: 2000, month: 8, day: 18, hour: 14, minute: 30, gender: 'F', timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 } },
  { id: 'seoul-sydney', label: 'Seoul 1987 · Sydney 1992', first: { year: 1987, month: 11, day: 5, hour: 9, minute: 15, gender: 'F', timezone: 'Asia/Seoul', latitude: 37.5665, longitude: 126.978 }, second: { year: 1992, month: 4, day: 12, hour: 21, minute: 40, gender: 'M', timezone: 'Australia/Sydney', latitude: -33.8688, longitude: 151.2093 } },
  { id: 'unknown-hour', label: 'New York · birth time unknown', first: { year: 1998, month: 3, day: 25, hour: 0, minute: 0, unknownTime: true, gender: 'M', timezone: 'America/New_York', latitude: 40.7128, longitude: -74.006 }, second: { year: 2000, month: 8, day: 18, hour: 14, minute: 30, gender: 'F', timezone: 'Europe/London', latitude: 51.5074, longitude: -0.1278 } },
]
