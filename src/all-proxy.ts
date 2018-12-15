import * as async_hooks from "async_hooks";
import {asyncNodes} from "./node";

export function createAllProxy(context) {
  return new Proxy({}, {
    get(target: any, key: PropertyKey, receiver: any): any {
      const result = [];
      //获取对应的节点所对应的异步点
      let asyncNode = asyncNodes.get(async_hooks.executionAsyncId());
      //从下至上遍历
      while (asyncNode) {
        if (asyncNode.contexts && asyncNode.contexts.get(context)) {
          const values = asyncNode.contexts.get(context);
          if (values.has(key))
            result.push(values.get(key));
        }

        asyncNode = asyncNode.trigger;
      }

      return result;
    },
    set(target: any, key: PropertyKey, value: any): boolean {
      //获取对应的节点所对应的异步点
      let asyncNode = asyncNodes.get(async_hooks.executionAsyncId());
      //从下至上遍历
      while (asyncNode) {
        if (asyncNode.contexts && asyncNode.contexts.get(context)) {
          const values = asyncNode.contexts.get(context);
          if (values.has(key)) {
            if (value === undefined)
              values.delete(key);
            else
              values.set(key, value)
          }
        }

        asyncNode = asyncNode.trigger;
      }

      return true;
    }
  });
}
