import { describe, expect, it } from "vitest";
import { evaluateAnalystExercise, listAnalystExercises } from "./exercises";

describe("guided analyst exercises", () => {
  it("publishes prompts without answer keys or rationale", () => {
    const exercises = listAnalystExercises();
    expect(exercises).toHaveLength(3);
    expect(JSON.stringify(exercises)).not.toContain("correctOptionId");
    expect(JSON.stringify(exercises)).not.toContain("rationale");
  });

  it("returns transient deterministic feedback for a complete response", () => {
    const result = evaluateAnalystExercise("credential-context", [
      { questionId: "correlation-evidence", optionId: "same-source-sequence" },
      { questionId: "disposition-boundary", optionId: "review-context" },
    ]);
    expect(result).toMatchObject({
      correctAnswers: 2,
      totalQuestions: 2,
      complete: true,
    });
    expect(result.privacyNotice).toMatch(/not persisted/i);
  });

  it("rejects incomplete or invalid exercise responses", () => {
    expect(() =>
      evaluateAnalystExercise("credential-context", [
        { questionId: "correlation-evidence", optionId: "success-alone" },
      ])
    ).toThrow(/every exercise question/i);
    expect(() =>
      evaluateAnalystExercise("credential-context", [
        { questionId: "correlation-evidence", optionId: "unknown" },
        { questionId: "disposition-boundary", optionId: "review-context" },
      ])
    ).toThrow(/does not match/i);
  });
});
