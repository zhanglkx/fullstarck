import styles from "./page.module.scss";
import { QRCodeScanResult, ApiResponse } from "@fullstack/shared";
import { apiPost } from "@/lib/api-client";
import { getUrlParams } from "@/shared/utils/querystying";

interface PageProps {
  searchParams: Promise<{ uuid?: string }>;
}

const scanQrcode = async (uuid?: string) => {
  try {
    const scanReq = await apiPost<ApiResponse<QRCodeScanResult>>("/qrcode/scan", {
      uuid,
    });

    return scanReq;
  } catch (error) {
    console.error("❌扫码请求失败:", error);
  }
};

const page = async ({ searchParams }: PageProps) => {
  // Server Component: 传入 searchParams（需要先 await）
  const params = await searchParams;
  const { uuid } = getUrlParams<{ uuid?: string }>({ searchParams: params });
  const res = await scanQrcode(uuid);

  return <div className={styles.conform}>{res?.data.success ? "扫码成功" : "扫码失败"}</div>;
};

export default page;
