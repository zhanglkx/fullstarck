import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import "antd/dist/reset.css";
import { AntdProvider } from "@/components/AntdProvider";
import { SiteChrome } from "@/components/shell/site-chrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fullstack Lab",
    template: "%s · Fullstack Lab",
  },
  description: "NestJS + Next.js + Expo 全栈示例：演示、监控与工具页聚合。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AntdProvider>
          <SiteChrome>{children}</SiteChrome>
        </AntdProvider>
      </body>
    </html>
  );
}
