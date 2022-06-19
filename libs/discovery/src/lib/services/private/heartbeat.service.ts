// NestJS Imports
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Constants } from '@service-discovery/constants';
import { DiscoveryConfiguration } from '@service-discovery/types';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HeartbeatService implements OnModuleInit {
  constructor(
    @Inject(Constants.CONFIGURATION)
    private configuration: DiscoveryConfiguration,
    @Inject(Constants.REGISTRY) private registry: ClientProxy,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  private readonly logger = new Logger(HeartbeatService.name);
  private heartbeatOne = false;

  public add() {
    this.heartbeatOne = true;
  }

  onModuleInit() {
    const callback = async () => {
      try {
        if (this.heartbeatOne) {
          if (this.configuration.verbose) {
            this.logger.log('Sending Heartbeat-2 To Registry');
          }

          const heartbeat = this.registry.send(
            Constants.HEARTBEAT_2,
            this.configuration.service
          );
          const heartbeatResolved = await lastValueFrom(heartbeat);
          if (heartbeatResolved.message === 'boop') {
            if (this.configuration.verbose) {
              this.logger.log('Heartbeat-2 Success, Service marked as HEALTHY');
            }
          }
        }
      } catch (error) {
        this.logger.error('Heartbeat-2 Failed: Unable to connect to Registry');
      }
    };

    const interval = setInterval(callback, 5000);
    this.schedulerRegistry.addInterval(Constants.HEARTBEAT_2, interval);
  }
}
