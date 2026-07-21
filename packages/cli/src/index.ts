#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { runCreate } from './commands/create'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function readVersion(): string {
  try {
    const pkgPath = join(__dirname, '..', 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    return pkg.version
  } catch {
    return '0.1.0'
  }
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (command === 'create' || command === 'init' || command === undefined) {
    const targetDir = command ? args[1] : args[0]
    await runCreate(targetDir)
  } else if (command === '--version' || command === '-v') {
    console.log(readVersion())
  } else if (command === '--help' || command === '-h') {
    console.log(`🫀 HeartBeatCat Plugin CLI

Usage:
  hrcat [dir]         Create a new plugin project (interactive)
  hrcat create [dir]  Same as above
  hrcat init [dir]    Same as above
  hrcat -v, --version Show version
  hrcat -h, --help    Show this help
`)
  } else {
    console.error(`Unknown command: ${command}`)
    console.error('Run hrcat --help for usage.')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
