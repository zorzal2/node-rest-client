import { createRestClient } from '../src/rest-client/rest-client';
import sinon, { SinonSpy, SinonFake } from 'sinon';
import { HttpClient } from '../src/http-client/http-client';
import functionProxy from '../src/rest-client/func-path-proxy';
import { AssertionError } from 'assert';

type HttpClientMock = { [name in keyof SinonFake]: (value: any) => HttpClient & { fake: SinonSpy } };

const HttpClientMock: HttpClientMock = <any> functionProxy(function(value) {
  const [ action ] = this;
  const fake: any = sinon.fake[action](value);
  return <HttpClient & { fake: SinonSpy }><any>{ request: fake, fake };
});

describe('REST Client', () => {
  describe('List', () => {
    it('No options. Ok', async () => {
      const mock = HttpClientMock.returns({ data: [{id: 'Hello'}, {id: 'World'}] });
      const client = createRestClient(mock);
      const array = await client.list.personas[123].phones();
      expect(array).toHaveLength(2);
      expect(array[0].id).toBe('Hello');
      expect(array[1].id).toBe('World');
      const request = mock.fake.getCall(0).args[0];
      expect(request.operation.method.name).toBe('GET');
      expect(request.operation.method.requiresAnObject).toBe(false);
      expect(request.operation.expectsData).toBe(true);
      expect(request.url).toBe('/personas/123/phones');
      expect(request.data).toBeUndefined();
    });
    it('With options. Ok', async () => {
      const mock = HttpClientMock.returns({ data: ['Hello', 'World'] });
      const client = createRestClient(mock);
      const array = await client.list.personas[123].phones({ skip: 6});
      expect(array).toHaveLength(2);
      expect(array[0]).toBe('Hello');
      expect(array[1]).toBe('World');
      expect(mock.fake.getCall(0).args[0].url).toBe('/personas/123/phones?skip=6');
    });
    it('Error. No result.', async () => {
      const mock = HttpClientMock.returns(undefined);
      const client = createRestClient(mock);
      try {
        await client.list.personas[123].phones({ skip: 6});
        fail();
      } catch (err) {
        expect(err.message).toBe('La respuesta no tiene body.');
        expect(err.code).toBe('responseError.noBody');
        expect(err.info.request).toBe('GET /personas/123/phones?skip=6');
      }
    });
  });
  describe('Create', () => {
    it('No options. Ok', async () => {
      const mock = HttpClientMock.returns({ data: { id: 'Foooo' } });
      const client = createRestClient(mock);
      const persona = await client.create.personas[123].phones({ foo: 'bar' });
      expect(persona.id).toBe('Foooo');
      const request = mock.fake.getCall(0).args[0];
      expect(request.operation.method.name).toBe('POST');
      expect(request.operation.method.requiresAnObject).toBe(true);
      expect(request.operation.expectsData).toBe(true);
      expect(request.url).toBe('/personas/123/phones');
      expect(request.data.foo).toBe('bar');
    });
    it('No options. Ok', async () => {
      const mock = HttpClientMock.returns({ data: { id: 'Foooo' } });
      const client = createRestClient(mock);
      const persona = await client.create.personas[123].phones({ foo: 'bar' });
      expect(persona.id).toBe('Foooo');
      const request = mock.fake.getCall(0).args[0];
      expect(request.operation.method.name).toBe('POST');
      expect(request.operation.method.requiresAnObject).toBe(true);
      expect(request.operation.expectsData).toBe(true);
      expect(request.url).toBe('/personas/123/phones');
      expect(request.data.foo).toBe('bar');
    });
    it('With options. Ok', async () => {
      const mock = HttpClientMock.returns({ data: { id: 'Foooo' } });
      const client = createRestClient(mock);
      const created = await client.create.personas[123].phones({ foo: 'bar' }, { skip: 6});
      expect(created.id).toBe('Foooo');
      const request = mock.fake.getCall(0).args[0];
      expect(request.operation.method.name).toBe('POST');
      expect(request.operation.method.requiresAnObject).toBe(true);
      expect(request.operation.expectsData).toBe(true);
      expect(request.url).toBe('/personas/123/phones?skip=6');
      expect(request.data.foo).toBe('bar');
    });
    it('Error. No result.', async () => {
      const mock = HttpClientMock.returns(undefined);
      const client = createRestClient(mock);
      try {
        await client.create.personas[123].phones({ foo: 'bar' }, { skip: 6});
        fail();
      } catch (err) {
        expect(err.message).toBe('La respuesta no tiene body.');
        expect(err.code).toBe('responseError.noBody');
        expect(err.info.request).toBe('POST /personas/123/phones?skip=6');
      }
    });
  });
  describe('Retrieve', () => {
    it('No options. Ok', async () => {
      const mock = HttpClientMock.returns({ data: {firstname: 'John', lastname: 'Connor', id: '123'} });
      const client = createRestClient(mock);
      const john: any = await client.get.personas(123);
      expect(john.firstname).toBe('John');
      expect(john.lastname).toBe('Connor');
      expect(john.id).toBe('123');
      const request = mock.fake.getCall(0).args[0];
      expect(request.operation.method.name).toBe('GET');
      expect(request.operation.method.requiresAnObject).toBe(false);
      expect(request.operation.expectsData).toBe(true);
      expect(request.url).toBe('/personas/123');
      expect(request.data).toBeUndefined();
    });
    it('With options. Ok', async () => {
      const mock = HttpClientMock.returns({ data: {firstname: 'John', lastname: 'Connor', id: '123'} });
      const client = createRestClient(mock);
      const john: any = await client.get.personas[123]({skip: 6});
      expect(john.firstname).toBe('John');
      expect(john.lastname).toBe('Connor');
      expect(john.id).toBe('123');
      expect(mock.fake.getCall(0).args[0].url).toBe('/personas/123?skip=6');
    });
    it('No args. Ok', async () => {
      const mock = HttpClientMock.returns({ data: {firstname: 'John', lastname: 'Connor', id: '123'} });
      const client = createRestClient(mock);
      const john: any = await client.get.personas[123]();
      expect(john.firstname).toBe('John');
      expect(john.lastname).toBe('Connor');
      expect(john.id).toBe('123');
      expect(mock.fake.getCall(0).args[0].url).toBe('/personas/123');
    });
    it('Error. No result.', async () => {
      const mock = HttpClientMock.returns(undefined);
      const client = createRestClient(mock);
      try {
        await client.get.personas[123]({ skip: 6});
        fail();
      } catch (err) {
        expect(err.message).toBe('La respuesta no tiene body.');
        expect(err.code).toBe('responseError.noBody');
        expect(err.info.request).toBe('GET /personas/123?skip=6');
      }
    });
  });
  describe('Update', () => {
    it('No options. Ok', async () => {
      const mock = HttpClientMock.returns({ data: { id: 'Foooo' } });
      const client = createRestClient(mock);
      const persona = await client.update.personas[123]({ foo: 'bar' });
      expect(persona.id).toBe('Foooo');
      const request = mock.fake.getCall(0).args[0];
      expect(request.operation.method.name).toBe('PATCH');
      expect(request.operation.method.requiresAnObject).toBe(true);
      expect(request.operation.expectsData).toBe(true);
      expect(request.url).toBe('/personas/123');
      expect(request.data.foo).toBe('bar');
    });
    it('With options. Ok', async () => {
      const mock = HttpClientMock.returns({ data: { id: 'Foooo' } });
      const client = createRestClient(mock);
      const persona = await client.update.personas[123]({ foo: 'bar' }, { skip: 6});
      expect(persona.id).toBe('Foooo');
      const request = mock.fake.getCall(0).args[0];
      expect(request.operation.method.name).toBe('PATCH');
      expect(request.operation.method.requiresAnObject).toBe(true);
      expect(request.operation.expectsData).toBe(true);
      expect(request.url).toBe('/personas/123?skip=6');
      expect(request.data.foo).toBe('bar');
    });
    it('Error. No result.', async () => {
      const mock = HttpClientMock.returns(undefined);
      const client = createRestClient(mock);
      try {
        await client.update.personas[123]({ foo: 'bar' }, { skip: 6});
        fail();
      } catch (err) {
        expect(err.message).toBe('La respuesta no tiene body.');
        expect(err.code).toBe('responseError.noBody');
        expect(err.info.request).toBe('PATCH /personas/123?skip=6');
      }
    });
    it('Error. No parameter.', async () => {
      const mock = HttpClientMock.returns(undefined);
      const client = createRestClient(mock);
      try {
        await client.update.personas[123](<object><unknown>null);
        fail();
      } catch (err) {
        expect(err.message).toBe('Esta operación requiere un argumento de tipo objeto.');
        expect(err.code).toBe('badRequest.objectRequired');
        expect(err.info.request).toBe('PATCH /personas/123');
      }
    });
  });
  describe('Replace', () => {
    it('With options. Ok', async () => {
      const mock = HttpClientMock.returns({ data: { id: 'Foooo' } });
      const client = createRestClient(mock);
      const persona = await client.replace.personas[123]({ foo: 'bar' }, { skip: 6});
      expect(persona.id).toBe('Foooo');
      const request = mock.fake.getCall(0).args[0];
      expect(request.operation.method.name).toBe('PUT');
      expect(request.operation.method.requiresAnObject).toBe(true);
      expect(request.operation.expectsData).toBe(true);
      expect(request.url).toBe('/personas/123?skip=6');
      expect(request.data.foo).toBe('bar');
    });
  });
  describe('Remove', () => {
    it('No parameters. Ok', async () => {
      const mock = HttpClientMock.returns({});
      const client = createRestClient(mock);
      await client.remove.personas[123]();
      const request = mock.fake.getCall(0).args[0];
      expect(request.operation.method.name).toBe('DELETE');
      expect(request.operation.method.requiresAnObject).toBe(false);
      expect(request.operation.expectsData).toBe(false);
      expect(request.url).toBe('/personas/123');
    });
    it('With ID. Ok', async () => {
      const mock = HttpClientMock.returns({});
      const client = createRestClient(mock);
      await client.remove.personas(123);
      const request = mock.fake.getCall(0).args[0];
      expect(request.operation.method.name).toBe('DELETE');
      expect(request.url).toBe('/personas/123');
    });
  });
  it('With options. Ok', async () => {
    const mock = HttpClientMock.returns({});
    const client = createRestClient(mock);
    await client.remove.personas[123]({ skip: 6 });
    const request = mock.fake.getCall(0).args[0];
    expect(request.operation.method.name).toBe('DELETE');
    expect(request.url).toBe('/personas/123?skip=6');
  });
  describe('Invoke', () => {
    it('No parameters. Ok', async () => {
      const mock = HttpClientMock.returns({ data: 'simple value' });
      const client = createRestClient(mock);
      const result = await client.invoke.doSomething();
      expect(result).toBe('simple value');
      const request = mock.fake.getCall(0).args[0];
      expect(request.operation.method.name).toBe('POST');
      expect(request.operation.method.requiresAnObject).toBe(true);
      expect(request.operation.expectsData).toBe(true);
      expect(request.url).toBe('/doSomething');
    });
    it('With argument and options. Ok', async () => {
      const mock = HttpClientMock.returns({ data: { foo: 'bar' } });
      const client = createRestClient(mock);
      const result = await client.invoke.doSomething({ arg: 123 }, { skip: 6 });
      expect(result.foo).toBe('bar');
      const request = mock.fake.getCall(0).args[0];
      expect(request.url).toBe('/doSomething?skip=6');
      expect(request.data.arg).toBe(123);
    });
  });
  describe('Mock', () => {
    it('No parameters. Ok', async () => {
      const mock = HttpClientMock.throws(new AssertionError({ message: 'HTTP request created but not expected' }));
      const client = createRestClient(mock);

      client.mock.INVALID_CUIT.retrieve.person[':id'](() => Promise.resolve(5));
      client.mock.INVALID_CUIT.retrieve.person.$id(() => Promise.resolve(5));
      client.mock.INVALID_CUIT({
        'retieve.person[:id]': () => Promise.resolve(5),
        'retieve.person': () => Promise.resolve(5)
      });
      client.mock.INVALID_CUIT.invoke.cars({
        ':id': () => Promise.resolve(5),
        '.': () => Promise.resolve(5)
      });
    });
  });
});
