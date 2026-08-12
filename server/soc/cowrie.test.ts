import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { importControlledCowrieJson } from "./cowrie";

describe("controlled Cowrie telemetry adapter", () => {
  const fixture = readFileSync(
    resolve(import.meta.dirname, "fixtures/controlled-cowrie.ndjson"),
    "utf8"
  );

  it("imports the redacted fixture deterministically and maps at least five Cowrie event IDs", () => {
    const first = importControlledCowrieJson(fixture);
    const second = importControlledCowrieJson(fixture);

    expect(first.imported).toHaveLength(6);
    expect(first.acceptedEventIds).toHaveLength(6);
    expect(first.imported.map(event => event.id)).toEqual(
      second.imported.map(event => event.id)
    );
    expect(first.imported.map(event => event.eventType)).toEqual([
      "decoy_interaction",
      "auth_failure",
      "auth_success",
      "discovery",
      "discovery",
      "discovery",
    ]);
  });

  it("reports unsupported events safely without retaining their raw body", () => {
    const result = importControlledCowrieJson(fixture);
    expect(result.rejected).toContainEqual(
      expect.objectContaining({
        line: 7,
        code: "unsupported_event",
        message: "Unsupported Cowrie event ID: cowrie.log.closed.",
      })
    );
    expect(JSON.stringify(result)).not.toContain("REDACTED-NOT-STORED");
  });

  it("rejects malformed, public-source, and invalid records", () => {
    const result = importControlledCowrieJson(
      [
        "not json",
        JSON.stringify({
          eventid: "cowrie.login.failed",
          timestamp: "not-a-date",
          src_ip: "198.51.100.77",
        }),
        JSON.stringify({
          eventid: "cowrie.login.failed",
          timestamp: "2026-08-12T09:00:00Z",
          src_ip: "8.8.8.8",
        }),
      ].join("\n")
    );

    expect(result.imported).toHaveLength(0);
    expect(result.rejected.map(item => item.code)).toEqual([
      "malformed_json",
      "invalid_record",
      "invalid_record",
    ]);
  });
});
