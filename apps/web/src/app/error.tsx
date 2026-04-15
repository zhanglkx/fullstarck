"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, Result } from "antd";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <div style={{ padding: "48px 24px", maxWidth: 560, margin: "0 auto" }}>
      <Result
        status="error"
        title="页面出错了"
        subTitle={error.message || "发生意外错误，请重试或返回首页。"}
        extra={[
          <Button type="primary" key="retry" onClick={() => reset()}>
            重试
          </Button>,
          <Link key="home" href="/">
            <Button>返回首页</Button>
          </Link>,
        ]}
      />
    </div>
  );
}
