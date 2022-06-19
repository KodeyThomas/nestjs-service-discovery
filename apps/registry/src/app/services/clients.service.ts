import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Constants } from '@service-discovery/constants';
import { ServiceArray } from '@service-discovery/types';

@Injectable()
export class ClientsService implements OnModuleInit {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  private readonly logger = new Logger(ClientsService.name);
  private _services: Array<ServiceArray> = [];

  public get services(): Array<ServiceArray> {
    return this._services;
  }

  public registerInitial(data): void {
    const index = this._services.findIndex(
      (service) => service.name === data.name && service.port === data.port
    );
    if (index != -1) {
      this._services.splice(index, 1);
    }

    this._services.push({
      name: data.name,
      port: data.port,
      protocol: data.protocol,
      state: 'REGISTERING',
      heartbeat: {
        heartbeatOne: {
          success: null,
        },
        heartbeatTwo: {
          success: null,
        },
        lastHeartbeat: null,
      },
    });
  }

  public updateState(data, state): void {
    const index = this._services.findIndex(
      (service) => service.name === data.name && service.port === data.port
    );
    if (index != -1) {
      this._services[index].state = state;
    }
  }

  public updateHeartbeat(data, heartbeat): ServiceArray {
    const index = this._services.findIndex(
      (service) => service.name === data.name && service.port === data.port
    );
    if (index != -1) {
      this._services[index].heartbeat = {
        ...this._services[index].heartbeat,
        ...heartbeat,
      };
    }

    return this._services[index];
  }

  public failedHeartbeatOne(data): void {
    const index = this._services.findIndex(
      (service) => service.name === data.name && service.port === data.port
    );
    if (index != -1) {
      this._services[index].heartbeat.heartbeatOne.success = false;

      switch (this._services[index].state) {
        case 'REGISTERING':
        case 'HEALTHY':
          this.logger.warn(
            `${data.name} is now in a degraded state and marked UNHEALTHY`
          );
          this._services[index].state = 'UNHEALTHY';
          break;
        case 'UNHEALTHY':
          this.logger.warn(
            `${data.name} is still in a degraded state and marked CRITICAL`
          );
          this._services[index].state = 'CRITICAL';
          break;
        case 'CRITICAL':
          this.logger.error(
            `${data.name} is still in a degraded state awaiting a Heartbeat-2 to mark as HEALTHY`
          );
          break;
        default:
          break;
      }
    }
  }

  public markAsHealthy(data): void {
    const index = this._services.findIndex(
      (service) => service.name === data.name && service.port === data.port
    );
    if (index != -1) {
      if (this._services[index].heartbeat.heartbeatOne.success) {
        if (this._services[index].state != 'HEALTHY') {
          this.logger.log(
            `${data.name} is now in a healthy state and marked HEALTHY`
          );
        }

        this._services[index].state = 'HEALTHY';
        this.updateHeartbeat(data, {
          heartbeatTwo: {
            success: true,
          },
          lastHeartbeat: new Date().getTime(),
        });
      } else {
        this.logger.log(
          `Awaiting Heartbeat-1 from ${data.name} before marking as HEALTHY`
        );
        this.updateHeartbeat(data, {
          heartbeatOne: {
            success: true,
          },
        });
      }
    }
  }

  onModuleInit() {
    const removeServices = () => {
      // Remove DEREGISTERING services
      const deregisteredServices = this._services.filter(
        (service) => service.state === 'DEREGISTERING'
      );
      deregisteredServices.forEach((deregService) => {
        const index = this._services.findIndex(
          (service) =>
            service.name === deregService.name &&
            service.port === deregService.port
        );
        if (index != -1) {
          this._services.splice(index, 1);
          this.logger.error(`Removed Service ${deregService.name}`);
        }
      });

      // Mark CRITICAL Services as DEREGISTERING
      const criticalServices = this._services.filter(
        (service) => service.state === 'CRITICAL'
      );
      criticalServices.forEach((criticalService) => {
        const index = this._services.findIndex(
          (service) =>
            service.name === criticalService.name &&
            service.port === criticalService.port
        );
        if (index != -1) {
          this._services[index].state = 'DEREGISTERING';
        }
      });
    };

    const interval = setInterval(removeServices, 5000);
    this.schedulerRegistry.addInterval(Constants.REMOVAL_JOB, interval);
  }
}
