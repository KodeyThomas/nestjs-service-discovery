// NestJS Imports
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';

// NPM Packages
import { lastValueFrom } from 'rxjs';

// Utils
import { Constants } from '@service-discovery/constants';

// Types
import { DiscoveryConfiguration } from '@service-discovery/types';
import { PrivateServiceList } from './service-list.service';
import { RegisterClientService } from './register-client.service';

@Injectable()
export class RegistryService implements OnModuleInit {
  constructor(
    @Inject(Constants.CONFIGURATION)
    private readonly configuration: DiscoveryConfiguration,
    private schedulerRegistry: SchedulerRegistry,
    @Inject(Constants.REGISTRY) private registry: ClientProxy,
    private readonly privateServiceList: PrivateServiceList,
    private readonly registerClientService: RegisterClientService
  ) {}

  private readonly logger = new Logger(RegistryService.name);
  private _registryFailures = 0;
  private _registryFailureDelay = (ms: number) =>
    new Promise((res) => setTimeout(res, ms * this._registryFailures));
  private _initialDelay = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));
  private _firstConnection = true;

  async startPolling() {
    // Start polling the registry for new services
    const callback = async () => {
      try {
        // Only display logs if verbose is enabled
        if (this.configuration.verbose) {
          this.logger.log('Polling registry for new services');
        }

        const services = this.registry.send(Constants.POLL_REGISTRY, {
          name: this.configuration.service.name,
        });
        const servicesResolved = await lastValueFrom(services);

        if (servicesResolved) {
          if (this.configuration.verbose) {
            this.logger.log(`Found ${servicesResolved.length} services`);
          }

          this.privateServiceList.update(servicesResolved);

          if (this._registryFailures !== 0 || this._firstConnection) {
            this.logger.log('Connected to Registry');
            this._registryFailures = 0; // Reset the registry failures
            this._firstConnection = false; // Reset the first connection flag

            if (this.configuration.register) {
              this.registerClientService.onModuleInit(); // Register client again with the registry.
            }
          }
        }
      } catch (e) {
        if (this._registryFailures < 4) {
          this.logger.error('Failed to connect to registry. Retrying...');
          this._registryFailures++;
          await this._registryFailureDelay(5000);
        } else {
          this.logger.error(
            'No Registry connection available. Bravo Six, Going Dark...'
          );
          await this._registryFailureDelay(10000);
          this._registryFailures = 0; // Waited 40s, reset the registry failures
        }
      }
    };

    this._initialDelay(this.configuration.initialDelay);
    await callback(); // Run the service after the initial delay

    // Using the schedule module, schedule the callback to run on a regular interval defined by the user
    const interval = setInterval(
      await callback,
      this.configuration.pollingInterval
    );
    this.schedulerRegistry.addInterval(Constants.POLLING_JOB, interval);

    if (this.configuration.verbose) {
      this.logger.log('Polling Started');
    }
  }

  /**
   * Once the Module has initialized, start polling the registry for services
   */
  onModuleInit() {
    this.startPolling();
  }
}
