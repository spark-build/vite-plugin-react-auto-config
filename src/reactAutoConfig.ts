import type { Plugin } from 'vite';

import type { Bootstrap } from './Bootstrap';

export const reactAutoConfigPluginConfig = (bootstrap: Bootstrap): Plugin => {
  return {
    name: 'plugin-react-auto-config',

    config: () => ({
      resolve: {
        alias: {
          '@': bootstrap.getServer().paths.absSrcPath,
          [bootstrap.getServer().configPathAliasName]: bootstrap.getServer().paths.absTmpPath,
        },
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
      /**
       * 因为加载插件是异步的行为，而 vite 尚不支持异步导出 config, 所以这里循环等待插件的加载完成
       *
       * @see https://github.com/vitejs/vite/blob/5ec13d8b3fe1632f793c7ad22b21c43a13d71141/packages/vite/src/node/config.ts#L705
       */
      await bootstrap.checkLoadPluginReady();
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
