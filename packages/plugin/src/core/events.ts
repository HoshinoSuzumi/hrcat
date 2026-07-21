import type { EventHandler, EventPayload, EventSubscription, SystemEventName } from '../types'
import { isWidget } from './env'

/**
 * 订阅系统事件（框架无关的核心层）
 *
 * 根据运行环境自动选择通信方式：
 * - Widget: 使用 Tauri `listen()` API
 * - Streaming: 使用 `EventSource` SSE
 *
 * @param pluginId 插件 ID
 * @param eventName 事件名称
 * @param handler 事件处理回调
 * @returns 取消订阅函数
 */
export function subscribeToEvent<N extends SystemEventName>(
  pluginId: string,
  eventName: N,
  handler: EventHandler<EventPayload<N>>,
): EventSubscription {
  if (isWidget()) {
    return subscribeViaTauri(eventName, handler)
  }
  return subscribeViaSSE(pluginId, eventName, handler)
}

/**
 * 通过 Tauri 事件系统订阅（Widget 环境）
 */
function subscribeViaTauri<N extends SystemEventName>(
  eventName: N,
  handler: EventHandler<EventPayload<N>>,
): EventSubscription {
  // dynamic import，避免 streaming 环境因 @tauri-apps/api 不可用而报错
  let cancelled = false
  let unlisten: (() => void) | null = null

  import('@tauri-apps/api/event')
    .then(({ listen }) => {
      if (cancelled) return
      listen(eventName, (event) => {
        handler(event.payload as EventPayload<N>)
      }).then((fn) => {
        if (!cancelled) {
          unlisten = fn
        } else {
          fn()
        }
      })
    })
    .catch((err) => {
      console.warn(`[hrcat/plugin] 无法监听 Tauri 事件 "${eventName}":`, err)
    })

  return {
    unsubscribe() {
      cancelled = true
      unlisten?.()
    },
  }
}

/**
 * 通过 SSE 订阅系统事件（Streaming 环境）
 */
function subscribeViaSSE<N extends SystemEventName>(
  pluginId: string,
  eventName: N,
  handler: EventHandler<EventPayload<N>>,
): EventSubscription {
  const url = `/p/${pluginId}/events`
  const es = new EventSource(url)

  es.addEventListener(eventName, (e: MessageEvent) => {
    try {
      const payload = JSON.parse(e.data) as EventPayload<N>
      handler(payload)
    } catch {
      handler(e.data as EventPayload<N>)
    }
  })

  es.addEventListener('connected', () => {
    console.log(`[hrcat/plugin] SSE 已连接: ${pluginId}`)
  })

  es.onerror = () => {
    console.warn(`[hrcat/plugin] SSE 连接断开: ${pluginId}`)
  }

  return {
    unsubscribe() {
      es.close()
    },
  }
}

/**
 * 批量订阅多个事件
 *
 * @param pluginId 插件 ID
 * @param eventNames 要订阅的事件名列表
 * @param handler 统一回调（接收事件名 + payload）
 */
export function subscribeToEvents(
  pluginId: string,
  eventNames: string[],
  handler: (eventName: string, payload: unknown) => void,
): EventSubscription {
  const subs: EventSubscription[] = []

  for (const name of eventNames) {
    subs.push(
      subscribeToEvent(pluginId, name as SystemEventName, (payload) => {
        handler(name, payload)
      }),
    )
  }

  return {
    unsubscribe() {
      subs.forEach((s) => s.unsubscribe())
    },
  }
}
