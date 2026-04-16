import { Skeleton, Card } from "antd";
import styles from "./NpmDataSkeleton.module.scss";

/**
 * NPM 数据统计页面的骨架屏
 */
export default function NpmDataSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header Skeleton */}
        <div className={styles.header}>
          <Skeleton.Input active size="large" style={{ width: 300, height: 48 }} />
          <Skeleton.Input active size="small" style={{ width: 400, height: 24, marginTop: 12 }} />
        </div>

        {/* Search Form Skeleton */}
        <div className={styles.searchCard}>
          <div className={styles.searchForm}>
            <div className={styles.formGroup}>
              <Skeleton.Input active size="small" style={{ width: 80, height: 20 }} />
              <Skeleton.Input
                active
                size="large"
                style={{ width: "100%", height: 40, marginTop: 8 }}
              />
            </div>

            <div className={styles.formGroup}>
              <Skeleton.Input active size="small" style={{ width: 80, height: 20 }} />
              <Skeleton.Input
                active
                size="large"
                style={{ width: "100%", height: 40, marginTop: 8 }}
              />
            </div>

            <div className={styles.formGroup}>
              <Skeleton.Input active size="small" style={{ width: 80, height: 20 }} />
              <Skeleton.Input
                active
                size="large"
                style={{ width: "100%", height: 40, marginTop: 8 }}
              />
            </div>

            <Skeleton.Button active size="large" style={{ width: 120, height: 40 }} />
          </div>
        </div>

        {/* Chart Skeleton */}
        <Card className={styles.chartCard}>
          <Skeleton.Input
            active
            size="medium"
            style={{ width: 200, height: 28, marginBottom: 24 }}
          />
          <div className={styles.chartContainer}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        </Card>
      </div>
    </div>
  );
}
