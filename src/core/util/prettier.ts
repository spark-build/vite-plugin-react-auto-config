import { join } from 'path';

import * as fs from 'fs-extra';

import { exec } from './childProcess';

export class PrettierFiles {
  static files = [] as string[];

  static isConsoleLog = true;

  static rootDir: string = '';

  static setConsoleLog(t: boolean) {
    this.isConsoleLog = t;

    return this;
  }

  static setRootDir(dir: string) {
    this.rootDir = dir;

    return this;
  }

  static addPrettierFile(file: string) {
    this.files.push(file);
  }

  static reset() {
    this.files = [];
  }

  static async isExistSparkBuildLintDep() {
    const pkg = await fs.readJson(join(this.rootDir, 'package.json'));

    const deps = pkg.devDependencies || pkg.dependencies;

    return deps?.['@spark-build/lint'] ? Promise.resolve() : Promise.reject();
  }

  static async isExistPrettierFile() {
    const rootFiles = await fs.readdir(this.rootDir);

    return new Promise((r, j) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      rootFiles.some((n) => n.indexOf('prettier') !== -1) ? r(undefined) : j();
    });
  }

  static async canItBePrettier() {
    // return this.isExistPrettierFile();

    return this.isExistPrettierFile();
  }

  static prettier(filePath: string) {
    return exec(`yarn prettier --config .prettierrc.js --write ${filePath}`, this.isConsoleLog);
  }

  static async run() {
    if (!this.files.length) {
      return undefined;
    }

    return this.canItBePrettier()
      .then(() => Promise.all([...new Set(this.files)].map((f) => this.prettier(f))))
      .then(() => this.reset());
  }
}
