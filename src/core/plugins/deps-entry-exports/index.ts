import { outputFile } from 'fs-extra';
import { isStr } from '@spark-build/web-utils/lib/type';

import type { ExportOrImportParams } from '../../typings';
import { spliceExportFrom } from '../../util';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  module NodeJS {
    interface ViteReactAutoConfigServer {
      addDepsEntryExports: (fn: () => ExportOrImportParams) => void;
    }
  }
}

export const stage = -8;

export default async function depsEntryExports(api: NodeJS.ViteReactAutoConfigServer) {
  api.registerMethod({
    name: 'addDepsEntryExports',
  });

  api.onGenerateFiles(async () => {
    const exports = await api.applyPlugins<string>({
      key: 'addDepsEntryExports',
    });

    if (!exports.length) {
      return undefined;
    }

    const exportsToString = exports
      .map((text: ExportOrImportParams) =>
        isStr(text) ? text : spliceExportFrom(text.specifier || '*', text.source),
      )
      .join('\n');

    return outputFile(api.resolveTmpPath('index.ts'), exportsToString);
  });
}
