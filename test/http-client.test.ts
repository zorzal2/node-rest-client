import create from '../src/http-client';
import express from 'express';
import { ErrorCodes } from '../src/error-codes';
import { HttpRequest, HttpOperation } from '../src/http-client/model';

const app = express();

const post = new HttpOperation('POST', true, true);

app.post('/personas', function (req, res) {
  res.json([1, 'Foo', req.query]);
});

app.post('/err/:n', function (req, res) {
  res.sendStatus(Number.parseInt(req.params.n, 10)).json(req.params);
});

let server;
const ready = new Promise((resolve, reject) => {
  server = app.listen(8989, async function() {
    resolve();
  });
});

describe('HTTP Client', () => {
  describe('Create', () => {
    test('Correct URL, with timeout.', () => {
      const client = create('http://localhost:8989', 20000);
      expect(client).toBeTruthy();
    });
    test('Correct URL, without timeout.', () => {
      const client = create('http://localhost:8989', 20000);
      expect(client).toBeTruthy();
    });
    test('Invalid URL.', () => {
      try {
        create('Bad URL');
        fail('Error was expected');
      } catch (err) {
        expect(ErrorCodes.invalidEndpoint.is(err)).toBeTruthy();
      }
    });
  });
  describe('request', () => {
    test('Post OK', async done => {
      await ready;
      try {
        const client = create('http://localhost:8989', 20000);
        const array = await client.request(new HttpRequest(post, '/personas'));
        expect(array).toHaveLength(3);
        expect(array[0]).toBe(1);
        expect(array[1]).toBe('Foo');
        done();
      } catch (err) {
        done(err);
      }
    });
    test('Post. 500', async done => {
      await ready;
      const client = create('http://localhost:8989', 20000);
      try {
        await client.request(new HttpRequest(post, '/err/500'));
        fail();
      } catch (err) {
        expect(ErrorCodes.internal.is(err)).toBeTruthy();
        expect(err.info.status).toBe(500);
        done();
      }
    });
    test('Post. 499 (unknown error code)', async done => {
      await ready;
      const client = create('http://localhost:8989', 20000);
      try {
        await client.request(new HttpRequest(post, '/err/499'));
        fail();
      } catch (err) {
        expect(ErrorCodes.internal.is(err)).toBeTruthy();
        expect(err.info.status).toBe(499);
        done();
      }
    });
    test('Post. 404 with body', async done => {
      await ready;
      const client = create('http://localhost:8989', 20000);
      try {
        await client.request(new HttpRequest(post, '/err/404?message=Hello&code=foo&info=bar&stack=this_is_a_stack'));
        fail();
      } catch (err) {
        console.log(err)
        expect(err.code).toBe('foo');
        expect(err.message).toBe('foo');
        expect(err.info).toBe('bar');
        done();
      }
    });
  });
  afterAll(() => {
    server.close();
  });
});
