import {sleep} from "./common";
import {createContext} from '../'

let context = createContext();

beforeAll(() => {
  context.value = 1;
});

test('并行测试', async () => {
  const f1 = async function () {
    await sleep(10);
    context.value = 2;
    await sleep(10);
    expect(context.value).toBe(2);
    return context.value;
  };

  const f2 = async function () {
    await sleep(10);
    context.value = 3;
    await sleep(10);
    expect(context.value).toBe(3);
    return context.value
  };

  let result = await Promise.all([f1(), f2()]);
  expect(result).toEqual([2, 3]);
  expect(context.value).toBe(1);
});

test('并行流获取所有值测试', async () => {
  const f1 = async function () {
    await sleep(10);
    context.value = 2;
    await sleep(10);
    expect(context.all.value).toEqual([2, 1]);
    return context.all.value;
  };

  const f2 = async function () {
    await sleep(10);
    context.value = 3;
    await sleep(10);
    expect(context.all.value).toEqual([3, 1]);
    return context.all.value
  };

  let result = await Promise.all([f1(), f2()]);
  expect(result).toEqual([[2, 1], [3, 1]]);
  expect(context.all.value).toEqual([1]);
});
