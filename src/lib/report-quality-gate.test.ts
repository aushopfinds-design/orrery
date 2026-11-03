import { describe, expect, it } from "vitest";
import { inspectReport } from "./report-quality-gate";
const questions = ["Who am I?", "What is my strength?"];
const base = {
  productId: "01", expectedQuestions: questions,
  questions: questions.map(question => ({ question, answer: "Your chart suggests a practical pattern of taking responsibility and looking for stable outcomes. This is a personalized interpretation requiring separate evidence validation." })),
  birthTimeKnown: false, usesHourPillar: false, calculationVerified: true, pdfBytes: 5000
};
describe("report quality gate", () => {
  it("accepts structurally complete verified input", () => expect(inspectReport(base).passed).toBe(true));
  it("blocks unknown-hour claims", () => expect(inspectReport({...base, usesHourPillar:true}).passed).toBe(false));
  it("blocks missing questions", () => expect(inspectReport({...base, questions:base.questions.slice(0,1)}).passed).toBe(false));
  it("blocks unverified calculations", () => expect(inspectReport({...base, calculationVerified:false}).passed).toBe(false));
  it("blocks duplicate answers", () => expect(inspectReport({...base, questions:base.questions.map(x=>({...x,answer:base.questions[0].answer}))}).passed).toBe(false));
});
