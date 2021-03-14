import type { TapableHookEvent } from '../../typings';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  module NodeJS {
    interface ViteReactAutoConfigServer {
      // eslint-disable-next-line @typescript-eslint/ban-types
      onStart: Function;
      onPluginReady: () => void;
      onGenerateFiles: TapableHookEvent;
    }
  }
}

export const stage = -99;

export default async function globalEvent(api: NodeJS.ViteReactAutoConfigServer) {
  ['onStart', 'onGenerateFiles', 'onPluginReady'].forEach((name) => {
    api.registerMethod({ name });
  });
}
