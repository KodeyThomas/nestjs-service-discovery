// NestJS Imports
import { DynamicModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

// Controllers
import { HeartBeatController } from '../controllers/heartbeat.controller';

// Private Services
import { PrivateServiceList } from '../services/private/service-list.service';
import { RegistryService } from '../services/private/registry.service';
import { RegisterClientService } from '../services/private/register-client.service';
import { HeartbeatService } from '../services/private/heartbeat.service';

// Exposed Services
import { CircuitBreakerService } from '../services/exposed/circuit-breaker.service';

// Utils
import { Constants } from '@service-discovery/constants';
import { defaultConfiguration } from '../config/default';

// Types
import { DiscoveryConfiguration } from '@service-discovery/types';

export class DiscoveryModule {
  static async forRootAsync(
    configuration: Partial<DiscoveryConfiguration>
  ): Promise<DynamicModule> {
    configuration = { ...defaultConfiguration, ...configuration };

    return {
      global: true,
      module: DiscoveryModule,
      imports: [ScheduleModule.forRoot()],
      controllers: [HeartBeatController],
      providers: [
        PrivateServiceList,
        RegistryService,
        RegisterClientService,
        HeartbeatService,
        CircuitBreakerService,
        {
          provide: Constants.CONFIGURATION,
          useValue: configuration,
        },
        {
          provide: Constants.REGISTRY,
          useFactory: () =>
            ClientProxyFactory.create({
              transport: Transport.TCP,
              options: {
                host: configuration.registry.host ?? undefined,
                port: configuration.registry.port,
              },
            }),
        },
      ],
      exports: [CircuitBreakerService],
    };
  }
}
