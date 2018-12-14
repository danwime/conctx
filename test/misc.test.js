import {Context} from '../'

let context = new Context();

beforeAll(() => {
  context.value = 1;
});

function sleep(timespan) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timespan)
  })
}

describe('其他测试', () => {
  test('测试', (done) => {
    expect(context.value).toBe(1);
    context.value = 2;
    setTimeout(async () => {
      context.value = 3;
      await sleep(10);
      expect(context.value).toBe(3);
      done();
    }, 10)
  });
});
