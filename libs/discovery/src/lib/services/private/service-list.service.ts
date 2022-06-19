// NestJS Imports
import { Injectable } from '@nestjs/common';

// Types
import { ServiceArray } from '@service-discovery/types';

@Injectable()
export class PrivateServiceList {
  /**
   * PrivateServiceList
   *
   * This Service is used internally within the DiscoveryModule
   *
   * The reason we need an internally used Service is we want a service which just exposes
   * an array of services without the ability to modify the array itself. However we need to update
   * the array whenever the registry changes.
   */
  private _services: Array<ServiceArray> = [];

  /**
   * Internally updates the list of discovered services
   * @param services Array<Service> The last retrieved list of services from the registry
   */
  public update(services: Array<ServiceArray>) {
    this._services = services;
  }

  /**
   * Exposes the private array of all discovered services retrieved from the registry
   * @returns Array<Service> The last retrieved list of services from the registry
   */
  public get services(): Array<ServiceArray> {
    return this._services;
  }
}
