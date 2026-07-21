export function generateTsconfigJson(): string {
  return JSON.stringify(
    {
      files: [],
      references: [
        { path: './tsconfig.app.json' },
        { path: './tsconfig.node.json' },
      ],
    },
    null,
    2,
  ) + '\n'
}

export function generateTsconfigAppJson(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        tsBuildInfoFile: './node_modules/.tmp/tsconfig.app.tsbuildinfo',
        target: 'ES2020',
        useDefineForEsmModules: true,
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        isolatedModules: true,
        moduleDetection: 'force',
        noEmit: true,
        jsx: 'preserve',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        noUncheckedSideEffectImports: true,
      },
      include: ['widget/src/**/*.ts', 'widget/src/**/*.tsx', 'widget/src/**/*.vue', 'streaming/src/**/*.ts', 'streaming/src/**/*.tsx', 'streaming/src/**/*.vue', 'shared/**/*.ts'],
    },
    null,
    2,
  ) + '\n'
}

export function generateTsconfigNodeJson(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        tsBuildInfoFile: './node_modules/.tmp/tsconfig.node.tsbuildinfo',
        target: 'ES2022',
        lib: ['ES2023'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        isolatedModules: true,
        moduleDetection: 'force',
        noEmit: true,
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        noUncheckedSideEffectImports: true,
      },
      include: ['vite.config.ts', 'brcat.config.ts'],
    },
    null,
    2,
  ) + '\n'
}
