'use client'

import './global.css'
import { ConfigProvider, Layout } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

const { Content } = Layout

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ConfigProvider locale={zhCN}>
          <Layout style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content style={{ padding: '24px', background: '#f0f2f5' }}>
              {children}
            </Content>
            <Footer />
          </Layout>
        </ConfigProvider>
      </body>
    </html>
  )
}
