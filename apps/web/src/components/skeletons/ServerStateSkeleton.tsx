import { Card, Row, Col, Skeleton } from "antd";
import styles from "./ServerStateSkeleton.module.scss";

/**
 * 服务器状态监控页面的骨架屏
 */
export default function ServerStateSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header Card Skeleton */}
      <Card className={styles.headerCard}>
        <div className={styles.header}>
          <Skeleton.Input active size="large" style={{ width: 300, height: 40 }} />
          <div style={{ display: "flex", gap: "12px" }}>
            <Skeleton.Button active size="large" style={{ width: 120 }} />
            <Skeleton.Button active size="large" style={{ width: 120 }} />
          </div>
        </div>
      </Card>

      {/* System Info Skeleton */}
      <Card
        title={<Skeleton.Input active size="small" style={{ width: 100 }} />}
        className={styles.card}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Skeleton active paragraph={{ rows: 1 }} />
          </Col>
        </Row>
      </Card>

      {/* CPU & Memory Skeleton */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            title={<Skeleton.Input active size="small" style={{ width: 100 }} />}
            className={styles.card}
          >
            <div className={styles.statusContent}>
              <Skeleton.Avatar active size={150} shape="circle" />
              <div style={{ flex: 1, marginLeft: 24 }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={<Skeleton.Input active size="small" style={{ width: 100 }} />}
            className={styles.card}
          >
            <div className={styles.statusContent}>
              <Skeleton.Avatar active size={150} shape="circle" />
              <div style={{ flex: 1, marginLeft: 24 }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Disk Status Skeleton */}
      <Card
        title={<Skeleton.Input active size="small" style={{ width: 150 }} />}
        className={styles.card}
      >
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    </div>
  );
}
