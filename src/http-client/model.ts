/**
 * HTTP Client
 */

export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

/** Representa una operación de HTTP */
export class HttpOperation {
  constructor(
    readonly method: HttpMethod,
    readonly requiresAnObject: boolean,
    readonly expectsSomething: boolean
  ) {
   }
}

/** Request HTTP */
export class HttpRequest {
  /** Para logs */
  readonly description: string;

  constructor(
    readonly operation: HttpOperation,
    readonly url: string,
    readonly data?: object
  ) {
    this.description = `${operation.method} ${url}`;
  }
}

export type StatusErrorCodes = { [status: string]: { message: string, code: string } };
