/* eslint-disable import/no-dynamic-require */
import { join } from 'path';

import * as fs from 'fs-extra';
import { isFn, isObj } from '@spark-build/web-utils/lib/type';

export const loadPlugins = async () => {
  // todo：目前先读取内部实现的，后续可以读取自定义的
  const pluginsDirPath = join(__dirname, '../../../plugins');
  const files = await fs.readdir(pluginsDirPath);

  return Promise.all(
    files.map(async (id) => {
      const path = join(pluginsDirPath, id);

      try {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const loadFileSetting = await new Promise<{ stage?: number; default: Function }>(
          (resolve, reject) => {
            try {
              /**
               * fix
               *  warning: This call to "require" will not be bundled because the argument is not a string literal
               * (surround with a try/catch to silence this warning)
               */
              // eslint-disable-next-line global-require
              resolve(require(path));
            } catch (error) {
              reject(error);
            }
          },
        ).then((res) => ({
          stage: res.stage || 0,
          fn: res.default,
        }));

        /**
         * 使用 tapable 来 load plugin
         * stage 默认是 0，设为 -1 或更少会提前执行，设为 1 或更多会后置执行
         */
        return {
          id,
          path,
          ...loadFileSetting,
        };
      } catch (e) {
        throw new Error(`Register ${id} ${path} failed, since ${e.message}`);
      }
    }),
  );
};

export const isPromise = (obj: any) => (isObj(obj) || isFn(obj)) && isFn((obj as any).then);
