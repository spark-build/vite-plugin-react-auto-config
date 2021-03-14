import { isStr } from '@spark-build/web-utils/lib/type';

import { registerMethodKeys } from './constants';

import { spliceImportOrImportFrom } from '../../util';
import type { ExportOrImportParams } from '../../typings';

export class Format {
  /**
   * api.addImportToAppEntryFile({ specifier: '{ BrowserRouter as Router }', source: 'react-router-dom' })
   * ==>
   * import { BrowserRouter as Router } from 'react-router-dom'
   *
   * api.addImportToAppEntryFile({ source: '@@initReactI18next' })
   * ==>
   * import '@@initReactI18next'
   */
  static [registerMethodKeys.addImportToAppEntryFile] = (text: ExportOrImportParams) => {
    return isStr(text) ? text : spliceImportOrImportFrom(text);
  };

  /**
   *
   * api.addContainerRenderToAppEntryFile(`
      function renderAntdConfigProvider(children?: React.ReactElement) {
        return <RenderAntdConfigProvider>{children}</RenderAntdConfigProvider>;
      }
   * `)
   * ==>
    function renderAntdConfigProvider(children?: React.ReactElement) {
      return <RenderAntdConfigProvider>{children}</RenderAntdConfigProvider>;
    }
   */
  // static [registerMethodKeys.addContainerRenderToAppEntryFile] = (text: string) => text;

  /**
   * 用于导入的渲染容器方法
   * api.addRenderFunctionName(`rootContainer`)
   * ==>
   * const renderContainers = [rootContainer]
   */
  // static [registerMethodKeys.addRenderFunctionNameToAppEntryFile] = (text: string) => text;
}
