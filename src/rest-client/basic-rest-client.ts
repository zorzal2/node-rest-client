import Logger from '@zorzal2/logger';
import { AppError } from '@zorzal2/common';
import { ErrorCodes } from '../error-codes';
import { HttpClient } from '../http-client/http-client';
import { BasicRestClient, RestOperation, RestRequest, Instance, MockDefinition, MockMethod } from './model';


/**
 * Construye un cliente REST
 */
function client(httpClient: HttpClient, serviceName: string): BasicRestClient {
  const logger = Logger.create('basic-rest-client: ' + serviceName);

  /** Construye un AppError */
  function buildAppError(errorCode, { description }: RestRequest, info: object = {}): AppError {
    const appError = new AppError(
      errorCode.message,
      errorCode.code,
      { request: description, ...info});
    logger.error(`${description} FAILED.`, appError);
    return appError;
  }

  async function perform(req: RestRequest): Promise<any> {
    let response = await httpClient.request(req);
    if (!response) {
      throw buildAppError(ErrorCodes.responseError.noBody, req);
    }
    return req.operation.expectsData ? response.data : undefined;
  }

  return { perform };
}

/** Crea una instancia de cliente REST */
export function createRestClient(httpClient: HttpClient, serviceName: string): BasicRestClient {
  return client(httpClient, serviceName);
}
