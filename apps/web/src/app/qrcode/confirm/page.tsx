import styles from "./page.module.scss";
import { getUrlParams } from "@/shared/utils/querystying";
import { QRCodeState } from "@fullstack/shared";
import { apiPost } from "@/lib/api-client";

const scanQrcode = async () => {
  try {
    const { uuid } = getUrlParams();

    const scanReq = await apiPost<QRCodeState>("/qrcode/confirm", {
      uuid,
    });

    console.log("🚀日志=====", scanReq);

    return scanReq;
  } catch (error) {
    console.error("❌扫码请求失败:", error);
  }
};

const page = async () => {
  const res = await scanQrcode();

  return <div className={styles.conform}>{res}</div>;
};

export default page;
