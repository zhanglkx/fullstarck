import { Card, Row, Col, Alert, Space, Tag, Statistic } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ApiOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { revalidatePath } from "next/cache";

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

interface NpmDownloadsResponse {
  package: string;
  start: string;
  end: string;
  downloads: Array<{ day: string; downloads: number }>;
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
      throw new Error("Failed to fetch from API");
    }

    const health = (await healthRes.json()) as HealthResponse;
    const info = (await infoRes.json()) as ApiInfoResponse;
    const downloads = (await downloadsRes.json()) as NpmDownloadsResponse;

    return { health, info, downloads, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An error occurred";
    return { health: null, info: null, downloads: null, error: errorMessage };
  }
}

async function handleRefresh() {
  "use server";
  revalidatePath("/api-test");
}

export default async function ApiTestPage() {
  const { health: healthData, info: apiInfo, error } = await fetchApiData();

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          📊 API Connection Test (Using Server-Side Rendering)
        </h1>

        {error && (
          <Alert description={error} type="error" showIcon style={{ marginBottom: "24px" }} />
        )}

        {!error && (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
              <Col xs={24} sm={12} lg={8}>
                <Card
                  title={
                    <span>
                      <CheckCircleOutlined style={{ color: "#52c41a", marginRight: "8px" }} />
                      Health Check
                    </span>
                  }
                >
                  {healthData && (
                    <Space style={{ width: "100%" }}>
                      <Statistic title="Status" value={healthData.status} />
                      <div>
                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Timestamp</div>
                        <div style={{ fontSize: "14px" }}>{healthData.timestamp}</div>
                      </div>
                      <Statistic
                        title="Uptime"
                        value={healthData.uptime}
                        precision={2}
                        suffix="s"
                      />
                    </Space>
                  )}
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Card
                  title={
                    <span>
                      <ApiOutlined style={{ color: "#1890ff", marginRight: "8px" }} />
                      API Info
                    </span>
                  }
                >
                  {apiInfo && (
                    <Space style={{ width: "100%" }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Name</div>
                        <div style={{ fontSize: "14px", fontWeight: "bold" }}>{apiInfo.name}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Version</div>
                        <Tag color="blue">{apiInfo.version}</Tag>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Description</div>
                        <div style={{ fontSize: "12px" }}>{apiInfo.description}</div>
                      </div>
                    </Space>
                  )}
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Card
                  title={
                    <span>
                      <ClockCircleOutlined style={{ color: "#722ed1", marginRight: "8px" }} />
                      Connection Status
                    </span>
                  }
                >
                  <Space style={{ width: "100%" }}>
                    <Tag color="success">✓ Connected to Backend API</Tag>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      Frontend (Next.js) ↔ Backend (NestJS)
                    </div>
                    <form action={handleRefresh}>
                      <button
                        type="submit"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "4px 15px",
                          backgroundColor: "#1890ff",
                          color: "white",
                          border: "none",
                          borderRadius: "2px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      >
                        <ReloadOutlined /> Refresh
                      </button>
                    </form>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Card
              title="💡 How to Fetch Data Server-Side"
              type="inner"
              style={{ backgroundColor: "#fafafa" }}
            >
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  overflow: "auto",
                }}
              >
                {`// Server Component (async)
export default async function Page() {
  const data = await fetch('http://api.example.com/data')
    .then(r => r.json());

  return <div>{/* render data */}</div>;
}

// Benefits:
// ✓ Faster initial page load
// ✓ SEO friendly
// ✓ Less JavaScript sent to browser
// ✓ Direct backend access (no CORS issues)`}
              </pre>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
