"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { apiGet } from "@/lib/api-client";
import type { ApiResponse, QRCodeCheck, QRCodeScanParams } from "@fullstack/shared";
import styles from "./index.module.scss";

const BASE_POLL_MS = 3000;
const MAX_POLL_MS = 45_000;
const MAX_CONSECUTIVE_FAILURES = 10;

function QRCodeChecker(props: QRCodeScanParams) {
  const { uuid } = props;
  const router = useRouter();
  const [checkRes, setCheckRes] = useState<QRCodeCheck | null>(null);
  const [pollStopped, setPollStopped] = useState(false);

  useEffect(() => {
    if (!uuid) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    let consecutiveFailures = 0;

    const schedule = (delayMs: number) => {
      if (cancelled) return;
      timeoutId = setTimeout(() => void run(), delayMs);
    };

    const run = async () => {
      if (cancelled) return;
      try {
        const response = await apiGet<ApiResponse<QRCodeCheck>>("/qrcode/check", {
          params: { uuid },
        });
        consecutiveFailures = 0;
        setCheckRes(response.data);
        schedule(BASE_POLL_MS);
      } catch {
        consecutiveFailures += 1;
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          setPollStopped(true);
          return;
        }
        const backoff = Math.min(
          MAX_POLL_MS,
          BASE_POLL_MS * 2 ** Math.min(consecutiveFailures - 1, 4),
        );
        schedule(backoff);
      }
    };

    void run();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [uuid]);

  const gotoConfirm = useCallback(() => {
    router.push(`/qrcode/confirm?uuid=${encodeURIComponent(uuid)}`);
  }, [router, uuid]);

  return (
    <div className={styles.qrcodeWrapper}>
      <p className={styles.status}>
        {pollStopped
          ? "轮询已暂停（连续失败次数过多），请稍后手动刷新页面。"
          : checkRes?.state || "加载中..."}
      </p>
      <div className={styles.sep} aria-hidden="true" />

      <div className={styles.actions}>
        <Button
          onClick={() => {
            window.location.reload();
          }}
        >
          刷新页面
        </Button>

        <Button onClick={gotoConfirm} type="primary">
          前往确认
        </Button>
      </div>
    </div>
  );
}

export default QRCodeChecker;
