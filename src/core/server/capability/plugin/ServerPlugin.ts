import { AsyncSeriesWaterfallHook } from 'tapable';
import { isFn } from '@spark-build/web-utils/lib/type';

import { PluginApi } from './Api';
import { loadPlugins } from './util';

import type { ServerConfig } from '../../../typings';
import { ApplyPluginsType } from '../../constants';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  module NodeJS {
    interface ViteReactAutoConfigServer extends ServerPlugin {}
  }
}

export class ServerPlugin {
  private plugins: Map<string, PluginApi> = new Map();
  private skipIds: Set<string> = new Set<string>();
  private server: NodeJS.ViteReactAutoConfigServer;
  private initPluginReady = false;

  get isReady() {
    return this.initPluginReady;
  }

  constructor(server: NodeJS.ViteReactAutoConfigServer) {
    this.server = server;
  }

  getPlugins() {
    return this.plugins;
  }

  register(id: string, plugin: PluginApi) {
    this.plugins.set(id, plugin);

    return this;
  }

  skip(id: string) {
    this.skipIds.add(id);
  }

  removeSkip(id: string) {
    if (this.skipIds.has(id)) {
      this.skipIds.delete(id);
    }
  }

  enableStatus(id: string) {
    if (!this.plugins.has(id) || this.skipIds.has(id)) {
      return false;
    }

    // 手动设置为 false
    if (this.server.userConfig[id as keyof ServerConfig['userConfig']] === false) {
      return false;
    }

    // 注册开启
    return true;
  }

  private getPluginAPI(id: string) {
    const plugin = new PluginApi(id, this.server);

    // 代理访问不存在的 plugin api 时，就到 server 中查找
    return new Proxy(plugin, {
      get: (target, prop: string) => {
        // 由于 pluginMethods 需要在 register 阶段可用
        // 必须通过 proxy 的方式动态获取最新，以实现边注册边使用的效果
        if (this.server.methods.has(prop)) {
          return this.server.methods.get(prop);
        }

        const findProp = (t: any = target) => (isFn(t[prop]) ? t[prop].bind(t) : t[prop]);

        if (this[prop as 'applyPlugins']) {
          return findProp(this);
        }

        if (this.server[prop as 'applyPlugins']) {
          return findProp(this.server);
        }

        return findProp();
      },
    });
  }

  async initPlugins() {
    const plugins = await loadPlugins();

    const tInitPlugin = new AsyncSeriesWaterfallHook(['initPlugin']);

    for (const plugin of plugins) {
      tInitPlugin.tapPromise(
        {
          name: plugin.id,
          stage: plugin.stage,
        },
        async () => {
          const pluginInstance = this.getPluginAPI(plugin.id);

          await plugin.fn(pluginInstance);

          return this.register(plugin.id, pluginInstance);
        },
      );
    }

    await tInitPlugin.promise(undefined);

    this.initPluginReady = true;

    this.server.applyPlugins({
      key: 'onPluginReady',
      type: ApplyPluginsType.EVENT,
    });

    return this;
  }
}
