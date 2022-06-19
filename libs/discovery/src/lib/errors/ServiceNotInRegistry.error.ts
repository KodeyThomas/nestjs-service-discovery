export class ServiceNotInRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

