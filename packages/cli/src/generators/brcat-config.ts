import type { ScaffoldConfig } from '../types'

export function generateBrcatConfig(config: ScaffoldConfig): string {
  const lines: string[] = [
    `import { defineConfig } from '@hrcat/plugin'`,
    '',
    'export default defineConfig({',
    `  name: '${config.name}',`,
  ]

  if (config.widget.enabled) {
    lines.push('  widget: {')
    lines.push('    window: {')
    lines.push(`      width: ${config.widget.width},`)
    lines.push(`      height: ${config.widget.height},`)
    lines.push(`      alwaysOnTop: ${config.widget.alwaysOnTop},`)
    lines.push(`      transparent: ${config.widget.transparent},`)
    lines.push('    },')
    lines.push('  },')
  }

  if (config.streaming.enabled) {
    lines.push('  streaming: {')
    lines.push('    viewport: {')
    lines.push(`      width: ${config.streaming.viewportWidth},`)
    lines.push(`      height: ${config.streaming.viewportHeight},`)
    lines.push('    },')
    lines.push('  },')
  }

  lines.push(`  permissions: [`)
  config.permissions.forEach((p) => lines.push(`    '${p}',`))
  lines.push('  ],')

  if (config.settings) {
    lines.push('  settings: ' + generateSettingsLiteral(config.settings, 2) + ',')
  }

  lines.push('})')
  lines.push('')

  return lines.join('\n')
}

function generateSettingsLiteral(
  settings: { type: 'object'; properties: Record<string, unknown> },
  indent: number,
): string {
  const pad = ' '.repeat(indent)
  const lines: string[] = ['{']
  lines.push(`${pad}  type: '${settings.type}',`)
  lines.push(`${pad}  properties: {`)

  for (const [key, prop] of Object.entries(settings.properties) as [string, Record<string, unknown>][]) {
    lines.push(`${pad}    ${key}: {`)
    for (const [k, v] of Object.entries(prop)) {
      if (v === undefined) continue
      if (Array.isArray(v)) {
        lines.push(`${pad}      ${k}: [${v.map((x) => `'${x}'`).join(', ')}],`)
      } else if (typeof v === 'string') {
        lines.push(`${pad}      ${k}: '${v}',`)
      } else {
        lines.push(`${pad}      ${k}: ${v},`)
      }
    }
    lines.push(`${pad}    },`)
  }

  lines.push(`${pad}  },`)
  lines.push(`${pad}}`)
  return lines.join('\n')
}
