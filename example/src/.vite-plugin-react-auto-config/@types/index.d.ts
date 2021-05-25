/**
 * @ref https://github.com/ant-design/ant-design-pro-layout/blob/master/src/typings.ts
 */
export type RouteItem = {
  authority?: string[] | string;
  children?: RouteItem[];
  hideChildrenInMenu?: boolean;
  hideInMenu?: boolean;
  icon?: string;
  locale?: string;
  name?: string;
  title?: string;
  edit_title?: string;
  redirectUrl?: string;
  // 显示完整的面包屑
  showFullBreadcrumb?: boolean;
  // 是否显示链接
  notShowLink?: boolean;
  hideBreadcrumb?: boolean;
  // 虚拟的上级路由路径，用于绑定上下级关系
  virtualParentRoutePath?: string;
  path: string;

  component?: string;
  exact?: boolean;
  routes?: RouteItem[];
  wrappers?: string[];
  __toMerge?: boolean;
  __isDynamic?: boolean;

  [key: string]: any;
};
