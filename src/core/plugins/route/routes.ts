import routesToJSON from './routesToJSON';

const filePath = 'routes/Routes.tsx';
const tpl = 'routes.tpl';

export async function generateRoutes(api: NodeJS.ViteReactAutoConfigServer) {
  const { routes, importNameTemplate } = routesToJSON(api.userConfig!);

  return api.generateFile.writeFile({
    path: filePath,
    content: api.generateFile.renderTpl(api.generateFile.readTplFile(__dirname, tpl), {
      routes,
      importNameTemplate,
      loadingComponent: api.userConfig.dynamicImport?.loading,
    }),
    // isPrettier: true,
  });
}
