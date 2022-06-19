// NestJS Imports
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

// Module Imports
import { AppModule } from './app/modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}`,
  );
}

bootstrap();
