import { defineConfig } from '@spark-build/vite-plugin-react-auto-config';

/**
 * 跟 umi 一样的配置方式
 *
 * @see https://umijs.org/zh-CN/config
 */
export default defineConfig({
  routes: [
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
  ],
  // strictMode: true,
  dynamicImport: {
    loading: '@/pages/Loading',
    delay: 60,
  },
  locale: {
    default: 'zh-CN',
  },
  windiCSS: true,
  antd: {
    toCssVariable: true,
  },
  mkcert: true,
});
