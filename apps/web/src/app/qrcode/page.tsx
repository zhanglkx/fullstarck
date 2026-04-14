import styles from "./page.module.scss";
import { apiGet } from "@/lib/api-client";
import Image from "next/image";
import QRCodeCheckComponent from "@/components/qrcode";
import { ApiResponse, QRCodeGenerate } from "@fullstack/shared";
import { Button } from "antd";

/**
 * 获取二维码数据
 * @returns 二维码数据（uuid 和 dataUrl）
 */
async function fetchApiData() {
  try {
    const result = await apiGet<ApiResponse<QRCodeGenerate>>("/qrcode/generate");

    return result;
  } catch (err) {
    console.error("❌请求失败:", err);
  }
}

export default async function QrcodePage() {
  const result = await fetchApiData();

  return (
    <div className={styles.container}>
      <h1>QR Code Generator</h1>
      <p>Click the button below to generate a QR code.</p>
      <div>{result?.data?.uuid || ""}</div>

      <Image
        src={result?.data.dataUrl || ""}
        alt="Generated QR Code"
        width={256}
        height={256}
        unoptimized
      />

      <Button type="primary">Check QR Code Status</Button>

      <QRCodeCheckComponent uuid={result?.data?.uuid || ""} />
    </div>
  );
}
