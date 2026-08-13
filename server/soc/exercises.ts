export type ExerciseResponse = {
  questionId: string;
  optionId: string;
};

type ExerciseQuestion = {
  id: string;
  prompt: string;
  evidence: string;
  criterion: string;
  options: Array<{ id: string; label: string }>;
  correctOptionId: string;
  rationale: string;
};

type AnalystExercise = {
  id: string;
  title: string;
  objective: string;
  scenarioKey: string;
  safetyNotice: string;
  questions: ExerciseQuestion[];
};

const EXERCISES: AnalystExercise[] = [
  {
    id: "credential-context",
    title: "Credential-context triage",
    objective:
      "Distinguish a source-bound success-after-failure correlation from an isolated successful login.",
    scenarioKey: "credential-probe",
    safetyNotice:
      "This is a controlled synthetic replay. It creates no external authentication activity.",
    questions: [
      {
        id: "correlation-evidence",
        prompt: "Which observation makes this an analyst-review correlation?",
        evidence:
          "The same synthetic source has repeated failures followed by a success inside the documented window.",
        criterion: "Recognize the source-bound correlation evidence.",
        options: [
          {
            id: "same-source-sequence",
            label: "A source-bound failure sequence precedes the success.",
          },
          {
            id: "success-alone",
            label: "Any successful login is sufficient evidence.",
          },
          {
            id: "severity-alone",
            label: "The rule severity replaces evidence review.",
          },
        ],
        correctOptionId: "same-source-sequence",
        rationale:
          "The correlation depends on a source-bound sequence and time window; a successful login alone is not the detection contract.",
      },
      {
        id: "disposition-boundary",
        prompt:
          "What is the correct lab disposition boundary before additional context?",
        evidence:
          "The catalog states that legitimate users can make mistakes and requires surrounding context.",
        criterion: "Keep the lab signal separate from a production verdict.",
        options: [
          {
            id: "review-context",
            label:
              "Treat it as a controlled signal for review, not production proof.",
          },
          {
            id: "confirm-immediately",
            label: "Confirm malicious activity immediately.",
          },
          {
            id: "discard-without-review",
            label:
              "Discard it because authentication failures are always benign.",
          },
        ],
        correctOptionId: "review-context",
        rationale:
          "MIRAGE makes an explainable lab signal; the analyst must still evaluate surrounding context before a real-world conclusion.",
      },
    ],
  },
  {
    id: "sustained-pressure-controls",
    title: "Sustained-pressure controls",
    objective:
      "Apply the separate count, time-span, and control-scenario contract for low-and-slow authentication pressure.",
    scenarioKey: "low-and-slow-pressure",
    safetyNotice:
      "All failures in this exercise are generated in memory as controlled synthetic telemetry.",
    questions: [
      {
        id: "required-contract",
        prompt:
          "Which rule property separates sustained pressure from a rapid repeated-failure rule?",
        evidence:
          "The v1.2 analytic declares a minimum failure count, a minimum time span, and a maximum correlation window.",
        criterion: "Identify the sustained-pressure threshold contract.",
        options: [
          {
            id: "count-span-window",
            label:
              "Count, minimum span, and correlation window are evaluated together.",
          },
          {
            id: "account-name-only",
            label: "Only the account name is evaluated.",
          },
          {
            id: "severity-overrides",
            label: "Severity overrides the threshold contract.",
          },
        ],
        correctOptionId: "count-span-window",
        rationale:
          "The sustained-pressure analytic is deliberately distinct from rapid failures because its timing contract is explicit and testable.",
      },
      {
        id: "negative-control",
        prompt: "Which documented control should remain silent?",
        evidence:
          "The catalog includes scheduled service retries and a one-event-below sustained boundary.",
        criterion: "Recognize the documented negative control.",
        options: [
          {
            id: "scheduled-retries",
            label:
              "Scheduled service retries that do not meet the pressure contract.",
          },
          {
            id: "positive-pressure",
            label: "The sustained-pressure positive scenario.",
          },
          {
            id: "full-pipeline",
            label: "The full credential-to-decoy pipeline story.",
          },
        ],
        correctOptionId: "scheduled-retries",
        rationale:
          "A documented negative control proves that ordinary retry behavior stays outside the analytic boundary.",
      },
    ],
  },
  {
    id: "change-context-boundary",
    title: "Change-context boundary",
    objective:
      "Determine when the synthetic access-policy context rule should detect and when it must remain silent.",
    scenarioKey: "unapproved-policy-change",
    safetyNotice:
      "This exercise uses a synthetic approval marker only; no real access-policy state is queried or changed.",
    questions: [
      {
        id: "required-context",
        prompt:
          "Which context is required for the controlled change rule to detect?",
        evidence:
          "The rule requires a source-bound login, a short time window, and an explicitly unapproved synthetic marker.",
        criterion: "Identify the required change-context evidence.",
        options: [
          {
            id: "login-unapproved-window",
            label:
              "A matching login, time window, and unapproved synthetic marker.",
          },
          {
            id: "change-alone",
            label: "Any policy-change event by itself.",
          },
          {
            id: "approval-ignored",
            label: "A policy change regardless of approval state.",
          },
        ],
        correctOptionId: "login-unapproved-window",
        rationale:
          "The analytic tests a narrow lab context. A change event alone is intentionally insufficient.",
      },
      {
        id: "approved-control",
        prompt:
          "What should happen when the same synthetic change is explicitly approved?",
        evidence:
          "`authorized-policy-change` is a named known-benign control scenario.",
        criterion: "Apply the approval-state control boundary.",
        options: [
          {
            id: "remain-silent",
            label:
              "Remain silent and preserve the approved change as a control.",
          },
          {
            id: "detect-anyway",
            label: "Detect because all policy changes are suspicious.",
          },
          {
            id: "remove-evidence",
            label: "Remove the event from the lab record.",
          },
        ],
        correctOptionId: "remain-silent",
        rationale:
          "The approved scenario is evidence that the analytic respects its declared boundary rather than treating every change as a case.",
      },
    ],
  },
];

export function listAnalystExercises() {
  return EXERCISES.map(({ questions, ...exercise }) => ({
    ...exercise,
    questions: questions.map(
      ({ correctOptionId, rationale, ...question }) => question
    ),
  }));
}

export function evaluateAnalystExercise(
  exerciseId: string,
  responses: ExerciseResponse[]
) {
  const exercise = EXERCISES.find(item => item.id === exerciseId);
  if (!exercise) throw new Error("Unknown guided exercise.");

  const responseMap = new Map(responses.map(item => [item.questionId, item]));
  if (responseMap.size !== exercise.questions.length) {
    throw new Error("Every exercise question requires one answer.");
  }

  const feedback = exercise.questions.map(question => {
    const response = responseMap.get(question.id);
    const selectedOption = question.options.find(
      item => item.id === response?.optionId
    );
    if (!selectedOption) {
      throw new Error("Exercise response does not match a declared option.");
    }
    return {
      questionId: question.id,
      correct: response?.optionId === question.correctOptionId,
      rationale: question.rationale,
    };
  });

  const correctAnswers = feedback.filter(item => item.correct).length;
  const pointsPerQuestion = 50;
  const score = correctAnswers * pointsPerQuestion;
  const maximumScore = exercise.questions.length * pointsPerQuestion;
  const scoreBand =
    score === maximumScore
      ? "evidence-aligned"
      : score >= maximumScore / 2
        ? "partially-aligned"
        : "revisit-evidence";
  return {
    exerciseId: exercise.id,
    correctAnswers,
    totalQuestions: exercise.questions.length,
    complete: correctAnswers === exercise.questions.length,
    score,
    maximumScore,
    scoreBand,
    rubric: {
      pointsPerQuestion,
      passCondition:
        "Use the rationale to revisit any decision that did not align with the documented evidence boundary.",
    },
    feedback,
    privacyNotice:
      "Responses are evaluated transiently and are not persisted in MIRAGE.",
  };
}
