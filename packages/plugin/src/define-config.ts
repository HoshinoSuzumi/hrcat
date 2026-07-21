import type { HrcatUserConfig } from './types/config.js'

/**
 * 定义 `hrcat.config.ts` 插件配置的辅助函数
 *
 * 提供完整的 TypeScript 类型推导和校验，
 * 替代手写裸对象的配置方式。
 *
 * @example
 * ```ts
 * // hrcat.config.ts
 * import { defineConfig } from '@hrcat/plugin'
 *
 * export default defineConfig({
 *   widget: {
 *     window: { width: 200, height: 150, alwaysOnTop: true },
 *   },
 *   streaming: {
 *     viewport: { width: 1920, height: 1080 },
 *   },
 *   permissions: ['heart-rate', 'device-connected'],
 *   settings: {
 *     type: 'object',
 *     properties: {
 *       displayUnit: {
 *         type: 'string',
 *         enum: ['bpm', 'percentage'],
 *         default: 'bpm',
 *         title: '显示单位',
 *       },
 *     },
 *   },
 * })
 * ```
 */
export function defineConfig(config: HrcatUserConfig): HrcatUserConfig {
  return config
}
