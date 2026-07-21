export function generateSharedUseHeartRate(): string {
  return `import { ref, onMounted, onUnmounted } from 'vue'
import { subscribeToEvent, type EventSubscription } from '@hrcat/plugin'

/**
 * 心率数据 composable
 * 同时适用于 Widget（Tauri）和 Streaming（SSE）环境
 */
export function useHeartRate(pluginId: string) {
  const hr = ref(0)
  let sub: EventSubscription | null = null

  onMounted(() => {
    sub = subscribeToEvent(pluginId, 'heart-rate', (event) => {
      hr.value = event.value
    })
  })

  onUnmounted(() => {
    sub?.unsubscribe()
  })

  return { hr }
}
`
}
