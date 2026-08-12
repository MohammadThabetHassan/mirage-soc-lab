type IntegrityResult = {
  verified: boolean;
  evidence: { entries: number };
  dispositions: { entries: number };
};

type CaseIntegrityStatusProps = {
  isLoading: boolean;
  result?: IntegrityResult;
};

export function CaseIntegrityStatus({
  isLoading,
  result,
}: CaseIntegrityStatusProps) {
  return (
    <div className="border-t border-cyan-400/10 pt-4">
      <h3 className="neon-label mb-2 text-[10px] text-cyan-300">
        Integrity verification
      </h3>
      {isLoading ? (
        <p className="text-xs text-slate-500">
          Recomputing append-only chains…
        </p>
      ) : result?.verified ? (
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-3">
          <p className="text-xs font-semibold text-emerald-200">
            Verified evidence and disposition chains
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {result.evidence.entries} evidence links and{" "}
            {result.dispositions.entries} analyst decisions recomputed
            successfully.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-rose-400/25 bg-rose-400/5 p-3">
          <p className="text-xs font-semibold text-rose-200">
            Integrity verification unavailable or failed
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Review the evidence lineage and disposition history before relying
            on this case.
          </p>
        </div>
      )}
    </div>
  );
}
