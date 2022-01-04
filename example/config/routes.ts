import type { RouteItem } from "@spark-build/vite-plugin-react-auto-config/lib/core/typings";

export const routes: RouteItem[] = [
  {
    path: '/',
    component: '@/layouts/BasicLayout',
    routes: [
      {
        path: '/',
        name: 'home',
        component: '@/pages/Home',
      },
      {
        path: 'other',
        component: '@/pages/Other',
      },
      {
        path: 'messages',
        component: '@/pages/Message',
        routes: [
          {
            path: ':id',
            name: 'messageDetail',
            component: '@/pages/Message/Detail',
          },
        ],
      },
      {
        path: 'about',
        component: '@/pages/About/Layout',
        routes: [
          {
            index: true,
            component: '@/pages/About/index',
          },
          {
            path: 'detail',
            component: '@/pages/About/Detail',
          },
        ],
      },
      {
        path: '*',
        component: '@/pages/NotFound',
      },
    ],
  },
]
