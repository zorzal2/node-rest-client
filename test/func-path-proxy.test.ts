import functionProxy from '../src/func-path-proxy';


describe('Path Proxy', () => {
  test('Invoke method with arguments', () => {
    const Ppx = functionProxy(function(o: object, n: number) {
        return { path: this, o, n};
    });

    let result = Ppx.personas[123].phones.type({ hello: 'world' }, 77);

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
    const Ppx = functionProxy(function() {
        return this;
    });

    let result = Ppx.personas[123].phones.type();

    expect(result).toHaveLength(4);
    expect(result[0]).toBe('personas');
    expect(result[1]).toBe('123');
    expect(result[2]).toBe('phones');
    expect(result[3]).toBe('type');
  });
  test('Reuse proxy', () => {
    const Ppx = functionProxy(function() {
        return this;
    });

    let result = Ppx.personas[123]();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('personas');
    expect(result[1]).toBe('123');

    result = Ppx.phones.mobile();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('phones');
    expect(result[1]).toBe('mobile');

  });
  test('Subproxy', () => {
    const Ppx = functionProxy(function(n: number) {
        return { path: this, arg: n };
    });

    let personas = Ppx.personas;

    let result = personas(4);
    expect(result.path).toHaveLength(1);
    expect(result.path[0]).toBe('personas');
    expect(result.arg).toBe(4);

    result = personas(5);
    expect(result.path).toHaveLength(1);
    expect(result.path[0]).toBe('personas');
    expect(result.arg).toBe(5);

    result = personas.phones(6);
    expect(result.path).toHaveLength(2);
    expect(result.path[0]).toBe('personas');
    expect(result.path[1]).toBe('phones');
    expect(result.arg).toBe(6);

    result = personas[44](7);
    expect(result.path).toHaveLength(2);
    expect(result.path[0]).toBe('personas');
    expect(result.path[1]).toBe('44');
    expect(result.arg).toBe(7);
  });
});
