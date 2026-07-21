import { isWidget } from './env'

/**
 * 读取插件的用户配置（框架无关的核心层）
 *
 * 根据运行环境自动选择通信方式：
 * - Widget: 调用 `invoke('get_plugin_config', { pluginId })`
 * - Streaming: `fetch('/p/{pluginId}/config')`
 *
 * @param pluginId 插件 ID
 * @returns 用户配置对象
 */
export async function getPluginConfig(pluginId: string): Promise<Record<string, unknown>> {
  if (isWidget()) {
    return getConfigViaTauri(pluginId)
  }
  return getConfigViaHTTP(pluginId)
}

/**
 * 通过 Tauri invoke 读取配置（Widget 环境）
 */
async function getConfigViaTauri(pluginId: string): Promise<Record<string, unknown>> {
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    return (await invoke('get_plugin_config', { pluginId })) as Record<string, unknown>
  } catch (err) {
    console.warn(`[hrcat/plugin] 无法通过 Tauri invoke 读取配置:`, err)
    return {}
  }
}

/**
 * 通过 HTTP 读取配置（Streaming 环境）
 */
async function getConfigViaHTTP(pluginId: string): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`/p/${pluginId}/config`)
    if (res.ok) {
      return (await res.json()) as Record<string, unknown>
    }
  } catch (err) {
    console.warn(`[hrcat/plugin] 无法通过 HTTP 读取配置:`, err)
  }
  return {}
}
