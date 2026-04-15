"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Table,
  Space,
  Button,
  Empty,
  message,
  Statistic,
  Divider,
  Tag,
} from "antd";
import {
  ReloadOutlined,
  DesktopOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  WindowsOutlined,
} from "@ant-design/icons";
import { getServerState, ServerState } from "@/api/serverstate";
import { ServerStateSkeleton } from "@/components/skeletons";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

export default function ServerStateMonitor() {
  const [data, setData] = useState<ServerState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchServerState = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getServerState();
      setData(response);
    } catch (error) {
      console.error("Failed to fetch server state:", error);
      message.error("获取服务器数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await getServerState();
      setData(response);
      message.success("数据刷新成功");
    } catch (error) {
      console.error("Failed to fetch server state:", error);
      message.error("获取服务器数据失败");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchServerState();
  }, [fetchServerState]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setRefreshing(true);
      getServerState()
        .then((response) => {
          setData(response);
        })
        .catch((error) => {
          console.error("Auto-refresh failed:", error);
          message.error("自动刷新失败");
        })
        .finally(() => {
          setRefreshing(false);
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return <ServerStateSkeleton />;
  }

  if (!data) {
    return (
      <div className={styles.container}>
        <Empty description="无法加载数据" />
      </div>
    );
  }

  const diskColumns = [
    {
      title: "挂载点",
      dataIndex: "dirName",
      key: "dirName",
      render: (text: string) => (
        <span>
          <DatabaseOutlined style={{ marginRight: 8 }} />
          {text}
        </span>
      ),
    },
    {
      title: "文件系统",
      dataIndex: "typeName",
      key: "typeName",
    },
    {
      title: "总容量",
      dataIndex: "total",
      key: "total",
      align: "center" as const,
    },
    {
      title: "已用",
      dataIndex: "used",
      key: "used",
      align: "center" as const,
    },
    {
      title: "可用",
      dataIndex: "free",
      key: "free",
      align: "center" as const,
    },
    {
      title: "使用率",
      dataIndex: "usage",
      key: "usage",
      align: "center" as const,
      render: (text: string) => {
        const usage = parseFloat(text);
        let color = "#52c41a";
        if (usage > 80) color = "#ff4d4f";
        else if (usage > 60) color = "#faad14";

        return (
          <Progress
            type="circle"
            percent={Math.round(usage)}
            size={50}
            strokeColor={color}
            format={(percent) => `${percent}%`}
          />
        );
      },
    },
  ];

  const cpuUsage = parseFloat(data.cpu.used);
  const memoryUsage = parseFloat(data.memory.usage);

  const getCPUColor = (usage: number) => {
    if (usage > 80) return "#ff4d4f";
    if (usage > 60) return "#faad14";
    return "#52c41a";
  };

  const getMemoryColor = (usage: number) => {
    if (usage > 80) return "#ff4d4f";
    if (usage > 60) return "#faad14";
    return "#52c41a";
  };

  return (
    <div className={styles.container}>
      <Card className={styles.headerCard}>
        <div className={styles.header}>
          <h1>
            <DesktopOutlined /> 服务器状态监控
          </h1>
          <Space>
            <Button
              type={autoRefresh ? "primary" : "default"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? "自动刷新中" : "自动刷新关闭"}
            </Button>
            <Button
              type="primary"
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={handleRefresh}
              loading={refreshing}
            >
              手动刷新
            </Button>
          </Space>
        </div>
      </Card>

      {/* System Info */}
      <Card title="系统信息" className={styles.card}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Statistic
              prefix={<DesktopOutlined />}
              title="计算机名"
              value={data.sys.computerName}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic prefix={<GlobalOutlined />} title="IP 地址" value={data.sys.computerIp} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic prefix={<WindowsOutlined />} title="操作系统" value={data.sys.osName} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Statistic prefix={<AppstoreOutlined />} title="系统架构" value={data.sys.osArch} />
          </Col>
        </Row>
      </Card>

      {/* CPU & Memory Overview */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="CPU 状态" className={styles.card}>
            <div className={styles.statusContent}>
              <div className={styles.progressContainer}>
                <Progress
                  type="circle"
                  percent={Math.round(cpuUsage)}
                  size={150}
                  strokeColor={getCPUColor(cpuUsage)}
                  format={(percent) => (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: "bold" }}>{percent}%</div>
                      <div style={{ fontSize: 12, color: "#666" }}>已用</div>
                    </div>
                  )}
                />
              </div>
              <Divider orientation="vertical" style={{ height: 150 }} />
              <div className={styles.cpuDetails}>
                <div className={styles.statRow}>
                  <span>CPU 核心数:</span>
                  <strong>{data.cpu.cpuNum}</strong>
                </div>
                <div className={styles.statRow}>
                  <span>系统占用:</span>
                  <strong>{data.cpu.sys}%</strong>
                </div>
                <div className={styles.statRow}>
                  <span>已用:</span>
                  <strong style={{ color: getCPUColor(cpuUsage) }}>{data.cpu.used}%</strong>
                </div>
                <div className={styles.statRow}>
                  <span>空闲:</span>
                  <strong>{data.cpu.free}%</strong>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="内存状态" className={styles.card}>
            <div className={styles.statusContent}>
              <div className={styles.progressContainer}>
                <Progress
                  type="circle"
                  percent={Math.round(memoryUsage)}
                  size={150}
                  strokeColor={getMemoryColor(memoryUsage)}
                  format={(percent) => (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: "bold" }}>{percent}%</div>
                      <div style={{ fontSize: 12, color: "#666" }}>已用</div>
                    </div>
                  )}
                />
              </div>
              <Divider orientation="vertical" style={{ height: 150 }} />
              <div className={styles.memoryDetails}>
                <div className={styles.statRow}>
                  <span>总内存:</span>
                  <strong>{(data.memory.total / (1024 * 1024 * 1024)).toFixed(2)} GB</strong>
                </div>
                <div className={styles.statRow}>
                  <span>已用:</span>
                  <strong style={{ color: getMemoryColor(memoryUsage) }}>
                    {(data.memory.used / (1024 * 1024 * 1024)).toFixed(2)} GB
                  </strong>
                </div>
                <div className={styles.statRow}>
                  <span>可用:</span>
                  <strong>{(data.memory.free / (1024 * 1024 * 1024)).toFixed(2)} GB</strong>
                </div>
                <div className={styles.statRow}>
                  <span>使用率:</span>
                  <Tag color={getMemoryColor(memoryUsage)}>{data.memory.usage}%</Tag>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Disk Status */}
      <Card title="磁盘使用情况" className={styles.card}>
        <Table
          columns={diskColumns}
          dataSource={data.disks.map((disk, index) => ({
            ...disk,
            key: index,
          }))}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 个磁盘分区`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}
