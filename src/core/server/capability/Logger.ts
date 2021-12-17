import ora, { Ora } from 'ora';
import type { ForegroundColor } from 'chalk';
import chalk from 'chalk';

const name = '[vite-plugin-react-auto-config]';

export type LogType = 'error' | 'warn' | 'info';

function getLogPrefix(type: LogType = 'info') {
  return type === 'info'
    ? chalk.cyan.bold(name)
    : type === 'warn'
    ? chalk.yellow.bold(name)
    : chalk.red.bold(name);
}

function outputLogText(opts = {} as Partial<{ type: LogType; color: typeof ForegroundColor }>) {
  const { type = 'info', color = 'green' } = opts;

  return (...args: string[]) => `${getLogPrefix(type)} ${chalk[color](args)}`;
}

class Spinner {
  private spinnerInstance: Ora | undefined;

  init(text = '即将开始启动自动生成业务配置代码，请稍等~\n') {
    this.spinnerInstance = ora(outputLogText()(text));
    this.spinnerInstance.start();
  }

  get spinner() {
    if (!this.spinnerInstance) {
      this.init();
    }

    return this.spinnerInstance!;
  }

  awaitText(text: string) {
    this.spinner.text = text;
  }

  printCompiling() {
    this.awaitText(`正在编译...\n`);
  }

  awaitReCompiling() {
    this.awaitText(`配置文件发生了变动，等待重新编译生成..`);
  }

  stopAndPersistOk(text: string) {
    this.spinner.stopAndPersist({
      symbol: '✅',
      text: outputLogText()(`${text} ${new Date().toLocaleString()}\n`),
    });
  }

  printWhenFirstDone() {
    this.spinner.clear();
    console.log(outputLogText({ color: 'gray' })(`监听配置文件修改中...\n`));
  }
}

export class Logger extends Spinner {
  output(type: LogType, ...msg: any) {
    const method = type === 'info' ? 'log' : type;

    console[method](outputLogText({ type })(msg));
  }

  info(...msg: any) {
    this.output('info', msg);
  }

  warn(...msg: any) {
    this.output('warn', msg);
  }

  error(...msg: any) {
    this.output('error', msg);
  }
}
