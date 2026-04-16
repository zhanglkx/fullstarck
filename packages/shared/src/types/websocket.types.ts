import { RealtimeMonitorData } from './monitor.types';

export type MonitorModule =
  | 'cpu'
  | 'memory'
  | 'disk'
  | 'sys'
  | 'gpu'
  | 'network'
  | 'processes'
  | 'temperature'
  | 'load'
  | 'docker';

/** 客户端消息类型 */
export type ClientMessage =
  | { type: 'subscribe'; modules: MonitorModule[] }
  | { type: 'unsubscribe'; modules: MonitorModule[] }
  | { type: 'request'; module: MonitorModule }
  | { type: 'ping' };

/** 服务端消息类型 */
export type ServerMessage =
  | { type: 'data'; payload: RealtimeMonitorData }
  | { type: 'response'; module: MonitorModule; data: unknown }
  | { type: 'pong' }
  | { type: 'error'; message: string };
