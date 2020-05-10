import Logger from '@zorzal2/logger';
import { AppError } from '@zorzal2/common';
import { ErrorCodes } from '../error-codes';
import functionProxy from './func-path-proxy';
import { HttpClient } from '../http-client/http-client';
import { MockingRestClient, RestOperation, RestRequest, Instance, MockMethod } from './model';
import Context from '@zorzal2/context';

const logger = Logger.create('mocking-rest-client');

function mockingContext() {
  const xheaders: { [header: string]: string } = Context.get('xheaders');
  Object.keys(xheaders).some(xheader => xheader.toLowerCase() === 'x-mock')
}

/**
 * Intenta hacer coincidir el primer path con el segundo. Devuelve undefined si no fue posible
 * o un objeo con todos los reemplazos de variables cuando sí fue posible.
 */
function matchPaths() {

}

class MockRule {

  constructor(
    private operation: RestOperation,
    private path: any[],
    readonly mockMethod: MockMethod) {

    }

  applyTo(req: RestRequest): object | undefined {
    if (this.operation !== req.operation) return undefined;
    if (this.path.length !== req.path.length) return undefined;
    let match: object = {};
    let pathMatch = this.path.every((part, index) => {
      const otherPart = req.path[index];
      const partIsVar = typeof part === 'string' && part.length > 1 && (part.startsWith(':') || part.startsWith('$'));
      if (partIsVar) {
        match[part] = otherPart;
        return true;
      } else {
        return String(part) === String()
      }
    });
    return pathMatch ? match : undefined;
  }
}

/**
 * Construye un cliente REST
 */
function client(httpClient: HttpClient, serviceName: string): MockingRestClient {

  async function perform(req: RestRequest): Promise<any> {
    let resBody = await httpClient.request(req);
    if (!resBody) {
      throw buildAppError(ErrorCodes.responseError.noBody, req);
    }
    return req.operation.expectsData ? resBody.data : undefined;
  }


  function mock(mockingContext: string, operation: RestOperation, path: string[], mockMethod: MockMethod) {
    console.log('headerValue', headerValue, 'operation', operation, 'path', path, mockMethod);
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

/** Crea una instancia de mocking cliente REST */
export function createRestClient(serviceName: string): MockingRestClient {
  return client(serviceName);
}
