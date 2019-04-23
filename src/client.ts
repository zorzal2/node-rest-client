import Logger from '@zorzal2/logger';
import { AppError, txid } from '@zorzal2/common';
import { ErrorCodes } from './error-codes';
import functionProxy from './func-path-proxy';
import Axios, { AxiosInstance } from 'axios';
import Context from '@zorzal2/context';
import Qs from 'qs';
import Config from './conf';

const logger = Logger.create('rest-client');

/** Representa una operación de REST: creación, modificación, listado y borrado. */
class Operation {
  readonly expectsSomething: boolean;
  constructor(
    readonly method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH',
    readonly requiresAnObject: boolean,
    readonly expectsData: boolean,
    readonly expectsId: boolean,
  ) {
    this.expectsSomething = expectsData || expectsId;
  }
}

/** Operaciones soportadas. */
const Operations = {
  get: new Operation('GET', false, true, false),
  list: new Operation('GET', false, true, false),
  create: new Operation('POST', true, false, true),
  update: new Operation('PATCH', true, false, false),
  replace: new Operation('PUT', true, false, true),
  remove: new Operation('DELETE', false, false, false),
  invoke: new Operation('POST', true, true, false)
};

/** Request a un service REST */
class Request {
  readonly url: string;
  /** Para logs */
  readonly description: string;

  constructor(
    readonly operation: Operation,
    path: any[],
    readonly data?: object,
    options?: object
  ) {
    const basePath = '/' + path.map(part => String(part)).join('/');
    this.url = basePath + (options ? `?${Qs.stringify(options)}` : '');
    this.description = `${operation.method} ${this.url}`;
  }
}

/** Códigos de error asociados a errores de HTTP */
const errorCodeByStatus: { [status: string]: { message: string, code: string } } = {
  '400': ErrorCodes.badRequest,
  '401': ErrorCodes.unauthorized,
  '403': ErrorCodes.forbidden,
  '404': ErrorCodes.notFound,
  '405': ErrorCodes.methodNotAllowed,
  '500': ErrorCodes.internal
};


/**
 * Helpers
 */
const isPrimitive = value => typeof (value) === 'string' || typeof (value) === 'number';

function extractValue(responseBody) {
  // Si el valor de retorno es un valor primitivo, se lo devuelve
  // envuelto en un objeto tipo { result: 'Hola!' }. En este caso
  // desempaqueto el valor y lo devuelvo. Si no, devuelvo el body.

  const bodyProperties = Object.keys(responseBody);
  const isWrapped = bodyProperties.length === 1 && bodyProperties[0] === 'result';
  return isWrapped ? responseBody.result : responseBody;
}

function extractId(responseBody, request: Request) {
  // El id debe devolverse en la propiedad "id" del body de la respuesta.
  const bodyProperties = Object.keys(responseBody);
  if (!bodyProperties.includes('id')) {
    const error = ErrorCodes.responseError.noId;
    throw buildAppError(request, error.message, error.code, { data: responseBody });
  }
  return responseBody.id;
}

/** Obtiene los headers a propagar y el TxID. Si no existe, lo crea. */
function buildHeaders(): object {
  let tx = Context.get('txid') || txid.create();
  let customHeaders = Context.get('custom-headers');
  return { 'X-TxID': tx, ...customHeaders };
}

/** Crea y loguea un error */
function buildAppError(
  request: Request,
  message: string,
  code: string,
  info?: any,
  cause?: any
): AppError {

  if (info == undefined) info = {};
  if (typeof (info) === 'object') {
    info = {
      ...info,
      method: request.operation.method,
      url: request.url
    };
  }
  const error = new AppError(message, code, info, cause instanceof Error ? cause : undefined);
  logger.error(`${request.description} FAILED.`, error);
  return error;
}

/** Construye un error a partir de un Error capturado al hacer el request */
function buildError(cause: any, request: Request) {
  if (cause && cause.response) {
    // Status no es 2xx
    const status = cause.response.status || 500;
    const defaultCode = errorCodeByStatus[status] || errorCodeByStatus[500];
    const data = cause.response.data || {};

    return buildAppError(
      request,
      data.message || cause.message || defaultCode.message,
      data.code || defaultCode.code,
      data.info || { status },
      cause instanceof Error ? cause : undefined
    );
  }
  // connection error, timeout, etc.
  const err = cause ? cause : {};
  return buildAppError(
    err.message || ErrorCodes.requestError.message,
    err.code || ErrorCodes.requestError.code,
    err.info,
    cause
  );
}

/** Extrae el resultado del body de la respuesta */
function getResult(request: Request, resBody) {
  if (!resBody) {
    const error = ErrorCodes.responseError.noBody;
    throw buildAppError(request, error.message, error.code);
  }
  if (request.operation.expectsData) {
    return extractValue(resBody);
  }
  if (request.operation.expectsId) {
    return extractId(resBody, request);
  }
  return undefined;
}

/**
 * Construye un cliente REST
 */
function client(axios: AxiosInstance) {

  async function doRequest({ operation, url, description, data }: Request): Promise<any> {
    logger.debug('Starting ' + description);
    const response = await axios({
      url,
      method: operation.method,
      data: operation.requiresAnObject ? data || {} : undefined,
      headers: buildHeaders()
    });
    logger.debug(`${description} succeded with status ${response.status}`);
    return response.data;
  }

  async function perform(request: Request): Promise<any> {
    let resBody;
    try {
      resBody = doRequest(request);
    } catch (err) {
      throw buildError(err, request);
    }
    return request.operation.expectsSomething && getResult(resBody, request);
  }

  async function get(this: any[]): Promise<object>;
  async function get(this: any[], id: string | number): Promise<object>;
  async function get(this: any[], options: object): Promise<object>;
  async function get(this: any[], value?: string | number | object): Promise<object> {
    let options;
    let path;
    if (isPrimitive(value)) {
      options = undefined;
      path = [...this, value];
    } else {
      options = value;
      path = this;
    }

    const request = new Request(
      Operations.get,
      path,
      undefined,
      options
    );
    return perform(request);
  }

  async function list(this: any[], options?: object): Promise<any[]> {
    const request = new Request(
      Operations.list,
      this,
      undefined,
      options
    );
    return perform(request);
  }

  async function create(this: any[], instance?: object, options?: object):
    Promise<string | number> {

    const request = new Request(
      Operations.create,
      this,
      instance,
      options
    );
    return perform(request);
  }

  async function update(this: any[], properties: object, options?: object): Promise<void> {
    const request = new Request(
      Operations.update,
      this,
      properties,
      options
    );
    if (!properties) {
      const error = ErrorCodes.badRequest.objectRequired;
      throw buildAppError(
        request,
        error.message,
        error.code
      );
    }
    perform(request);
  }

  async function replace(this: any[], instance: object, options?: object):
    Promise<string | number> {

    const request = new Request(
      Operations.replace,
      this,
      instance,
      options
    );
    return perform(request);
  }

  async function remove(this: any[]): Promise<void>;
  async function remove(this: any[], id: string | number): Promise<void>;
  async function remove(this: any[], options: object): Promise<void>;
  async function remove(this: any[], value?: string | number | object): Promise<void> {
    let options;
    let path;
    if (isPrimitive(value)) {
      options = undefined;
      path = [...this, value];
    } else {
      options = value;
      path = this;
    }

    const request = new Request(
      Operations.get,
      path,
      undefined,
      options
    );
    perform(request);
  }

  async function invoke(this: any[], arg?: object, options?: object): Promise<any> {

    const request = new Request(
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
    invoke: functionProxy(invoke)
  };
}

/** Crea una instancia de cliente REST */
export function connect(endpointUrl: string, timeout: number) {
  try {
    let url = new URL(endpointUrl);
    let axios = Axios.create({
      baseURL: url.toString(),
      timeout: timeout || Config.requestTimeout
    });
    return client(axios);
  } catch (err) {
    if (err && err.code === 'ERR_INVALID_URL') {
      const error = ErrorCodes.invalidEndpoint;
      throw new AppError(error.message, error.code, { endpointUrl }, err);
    }
    throw err;
  }
}
