import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Constants } from '@service-discovery/constants';
import { ServiceArray } from '@service-discovery/types';
import { lastValueFrom } from 'rxjs';
import { ClientsService } from './clients.service';

@Injectable()
export class HeartBeatService implements OnModuleInit {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private clientsService: ClientsService
  ) {}

  public async sendHeartbeat(data: ServiceArray) {
    try {
      const service: ClientProxy = ClientProxyFactory.create({
        transport: Transport[data.protocol.toUpperCase()],
        options: {
          port: data.port,
        },
      });

      const sendToService = service.send(Constants.HEARTBEAT_1, {
        message: 'beep',
      });
      const sendToServiceResolved = await lastValueFrom(sendToService);

      if (sendToServiceResolved.message === 'boop') {
        this.clientsService.updateHeartbeat(data, {
          heartbeatOne: {
            success: true,
          },
        });
      }
    } catch (error) {
      this.clientsService.failedHeartbeatOne(data);
    }
  }

  async onModuleInit() {
    const heartbeatOne = async () => {
      this.clientsService.services.forEach(
        async (service) => await this.sendHeartbeat(service)
      );
    };

    const interval = setInterval(await heartbeatOne, 5000);
    this.schedulerRegistry.addInterval(Constants.HEARTBEAT_1, interval);
  }
}
