# Project TODO

- [x] Define documented, local-only telemetry models for raw events, detections, cases, case notes, ATT&CK mappings, and evaluation scenarios.
- [x] Implement a synthetic event generator covering SSH brute-force attempts, success-after-failure, decoy engagement, and discovery-sequence behavior.
- [x] Implement deterministic correlation rules for repeated authentication failures, success-after-failure, and multi-stage sequences.
- [x] Persist generated telemetry, detections, cases, analyst dispositions, and notes through the database-backed tRPC API.
- [x] Build a dark neon cyberpunk Live SOC Dashboard with a case queue, severity badges, case overview, and live event feed.
- [x] Build an explainable Case View with evidence timeline, triggered rule conditions, transparent risk-score breakdown, and ATT&CK context.
- [x] Add analyst case management for Benign, Suspicious, and Confirmed Lab Event dispositions plus free-text notes.
- [x] Build an ATT&CK Technique Mapping panel with technique ID, tactic, rationale, caveats, and reference link per rule.
- [x] Build an Evaluation Metrics page showing detection coverage, alert precision, false-positive rate, and average time-to-detect for defined lab scenarios.
- [x] Build a Demo Scenario Runner that replays the pre-built brute-force, decoy-interaction, and discovery story end-to-end.
- [x] Add deterministic Vitest coverage for the detection engine, risk scoring, ATT&CK mappings, and evaluation metrics.
- [x] Add project documentation, security boundaries, and reproducible local setup instructions.
- [ ] Visually verify the primary flows on desktop and mobile, run type checks and tests, then save a verified checkpoint.
- [ ] Create a private GitHub repository, commit the verified project with the configured identity, and invite AbdulrahmanRezki as a collaborator after repository access is enabled.
- [x] Add explicit Vitest coverage for ATT&CK mapping metadata and risk-score breakdowns across all detection paths.
- [x] Expand the README with exact setup, database migration, authentication, scenario replay, and expected evaluation steps.
- [x] Clarify platform-provided versus self-hosted authentication environment requirements and the local sign-in workflow in the README.
