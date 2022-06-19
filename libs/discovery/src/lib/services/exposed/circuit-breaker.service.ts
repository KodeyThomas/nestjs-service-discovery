// NestJS Imports
import { Inject, Injectable } from '@nestjs/common';

// Services
import { PrivateServiceList } from '../private/service-list.service';

// Utils
import { Constants, ServiceStates } from '@service-discovery/constants';

// Errors
import { ServiceNotInRegistryError } from '../../errors/ServiceNotInRegistry.error';
import { ServiceNotInAllowedStateError } from '../../errors/ServiceNotInAllowedState.error';

// Types
import {
  CircuitBreakerSendOptions,
  DiscoveryConfiguration,
  ServiceArray,
} from '@service-discovery/types';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ServiceTimeoutError } from '../../errors/ServiceTimeout.error';

@Injectable()
export class CircuitBreakerService {
  constructor(
    @Inject(Constants.CONFIGURATION)
    private configuration: DiscoveryConfiguration,
    private readonly privateServiceList: PrivateServiceList
  ) {}

  public getServices(): Array<ServiceArray> {
    return this.privateServiceList.services;
  }

  private doesServiceExist(serviceName): ServiceArray {
    const service = this.privateServiceList.services.find(
      (service) => service.name === serviceName
    );
    if (!service) {
      throw new ServiceNotInRegistryError(
        `${serviceName} is not in the registry`
      );
    }

    return service;
  }

  private isServiceInAllowedState(service): void {
    if (
      !this.configuration.circuitBreaker.allowedStates.includes(
        service.state.toUpperCase()
      )
    ) {
      throw new ServiceNotInAllowedStateError(
        `${service.name} is not in an allowed state`
      );
    }
  }

  private configureTimeout(options, service): number {
    let timeout = this.configuration.circuitBreaker.timeout ?? 10000; // 10 seconds

    if (
      Object.prototype.hasOwnProperty.call(
        this.configuration.circuitBreaker,
        'options'
      )
    ) {
      timeout =
        this.configuration.circuitBreaker?.options[service.state.toLowerCase()]
          .timeout ?? timeout; // Individual State Timeout
    }
    timeout = options?.timeout ?? timeout; // Override Timeout configuration

    return timeout;
  }

  private loadBalancer(serviceName: string): ServiceArray {
    const services = this.getServices().filter(
      (service) => service.name === serviceName
    ); // Get all valid Services
    const states = Object.values(ServiceStates).filter(
      (state) => typeof state === 'string'
    ); // Remove numbers from Enum

    for (const state of states) {
      // States are listed in priority order, so just iterate through them until we find a service
      const stateServices = services.filter(
        (service) => service.state === state
      );

      if (stateServices.length > 0) {
        // Should roughly distribute the load evenly, but not perfectly. This is a good enough approximation.

        // We ideally don't want to send any messages to services that are REGISTERING, UNHEALTHY or below.
        // This is because they are not yet ready to receive messages.
        //
        // This approach works because if there are multiple services, lets say 1 HEALTHY and 1 REGISTERING.
        // Traffic will only go to the HEALTHY service. Until the REGISTERING service is HEALTHY.
        // Once the REGISTERING service is HEALTHY. Traffic will be roughly distributed evenly between the two.

        const random = Math.floor(Math.random() * stateServices.length); // Actual Load Balancing Logic...
        return stateServices[random];
      }
    }
  }

  public async send(
    serviceName: string,
    message: string,
    data: unknown,
    options: CircuitBreakerSendOptions = null
  ): Promise<unknown> {
    // Check if service exists within the local registry
    this.doesServiceExist(serviceName);

    // Calculate which service we should send the request to using the load balancer algorithm
    const service = this.loadBalancer(serviceName);

    // Configure Timeout
    const timeout = this.configureTimeout(options, service);
    const bypassTimeout = options?.bypassTimeout ?? false; // Bypass Timeout configuration

    // Check if service is in the allowed states
    const bypassAllowedStates = options?.bypassAllowedStates ?? false; // Bypass Allowed States
    if (!bypassAllowedStates) {
      this.isServiceInAllowedState(service);
    }

    // Create Client Proxy to send message
    const raceConditional = await Promise.race([
      // Whichever Promise resolves first will be resolved
      new Promise((resolve) => {
        const clientProxy: ClientProxy = ClientProxyFactory.create({
          transport: Transport[service.protocol.toUpperCase()],
          options: {
            port: service.port,
          },
        });

        const sendToService = clientProxy.send(message, data);
        const sendToServiceResolved = lastValueFrom(sendToService);
        resolve(sendToServiceResolved);
      }),
      new Promise((resolve) => {
        if (bypassTimeout) {
          setTimeout(() => {
            resolve(null);
          }, Number.MAX_VALUE); // Timeout will 'never' resolve.
        } else {
          setTimeout(() => {
            resolve(new ServiceTimeoutError(`${serviceName} timed out`));
          }, timeout); // Use Timeout configured
        }
      }),
    ]);

    if (raceConditional instanceof ServiceTimeoutError) {
      throw new ServiceTimeoutError(`${serviceName} timed out`);
    }

    return raceConditional;
  }
}
