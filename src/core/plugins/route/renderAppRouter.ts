export const filePath = 'routes/Router.tsx';
const tpl = 'renderAppRouter.tpl';

export async function generateRenderAppRouter(api: NodeJS.ViteReactAutoConfigServer) {
  return api.generateFile.writeFile({
    path: filePath,
    content: api.generateFile.renderTpl(api.generateFile.readTplFile(__dirname, tpl), {}),
  });
}
