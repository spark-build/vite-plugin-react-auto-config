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
        const loadFileSetting = await import(path).then((res) => ({
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
