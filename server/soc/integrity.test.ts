import { describe, expect, it } from "vitest";
import { dispositionHistoryHash, evidenceLineageHash, verifyHashChain } from "./integrity";

describe("case evidence integrity", () => {
  it("builds a verifiable append-only evidence chain tied to rule version and event IDs", () => {
    const first = evidenceLineageHash({ previousHash: null, caseId: "case-1", eventId: "event-1", ruleId: "repeated-auth-failures", ruleVersion: "1.0.0" });
    const second = evidenceLineageHash({ previousHash: first, caseId: "case-1", eventId: "event-2", ruleId: "repeated-auth-failures", ruleVersion: "1.0.0" });
    const entries = [{ previousHash: null, entryHash: first }, { previousHash: first, entryHash: second }];

    expect(verifyHashChain(entries, (previousHash, index) => evidenceLineageHash({
      previousHash,
      caseId: "case-1",
      eventId: `event-${index + 1}`,
      ruleId: "repeated-auth-failures",
      ruleVersion: "1.0.0",
    }))).toBe(true);
    expect(evidenceLineageHash({ previousHash: first, caseId: "case-1", eventId: "event-2", ruleId: "repeated-auth-failures", ruleVersion: "2.0.0" })).not.toBe(second);
  });

  it("detects a tampered disposition-history entry", () => {
    const first = dispositionHistoryHash({ previousHash: null, caseId: "case-1", disposition: "suspicious", note: "Review requested", authorName: "Analyst A" });
    const second = dispositionHistoryHash({ previousHash: first, caseId: "case-1", disposition: "confirmed", note: "Validated in lab", authorName: "Analyst B" });
    const entries = [{ previousHash: null, entryHash: first }, { previousHash: first, entryHash: second }];

    expect(verifyHashChain(entries, (previousHash, index) => dispositionHistoryHash({
      previousHash,
      caseId: "case-1",
      disposition: index === 0 ? "suspicious" : "confirmed",
      note: index === 0 ? "Review requested" : "Validated in lab",
      authorName: index === 0 ? "Analyst A" : "Analyst B",
    }))).toBe(true);
    entries[1]!.entryHash = "tampered";
    expect(verifyHashChain(entries, (previousHash, index) => dispositionHistoryHash({
      previousHash,
      caseId: "case-1",
      disposition: index === 0 ? "suspicious" : "confirmed",
      note: index === 0 ? "Review requested" : "Validated in lab",
      authorName: index === 0 ? "Analyst A" : "Analyst B",
    }))).toBe(false);
  });
});
