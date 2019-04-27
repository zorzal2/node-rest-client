import { connect } from '../src/rest-client';
import express from 'express';

const isEmpty = (o: object) => Object.keys(o).length === 0;

const app = express();

// List
app.get('/personas/123/phones', function (req, res) {
  res.json([1, 'Foo', req.query]);
});

// Get
app.get('/personas/123', function (req, res) {
  res.json(req.query);
});


let server;
const ready = new Promise((resolve, reject) => {
  server = app.listen(8989, async function() {
    resolve();
  });
});
const client = connect('http://localhost:8989');

describe('REST Client', () => {
  describe('List', () => {
    test('No options.', async done => {
      await ready;
      try {
        const array = await client.list.personas[123].phones();
        expect(array).toHaveLength(3);
        expect(array[0]).toBe(1);
        expect(array[1]).toBe('Foo');
        expect(isEmpty(array[2])).toBeTruthy();
        done();
      } catch (err) {
        done(err);
      }
    });
    test('With options.', async done => {
      await ready;
      try {
        const array = await client.list.personas[123].phones({type: 'mobile'});
        expect(array).toHaveLength(3);
        expect(array[0]).toBe(1);
        expect(array[1]).toBe('Foo');
        expect(array[2].type).toBe('mobile');
        done();
      } catch (err) {
        done(err);
      }
    });
    test('With array options.', async done => {
      await ready;
      try {
        const array = await client.list.personas[123].phones(['hello']);
        expect(array[2][0]).toBe('hello');
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  describe('Get', () => {
    test('No arguments.', async done => {
      await ready;
      try {
        const result = await client.get.personas[123]();
        expect(isEmpty(result)).toBeTruthy();
        done();
      } catch (err) {
        done(err);
      }
    });
    test('With object options.', async done => {
      await ready;
      try {
        const result = await client.get.personas[123]({type: 'mobile'});
        expect(result.type).toBe('mobile');
        done();
      } catch (err) {
        done(err);
      }
    });
    test('With id.', async done => {
      await ready;
      try {
        const result = await client.get.personas(123);
        expect(isEmpty(result)).toBeTruthy();
        done();
      } catch (err) {
        done(err);
      }
    });
  });
  afterAll(() => {
    server.close();
  });
});
