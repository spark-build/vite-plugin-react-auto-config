import { join } from 'path';

import { existsSync, statSync } from 'fs-extra';

import type { ServicePaths } from '../typings';

function isDirectoryAndExist(path: string) {
  return existsSync(path) && statSync(path).isDirectory();
}

export default function getServicePaths({ cwd, env }: { cwd: string; env?: string }): ServicePaths {
  let absSrcPath = cwd;
  if (isDirectoryAndExist(join(cwd, 'src'))) {
    absSrcPath = join(cwd, 'src');
  }

  const tmpDir = ['.vite-plugin-react-auto-config', env !== 'development' && env]
    .filter(Boolean)
    .join('-');

  return {
    cwd,
    absNodeModulesPath: join(cwd, 'node_modules'),
    absSrcPath: join(cwd, 'src'),
    absTmpPath: join(absSrcPath, tmpDir),
  };
}
