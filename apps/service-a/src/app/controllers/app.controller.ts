import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);

  @MessagePattern('ping')
  hello() {
    this.logger.debug('Received Ping');
    return { message: 'pong' };
  }
}
