/* eslint-disable no-await-in-loop */
import { AsyncSeriesWaterfallHook } from 'tapable';

import getServicePaths from './getPaths';

import { ResolvePath } from './ResolvePath';

import { PrettierFiles } from './capability/Prettier';

import { GenerateFile } from './capability/Generate';

import { ServerPlugin } from './capability/plugin';

import type { Hook } from './capability/Hooks';
import { Hooks } from './capability/Hooks';

import { ApplyPluginsType } from './constants';

import { Logger } from './capability/Logger';

import type { ServerConfig, ServicePaths } from '../typings';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  module NodeJS {
    interface ViteReactAutoConfigServer extends Service {
      prettier: PrettierFiles;
      generateFile: GenerateFile;
    }
  }
}

export class Service extends ResolvePath {
  userConfig = {} as ServerConfig['userConfig'];

  paths = {} as Readonly<ServicePaths>;

  env: string | undefined;

  prettier: Readonly<PrettierFiles>;

  generateFile: GenerateFile;

  configPathAliasName = '@@';

  // eslint-disable-next-line @typescript-eslint/ban-types
  methods: Map<string, Function> = new Map();

  plugin: ServerPlugin;

  hooks: Hooks;

  logger: Logger;

  get self() {
    return this as unknown as NodeJS.ViteReactAutoConfigServer;
  }

  setUserConfig(config?: ServerConfig['userConfig']) {
    if (config) {
      this.userConfig = config;
    }

    return this;
  }

  setEnv(env: string) {
    this.env = env;

    return this;
  }

  constructor(
    opts: Partial<Omit<ServerConfig, 'paths'>> & { paths?: Partial<ServerConfig['paths']> },
  ) {
    super();

    this.env = opts.env || 'development';

    this.paths = {
      ...opts.paths,
      ...getServicePaths({
        cwd: opts.paths?.cwd || process.cwd(),
        env: this.env,
      }),
    };

    this.setUserConfig(opts.userConfig);

    this.prettier = new PrettierFiles(this.self);
    this.generateFile = new GenerateFile(this.self);
    this.plugin = new ServerPlugin(this.self);
    this.hooks = new Hooks();
    this.logger = new Logger();
  }

  resolveConfigAliasNamePath(...p: string[]) {
    return [this.configPathAliasName, ...p].join('/');
  }

  private forEachHooks(key: string, cb: (hook: Hook) => any) {
    const hooks = this.hooks.find(key);

    for (const hook of hooks) {
      if ((hook.pluginId && !this.plugin.enableStatus(hook.pluginId)) || hook.isSkip?.()) {
        continue;
      }

      cb(hook);
    }
  }

  // eslint-disable-next-line consistent-return
  async applyPlugins<T = any>(opts: {
    key: string;
    type?: ApplyPluginsType;
    initialValue?: T;
    defaultValue?: T[];
    args?: any;
  }): Promise<T[]> {
    if (!opts.type || opts.type === ApplyPluginsType.ADD) {
      // 异步串行
      // eslint-disable-next-line no-case-declarations
      const tAdd = new AsyncSeriesWaterfallHook(['memo']);

      this.forEachHooks(opts.key, (hook) => {
        tAdd.tapPromise(
          {
            name: hook.pluginId || hook.key,
            stage: hook.stage || 0,
            before: hook.before,
          },
          async (memo) => {
            const item = await hook.fn!(opts.args);

            return item ? (memo as any[]).concat(item) : memo;
          },
        );
      });

      const result = (await tAdd.promise(opts.initialValue || [])) as T[];

      return !result.length && opts.defaultValue ? opts.defaultValue : result;
    }

    const tEvent = new AsyncSeriesWaterfallHook<any[]>(['_']);

    this.forEachHooks(opts.key, (hook) => {
      tEvent.tapPromise(
        {
          name: hook.pluginId || hook.key,
          stage: hook.stage || 0,
          before: hook.before,
        },
        // 累计返回值
        async (memo = []) => {
          const item = await hook.fn!(opts.args);

          return item ? memo.concat([item]) : memo;
        },
      );
    });

    return tEvent.promise(undefined);
  }

  handleReCompile() {
    this.plugin.getPlugins().forEach((plugin) => {
      plugin?.onReCompile?.();
    });
  }

  async run(isReCompile = true) {
    if (isReCompile) {
      this.handleReCompile();
    }

    await this.applyPlugins({
      key: 'onGenerateFiles',
      type: ApplyPluginsType.EVENT,
    });

    await this.applyPlugins({
      key: 'addDepsEntryExports',
      type: ApplyPluginsType.EVENT,
    });

    await this.applyPlugins({
      key: 'onGenerateAppEntryFile',
      type: ApplyPluginsType.EVENT,
    });

    await this.prettier.setConsoleLog(false).run();
  }
}
