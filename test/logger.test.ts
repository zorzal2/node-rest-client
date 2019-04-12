const baseStdoutWrite = process.stdout.write.bind(process.stdout);
const baseStdErrWrite = process.stdout.write.bind(process.stderr);

const stdoutMessages: any[] = [];
process.stdout.write = message => {
  stdoutMessages.push(message);
  return baseStdoutWrite(message);
};

const stderrMessages: any[] = [];
process.stderr.write = message => {
  stderrMessages.push(message);
  return baseStdErrWrite(message);
};

import logger from '../src/index';

const defaultLogLevel = 'all';

describe('Default logger', () => {
  test('Label is empty', () => {
    expect(logger.getLabel()).toBe('');
  });
  test('Default level is debug', () => {
    expect(logger.getLevel()).toBe(defaultLogLevel);
  });
  test('level can be changed', () => {
    logger.setLevel('error');
    expect(logger.getLevel()).toBe('error');
    logger.setLevel(defaultLogLevel);
    expect(logger.getLevel()).toBe(defaultLogLevel);
  });
  test('Sublogger inherits global level', () => {
    const sublogger = logger.create('sublogger');
    expect(sublogger.getLevel()).toBe(defaultLogLevel);
    logger.setLevel('error');
    expect(logger.getLevel()).toBe('error');
    expect(sublogger.getLevel()).toBe('error');
  });
  test('Sublogger can have its own  level', () => {
    const sublogger = logger.create('sublogger', 'info');
    expect(sublogger.getLevel()).toBe('info');
    logger.setLevel('error');
    expect(sublogger.getLevel()).toBe('info');
    logger.setLevel('debug');
  });
  test('level actually filter messages', () => {
    const sublogger = logger.create('sublogger');
    sublogger.info('hello', 'world');
    expect(stdoutMessages).toHaveLength(1);
    expect(stdoutMessages[0]).toMatch(/.+ INFO: hello world\n/);
    logger.setLevel('error');
    sublogger.debug('hello', 'world');
    expect(stdoutMessages).toHaveLength(1);
  });
  test('Warnings and errors goes to stderr', () => {
    const initialStdoutLength = stdoutMessages.length;
    const initialStderrLength = stderrMessages.length;

    logger.setLevel('debug');

    const sublogger = logger.create('sublogger');
    logger.error('hello', 'world');
    expect(stderrMessages).toHaveLength(initialStderrLength + 1);
    expect(stderrMessages[stderrMessages.length - 1]).toMatch(/.+ ERROR: hello world\n/);

    sublogger.warning('fooBar');
    expect(stderrMessages).toHaveLength(initialStderrLength + 2);
    expect(stderrMessages[stderrMessages.length - 1]).toMatch(/.+ WARNING: fooBar\n/);

    // stdout does not changed
    expect(stdoutMessages).toHaveLength(initialStdoutLength);
  });
  test('Non-strings are converted to string', () => {
    logger.error(undefined, null);
    expect(stderrMessages[stderrMessages.length - 1]).toMatch(/.+ ERROR: undefined null\n/);

    logger.error(67.456);
    expect(stderrMessages[stderrMessages.length - 1]).toMatch(/.+ ERROR: 67.456\n/);

    logger.error(true);
    expect(stderrMessages[stderrMessages.length - 1]).toMatch(/.+ ERROR: true\n/);

    logger.error(['Hugo', 'Paco', 'Luis']);
    expect(stderrMessages[stderrMessages.length - 1]).toMatch(/.+ \["Hugo","Paco","Luis"\]\n/);

    logger.error({ foo: 'bar' });
    expect(stderrMessages[stderrMessages.length - 1]).toMatch(/.+ {"foo":"bar"}\n/);

    logger.error(new TypeError('Error'));
    expect(stderrMessages[stderrMessages.length - 1]).toMatch(/.+ TypeError: Error\s+at /);
  });
});
