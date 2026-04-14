"use client";
import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { apiGet } from "@/lib/api-client";
import { Button } from "antd";
import { ApiResponse, QRCodeCheck, QRCodeScanParams } from "@fullstack/shared";

function Index(props: QRCodeScanParams) {
  const { uuid } = props;
  const [checkRes, setCheckRes] = useState<QRCodeCheck | null>(null);

  useEffect(() => {
    // 首次获取状态
    const fetchInitialStatus = async () => {
      try {
        const response = await apiGet<ApiResponse<QRCodeCheck>>("/qrcode/check", {
          params: { uuid },
        });
        setCheckRes(response.data);
      } catch (err) {
        console.error("❌获取初始状态失败:", err);
      }
    };

    void fetchInitialStatus();

    const intervalId = setInterval(fetchInitialStatus, 3000); // 每 3 秒轮询一次

    return () => clearInterval(intervalId);
  }, [uuid]);

  return (
    <div className={styles.qrcodeWrapper}>
      {checkRes?.state || "加载中..."}
      <Button>刷新</Button>
    </div>
  );
}

export default Index;
