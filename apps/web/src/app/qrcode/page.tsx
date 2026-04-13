import styles from "./page.module.scss";
import { apiGet } from "@/lib/api-client";
import Image from "next/image";

interface QRCodeRes {
  code: number;
  data: {
    uuid: string | null;
    dataUrl: string;
  };
  msg: string;
}

async function fetchApiData() {
  try {
    const result = await apiGet<QRCodeRes>("/qrcode/generate");
    console.log("🚀日志=====", result);
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
    </div>
  );
}
