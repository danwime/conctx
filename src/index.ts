import * as async_hooks from "async_hooks";
import * as util from "util";
import * as fs from "fs";

type AsyncNode = {
  asyncId: number,
  trigger?: AsyncNode,
  contexts?: Map<Symbol, Map<PropertyKey, any>>
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

//异步上下文
export class Context {
  constructor() {
    const ctxKey = Symbol(`conctx:${Math.round(Math.random() * 1000)}`);
    return Context.createProxy(this, ctxKey);
  }

  get size() {
    return asyncNodes.size
  }

  get asyncPath() {
    const paths = [];
    let asyncNode = asyncNodes.get(async_hooks.executionAsyncId());
    while (asyncNode) {
      paths.push(asyncNode.asyncId);
      asyncNode = asyncNode.trigger;
    }
    return paths.reverse();
  }

  static createProxy(target, ctxKey) {
    return new Proxy(target, {
      get(target: any, key: PropertyKey, receiver: any): any {
        if (target && target[key])
          return target[key];

        //获取对应的节点所对应的异步点
        let asyncNode = asyncNodes.get(async_hooks.executionAsyncId());
        //从下至上遍历
        while (asyncNode) {
          if (asyncNode.contexts && asyncNode.contexts.get(ctxKey)) {
            const values = asyncNode.contexts.get(ctxKey);
            const value = values.get(key);
            if (value)
              return value;
          }

          asyncNode = asyncNode.trigger;
        }
      },
      set(target: any, key: PropertyKey, value: any, receiver: any): boolean {
        if (target && target[key])
          return target[key] = value;

        const asyncNode = asyncNodes.get(async_hooks.executionAsyncId());
        if (asyncNode) {
          if (!asyncNode.contexts)
            asyncNode.contexts = new Map<symbol, Map<PropertyKey, any>>();
          if (!asyncNode.contexts.get(ctxKey))
            asyncNode.contexts.set(ctxKey, new Map<PropertyKey, any>());

          asyncNode.contexts.get(ctxKey).set(key, value);
          return true;
        } else
          return false;
      }
    });
  }
}
