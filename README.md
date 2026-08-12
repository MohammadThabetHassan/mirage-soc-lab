# MIRAGE — Explainable Deception-Driven SOC Lab

MIRAGE is a **local-first Security Operations Center simulation and evaluation platform**. It generates safe, synthetic telemetry, applies deterministic correlation rules, stores explainable cases, and gives analysts a dark cyberpunk workspace for triage and evaluation.

## Defensive Scope

MIRAGE is built for synthetic data, controlled labs, and explicitly authorized environments. It does not scan systems, test credentials, or interact with third-party infrastructure. The included scenarios only model synthetic SSH authentication, decoy engagement, and discovery-like event records.

## Included Pipeline

1. **Synthetic generator:** creates three controlled scenario definitions.
2. **Correlation engine:** detects repeated failures, success-after-failure, and a multi-stage decoy/discovery sequence.
3. **Case management:** stores case evidence, transparent scoring factors, analyst dispositions, and notes.
4. **ATT&CK context:** links every detection rule to a technique, tactic, rationale, caveat, and reference URL.
5. **Evaluation:** executes the same deterministic scenario definitions and reports coverage, alert precision, false-positive rate, and average time-to-detect.

## Local Development

MIRAGE needs Node.js 22+, pnpm, and a MySQL-compatible database. **When running in the managed Manus project**, the platform injects `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, and `VITE_OAUTH_PORTAL_URL`; do not create or commit a `.env` file for those values. The platform’s existing OAuth flow provides the dashboard sign-in experience.

**When self-hosting a clone**, create a private, uncommitted `.env` file and supply your own values for `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, and `VITE_OAUTH_PORTAL_URL`. These values must belong to your own compatible OAuth deployment and database; platform-provided values cannot be copied to another environment. There is intentionally no email/password fallback because analyst dispositions and notes require an authenticated user. Do not reuse production credentials for development.

```bash
pnpm install
pnpm db:push
pnpm dev
```

The `db:push` script generates and applies the Drizzle migrations. Open the local development URL, select **Sign in to continue**, and complete the OAuth flow configured by the environment above. After the redirect returns to the application, select **Live SOC**. The dashboard is intentionally authenticated because it stores analyst dispositions and notes.

## Demonstration Flow

Choose **Full pipeline story** in the scenario selector and select **Run demo scenario**. This deterministic replay produces SSH authentication failures, a subsequent synthetic success, decoy engagement, and two discovery-like events. The pipeline should create three cases: repeated authentication failures, success-after-failure, and multi-stage decoy engagement and discovery.

Open any case in the queue to inspect the evidence timeline, explicit rule-linked factors behind the risk score, and ATT&CK context. Enter a note, choose an analyst disposition, and confirm that the note is retained in the case view. Then open **Evaluation** to view the metrics calculated from the same documented scenario definitions. The benign-admin scenario should produce no cases.

## Verification

Run `pnpm test` for correlation-engine, risk-breakdown, ATT&CK-mapping, and application tests. Run `pnpm check` for TypeScript validation and `pnpm build` before releasing a new revision. The scenario definitions are deterministic so the evaluation metrics are reproducible.

## Controlled Cowrie telemetry adapter

MIRAGE can normalize **recorded, local-lab Cowrie JSON-lines telemetry** through the protected `soc.importControlledCowrie` operation. The adapter is intentionally not a network collector: it accepts a bounded payload from an authenticated analyst workflow and never needs a publicly exposed honeypot.

| Control | Implementation |
|---|---|
| Approved source boundary | Only private RFC1918, loopback, and documentation-net source IPs are accepted. |
| Event allowlist | `cowrie.session.connect`, `cowrie.login.failed`, `cowrie.login.success`, `cowrie.command.input`, `cowrie.command.success`, and `cowrie.direct-tcpip.request` are normalized. |
| Traceability | The normalized metadata preserves the Cowrie `eventid` plus a one-way session reference. |
| Redaction rule | Passwords, tty logs, file-transfer paths/content, file hashes, and raw JSON records are never persisted or returned. |
| Safe failure | Malformed, public-source, and unsupported records are rejected with line-numbered diagnostics that omit raw content. |

The fixture corpus at `server/soc/fixtures/controlled-cowrie.ndjson` is deterministic and deliberately redacted. Run `pnpm vitest run server/soc/cowrie.test.ts` to validate the mappings, rejection path, and redaction policy.

For a contained Docker demonstration, merge `docker-compose.cowrie-lab.yml` into the environment-specific MIRAGE Compose configuration and start the `cowrie-lab` profile. Its network is marked `internal: true` and publishes no Cowrie port. Supply a local authenticated import endpoint and token through `MIRAGE_IMPORT_URL` and `MIRAGE_IMPORT_TOKEN`; no public listener is part of this profile.

## ATT&CK References

- [T1110 — Brute Force](https://attack.mitre.org/techniques/T1110/)
- [T1078 — Valid Accounts](https://attack.mitre.org/techniques/T1078/)
- [T1087 — Account Discovery](https://attack.mitre.org/techniques/T1087/)
