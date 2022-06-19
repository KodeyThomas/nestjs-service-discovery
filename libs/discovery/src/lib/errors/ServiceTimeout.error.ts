export class ServiceTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
