import type { ScaffoldConfig } from '../types'

export function generateViteConfig(config: ScaffoldConfig): string {
  return `import { createLogger, defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json'
import hrcatCfg from './hrcat.config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import archiver from 'archiver'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const logger = createLogger('info', { prefix: 'hrcat' })

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

function generateManifest() {
  const manifest: Record<string, unknown> = {
    manifestVersion: 1,
    plugin: {
      id: pluginId,
      name: hrcatCfg.name ?? pkg.name,
      version: pkg.version,
      description: pkg.description,
      author: pkg.author ?? null,
      homepage: hrcatCfg.homepage ?? null,
      icon: hrcatCfg.icon ?? 'icon.png',
    },
    permissions: hrcatCfg.permissions ?? [],
    settings: hrcatCfg.settings ?? null,
  }

  if (hasWidget && hrcatCfg.widget) {
    manifest.widget = {
      entry: 'widget/index.html',
      window: {
        width: hrcatCfg.widget.window?.width ?? 200,
        height: hrcatCfg.widget.window?.height ?? 150,
        alwaysOnTop: hrcatCfg.widget.window?.alwaysOnTop ?? true,
        transparent: hrcatCfg.widget.window?.transparent ?? true,
      },
    }
  }

  if (hasStreaming && hrcatCfg.streaming) {
    manifest.streaming = {
      entry: 'streaming/index.html',
      viewport: {
        width: hrcatCfg.streaming.viewport?.width ?? 1920,
        height: hrcatCfg.streaming.viewport?.height ?? 1080,
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

function packagePlugin() {
  const sourceDir = path.join(__dirname, 'dist', pluginId)
  const output = fs.createWriteStream(
    path.join(__dirname, 'dist', \`\${pluginId}_\${pkg.version}.hrcp\`),
  )
  const archive = archiver('zip', { zlib: { level: 9 } })
  archive.pipe(output)
  archive.on('error', (err: Error) => { throw err })
  archive.directory(sourceDir, false)
  archive.finalize().then(() => {
    logger.info(\`Packaged dist/\${pluginId}_\${pkg.version}.hrcp\`)
  })
}

function hrcatPostBuildPlugin() {
  let secondBuildDone = false

  return {
    name: 'hrcat-post-build',
    async writeBundle() {
      if (hasWidget && hasStreaming && !secondBuildDone) {
        secondBuildDone = true
        const { build: viteBuild } = await import('vite')
        logger.info('Building streaming entry...')
        await viteBuild({
          ...streamingConfig,
          configFile: false,
          logLevel: 'info',
        } as any)
      }

      generateManifest()
      packagePlugin()
    },
  }
}

function resolveConfig(): UserConfig {
  if (hasWidget) {
    return {
      ...widgetConfig,
      plugins: [...(widgetConfig.plugins ?? []), hrcatPostBuildPlugin()],
    }
  }

  if (hasStreaming) {
    return {
      ...streamingConfig,
      plugins: [...(streamingConfig.plugins ?? []), hrcatPostBuildPlugin()],
    }
  }

  logger.error('No build entry found (widget/ or streaming/ directory required)')
  process.exit(1)
}

export default defineConfig(() => resolveConfig())
`
}

