import type { Options as reactRefreshOptions } from '@vitejs/plugin-react-refresh';
import reactRefresh from '@vitejs/plugin-react-refresh';

import type { VitePluginComponentImport } from 'vite-plugin-style-import';
import styleImportPlugin from 'vite-plugin-style-import';

import { reactAutoConfigPluginConfig } from './reactAutoConfig';
import { Bootstrap } from './Bootstrap';

const bootstrap = new Bootstrap();

type Options = {
  styleImport?: VitePluginComponentImport;
  reactRefresh?: reactRefreshOptions;
};

export const reactAutoConfig = (options: Options = {}) => {
  const { userConfig } = bootstrap.getServer();

  const plugins = [reactAutoConfigPluginConfig(bootstrap)];

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
            resolveStyle: (name) => {
              return `antd/es/${name}/style/index`;
            },
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

  return plugins;
};
