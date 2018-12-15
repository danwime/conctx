import * as async_hooks from "async_hooks";
import {asyncNodes} from "./node";

export function createProxy(context) {
  return new Proxy(context, {
    get(target: any, key: PropertyKey): any {
      //如果是context中已经存在属性,则返回
      if (key in target)
        return target[key];

      //获取对应的节点所对应的异步点
      let asyncNode = asyncNodes.get(async_hooks.executionAsyncId());
      //从下至上遍历
      while (asyncNode) {
        if (asyncNode.contexts && asyncNode.contexts.get(context)) {
          const values = asyncNode.contexts.get(context);
          if (values.has(key))
            return values.get(key);
        }

        asyncNode = asyncNode.trigger;
      }
    },
    set(target: any, key: PropertyKey, value: any): boolean {
      //不能修改已经存在的属性
      if (key in target)
        return false;

      //获取对应的节点所对应的异步点
      let asyncNode = asyncNodes.get(async_hooks.executionAsyncId());
      //从下至上遍历,找到第一个有值的节点
      while (asyncNode) {
        if (asyncNode.contexts && asyncNode.contexts.get(context)) {
          const values = asyncNode.contexts.get(context);
          if (values.has(key)) {
            if (value === undefined)
              values.delete(key);
            else
              values.set(key, value);

            return true
          }
        }

        asyncNode = asyncNode.trigger;
      }

      return true;
    }
  });
}
