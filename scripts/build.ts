import { rollup, OutputOptions, ModuleFormat } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import path from 'path';
import { distRoot, packageRoot, projectRoot } from './utils/paths';
import { sync } from 'fast-glob';
import { buildConfig } from './utils/config';
import { withTaskName } from './utils';
import { series } from 'gulp';
import { Project, SourceFile } from 'ts-morph';
import fs from 'fs/promises';

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

/* 生成ts的声明文件 */
async function genTypes() {
  const packages = sync('*', {
    cwd: packageRoot,
    onlyDirectories: true
  });
  const tasks = packages.map(async (pkg) => {
    const workDir = path.resolve(packageRoot, pkg);
    const outDir = path.resolve(distRoot, pkg, 'dist/types');
    const project = new Project({
      tsConfigFilePath: path.resolve(projectRoot, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
      compilerOptions: {
        declaration: true,
        allowJs: true,
        emitDeclarationOnly: true,
        noEmitOnError: true,
        outDir,
        baseUrl: projectRoot,
        skipLibCheck: true,
        strict: false
      }
    });
    const projectFilePaths = sync('**/*', {
      cwd: workDir,
      onlyFiles: true,
      absolute: true
    });
    const sourceFiles: SourceFile[] = [];
    await Promise.all(
      projectFilePaths.map(async (file) => {
        if (file.endsWith('.ts')) {
          const sourceFile = project.addSourceFileAtPath(file);
          sourceFiles.push(sourceFile);
        }
      })
    );
    const diagnostics = project.getPreEmitDiagnostics();
    console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
    await project.emit({
      emitOnlyDtsFiles: true
    });

    const sourceFileTasks = sourceFiles.map(async (sourceFile: SourceFile) => {
      const emitOutput = sourceFile.getEmitOutput();
      const outputFileTasks = emitOutput.getOutputFiles().map(async (outputFile) => {
        const filepath = outputFile.getFilePath();
        await fs.mkdir(path.dirname(filepath), {
          recursive: true
        });
        const outputFileText = outputFile.getText();
        await fs.writeFile(filepath, outputFileText);
      });
      await Promise.all(outputFileTasks);
    });
    await Promise.all(sourceFileTasks);
  });
  return Promise.all(tasks);
}

export const buildPackages = series(
  withTaskName('eachPackage:build', build),
  withTaskName('eachPackage:genTypes', genTypes)
);
