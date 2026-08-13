import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Crosshair,
  ShieldCheck,
  Target,
} from "lucide-react";

function metric(value: number, suffix = "%") {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;
}

export default function Evaluation() {
  const evaluation = trpc.soc.evaluation.useQuery();
  const catalog = trpc.soc.detectionCatalog.useQuery();
  const data = evaluation.data;

  return (
    <div className="cyber-grid min-h-full -m-4 p-4 md:p-6">
      <header className="mb-7">
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <BarChart3 className="h-4 w-4" />
          <span className="neon-label text-[10px]">
            Deterministic lab validation
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          Pipeline Evaluation
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Metrics are computed from the documented scenario catalog. They are
          **lab-validation results**, not evidence of production efficacy.
        </p>
        {catalog.data ? (
          <p className="mt-3 font-mono text-[10px] text-cyan-300/80">
            DETECTION CATALOG v{catalog.data.version} ·{" "}
            {catalog.data.rules.length} VERSIONED RULES
          </p>
        ) : null}
      </header>
      {data ? (
        <>
          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Target}
              label="Recall / coverage"
              value={metric(data.coverage)}
              note="Expected detections recovered"
              accent="cyan"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Alert precision"
              value={metric(data.alertPrecision)}
              note="Lab alerts without benign hits"
              accent="emerald"
            />
            <MetricCard
              icon={ShieldCheck}
              label="False-positive rate"
              value={metric(data.falsePositiveRate)}
              note="Known-benign scenario alerts"
              accent="amber"
            />
            <MetricCard
              icon={Clock3}
              label="Avg. time to detect"
              value={metric(data.averageTimeToDetect, " min")}
              note="First event to correlated case"
              accent="fuchsia"
            />
          </section>

          <section className="neon-panel mb-6 overflow-hidden rounded-xl">
            <div className="border-b border-cyan-400/15 px-5 py-4">
              <h2 className="neon-label text-[10px] text-slate-200">
                Metrics by scenario class
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-cyan-400/10 bg-slate-950/25">
                  <tr className="neon-label text-[10px] text-slate-500">
                    <th className="px-5 py-3 font-medium">Class</th>
                    <th className="px-5 py-3 font-medium">Scenarios</th>
                    <th className="px-5 py-3 font-medium">Precision</th>
                    <th className="px-5 py-3 font-medium">Recall / coverage</th>
                    <th className="px-5 py-3 font-medium">
                      False-positive rate
                    </th>
                    <th className="px-5 py-3 font-medium">Avg. TTD</th>
                  </tr>
                </thead>
                <tbody>
                  {data.classMetrics.map(item => (
                    <tr
                      key={item.classification}
                      className="border-b border-cyan-400/10 last:border-0"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-cyan-100">
                        {item.classification}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-slate-300">
                        {item.scenarios}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-emerald-200">
                        {metric(item.precision)}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-cyan-200">
                        {metric(item.recallCoverage)}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-amber-200">
                        {metric(item.falsePositiveRate)}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-fuchsia-200">
                        {item.averageTimeToDetect
                          ? `${item.averageTimeToDetect} min`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="neon-panel mb-6 overflow-hidden rounded-xl">
            <div className="flex items-center justify-between border-b border-cyan-400/15 px-5 py-4">
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-cyan-300" />
                <h2 className="neon-label text-[10px] text-slate-200">
                  Scenario results
                </h2>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                REPRODUCIBLE LAB MATRIX
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-cyan-400/10 bg-slate-950/25">
                  <tr className="neon-label text-[10px] text-slate-500">
                    <th className="px-5 py-3 font-medium">Scenario</th>
                    <th className="px-5 py-3 font-medium">Class</th>
                    <th className="px-5 py-3 font-medium">Expected</th>
                    <th className="px-5 py-3 font-medium">Observed</th>
                    <th className="px-5 py-3 font-medium">False positives</th>
                    <th className="px-5 py-3 font-medium">Average TTD</th>
                  </tr>
                </thead>
                <tbody>
                  {data.scenarios.map(item => (
                    <tr
                      key={item.key}
                      className="border-b border-cyan-400/10 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-200">
                          {item.key.replaceAll("-", " ")}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-slate-500">
                          {item.key}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-cyan-100">
                        {item.classification}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-slate-300">
                        {item.expectedDetections}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-cyan-200">
                        {item.observedDetections}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-amber-200">
                        {item.falsePositives}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-fuchsia-200">
                        {item.averageTimeToDetect
                          ? `${item.averageTimeToDetect} min`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="neon-panel overflow-hidden rounded-xl">
            <div className="border-b border-cyan-400/15 px-5 py-4">
              <h2 className="neon-label text-[10px] text-slate-200">
                ATT&amp;CK coverage and test traceability
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1240px] text-left">
                <thead className="border-b border-cyan-400/10 bg-slate-950/25">
                  <tr className="neon-label text-[10px] text-slate-500">
                    <th className="px-5 py-3 font-medium">Technique</th>
                    <th className="px-5 py-3 font-medium">Evidence fields</th>
                    <th className="px-5 py-3 font-medium">
                      Telemetry prerequisites
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Scenario / test cases
                    </th>
                    <th className="px-5 py-3 font-medium">Detection logic</th>
                    <th className="px-5 py-3 font-medium">
                      Caveat and triage boundary
                    </th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.coverageMatrix.map(item => (
                    <tr
                      key={item.ruleId}
                      className="border-b border-cyan-400/10 align-top last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-cyan-100">
                          {item.technique}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {item.ruleId}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-300">
                        {item.supportingEventFields.join(", ")}
                      </td>
                      <td className="px-5 py-4 text-xs leading-5 text-slate-400">
                        {item.telemetryRequirements.map(requirement => (
                          <p key={requirement.field} className="mb-1 last:mb-0">
                            <span className="font-mono text-cyan-200">
                              {requirement.field}
                            </span>{" "}
                            — {requirement.purpose}
                          </p>
                        ))}
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-300">
                        {item.testCaseIds.join(", ")}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {item.detectionLogic}
                      </td>
                      <td className="max-w-sm px-5 py-4 text-xs text-slate-400">
                        <p>{item.caveat}</p>
                        <p className="mt-2 border-t border-amber-400/10 pt-2 text-amber-100/80">
                          {item.triageBoundary}
                        </p>
                      </td>
                      <td
                        className={`px-5 py-4 font-mono text-xs ${item.currentStatus === "validated" ? "text-emerald-200" : "text-amber-200"}`}
                      >
                        {item.currentStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <div className="neon-panel rounded-xl p-8 text-sm text-slate-500">
          Calculating the controlled evaluation matrix…
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  accent,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  note: string;
  accent: "cyan" | "emerald" | "amber" | "fuchsia";
}) {
  const colors = {
    cyan: "text-cyan-200",
    emerald: "text-emerald-200",
    amber: "text-amber-200",
    fuchsia: "text-fuchsia-200",
  }[accent];
  return (
    <div className="neon-panel rounded-xl p-5">
      <div className="flex items-center justify-between">
        <span className="neon-label text-[10px] text-slate-500">{label}</span>
        <Icon className={`h-4 w-4 ${colors}`} />
      </div>
      <p className={`mt-4 text-3xl font-bold ${colors}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}
