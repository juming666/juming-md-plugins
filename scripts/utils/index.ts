import { spawn } from 'child_process';
import { projectRoot } from './paths';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SimpleFunction = (...args: any[]) => any;

export function withTaskName(displayName: string, taskFunction: SimpleFunction, description?: string) {
  return Object.assign(taskFunction, { displayName, description });
}

export async function run(commandStr: string) {
  return new Promise<void>((resolve) => {
    const [command, ...args] = commandStr.split(' ');
    const childProcess = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    childProcess.on('close', resolve);
  });
}

export function pathRewriter(outputName: string) {
  return (id: string) => {
    return id.replace(/@juming-md\//g, `juming-md/${outputName}/`);
  };
}
