/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error{
  constructor(message: string){
    super(message);
    this.name = 'ValidationError';
  }
}
