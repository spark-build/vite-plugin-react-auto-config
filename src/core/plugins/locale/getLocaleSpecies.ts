export const LOCALE_SPECIES = 'localeSpecies';

export type LocaleSpecies = { originName: string; underlineName: string }[];

export const getLocaleSpecies = async (
  api: NodeJS.ViteReactAutoConfigServer,
  opts = {} as { initialValue?: any; defaultValue?: any },
): Promise<LocaleSpecies> => {
  return api.applyPlugins({
    key: LOCALE_SPECIES,
    ...opts,
  });
};
