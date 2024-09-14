import { rollup, OutputOptions, ModuleFormat } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import path from 'path';
import { packageRoot } from './utils/paths';
import { sync } from 'fast-glob';
import { buildConfig } from './utils/config';
import { pathRewriter, withTaskName } from './utils';
import { series } from 'gulp';

const build = async () => {
  const packages = sync('*', {
    cwd: packageRoot,
    onlyDirectories: true
  });

  const tasks = packages.map(async (pkg) => {
    const input = path.resolve(packageRoot, pkg, 'src/index.ts');
    const inputOptions = {
      input,
      plugins: [nodeResolve(), commonjs(), typescript()]
    };
    const bundle = await rollup(inputOptions);

    const eachPackageTasks = Object.values(buildConfig).map((config) => {
      const outputOptions: OutputOptions = {
        format: config.format as ModuleFormat,
        file: path.resolve(config.output.path, `${pkg}/dist/index${config.output.ext}`),
        exports: 'named'
      };
      return bundle.write(outputOptions);
    });
    return Promise.all(eachPackageTasks);
  });
  return Promise.all(tasks);
};

// export const buildPackages = build();
export const buildPackages = series(withTaskName('eachPackage:build', build));
