import Link from "next/link";
import { Button, Result } from "antd";

export default function NotFound() {
  return (
    <div style={{ padding: "48px 24px", maxWidth: 560, margin: "0 auto" }}>
      <Result
        status="404"
        title="找不到页面"
        subTitle="链接可能已失效，或地址输入有误。"
        extra={
          <Link href="/">
            <Button type="primary">返回首页</Button>
          </Link>
        }
      />
    </div>
  );
}
