export interface WidgetOptions {
  enabled: boolean
  width: number
  height: number
  alwaysOnTop: boolean
  transparent: boolean
}

export interface StreamingOptions {
  enabled: boolean
  viewportWidth: number
  viewportHeight: number
}

export interface SettingsProperty {
  type: 'string' | 'number' | 'integer' | 'boolean'
  title: string
  description?: string
  default?: unknown
  enum?: string[]
  minimum?: number
  maximum?: number
}

export interface ScaffoldConfig {
  name: string
  pluginId: string
  version: string
  description: string
  author: { name: string; email: string }
  widget: WidgetOptions
  streaming: StreamingOptions
  permissions: string[]
  settings: {
    type: 'object'
    properties: Record<string, SettingsProperty>
  } | null
  targetDir: string
}
