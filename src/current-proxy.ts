import * as async_hooks from "async_hooks";
import {asyncNodes} from "./node";

export function createCurrentProxy(context) {
  return new Proxy({}, {
    get(target: any, key: PropertyKey): any {
      let asyncNode = asyncNodes.get(async_hooks.executionAsyncId());
      if (asyncNode.contexts && asyncNode.contexts.get(context))
        return asyncNode.contexts.get(context).get(key);
    },
    set(target: any, key: PropertyKey, value: any): boolean {
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
