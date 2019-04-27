import Logger from '@zorzal2/logger';
import { AppError } from '@zorzal2/common';
import { ErrorCodes } from '../error-codes';
import functionProxy from './func-path-proxy';
import createHttpClient, { HttpClient } from '../http-client';
import { RestClient, RestOperation, RestRequest, RestOperations } from './model';

const logger = Logger.create('rest-client');

/** Operaciones soportadas. */
const Operations: RestOperations = {
  get: new RestOperation('GET', false, true, false),
  list: new RestOperation('GET', false, true, false),
  create: new RestOperation('POST', true, false, true),
  update: new RestOperation('PATCH', true, false, false),
  replace: new RestOperation('PUT', true, false, true),
  remove: new RestOperation('DELETE', false, false, false),
  invoke: new RestOperation('POST', true, true, false)
};

/**
 * Helpers
 */
function isPrimitive(value: any): value is string | number {
  return typeof (value) === 'string' || typeof (value) === 'number';
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

function extractValue(responseBody) {
  // Si el valor de retorno es un valor primitivo, se lo devuelve
  // envuelto en un objeto tipo { result: 'Hola!' }. En este caso
  // desempaqueto el valor y lo devuelvo. Si no, devuelvo el body.

  const bodyProperties = Object.keys(responseBody);
  const isWrapped = bodyProperties.length === 1 && bodyProperties[0] === 'result';
  return isWrapped ? responseBody.result : responseBody;
}

function extractId(responseBody, req: RestRequest) {
  // El id debe devolverse en la propiedad "id" del body de la respuesta.
  const bodyProperties = Object.keys(responseBody);
  if (!bodyProperties.includes('id')) {
    throw buildAppError(ErrorCodes.responseError.noId, req, { data: responseBody });
  }
  return responseBody.id;
}

/** Extrae el resultado del body de la respuesta */
function getResult(resBody, req: RestRequest) {
  if (!resBody) {
    throw buildAppError(ErrorCodes.responseError.noBody, req);
  }
  if (req.operation.expectsData) {
    return extractValue(resBody);
  }
  if (req.operation.expectsId) {
    return extractId(resBody, req);
  }
  return undefined;
}

/**
 * Construye un cliente REST
 */
function client(httpClient: HttpClient): RestClient {

  async function perform(req: RestRequest): Promise<any> {
    let resBody = httpClient.request(req);
    return req.operation.expectsSomething && getResult(resBody, req);
  }

  async function get(this: any, value?: string | number | object): Promise<any> {
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
      Operations.get,
      path,
      undefined,
      options
    );
    return perform(request);
  }

  async function list(this: any, options?: object): Promise<any[]> {
    const request = new RestRequest(
      Operations.list,
      this,
      undefined,
      options
    );
    return perform(request);
  }

  async function create(this: any, instance?: object, options?: object):
    Promise<string | number> {

    const request = new RestRequest(
      Operations.create,
      this,
      instance,
      options
    );
    return perform(request);
  }

  async function update(this: any, properties: object, options?: object): Promise<void> {
    const request = new RestRequest(
      Operations.update,
      this,
      properties,
      options
    );
    if (!properties) {
      const error = ErrorCodes.badRequest.objectRequired;
      throw buildAppError(ErrorCodes.badRequest.objectRequired, request);
    }
    perform(request);
  }

  async function replace(this: any, instance: object, options?: object):
    Promise<string | number> {

    const request = new RestRequest(
      Operations.replace,
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
      Operations.get,
      path,
      undefined,
      options
    );
    perform(request);
  }

  async function invoke(this: any, arg?: object, options?: object): Promise<any> {

    const request = new RestRequest(
      Operations.invoke,
      this,
      arg,
      options
    );
    return perform(request);
  }

  return {
    get: functionProxy(get),
    list: functionProxy(list),
    create: functionProxy(create),
    update: functionProxy(update),
    replace: functionProxy(replace),
    remove: functionProxy(remove),
    invoke: functionProxy(invoke)
  };
}

/** Crea una instancia de cliente REST */
export function connect(endpointUrl: string, timeout?: number): RestClient {
  return client(createHttpClient(endpointUrl, timeout));
}
