// NestJS Imports
import { Controller, Get } from '@nestjs/common';

// NX Project Imports
import { CircuitBreakerService } from '@service-discovery/discovery';


@Controller('healthcheck')
export class HealthCheckController {
  constructor(private readonly circuitBreaker: CircuitBreakerService) {}

  @Get()
  ping() {
	return this.circuitBreaker.getServices();
  }
}
