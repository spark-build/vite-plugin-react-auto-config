import type { Plugin } from 'vite';
import { normalizePath } from 'vite';

import type { Bootstrap } from './Bootstrap';

export const reactAutoConfigPluginConfig = (bootstrap: Bootstrap): Plugin => {
  return {
    name: 'plugin-react-auto-config',

    config: () => ({
      server: {
        https: bootstrap.getServer().userConfig.mkcert,
      },
      resolve: {
        alias: [
          /**
           * support less ’~‘ alias
           *
           * @see https://github.com/vitejs/vite/issues/2185#issuecomment-784637827
           */
          { find: /^~/, replacement: '' },
          {
            find: /^@\//,
            replacement: normalizePath(`${bootstrap.getServer().paths.absSrcPath}/`),
          },
          {
            find: new RegExp(`^${bootstrap.getServer().configPathAliasName}/`),
            replacement: normalizePath(`${bootstrap.getServer().paths.absTmpPath}/`),
          },
        ],
      },
      css: {
        preprocessorOptions: {
          less: {
            javascriptEnabled: true,
          },
        },
      },
    }),

    async buildStart() {
      await bootstrap.run(false);
    },

    configureServer(server) {
      server.watcher.add(bootstrap.userConfigPath);

      server.watcher.on('change', (filePath) => {
        if (filePath.indexOf(bootstrap.userConfigPath) === 0) {
          bootstrap.getServer().logger.awaitReCompiling();

          bootstrap.debounceRun();
        }
      });
    },
  };
};
