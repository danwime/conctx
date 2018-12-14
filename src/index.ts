import * as async_hooks from "async_hooks";
import * as util from "util";
import * as fs from "fs";

type AsyncNode = {
  asyncId: number,
  trigger?: AsyncNode,
  contexts?: WeakMap<Object, Map<PropertyKey, any>>
};

//所有的异步点集合
const asyncNodes = new Map<number, AsyncNode>();

function print(...args: any[]) {
  args.map(it => util.inspect(it)).forEach(it => fs.writeSync(1, it));
  fs.writeSync(1, '\n');
}

//异步点钩子
async_hooks.createHook({
  init(asyncId: number, type: string, triggerAsyncId: number, resource: Object): void {
    //获取触发的异步点
    let trigger = asyncNodes.get(triggerAsyncId);
    if (!trigger) {
      //没有的话则新建一个
      trigger = {
        asyncId: triggerAsyncId
      };
      asyncNodes.set(triggerAsyncId, trigger)
    }

    //建立本节点
    let asyncNode: AsyncNode = {
      asyncId,
      trigger
    };
    asyncNodes.set(asyncId, asyncNode);
  },

  destroy(asyncId: number): void {
    asyncNodes.delete(asyncId);
  }
}).enable();

function createProxy(context) {
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

function createAllProxy(context) {
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
  });
}

//异步上下文
export function createContext() {
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
  return createProxy(context);
}
