import Qs from 'qs';
import { FunctionProxy } from './func-path-proxy';
import { HttpRequest, HttpMethod } from '../http-client/model';

export type Instance = { id: string };


export type MockMethod = (data: object, vars: object, options?: object) => Promise<any>;
export type MockDefinition = { [operation: string]: MockMethod };

interface IRestClient {
  get(): Promise<Instance>;
  get(id: string | number): Promise<Instance>;
  get(options: object): Promise<Instance>;

  list(options?: object): Promise<Instance[]>;

  create(instance: object, options?: object): Promise<Instance>;

  update(properties: object, options?: object): Promise<Instance>;

  replace(this: any, instance: object, options?: object): Promise<Instance>;

  remove(this: any): Promise<void>;
  remove(this: any, id: string | number): Promise<void>;
  remove(this: any, options: object): Promise<void>;
  remove(this: any, value?: string | number | object): Promise<void>;

  invoke(this: any, arg?: object, options?: object): Promise<any>;

  mock(mockDefinition: MockDefinition): void;
  mock(mockMethod: MockMethod): void;
}

export type RestClient = {
  [P in keyof IRestClient]: FunctionProxy<IRestClient[P]>;
};


/** Representa una operación de REST: creación, modificación, listado y borrado. */
export class RestOperation {
  static get: RestOperation = new RestOperation(HttpMethod.get, true);
  static list: RestOperation = new RestOperation(HttpMethod.get, true);
  static create: RestOperation = new RestOperation(HttpMethod.post, true);
  static update: RestOperation = new RestOperation(HttpMethod.patch, true);
  static replace: RestOperation = new RestOperation(HttpMethod.put, true);
  static remove: RestOperation = new RestOperation(HttpMethod.delete, false);
  static invoke: RestOperation = new RestOperation(HttpMethod.post, true);

  private constructor(
    readonly method: HttpMethod,
    readonly expectsData: boolean
    ) {
    }
  }

/** Request a un service REST */

export class RestRequest extends HttpRequest {

  readonly operation: RestOperation;
  readonly options: object | undefined;
  readonly path: any[];

  constructor(
    operation: RestOperation,
    path: any[],
    data?: object,
    options?: object
  ) {
    const basePath = '/' + path.map(part => String(part)).join('/');
    const url = basePath + (options ? `?${Qs.stringify(options)}` : '');
    super(operation.method, url, data);
    this.operation = operation;
    this.options = options;
    this.path = path;
  }
}

export type StatusErrorCodes = { [status: string]: { message: string, code: string } };

export type BasicRestClient = {
  perform(req: RestRequest): Promise<any>
};

export type MockingRestClient = BasicRestClient & {
  mock(mockingContext: string, operation: RestOperation, path: string[], mockMethod: MockMethod): void;
  isMocked(req: RestRequest): boolean;
};
