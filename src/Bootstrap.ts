import assert from 'assert';
import { join } from 'path';

import * as fs from 'fs-extra';

import debounce from 'lodash/debounce';
import * as esbuild from 'esbuild';

import { Service } from './core';

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
  }

  private async generateConfigFile() {
    assert(fs.existsSync(this.userConfigFilePath), '请在根目录上创建配置文件');

    const configTemporaryFilePath = this.server.resolveTmpPath(`config.js`);

    // 先将配置文件编译成 CommonJS
    await esbuild.build({
      entryPoints: [this.userConfigFilePath],
      bundle: true,
      platform: 'node',
      treeShaking: true,
      outfile: configTemporaryFilePath,
    });

    return configTemporaryFilePath;
  }

  private async getConfig() {
    const configTemporaryFilePath = await this.generateConfigFile();

    // 删除可能存在的缓存
    delete require.cache[require.resolve(configTemporaryFilePath)];

    // 读取配置文件
    // eslint-disable-next-line global-require
    return require(configTemporaryFilePath).default;
  }

  async init() {
    const cwd = process.cwd();

    this.userConfigPath = join(cwd, 'config');
    this.userConfigFilePath = join(this.userConfigPath, `index.ts`);

    const userConfig = await this.getConfig();

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
      this.server.setUserConfig(await this.getConfig());
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
