import {createContext} from '../'

let context = createContext();

beforeAll(() => {
  context.value = 1;
});

test('获取当前异步节点上下文的值', () => {
  expect(context.current.value).toBeUndefined();
});

test('异步之后获取当前异步节点上下文的值', done => {
  setTimeout(() => {
    expect(context.current.value).toBeUndefined();
    done();
  }, 10)
});

test('修改值异步之后获取当前异步节点上下文的值', done => {
  context.value = 2;
  setTimeout(() => {
    expect(context.current.value).toBeUndefined();
    done();
  }, 10)
});

test('异步之后修改值,并获取当前异步节点上下文的值', done => {
  context.value = 2;
  setTimeout(() => {
    expect(context.current.value).toBeUndefined();
    context.value = 3;
    expect(context.current.value).toBe(3);
    done();
  }, 10)
});
