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
export class RegisterClientController {
  constructor(private readonly clientsService: ClientsService) {}
  private logger = new Logger(RegisterClientController.name);

  @MessagePattern(Constants.REGISTER_CLIENT)
  async registerClient(@Payload() data: Service): Promise<{ message: string }> {
    this.clientsService.registerInitial(data);
    return { message: 'boop' };
  }
}
