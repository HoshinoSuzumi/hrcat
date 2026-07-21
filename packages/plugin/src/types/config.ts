// ── brcat.config.ts 用户配置类型 ──
// 用于 defineConfig() 的类型约束

export interface BrcatConfigWidget {
  window?: {
    width?: number
    height?: number
    alwaysOnTop?: boolean
    transparent?: boolean
  }
}

export interface BrcatConfigStreaming {
  viewport?: {
    width?: number
    height?: number
  }
}

/** 插件设置项的 JSON Schema */
export interface PluginSettingsSchema {
  type: 'object'
  properties: Record<string, {
    type: 'string' | 'number' | 'integer' | 'boolean'
    title: string
    description?: string
    default?: unknown
    enum?: string[]
    minimum?: number
    maximum?: number
    format?: string
  }>
}

export interface BrcatUserConfig {
  /** 插件显示名称（默认从 package.json 读取） */
  name?: string
  /** 插件主页 */
  homepage?: string
  /** 图标文件路径（相对于插件根目录） */
  icon?: string
  /** 桌面组件配置（存在即声明 widget 能力） */
  widget?: BrcatConfigWidget
  /** 推流插件配置（存在即声明 streaming 能力） */
  streaming?: BrcatConfigStreaming
  /** 事件订阅列表 */
  permissions?: string[]
  /** JSON Schema 描述的插件设置项 */
  settings?: PluginSettingsSchema
}
