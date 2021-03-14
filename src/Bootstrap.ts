/* eslint-disable import/no-dynamic-require */
import assert from 'assert';
import { join } from 'path';

import * as fs from 'fs-extra';

import { debounce } from 'lodash';
import * as esbuild from 'esbuild';

import { Service, sleep } from './core';

export class Bootstrap {
  private server!: Service;

  userConfigPath!: string;
  userConfigFilePath!: string;
  cacheConfigTemporaryFilePath!: string;

  constructor() {
    this.server = new Service({
      paths: {
        cwd: process.cwd(),
      },
    });

    this.init();
  }

  async checkLoadPluginReady() {
    if (this.server.plugin.isReady) {
      return;
    }

    this.server.logger.awaitText('正在初始化 plugins ...');

    /**
     * @see https://github.com/vitejs/vite/blob/5ec13d8b3fe1632f793c7ad22b21c43a13d71141/packages/vite/src/node/config.ts#L705
     *
     * 因为 vite-plugin-react-auto-config 的 plugins 的加载是异步的
     * 而 vite 的 plugins 是同步加载的，所以这里就堵塞一下，以使 plugins 能正确加载
     */

    while (!this.server.plugin.isReady) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(160);
    }

    this.server.logger.stopAndPersistOk('初始化 plugins 完成');
  }

  /**
   * 暂时无法清除已经 import 的 file cache, 先临时绕过
   *
   * @see https://github.com/nodejs/modules/issues/307
   */
  // private async getBuildOutputTemporaryConfigFilePathAndRemoveTheLast() {
  //   await fs.remove(this.cacheConfigTemporaryFilePath.replace(/\/config_\d+\.js/, ''));

  //   this.cacheConfigTemporaryFilePath = this.cacheConfigTemporaryFilePath.replace(
  //     /(?<=config__)(\d+)(?=\.js$)/,
  //     `${new Date().valueOf()}`,
  //   );

  //   return this.cacheConfigTemporaryFilePath;
  // }

  private getConfig() {
    assert(fs.existsSync(this.userConfigFilePath), '请在根目录上创建配置文件');

    // const configTemporaryFilePath = await this.getBuildOutputTemporaryConfigFilePathAndRemoveTheLast();

    const configTemporaryFilePath = this.server.resolveTmpPath(`config.js`);

    // 先将配置文件编译成 CommonJS
    esbuild.buildSync({
      entryPoints: [this.userConfigFilePath],
      bundle: true,
      platform: 'node',
      treeShaking: true,
      outfile: configTemporaryFilePath,
    });

    delete require.cache[require.resolve(configTemporaryFilePath)];

    // 读取配置文件
    // return import(configTemporaryFilePath).then((res) => res.default);

    // eslint-disable-next-line global-require
    return require(configTemporaryFilePath).default;
  }

  init() {
    const cwd = process.cwd();

    this.userConfigPath = join(cwd, 'config');
    this.userConfigFilePath = join(this.userConfigPath, `index.ts`);
    // this.cacheConfigTemporaryFilePath = this.server.resolveTmpPath(
    //   `config__${new Date().valueOf()}.js`,
    // );

    const userConfig = this.getConfig();

    this.server
      .setEnv(userConfig.env || process.env.NODE_ENV || 'development')
      .setUserConfig(userConfig);

    return this.server.plugin.initPlugins();
  }

  getServer() {
    return this.server;
  }

  async run(isReCompile = true) {
    this.server.logger.printCompiling();

    if (isReCompile) {
      this.server.setUserConfig(this.getConfig());
    }

    await this.server.run(isReCompile);

    this.server.logger.stopAndPersistOk('生成配置完成');

    setTimeout(() => {
      this.server.logger.printWhenFirstDone();
    });
  }

  debounceRun = debounce(() => {
    this.run();
  }, 1500);
}
