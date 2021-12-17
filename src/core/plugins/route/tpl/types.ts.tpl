import type {
  NavigateFunction,
  Location,
  Params,
  Path as RoutePath,
  URLSearchParamsInit,
  NavigateOptions,
} from 'react-router-dom';
import type { RouteItem as OriginRouteItem } from '@/.vite-plugin-react-auto-config/@types';

export type RouteRecordName = string | symbol;

export type RouteParamsOrKey = string | Record<string, string | undefined>;
export type RouteNavigateOptions = NavigateOptions;

export type RouteLocationNormalized<ParamsOrKey extends RouteParamsOrKey = string> = {
  navigate: NavigateFunction;
  location: Location;
  path: string;
  name: string | null | undefined;
  meta: Record<string | number | symbol, unknown>;
  params: Readonly<[ParamsOrKey] extends [string] ? Params<ParamsOrKey> : Partial<ParamsOrKey>>;
  query: URLSearchParams;
  setQuery: (
    nextInit: URLSearchParamsInit,
    navigateOptions?:
      | {
          replace?: boolean | undefined;
          state?: any;
        }
      | undefined,
  ) => void;
};

export type RouteLocationRaw = string | Location;

/**
 * @refs https://github.com/vuejs/vue-router-next/blob/23a6a494c0acbc429bc21cdf8cc1e27730cd82c8/src/types/index.ts?_pjax=%23js-repo-pjax-container%2C%20div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20main%2C%20%5Bdata-pjax-container%5D#L386
 */
export type NavigationGuardReturn = void | Error | RouteLocationRaw | boolean;

export type RouteToObject = Partial<
  RoutePath &
    Pick<RouteLocationNormalized<any>, 'name' | 'path' | 'meta'> & {
      state: any;
      replace: boolean;
      query: Record<string, any>;
      params: Record<string, any>;
    }
>;

export type RouteTo = string | RouteToObject;

type _RouteLocationBase = Partial<Pick<RouteLocationNormalized, 'meta'>> & {
  path: RouteLocationNormalized['location']['pathname'];
} & Partial<RouteLocationNormalized['location']> &
  Pick<RouteToObject, 'query' | 'params'>;

export type NavigationGuard = (p: {
  to: _RouteLocationBase;
  from?: _RouteLocationBase;
}) => NavigationGuardReturn | Promise<NavigationGuardReturn>;

export type RouteItem = Omit<OriginRouteItem, 'component' | 'routes'> & {
  element: JSX.Element;
  children?: RouteItem[];
};
