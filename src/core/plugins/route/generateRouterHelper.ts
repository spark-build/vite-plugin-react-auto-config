import { resolveGenerateRouterPath } from './utils';

const fileNames = ['index.ts', 'helper.tsx', 'copy-react-router-api.ts', 'types.ts', 'Link.tsx'];

/**
 * 生成 Router 辅助相关文件
 */
export async function generateRouterHelper(api: NodeJS.ViteReactAutoConfigServer) {
  return Promise.all(
    fileNames.map((fileName) =>
      api.generateFile.writeFile({
        path: resolveGenerateRouterPath(fileName),
        content: api.generateFile.renderTpl(
          api.generateFile.readTplFile(__dirname, `/tpl/${fileName}.tpl`),
          {},
        ),
      }),
    ),
  );
}
