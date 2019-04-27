import Logger from '@zorzal2/logger';
import { AppError, txid } from '@zorzal2/common';
import { ErrorCodes } from '../error-codes';
import Axios, { AxiosInstance } from 'axios';
import Context from '@zorzal2/context';
import { StatusErrorCodes, HttpRequest } from './model';
import Config from '../conf';

const logger = Logger.create('http-client');

/** Códigos de error asociados a errores de HTTP */
const errorCodeByStatus: StatusErrorCodes = {
  '400': ErrorCodes.badRequest,
  '401': ErrorCodes.unauthorized,
  '403': ErrorCodes.forbidden,
  '404': ErrorCodes.notFound,
  '405': ErrorCodes.methodNotAllowed,
  '500': ErrorCodes.internal
};

/** Construye un AppError a partir de un Error capturado al hacer el request */
function buildAppError(cause: any, { url, operation}: HttpRequest) {
  cause = cause || {};

  let message;
  let code;
  let info;

  const response = cause.response;
  if (response) {
    // Status no es 2xx
    const data = response.data || {};
    const status = response.status || 500;
    const errorCode = errorCodeByStatus[status] || errorCodeByStatus[500];

    message = data.message || cause.message || errorCode.message;
    code = data.code || cause.code || errorCode.code;
    info =  data.info || { status };

  } else {
    // connection error, timeout, etc.
    message = cause.message || ErrorCodes.requestError.message;
    code = cause.code || ErrorCodes.requestError.code;
    info = { method: operation.method, url };
  }

  return new AppError(message, code, info, cause);
}

/** Obtiene los headers a propagar y el TxID. Si no existe, lo crea. */
function buildHeaders(): object {
  let tx = Context.get('txid') || txid.create();
  let customHeaders = Context.get('custom-headers');
  return { 'X-TxID': tx, ...customHeaders };
}

/**
 * Construye un cliente REST
 */
async function execute(axios: AxiosInstance, { operation, url, data = {} }: HttpRequest): Promise<any> {
  const response = await axios({
    url,
    method: operation.method,
    data: operation.requiresAnObject ? data : undefined,
    headers: buildHeaders()
  });
  return response.data;
}

class Client {
  constructor(private axios: AxiosInstance) { }

  async request(req: HttpRequest): Promise<any> {
    logger.debug('Starting ' + req.description);
    let resBody;
    try {
      resBody = await execute(this.axios, req);
      logger.debug(`${req.description} succeded`);
    } catch (err) {
      const appError = buildAppError(err, req);
      logger.error(`${req.description} FAILED.`, appError);
      throw appError;
    }
    return resBody;
  }
}

export type HttpClient = Client;

/** Crea una instancia de cliente HTTP */
export default function create(endpointUrl: string, timeout?: number): HttpClient {
  try {
    let url = new URL(endpointUrl);
    let axios = Axios.create({
      baseURL: url.toString(),
      timeout: timeout || Config.requestTimeout
    });
    return new Client(axios);
  } catch (err) {
    logger.error(err);
    if (err && err.code === 'ERR_INVALID_URL') {
      const error = ErrorCodes.invalidEndpoint;
      throw new AppError(error.message, error.code, { endpointUrl }, err);
    }
    throw err;
  }
}
