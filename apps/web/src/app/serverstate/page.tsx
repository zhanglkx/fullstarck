"use client";

import { Card, Row, Col, Progress, Table, Statistic, Divider, Tag, Empty } from "antd";
import {
  DesktopOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  WindowsOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useServerStateStream } from "@/api/serverstate";
import { ServerStateSkeleton } from "@/components/skeletons";
import apple from "@/styles/apple-page.module.scss";
import styles from "./page.module.scss";
import { useMemo } from "react";

export const dynamic = "force-dynamic";

export default function ServerStateMonitor() {
  // 使用 SSE Hook
  const { data, error, isConnected, lastUpdateTime } = useServerStateStream();

  // 格式化更新时间
  const formattedTime = useMemo(() => new Date(lastUpdateTime).toLocaleString(), [lastUpdateTime]);

  if (!isConnected || !data) {
    return (
      <div className={`${apple.shell} ${styles.pageRoot}`}>
        <ServerStateSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${apple.shell} ${styles.pageRoot} ${styles.emptyWrap}`}>
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
    <div className={`${apple.shell} ${styles.pageRoot}`}>
      <header className={apple.pageHero}>
        <p className={apple.eyebrow}>观测</p>
        <h1 className={apple.pageTitle}>服务器状态</h1>
        <p className={apple.pageLede}>
          实时查看 CPU、内存、磁盘与系统信息。自动刷新可在异常时暂停，避免无效重试。
        </p>
      </header>

      <Card className={styles.headerCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <DesktopOutlined aria-hidden />
            概览与控制
          </h2>
          <div className={styles.updateTime} key={lastUpdateTime}>
            <ClockCircleOutlined className={styles.updateIcon} />
            <span className={styles.updateLabel}>最后更新</span>
            <span className={styles.updateValue}>{formattedTime}</span>
          </div>
        </div>
      </Card>

      {/* System Info */}
      <Card title="系统信息" className={styles.dataCard}>
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
          <Card title="CPU 状态" className={styles.dataCard}>
            <div className={styles.statusContent}>
              <div className={styles.progressContainer}>
                <Progress
                  type="circle"
                  percent={Math.round(cpuUsage)}
                  size={150}
                  strokeColor={getCPUColor(cpuUsage)}
                  format={(percent) => (
                    <div className={styles.progressFormat}>
                      <div className={styles.progressPercent}>{percent}%</div>
                      <div className={styles.progressSub}>已用</div>
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
          <Card title="内存状态" className={styles.dataCard}>
            <div className={styles.statusContent}>
              <div className={styles.progressContainer}>
                <Progress
                  type="circle"
                  percent={Math.round(memoryUsage)}
                  size={150}
                  strokeColor={getMemoryColor(memoryUsage)}
                  format={(percent) => (
                    <div className={styles.progressFormat}>
                      <div className={styles.progressPercent}>{percent}%</div>
                      <div className={styles.progressSub}>已用</div>
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
      <Card title="磁盘使用情况" className={`${styles.dataCard} ${styles.tableCard}`}>
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
