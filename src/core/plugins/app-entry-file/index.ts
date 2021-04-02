import { outputFile } from 'fs-extra';

import { GenerateAppEntryFile } from './GenerateAppEntryFile';
import { registerMethodKeys } from './constants';

import type { TapableHookEvent } from '../../typings';

import type { ExportOrImportParams } from '../../typings';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  module NodeJS {
    interface ViteReactAutoConfigServer {
      // eslint-disable-next-line @typescript-eslint/ban-types
      onGenerateAppEntryFile: (fn: Function) => any;

      addImportToAppEntryFile: TapableHookEvent<any, ExportOrImportParams | string>;
      addContainerRenderToAppEntryFile: TapableHookEvent<any, string>;
      addRenderFunctionNameToAppEntryFile: TapableHookEvent<any, string>;
    }
  }
}

// 提前执行
export const stage = -9;

function addStrictModeRender(api: NodeJS.ViteReactAutoConfigServer) {
  const isSkip = () => api.userConfig.strictMode !== true;

  api.addImportToAppEntryFile({
    isSkip,
    fn: () => ({ specifier: '{ StrictMode }', source: 'react' }),
  });

  api.addContainerRenderToAppEntryFile({
    stage: 998,
    isSkip,
    fn: () => `
function renderStrictMode(children?: React.ReactElement) {
  return <StrictMode>{children}</StrictMode>;
}`,
  });
}

function addRootContainer(api: NodeJS.ViteReactAutoConfigServer) {
  api.addImportToAppEntryFile(() => ({ specifier: 'ReactDOM', source: 'react-dom' }));

  api.addImportToAppEntryFile(() => ({
    specifier: '{ isFn }',
    source: '@spark-build/web-utils',
  }));

  api.addContainerRenderToAppEntryFile({
    stage: 999,
    fn: () => `
function ReactDOMContainer(ele: React.ReactElement) {
  ReactDOM.render(ele, document.getElementById('root'));
}`,
  });
}

export default async function AppEntryFile(api: NodeJS.ViteReactAutoConfigServer) {
  api.registerMethod({ name: 'onGenerateAppEntryFile' });

  Object.keys(registerMethodKeys).forEach((name) => {
    api.registerMethod({
      name,
    });
  });

  addStrictModeRender(api);
  addRootContainer(api);

  api.onGenerateAppEntryFile(async () => {
    const filePath = api.resolveSrcPath('main.tsx');
    const content = await GenerateAppEntryFile.run(api);

    return outputFile(filePath, content).then(() => api.prettier.addPrettierFile(filePath));
  });
}
