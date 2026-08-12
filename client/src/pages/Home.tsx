import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Crosshair,
  Database,
  FileWarning,
  Play,
  Radar,
  ShieldAlert,
  TerminalSquare,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const severityStyles = {
  critical: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-200 shadow-[0_0_18px_rgba(232,121,249,0.15)]",
  high: "border-rose-400/50 bg-rose-400/10 text-rose-200",
  medium: "border-amber-400/50 bg-amber-400/10 text-amber-200",
  low: "border-cyan-400/50 bg-cyan-400/10 text-cyan-200",
};

const dispositionStyles = {
  open: "text-cyan-200 border-cyan-400/35 bg-cyan-400/10",
  benign: "text-slate-300 border-slate-400/30 bg-slate-400/10",
  suspicious: "text-amber-200 border-amber-400/35 bg-amber-400/10",
  confirmed: "text-fuchsia-200 border-fuchsia-400/35 bg-fuchsia-400/10",
};

function formatTime(value: Date | string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function parseJson<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return [] as T;
  }
}

export default function Home() {
  const utils = trpc.useUtils();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<"full-pipeline" | "credential-probe" | "benign-admin">("full-pipeline");
  const [analystNote, setAnalystNote] = useState("");
  const snapshot = trpc.soc.snapshot.useQuery(undefined, { refetchInterval: 1_500 });
  const mappings = trpc.soc.attackMappings.useQuery();
  const selectedCase = snapshot.data?.cases.find(item => item.id === selectedCaseId) ?? snapshot.data?.cases[0] ?? null;
  const caseDetail = trpc.soc.getCase.useQuery({ caseId: selectedCase?.id ?? "00000000-0000-0000-0000-000000000000" }, { enabled: Boolean(selectedCase?.id) });
  const runner = trpc.soc.runScenario.useMutation({
    onSuccess: async (result) => {
      await utils.soc.snapshot.invalidate();
      toast.success(`Scenario replay complete: ${result.eventsGenerated} events and ${result.casesGenerated} cases.`);
    },
    onError: error => toast.error(error.message),
  });
  const disposition = trpc.soc.dispositionCase.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.soc.snapshot.invalidate(), utils.soc.getCase.invalidate()]);
      toast.success("Analyst disposition recorded.");
    },
    onError: error => toast.error(error.message),
  });

  const summary = useMemo(() => {
    const cases = snapshot.data?.cases ?? [];
    return {
      total: cases.length,
      critical: cases.filter(item => item.severity === "critical").length,
      open: cases.filter(item => item.disposition === "open").length,
      events: snapshot.data?.events.length ?? 0,
    };
  }, [snapshot.data]);

  const mapping = mappings.data?.find(item => item.ruleId === selectedCase?.ruleId);
  const evidence = selectedCase ? parseJson<Array<{ eventId: string; occurredAt: string; label: string; detail: string; eventType: string }>>(selectedCase.evidenceJson) : [];
  const riskBreakdown = selectedCase ? parseJson<Array<{ label: string; points: number; rationale: string }>>(selectedCase.riskBreakdownJson) : [];

  const submitDisposition = (nextDisposition: "benign" | "suspicious" | "confirmed") => {
    if (!selectedCase || !analystNote.trim()) {
      toast.error("A disposition requires an analyst note.");
      return;
    }
    disposition.mutate({ caseId: selectedCase.id, disposition: nextDisposition, note: analystNote.trim() }, { onSuccess: () => setAnalystNote("") });
  };

  return (
    <div className="cyber-grid min-h-full -m-4 p-4 md:p-6">
      <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-cyan-300">
            <Radar className="h-4 w-4 animate-pulse" />
            <span className="neon-label text-[10px]">Live defensive simulation</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 md:text-4xl">SOC Command Console</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Observe safe synthetic telemetry, review explainable correlation evidence, and document an analyst disposition.</p>
        </div>
        <div className="neon-panel flex flex-col gap-3 rounded-xl p-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 px-1 text-xs text-slate-300"><CircleDot className="h-3.5 w-3.5 text-emerald-300" /> Local lab telemetry only</div>
          <select value={selectedScenario} onChange={event => setSelectedScenario(event.target.value as typeof selectedScenario)} className="rounded-lg border border-cyan-400/20 bg-slate-950/70 px-3 py-2 text-xs text-cyan-100 outline-none focus:border-cyan-300">
            <option value="full-pipeline">Full pipeline story</option>
            <option value="credential-probe">Credential probe</option>
            <option value="benign-admin">Benign admin activity</option>
          </select>
          <button onClick={() => runner.mutate({ scenarioKey: selectedScenario })} disabled={runner.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
            <Play className="h-3.5 w-3.5 fill-current" /> {runner.isPending ? "Running replay…" : "Run demo scenario"}
          </button>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Detected cases" value={summary.total} icon={FileWarning} accent="cyan" />
        <StatCard label="Critical queue" value={summary.critical} icon={ShieldAlert} accent="fuchsia" />
        <StatCard label="Open for review" value={summary.open} icon={AlertTriangle} accent="amber" />
        <StatCard label="Event buffer" value={summary.events} icon={Database} accent="emerald" />
      </section>

      <section className="grid gap-5 2xl:grid-cols-[0.82fr_1.35fr_0.83fr]">
        <div className="neon-panel min-h-[520px] rounded-xl">
          <PanelTitle icon={FileWarning} label="Case queue" meta={`${summary.open} open`} />
          <div className="max-h-[466px] overflow-y-auto p-2">
            {snapshot.isLoading ? <EmptyState label="Synchronizing case queue…" /> : snapshot.data?.cases.length ? snapshot.data.cases.map(item => (
              <button key={item.id} onClick={() => setSelectedCaseId(item.id)} className={`mb-2 w-full rounded-lg border p-3 text-left transition ${selectedCase?.id === item.id ? "border-cyan-300/70 bg-cyan-300/10" : "border-transparent hover:border-cyan-400/20 hover:bg-slate-900/40"}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityStyles[item.severity]}`}>{item.severity}</span>
                  <span className="font-mono text-[10px] text-slate-500">{formatTime(item.lastSeenAt)}</span>
                </div>
                <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                <div className="mt-2 flex items-center justify-between"><span className="font-mono text-[10px] text-slate-400">{item.sourceIp}</span><span className={`rounded border px-1.5 py-0.5 text-[9px] font-medium uppercase ${dispositionStyles[item.disposition]}`}>{item.disposition}</span></div>
              </button>
            )) : <EmptyState label="No cases yet. Run a safe demo scenario to populate the queue." />}
          </div>
        </div>

        <div className="neon-panel min-h-[520px] rounded-xl">
          <PanelTitle icon={Crosshair} label="Explainable case view" meta={selectedCase ? `RISK ${selectedCase.riskScore}/100` : "Awaiting evidence"} />
          {selectedCase ? <div className="space-y-5 p-5">
            <div className="flex flex-col gap-3 border-b border-cyan-400/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div><div className="mb-2 flex gap-2"><span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityStyles[selectedCase.severity]}`}>{selectedCase.severity}</span><span className="neon-label text-[10px] text-slate-500">{selectedCase.ruleId}</span></div><h2 className="text-xl font-bold text-slate-50">{selectedCase.title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{selectedCase.summary}</p></div>
              <div className="rounded-xl border border-cyan-400/25 bg-cyan-300/5 px-4 py-3 text-center"><div className="text-2xl font-bold text-cyan-200">{selectedCase.riskScore}</div><div className="neon-label text-[9px] text-cyan-400">risk score</div></div>
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <div><h3 className="neon-label mb-3 text-[10px] text-cyan-300">Evidence timeline</h3><div className="space-y-3 border-l border-cyan-400/20 pl-4">{evidence.map(item => <div key={item.eventId} className="relative"><span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-cyan-300 bg-slate-950" /><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold capitalize text-slate-200">{item.label}</span><span className="font-mono text-[10px] text-cyan-400">{formatTime(item.occurredAt)}</span></div><p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p></div>)}</div></div>
              <div><h3 className="neon-label mb-3 text-[10px] text-fuchsia-300">Risk-score breakdown</h3><div className="space-y-3">{riskBreakdown.map(item => <div key={item.label} className="rounded-lg border border-fuchsia-400/15 bg-fuchsia-400/5 p-3"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-200">{item.label}</span><span className="font-mono text-sm text-fuchsia-200">+{item.points}</span></div><p className="mt-1 text-xs leading-5 text-slate-400">{item.rationale}</p></div>)}</div></div>
            </div>
            <div className="border-t border-cyan-400/10 pt-5"><label htmlFor="analyst-note" className="neon-label mb-2 block text-[10px] text-cyan-300">Analyst disposition note</label><textarea id="analyst-note" value={analystNote} onChange={event => setAnalystNote(event.target.value)} maxLength={2000} placeholder="Record the evidence and reasoning supporting this disposition…" className="min-h-20 w-full resize-y rounded-lg border border-cyan-400/20 bg-slate-950/50 p-3 text-xs leading-5 text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-300/60" /><div className="mt-3 flex flex-wrap gap-2"><span className="mr-1 self-center text-xs text-slate-500">Set disposition:</span><ActionButton label="Benign" style="slate" onClick={() => submitDisposition("benign")} /><ActionButton label="Suspicious" style="amber" onClick={() => submitDisposition("suspicious")} /><ActionButton label="Confirmed lab event" style="fuchsia" onClick={() => submitDisposition("confirmed")} /></div></div>
            {caseDetail.data?.notes.length ? <div className="border-t border-cyan-400/10 pt-4"><h3 className="neon-label mb-3 text-[10px] text-cyan-300">Analyst notes</h3><div className="space-y-2">{caseDetail.data.notes.map(note => <div key={note.id} className="rounded-lg bg-slate-950/35 p-3"><div className="mb-1 flex justify-between gap-3 text-[10px]"><span className="font-medium text-slate-300">{note.authorName}</span><span className="font-mono text-slate-500">{formatTime(note.createdAt)}</span></div><p className="text-xs leading-5 text-slate-400">{note.body}</p></div>)}</div></div> : null}
          </div> : <EmptyState label="Select a case from the queue to inspect complete evidence." />}
        </div>

        <div className="space-y-5">
          <div className="neon-panel rounded-xl"><PanelTitle icon={TerminalSquare} label="Live event feed" meta="stream" /><div className="max-h-[267px] overflow-y-auto p-3 font-mono text-[11px]">{snapshot.data?.events.length ? snapshot.data.events.map(event => <div key={event.id} className="mb-2 border-l border-cyan-400/20 pl-3"><span className="mr-2 text-cyan-400">{formatTime(event.occurredAt)}</span><span className="mr-2 text-fuchsia-300">{event.eventType}</span><span className="text-slate-400">{event.message}</span></div>) : <EmptyState label="Synthetic events will appear here during a scenario replay." />}</div></div>
          <div className="neon-panel rounded-xl"><PanelTitle icon={Zap} label="ATT&CK technique mapping" meta="context" />{mapping ? <div className="p-4"><div className="mb-3 flex items-start justify-between gap-3"><div><p className="neon-label text-[10px] text-cyan-300">{mapping.tactic}</p><h3 className="mt-1 text-base font-bold text-slate-100">{mapping.techniqueId} · {mapping.techniqueName}</h3></div><a href={mapping.referenceUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-cyan-400/30 p-2 text-cyan-300 hover:bg-cyan-400/10" aria-label="Open MITRE ATT&CK reference"><ArrowUpRight className="h-4 w-4" /></a></div><p className="text-xs leading-5 text-slate-400">{mapping.rationale}</p><div className="mt-3 rounded-lg border border-amber-400/15 bg-amber-400/5 p-3"><p className="neon-label mb-1 text-[9px] text-amber-300">Caveat</p><p className="text-xs leading-5 text-slate-400">{mapping.caveat}</p></div></div> : <EmptyState label="Select a case to view its ATT&CK detection context." />}</div>
        </div>
      </section>
    </div>
  );
}

function PanelTitle({ icon: Icon, label, meta }: { icon: typeof Activity; label: string; meta: string }) {
  return <div className="flex items-center justify-between border-b border-cyan-400/15 px-4 py-3"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-cyan-300" /><span className="neon-label text-[10px] font-semibold text-slate-200">{label}</span></div><span className="font-mono text-[10px] text-slate-500">{meta}</span></div>;
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: typeof Activity; accent: "cyan" | "fuchsia" | "amber" | "emerald" }) {
  const color = { cyan: "text-cyan-300", fuchsia: "text-fuchsia-300", amber: "text-amber-300", emerald: "text-emerald-300" }[accent];
  return <div className="neon-panel rounded-xl p-4"><div className="flex items-start justify-between"><span className="neon-label text-[10px] text-slate-500">{label}</span><Icon className={`h-4 w-4 ${color}`} /></div><p className={`mt-3 text-3xl font-bold ${color}`}>{value}</p></div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="flex min-h-32 items-center justify-center px-5 text-center text-xs leading-5 text-slate-500">{label}</div>;
}

function ActionButton({ label, style, onClick }: { label: string; style: "slate" | "amber" | "fuchsia"; onClick: () => void }) {
  const styles = { slate: "border-slate-400/30 text-slate-300 hover:bg-slate-400/10", amber: "border-amber-400/35 text-amber-200 hover:bg-amber-400/10", fuchsia: "border-fuchsia-400/35 text-fuchsia-200 hover:bg-fuchsia-400/10" }[style];
  return <button onClick={onClick} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${styles}`}>{label}</button>;
}
