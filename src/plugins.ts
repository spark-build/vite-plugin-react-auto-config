import type { Options as reactRefreshOptions } from '@vitejs/plugin-react-refresh';
import reactRefresh from '@vitejs/plugin-react-refresh';
import reactJsx from 'vite-react-jsx';
import WindiCSS from 'vite-plugin-windicss';

import type { VitePluginOptions } from 'vite-plugin-style-import';
import styleImportPlugin from 'vite-plugin-style-import';

import type { ViteCertificateOptions } from 'vite-plugin-mkcert';
import VitePluginCertificate from 'vite-plugin-mkcert';

import type { PluginOption } from 'vite';

import { reactAutoConfigPluginConfig } from './reactAutoConfig';
import { Bootstrap } from './Bootstrap';

type Options = {
  styleImport?: VitePluginOptions;
  reactRefresh?: reactRefreshOptions;
  mkcert?: ViteCertificateOptions;
};

export const reactAutoConfig = async (options: Options = {}) => {
  const bootstrap = new Bootstrap();

  // 初始化插件
  await bootstrap.init();

  const { userConfig } = bootstrap.getServer();

  const plugins = [reactJsx(), reactAutoConfigPluginConfig(bootstrap)] as (
    | PluginOption
    | PluginOption[]
  )[];

  if (userConfig.fastRefresh !== false) {
    plugins.push(reactRefresh(options.reactRefresh));
  }

  if (userConfig.antd) {
    const { styleImport } = options;

    plugins.push(
      styleImportPlugin({
        ...(styleImport || {}),
        libs: [
          {
            libraryName: 'antd',
            esModule: true,
            resolveStyle: (name) => `antd/es/${name}/style/index`,
          },
          {
            libraryName: '@ant-design/icons',
            libraryNameChangeCase: 'pascalCase',
            resolveComponent: (name) => `@ant-design/icons/es/icons/${name}`,
          },
          ...(styleImport?.libs || []),
        ],
      }),
    );
  }

  if (userConfig.mkcert) {
    plugins.push(
      VitePluginCertificate({
        source: 'coding',
        ...options.mkcert,
      }),
    );
  }

  if (userConfig.windiCSS) {
    plugins.push(WindiCSS());
  }

  return plugins;
};
