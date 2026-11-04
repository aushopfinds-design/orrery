import { describe, expect, it } from "vitest";
import { inspectReport } from "./report-quality-gate";
const questions = ["Who am I?", "What is my strength?"];
const base = {
  productId: "01", expectedQuestions: questions,
  questions: questions.map((question, index) => ({ question, answer: `Your chart suggests a practical pattern number ${index + 1} of taking responsibility and looking for stable outcomes. This is a personalized interpretation requiring separate evidence validation.` })),
  birthTimeKnown: false, usesHourPillar: false, calculationVerified: true, pdfBytes: 5000
};
describe("report quality gate", () => {
  it("accepts structurally complete verified input", () => expect(inspectReport(base).passed).toBe(true));
  it("does not penalize a concise answer just for being under 100 words", () => {
    const result = inspectReport(base)
    expect(result.score).toBe(100)
    expect(result.findings.filter(item => item.code === "LENGTH_REVIEW").every(item => !item.blocking)).toBe(true)
  });
  it("flags background openings and promised outcomes for review", () => {
    const result = inspectReport({ ...base, questions: [
      { question: questions[0], answer: "In Saju, your chart has many traditional signs. This report explains them in a simple way for you to read." },
      { question: questions[1], answer: "You will definitely become rich and succeed. Your chart guarantees a great future with many rewards." },
    ] })
    expect(result.findings.map(item => item.code)).toContain("ANSWER_FIRST_REVIEW")
    expect(result.findings.some(item => item.code === "GUARANTEED_OUTCOME" && item.blocking)).toBe(true)
  });
  it("blocks unknown-hour claims", () => expect(inspectReport({...base, usesHourPillar:true}).passed).toBe(false));
  it("blocks missing questions", () => expect(inspectReport({...base, questions:base.questions.slice(0,1)}).passed).toBe(false));
  it("blocks unverified calculations", () => expect(inspectReport({...base, calculationVerified:false}).passed).toBe(false));
  it("keeps partial independent checks distinct from full verification", () => {
    const result = inspectReport({ ...base, calculationVerified: false, calculationVerification: 'partial' })
    expect(result.findings.map(item => item.code)).toContain('PARTIAL_CALCULATION_VERIFICATION')
    expect(result.findings.map(item => item.code)).not.toContain('UNVERIFIED_CALCULATION')
  });
  it("flags repeated answers for human review without treating them as a semantic failure", () => {
    const result = inspectReport({ ...base, questions: base.questions.map(item => ({ ...item, answer: base.questions[0].answer })) })
    expect(result.findings.map(item => item.code)).toContain("REPEATED_SENTENCE")
  });
  it("blocks empty answers and missing chart-rule provenance", () => {
    const traced = { ...base, provenance: [
      { questionId: "who am i", ruleIds: ["career.rule.v1"], evidence: [{ id: "chart.month", value: "甲子" }] },
      { questionId: "what is my strength", ruleIds: [], evidence: [] },
    ] }
    const result = inspectReport({ ...traced, questions: [
      { ...base.questions[0], questionId: "who am i" },
      { ...base.questions[1], questionId: "what is my strength", answer: "" },
    ] })
    expect(result.findings.map(item => item.code)).toContain("EMPTY_ANSWER")
    expect(result.findings.map(item => item.code)).toContain("MISSING_ANSWER_PROVENANCE")
  });
});
