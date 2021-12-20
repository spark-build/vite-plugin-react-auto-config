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

  // TODO: 可以改成异步 
  private generateConfigFile() {
    assert(fs.existsSync(this.userConfigFilePath), '请在根目录上创建配置文件');

    const configTemporaryFilePath = this.server.resolveTmpPath(`config.js`);

    // 先将配置文件编译成 CommonJS
    const source = fs.readFileSync(this.userConfigFilePath);

    const result = esbuild.transformSync(source.toString(), {
      sourcefile: this.userConfigFilePath,
      format: 'cjs',
    });

    fs.writeFileSync(configTemporaryFilePath, result.code);

    return configTemporaryFilePath;
  }

  private getConfig() {
    const configTemporaryFilePath = this.generateConfigFile();

    // 删除可能存在的缓存
    delete require.cache[require.resolve(configTemporaryFilePath)];

    // 读取配置文件
    // eslint-disable-next-line global-require
    return require(configTemporaryFilePath).default;
  }

  init() {
    const cwd = process.cwd();

    this.userConfigPath = join(cwd, 'config');
    this.userConfigFilePath = join(this.userConfigPath, `index.ts`);

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
