import glob from 'globby';

import type { LocaleSpecies } from './getLocaleSpecies';
import { LOCALE_SPECIES, getLocaleSpecies } from './getLocaleSpecies';

import { getFileNameFromFilePath, spliceImportFrom } from '../../util';

const baseDir = 'locales';
const filePath = 'initReactI18next.ts';
const tpl = 'initReactI18next.tpl';
const defaultLocale = 'zh-CN';

const i18nFilePathName = '@types/react-i18next/index.d.ts';
/**
 * @see https://github.com/i18next/react-i18next/blob/master/example/react-typescript4.1/namespaces/%40types/react-i18next/index.d.ts
 */
const writeTypesFile = async (api: NodeJS.ViteReactAutoConfigServer) => {
  return api.generateFile.writeFile({
    path: i18nFilePathName,
    content: api.generateFile.renderTpl(api.generateFile.readTplFile(__dirname, 'index.d.ts.tpl'), {
      initReactI18nextPath: api.resolveConfigAliasNamePath(filePath),
      default: api.userConfig.locale?.default || defaultLocale,
    }),
  });
};

const writeFile = async (api: NodeJS.ViteReactAutoConfigServer, species: LocaleSpecies) => {
  let imports = '';
  let resources = '';
  species.forEach(({ originName, underlineName }, index) => {
    // import zhCN from "@/locales/zh-CN";
    imports += `${spliceImportFrom(underlineName, `@/${baseDir}/${originName}`)}\n`;

    // 没有命名空间的设置
    // translation: { zhCN }
    resources += `${index ? '\n' : ''}  '${originName}': {
    translation: ${underlineName},
  },`;
  });

  const { locale: localConfig } = api.userConfig;

  await api.generateFile.writeFile({
    path: filePath,
    content: api.generateFile.renderTpl(api.generateFile.readTplFile(__dirname, tpl), {
      imports,
      resources,
      default: localConfig?.default,
    }),
  });

  return species;
};

export default async function locale(api: NodeJS.ViteReactAutoConfigServer) {
  api.describe({
    id: 'locale',
    enable: () => !!api.userConfig.locale,
    onReCompile: (enableBy: boolean) => {
      if (!enableBy) {
        api.generateFile.removeTmpFile(i18nFilePathName);
        api.generateFile.removeTmpFile(filePath);
      }
    },
  });

  // 将 react-i18next 的能力统一到同一的导出文件中
  api.addDepsEntryExports(() => ({ source: 'react-i18next' }));

  // 注入 react-i18n-next 的配置
  api.addImportToAppEntryFile({
    stage: -9,
    fn: () => ({
      source: api.resolveConfigAliasNamePath(filePath),
    }),
  });

  // 将当前存在的翻译种类储存到上下文中，供其他插件使用
  api.addHook({
    key: LOCALE_SPECIES,
    async fn() {
      const files = await glob(api.resolveSrcPath(`${baseDir}/*.ts`));

      return files.map((f) => {
        // xxx/locales/zh-CN ==> zh-CN
        const originName = getFileNameFromFilePath(f);

        // zh-CN ==> zhCN
        const underlineName = originName.replace(/-|_|\./g, '');

        return { originName, underlineName };
      });
    },
  });

  api.onGenerateFiles({
    stage: -1,
    fn: async () => {
      const localeSpecies = await getLocaleSpecies(api);

      await writeTypesFile(api);

      return writeFile(api, localeSpecies);
    },
  });
}
