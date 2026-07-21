import * as p from '@clack/prompts'
import path from 'node:path'
import type { ScaffoldConfig, SettingsProperty } from '../types'

const AVAILABLE_PERMISSIONS = [
  { value: 'heart-rate', label: 'heart-rate — 心率数据' },
  { value: 'device-connected', label: 'device-connected — 设备连接' },
  { value: 'device-disconnected', label: 'device-disconnected — 设备断开' },
]

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function defaultId(name: string): string {
  return 'hrcat-plugin-' + toKebabCase(name)
}

async function askSettings(): Promise<{ type: 'object'; properties: Record<string, SettingsProperty> } | null> {
  const hasSettings = await p.confirm({
    message: '是否需要用户可配置的设置项？',
    initialValue: false,
  })

  if (p.isCancel(hasSettings) || !hasSettings) return null

  const properties: Record<string, SettingsProperty> = {}

  let addMore = true
  while (addMore) {
    const key = await p.text({
      message: '设置项 key（如 displayUnit）：',
      validate: (v) => {
        if (!v.trim()) return 'key 不能为空'
        if (properties[v.trim()]) return 'key 已存在'
      },
    })
    if (p.isCancel(key)) break

    const fieldType = await p.select({
      message: '类型：',
      options: [
        { value: 'string', label: 'string' },
        { value: 'number', label: 'number' },
        { value: 'integer', label: 'integer' },
        { value: 'boolean', label: 'boolean' },
      ],
    })
    if (p.isCancel(fieldType)) break

    const title = await p.text({
      message: '显示名称（title）：',
      placeholder: key,
    })
    if (p.isCancel(title)) break

    const description = await p.text({
      message: '描述（可选）：',
      placeholder: '留空跳过',
    })

    if (p.isCancel(description)) break

    const prop: SettingsProperty = {
      type: fieldType as SettingsProperty['type'],
      title: title.trim() || key,
      description: description.trim() || undefined,
    }

    if (prop.type === 'number' || prop.type === 'integer') {
      const minStr = await p.text({
        message: '最小值（可选）：',
        placeholder: '留空不限制',
      })
      if (p.isCancel(minStr)) break
      if (minStr.trim()) prop.minimum = Number(minStr)

      const maxStr = await p.text({
        message: '最大值（可选）：',
        placeholder: '留空不限制',
      })
      if (p.isCancel(maxStr)) break
      if (maxStr.trim()) prop.maximum = Number(maxStr)
    }

    if (prop.type === 'string') {
      const hasEnum = await p.confirm({
        message: '是否有枚举选项？',
        initialValue: false,
      })
      if (p.isCancel(hasEnum)) break
      if (hasEnum) {
        const enumStr = await p.text({
          message: '枚举值（逗号分隔）：',
          placeholder: 'bpm,percentage',
        })
        if (p.isCancel(enumStr)) break
        prop.enum = enumStr.split(',').map((s) => s.trim()).filter(Boolean)
      }
    }

    // default value
    const defStr = await p.text({
      message: `默认值（可选，当前类型 ${prop.type}）：`,
      placeholder: '留空不设默认值',
    })
    if (p.isCancel(defStr)) break
    if (defStr.trim()) {
      if (prop.type === 'number' || prop.type === 'integer') prop.default = Number(defStr)
      else if (prop.type === 'boolean') prop.default = defStr.toLowerCase() === 'true'
      else prop.default = defStr.trim()
    }

    properties[key] = prop

    addMore = (await p.confirm({
      message: '继续添加设置项？',
      initialValue: false,
    })) as boolean
    if (p.isCancel(addMore)) break
  }

  return Object.keys(properties).length > 0 ? { type: 'object', properties } : null
}

export async function promptPluginConfig(targetDir?: string): Promise<ScaffoldConfig | null> {
  p.intro('🫀 HeartBeatCat 插件脚手架')

  const name = await p.text({
    message: '插件名称（显示用）：',
    placeholder: '我的心率插件',
    validate: (v) => v.trim() ? undefined : '名称不能为空',
  })
  if (p.isCancel(name)) { p.cancel('已取消'); return null }

  const pluginId = await p.text({
    message: '插件 ID（唯一标识）：',
    placeholder: defaultId(name),
    initialValue: defaultId(name),
    validate: (v) => {
      if (!v.trim()) return 'ID 不能为空'
      if (!/^[a-z0-9-]+$/.test(v)) return 'ID 只能包含小写字母、数字和连字符'
    },
  })
  if (p.isCancel(pluginId)) { p.cancel('已取消'); return null }

  const description = await p.text({
    message: '插件描述：',
    placeholder: '一个 HeartBeatCat 插件',
  })
  if (p.isCancel(description)) { p.cancel('已取消'); return null }

  const authorName = await p.text({
    message: '作者名称：',
    placeholder: 'Your Name',
    initialValue: 'Your Name',
  })
  if (p.isCancel(authorName)) { p.cancel('已取消'); return null }

  const authorEmail = await p.text({
    message: '作者邮箱：',
    placeholder: 'you@example.com',
    validate: (v) => {
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return '邮箱格式不正确'
    },
  })
  if (p.isCancel(authorEmail)) { p.cancel('已取消'); return null }

  // ── 能力选择 ──
  const capabilities = await p.multiselect({
    message: '选择插件能力：',
    options: [
      { value: 'widget', label: '桌面组件（Widget）', hint: 'Tauri Webview 小窗' },
      { value: 'streaming', label: '推流插件（Streaming）', hint: '浏览器 / OBS 叠加层' },
    ],
    required: true,
  })
  if (p.isCancel(capabilities)) { p.cancel('已取消'); return null }

  const hasWidget = capabilities.includes('widget')
  const hasStreaming = capabilities.includes('streaming')

  // ── Widget 配置 ──
  let widgetWidth = 100, widgetHeight = 100
  let widgetAlwaysOnTop = true, widgetTransparent = true

  if (hasWidget) {
    const ww = await p.text({
      message: 'Widget 窗口宽度（px）：',
      initialValue: '100',
      validate: (v) => isNaN(Number(v)) ? '请输入数字' : undefined,
    })
    if (p.isCancel(ww)) { p.cancel('已取消'); return null }
    widgetWidth = Number(ww)

    const wh = await p.text({
      message: 'Widget 窗口高度（px）：',
      initialValue: '100',
      validate: (v) => isNaN(Number(v)) ? '请输入数字' : undefined,
    })
    if (p.isCancel(wh)) { p.cancel('已取消'); return null }
    widgetHeight = Number(wh)

    widgetAlwaysOnTop = (await p.confirm({
      message: 'Widget 是否置顶？',
      initialValue: true,
    })) as boolean
    if (p.isCancel(widgetAlwaysOnTop)) { p.cancel('已取消'); return null }

    widgetTransparent = (await p.confirm({
      message: 'Widget 背景是否透明？',
      initialValue: true,
    })) as boolean
    if (p.isCancel(widgetTransparent)) { p.cancel('已取消'); return null }
  }

  // ── Streaming 配置 ──
  let viewportWidth = 1920, viewportHeight = 1080

  if (hasStreaming) {
    const vw = await p.text({
      message: '推流视口宽度（px）：',
      initialValue: '1920',
      validate: (v) => isNaN(Number(v)) ? '请输入数字' : undefined,
    })
    if (p.isCancel(vw)) { p.cancel('已取消'); return null }
    viewportWidth = Number(vw)

    const vh = await p.text({
      message: '推流视口高度（px）：',
      initialValue: '1080',
      validate: (v) => isNaN(Number(v)) ? '请输入数字' : undefined,
    })
    if (p.isCancel(vh)) { p.cancel('已取消'); return null }
    viewportHeight = Number(vh)
  }

  // ── 权限选择 ──
  const permissions = await p.multiselect({
    message: '选择需要的权限：',
    options: AVAILABLE_PERMISSIONS,
    initialValues: ['heart-rate'],
  })
  if (p.isCancel(permissions)) { p.cancel('已取消'); return null }

  // ── 设置项 ──
  const settings = await askSettings()
  if (settings === undefined) { p.cancel('已取消'); return null }

  // ── 目标目录 ──
  const finalTargetDir = targetDir ?? await p.text({
    message: '项目目录：',
    placeholder: `./${pluginId}`,
    initialValue: `./${pluginId}`,
    validate: (v) => v.trim() ? undefined : '目录不能为空',
  }) as string
  if (p.isCancel(finalTargetDir)) { p.cancel('已取消'); return null }

  const resolvedDir = path.resolve(finalTargetDir)

  return {
    name: name.trim(),
    pluginId: pluginId.trim(),
    version: '0.0.1',
    description: description.trim(),
    author: { name: authorName.trim(), email: authorEmail.trim() },
    widget: { enabled: hasWidget, width: widgetWidth, height: widgetHeight, alwaysOnTop: widgetAlwaysOnTop, transparent: widgetTransparent },
    streaming: { enabled: hasStreaming, viewportWidth, viewportHeight },
    permissions: permissions as string[],
    settings,
    targetDir: resolvedDir,
  }
}
