import {sleep} from "./common";
import {createContext} from '../'

let context = createContext();
let context2 = createContext();

beforeAll(() => {
  context.value = 1;
  context2.value = 'a';
});

test('多个context,获取值', async () => {
  const f1 = async function () {
    await sleep(10);
    context.value = 2;
    context2.value = 'b';
    await sleep(10);
    expect(context.value).toBe(2);
    expect(context2.value).toBe('b');
    return [context.value, context2.value];
  };

  const f2 = async function () {
    await sleep(10);
    context.value = 3;
    context2.value = 'c';
    await sleep(10);
    expect(context.value).toBe(3);
    expect(context2.value).toBe('c');
    return [context.value, context2.value]
  };

  let result = await Promise.all([f1(), f2()]);
  expect(result).toEqual([[2, 'b'], [3, 'c']]);
  expect(context.value).toBe(1);
  expect(context2.value).toBe('a');
});

test('多个context,并行流获取所有值测试', async () => {
  const f1 = async function () {
    await sleep(10);
    context.value = 2;
    context2.value = 'b';
    await sleep(10);
    expect(context.all.value).toEqual([2, 1]);
    expect(context2.all.value).toEqual(['b', 'a']);
    return [context.all.value, context2.all.value];
  };

  const f2 = async function () {
    await sleep(10);
    context.value = 3;
    context2.value = 'c';
    await sleep(10);
    expect(context.all.value).toEqual([3, 1]);
    expect(context2.all.value).toEqual(['c', 'a']);
    return [context.all.value, context2.all.value]
  };

  let result = await Promise.all([f1(), f2()]);
  expect(result).toEqual([[[2, 1], ['b', 'a']], [[3, 1], ['c', 'a']]]);
  expect(context.all.value).toEqual([1]);
  expect(context2.all.value).toEqual(['a']);
});
