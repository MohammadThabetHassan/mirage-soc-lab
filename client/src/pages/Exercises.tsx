import { trpc } from "@/lib/trpc";
import { CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

type Responses = Record<string, string>;

export default function Exercises() {
  const exercises = trpc.soc.analystExercises.useQuery();
  const evaluate = trpc.soc.evaluateAnalystExercise.useMutation();
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [responses, setResponses] = useState<Responses>({});
  const activeExercise = useMemo(
    () =>
      exercises.data?.find(item => item.id === selectedExerciseId) ??
      exercises.data?.[0],
    [exercises.data, selectedExerciseId]
  );
  const answered = activeExercise
    ? activeExercise.questions.filter(question => responses[question.id]).length
    : 0;

  const selectExercise = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setResponses({});
    evaluate.reset();
  };

  const submit = () => {
    if (!activeExercise) return;
    evaluate.mutate({
      exerciseId: activeExercise.id,
      responses: activeExercise.questions.map(question => ({
        questionId: question.id,
        optionId: responses[question.id] ?? "",
      })),
    });
  };

  return (
    <div className="cyber-grid min-h-full -m-4 p-4 md:p-6">
      <header className="mb-7">
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <GraduationCap className="h-4 w-4" />
          <span className="neon-label text-[10px]">
            Guided analyst practice
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          Evidence-led exercises
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Practice controlled analyst decisions against the MIRAGE catalog. Your
          responses are evaluated transiently and are not stored as a user
          profile, score, case note, or production assessment.
        </p>
      </header>

      {exercises.data && activeExercise ? (
        <div className="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="neon-panel h-fit overflow-hidden rounded-xl">
            <div className="border-b border-cyan-400/15 px-4 py-4">
              <p className="neon-label text-[10px] text-slate-200">
                Select an exercise
              </p>
            </div>
            <div className="p-2">
              {exercises.data.map(item => {
                const selected = item.id === activeExercise.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectExercise(item.id)}
                    className={`mb-1 w-full rounded-lg p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                      selected
                        ? "bg-cyan-400/10 text-cyan-100"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {item.title}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] text-slate-500">
                      {item.scenarioKey}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="neon-panel overflow-hidden rounded-xl">
            <div className="border-b border-cyan-400/15 px-5 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="neon-label text-[10px] text-cyan-300">
                    Controlled scenario · {activeExercise.scenarioKey}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-100">
                    {activeExercise.title}
                  </h2>
                </div>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 font-mono text-[10px] text-cyan-200">
                  {answered} / {activeExercise.questions.length} answered
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                {activeExercise.objective}
              </p>
              <p className="mt-4 border-l border-emerald-400/35 pl-3 text-xs leading-5 text-emerald-100/80">
                {activeExercise.safetyNotice}
              </p>
            </div>

            <div className="space-y-6 p-5">
              {activeExercise.questions.map((question, questionIndex) => (
                <fieldset
                  key={question.id}
                  className="rounded-lg border border-cyan-400/15 bg-slate-950/30 p-4"
                >
                  <legend className="neon-label px-1 text-[10px] text-cyan-300">
                    Decision {questionIndex + 1}
                  </legend>
                  <p className="mt-2 text-base font-medium text-slate-100">
                    {question.prompt}
                  </p>
                  <p className="mt-3 rounded-md border border-slate-700/60 bg-slate-900/45 p-3 text-xs leading-5 text-slate-400">
                    <span className="font-semibold text-slate-300">
                      Evidence:
                    </span>{" "}
                    {question.evidence}
                  </p>
                  <div className="mt-4 space-y-2">
                    {question.options.map(option => (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer gap-3 rounded-md border p-3 text-sm transition-colors ${
                          responses[question.id] === option.id
                            ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-50"
                            : "border-slate-700/70 text-slate-300 hover:border-cyan-400/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={responses[question.id] === option.id}
                          onChange={() =>
                            setResponses(current => ({
                              ...current,
                              [question.id]: option.id,
                            }))
                          }
                          className="mt-1 accent-cyan-300"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              <button
                type="button"
                onClick={submit}
                disabled={
                  answered !== activeExercise.questions.length ||
                  evaluate.isPending
                }
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-transform hover:bg-cyan-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ShieldCheck className="h-4 w-4" />
                Check controlled decision
              </button>

              {evaluate.data ? (
                <div
                  className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 p-4"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2 text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <p className="font-semibold">
                      {evaluate.data.correctAnswers} /{" "}
                      {evaluate.data.totalQuestions} evidence decisions aligned
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    {evaluate.data.privacyNotice}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {evaluate.data.feedback.map((item, index) => (
                      <li
                        key={item.questionId}
                        className="border-t border-emerald-400/15 pt-3 text-xs leading-5 text-slate-400"
                      >
                        <span
                          className={
                            item.correct
                              ? "font-semibold text-emerald-200"
                              : "font-semibold text-amber-200"
                          }
                        >
                          Decision {index + 1}:{" "}
                          {item.correct ? "aligned" : "review needed"}
                        </span>
                        <p className="mt-1">{item.rationale}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {evaluate.error ? (
                <p className="text-sm text-red-200" role="alert">
                  {evaluate.error.message}
                </p>
              ) : null}
            </div>
          </section>
        </div>
      ) : (
        <div
          className="neon-panel rounded-xl p-8 text-sm text-slate-400"
          aria-busy="true"
        >
          Loading controlled exercise manifest…
        </div>
      )}
    </div>
  );
}
