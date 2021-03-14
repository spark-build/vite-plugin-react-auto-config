export const spliceImportFrom = (specifier: string, source: string) =>
  `import ${specifier} from '${source}';`;

export const spliceImportOrImportFrom = (obj: { specifier?: string; source: string }) =>
  obj.specifier ? spliceImportFrom(obj.specifier, obj.source) : `import '${obj.source}';`;

export const spliceImport = (source: string) => `import '${source}';`;

export const spliceExportFrom = (specifier: string, source: string) =>
  `export ${specifier} from '${source}';`;
export const spliceExportAll = (source: string) => spliceExportFrom('*', source);

export const getFileNameFromFilePath = (f: string) => {
  const arr = f.replace(/\//g, '/').split('/');

  const [name] = arr[arr.length - 1].split('.');

  return name;
};

export const removeFileExt = (p: string) => p.replace(/\.\w+$/, '');

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
