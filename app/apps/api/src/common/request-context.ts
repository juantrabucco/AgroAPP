import { AsyncLocalStorage } from 'async_hooks';

export type RequestContext = {
  user?: any;
  companyId?: string;
  fieldIds?: string[];
};

export const ctxStorage = new AsyncLocalStorage<RequestContext>();

export function getCtx() { return ctxStorage.getStore(); }
export function runWithCtx<T>(ctx: RequestContext, fn: () => T) { return ctxStorage.run(ctx, fn); }
