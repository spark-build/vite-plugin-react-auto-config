export type Hook = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  fn: Function;
  key: string;
  pluginId?: string;
  before?: string;
  stage?: number;
};

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
