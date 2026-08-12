import { createHash } from "node:crypto";

function hash(parts: string[]): string {
  return createHash("sha256").update(parts.join("\u001f")).digest("hex");
}

export function evidenceLineageHash(input: {
  previousHash: string | null;
  caseId: string;
  eventId: string;
  ruleId: string;
  ruleVersion: string;
}): string {
  return hash(["evidence", input.previousHash ?? "GENESIS", input.caseId, input.eventId, input.ruleId, input.ruleVersion]);
}

export function dispositionHistoryHash(input: {
  previousHash: string | null;
  caseId: string;
  disposition: string;
  note: string;
  authorName: string;
}): string {
  return hash(["disposition", input.previousHash ?? "GENESIS", input.caseId, input.disposition, input.note, input.authorName]);
}

export function verifyHashChain(entries: Array<{ previousHash: string | null; entryHash: string }>, recompute: (previousHash: string | null, index: number) => string): boolean {
  let previousHash: string | null = null;
  return entries.every((entry, index) => {
    const valid = entry.previousHash === previousHash && entry.entryHash === recompute(previousHash, index);
    previousHash = entry.entryHash;
    return valid;
  });
}

export type EvidenceLineageEntry = {
  previousHash: string | null;
  entryHash: string;
  caseId: string;
  eventId: string;
  ruleId: string;
  ruleVersion: string;
};

export type DispositionHistoryEntry = {
  previousHash: string | null;
  entryHash: string;
  caseId: string;
  disposition: string;
  note: string;
  authorName: string;
};

/**
 * Recomputes both append-only chains from stored fields. Empty chains are
 * considered structurally valid, while the returned counters make their state
 * explicit to an analyst.
 */
export function assessCaseIntegrity(input: {
  evidenceLineage: EvidenceLineageEntry[];
  dispositionHistory: DispositionHistoryEntry[];
}) {
  const evidenceValid = verifyHashChain(input.evidenceLineage, (previousHash, index) => {
    const entry = input.evidenceLineage[index]!;
    return evidenceLineageHash({
      previousHash,
      caseId: entry.caseId,
      eventId: entry.eventId,
      ruleId: entry.ruleId,
      ruleVersion: entry.ruleVersion,
    });
  });
  const dispositionValid = verifyHashChain(input.dispositionHistory, (previousHash, index) => {
    const entry = input.dispositionHistory[index]!;
    return dispositionHistoryHash({
      previousHash,
      caseId: entry.caseId,
      disposition: entry.disposition,
      note: entry.note,
      authorName: entry.authorName,
    });
  });

  return {
    verified: evidenceValid && dispositionValid,
    evidence: { verified: evidenceValid, entries: input.evidenceLineage.length },
    dispositions: { verified: dispositionValid, entries: input.dispositionHistory.length },
  };
}
