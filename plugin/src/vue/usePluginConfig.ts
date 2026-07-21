import { ref, onMounted, type Ref, type ShallowRef, shallowRef } from 'vue'
import { getPluginConfig } from '../core/config'

export interface UsePluginConfigReturn {
  /** 当前配置数据 */
  config: ShallowRef<Record<string, unknown>>
  /** 是否正在加载 */
  loading: Ref<boolean>
  /** 首次加载是否完成 */
  ready: Ref<boolean>
  /** 手动刷新配置 */
  refresh: () => Promise<void>
}

/**
 * 读取插件配置的 Vue Composable
 *
 * 根据运行环境自动选择 Tauri invoke 或 HTTP fetch，
 * 返回值均为 Vue 响应式 ref。
 *
 * @example
 * ```ts
 * const { config, loading, refresh } = usePluginConfig('my-plugin')
 *
 * watchEffect(() => {
 *   if (config.value.displayUnit === 'percentage') { ... }
 * })
 * ```
 */
export function usePluginConfig(pluginId: string): UsePluginConfigReturn {
  const config = shallowRef<Record<string, unknown>>({})
  const loading = ref(false)
  const ready = ref(false)

  const refresh = async () => {
    loading.value = true
    try {
      config.value = await getPluginConfig(pluginId)
      ready.value = true
    } finally {
      loading.value = false
    }
  }

  onMounted(() => refresh())

  return { config, loading, ready, refresh }
}
