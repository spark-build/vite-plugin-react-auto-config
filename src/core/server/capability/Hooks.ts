import type { TapableHookObject } from '../../typings';

export type Hook<T extends any = any> = {
  key: string;
  pluginId?: string;
} & TapableHookObject<T>;

export class Hooks {
  private hooks: Map<string, Hook[]> = new Map();
  private pluginHooks: Map<string, Hook[]> = new Map();

  add(hook: Hook) {
    const hooks = this.hooks.get(hook.key) || [];

    this.hooks.set(hook.key, hooks.concat(hook));

    if (hook.pluginId) {
      this.pluginHooks.set(hook.pluginId, (this.pluginHooks.get(hook.pluginId) || []).concat(hook));
    }

    return true;
  }

  find(key: string) {
    return this.pluginHooks.has(key)
      ? this.pluginHooks.get(key)!
      : ([] as Hook[]).concat(this.hooks.get(key) || []);
  }
}
