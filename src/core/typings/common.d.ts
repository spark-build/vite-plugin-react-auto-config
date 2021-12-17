import {} from 'react-router-dom'

/**
 * @ref https://github.com/ant-design/ant-design-pro-layout/blob/master/src/typings.ts
 */
export type RouteItem = {
  // 类似 vue-router 的路由别名
  name?: string;
  title?: string;
  path?: string;
  component: string;
  routes?: RouteItem[];
  index?: boolean;

  [key: string]: any;
};
