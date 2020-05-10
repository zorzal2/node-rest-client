import functionProxy from '../src/rest-client/func-path-proxy';
import { expect } from 'chai';

const X = {
  get: functionProxy(function (o: object, n: number) {
    return { path: this, o, n };
  }),
  path: functionProxy(function () {
    return this;
  })
};

describe('Path Proxy', () => {
  it('Invoke method with arguments', () => {

    let result = X.get.personas[123].phones.type({ hello: 'world' }, 77);

    expect(result.path).to.have.lengthOf(4);
    expect(result.path[0]).to.eq('personas');
    expect(result.path[1]).to.eq('123');
    expect(result.path[2]).to.eq('phones');
    expect(result.path[3]).to.eq('type');
// tslint:disable-next-line: no-string-literal
    expect(result.o['hello']).to.eq('world');
    expect(result.n).to.eq(77);
  });
  it('Invoke method without arguments', () => {

    let result = X.path.personas[123].phones.type();

    expect(result).to.have.lengthOf(4);
    expect(result[0]).to.eq('personas');
    expect(result[1]).to.eq('123');
    expect(result[2]).to.eq('phones');
    expect(result[3]).to.eq('type');
  });
  it('Reuse proxy', () => {

    let result = X.path.personas[123]();
    expect(result).to.have.length(2);
    expect(result[0]).to.eq('personas');
    expect(result[1]).to.eq('123');

    result = X.path.phones.mobile();
    expect(result).to.have.lengthOf(2);
    expect(result[0]).to.eq('phones');
    expect(result[1]).to.eq('mobile');

  });
  it('Subproxy', () => {

    let personas = X.get.personas;

    let result = personas({ foo: 'bar' }, 4);
    expect(result.path).to.have.lengthOf(1);
    expect(result.path[0]).to.eq('personas');
    expect(result.n).to.eq(4);
// tslint:disable-next-line: no-string-literal
    expect(result.o['foo']).to.eq('bar');

    result = personas({}, 5);
    expect(result.path).to.have.lengthOf(1);
    expect(result.path[0]).to.eq('personas');
    expect(result.n).to.eq(5);
    expect(JSON.stringify(result.o)).to.eq(JSON.stringify({}));

    result = personas.phones({}, 6);
    expect(result.path).to.have.lengthOf(2);
    expect(result.path[0]).to.eq('personas');
    expect(result.path[1]).to.eq('phones');
    expect(result.n).to.eq(6);

    result = personas[44]({}, 7);
    expect(result.path).to.have.lengthOf(2);
    expect(result.path[0]).to.eq('personas');
    expect(result.path[1]).to.eq('44');
    expect(result.n).to.eq(7);
  });
});
