/**
 * Service Discovery Module Types
 */

/**
 * Microservice States
 */
type States =
  | 'HEALTHY'
  | 'UNHEALTHY'
  | 'REGISTERING'
  | 'CRITICAL'
  | 'DEREGISTERING';

/**
 * Individual State Options
 */
type IndividualStateOptions = {
  retry?: {
    retries?: number;
    backoff?: {
      type?: 'fixed' | 'exponential';
      delay?: number;
    };
  };
  timeout?: number;
};

type CircuitBreakerStateOptions = {
  healthy?: IndividualStateOptions;
  unhealthy?: IndividualStateOptions;
  registering?: IndividualStateOptions;
  critical?: IndividualStateOptions;
  deregistering?: IndividualStateOptions;
};

export type Registry = {
  /**
   * Registry Hostname / IP Address
   */
  host?: string;
  /**
   * Registry Port Number
   */
  port: number;
};

export type Service = {
  /**
   * Service Name
   */
  name: string;
  /**
   * Service Port Number
   */
  port: unknown;
  /**
   * Protocol the service listens to
   */
  protocol: 'grpc' | 'tcp';
};

export type CircuitBreakerConfiguration = {
  /**
   * States the Microservice can be in for requests to go through
   */
  allowedStates: States[];
  /**
   * State Options
   */
  options: Partial<CircuitBreakerStateOptions>;
  /**
   * Timeout for Requests to be processed. Unless explicitly set for each state or request, this value will be used.
   */
  timeout: number;
};

export type CircuitBreakerSendOptions = {
  /**
   * Timeout for Requests to be processed. When set this option takes precedent over the global timeout.
   */
  timeout?: number;
  /**
   * Retry Logic
   */
  retry?: IndividualStateOptions;
  /**
   * Bypasses any timeout configured
   */
  bypassTimeout?: boolean;
  /**
   * Regardless of the service state, send the request
   */
  bypassAllowedStates?: boolean;
};

export type DiscoveryConfiguration = {
  /**
   * Service Configuration Details
   */
  service: Service;
  /**
   * Registry Information
   */
  registry: Registry;
  /**
   * Circuit Breaker Configuration
   */
  circuitBreaker?: Partial<CircuitBreakerConfiguration>;
  /**
   * How often to Poll the registry in milliseconds
   */
  pollingInterval: number;
  /**
   * Register as a client with the registry
   */
  register: boolean;
  /**
   * Enable Verbose Logging
   */
  verbose?: boolean;
  /**
   * How long to wait before polling the registry for the first time in milliseconds
   */
  initialDelay?: number;
};

export type PollingRequest = {
  /**
   * Name of the microservice polling the registry
   */
  name: string;
};

export type Heartbeat = {
  heartbeatOne: {
    success: boolean;
  };
  heartbeatTwo: {
    success: boolean;
  };
  lastHeartbeat: number;
};

export type ServiceArray = {
  /**
   * Microservice Name
   */
  name: string;
  /**
   * Port Number
   */
  port: number;
  /**
   * Microservice Protocol
   */
  protocol: 'grpc' | 'http' | 'tcp';
  /**
   * Microservice State
   */
  state: States;
  /**
   * Microservice Heartbeat status
   */
  heartbeat: Heartbeat;
};
