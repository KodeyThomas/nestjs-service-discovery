export enum Constants {
  CONFIGURATION = 'CONFIGURATION',
  POLLING_JOB = 'POLLING_JOB',
  REGISTRY = 'REGISTRY',
  POLL_REGISTRY = 'POLL_REGISTRY',
  REGISTER_CLIENT = 'REGISTER_CLIENT',
  HEARTBEAT_1 = 'HEARTBEAT_1',
  HEARTBEAT_2 = 'HEARTBEAT_2',
  REMOVAL_JOB = 'REMOVAL_JOB',
}

/**
 * Service States.
 *
 * If expanding on this ENUM, make sure you list the states in priority order. i.e HEALTHY first.
 */
export enum ServiceStates {
  HEALTHY,
  REGISTERING,
  UNHEALTHY,
  CRITICAL,
  DEREGISTERING,
}
