// NestJS Imports
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { ServiceAModule } from './app/modules/service-a.module';

async function bootstrap() {
  const port = Math.floor(Math.random() * (9999 - 1000) + 1000); // random port

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ServiceAModule.configure({
      port: port,
    }),
    {
      transport: Transport.TCP,
      options: {
        port: port,
      },
    }
  );

  await app.listen();
}

bootstrap();
