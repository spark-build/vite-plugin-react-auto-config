import styleImport from 'vite-plugin-style-import';
import reactRefresh from '@vitejs/plugin-react-refresh';

import { reactAutoConfigPluginConfig } from './plugin';
import { Bootstrap } from './Bootstrap';

const bootstrap = new Bootstrap();

export const reactAutoConfig = () => {
  const { userConfig } = bootstrap.getServer();

  const plugins = [reactAutoConfigPluginConfig(bootstrap)];

  if (userConfig.fastRefresh !== false) {
    plugins.push(reactRefresh());
  }

  if (userConfig.antd) {
    plugins.push(
      styleImport({
        libs: [
          {
            libraryName: 'antd',
            esModule: true,
            resolveStyle: (name) => {
              return `antd/es/${name}/style/index`;
            },
          },
        ],
      }),
    );
  }

  return plugins;
};
