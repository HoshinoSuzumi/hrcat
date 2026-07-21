// ── 运行时环境类型 ──

/** 插件运行环境 */
export type PluginEnv = 'widget' | 'streaming' | 'unknown'

/** 插件初始化选项 */
export interface PluginInitOptions {
  /** 插件 ID（通常为 package.json 的 name） */
  pluginId: string
}

/** 事件订阅结果 */
export interface EventSubscription {
  /** 取消订阅 */
  unsubscribe: () => void
}

/** SSE 连接状态 */
export type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

/** 通用事件处理回调 */
export type EventHandler<T = unknown> = (payload: T) => void
