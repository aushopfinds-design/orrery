import { describe, expect, it } from 'vitest'
import { BUYER_QUESTIONS } from './buyer-outline.ts'
import { DESTINY_COLLECTION_QUESTIONS, PRODUCT_QUESTIONS, assertValidProductQuestionCatalogue } from './product-questions.ts'

describe('canonical paid report questions', () => {
  it('defines seven ordered questions for products 01–06 and ten for product 07', () => {
    assertValidProductQuestionCatalogue()
    for (const kind of ['complete', 'career', 'compatibility', 'year', 'business', 'wellbeing'] as const) {
      const questions = PRODUCT_QUESTIONS[kind]
      expect(questions).toHaveLength(7)
      expect(questions.map(question => question.order)).toEqual([1, 2, 3, 4, 5, 6, 7])
      expect(questions.map(question => question.id).sort()).toEqual(BUYER_QUESTIONS[kind].map(question => question.id).sort())
      expect(questions.every(question => question.evidenceRequirement.length > 0 && question.timingRequirement.length > 0)).toBe(true)
      expect(new Set(questions.map(question => question.id)).size).toBe(7)
    }
    expect(PRODUCT_QUESTIONS.bundle.map(question => question.title)).toEqual(DESTINY_COLLECTION_QUESTIONS)
    expect(PRODUCT_QUESTIONS.bundle).toHaveLength(10)
    expect(new Set(PRODUCT_QUESTIONS.bundle.map(question => question.answerRole)).size).toBe(10)
    for (const kind of ['complete', 'career', 'compatibility', 'year', 'business', 'wellbeing'] as const) {
      expect(new Set(PRODUCT_QUESTIONS[kind].map(question => question.answerRole)).size).toBe(7)
    }
    const activeQuestions = (['complete', 'career', 'compatibility', 'year', 'business', 'wellbeing', 'bundle'] as const)
      .flatMap(kind => PRODUCT_QUESTIONS[kind])
    expect(activeQuestions).toHaveLength(52)
    expect(new Set(activeQuestions.map(question => question.productId + ':' + question.id)).size).toBe(52)
    expect(new Set(activeQuestions.map(question => question.answerRole)).size).toBe(52)
    const titles = [
      PRODUCT_QUESTIONS.complete.map(question => question.title),
      PRODUCT_QUESTIONS.career.map(question => question.title),
      PRODUCT_QUESTIONS.compatibility.map(question => question.title),
      PRODUCT_QUESTIONS.year.map(question => question.title),
      PRODUCT_QUESTIONS.business.map(question => question.title),
      PRODUCT_QUESTIONS.wellbeing.map(question => question.title),
      PRODUCT_QUESTIONS.bundle.map(question => question.title),
    ]
    expect(titles).toEqual([
      ['What kind of person am I?', 'What helps me thrive, and what can hold me back?', 'What kind of career suits me?', 'What is my natural pattern for earning money?', 'What do I need most in a close relationship?', 'What are my biggest life challenges?', 'When may my life change direction?'],
      ['Which careers suit me best?', 'Am I better suited to employment or independent work?', 'How do I naturally make money?', 'What tends to block my financial progress?', 'When might my career or money situation improve?', 'What do the next ten years suggest for my work and money?', 'What is my most important career and money insight?'],
      ['What makes us compatible?', 'Why are we attracted to each other?', 'What tends to cause friction between us?', 'How do we express love differently?', 'How do emotional closeness and everyday compatibility differ?', 'Which upcoming periods may affect our relationship themes?', 'What does this connection ask of each of us?'],
      ['What is the overall theme of my next 12 months?', 'What should I focus on most this year?', 'What does it suggest for money?', 'What does this period suggest for my career?', 'What does it suggest for love?', 'Which months have more supportive chart relationships?', 'Which months require closer attention?'],
      ['Am I naturally suited to running a business?', 'What kind of business work suits me?', 'Am I better suited to working alone or with partners?', 'What financial risks should I understand?', 'When might expansion deserve a closer look?', 'What do my upcoming cycles suggest about business activity?', 'What should I be careful about in business?'],
      ['What is my core personality?', 'Which parts of my nature stand out?', 'What tends to put me under pressure?', 'How do I tend to respond when I feel under pressure?', 'What do I need most in relationships?', 'How can my strengths become blind spots?', 'What boundary could help protect my everyday balance?'],
      [
        'What are the three most important things about my destiny?',
        'What is my greatest opportunity in life?',
        'What is my biggest challenge?',
        'How do my personality, career, money and love connect?',
        'What patterns keep repeating in my life?',
        'Which years are most important for me?',
        'What should I prioritise over the next three years?',
        'What am I not seeing about my potential?',
        'What will help me build a fulfilling life?',
        'What is the most important message from my chart?',
      ],
    ])
  })
})
