import { defineConfig } from '@spark-build/vite-plugin-react-auto-config/lib/core/defineConfig';
import { routes } from './routes';

/**
 * 跟 umi 一样的配置方式
 *
 * @see https://umijs.org/zh-CN/config
 */
export default defineConfig({
  routes,
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
