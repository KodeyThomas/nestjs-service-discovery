// NestJS Imports
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

// Utils
import { Constants } from '@service-discovery/constants';

// Services
import { ClientsService } from '../services/clients.service';

// Types
import { ServiceArray } from '@service-discovery/types';

@Controller()
export class PollController {
  constructor(private readonly clientsService: ClientsService) {}

  @MessagePattern(Constants.POLL_REGISTRY)
  getData(): Array<ServiceArray> | null {
    return this.clientsService.services;
  }
}
