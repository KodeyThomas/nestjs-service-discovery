// NestJS Imports
import { Injectable } from '@nestjs/common';

// NX Project Imports
import { CircuitBreakerService } from '@service-discovery/discovery';

@Injectable()
export class ServiceA {
  constructor(private circuitBreaker: CircuitBreakerService) {}
  private readonly SERVICE_NAME = 'Service A';

  async ping(): Promise<unknown> {
    try {
      return await this.circuitBreaker.send(this.SERVICE_NAME, 'ping', {});
    } catch (error) {
      return { error: error.message };
    }
  }
}
