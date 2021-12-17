import cloneDeep from 'lodash/cloneDeep';
import type { Config, RouteItem } from '../../typings';

const SEPARATOR = '^^^';

const routeToImportName = (componentPath: string) =>
  componentPath.replace(/\//g, '').replace(/@/g, '').replace(/\./g, '').toLocaleUpperCase();

const pMinDelayImportName = 'pMinDelay';
const dynamicName = 'dynamic';
const dynamicWrapperVarName = 'dynamicWrapper';

function isFunctionComponent(component: string) {
  return (
    /^\((.+)?\)(\s+)?=>/.test(component) ||
    /^function([^\(]+)?\(([^\)]+)?\)([^{]+)?{/.test(component)
  );
}

/**
 * @ref https://github.com/umijs/umi/blob/master/packages/core/src/Route/routesToJSON.ts
 */
export default function (config: Config) {
  // 因为要往 routes 里加无用的信息，所以必须 deep clone 一下，避免污染
  const clonedRoutes = cloneDeep(config.routes);
  let routeImportNameTemplate = '';
  let dynamicWrapperTemplate = '';

  function patchRoutes(routes: RouteItem[], parentRoute?: RouteItem) {
    routes.forEach((route) => patchRoute(route, parentRoute));
  }

  function patchRoute(route: RouteItem, parentRoute?: RouteItem) {
    if (route.component && !isFunctionComponent(route.component)) {
      const routeImportName = routeToImportName(route.component);

      if (!config.dynamicImport) {
        routeImportNameTemplate += `\nimport ${routeImportName} from '${route.component}';`;
      }

      route.component = [route.component, routeImportName].join(SEPARATOR);

      if (route.path) {
        // 不是 / 开头，比如 user/:id, 那么就自动给加上，v6 已自带
        // if (!/^(\/|\*)/.test(route.path)) {
        //   route.path = `/${route.path}`;
        // }

        if (parentRoute?.path) {
          // if (!new RegExp(`^${parentRoute.path}`).test(route.path)) {
            // 参照 vue-router 那样，可以自动加上上级路由的 path，v6 已自带
            // route.path = `${parentRoute.path}${route.path}`.replace(/\/\//g, '/');
          // }

          if (parentRoute.path === route.path && !route.index) {
            // 如果父路由的 path 和子路由的 path 相同，那么就设置 route.index = true
            route.index = true;
            delete route.path;
          }
        }
      }
    }

    if (route.routes) {
      /**
       * @see https://github.com/ReactTraining/react-router/blob/dev/docs/installation/getting-started.md#descendant-routes
       *
       * 在 v6 下，需要在父级路径中加入 * 后缀，才能正常显示此嵌套的下级路由
       */

      // 使用 useRoutes 则无需这一步
      // if (route.path && route.path !== '/' && !/\*$/.test(route.path)) {
      //   route.path = `${route.path || ''}/*`;
      // }

      patchRoutes(route.routes, route);
    }
  }

  function injectionDynamicImportWrapperFN() {
    if (!dynamicWrapperTemplate) {
      /**
       * 增加加载延时，防止加载过快导致页面闪烁
       *
       * @see https://loadable-components.com/docs/delay/
       */
      const delayText = config.dynamicImport?.delay
        ? `${pMinDelayImportName}(loadComp, ${config.dynamicImport.delay})`
        : 'loadComp';

      /**
       * @see https://loadable-components.com/docs/fallback/
       */
      const LoadingText = !config.dynamicImport?.loading
        ? ''
        : `, { fallback: <LoadingComponent /> }`;

      /**
       * 注入通用的 dynamic 函数
       *
       * @example 配置了 delay、loading 的情况
       *  const dynamicWrapper = (loadComp: PromiseLike<any>) => dynamic(() => pMinDelay(loadComp, 60), {
            fallback: <LoadingComponent />,
          })
       */
      dynamicWrapperTemplate = `const ${dynamicWrapperVarName} = (loadComp: PromiseLike<any>) => {
  const Component = ${dynamicName}(() => ${delayText}${LoadingText});

  return <Component />;
}`;
    }
  }

  function init() {
    /**
     * @see https://loadable-components.com/docs/delay/
     */
    if (config.dynamicImport?.delay) {
      routeImportNameTemplate += `\nimport ${pMinDelayImportName} from 'p-min-delay';`;
    }

    injectionDynamicImportWrapperFN();

    patchRoutes(clonedRoutes);
  }

  function replacer(key: string, value: any) {
    switch (key) {
      case 'component':
        if (isFunctionComponent(value)) return value;

        const [component, routeImportName] = value.split(SEPARATOR);

        return config.dynamicImport
          ? `${dynamicWrapperVarName}(import('${component}'))`
          : routeImportName;
      default:
        return value;
    }
  }

  init();

  const routes = JSON.stringify(clonedRoutes, replacer, 2)
    .replace(/\"component\": (\"(.+?)\")/g, (global, m1, m2) => {
      return `"element": ${m2.replace(/\^/g, '"')}`;
    })
    .replace(/\"routes\":/g, '"children":')
    .replace(/\\r\\n/g, '\r\n')
    .replace(/\\n/g, '\r\n');

  return {
    importNameTemplate: routeImportNameTemplate.replace('\n', '') + `\n\n${dynamicWrapperTemplate}`,
    routes,
  };
}
