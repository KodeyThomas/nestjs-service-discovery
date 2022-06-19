import { DynamicModule } from '@nestjs/common';

import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { DiscoveryModule } from '@service-discovery/discovery';

export class ServiceAModule {
  static configure(configuration: { port: number }): DynamicModule {
    return {
      module: ServiceAModule,
      imports: [
        DiscoveryModule.forRootAsync({
          service: {
            name: 'Service A',
            port: configuration.port,
            protocol: 'tcp',
          },
          registry: {
            port: 1337,
          },
          pollingInterval: 5000,
          initialDelay: 1000,
          register: true,
          verbose: false,
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    };
  }
}
