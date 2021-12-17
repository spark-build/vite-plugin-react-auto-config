const fs = require('fs-extra');
const path = require('path');

const resolvePathByRoot = (...args) => path.resolve(process.cwd(), ...args);

const exampleDepLibPath = (moduleType = 'lib') =>
  resolvePathByRoot(
    'example',
    'node_modules',
    '@spark-build',
    'vite-plugin-react-auto-config',
    moduleType,
  );

const removeExampleDepLib = (moduleType = 'lib') => fs.remove(exampleDepLibPath(moduleType));
const copyToExampleDepLib = (moduleType = 'lib') =>
  fs.copy(resolvePathByRoot(moduleType), exampleDepLibPath(moduleType));

(async () => {
  for (const moduleType of ['lib', 'es']) {
    await removeExampleDepLib(moduleType);
    await copyToExampleDepLib(moduleType);
  }
})();
