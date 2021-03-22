import { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';

import type { LoadableComponent } from '@loadable/component';
import type { RouteItem } from '../@types';

import { getRoutes } from './routes';

type TRouteItem = Omit<RouteItem, 'component'> & {
  component: LoadableComponent<Record<string, unknown>>;
  routes?: TRouteItem[];
};

function renderRoute(route: TRouteItem) {
  const { component: Component } = route;

  /**
   * @see https://github.com/ReactTraining/react-router/blob/dev/docs/installation/getting-started.md#descendant-routes
   *
   * 在 v6 下，需要在父级路径中加入 * 后缀，才能正常显示此嵌套的下级路由
   */
  const path = route.routes?.length ? `${route.path}/*`.replace(/\/\//, '/') : route.path;

  return (
    <Route
      key={route.path}
      path={path}
      element={route.routes?.length ? renderRoutes(route) : <Component />}
    />
  );
}

function renderRoutes(route: TRouteItem) {
  const { component: Component } = route;

  return (
    <Component key={route.path}>
      <Routes>{route.routes!.map((item) => renderRoute(item))}</Routes>
    </Component>
  );
}

export const RenderAppRouter = () => {
  const routes = useMemo(() => getRoutes(), []);

  return <Routes>{routes.map((route) => renderRoute(route))}</Routes>;
};
