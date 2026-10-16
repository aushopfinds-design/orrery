export const SITE_ORIGIN = 'https://thefatekey.com'
export const PUBLISHING_UPDATED = '2026-10-16'

/** Public identity must come from the operator, never a guessed address or ID. */
export function publishingIdentity(env: Record<string, string | undefined>) {
  const contactEmail = env.FATE_PUBLIC_CONTACT_EMAIL?.trim() || null
  const suppliedId = env.FATE_ADSENSE_PUBLISHER_ID?.trim() || null
  if (contactEmail && !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(contactEmail)) {
    throw new Error('FATE_PUBLIC_CONTACT_EMAIL must be an operator-approved email address')
  }
  if (suppliedId && !/^(?:ca-)?pub-\d{16}$/.test(suppliedId)) {
    throw new Error('FATE_ADSENSE_PUBLISHER_ID must be the actual pub- or ca-pub- ID')
  }
  const publisherId = suppliedId?.replace(/^ca-/, '') ?? null
  return { contactEmail, publisherId, accountId: publisherId ? `ca-${publisherId}` : null }
}

export const PUBLIC_SAMPLES = [
  { kind: 'year', slug: 'year-ahead', title: '2027 Year Ahead', description: 'The year ahead, twelve monthly reflections and a plan you can review.' },
  { kind: 'career', slug: 'career-money', title: 'Career & Money', description: 'Working conditions, useful skills, workload and the real cost of a commitment.' },
  { kind: 'compatibility', slug: 'love-compatibility', title: 'Love Compatibility', description: 'Two points of view, clearer conversations and shared responsibilities.' },
  { kind: 'complete', slug: 'complete-life-reading', title: 'Complete Life Reading', description: 'Personality, work, money, relationships and your broader life chapters.' },
  { kind: 'business', slug: 'business-entrepreneurship', title: 'Business & Entrepreneurship', description: 'An offer to test, customer expectations, delivery and working with others.' },
  { kind: 'wellbeing', slug: 'everyday-balance', title: 'Everyday Balance', description: 'Daily habits, boundaries, support and a routine that fits your actual day.' },
] as const

export const INFO_PATHS = ['/', '/about/', '/reading-guide/', '/privacy/', '/use-and-limitations/', '/samples/']
export function publicPaths(contactEmail: string | null) {
  return [...INFO_PATHS, ...PUBLIC_SAMPLES.map(item => `/samples/${item.slug}/`), ...(contactEmail ? ['/contact/'] : [])]
}
