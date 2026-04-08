"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Alert, Table, Input, Button, Space, Tag, Statistic } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, ApiOutlined } from "@ant-design/icons";
import apiClient from "@/lib/axios";

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

export default function ApiTestPage() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [apiInfo, setApiInfo] = useState<ApiInfoResponse | null>(null);
  const [npmDownloads, setNpmDownloads] = useState<NpmDownloadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [health, info, downloads] = await Promise.all([
          apiClient.get("/health"),
          apiClient.get("/api-info"),
          apiClient.get("/npmdata/downloads?start=2024-01-01&end=2024-01-10&package=react"),
        ]);

        setHealthData(health as unknown as HealthResponse);
        setApiInfo(info as unknown as ApiInfoResponse);
        setNpmDownloads(downloads as unknown as NpmDownloadsResponse);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: "Date",
      dataIndex: "day",
      key: "day",
    },
    {
      title: "Downloads",
      dataIndex: "downloads",
      key: "downloads",
      sorter: (a: any, b: any) => a.downloads - b.downloads,
    },
  ];

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
          📊 API Connection Test (Using Axios & Ant Design)
        </h1>

        {loading && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" tip="Loading data..." />
          </div>
        )}

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: "24px" }}
          />
        )}

        {!loading && !error && (
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
                  bordered={false}
                >
                  {healthData && (
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Statistic
                        title="Status"
                        value={healthData.status}
                        valueStyle={{ color: "#52c41a" }}
                      />
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
                  bordered={false}
                >
                  {apiInfo && (
                    <Space direction="vertical" style={{ width: "100%" }}>
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
                  bordered={false}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Tag color="success">✓ Connected to Backend API</Tag>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      Frontend (Next.js) ↔ Backend (NestJS)
                    </div>
                    <Button type="primary" onClick={() => window.location.reload()}>
                      Refresh
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Card
              title="📦 NPM Download Statistics"
              style={{ marginBottom: "24px" }}
              bordered={false}
            >
              {npmDownloads ? (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <span style={{ marginRight: "16px" }}>
                      <strong>Package:</strong> <Tag color="cyan">{npmDownloads.package}</Tag>
                    </span>
                    <span>
                      <strong>Range:</strong> {npmDownloads.start} ~ {npmDownloads.end}
                    </span>
                  </div>
                  <Table
                    dataSource={npmDownloads.downloads.slice(0, 8).map((item, idx) => ({
                      key: idx,
                      day: item.day,
                      downloads: item.downloads,
                    }))}
                    columns={columns}
                    pagination={false}
                    size="small"
                  />
                </Space>
              ) : (
                <Alert message="No data available" type="warning" />
              )}
            </Card>

            <Card
              title="💡 How to Use Axios"
              type="inner"
              bordered={false}
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
                {`// Import from API client
import { apiGet, apiPost } from "@/lib/api-client";

// GET request
const data = await apiGet("/path");

// POST request
const result = await apiPost("/path", { key: "value" });

// Using axios directly
import apiClient from "@/lib/axios";
const response = await apiClient.get("/path");`}
              </pre>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
