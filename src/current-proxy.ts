import * as async_hooks from "async_hooks";
import {asyncNodes} from "./node";

export function createCurrentProxy(context) {
  return new Proxy({}, {
    get(target: any, key: PropertyKey, receiver: any): any {
      let asyncNode = asyncNodes.get(async_hooks.executionAsyncId());
      if (asyncNode.contexts && asyncNode.contexts.get(context))
        return asyncNode.contexts.get(context).get(key);
    }
  });
}
