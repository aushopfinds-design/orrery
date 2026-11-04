/**
 * Deterministic pre-delivery report quality gate.
 * Does not alter the Saju calculation engine, Stripe, or PDF rendering.
 * A passing score is an internal heuristic, not proof of interpretive accuracy.
 */
export type ReportQualityInput = {
  productId: string;
  questions: Array<{ question: string; answer: string; questionId?: string }>;
  expectedQuestions: string[];
  birthTimeKnown: boolean;
  usesHourPillar: boolean;
  calculationVerified: boolean;
  calculationVerification?: 'verified' | 'partial' | 'mismatch' | 'unavailable';
  pdfBytes?: number;
  provenance?: Array<{ questionId: string; ruleIds: string[]; evidence: Array<{ id: string; value: string }> }>;
};
export type QualityFinding = { code: string; message: string; blocking: boolean };
export type QualityResult = { score: number; passed: boolean; requiresHumanReview: boolean; findings: QualityFinding[] };

const NORMALIZE = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const GENERIC = /(?:keep moving forward|trust the process|believe in yourself|take small steps|stay positive)/gi;
const GUARANTEED_OUTCOME = /\b(?:you will definitely|you are guaranteed to|you will (?:become rich|get married|succeed|meet your soulmate)|your (?:marriage|success|wealth) is guaranteed|destined to (?:marry|succeed|become rich))\b/i;
const BACKGROUND_OPENING = /^(?:in saju|traditionally,|your chart contains|this report will|before we look at|first, let us look at)\b/i;
const LABEL = /^(?:your answer|answer|answer detail|what this means for you|important timing|bottom line|practical point|main caution):\s*/i;
const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
export function inspectReport(input: ReportQualityInput): QualityResult {
  const findings: QualityFinding[] = [];
  let score = 100;
  const flag = (code: string, message: string, penalty: number, blocking = false) => {
    findings.push({ code, message, blocking }); score -= penalty;
  };
  if (!input.expectedQuestions.length) flag("NO_RUBRIC", "Missing product question rubric", 40, true);
  const actual = input.questions.map(x => NORMALIZE(x.question));
  for (const q of input.expectedQuestions) {
    if (!actual.includes(NORMALIZE(q))) flag("MISSING_QUESTION", `Missing question: ${q}`, 10, true);
  }
  if (input.questions.length !== input.expectedQuestions.length)
    flag("QUESTION_COUNT", "Question count does not match the product rubric", 10, true);
  const answers = input.questions.map(x => x.answer.trim());
  const seenSentences = new Map<string, number>();
  answers.forEach((answer, i) => {
    if (!answer) flag("EMPTY_ANSWER", `Question ${i + 1} has an empty answer`, 20, true);
    const answerWords = words(answer.replace(/\*\*/g, ''));
    // 100–150 words is a guide, not a minimum. Only unusually short or long
    // answers need a human check; concise answers are never penalized by length.
    if (answerWords < 12) flag("LENGTH_REVIEW", `Answer ${i + 1} is unusually short (${answerWords} words); confirm it still answers the question`, 0);
    if (answerWords > 180) flag("LENGTH_REVIEW", `Answer ${i + 1} is unusually long (${answerWords} words); check for repetition or unnecessary advice`, 0);
    const paragraphCount = answer.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean).length;
    if (paragraphCount > 3) flag("PARAGRAPH_REVIEW", `Answer ${i + 1} has ${paragraphCount} text blocks; check whether it can be made easier to scan`, 0);
    if ((answer.match(GENERIC) || []).length > 0) flag("GENERIC_ADVICE", `Generic advice in answer ${i + 1}; human review needed`, 0);
    const firstText = answer.split(/\n\s*\n/).map(part => part.trim()).find(Boolean) ?? '';
    const lead = firstText.replace(LABEL, '').split(/[.!?](?:\s|$)/, 1)[0] ?? '';
    if (lead.length < 25 || BACKGROUND_OPENING.test(lead)) flag("ANSWER_FIRST_REVIEW", `Answer ${i + 1} may begin with background instead of a direct conclusion`, 0);
    if (GUARANTEED_OUTCOME.test(answer)) flag("GUARANTEED_OUTCOME", `Answer ${i + 1} contains wording that may promise a future result`, 20, true);
    const sentences = answer.split(/(?<=[.!?])\s+/).map(sentence => NORMALIZE(sentence.replace(LABEL, ''))).filter(sentence => words(sentence) >= 8);
    for (const sentence of sentences) {
      const prior = seenSentences.get(sentence);
      if (prior !== undefined) flag("REPEATED_SENTENCE", `Questions ${prior + 1} and ${i + 1} repeat the same full sentence; review whether it adds a distinct answer`, 0);
      else seenSentences.set(sentence, i);
    }
  });
  const seen = new Map<string, number>();
  for (const [index, answer] of answers.entries()) {
    const key = NORMALIZE(answer).split(/\s+/).filter(Boolean).slice(0, 24).join(' ');
    const prior = seen.get(key);
    if (key && prior !== undefined) flag("REPEATED_OPENING", `Answers ${prior + 1} and ${index + 1} share the same opening; human review needed`, 0);
    else if (key) seen.set(key, index);
  }
  if (!input.birthTimeKnown && input.usesHourPillar)
    flag("UNKNOWN_HOUR", "Hour pillar used with unknown birth time", 30, true);
  if (input.calculationVerification && input.calculationVerification !== 'verified') {
    const code = input.calculationVerification === 'partial' ? 'PARTIAL_CALCULATION_VERIFICATION'
      : input.calculationVerification === 'mismatch' ? 'CALCULATION_MISMATCH' : 'CALCULATION_AUDIT_UNAVAILABLE';
    flag(code, `Independent pillar check status: ${input.calculationVerification}`, 30, true);
  } else if (!input.calculationVerified) {
    flag("UNVERIFIED_CALCULATION", "Calculation verification failed or was not supplied", 30, true);
  }
  if (input.provenance) {
    const traceByQuestion = new Map(input.provenance.map(item => [NORMALIZE(item.questionId), item]));
    input.questions.forEach((question, index) => {
      const trace = traceByQuestion.get(NORMALIZE(question.questionId ?? question.question));
      if (!trace || !trace.ruleIds.length || !trace.evidence.length || trace.evidence.some(item => !item.id || !item.value))
        flag("MISSING_ANSWER_PROVENANCE", `Question ${index + 1} has no complete chart-rule trace`, 20, true);
    });
  }
  if (input.pdfBytes !== undefined && input.pdfBytes < 1024)
    flag("PDF_TOO_SMALL", "PDF appears empty or truncated", 25, true);
  score = Math.max(0, score);
  const reviewCodes = new Set(['LENGTH_REVIEW', 'PARAGRAPH_REVIEW', 'ANSWER_FIRST_REVIEW', 'GENERIC_ADVICE', 'REPEATED_SENTENCE', 'REPEATED_OPENING']);
  return {
    score,
    // This is a structural pre-delivery check only. It is never a semantic
    // content approval; the explicit review flag keeps that distinction visible.
    passed: score >= 95 && !findings.some(x => x.blocking),
    requiresHumanReview: findings.some(item => reviewCodes.has(item.code)),
    findings,
  };
}
