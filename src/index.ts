import * as async_hooks from "async_hooks";
import {AsyncNode, asyncNodes} from "./node";
import {createProxy} from "./proxy";
import {createAllProxy} from "./all-proxy";
import {createCurrentProxy} from "./current-proxy";

type Context = {
  size: number,
  asyncPath: number[],
  asyncNode: AsyncNode,
  all: any,
  current: any
} | any

//创建异步上下文
export function createContext(): Context {
  const context: any = {
    get size() {
      return asyncNodes.size
    },
    get asyncPath() {
      const paths = [];
      let asyncNode = asyncNodes.get(async_hooks.executionAsyncId());
      while (asyncNode) {
        paths.push(asyncNode.asyncId);
        asyncNode = asyncNode.trigger;
      }
      return paths.reverse();
    },
    get asyncNode() {
      return asyncNodes.get(async_hooks.executionAsyncId());
    }
  };

  context.all = createAllProxy(context);
  context.current = createCurrentProxy(context);
  return createProxy(context);
}
