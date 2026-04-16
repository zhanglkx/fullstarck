import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type {
  RealtimeMonitorData,
  MonitorModule,
  ClientMessage,
  ServerMessage,
} from "@fullstack/shared";

interface UseRealtimeMonitorOptions {
  /** 自动订阅的模块 */
  autoSubscribe?: MonitorModule[];
  /** 重连延迟（毫秒） */
  reconnectDelay?: number;
  /** 是否启用心跳检测 */
  enableHeartbeat?: boolean;
}

export function useRealtimeMonitor(options: UseRealtimeMonitorOptions = {}) {
  const {
    autoSubscribe = ["cpu", "memory", "disk", "sys", "gpu", "network", "processes", "load"],
    reconnectDelay = 3000,
    enableHeartbeat = true,
  } = options;

  // 状态
  const [data, setData] = useState<RealtimeMonitorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subscribedModules, setSubscribedModules] = useState<Set<MonitorModule>>(new Set());

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 订阅模块
   */
  const subscribe = useCallback((modules: MonitorModule[]) => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ 未连接，无法订阅");
      return;
    }

    const message: ClientMessage = {
      type: "subscribe",
      modules,
    };

    socketRef.current.emit("subscribe", message);
    setSubscribedModules((prev) => {
      const newSet = new Set(prev);
      modules.forEach((m) => newSet.add(m));
      return newSet;
    });
  }, []);

  /**
   * 取消订阅
   */
  const unsubscribe = useCallback((modules: MonitorModule[]) => {
    if (!socketRef.current?.connected) return;

    const message: ClientMessage = {
      type: "unsubscribe",
      modules,
    };

    socketRef.current.emit("unsubscribe", message);
    setSubscribedModules((prev) => {
      const newSet = new Set(prev);
      modules.forEach((m) => newSet.delete(m));
      return newSet;
    });
  }, []);

  /**
   * 单次请求数据
   */
  const requestData = useCallback((module: MonitorModule) => {
    if (!socketRef.current?.connected) return;

    const message: ClientMessage = {
      type: "request",
      module,
    };

    socketRef.current.emit("request", message);
  }, []);

  // 组件挂载时连接，卸载时断开
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const socket = io(`${apiUrl}/monitor`, {
      transports: ["websocket", "polling"],
      reconnectionDelay: reconnectDelay,
      reconnection: true,
    });

    // 连接成功
    socket.on("connect", () => {
      console.log("✅ WebSocket 连接成功");
      setIsConnected(true);
      setError(null);

      // 自动订阅
      if (autoSubscribe.length > 0) {
        const message: ClientMessage = {
          type: "subscribe",
          modules: autoSubscribe,
        };
        socket.emit("subscribe", message);
        setSubscribedModules(new Set(autoSubscribe));
      }

      // 启动心跳
      if (enableHeartbeat) {
        const interval = setInterval(() => {
          if (socket.connected) {
            const message: ClientMessage = { type: "ping" };
            socket.emit("ping", message);
          }
        }, 30000);
        heartbeatIntervalRef.current = interval;
      }
    });

    // 接收消息
    socket.on("message", (message: ServerMessage) => {
      console.log("📩 收到消息:", message);

      switch (message.type) {
        case "data":
          setData(message.payload);
          break;

        case "response":
          console.log(`📦 单次请求响应 [${message.module}]:`, message.data);
          break;

        case "pong":
          console.log("💓 Pong");
          break;

        case "error":
          setError(message.message);
          break;
      }
    });

    // 断开连接
    socket.on("disconnect", (reason) => {
      console.warn("❌ WebSocket 断开:", reason);
      setIsConnected(false);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    });

    // 连接错误
    socket.on("connect_error", (err) => {
      console.error("❌ WebSocket 连接错误:", err);
      setError(`连接失败: ${err.message}`);
    });

    socketRef.current = socket;

    // 清理函数
    return () => {
      console.log("🧹 清理 WebSocket 连接");
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (socket) {
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  return {
    data,
    error,
    isConnected,
    subscribedModules,
    subscribe,
    unsubscribe,
    requestData,
  };
}
