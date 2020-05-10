export { RestClient } from './rest-client/model';
export { ErrorCodes } from './error-codes';

import { createRestClient } from './rest-client/rest-client';
import { createHttpClient} from './http-client/http-client';
import axios from 'axios';

export function connect(endpointUrl: string, timeout?: number) {
    let httpClient = createHttpClient(axios, endpointUrl, timeout);
    return createRestClient(httpClient);
}