import { DiscoveryConfiguration } from "@service-discovery/types";

export const defaultConfiguration: DiscoveryConfiguration = {
  service: {
	name: '',
	port: 3000,
	protocol: 'tcp',
  },
  registry: {
	host: 'localhost',
	port: 3000,
  },
  circuitBreaker: {
	allowedStates: ['HEALTHY'],
	options: {
		healthy: {
			retry: {
				retries: 0,
				backoff: {
					type: 'exponential',
					delay: 1000,
				},
			},
			timeout: 1000,
		},
	},
	timeout: 1000,
  },
  pollingInterval: 10000,
  register: false,
  verbose: false,
  initialDelay: 2000,
};