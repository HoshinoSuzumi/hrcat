import type { PluginEnv } from '../types'

/**
 * 探测当前运行环境
 * - `widget`: 运行在 Tauri Webview 中（存在 `window.__TAURI__`）
 * - `streaming`: 运行在标准浏览器中（存在 `EventSource` 且无 Tauri）
 * - `unknown`: 未知环境
 */
export function detectEnv(): PluginEnv {
  if (typeof window === 'undefined') return 'unknown'

  // 检测 Tauri 环境
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).__TAURI__) {
    return 'widget'
  }

  // 检测浏览器环境
  if (typeof EventSource !== 'undefined') {
    return 'streaming'
  }

  return 'unknown'
}

/**
 * 是否运行在 Widget（Tauri Webview）环境
 */
export function isWidget(): boolean {
  return detectEnv() === 'widget'
}

/**
 * 是否运行在 Streaming（浏览器/OBS）环境
 */
export function isStreaming(): boolean {
  return detectEnv() === 'streaming'
}

/** 一次性环境检测，避免重复探测 */
let _env: PluginEnv | null = null

export function getEnv(): PluginEnv {
  if (_env === null) {
    _env = detectEnv()
  }
  return _env
}
