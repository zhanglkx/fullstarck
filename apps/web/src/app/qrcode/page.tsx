import styles from "./page.module.scss";
import { apiGet } from "@/lib/api-client";
import Image from "next/image";

interface QRCodeRes {
  uuid: string;
  dataUrl: string;
}

async function fetchApiData() {
  try {
    const result = await apiGet<QRCodeRes>("/qrcode/generate");
    console.log("🚀日志=====", result);
    return result;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An error occurred";
    return { uuid: null, dataUrl: "" };
  }
}

export default async function QrcodePage() {
  const result = await fetchApiData();
  return (
    <div className={styles.container}>
      <h1>QR Code Generator</h1>
      <p>Click the button below to generate a QR code.</p>
      <div>{result.uuid}</div>
      {result.dataUrl && (
        <Image src={result.dataUrl} alt="Generated QR Code" width={256} height={256} unoptimized />
      )}
    </div>
  );
}
