process.env.REST_CLIENT_TIMEOUT = '1000';
import { connect } from '../src';

describe('index', () => {
    it('creates a valid instance', async () => {
      const client = connect('http://www.google.com');
      expect(client).not.toBeFalsy();
    });
});
