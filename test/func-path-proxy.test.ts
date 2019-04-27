import functionProxy from '../src/rest-client/func-path-proxy';

const X = {
  get: functionProxy(function (o: object, n: number) {
    return { path: this, o, n };
  }),
  path: functionProxy(function () {
    return this;
  })
};

describe('Path Proxy', () => {
  test('Invoke method with arguments', () => {

    let result = X.get.personas[123].phones.type({ hello: 'world' }, 77);

    expect(result.path).toHaveLength(4);
    expect(result.path[0]).toBe('personas');
    expect(result.path[1]).toBe('123');
    expect(result.path[2]).toBe('phones');
    expect(result.path[3]).toBe('type');
// tslint:disable-next-line: no-string-literal
    expect(result.o['hello']).toBe('world');
    expect(result.n).toBe(77);
  });
  test('Invoke method without arguments', () => {

    let result = X.path.personas[123].phones.type();

    expect(result).toHaveLength(4);
    expect(result[0]).toBe('personas');
    expect(result[1]).toBe('123');
    expect(result[2]).toBe('phones');
    expect(result[3]).toBe('type');
  });
  test('Reuse proxy', () => {

    let result = X.path.personas[123]();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('personas');
    expect(result[1]).toBe('123');

    result = X.path.phones.mobile();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('phones');
    expect(result[1]).toBe('mobile');

  });
  test('Subproxy', () => {

    let personas = X.get.personas;

    let result = personas({ foo: 'bar' }, 4);
    expect(result.path).toHaveLength(1);
    expect(result.path[0]).toBe('personas');
    expect(result.n).toBe(4);
// tslint:disable-next-line: no-string-literal
    expect(result.o['foo']).toBe('bar');

    result = personas({}, 5);
    expect(result.path).toHaveLength(1);
    expect(result.path[0]).toBe('personas');
    expect(result.n).toBe(5);
    expect(JSON.stringify(result.o)).toBe(JSON.stringify({}));

    result = personas.phones({}, 6);
    expect(result.path).toHaveLength(2);
    expect(result.path[0]).toBe('personas');
    expect(result.path[1]).toBe('phones');
    expect(result.n).toBe(6);

    result = personas[44]({}, 7);
    expect(result.path).toHaveLength(2);
    expect(result.path[0]).toBe('personas');
    expect(result.path[1]).toBe('44');
    expect(result.n).toBe(7);
  });
});
