import { join } from 'path';

import type { ServicePaths } from '../typings';

export class ResolvePath {
  paths = {} as Readonly<ServicePaths>;

  setPaths(paths: ServicePaths) {
    this.paths = paths;
  }

  resolveTmpPath(...args: string[]) {
    return join(this.paths.absTmpPath, ...args);
  }

  resolveNodeModulesPath(...args: string[]) {
    return join(this.paths.absNodeModulesPath, ...args);
  }

  resolveSrcPath(...args: string[]) {
    return join(this.paths.absSrcPath, ...args);
  }

  resolveRootPath(...args: string[]) {
    return join(this.paths.cwd, ...args);
  }
}
