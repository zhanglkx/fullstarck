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
    // Button 组件无需额外配置，使用 token.colorPrimary 即可
    Input: {
      colorPrimaryBorder: "#d9d9d9",
    },
  },
};

export function AntdProvider({ children }: { children: ReactNode }) {
  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
}
