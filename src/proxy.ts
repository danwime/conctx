import * as async_hooks from "async_hooks";
import {asyncNodes} from "./node";

export function createProxy(context) {
  return new Proxy(context, {
    get(target: any, key: PropertyKey, receiver: any): any {
      if (target && target[key])
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
    set(target: any, key: PropertyKey, value: any, receiver: any): boolean {
      if (target && target[key])
        return false;

      const asyncNode = asyncNodes.get(async_hooks.executionAsyncId());
      if (asyncNode) {
        if (!asyncNode.contexts)
          asyncNode.contexts = new WeakMap<Object, Map<PropertyKey, any>>();
        if (!asyncNode.contexts.get(context))
          asyncNode.contexts.set(context, new Map<PropertyKey, any>());

        asyncNode.contexts.get(context).set(key, value);
        return true;
      } else
        return false;
    }
  });
}
