export type FunctionProxy<T extends Function> = T & {
  [prop in string | number]: FunctionProxy<T>;
};

const handler = {
  get: ({ func, path }, prop) => partialProxy(func, [...path, prop]),
  apply: ({ func, path }, _, args) => Reflect.apply(func, path, args)
};

function partialProxy(func, path: any[]): any {
  const target = Object.assign(() => 1, { func, path });
  return new Proxy(target, handler);
}

export default function functionProxy<T extends Function>(func: T): FunctionProxy<T> {
  return partialProxy(func, []);
}
