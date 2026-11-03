/** Public editorial pages. These never contain a visitor's saved birth details. */
export const LEARNING_GUIDES = [
  { slug: 'what-is-saju', title: 'What Is Saju? A Simple Guide to the Four Pillars', shortTitle: 'Start with the Four Pillars', description: 'Understand the chart, the Day Master and the difference between a calculated symbol and a personal interpretation.', category: 'Start here', minutes: 5 },
  { slug: 'five-elements', title: 'The Five Elements in Saju: How to Read the Numbers', shortTitle: 'Make sense of the Five Elements', description: 'Wood, Fire, Earth, Metal and Water in everyday language, with a worked example and a guide to what the counts leave out.', category: 'Understand your chart', minutes: 5 },
  { slug: 'unknown-birth-time', title: 'Can You Read Saju Without a Birth Time?', shortTitle: 'When your birth time is unknown', description: 'What remains available, which details are left out, and how to explore a reading without inventing an hour.', category: 'Your birth details', minutes: 4 },
  { slug: 'birthplace-and-time-zones', title: 'Why Birthplace and Time Zones Can Change a Saju Chart', shortTitle: 'Check your place and clock time', description: 'A practical checklist for overseas births, daylight saving and differences between calculators.', category: 'Your birth details', minutes: 5 },
  { slug: 'compatibility-reading', title: 'How to Use a Saju Compatibility Reading Together', shortTitle: 'Turn compatibility into a conversation', description: 'Read two perspectives, understand combination and clash labels, and try a small shared agreement.', category: 'Use your reading', minutes: 5 },
] as const

export const learningPath = (slug: string) => `/learn/${slug}/`
