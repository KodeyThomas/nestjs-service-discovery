// NestJS Imports
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

// Utils
import { Constants } from '@service-discovery/constants';

// Services
import { ClientsService } from '../services/clients.service';

// Types
import { Service } from '@service-discovery/types';

@Controller()
export class HeartbeatController {
  constructor(private readonly clientsService: ClientsService) {}
  private logger = new Logger(HeartbeatController.name);

  @MessagePattern(Constants.HEARTBEAT_2)
  async registerClient(@Payload() data: Service): Promise<{ message: string }> {
    this.clientsService.markAsHealthy(data);
    return { message: 'boop' };
  }
}
