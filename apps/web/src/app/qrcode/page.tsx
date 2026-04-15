import styles from "./page.module.scss";
import { apiGet } from "@/lib/api-client";
import Image from "next/image";
import QRCodeCheckComponent from "@/components/qrcode";
import type { ApiResponse, QRCodeGenerate } from "@fullstack/shared";
import apple from "@/styles/apple-page.module.scss";

async function fetchApiData() {
  try {
    return await apiGet<ApiResponse<QRCodeGenerate>>("/qrcode/generate");
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("qrcode generate failed:", err);
  }
}

export default async function QrcodePage() {
  const result = await fetchApiData();
  const payload = result?.data;
  const uuid = payload?.uuid ?? "";

  return (
    <div className={apple.shell}>
      <header className={apple.pageHero}>
        <p className={apple.eyebrow}>流程</p>
        <h1 className={apple.pageTitle}>二维码演示</h1>
        <p className={apple.pageLede}>
          服务端生成二维码内容，浏览器展示图片并轮询状态；可用于模拟扫码登录类流程。
        </p>
      </header>

      <div className={styles.panel}>
        {uuid ? <p className={styles.uuid}>{uuid}</p> : null}
        <div className={styles.qrFrame}>
          {payload?.dataUrl ? (
            <Image
              src={payload.dataUrl}
              alt="生成的二维码"
              width={256}
              height={256}
              unoptimized
              priority
            />
          ) : (
            <div className={styles.placeholder}>未能生成二维码</div>
          )}
        </div>
      </div>

      {uuid ? <QRCodeCheckComponent uuid={uuid} /> : null}
    </div>
  );
}
