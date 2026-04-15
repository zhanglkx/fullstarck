"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.scss";
import { QRCodeScanResult, ApiResponse } from "@fullstack/shared";
import { apiPost } from "@/lib/api-client";
import { Button, message } from "antd";
import { QRCodeConfirmSkeleton } from "@/components/skeletons";

export const dynamic = "force-dynamic";

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

const confirmQrcode = async (uuid?: string) => {
  try {
    const scanReq = await apiPost<ApiResponse<QRCodeScanResult>>("/qrcode/confirm", {
      uuid,
    });

    return scanReq;
  } catch (error) {
    console.error("❌扫码请求失败:", error);
  }
};

const PageContent = () => {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid") || undefined;

  const [messageApi, contextHolder] = message.useMessage();

  const [scanResult, setScanResult] = useState<ApiResponse<QRCodeScanResult> | null>(null);
  const [confirmRes, setConfirmResult] = useState<ApiResponse<QRCodeScanResult>>(
    {} as ApiResponse<QRCodeScanResult>,
  );
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const fetchScanResult = async () => {
      setLoading(true);
      const res = await scanQrcode(uuid);
      setScanResult(res || null);
      setLoading(false);
    };

    fetchScanResult();
  }, [uuid]);

  const confirmLogin = async () => {
    setConfirmLoading(true);
    try {
      const confirmRes = await confirmQrcode(uuid);

      setConfirmResult(confirmRes!);
      messageApi.info("Hello, Ant Design!");
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
      <div className={styles.wrap}>
        <div className={styles.conform}>{scanResult?.data.success ? "扫码成功" : "扫码失败"}</div>
        <div>
          扫码成功，是否确认登录？（此处仅展示扫码结果，后续可添加确认按钮，调用 /qrcode/confirm
          接口）
        </div>

        {confirmRes?.data?.success && <div className={styles.conform}>登录成功</div>}
        <div>
          <Button type="primary" onClick={confirmLogin} loading={confirmLoading}>
            确认登录
          </Button>
        </div>
      </div>
    </>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<QRCodeConfirmSkeleton />}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
