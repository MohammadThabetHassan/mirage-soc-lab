import type { EventType, LabEvent } from "./soc";

/**
 * Cowrie records are accepted only when they originate from the documented
 * controlled lab fixture flow. No password, tty log, download, or raw record
 * content is retained by the normalizer.
 */
export const COWRIE_EVENT_MAPPINGS = {
  "cowrie.login.failed": "auth_failure",
  "cowrie.login.success": "auth_success",
  "cowrie.session.connect": "decoy_interaction",
  "cowrie.command.input": "discovery",
  "cowrie.command.success": "discovery",
  "cowrie.direct-tcpip.request": "discovery",
} as const satisfies Record<string, EventType>;

export type SupportedCowrieEventId = keyof typeof COWRIE_EVENT_MAPPINGS;

export type CowrieImportIssue = {
  line: number;
  code: "malformed_json" | "invalid_record" | "unsupported_event";
  /** Safe diagnostic only; it never includes raw record content. */
  message: string;
};

export type CowrieImportResult = {
  imported: LabEvent[];
  rejected: CowrieImportIssue[];
  acceptedEventIds: SupportedCowrieEventId[];
};

export type CowrieRawRecord = {
  eventid?: unknown;
  timestamp?: unknown;
  src_ip?: unknown;
  username?: unknown;
  session?: unknown;
  input?: unknown;
  /** Cowrie-sensitive fields are intentionally not represented in output. */
  password?: unknown;
  ttylog?: unknown;
  shasum?: unknown;
  destfile?: unknown;
  sensor?: unknown;
};

export type NormalizedCowrieEvent = LabEvent & {
  rawEventId: string;
  rawSessionId?: string;
};
