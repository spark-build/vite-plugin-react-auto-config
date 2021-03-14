import * as fs from 'fs-extra';

/**
 * 类似 umi 的运行时配置
 *
 * @see https://umijs.org/zh-CN/docs/runtime-config
 */
export default async function userGlobalRender(api: NodeJS.ViteReactAutoConfigServer) {
  // 判断是否有 app.less;
  if (fs.existsSync(api.resolveSrcPath('app.less'))) {
    api.addImportToAppEntryFile({
      stage: -10,
      fn: () => `import '@/app.less';`,
    });
  }

  // 判断是否存在 app.tsx
  const appTsxFilePath = api.resolveSrcPath('app.tsx');
  if (fs.existsSync(appTsxFilePath)) {
    const appTsxFileContent = (await fs.readFile(appTsxFilePath))?.toString();
    if (/^function\srootContainer/.test(appTsxFileContent)) {
      api.addImportToAppEntryFile(() => ({ specifier: '{ rootContainer }', source: '@/app' }));
      api.addRenderFunctionNameToAppEntryFile(() => 'rootContainer');
    }
  }
}
