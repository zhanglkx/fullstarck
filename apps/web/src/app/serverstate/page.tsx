"use client";

import {
  Card,
  Row,
  Col,
  Progress,
  Table,
  Statistic,
  Divider,
  Tag,
  Empty,
  Space,
  Alert,
} from "antd";
import {
  DesktopOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  WindowsOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  ApiOutlined,
  HddOutlined,
  WifiOutlined,
  AppstoreAddOutlined,
  FireOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { useServerStateStream } from "@/api/serverstate";
import { useRealtimeMonitor } from "@/hooks/useRealtimeMonitor";
import { ServerStateSkeleton } from "@/components/skeletons";
import apple from "@/styles/apple-page.module.scss";
import styles from "./page.module.scss";
import { useMemo } from "react";
import type { ReactNode } from "react";
import type { RealtimeMonitorData, GPUInfo } from "@fullstack/shared";

const ACCENT_STROKE = "var(--color-primary)";
const DISK_COL_WIDTH = 800;
const NET_COL_WIDTH = 800;
const GPU_COL_WIDTH = 800;
const PROC_COL_WIDTH = 800;

function formatBytesSpeed(val: number) {
  const kb = val / 1024;
  if (kb > 1024) return `${(kb / 1024).toFixed(2)} MB/s`;
  return `${kb.toFixed(2)} KB/s`;
}

function formatBytesTotal(val: number) {
  const gb = val / (1024 * 1024 * 1024);
  if (gb > 1) return `${gb.toFixed(2)} GB`;
  return `${(val / (1024 * 1024)).toFixed(2)} MB`;
}

function CategoryHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h2 className={styles.categoryHeading}>
      <span className={styles.categoryHeadingIcon} aria-hidden>
        {icon}
      </span>
      {children}
    </h2>
  );
}

export default function ServerStateMonitor() {
  const sseState = useServerStateStream();
  const wsState = useRealtimeMonitor({
    autoSubscribe: ["cpu", "memory", "disk", "sys", "gpu", "network", "processes", "load"],
  });

  const realtime = wsState.data as RealtimeMonitorData | null;
  const core = realtime ?? sseState.data;

  const terminalError =
    !core && Boolean(sseState.error) && Boolean(wsState.error) && !sseState.data && !wsState.data;

  const diskColumns = useMemo(
    () => [
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
          return (
            <Progress
              type="circle"
              percent={Math.round(usage)}
              size={50}
              strokeColor={ACCENT_STROKE}
              format={(percent) => `${percent}%`}
            />
          );
        },
      },
    ],
    [],
  );

  const gpuColumns = useMemo(
    () => [
      {
        title: "型号",
        dataIndex: "model",
        key: "model",
        ellipsis: true,
      },
      {
        title: "厂商",
        dataIndex: "vendor",
        key: "vendor",
      },
      {
        title: "使用率",
        dataIndex: "utilizationGpu",
        key: "utilizationGpu",
        align: "center" as const,
        render: (val: number) => (
          <Progress
            type="circle"
            percent={Math.round(val)}
            size={50}
            strokeColor={ACCENT_STROKE}
          />
        ),
      },
      {
        title: "显存",
        key: "vram",
        align: "center" as const,
        render: (_: unknown, record: GPUInfo) => (
          <div>
            <div>
              {record.vramUsed} / {record.vram} MB
            </div>
            <Progress
              percent={Math.round((record.vramUsed / record.vram) * 100)}
              size="small"
              showInfo={false}
              strokeColor={ACCENT_STROKE}
            />
          </div>
        ),
      },
      {
        title: "温度",
        dataIndex: "temperature",
        key: "temperature",
        align: "center" as const,
        render: (val: number) => <span className={styles.numericStrong}>{val}°C</span>,
      },
    ],
    [],
  );

  const networkColumns = useMemo(
    () => [
      {
        title: "网卡",
        dataIndex: "interface",
        key: "interface",
        render: (text: string) => (
          <span>
            <GlobalOutlined style={{ marginRight: 8 }} />
            {text}
          </span>
        ),
      },
      {
        title: "下载速度",
        dataIndex: "rx_sec",
        key: "rx_sec",
        align: "center" as const,
        render: (val: number) => formatBytesSpeed(val),
      },
      {
        title: "上传速度",
        dataIndex: "tx_sec",
        key: "tx_sec",
        align: "center" as const,
        render: (val: number) => formatBytesSpeed(val),
      },
      {
        title: "总下载",
        dataIndex: "rx_total",
        key: "rx_total",
        align: "center" as const,
        render: (val: number) => formatBytesTotal(val),
      },
      {
        title: "总上传",
        dataIndex: "tx_total",
        key: "tx_total",
        align: "center" as const,
        render: (val: number) => formatBytesTotal(val),
      },
    ],
    [],
  );

  const processColumns = useMemo(
    () => [
      {
        title: "PID",
        dataIndex: "pid",
        key: "pid",
        width: 80,
      },
      {
        title: "进程名",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
      },
      {
        title: "用户",
        dataIndex: "user",
        key: "user",
        width: 120,
      },
      {
        title: "CPU",
        dataIndex: "cpu",
        key: "cpu",
        align: "center" as const,
        width: 100,
        sorter: (a: { cpu: number }, b: { cpu: number }) => a.cpu - b.cpu,
        render: (val: number) => <span className={styles.numericStrong}>{val.toFixed(2)}%</span>,
      },
      {
        title: "内存",
        dataIndex: "mem",
        key: "mem",
        align: "center" as const,
        width: 120,
        sorter: (a: { mem: number }, b: { mem: number }) => a.mem - b.mem,
        render: (val: number) => `${val.toFixed(2)} MB`,
      },
    ],
    [],
  );

  const sseTimeLabel = useMemo(
    () => (sseState.lastUpdateTime ? new Date(sseState.lastUpdateTime).toLocaleString() : "—"),
    [sseState.lastUpdateTime],
  );

  const wsTimeLabel = useMemo(
    () => (realtime?.timestamp ? new Date(realtime.timestamp).toLocaleString() : "—"),
    [realtime],
  );

  if (terminalError) {
    return (
      <div className={`${apple.shell} ${styles.pageRoot} ${styles.emptyWrap}`}>
        <Empty description="无法加载数据" />
      </div>
    );
  }

  if (!core) {
    return (
      <div className={`${apple.shell} ${styles.pageRoot}`}>
        <ServerStateSkeleton />
      </div>
    );
  }

  const cpuUsage = parseFloat(core.cpu.used);
  const memoryUsage = parseFloat(core.memory.usage);

  const showWsExtras = Boolean(realtime);
  const loadAvg = realtime?.loadAverage;
  const hasLoad = Boolean(loadAvg);
  const hasGpu = Boolean(realtime?.gpu?.length);
  const hasNet = Boolean(realtime?.network?.length);
  const hasProc = Boolean(realtime?.topProcesses?.length);
  const hasTemp = Boolean(realtime?.temperature);

  return (
    <div className={`${apple.shell} ${styles.pageRoot}`}>
      <header className={apple.pageHero}>
        <p className={apple.eyebrow}>观测</p>
        <h1 className={apple.pageTitle}>服务器状态</h1>
        <p className={apple.pageLede}>
          按资源类型查看 CPU、内存、GPU、磁盘与网络。SSE 与 WebSocket 同时连接，在可用时自动合并为一份完整视图。
        </p>
      </header>

      <Card className={styles.headerCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <DesktopOutlined aria-hidden />
            连接与刷新
          </h2>
          <Space size="middle" wrap className={styles.headerMeta}>
            <div className={styles.channelGroup}>
              <span className={styles.channelLabel}>SSE</span>
              <Tag
                className={`${styles.channelTag} ${sseState.isConnected ? styles.channelTagOn : ""}`}
                variant="filled"
                icon={<CloudServerOutlined />}
              >
                {sseState.isConnected ? "已连接" : "未连接"}
              </Tag>
              <div className={styles.updateTime} key={sseState.lastUpdateTime ?? "sse"}>
                <ClockCircleOutlined className={styles.updateIcon} />
                <span className={styles.updateLabel}>推送</span>
                <span className={styles.updateValue}>{sseTimeLabel}</span>
              </div>
            </div>
            <div className={styles.channelGroup}>
              <span className={styles.channelLabel}>WebSocket</span>
              <Tag
                className={`${styles.channelTag} ${wsState.isConnected ? styles.channelTagOn : ""}`}
                variant="filled"
                icon={<ApiOutlined />}
              >
                {wsState.isConnected ? "已连接" : "未连接"}
              </Tag>
              <div className={styles.updateTime} key={realtime?.timestamp ?? "ws"}>
                <ClockCircleOutlined className={styles.updateIcon} />
                <span className={styles.updateLabel}>快照</span>
                <span className={styles.updateValue}>{wsTimeLabel}</span>
              </div>
            </div>
          </Space>
        </div>
        {(sseState.error || wsState.error) && (
          <Alert
            className={styles.alertBanner}
            type="info"
            showIcon
            message={
              sseState.error && wsState.error
                ? "部分通道异常，以下为当前可用数据。"
                : sseState.error
                  ? `SSE：${sseState.error}`
                  : `WebSocket：${wsState.error}`
            }
          />
        )}
      </Card>

      <section className={styles.categoryBlock} aria-labelledby="cat-system">
        <CategoryHeading icon={<CloudServerOutlined />}>
          <span id="cat-system">系统与环境</span>
        </CategoryHeading>
        <Card title="系统信息" className={styles.dataCard}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                prefix={<DesktopOutlined />}
                title="计算机名"
                value={core.sys.computerName}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic prefix={<GlobalOutlined />} title="IP 地址" value={core.sys.computerIp} />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic prefix={<WindowsOutlined />} title="操作系统" value={core.sys.osName} />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic prefix={<AppstoreOutlined />} title="系统架构" value={core.sys.osArch} />
            </Col>
          </Row>
        </Card>
      </section>

      <section className={styles.categoryBlock} aria-labelledby="cat-cpu">
        <CategoryHeading icon={<ThunderboltOutlined />}>
          <span id="cat-cpu">处理器与负载</span>
        </CategoryHeading>
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card title="CPU" className={styles.dataCard}>
              <div className={styles.statusContent}>
                <div className={styles.progressContainer}>
                  <Progress
                    type="circle"
                    percent={Math.round(cpuUsage)}
                    size={150}
                    strokeColor={ACCENT_STROKE}
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
                    <span>CPU 核心数</span>
                    <strong>{core.cpu.cpuNum}</strong>
                  </div>
                  <div className={styles.statRow}>
                    <span>系统占用</span>
                    <strong>{core.cpu.sys}%</strong>
                  </div>
                  <div className={styles.statRow}>
                    <span>已用</span>
                    <strong>{core.cpu.used}%</strong>
                  </div>
                  <div className={styles.statRow}>
                    <span>空闲</span>
                    <strong>{core.cpu.free}%</strong>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {showWsExtras && hasLoad && loadAvg && (
          <Row gutter={[24, 24]} className={styles.subRow}>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.dataCard}>
                <Statistic
                  title="负载（1 分钟）"
                  value={loadAvg.load1}
                  precision={2}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.dataCard}>
                <Statistic
                  title="负载（5 分钟）"
                  value={loadAvg.load5}
                  precision={2}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.dataCard}>
                <Statistic
                  title="负载（15 分钟）"
                  value={loadAvg.load15}
                  precision={2}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.dataCard}>
                <Statistic
                  title="当前负载"
                  value={loadAvg.currentLoad}
                  suffix="%"
                  precision={2}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {showWsExtras && hasTemp && realtime?.temperature && (
          <Card title="温度" className={styles.dataCard}>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="CPU 主温度"
                  value={realtime.temperature.main}
                  suffix="°C"
                  valueStyle={{ color: "var(--text-primary)" }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="最高温度"
                  value={realtime.temperature.max}
                  suffix="°C"
                  valueStyle={{ color: "var(--text-primary)" }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="传感器核心数"
                  value={realtime.temperature.cores.length}
                  suffix="个"
                />
              </Col>
            </Row>
            {realtime.temperature.cores.length > 0 && (
              <>
                <Divider plain>各核心</Divider>
                <Row gutter={[16, 16]}>
                  {realtime.temperature.cores.map((temp, index) => (
                    <Col xs={12} sm={8} md={6} lg={4} key={index}>
                      <Card size="small" className={styles.nestedMetricCard}>
                        <Statistic
                          title={`核心 ${index + 1}`}
                          value={temp}
                          suffix="°C"
                          valueStyle={{ color: "var(--text-primary)", fontSize: 16 }}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </Card>
        )}
      </section>

      <section className={styles.categoryBlock} aria-labelledby="cat-memory">
        <CategoryHeading icon={<PieChartOutlined />}>
          <span id="cat-memory">内存</span>
        </CategoryHeading>
        <Card title="物理内存" className={styles.dataCard}>
          <div className={styles.statusContent}>
            <div className={styles.progressContainer}>
              <Progress
                type="circle"
                percent={Math.round(memoryUsage)}
                size={150}
                strokeColor={ACCENT_STROKE}
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
                <span>总内存</span>
                <strong>{(core.memory.total / (1024 * 1024 * 1024)).toFixed(2)} GB</strong>
              </div>
              <div className={styles.statRow}>
                <span>已用</span>
                <strong>{(core.memory.used / (1024 * 1024 * 1024)).toFixed(2)} GB</strong>
              </div>
              <div className={styles.statRow}>
                <span>可用</span>
                <strong>{(core.memory.free / (1024 * 1024 * 1024)).toFixed(2)} GB</strong>
              </div>
              <div className={styles.statRow}>
                <span>使用率</span>
                <Tag className={styles.neutralTag}>{core.memory.usage}%</Tag>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {showWsExtras && hasGpu && realtime?.gpu && (
        <section className={styles.categoryBlock} aria-labelledby="cat-gpu">
          <CategoryHeading icon={<AppstoreAddOutlined />}>
            <span id="cat-gpu">图形处理器</span>
          </CategoryHeading>
          <Card title="GPU" className={`${styles.dataCard} ${styles.tableCard}`}>
            <Table
              dataSource={realtime.gpu}
              rowKey={(r) => `${r.model}|${r.vendor}|${r.vram}`}
              pagination={false}
              scroll={{ x: GPU_COL_WIDTH }}
              columns={gpuColumns}
            />
          </Card>
        </section>
      )}

      <section className={styles.categoryBlock} aria-labelledby="cat-disk">
        <CategoryHeading icon={<HddOutlined />}>
          <span id="cat-disk">存储</span>
        </CategoryHeading>
        <Card title="磁盘" className={`${styles.dataCard} ${styles.tableCard}`}>
          <Table
            columns={diskColumns}
            dataSource={core.disks.map((disk, index) => ({
              ...disk,
              key: index,
            }))}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 个分区`,
            }}
            scroll={{ x: DISK_COL_WIDTH }}
          />
        </Card>
      </section>

      {showWsExtras && hasNet && realtime?.network && (
        <section className={styles.categoryBlock} aria-labelledby="cat-net">
          <CategoryHeading icon={<WifiOutlined />}>
            <span id="cat-net">网络</span>
          </CategoryHeading>
          <Card title="接口流量" className={`${styles.dataCard} ${styles.tableCard}`}>
            <Table
              dataSource={realtime.network}
              rowKey="interface"
              pagination={false}
              scroll={{ x: NET_COL_WIDTH }}
              columns={networkColumns}
            />
          </Card>
        </section>
      )}

      {showWsExtras && hasProc && realtime?.topProcesses && (
        <section className={styles.categoryBlock} aria-labelledby="cat-proc">
          <CategoryHeading icon={<FireOutlined />}>
            <span id="cat-proc">进程</span>
          </CategoryHeading>
          <Card title="资源占用 Top 10" className={`${styles.dataCard} ${styles.tableCard}`}>
            <Table
              dataSource={realtime.topProcesses}
              rowKey="pid"
              pagination={false}
              scroll={{ x: PROC_COL_WIDTH }}
              columns={processColumns}
            />
          </Card>
        </section>
      )}

    </div>
  );
}
