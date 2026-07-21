import type { ScaffoldConfig } from '../types'

export function generateViteConfig(config: ScaffoldConfig): string {
  return `import { createLogger, defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'
import brcatCfg from './brcat.config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const logger = createLogger('info', { prefix: 'brcat' })

const pluginId = pkg.name

const hasWidget = fs.existsSync(path.join(__dirname, 'widget'))
const hasStreaming = fs.existsSync(path.join(__dirname, 'streaming'))

const widgetConfig: UserConfig = {
  base: \`/p/\${pluginId}/widget/\`,
  root: path.join(__dirname, 'widget'),
  build: {
    outDir: path.join(__dirname, 'dist', pluginId, 'widget'),
    emptyOutDir: true,
  },
  plugins: [vue()],
}

const streamingConfig: UserConfig = {
  base: \`/p/\${pluginId}/streaming/\`,
  root: path.join(__dirname, 'streaming'),
  build: {
    outDir: path.join(__dirname, 'dist', pluginId, 'streaming'),
    emptyOutDir: true,
  },
  plugins: [vue()],
}

// ── 选择构建配置 ──
const mode = process.env.BRCAT_BUILD || ''
const isBuildAll = mode === 'all'

let buildConfigs: UserConfig[] = []

if (isBuildAll) {
  if (hasWidget) buildConfigs.push(widgetConfig)
  if (hasStreaming) buildConfigs.push(streamingConfig)
} else {
  if (hasWidget) buildConfigs.push(widgetConfig)
  if (hasStreaming) buildConfigs.push(streamingConfig)
}

if (buildConfigs.length === 0) {
  logger.error('No build entry found (widget/ or streaming/ directory required)')
  process.exit(1)
}

function generateManifest() {
  const manifest: Record<string, unknown> = {
    manifestVersion: 1,
    plugin: {
      id: pluginId,
      name: brcatCfg.name ?? pkg.name,
      version: pkg.version,
      description: pkg.description,
      author: pkg.author ?? null,
      homepage: brcatCfg.homepage ?? null,
      icon: brcatCfg.icon ?? 'icon.png',
    },
    permissions: brcatCfg.permissions ?? [],
    settings: brcatCfg.settings ?? null,
  }

  if (hasWidget && brcatCfg.widget) {
    manifest.widget = {
      entry: 'widget/index.html',
      window: {
        width: brcatCfg.widget.window?.width ?? 200,
        height: brcatCfg.widget.window?.height ?? 150,
        alwaysOnTop: brcatCfg.widget.window?.alwaysOnTop ?? true,
        transparent: brcatCfg.widget.window?.transparent ?? true,
      },
    }
  }

  if (hasStreaming && brcatCfg.streaming) {
    manifest.streaming = {
      entry: 'streaming/index.html',
      viewport: {
        width: brcatCfg.streaming.viewport?.width ?? 1920,
        height: brcatCfg.streaming.viewport?.height ?? 1080,
      },
    }
  }

  const manifestDir = path.join(__dirname, 'dist', pluginId)
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true })
  }

  fs.writeFileSync(
    path.join(manifestDir, 'hbcat-manifest.json'),
    JSON.stringify(manifest, null, 2),
  )
  logger.info(\`Generated dist/\${pluginId}/hbcat-manifest.json\`)
}

export default defineConfig(({ mode }) => {
  if (mode === 'manifest') {
    generateManifest()
    process.exit(0)
  }

  const config = buildConfigs[0]

  if (buildConfigs.length > 1) {
    logger.info(
      'Multiple build entries detected. Build with BRCAT_BUILD=all to build all, or specify with BRCAT_BUILD=<entry>',
    )
  }

  return {
    base: config.base,
    root: config.root,
    build: {
      ...config.build,
      rollupOptions: config.build?.rollupOptions ?? {},
    },
    plugins: [
      vue(),
      {
        name: 'brcat-manifest',
        closeBundle() {
          generateManifest()
        },
      },
    ],
  }
})
`
}
