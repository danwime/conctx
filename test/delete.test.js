import {createContext} from '../'
import {sleep} from "./common";

let context = createContext();

beforeAll(() => {
  context.current.value = 1;
});

test('删除当前上下文的值', async () => {
  await sleep(10);
  context.current.value = undefined;
  expect(context.value).toEqual(1);
  expect(context.current.value).toBeUndefined();
  expect(context.all.value).toEqual([1]);
});

test('删除链路的所有上下文的值', async () => {
  context.current.value = 2;
  await sleep(10);
  expect(context.all.value).toEqual([2, 1]);
  context.current.value = 3;
  expect(context.value).toEqual(3);
  await sleep(10);
  context.current.value = undefined;
  expect(context.value).toBe(3);
  expect(context.current.value).toBeUndefined();
  expect(context.all.value).toEqual([3, 2, 1]);
  await sleep(10);
  context.all.value = undefined;
  expect(context.all.value).toEqual([]);
});

test('异步之后删除上下文的值', done => {
  context.all.value = undefined;
  setTimeout(() => {
    expect(context.all.value).toEqual([]);
    done();
  }, 10)
});

test('多个异步删除上下文的值', done => {
  context.current.value = 2;
  setTimeout(async () => {
    context.all.value = undefined;
    await sleep(10);
    expect(context.all.value).toEqual([]);
    done();
  }, 10)
});
