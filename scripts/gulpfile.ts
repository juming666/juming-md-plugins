import { series, parallel } from 'gulp';
import { run, withTaskName } from './utils';

export default series(
  withTaskName('clean', async () => run(`rm -rf dist`)),
  parallel(withTaskName('buildPackages', () => run('pnpm run build buildPackages')))
);

export * from './build';
