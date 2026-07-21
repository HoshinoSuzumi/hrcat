// ── @hrcat/plugin 主入口 ──

// 配置助手
export { defineConfig } from './define-config'

// 核心工具（框架无关）
export {
  detectEnv,
  isWidget,
  isStreaming,
  getEnv,
  subscribeToEvent,
  subscribeToEvents,
  getPluginConfig,
} from './core'

// 类型
export type {
  // manifest
  PluginMeta,
  WidgetCapability,
  StreamingCapability,
  PluginManifest,
  LoadedPlugin,
  PluginRuntimeState,
  // events
  HeartRateEvent,
  DeviceConnectedEvent,
  DeviceDisconnectedEvent,
  SystemEvents,
  SystemEventName,
  EventPayload,
  // config
  HrcatUserConfig,
  HrcatConfigWidget,
  HrcatConfigStreaming,
  PluginSettingsSchema,
  // runtime
  PluginEnv,
  PluginInitOptions,
  EventSubscription,
  SSEConnectionStatus,
  EventHandler,
} from './types'
