// import { generateDynamic } from './generateFiles/dynamic';
import { generateRoutes } from './routes';
import {
  generateRenderAppRouter,
  filePath as generateRenderAppRouterFilePath,
} from './renderAppRouter';

export default async function generateRouter(api: NodeJS.ViteReactAutoConfigServer) {
  api.addDepsEntryExports(() => ({ source: 'react-router-dom' }));

  // todo: 根据配置路由的 hash、browser 来进行区别导入 BrowserRouter、HashRouter
  api.addImportToAppEntryFile(() => ({
    specifier: '{ BrowserRouter as Router }',
    source: 'react-router-dom',
  }));

  api.addImportToAppEntryFile(() => ({
    specifier: '{ RenderAppRouter }',
    source: api.resolveConfigAliasNamePath(generateRenderAppRouterFilePath.replace('.tsx', '')),
  }));

  api.addContainerRenderToAppEntryFile(
    () => `
function renderRouter(children?: React.ReactElement) {
  return (
    <Router>
      <RenderAppRouter />

      {children}
    </Router>
  );
}`,
  );

  api.onGenerateFiles(async () => {
    await generateRoutes(api);

    await generateRenderAppRouter(api);
  });
}
