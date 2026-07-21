import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { subscribeToEvent } from '../core/events'
import type { HeartRateEvent } from '../types'

/**
 * 订阅心率数据的便捷 Vue Composable
 *
 * 这是 `usePluginEvents` 的心率专用便捷版本。
 * 无需手动指定事件名，只需传入 pluginId 即可。
 *
 * @param pluginId 插件 ID
 * @returns 响应式的心率值（bpm）
 *
 * @example
 * ```vue
 * <template>
 *   <span>{{ hr }}</span>
 * </template>
 *
 * <script setup>
 * import { useHeartRate } from '@hrcat/plugin/vue'
 * const hr = useHeartRate('my-plugin')
 * </script>
 * ```
 */
export function useHeartRate(pluginId: string): Ref<number> {
  const hr = ref(0)
  let unsub: (() => void) | null = null

  onMounted(() => {
    unsub = subscribeToEvent(pluginId, 'heart-rate', (payload: unknown) => {
      const p = payload as HeartRateEvent
      hr.value = typeof p === 'object' && p !== null && 'value' in p ? p.value : (payload as number)
    }).unsubscribe
  })

  onUnmounted(() => {
    unsub?.()
  })

  return hr
}
