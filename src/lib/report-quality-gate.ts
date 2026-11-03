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
  pdfBytes?: number;
  provenance?: Array<{ questionId: string; ruleIds: string[]; evidence: Array<{ id: string; value: string }> }>;
};
export type QualityFinding = { code: string; message: string; blocking: boolean };
export type QualityResult = { score: number; passed: boolean; findings: QualityFinding[] };

const NORMALIZE = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const GENERIC = /(?:keep moving forward|trust the process|believe in yourself|take small steps|stay positive)/gi;
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
  answers.forEach((answer, i) => {
    if (!answer) flag("EMPTY_ANSWER", `Question ${i + 1} has an empty answer`, 20, true);
    if (answer.length < 100) flag("SHORT_ANSWER", `Answer ${i + 1} is too short`, 8, true);
    if ((answer.match(GENERIC) || []).length > 0) flag("GENERIC_ADVICE", `Generic advice in answer ${i + 1}`, 3);
    const lead = answer.split(/[.!?](?:\s|$)/, 1)[0] ?? '';
    if (lead.length < 25) flag("WEAK_OPENING", `Answer ${i + 1} may not lead with a complete conclusion`, 2);
  });
  const seen = new Map<string, number>();
  for (const [index, answer] of answers.entries()) {
    const key = NORMALIZE(answer).split(/\s+/).filter(Boolean).slice(0, 24).join(' ');
    const prior = seen.get(key);
    if (key && prior !== undefined) flag("REPEATED_OPENING", `Answers ${prior + 1} and ${index + 1} share the same opening`, 6);
    else if (key) seen.set(key, index);
  }
  if (!input.birthTimeKnown && input.usesHourPillar)
    flag("UNKNOWN_HOUR", "Hour pillar used with unknown birth time", 30, true);
  if (!input.calculationVerified)
    flag("UNVERIFIED_CALCULATION", "Calculation verification failed or was not supplied", 30, true);
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
  return { score, passed: score >= 95 && !findings.some(x => x.blocking), findings };
}
