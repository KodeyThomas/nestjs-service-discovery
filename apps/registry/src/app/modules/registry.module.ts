import { Module } from '@nestjs/common';
import { RegisterClientController } from '../controllers/register-client.controller';

import { PollController } from '../controllers/poll.controller';
import { ClientsService } from '../services/clients.service';
import { HeartBeatService } from '../services/heartbeat.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HeartbeatController } from '../controllers/heartbeat.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [HeartbeatController, PollController, RegisterClientController],
  providers: [ClientsService, HeartBeatService],
})
export class RegistryModule {}
