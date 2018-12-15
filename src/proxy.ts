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

      const asyncNode = asyncNodes.get(async_hooks.executionAsyncId());

      if (!asyncNode.contexts) {
        if (value === undefined)
          return true;

        asyncNode.contexts = new WeakMap<Object, Map<PropertyKey, any>>();
      }

      if (!asyncNode.contexts.get(context)) {
        if (value === undefined)
          return true;

        asyncNode.contexts.set(context, new Map<PropertyKey, any>());
      }

      if (value === undefined)
        asyncNode.contexts.get(context).delete(key);  //如果是undefined,则删除对应的key
      else
        asyncNode.contexts.get(context).set(key, value);

      return true;
    }
  });
}
