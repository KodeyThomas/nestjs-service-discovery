// NestJS Imports
import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

// Utils
import { Constants } from '@service-discovery/constants';
import { DiscoveryConfiguration } from '@service-discovery/types';
import { HeartbeatService } from '../services/private/heartbeat.service';

@Controller()
export class HeartBeatController {
  constructor(
    @Inject(Constants.CONFIGURATION)
    private configuration: DiscoveryConfiguration,
    private readonly heartbeatService: HeartbeatService
  ) {}

  private logger = new Logger(HeartBeatController.name);

  @MessagePattern(Constants.HEARTBEAT_1)
  receiveHeartbeat(@Payload() data: { message: string }) {
    if (this.configuration.verbose) {
      this.logger.log(`Received Heartbeat-1 from registry`);
    }

    if (data.message === 'beep') {
      this.heartbeatService.add();
      return { message: 'boop' };
    }
  }
}
