import { memo, useEffect } from 'react';
import { stringify } from 'qs';
import {
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  generatePath,
} from 'react-router-dom';
import type {
  RouteTo,
  RouteItem,
  RouteToObject,
  RouteRecordName,
  RouteParamsOrKey,
  RouteLocationNormalized,
  NavigationGuard,
} from './types';

export const helperSymbol = Symbol('#helperSymbol');

const matcherMap = new Map<RouteRecordName, RouteItem>();

export const isStr = (v: any): v is string => typeof v === 'string';

type AfterGuardFunction = () => void;
class AfterGuards {
  private static jumping = false;
  private static guard?: AfterGuardFunction;

  static start() {
    this.jumping = true;
  }

  static end() {
    this.jumping = false;
  }

  static add(cb: AfterGuardFunction) {
    this.guard = cb;
  }

  static run() {
    if (!this.jumping || !this.guard) {
      return;
    }

    try {
      this.guard();
    } catch {
      //
    }

    this.end();
  }
}

/**
 * 1、用这种方法来实现非 hooks 的路由跳转、参数获取，也可以避免这三个钩子的重复渲染问题
 * 2、使用这种方式来实现类似 vue-router-next 的路由别名、路由守卫
 *
 * @see https://github.com/remix-run/react-router/issues/7634
 * @see https://github.com/remix-run/react-router/issues/8349
 * @see https://github.com/remix-run/react-router/issues/8392
 *
 * @see https://github.com/remix-run/react-router/issues/8264#issuecomment-991271554
 * 本来可以用 HistoryRouter 的，但是在 v6.1.1 又被标记为 unstable_HistoryRouter 了
 */
export class RouterHelper {
  private static guard?: NavigationGuard;
  static isReady = false;

  private static all<ParamsOrKey extends RouteParamsOrKey = string>() {
    return (window as any)[helperSymbol] as Pick<
      RouteLocationNormalized<ParamsOrKey>,
      'navigate' | 'location' | 'params' | 'query' | 'setQuery'
    >;
  }

  static get instance() {
    return {
      ...this.all(),
      navigate: this.runGuard.bind(this) as (to: RouteTo) => void,
    };
  }

  /**
   * 前置路由守卫
   *
   * 当前只支持一个守卫
   *
   * @param guard 守卫方法
   */
  static beforeEach(guard: NavigationGuard) {
    this.guard = guard;
  }

  /**
   * 后置路由守卫
   *
   * 当前只支持一个守卫
   *
   * @param guard 守卫方法
   */
  static afterEach(guard: AfterGuardFunction) {
    AfterGuards.add(guard);
  }

  private static abort(message: string): never {
    throw new Error(`[vite-plugin-react-auto-config - RouterHelper]: ${message}`);
  }

  static resolveRouteTo(to: RouteTo) {
    const innerTo = {
      ...(isStr(to) ? { path: to } : to),
    } as RouteToObject;

    let fullPath = innerTo.path || '';

    if (!isStr(to)) {
      const findRouteKey = to.name || to.path;
      const toRoute = matcherMap.get(findRouteKey || '');

      if (!toRoute) {
        this.abort(`Route ${findRouteKey} not found`);
      }

      innerTo.path = toRoute.path;
      innerTo.name = toRoute.name;
      fullPath = toRoute.fullPath;

      if (to.meta && !innerTo.meta) {
        innerTo.meta = to.meta;
      }
    }

    const pathname = !innerTo.params ? fullPath : generatePath(fullPath, innerTo.params);

    return {
      ...innerTo,
      path: innerTo.path || '',
      fullPath: pathname,
      search: !innerTo.query ? '' : `?${stringify(innerTo.query)}`,
    };
  }

  static resolveRouteFrom() {
    const all = this.all();

    return {
      ...all.location,
      path: all.location.pathname,
      query: all.query,
      params: all.params,
      meta: {},
    };
  }

  private static async runGuardDecorator<F extends () => any>(fn: F) {
    AfterGuards.start();

    try {
      return await fn();
    } catch (error) {
      console.error(error);

      return false;
    }
  }

  static ready() {
    return this.runGuardDecorator(async () => {
      // 只执行一次
      if (RouterHelper.isReady) {
        return RouterHelper.isReady;
      }

      if (this.guard) {
        const to = this.resolveRouteFrom();
        const result = await this.guard({ to });

        return result !== false;
      }

      return true;
    }).finally(() => {
      // 不管守卫是否通过，都设置为已经 ready
      RouterHelper.isReady = true;

      // 初始化的时候需要手动关闭
      AfterGuards.run();
    });
  }

  private static runGuard(to: RouteTo) {
    return this.runGuardDecorator(async () => {
      const all = this.all();

      const from = this.resolveRouteFrom();

      // 这种情况是适配 RouterHelperLink 组件这种已经解析过的路由，减少重复操作
      const _to =
        !isStr(to) && (to as ReturnType<typeof this.resolveRouteTo>).fullPath
          ? (to as ReturnType<typeof this.resolveRouteTo>)
          : this.resolveRouteTo(to);

      // todo: 是否需要加上 search 跟 state
      // 路径相同，不需要跳转
      if (from.path === _to.fullPath) {
        return;
      }

      if (this.guard) {
        const result = await this.guard({ to: _to, from });

        if (result === false) {
          return;
        }
      }

      all.navigate(
        {
          pathname: _to.fullPath,
          search: _to.search,
        },
        {
          state: _to.state,
          replace: _to.replace,
        },
      );
    });
  }

  static addRoute(route: RouteItem, parentRoute?: RouteItem) {
    // index=true 的时候，取父路由的 path
    const name = route.name || parentRoute?.name;
    const path = route.path || parentRoute?.path;

    if (!name && !path) {
      this.abort('Route name is required');
    }

    // 兼容拼接路径可能有用 /，也可能没用 / 的情况
    const fullPath = `/${parentRoute?.path || ''}/${path}`.replace(/\/\/\/\/|\/\/\/|\/\//g, '/');

    matcherMap.set(name || fullPath, { ...route, path, fullPath });

    if (route.children) {
      const children = route.children;
      for (let i = 0; i < children.length; i += 1) {
        this.addRoute(children[i], route);
      }
    }
  }

  static getRoutes() {
    return matcherMap;
  }

  static removeRoute(name: RouteRecordName) {
    matcherMap.delete(name);
  }

  static addRoutes(routes: RouteItem[]) {
    for (const route of routes) {
      this.addRoute(route);
    }
  }

  static push(to: RouteTo) {
    this.instance.navigate(to);
  }

  static replace(to: RouteTo) {
    this.instance.navigate({ ...(isStr(to) ? { path: to } : to), replace: true });
  }

  static go(to: number) {
    this.instance.navigate(Number(to) as any);
  }

  static back() {
    this.go(-1);
  }

  static forward() {
    this.go(1);
  }
}

export const InjectionRouterHelper = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [query, setQuery] = useSearchParams();

  (window as any)[helperSymbol] = {
    navigate,
    location,
    params,
    query,
    setQuery,
  };

  useEffect(() => {
    if (RouterHelper.isReady) {
      AfterGuards.run();
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
});
