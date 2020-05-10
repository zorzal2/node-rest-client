/**
 * HTTP Client
 */

export type HttpMethodName = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

/** Representa un método de HTTP */
export class HttpMethod {
  static get: HttpMethod = new HttpMethod('GET', false);
  static post: HttpMethod = new HttpMethod('POST', true);
  static delete: HttpMethod = new HttpMethod('DELETE', false);
  static put: HttpMethod = new HttpMethod('PUT', true);
  static patch: HttpMethod = new HttpMethod('PATCH', true);

  private constructor(
    readonly name: HttpMethodName,
    readonly requiresAnObject: boolean
  ) {
  }
}

/** Request HTTP */
export class HttpRequest {
  /** Para logs */
  readonly description: string;

  constructor(
    readonly method: HttpMethod,
    readonly url: string,
    readonly data?: object
  ) {
    this.description = `${method.name} ${url}`;
  }
}

export type StatusErrorCodes = { [status: string]: { message: string, code: string } };
