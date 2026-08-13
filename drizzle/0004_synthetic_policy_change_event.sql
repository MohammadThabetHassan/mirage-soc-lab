ALTER TABLE `soc_events`
  MODIFY COLUMN `eventType` enum(
    'auth_failure',
    'auth_success',
    'decoy_interaction',
    'discovery',
    'policy_change'
  ) NOT NULL;
