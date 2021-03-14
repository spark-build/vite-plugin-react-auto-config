import { isObj } from '@spark-build/web-utils/lib/type';

import type { Hook } from '../Hooks';

type TOnReCompile = (enable: boolean) => void | Promise<void>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  module NodeJS {
    interface ViteReactAutoConfigServer extends PluginApi {
      describe: (args: {
        id?: string;
        enable?: () => boolean;
        onReCompile?: (enableBy: boolean) => any;
      }) => any;
    }
  }
}

export class PluginApi {
  private server: NodeJS.ViteReactAutoConfigServer;
  private id: string;

  enable?: () => boolean;
  onReCompile?: () => any;

  constructor(id: string, server: NodeJS.ViteReactAutoConfigServer) {
    this.server = server;
    this.server.plugin.register(id, this);
    this.id = id;
  }

  describe({
    id,
    enable,
    onReCompile,
  }: {
    id?: string;
    key?: string;
    enable?: () => boolean;
    onReCompile?: TOnReCompile;
  } = {}) {
    if (id && this.id !== id) {
      this.id = id;
    }

    const enableBy = enable ?? (() => false);

    this.enable = () => {
      const result = enableBy();

      this.skipOrRemoveSkip(result);

      return result;
    };

    if (onReCompile) {
      this.onReCompile = () => onReCompile(this.enable?.() ?? false);

      // 初始化的时候需要执行一次，避免上一次配置的时候是有生成临时文件，这次禁用了，导致有多余的文件存在
      this.onReCompile();
    } else {
      // 初始化的时候也需要执行一次
      this.enable();
    }
  }

  register(id: string, plugin: PluginApi) {
    this.server.plugin.register(id, plugin);

    return this;
  }

  addHook(hook: Omit<Hook, 'pluginId'>) {
    this.server.hooks.add({ ...hook, pluginId: this.id });
  }

  skip() {
    this.server.plugin.skip(this.id);
  }

  removeSkip() {
    this.server.plugin.removeSkip(this.id);
  }

  skipOrRemoveSkip(enable: boolean) {
    const method = enable ? 'removeSkip' : 'skip';

    return this[method]();
  }

  registerMethod({
    name,
    fn,
    exitsError = true,
  }: {
    name: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    fn?: Function;
    exitsError?: boolean;
  }) {
    if (this.server.methods.has(name)) {
      if (exitsError) {
        throw new Error(`api.registerMethod() failed, method ${name} is already exist.`);
      } else {
        return;
      }
    }

    const realFn =
      // 注册普通的函数
      fn ||
      // 变相注册为当前 plugin hook
      // eslint-disable-next-line @typescript-eslint/ban-types
      function (f: Function) {
        const hook = {
          key: name,
          ...(isObj(f) ? f : { fn: f }),
        };

        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-invalid-this
        this.addHook(hook as Hook);
      };

    this.server.methods.set(name, realFn);
  }
}
