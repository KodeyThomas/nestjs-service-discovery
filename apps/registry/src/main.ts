// NestJS Imports
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { RegistryModule } from './app/modules/registry.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(RegistryModule, {
    transport: Transport.TCP,
    options: {
      port: 1337,
    },
  });

  await app.listen();
}

bootstrap();
