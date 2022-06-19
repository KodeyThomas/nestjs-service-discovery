// NestJS Imports
import { Module } from '@nestjs/common';

// NX Project Imports
import { DiscoveryModule } from '@service-discovery/discovery';

// Controllers
import { ServiceAController } from '../controllers/service-a.controller';
import { HealthCheckController } from '../controllers/healthcheck.controller';

// Services
import { ServiceA } from '../services/a.service';

@Module({
  imports: [
    DiscoveryModule.forRootAsync({
      service: {
        name: 'Gateway',
        port: process.env.PORT || 3333,
        protocol: 'tcp',
      },
      registry: {
        port: 1337,
      },
      circuitBreaker: {
        allowedStates: ['HEALTHY', 'UNHEALTHY'],
        timeout: 10000,
      },
      pollingInterval: 5000,
      initialDelay: 1000,
      register: false,
      verbose: false,
    }),
  ],
  controllers: [ServiceAController, HealthCheckController],
  providers: [ServiceA],
})
export class AppModule {}
