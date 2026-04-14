"use client";
import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { apiGet } from "@/lib/api-client";
import { ApiResponse, QRCodeCheck } from "@fullstack/shared";

function Index() {
  const [checkRes, setCheckRes] = useState<QRCodeCheck | null>(null);

  useEffect(() => {
    // 首次获取状态
    const fetchInitialStatus = async () => {
      try {
        const response = await apiGet<ApiResponse<QRCodeCheck>>("/qrcode/check");
        setCheckRes(response.data);
      } catch (err) {
        console.error("❌获取初始状态失败:", err);
      }
    };

    void fetchInitialStatus();
    // 轮询检查状态
    const intervalId = setInterval(fetchInitialStatus, 3000); // 每 3 秒轮询一次

    // 清理定时器
    return () => clearInterval(intervalId);
  }, []);

  return <div className={styles.qrcodeWrapper}>{checkRes?.state || "加载中..."}</div>;
}

export default Index;
