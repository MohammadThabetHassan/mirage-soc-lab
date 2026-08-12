export type ReadinessInput = {
  isProduction: boolean;
  databaseConfigured: boolean;
  databaseReachable: boolean;
};

export type ReadinessAssessment = {
  ready: boolean;
  statusCode: 200 | 503;
  dependencies: { database: "not_configured" | "unavailable" | "ready" };
};

/**
 * Local development can use synthetic in-memory views without persistence.
 * Production configuration validation requires a database; readiness additionally
 * proves that the configured dependency is responding before traffic is served.
 */
export function assessReadiness(input: ReadinessInput): ReadinessAssessment {
  const database = !input.databaseConfigured
    ? "not_configured"
    : input.databaseReachable
      ? "ready"
      : "unavailable";
  const ready = input.isProduction
    ? database === "ready"
    : database !== "unavailable";

  return {
    ready,
    statusCode: ready ? 200 : 503,
    dependencies: { database },
  };
}
