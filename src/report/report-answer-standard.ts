/**
 * Shared editorial contract for every THE FATE KEY customer answer.
 * Keep this list as the single code-level reference used by review tooling.
 * It guides review; it does not certify Saju accuracy or replace human reading.
 */
export const REPORT_ANSWER_STANDARD = {
  version: '2026-11-18.1',
  principles: [
    'Answer the exact customer question in the first sentence.',
    'Make the answer feel personal using only information supported by the supplied chart and question.',
    'Use natural, simple everyday English; explain any necessary Saju term briefly.',
    'Keep each answer focused on its own question. Reuse a chart theme only when it adds a distinct implication.',
    'If timing or a conclusion is unclear, say so plainly and offer a relevant practical next step.',
    'Describe chart-supported opportunities and pressure periods clearly and confidently, while naming the conditions that matter.',
    'Never state that a real-world event is certain. A chart signal is a possibility or theme, not a promise that an event will happen.',
    'Match the strength of each future statement to the evidence. When signals are mixed or absent, say that clearly instead of inventing a prediction.',
    'Treat timing as a period with a relevant theme, not an exact date for a guaranteed event. Do not invent probability percentages.',
    'Do not invent customer biography, unsupported timing, or guaranteed outcomes.',
    'For the collection product, connect the themes in fresh language instead of copying standalone answers.',
    'Do not change Saju calculations as part of editorial answer improvements.',
  ],
  automatedReviewPatterns: {
    genericAdvice: /(?:keep moving forward|trust the process|believe in yourself|take small steps|stay positive)/gi,
    guaranteedOutcome: /\b(?:you will definitely|you are guaranteed to|you will (?:become rich|get married|succeed|meet your soulmate)|your (?:marriage|success|wealth) is guaranteed|destined to (?:marry|succeed|become rich))\b/i,
    certainFutureEvent: /\b(?:you|your partner|your relationship|your marriage|your business|your career|your finances|your love life)\s+(?:will|are going to|is going to)\s+(?:(?:definitely|certainly|surely|inevitably)\s+)?(?:meet|marry|divorce|separate|break up|become rich|succeed|fail|prosper|lose money|gain wealth|find love|find a partner|get promoted|change jobs|leave your job|start a business|expand|close|have a child|move|recover|win|receive an inheritance)\b/i,
    backgroundOpening: /^(?:in saju|traditionally,|your chart contains|this report will|before we look at|first, let us look at)\b/i,
  },
  reviewChecklist: [
    'Does the opening sentence directly answer this question?',
    'Does the answer connect to this person, rather than only give general advice?',
    'Is the English easy to understand on a first read?',
    'Does each repeated theme add a distinct point?',
    'Are chart-backed opportunities stated clearly without promising real-world events?',
    'Does each timing statement describe a relevant period rather than an exact guaranteed event date?',
    'Are uncertainty and practical next steps handled clearly?',
  ],
} as const

