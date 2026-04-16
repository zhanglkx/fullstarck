import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MonitorService } from './monitor.service';
import type { ClientMessage, MonitorModule, ServerMessage } from '@fullstack/shared';

@WebSocketGateway({
  namespace: '/monitor', // WebSocket 命名空间：ws://localhost:3000/monitor
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
})
export class MonitorGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MonitorGateway.name);
  private clientSubscriptions = new Map<string, Set<MonitorModule>>();
  private pushIntervals = new Map<string, NodeJS.Timeout>();

  constructor(private readonly monitorService: MonitorService) {}

  // 生命周期：Gateway 初始化
  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  // 生命周期：客户端连接
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clientSubscriptions.set(client.id, new Set());
  }

  // 生命周期：客户端断开
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.stopPushing(client.id);
    this.clientSubscriptions.delete(client.id);
  }

  /**
   * 处理订阅消息
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: Extract<ClientMessage, { type: 'subscribe' }>,
    @ConnectedSocket() client: Socket,
  ) {
    const modules = data.modules;
    this.logger.log(`Client ${client.id} subscribed to: ${modules.join(', ')}`);

    const subscriptions = this.clientSubscriptions.get(client.id);
    if (subscriptions) {
      modules.forEach((module) => subscriptions.add(module));
      this.startPushing(client);
    }
  }

  /**
   * 处理取消订阅消息
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: Extract<ClientMessage, { type: 'unsubscribe' }>,
    @ConnectedSocket() client: Socket,
  ) {
    const modules = data.modules;
    this.logger.log(`Client ${client.id} unsubscribed from: ${modules.join(', ')}`);

    const subscriptions = this.clientSubscriptions.get(client.id);
    if (subscriptions) {
      modules.forEach((module) => subscriptions.delete(module));

      // 如果没有订阅了，停止推送
      if (subscriptions.size === 0) {
        this.stopPushing(client.id);
      }
    }
  }

  /**
   * 处理单次请求
   */
  @SubscribeMessage('request')
  async handleRequest(
    @MessageBody() data: Extract<ClientMessage, { type: 'request' }>,
    @ConnectedSocket() client: Socket,
  ) {
    const { module } = data;
    this.logger.log(`Client ${client.id} requested: ${module}`);

    try {
      const fullData = await this.monitorService.getFullMonitorData([module]);
      const responseData = fullData[module];

      const message: ServerMessage = {
        type: 'response',
        module,
        data: responseData,
      };

      client.emit('message', message);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorMessage: ServerMessage = {
        type: 'error',
        message: `Failed to get ${module}: ${errorMsg}`,
      };
      client.emit('message', errorMessage);
    }
  }

  /**
   * 处理 Ping
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const message: ServerMessage = { type: 'pong' };
    client.emit('message', message);
  }

  /**
   * 启动定时推送
   */
  private startPushing(client: Socket) {
    // 如果已经在推送，先停止
    this.stopPushing(client.id);

    const interval = setInterval(async () => {
      const subscriptions = this.clientSubscriptions.get(client.id);
      if (!subscriptions || subscriptions.size === 0) {
        return;
      }

      try {
        const modules = Array.from(subscriptions);
        const data = await this.monitorService.getFullMonitorData(modules);

        const message: ServerMessage = {
          type: 'data',
          payload: data,
        };

        client.emit('message', message);
      } catch (error) {
        this.logger.error(`Push error for client ${client.id}:`, error);
      }
    }, 2000); // 每 2 秒推送一次

    this.pushIntervals.set(client.id, interval);
  }

  /**
   * 停止定时推送
   */
  private stopPushing(clientId: string) {
    const interval = this.pushIntervals.get(clientId);
    if (interval) {
      clearInterval(interval);
      this.pushIntervals.delete(clientId);
    }
  }
}
