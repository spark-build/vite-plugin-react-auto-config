import * as fs from 'fs-extra';

const resolveFilePathByExts = (exts: string[], resolvePath: (ext: string) => string) => {
  for (let i = 0; i < exts.length; i += 1) {
    const filePath = resolvePath(exts[i]);

    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return '';
};

/**
 * 类似 umi 的运行时配置
 *
 * @see https://umijs.org/zh-CN/docs/runtime-config
 */
export default async function userGlobalRender(api: NodeJS.ViteReactAutoConfigServer) {
  const appStyleFilePath = resolveFilePathByExts(['css', 'less', 'scss'], (ext) =>
    api.resolveSrcPath(`app.${ext}`),
  );

  // 判断是否有 app.less;
  if (appStyleFilePath) {
    const appStyleFilePathSplit = appStyleFilePath.replace(/\\/g, '/').split('/');

    api.addImportToAppEntryFile({
      stage: -10,
      fn: () => `import '@/${appStyleFilePathSplit[appStyleFilePathSplit.length - 1]}';`,
    });
  }

  // 判断是否存在 app.tsx
  const appFilePath = resolveFilePathByExts(['tsx', 'jsx', 'ts', 'js'], (ext) =>
    api.resolveSrcPath(`app.${ext}`),
  );

  if (appFilePath) {
    const appTsxFileContent = (await fs.readFile(appFilePath))?.toString();
    if (/^export\s(function|const)\srootContainer/gm.test(appTsxFileContent)) {
      api.addImportToAppEntryFile(() => ({ specifier: '{ rootContainer }', source: '@/app' }));

      api.addContainerRenderToAppEntryFile({
        stage: 9,
        fn: () => `
function renderRootContainer(children?: React.ReactElement) {
  return rootContainer(children)
}`,
      });
    }
  }
}
