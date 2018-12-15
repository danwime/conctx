import {createContext} from '../'

let context = createContext();

beforeAll(() => {
  context.current.value = 1;
});

test('获取上下文的值', () => {
  expect(context.all.value).toEqual([1]);
});

test('异步之后获取上下文的值', done => {
  setTimeout(() => {
    expect(context.all.value).toEqual([1]);
    done();
  }, 10)
});

test('修改值异步之后获取上下文的值', done => {
  context.current.value = 2;
  setTimeout(() => {
    expect(context.all.value).toEqual([2, 1]);
    done();
  }, 10)
});
