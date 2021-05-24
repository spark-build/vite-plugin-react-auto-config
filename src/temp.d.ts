/* eslint-disable max-len */
declare type LibraryNameChangeCase = ChangeCaseType | ((name: string) => string);
declare type ChangeCaseType =
  | 'camelCase'
  | 'capitalCase'
  | 'constantCase'
  | 'dotCase'
  | 'headerCase'
  | 'noCase'
  | 'paramCase'
  | 'pascalCase'
  | 'pathCase'
  | 'sentenceCase'
  | 'snakeCase';
declare type RegOptions = string | RegExp | (string | RegExp)[] | null | undefined;
interface Lib {
  importTest?: RegExp;
  /**
   * Dependent library name
   */
  libraryName: string;
  /**
   * When the imported style file does not end with .css, it needs to be turned on
   * @default: false
   */
  esModule?: boolean;
  /**
   * Custom imported component style conversion
   */
  resolveStyle?: (name: string) => string;
  /**
   * There may be some component libraries that are not very standardized.
   * You can turn on this to ignore to determine whether the file exists. Prevent errors when importing non-existent css files.
   * Performance may be slightly reduced after it is turned on, but the impact is not significant
   * @default: false
   */
  ensureStyleFile?: boolean;
  /**
   * Custom component file conversion
   * Turning on the environment does not work
   */
  resolveComponent?: (name: string) => string;
  /**
   * https://github.com/anncwb/vite-plugin-style-import/issues/12
   * `import ${libName} from 'xxxx';`
   * Used for custom import name
   */
  transformComponentImportName?: (name: string) => string;
  /**
   * Customize imported component file name style conversion
   * @default: paramCase
   */
  libraryNameChangeCase?: LibraryNameChangeCase;
}
export interface VitePluginComponentImport {
  include?: RegOptions;
  exclude?: RegOptions;
  /**
   * @default process.cwd()
   */
  root?: string;
  libs: Lib[];
}
