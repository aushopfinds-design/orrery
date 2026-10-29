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
  { kind: 'complete', slug: 'complete-life-reading', title: 'My Life', description: 'Discover your personality, strengths, and life path.' },
  { kind: 'year', slug: 'year-ahead', title: 'My Year', description: 'Explore your year ahead, month by month.' },
  { kind: 'compatibility', slug: 'love-compatibility', title: 'Our Love', description: 'Discover your relationship strengths and challenges.' },
  { kind: 'career', slug: 'career-money', title: 'My Money & Career', description: 'Explore your career strengths and money patterns.' },
  { kind: 'love', slug: 'my-love', title: 'My Love', description: 'Explore your love life and future relationship patterns.' },
] as const

export const INFO_PATHS = ['/', '/about/', '/reading-guide/', '/privacy/', '/use-and-limitations/', '/purchases/', '/samples/', '/learn/', '/editorial-policy/', '/help/']
export function publicPaths(contactEmail: string | null) {
  return [...INFO_PATHS, ...LEARNING_GUIDES.map(item => learningPath(item.slug)), ...PUBLIC_SAMPLES.map(item => `/samples/${item.slug}/`), ...(contactEmail ? ['/contact/'] : [])]
}
