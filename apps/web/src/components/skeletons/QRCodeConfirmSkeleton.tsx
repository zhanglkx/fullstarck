import { Skeleton, Card } from "antd";
import styles from "./QRCodeConfirmSkeleton.module.scss";

/**
 * 二维码确认页面的骨架屏
 */
export default function QRCodeConfirmSkeleton() {
  return (
    <div className={styles.wrap}>
      <Card className={styles.card}>
        {/* Title Skeleton */}
        <Skeleton.Input active size="large" style={{ width: 200, height: 32, marginBottom: 24 }} />

        {/* QR Code Image Skeleton */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Skeleton.Image active style={{ width: 200, height: 200 }} />
        </div>

        {/* Status Text Skeleton */}
        <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 24 }} />

        {/* Button Skeleton */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Skeleton.Button active size="large" style={{ width: 150, height: 40 }} />
        </div>
      </Card>
    </div>
  );
}
