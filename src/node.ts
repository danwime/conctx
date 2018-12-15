import * as async_hooks from "async_hooks";

type AsyncNode = {
  asyncId: number,
  trigger?: AsyncNode,
  contexts?: WeakMap<Object, Map<PropertyKey, any>>
};

//所有的异步点集合
export const asyncNodes = new Map<number, AsyncNode>();

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

