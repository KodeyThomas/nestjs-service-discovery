export class ServiceNotInAllowedStateError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
