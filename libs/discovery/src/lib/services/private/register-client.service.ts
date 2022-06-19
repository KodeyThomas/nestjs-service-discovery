// NestJS Imports
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

// NPM Packages
import { lastValueFrom } from 'rxjs';

// Utils
import { Constants } from '@service-discovery/constants';

// Types
import {
  DiscoveryConfiguration,
  Service,
} from '@service-discovery/types';

@Injectable()
export class RegisterClientService implements OnModuleInit {
  constructor(
    @Inject(Constants.REGISTRY) private registry: ClientProxy,
    @Inject(Constants.CONFIGURATION)
    private configuration: DiscoveryConfiguration
  ) {}

  private logger = new Logger(RegisterClientService.name);
  private delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  private async registerClient() {
    // Register the client with the registry
    try {
      this.delay(this.configuration.initialDelay);

      const data: Service = {
        name: this.configuration.service.name,
        port: ~~this.configuration.service.port, // Convert String to Number in case it's a string
        protocol: this.configuration.service.protocol,
      };
      const registerClient = this.registry.send(
        Constants.REGISTER_CLIENT,
        data
      );
      const registerClientResolved = await lastValueFrom(registerClient);

      if (registerClientResolved.message === 'boop') {
        if (this.configuration.verbose) {
          this.logger.log('Registry Acknowledged Client');
        }
      }
    } catch (error) {
      this.logger.error('Error Registering Client with Registry');
    }
  }

  onModuleInit() {
    // Register the client with the registry
    if (this.configuration.register) {
      this.registerClient();
    }
  }
}
