// ── 插件元信息（hbcat-manifest.json → plugin） ──
export interface PluginMeta {
  id: string
  name: string
  version: string
  description?: string
  author?: {
    name?: string
    email?: string
  }
  homepage?: string
  icon?: string
}

// ── 桌面组件能力声明（hbcat-manifest.json → widget） ──
export interface WidgetCapability {
  entry: string
  window: {
    width: number
    height: number
    alwaysOnTop: boolean
    transparent: boolean
  }
}

// ── 推流插件能力声明（hbcat-manifest.json → streaming） ──
export interface StreamingCapability {
  entry: string
  viewport: {
    width: number
    height: number
  }
}

// ── hbcat-manifest.json 完整结构 ──
export interface PluginManifest {
  manifestVersion: number
  plugin: PluginMeta
  widget?: WidgetCapability
  streaming?: StreamingCapability
  permissions: string[]
  settings?: Record<string, unknown>
}

// ── 已加载插件（含运行环境标记） ──
export interface LoadedPlugin {
  manifest: PluginManifest
  builtin: boolean
}

// ── 插件运行时状态 ──
export interface PluginRuntimeState {
  widgetActive: boolean
  streamingActive: boolean
  clickThrough: boolean
  opacity: number
  scale: number
  config: Record<string, unknown>
}
