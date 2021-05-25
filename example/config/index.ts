import { defineConfig } from '@spark-build/vite-plugin-react-auto-config/lib/core';

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
          component: '@/pages/Home',
        },
        {
          path: '/other',
          component: '@/pages/Other',
        },
      ],
    },
    {
      path: '*',
      component: '@/pages/NotFound',
    },
  ],
  // strictMode: true,
  dynamicImport: {
    loading: '@/pages/Loading',
    delay: 60,
    webpackPreload: true,
  },
  locale: {
    default: 'zh-CN',
  },
  windiCSS: true,
  antd: {},
});
