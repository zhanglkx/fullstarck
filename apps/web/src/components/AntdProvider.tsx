"use client";

import { ConfigProvider, ThemeConfig } from "antd";
import type { ReactNode } from "react";

// Ant Design 主题配置
const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: "#1890ff",
    borderRadius: 6,
    fontSize: 14,
  },
  components: {
    Button: {
      primaryColor: "#1890ff",
    },
    Input: {
      colorPrimaryBorder: "#d9d9d9",
    },
  },
};

export function AntdProvider({ children }: { children: ReactNode }) {
  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
}
