import LoadingComponent from '@/pages/Loading';


import pMinDelay from 'p-min-delay';

import dynamic from '@loadable/component';

export function getRoutes() {
  return [
  {
    "path": "/",
    "component": dynamic( () => pMinDelay(import(/* webpackChunkName: 'layouts__BasicLayout' */ /* webpackPrefetch: true */'@/layouts/BasicLayout'), 60), { fallback: <LoadingComponent />, }),
    "routes": [
      {
        "path": "/",
        "component": dynamic( () => pMinDelay(import(/* webpackChunkName: 'p__Home' */ /* webpackPrefetch: true */'@/pages/Home'), 60), { fallback: <LoadingComponent />, })
      },
      {
        "path": "/other",
        "component": dynamic( () => pMinDelay(import(/* webpackChunkName: 'p__Other' */ /* webpackPrefetch: true */'@/pages/Other'), 60), { fallback: <LoadingComponent />, })
      }
    ]
  },
  {
    "path": "*",
    "component": dynamic( () => pMinDelay(import(/* webpackChunkName: 'p__NotFound' */ /* webpackPrefetch: true */'@/pages/NotFound'), 60), { fallback: <LoadingComponent />, })
  }
];
}
