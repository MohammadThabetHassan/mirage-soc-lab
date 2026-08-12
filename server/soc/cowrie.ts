import { createHash, randomUUID } from "node:crypto";
import {
  COWRIE_EVENT_MAPPINGS,
  type CowrieImportIssue,
  type CowrieImportResult,
  type CowrieRawRecord,
  type NormalizedCowrieEvent,
  type SupportedCowrieEventId,
} from "@shared/cowrie";

const PRIVATE_OR_DOCUMENTATION_NETS = ["127.", "10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31.", "198.51.100.", "203.0.113."];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNonBlankString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function safeSourceIp(value: unknown): string | undefined {
  const ip = asNonBlankString(value);
  return ip && PRIVATE_OR_DOCUMENTATION_NETS.some(prefix => ip.startsWith(prefix)) ? ip : undefined;
}

function commandIsDiscoveryLike(input: string | undefined): boolean {
  if (!input) return false;
  const normalized = input.trim().toLowerCase();
  return /^(id|whoami|hostname|hostnamectl|uname|pwd|ls|cat \/etc\/passwd|netstat|ip addr|ifconfig)\b/.test(normalized);
}

function deterministicEventId(rawEventId: string, line: number, session: string | undefined): string {
  return createHash("sha256").update(`${rawEventId}:${line}:${session ?? "no-session"}`).digest("hex").slice(0, 32);
}

function normalizeRecord(record: CowrieRawRecord, line: number, scenarioKey: string): NormalizedCowrieEvent | CowrieImportIssue {
  const rawEventId = asNonBlankString(record.eventid);
  const timestampText = asNonBlankString(record.timestamp);
  const sourceIp = safeSourceIp(record.src_ip);
  const session = asNonBlankString(record.session);

  if (!rawEventId || !timestampText || !sourceIp) {
    return { line, code: "invalid_record", message: "Record is missing an allowlisted event ID, valid timestamp, or lab-safe source IP." };
  }
  if (!(rawEventId in COWRIE_EVENT_MAPPINGS)) {
    return { line, code: "unsupported_event", message: `Unsupported Cowrie event ID: ${rawEventId}.` };
  }

  const occurredAt = new Date(timestampText);
  if (Number.isNaN(occurredAt.getTime())) {
    return { line, code: "invalid_record", message: "Record timestamp is invalid." };
  }

  const eventId = rawEventId as SupportedCowrieEventId;
  const eventType = COWRIE_EVENT_MAPPINGS[eventId];
  const input = asNonBlankString(record.input);
  const isDiscovery = eventType === "discovery" && commandIsDiscoveryLike(input);
  const username = asNonBlankString(record.username)?.slice(0, 120);

  return {
    id: deterministicEventId(rawEventId, line, session),
    rawEventId,
    rawSessionId: session,
    scenarioKey,
    occurredAt,
    sourceIp,
    username,
    target: "controlled-cowrie-lab",
    eventType,
    command: isDiscovery ? input!.slice(0, 120) : undefined,
    message: isDiscovery
      ? "Controlled-lab discovery-like command normalized from Cowrie telemetry."
      : `Controlled-lab Cowrie event normalized: ${rawEventId}.`,
    metadata: {
      source: "controlled-cowrie-lab",
      raw_event_id: rawEventId,
      raw_session_id: session ? createHash("sha256").update(session).digest("hex").slice(0, 12) : "unavailable",
      redaction: "passwords, tty logs, transfer paths, hashes, and raw record content excluded",
    },
  };
}

/**
 * Imports newline-delimited JSON that was exported from the approved local lab.
 * It deliberately accepts no remote URL and never writes raw input to storage.
 */
export function importControlledCowrieJson(jsonLines: string, scenarioKey = "controlled-cowrie-fixture"): CowrieImportResult {
  const imported: NormalizedCowrieEvent[] = [];
  const rejected: CowrieImportIssue[] = [];
  const acceptedEventIds = new Set<SupportedCowrieEventId>();

  const lines = jsonLines.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = index + 1;
    if (!rawLine.trim()) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawLine);
    } catch {
      rejected.push({ line, code: "malformed_json", message: "Line is not valid JSON and was not imported." });
      continue;
    }
    if (!isRecord(parsed)) {
      rejected.push({ line, code: "invalid_record", message: "JSON line must contain an object record." });
      continue;
    }
    const normalized = normalizeRecord(parsed, line, scenarioKey);
    if ("code" in normalized) {
      rejected.push(normalized);
      continue;
    }
    imported.push(normalized);
    acceptedEventIds.add(normalized.rawEventId as SupportedCowrieEventId);
  }

  return { imported, rejected, acceptedEventIds: Array.from(acceptedEventIds).sort() };
}

/** A random request ID can be used by a caller to correlate only an import report. */
export function createCowrieImportRequestId(): string {
  return randomUUID();
}
