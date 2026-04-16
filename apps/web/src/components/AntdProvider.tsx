"use client";

import { ConfigProvider, ThemeConfig, theme } from "antd";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

// 基础主题配置（浅色和深色共用）
const baseTheme: Partial<ThemeConfig["token"]> = {
  colorPrimary: "#0071e3",
  borderRadius: 6,
  fontSize: 14,
};

export function AntdProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // 初始化
    setIsDark(mediaQuery.matches);

    // 监听变化
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // 动态主题配置
  const themeConfig: ThemeConfig = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      ...baseTheme,
      // 深色模式特殊配置
      ...(isDark && {
        colorBgContainer: "#1c1c1e",
        colorBgElevated: "#2c2c2e",
        colorBgLayout: "#000000",
        colorBorder: "rgba(255, 255, 255, 0.08)",
        colorText: "#f5f5f7",
        colorTextSecondary: "#a1a1a6",
        colorTextTertiary: "#8e8e93",
      }),
    },
    components: {
      Card: {
        colorBgContainer: isDark ? "#1c1c1e" : "#ffffff",
        colorBorderSecondary: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
      },
      Table: {
        colorBgContainer: isDark ? "#1c1c1e" : "#ffffff",
        colorBorderSecondary: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
      },
      Progress: {
        colorText: isDark ? "#f5f5f7" : "#1d1d1f",
      },
      Statistic: {
        colorText: isDark ? "#f5f5f7" : "#1d1d1f",
      },
      Switch: {
        colorPrimary: "#0071e3",
        colorPrimaryHover: "#2997ff",
      },
      Input: {
        colorPrimaryBorder: "#d9d9d9",
      },
    },
  };

  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
}
