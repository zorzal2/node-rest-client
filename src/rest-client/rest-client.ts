import Logger from '@zorzal2/logger';
import { AppError } from '@zorzal2/common';
import { ErrorCodes } from '../error-codes';
import functionProxy from './func-path-proxy';
import { HttpClient } from '../http-client/http-client';
import { RestClient, RestOperation, RestRequest, Instance, MockDefinition, MockMethod } from './model';

const logger = Logger.create('rest-client');

/**
 * Helpers
 */
function isPrimitive(value: any): value is string | number {
  return typeof (value) === 'string' || typeof (value) === 'number';
}

class MockSpec {

  constructor(
    readonly headerValue: string,
    readonly operation: string,
    readonly path: string[],
    readonly mockMethod: MockMethod) {

    }

    
}

/** Construye un AppError */
function buildAppError(errorCode, { description }: RestRequest, info: object = {}): AppError {
  const appError = new AppError(
    errorCode.message,
    errorCode.code,
    { request: description, ...info});
  logger.error(`${description} FAILED.`, appError);
  return appError;
}

/**
 * Construye un cliente REST
 */
function client(httpClient: HttpClient, serviceName: string): RestClient {

  async function perform(req: RestRequest): Promise<any> {
    let resBody = await httpClient.request(req);
    if (!resBody) {
      throw buildAppError(ErrorCodes.responseError.noBody, req);
    }
    return req.operation.expectsData ? resBody.data : undefined;
  }

  async function get(this: any, value?: string | number | object): Promise<Instance> {
    let options;
    let path;
    if (isPrimitive(value)) {
      options = undefined;
      path = [...this, value];
    } else {
      options = value;
      path = this;
    }

    const request = new RestRequest(
      RestOperation.get,
      path,
      undefined,
      options
    );
    return perform(request);
  }

  async function list(this: any, options?: object): Promise<Instance[]> {
    const request = new RestRequest(
      RestOperation.list,
      this,
      undefined,
      options
    );
    return perform(request);
  }

  async function create(this: any, instance?: object, options?: object): Promise<Instance> {

    const request = new RestRequest(
      RestOperation.create,
      this,
      instance,
      options
    );
    return perform(request);
  }

  async function update(this: any, properties: object, options?: object): Promise<Instance> {
    const request = new RestRequest(
      RestOperation.update,
      this,
      properties,
      options
    );
    if (!properties) {
      throw buildAppError(ErrorCodes.badRequest.objectRequired, request);
    }
    return perform(request);
  }

  async function replace(this: any, instance: object, options?: object): Promise<Instance> {

    const request = new RestRequest(
      RestOperation.replace,
      this,
      instance,
      options
    );
    return perform(request);
  }

  async function remove(this: any, value?: string | number | object): Promise<void> {
    let options;
    let path;
    if (isPrimitive(value)) {
      options = undefined;
      path = [...this, value];
    } else {
      options = value;
      path = this;
    }

    const request = new RestRequest(
      RestOperation.remove,
      path,
      undefined,
      options
    );
    perform(request);
  }

  async function invoke(this: any, arg?: object, options?: object): Promise<any> {

    const request = new RestRequest(
      RestOperation.invoke,
      this,
      arg,
      options
    );
    return perform(request);
  }


  function addMock(headerValue: string, operation: string, path: string[], mockMethod: MockMethod) {
    console.log('headerValue', headerValue, 'operation', operation, 'path', path, mockMethod);
  }

  function mock(first: MockDefinition | MockMethod) {
    if (typeof first === 'function') {
      if (this.length < 3) {
        throw new Error(
          'Invalid syntax for mock. Expected header value, operation and path. E.g. client.mock.INVALID_ID.retrieve.people.$id(...)'
        );
      }
      const [headerValue, operation, ...path] = this;
      addMock(headerValue, operation, path, first);
    } else {
      if (!this.length) {
        throw new Error(
          'Invalid syntax for mock. Expected header value. E.g. client.mock.INVALID_ID(...).'
        );
      }
      if (typeof first !== 'object') throw new Error(`Invalid type. Object expected. Got ${typeof first}.`);
      const [headerValue, ...command] = this;
      Object.keys(first).forEach(key => {
        const [operation, ...path] = [...command, ...(key.split(/['"`\.\[\]\(\)]+/g).map(s => s.trim()).filter(s => s))];
        if (!operation || !path.length) {
          throw new Error(
            'Invalid syntax for mock. Expected header value, operation and path. E.g. client.mock.INVALID_ID.retrieve.people.$id(...)'
          );
        }
        addMock(headerValue, operation, path, first[key]);
      });
    }
  }

  return {
    get: functionProxy(get),
    list: functionProxy(list),
    create: functionProxy(create),
    update: functionProxy(update),
    replace: functionProxy(replace),
    remove: functionProxy(remove),
    invoke: functionProxy(invoke),
    mock: functionProxy(mock)
  };
}

/** Crea una instancia de cliente REST */
export function createRestClient(httpClient: HttpClient, serviceName: string): RestClient {
  return client(httpClient, serviceName);
}
