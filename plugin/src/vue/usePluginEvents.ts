import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { subscribeToEvents } from '../core/events'
import type { SystemEventName, SSEConnectionStatus } from '../types'

export interface UsePluginEventsOptions {
  /** 要订阅的事件列表 */
  events: string[]
  /** 是否在组件挂载时自动连接，默认 true */
  autoConnect?: boolean
}

export interface UsePluginEventsReturn {
  /** 最近一次事件数据（按事件名索引） */
  data: Ref<Record<string, unknown>>
  /** SSE 连接状态（仅 streaming 环境适用） */
  connectionStatus: Ref<SSEConnectionStatus>
  /** 是否已连接 */
  connected: Ref<boolean>
  /** 手动订阅 */
  subscribe: () => void
  /** 手动取消订阅 */
  unsubscribe: () => void
}

/**
 * 订阅系统事件的 Vue Composable
 *
 * 根据运行环境自动选择 Tauri listen 或 EventSource SSE，
 * 返回值均为 Vue 响应式 ref。
 *
 * @example
 * ```ts
 * const { data, connected } = usePluginEvents('my-plugin', {
 *   events: ['heart-rate', 'device-connected'],
 * })
 *
 * watch(() => data.value['heart-rate'], (val) => {
 *   console.log('心率:', val)
 * })
 * ```
 */
export function usePluginEvents(
  pluginId: string,
  options: UsePluginEventsOptions,
): UsePluginEventsReturn {
  const data = ref<Record<string, unknown>>({}) as Ref<Record<string, unknown>>
  const connectionStatus = ref<SSEConnectionStatus>('disconnected')
  const connected = ref(false)

  let unsub: (() => void) | null = null

  const subscribe = () => {
    if (unsub) return

    connectionStatus.value = 'connecting'

    unsub = subscribeToEvents(pluginId, options.events, (eventName, payload) => {
      connected.value = true
      connectionStatus.value = 'connected'
      data.value = { ...data.value, [eventName]: payload }
    }).unsubscribe
  }

  const unsubscribe = () => {
    unsub?.()
    unsub = null
    connected.value = false
    connectionStatus.value = 'disconnected'
  }

  if (options.autoConnect !== false) {
    onMounted(() => subscribe())
  }

  onUnmounted(() => unsubscribe())

  return {
    data,
    connectionStatus,
    connected,
    subscribe,
    unsubscribe,
  }
}
