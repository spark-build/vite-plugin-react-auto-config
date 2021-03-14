import { join } from 'path';

import { existsSync, readFileSync, outputFile, remove } from 'fs-extra';

import * as Mustache from 'mustache';

export class GenerateFile {
  private server: NodeJS.ViteReactAutoConfigServer;

  private generateFileQueue = [] as { path: string; content: string }[];

  constructor(server: NodeJS.ViteReactAutoConfigServer) {
    this.server = server;
  }

  addGenerateFileToQueue(opt: typeof GenerateFile['prototype']['generateFileQueue'][number]) {
    this.generateFileQueue.push(opt);

    return this;
  }

  readTplFile(...filePath: string[]) {
    return readFileSync(join(...filePath), 'utf-8');
  }

  renderTpl(content: string, view: Record<string, any>) {
    return Mustache.render(content, view);
  }

  outputFile(f: string, c: string) {
    return outputFile(f, c, 'utf-8');
  }

  async runGenerateFileQueue() {
    if (!this.generateFileQueue.length) {
      return undefined;
    }

    return Promise.all(
      this.generateFileQueue.map((item) => this.outputFile(item.path, item.content)),
    ).then(() => {
      this.generateFileQueue = [];
    });
  }

  async removeTmpFile(path: string) {
    const filePath = this.server.resolveTmpPath(path);

    return existsSync(filePath) ? remove(filePath) : true;
  }

  // 写入配置文件到临时目录
  async writeFile({
    path,
    content,
    isPrettier,
  }: {
    path: string;
    content: string;
    isPrettier?: boolean;
    isImmediatelyWrite?: boolean;
  }) {
    const filePath = this.server.resolveTmpPath(path);

    if (existsSync(filePath) && readFileSync(filePath, 'utf-8') === content) {
      return false;
    }

    // if (isImmediatelyWrite) {
    //   await this.outputFile(filePath, content);
    // } else {
    //   this.addGenerateFileToQueue({ path: filePath, content });
    // }

    await this.outputFile(filePath, content);

    if (isPrettier) {
      this.server.prettier.addPrettierFile(filePath);
    }

    return true;
  }
}
