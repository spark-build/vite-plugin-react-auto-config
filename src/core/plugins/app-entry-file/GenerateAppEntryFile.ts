import { Format } from './Format';
import { registerMethodKeys } from './constants';

export class GenerateAppEntryFile {
  private static fileContent = '';

  private static addSpaceToFileContent(text: string) {
    this.fileContent += text;
    this.fileContent += `\n\n`;
  }

  private static async handleAddFileContentByApplyHook({
    key,
    api,
    formatFn = (v: any) => v,
  }: {
    key: string;
    api: NodeJS.ViteReactAutoConfigServer;
    formatFn?: (v: any) => string;
  }) {
    const values = await api.applyPlugins({
      key,
    });

    if (values.length) {
      this.addSpaceToFileContent(values.map((v: any) => formatFn(v)).join('\n'));
    }
  }

  private static async getContainerRenderFunctionNames() {
    return [...new Set(this.fileContent.match(/(?<=function\s)\S+(?=\s?\()/g) || [])];
  }

  private static result() {
    const content = this.fileContent;

    this.fileContent = '';

    return content;
  }

  static async run(api: NodeJS.ViteReactAutoConfigServer) {
    await this.handleAddFileContentByApplyHook({
      key: registerMethodKeys.addImportToAppEntryFile,
      api,
      formatFn: Format.addImportToAppEntryFile,
    });

    await this.handleAddFileContentByApplyHook({
      key: registerMethodKeys.addContainerRenderToAppEntryFile,
      api,
    });

    const renderFCs = await this.getContainerRenderFunctionNames();

    this.addSpaceToFileContent(`
const renderContainers = [${renderFCs.join(', ')}] as (
  | typeof renderAntdConfigProvider
  | React.ReactElement
)[];

renderContainers.reduce((prev, current) => {
  if (!isFn(current)) {
    return prev;
  }

  return current(isFn(prev) ? prev() : prev);
});
    `);

    return this.result();
  }
}
