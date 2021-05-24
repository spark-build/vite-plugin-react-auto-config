import type { ConfigProviderProps } from 'antd/lib/config-provider';

import type { RouteItem } from './common';

export type Config = {
  routes: RouteItem[];
  env?: string;
  fastRefresh?: boolean;
  dynamicImport?: {
    /**
     * loading the component before loaded
     */
    loading?: string;
    delay?: number;
    webpackPreload?: boolean;
  };
  // https://umijs.org/zh-CN/plugins/plugin-locale#umijsplugin-locale
  locale?: {
    default?: string;
    useLocalStorage?: boolean;
    baseNavigator?: boolean;
    title?: boolean;
    antd?: boolean;
    baseSeparator?: string;

    fallbackLng?: string;
  };
  windiCSS?: boolean;
  antd?: {
    // 开启暗色主题
    dark?: boolean;
    // 开启紧凑主题
    compact?: boolean;
    config?: ConfigProviderProps;
  };
  strictMode?: boolean;
};

export type ExportOrImportObjectParams = { source: string; specifier?: string };
export type ExportOrImportParams = ExportOrImportObjectParams | string;

export interface Hook {
  id: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  fn: Function;
  pluginId?: string;
  before?: string;
}

export type ServicePaths = {
  // 执行目录绝对路径
  cwd: string;
  // node_modules 目录绝对路径
  absNodeModulesPath: string;
  // 项目 src 目录路径
  absSrcPath: string;
  // 输出编译生成的文件临时目录路径
  absTmpPath: string;
};

export type ServerConfig = {
  paths: ServicePaths;
  env: string | undefined;
  userConfig: Config;
};

export type TapableHookObject<T extends any> = {
  before?: string;
  stage?: number;
  fn?: (args: T) => any;
  isSkip?: () => boolean;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export interface TapableHookEvent<Args = any, Return = any> {
  (fn: (args: Args) => Return): void;
  (args: TapableHookObject<Args>): Return;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  module NodeJS {
    interface ViteReactAutoConfigServer {
      //
    }
  }
}
