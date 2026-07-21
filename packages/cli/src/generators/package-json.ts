import type { ScaffoldConfig } from '../types'

export function generatePackageJson(config: ScaffoldConfig): string {
  return JSON.stringify(
    {
      name: config.pluginId,
      version: config.version,
      description: config.description,
      private: true,
      type: 'module',
      author: config.author,
      scripts: {
        dev: 'vite',
        build: 'vue-tsc -b && vite build',
        preview: 'vite preview',
      },
      dependencies: {
        '@hrcat/plugin': '^0.1.0',
        vue: '^3.5.0',
      },
      devDependencies: {
        '@tauri-apps/api': '^2.5.0',
        '@vitejs/plugin-vue': '^5.2.0',
        typescript: '~5.7.0',
        vite: '^6.3.0',
        'vue-tsc': '^2.2.0',
      },
    },
    null,
    2,
  ) + '\n'
}
