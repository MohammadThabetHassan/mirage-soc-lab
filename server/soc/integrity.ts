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
