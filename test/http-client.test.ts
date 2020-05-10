// tslint:disable: no-unused-expression
import { expect } from 'chai';
import { ErrorCodes } from '../src/error-codes';
import { HttpRequest, HttpMethod } from '../src/http-client/model';
import { createHttpClient } from '../src/http-client/http-client';
import sinon, { SinonSpy, SinonFake } from 'sinon';
import { AxiosStatic } from 'axios';
import { AppError } from '@zorzal2/common';
import functionProxy from '../src/rest-client/func-path-proxy';

type AxiosMock = { [name in keyof SinonFake]: (value: any) => AxiosStatic & { fake: SinonSpy } };

const AxiosMock: AxiosMock = <any> functionProxy(function(value) {
  const [ action ] = this;
  const fake: any = sinon.fake[action](value);
  return <AxiosStatic & { fake: SinonSpy }><any>{ create: sinon.fake.returns(fake), fake };
});

describe('HTTP Client', () => {
  describe('Create', () => {
    it('Correct URL, with timeout.', () => {
      const axiosMock: any = { create: sinon.fake.returns({}) };
      const client = createHttpClient(axiosMock as AxiosStatic, 'http://localhost:8989', 20000);
      expect(client).to.exist;
      expect(axiosMock.create.getCall(0).args[0].baseURL).to.eq('http://localhost:8989/');
      expect(axiosMock.create.getCall(0).args[0].timeout).to.eq(20000);
    });
    it('Correct URL, without timeout.', () => {
      const axiosMock: any = { create: sinon.fake.returns({}) };
      const client = createHttpClient(axiosMock, 'http://localhost:8989');
      expect(client).to.exist;
      expect(axiosMock.create.getCall(0).args[0].baseURL).to.eq('http://localhost:8989/');
      expect(axiosMock.create.getCall(0).args[0].timeout).to.eq(120000);
    });
    it('Invalid URL.', () => {
      const axiosMock: any = { create: sinon.fake.throws(new AppError('', 'ERR_INVALID_URL')) };
      try {
        createHttpClient(axiosMock, 'http://localhost:8989', 20000);
        expect.fail('Error was expected');
      } catch (err) {
        expect(ErrorCodes.invalidEndpoint.is(err)).to.be.true;
      }
    });
    it('Unknown error.', () => {
      const axiosMock: any = { create: sinon.fake.throws(new Error('An error')) };
      try {
        createHttpClient(axiosMock, 'http://localhost:8989', 20000);
        expect.fail('Error was expected');
      } catch (err) {
        expect(ErrorCodes.invalidEndpoint.is(err)).not.to.be.true;
        expect(err.message).to.be.equal('An error');
      }
    });
  });


  describe('request', () => {
    it('Post OK', async () => {
      const axios = AxiosMock.resolves({ data: [1, 'Foo'] });
      const client = createHttpClient(axios, 'http://localhost:8989', 20000);
      const array = await client.request(new HttpRequest(HttpMethod.post, '/personas'));
      expect(array).to.have.length(2);
      expect(array[0]).to.equals(1);
      expect(array[1]).to.equals('Foo');
      const arg = axios.fake.getCall(0).args[0];
      expect(arg.url).to.eq('/personas');
      expect(arg.method).to.eq('POST');
      expect(JSON.stringify(arg.data)).to.eq('{}');
      expect(arg.headers['x-txid']).not.to.be.empty;
    });
    it('Post. 500 with body and status', async () => {
      const data = {
        message: 'Ops!',
        code: 'a.code',
        cause: new Error('Err'),
        info: 'info'
      };
      const error = Object.assign(new Error('axios error message'), { response: { data, status: 501 } });
      const axios = AxiosMock.rejects(error);
      const client = createHttpClient(axios, 'http://localhost:8989', 20000);
      try {
        await client.request(new HttpRequest(HttpMethod.post, '/personas'));
        fail();
      } catch (err) {
        expect(err.message).to.eq('Ops!');
        expect(err.code).to.eq('a.code');
        expect(err.info).to.eq('info');
      }
    });
    it('Post. 500 no body, no status', async () => {
      const error = Object.assign(new Error('axios error message'), { response: { } });
      const axios = AxiosMock.rejects(error);
      const client = createHttpClient(axios, 'http://localhost:8989', 20000);
      try {
        await client.request(new HttpRequest(HttpMethod.post, '/personas'));
        fail();
      } catch (err) {
        expect(err.message).to.eq('axios error message');
        expect(err.code).to.eq('internal');
        expect(err.info.status).to.eq(500);
      }
    });
  });
  it('Post. Unknown error. With cause.', async () => {
    const cause = {
      message: 'Ops!',
      code: 'a.code',
      info: 'info'
    };
    const axios = AxiosMock.rejects(Object.assign(new Error(), cause));
    const client = createHttpClient(axios, 'http://localhost:8989', 20000);
    try {
      await client.request(new HttpRequest(HttpMethod.post, '/personas'));
      fail();
    } catch (err) {
      expect(err.message).to.eq('Ops!');
      expect(err.code).to.eq('a.code');
      expect(err.info).to.eq('info');
    }
  });
  it('Post. Unknown error. No cause.', async () => {
    const axios = AxiosMock.rejects('');
    const client = createHttpClient(axios, 'http://localhost:8989', 20000);
    try {
      await client.request(new HttpRequest(HttpMethod.post, '/personas'));
      fail();
    } catch (err) {
      expect(err.message).to.eq('No se pudo realizar la operación.');
      expect(err.code).to.eq('requestError');
      expect(err.info.method).to.eq('POST');
      expect(err.info.url).to.eq('/personas');
    }
  });
});

