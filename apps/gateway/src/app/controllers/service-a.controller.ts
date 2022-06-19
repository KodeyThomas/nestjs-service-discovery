// NestJS Imports
import { Controller, Get } from '@nestjs/common';

// Service Imports
import { ServiceA } from '../services/a.service';

@Controller('service-a')
export class ServiceAController {
  constructor(private readonly serviceA: ServiceA) {}

  @Get('ping')
  ping() {
    return this.serviceA.ping();
  }
}
