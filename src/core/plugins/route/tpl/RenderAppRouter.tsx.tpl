import { useEffect, useState } from 'react';
import { useRoutes } from 'react-router-dom';

import { getRoutes } from './Routes';
import { RouterHelper, InjectionRouterHelper } from './helper';

const Routers = ({ routes }: { routes: ReturnType<typeof getRoutes> }) => {
  const element = useRoutes(routes);

  return element;
};

export const RenderRoutes = () => {
  const [routes, setRoutes] = useState<ReturnType<typeof getRoutes>>([]);

  const initializeRouter = () => {
    const _routes = getRoutes();

    RouterHelper.addRoutes(_routes);

    RouterHelper.ready().then((bool) => {
      if (bool !== false) {
        setRoutes(_routes);
      }
    });
  };

  useEffect(() => {
    initializeRouter();
  }, []);

  return !routes.length ? null : <Routers routes={routes} />;
};

export const RenderAppRouter = () => {
  return (
    <>
      <RenderRoutes />
      <InjectionRouterHelper />
    </>
  );
};
