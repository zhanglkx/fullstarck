import { Card, Row, Col, Space, Tag, Statistic } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ApiOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { revalidatePath } from "next/cache";
import apple from "@/styles/apple-page.module.scss";
import styles from "./page.module.scss";

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  endpoints: {
    health: string;
    apiInfo: string;
  };
}

async function fetchApiData() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  try {
    const [healthRes, infoRes, downloadsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/health`, { next: { revalidate: 0 } }),
      fetch(`${API_BASE_URL}/api-info`, { next: { revalidate: 0 } }),
      fetch(`${API_BASE_URL}/npmdata/downloads?start=2024-01-01&end=2024-01-10&package=react`, {
        next: { revalidate: 0 },
      }),
    ]);

    if (!healthRes.ok || !infoRes.ok || !downloadsRes.ok) {
      throw new Error("无法从 API 获取数据");
    }

    const health = (await healthRes.json()) as HealthResponse;
    const info = (await infoRes.json()) as ApiInfoResponse;

    return { health, info, error: null as string | null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "请求失败";
    return { health: null, info: null, error: errorMessage };
  }
}

async function handleRefresh() {
  "use server";
  revalidatePath("/api-test");
}

export default async function ApiTestPage() {
  const { health: healthData, info: apiInfo, error } = await fetchApiData();

  return (
    <div className={apple.shell}>
      <header className={apple.pageHero}>
        <p className={apple.eyebrow}>服务端渲染</p>
        <h1 className={apple.pageTitle}>API 连接测试</h1>
        <p className={apple.pageLede}>
          在服务端并行请求健康检查与元数据，验证 Next.js 与 NestJS 之间的链路是否可用。
        </p>
      </header>

      {error ? <div className={apple.errorBanner}>{error}</div> : null}

      {!error && (
        <>
          <Row gutter={[20, 20]} className={styles.row}>
            <Col xs={24} sm={12} lg={8}>
              <Card
                className={styles.card}
                title={
                  <span>
                    <CheckCircleOutlined className={styles.cardIcon} aria-hidden />
                    健康检查
                  </span>
                }
              >
                {healthData ? (
                  <Space orientation="vertical" size="middle" className={styles.space}>
                    <Statistic title="状态" value={healthData.status} />
                    <div>
                      <div className={styles.metaLabel}>时间戳</div>
                      <div className={styles.metaValue}>{healthData.timestamp}</div>
                    </div>
                    <Statistic
                      title="运行时长"
                      value={healthData.uptime}
                      precision={2}
                      suffix="s"
                    />
                  </Space>
                ) : null}
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                className={styles.card}
                title={
                  <span>
                    <ApiOutlined className={styles.cardIcon} aria-hidden />
                    API 信息
                  </span>
                }
              >
                {apiInfo ? (
                  <Space orientation="vertical" size="middle" className={styles.space}>
                    <div>
                      <div className={styles.metaLabel}>名称</div>
                      <div className={styles.metaValueBold}>{apiInfo.name}</div>
                    </div>
                    <div>
                      <div className={styles.metaLabel}>版本</div>
                      <Tag variant="filled" className={styles.versionTag}>
                        {apiInfo.version}
                      </Tag>
                    </div>
                    <div>
                      <div className={styles.metaLabel}>说明</div>
                      <div className={styles.desc}>{apiInfo.description}</div>
                    </div>
                  </Space>
                ) : null}
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card
                className={styles.card}
                title={
                  <span>
                    <ClockCircleOutlined className={styles.cardIcon} aria-hidden />
                    连接状态
                  </span>
                }
              >
                <Space orientation="vertical" size="middle" className={styles.space}>
                  <Tag color="success">已连接后端</Tag>
                  <div className={styles.connectionNote}>Next.js ↔ NestJS</div>
                  <form action={handleRefresh}>
                    <button type="submit" className={apple.primaryButton}>
                      <ReloadOutlined />
                      刷新数据
                    </button>
                  </form>
                </Space>
              </Card>
            </Col>
          </Row>

          <Card className={styles.codeCard} title="在 Server Component 中拉取数据">
            <pre className={styles.pre}>
              {`// app/example/page.tsx（async Server Component）
export default async function Page() {
  const res = await fetch(process.env.API_URL + "/health", {
    next: { revalidate: 0 },
  });
  const data = await res.json();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}`}
            </pre>
          </Card>
        </>
      )}
    </div>
  );
}
