import { describe, expect, it } from "vitest";
import { assessReadiness } from "./readiness";

describe("assessReadiness", () => {
  it("allows local development without a configured database", () => {
    expect(
      assessReadiness({
        isProduction: false,
        databaseConfigured: false,
        databaseReachable: false,
      })
    ).toEqual({
      ready: true,
      statusCode: 200,
      dependencies: { database: "not_configured" },
    });
  });

  it("fails production readiness when persistence is absent or unavailable", () => {
    expect(
      assessReadiness({
        isProduction: true,
        databaseConfigured: false,
        databaseReachable: false,
      })
    ).toEqual({
      ready: false,
      statusCode: 503,
      dependencies: { database: "not_configured" },
    });
    expect(
      assessReadiness({
        isProduction: true,
        databaseConfigured: true,
        databaseReachable: false,
      })
    ).toEqual({
      ready: false,
      statusCode: 503,
      dependencies: { database: "unavailable" },
    });
  });

  it("reports ready when the configured database responds", () => {
    expect(
      assessReadiness({
        isProduction: true,
        databaseConfigured: true,
        databaseReachable: true,
      })
    ).toEqual({
      ready: true,
      statusCode: 200,
      dependencies: { database: "ready" },
    });
  });
});
