import type { ReportChapter } from './complete-reading.ts'
export const BUYER_OUTLINES = {
  complete: [['personality', "What Shapes Your Life and Destiny?"], ['social', "What Helps You Thrive — and What Holds You Back?"], ['money', "How Are You Meant to Make Money?"], ['career', "Where Could You Find Your Kind of Success?"], ['love', "What Do You Need in Love?"], ['balance', "What Helps You Feel More Balanced?"], ['patterns', "When Might Your Life Change Direction?"]],
  compatibility: [['two-styles', "How Do You Fit Together?"], ['two-directions', "Why Are You Drawn to Each Other?"], ['close-conversation', "Why Do You See Things Differently?"], ['shared-routine', "Can Your Everyday Lives Fit Together?"], ['shared-money', "Can You Agree About Money?"], ['chart-patterns', "What Brings You Closer — and What Creates Friction?"], ['support-each-other', "How Might the Years Ahead Affect Your Relationship?"], ['shared-week', "What Does This Connection Ask of You?"]],
  year: [['annual-theme', "What Is the Main Story of Your Year?"], ['annual-money', "What Could Shape Your Money This Year?"], ['annual-work', "Where Could Work Take You This Year?"], ['annual-connections', "What Could This Year Bring to Your Love Life?"], ['annual-cycle-context', "What Should You Focus on Each Month?"], ['annual-plan', "When Might You Need Extra Care?"]],
  career: [['working-style', "Where Could Your Working Strengths Take You?"], ['two-work-layers', "What Kind of Workplace Lets You Thrive?"], ['feedback-and-boundaries', "Could a Career Change Suit Your Timing?"], ['proof-of-skill', "When Might Your Work Gain More Recognition?"], ['money-commitments', "How Are You Meant to Make Money?"], ['work-chapters', "What Do Your Career and Money Cycles Reveal?"], ['career-plan', "What Could Be Holding Your Success Back?"]],
  business: [['founder-style', "Were You Born to Build a Business?"], ['offer-test', "What Does Your Chart Say About Starting Out?"], ['team-decisions', "Could a Business Partner Help or Complicate Things?"], ['delivery-capacity', "How Could Your Business Earn and Keep Money?"], ['customer-communication', "When Might Expansion Deserve a Closer Look?"], ['business-chapters', "What Do Your Ten-Year Business Cycles Reveal?"], ['business-plan', "When Should You Be More Careful in Business?"]],
  wellbeing: [['everyday-pace', "Who Are You Beneath the Surface?"], ['visible-elements', "Which Parts of Your Nature Stand Out?"], ['workload-rhythm', "What Tends to Put You Under Pressure?"], ['support-and-space', "What Do You Need From the People Around You?"], ['balance-week', "How Can Your Strengths Become Blind Spots?"]],
} as const
export type BuyerOutlineKind = keyof typeof BUYER_OUTLINES
/** Preserve chapter IDs for saved links, while making the reading order buyer-led. */
export function buyerOutline(kind: BuyerOutlineKind, chapters: ReportChapter[]) {
  const byId = new Map(chapters.map(item => [item.id, item]))
  return BUYER_OUTLINES[kind].map(([id, title]) => {
    const chapter = byId.get(id)
    if (!chapter) throw new Error(`Missing purchased topic: ${kind}/${id}`)
    return { ...chapter, title }
  })
}
