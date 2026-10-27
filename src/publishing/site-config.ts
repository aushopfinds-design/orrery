import { LEARNING_GUIDES, learningPath } from './guide-catalog.ts'

export const SITE_ORIGIN = 'https://thefatekey.com'
export const PUBLISHING_UPDATED = '2026-10-19'

/** Default contact approved by the operator on 2026-10-19; publisher ID must be supplied. */
export function publishingIdentity(env: Record<string, string | undefined>) {
  const contactEmail = env.FATE_PUBLIC_CONTACT_EMAIL?.trim() || 'thefatekey@gmail.com'
  const suppliedId = env.FATE_ADSENSE_PUBLISHER_ID?.trim() || null
  if (contactEmail && !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(contactEmail)) {
    throw new Error('FATE_PUBLIC_CONTACT_EMAIL must be an operator-approved email address')
  }
  if (suppliedId && !/^(?:ca-)?pub-\d{16}$/.test(suppliedId)) {
    throw new Error('FATE_ADSENSE_PUBLISHER_ID must be the actual pub- or ca-pub- ID')
  }
  const publisherId = suppliedId?.replace(/^ca-/, '') ?? null
  return { operatorName: env.FATE_PUBLIC_OPERATOR_NAME?.trim() || null, liveSales: env.FATE_PAYMENTS_MODE === 'live' && env.FATE_CHECKOUT_OPEN === 'true' && env.FATE_SALES_POLICIES_READY === 'true', contactEmail, publisherId, accountId: publisherId ? `ca-${publisherId}` : null }
}

export const PUBLIC_SAMPLES = [
  { kind: 'year', slug: 'year-ahead', title: 'What Awaits You This Year?', description: 'The year ahead, twelve monthly reflections and a plan you can review.' },
  { kind: 'career', slug: 'career-money', title: 'Success, Money & Your Future', description: 'Working conditions, useful skills, workload and the real cost of a commitment.' },
  { kind: 'compatibility', slug: 'love-compatibility', title: 'Are We Meant to Be?', description: 'Two points of view, clearer conversations and shared responsibilities.' },
  { kind: 'complete', slug: 'complete-life-reading', title: 'Your Life, Your Destiny', description: 'Personality, work, money, relationships and your broader life chapters.' },
  { kind: 'business', slug: 'business-entrepreneurship', title: 'Born to Build a Business?', description: 'An offer to test, customer expectations, delivery and working with others.' },
  { kind: 'wellbeing', slug: 'everyday-balance', title: 'The Real You: Strengths & Weaknesses', description: 'Daily habits, boundaries, support and a routine that fits your actual day.' },
] as const

export const INFO_PATHS = ['/', '/about/', '/reading-guide/', '/privacy/', '/use-and-limitations/', '/purchases/', '/samples/', '/learn/', '/editorial-policy/', '/help/']
export function publicPaths(contactEmail: string | null) {
  return [...INFO_PATHS, ...LEARNING_GUIDES.map(item => learningPath(item.slug)), ...PUBLIC_SAMPLES.map(item => `/samples/${item.slug}/`), ...(contactEmail ? ['/contact/'] : [])]
}
