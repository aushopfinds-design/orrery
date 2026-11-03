/**
 * Deterministic pre-delivery report quality gate.
 * Does not alter the Saju calculation engine, Stripe, or PDF rendering.
 * A passing score is an internal heuristic, not proof of interpretive accuracy.
 */
export type ReportQualityInput = {
  productId: string;
  questions: Array<{ question: string; answer: string }>;
  expectedQuestions: string[];
  birthTimeKnown: boolean;
  usesHourPillar: boolean;
  calculationVerified: boolean;
  pdfBytes?: number;
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
    if (answer.length < 100) flag("SHORT_ANSWER", `Answer ${i + 1} is too short`, 8, true);
    if ((answer.match(GENERIC) || []).length > 0) flag("GENERIC_ADVICE", `Generic advice in answer ${i + 1}`, 3);
  });
  const seen = new Set<string>();
  for (const answer of answers) {
    const key = NORMALIZE(answer);
    if (key && seen.has(key)) flag("DUPLICATE_ANSWER", "Duplicate answer detected", 15, true);
    seen.add(key);
  }
  if (!input.birthTimeKnown && input.usesHourPillar)
    flag("UNKNOWN_HOUR", "Hour pillar used with unknown birth time", 30, true);
  if (!input.calculationVerified)
    flag("UNVERIFIED_CALCULATION", "Calculation verification failed or was not supplied", 30, true);
  if (input.pdfBytes !== undefined && input.pdfBytes < 1024)
    flag("PDF_TOO_SMALL", "PDF appears empty or truncated", 25, true);
  score = Math.max(0, score);
  return { score, passed: score >= 95 && !findings.some(x => x.blocking), findings };
}
