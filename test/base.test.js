import {sleep} from "./common";
import {createContext} from '../'

let context = createContext();

beforeAll(() => {
  context.current.value = 1;

});

test('获取上下文的值', () => {
  expect(context.value).toBe(1);
});

test('异步之后获取上下文的值', done => {
  setTimeout(() => {
    expect(context.value).toBe(1);
    done();
  }, 10)
});

test('修改值异步之后获取上下文的值', done => {
  context.current.value = 2;
  setTimeout(() => {
    expect(context.value).toBe(2);
    done();
  }, 10)
});

test('异步中修改值', async () => {
  expect(context.value).toBe(1);
  const f1 = async function () {
    await sleep(10);
    context.current.value = 2;
    await sleep(10);
    expect(context.value).toBe(2);
  };
  await f1();
  await sleep(10);
  expect(context.value).toBe(1);
});
