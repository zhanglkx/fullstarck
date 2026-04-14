import styles from "./page.module.scss";
import { apiGet } from "@/lib/api-client";
import Image from "next/image";
import QRCodeCheckComponent from "@/components/qrcode";
import { ApiResponse, QRCodeGenerate, QRCodeCheck } from "@fullstack/shared";

/**
 * 获取二维码数据
 * @returns 二维码数据（uuid 和 dataUrl）
 */
async function fetchApiData() {
  try {
    const result = await apiGet<ApiResponse<QRCodeGenerate>>("/qrcode/generate");
    console.log("🚀日志=====", result);
    return result;
  } catch (err) {
    console.error("❌请求失败:", err);
  }
}

/**
 * 检查二维码状态
 * @returns 二维码状态
 */
async function checkApiData() {
  try {
    const result = await apiGet<ApiResponse<QRCodeCheck>>("/qrcode/check");
    console.log("🚀日志=====", result);
    return result;
  } catch (err) {
    console.error("❌请求失败:", err);
  }
}

export default async function QrcodePage() {
  const result = await fetchApiData();
  const checkResult = await checkApiData();

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

      <button>Check QR Code Status</button>
      <div>{checkResult?.data?.state || ""}</div>
      <QRCodeCheckComponent />
    </div>
  );
}
