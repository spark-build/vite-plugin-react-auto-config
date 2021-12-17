import { resolveGenerateRouterPath } from './utils';

export const filePath = resolveGenerateRouterPath('RenderAppRouter.tsx');
const tpl = '/tpl/RenderAppRouter.tsx.tpl';

export async function generateRenderAppRouter(api: NodeJS.ViteReactAutoConfigServer) {
  return api.generateFile.writeFile({
    path: filePath,
    content: api.generateFile.renderTpl(api.generateFile.readTplFile(__dirname, tpl), {}),
  });
}
