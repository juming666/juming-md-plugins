import path from 'path';
import { distRoot } from './paths';
export const buildConfig = {
  esm: {
    module: 'ESNext',
    format: 'esm',
    output: {
      name: 'es',
      ext: '.mjs',
      path: path.resolve(distRoot)
    },
    bundle: {
      path: 'juming-md/es'
    }
  },
  cjs: {
    module: 'CommonJS',
    format: 'cjs',
    output: {
      name: 'lib',
      ext: '.js',
      path: path.resolve(distRoot)
    },
    bundle: {
      path: 'juming-md/lib'
    }
  }
};

export type BuildConfig = typeof buildConfig;
