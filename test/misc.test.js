import {sleep} from "./common";
import {createContext} from '../'

let context = createContext();

beforeAll(() => {
  context.value = 1;
});

test('其他测试', (done) => {
  expect(context.value).toBe(1);
  context.value = 2;
  setTimeout(async () => {
    context.value = 3;
    await sleep(10);
    expect(context.value).toBe(3);
    expect(context.all.value).toEqual([3, 2, 1]);
    done();
  }, 10)
});
