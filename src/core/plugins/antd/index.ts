import { spliceImportFrom } from '../../util';
import { getLocaleSpecies } from '../locale/getLocaleSpecies';

async function getLocaleOptions(api: NodeJS.ViteReactAutoConfigServer) {
  const localeSpecies = await getLocaleSpecies(api, {
    defaultValue: [{ originName: 'zh-CN', underlineName: 'zhCN' }],
  });

  const locales = [] as string[];
  const imports = [] as string[];

  // 翻译文件命名规则是 zh-CN、en-US, antd 的翻译文件命名规则的是 zh_CN、en_US
  localeSpecies.forEach(({ originName, underlineName }) => {
    // zh-CN ==> zh_CN
    const horizontalLineToUnderscoreName = originName.replace(/-|_|\./g, '_');

    // zh-CN: zhCN
    locales.push(`'${originName}': ${underlineName}`);
    // import zhCN from "antd/es/locale/zh_CN";
    imports.push(
      spliceImportFrom(underlineName, `antd/es/locale/${horizontalLineToUnderscoreName}`),
    );
  });

  const importsText = imports.join('\n');

  // locales = { 'zh-CN': zhCN }
  const localesText = `
const locales = {
  ${locales.join(',\n  ')}
} as const;
`;

  return {
    importsText,
    localesText,
    isI18n: Boolean(api.userConfig.locale),
    defaultLocale: api.userConfig.locale?.default || localeSpecies[0].originName,
  };
}

export default async function antd(api: NodeJS.ViteReactAutoConfigServer) {
  api.describe({
    enable: () => !!api.userConfig.antd,
    onReCompile: (enable) => {
      if (!enable) {
        api.generateFile.removeTmpFile('antd');
      }
    },
  });

  api.onGenerateFiles({
    stage: 9,
    fn: async () => {
      api.generateFile.writeFile({
        path: 'antd/index.tsx',
        content: api.generateFile.renderTpl(
          api.generateFile.readTplFile(__dirname, 'RenderAntdConfigProviderComponent.tpl'),
          {
            ...(await getLocaleOptions(api)),
            ...(api.userConfig.antd?.config || {}),
          },
        ),
      });
    },
  });

  api.addImportToAppEntryFile(() => ({
    specifier: '{ RenderAntdConfigProvider }',
    source: api.resolveConfigAliasNamePath('antd'),
  }));

  api.addContainerRenderToAppEntryFile({
    stage: 997,
    fn: () => `
function renderAntdConfigProvider(children?: React.ReactElement) {
  return <RenderAntdConfigProvider>{children}</RenderAntdConfigProvider>;
}`,
  });
}
