## Summary

Describe the user-facing or engineering outcome in one concise paragraph.

## Scope and safety

Explain how this change remains consistent with MIRAGE’s controlled, defensive SOC-lab boundary. Confirm that it does not add third-party targeting, credential testing, public honeypot exposure, or destructive behavior.

## Verification evidence

| Check                             | Result |
| --------------------------------- | ------ |
| Formatting                        |        |
| Unit and integration tests        |        |
| Type check                        |        |
| Production build                  |        |
| Browser smoke tests               |        |
| Dependency audit                  |        |
| Database migration, if applicable |        |

## Review checklist

- [ ] Inputs are validated and payloads are bounded.
- [ ] Authorization behavior is explicit and covered by an allowed/denied test where applicable.
- [ ] Sensitive data is not written to logs, test fixtures, screenshots, or documentation.
- [ ] Detection changes include deterministic regression scenarios and explainable evidence.
- [ ] Persistence changes include a reviewed migration and compensating-migration or rollback notes.
- [ ] Documentation, architecture notes, changelog, and assurance matrix are updated where behavior changes.
- [ ] No generated artifacts, secrets, or unrelated changes are included.
