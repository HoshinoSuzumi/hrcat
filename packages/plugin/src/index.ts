// ── @hrcat/plugin 主入口 ──

// 配置助手
export { defineConfig } from './define-config.js'

// 核心工具（框架无关）
export {
  detectEnv,
  isWidget,
  isStreaming,
  getEnv,
  subscribeToEvent,
  subscribeToEvents,
  getPluginConfig,
} from './core/index.js'

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
  BrcatUserConfig,
  BrcatConfigWidget,
  BrcatConfigStreaming,
  PluginSettingsSchema,
  // runtime
  PluginEnv,
  PluginInitOptions,
  EventSubscription,
  SSEConnectionStatus,
  EventHandler,
} from './types/index.js'
