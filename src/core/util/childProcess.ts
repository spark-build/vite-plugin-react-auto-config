import * as childProcess from 'child_process';
import type { Readable, Writable } from 'stream';

const PromiseWrapper = (cmdType: keyof typeof childProcess) => (
  options: any,
  isConsoleLog = true,
) =>
  new Promise((resolve, reject) => {
    const result = childProcess[cmdType as 'spawn'](options) as childProcess.ChildProcessByStdio<
      Writable,
      Readable,
      Readable
    >;

    const stdoutChunks = [] as string[];
    const stderrChunks = [] as string[];

    const capture = (chunks: string[]) => (data: string) => {
      chunks.push(data);

      if (isConsoleLog) {
        console.log(data.toString().trim());
      }
    };

    result.stdout.on('data', capture(stdoutChunks));
    result.stderr.on('data', capture(stderrChunks));

    result.on('close', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      stdoutChunks.length ? resolve(stdoutChunks) : reject(stderrChunks);
    });
  });

export const spawn = PromiseWrapper('spawn');
export const exec = PromiseWrapper('exec');
