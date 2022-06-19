import { Module } from '@nestjs/common';

import { DiscoveryModule } from '@service-discovery/discovery';

@Module({
  imports: [
    DiscoveryModule.forRootAsync({
      service: {
        name: 'Service B',
        port: 3892,
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
  controllers: [],
  providers: [],
})
export class AppModule {}
