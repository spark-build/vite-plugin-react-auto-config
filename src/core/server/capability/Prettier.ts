import * as fs from 'fs-extra';

import { exec } from '../../util';

export class PrettierFiles {
  private files = [] as string[];

  private isConsoleLog = true;

  private server: NodeJS.ViteReactAutoConfigServer;

  constructor(server: NodeJS.ViteReactAutoConfigServer) {
    this.server = server;
  }

  setConsoleLog(t: boolean) {
    this.isConsoleLog = t;

    return this;
  }

  addPrettierFile(file: string) {
    this.files.push(file);

    return this;
  }

  reset() {
    this.files = [];
  }

  async isExistSparkBuildLintDep() {
    const pkg = await fs.readJson(this.server.resolveRootPath('package.json'));

    const deps = pkg.devDependencies || pkg.dependencies;

    return deps?.['@spark-build/lint'] ? Promise.resolve() : Promise.reject();
  }

  async isExistPrettierFile() {
    const rootFiles = await fs.readdir(this.server.paths.cwd);

    return new Promise((r, j) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      rootFiles.some((n) => n.indexOf('prettier') !== -1) ? r(undefined) : j();
    });
  }

  async canItBePrettier() {
    // return this.isExistPrettierFile();

    return this.isExistPrettierFile();
  }

  prettier(filePath: string) {
    return exec(`yarn prettier --config .prettierrc.js --write ${filePath}`, this.isConsoleLog);
  }

  async run() {
    if (!this.files.length) {
      return undefined;
    }

    return this.canItBePrettier()
      .then(() => Promise.all([...new Set(this.files)].map((f) => this.prettier(f))))
      .then(() => this.reset())
      .catch(() => {});
  }
}
