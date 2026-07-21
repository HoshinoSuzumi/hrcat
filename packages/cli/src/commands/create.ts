import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import * as p from '@clack/prompts'
import chalk from 'chalk'
import ora from 'ora'
import { promptPluginConfig } from '../prompts/plugin'
import type { ScaffoldConfig } from '../types'
import {
  generatePackageJson,
  generateBrcatConfig,
  generateViteConfig,
  generateTsconfigJson,
  generateTsconfigAppJson,
  generateTsconfigNodeJson,
  generateWidgetIndexHtml,
  generateWidgetMain,
  generateWidgetApp,
  generateWidgetStyleCss,
  generateWidgetViteEnvDts,
  generateStreamingIndexHtml,
  generateStreamingMain,
  generateStreamingApp,
  generateStreamingStyleCss,
  generateStreamingViteEnvDts,
  generateSharedUseHeartRate,
} from '../generators'

function getPluginVersion(): string {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const pkgPath = path.resolve(__dirname, '..', 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    return pkg.version
  } catch {
    return '0.1.0'
  }
}

function writeFile(dir: string, filename: string, content: string) {
  const filePath = path.join(dir, filename)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
}

function scaffoldProject(config: ScaffoldConfig, pluginVersion: string): string[] {
  const root = config.targetDir
  const files: string[] = []

  // Root files
  writeFile(root, 'package.json', generatePackageJson(config, pluginVersion))
  files.push('package.json')

  writeFile(root, 'brcat.config.ts', generateBrcatConfig(config))
  files.push('brcat.config.ts')

  writeFile(root, 'vite.config.ts', generateViteConfig(config))
  files.push('vite.config.ts')

  writeFile(root, 'tsconfig.json', generateTsconfigJson())
  files.push('tsconfig.json')

  writeFile(root, 'tsconfig.app.json', generateTsconfigAppJson())
  files.push('tsconfig.app.json')

  writeFile(root, 'tsconfig.node.json', generateTsconfigNodeJson())
  files.push('tsconfig.node.json')

  // Widget
  if (config.widget.enabled) {
    const w = path.join(root, 'widget')
    writeFile(w, 'index.html', generateWidgetIndexHtml(config))
    files.push('widget/index.html')

    writeFile(w, 'src/main.ts', generateWidgetMain(config))
    files.push('widget/src/main.ts')

    writeFile(w, 'src/App.vue', generateWidgetApp(config))
    files.push('widget/src/App.vue')

    writeFile(w, 'src/style.css', generateWidgetStyleCss(config))
    files.push('widget/src/style.css')

    writeFile(w, 'src/vite-env.d.ts', generateWidgetViteEnvDts(config))
    files.push('widget/src/vite-env.d.ts')
  }

  // Streaming
  if (config.streaming.enabled) {
    const s = path.join(root, 'streaming')
    writeFile(s, 'index.html', generateStreamingIndexHtml(config))
    files.push('streaming/index.html')

    writeFile(s, 'src/main.ts', generateStreamingMain(config))
    files.push('streaming/src/main.ts')

    writeFile(s, 'src/App.vue', generateStreamingApp(config))
    files.push('streaming/src/App.vue')

    writeFile(s, 'src/style.css', generateStreamingStyleCss(config))
    files.push('streaming/src/style.css')

    writeFile(s, 'src/vite-env.d.ts', generateStreamingViteEnvDts(config))
    files.push('streaming/src/vite-env.d.ts')
  }

  // Shared
  if (config.widget.enabled) {
    writeFile(root, 'shared/composables/useHeartRate.ts', generateSharedUseHeartRate())
    files.push('shared/composables/useHeartRate.ts')
  }

  return files
}

function detectPackageManager(): 'pnpm' | 'npm' | 'yarn' {
  const cwd = process.cwd()
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml')) || fs.existsSync(path.join(cwd, 'pnpm-workspace.yaml'))) {
    return 'pnpm'
  }
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    return 'yarn'
  }
  // Prefer pnpm as default
  try {
    execSync('which pnpm', { stdio: 'ignore' })
    return 'pnpm'
  } catch { /* not found */ }
  return 'npm'
}

function installDependencies(targetDir: string): boolean {
  const pm = detectPackageManager()
  const spinner = ora(`正在使用 ${pm} 安装依赖...`).start()

  try {
    execSync(`${pm} install`, { cwd: targetDir, stdio: 'pipe' })
    spinner.succeed(`依赖安装完成（${pm}）`)
    return true
  } catch {
    spinner.warn(`自动安装失败，请手动在 ${chalk.cyan(targetDir)} 中运行 ${chalk.cyan(pm + ' install')}`)
    return false
  }
}

export async function runCreate(targetDir?: string) {
  const config = await promptPluginConfig(targetDir)
  if (!config) return

  // Check if target directory already exists
  if (fs.existsSync(config.targetDir)) {
    const files = fs.readdirSync(config.targetDir)
    if (files.length > 0) {
      const overwrite = await p.confirm({
        message: `目录 ${chalk.yellow(config.targetDir)} 已存在且非空，是否继续？`,
        initialValue: false,
      })
      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('已取消')
        return
      }
    }
  }

  // Scaffold
  const spinner = ora('正在生成项目文件...').start()
  const pluginVersion = getPluginVersion()
  const files = scaffoldProject(config, pluginVersion)
  spinner.succeed(`项目已生成到 ${chalk.cyan(config.targetDir)}`)

  // Show created files
  p.note(files.map((f) => chalk.dim(`  ${f}`)).join('\n'), '已创建文件')

  // Install dependencies
  const installed = installDependencies(config.targetDir)

  // Done
  const hasWidget = config.widget.enabled
  const hasStreaming = config.streaming.enabled
  const capabilities = [
    hasWidget && '桌面组件（Widget）',
    hasStreaming && '推流插件（Streaming）',
  ].filter(Boolean).join(' + ')

  p.outro(chalk.green('🎉 插件项目创建成功！'))

  let nextSteps = chalk.cyan(`cd ${path.relative(process.cwd(), config.targetDir)}`)

  if (!installed) {
    nextSteps += '\n' + chalk.cyan('pnpm install')
  }

  nextSteps += '\n' + chalk.cyan('pnpm dev')

  if (hasWidget && hasStreaming) {
    nextSteps += '\n' + chalk.dim('# 同时构建两种能力: BRCAT_BUILD=all pnpm dev')
  }

  p.note(nextSteps, '下一步')
}
