// ── 事件类型 ──

/** 心率数据事件 */
export interface HeartRateEvent {
  value: number
  timestamp: number
}

/** 设备连接事件 */
export interface DeviceConnectedEvent {
  peripheral_id: string
  name: string
  address: string
}

/** 设备断开事件 */
export type DeviceDisconnectedEvent = Record<string, never>

/** 所有系统事件类型映射 */
export interface SystemEvents {
  'heart-rate': HeartRateEvent
  'device-connected': DeviceConnectedEvent
  'device-disconnected': DeviceDisconnectedEvent
}

/** 已知的事件名称 */
export type SystemEventName = keyof SystemEvents

/** 获取事件对应的 payload 类型 */
export type EventPayload<N extends SystemEventName> = SystemEvents[N]
