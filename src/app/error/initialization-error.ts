/**
 * Error thrown when an initialization fails.
 */
export class InitializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InitializationError';
  }
}
