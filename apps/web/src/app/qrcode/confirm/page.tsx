"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { ApiResponse, QRCodeScanResult } from "@fullstack/shared";
import { apiPost } from "@/lib/api-client";
import { Button, message } from "antd";
import { QRCodeConfirmSkeleton } from "@/components/skeletons";
import apple from "@/styles/apple-page.module.scss";
import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

async function scanQrcode(uuid?: string) {
  try {
    return await apiPost<ApiResponse<QRCodeScanResult>>("/qrcode/scan", { uuid });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
  }
}

async function confirmQrcode(uuid?: string) {
  try {
    return await apiPost<ApiResponse<QRCodeScanResult>>("/qrcode/confirm", { uuid });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
  }
}

function PageContent() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid") || undefined;

  const [messageApi, contextHolder] = message.useMessage();

  const [scanResult, setScanResult] = useState<ApiResponse<QRCodeScanResult> | null>(null);
  const [confirmRes, setConfirmResult] = useState<ApiResponse<QRCodeScanResult> | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    async function run() {
      setLoading(true);
      const res = await scanQrcode(uuid);
      setScanResult(res ?? null);
      setLoading(false);
    }
    void run();
  }, [uuid]);

  const confirmLogin = async () => {
    setConfirmLoading(true);
    try {
      const res = await confirmQrcode(uuid);
      setConfirmResult(res ?? null);
      if (res?.data?.success) messageApi.success("已确认");
      else messageApi.warning("确认未成功");
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return <QRCodeConfirmSkeleton />;
  }

  return (
    <>
      {contextHolder}
      <div className={`${apple.shell} ${styles.wrap}`}>
        <header className={apple.pageHero}>
          <p className={apple.eyebrow}>确认</p>
          <h1 className={apple.pageTitle}>扫码结果</h1>
          <p className={apple.pageLede}>模拟客户端扫码后的确认步骤，可调用 /qrcode/confirm 完成流程。</p>
        </header>

        <div className={styles.panel}>
          <p className={styles.statusLine}>{scanResult?.data.success ? "扫码成功" : "扫码未完成"}</p>
          <p className={styles.hint}>
            若扫码成功，可点击下方按钮模拟用户确认。生产环境应替换为真实身份校验与风控逻辑。
          </p>

          {confirmRes?.data?.success ? <p className={styles.success}>登录流程已确认</p> : null}

          <div className={styles.actions}>
            <Button type="primary" onClick={confirmLogin} loading={confirmLoading} block>
              确认
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<QRCodeConfirmSkeleton />}>
      <PageContent />
    </Suspense>
  );
}
