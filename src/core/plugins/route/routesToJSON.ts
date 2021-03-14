/* eslint-disable no-case-declarations */
import cloneDeep from 'lodash/cloneDeep';

import type { Config, RouteItem } from '../../typings';

const SEPARATOR = '^^^';
const EMPTY_PATH = '_';

/**
 * @see https://github.com/umijs/umi/blob/2de577ed78c2df2a2a16933e97b77920366fcf6c/packages/utils/src/routes.ts
 */
const routeToChunkName = (componentPath: string) =>
  componentPath
    .replace(/^.(\/|\\)/, '')
    .replace(/(\/|\\)/g, '__')
    .replace(/\.jsx?$/, '')
    .replace(/\.tsx?$/, '')
    .replace(/^src__/, '')
    .replace(/\.\.__/g, '')
    // 约定式路由的 [ 会导致 webpack 的 code splitting 失败
    // ref: https://github.com/umijs/umi/issues/4155
    .replace(/[\[\]]/g, '')
    .replace(/^pages__/, 'p__')
    .replace(/^page__/, 'p__');

const routeToImportName = (componentPath: string) =>
  componentPath.replace(/\//g, '').replace(/@/g, '').replace(/\./g, '').toLocaleUpperCase();

const pMinDelayImportName = 'pMinDelay';

/**
 * @ref https://github.com/umijs/umi/blob/master/packages/core/src/Route/routesToJSON.ts
 */
export default function (config: Config) {
  // 因为要往 routes 里加无用的信息，所以必须 deep clone 一下，避免污染
  const clonedRoutes = cloneDeep(config.routes);
  let routeImportNameTemplate = '';

  patchRoutes(clonedRoutes);

  /**
   * @see https://loadable-components.com/docs/delay/
   */
  if (config.dynamicImport?.delay) {
    routeImportNameTemplate += `\nimport ${pMinDelayImportName} from 'p-min-delay';`;
  }

  function patchRoutes(routes: RouteItem[]) {
    routes.forEach(patchRoute);
  }

  function patchRoute(route: RouteItem) {
    if (route.component && !isFunctionComponent(route.component)) {
      const webpackChunkName = routeToChunkName(route.component);
      const routeImportName = routeToImportName(route.component);

      if (!config.dynamicImport) {
        routeImportNameTemplate += `\nimport ${routeImportName} from '${route.component}';`;
      }

      route.component = [
        route.component,
        webpackChunkName,
        routeImportName,
        route.path || EMPTY_PATH,
      ].join(SEPARATOR);
    }

    if (route.routes) {
      patchRoutes(route.routes);
    }
  }

  function isFunctionComponent(component: string) {
    return (
      /^\((.+)?\)(\s+)?=>/.test(component) ||
      /^function([^\(]+)?\(([^\)]+)?\)([^{]+)?{/.test(component)
    );
  }

  /**
   * @see https://loadable-components.com/docs/fallback/
   */
  function getLoadingOptionText() {
    return !config.dynamicImport?.loading ? '' : `, { fallback: <LoadingComponent />, }`;
  }

  /**
   * @see https://loadable-components.com/docs/prefetching/
   */
  function getWebpackPreloadText() {
    return !config.dynamicImport?.webpackPreload ? '' : `/* webpackPrefetch: true */`;
  }

  function getWebpackChunkNameText(webpackChunkName: string) {
    return `/* webpackChunkName: '${webpackChunkName}' */`;
  }

  function replacer(key: string, value: any) {
    switch (key) {
      case 'component':
        if (isFunctionComponent(value)) return value;

        const [component, webpackChunkName, routeImportName] = value.split(SEPARATOR);

        if (!config.dynamicImport) {
          return `${routeImportName}`;
        }

        const webpackText = [getWebpackChunkNameText(webpackChunkName), getWebpackPreloadText()]
          .filter(Boolean)
          .join(' ');

        let importText = `import(${webpackText}'${component}')`;

        /**
         * 增加加载延时，防止加载过快导致页面闪烁
         *
         * @see https://loadable-components.com/docs/delay/
         */
        if (config.dynamicImport?.delay) {
          importText = `${pMinDelayImportName}(${importText}, ${config.dynamicImport.delay})`;
        }

        return `dynamic( () => ${importText}${getLoadingOptionText()})`;

      case 'wrappers':
        const wrappers = value.map((wrapper: string) => {
          if (config.dynamicImport) {
            let loading = '';
            if (config.dynamicImport.loading) {
              loading = `, loading: LoadingComponent`;
            }
            return `dynamic({ loader: () => import(/* webpackChunkName: 'wrappers' */'${wrapper}')${loading}})`;
          }
          return `require('${wrapper}').default`;
        });
        return `[${wrappers.join(', ')}]`;
      default:
        return value;
    }
  }

  const routes = JSON.stringify(clonedRoutes, replacer, 2)
    .replace(/\"component\": (\"(.+?)\")/g, (global, m1, m2) => {
      return `"component": ${m2.replace(/\^/g, '"')}`;
    })
    .replace(/\"wrappers\": (\"(.+?)\")/g, (global, m1, m2) => {
      return `"wrappers": ${m2.replace(/\^/g, '"')}`;
    })
    .replace(/\\r\\n/g, '\r\n')
    .replace(/\\n/g, '\r\n');

  return {
    importNameTemplate: routeImportNameTemplate,
    routes,
  };
}
