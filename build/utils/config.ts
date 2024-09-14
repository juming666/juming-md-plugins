import path from 'path';
import { distRoot } from './paths';
export const buildConfig = {
  esm: {
    module: 'ESNext',
    format: 'esm',
    output: {
      name: 'es',
      path: path.resolve(distRoot, 'es')
    },
    bundle: {
      path: '@juming-md/es'
    }
  },
  cjs: {
    module: 'CommonJS',
    format: 'cjs',
    output: {
      name: 'lib',
      path: path.resolve(distRoot, 'lib')
    },
    bundle: {
      path: '@juming-md/lib'
    }
  }
};

export type BuildConfig = typeof buildConfig;
